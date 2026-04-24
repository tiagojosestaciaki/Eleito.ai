"use client";

/**
 * Wrapper do mapa com dynamic import e SSR desativado.
 *
 * Leaflet acessa `window` no tempo de módulo, então SSR quebra.
 * Este wrapper é a API pública — o resto do app importa daqui.
 *
 * Chama `useElectionResults` e entrega o Map pronto para o inner.
 * Assim o inner não precisa saber nada sobre Supabase/mock.
 */

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import {
  useElectionResults,
  type UseElectionResultsFilters,
} from "@/hooks/use-election-results";

const ParanaMapLazy = dynamic(
  () => import("./parana-map-inner").then((m) => m.ParanaMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando mapa…</p>
        </div>
      </div>
    ),
  },
);

export function ParanaMap(props: { filters?: UseElectionResultsFilters } = {}) {
  const { data, isLoading, error, isMock } = useElectionResults(
    props.filters ?? {},
  );

  return (
    <ParanaMapLazy
      results={data}
      isLoadingResults={isLoading}
      resultsError={error}
      isMock={isMock}
    />
  );
}
