import { ArvenMark } from "./logo";
import { ScheduleButton } from "./schedule-button";
import { brand } from "@/lib/site/content";

export function CTA() {
  return (
    <section id="contato" className="theme-ink grain relative overflow-hidden">
      {/* simbolo gigante ao fundo */}
      <div aria-hidden className="pointer-events-none absolute -right-16 -bottom-24 opacity-[0.05]">
        <ArvenMark style={{ width: "min(60vw, 720px)", height: "auto", color: "var(--cream)" }} />
      </div>

      <div className="shell relative py-24 md:py-32">
        <div className="max-w-3xl">
          <span className="eyebrow" data-reveal>
            Vamos conversar
          </span>
          <h2
            className="display mt-8 text-balance"
            style={{ fontSize: "clamp(2.6rem, 6vw, 5rem)" }}
            data-reveal
          >
            Vamos construir o próximo capítulo de crescimento?
          </h2>
          <p
            className="lead mt-8 max-w-lg"
            data-reveal
            style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
          >
            Fale com nosso time e descubra como podemos acelerar seus resultados com dados, mídia e
            inteligência.
          </p>

          <div
            className="mt-12 flex flex-wrap items-center gap-6"
            data-reveal
            style={{ "--reveal-delay": "220ms" } as React.CSSProperties}
          >
            <ScheduleButton tone="light" />
            <a
              href={`mailto:${brand.email}`}
              className="link-underline text-sm font-medium"
              style={{ color: "var(--fg)" }}
            >
              {brand.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
