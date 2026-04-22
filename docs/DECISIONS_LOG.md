# Decisions Log — elleito.ai

Este documento registra **decisões arquiteturais significativas** (ADRs — Architecture Decision Records) do projeto elleito.ai. Uma ADR é criada quando uma decisão altera o produto de forma não trivial e queremos preservar o **contexto** que levou à escolha para revisão futura.

## Formato

Cada ADR tem: **Status**, **Data**, **Contexto**, **Decisão**, **Consequências**. ADRs anteriores não devem ser editadas — se uma decisão é revista, uma nova ADR é criada referenciando a anterior (`Supersedes: ADR-XYZ`).

---

## ADR-001 — Escopo histórico inclui todos os cargos e vereadores

**Status:** Aceito  
**Data:** 2026-04-21

### Contexto

Durante o planejamento da Fase 1 (Fundação de Dados), foi levantada a dúvida sobre quais cargos eleitorais incluir na carga histórica inicial. O trade-off é:

- **Incluir vereadores** nas eleições municipais de 2016, 2020 e 2024 aumenta significativamente o volume da tabela `candidates` (estimado em ~150k linhas somente para o Paraná, considerando candidaturas a vereador em 399 municípios). Isso também aumenta o tempo de ETL e o custo de storage no Supabase.
- **Excluir vereadores** simplificaria a carga inicial, mas deixaria de fora o dado mais granular e politicamente sensível para candidatos a **prefeito**, **deputado estadual** e **federal**, que dependem da base capilar de vereadores e suas regiões de influência.

Nenhuma plataforma regional concorrente cruza bem o dado de vereadores com indicadores municipais — isso é parte do **fosso competitivo** do elleito.ai.

### Decisão

Incluir **todos os cargos** nas eleições 2016, 2018, 2020, 2022 e 2024 do Paraná:

- **Majoritárias:** presidente, governador, senador, prefeito
- **Proporcionais:** deputado federal, deputado estadual, vereador

Priorizar **qualidade dos dados** sobre otimização prematura. Volume estimado de ~150k linhas é perfeitamente tratável em Postgres com índices adequados.

### Consequências

**Positivas**
- Produto se diferencia pela granularidade regional
- Chat copiloto (Fase 3) pode responder perguntas sobre coligações locais e bases municipais
- Permite análise de "pipeline político" (vereador → prefeito → deputado)

**Negativas / Atenção**
- ETL da Fase 1 será mais pesado; esperar ~20–30 min para carga completa via Base dos Dados
- Tabelas `candidates`, `results_municipality` e `results_zone` precisarão de índices bem pensados desde o início
- Interface do dashboard precisa prever filtro de cargo proeminente (Fase 2)

---

## ADR-002 — Não persistir dados pessoais sensíveis de candidatos no MVP

**Status:** Aceito  
**Data:** 2026-04-21

### Contexto

O TSE publica, junto com os candidatos, uma série de informações pessoais: **CPF**, **data de nascimento**, **endereço**, **bens declarados**, **escolaridade** e **ocupação**. Embora sejam **dados públicos**, armazená-los na plataforma aumenta significativamente a **superfície de responsabilidade LGPD**:

- Exige política de privacidade formal e termo de uso detalhado já no MVP
- Cria obrigações de notificação em caso de incidente de segurança
- Candidatos (ou ex-candidatos) podem solicitar remoção/correção com base em direitos LGPD
- A classificação como "dado público" **não isenta** o operador do dever de tratamento adequado

No MVP, não há caso de uso claro que justifique armazenar esses campos — as análises da Fase 1 e 2 funcionam perfeitamente com chaves de identificação técnica e metadados eleitorais.

### Decisão

**Remover do schema inicial** os seguintes campos em `candidates`:

- `cpf`
- `birth_date`
- `declared_assets`
- `education`
- `occupation`
- `address` (nunca esteve, mas reforçando que não entra)
- `race` / `gender` (ficam **fora** do MVP, podem voltar como demografia agregada em análise futura)

**Manter** apenas:

- `tse_id` (SQ_CANDIDATO — identificador técnico do TSE, já público)
- `name` (nome completo)
- `ballot_name` (nome de urna)
- `ballot_number` (número na urna)
- `party`, `coalition`
- `role` (cargo)
- `status` (deferido/indeferido/renúncia — situação da candidatura)
- Referência à eleição (`election_id`)

