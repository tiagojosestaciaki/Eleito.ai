#!/usr/bin/env python
"""Carrega/atualiza geometrias municipais do IBGE para o estado padrão (PR).

Uso:
    python scripts/etl_ibge_geometries.py
"""

from elleito_ingestion.common.logging import configure_logging
from elleito_ingestion.ibge.geometries import load_municipalities


def main() -> None:
    configure_logging()
    n = load_municipalities()
    print(f"Municípios carregados: {n}")


if __name__ == "__main__":
    main()
