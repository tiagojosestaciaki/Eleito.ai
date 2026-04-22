"""Atualiza `municipalities` com indicadores demográficos/socioeconômicos do IBGE.

No MVP carregamos apenas `population` (estimativas anuais). PIB per capita e IDH
podem ser adicionados posteriormente — deixamos as colunas prontas no schema.
"""

from __future__ import annotations

from typing import Any

import httpx
from sqlalchemy import text
from tenacity import retry, stop_after_attempt, wait_exponential

from ..common.config import Settings, get_settings
from ..common.db import engine_scope
from ..common.logging import get_logger

log = get_logger(__name__)


@retry(stop=stop_after_attempt(4), wait=wait_exponential(multiplier=2, min=2, max=16))
def _get(client: httpx.Client, url: str, params: dict[str, Any] | None = None) -> httpx.Response:
    r = client.get(url, params=params, timeout=60)
    r.raise_for_status()
    return r


def fetch_population(settings: Settings, year: int) -> dict[int, int]:
    """Retorna {ibge_code: populacao} para municípios do estado (estimativa IBGE).

    Agregado: POP | Nível: N6 (município) | Variável: 9324 (população residente estimada)
    """
    # Aggregated: https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/{year}/variaveis/9324?localidades=N6[N3[{state_code}]]
    url = (
        f"{settings.ibge_api_base_url}/v3/agregados/6579/"
        f"periodos/{year}/variaveis/9324"
    )
    params = {"localidades": f"N6[N3[{settings.ibge_state_code}]]"}

    with httpx.Client() as client:
        data = _get(client, url, params=params).json()

    out: dict[int, int] = {}
    try:
        series = data[0]["resultados"][0]["series"]
    except (IndexError, KeyError):
        log.warning("ibge.population.empty", year=year)
        return out

    for row in series:
        localidade = row.get("localidade", {})
        ibge = int(localidade.get("id", 0))
        valor = row.get("serie", {}).get(str(year))
        if ibge and valor and valor != "...":
            try:
                out[ibge] = int(valor)
            except ValueError:
                continue
    log.info("ibge.population.fetched", year=year, count=len(out))
    return out


def update_population(settings: Settings | None = None, year: int = 2022) -> int:
    settings = settings or get_settings()
    pop_by_code = fetch_population(settings, year=year)
    if not pop_by_code:
        return 0

    sql = text(
        "update public.municipalities set population = :pop, updated_at = now() "
        "where ibge_code = :ibge_code"
    )
    updated = 0
    with engine_scope(settings) as engine, engine.begin() as conn:
        for ibge_code, pop in pop_by_code.items():
            result = conn.execute(sql, {"pop": pop, "ibge_code": ibge_code})
            updated += result.rowcount or 0
    log.info("ibge.population.updated", rows=updated)
    return updated
