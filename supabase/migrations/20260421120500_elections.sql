-- 20260421120500_elections.sql
-- Dimensão central: eleições por ano, turno, escopo e cargo.
-- Seed: eleições 2016, 2018, 2020, 2022 e 2024 para o Paraná (ADR-001).

create table public.elections (
  id              serial primary key,
  year            int  not null,
  round           int  not null check (round in (1,2)),
  scope           text not null check (scope in ('federal','estadual','municipal')),
  role            text not null check (role in (
                    'presidente','governador','senador',
                    'deputado_federal','deputado_estadual',
                    'prefeito','vereador'
                  )),
  election_date   date not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (year, round, scope, role)
);

create trigger elections_set_updated_at
  before update on public.elections
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------------------
-- SEED — eleições oficiais no Paraná (datas oficiais do TSE)
-- -------------------------------------------------------------------------
insert into public.elections (year, round, scope, role, election_date) values
  -- 2016 — municipais
  (2016, 1, 'municipal', 'prefeito',          '2016-10-02'),
  (2016, 2, 'municipal', 'prefeito',          '2016-10-30'),
  (2016, 1, 'municipal', 'vereador',          '2016-10-02'),

  -- 2018 — gerais
  (2018, 1, 'federal',   'presidente',        '2018-10-07'),
  (2018, 2, 'federal',   'presidente',        '2018-10-28'),
  (2018, 1, 'estadual',  'governador',        '2018-10-07'),
  (2018, 2, 'estadual',  'governador',        '2018-10-28'),
  (2018, 1, 'federal',   'senador',           '2018-10-07'),
  (2018, 1, 'federal',   'deputado_federal',  '2018-10-07'),
  (2018, 1, 'estadual',  'deputado_estadual', '2018-10-07'),

  -- 2020 — municipais
  (2020, 1, 'municipal', 'prefeito',          '2020-11-15'),
  (2020, 2, 'municipal', 'prefeito',          '2020-11-29'),
  (2020, 1, 'municipal', 'vereador',          '2020-11-15'),

  -- 2022 — gerais
  (2022, 1, 'federal',   'presidente',        '2022-10-02'),
  (2022, 2, 'federal',   'presidente',        '2022-10-30'),
  (2022, 1, 'estadual',  'governador',        '2022-10-02'),
  (2022, 2, 'estadual',  'governador',        '2022-10-30'),
  (2022, 1, 'federal',   'senador',           '2022-10-02'),
  (2022, 1, 'federal',   'deputado_federal',  '2022-10-02'),
  (2022, 1, 'estadual',  'deputado_estadual', '2022-10-02'),

  -- 2024 — municipais
  (2024, 1, 'municipal', 'prefeito',          '2024-10-06'),
  (2024, 2, 'municipal', 'prefeito',          '2024-10-27'),
  (2024, 1, 'municipal', 'vereador',          '2024-10-06')
on conflict (year, round, scope, role) do nothing;
