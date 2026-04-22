"use client";

import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Supabase client para uso em Client Components.
 *
 * Usa a anon key (pública) e respeita RLS. Sessão do usuário é
 * gerenciada automaticamente via cookies sincronizados com o server.
 */
export function createClient() {
  return createBrowserClient<Database>(env.supabase.url, env.supabase.anonKey);
}
