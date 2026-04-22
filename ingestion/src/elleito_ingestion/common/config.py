"""Configuração centralizada da ingestão — lê variáveis de ambiente.

A precedência é: ENV > .env.local > .env > defaults.
"""

from __future__ import annotations

from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_ROOT = Path(__file__).resolve().parents[4]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(_ROOT / ".env.local", _ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Ambiente
    app_env: str = "local"
    log_level: str = "info"

    # Supabase / Postgres
    supabase_db_url: str = Field(
        default="",
        description="Connection string Postgres (postgres://user:pass@host:5432/db).",
    )
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    # Base dos Dados / BigQuery
    bd_project_id: str = ""
    bd_billing_project_id: str = ""
    google_application_credentials: str = ""

    # IBGE
    ibge_api_base_url: str = "https://servicodados.ibge.gov.br/api"
    ibge_state_uf: str = "PR"
    ibge_state_code: int = 41

    # Filtro padrão de anos eleitorais
    default_election_years: tuple[int, ...] = (2016, 2018, 2020, 2022, 2024)


def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
