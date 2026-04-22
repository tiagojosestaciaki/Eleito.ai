/**
 * Leitura centralizada das env vars públicas/privadas usadas pelo /web.
 * Falha cedo se alguma chave obrigatória estiver ausente.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `[env] Variável de ambiente obrigatória ausente: ${name}. ` +
        `Defina em .env.local (veja .env.example).`,
    );
  }
  return value;
}

export const env = {
  supabase: {
    url: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: required(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  },
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;
