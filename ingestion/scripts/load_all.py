#!/usr/bin/env python
"""Executa a carga completa da Fase 1 na ordem recomendada:

    1. IBGE — geometrias municipais
    2. IBGE — população estimada
    3. TSE — candidatos
    4. TSE — resultados por município
    5. TSE — resultados por zona
    6. Checks de qualidade

Uso:
    python scripts/load_all.py               # todos os anos padrão
    python scripts/load_all.py --years 2022  # subconjunto
"""

import argparse
import sys

from elleito_ingestion.common.checks import run_quality_checks
from elleito_ingestion.common.config import get_settings
from elleito_ingestion.common.db import engine_scope
from elleito_ingestion.common.logging import configure_logging, get_logger
from elleito_ingestion.ibge.geometries import load_municipalities
from elleito_ingestion.ibge.indicators import update_population
from elleito_ingestion.tse.candidates import load_candidates
from elleito_ingestion.tse.results_municipality import load_results_municipality
from elleito_ingestion.tse.results_zone import load_results_zone

log = get_logger("load_all")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--years", type=int, nargs="*", default=None)
    args = parser.parse_args()

    configure_logging()
    years = tuple(args.years) if args.years else None

    log.info("pipeline.step", name="ibge.geometries")
    load_municipalities()

    log.info("pipeline.step", name="ibge.population")
    update_population(year=2022)

    log.info("pipeline.step", name="tse.candidates")
    load_candidates(years=years)

    log.info("pipeline.step", name="tse.results_municipality")
    load_results_municipality(years=years)

    log.info("pipeline.step", name="tse.results_zone")
    load_results_zone(years=years)

    log.info("pipeline.step", name="checks")
    with engine_scope(get_settings()) as engine:
        problems = run_quality_checks(engine)
    if problems:
        for p in problems:
            print(f"  - {p}")
        sys.exit(1)
    print("Pipeline completo — Fase 1 carregada com sucesso.")


if __name__ == "__main__":
    main()
