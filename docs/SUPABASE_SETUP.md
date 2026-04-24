# Supabase Setup — Primeira rodada do `pnpm dev`

Este é o passo-a-passo **exato** para fazer o dashboard subir localmente com o mapa completo do Paraná pela primeira vez, depois da Etapa 4 da Fase 2. Se você está seguindo o roadmap na ordem, é aqui.

Você tem dois caminhos:

- **[Caminho A — Supabase Cloud](#caminho-a--supabase-cloud-recomendado-para-primeira-tentativa)** (recomendado)
- **[Caminho B — Supabase local via Docker](#caminho-b--supabase-local-via-docker)** (alternativa offline)

Ambos terminam com `pnpm dev` servindo o dashboard com os 399 municípios coloridos. Faça um e ignore o outro.

---

## Caminho A — Supabase Cloud (recomendado para primeira tentativa)

### 1. Criar o projeto

1. Entre em https://supabase.com/dashboard e crie um projeto novo (plano Free serve)
2. Região: **South America (São Paulo)** — latência menor pro BR
3. Anote a senha do banco e a **Project Reference** (algo como `xyzabcdefghijklmn`)

### 2. Aplicar as migrations

Via **Supabase CLI** (jeito limpo e reprodutível):

```bash
# instalar a CLI se não tiver
brew install supabase/tap/supabase    # macOS
# ou: https://github.com/supabase/cli/releases

# autenticar
supabase login

# linkar o repo ao projeto
cd ~/caminho/para/Eleito.ai
supabase link --project-ref <sua-project-ref>

# aplicar todas as migrations em supabase/migrations/
supabase db push
```

Isso aplica, na ordem, as 14 migrations (12 de schema da Fase 1 + 2 de seed mock da Fase 2 · Etapa 4). Ao final você tem:

- 8 tabelas (organizations, users, feature_flags, elections, candidates, municipalities, results_municipality, results_zone)
- 23 eleições seedadas (PR 2016→2024, todos os cargos)
- **399 municípios** do PR em `municipalities`
- **399 linhas** em `results_municipality` (1 candidato mock × 399 municípios)
- RLS ativo em todas as tabelas
- Organização de dev já criada pelo `supabase/seed.sql` (id `00000000-0000-0000-0000-000000000001`)

**Sanidade rápida** (SQL Editor do Supabase):

```sql
select count(*) from public.municipalities;          -- 399
select count(*) from public.results_municipality;    -- 399
select count(*) from public.candidates;              -- 1
select id, year, role from public.elections
 where year=2022 and round=1 and role='deputado_estadual';  -- retorna 1 linha
```

### 3. Criar um usuário de teste

**Passo 3.1** — Criar a conta no Auth.

Supabase Dashboard → **Authentication → Users → Add user → Create new user**:

- Email: `dev@elleito.ai` (ou o que preferir)
- Password: algo memorável
- ✅ **Auto Confirm User** (marque isso — sem confirmação por email)

Copie o UUID gerado.

**Passo 3.2** — Criar a linha espelho em `public.users`.

Supabase Dashboard → **SQL Editor**:

```sql
insert into public.users (id, organization_id, email, full_name, role)
values (
  '<uuid-copiado-do-passo-3.1>',
  '00000000-0000-0000-0000-000000000001',  -- org dev seedada
  'dev@elleito.ai',
  'Dev elleito',
  'owner'
);
```

> **Por que isso é manual?** O trigger automático de `auth.users` → `public.users` entra na Fase 7 (onboarding). Por enquanto, criar manualmente é explícito e evita mágica de trigger falhando em silêncio.

### 4. Pegar as chaves da API

Supabase Dashboard → **Project Settings → API**. Copie:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

⚠️ **NÃO use a `service_role` key no `web`** — ela bypassa RLS.

### 5. Configurar o `.env.local` do web

```bash
cd web
cp .env.example .env.local
```

Edite `web/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xyzabcdefghijklmn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Rodar o web

```bash
cd web
pnpm install           # primeira vez apenas
pnpm dev
```

Abra http://localhost:3000.

### 7. O que você deve ver

1. `/` redireciona para `/dashboard`
2. Middleware detecta sem sessão → redireciona para `/login?next=/dashboard`
3. Logue com `dev@elleito.ai` + senha
4. Chega em `/dashboard`
5. Mapa carrega os 399 municípios do PR, coloridos em 5 tons de laranja
6. Legenda no canto inferior esquerdo mostra o badge **DB** (verde) — confirma que os dados vieram do Supabase
7. Se o badge mostrar **MOCK** amarelo/vermelho: veja o console do browser — provavelmente RLS ou env var

---

## Caminho B — Supabase local via Docker

Quando você não quer depender de rede/cloud.

### 1. Docker up

```bash
cd ~/caminho/para/Eleito.ai
supabase start
```

Isso sobe Postgres + Auth + Studio em containers. Pega ~5min na primeira vez.

### 2. Aplicar migrations + seed

```bash
supabase db reset
```

Esse comando dropa o banco local, reaplica **todas** as migrations em `supabase/migrations/` na ordem, e executa `supabase/seed.sql`. Resultado: mesma base do Caminho A, mas em `localhost`.

### 3. Usuário de teste

```bash
# pega o UUID gerado para seu usuário de teste
supabase auth users create dev@elleito.ai --password senha123 --confirm
# Copie o UUID retornado.

# espelha em public.users
psql "$(supabase status -o env | grep DB_URL | cut -d= -f2-)" <<SQL
insert into public.users (id, organization_id, email, full_name, role)
values ('<uuid>', '00000000-0000-0000-0000-000000000001', 'dev@elleito.ai', 'Dev', 'owner');
SQL
```

### 4. Pegar as URLs locais

```bash
supabase status
```

Anote:

- `API URL` (tipicamente `http://127.0.0.1:54321`) → `NEXT_PUBLIC_SUPABASE_URL`
- `anon key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. Configurar `.env.local` e rodar

Igual ao Caminho A, passos 5–7. Tudo local, zero cloud.

---

## Checklist "funciona"

- [ ] `select count(*) from municipalities` retorna 399
- [ ] `select count(*) from results_municipality` retorna 399
- [ ] Login com o usuário de teste funciona (redireciona pro `/dashboard`)
- [ ] Mapa renderiza todos os municípios coloridos (não só 20)
- [ ] Badge da legenda mostra **DB** verde
- [ ] Hover em Curitiba mostra percentual destacado em laranja e "~103.200 votos" (ou similar)

Se qualquer item falhar, abra o console do browser — o hook `useElectionResults` loga `[useElectionResults] falha ao consultar Supabase, usando mock: <motivo>` com o erro específico.

## Quando o ETL real entrar

O seed mock (`20260424120000` e `20260424120100`) é **idempotente** (`on conflict do update`). Quando `elleito-etl load-all` rodar:

1. `elleito-etl ibge geometries` substitui `region`, adiciona `geom`, `centroid`, `population` nos 399 municípios
2. `elleito-etl tse candidates` insere candidatos reais (milhares)
3. `elleito-etl tse results-municipality` insere resultados reais

Os dados mock ficam no banco como "uma candidatura MOCK 99 no meio das reais". Pra limpar quando quiser:

```sql
delete from public.results_municipality where candidate_id = 9999999001;
delete from public.candidates where tse_id = 9999999001;
```

As linhas em `municipalities` não precisam ser apagadas — o ETL real só completa campos vazios (region é `coalesce` com o existente, demais campos sobrescrevem).
