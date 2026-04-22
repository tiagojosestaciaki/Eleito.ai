-- 20260421120100_functions_triggers.sql
-- Função e trigger genéricos para manter updated_at automático.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger genérica: atualiza updated_at para now() em cada UPDATE.';
