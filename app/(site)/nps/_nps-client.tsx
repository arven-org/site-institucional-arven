"use client";

import Link from "next/link";
import { useEffect, useState, type KeyboardEvent } from "react";
import {
  CHURN_LABELS,
  CHURN_VALUES,
  INTERNAL_API_BASE,
  P2_QUESTION,
  SERVICE_OPTIONS,
  TAGS_BY_SEGMENT,
  segmentFromScore,
  type ChurnValue,
  type NpsSegment,
} from "@/lib/site/nps";
import { submitNps } from "./actions";

/**
 * Form NPS (spec Arven v1.0), porta do site Astro anterior.
 * Fluxo linear: P1 (nota) → P2 (razões por segmento) → P3 → P4 (serviços)
 * → P5 → P6 (contrato) → P7 → Revisão → server action.
 *
 * Com `?t=<token>` o link é validado no app interno: saúda o cliente ou
 * mostra link inválido/expirado/respondido. Sem token, fluxo anônimo igual.
 */

const STEPS = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "revisao"] as const;
type StepKey = (typeof STEPS)[number];

type TokenCheck =
  | { state: "none" }
  | { state: "greeting"; message: string }
  | { state: "invalid"; message: string };

const INVALID_REASONS: Record<string, string> = {
  expired: "Este link de avaliação expirou.",
  answered: "Esta avaliação já foi respondida. Obrigado!",
  not_found: "Link de avaliação inválido.",
};

