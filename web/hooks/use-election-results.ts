"use client";

/**
 * Hook de acesso aos resultados eleitorais por município.
 *
 * Contrato:
 *   const { data, isLoading, error } = useElectionResults({ electionId });
 *   // data: Map<ibge_code, ElectionResult> | null
 *
 * Estratégia:
 *   1. Se NEXT_PUBLIC_SUPABASE_URL não está configurada (ou ainda aponta
 *      para o placeholder do .env.example), usa direto o mock em memória.
 *   2. Caso contrário, busca `results_municipality` filtrando por eleição.
 *      Se `electionId` não foi passado, resolve para a eleição seedada
 *      (deputado_estadual 2022 · turno 1).
 *   3. Em erro de rede, RLS ou qualquer falha, cai para o mock com log.
 *
 * Filtros `cargo` e `partido` são aceitos pela API mas ainda não
 * aplicados — ficam como parâmetros registrados para a Etapa 4.5+.
 */

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { MOCK_ELECTION_RESULTS } from "@/lib/mock/election-data";

export type ElectionResult = {
  ibge_code: number;
  votes: number;
  pct_valid: number;
  rank_in_municipality: number | null;
};

export type ResultsByCode = Map<number, ElectionResult>;

export type UseElectionResultsFilters = {
  electionId?: number;
  cargo?: string;
  partido?: string;
};

export type UseElectionResultsReturn = {
  data: ResultsByCode | null;
  isLoading: boolean;
  error: Error | null;
  /** Indica se o retorno veio do mock em memória (true) ou do Supabase. */
  isMock: boolean;
};

const PLACEHOLDER_FRAGMENT = "xxxxxxxx";

function supabaseIsConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return (
    typeof url === "string" &&
    url.length > 0 &&
    !url.includes(PLACEHOLDER_FRAGMENT)
  );
}

function mockAsMap(): ResultsByCode {
  const m: ResultsByCode = new Map();
  for (const r of MOCK_ELECTION_RESULTS) {
    m.set(r.ibge_code, {
      ibge_code: r.ibge_code,
      votes: 0,
      pct_valid: r.pct_valid,
      rank_in_municipality: null,
    });
  }
  return m;
}

export function useElectionResults(
  filters: UseElectionResultsFilters = {},
): UseElectionResultsReturn {
  const [state, setState] = useState<UseElectionResultsReturn>({
    data: null,
    isLoading: true,
    error: null,
    isMock: false,
  });

  // Serializa filtros para deps estável.
  const filterKey = JSON.stringify({
    electionId: filters.electionId ?? null,
    cargo: filters.cargo ?? null,
    partido: filters.partido ?? null,
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!supabaseIsConfigured()) {
        if (!cancelled) {
          setState({
            data: mockAsMap(),
            isLoading: false,
            error: null,
            isMock: true,
          });
        }
        return;
      }

      try {
        const supabase = createClient();

        // 1. Resolve election_id padrão se não foi passado
        let electionId = filters.electionId;
        if (!electionId) {
          const { data: eData, error: eErr } = await supabase
            .from("elections")
            .select("id")
            .eq("year", 2022)
            .eq("round", 1)
            .eq("role", "deputado_estadual")
            .limit(1)
            .maybeSingle();
          if (eErr) throw new Error(`Buscar eleição: ${eErr.message}`);
          if (!eData) {
            throw new Error(
              "Eleição padrão (deputado_estadual 2022 · turno 1) não encontrada — rode as migrations do Supabase.",
            );
          }
          electionId = eData.id;
        }

        // 2. Busca os resultados agregados por município
        const { data, error } = await supabase
          .from("results_municipality")
          .select("ibge_code, votes, pct_valid, rank_in_municipality")
          .eq("election_id", electionId);

        if (cancelled) return;
        if (error) throw new Error(error.message);

        const map: ResultsByCode = new Map();
        for (const row of data ?? []) {
          map.set(row.ibge_code, {
            ibge_code: row.ibge_code,
            votes: row.votes ?? 0,
            pct_valid: row.pct_valid ?? 0,
            rank_in_municipality: row.rank_in_municipality ?? null,
          });
        }

        if (map.size === 0) {
          console.warn(
            "[useElectionResults] Supabase retornou 0 resultados — usando mock em memória.",
          );
          setState({
            data: mockAsMap(),
            isLoading: false,
            error: null,
            isMock: true,
          });
          return;
        }

        setState({ data: map, isLoading: false, error: null, isMock: false });
      } catch (err) {
        if (cancelled) return;
        const error = err instanceof Error ? err : new Error(String(err));
        console.warn(
          "[useElectionResults] falha ao consultar Supabase, usando mock:",
          error.message,
        );
        setState({
          data: mockAsMap(),
          isLoading: false,
          error,
          isMock: true,
        });
      }
    }

    setState((prev) => ({ ...prev, isLoading: true }));
    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  return state;
}
