# Roadmap — elleito.ai

Este roadmap descreve as fases de desenvolvimento do elleito.ai, da fundação de dados até a comercialização em escala. Cada fase tem objetivos, entregáveis e critérios de saída bem definidos — uma fase só é considerada concluída quando seus critérios de saída forem validados.

---

## Fase 1 — Fundação de Dados (4–6 semanas)

**Objetivo:** ter um banco de dados robusto, limpo e consultável com todo o histórico eleitoral do Paraná 2016–2024, junto com as geometrias e indicadores socioeconômicos.

### Entregáveis
- Projeto Supabase provisionado (dev + staging)
- Schema Postgres implementado via migrations versionadas
- Scripts Python de ingestão (ETL) para:
  - **TSE histórico** via Base dos Dados (BigQuery) — 2016, 2018, 2020, 2022, 2024
  - **Geometrias IBGE** dos 399 municípios do PR
  - **Indicadores IBGE** (PIB municipal, população, IDH, escolaridade)
- Testes de qualidade de dados (linhas esperadas, integridade referencial, cobertura municipal 100%)
- Documentação dos pipelines (README em `/ingestion`)
- Row Level Security (RLS) aplicado nas tabelas sensíveis

### Critérios de saída
- [ ] Consulta `SELECT COUNT(*) FROM results_municipality` retorna dados para todos os 399 municípios × todos os cargos × todos os anos
- [ ] Geometrias carregadas e validadas visualmente
- [ ] ETL roda end-to-end em < 30 min
- [ ] Nenhuma FK órfã ou município sem match

---

## Fase 2 — Dashboard Público (5–7 semanas)

**Objetivo:** entregar a primeira versão funcional do dashboard web, com autenticação, mapa interativo e gráficos históricos — sem chat copiloto ainda.

### Entregáveis
- Scaffolding Next.js 14 (App Router) configurado em `/web`
- Supabase Auth integrado (email + magic link, Google OAuth)
- **Dashboard principal** com:
  - Mapa coroplético do PR (react-leaflet) com filtros por eleição, cargo, turno e partido
  - Painel de resultados do município selecionado
  - Gráficos de série histórica (recharts)
  - Busca de candidatos e partidos
- Design system baseado em shadcn/ui + tema visual consistente
- Layout responsivo (desktop + tablet; mobile como bonus)
- Deploy em Vercel com domínio `app.elleito.ai` (staging)

### Critérios de saída
- [ ] Usuário consegue criar conta, logar, abrir o mapa e filtrar por eleição
- [ ] Performance: TTI < 3s em conexão 4G, mapa renderiza < 1s após filtro
- [ ] Lighthouse ≥ 85 em Performance, Acessibilidade e SEO
- [ ] Zero erros críticos em produção por 7 dias

---

## Fase 3 — Chat Copiloto com IA (4–5 semanas)

**Objetivo:** adicionar o copiloto conversacional, permitindo que usuários façam perguntas em linguagem natural e obtenham respostas com base nos dados do banco.

### Entregáveis
- Integração com **Claude API** (Sonnet 4)
- **Function calling** com as seguintes ferramentas:
  - `query_results(year, role, region, filters)` — consulta resultados eleitorais
  - `get_municipality_profile(ibge_code)` — perfil completo de um município
  - `compare_elections(year_a, year_b, role, region)` — comparação entre duas eleições
  - `get_candidate_history(candidate_id)` — histórico do candidato
  - `search_mentions(query, date_range)` — busca em menções (após Fase 4)
- Renderização rica de respostas (tabelas, gráficos embutidos, mapas pontuais)
- Histórico de conversas persistido por usuário
- Limites de uso por plano (rate limiting via Supabase Edge Functions)
- Observabilidade: log de chamadas LLM, custo por usuário, latência P50/P95

### Critérios de saída
- [ ] 20 prompts de avaliação (golden set) produzem respostas corretas e com dados reais
- [ ] Custo médio por mensagem < R$ 0,30
- [ ] Latência P95 < 8s para respostas com function calling

---

## Fase 4 — Monitoramento de Menções (4–6 semanas)

**Objetivo:** cruzar dados eleitorais com narrativa pública — menções em imprensa regional do PR e redes sociais.

### Entregáveis
- Scheduler (cron) de coleta de menções
  - Imprensa regional do PR (lista curada de ~30 veículos)
  - Feeds RSS e scraping ético (respeitando robots.txt)
  - Redes sociais via APIs oficiais onde disponível
- Pipeline de classificação em **Claude Haiku** (sentimento, entidades, tópicos)
- Tabela `mentions` alimentada e indexada (full-text search em PT-BR)
- Painel de menções no dashboard:
  - Volume diário/semanal
  - Sentimento agregado
  - Top veículos e autores
  - Nuvem de tópicos e entidades
- Integração ao chat copiloto (ferramenta `search_mentions`)

### Critérios de saída
- [ ] ≥ 500 menções/dia coletadas e classificadas
- [ ] Precisão de classificação de sentimento ≥ 80% em amostra manual
- [ ] Custo de classificação < R$ 0,01 por menção

---

## Fase 5 — Comercialização (contínua)

**Objetivo:** transformar o MVP em negócio, com onboarding, cobrança, suporte e crescimento.

### Entregáveis
- **Planos de assinatura** definidos e implementados:
  - Essencial (dashboard + histórico), Pro (+ copiloto), Enterprise (+ menções + API)
- **Integração de pagamentos** (Stripe ou gateway BR — Pagar.me/Asaas)
- **Onboarding guiado** no primeiro login
- **Landing page pública** (`elleito.ai`) com copy de vendas
- Materiais comerciais (deck, vídeo demo, casos de uso)
- **Programa beta fechado** com 10 usuários selecionados (3 meses grátis)
- Política de privacidade, termos de uso e LGPD compliance
- Painel administrativo interno (gestão de contas, métricas de uso)
- Suporte: chat in-app, base de conhecimento, SLA por plano

### Critérios de saída (go-to-market)
- [ ] 10 contas pagantes ativas
- [ ] Churn mensal < 5%
- [ ] NPS ≥ 40
- [ ] MRR ≥ R$ 10.000

---

## Dependências Temporais

```
Fase 1 ─► Fase 2 ─► Fase 3 ─► Fase 4 ─► Fase 5
 (dados)  (dash)    (chat)    (mencões) (GTM)
```

A Fase 4 pode parcialmente paralelizar com a Fase 3 após o chat básico estar funcional. A Fase 5 começa em paralelo já no meio da Fase 2 (landing page, conversas com potenciais beta).

## Fora do roadmap inicial (backlog)

- Expansão para Santa Catarina e Rio Grande do Sul
- Módulo de predição eleitoral (requer maturidade estatística e disclaimers legais)
- API pública para terceiros
- App mobile nativo
- Integração com sistemas de gestão de campanha
- Análise de debates (transcrição + NLP)
