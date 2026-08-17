"use client";

import { useState } from "react";
import {
  ARVEN_TOKEN_SECTIONS,
  type TokenItem,
  type TokenSection,
} from "@/lib/site/arven-tokens-data";

/**
 * Página Design Tokens portada do site anterior: mesmo gate (e-mail
 * @arvenoficial.com + senha validada por SHA-256 no cliente), mesmos dados e
 * ações (copiar var, copiar link do token, baixar .md), UI no design novo.
 */

const HASH_HEX = "2d5a0ef2aeb36f5be57f0b3e30567a3ac858ea60d3ce6074a33f78883217ea11";
const ALLOWED_EMAIL_DOMAIN = "arvenoficial.com";

function normalizeArvenEmail(raw: string): string | null {
  const email = raw.trim().replace(/\s+/g, "").toLowerCase();
  if (!email) return null;
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!local || local.includes("@") || !/^[^\s@]+$/.test(local)) return null;
  if (domain !== ALLOWED_EMAIL_DOMAIN) return null;
  return `${local}@${domain}`;
}

async function sha256Hex(value: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function swatchColor(item: TokenItem): string | null {
  if (item.kind === "color") return item.value;
  if (item.kind === "hsl-space") return `hsl(${item.value})`;
  return null;
}

function tokenId(name: string): string {
  return `token-${name.replace(/^--/, "").replace(/[^a-z0-9-]/gi, "-")}`;
}

async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

function buildMarkdown(): string {
  const lines = [
    "# Design Tokens",
    "",
    "Variáveis primitivas e semânticas (referência espelhada do site Arven).",
    "",
  ];
  for (const section of ARVEN_TOKEN_SECTIONS) {
    lines.push(`## ${section.title}`, "");
    for (const item of section.items) {
      lines.push(`- \`${item.name}\`: ${item.value}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function downloadMarkdown(): void {
  const blob = new Blob([buildMarkdown()], { type: "text/markdown;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "arven-design-tokens.md";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  document.body.removeChild(a);
}

export function TemplatesClient() {
  const [unlocked, setUnlocked] = useState(false);

  return unlocked ? (
    <TokensApp />
  ) : (
    <Gate
      onUnlock={() => {
        setUnlocked(true);
      }}
    />
  );
}

function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const email = normalizeArvenEmail((form.elements.namedItem("email") as HTMLInputElement).value);
    if (!email) {
      setError(`Use um e-mail no domínio @${ALLOWED_EMAIL_DOMAIN} (conta Google da Arven).`);
      return;
    }
    const password = (form.elements.namedItem("password") as HTMLInputElement).value.trim();
    if (!password) {
      setError("Digite a senha.");
      return;
    }

    setChecking(true);
    try {
      const hex = await sha256Hex(password);
      if (hex === HASH_HEX) {
        onUnlock();
      } else {
        setError("E-mail ou senha incorretos.");
      }
    } catch {
      setError("Não foi possível validar. Confirme que está em https:// e tente de novo.");
    } finally {
      setChecking(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--cream)",
    border: "1px solid var(--line)",
    color: "var(--fg)",
  };

  return (
    <section className="shell flex min-h-screen items-center justify-center pt-24 pb-16">
      <div
        className="w-full max-w-md rounded-2xl p-8 md:p-10"
        style={{ border: "1px solid var(--line)" }}
      >
        <span className="eyebrow" style={{ color: "var(--sand)" }}>
          Acesso restrito
        </span>
        <h1 className="display mt-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>
          Design Tokens
        </h1>
        <p className="mt-4 text-[0.95rem]" style={{ color: "var(--fg-muted)" }}>
          Use seu e-mail <strong>@{ALLOWED_EMAIL_DOMAIN}</strong> (Google Workspace da Arven) e a
          senha de acesso.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4" noValidate>
          <div>
            <label htmlFor="templates-email" className="text-sm font-medium">
              E-mail corporativo
            </label>
            <input
              id="templates-email"
              name="email"
              type="email"
              autoComplete="username"
              inputMode="email"
              required
              placeholder={`voce@${ALLOWED_EMAIL_DOMAIN}`}
              className="mt-2 w-full rounded-lg px-4 py-3 text-[0.95rem] outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="templates-password" className="text-sm font-medium">
              Senha
            </label>
            <input
              id="templates-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Senha"
              className="mt-2 w-full rounded-lg px-4 py-3 text-[0.95rem] outline-none"
              style={inputStyle}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm" style={{ color: "#b4231f" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={checking}
            className="w-full rounded-lg py-3 text-[0.95rem] font-medium transition-opacity hover:opacity-85 disabled:opacity-60"
            style={{ backgroundColor: "var(--ink)", color: "var(--cream)" }}
          >
            {checking ? "Verificando…" : "Entrar"}
          </button>
        </form>
      </div>
    </section>
  );
}

function TokensApp() {
  return (
    <section className="shell pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="max-w-2xl">
        <span className="eyebrow" style={{ color: "var(--sand)" }}>
          Design system
        </span>
        <h1 className="display mt-6" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}>
          Design Tokens
        </h1>
        <p className="lead mt-6">
          Variáveis primitivas e semânticas do ecossistema Arven. Copie a variável, o link do token
          ou baixe o .md completo.
        </p>
        <button
          type="button"
          onClick={downloadMarkdown}
          className="mt-8 inline-flex rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-85"
          style={{ backgroundColor: "var(--ink)", color: "var(--cream)" }}
        >
          Baixar .md
        </button>
      </div>

      <nav aria-label="Nesta página" className="mt-14 flex flex-wrap gap-x-5 gap-y-2">
        {ARVEN_TOKEN_SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="link-underline text-sm"
            style={{ color: "var(--fg-muted)" }}
          >
            {section.title}
          </a>
        ))}
      </nav>

      <div className="mt-6">
        {ARVEN_TOKEN_SECTIONS.map((section) => (
          <Section key={section.id} section={section} />
        ))}
      </div>
    </section>
  );
}

function Section({ section }: { section: TokenSection }) {
  return (
    <section id={section.id} className="mt-14 scroll-mt-28">
      <h2 className="display" style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.7rem)" }}>
        {section.title}
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {section.items.map((item) => (
          <TokenCard key={item.name} item={item} />
        ))}
      </div>
    </section>
  );
}

function TokenCard({ item }: { item: TokenItem }) {
  const [copied, setCopied] = useState<"var" | "link" | null>(null);
  const id = tokenId(item.name);
  const bg = swatchColor(item);
  const isTransparent = item.kind === "special" && item.value === "transparent";

  function flash(kind: "var" | "link") {
    setCopied(kind);
    window.setTimeout(() => {
      setCopied(null);
    }, 1400);
  }

  return (
    <article
      id={id}
      className="flex scroll-mt-28 items-center gap-4 rounded-xl p-4"
      style={{ border: "1px solid var(--line)" }}
    >
      <div
        aria-hidden
        className="h-11 w-11 shrink-0 rounded-lg text-center leading-[2.75rem]"
        style={
          isTransparent
            ? {
                border: "1px solid var(--line)",
                backgroundImage:
                  "linear-gradient(45deg, var(--line) 25%, transparent 25%, transparent 75%, var(--line) 75%), linear-gradient(45deg, var(--line) 25%, transparent 25%, transparent 75%, var(--line) 75%)",
                backgroundSize: "10px 10px",
                backgroundPosition: "0 0, 5px 5px",
              }
            : bg
              ? { backgroundColor: bg, border: "1px solid var(--line)" }
              : { border: "1px solid var(--line)", color: "var(--fg-subtle)" }
        }
      >
        {bg || isTransparent ? "" : "·"}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-[0.8rem]" style={{ color: "var(--fg)" }}>
          {item.name}
        </p>
        <p className="truncate font-mono text-[0.75rem]" style={{ color: "var(--fg-subtle)" }}>
          {item.display ?? item.value}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          title="Copiar var(...)"
          onClick={() => {
            copyText(`${item.name}: ${item.value};`).then(
              () => {
                flash("var");
              },
              () => undefined,
            );
          }}
          className="rounded-md px-2 py-1 text-[0.72rem] font-medium transition-colors"
          style={{
            border: "1px solid var(--line)",
            color: copied === "var" ? "var(--cream)" : "var(--fg-muted)",
            backgroundColor: copied === "var" ? "var(--ink)" : "transparent",
          }}
        >
          {copied === "var" ? "Copiado" : "Copiar"}
        </button>
        <button
          type="button"
          title="Copiar link deste token"
          onClick={() => {
            copyText(`${window.location.origin}${window.location.pathname}#${id}`).then(
              () => {
                flash("link");
              },
              () => undefined,
            );
          }}
          className="rounded-md px-2 py-1 text-[0.72rem] font-medium transition-colors"
          style={{
            border: "1px solid var(--line)",
            color: copied === "link" ? "var(--cream)" : "var(--fg-muted)",
            backgroundColor: copied === "link" ? "var(--ink)" : "transparent",
          }}
        >
          #
        </button>
      </div>
    </article>
  );
}
