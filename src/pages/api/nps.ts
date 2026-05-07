export const prerender = false;

import type { APIContext } from 'astro';
import { isRateLimited } from '../../lib/rate-limit';

const ALLOWED_ORIGINS = new Set([
  'https://arvenoficial.com',
  'https://www.arvenoficial.com',
]);

function corsOrigin(request: Request): string {
  const origin = request.headers.get('origin') || '';
  return ALLOWED_ORIGINS.has(origin) ? origin : '';
}

function jsonResponse(status: number, body: object, request: Request): Response {
  const origin = corsOrigin(request);
  const headers: Record<string, string> = { 'Content-Type': 'application/json; charset=utf-8' };
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  return new Response(JSON.stringify(body), { status, headers });
}

const TAGS_BY_SEGMENT: Record<string, ReadonlySet<string>> = {
  promotor: new Set([
    'Resultados entregues',
    'Comunicação clara',
    'Estratégia sólida',
    'Time proativo',
    'Custo-benefício',
    'Confiança no processo',
  ]),
  neutro: new Set([
    'Resultados razoáveis',
    'Esperava mais agilidade',
    'Boa relação, mas caro',
    'Estratégia ok, execução fraca',
    'Pouco acompanhamento',
    'Sem diferencial claro',
  ]),
  detrator: new Set([
    'Resultados abaixo do esperado',
    'Comunicação falhou',
    'Falta de estratégia clara',
    'Atendimento demorou',
    'Preço não justificado',
    'Processo confuso',
  ]),
};

const SERVICE_OPTIONS = new Set([
  'Tráfego pago (Meta/Google)',
  'Funis e automação',
  'Estratégia e planejamento',
  'Gestão de conteúdo',
  'CRM e integração',
  'Consultoria comercial',
]);

const CHURN_VALUES = new Set(['expand', 'renew', 'undecided', 'reduce', 'churn']);

function segmentFromScore(score: number): 'promotor' | 'neutro' | 'detrator' {
  if (score >= 9) return 'promotor';
  if (score >= 7) return 'neutro';
  return 'detrator';
}

function churnToRisk(churn: string): 'low' | 'medium' | 'high' {
  if (churn === 'expand' || churn === 'renew') return 'low';
  if (churn === 'undecided') return 'medium';
  return 'high';
}

function clampText(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max);
}

export async function POST({ request }: APIContext): Promise<Response> {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(clientIp)) {
    return jsonResponse(429, { error: 'too_many_requests' }, request);
  }

  const webhookUrl = import.meta.env.NPS_WEBHOOK_URL;
  if (!webhookUrl || !/^https?:\/\//i.test(webhookUrl)) {
    return jsonResponse(503, { error: 'webhook_not_configured' }, request);
  }

  const contentLength = parseInt(request.headers.get('content-length') ?? '0', 10);
  if (contentLength > 256 * 1024) {
    return jsonResponse(413, { error: 'payload_too_large' }, request);
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text() || '{}') as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { error: 'invalid_json' }, request);
  }

  if (body._honeypot && String(body._honeypot).trim() !== '') {
    return jsonResponse(400, { error: 'bad_request' }, request);
  }

  const scoreRaw = body.score;
  if (typeof scoreRaw !== 'number' || !Number.isInteger(scoreRaw) || scoreRaw < 0 || scoreRaw > 10) {
    return jsonResponse(400, { error: 'invalid_score', message: 'score deve ser inteiro 0–10' }, request);
  }

  const npsSegment = segmentFromScore(scoreRaw);

  const reasonsRaw = body.reasons;
  if (!Array.isArray(reasonsRaw)) {
    return jsonResponse(400, { error: 'invalid_reasons' }, request);
  }
  const reasons = reasonsRaw.map((r) => String(r).trim()).filter(Boolean);
  if (reasons.length < 1 || reasons.length > 3) {
    return jsonResponse(400, { error: 'invalid_reasons', message: 'entre 1 e 3 razões' }, request);
  }
  const allowedTags = TAGS_BY_SEGMENT[npsSegment];
  for (const r of reasons) {
    if (!allowedTags.has(r)) {
      return jsonResponse(400, { error: 'invalid_reason_tag', reason: r }, request);
    }
  }

  const servicesRaw = body.services;
  if (!Array.isArray(servicesRaw) || servicesRaw.length < 1) {
    return jsonResponse(400, { error: 'invalid_services' }, request);
  }
  const services = servicesRaw.map((s) => String(s).trim()).filter(Boolean);
  for (const s of services) {
    if (!SERVICE_OPTIONS.has(s)) {
      return jsonResponse(400, { error: 'invalid_service', service: s }, request);
    }
  }

  const churn = body.churn;
  if (typeof churn !== 'string' || !CHURN_VALUES.has(churn)) {
    return jsonResponse(400, { error: 'invalid_churn' }, request);
  }

  const churn_risk = churnToRisk(churn);

  const opentext =
    body.opentext != null && String(body.opentext).trim() !== ''
      ? clampText(String(body.opentext).trim(), 20000)
      : null;
  const improve =
    body.improve != null && String(body.improve).trim() !== ''
      ? clampText(String(body.improve).trim(), 20000)
      : null;
  const upsell =
    body.upsell != null && String(body.upsell).trim() !== ''
      ? clampText(String(body.upsell).trim(), 20000)
      : null;

  const submitted_at =
    typeof body.submitted_at === 'string' && body.submitted_at.trim() !== ''
      ? body.submitted_at
      : new Date().toISOString();

  /** Payload canônico — especificação v1.0 */
  const formPayload = {
    score: scoreRaw,
    nps_segment: npsSegment,
    reasons,
    opentext,
    services,
    improve,
    churn,
    churn_risk,
    upsell,
    submitted_at,
  };

  /** Webhook: campos da spec no nível raiz + event e rastreio */
  const outbound = {
    event: 'nps.form_submitted',
    ...formPayload,
    source: typeof body.source === 'string' ? body.source : 'arven_site_nps',
    page: typeof body.page === 'string' ? body.page : null,
    referrer: typeof body.referrer === 'string' ? body.referrer : null,
    ref: typeof body.ref === 'string' ? body.ref : null,
    utm_source: typeof body.utm_source === 'string' ? body.utm_source : null,
  };

  const secret = import.meta.env.NPS_WEBHOOK_SECRET;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (secret) headers['Authorization'] = 'Bearer ' + secret;

  try {
    const r = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(outbound),
    });
    if (!r.ok) {
      return jsonResponse(502, { error: 'webhook_upstream_error', status: r.status }, request);
    }
  } catch {
    return jsonResponse(502, { error: 'webhook_unreachable' }, request);
  }

  return jsonResponse(200, { ok: true }, request);
}

export async function OPTIONS({ request }: APIContext): Promise<Response> {
  const origin = corsOrigin(request);
  return new Response(null, {
    status: 204,
    headers: {
      ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
