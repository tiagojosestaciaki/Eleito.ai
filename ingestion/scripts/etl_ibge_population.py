#!/usr/bin/env python
"""Atualiza a coluna `population` em municipalities usando estimativa IBGE.

Uso:
    python scripts/etl_ibge_population.py --year 2022
"""

import argparse

from elleito_ingestion.common.logging import configure_logging
from elleito_ingestion.ibge.indicators import update_population


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--year", type=int, default=2022)
    args = parser.parse_args()
    configure_logging()
    n = update_population(year=args.year)
    print(f"População atualizada em {n} municípios para o ano {args.year}")


if __name__ == "__main__":
    main()
