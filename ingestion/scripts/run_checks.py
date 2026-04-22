#!/usr/bin/env python
"""Roda os checks de qualidade pós-ETL. Exit code != 0 em caso de problemas."""

import sys

from elleito_ingestion.common.checks import run_quality_checks
from elleito_ingestion.common.config import get_settings
from elleito_ingestion.common.db import engine_scope
from elleito_ingestion.common.logging import configure_logging


def main() -> None:
    configure_logging()
    with engine_scope(get_settings()) as engine:
        problems = run_quality_checks(engine)
    if problems:
        print("Problemas detectados:")
        for p in problems:
            print(f"  - {p}")
        sys.exit(1)
    print("Checks OK.")


if __name__ == "__main__":
    main()
