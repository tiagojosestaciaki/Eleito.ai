# /web — Frontend Next.js 14

Frontend web do elleito.ai: dashboard eleitoral interativo, chat copiloto (Fase 3) e módulos estratégicos (Fases 5–6).

## Stack

- **Next.js 14** (App Router, React Server Components)
- **TypeScript** estrito
- **Tailwind CSS** + **shadcn/ui** (design system)
- **react-leaflet** + **leaflet** (mapas)
- **recharts** (gráficos)
- **@supabase/ssr** + **@supabase/supabase-js** (auth e queries)
- **lucide-react** (ícones)

> Nota: a especificação original mencionava `@supabase/auth-helpers-nextjs`, mas esse pacote foi deprecado pela Supabase em 2024 em favor de `@supabase/ssr`. Seguimos com o atual.

## Estrutura

```
web/
├── app/                       # App Router (layout, páginas, route handlers)
│   ├── layout.tsx
│   ├── page.tsx               # redireciona → /dashboard
│   └── globals.css
├── components/
│   └── ui/                    # shadcn primitives (button, card, input, label)
├── hooks/                     # client hooks (a crescer)
├── lib/
│   ├── env.ts                 # leitura tipada de env
│   ├── utils.ts               # cn()
│   └── supabase/
│       ├── client.ts          # createBrowserClient
│       ├── server.ts          # createServerClient (cookies via next/headers)
│       └── middleware.ts      # helper para middleware
├── types/
│   └── database.ts            # tipos do Postgres (gerado → manual na Fase 2)
├── public/
├── components.json            # config shadcn-ui
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
└── package.json
```

## Setup

```bash
cd web
pnpm install            # ou npm install
cp .env.example .env.local
# edite .env.local com suas chaves da Supabase
pnpm dev                # http://localhost:3000
```

### Pré-requisitos

- Node.js **20+**
- pnpm 9+ (recomendado) ou npm 10+
- Projeto Supabase com as migrations da Fase 1 aplicadas (ver `/supabase`)

## Scripts

| Comando | Função |
|---------|--------|
| `pnpm dev` | Dev server com HMR |
| `pnpm build` | Build de produção |
| `pnpm start` | Serve o build |
| `pnpm lint` | ESLint (Next core-web-vitals) |
| `pnpm type-check` | `tsc --noEmit` |

## Adicionar componentes shadcn

Com `components.json` já configurado:

```bash
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add select
# ...
```

Novos componentes caem em `components/ui/`.

## Gerar tipos do Postgres (Supabase)

Manualmente versionado enquanto não há projeto Supabase estável:

```bash
pnpm dlx supabase gen types typescript \
  --project-id <seu-project-id> \
  --schema public > types/database.ts
```

Rode sempre que rodar uma nova migration.

## Status por Fase

- **Fase 2 — Etapa 1 (atual):** scaffold + Supabase client + Tailwind + shadcn base
- Etapa 2: login + middleware + layout protegido
- Etapa 3: dashboard com mapa coroplético do PR + filtros
- Etapa 4 e 5: seed mock no Supabase + deploy Vercel
