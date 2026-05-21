/**
 * Kommo CRM client.
 *
 * Cria lead + contato + empresa em uma chamada via /api/v4/leads/complex,
 * anexa nota com diagnostico do form e popula custom fields nativos
 * de tracking (UTMs / click IDs).
 *
 * Docs:
 *   https://developers.kommo.com/reference/leads-complex
 *   https://developers.kommo.com/reference/notes
 */

const BASE_URL = (import.meta.env.KOMMO_BASE_URL as string | undefined)?.replace(/\/$/, "");
const ACCESS_TOKEN = import.meta.env.KOMMO_ACCESS_TOKEN as string | undefined;

// IDs descobertos via /api/v4/leads/pipelines e /api/v4/{entity}/custom_fields.
// Mantidos como constantes (nao env vars) porque sao especificos da conta
// e raramente mudam; se mudarem, o teste e2e falha e a gente atualiza.
const PIPELINE_ID = 13797403; // "Pipeline Arven"
const STATUS_LEAD_NOVO = 106457839;

const LEAD_CF = {
  utm_source: 90816,
  utm_medium: 90812,
  utm_campaign: 90814,
  utm_content: 90810,
  utm_term: 90818,
  utm_referrer: 90820,
  referrer: 90822,
  gclid: 90826,
  fbclid: 90828,
} as const;

const CONTACT_CF = {
  phone: 90802,
  email: 90804,
} as const;

const COMPANY_CF = {
  web: 90806,
} as const;

// -----------------------------------------------------------------------
// Tipos de entrada
// -----------------------------------------------------------------------

