"""CLI unificada da ingestão.

Exemplos:

    elleito-etl ibge geometries
    elleito-etl ibge population --year 2022
    elleito-etl tse candidates --years 2018 2022
    elleito-etl tse results-municipality
    elleito-etl tse results-zone
    elleito-etl checks
    elleito-etl load-all         # carga completa (ordem recomendada)
"""

from __future__ import annotations

import click

from .common.checks import run_quality_checks
from .common.config import get_settings
from .common.db import engine_scope
from .common.logging import configure_logging, get_logger
from .ibge.geometries import load_municipalities
from .ibge.indicators import update_population
from .tse.candidates import load_candidates
from .tse.results_municipality import load_results_municipality
from .tse.results_zone import load_results_zone

log = get_logger(__name__)


@click.group()
@click.option("--log-level", default="info", show_default=True)
def main(log_level: str) -> None:
    """Ponto de entrada da ingestão elleito.ai."""
    configure_logging(level=log_level)


# -------------------------- IBGE --------------------------
@main.group()
def ibge() -> None:
    """Comandos de ingestão IBGE."""


@ibge.command("geometries")
def ibge_geometries() -> None:
    n = load_municipalities()
    click.echo(f"Municípios carregados: {n}")


@ibge.command("population")
@click.option("--year", type=int, default=2022, show_default=True)
def ibge_population(year: int) -> None:
    n = update_population(year=year)
    click.echo(f"Populações atualizadas: {n}")


# -------------------------- TSE ---------------------------
@main.group()
def tse() -> None:
    """Comandos de ingestão TSE (via Base dos Dados)."""


def _years(ctx_years: tuple[int, ...]) -> tuple[int, ...] | None:
    return ctx_years or None


@tse.command("candidates")
@click.option("--years", type=int, multiple=True, help="Ex.: --years 2018 --years 2022")
@click.option("--dry-run", is_flag=True, default=False)
def tse_candidates(years: tuple[int, ...], dry_run: bool) -> None:
    n = load_candidates(years=_years(years), dry_run=dry_run)
    click.echo(f"Candidatos processados: {n} (dry_run={dry_run})")


@tse.command("results-municipality")
@click.option("--years", type=int, multiple=True)
@click.option("--dry-run", is_flag=True, default=False)
def tse_results_mun(years: tuple[int, ...], dry_run: bool) -> None:
    n = load_results_municipality(years=_years(years), dry_run=dry_run)
    click.echo(f"Resultados por município processados: {n}")


@tse.command("results-zone")
@click.option("--years", type=int, multiple=True)
@click.option("--dry-run", is_flag=True, default=False)
def tse_results_zone(years: tuple[int, ...], dry_run: bool) -> None:
    n = load_results_zone(years=_years(years), dry_run=dry_run)
    click.echo(f"Resultados por zona processados: {n}")


# -------------------------- Pipeline completo -------------
@main.command("load-all")
@click.option("--years", type=int, multiple=True, help="Subconjunto opcional de anos")
def load_all(years: tuple[int, ...]) -> None:
    """Executa a ordem recomendada de carga da Fase 1."""
    chosen = _years(years)

    log.info("pipeline.step", name="ibge.geometries")
    load_municipalities()

    log.info("pipeline.step", name="ibge.population")
    update_population(year=2022)

    log.info("pipeline.step", name="tse.candidates")
    load_candidates(years=chosen)

    log.info("pipeline.step", name="tse.results_municipality")
    load_results_municipality(years=chosen)

    log.info("pipeline.step", name="tse.results_zone")
    load_results_zone(years=chosen)

    log.info("pipeline.step", name="checks")
    _run_checks()


@main.command("checks")
def checks_cmd() -> None:
    _run_checks()


def _run_checks() -> None:
    settings = get_settings()
    with engine_scope(settings) as engine:
        problems = run_quality_checks(engine)
    if problems:
        click.echo("Problemas detectados:")
        for p in problems:
            click.echo(f"  - {p}")
        raise SystemExit(1)
    click.echo("Checks OK.")


if __name__ == "__main__":
    main()
