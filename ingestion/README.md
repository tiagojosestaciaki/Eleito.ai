# /ingestion — Pipelines Python de ETL

Scripts de extração, transformação e carga que alimentam o banco Postgres do elleito.ai.

## Fontes

| Fonte | Script previsto | Frequência |
|-------|-----------------|------------|
| TSE histórico via Base dos Dados (BigQuery) | `etl_tse_historico.py` | Anual + carga inicial |
| TSE apuração em tempo real | `etl_tse_realtime.py` | 60s no D-day |
| IBGE — malhas municipais | `etl_ibge_geom.py` | Único + revisão trienal |
| IBGE — indicadores socioeconômicos | `etl_ibge_indicators.py` | Anual |
| Imprensa regional + redes | `etl_mentions.py` | Diária (cron) |

## Stack planejado

- **Python 3.11**
- **basedosdados** (acesso oficial ao BigQuery da BD)
- **pandas** / **pyarrow** (transformação)
- **httpx** (chamadas HTTP assíncronas)
- **pydantic** (validação)
- **supabase-py** (escrita no Postgres)
- **anthropic** (classificação de menções em Claude Haiku)
- **uv** como gerenciador de ambiente (ou pip + venv)

## Estrutura prevista (Fase 1)

```
ingestion/
├── src/
│   ├── common/
│   │   ├── config.py
│   │   ├── db.py
│   │   └── logging.py
│   ├── tse/
│   │   ├── historico.py
│   │   └── realtime.py
│   ├── ibge/
│   │   ├── geometries.py
│   │   └── indicators.py
│   ├── mentions/
│   │   ├── fetchers.py
│   │   └── classifier.py
│   └── schemas/           # pydantic/pandera
├── scripts/               # entrypoints CLI
├── tests/
├── pyproject.toml
└── requirements.txt
```

## Princípios de execução

- **Idempotência**: rodar duas vezes o mesmo script não duplica linhas (UPSERT por chaves naturais)
- **Validação antes de escrever**: pandera/pydantic valida o dataframe antes do upsert
- **Logs estruturados** (JSON) para facilitar observabilidade futura
- **Retry com backoff** em chamadas de rede (httpx + tenacity)
- **Dry run** obrigatório em todos os scripts (`--dry-run`)

## Status

**Fase 0** — apenas pasta criada. Implementação começa na **Fase 1** conforme [ROADMAP.md](../ROADMAP.md).
