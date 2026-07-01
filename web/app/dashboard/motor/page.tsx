import type { Metadata } from "next";
import { Users } from "lucide-react";

import { ComingSoonPlaceholder } from "@/components/dashboard/coming-soon-placeholder";

export const metadata: Metadata = {
  title: "Motor",
};

export default function MotorPage() {
  return (
    <ComingSoonPlaceholder
      eyebrow="Módulo · Motor"
      title="Motor — CRM Político"
      subtitle="CRM Político com IA via WhatsApp"
      promise={
        "Banco vivo de lideranças, eleitores-chave, demandas, promessas e " +
        "interações da base regional do cliente. Acessado via WhatsApp por " +
        "áudio ou texto, com resposta contextualizada em até 5 segundos. " +
        "A equipe do gabinete alimenta o sistema por interface web ou pelo " +
        "próprio WhatsApp, e o RAG sobre esse banco entrega ao político " +
        "nome, histórico, demandas pendentes e contexto de cada contato em " +
        "campo."
      }
      note={
        "Este módulo está em desenvolvimento. Conclusão prevista para a " +
        "Semana 6 do roadmap atual. Acompanhe o progresso pelo dashboard " +
        "principal — a linha do tempo do produto mostra em que etapa " +
        "estamos."
      }
      icon={Users}
    />
  );
}
