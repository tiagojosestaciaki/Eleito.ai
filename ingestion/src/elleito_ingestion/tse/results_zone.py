"""Ingestão de resultados por zona eleitoral (granularidade fina)."""

from __future__ import annotations

import pandas as pd

from ..common.bd_client import query
from ..common.config import Settings, get_settings
from ..common.db import dataframe_to_rows, engine_scope, upsert_rows
from ..common.logging import get_logger
from ..common.mappings import normalize_role
from .elections_lookup import build_election_map

log = get_logger(__name__)

ZONE_SQL = """
select
  cast(ano as int64)                           as year,
  cast(turno as int64)                         as round,
  upper(cargo)                                 as cargo,
  cast(id_municipio as int64)                  as ibge_code,
  cast(zona as int64)                          as zone_number,
  cast(sequencial_candidato as int64)          as tse_id,
  cast(votos as int64)                         as votes
from `basedosdados.br_tse_eleicoes.detalhes_votacao_municipio_zona`
where sigla_uf = 'PR'
  and ano in ({years})
"""


def _normalize(
    df: pd.DataFrame,
    election_map: dict[tuple[int, int, str], int],
) -> pd.DataFrame:
    df = df.copy()
    df["role"] = df["cargo"].map(normalize_role)
    df = df.dropna(subset=["role"])

    df["election_id"] = [
        election_map.get((int(y), int(r), role))
        for y, r, role in zip(df["year"], df["round"], df["role"])
    ]
    df = df.dropna(subset=["election_id"])
    df["election_id"] = df["election_id"].astype(int)

    df["candidate_id"] = df["tse_id"].astype("int64")
    df["ibge_code"]    = df["ibge_code"].astype("int64")
    df["zone_number"]  = df["zone_number"].astype("int64")
    df["votes"]        = df["votes"].fillna(0).astype("int64")

    # Consolida caso existam duplicatas por (election, candidate, município, zona).
    grouped = (
        df.groupby(
            ["election_id", "candidate_id", "ibge_code", "zone_number"],
            as_index=False,
        )["votes"]
        .sum()
    )
    return grouped


def load_results_zone(
    years: tuple[int, ...] | None = None,
    settings: Settings | None = None,
    dry_run: bool = False,
) -> int:
    settings = settings or get_settings()
    years = years or settings.default_election_years
    sql = ZONE_SQL.format(years=",".join(str(y) for y in years))

    df = query(sql, settings=settings)
    log.info("tse.results_zone.raw", rows=len(df))

    with engine_scope(settings) as engine:
        election_map = build_election_map(engine)
        prepared = _normalize(df, election_map)
        log.info("tse.results_zone.prepared", rows=len(prepared))

        if dry_run:
            log.info("tse.results_zone.dry_run", sample=prepared.head(3).to_dict(orient="records"))
            return len(prepared)

        rows = dataframe_to_rows(
            prepared,
            columns=["election_id", "candidate_id", "ibge_code", "zone_number", "votes"],
        )
        return upsert_rows(
            engine=engine,
            table_name="results_zone",
            rows=rows,
            conflict_columns=["election_id", "candidate_id", "ibge_code", "zone_number"],
            update_columns=["votes"],
            batch_size=10_000,
        )
