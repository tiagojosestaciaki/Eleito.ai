import type { Metadata } from "next";
import { Radio } from "lucide-react";

import { ComingSoonPlaceholder } from "@/components/dashboard/coming-soon-placeholder";

export const metadata: Metadata = {
  title: "Operação",
};

export default function OperacaoPage() {
  return (
    <ComingSoonPlaceholder
      eyebrow="Módulo · Operação"
      title="Operação — Comando ao Vivo"
      subtitle="Sala de situação política contínua"
      promise={
        "Tela do que está acontecendo agora na base do cliente: briefings " +
        "automáticos antes de visitas, alertas de aceleração de tópicos, " +
        "monitoramento de menções na imprensa regional e nas redes " +
        "sociais públicas, e botão de resposta rápida para situações de " +
        "crise. A ideia é que o político abra o app cinco vezes por dia " +
        "mesmo quando não precisa, porque saber o que está rolando na " +
        "base vira parte do dia a dia."
      }
      note={
        "Este módulo está em desenvolvimento. Será o último a ser " +
        "entregue no roadmap atual, porque depende do Motor e do Cérebro " +
        "para gerar contexto útil. As primeiras versões terão apenas " +
        "briefings automáticos e alertas configurados manualmente; a " +
        "coleta ao vivo de rádio, WhatsApp público e câmaras municipais " +
        "vem em fase posterior."
      }
      icon={Radio}
    />
  );
}
