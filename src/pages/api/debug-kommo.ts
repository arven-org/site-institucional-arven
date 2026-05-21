/**
 * Endpoint temporario de diagnostico da integracao Kommo.
 * Reporta estado da configuracao SEM expor segredos.
 * Remover apos resolver o root cause.
 */
export const prerender = false;

import type { APIContext } from "astro";

export async function GET({ request }: APIContext): Promise<Response> {
  // Shared secret hardcoded — endpoint sera removido apos diagnostico.
  const url = new URL(request.url);
  const key = url.searchParams.get("k");
  if (key !== "c5514107dd7ff839579b81878408a54c7688b123733eb102") {
    return new Response("not found", { status: 404 });
  }

  const baseUrl = (import.meta.env.KOMMO_BASE_URL as string | undefined) ?? "";
  const token = (import.meta.env.KOMMO_ACCESS_TOKEN as string | undefined) ?? "";

  const diag: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    runtime: typeof process !== "undefined" ? "node" : "edge",
    env: {
      KOMMO_BASE_URL_present: Boolean(baseUrl),
      KOMMO_BASE_URL_value: baseUrl, // URL nao e secreto
      KOMMO_ACCESS_TOKEN_present: Boolean(token),
      KOMMO_ACCESS_TOKEN_length: token.length,
      KOMMO_ACCESS_TOKEN_prefix: token.slice(0, 12),
      KOMMO_ACCESS_TOKEN_suffix: token.slice(-12),
      KOMMO_ACCESS_TOKEN_has_whitespace: /\s/.test(token),
      KOMMO_ACCESS_TOKEN_jwt_parts: token.split(".").length,
      LEAD_WEBHOOK_URL_present: Boolean(import.meta.env.LEAD_WEBHOOK_URL),
    },
    kommo_ping: null,
    kommo_create_test: null,
  };

  if (baseUrl && token) {
    // Ping 1: GET /api/v4/account
    try {
      const res = await fetch(`${baseUrl}/api/v4/account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      let parsed: unknown = null;
      try { parsed = JSON.parse(text); } catch { /* noop */ }
      diag.kommo_ping = {
        status: res.status,
        ok: res.ok,
        body_excerpt: text.slice(0, 300),
        account_id: (parsed as { id?: number })?.id,
        subdomain: (parsed as { subdomain?: string })?.subdomain,
      };
    } catch (err) {
      diag.kommo_ping = { error: String(err) };
    }

    // Ping 2: tenta criar lead complex de teste (apaga depois manualmente)
    if (url.searchParams.get("create") === "1") {
      try {
        const body = [{
          name: "DEBUG_KOMMO " + Date.now(),
          pipeline_id: 13797403,
          status_id: 106457839,
        }];
        const res = await fetch(`${baseUrl}/api/v4/leads/complex`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        const text = await res.text();
        diag.kommo_create_test = {
          status: res.status,
          ok: res.ok,
          body_excerpt: text.slice(0, 500),
        };
      } catch (err) {
        diag.kommo_create_test = { error: String(err) };
      }
    }
  }

  return new Response(JSON.stringify(diag, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
