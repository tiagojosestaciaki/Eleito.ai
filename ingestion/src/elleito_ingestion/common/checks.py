"""Checks de qualidade pós-ETL — rodar como última etapa da Fase 1."""

from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.engine import Engine

from .logging import get_logger

log = get_logger(__name__)

EXPECTED_PR_MUNICIPALITIES = 399


def _scalar(engine: Engine, sql: str) -> int:
    with engine.connect() as conn:
        return int(conn.execute(text(sql)).scalar_one())


def run_quality_checks(engine: Engine) -> list[str]:
    """Retorna lista de problemas encontrados. Lista vazia = tudo OK."""
    problems: list[str] = []

    mun_count = _scalar(engine, "select count(*) from public.municipalities where state='PR'")
    if mun_count != EXPECTED_PR_MUNICIPALITIES:
        problems.append(
            f"Municípios PR carregados = {mun_count}, esperado {EXPECTED_PR_MUNICIPALITIES}"
        )

    # Geometrias presentes?
    geom_missing = _scalar(
        engine,
        "select count(*) from public.municipalities where state='PR' and geom is null",
    )
    if geom_missing:
        problems.append(f"{geom_missing} municípios PR sem geometria")

    # Elections seed
    elections = _scalar(engine, "select count(*) from public.elections")
    if elections == 0:
        problems.append("Tabela elections está vazia — seed não aplicado?")

    # Candidatos órfãos (sem election)
    orphans_candidates = _scalar(
        engine,
        """
        select count(*) from public.candidates c
        left join public.elections e on e.id = c.election_id
        where e.id is null
        """,
    )
    if orphans_candidates:
        problems.append(f"{orphans_candidates} candidatos com election_id inválido")

    # Resultados órfãos (sem candidate)
    orphans_results = _scalar(
        engine,
        """
        select count(*) from public.results_municipality rm
        left join public.candidates c on c.tse_id = rm.candidate_id
        where c.tse_id is null
        """,
    )
    if orphans_results:
        problems.append(
            f"{orphans_results} linhas em results_municipality com candidate_id inexistente"
        )

    # Resultados apontando para ibge_code não carregado
    orphans_geo = _scalar(
        engine,
        """
        select count(*) from public.results_municipality rm
        left join public.municipalities m on m.ibge_code = rm.ibge_code
        where m.ibge_code is null
        """,
    )
    if orphans_geo:
        problems.append(f"{orphans_geo} resultados referenciam municípios não carregados")

    for p in problems:
        log.warning("checks.problem", message=p)
    if not problems:
        log.info("checks.ok", municipalities=mun_count, elections=elections)
    return problems
