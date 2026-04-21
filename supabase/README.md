# /supabase — Banco de Dados

Migrations versionadas, schemas de referência e políticas de RLS para o projeto Supabase do elleito.ai.

## Subpastas

```
supabase/
├── migrations/      # arquivos SQL YYYYMMDDHHMM_*.sql (via supabase CLI)
└── schemas/         # documentação do schema em SQL puro (referência)
```

## Fluxo esperado

1. Dev cria uma migration:
   ```bash
   supabase migration new add_mentions_table
   ```
2. Edita o SQL gerado em `migrations/`
3. Aplica localmente:
   ```bash
   supabase db reset   # reseta dev e reaplica migrations
   ```
4. Commita; o CI aplica em staging. Produção depende de aprovação manual.

## Convenções

- **Nunca** alterar produção diretamente via SQL Editor do dashboard
- Toda tabela tem `id` como PK + `created_at`/`updated_at` (via trigger)
- RLS **sempre ligado** — nenhuma tabela pública por padrão
- Nomes: `snake_case`, plural em tabelas, singular em colunas
- Foreign keys com `ON DELETE` explícito (tipicamente `RESTRICT` ou `CASCADE`)

## Ordem esperada das primeiras migrations

1. `extensions.sql` — `postgis`, `pg_trgm`, `unaccent`, `pgcrypto`
2. `elections.sql`
3. `municipalities.sql` (com geometria)
4. `candidates.sql`
5. `results_municipality.sql`
6. `results_zone.sql`
7. `mentions.sql` (Fase 4)
8. `users.sql` + `rls_policies.sql`
9. `chat_conversations.sql` / `chat_messages.sql` (Fase 3)
10. `views.sql` — views de apoio

## Status

**Fase 0** — pastas vazias (exceto este README). Migrations começam na **Fase 1** conforme [../DATA_MODEL.md](../DATA_MODEL.md).
