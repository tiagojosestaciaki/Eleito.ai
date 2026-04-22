import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Supabase client para Server Components, Route Handlers e Server Actions.
 *
 * Lê/escreve cookies via `next/headers` para manter a sessão sincronizada
 * com o navegador. Alguns contextos (Server Components puros) não permitem
 * escrita de cookie — daí o try/catch silencioso.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(env.supabase.url, env.supabase.anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Chamado a partir de Server Component — ignorar, o middleware
          // cuida de rotacionar a sessão.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // ver comentário em set()
        }
      },
    },
  });
}
