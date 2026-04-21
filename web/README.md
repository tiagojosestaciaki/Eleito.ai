# /web — Frontend Next.js 14

Frontend web do elleito.ai: dashboard eleitoral interativo + chat copiloto.

## Stack planejado

- **Next.js 14** (App Router, React Server Components)
- **TypeScript** estrito
- **Tailwind CSS** + **shadcn/ui** (design system)
- **react-leaflet** (mapas)
- **recharts** (gráficos)
- **@supabase/ssr** (auth e queries no servidor)
- **@anthropic-ai/sdk** (chat copiloto via Edge Functions)

## Estrutura prevista (quando o código entrar — Fase 2)

```
web/
├── app/
│   ├── (auth)/             # login, signup, magic-link
│   ├── (dashboard)/
│   │   ├── map/            # mapa coroplético do PR
│   │   ├── municipality/[id]/
│   │   ├── party/[sigla]/
│   │   └── chat/           # copiloto (Fase 3)
│   ├── api/
│   │   └── chat/           # edge function para Claude API
│   └── layout.tsx
├── components/
│   ├── ui/                 # shadcn/ui
│   ├── charts/             # wrappers recharts
│   └── map/                # camadas react-leaflet
├── lib/
│   ├── supabase/           # clients (server, client, admin)
│   ├── anthropic/          # client + tools
│   └── tools/              # function calling tools
├── public/
│   └── geojson/            # malhas PR (cache estático)
└── tests/
```

## Scripts previstos

```bash
pnpm dev        # desenvolvimento local
pnpm build      # build de produção
pnpm start      # servir build
pnpm lint       # lint + type-check
pnpm test       # vitest
```

## Status

**Fase 0** — apenas pasta criada. Scaffolding ocorre na **Fase 2**.
