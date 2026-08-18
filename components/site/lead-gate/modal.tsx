"use client";

import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  commercialQuestion,
  intentConfig,
  trafficQuestion,
  type CommercialValue,
  type LeadIntent,
  type TrafficValue,
} from "@/lib/site/lead-gate";
import { submitLead } from "./actions";

type Step = "traffic" | "commercial" | "contact" | "success";
const STEP_ORDER: Step[] = ["traffic", "commercial", "contact"];

export function LeadModal({
  open,
  session,
  onOpenChange,
}: {
  open: boolean;
  session: { intent: LeadIntent; key: number } | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Overlay className="lead-overlay" />
      <Dialog.Content className="lead-card theme-ink" aria-describedby={undefined}>
        {session ? <LeadFlow key={session.key} intent={session.intent} /> : null}
      </Dialog.Content>
    </Dialog.Root>
  );
}

function LeadFlow({ intent }: { intent: LeadIntent }) {
  const config = intentConfig[intent];
  const [step, setStep] = useState<Step>("traffic");
  const [traffic, setTraffic] = useState<TrafficValue | null>(null);
  const [commercial, setCommercial] = useState<CommercialValue | null>(null);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const stepIndex = STEP_ORDER.indexOf(step);

  function chooseTraffic(v: TrafficValue) {
    setTraffic(v);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      setStep("commercial");
    }, 260);
  }

  function chooseCommercial(v: CommercialValue) {
    setCommercial(v);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      setStep("contact");
    }, 260);
  }

  function redirect() {
    // Agendar leva pro Google Calendar (30min); checkout do ebook navega para fora.
    window.location.href = config.destination;
  }

  async function onSubmit(e: SyntheticEvent) {
    e.preventDefault();
    if (submitting || !traffic || !commercial) return;
    setSubmitting(true);
    setError(null);

    const result = await submitLead({
      name,
      whatsapp,
      intent,
      traffic,
      commercial,
      website,
      sourcePath: typeof window !== "undefined" ? window.location.pathname : undefined,
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setStep("success");
    // Deixa o usuario ver a confirmacao antes de sair para o destino.
    setTimeout(redirect, 1100);
  }

  return (
    <div className="relative">
      <Dialog.Close
        aria-label="Fechar"
        className="absolute top-0 right-0 -m-1 flex h-9 w-9 items-center justify-center rounded-full transition-opacity hover:opacity-60"
        style={{ color: "var(--fg-muted)" }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M3 3l10 10M13 3L3 13"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </Dialog.Close>

      {/* Cabecalho */}
      <span className="eyebrow">{config.eyebrow}</span>

      {step === "success" ? (
        <SuccessView config={config} onRedirect={redirect} />
      ) : (
        <>
          <Dialog.Title
            className="display mt-4"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", lineHeight: 1.05 }}
          >
            {step === "contact" ? "Falta só o seu contato." : config.title}
          </Dialog.Title>
          {step === "traffic" ? (
            <Dialog.Description className="lead mt-3 text-[0.95rem]">
              {config.subtitle}
            </Dialog.Description>
          ) : null}

          {/* Progresso */}
          <div className="mt-7 flex items-center gap-2" aria-hidden>
            {STEP_ORDER.map((s, i) => (
              <span
                key={s}
                className="h-1 flex-1 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: i <= stepIndex ? "var(--fg)" : "var(--line-strong)",
                }}
              />
            ))}
          </div>

          {/* Passos de qualificacao */}
          {step === "traffic" ? (
            <fieldset className="mt-6 space-y-2.5">
              <legend className="sr-only">{trafficQuestion.title}</legend>
              <p className="mb-4 text-[0.98rem] font-medium">{trafficQuestion.title}</p>
              {trafficQuestion.options.map((o) => (
                <ChoiceButton
                  key={o.value}
                  label={o.label}
                  selected={traffic === o.value}
                  onClick={() => {
                    chooseTraffic(o.value);
                  }}
                />
              ))}
            </fieldset>
          ) : null}

          {step === "commercial" ? (
            <fieldset className="mt-6 space-y-2.5">
              <legend className="sr-only">{commercialQuestion.title}</legend>
              <p className="mb-4 text-[0.98rem] font-medium">{commercialQuestion.title}</p>
              {commercialQuestion.options.map((o) => (
                <ChoiceButton
                  key={o.value}
                  label={o.label}
                  selected={commercial === o.value}
                  onClick={() => {
                    chooseCommercial(o.value);
                  }}
                />
              ))}
              <BackButton
                onClick={() => {
                  setStep("traffic");
                }}
              />
            </fieldset>
          ) : null}

          {/* Captura de contato */}
          {step === "contact" ? (
            <form
              className="mt-6"
              onSubmit={(e) => {
                void onSubmit(e);
              }}
              noValidate
            >
              <Input
                label="Nome"
                value={name}
                onChange={setName}
                autoComplete="name"
                placeholder="Como podemos te chamar?"
                autoFocus
              />
              <Input
                label="WhatsApp"
                value={whatsapp}
                onChange={setWhatsapp}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(11) 99999-9999"
                className="mt-4"
              />

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

              {error ? (
                <p className="mt-4 text-[0.85rem]" style={{ color: "#e5837a" }} role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting || name.trim().length === 0 || whatsapp.trim().length < 8}
                className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full px-7 py-4 text-sm font-medium transition-[transform,opacity] duration-300 enabled:hover:-translate-y-0.5 disabled:opacity-40"
                style={{ backgroundColor: "var(--cream)", color: "var(--ink)" }}
              >
                {submitting ? "Enviando..." : config.submitLabel}
                {submitting ? null : <span aria-hidden>&rarr;</span>}
              </button>
              <BackButton
                onClick={() => {
                  setStep("commercial");
                }}
              />

              <p className="mt-5 text-center text-[0.72rem]" style={{ color: "var(--fg-subtle)" }}>
                Seus dados ficam com a Arven. Sem spam.
              </p>
            </form>
          ) : null}
        </>
      )}
    </div>
  );
}

function SuccessView({
  config,
  onRedirect,
}: {
  config: (typeof intentConfig)[LeadIntent];
  onRedirect: () => void;
}) {
  return (
    <div className="py-2">
      <Dialog.Title className="display mt-4" style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>
        Tudo certo.
      </Dialog.Title>
      <p className="lead mt-3 text-[0.95rem]">
        Recebemos suas respostas. Te levando para o próximo passo...
      </p>
      <button
        onClick={onRedirect}
        className="mt-7 inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-sm font-medium transition-transform duration-300 hover:-translate-y-0.5"
        style={{ backgroundColor: "var(--cream)", color: "var(--ink)" }}
      >
        {config.submitLabel}
        <span aria-hidden>&rarr;</span>
      </button>
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
      className="flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left text-[0.95rem] font-medium transition-[background,border-color,transform] duration-200 hover:-translate-y-px"
      style={{
        borderColor: selected ? "var(--cream)" : "var(--line-strong)",
        backgroundColor: selected ? "var(--cream)" : "transparent",
        color: selected ? "var(--ink)" : "var(--fg)",
      }}
    >
      {label}
      <span
        className="ml-4 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors"
        style={{ borderColor: selected ? "var(--ink)" : "var(--line-strong)" }}
      >
        {selected ? (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M2.5 6.2l2.3 2.3L9.5 3.5"
              stroke="var(--ink)"
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

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="link-underline mt-5 inline-flex items-center gap-1.5 text-[0.82rem]"
      style={{ color: "var(--fg-subtle)" }}
    >
      <span aria-hidden>&larr;</span> Voltar
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  className = "",
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const id = useMemo(() => `lead-${label.toLowerCase()}`, [label]);
  return (
    <div className={className}>
      <label htmlFor={id} className="eyebrow mb-2 block" style={{ fontSize: "0.66rem" }}>
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className="w-full rounded-xl border bg-transparent px-4 py-3.5 text-[0.95rem] transition-colors outline-none placeholder:opacity-45 focus:border-[color:var(--cream)]"
        style={{ borderColor: "var(--line-strong)", color: "var(--fg)" }}
        {...rest}
      />
    </div>
  );
}
