#!/usr/bin/env python
"""Carrega resultados eleitorais (município + zona) do TSE via Base dos Dados.

Executa os dois passos: results_municipality e results_zone.

Uso:
    python scripts/etl_tse_results.py
    python scripts/etl_tse_results.py --years 2022
    python scripts/etl_tse_results.py --skip-zone
"""

import argparse

from elleito_ingestion.common.logging import configure_logging
from elleito_ingestion.tse.results_municipality import load_results_municipality
from elleito_ingestion.tse.results_zone import load_results_zone


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--years", type=int, nargs="*", default=None)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--skip-zone", action="store_true")
    parser.add_argument("--skip-municipality", action="store_true")
    args = parser.parse_args()

    configure_logging()
    years = tuple(args.years) if args.years else None

    if not args.skip_municipality:
        n_mun = load_results_municipality(years=years, dry_run=args.dry_run)
        print(f"results_municipality: {n_mun}")

    if not args.skip_zone:
        n_zone = load_results_zone(years=years, dry_run=args.dry_run)
        print(f"results_zone: {n_zone}")


if __name__ == "__main__":
    main()
