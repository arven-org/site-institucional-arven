"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { publicEnv } from "@/lib/env";

const emailSchema = z.email("Email invalido.");

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string };

export function LoginForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    const raw = formData.get("email");
    const parsed = emailSchema.safeParse(raw);
    if (!parsed.success) {
      setStatus({ kind: "error", message: "Informe um email valido." });
      return;
    }

    setStatus({ kind: "submitting" });

    startTransition(async () => {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email: parsed.data,
        options: {
          emailRedirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/auth/callback`,
          shouldCreateUser: false,
        },
      });

      if (error) {
        setStatus({ kind: "error", message: error.message });
        return;
      }
      setStatus({ kind: "sent", email: parsed.data });
    });
  }

  if (status.kind === "sent") {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-fg-muted)]"
      >
        <p className="text-[var(--color-fg)]">Cheque seu email.</p>
        <p className="mt-1">
          Enviamos o link pra <span className="text-[var(--color-fg)]">{status.email}</span>. Pode
          fechar esta aba.
        </p>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4" noValidate>
      <label className="block space-y-2">
        <span className="text-sm text-[var(--color-fg-muted)]">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={status.kind === "submitting"}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-[var(--color-fg)] transition-[border-color,box-shadow] duration-[var(--duration-fast)] outline-none placeholder:text-[var(--color-fg-subtle)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30 disabled:opacity-60"
          placeholder="voce@empresa.com"
        />
      </label>

      {status.kind === "error" && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={status.kind === "submitting"}
        className="w-full rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-2.5 text-sm font-[var(--weight-medium)] text-[var(--color-accent-fg)] transition-[background-color,opacity] duration-[var(--duration-fast)] hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
      >
        {status.kind === "submitting" ? "Enviando..." : "Enviar link magico"}
      </button>
    </form>
  );
}
