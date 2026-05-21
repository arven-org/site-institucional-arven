export const prerender = false;

import type { APIContext } from 'astro';
import { isRateLimited } from '../../lib/rate-limit';
import { createLeadInKommo, isKommoConfigured, type KommoLeadInput } from '../../lib/kommo';

const REQUIRED = ["nome", "email", "whatsapp", "empresa", "segmento", "faturamento", "midia", "desafio"] as const;

const ALLOWED_ORIGINS = new Set([
  "https://arvenoficial.com",
  "https://www.arvenoficial.com",
]);

const CAMPAIGN_KEYS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id",
  "fbclid", "gclid", "ttclid", "msclkid", "li_fat_id", "twclid",
  "landing_page", "referrer", "captured_at",
]);

// Aceita apenas chaves conhecidas e trunca strings, evitando bombing por payload arbitrario.
function sanitizeTouch(t: unknown): Record<string, string | number> | null {
  if (!t || typeof t !== "object") return null;
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(t as Record<string, unknown>)) {
    if (!CAMPAIGN_KEYS.has(k)) continue;
    if (k === "captured_at" && typeof v === "number") {
      out[k] = v;
      continue;
    }
    if (typeof v === "string" && v.length > 0) {
      out[k] = v.slice(0, 512);
    }
  }
  return Object.keys(out).length ? out : null;
}

function sanitizeCampaign(c: unknown): Record<string, unknown> {
  if (!c || typeof c !== "object") return {};
  const src = c as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  // Shape novo: first_touch / last_touch aninhados.
  const first = sanitizeTouch(src.first_touch);
  const last = sanitizeTouch(src.last_touch);
  if (first) out.first_touch = first;
  if (last) out.last_touch = last;

  if (typeof src.session_count === "number" && src.session_count >= 0 && src.session_count < 10000) {
    out.session_count = src.session_count;
  }
  if (typeof src.consent === "boolean") out.consent = src.consent;
  if (typeof src.persistence === "string" && src.persistence.length < 32) {
    out.persistence = src.persistence;
  }

  // Aliases top-level + shape antigo (utm_source direto no campaign).
  for (const key of CAMPAIGN_KEYS) {
    if (key === "captured_at") continue;
    const v = src[key];
    if (typeof v === "string" && v.length > 0) {
      out[key] = v.slice(0, 512);
    }
  }

  return out;
}

function corsOrigin(request: Request): string {
  const origin = request.headers.get("origin") || "";
  return ALLOWED_ORIGINS.has(origin) ? origin : "";
}

function jsonResponse(status: number, body: object, request: Request): Response {
  const origin = corsOrigin(request);
  const headers: Record<string, string> = { "Content-Type": "application/json; charset=utf-8" };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return new Response(JSON.stringify(body), { status, headers });
}

export async function POST({ request }: APIContext): Promise<Response> {
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(clientIp)) {
    return jsonResponse(429, { error: "too_many_requests" }, request);
  }

  const webhookTarget = import.meta.env.LEAD_WEBHOOK_URL;
  const hasWebhook = webhookTarget && /^https?:\/\//i.test(webhookTarget);
  const hasKommo = isKommoConfigured();
  if (!hasWebhook && !hasKommo) {
    return jsonResponse(503, { error: "lead_destination_not_configured" }, request);
  }

  const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
  if (contentLength > 256 * 1024) {
    return jsonResponse(413, { error: "payload_too_large" }, request);
  }

  let body: any;
  try {
    const text = await request.text();
    if (text.length > 256 * 1024) {
      return jsonResponse(413, { error: "payload_too_large" }, request);
    }
    body = JSON.parse(text || "{}");
  } catch {
    return jsonResponse(400, { error: "invalid_json" }, request);
  }

  if (body._honeypot && String(body._honeypot).trim() !== "") {
    return jsonResponse(400, { error: "bad_request" }, request);
  }

  if (!body.lead || typeof body.lead !== "object") {
    return jsonResponse(400, { error: "missing_lead" }, request);
  }

  for (const k of REQUIRED) {
    const v = body.lead[k];
    if (v == null || String(v).trim() === "") {
      return jsonResponse(400, { error: "missing_field", field: k }, request);
    }
  }

  const email = String(body.lead.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse(400, { error: "invalid_email" }, request);
  }

  const wa = String(body.lead.whatsapp || "").replace(/\D/g, "");
  if (wa.length < 10 || wa.length > 13) {
    return jsonResponse(400, { error: "invalid_whatsapp" }, request);
  }

  const campaign = sanitizeCampaign(body.campaign);
  const outbound = {
    event: "lead_qualificacao",
    receivedAt: new Date().toISOString(),
    source: body.source || "arven_site",
    page: body.page ?? null,
    referrer: body.referrer ?? null,
    campaign,
    lead: body.lead,
  };

  // Kommo (primario) + webhook generico (redundancia opcional) em paralelo.
  // Sucesso se PELO MENOS UM destino aceitar.
  const tasks: Promise<{ kind: "kommo" | "webhook"; ok: boolean; detail?: string }>[] = [];

  if (hasKommo) {
    const kommoInput: KommoLeadInput = {
      lead: body.lead,
      campaign,
      page: outbound.page,
      referrer: outbound.referrer,
    };
    tasks.push(
      createLeadInKommo(kommoInput)
        .then(() => ({ kind: "kommo" as const, ok: true }))
        .catch((err: unknown) => ({
          kind: "kommo" as const,
          ok: false,
          detail: String(err instanceof Error ? err.message : err).slice(0, 200),
        })),
    );
  }

  if (hasWebhook) {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const secret = import.meta.env.LEAD_WEBHOOK_SECRET;
    if (secret) headers.Authorization = "Bearer " + secret;
    tasks.push(
      fetch(webhookTarget as string, { method: "POST", headers, body: JSON.stringify(outbound) })
        .then((r) => ({ kind: "webhook" as const, ok: r.ok, detail: r.ok ? undefined : `status_${r.status}` }))
        .catch((err: unknown) => ({
          kind: "webhook" as const,
          ok: false,
          detail: String(err instanceof Error ? err.message : err).slice(0, 200),
        })),
    );
  }

  const results = await Promise.all(tasks);
  const anyOk = results.some((r) => r.ok);
  if (!anyOk) {
    const failures = results.map((r) => `${r.kind}:${r.detail || "fail"}`).join(" | ");
    console.error("[lead] all destinations failed:", failures);
    return jsonResponse(502, { error: "lead_destinations_failed" }, request);
  }

  // Loga falhas parciais (uma fonte caiu mas outra absorveu).
  for (const r of results) {
    if (!r.ok) console.warn(`[lead] ${r.kind} failed: ${r.detail}`);
  }

  return jsonResponse(200, { ok: true }, request);
}

export async function OPTIONS({ request }: APIContext): Promise<Response> {
  const origin = corsOrigin(request);
  return new Response(null, {
    status: 204,
    headers: {
      ...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
