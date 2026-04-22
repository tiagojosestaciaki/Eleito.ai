"""Baixa malhas municipais do IBGE e carrega em `municipalities`.

Endpoint: /api/v3/malhas/estados/{uf}?formato=application/vnd.geo+json&qualidade=intermediaria&intrarregiao=municipio
API de metadados: /api/v1/localidades/estados/{uf}/municipios
"""

from __future__ import annotations

import json
from typing import Any

import httpx
from shapely.geometry import shape
from shapely.ops import unary_union
from sqlalchemy import text
from tenacity import retry, stop_after_attempt, wait_exponential

from ..common.config import Settings, get_settings
from ..common.db import engine_scope
from ..common.logging import get_logger

log = get_logger(__name__)


@retry(stop=stop_after_attempt(4), wait=wait_exponential(multiplier=2, min=2, max=16))
def _http_get(client: httpx.Client, url: str, params: dict[str, Any] | None = None) -> httpx.Response:
    response = client.get(url, params=params, timeout=60)
    response.raise_for_status()
    return response


def fetch_municipalities_metadata(settings: Settings) -> list[dict[str, Any]]:
    """Retorna nome, ibge_code, mesorregião e microrregião dos municípios do estado."""
    url = f"{settings.ibge_api_base_url}/v1/localidades/estados/{settings.ibge_state_uf}/municipios"
    with httpx.Client() as client:
        data = _http_get(client, url).json()

    out: list[dict[str, Any]] = []
    for m in data:
        meso = (
            m.get("microrregiao", {})
            .get("mesorregiao", {})
            .get("nome")
        )
        micro = m.get("microrregiao", {}).get("nome")
        out.append(
            {
                "ibge_code": int(m["id"]),
                "name": m["nome"],
                "state": settings.ibge_state_uf,
                "region": meso,
                "micro_region": micro,
            }
        )
    log.info("ibge.meta.fetched", count=len(out))
    return out


def fetch_state_municipalities_geojson(settings: Settings) -> dict[str, Any]:
    """Baixa GeoJSON com as geometrias de todos os municípios do estado."""
    url = f"{settings.ibge_api_base_url}/v3/malhas/estados/{settings.ibge_state_uf}"
    params = {
        "formato": "application/vnd.geo+json",
        "qualidade": "intermediaria",
        "intrarregiao": "municipio",
    }
    with httpx.Client() as client:
        response = _http_get(client, url, params=params)
        geo = response.json()
    features = geo.get("features", [])
    log.info("ibge.geom.fetched", features=len(features))
    return geo


def _feature_geom_wkt(feature: dict[str, Any]) -> tuple[str, str]:
    """Retorna (wkt_multipolygon, wkt_centroid) para uma feature GeoJSON."""
    geom = shape(feature["geometry"])
    # Garante MultiPolygon mesmo se veio Polygon simples
    if geom.geom_type == "Polygon":
        geom = unary_union([geom])
    centroid = geom.centroid
    return geom.wkt, centroid.wkt


def load_municipalities(settings: Settings | None = None) -> int:
    settings = settings or get_settings()

    meta = fetch_municipalities_metadata(settings)
    meta_by_code = {m["ibge_code"]: m for m in meta}

    geo = fetch_state_municipalities_geojson(settings)

    prepared: list[dict[str, Any]] = []
    for feature in geo.get("features", []):
        props = feature.get("properties", {})
        # IBGE costuma expor "codarea" como string com o código IBGE do município
        raw_code = props.get("codarea") or props.get("codigo") or props.get("id")
        if not raw_code:
            continue
        ibge_code = int(raw_code)
        meta_row = meta_by_code.get(ibge_code)
        if not meta_row:
            log.warning("ibge.geom.orphan_feature", ibge_code=ibge_code)
            continue
        wkt_geom, wkt_centroid = _feature_geom_wkt(feature)
        prepared.append(
            {
                **meta_row,
                "geom_wkt": wkt_geom,
                "centroid_wkt": wkt_centroid,
            }
        )

    # Se só temos meta mas a feature não veio, ainda inserimos sem geom.
    covered = {p["ibge_code"] for p in prepared}
    for code, m in meta_by_code.items():
        if code not in covered:
            log.warning("ibge.geom.missing_for_municipality", ibge_code=code, name=m["name"])
            prepared.append({**m, "geom_wkt": None, "centroid_wkt": None})

    # Upsert via SQL direto: PostGIS precisa de ST_GeomFromText com SRID.
    upsert_sql = text(
        """
        insert into public.municipalities
          (ibge_code, name, state, region, micro_region, geom, centroid)
        values
          (:ibge_code, :name, :state, :region, :micro_region,
           case when :geom_wkt is null then null
                else ST_Multi(ST_GeomFromText(:geom_wkt, 4326)) end,
           case when :centroid_wkt is null then null
                else ST_GeomFromText(:centroid_wkt, 4326) end)
        on conflict (ibge_code) do update set
          name         = excluded.name,
          state        = excluded.state,
          region       = excluded.region,
          micro_region = excluded.micro_region,
          geom         = excluded.geom,
          centroid     = excluded.centroid,
          updated_at   = now();
        """
    )

    with engine_scope(settings) as engine, engine.begin() as conn:
        for row in prepared:
            conn.execute(upsert_sql, row)

    log.info("ibge.geom.loaded", total=len(prepared))
    return len(prepared)
