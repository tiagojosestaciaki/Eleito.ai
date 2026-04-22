-- 20260421121000_rls_policies.sql
-- Row Level Security (ADR-003).
--
-- Regras:
--   * Dados eleitorais públicos (elections, candidates, municipalities, results_*)
--     são visíveis a qualquer usuário autenticado.
--   * Dados de conta (users, feature_flags, organizations) são escopados por
--     organização.
--   * Sem gating por plano no SQL — gating de feature ocorre na aplicação.

-- -------------------------------------------------------------------------
-- Helper: organização do usuário autenticado
-- -------------------------------------------------------------------------
create or replace function public.current_user_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.users
  where id = auth.uid()
    and deleted_at is null
  limit 1;
$$;

comment on function public.current_user_organization_id() is
  'Retorna a organization_id do usuário autenticado (auth.uid). Null se não logado.';

-- -------------------------------------------------------------------------
-- organizations
-- -------------------------------------------------------------------------
alter table public.organizations enable row level security;

create policy organizations_read_own
  on public.organizations
  for select
  to authenticated
  using (id = public.current_user_organization_id());

-- Sem policies de INSERT/UPDATE/DELETE — operações sensíveis passam pelo
-- service_role (ETL/admin), que bypassa RLS.

-- -------------------------------------------------------------------------
-- users
-- -------------------------------------------------------------------------
alter table public.users enable row level security;

create policy users_read_same_org
  on public.users
  for select
  to authenticated
  using (organization_id = public.current_user_organization_id());

create policy users_update_self
  on public.users
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- -------------------------------------------------------------------------
-- feature_flags
-- -------------------------------------------------------------------------
alter table public.feature_flags enable row level security;

create policy feature_flags_read_same_org
  on public.feature_flags
  for select
  to authenticated
  using (organization_id = public.current_user_organization_id());

-- -------------------------------------------------------------------------
-- Dados eleitorais públicos — leitura para qualquer autenticado
-- -------------------------------------------------------------------------
alter table public.elections             enable row level security;
alter table public.candidates            enable row level security;
alter table public.municipalities        enable row level security;
alter table public.results_municipality  enable row level security;
alter table public.results_zone          enable row level security;

create policy elections_read_auth             on public.elections             for select to authenticated using (true);
create policy candidates_read_auth            on public.candidates            for select to authenticated using (true);
create policy municipalities_read_auth        on public.municipalities        for select to authenticated using (true);
create policy results_municipality_read_auth  on public.results_municipality  for select to authenticated using (true);
create policy results_zone_read_auth          on public.results_zone          for select to authenticated using (true);
