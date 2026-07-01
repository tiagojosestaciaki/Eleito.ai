import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { ComingSoonPlaceholder } from "@/components/dashboard/coming-soon-placeholder";

export const metadata: Metadata = {
  title: "Análises",
};

export default function CerebroAnalisesPage() {
  return (
    <ComingSoonPlaceholder
      eyebrow="Cérebro · Análises"
      title="Análises sugeridas"
      subtitle="Leitura de cenário sem filtros vazios"
      promise={
        "Em vez de um painel com dropdowns em branco, esta tela vai propor " +
        "análises acionáveis: 'onde você teve maior abstenção', 'comparar " +
        "com o adversário X na sua região', 'perfil de eleitor que você " +
        "precisa reconquistar'. Cada resposta vem com números, " +
        "visualização e um ponto de partida para decisão."
      }
      note={
        "Este módulo está em desenvolvimento. Ele aproveita o mapa " +
        "eleitoral já disponível e os dados históricos do TSE 2016–2024 " +
        "que serão carregados pelo ETL na Semana 7-8 do roadmap."
      }
      icon={BarChart3}
      backHref="/dashboard/cerebro"
      backLabel="Voltar ao Cérebro"
    />
  );
}
