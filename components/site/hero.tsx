import { ArvenMark } from "./logo";
import { ScheduleButton } from "./schedule-button";

export function Hero() {
  return (
    <section id="top" className="grain relative overflow-hidden" style={{ minHeight: "84svh" }}>
      {/* grade blueprint sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "clamp(64px, 8vw, 120px) clamp(64px, 8vw, 120px)",
          maskImage: "radial-gradient(120% 90% at 70% 20%, #000 20%, transparent 80%)",
          opacity: 0.5,
        }}
      />

      <div className="shell relative flex min-h-[84svh] flex-col justify-center pt-20 pb-12">
        <div className="grid items-center gap-12 lg:grid-cols-[1.45fr_0.55fr]">
          {/* Coluna texto */}
          <div className="max-w-3xl">
            <h1 className="display" style={{ fontSize: "clamp(1.7rem, 3vw, 2.9rem)" }} data-reveal>
              Geramos leads qualificados
              <br />
              para os mentores e advogados
              <br />
              <span style={{ color: "var(--sand)" }}>mais influentes do Brasil.</span>
            </h1>

            <p
              className="lead mt-8 max-w-xl text-[1.02rem]"
              data-reveal
              style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
            >
              Terceirizar a ponta mais importante do seu negócio precisa ser com segurança e
              expertise. Tenha acesso ao time de performance que gerencia mais de R$8 milhões em
              mídia mensalmente.
            </p>

            <div
              className="mt-10 flex flex-wrap items-center gap-5"
              data-reveal
              style={{ "--reveal-delay": "220ms" } as React.CSSProperties}
            >
              <ScheduleButton tone="dark" />
              <a
                href="#resultados"
                className="link-underline inline-flex items-center gap-2 text-sm font-medium"
                style={{ color: "var(--fg)" }}
              >
                Ver resultados
              </a>
            </div>
          </div>

          {/* Coluna simbolo */}
          <div className="relative hidden justify-self-end lg:flex">
            <ArvenMark
              className="hero-mark"
              style={{ width: "min(30vw, 420px)", height: "auto", color: "var(--ink)" }}
            />
          </div>
        </div>

        {/* rodape do hero */}
        <div
          className="mt-12 flex items-end justify-between gap-6"
          data-reveal
          style={{ "--reveal-delay": "320ms" } as React.CSSProperties}
        >
          <a
            href="#sobre"
            className="flex items-center gap-2 text-xs"
            style={{ color: "var(--fg-subtle)" }}
          >
            <span className="eyebrow" style={{ letterSpacing: "0.18em" }}>
              Rolar
            </span>
            <span className="scroll-cue" aria-hidden>
              &darr;
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
