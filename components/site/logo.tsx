import { type SVGProps } from "react";

/**
 * Simbolo oficial Arven (versao do icone ARVEN_icone_preto_transparente).
 * Flecha apontando a direita: haste horizontal completa (a barra do meio) e
 * duas diagonais que MORREM na haste, sem vertice pontudo; a junta e reta.
 * Topo e base sao barras mais curtas alinhadas a direita. Geometria medida
 * por scanline do PNG oficial (569x465, reduzida 4x). Herda cor via
 * currentColor. pathLength=100 normaliza o comprimento para a animacao.
 */
export function ArvenMark({
  title = "Arven",
  ...props
}: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 142 116"
      role="img"
      aria-label={title}
      fill="none"
      stroke="currentColor"
      strokeWidth={10}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      {...props}
    >
      {/* diagonais da flecha: terminam na haste central, junta reta (sem bico) */}
      <path d="M29 8 L80 57 M29 108 L80 57" pathLength={100} strokeWidth={11} />
      {/* tres barras, os multiplos dados; a do meio e a haste da flecha */}
      <line x1="68" y1="25" x2="136" y2="25" pathLength={100} />
      <line x1="6" y1="57" x2="136" y2="57" pathLength={100} />
      <line x1="68" y1="90" x2="136" y2="90" pathLength={100} />
    </svg>
  );
}

/** Logotipo horizontal: simbolo + wordmark. */
export function ArvenLogo({
  className,
  markClassName,
  showWordmark = true,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: "0.62rem" }}
    >
      <ArvenMark className={markClassName} style={{ height: "0.86em", width: "auto" }} />
      {showWordmark && (
        <span
          style={{
            fontWeight: 500,
            letterSpacing: "0.3em",
            fontSize: "0.82em",
            textTransform: "uppercase",
          }}
        >
          Arven
        </span>
      )}
    </span>
  );
}
