#!/usr/bin/env python
"""Carrega candidatos do TSE (PR) via Base dos Dados (BigQuery).

Uso:
    python scripts/etl_tse_candidates.py                    # todos os anos padrão
    python scripts/etl_tse_candidates.py --years 2018 2022  # subconjunto
    python scripts/etl_tse_candidates.py --dry-run
"""

import argparse

from elleito_ingestion.common.logging import configure_logging
from elleito_ingestion.tse.candidates import load_candidates


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--years", type=int, nargs="*", default=None)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    configure_logging()
    years = tuple(args.years) if args.years else None
    n = load_candidates(years=years, dry_run=args.dry_run)
    print(f"Candidatos processados: {n} (dry_run={args.dry_run})")


if __name__ == "__main__":
    main()