### Consequências

**Positivas**
- MVP com risco LGPD drasticamente menor
- Time-to-market mais rápido (não precisamos de política de privacidade formal sofisticada para Fase 1)
- Eventual pedido de remoção afeta apenas a tabela `mentions` (Fase 4)

**Negativas / Atenção**
- Algumas análises ricas (ex.: "candidatos com mais bens declarados venceram mais?") ficam **fora do escopo inicial**
- Se esses campos forem necessários no futuro, será necessário: (a) ADR nova explicando o caso de uso, (b) política de privacidade revisada, (c) migration adicionando os campos com criptografia/tokenização apropriada
- Documentar explicitamente nos scripts de ETL que esses campos **não devem ser carregados**, mesmo que estejam disponíveis na fonte

---

## ADR-003 — Planos de assinatura flexíveis via feature flags por organização

**Status:** Aceito  
**Data:** 2026-04-21

### Contexto

O planejamento inicial previa quatro planos fixos (`free`, `essential`, `pro`, `enterprise`), com Row Level Security gating baseado em `users.plan`. Esse modelo cria dois problemas:

1. **Rigidez prematura:** os tiers finais só serão conhecidos após conversar com os primeiros 5–10 clientes piloto. Travar agora gera retrabalho de schema e lógica em ~3 meses.
2. **Granularidade insuficiente:** durante o período de validação, é útil liberar features específicas para clientes específicos (ex.: "cliente X tem acesso ao chat mas não às menções") sem precisar criar um plano novo.

Além disso, o modelo atual não tinha uma entidade clara de **organização** — um mandato, campanha ou partido costuma ter múltiplos usuários (chefe de gabinete, assessor de dados, candidato), que devem compartilhar dados e permissões.

### Decisão

Substituir o modelo `users.plan` rígido por uma estrutura flexível em três partes:

**a) Tabela `organizations`** — nova entidade que agrupa usuários pertencentes a um mesmo mandato, campanha ou diretório partidário:

```sql
organizations (
  id uuid PK,
  name text,
  slug text UNIQUE,
  created_at, updated_at
)
```

**b) Campo `users.plan TEXT`** — valores livres, ainda indefinidos. Serve apenas para classificação contábil/comercial; **não é usado em lógica de autorização**.

**c) Tabela `feature_flags`** — liberação granular por organização:

```sql
feature_flags (
  id uuid PK,
  organization_id uuid FK → organizations,
  feature_name text,  -- ex.: 'chat_copilot', 'mentions_monitor', 'trends_alerts'
  enabled boolean DEFAULT false,
  limits jsonb,       -- ex.: {"monthly_queries": 500}
  created_at, updated_at,
  UNIQUE (organization_id, feature_name)
)
```

**d) RLS básico agora:** usuário autenticado só enxerga dados da própria organização. **Sem gating por plano.** Gating por feature ocorre no **nível da aplicação** consultando `feature_flags`.

### Consequências

**Positivas**
- Plataforma pronta para pricing experimental — podemos ligar/desligar features por cliente sem migrations
- Modelo de organização já nasce pronto para uso multi-usuário (comum em mandatos/campanhas)
- RLS simples e claro: "sua organização × dados públicos eleitorais"
- Facilita futuras integrações (ex.: SSO por organização)

**Negativas / Atenção**
- Lógica de feature gating fica na aplicação (Edge Functions, middleware Next.js) em vez de apenas no SQL — requer cuidado para não vazar features não autorizadas em rotas mal protegidas
- Tabela `feature_flags` precisa ser pequena e rápida (cache por request recomendado) porque será consultada em quase todas as rotas protegidas
- Precisamos definir, em código, a lista canônica de `feature_name` válidos (provavelmente via enum TypeScript compartilhado)

---

## Índice rápido

| ADR | Título | Data | Status |
|-----|--------|------|--------|
| 001 | Escopo histórico inclui todos os cargos | 2026-04-21 | Aceito |
| 002 | Não persistir dados pessoais sensíveis no MVP | 2026-04-21 | Aceito |
| 003 | Planos flexíveis via feature flags por organização | 2026-04-21 | Aceito |
