export const prerender = false;

import type { APIContext } from 'astro';
import { isRateLimited } from '../../lib/rate-limit';

const REQUIRED = ["nome", "email", "whatsapp", "empresa", "segmento", "faturamento", "midia", "desafio"] as const;

const ALLOWED_ORIGINS = new Set([
  "https://arvenoficial.com",
  "https://www.arvenoficial.com",
]);

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

  const target = import.meta.env.LEAD_WEBHOOK_URL;
  if (!target || !/^https?:\/\//i.test(target)) {
    return jsonResponse(503, { error: "webhook_not_configured" }, request);
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

  const outbound = {
    event: "lead_qualificacao",
    receivedAt: new Date().toISOString(),
    source: body.source || "arven_site",
    page: body.page ?? null,
    referrer: body.referrer ?? null,
    campaign: body.campaign && typeof body.campaign === "object" ? body.campaign : {},
    lead: body.lead,
  };

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const secret = import.meta.env.LEAD_WEBHOOK_SECRET;
  if (secret) headers.Authorization = "Bearer " + secret;

  try {
    const r = await fetch(target, {
      method: "POST",
      headers,
      body: JSON.stringify(outbound),
    });
    if (!r.ok) {
      return jsonResponse(502, { error: "webhook_upstream_error", status: r.status }, request);
    }
  } catch {
    return jsonResponse(502, { error: "webhook_unreachable" }, request);
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
