import type { Metadata } from "next";

import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Início",
};

/**
 * Home do dashboard (Visão v3).
 *
 * Substitui a tela de mapa anterior. O mapa ganhou rota própria em
 * /dashboard/cerebro/mapa (Etapa 3 da Semana 1-2).
 */
export default async function DashboardHomePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Layout já garantiu que user existe via redirect; este `?? null`
  // existe só pra satisfazer o type checker.
  let fullName: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle<{ full_name: string | null }>();
    fullName = data?.full_name ?? null;
  }

  const firstName = pickFirstName(fullName, user?.email ?? null);

  return <DashboardHome firstName={firstName} />;
}

/**
 * Decide o que chamar o usuário no "Olá, ___".
 * Ordem de preferência: full_name → local-part do email → "usuário".
 */
function pickFirstName(fullName: string | null, email: string | null): string {
  const fromName = fullName?.trim().split(/\s+/)[0];
  if (fromName) return fromName;

  if (email) {
    const local = email.split("@")[0] ?? "";
    if (local.length > 0) {
      return local.charAt(0).toUpperCase() + local.slice(1);
    }
  }
  return "usuário";
}
