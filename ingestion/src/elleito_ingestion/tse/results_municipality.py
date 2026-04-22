"""Ingestão de resultados por município — dataset TSE na Base dos Dados.

Agregamos `detalhes_votacao_municipio_zona` por município para alimentar
`results_municipality`. O detalhe por zona é carregado em
`results_zone.py`.
"""

from __future__ import annotations

import pandas as pd

from ..common.bd_client import query
from ..common.config import Settings, get_settings
from ..common.db import dataframe_to_rows, engine_scope, upsert_rows
from ..common.logging import get_logger
from ..common.mappings import normalize_role
from .elections_lookup import build_election_map

log = get_logger(__name__)

RESULTS_SQL = """
with base as (
  select
    cast(ano as int64)                             as year,
    cast(turno as int64)                           as round,
    upper(cargo)                                   as cargo,
    cast(id_municipio as int64)                    as ibge_code,
    cast(sequencial_candidato as int64)            as tse_id,
    cast(votos as int64)                           as votes
  from `basedosdados.br_tse_eleicoes.detalhes_votacao_municipio_zona`
  where sigla_uf = 'PR'
    and ano in ({years})
)
select
  year,
  round,
  cargo,
  ibge_code,
  tse_id,
  sum(votes) as votes
from base
group by year, round, cargo, ibge_code, tse_id
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
    df["ibge_code"] = df["ibge_code"].astype("int64")
    df["votes"] = df["votes"].fillna(0).astype("int64")

    return df[["election_id", "candidate_id", "ibge_code", "votes"]]


def _compute_pct_and_rank(df: pd.DataFrame) -> pd.DataFrame:
    """Adiciona pct_valid, pct_total e rank_in_municipality por (election_id, ibge_code)."""
    group = df.groupby(["election_id", "ibge_code"])["votes"].transform("sum")
    df["pct_valid"] = (df["votes"] / group.replace(0, pd.NA) * 100).round(3)
    df["pct_total"] = df["pct_valid"]  # sem brancos/nulos nessa tabela; aproximação razoável
    df["rank_in_municipality"] = df.groupby(
        ["election_id", "ibge_code"]
    )["votes"].rank(ascending=False, method="dense").astype("Int64")
    return df


def load_results_municipality(
    years: tuple[int, ...] | None = None,
    settings: Settings | None = None,
    dry_run: bool = False,
) -> int:
    settings = settings or get_settings()
    years = years or settings.default_election_years
    sql = RESULTS_SQL.format(years=",".join(str(y) for y in years))

    df = query(sql, settings=settings)
    log.info("tse.results_mun.raw", rows=len(df))

    with engine_scope(settings) as engine:
        election_map = build_election_map(engine)
        prepared = _normalize(df, election_map)
        prepared = _compute_pct_and_rank(prepared)
        log.info("tse.results_mun.prepared", rows=len(prepared))

        if dry_run:
            log.info("tse.results_mun.dry_run", sample=prepared.head(3).to_dict(orient="records"))
            return len(prepared)

        rows = dataframe_to_rows(
            prepared,
            columns=[
                "election_id",
                "candidate_id",
                "ibge_code",
                "votes",
                "pct_valid",
                "pct_total",
                "rank_in_municipality",
            ],
        )
        return upsert_rows(
            engine=engine,
            table_name="results_municipality",
            rows=rows,
            conflict_columns=["election_id", "candidate_id", "ibge_code"],
            update_columns=["votes", "pct_valid", "pct_total", "rank_in_municipality"],
            batch_size=10_000,
        )
