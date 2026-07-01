import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Clock,
  Map,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cérebro",
};

type SubFeatureStatus = "disponivel" | "em_construcao";

type SubFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
  status: SubFeatureStatus;
  href: string;
};

const SUBFEATURES: SubFeature[] = [
  {
    icon: Map,
    title: "Mapa Eleitoral",
    description:
      "Mapa coroplético do Paraná com resultados por município, hover interativo e filtros por cargo, ano e partido.",
    status: "disponivel",
    href: "/dashboard/cerebro/mapa",
  },
  {
    icon: BarChart3,
    title: "Análises",
    description:
      "Leituras de cenário sugeridas — não filtros vazios. Onde teve maior abstenção, comparação com adversários, perfil a reconquistar.",
    status: "em_construcao",
    href: "/dashboard/cerebro/analises",
  },
  {
    icon: MessageSquare,
    title: "Narrativas",
    description:
      "Três caminhos narrativos por cenário, ancorados em casos históricos comparáveis na sua região.",
    status: "em_construcao",
    href: "/dashboard/cerebro/narrativas",
  },
  {
    icon: AlertTriangle,
    title: "Contenção de Crise",
    description:
      "Diagnóstico rápido, três cenários de resposta com roteiros prontos, plano de acompanhamento de 72h.",
    status: "em_construcao",
    href: "/dashboard/cerebro/crise",
  },
];

export default function CerebroIndexPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 py-10 md:px-10 md:py-12">
      {/* Cabeçalho do módulo */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary"
            aria-hidden="true"
          >
            <Brain className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Módulo · Cérebro
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Inteligência de Cenário
            </h1>
          </div>
        </div>
        <p className="max-w-3xl text-base leading-relaxed text-foreground/80">
          Leitura de cenário eleitoral, comparação histórica, sugestão de
          narrativas e contenção de crise — tudo ancorado em dados oficiais
          do TSE e IBGE do Paraná (2016–2024). Uma sub-feature está
          disponível; as demais entram no roadmap de 60 dias.
        </p>
      </header>

      {/* Grid de sub-features */}
      <section aria-labelledby="subfeatures-heading" className="space-y-5">
        <h2
          id="subfeatures-heading"
          className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground"
        >
          Sub-funcionalidades
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {SUBFEATURES.map((feature) => (
            <SubFeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SubFeatureCard({ feature }: { feature: SubFeature }) {
  const { icon: Icon, title, description, status, href } = feature;
  const isActive = status === "disponivel";

  return (
    <Card
      className={cn(
        "flex h-full flex-col border-border/60 transition-colors",
        isActive ? "border-primary/40" : "opacity-90",
      )}
    >
      <CardHeader className="space-y-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            isActive
              ? "bg-primary/15 text-primary"
              : "bg-muted/50 text-muted-foreground",
          )}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
          <CardDescription className="text-sm">
            <StatusPill status={status} />
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <p className="text-sm leading-relaxed text-foreground/80">
          {description}
        </p>

        {isActive ? (
          <Button asChild size="sm">
            <Link href={href} className="group">
              Acessar
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        ) : (
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="text-muted-foreground"
          >
            <Link href={href}>Ver detalhes</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function StatusPill({ status }: { status: SubFeatureStatus }) {
  if (status === "disponivel") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Disponível
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
      <Clock className="h-3.5 w-3.5" />
      Em construção
    </span>
  );
}
