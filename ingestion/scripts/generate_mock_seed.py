#!/usr/bin/env python3
"""Gera as migrations SQL de seed mock para o dashboard do elleito.ai.

Como funciona:
    1. Baixa o GeoJSON oficial dos 399 municípios do PR (tbrugz/geodata-br).
    2. Calcula centroide (lat/lng) e área relativa de cada polígono.
    3. Classifica mesorregião IBGE por regra geográfica aproximada sobre
       o centroide (vai ser sobrescrito pelo ETL real — ver ADR futuro).
    4. Gera votos/percentuais com gradiente geográfico visível no mapa:
         * população proxy = sqrt(área normalizada) + boost manual p/
           20 cidades conhecidas (Curitiba, Londrina, Maringá etc.)
         * percentual = base + componente longitudinal (leste favorece)
           + componente latitudinal + ruído pseudo-aleatório semeado
           (mesmo output a cada execução — determinístico).

Saída: dois arquivos em supabase/migrations/:
    20260424120000_seed_municipalities_pr_mock.sql
    20260424120100_seed_results_municipality_mock.sql

Reexecute este script sempre que quiser regenerar (é idempotente via
UPSERT nas migrations). O ETL real (elleito-etl ibge) depois sobrescreve
os campos `region`, `population`, `electorate` com dados oficiais.

Uso:
    python ingestion/scripts/generate_mock_seed.py
"""

from __future__ import annotations

import json
import math
import random
import re
import urllib.request
from pathlib import Path

GEOJSON_URL = (
    "https://raw.githubusercontent.com/tbrugz/geodata-br/master/"
    "geojson/geojs-41-mun.json"
)

ROOT = Path(__file__).resolve().parents[2]
MIGRATIONS_DIR = ROOT / "supabase" / "migrations"

SEED_MUNICIPALITIES = MIGRATIONS_DIR / "20260424120000_seed_municipalities_pr_mock.sql"
SEED_RESULTS = MIGRATIONS_DIR / "20260424120100_seed_results_municipality_mock.sql"

MOCK_CANDIDATE_TSE_ID = 9_999_999_001  # reservado; real TSE não usa esse range.

# Cidades grandes do PR para receber votos inflados artificialmente.
# Mapeia ibge_code → multiplicador de votos (sobre o baseline por área).
BIG_CITIES: dict[int, float] = {
    4106902: 60.0,  # Curitiba
    4113700: 18.0,  # Londrina
    4115200: 15.0,  # Maringá
    4119905: 9.0,   # Ponta Grossa
    4104808: 8.0,   # Cascavel
    4108304: 7.0,   # Foz do Iguaçu
    4125506: 7.5,   # São José dos Pinhais
    4105805: 5.5,   # Colombo
    4109401: 4.5,   # Guarapuava
    4118204: 4.0,   # Paranaguá
    4127700: 4.5,   # Toledo
    4101804: 4.5,   # Araucária
    4101408: 4.5,   # Apucarana
    4119962: 4.0,   # Pinhais
    4104253: 3.5,   # Campo Largo
    4101606: 3.8,   # Arapongas
    4100400: 3.2,   # Almirante Tamandaré
    4128104: 3.5,   # Umuarama
    4107652: 2.8,   # Fazenda Rio Grande
    4128205: 2.2,   # União da Vitória
    4128633: 2.5,   # Sarandi
    4117909: 2.3,   # Paiçandu
    4122206: 2.5,   # Rolândia
    4108957: 2.8,   # Francisco Beltrão
    4112405: 2.6,   # Ibiporã
    4103107: 2.0,   # Campo Mourão
    4114500: 2.4,   # Marechal Cândido Rondon
    4106001: 2.2,   # Cornélio Procópio
}


def fetch_geojson() -> dict:
    with urllib.request.urlopen(GEOJSON_URL, timeout=30) as resp:
        return json.loads(resp.read())


