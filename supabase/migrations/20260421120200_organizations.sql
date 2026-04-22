-- 20260421120200_organizations.sql
-- Tabela organizations — agrupa usuários de um mesmo mandato/campanha/diretório.
-- Ver ADR-003.

create table public.organizations (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  billing_email   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

comment on table public.organizations is
  'Organizações (mandatos, campanhas, diretórios) — cada usuário pertence a uma.';
