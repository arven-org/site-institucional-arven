"use client";

import { useState } from "react";

/**
 * Card de cliente. Tenta carregar a foto em /images/clientes/<arquivo>.
 * Se o arquivo nao existir (onError), cai para um monograma limpo.
 * Foto em preto e branco por padrao, ganha cor no hover.
 * variant "avatar": versao compacta (quadrada, sem nome) para a fileira menor.
 */
export function ClientCard({
  name,
  kind = "",
  photo,
  variant = "card",
}: {
  name: string;
  kind?: string;
  photo: string;
  variant?: "card" | "avatar";
}) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .replace(/[^A-Za-zÀ-ÿ ]/g, " ")
    .split(" ")
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();

  const isAvatar = variant === "avatar";

  return (
    <article
      title={isAvatar ? name : undefined}
      className={`group relative overflow-hidden rounded-lg ${isAvatar ? "aspect-square" : "aspect-[4/5]"}`}
      style={{ backgroundColor: "var(--ink)", border: "1px solid var(--line)" }}
    >
      {failed ? (
        <div className="flex h-full w-full items-center justify-center">
          <span
            className="display"
            style={{ fontSize: isAvatar ? "1.1rem" : "2.4rem", color: "var(--sand)" }}
          >
            {initials}
          </span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={name}
          loading="lazy"
          onError={() => {
            setFailed(true);
          }}
          className="h-full w-full object-cover grayscale transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
        />
      )}

      {!isAvatar && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, color-mix(in oklab, var(--ink) 90%, transparent), transparent 52%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p
              className="text-[0.95rem] leading-tight font-medium"
              style={{ color: "var(--cream)" }}
            >
              {name}
            </p>
            {kind ? (
              <p
                className="eyebrow mt-1"
                style={{ fontSize: "0.6rem", letterSpacing: "0.14em", color: "var(--sand-soft)" }}
              >
                {kind}
              </p>
            ) : null}
          </div>
        </>
      )}
    </article>
  );
}
