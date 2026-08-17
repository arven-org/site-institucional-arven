import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Service-role client. BYPASSA RLS.
 *
 * Restrito a:
 *   - app/api/cron/**          jobs agendados (snapshot, transicoes, alertas)
 *   - app/api/webhooks/**      ingestao externa sem sessao (Google Form)
 *   - scripts/**               seed, migracao, manutencao
 *   - modules/<m>/jobs/**      logica de jobs orquestrada por cron route
 *
 * ESLint bloqueia importacao fora desses caminhos
 * (`no-restricted-imports` em eslint.config.mjs).
 *
 * Cada chamada precisa de uma razao explicita pra existir. Se da pra fazer
 * com client autenticado + RLS, faca com RLS.
 */
export function getServiceSupabase() {
  const env = getServerEnv();
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
