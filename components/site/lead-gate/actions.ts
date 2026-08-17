"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { getServerEnv, isSupabaseConfigured } from "@/lib/env";
import { getServerSupabase } from "@/lib/supabase/server";
import { log } from "@/lib/logger";
import {
  commercialValues,
  isQualified,
  trafficValues,
  type LeadIntent,
} from "@/lib/site/lead-gate";

const schema = z.object({
  name: z.string().trim().min(1, "Informe seu nome.").max(120),
  whatsapp: z
    .string()
    .trim()
    .min(8, "Informe um WhatsApp válido.")
    .max(40)
    .regex(/[0-9]/, "Informe um WhatsApp válido."),
  intent: z.enum(["schedule", "ebook"]),
  traffic: z.enum(trafficValues),
  commercial: z.enum(commercialValues),
  sourcePath: z.string().max(200).optional(),
  // Honeypot: campo invisivel. Bot preenche, humano nao. Se vier algo, descartamos.
  website: z.string().optional(),
});

export type LeadInput = z.input<typeof schema>;
export type LeadResult = { ok: true } | { ok: false; error: string };

export async function submitLead(input: LeadInput): Promise<LeadResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Confira os dados e tente novamente.";
    return { ok: false, error: first };
  }

  const data = parsed.data;

  // Honeypot acionado: fingimos sucesso para nao dar sinal ao bot, sem gravar.
  if (data.website && data.website.length > 0) {
    return { ok: true };
  }

  const userAgent = (await headers()).get("user-agent")?.slice(0, 400) ?? null;

  const lead = {
    name: data.name,
    whatsapp: data.whatsapp,
    intent: data.intent satisfies LeadIntent,
    traffic_investment: data.traffic,
    commercial_team: data.commercial,
    qualified: isQualified(data.traffic, data.commercial),
    source_path: data.sourcePath ?? null,
    user_agent: userAgent,
  };

  if (isSupabaseConfigured()) {
    const supabase = await getServerSupabase();
    const { error } = await supabase.from("leads").insert(lead);

    if (error) {
      log.error("lead_submit_failed", { code: error.code, message: error.message });
      return { ok: false, error: "Não foi possível enviar agora. Tente novamente." };
    }

    return { ok: true };
  }

  // Sem Supabase: mesmo destino do site anterior (LEAD_WEBHOOK_URL).
  const webhookUrl = getServerEnv().LEAD_WEBHOOK_URL;
  if (!webhookUrl) {
    log.error("lead_submit_failed", {
      code: "no_destination",
      message: "Sem Supabase e sem LEAD_WEBHOOK_URL",
    });
    return { ok: false, error: "Não foi possível enviar agora. Tente novamente." };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "site-arven", lead }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      log.error("lead_submit_failed", {
        code: `webhook_${String(res.status)}`,
        message: res.statusText,
      });
      return { ok: false, error: "Não foi possível enviar agora. Tente novamente." };
    }
  } catch (err) {
    log.error("lead_submit_failed", {
      code: "webhook_error",
      message: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, error: "Não foi possível enviar agora. Tente novamente." };
  }

  return { ok: true };
}
