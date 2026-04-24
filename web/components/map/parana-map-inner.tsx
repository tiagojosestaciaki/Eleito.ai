"use client";

/**
 * Mapa coroplético do Paraná — componente client-only.
 *
 * ⚠️ NÃO importar diretamente. Usar via `components/map/parana-map.tsx`,
 * que o carrega com `next/dynamic({ ssr: false })`. O Leaflet toca `window`
 * durante o módulo, então SSR quebra.
 */

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GeoJSON as LeafletGeoJSON, Layer, Path, PathOptions } from "leaflet";
import type { Feature } from "geojson";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import { Loader2, MapPinOff } from "lucide-react";

import {
  MOCK_RESULTS_BY_CODE,
  type MockResult,
} from "@/lib/mock/election-data";
import { colorForPct, NO_DATA_COLOR } from "@/lib/geo/color-scale";
import {
  fetchParanaGeoJson,
  featureIbgeCode,
  type ParanaGeoJSON,
  type ParanaMunicipalityProperties,
} from "@/lib/geo/parana-geojson";

const PARANA_CENTER: [number, number] = [-24.89, -51.55];
const PARANA_ZOOM = 7;

const BASE_STYLE: PathOptions = {
  weight: 0.5,
  color: "#334155", // slate-700 (bordas)
  fillOpacity: 0.85,
};

const HOVER_STYLE: PathOptions = {
  weight: 1.5,
  color: "#F97316", // --primary
};

function formatPct(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function buildTooltipHtml(name: string, result: MockResult | undefined): string {
  const pctLine = result
    ? `<span style="color:#F97316;font-weight:600;">${formatPct(result.pct_valid)}</span>`
    : `<span style="color:#94A3B8;">Sem dados</span>`;
  return `
    <div style="font-family:inherit;min-width:140px;">
      <div style="font-weight:600;color:#F1F5F9;margin-bottom:2px;">${name}</div>
      <div style="font-size:12px;">${pctLine}</div>
    </div>
  `;
}

export function ParanaMapInner() {
  const [geojson, setGeojson] = useState<ParanaGeoJSON | null>(null);
  const [error, setError] = useState<string | null>(null);
  const geoRef = useRef<LeafletGeoJSON | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchParanaGeoJson()
      .then((data) => {
        if (!cancelled) setGeojson(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Função de estilo. useMemo porque react-leaflet chama no render.
  const styleFn = useMemo(
    () =>
      (feature?: Feature<any, ParanaMunicipalityProperties>): PathOptions => {
        if (!feature) return BASE_STYLE;
        const code = featureIbgeCode(feature.properties);
        const result = MOCK_RESULTS_BY_CODE.get(code);
        return {
          ...BASE_STYLE,
          fillColor: colorForPct(result?.pct_valid),
          fillOpacity: result ? 0.85 : 0.55,
        };
      },
    [],
  );

  const onEachFeature = useMemo(
    () =>
      (
        feature: Feature<any, ParanaMunicipalityProperties>,
        layer: Layer,
      ) => {
        const code = featureIbgeCode(feature.properties);
        const result = MOCK_RESULTS_BY_CODE.get(code);
        const name = feature.properties.name;

        layer.bindTooltip(buildTooltipHtml(name, result), {
          direction: "top",
          sticky: true,
          opacity: 1,
          className: "elleito-map-tooltip",
        });

        layer.on({
          mouseover: (e) => {
            const target = e.target as Path;
            target.setStyle(HOVER_STYLE);
            target.bringToFront();
          },
          mouseout: (e) => {
            if (geoRef.current) {
              geoRef.current.resetStyle(e.target as Path);
            }
          },
        });
      },
    [],
  );

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <MapPinOff className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar o mapa do Paraná.
          </p>
          <code className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
            {error}
          </code>
        </div>
      </div>
    );
  }

  if (!geojson) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Carregando municípios…
          </p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={PARANA_CENTER}
      zoom={PARANA_ZOOM}
      minZoom={6}
      maxZoom={12}
      scrollWheelZoom
      zoomControl
      className="h-full w-full bg-background"
      style={{ background: "hsl(var(--background))" }}
    >
      <TileLayer
        url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains={["a", "b", "c", "d"]}
      />
      <GeoJSON
        ref={(layer) => {
          geoRef.current = layer;
        }}
        data={geojson}
        style={styleFn}
        onEachFeature={onEachFeature}
      />
      <MapLegend />
    </MapContainer>
  );
}

/** Legenda flutuante no canto inferior esquerdo. */
function MapLegend() {
  return (
    <div
      className="leaflet-control leaflet-bar pointer-events-auto"
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        zIndex: 1000,
        background: "hsl(var(--card) / 0.9)",
        backdropFilter: "blur(8px)",
        border: "1px solid hsl(var(--border))",
        borderRadius: "0.5rem",
        padding: "10px 12px",
        fontSize: 11,
        color: "hsl(var(--muted-foreground))",
        minWidth: 140,
      }}
    >
      <div style={{ fontWeight: 600, color: "hsl(var(--foreground))", marginBottom: 6 }}>
        % votos válidos
      </div>
      {[
        { label: "≥ 80%", color: "#C2410C" },
        { label: "60–80%", color: "#F97316" },
        { label: "40–60%", color: "#FB923C" },
        { label: "20–40%", color: "#FDBA74" },
        { label: "< 20%", color: "#FED7AA" },
        { label: "Sem dados", color: NO_DATA_COLOR },
      ].map((item) => (
        <div
          key={item.label}
          style={{ display: "flex", alignItems: "center", gap: 8, lineHeight: 1.6 }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              background: item.color,
              border: "1px solid #334155",
              borderRadius: 2,
              display: "inline-block",
            }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default ParanaMapInner;
