"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requireSupabasePublicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Client de navegador. Anon key. Sempre sujeito a RLS como o usuario logado.
 * Use so em componentes "use client".
 */
export function getBrowserSupabase() {
  const env = requireSupabasePublicEnv();
  return createBrowserClient<Database>(env.url, env.anonKey);
}
