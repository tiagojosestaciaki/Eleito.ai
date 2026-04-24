/**
 * Fetch cacheado do GeoJSON oficial dos municípios do Paraná (IBGE/geodata-br).
 *
 * Fonte: https://github.com/tbrugz/geodata-br (mantido, público, estável).
 * Não commitamos o arquivo — baixamos no cliente e cacheamos em memória
 * na sessão (o próprio HTTP cache do navegador cuida de revalidação).
 */

import type { FeatureCollection, Geometry } from "geojson";

export const PARANA_GEOJSON_URL =
  "https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-41-mun.json";

/**
 * Propriedades por feature no geojs-41-mun.json:
 *   { id: "4106902", name: "Curitiba", description: "..." }
 * Tipamos como Record<string, string> para tolerar variações futuras.
 */
export type ParanaMunicipalityProperties = {
  id: string;
  name: string;
  description?: string;
};

export type ParanaGeoJSON = FeatureCollection<Geometry, ParanaMunicipalityProperties>;

let cache: ParanaGeoJSON | null = null;
let inflight: Promise<ParanaGeoJSON> | null = null;

export function fetchParanaGeoJson(): Promise<ParanaGeoJSON> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;

  inflight = fetch(PARANA_GEOJSON_URL, { cache: "force-cache" })
    .then((res) => {
      if (!res.ok) {
        throw new Error(
          `Falha ao carregar GeoJSON do PR: HTTP ${res.status} ${res.statusText}`,
        );
      }
      return res.json() as Promise<ParanaGeoJSON>;
    })
    .then((data) => {
      cache = data;
      inflight = null;
      return data;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });

  return inflight;
}

/** Extrai código IBGE numérico da propriedade `id` da feature. */
export function featureIbgeCode(props: ParanaMunicipalityProperties): number {
  return Number(props.id);
}
