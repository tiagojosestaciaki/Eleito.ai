-- 20260421120700_candidates.sql
-- Candidatos por eleição. NÃO persistimos CPF, data de nascimento, bens, endereço,
-- escolaridade, ocupação, raça nem gênero no MVP (ver ADR-002).

create table public.candidates (
  tse_id           bigint primary key,                  -- SQ_CANDIDATO (TSE)
  election_id      integer not null references public.elections(id) on delete restrict,
  name             text    not null,
  ballot_name      text,
  ballot_number    integer,
  party            text,
  coalition        text,
  role             text    not null check (role in (
                     'presidente','governador','senador',
                     'deputado_federal','deputado_estadual',
                     'prefeito','vereador'
                   )),
  status           text check (status in (
                     'deferido','indeferido','renuncia','falecido','outros'
                   )),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index candidates_election_id_idx  on public.candidates(election_id);
create index candidates_party_idx        on public.candidates(party);
create index candidates_role_idx         on public.candidates(role);
create index candidates_name_trgm_idx    on public.candidates using gin (name gin_trgm_ops);

create trigger candidates_set_updated_at
  before update on public.candidates
  for each row execute function public.set_updated_at();

comment on table public.candidates is
  'Candidatos por eleição. Não persistimos dados pessoais sensíveis (ADR-002).';
