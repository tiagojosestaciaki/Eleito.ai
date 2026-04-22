-- 20260421120400_feature_flags.sql
-- Feature flags por organização (ADR-003).
-- Substitui o gating rígido por plano durante a fase de validação.

create table public.feature_flags (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references public.organizations(id) on delete cascade,
  feature_name      text not null,
  enabled           boolean not null default false,
  limits            jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (organization_id, feature_name)
);

create index feature_flags_org_idx on public.feature_flags(organization_id);

create trigger feature_flags_set_updated_at
  before update on public.feature_flags
  for each row execute function public.set_updated_at();

comment on table public.feature_flags is
  'Liberação granular de features por organização. Nome canônico mantido em enum TS.';
comment on column public.feature_flags.limits is
  'Limites por feature, ex.: {"monthly_queries": 500}';
