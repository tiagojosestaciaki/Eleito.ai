# elleito.ai — Plataforma de Inteligência Eleitoral Estratégica

## Visão Geral

**elleito.ai** é uma plataforma SaaS de inteligência eleitoral estratégica com foco inicial no estado do **Paraná (PR)**, Brasil. Seu propósito é transformar dados eleitorais históricos e em tempo real em decisões estratégicas acionáveis para candidatos, mandatários e organizações políticas.

O produto combina **análise quantitativa** (resultados do TSE, indicadores socioeconômicos do IBGE) com **análise qualitativa** (menções em imprensa regional e redes sociais), entregando tudo através de uma interface moderna composta por **dashboards interativos** e um **chat copiloto** baseado em IA.

## Proposta de Valor

Hoje, campanhas eleitorais no interior do Brasil tomam decisões baseadas em:
- Planilhas desatualizadas e dados espalhados em fontes isoladas
- Consultorias caras com entregas pontuais e estáticas
- Intuição e rede de contatos políticos, sem validação empírica

O elleito.ai oferece:
- **Acesso direto e contínuo** aos dados oficiais do TSE, já limpos, agregados e georreferenciados
- **Dashboard em tempo real** com mapas de calor, tendências regionais e evolução histórica por município e zona
- **Chat copiloto** que responde perguntas estratégicas em linguagem natural ("Quais municípios do norte do PR trocaram de espectro político nas últimas 3 eleições?", "Onde meu partido teve crescimento em 2022 vs 2018?")
- **Monitoramento de menções** em imprensa regional e redes, cruzando dados eleitorais com narrativa pública

## Público-Alvo

- **Deputados estaduais e federais** do Paraná (atuais e pré-candidatos)
- **Pré-candidatos** a prefeito, vereador e cargos executivos
- **Coordenadores de campanha** e consultorias políticas regionais
- **Diretórios partidários** estaduais e municipais do PR
- **Assessorias parlamentares** interessadas em dados de base eleitoral

## Pilares do Produto

### 1. Dashboard Real-Time

Interface visual interativa que reúne:
- **Mapa coroplético do Paraná** com resultados por município e zona eleitoral
- **Mapas de calor** de concentração de votos por candidato, partido ou coligação
- **Séries históricas** 2016 → 2024 para comparação temporal
- **Filtros multidimensionais**: por cargo, ano, turno, partido, faixa etária do eleitorado, perfil socioeconômico
- **Painel de menções**: volume, sentimento e principais veículos
- **Durante apuração oficial**: dados atualizados a cada ~60 segundos do feed público do TSE

### 2. Chat Copiloto

Assistente conversacional (baseado em **Claude Sonnet 4**) com acesso direto ao banco via **function calling**:
- Recebe perguntas em linguagem natural
- Consulta o banco de dados do elleito.ai com segurança (RLS aplicado)
- Retorna respostas textuais com visualizações embutidas (tabelas, gráficos, mapas)
- Aprende com contexto da sessão (qual candidato está sendo analisado, qual região etc.)
- Operações em escala (classificação de menções, sumarização em lote) usam **Claude Haiku** para custo otimizado

## Stack Técnico

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Visualização | react-leaflet (mapas), recharts (gráficos) |
| Backend | Supabase (Postgres + Auth + Realtime + Storage) |
| Ingestão ETL | Python 3.11, basedosdados (BigQuery), pandas, httpx |
| IA | Claude API (Sonnet 4 para chat, Haiku para lote) |
| Hospedagem | Vercel (web) + Supabase Cloud (backend) |

## Fontes de Dados

| Fonte | Uso | Frequência |
|-------|-----|------------|
| TSE via Base dos Dados (BigQuery) | Resultados históricos 2016–2024 PR | Carga inicial + anual |
| TSE JSON público (apuração) | Resultados em tempo real no dia da eleição | A cada ~60s no D-day |
| IBGE (malhas municipais) | Geometrias GeoJSON dos 399 municípios do PR | Carga única |
| IBGE (indicadores) | PIB, população, IDH, escolaridade | Anual |
| Imprensa regional + redes | Menções e narrativa pública | Diária (agendada) |

## Diferenciais Competitivos

1. **Foco regional profundo**: em vez de ser mais uma ferramenta genérica nacional, o elleito.ai nasce especialista no Paraná, com dados e fluxos pensados para a realidade local
2. **Copiloto conversacional**: democratiza análises complexas para quem não sabe SQL nem Excel avançado
3. **Dados oficiais + narrativa**: cruza o "o quê aconteceu" (TSE) com "como foi contado" (imprensa/redes)
4. **Preço acessível ao mercado regional**: consultorias equivalentes custam R$ 20k–50k por entrega pontual; o elleito.ai é assinatura mensal contínua

## Escopo e Exclusões (Fase 1)

**Está no escopo:**
- Estado do Paraná (399 municípios)
- Eleições majoritárias e proporcionais 2016–2024
- Web app responsivo (desktop-first, mobile otimizado)
- Portuguese (PT-BR) único idioma

**NÃO está no escopo inicialmente:**
- Outros estados brasileiros (expansão Fase 5+)
- Aplicativo nativo mobile
- Integrações com sistemas de gestão de campanha
- Módulo de compliance eleitoral / prestação de contas
- Predição/projeção de resultados (possível Fase 4 com disclaimers)

## Métricas de Sucesso (norte)

- **Fase Beta**: 10 usuários pagantes ativos (R$ 500–1.500/mês), NPS ≥ 40
- **12 meses**: 50 contas, cobertura de 100% dos municípios do PR com dados atualizados
- **24 meses**: expansão para mais 2 estados do Sul, 150 contas

## Próximos Passos

Ver **[ROADMAP.md](./ROADMAP.md)** para detalhamento das fases e **[ARCHITECTURE.md](./ARCHITECTURE.md)** para o desenho técnico.