def ring_area_centroid(ring: list[list[float]]) -> tuple[float, float, float]:
    """Área assinada + centroide de um anel fechado (shoelace)."""
    n = len(ring)
    a = 0.0
    cx = cy = 0.0
    for i in range(n):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % n]
        cross = x1 * y2 - x2 * y1
        a += cross
        cx += (x1 + x2) * cross
        cy += (y1 + y2) * cross
    a /= 2.0
    if a != 0:
        cx /= 6 * a
        cy /= 6 * a
    return abs(a), cx, cy


def centroid_and_area(geom: dict) -> tuple[float, float, float]:
    """Retorna (lng, lat, area_em_graus_quadrados)."""
    if geom["type"] == "Polygon":
        polys = [geom["coordinates"]]
    elif geom["type"] == "MultiPolygon":
        polys = geom["coordinates"]
    else:
        return 0.0, 0.0, 0.0

    total_area = 0.0
    wcx = wcy = 0.0
    for poly in polys:
        outer = poly[0]
        a, cx, cy = ring_area_centroid(outer)
        total_area += a
        wcx += cx * a
        wcy += cy * a
    if total_area > 0:
        wcx /= total_area
        wcy /= total_area
    return wcx, wcy, total_area  # lng, lat, area


def classify_mesoregiao(lng: float, lat: float) -> str:
    """Classifica em uma das 10 mesorregiões do PR.

    Regras APROXIMADAS baseadas em centroide. Erros são aceitáveis porque
    este campo é sobrescrito pelo ETL real do IBGE (`elleito-etl ibge
    geometries`). A própria coluna `region` está marcada como best-effort
    no comentário da migration.
    """
    # Metropolitana de Curitiba: canto sudeste
    if lng >= -49.7 and lat <= -25.0:
        return "Metropolitana de Curitiba"
    # Norte Pioneiro: nordeste (divisa com SP)
    if lng >= -51.0 and lat >= -23.7:
        return "Norte Pioneiro Paranaense"
    # Noroeste: extremo noroeste
    if lng < -53.0 and lat >= -24.3:
        return "Noroeste Paranaense"
    # Norte Central: faixa de Maringá/Londrina
    if -53.0 <= lng < -51.0 and lat >= -24.0:
        return "Norte Central Paranaense"
    # Centro Ocidental: ao sul de Maringá, entorno de Campo Mourão
    if -53.2 <= lng < -51.5 and -25.0 <= lat < -24.0:
        return "Centro Ocidental Paranaense"
    # Oeste: Cascavel/Foz do Iguaçu
    if lng < -53.0 and -25.7 <= lat < -24.3:
        return "Oeste Paranaense"
    # Sudoeste: Francisco Beltrão
    if lng < -52.5 and lat < -25.5:
        return "Sudoeste Paranaense"
    # Centro-Sul: Guarapuava
    if -52.5 <= lng < -51.0 and lat < -25.0:
        return "Centro-Sul Paranaense"
    # Centro Oriental: Ponta Grossa
    if -51.0 <= lng < -49.7 and -25.3 <= lat < -24.3:
        return "Centro Oriental Paranaense"
    # Sudeste: União da Vitória / divisa com SC
    if lng < -49.7 and lat < -25.8:
        return "Sudeste Paranaense"
    # Fallback geográfico: usa o quadrante mais provável
    if lat < -25.0:
        return "Centro-Sul Paranaense"
    if lng < -52.0:
        return "Centro Ocidental Paranaense"
    return "Centro Oriental Paranaense"


def sql_escape(s: str) -> str:
    return s.replace("'", "''")


