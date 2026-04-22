import { redirect } from "next/navigation";

import { Header } from "@/components/layout/header";
import { createClient } from "@/lib/supabase/server";

/**
 * Layout protegido do dashboard. O middleware já barra não-autenticados,
 * mas fazemos um safety check aqui para garantir que o user existe antes
 * de renderizar o header.
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
    <div className="flex min-h-screen flex-col">
      <Header userEmail={user.email ?? "—"} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
