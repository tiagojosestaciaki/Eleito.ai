# /ingestion — Pipelines Python de ETL

Pipelines que alimentam o banco Postgres do elleito.ai a partir das fontes oficiais.

## Stack

- **Python 3.11+**
- **basedosdados** (BigQuery — TSE histórico)
- **pandas** / **pyarrow** (transformação)
- **httpx** + **tenacity** (APIs IBGE com retry)
- **SQLAlchemy** + **psycopg** (upsert no Postgres)
- **pydantic-settings** (config via env)
- **structlog** (logs JSON estruturados)
- **click** (CLI)

## Estrutura

```
ingestion/
├── pyproject.toml
├── requirements.txt
├── src/elleito_ingestion/
│   ├── cli.py                 # CLI unificada: `elleito-etl ...`
│   ├── common/
│   │   ├── config.py          # pydantic-settings — lê .env
│   │   ├── logging.py         # structlog
│   │   ├── db.py              # SQLAlchemy + upsert idempotente
│   │   ├── bd_client.py       # wrapper basedosdados
│   │   ├── mappings.py        # cargo/status TSE → schema canônico
│   │   └── checks.py          # validações pós-ETL
│   ├── ibge/
│   │   ├── geometries.py      # malhas municipais (GeoJSON → PostGIS)
│   │   └── indicators.py      # população estimada
│   └── tse/
│       ├── candidates.py              # ADR-002: sem CPF/bens/etc
│       ├── results_municipality.py
│       ├── results_zone.py
│       └── elections_lookup.py
├── scripts/                    # entrypoints CLI alternativos (python -m)
└── tests/
```

## Setup

```bash
cd ingestion
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
# ou com uv (recomendado):
uv sync --all-extras
```

Preencha `../.env.local` (a config é lida da raiz do monorepo):

```
SUPABASE_DB_URL=postgresql://postgres:...@db.xxx.supabase.co:5432/postgres
BD_BILLING_PROJECT_ID=seu-projeto-gcp
GOOGLE_APPLICATION_CREDENTIALS=/caminho/para/service-account.json
```

## Ordem recomendada de carga (Fase 1)

```bash
# Opção A — pipeline completo
elleito-etl load-all

# Opção B — passo a passo
elleito-etl ibge geometries
elleito-etl ibge population --year 2022
elleito-etl tse candidates
elleito-etl tse results-municipality
elleito-etl tse results-zone
elleito-etl checks
```

Todos os comandos aceitam `--dry-run` (quando aplicável) para inspecionar a
transformação sem escrever no banco.

Anos padrão: **2016, 2018, 2020, 2022, 2024** (todos os cargos, inclusive
vereador — ver ADR-001).

## Princípios de execução

- **Idempotência:** rodar duas vezes o mesmo script não duplica linhas — usamos
  `INSERT ... ON CONFLICT DO UPDATE` com chaves naturais.
- **Validação antes de escrever:** `mappings.py` rejeita cargos/status
  desconhecidos com log explícito.
- **Logs estruturados (JSON)** para observabilidade futura.
- **Retry com backoff** em chamadas de rede (`tenacity`).
- **Privacidade:** candidatos carregam apenas identificação básica (ADR-002) —
  CPF, bens declarados, data de nascimento, escolaridade, ocupação e endereço
  **não são selecionados nem armazenados**.

## Checks pós-ETL

`elleito-etl checks` valida:

- 399 municípios do PR carregados
- Nenhum município sem geometria
- Tabela `elections` com seed aplicado
- Sem FKs órfãs em `candidates` e `results_*`
- Sem resultados apontando para `ibge_code` inexistente

Exit code ≠ 0 em caso de problemas — adequado para uso em CI.

## Testes

```bash
pytest
```

## Notas

- Se nomes de colunas na Base dos Dados mudarem, atualize as consultas em
  `tse/candidates.py`, `tse/results_municipality.py` e `tse/results_zone.py`.
  A verdade canônica está em https://basedosdados.org/dataset/br-tse-eleicoes
- Scripts de apuração em tempo real (Fase 1.5) e ingestão de menções (Fase 4)
  ainda não existem — apenas stubs no roadmap.
