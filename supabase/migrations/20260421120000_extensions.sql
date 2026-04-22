-- 20260421120000_extensions.sql
-- Habilita extensões do Postgres usadas pelo elleito.ai.

create extension if not exists pgcrypto;       -- gen_random_uuid()
create extension if not exists postgis;        -- geometrias municipais
create extension if not exists pg_trgm;        -- busca aproximada (ILIKE performante)
create extension if not exists unaccent;       -- busca insensível a acentos
