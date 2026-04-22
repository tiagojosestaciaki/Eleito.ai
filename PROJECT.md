# elleito.ai — Plataforma de Inteligência Eleitoral Estratégica

## Visão Geral

**elleito.ai** é uma plataforma SaaS de inteligência eleitoral estratégica com foco inicial no estado do **Paraná (PR)**, Brasil. Seu propósito é transformar dados eleitorais históricos, dados em tempo real e sinais de opinião pública em **decisões estratégicas acionáveis** para candidatos, mandatários, partidos e consultorias políticas.

O produto combina **análise quantitativa** (resultados do TSE, indicadores socioeconômicos do IBGE) com **análise qualitativa** (menções em imprensa regional e redes sociais), entregando tudo através de uma interface moderna composta por **dashboards interativos**, **chat copiloto baseado em IA**, **detecção automática de tendências**, **geração de narrativas estratégicas** e **módulo guiado de contenção de crise**.

## Proposta de Valor

Hoje, campanhas e mandatos no interior do Brasil tomam decisões baseadas em:

- Planilhas desatualizadas e dados espalhados em fontes isoladas
- Consultorias caras com entregas pontuais e estáticas (R$ 20k–50k por relatório)
- Intuição e rede de contatos políticos, sem validação empírica
- Reação tardia a crises que já tomaram proporção regional

O elleito.ai oferece:

- **Acesso direto e contínuo** aos dados oficiais do TSE, já limpos, agregados e georreferenciados
- **Dashboard em tempo real** com mapas de calor, tendências regionais e evolução histórica por município e zona
- **Chat copiloto** que responde perguntas estratégicas em linguagem natural
- **Monitoramento inteligente de menções** em imprensa regional e redes, com detecção automática de tópicos emergentes
- **Alertas antecipados de crise**, disparados antes que uma pauta viralize regionalmente
- **Recomendações de narrativa** fundamentadas em casos históricos comparáveis na região
- **Módulo de contenção de crise** com diagnóstico, cenários de resposta e roteiros prontos

## Público-Alvo

- **Deputados estaduais e federais** do Paraná (atuais e pré-candidatos)
- **Pré-candidatos** a prefeito, vereador e cargos executivos
- **Coordenadores de campanha** e consultorias políticas regionais
- **Diretórios partidários** estaduais e municipais do PR
- **Assessorias parlamentares** interessadas em dados de base eleitoral
- **Gabinetes de prefeituras** preocupados com monitoramento de opinião pública

## Pilares do Produto

O elleito.ai se estrutura em **cinco pilares** integrados. Cada pilar entrega valor isoladamente, mas a força do produto está na sinergia entre eles: o dashboard alimenta o chat, o chat alimenta os alertas, os alertas alimentam as narrativas, e tudo converge no módulo de crise.

### Pilar 1 — Dashboard de Inteligência Regional

Interface visual interativa que reúne:

- **Mapa coroplético do Paraná** com resultados por município e zona eleitoral
- **Mapas de calor** de concentração de votos por candidato, partido ou coligação
- **Séries históricas** 2016 → 2024 para comparação temporal
- **Filtros multidimensionais**: por cargo, ano, turno, partido, perfil socioeconômico do eleitorado
- **Painel de menções**: volume, sentimento e principais veículos por região
- **Durante apuração oficial**: dados atualizados a cada ~60 segundos do feed público do TSE

### Pilar 2 — Chat Copiloto Estratégico

Assistente conversacional (baseado em **Claude Sonnet 4**) com acesso direto ao banco via **function calling**:

- Recebe perguntas em linguagem natural
- Consulta o banco de dados do elleito.ai com segurança (RLS aplicado)
- Retorna respostas textuais com visualizações embutidas (tabelas, gráficos, mapas)
- Aprende com contexto da sessão (qual candidato está sendo analisado, qual região etc.)
- Operações em escala (classificação de menções, sumarização em lote) usam **Claude Haiku** para custo otimizado

**Exemplos de perguntas que o copiloto resolve:**

- "Quais municípios do norte do PR trocaram de espectro político nas últimas 3 eleições?"
- "Onde meu partido teve crescimento em 2022 vs 2018?"
- "Compare o desempenho do deputado X com o Y na região metropolitana de Londrina"
- "Que perfil de candidato venceu historicamente em cidades abaixo de 20 mil habitantes no PR?"

### Pilar 3 — Detector de Tendências com Alertas

Monitoramento contínuo de menções em imprensa regional, redes sociais públicas e blogs políticos do Paraná, com detecção automática de **aceleração anômala de tópicos**.

