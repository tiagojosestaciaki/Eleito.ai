/**
 * Escala coroplética do dashboard.
 *
 * Mapeia percentual (0-100) em 5 buckets de laranja indo do claro
 * (Tailwind orange-200) ao escuro (orange-700). Municípios sem dado
 * ficam em slate-800 (#1E293B), combinando com o fundo navy.
 */

export const NO_DATA_COLOR = "#1E293B"; // slate-800

const BUCKETS: ReadonlyArray<readonly [number, string]> = [
  [20, "#FED7AA"], // orange-200
  [40, "#FDBA74"], // orange-300
  [60, "#FB923C"], // orange-400
  [80, "#F97316"], // orange-500 (= --primary)
  [Infinity, "#C2410C"], // orange-700
];

export function colorForPct(pct: number | null | undefined): string {
  if (pct == null || Number.isNaN(pct)) return NO_DATA_COLOR;
  for (const [threshold, color] of BUCKETS) {
    if (pct < threshold) return color;
  }
  return NO_DATA_COLOR; // inalcançável, por segurança de tipos
}

/** Legenda renderizável (labels já prontos para a UI). */
export const CHOROPLETH_LEGEND = [
  { label: "< 20%", color: "#FED7AA" },
  { label: "20–40%", color: "#FDBA74" },
  { label: "40–60%", color: "#FB923C" },
  { label: "60–80%", color: "#F97316" },
  { label: "≥ 80%", color: "#C2410C" },
  { label: "Sem dados", color: NO_DATA_COLOR },
] as const;
