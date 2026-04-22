-- 20260421120900_results_zone.sql
-- Resultados por zona eleitoral. Granularidade fina.
-- Uma linha por (eleição × candidato × município × zona).

create table public.results_zone (
  id                bigserial primary key,
  election_id       integer not null references public.elections(id)           on delete restrict,
  candidate_id      bigint  not null references public.candidates(tse_id)      on delete cascade,
  ibge_code         integer not null references public.municipalities(ibge_code) on delete restrict,
  zone_number       integer not null,
  section_count     integer,
  votes             integer not null check (votes >= 0),
  electorate        integer,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (election_id, candidate_id, ibge_code, zone_number)
);

create index results_zone_election_ibge_idx  on public.results_zone(election_id, ibge_code);
create index results_zone_candidate_idx      on public.results_zone(candidate_id);
create index results_zone_zone_idx           on public.results_zone(ibge_code, zone_number);

create trigger results_zone_set_updated_at
  before update on public.results_zone
  for each row execute function public.set_updated_at();
