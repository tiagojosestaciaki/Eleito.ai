import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Placeholder da Etapa 2 — mapa coroplético, filtros e painel de dados
 * entram na Etapa 3.
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Inteligência eleitoral do Paraná · base 2016–2024
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Municípios monitorados</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">
              399
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Todos os municípios do PR · IBGE
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Eleições na base</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">
              2016–2024
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Todos os cargos · majoritárias e proporcionais
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Status</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums text-success">
              Online
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Fase 2 · Etapa 2 — mapa chega na Etapa 3
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mapa do Paraná</CardTitle>
          <CardDescription>
            Mapa coroplético com resultados por município — em construção.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[420px] items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
            Mapa interativo entra na próxima etapa.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
