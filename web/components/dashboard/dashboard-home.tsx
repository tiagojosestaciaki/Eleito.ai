/**
 * Tela inicial do dashboard — Visão v3.
 *
 * Substitui o mapa como home. Mostra:
 *   1. Saudação personalizada + data atual em pt-BR
 *   2. Seção "Seus módulos" — 3 cards (Motor / Cérebro / Operação)
 *      com status real (em construção vs disponível parcialmente)
 *   3. Linha do tempo do roadmap de 60 dias com a semana atual
 *
 * Sem KPIs falsos. A página é honesta sobre o estado de cada módulo.
 *
 * É 100% server component — não há interatividade. Os botões "Acessar"
 * são <Link>, e os "Em breve" são <button disabled>.
 */

import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  Radio,
  Users,
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

// ────────────────────────────────────────────────────────────────────────
// Componente raiz
// ────────────────────────────────────────────────────────────────────────

export function DashboardHome({ firstName }: { firstName: string }) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-12 px-6 py-10 md:px-10 md:py-12">
      <Greeting firstName={firstName} />
      <ModulesSection />
      <RoadmapSection />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Saudação + data
// ────────────────────────────────────────────────────────────────────────

function formatTodayPtBR(): string {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
  const text = formatter.format(new Date());
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function Greeting({ firstName }: { firstName: string }) {
  const today = formatTodayPtBR();
  return (
    <header className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Olá, <span className="text-primary">{firstName}</span>
        </h1>
        <p className="text-sm font-medium text-muted-foreground">{today}</p>
      </div>
      <p className="max-w-2xl text-base text-muted-foreground">
        Bem-vindo ao seu sistema operacional político.
      </p>
    </header>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Cards de módulos
// ────────────────────────────────────────────────────────────────────────

type ModuleStatus = "em_construcao" | "disponivel_parcial";

type ModuleCardProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  status: ModuleStatus;
  description: string;
  cta:
    | { kind: "link"; label: string; href: string }
    | { kind: "disabled"; label: string };
};

function ModulesSection() {
  return (
    <section aria-labelledby="modules-heading" className="space-y-5">
      <SectionTitle id="modules-heading" text="Seus módulos" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <ModuleCard
          icon={Users}
          title="Motor"
          subtitle="CRM Político com IA via WhatsApp"
          status="em_construcao"
          description="Banco vivo de lideranças, consultas via WhatsApp, respostas em segundos."
          cta={{ kind: "disabled", label: "Em breve" }}
        />
        <ModuleCard
          icon={Brain}
          title="Cérebro"
          subtitle="Inteligência de Cenário"
          status="disponivel_parcial"
          description="Mapa eleitoral, análises históricas, contenção de crise."
          cta={{ kind: "link", label: "Acessar", href: "/dashboard/cerebro/mapa" }}
        />
        <ModuleCard
          icon={Radio}
          title="Operação"
          subtitle="Comando ao Vivo"
          status="em_construcao"
          description="Briefings automáticos, alertas, monitoramento contínuo."
          cta={{ kind: "disabled", label: "Em breve" }}
        />
      </div>
    </section>
  );
}

function ModuleCard({
  icon: Icon,
  title,
  subtitle,
  status,
  description,
  cta,
}: ModuleCardProps) {
  const isActive = cta.kind === "link";

  return (
    <Card
      className={cn(
        "flex h-full flex-col border-border/60 transition-colors",
        isActive ? "border-primary/40" : "opacity-90",
      )}
    >
      <CardHeader className="space-y-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            isActive
              ? "bg-primary/15 text-primary"
              : "bg-muted/50 text-muted-foreground",
          )}
          aria-hidden="true"
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-sm">{subtitle}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-5">
        <div className="space-y-3">
          <StatusPill status={status} />
          <p className="text-sm leading-relaxed text-foreground/80">
            {description}
          </p>
        </div>

        {cta.kind === "link" ? (
          <Button asChild>
            <Link href={cta.href} className="group">
              {cta.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        ) : (
          <Button disabled variant="secondary" className="cursor-not-allowed">
            {cta.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function StatusPill({ status }: { status: ModuleStatus }) {
  if (status === "disponivel_parcial") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Disponível parcialmente
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

// ────────────────────────────────────────────────────────────────────────
// Status do produto — linha do tempo do roadmap 60 dias
// ────────────────────────────────────────────────────────────────────────

type RoadmapStepState = "atual" | "futuro";

type RoadmapStep = {
  weeks: string;
  title: string;
  description: string;
  state: RoadmapStepState;
};

const ROADMAP: RoadmapStep[] = [
  {
    weeks: "Semanas 1–2",
    title: "Estrutura",
    description: "Reorganização do dashboard em 3 módulos.",
    state: "atual",
  },
  {
    weeks: "Semanas 3–4",
    title: "Motor MVP",
    description: "CRM político: schema + cadastros + importação.",
    state: "futuro",
  },
  {
    weeks: "Semanas 5–6",
    title: "Motor avançado",
    description: "Consulta via WhatsApp + áudio + RAG.",
    state: "futuro",
  },
  {
    weeks: "Semanas 7–8",
    title: "Primeiro cliente piloto",
    description: "Onboarding, billing inicial, ETL real do TSE.",
    state: "futuro",
  },
];

function RoadmapSection() {
  return (
    <section aria-labelledby="roadmap-heading" className="space-y-5">
      <SectionTitle id="roadmap-heading" text="Status do produto" />
      <Card className="border-border/60">
        <CardContent className="space-y-6 p-6 md:p-8">
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            O elleito.ai está em desenvolvimento ativo, em ciclo de 60 dias.
            Esta tela mostra o estado real do produto — sem indicadores
            inflados. A cada duas semanas, um novo módulo entra em
            funcionamento.
          </p>
          <RoadmapTimeline />
        </CardContent>
      </Card>
    </section>
  );
}

function RoadmapTimeline() {
  return (
    <ol
      role="list"
      className={cn(
        "flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-2",
        "md:grid md:grid-cols-4 md:overflow-visible md:pb-0",
      )}
    >
      {ROADMAP.map((step, idx) => (
        <li
          key={step.weeks}
          className="relative flex min-w-[220px] snap-start flex-col gap-2 md:min-w-0"
        >
          {/* Linha conectora — desktop only, exceto último */}
          {idx < ROADMAP.length - 1 ? (
            <div
              aria-hidden="true"
              className="absolute left-[18px] right-0 top-[14px] hidden h-px bg-border md:block"
            />
          ) : null}

          <div className="flex items-center gap-3">
            <StepDot state={step.state} index={idx + 1} />
            <span
              className={cn(
                "text-xs font-bold uppercase tracking-wider",
                step.state === "atual" ? "text-primary" : "text-muted-foreground",
              )}
            >
              {step.weeks}
            </span>
          </div>

          <div className="md:pl-9">
            <h3
              className={cn(
                "text-sm font-semibold",
                step.state === "atual"
                  ? "text-foreground"
                  : "text-foreground/70",
              )}
            >
              {step.title}
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function StepDot({
  state,
  index,
}: {
  state: RoadmapStepState;
  index: number;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative z-10 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold tabular-nums",
        state === "atual"
          ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--primary)/0.15)]"
          : "border-border/80 bg-card text-muted-foreground",
      )}
    >
      {index}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Helpers visuais
// ────────────────────────────────────────────────────────────────────────

function SectionTitle({ id, text }: { id: string; text: string }) {
  return (
    <h2
      id={id}
      className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground"
    >
      {text}
    </h2>
  );
}
