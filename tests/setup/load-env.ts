/**
 * Setup global do Vitest. Carrega .env.test se existir, senao .env.local.
 * Testes de RLS exigem variaveis do Supabase local rodando (`pnpm db:start`).
 */
import { config } from "dotenv";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const envTest = resolve(root, ".env.test");
const envLocal = resolve(root, ".env.local");

if (existsSync(envTest)) {
  config({ path: envTest });
} else if (existsSync(envLocal)) {
  config({ path: envLocal });
}