export interface KommoLeadInput {
  lead: {
    nome: string;
    email: string;
    whatsapp: string;
    empresa: string;
    site?: string | null;
    segmento: string;
    segmento_label?: string;
    faturamento: string;
    faturamento_label?: string;
    midia: string;
    midia_label?: string;
    midia_detalhe?: string | null;
    desafio: string;
    expectativa?: string | null;
  };
  campaign?: {
    first_touch?: Record<string, string | number> | null;
    last_touch?: Record<string, string | number> | null;
    session_count?: number;
    consent?: boolean;
    // aliases top-level (last-touch)
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    gclid?: string;
    fbclid?: string;
    referrer?: string;
  };
  page?: string | null;
  referrer?: string | null;
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

const cfValue = (field_id: number, value: string | number | null | undefined) => {
  if (value == null || value === "") return null;
  return { field_id, values: [{ value }] };
};

const cfMultitext = (
  field_id: number,
  value: string | null | undefined,
  enum_code: "WORK" | "MOB" | "HOME" | "OTHER" = "WORK",
) => {
  if (!value) return null;
  return { field_id, values: [{ value, enum_code }] };
};

const compact = <T>(arr: (T | null | undefined)[]): T[] => arr.filter((x): x is T => x != null);

const buildNote = (input: KommoLeadInput): string => {
  const l = input.lead;
  const lines = [
    "**Diagnostico (form de qualificacao)**",
    "",
    `- **Segmento:** ${l.segmento_label || l.segmento}`,
    `- **Faturamento mensal:** ${l.faturamento_label || l.faturamento}`,
    `- **Midia paga hoje:** ${l.midia_label || l.midia}`,
  ];
  if (l.midia_detalhe) lines.push(`- **Detalhe / volume:** ${l.midia_detalhe}`);
  lines.push("", "**Maior desafio:**", l.desafio);
  if (l.expectativa) lines.push("", "**Expectativa com a Arven:**", l.expectativa);

  if (input.campaign?.first_touch || input.campaign?.last_touch) {
    lines.push("", "**Atribuicao:**");
    const first = input.campaign?.first_touch;
    const last = input.campaign?.last_touch;
    const fmt = (t: Record<string, unknown> | null | undefined) => {
      if (!t) return "(nao registrado)";
      const parts: string[] = [];
      if (t.utm_source) parts.push(`source=${t.utm_source}`);
      if (t.utm_medium) parts.push(`medium=${t.utm_medium}`);
      if (t.utm_campaign) parts.push(`campaign=${t.utm_campaign}`);
      if (t.gclid) parts.push(`gclid=${String(t.gclid).slice(0, 16)}…`);
      if (t.fbclid) parts.push(`fbclid=${String(t.fbclid).slice(0, 16)}…`);
      if (t.landing_page) parts.push(`landing=${t.landing_page}`);
      return parts.length ? parts.join(" · ") : "(direct)";
    };
    lines.push(`- First-touch: ${fmt(first)}`);
    lines.push(`- Last-touch: ${fmt(last)}`);
    if (input.campaign.session_count != null) {
      lines.push(`- Toques de campanha: ${input.campaign.session_count}`);
    }
    if (input.campaign.consent != null) {
      lines.push(`- Consent LGPD: ${input.campaign.consent ? "concedido" : "negado"}`);
    }
  }

  if (input.page) lines.push("", `**Pagina de submit:** ${input.page}`);
  return lines.join("\n");
};

// -----------------------------------------------------------------------
// Cliente
// -----------------------------------------------------------------------

const apiFetch = async (path: string, init: RequestInit, timeoutMs = 8000): Promise<Response> => {
  if (!BASE_URL || !ACCESS_TOKEN) {
    throw new Error("kommo_not_configured");
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
};

export interface KommoCreateResult {
  leadId: number;
  contactId?: number;
  companyId?: number;
}

export async function createLeadInKommo(input: KommoLeadInput): Promise<KommoCreateResult> {
  const c = input.campaign;
  const last = c?.last_touch || {};

  // Lead-level custom fields: preenchidos com last_touch (modelo padrao
  // de atribuicao de conversao). First-touch fica na nota como contexto.
  const leadCustomFields = compact([
    cfValue(LEAD_CF.utm_source, (last.utm_source as string) || c?.utm_source),
    cfValue(LEAD_CF.utm_medium, (last.utm_medium as string) || c?.utm_medium),
    cfValue(LEAD_CF.utm_campaign, (last.utm_campaign as string) || c?.utm_campaign),
    cfValue(LEAD_CF.utm_content, (last.utm_content as string) || c?.utm_content),
    cfValue(LEAD_CF.utm_term, (last.utm_term as string) || c?.utm_term),
    cfValue(LEAD_CF.gclid, (last.gclid as string) || c?.gclid),
    cfValue(LEAD_CF.fbclid, (last.fbclid as string) || c?.fbclid),
    cfValue(LEAD_CF.referrer, (last.referrer as string) || c?.referrer || input.referrer || undefined),
  ]);

  const contactCustomFields = compact([
    cfMultitext(CONTACT_CF.phone, input.lead.whatsapp, "WORK"),
    cfMultitext(CONTACT_CF.email, input.lead.email, "WORK"),
  ]);

  const companyCustomFields = compact([
    cfValue(COMPANY_CF.web, input.lead.site || undefined),
  ]);

  const leadName = `${input.lead.empresa} — ${input.lead.nome}`;

  const complexBody = [{
    name: leadName,
    pipeline_id: PIPELINE_ID,
    status_id: STATUS_LEAD_NOVO,
    custom_fields_values: leadCustomFields.length ? leadCustomFields : undefined,
    _embedded: {
      contacts: [{
        name: input.lead.nome,
        custom_fields_values: contactCustomFields.length ? contactCustomFields : undefined,
      }],
      companies: [{
        name: input.lead.empresa,
        custom_fields_values: companyCustomFields.length ? companyCustomFields : undefined,
      }],
    },
  }];

  const res = await apiFetch("/api/v4/leads/complex", {
    method: "POST",
    body: JSON.stringify(complexBody),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`kommo_complex_failed_${res.status}: ${detail.slice(0, 500)}`);
  }

  const created = (await res.json()) as Array<{
    id: number;
    contact_id?: number;
    company_id?: number;
  }>;
  const first = created[0];
  if (!first?.id) {
    throw new Error("kommo_complex_no_id");
  }

  // Anexa nota com diagnostico (fire-and-await, mas falha de nota nao
  // invalida o lead — apenas registra).
  try {
    await apiFetch(`/api/v4/leads/${first.id}/notes`, {
      method: "POST",
      body: JSON.stringify([{
        note_type: "common",
        params: { text: buildNote(input) },
      }]),
    });
  } catch {
    // ignora: lead foi criado, nota pode ser refeita manualmente
  }

  return {
    leadId: first.id,
    contactId: first.contact_id,
    companyId: first.company_id,
  };
}

export const isKommoConfigured = (): boolean => Boolean(BASE_URL && ACCESS_TOKEN);
