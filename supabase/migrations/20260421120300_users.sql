-- 20260421120300_users.sql
-- Tabela users — estende auth.users do Supabase com metadados do produto.
-- plan é campo livre (classificação comercial), NÃO é usado em RLS. Ver ADR-003.

create table public.users (
  id               uuid primary key references auth.users(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete restrict,
  email            text not null unique,
  full_name        text,
  role             text not null default 'viewer'
                   check (role in ('owner','admin','analyst','viewer')),
  plan             text,
  preferences      jsonb not null default '{}'::jsonb,
  onboarded_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);

create index users_organization_id_idx on public.users(organization_id);

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

comment on column public.users.plan is
  'Classificação comercial (free/essential/pro/...). NÃO usar em RLS (ver ADR-003).';
