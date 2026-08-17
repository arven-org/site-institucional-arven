export const easing = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export const duration = {
  instant: 80,
  fast: 160,
  normal: 240,
  slow: 400,
} as const;

export type EasingToken = keyof typeof easing;
export type DurationToken = keyof typeof duration;
