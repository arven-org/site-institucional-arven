/**
 * NPS (spec Arven v1.0) — constantes compartilhadas entre o form (client)
 * e a server action. Os conjuntos daqui DEVEM espelhar o que o webhook do
 * ArvenOS (`/api/webhooks/nps`, modo token) aceita.
 */

export type NpsSegment = "promotor" | "neutro" | "detrator";

export function segmentFromScore(score: number): NpsSegment {
  if (score >= 9) return "promotor";
  if (score >= 7) return "neutro";
  return "detrator";
}

export const P2_QUESTION: Record<NpsSegment, string> = {
  promotor: "O que mais contribuiu para você dar essa nota alta?",
  neutro: "O que te impediu de dar uma nota mais alta?",
  detrator: "O que mais influenciou negativamente sua experiência?",
};

export const TAGS_BY_SEGMENT: Record<NpsSegment, readonly string[]> = {
  promotor: [
    "Resultados entregues",
    "Comunicação clara",
    "Estratégia sólida",
    "Time proativo",
    "Custo-benefício",
    "Confiança no processo",
  ],
  neutro: [
    "Resultados razoáveis",
    "Esperava mais agilidade",
    "Boa relação, mas caro",
    "Estratégia ok, execução fraca",
    "Pouco acompanhamento",
    "Sem diferencial claro",
  ],
  detrator: [
    "Resultados abaixo do esperado",
    "Comunicação falhou",
    "Falta de estratégia clara",
    "Atendimento demorou",
    "Preço não justificado",
    "Processo confuso",
  ],
};

export const SERVICE_OPTIONS: readonly string[] = [
  "Tráfego pago (Meta/Google)",
  "Funis e automação",
  "Estratégia e planejamento",
  "Gestão de conteúdo",
  "CRM e integração",
  "Consultoria comercial",
];

export const CHURN_VALUES = ["expand", "renew", "undecided", "reduce", "churn"] as const;
export type ChurnValue = (typeof CHURN_VALUES)[number];

export const CHURN_LABELS: Record<ChurnValue, string> = {
  expand: "Muito satisfeito: planejo continuar e expandir",
  renew: "Satisfeito: pretendo renovar normalmente",
  undecided: "Indeciso: depende dos próximos resultados",
  reduce: "Pensando em reduzir escopo ou pausar",
  churn: "Provável que não renove",
};

export function churnToRisk(churn: ChurnValue): "low" | "medium" | "high" {
  if (churn === "expand" || churn === "renew") return "low";
  if (churn === "undecided") return "medium";
  return "high";
}

/**
 * App interno que valida o token do link (`/api/nps/validate?t=...`).
 * URL estavel; o endpoint tem CORS liberado para arvenoficial.com e a
 * validacao NUNCA bloqueia o fluxo anonimo (sem token).
 */
export const INTERNAL_API_BASE = "https://internal.arvenoficial.com";