def generate_municipalities_sql(rows: list[dict]) -> str:
    lines = [
        "-- 20260424120000_seed_municipalities_pr_mock.sql",
        "-- SEED TEMPORÁRIO: 399 municípios do PR.",
        "--",
        "-- Gerado por `ingestion/scripts/generate_mock_seed.py` a partir do",
        "-- GeoJSON oficial tbrugz/geodata-br. Campo `region` (mesorregião) é",
        "-- uma classificação geográfica APROXIMADA por centroide — será",
        "-- sobrescrito pelo ETL real (`elleito-etl ibge geometries`).",
        "--",
        "-- Idempotente via ON CONFLICT (ibge_code) DO UPDATE.",
        "",
        "insert into public.municipalities (ibge_code, name, state, region)",
        "values",
    ]
    tuples = []
    for i, r in enumerate(rows):
        name = sql_escape(r["name"])
        region = sql_escape(r["region"])
        suffix = "," if i < len(rows) - 1 else ""
        tuples.append(f"  ({r['code']}, '{name}', 'PR', '{region}'){suffix}")
    lines.extend(tuples)
    lines.append("on conflict (ibge_code) do update set")
    lines.append("  name   = excluded.name,")
    lines.append("  state  = excluded.state,")
    lines.append("  region = coalesce(public.municipalities.region, excluded.region);")
    lines.append("")
    lines.append("-- Nota: `geom`, `centroid`, `population` e `electorate` ficam NULL.")
    lines.append("-- Serão preenchidos pelo ETL real na Fase 1 definitiva.")
    return "\n".join(lines) + "\n"


def generate_results_sql(rows: list[dict]) -> str:
    header = [
        "-- 20260424120100_seed_results_municipality_mock.sql",
        "-- SEED TEMPORÁRIO: 1 candidato + 399 resultados por município.",
        "--",
        "-- Eleição: deputado estadual 2022, turno 1 (já seedada em",
        "-- 20260421120500_elections.sql).",
        "-- Candidato: `MOCK 99` com tse_id 9999999001 (fora do range",
        "-- real do TSE — não conflita com dados oficiais).",
        "--",
        "-- Gerado por `ingestion/scripts/generate_mock_seed.py`. Reexecutar",
        "-- esse script é idempotente via ON CONFLICT.",
        "",
        "-- -----------------------------------------------------------------",
        "-- Candidato fictício",
        "-- -----------------------------------------------------------------",
        "insert into public.candidates",
        "  (tse_id, election_id, name, ballot_name, ballot_number, party, role, status)",
        "values",
        f"  ({MOCK_CANDIDATE_TSE_ID},",
        "   (select id from public.elections",
        "     where year = 2022 and round = 1 and role = 'deputado_estadual'),",
        "   'Candidato Mock Seed',",
        "   'MOCK 99',",
        "   99,",
        "   'MOCK',",
        "   'deputado_estadual',",
        "   'deferido')",
        "on conflict (tse_id) do update set",
        "  election_id   = excluded.election_id,",
        "  name          = excluded.name,",
        "  ballot_name   = excluded.ballot_name,",
        "  ballot_number = excluded.ballot_number,",
        "  party         = excluded.party,",
        "  role          = excluded.role,",
        "  status        = excluded.status;",
        "",
        "-- -----------------------------------------------------------------",
        "-- Resultados por município",
        "-- -----------------------------------------------------------------",
        "with e as (",
        "  select id from public.elections",
        "   where year = 2022 and round = 1 and role = 'deputado_estadual'",
        ")",
        "insert into public.results_municipality",
        "  (election_id, candidate_id, ibge_code, votes, pct_valid, pct_total,",
        "   rank_in_municipality)",
        "select",
        "  e.id,",
        f"  {MOCK_CANDIDATE_TSE_ID},",
        "  data.ibge_code,",
        "  data.votes,",
        "  data.pct_valid,",
        "  data.pct_valid,  -- pct_total = pct_valid no mock (sem brancos/nulos)",
        "  1",
        "from e,",
        "  (values",
    ]

    lines = header
    value_lines = []
    for r in rows:
        value_lines.append(
            f"    ({r['code']}::int, {r['votes']}::int, {r['pct_valid']:.3f}::numeric)"
        )
    # join com vírgula entre elementos
    joined = ",\n".join(value_lines)
    lines.append(joined)
    lines.append("  ) as data(ibge_code, votes, pct_valid)")
    lines.append("on conflict (election_id, candidate_id, ibge_code) do update set")
    lines.append("  votes                = excluded.votes,")
    lines.append("  pct_valid            = excluded.pct_valid,")
    lines.append("  pct_total            = excluded.pct_total,")
    lines.append("  rank_in_municipality = excluded.rank_in_municipality;")
    lines.append("")
    return "\n".join(lines) + "\n"


