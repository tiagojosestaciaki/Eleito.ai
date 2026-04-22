# Roadmap — elleito.ai

Este roadmap descreve as fases de desenvolvimento do elleito.ai, de dados brutos a operação comercial. Cada fase tem **objetivo**, **entregáveis** e **critérios de saída** — uma fase só é considerada concluída quando seus critérios forem validados.

O produto tem **[cinco pilares](./PROJECT.md#pilares-do-produto)**. As fases 1–2 constroem a fundação comum; as fases 3–6 implementam cada pilar; a fase 7 leva à monetização.

```
Fase 1 ─► Fase 2 ─► Fase 3 ─► Fase 4 ─► Fase 5 ─► Fase 6 ─► Fase 7
 dados    dash      chat      menções   tendên.   crise     GTM
```

Paralelismo possível: a **Fase 7** (landing, conversas de venda, termos) começa em paralelo já no meio da Fase 2. A **Fase 4** pode rodar em paralelo com Fase 3 após o chat básico estar estável.

---

## Fase 1 — Fundação de Dados (4–6 semanas)

**Objetivo:** banco Postgres limpo e consultável com todo o histórico eleitoral do Paraná 2016–2024 (todos os cargos, inclusive vereador — ADR-001), geometrias municipais e indicadores socioeconômicos.

### Entregáveis
- Projeto Supabase provisionado (dev + staging)
- Schema Postgres implementado via migrations versionadas (`/supabase/migrations/`)
- Scripts Python de ingestão em `/ingestion`:
  - **TSE histórico** via Base dos Dados (BigQuery) — candidatos, resultados por município e zona
  - **IBGE malhas** dos 399 municípios do PR
  - **IBGE indicadores** (população)
- Modelo de dados com `organizations`, `users`, `feature_flags` para suportar gating flexível (ADR-003)
- RLS aplicado: dados eleitorais abertos a autenticados; dados de conta escopados por organização
- Testes de qualidade (`elleito-etl checks`) como gate de CI

### Critérios de saída
- [ ] `select count(*) from municipalities where state='PR'` = **399**
- [ ] `select count(*) from results_municipality` retorna dados para **todos os 399 municípios × todos os cargos × todos os anos**
- [ ] Geometrias carregadas e validadas visualmente
- [ ] ETL end-to-end em < 30 min
- [ ] Zero FKs órfãs ou municípios sem match

---

## Fase 2 — Dashboard MVP (5–7 semanas)

**Objetivo:** primeira versão funcional do **Pilar 1 — Dashboard de Inteligência Regional**. Autenticação, mapa interativo e gráficos históricos, **sem copiloto**.

### Entregáveis
- Scaffolding Next.js 14 (App Router) configurado em `/web`
- Supabase Auth integrado (email + magic link, Google OAuth)
- **Dashboard principal** com:
  - Mapa coroplético do PR (react-leaflet), filtros por eleição/cargo/turno/partido
  - Painel de resultados do município selecionado
  - Gráficos de série histórica (recharts) 2016 → 2024
  - Busca de candidatos e partidos
- Design system com shadcn/ui + tema visual consistente
- Layout responsivo (desktop-first, tablet; mobile como bonus)
- Deploy em Vercel com domínio `app.elleito.ai` (staging)

### Critérios de saída
- [ ] Usuário cria conta, loga, abre mapa e filtra por eleição
- [ ] TTI < 3s em 4G; mapa renderiza < 1s após filtro
- [ ] Lighthouse ≥ 85 em Performance, Acessibilidade e SEO
- [ ] Zero erros críticos em produção por 7 dias

---

## Fase 3 — Chat Copiloto Estratégico (5–6 semanas)

**Objetivo:** implementar o **Pilar 2 — Chat Copiloto**. Perguntas em linguagem natural sobre o cenário eleitoral do PR, com respostas ancoradas em dados reais e no **contexto regional** via RAG.

### Entregáveis
- Integração com **Claude API** (Sonnet 4) via Edge Functions
- **Function calling** com ferramentas:
  - `query_results(year, role, region, filters)`
  - `get_municipality_profile(ibge_code)`
  - `compare_elections(year_a, year_b, role, region)`
  - `get_candidate_history(candidate_id)`
- **RAG de contexto regional** (tabela `regional_context` com pgvector):
  - Notas curadas sobre cada microrregião do PR (lideranças, pautas sensíveis, histórico)
  - Embeddings gerados e indexados (`vector` extension)
- Renderização rica de respostas (tabelas, gráficos embutidos, mapas pontuais)
- Histórico de conversas persistido por usuário (`chat_conversations` / `chat_messages`)
- Rate limiting e budget por organização via `feature_flags.limits`
- Observabilidade: log de chamadas LLM, custo por org, latência P50/P95
- **System prompts versionados** em `/prompts/chat/` (ver [docs/PROMPTS_STRATEGY.md](./docs/PROMPTS_STRATEGY.md))

### Critérios de saída
- [ ] Golden set de 20 prompts produz respostas corretas e com dados reais
- [ ] Custo médio por mensagem < R$ 0,30
- [ ] Latência P95 < 8s com function calling
- [ ] RAG recupera contexto regional relevante em 90%+ dos casos de teste

---

## Fase 4 — Coleta de Menções (4–6 semanas)

**Objetivo:** alimentar a base para os pilares 3 (tendências) e 5 (crise) — coletar menções em imprensa regional do PR e redes sociais, classificadas automaticamente.

### Entregáveis
- Scheduler (cron) de coleta:
  - Imprensa regional curada: **Gazeta do Povo, G1 PR, Bem Paraná, RIC Mais, Tribuna PR** + lista expansível
  - RSS feeds + **Playwright** para páginas com JS
  - **Instagram Graph API** e **YouTube Data API** para perfis políticos
  - Blogs políticos regionais (curadoria manual inicial)
- Pipeline de classificação em **Claude Haiku**:
  - Sentimento (`positive` / `neutral` / `negative` + score)
  - Entidades (pessoas, cargos, partidos, municípios)
  - Tópicos (taxonomia enxuta e expansível)
- Tabela `mentions` alimentada e indexada (full-text PT-BR)
- Deduplicação por URL + hash de conteúdo
- Respeito a robots.txt e User-Agent identificável
- Painel de menções no dashboard (volume, sentimento, top veículos, tópicos)
- Ferramenta adicional no chat: `search_mentions(query, date_range, region)`

### Critérios de saída
- [ ] ≥ 500 menções/dia coletadas e classificadas
- [ ] Precisão de sentimento ≥ 80% em amostra manual
- [ ] Custo de classificação < R$ 0,01 por menção
- [ ] Cobertura de todos os 10 maiores municípios do PR

---

## Fase 5 — Tendências e Alertas (4–5 semanas)

**Objetivo:** implementar o **Pilar 3 — Detector de Tendências com Alertas**. Monitorar o fluxo de menções, detectar aceleração anômala e notificar com contexto acionável.

### Entregáveis
- Job recorrente (cada N min) que calcula **baseline** por tópico + região (média móvel 30 dias)
- **Disparador**: crescimento > 150% em janela 24–48h (parâmetro por organização)
- Análise automática do alerta (Claude Sonnet):
  - Sentimento dominante
  - Atores citados
  - Canais de origem
  - Projeção de alcance
  - Recomendação inicial
- Tabela `alerts` com status (novo, visto, em_andamento, resolvido), ações tomadas
- **Notificações** configuráveis por organização:
  - Email transacional
  - WhatsApp via provedor BR (Zenvia/WATI)
  - Painel in-app
- Documentado em detalhe em [docs/TRENDS_DETECTION.md](./docs/TRENDS_DETECTION.md)

### Critérios de saída
- [ ] Alertas gerados reproduzíveis em uma crise histórica conhecida (backtest)
- [ ] Taxa de falso-positivo < 20% em amostra
- [ ] Notificação entregue em < 5 min da detecção
- [ ] Dashboard com timeline de alertas e status

---

## Fase 6 — Narrativas e Crise (6–8 semanas)

**Objetivo:** implementar os pilares 4 (narrativas) e 5 (crise) — os de **maior valor percebido**. Transformam o elleito.ai de "ferramenta analítica" em "consultor estratégico on-demand".

### Entregáveis

**Pilar 4 — Gerador de Narrativas Estratégicas**
- Fluxo guiado de input: contexto, região, perfil, objetivo
- Geração de **3 narrativas** (Claude Sonnet) com:
  - Público-alvo, canal, tom, exemplos de peças
  - Casos históricos comparáveis (RAG sobre `crisis_cases` e `narratives_generated`)
  - Riscos
  - Recomendação final com justificativa
- Tabela `narratives_generated` (input, output, ação tomada, resultado real quando disponível)
- System prompts versionados em `/prompts/narratives/`

**Pilar 5 — Contenção de Crise**
- Fluxo estruturado de input (descrição, categoria, ator, canal, alcance, posição)
- Diagnóstico automático (gravidade, vetor, janela de ação)
- **3 cenários de resposta** (assertiva / conciliadora / silêncio estratégico)
- Para cada cenário: **roteiro pronto**, canais, timing, riscos
- **Plano de acompanhamento 72h** com checkpoints
- Tabela `crisis_cases` (histórico por organização)
- Documentado em detalhe em [docs/CRISIS_FLOW.md](./docs/CRISIS_FLOW.md)
- System prompts versionados em `/prompts/crisis/`

### Critérios de saída
- [ ] 5 casos reais (piloto) analisados com cliente e resultado avaliado
- [ ] Tempo de diagnóstico de crise < 90s
- [ ] NPS da feature ≥ 60 com primeiros usuários

---

## Fase 7 — Comercialização (contínua, começa no meio da Fase 2)

**Objetivo:** transformar o produto em negócio — onboarding, cobrança, suporte e crescimento.

### Entregáveis
- **Planos de assinatura** finais (validados com primeiros clientes piloto) configurados como feature flags
- **Integração de pagamentos** (Stripe ou gateway BR — Asaas/Pagar.me)
- **Onboarding guiado** no primeiro login (setup de organização, feature flags)
- **Landing page pública** (`elleito.ai`) com copy de vendas e cases
- Materiais comerciais: deck, vídeo demo, estudos de caso
- **Programa beta fechado** com 5–10 usuários piloto (3 meses com desconto)
- Política de privacidade, termos de uso e **LGPD compliance** formais
- Painel administrativo interno (gestão de contas, métricas de uso, custo LLM)
- Suporte: chat in-app, base de conhecimento, SLA por plano

### Critérios de saída (go-to-market)
- [ ] 5–10 contas pagantes ativas
- [ ] Churn mensal < 5%
- [ ] NPS ≥ 40
- [ ] MRR ≥ R$ 15.000

---

## Backlog (fora do roadmap inicial)

- Expansão para **Santa Catarina** e **Rio Grande do Sul**
- Módulo de **predição probabilística** de resultados (requer maturidade estatística + disclaimers legais)
- **API pública** para terceiros
- App mobile nativo
- Integração com sistemas de gestão de campanha
- Análise de debates (transcrição + NLP)
- Módulo de **compliance eleitoral** / prestação de contas