**Lógica de detecção:**

- Baseline: volume médio de menções por tópico/região nos últimos 30 dias
- Disparador: crescimento superior a 150% em janela de 24-48h
- Análise automática: sentimento dominante, atores citados, canais de origem, projeção de alcance
- Notificação via email, WhatsApp e painel do dashboard

**Exemplo de alerta gerado automaticamente:**

> "Atenção: o termo 'posto de saúde fechado' teve crescimento de 340% nas menções em União da Vitória nas últimas 48h. Sentimento 78% negativo. Prefeito local citado em 62% dos casos. Janela crítica estimada: próximas 72h antes de viralizar regionalmente. Ver análise completa."

O valor aqui não é previsão mágica, é **detecção precoce com contexto acionável**.

### Pilar 4 — Gerador de Narrativas Estratégicas

Dado um cenário, oportunidade ou desafio político, o sistema sugere **três caminhos narrativos** fundamentados em casos históricos comparáveis na região, com evidência de resultado.

**Input do usuário:**

- Contexto da situação (texto livre)
- Região de aplicação
- Perfil do cliente (partido, cargo, posicionamento)
- Objetivo (ganhar aprovação, neutralizar oposição, lançar pauta etc.)

**Output do sistema:**

- 3 narrativas possíveis com justificativa estratégica
- Para cada narrativa: público-alvo, canal recomendado, tom de voz, exemplos de peças
- Casos históricos comparáveis (quando disponíveis na base regional)
- Riscos associados a cada caminho
- Recomendação final com justificativa

O diferencial é que cada sugestão vem **ancorada em dados** (perfil demográfico da região, comportamento eleitoral histórico), não em achismo de consultor.

### Pilar 5 — Contenção de Crise

Módulo **guiado** para análise rápida de crises políticas e recomendação de resposta estratégica. Esta é a feature de maior valor percebido do produto — um cliente que use uma vez e veja resultado dificilmente cancela.

**Fluxo estruturado de input:**

1. Descrição do problema (texto livre)
1. Categoria da crise (administrativa, pessoal, política, imprensa, judicial, redes sociais)
1. Ator da crise (oposição, imprensa, cidadão comum, órgão de controle, ex-aliado)
1. Canal principal de propagação
1. Alcance estimado atual
1. Posição política do cliente e histórico recente

**Output estruturado:**

- **Diagnóstico da crise**: gravidade (baixa/média/alta/crítica), vetor de expansão, janela de ação estimada
- **3 cenários de resposta**:
  - Responder de forma assertiva
  - Responder de forma conciliadora
  - Não responder publicamente (silêncio estratégico com ação de campo)
- Para cada cenário: **roteiro pronto de resposta**, canais recomendados, timing ideal, riscos envolvidos
- **Recomendação final** com justificativa estratégica
- **Plano de acompanhamento** nas próximas 72h com checkpoints

## Stack Técnico

|Camada         |Tecnologia                                                            |
|---------------|----------------------------------------------------------------------|
|Frontend       |Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui          |
|Visualização   |react-leaflet (mapas), recharts (gráficos)                            |
|Backend        |Supabase (Postgres + Auth + Realtime + Storage + pgvector)            |
|Ingestão ETL   |Python 3.11, basedosdados (BigQuery), pandas, httpx, playwright       |
|IA             |Claude API (Sonnet 4 para chat e análise estratégica, Haiku para lote)|
|Hospedagem     |Vercel (web) + Supabase Cloud (backend) + Railway/Render (jobs Python)|
|Observabilidade|Sentry (erros), PostHog (produto), Supabase Logs (backend)            |

## Fontes de Dados

|Fonte                            |Uso                                                                   |Frequência           |
|---------------------------------|----------------------------------------------------------------------|---------------------|
|TSE via Base dos Dados (BigQuery)|Resultados históricos 2016–2024 PR                                    |Carga inicial + anual|
|TSE JSON público (apuração)      |Resultados em tempo real no dia da eleição                            |A cada ~60s no D-day |
|IBGE (malhas municipais)         |Geometrias GeoJSON dos 399 municípios do PR                           |Carga única          |
|IBGE (indicadores)               |PIB, população, IDH, escolaridade, Censo 2022                         |Anual                |
|Imprensa regional PR             |Gazeta do Povo, G1 PR, Bem Paraná, RIC Mais, Tribuna PR, rádios locais|Diária (agendada)    |
|Redes sociais públicas           |Instagram Graph API, YouTube Data API (perfis políticos)              |Diária               |
|Blogs políticos regionais        |Curadoria manual inicial, expansão contínua                           |Diária               |

