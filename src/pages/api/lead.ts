export const prerender = false;

import type { APIContext } from 'astro';

const REQUIRED = ["nome", "email", "whatsapp", "empresa", "segmento", "faturamento", "midia", "desafio"] as const;

function jsonResponse(status: number, body: object): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function POST({ request }: APIContext): Promise<Response> {
  const target = import.meta.env.LEAD_WEBHOOK_URL;
  if (!target || !/^https?:\/\//i.test(target)) {
    return jsonResponse(503, { error: "webhook_not_configured" });
  }

  let body: any;
  try {
    const text = await request.text();
    if (text.length > 256 * 1024) {
      return jsonResponse(413, { error: "payload_too_large" });
    }
    body = JSON.parse(text || "{}");
  } catch {
    return jsonResponse(400, { error: "invalid_json" });
  }

  if (body._honeypot && String(body._honeypot).trim() !== "") {
    return jsonResponse(400, { error: "bad_request" });
  }

  if (!body.lead || typeof body.lead !== "object") {
    return jsonResponse(400, { error: "missing_lead" });
  }

  for (const k of REQUIRED) {
    const v = body.lead[k];
    if (v == null || String(v).trim() === "") {
      return jsonResponse(400, { error: "missing_field", field: k });
    }
  }

  const email = String(body.lead.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse(400, { error: "invalid_email" });
  }

  const wa = String(body.lead.whatsapp || "").replace(/\D/g, "");
  if (wa.length < 10 || wa.length > 13) {
    return jsonResponse(400, { error: "invalid_whatsapp" });
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
      return jsonResponse(502, { error: "webhook_upstream_error", status: r.status });
    }
  } catch {
    return jsonResponse(502, { error: "webhook_unreachable" });
  }

  return jsonResponse(200, { ok: true });
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
