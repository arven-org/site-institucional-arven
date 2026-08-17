/* eslint-disable no-console -- script de provisionamento, prints sao a interface. */

/**
 * Cria um usuario inicial no Supabase local com role owner.
 * Uso:
 *   pnpm user:bootstrap seu@email.com [owner|admin|member]
 *
 * Usa service-role, BYPASSA RLS. So pra ambiente local ou provisionar
 * o primeiro owner em prod.
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { Database } from "@/lib/supabase/types";

const here = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(here, "../.env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !service) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local.");
  process.exit(1);
}

const emailArg = process.argv[2];
const roleArg = (process.argv[3] ?? "owner") as Database["public"]["Enums"]["app_role"];

if (!emailArg || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailArg)) {
  console.error("Uso: pnpm user:bootstrap <email> [owner|admin|member]");
  process.exit(1);
}

const email: string = emailArg;
const role = roleArg;

const client = createClient<Database>(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: created, error: createErr } = await client.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  let userId: string;

  if (createErr) {
    if (createErr.message.toLowerCase().includes("already")) {
      const { data: list, error: listErr } = await client.auth.admin.listUsers();
      if (listErr) throw listErr;
      const found = list.users.find((u) => u.email === email);
      if (!found) throw new Error(`Usuario reportado como existente mas nao listado: ${email}`);
      userId = found.id;
      console.warn(`Usuario ja existia, reaproveitando: ${email} (${userId})`);
    } else {
      throw createErr;
    }
  } else {
    userId = created.user.id;
    console.log(`Usuario criado: ${email} (${userId})`);
  }

  const { error: roleErr } = await client.from("profiles").update({ role }).eq("id", userId);
  if (roleErr) throw roleErr;
  console.log(`Role definido como '${role}'.`);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data: link, error: linkErr } = await client.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${appUrl}/auth/callback` },
  });
  if (linkErr) throw linkErr;

  console.log("\nMagic link de primeiro acesso (valido ~10min, uso unico):");
  console.log(link.properties.action_link);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
