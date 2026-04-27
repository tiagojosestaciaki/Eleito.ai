import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { createClient } from "@/lib/supabase/server";

/**
 * Layout protegido do dashboard.
 *
 * Estrutura v3: sidebar lateral fixa de 240px à esquerda em desktop;
 * em mobile a sidebar vira drawer com hambúrguer flutuante.
 *
 * O middleware já barra não-autenticados, mas fazemos um safety check
 * server-side aqui para garantir o `user.email` antes de renderizar.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar userEmail={user.email ?? "—"} />
      <main className="min-h-screen md:pl-[240px]">{children}</main>
    </div>
  );
}
