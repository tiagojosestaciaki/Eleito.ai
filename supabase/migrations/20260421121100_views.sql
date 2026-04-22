-- 20260421121100_views.sql
-- Views de conveniência para análises recorrentes.

-- -------------------------------------------------------------------------
-- v_election_catalog — catálogo enxuto de eleições com contagens
-- -------------------------------------------------------------------------
create or replace view public.v_election_catalog as
select
  e.id               as election_id,
  e.year,
  e.round,
  e.scope,
  e.role,
  e.election_date,
  count(distinct c.tse_id)     as candidate_count,
  count(distinct rm.ibge_code) as municipality_coverage
from public.elections e
left join public.candidates c
  on c.election_id = e.id
left join public.results_municipality rm
  on rm.election_id = e.id
group by e.id, e.year, e.round, e.scope, e.role, e.election_date
order by e.year desc, e.round, e.scope, e.role;

comment on view public.v_election_catalog is
  'Catálogo de eleições com total de candidatos e cobertura municipal — check pós-ETL.';

-- -------------------------------------------------------------------------
-- v_municipality_summary — resumo de um município em uma eleição
-- -------------------------------------------------------------------------
create or replace view public.v_municipality_summary as
select
  rm.election_id,
  rm.ibge_code,
  m.name       as municipality_name,
  m.state,
  m.region,
  m.electorate,
  sum(rm.votes)                                 as total_votes,
  count(distinct rm.candidate_id)               as candidates_with_votes,
  count(distinct c.party) filter (where c.party is not null) as parties_represented
from public.results_municipality rm
join public.municipalities m on m.ibge_code = rm.ibge_code
join public.candidates     c on c.tse_id    = rm.candidate_id
group by rm.election_id, rm.ibge_code, m.name, m.state, m.region, m.electorate;

comment on view public.v_municipality_summary is
  'Resumo de votos e cobertura partidária por município × eleição.';

-- -------------------------------------------------------------------------
-- v_party_evolution — evolução agregada de votos por partido ao longo dos anos
-- -------------------------------------------------------------------------
create or replace view public.v_party_evolution as
select
  c.party,
  e.year,
  e.role,
  sum(rm.votes) as total_votes,
  count(distinct c.tse_id) as candidates
from public.results_municipality rm
join public.candidates c on c.tse_id = rm.candidate_id
join public.elections  e on e.id    = rm.election_id
where c.party is not null
group by c.party, e.year, e.role
order by c.party, e.year, e.role;

comment on view public.v_party_evolution is
  'Evolução de votos de um partido ao longo dos anos por cargo.';
