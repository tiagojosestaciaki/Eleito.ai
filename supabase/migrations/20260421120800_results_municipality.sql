-- 20260421120800_results_municipality.sql
-- Resultados agregados por município. Uma linha por (eleição × candidato × município).

create table public.results_municipality (
  id                      bigserial primary key,
  election_id             integer not null references public.elections(id)       on delete restrict,
  candidate_id            bigint  not null references public.candidates(tse_id)  on delete cascade,
  ibge_code               integer not null references public.municipalities(ibge_code) on delete restrict,
  votes                   integer not null check (votes >= 0),
  pct_valid               numeric(6,3),
  pct_total               numeric(6,3),
  rank_in_municipality    integer,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (election_id, candidate_id, ibge_code)
);

create index results_mun_election_ibge_idx  on public.results_municipality(election_id, ibge_code);
create index results_mun_candidate_idx      on public.results_municipality(candidate_id);
create index results_mun_election_idx       on public.results_municipality(election_id);

create trigger results_municipality_set_updated_at
  before update on public.results_municipality
  for each row execute function public.set_updated_at();
