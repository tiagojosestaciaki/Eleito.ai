"use client";

/**
 * Sidebar de filtros do dashboard.
 *
 * Nesta etapa é 100% visual — os controles não disparam ação nenhuma
 * ainda. A lógica de aplicação entra quando os resultados reais
 * estiverem no Supabase (Fase 2 · Etapa 4+).
 */

import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const CARGOS = [
  { value: "deputado_estadual", label: "Deputado Estadual" },
  { value: "deputado_federal", label: "Deputado Federal" },
  { value: "prefeito", label: "Prefeito" },
  { value: "vereador", label: "Vereador" },
] as const;

const ANOS = [
  { value: "2024", label: "2024" },
  { value: "2022", label: "2022" },
  { value: "2020", label: "2020" },
  { value: "2018", label: "2018" },
  { value: "2016", label: "2016" },
] as const;

const PARTIDOS = [
  { value: "PSD", label: "PSD" },
  { value: "PL", label: "PL" },
  { value: "MDB", label: "MDB" },
  { value: "PT", label: "PT" },
  { value: "UNIÃO", label: "UNIÃO" },
  { value: "PSDB", label: "PSDB" },
  { value: "REPUBLICANOS", label: "REPUBLICANOS" },
  { value: "PODE", label: "PODE" },
  { value: "PP", label: "PP" },
] as const;

export function FiltersSidebar({
  onClose,
  className,
}: {
  onClose?: () => void;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col border-l border-border/60",
        "bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight">Filtros</h2>
        </div>
        {onClose ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={onClose}
            aria-label="Fechar filtros"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {/* Contador */}
      <div className="border-b border-border/60 px-4 py-3">
        <p className="text-xs font-medium text-muted-foreground">
          <span className="tabular-nums text-foreground">399</span> municípios ·{" "}
          <span className="tabular-nums text-foreground">0</span> filtros ativos
        </p>
      </div>

      {/* Controles */}
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <FilterField label="Cargo">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cargo" />
            </SelectTrigger>
            <SelectContent>
              {CARGOS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Ano">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {ANOS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Partido">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Qualquer partido" />
            </SelectTrigger>
            <SelectContent>
              {PARTIDOS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Candidato">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome…"
              className="pl-8"
            />
          </div>
        </FilterField>
      </div>

      {/* Rodapé com CTA */}
      <div className="border-t border-border/60 p-4">
        <Button className="w-full" type="button">
          Aplicar filtros
        </Button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Filtros ativam a partir da Etapa 4
        </p>
      </div>
    </aside>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
