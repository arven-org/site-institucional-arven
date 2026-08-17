"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Contador que anima de 0 ao valor quando entra na viewport.
 * Aceita prefixo, sufixo e casas decimais (ex: 3,8x, -32%, 214%).
 */
export function Counter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1600,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let started = false;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const run = (startedAt: number) => {
      const tick = (now: number) => {
        const t = Math.min((now - startedAt) / duration, 1);
        setDisplay(value * ease(t));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            if (reduce) {
              setDisplay(value);
            } else {
              run(performance.now());
            }
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  const formatted = display.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
