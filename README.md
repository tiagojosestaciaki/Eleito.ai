# elleito.ai

**Plataforma de inteligência eleitoral estratégica — foco Paraná (Brasil).**

Dashboard em tempo real + chat copiloto de IA, alimentados por dados oficiais do TSE, IBGE e monitoramento de menções em imprensa regional e redes.

> Este repositório está na **Fase 0 — Fundação**: apenas estrutura e documentação. Sem código de aplicação ainda.

## Documentação principal

| Documento | Conteúdo |
|-----------|----------|
| [PROJECT.md](./PROJECT.md) | Visão, público, pilares e diferenciais |
| [ROADMAP.md](./ROADMAP.md) | Fases 1 → 5 com critérios de saída |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Diagrama e fluxos técnicos |
| [DATA_MODEL.md](./DATA_MODEL.md) | Schema Postgres proposto |
| [.env.example](./.env.example) | Template de variáveis de ambiente |

## Estrutura do Repositório

```
elleito.ai/
├── web/                 # Frontend Next.js 14 (App Router + TS)
├── ingestion/           # Scripts Python de ETL (TSE, IBGE, menções)
├── supabase/
│   ├── migrations/      # Migrations SQL versionadas
│   └── schemas/         # Schemas de referência
├── docs/                # Documentação estendida, ADRs, diagramas
├── .env.example         # Template de variáveis de ambiente
├── PROJECT.md
├── ROADMAP.md
├── ARCHITECTURE.md
├── DATA_MODEL.md
└── README.md
```

## Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, react-leaflet, recharts
- **Backend:** Supabase (Postgres + Auth + Realtime + Storage)
- **ETL:** Python 3.11, basedosdados, pandas, httpx
- **IA:** Claude API (Sonnet 4 para chat, Haiku para lote)
- **Hospedagem:** Vercel (web) + Supabase Cloud (backend)

## Pré-requisitos (setup local)

Serão necessários quando o código entrar:

- **Node.js 20+** e **pnpm 9+** (ou npm)
- **Python 3.11+** e **uv** ou **pip**
- **Conta Supabase** (plano Free já suporta o dev)
- **Conta Anthropic** com acesso à Claude API
- **Projeto GCP** com BigQuery habilitado (para Base dos Dados)
- **Supabase CLI** para migrations: `brew install supabase/tap/supabase`
- **Git 2.40+**

## Setup (quando o código estiver disponível)

```bash
# 1. Clonar o repositório
git clone git@github.com:tiagojosestaciaki/eleito.ai.git
cd eleito.ai

# 2. Copiar e preencher variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves reais

# 3. Subir projeto Supabase local (Fase 1 em diante)
cd supabase
supabase start
supabase db push

# 4. Instalar dependências do frontend (Fase 2 em diante)
cd ../web
pnpm install
pnpm dev
# Acesse http://localhost:3000

# 5. Configurar ingestão Python (Fase 1)
cd ../ingestion
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scripts/etl_tse_historico.py --year 2022
```

Todos os comandos acima são projeções — serão implementados conforme o roadmap avança. Esta é a referência para quando cada fase for liberada.

## Branches e Contribuição

- `main` — branch estável (pós-MVP)
- `claude/*` — branches geradas por assistentes de IA durante desenvolvimento
- `feature/*` — branches manuais de feature

Cada mudança relevante passa por PR com revisão antes de merge.

## Licença

Proprietário — todos os direitos reservados.  
O uso dos dados públicos do TSE e IBGE respeita as licenças originais de cada fonte.

## Contato

- Produto: Tiago José Staciaki
- Repositório: [tiagojosestaciaki/eleito.ai](https://github.com/tiagojosestaciaki/eleito.ai)
