"""Utilitário para resolver `elections.id` a partir de (ano, turno, cargo)."""

from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.engine import Engine


def build_election_map(engine: Engine) -> dict[tuple[int, int, str], int]:
    """Retorna dict {(year, round, role): election_id} lendo da tabela elections."""
    with engine.connect() as conn:
        rows = conn.execute(
            text("select id, year, round, role from public.elections")
        ).mappings().all()
    return {(r["year"], r["round"], r["role"]): r["id"] for r in rows}
