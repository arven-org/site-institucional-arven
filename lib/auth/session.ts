import "server-only";

import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { getServerSupabase } from "@/lib/supabase/server";

export interface SessionUser {
  id: string;
  email: string;
}

/**
 * Retorna o usuario autenticado ou null. Memoizado por request via React cache,
 * de forma que multiplos callers no mesmo render compartilham uma so query.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await getServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) return null;

  return { id: user.id, email: user.email };
});
