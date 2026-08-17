import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { getSessionUser } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

export default async function LoginPage() {
  // Plataforma desativada enquanto o Supabase nao estiver configurado no ambiente.
  if (!isSupabaseConfigured()) redirect("/");

  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 space-y-2">
          <p className="text-xs tracking-[0.18em] text-[var(--color-fg-subtle)] uppercase">Arven</p>
          <h1 className="leading-[var(--leading-tight)] font-[var(--font-serif)] tracking-[var(--tracking-tight)] text-[var(--color-fg)] text-[var(--text-3xl)]">
            Entrar na plataforma
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            Enviamos um link magico pro seu email. Sem senha.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
