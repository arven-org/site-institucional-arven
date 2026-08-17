/**
 * Validacao de env. Tudo o que entra do ambiente passa por Zod.
 * Erro de parse = boot quebra cedo, com mensagem util.
 *
 * Segregacao deliberada:
 *  - `publicEnv` so contem NEXT_PUBLIC_*, seguro pro bundle do browser.
 *  - `serverEnv` adiciona segredos. Importar serverEnv em codigo de cliente
 *    quebra o build (server-only no consumidor service.ts).
 */

import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
});

const serverSchema = publicSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  GOOGLE_FORM_WEBHOOK_SECRET: z.string().min(32).optional(),
  CRON_SECRET: z.string().min(32).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

function parsePublic() {
  const result = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
  if (!result.success) {
    const tree = z.treeifyError(result.error);
    throw new Error(`ENV invalida (publica): ${JSON.stringify(tree)}`);
  }
  return result.data;
}

function parseServer() {
  const result = serverSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GOOGLE_FORM_WEBHOOK_SECRET: process.env.GOOGLE_FORM_WEBHOOK_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  });
  if (!result.success) {
    const tree = z.treeifyError(result.error);
    throw new Error(`ENV invalida (servidor): ${JSON.stringify(tree)}`);
  }
  return result.data;
}

export const publicEnv = parsePublic();

let cachedServerEnv: ReturnType<typeof parseServer> | null = null;

export function getServerEnv() {
  cachedServerEnv ??= parseServer();
  return cachedServerEnv;
}
