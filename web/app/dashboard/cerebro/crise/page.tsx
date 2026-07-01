import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";

import { ComingSoonPlaceholder } from "@/components/dashboard/coming-soon-placeholder";

export const metadata: Metadata = {
  title: "Contenção de Crise",
};

export default function CerebroCrisePage() {
  return (
    <ComingSoonPlaceholder
      eyebrow="Cérebro · Contenção de Crise"
      title="Diagnóstico rápido de crise política"
      subtitle="Input estruturado · 3 cenários de resposta · roteiros prontos"
      promise={
        "Você descreve o problema (texto ou áudio), categoriza a origem, " +
        "aponta o ator e o canal de propagação, e o sistema devolve em " +
        "menos de 90 segundos: diagnóstico de gravidade, janela de ação " +
        "estimada, três cenários de resposta (assertiva, conciliadora, " +
        "silêncio estratégico), roteiros prontos por canal, recomendação " +
        "final e plano de acompanhamento nas próximas 72 horas."
      }
      note={
        "Este módulo está em desenvolvimento. A especificação técnica " +
        "completa do fluxo já existe em docs/CRISIS_FLOW.md — inclui o " +
        "schema de input, schema JSON do output, prompt base versionado " +
        "e métricas de sucesso."
      }
      icon={AlertTriangle}
      backHref="/dashboard/cerebro"
      backLabel="Voltar ao Cérebro"
    />
  );
}
