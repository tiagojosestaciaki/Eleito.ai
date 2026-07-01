import type { Metadata } from "next";

import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Mapa Eleitoral",
};

/**
 * Mapa coroplético do Paraná — antes era a home do dashboard, agora
 * vive como sub-rota do módulo Cérebro (Visão v3, Etapa 3 da Semana 1-2).
 *
 * O componente DashboardView (mapa + sidebar de filtros) foi mantido
 * intacto: só mudou de rota.
 */
export default function CerebroMapaPage() {
  return <DashboardView />;
}
