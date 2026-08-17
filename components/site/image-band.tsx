import { ScheduleButton } from "./schedule-button";

export function ImageBand() {
  return (
    <section className="theme-ink relative">
      <div className="media media--flat media--mono relative flex min-h-[70svh] items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/band-buildings.jpg"
          alt="Arranha-céus vistos de baixo entre a neblina"
          loading="lazy"
          className="absolute inset-0"
        />
        {/* scrim para legibilidade */}
        <div
          aria-hidden
          className="absolute inset-0 z-[3]"
          style={{
            background:
              "linear-gradient(90deg, color-mix(in oklab, var(--ink) 82%, transparent), color-mix(in oklab, var(--ink) 30%, transparent) 70%)",
          }}
        />
        <div className="shell relative z-[4]">
          <div className="max-w-2xl py-24">
            <span className="eyebrow" data-reveal style={{ color: "var(--sand-soft)" }}>
              A diferença Arven
            </span>
            <p
              className="display mt-6"
              style={{ fontSize: "clamp(2rem, 4.4vw, 3.6rem)", color: "var(--cream)" }}
              data-reveal
            >
              Onde a maioria enxerga planilha, a gente enxerga direção.
            </p>
            <p
              className="lead mt-6 max-w-lg"
              data-reveal
              style={{ "--reveal-delay": "120ms", color: "var(--cream)" } as React.CSSProperties}
            >
              Dado sem decisão é ruído. Nosso trabalho é transformar volume em clareza, e clareza em
              crescimento que se sustenta.
            </p>
            <div
              className="mt-9"
              data-reveal
              style={{ "--reveal-delay": "220ms" } as React.CSSProperties}
            >
              <ScheduleButton tone="light" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
