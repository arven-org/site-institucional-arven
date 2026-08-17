import { type SVGProps } from "react";

/**
 * Simbolo oficial Arven. Chevron apontando a direita (vertice unico no centro,
 * caudas para a esquerda) somado as tres barras horizontais: a do meio mais
 * longa, atravessando o vertice; topo e base mais curtas e alinhadas a direita.
 * Traco uniforme, vertice limpo (path unico). Herda cor via currentColor.
 * pathLength=100 normaliza o comprimento para a animacao de desenho.
 */
export function ArvenMark({
  title = "Arven",
  ...props
}: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 150 104"
      role="img"
      aria-label={title}
      fill="none"
      stroke="currentColor"
      strokeWidth={11}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      {...props}
    >
      {/* chevron, path unico: cauda superior -> vertice -> cauda inferior */}
      <path d="M22 9 L74 52 L22 95" pathLength={100} />
      {/* tres barras, os multiplos dados */}
      <line x1="78" y1="26" x2="146" y2="26" pathLength={100} />
      <line x1="20" y1="52" x2="146" y2="52" pathLength={100} />
      <line x1="78" y1="78" x2="146" y2="78" pathLength={100} />
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
