"""Wrapper fino em torno de `basedosdados` — encapsula a autenticação e o
billing project, e oferece uma única função `query` que devolve DataFrame.

Mantemos isolado para facilitar o mock em testes.
"""

from __future__ import annotations

import pandas as pd

from .config import Settings, get_settings
from .logging import get_logger

log = get_logger(__name__)


def query(sql: str, settings: Settings | None = None) -> pd.DataFrame:
    """Executa uma query no BigQuery via Base dos Dados, cobrada no `bd_billing_project_id`."""
    settings = settings or get_settings()
    if not settings.bd_billing_project_id:
        raise RuntimeError(
            "BD_BILLING_PROJECT_ID não configurado. Defina no .env.local (GCP project id)."
        )

    # Import tardio: basedosdados inicializa clients Google no import.
    import basedosdados as bd

    log.info("bd.query.start", chars=len(sql))
    df = bd.read_sql(query=sql, billing_project_id=settings.bd_billing_project_id)
    log.info("bd.query.done", rows=len(df))
    return df
