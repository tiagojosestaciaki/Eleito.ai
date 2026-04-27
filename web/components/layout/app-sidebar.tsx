"use client";

/**
 * Sidebar lateral fixa do dashboard — Visão v3.
 *
 * - Desktop (md+): fixed à esquerda, 240px, sempre visível.
 * - Mobile: drawer com overlay; abre via hambúrguer flutuante (top-3 left-3).
 *
 * Estrutura da nav espelha os 3 módulos do produto:
 *   HOME · MOTOR (em breve) · CÉREBRO (com submenu) · OPERAÇÃO (em breve)
 *
 * Itens marcados como `disabled` aparecem com badge "em breve",
 * cursor-not-allowed e opacity reduzida — não são <Link>, são <span>.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  LayoutDashboard,
  Loader2,
  LogOut,
  Map,
  Menu,
  MessageSquare,
  Radio,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/login/actions";
import { cn } from "@/lib/utils";

type NavLeaf = {
  kind: "leaf";
  label: string;
  href?: string;
  icon: LucideIcon;
  disabled?: boolean;
};

type NavGroup = {
  kind: "group";
  label: string;
  href: string;
  icon: LucideIcon;
  children: NavLeaf[];
};

type NavEntry = NavLeaf | NavGroup;

const NAV: NavEntry[] = [
  { kind: "leaf", label: "Home", href: "/dashboard", icon: LayoutDashboard },
  {
    kind: "leaf",
    label: "Motor",
    icon: Users,
    disabled: true,
  },
  {
    kind: "group",
    label: "Cérebro",
    href: "/dashboard/cerebro",
    icon: Brain,
    children: [
      {
        kind: "leaf",
        label: "Mapa Eleitoral",
        href: "/dashboard/cerebro/mapa",
        icon: Map,
      },
      {
        kind: "leaf",
        label: "Análises",
        icon: BarChart3,
        disabled: true,
      },
      {
        kind: "leaf",
        label: "Narrativas",
        icon: MessageSquare,
        disabled: true,
      },
      {
        kind: "leaf",
        label: "Contenção de Crise",
        icon: AlertTriangle,
        disabled: true,
      },
    ],
  },
  {
    kind: "leaf",
    label: "Operação",
    icon: Radio,
    disabled: true,
  },
];

export function AppSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fecha o drawer ao navegar
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Fecha com ESC
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <>
      {/* Hambúrguer mobile (sempre visível em md:hidden) */}
      <button
        type="button"
        aria-label="Abrir menu"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
        className={cn(
          "fixed left-3 top-3 z-40 inline-flex h-10 w-10 items-center justify-center",
          "rounded-md border border-border/60 bg-card/90 text-foreground shadow-lg backdrop-blur",
          "transition-colors hover:bg-card md:hidden",
        )}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay (mobile) */}
      <div
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Sidebar */}
      <aside
        aria-label="Navegação principal"
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col",
          "border-r border-border/40 bg-[hsl(216_50%_9%)]",
          "transition-transform duration-200 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Topo: logo + close (mobile) */}
        <div className="flex h-14 items-center justify-between border-b border-border/40 px-4">
          <Logo size="md" />
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="space-y-0.5">
            {NAV.map((entry) => (
              <li key={entry.label}>
                <NavItem entry={entry} pathname={pathname ?? ""} />
              </li>
            ))}
          </ul>
        </nav>

        {/* Rodapé: usuário + logout */}
        <UserBlock email={userEmail} />
      </aside>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Items
// ────────────────────────────────────────────────────────────────────────

function NavItem({
  entry,
  pathname,
}: {
  entry: NavEntry;
  pathname: string;
}) {
  if (entry.kind === "leaf") {
    return <NavLeafItem leaf={entry} pathname={pathname} indent={false} />;
  }
  return <NavGroupItem group={entry} pathname={pathname} />;
}

function NavLeafItem({
  leaf,
  pathname,
  indent,
}: {
  leaf: NavLeaf;
  pathname: string;
  indent: boolean;
}) {
  const Icon = leaf.icon;
  const isActive = useMemo(() => {
    if (!leaf.href) return false;
    if (leaf.href === "/dashboard") return pathname === "/dashboard";
    return pathname === leaf.href || pathname.startsWith(leaf.href + "/");
  }, [leaf.href, pathname]);

  const baseRow = cn(
    "group flex items-center gap-2.5 rounded-md text-sm font-medium transition-colors",
    indent ? "px-3 py-1.5" : "px-3 py-2",
    leaf.disabled
      ? "cursor-not-allowed text-muted-foreground/60"
      : isActive
        ? "bg-primary/10 text-primary"
        : "text-foreground/80 hover:bg-accent/50 hover:text-foreground",
  );

  const content = (
    <>
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          leaf.disabled
            ? "text-muted-foreground/50"
            : isActive
              ? "text-primary"
              : "text-foreground/60 group-hover:text-foreground",
        )}
      />
      <span className={cn("flex-1 truncate", indent && "text-[13px]")}>
        {leaf.label}
      </span>
      {leaf.disabled ? <ComingSoonBadge /> : null}
    </>
  );

  if (leaf.disabled || !leaf.href) {
    return (
      <span
        aria-disabled="true"
        title="Em construção"
        className={cn(baseRow, "select-none", indent && "ml-6")}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={leaf.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(baseRow, indent && "ml-6")}
    >
      {content}
    </Link>
  );
}

function NavGroupItem({
  group,
  pathname,
}: {
  group: NavGroup;
  pathname: string;
}) {
  const Icon = group.icon;
  const isActive =
    pathname === group.href || pathname.startsWith(group.href + "/");

  return (
    <div className="space-y-0.5">
      <Link
        href={group.href}
        aria-current={pathname === group.href ? "page" : undefined}
        className={cn(
          "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-foreground/80 hover:bg-accent/50 hover:text-foreground",
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            isActive ? "text-primary" : "text-foreground/60 group-hover:text-foreground",
          )}
        />
        <span className="flex-1 truncate">{group.label}</span>
      </Link>

      <ul className="space-y-0.5">
        {group.children.map((child) => (
          <li key={child.label}>
            <NavLeafItem leaf={child} pathname={pathname} indent />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ComingSoonBadge() {
  return (
    <span className="ml-auto inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
      em breve
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Bloco do usuário no rodapé
// ────────────────────────────────────────────────────────────────────────

function UserBlock({ email }: { email: string }) {
  const initial = (email[0] ?? "?").toUpperCase();

  return (
    <div className="border-t border-border/40 p-3">
      <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
        <div
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold uppercase text-primary"
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground" title={email}>
            {email}
          </p>
          <p className="text-[10px] text-muted-foreground">Sessão ativa</p>
        </div>
        <form action={signOut}>
          <LogoutButton />
        </form>
      </div>
    </div>
  );
}

function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      size="icon"
      disabled={pending}
      aria-label="Sair"
      className="h-8 w-8 text-muted-foreground hover:text-foreground"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
    </Button>
  );
}
