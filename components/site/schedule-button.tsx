"use client";

import { brand } from "@/lib/site/content";
import { useLeadGate } from "./lead-gate/provider";

/**
 * CTA de agendar reuniao. Nao navega direto: abre o pop-up de qualificacao
 * (intent "schedule"). O redirect para brand.scheduleUrl acontece la dentro,
 * depois que o lead responde e deixa o contato.
 *
 * "variant" solid = pilula preenchida; link = texto sublinhado (CTA secundario).
 * "tone" adapta ao fundo; "size" controla o preenchimento.
 */
export function ScheduleButton({
  variant = "solid",
  tone = "dark",
  size = "lg",
  label = brand.scheduleLabel,
  className = "",
}: {
  variant?: "solid" | "link";
  tone?: "dark" | "light";
  size?: "md" | "lg";
  label?: string;
  className?: string;
}) {
  const { open } = useLeadGate();

  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={() => {
          open("schedule");
        }}
        className={`link-underline text-sm font-medium ${className}`}
        style={{ color: "var(--fg)" }}
      >
        {label}
      </button>
    );
  }

  const palette =
    tone === "dark"
      ? { backgroundColor: "var(--ink)", color: "var(--cream)" }
      : { backgroundColor: "var(--cream)", color: "var(--ink)" };
  const pad = size === "lg" ? "px-7 py-4 text-sm" : "px-5 py-2.5 text-[0.82rem]";

  return (
    <button
      type="button"
      onClick={() => {
        open("schedule");
      }}
      className={`group inline-flex items-center gap-2.5 rounded-full font-medium transition-transform duration-300 hover:-translate-y-0.5 ${pad} ${className}`}
      style={palette}
    >
      {label}
      <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
    </button>
  );
}
