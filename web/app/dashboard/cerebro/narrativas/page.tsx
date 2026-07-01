import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";

import { ComingSoonPlaceholder } from "@/components/dashboard/coming-soon-placeholder";

export const metadata: Metadata = {
  title: "Narrativas",
};

export default function CerebroNarrativasPage() {
  return (
    <ComingSoonPlaceholder
      eyebrow="Cérebro · Narrativas"
      title="Sugestões de narrativa por região"
      subtitle="Ancoradas em casos históricos comparáveis"
      promise={
        "Dado um cenário — oportunidade, ameaça ou pauta que você quer " +
        "puxar — o sistema propõe três caminhos narrativos com público-" +
        "alvo, canal recomendado, tom e riscos. Cada sugestão vem " +
        "encostada em casos históricos comparáveis na sua região, para " +
        "que a recomendação não seja achismo de consultor."
      }
      note={
        "Este módulo está em desenvolvimento. A qualidade das sugestões " +
        "depende dos system prompts versionados em /prompts/narratives — " +
        "esse é o ativo estratégico que estamos construindo em paralelo."
      }
      icon={MessageSquare}
      backHref="/dashboard/cerebro"
      backLabel="Voltar ao Cérebro"
    />
  );
}
