/**
 * Placeholder padrão para páginas de módulos ainda em construção.
 *
 * Uso:
 *   <ComingSoonPlaceholder
 *     eyebrow="Módulo"
 *     title="Motor — CRM Político"
 *     promise="..."
 *     note="Este módulo está em desenvolvimento..."
 *     icon={Users}
 *   />
 *
 * Padrão visual reusável para /dashboard/motor, /operacao, e para as
 * sub-features do /cerebro (análises, narrativas, crise).
 */

import Link from "next/link";
import { ArrowLeft, Wrench, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type ComingSoonPlaceholderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  promise: string;
  note: string;
  icon: LucideIcon;
  backHref?: string;
  backLabel?: string;
};

export function ComingSoonPlaceholder({
  eyebrow,
  title,
  subtitle,
  promise,
  note,
  icon: Icon,
  backHref = "/dashboard",
  backLabel = "Voltar ao dashboard",
}: ComingSoonPlaceholderProps) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-6 py-10 md:px-10 md:py-12">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground"
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>

        <p className="max-w-3xl text-base leading-relaxed text-foreground/80">
          {promise}
        </p>
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <Wrench className="h-5 w-5 text-primary" aria-hidden="true" />
          <div className="space-y-1">
            <CardTitle className="text-base">Em construção</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {note}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary" className="gap-2">
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
