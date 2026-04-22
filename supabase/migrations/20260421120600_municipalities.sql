-- 20260421120600_municipalities.sql
-- Dimensão geográfica — municípios (no MVP, 399 do Paraná).
-- Geometrias em SRID 4326 (WGS84). Ingestão: /ingestion/scripts/etl_ibge_geometries.py

create table public.municipalities (
  ibge_code        integer primary key,
  tse_code         integer,
  name             text not null,
  state            text not null,
  region           text,                              -- mesorregião IBGE
  micro_region     text,                              -- microrregião IBGE
  geom             geometry(MultiPolygon, 4326),
  centroid         geometry(Point, 4326),
  area_km2         numeric,
  population       integer,
  electorate       integer,
  gdp_per_capita   numeric,
  idh              numeric,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index municipalities_state_idx       on public.municipalities(state);
create index municipalities_region_idx      on public.municipalities(region);
create index municipalities_tse_code_idx    on public.municipalities(tse_code);
create index municipalities_geom_gix        on public.municipalities using gist (geom);
create index municipalities_centroid_gix    on public.municipalities using gist (centroid);
create index municipalities_name_trgm_idx   on public.municipalities using gin (name gin_trgm_ops);

create trigger municipalities_set_updated_at
  before update on public.municipalities
  for each row execute function public.set_updated_at();
