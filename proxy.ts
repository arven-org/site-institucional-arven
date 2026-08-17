import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, requireSupabasePublicEnv } from "@/lib/env";

/**
 * Proxy (antigo middleware) mantem a sessao Supabase fresca em cada request.
 * Sem isso, o cookie de auth pode expirar entre renders de Server Components.
 * Sem Supabase configurado (site rodando so com as env do site anterior),
 * vira passthrough: nao ha sessao pra renovar.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) return response;

  const supabaseEnv = requireSupabasePublicEnv();
  const supabase = createServerClient(supabaseEnv.url, supabaseEnv.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set({ name, value, ...options });
        }
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /**
     * Roda em tudo exceto:
     *  - _next/static, _next/image
     *  - assets estaticos
     *  - api/cron e api/webhooks (autenticam por segredo, nao por cookie)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/cron|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