export function NpsClient() {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [opentext, setOpentext] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [improve, setImprove] = useState("");
  const [churn, setChurn] = useState<ChurnValue | null>(null);
  const [upsell, setUpsell] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  // Lazy: no prerender (sem window) fica null; no browser lê ?t= uma vez.
  const [token] = useState<string | null>(() =>
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("t"),
  );
  const [tokenCheck, setTokenCheck] = useState<TokenCheck>({ state: "none" });

  const stepKey: StepKey = STEPS[idx] ?? "p1";
  const total = STEPS.length;
  const segment: NpsSegment | null = score === null ? null : segmentFromScore(score);

  useEffect(() => {
    if (token === null || token === "") return;
    const controller = new AbortController();
    void fetch(`${INTERNAL_API_BASE}/api/nps/validate?t=${encodeURIComponent(token)}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then(
        (res: { valid?: boolean; reason?: string; customerName?: string; mesLabel?: string }) => {
          if (res.valid === true) {
            if (typeof res.customerName === "string" && res.customerName !== "") {
              setTokenCheck({
                state: "greeting",
                message: `Olá, ${res.customerName}. Avaliação referente a ${res.mesLabel ?? "este mês"}.`,
              });
            }
          } else {
            setTokenCheck({
              state: "invalid",
              message: INVALID_REASONS[res.reason ?? "not_found"] ?? "Link de avaliação inválido.",
            });
          }
        },
      )
      .catch(() => {
        // Validação nunca bloqueia o fluxo normal/anônimo.
      });
    return () => {
      controller.abort();
    };
  }, [token]);

  function chooseScore(n: number) {
    if (score !== n) setReasons([]);
    setScore(n);
    setStepError(null);
  }

  function toggleReason(tag: string) {
    setStepError(null);
    setReasons((prev) => {
      if (prev.includes(tag)) return prev.filter((r) => r !== tag);
      if (prev.length >= 3) {
        setStepError("Você pode escolher no máximo 3 opções.");
        return prev;
      }
      return [...prev, tag];
    });
  }

  function toggleService(svc: string) {
    setStepError(null);
    setServices((prev) => (prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]));
  }

  function stepValid(key: StepKey): boolean {
    if (key === "p1") return score !== null;
    if (key === "p2") return reasons.length >= 1 && reasons.length <= 3;
    if (key === "p4") return services.length >= 1;
    if (key === "p6") return churn !== null;
    return true;
  }

  function stepErrorMessage(key: StepKey): string {
    if (key === "p1") return "Selecione uma nota de 0 a 10 para continuar.";
    if (key === "p2")
      return reasons.length < 1
        ? "Selecione pelo menos uma razão."
        : "Selecione no máximo 3 razões.";
    if (key === "p4") return "Selecione pelo menos um serviço.";
    return "Selecione uma opção sobre seu contrato ou plano.";
  }

  const formComplete =
    score !== null &&
    reasons.length >= 1 &&
    reasons.length <= 3 &&
    services.length >= 1 &&
    churn !== null;

  function goNext() {
    if (!stepValid(stepKey)) {
      setStepError(stepErrorMessage(stepKey));
      return;
    }
    setStepError(null);
    setIdx((i) => Math.min(i + 1, total - 1));
  }

  function goPrev() {
    setStepError(null);
    setIdx((i) => Math.max(i - 1, 0));
  }

  async function onSubmit() {
    if (submitting || score === null || churn === null) return;
    if (website.trim() !== "") return; // honeypot: bot preencheu, não envia
    setSubmitting(true);
    setStepError(null);

    const urlParams = new URLSearchParams(window.location.search);
    const result = await submitNps({
      score,
      reasons,
      opentext: opentext.trim() === "" ? null : opentext.trim(),
      services,
      improve: improve.trim() === "" ? null : improve.trim(),
      churn,
      upsell: upsell.trim() === "" ? null : upsell.trim(),
      token,
      page: window.location.pathname + window.location.search,
      referrer: document.referrer === "" ? null : document.referrer,
      ref: urlParams.get("ref"),
      utm_source: urlParams.get("utm_source"),
      website,
    });

    if (!result.ok) {
      setStepError(result.error);
      setSubmitting(false);
      return;
    }
    setDone(true);
  }

  function onKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key !== "Enter") return;
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "TEXTAREA") return;
    e.preventDefault();
    if (stepKey === "revisao") {
      if (formComplete && !submitting) void onSubmit();
    } else {
      goNext();
    }
  }

  return (
    <section className="relative overflow-hidden">
      <div className="shell pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="mx-auto w-full max-w-2xl" data-reveal>
          <span className="eyebrow">Avaliação NPS</span>

          {done ? (
            <SuccessPanel />
          ) : tokenCheck.state === "invalid" ? (
            <InvalidPanel message={tokenCheck.message} />
          ) : (
            <>
              <h1
                className="display mt-6"
                style={{ fontSize: "clamp(1.8rem, 4.5vw, 2.8rem)", lineHeight: 1.05 }}
              >
                Sua opinião molda como a Arven atende você e outros empresários.
              </h1>

              {tokenCheck.state === "greeting" ? (
                <p className="lead mt-4 text-[0.95rem]">{tokenCheck.message}</p>
              ) : null}

              {/* Progresso */}
              <div className="mt-10 flex items-center gap-3">
                <span className="eyebrow shrink-0" style={{ fontSize: "0.66rem" }} aria-hidden>
                  {String(idx + 1)}/{String(total)}
                </span>
                <div
                  className="flex flex-1 items-center gap-1.5"
                  role="progressbar"
                  aria-valuemin={1}
                  aria-valuemax={total}
                  aria-valuenow={idx + 1}
                  aria-label="Progresso da avaliação"
                >
                  {STEPS.map((s, i) => (
                    <span
                      key={s}
                      className="h-1 flex-1 rounded-full transition-colors duration-300"
                      style={{ backgroundColor: i <= idx ? "var(--fg)" : "var(--line-strong)" }}
                    />
                  ))}
                </div>
              </div>

              <form
                className="mt-8"
                noValidate
                onKeyDown={onKeyDown}
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                {/* Honeypot: escondido de humanos, isca para bots. */}
                <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
                  <label>
                    Não preencha
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(e) => {
                        setWebsite(e.target.value);
                      }}
                    />
                  </label>
                </div>

                {stepKey === "p1" ? (
                  <fieldset>
                    <legend className="text-[0.98rem] font-medium">
                      Em uma escala de 0 a 10, qual a probabilidade de você recomendar a Arven para
                      outro empresário ou sócio?
                    </legend>
                    <div
                      className="mt-5 grid grid-cols-6 gap-2 sm:grid-cols-11"
                      role="group"
                      aria-label="Nota de 0 a 10"
                    >
                      {Array.from({ length: 11 }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Nota ${String(i)}`}
                          aria-pressed={score === i}
                          onClick={() => {
                            chooseScore(i);
                          }}
                          className="flex h-11 items-center justify-center rounded-xl border text-[0.95rem] font-medium transition-[background,border-color,transform] duration-200 hover:-translate-y-px"
                          style={{
                            borderColor: score === i ? "var(--fg)" : "var(--line-strong)",
                            backgroundColor: score === i ? "var(--fg)" : "transparent",
                            color: score === i ? "var(--bg)" : "var(--fg)",
                          }}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                    <div
                      className="mt-3 flex justify-between text-[0.75rem]"
                      style={{ color: "var(--fg-subtle)" }}
                    >
                      <span>Muito improvável</span>
                      <span>Muito provável</span>
                    </div>
                  </fieldset>
                ) : null}

                {stepKey === "p2" && segment !== null ? (
                  <fieldset>
                    <legend className="text-[0.98rem] font-medium">{P2_QUESTION[segment]}</legend>
                    <p className="mt-1.5 text-[0.82rem]" style={{ color: "var(--fg-subtle)" }}>
                      Selecione de 1 a 3 opções.
                    </p>
                    <div className="mt-5 space-y-2.5" role="group" aria-label="Razões">
                      {TAGS_BY_SEGMENT[segment].map((tag) => (
                        <ChoiceButton
                          key={tag}
                          label={tag}
                          selected={reasons.includes(tag)}
                          onClick={() => {
                            toggleReason(tag);
                          }}
                        />
                      ))}
                    </div>
                  </fieldset>
                ) : null}

                {stepKey === "p3" ? (
                  <TextareaStep
                    id="nps-opentext"
                    label="Pode nos contar mais sobre isso? O que especificamente fez você dar essa nota?"
                    placeholder="Escreva com suas próprias palavras…"
                    rows={5}
                    value={opentext}
                    onChange={setOpentext}
                  />
                ) : null}

                {stepKey === "p4" ? (
                  <fieldset>
                    <legend className="text-[0.98rem] font-medium">
                      Quais serviços ou entregas da Arven você mais usa hoje?
                    </legend>
                    <p className="mt-1.5 text-[0.82rem]" style={{ color: "var(--fg-subtle)" }}>
                      Selecione todos que se aplicam.
                    </p>
                    <div className="mt-5 space-y-2.5" role="group" aria-label="Serviços">
                      {SERVICE_OPTIONS.map((svc) => (
                        <ChoiceButton
                          key={svc}
                          label={svc}
                          selected={services.includes(svc)}
                          onClick={() => {
                            toggleService(svc);
                          }}
                        />
                      ))}
                    </div>
                  </fieldset>
                ) : null}

                {stepKey === "p5" ? (
                  <TextareaStep
                    id="nps-improve"
                    label="Se a Arven pudesse melhorar uma coisa para o seu negócio, o que seria?"
                    placeholder="Seja direto: sua resposta vai direto para quem decide."
                    rows={4}
                    value={improve}
                    onChange={setImprove}
                  />
                ) : null}

                {stepKey === "p6" ? (
                  <fieldset>
                    <legend className="text-[0.98rem] font-medium">
                      Como você se sente em relação ao seu contrato ou plano atual com a Arven?
                    </legend>
                    <div className="mt-5 space-y-2.5" role="radiogroup" aria-label="Risco de churn">
                      {CHURN_VALUES.map((value) => (
                        <ChoiceButton
                          key={value}
                          label={CHURN_LABELS[value]}
                          selected={churn === value}
                          onClick={() => {
                            setStepError(null);
                            setChurn(value);
                          }}
                        />
                      ))}
                    </div>
                  </fieldset>
                ) : null}

                {stepKey === "p7" ? (
                  <TextareaStep
                    id="nps-upsell"
                    label="Há algum resultado ou oportunidade que você ainda não explorou com a Arven, mas gostaria?"
                    hint="Pode ser algo novo, um canal diferente, uma área do negócio. Quanto mais específico, melhor."
                    placeholder="Ex.: nunca testamos Google Ads, mas gostaria de entender se faz sentido…"
                    rows={4}
                    value={upsell}
                    onChange={setUpsell}
                  />
                ) : null}

                {stepKey === "revisao" ? (
                  <div>
                    <p className="text-[0.98rem] font-medium">
                      Confira suas respostas. Ao confirmar, seus dados serão enviados com segurança.
                    </p>
                    <dl
                      className="mt-6 space-y-4 border-t pt-6"
                      style={{ borderColor: "var(--line)" }}
                    >
                      {[
                        ["Nota NPS", score === null ? "Não informado" : String(score)],
                        ["Segmento", segment ?? "Não informado"],
                        ["Razões", reasons.length > 0 ? reasons.join("; ") : "Não informado"],
                        [
                          "Comentário aberto",
                          opentext.trim() === "" ? "Não informado" : opentext.trim(),
                        ],
                        ["Serviços", services.length > 0 ? services.join("; ") : "Não informado"],
                        ["Melhoria", improve.trim() === "" ? "Não informado" : improve.trim()],
                        [
                          "Contrato / plano",
                          churn === null ? "Não informado" : CHURN_LABELS[churn],
                        ],
                        ["Oportunidade", upsell.trim() === "" ? "Não informado" : upsell.trim()],
                      ].map(([dt, dd]) => (
                        <div key={dt}>
                          <dt className="eyebrow" style={{ fontSize: "0.64rem" }}>
                            {dt}
                          </dt>
                          <dd className="mt-1 text-[0.92rem]" style={{ color: "var(--fg-muted)" }}>
                            {dd}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}

                {stepError !== null ? (
                  <p className="mt-5 text-[0.85rem]" style={{ color: "#c0554a" }} role="alert">
                    {stepError}
                  </p>
                ) : null}

                <div className="mt-8 flex items-center gap-4">
                  {idx > 0 ? (
                    <button
                      type="button"
                      onClick={goPrev}
                      disabled={submitting}
                      className="link-underline inline-flex items-center gap-1.5 text-[0.82rem] disabled:opacity-40"
                      style={{ color: "var(--fg-subtle)" }}
                    >
                      <span aria-hidden>&larr;</span> Voltar
                    </button>
                  ) : null}
                  <div className="flex-1" />
                  {stepKey === "revisao" ? (
                    <button
                      type="button"
                      onClick={() => {
                        void onSubmit();
                      }}
                      disabled={submitting || !formComplete}
                      className="inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-sm font-medium transition-[transform,opacity] duration-300 enabled:hover:-translate-y-0.5 disabled:opacity-40"
                      style={{ backgroundColor: "var(--fg)", color: "var(--bg)" }}
                    >
                      {submitting ? "Enviando…" : "Confirmar envio"}
                      {submitting ? null : <span aria-hidden>&rarr;</span>}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!stepValid(stepKey)}
                      className="inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-sm font-medium transition-[transform,opacity] duration-300 enabled:hover:-translate-y-0.5 disabled:opacity-40"
                      style={{ backgroundColor: "var(--fg)", color: "var(--bg)" }}
                    >
                      Continuar
                      <span aria-hidden>&rarr;</span>
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function SuccessPanel() {
  return (
    <div role="status" aria-live="polite">
      <h1 className="display mt-6" style={{ fontSize: "clamp(1.8rem, 4.5vw, 2.8rem)" }}>
        Obrigado pela sua avaliação!
      </h1>
      <p className="lead mt-4 max-w-lg text-[0.95rem]">
        Suas respostas foram registradas. Elas nos ajudam a evoluir o trabalho e o relacionamento
        com você.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-sm font-medium transition-transform duration-300 hover:-translate-y-0.5"
        style={{ backgroundColor: "var(--fg)", color: "var(--bg)" }}
      >
        Voltar ao início
        <span aria-hidden>&rarr;</span>
      </Link>
    </div>
  );
}

function InvalidPanel({ message }: { message: string }) {
  return (
    <div role="status" aria-live="polite">
      <h1 className="display mt-6" style={{ fontSize: "clamp(1.8rem, 4.5vw, 2.8rem)" }}>
        {message}
      </h1>
      <p className="lead mt-4 max-w-lg text-[0.95rem]">
        Se você acredita que isso é um engano, fale com o seu contato na Arven para receber um novo
        link.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-sm font-medium transition-transform duration-300 hover:-translate-y-0.5"
        style={{ backgroundColor: "var(--fg)", color: "var(--bg)" }}
      >
        Voltar ao início
        <span aria-hidden>&rarr;</span>
      </Link>
    </div>
  );
}

function ChoiceButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left text-[0.95rem] font-medium transition-[background,border-color,transform] duration-200 hover:-translate-y-px"
      style={{
        borderColor: selected ? "var(--fg)" : "var(--line-strong)",
        backgroundColor: selected ? "var(--fg)" : "transparent",
        color: selected ? "var(--bg)" : "var(--fg)",
      }}
    >
      {label}
      <span
        className="ml-4 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors"
        style={{ borderColor: selected ? "var(--bg)" : "var(--line-strong)" }}
      >
        {selected ? (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M2.5 6.2l2.3 2.3L9.5 3.5"
              stroke="var(--bg)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
    </button>
  );
}

function TextareaStep({
  id,
  label,
  hint,
  placeholder,
  rows,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  placeholder: string;
  rows: number;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[0.98rem] font-medium">
        {label}
      </label>
      {hint !== undefined ? (
        <p className="mt-1.5 text-[0.82rem]" style={{ color: "var(--fg-subtle)" }}>
          {hint}
        </p>
      ) : null}
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className="mt-5 w-full rounded-xl border bg-transparent px-4 py-3.5 text-[0.95rem] transition-colors outline-none placeholder:opacity-45 focus:border-[color:var(--fg)]"
        style={{ borderColor: "var(--line-strong)", color: "var(--fg)" }}
      />
    </div>
  );
}
