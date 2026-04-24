# Deploy — Vercel

Este documento descreve como subir o `/web` na Vercel. Estamos num monorepo — a raiz do projeto Vercel é **`web/`**, não a raiz do repositório.

## Pré-requisitos

- Conta na Vercel com acesso ao repositório `tiagojosestaciaki/eleito.ai`
- Projeto Supabase provisionado (ver [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- Migrations da Fase 1 + seeds da Etapa 4 da Fase 2 aplicados no Supabase

## Configuração do projeto Vercel

No dashboard da Vercel, ao criar o projeto:

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Next.js (detectado automaticamente) |
| **Root Directory** | `web` |
| **Build Command** | `next build` (padrão) |
| **Install Command** | `pnpm install` ou `npm install` (Vercel detecta o lockfile) |
| **Output Directory** | `.next` (padrão) |
| **Node.js Version** | 20.x |

`web/vercel.json` já fixa região `gru1` (São Paulo) para reduzir latência a usuários BR.

## Variáveis de ambiente

Definir em **Project → Settings → Environment Variables**, escopadas em `Production` + `Preview` + `Development`:

### Obrigatórias

| Variável | Valor | Observação |
|----------|-------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | Project Settings → API no Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` (JWT) | anon/public key — NUNCA usar service_role no web |

### Opcionais

| Variável | Valor padrão | Observação |
|----------|--------------|------------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Define como `https://app.elleito.ai` em produção |

### O que NÃO subir no web

- `SUPABASE_SERVICE_ROLE_KEY` — só ETL/admin, bypass de RLS
- `SUPABASE_DB_URL` — usada por Python ETL
- `ANTHROPIC_API_KEY` — só Edge Functions na Fase 3
- `BD_PROJECT_ID` / `GOOGLE_APPLICATION_CREDENTIALS` — só Python ETL
- `STRIPE_SECRET_KEY` — só Edge Functions na Fase 7

## Domínios

- **staging:** `staging.elleito.ai` → branch `main` ou similar
- **produção:** `app.elleito.ai` → branch `production` (definir)
- **previews:** `*.vercel.app` automáticos para cada PR

Configurar em Project → Settings → Domains.

## CORS e Auth no Supabase

No Supabase Dashboard → **Authentication → URL Configuration**:

- `Site URL`: `https://app.elleito.ai`
- `Redirect URLs`: adicionar `https://app.elleito.ai/**`, `https://staging.elleito.ai/**`, `http://localhost:3000/**` e o domínio de preview da Vercel

Sem isso, magic links e OAuth apontam para `localhost` após login.

## Pré-deploy (checklist)

- [ ] Migrations Fase 1 + seeds mock aplicadas no Supabase de produção (ou, pelo menos, de staging)
- [ ] Pelo menos 1 usuário teste criado em `auth.users` com linha espelho em `public.users`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurados na Vercel
- [ ] `pnpm lint` e `pnpm type-check` passam localmente
- [ ] Dashboard renderiza com dado do Supabase (badge DB verde na legenda do mapa)

## Debug pós-deploy

- **Página carrega mas mapa fica no loader infinito**: o fetch do GeoJSON falhou. Abra DevTools → Network e veja o status de `geojs-41-mun.json`. Pode ser bloqueio do CSP.
- **Redirect infinito login ↔ dashboard**: cookie de sessão não está sendo emitido. Verifique que as 3 env vars públicas estão no Production environment, **não** só em Preview.
- **Badge DB amarelo em produção (MOCK)**: `NEXT_PUBLIC_SUPABASE_URL` não setada ou RLS bloqueando a leitura. Confirme em Supabase → Logs → Postgres se a query chegou.
