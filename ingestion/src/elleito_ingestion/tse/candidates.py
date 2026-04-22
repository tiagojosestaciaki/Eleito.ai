"""Ingestão de candidatos — dataset `br_tse_eleicoes.candidatos` na Base dos Dados.

⚠️ ADR-002: NÃO selecionamos nem persistimos CPF, data de nascimento, bens,
endereço, escolaridade, ocupação, raça ou gênero. Apenas campos estritamente
necessários para identificar o candidato em uma eleição.

⚠️ Os nomes exatos de colunas e tabelas na Base dos Dados podem mudar ao longo
do tempo. Caso a query falhe, consulte o catálogo atualizado em
https://basedosdados.org/dataset/br-tse-eleicoes e ajuste este arquivo.
"""

from __future__ import annotations

import pandas as pd

from ..common.bd_client import query
from ..common.config import Settings, get_settings
from ..common.db import dataframe_to_rows, engine_scope, upsert_rows
from ..common.logging import get_logger
from ..common.mappings import normalize_role, normalize_status
from .elections_lookup import build_election_map

log = get_logger(__name__)

CANDIDATES_SQL = """
select
  cast(sequencial_candidato as int64)       as tse_id,
  cast(ano as int64)                         as year,
  cast(turno as int64)                       as round,
  upper(cargo)                               as cargo,
  nome                                       as name,
  nome_urna                                  as ballot_name,
  cast(numero_candidato as int64)            as ballot_number,
  upper(sigla_partido)                       as party,
  coligacao                                  as coalition,
  upper(situacao_candidatura)                as status_raw
from `basedosdados.br_tse_eleicoes.candidatos`
where sigla_uf = 'PR'
  and ano in ({years})
"""


def _normalize(df: pd.DataFrame, election_map: dict[tuple[int, int, str], int]) -> pd.DataFrame:
    df = df.copy()
    df["role"] = df["cargo"].map(normalize_role)
    df["status"] = df["status_raw"].map(normalize_status)

    before = len(df)
    df = df.dropna(subset=["role", "tse_id"])
    dropped = before - len(df)
    if dropped:
        log.warning("tse.candidates.dropped_unmapped_role", dropped=dropped)

    df["election_id"] = [
        election_map.get((int(y), int(r), role))
        for y, r, role in zip(df["year"], df["round"], df["role"])
    ]
    missing = df["election_id"].isna().sum()
    if missing:
        log.warning("tse.candidates.dropped_missing_election", dropped=int(missing))
    df = df.dropna(subset=["election_id"])
    df["election_id"] = df["election_id"].astype(int)

    # Dedup: uma (tse_id) pode vir com duplicatas (chapas de vice/suplentes
    # compartilham o mesmo registro em algumas séries). Ficamos com a 1ª ocorrência.
    df = df.drop_duplicates(subset=["tse_id"], keep="first")

    return df[
        [
            "tse_id",
            "election_id",
            "name",
            "ballot_name",
            "ballot_number",
            "party",
            "coalition",
            "role",
            "status",
        ]
    ]


def load_candidates(
    years: tuple[int, ...] | None = None,
    settings: Settings | None = None,
    dry_run: bool = False,
) -> int:
    settings = settings or get_settings()
    years = years or settings.default_election_years
    sql = CANDIDATES_SQL.format(years=",".join(str(y) for y in years))

    df = query(sql, settings=settings)
    log.info("tse.candidates.raw", rows=len(df))

    with engine_scope(settings) as engine:
        election_map = build_election_map(engine)
        prepared = _normalize(df, election_map)
        log.info("tse.candidates.prepared", rows=len(prepared))

        if dry_run:
            log.info("tse.candidates.dry_run", sample=prepared.head(3).to_dict(orient="records"))
            return len(prepared)

        rows = dataframe_to_rows(
            prepared,
            columns=[
                "tse_id",
                "election_id",
                "name",
                "ballot_name",
                "ballot_number",
                "party",
                "coalition",
                "role",
                "status",
            ],
        )
        return upsert_rows(
            engine=engine,
            table_name="candidates",
            rows=rows,
            conflict_columns=["tse_id"],
            update_columns=[
                "election_id",
                "name",
                "ballot_name",
                "ballot_number",
                "party",
                "coalition",
                "role",
                "status",
            ],
        )
