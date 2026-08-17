import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Client de servidor pra RSC, server actions e route handlers.
 * Anon key, sujeito a RLS como o usuario logado. Le/escreve cookies de auth.
 *
 * Este e o client default. 99% das queries usam este.
 */
export async function getServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Set falha em Server Components (so leitura). OK ignorar:
            // middleware/route handler renova o cookie no proximo ciclo.
          }
        },
      },
    },
  );
}