## Ativo Estratégico: Prompts e Contexto Regional

Três ativos não-óbvios diferenciam o elleito.ai de qualquer concorrente que tente replicar o stack:

1. **System prompts versionados** — A qualidade das análises estratégicas (pilares 2, 4 e 5) depende diretamente da qualidade dos prompts que codificam experiência política real. Esses prompts vivem em `/prompts` e são tratados como código: versionados, revisados e testados.
1. **Base de conhecimento regional** — Contexto político de cada microrregião do PR (quem governa, histórico de crises, pautas sensíveis, lideranças locais). Alimentada manualmente no início, enriquecida continuamente. Armazenada com pgvector para uso em RAG.
1. **Histórico de casos reais** — Cada análise de crise, cada narrativa recomendada e seu resultado real alimentam o sistema. Quanto mais uso, mais inteligente o produto fica.

## Diferenciais Competitivos

1. **Foco regional profundo**: em vez de ser mais uma ferramenta genérica nacional, o elleito.ai nasce especialista no Paraná, com dados e fluxos pensados para a realidade local
1. **Cinco pilares integrados**: do dado histórico à resposta de crise, tudo em uma só plataforma
1. **Copiloto conversacional**: democratiza análises complexas para quem não sabe SQL nem Excel avançado
1. **Dados oficiais + narrativa**: cruza o "o quê aconteceu" (TSE) com "como foi contado" (imprensa/redes)
1. **Experiência política real codificada**: o produto não é construído por engenheiros aprendendo política, é construído por estrategista político aplicando IA
1. **Preço acessível ao mercado regional**: consultorias equivalentes custam R$ 20k–50k por entrega pontual; o elleito.ai é assinatura mensal contínua

## Escopo e Exclusões (Fase 1)

**Está no escopo:**

- Estado do Paraná (399 municípios)
- Eleições majoritárias e proporcionais 2016–2024
- Todos os cargos (vereador, prefeito, deputado estadual, deputado federal, senador, governador)
- Web app responsivo (desktop-first, mobile otimizado)
- Português (PT-BR) único idioma

**NÃO está no escopo inicialmente:**

- Outros estados brasileiros (expansão futura para SC e RS)
- Aplicativo nativo mobile
- Integrações com sistemas de gestão de campanha
- Módulo de compliance eleitoral / prestação de contas
- Predição probabilística de resultados (possível em fase futura com disclaimers apropriados)
- Armazenamento de dados pessoais sensíveis de candidatos (CPF, endereço, bens declarados) — ver ADR-002 em `/docs/DECISIONS_LOG.md`

## Modelo de Negócio

Planos são **hipótese a ser validada** com os primeiros clientes. Por isso, a modelagem técnica de permissões usa `feature_flags` granular, não tiers fixos (ver ADR-003 em `/docs/DECISIONS_LOG.md`).

**Direcionais iniciais (sujeitos a validação):**

- **Plano Essencial** (~R$ 1.500/mês): Dashboard + chat copiloto com limite de perguntas
- **Plano Profissional** (~R$ 3.500/mês): + alertas de tendência + gerador de narrativas
- **Plano Estratégico** (~R$ 6.500/mês): + contenção de crise ilimitada + consultoria mensal
- **Licença partidária/campanha** (a partir de R$ 25.000/ciclo eleitoral)

## Métricas de Sucesso (norte)

- **Fase Beta**: 5–10 usuários pagantes ativos (R$ 1.500–3.500/mês), NPS ≥ 40
- **12 meses**: 20–30 contas ativas, cobertura de 100% dos municípios do PR com dados atualizados, receita mensal ≥ R$ 60k
- **24 meses**: expansão para SC e RS, 100+ contas, receita mensal ≥ R$ 150k

## Princípios de Desenvolvimento

1. **Planejar antes de codar** — Todo novo módulo começa com documento de especificação
1. **Documentar em português** — É a língua do produto e do time
1. **Versão mínima viável sempre primeiro** — Entregar valor antes de polir
1. **Dados são o ativo** — Investir em qualidade de dados mais que em features
1. **Prompts são código** — Tratar system prompts com versionamento e testes
1. **Cliente é co-criador** — Primeiros 5 clientes ajudam a definir o roadmap final

## Próximos Passos

Ver **[ROADMAP.md](./ROADMAP.md)** para detalhamento das fases, **[ARCHITECTURE.md](./ARCHITECTURE.md)** para o desenho técnico e **[docs/DECISIONS_LOG.md](./docs/DECISIONS_LOG.md)** para o histórico de decisões arquiteturais (ADRs).
