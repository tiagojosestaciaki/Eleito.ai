import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "elleito.ai",
    template: "%s · elleito.ai",
  },
  description:
    "Plataforma de inteligência eleitoral estratégica com foco no Paraná — dashboards, chat copiloto e monitoramento de menções.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
