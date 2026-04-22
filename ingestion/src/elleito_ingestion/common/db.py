"""Camada fina de acesso ao Postgres (Supabase) para upsert idempotente.

Usamos SQLAlchemy Core para montar COPY/INSERT...ON CONFLICT eficientes. Rows
chegam como lista de dicts, pequenas ou em batches de ~10k.
"""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from contextlib import contextmanager
from typing import Any

import pandas as pd
from sqlalchemy import MetaData, Table, create_engine, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.engine import Engine

from .config import Settings, get_settings
from .logging import get_logger

log = get_logger(__name__)


def make_engine(settings: Settings | None = None) -> Engine:
    settings = settings or get_settings()
    if not settings.supabase_db_url:
        raise RuntimeError(
            "SUPABASE_DB_URL não configurado. Defina no .env.local antes de rodar o ETL."
        )
    return create_engine(settings.supabase_db_url, pool_pre_ping=True, future=True)


@contextmanager
def engine_scope(settings: Settings | None = None):
    engine = make_engine(settings)
    try:
        yield engine
    finally:
        engine.dispose()


def upsert_rows(
    engine: Engine,
    table_name: str,
    rows: Sequence[dict[str, Any]],
    conflict_columns: Sequence[str],
    update_columns: Sequence[str] | None = None,
    schema: str = "public",
    batch_size: int = 5_000,
) -> int:
    """INSERT ... ON CONFLICT DO UPDATE, em batches.

    Retorna o número total de linhas enviadas.
    """
    if not rows:
        log.info("upsert.skip.empty", table=table_name)
        return 0

    metadata = MetaData(schema=schema)
    table = Table(table_name, metadata, autoload_with=engine)

    update_columns = list(update_columns or [])
    total = 0
    with engine.begin() as conn:
        for start in range(0, len(rows), batch_size):
            batch = rows[start : start + batch_size]
            stmt = pg_insert(table).values(list(batch))
            if update_columns:
                set_ = {c: getattr(stmt.excluded, c) for c in update_columns}
                stmt = stmt.on_conflict_do_update(
                    index_elements=list(conflict_columns), set_=set_
                )
            else:
                stmt = stmt.on_conflict_do_nothing(index_elements=list(conflict_columns))
            conn.execute(stmt)
            total += len(batch)
            log.info(
                "upsert.batch",
                table=table_name,
                batch=start // batch_size,
                rows=len(batch),
                cumulative=total,
            )
    log.info("upsert.done", table=table_name, total=total)
    return total


def dataframe_to_rows(df: pd.DataFrame, columns: Iterable[str]) -> list[dict[str, Any]]:
    """Seleciona colunas, converte NaN → None e retorna lista de dicts pronta para upsert."""
    cols = list(columns)
    subset = df[cols].where(df[cols].notna(), None)
    return subset.to_dict(orient="records")


def execute_sql(engine: Engine, sql: str, params: dict[str, Any] | None = None) -> None:
    with engine.begin() as conn:
        conn.execute(text(sql), params or {})


def count_rows(engine: Engine, table_name: str, schema: str = "public") -> int:
    with engine.connect() as conn:
        result = conn.execute(text(f"select count(*) from {schema}.{table_name}")).scalar_one()
    return int(result)
