/**
 * Type scale tokens, espelham as variaveis em tokens.css.
 * Use estas constantes quando precisar referenciar tokens em TS (analytics,
 * geracao de PDF, etc). UI consome via classes Tailwind ou var(--text-*).
 */

export const fontFamily = {
  sans: "var(--font-sans)",
  serif: "var(--font-serif)",
  mono: "var(--font-mono)",
} as const;

export const fontSize = {
  xs: "var(--text-xs)",
  sm: "var(--text-sm)",
  base: "var(--text-base)",
  lg: "var(--text-lg)",
  xl: "var(--text-xl)",
  "2xl": "var(--text-2xl)",
  "3xl": "var(--text-3xl)",
  "4xl": "var(--text-4xl)",
  "5xl": "var(--text-5xl)",
} as const;

export const lineHeight = {
  tight: "var(--leading-tight)",
  snug: "var(--leading-snug)",
  normal: "var(--leading-normal)",
  relaxed: "var(--leading-relaxed)",
} as const;

export const fontWeight = {
  normal: "var(--weight-normal)",
  medium: "var(--weight-medium)",
  semibold: "var(--weight-semibold)",
  bold: "var(--weight-bold)",
} as const;
