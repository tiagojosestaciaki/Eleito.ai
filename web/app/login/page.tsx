import type { Metadata } from "next";

import { Logo } from "@/components/brand/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const next =
    searchParams.next && searchParams.next.startsWith("/")
      ? searchParams.next
      : "/dashboard";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo size="lg" />
          <p className="text-sm text-muted-foreground">
            Inteligência eleitoral estratégica · Paraná
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold">Entrar</CardTitle>
            <CardDescription>
              Use suas credenciais para acessar o painel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm next={next} />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Acesso restrito. Em caso de problemas, contate o administrador da sua
          organização.
        </p>
      </div>
    </main>
  );
}
