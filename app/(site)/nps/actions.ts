"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { log } from "@/lib/logger";
import { isRateLimited } from "@/lib/rate-limit";
import {
  CHURN_VALUES,
  SERVICE_OPTIONS,
  TAGS_BY_SEGMENT,
  churnToRisk,
  segmentFromScore,
} from "@/lib/site/nps";

/**
 * Recebe o form NPS e repassa ao webhook do ArvenOS (spec Arven v1.0).
 * Porta fiel do endpoint `/api/nps` do site Astro anterior: mesmas
 * validacoes, mesmo payload outbound (`event: nps.form_submitted`).
 */

function clampText(value: string | null): string | null {
  if (value === null) return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  return trimmed.length <= 20_000 ? trimmed : trimmed.slice(0, 20_000);
}

const schema = z.object({
  score: z.number().int().min(0).max(10),
  reasons: z.array(z.string().trim().min(1).max(200)).min(1).max(3),
  opentext: z.string().max(20_000).nullable(),
  services: z.array(z.string().trim().min(1).max(200)).min(1).max(20),
  improve: z.string().max(20_000).nullable(),
  churn: z.enum(CHURN_VALUES),
  upsell: z.string().max(20_000).nullable(),
  // Token do NPS por cliente (64 hex). null = fluxo anonimo, segue igual.
  token: z
    .string()
    .regex(/^[0-9a-f]{64}$/)
    .nullable(),
  page: z.string().max(2000).nullable(),
  referrer: z.string().max(2000).nullable(),
  ref: z.string().max(200).nullable(),
  utm_source: z.string().max(200).nullable(),
  // Honeypot: humano nao ve, bot preenche.
  website: z.string().optional(),
});

export type NpsInput = z.input<typeof schema>;
export type NpsResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "Não foi possível enviar agora. Verifique sua conexão e tente novamente.";

export async function submitNps(input: NpsInput): Promise<NpsResult> {
  const clientIp = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(clientIp)) {
    return { ok: false, error: "Muitas tentativas. Aguarde um instante e tente novamente." };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Confira as respostas e tente novamente." };
  }
  const data = parsed.data;

  // Honeypot acionado: fingimos sucesso para nao dar sinal ao bot, sem enviar.
  if (data.website !== undefined && data.website.trim() !== "") {
    return { ok: true };
  }

  const npsSegment = segmentFromScore(data.score);

  const allowedTags = new Set(TAGS_BY_SEGMENT[npsSegment]);
  if (!data.reasons.every((r) => allowedTags.has(r))) {
    return { ok: false, error: "Confira as respostas e tente novamente." };
  }
  const allowedServices = new Set(SERVICE_OPTIONS);
  if (!data.services.every((s) => allowedServices.has(s))) {
    return { ok: false, error: "Confira as respostas e tente novamente." };
  }

  const env = getServerEnv();
  const webhookUrl = env.NPS_WEBHOOK_URL;
  if (!webhookUrl) {
    log.error("nps_submit_failed", {
      code: "webhook_not_configured",
      message: "NPS_WEBHOOK_URL ausente",
    });
    return { ok: false, error: GENERIC_ERROR };
  }

  /** Payload canonico (spec v1.0): campos no nivel raiz + event e rastreio. */
  const outbound = {
    event: "nps.form_submitted",
    score: data.score,
    nps_segment: npsSegment,
    reasons: data.reasons,
    opentext: clampText(data.opentext),
    services: data.services,
    improve: clampText(data.improve),
    churn: data.churn,
    churn_risk: churnToRisk(data.churn),
    upsell: clampText(data.upsell),
    submitted_at: new Date().toISOString(),
    source: "arven_site_nps",
    page: data.page,
    referrer: data.referrer,
    ref: data.ref,
    utm_source: data.utm_source,
    token: data.token,
  };

  const requestHeaders: Record<string, string> = { "Content-Type": "application/json" };
  if (env.NPS_WEBHOOK_SECRET) {
    requestHeaders.Authorization = `Bearer ${env.NPS_WEBHOOK_SECRET}`;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(outbound),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      log.error("nps_submit_failed", {
        code: `webhook_${String(res.status)}`,
        message: res.statusText,
      });
      return { ok: false, error: GENERIC_ERROR };
    }
  } catch (err) {
    log.error("nps_submit_failed", {
      code: "webhook_error",
      message: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true };
}
