-- seed.sql
-- Dados de desenvolvimento. Executado pelo `supabase db reset` em ambiente local.
-- NÃO deve ser aplicado em produção.

-- Organização de desenvolvimento
insert into public.organizations (id, name, slug, billing_email)
values (
  '00000000-0000-0000-0000-000000000001',
  'Equipe elleito.ai (dev)',
  'elleito-dev',
  'dev@elleito.ai'
)
on conflict (slug) do nothing;

-- Feature flags padrão para a organização de dev
insert into public.feature_flags (organization_id, feature_name, enabled)
values
  ('00000000-0000-0000-0000-000000000001', 'chat_copilot',      true),
  ('00000000-0000-0000-0000-000000000001', 'mentions_monitor',  false),
  ('00000000-0000-0000-0000-000000000001', 'trends_alerts',     false)
on conflict (organization_id, feature_name) do nothing;
