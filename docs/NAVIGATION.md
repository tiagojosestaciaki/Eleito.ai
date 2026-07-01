# Navegação — elleito.ai

Estrutura de rotas do dashboard e como cada uma se conecta aos 3 módulos da [Visão v3](../PRODUCT_VISION_v3.md). Documento vivo — deve ser atualizado sempre que uma rota nova entrar em produção.

## Panorama

O produto tem **um** dashboard, com **três módulos** e uma **home de visão geral**:

| Nível | Rota | Módulo | Estado |
|-------|------|--------|--------|
| Home | `/dashboard` | — (visão geral) | Disponível |
| Módulo 1 | `/dashboard/motor` | Motor · CRM Político | Em construção (Semanas 3-6) |
| Módulo 2 · Índice | `/dashboard/cerebro` | Cérebro · Inteligência de Cenário | Disponível parcialmente |
| Módulo 2 · Sub | `/dashboard/cerebro/mapa` | Cérebro · Mapa Eleitoral | Disponível |
| Módulo 2 · Sub | `/dashboard/cerebro/analises` | Cérebro · Análises | Em construção |
| Módulo 2 · Sub | `/dashboard/cerebro/narrativas` | Cérebro · Narrativas | Em construção |
| Módulo 2 · Sub | `/dashboard/cerebro/crise` | Cérebro · Contenção de Crise | Em construção |
| Módulo 3 | `/dashboard/operacao` | Operação · Comando ao Vivo | Em construção (Semana 8+) |

## Fluxo do usuário na primeira sessão

```
/                         ┐
  → redirect              │   fora do middleware:
                          │   / (root redirect)
/login                    │   /login (form)
  → autentica             ┘
     ↓
/dashboard  (home, saudação + 3 cards de módulos + linha do tempo)
     ↓ (click no card Cérebro "Acessar")
/dashboard/cerebro/mapa   (mapa coroplético do PR — única feature ativa hoje)
```

## Mapeamento rota → arquivo

Convenção Next.js App Router. Toda página é RSC (server component) por padrão; componentes interativos ficam em `web/components/**` com `"use client"` explícito.

```
web/app/
├── page.tsx                                  → redirect("/dashboard")
├── login/
│   ├── page.tsx                              → /login  (formulário)
│   └── actions.ts                            → server actions signIn/signOut
└── dashboard/
    ├── layout.tsx                            → AppSidebar + <main>
    ├── page.tsx                              → /dashboard  (DashboardHome)
    ├── motor/
    │   └── page.tsx                          → /dashboard/motor  (placeholder)
    ├── operacao/
    │   └── page.tsx                          → /dashboard/operacao  (placeholder)
    └── cerebro/
        ├── page.tsx                          → /dashboard/cerebro  (índice 2×2)
        ├── mapa/
        │   └── page.tsx                      → /dashboard/cerebro/mapa  (DashboardView)
        ├── analises/
        │   └── page.tsx                      → placeholder
        ├── narrativas/
        │   └── page.tsx                      → placeholder
        └── crise/
            └── page.tsx                      → placeholder
```

## Módulos × responsabilidades

### Módulo 1 — Motor (`/dashboard/motor`)

**Promessa:** CRM político com IA via WhatsApp — banco vivo de lideranças, consultas via voz/texto, resposta em 5s.

**Rotas futuras** (Semanas 3-6):
- `/dashboard/motor` — dashboard operacional do CRM
- `/dashboard/motor/contatos` — lista, busca, filtros
- `/dashboard/motor/contatos/[id]` — perfil de contato com timeline
- `/dashboard/motor/demandas` — kanban de demandas
- `/dashboard/motor/eventos` — agenda de campo
- `/dashboard/motor/whatsapp` — configuração da integração
- `/dashboard/motor/importar` — upload CSV

### Módulo 2 — Cérebro (`/dashboard/cerebro`)

**Promessa:** inteligência de cenário e narrativa — mapa eleitoral, análises sugeridas, sugestão de narrativas, contenção de crise.

**Estrutura atual:**
- `/dashboard/cerebro` — índice com 4 sub-features (grid 2×2)
- `/dashboard/cerebro/mapa` — **disponível** — mapa coroplético do PR com filtros
- `/dashboard/cerebro/analises` — placeholder
- `/dashboard/cerebro/narrativas` — placeholder
- `/dashboard/cerebro/crise` — placeholder

Especificações técnicas das 3 sub-features futuras já vivem em:
- [`docs/CRISIS_FLOW.md`](./CRISIS_FLOW.md)
- [`docs/TRENDS_DETECTION.md`](./TRENDS_DETECTION.md) (alimenta as análises)
- [`docs/PROMPTS_STRATEGY.md`](./PROMPTS_STRATEGY.md) (rege os prompts de narrativas)

### Módulo 3 — Operação (`/dashboard/operacao`)

**Promessa:** comando ao vivo — briefings automáticos, alertas, monitoramento contínuo.

**Rotas futuras** (Semana 8+):
- `/dashboard/operacao` — sala de situação (o que está acontecendo agora)
- `/dashboard/operacao/briefings` — briefings automáticos por evento/cidade
- `/dashboard/operacao/alertas` — timeline de alertas gerados
- `/dashboard/operacao/mencoes` — painel de menções coletadas

## Proteção de rotas

`web/middleware.ts` casa **tudo exceto** `/login` e assets estáticos. Toda rota `/dashboard/**` exige sessão válida do Supabase Auth. Sem sessão → redirect para `/login?next=<rota>` preservando o destino.

Layout `web/app/dashboard/layout.tsx` faz check redundante server-side (defesa em profundidade) e injeta `user.email` no componente `AppSidebar`.

## Sidebar × rotas

A sidebar (`web/components/layout/app-sidebar.tsx`) espelha o mapa acima:

- **Item ativo** (rota atual): `bg-primary/10` + `text-primary` (laranja) — matching por prefixo, exceto Home que usa igualdade estrita
- **Item disabled** (`Motor`, `Operação`, sub-features do Cérebro em construção): `<span>` com `cursor-not-allowed`, badge "EM BREVE" — **não navega**
- **Item disponível**: `<Link>` normal

O item **Cérebro** navega pra `/dashboard/cerebro` (índice) e seu submenu com as 4 sub-features sempre fica visível abaixo. Sub-features em construção **aparecem no submenu** com badge, para o usuário saber que existirão, mas o clique é bloqueado.

## Como adicionar uma rota nova

1. Criar `web/app/dashboard/<modulo>/<feature>/page.tsx` como Server Component
2. Adicionar entrada em `NAV` no `app-sidebar.tsx` (ou como filho de um grupo existente)
3. Se a feature está em construção: usar `<ComingSoonPlaceholder>` (padrão visual único)
4. Atualizar este documento
5. Se a rota tem regras especiais de acesso (ex: só admin): adicionar ao layout ou criar `middleware` específico
