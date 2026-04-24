"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { ParanaMap } from "@/components/map/parana-map";
import { FiltersSidebar } from "@/components/dashboard/filters-sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Composição principal do dashboard: mapa ocupa toda a área, sidebar
 * fica sobreposta à direita. No desktop a sidebar é sempre visível;
 * no mobile ela colapsa atrás de um botão hambúrguer flutuante.
 */
export function DashboardView() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    // h-[calc(100vh-3.5rem)] bate com a altura do Header (h-14 = 3.5rem).
    <div className="relative h-[calc(100vh-3.5rem)] w-full overflow-hidden">
      {/* Mapa em tela cheia */}
      <div className="absolute inset-0">
        <ParanaMap />
      </div>

      {/* Botão hambúrguer — só no mobile */}
      <Button
        variant="secondary"
        size="icon"
        aria-label={sidebarOpen ? "Esconder filtros" : "Abrir filtros"}
        aria-expanded={sidebarOpen}
        onClick={() => setSidebarOpen((v) => !v)}
        className="absolute right-4 top-4 z-30 shadow-lg md:hidden"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "absolute right-0 top-0 z-20 h-full w-[280px] transition-transform duration-200 ease-out",
          !sidebarOpen && "translate-x-full md:translate-x-0",
        )}
      >
        <FiltersSidebar onClose={() => setSidebarOpen(false)} />
      </div>
    </div>
  );
}