def seeded_noise(seed_key: int, scale: float = 1.0) -> float:
    """Ruído reprodutível em [-scale, +scale] baseado no ibge_code."""
    rng = random.Random(seed_key)
    return (rng.random() * 2 - 1) * scale


def build_rows(features: list[dict]) -> list[dict]:
    rows = []
    for f in features:
        props = f["properties"]
        code = int(props["id"])
        name = props["name"]
        lng, lat, area = centroid_and_area(f["geometry"])
        rows.append(
            {
                "code": code,
                "name": name,
                "lat": lat,
                "lng": lng,
                "area": area,
                "region": classify_mesoregiao(lng, lat),
            }
        )

    # Normaliza área → fator de escala
    areas = [r["area"] for r in rows]
    median_area = sorted(areas)[len(areas) // 2]

    for r in rows:
        # --- Votos: area ** 0.6 como proxy de "tamanho", + boost manual
        scale = (r["area"] / median_area) ** 0.6 if median_area > 0 else 1.0
        noise = 1.0 + seeded_noise(r["code"], 0.35)
        base_votes = int(1500 * scale * max(0.25, noise))
        big_mult = BIG_CITIES.get(r["code"], 1.0)
        votes = max(80, int(base_votes * big_mult))
        r["votes"] = votes

        # --- Percentual: gradiente L→O + N→S + ruído
        # leste (lng > -49) ≈ bonus 8pp; oeste (lng < -54) ≈ -4pp
        east_bonus = max(0, min(1.0, (r["lng"] + 54) / 6)) * 12
        # norte (-22) bonus 3pp; sul (-26) bonus 1pp
        lat_bonus = max(0, min(1.0, (-22.0 - r["lat"]) / 4.0)) * 4
        pct = 15 + east_bonus + lat_bonus + seeded_noise(r["code"] + 7, 6.5)
        pct = max(3.0, min(62.0, pct))
        r["pct_valid"] = round(pct, 3)

    rows.sort(key=lambda r: r["code"])
    return rows


def main() -> None:
    print("> baixando GeoJSON oficial do Paraná…")
    gj = fetch_geojson()
    features = gj["features"]
    print(f"  {len(features)} features")

    rows = build_rows(features)

    # Estatística rápida p/ sanidade
    pcts = [r["pct_valid"] for r in rows]
    votes = [r["votes"] for r in rows]
    print(
        f"  pct_valid: min={min(pcts):.2f}  max={max(pcts):.2f}  "
        f"median={sorted(pcts)[len(pcts)//2]:.2f}"
    )
    print(
        f"  votes:     min={min(votes)}    max={max(votes)}    "
        f"median={sorted(votes)[len(votes)//2]}"
    )
    by_region: dict[str, int] = {}
    for r in rows:
        by_region[r["region"]] = by_region.get(r["region"], 0) + 1
    print("  mesorregiões:")
    for k, v in sorted(by_region.items(), key=lambda kv: -kv[1]):
        print(f"    {k:35s} {v:3d}")

    MIGRATIONS_DIR.mkdir(parents=True, exist_ok=True)
    SEED_MUNICIPALITIES.write_text(generate_municipalities_sql(rows), encoding="utf-8")
    SEED_RESULTS.write_text(generate_results_sql(rows), encoding="utf-8")
    print(f"> gerado: {SEED_MUNICIPALITIES}")
    print(f"> gerado: {SEED_RESULTS}")


if __name__ == "__main__":
    main()
