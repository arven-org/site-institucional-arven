/**
 * Modelo de qualificacao do lead. Fonte unica de verdade, compartilhada entre
 * o modal (cliente) e a server action que grava no Supabase (servidor).
 *
 * Regra de qualificacao (definida pela lideranca): um lead e qualificado quando
 *   1. ja investe ao menos R$3 mil por mes em trafego pago, E
 *   2. tem ao menos 1 pessoa no time comercial.
 *
 * Politica de funil: ninguem e bloqueado. Todo mundo passa e segue para a acao
 * (agendar reuniao ou checkout do ebook). O flag `qualified` apenas etiqueta o
 * lead para o comercial priorizar.
 */

import { brand } from "./content";

export type LeadIntent = "schedule" | "ebook";

/** Valores canonicos das respostas. Tuplas const para tipar e validar com Zod. */
export const trafficValues = ["none", "lt-3k", "3k-10k", "gt-10k"] as const;
export const commercialValues = ["0", "1", "2-5", "5+"] as const;

export type TrafficValue = (typeof trafficValues)[number];
export type CommercialValue = (typeof commercialValues)[number];

interface ChoiceOption<V extends string> {
  value: V;
  label: string;
  /** Se marcar esta opcao contribui para qualificar o lead. */
  qualifies: boolean;
}

interface LeadQuestion<V extends string> {
  id: "traffic" | "commercial";
  step: string;
  title: string;
  options: readonly ChoiceOption<V>[];
}

export const trafficQuestion: LeadQuestion<TrafficValue> = {
  id: "traffic",
  step: "Pergunta 1 de 2",
  title: "Quanto você investe por mês em tráfego pago hoje?",
  options: [
    { value: "none", label: "Ainda não invisto", qualifies: false },
    { value: "lt-3k", label: "Menos de R$3 mil", qualifies: false },
    { value: "3k-10k", label: "R$3 mil a R$10 mil", qualifies: true },
    { value: "gt-10k", label: "Mais de R$10 mil", qualifies: true },
  ],
};

export const commercialQuestion: LeadQuestion<CommercialValue> = {
  id: "commercial",
  step: "Pergunta 2 de 2",
  title: "Quantas pessoas você tem no time comercial?",
  options: [
    { value: "0", label: "Não tenho time comercial", qualifies: false },
    { value: "1", label: "1 pessoa", qualifies: true },
    { value: "2-5", label: "2 a 5 pessoas", qualifies: true },
    { value: "5+", label: "Mais de 5 pessoas", qualifies: true },
  ],
};

/** Regra dos R$3 mil + 1 comercial. Ambos precisam qualificar. */
export function isQualified(traffic: TrafficValue, commercial: CommercialValue): boolean {
  const t = trafficQuestion.options.find((o) => o.value === traffic);
  const c = commercialQuestion.options.find((o) => o.value === commercial);
  return Boolean(t?.qualifies && c?.qualifies);
}

/** Copy e destino final de cada intencao de CTA. */
export const intentConfig: Record<
  LeadIntent,
  { eyebrow: string; title: string; subtitle: string; submitLabel: string; destination: string }
> = {
  schedule: {
    eyebrow: "Agendar reunião",
    title: "Vamos falar sobre o seu crescimento.",
    subtitle: "Duas perguntas rápidas para o nosso time chegar na conversa já preparado.",
    submitLabel: "Agendar reunião",
    destination: brand.scheduleUrl,
  },
  ebook: {
    eyebrow: "Ebook · Método ADv",
    title: "O método ADv, na sua mão.",
    subtitle: "Duas perguntas rápidas e liberamos o seu acesso ao ebook.",
    submitLabel: "Ir para o checkout",
    destination: brand.checkoutUrl,
  },
};
