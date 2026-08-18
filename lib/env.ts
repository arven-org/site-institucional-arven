/**
 * Validacao de env. Tudo o que entra do ambiente passa por Zod.
 * Erro de parse = boot quebra cedo, com mensagem util.
 *
 * Supabase e OPCIONAL: o site publico (home, blog, templates) roda sem ele,
 * usando as env do site anterior (Sanity + LEAD_WEBHOOK_URL). A area logada
 * (login, dashboard, contratos) so ativa quando as chaves Supabase existem.
 *
 * Segregacao deliberada:
 *  - `publicEnv` so contem NEXT_PUBLIC_*, seguro pro bundle do browser.
 *  - `serverEnv` adiciona segredos. Importar serverEnv em codigo de cliente
 *    quebra o build (server-only no consumidor service.ts).
 */

import { z } from "zod";

// Env var vazia ("") conta como ausente, evitando z.url() falhar com string vazia.
function blank(value: string | undefined): string | undefined {
  return value && value.trim().length > 0 ? value : undefined;
}

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20).optional(),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
});

const serverSchema = publicSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
  GOOGLE_FORM_WEBHOOK_SECRET: z.string().min(32).optional(),
  CRON_SECRET: z.string().min(32).optional(),
  LEAD_WEBHOOK_URL: z.url().optional(),
  NPS_WEBHOOK_URL: z.url().optional(),
  NPS_WEBHOOK_SECRET: z.string().min(1).optional(),
  SANITY_PROJECT_ID: z.string().min(1).optional(),
  SANITY_DATASET: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

function parsePublic() {
  const result = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: blank(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: blank(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    NEXT_PUBLIC_APP_URL: blank(process.env.NEXT_PUBLIC_APP_URL),
  });
  if (!result.success) {
    const tree = z.treeifyError(result.error);
    throw new Error(`ENV invalida (publica): ${JSON.stringify(tree)}`);
  }
  return result.data;
}

function parseServer() {
  const result = serverSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: blank(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: blank(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    NEXT_PUBLIC_APP_URL: blank(process.env.NEXT_PUBLIC_APP_URL),
    SUPABASE_SERVICE_ROLE_KEY: blank(process.env.SUPABASE_SERVICE_ROLE_KEY),
    GOOGLE_FORM_WEBHOOK_SECRET: blank(process.env.GOOGLE_FORM_WEBHOOK_SECRET),
    CRON_SECRET: blank(process.env.CRON_SECRET),
    LEAD_WEBHOOK_URL: blank(process.env.LEAD_WEBHOOK_URL),
    NPS_WEBHOOK_URL: blank(process.env.NPS_WEBHOOK_URL),
    NPS_WEBHOOK_SECRET: blank(process.env.NPS_WEBHOOK_SECRET),
    SANITY_PROJECT_ID: blank(process.env.SANITY_PROJECT_ID),
    SANITY_DATASET: blank(process.env.SANITY_DATASET),
    NODE_ENV: process.env.NODE_ENV,
  });
  if (!result.success) {
    const tree = z.treeifyError(result.error);
    throw new Error(`ENV invalida (servidor): ${JSON.stringify(tree)}`);
  }
  return result.data;
}

export const publicEnv = parsePublic();

/** Supabase configurado? Sem ele o site publico roda e a area logada desativa. */
export function isSupabaseConfigured(): boolean {
  return Boolean(publicEnv.NEXT_PUBLIC_SUPABASE_URL && publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** URL + anon key, ou erro claro. Chame apenas em codigo que exige Supabase. */
export function requireSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase nao configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return { url, anonKey };
}

let cachedServerEnv: ReturnType<typeof parseServer> | null = null;

export function getServerEnv() {
  cachedServerEnv ??= parseServer();
  return cachedServerEnv;
}
