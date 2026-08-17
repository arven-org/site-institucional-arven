import { ArvenMark } from "./logo";
import { EbookButton } from "./ebook-button";
import { ScheduleButton } from "./schedule-button";
import { adv } from "@/lib/site/content";

/** Mockup do material: capa "ADv" com duas pecas empilhadas atras (bundle). */
function AdvBundle() {
  return (
    <div className="relative mx-auto w-full max-w-[19rem]" style={{ perspective: "1200px" }}>
      {/* pecas atras */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl"
        style={{
          transform: "translate(26px, 22px) rotate(6deg)",
          backgroundColor: "var(--ink)",
          border: "1px solid var(--line)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl"
        style={{
          transform: "translate(13px, 11px) rotate(3deg)",
          backgroundColor: "var(--ink-soft)",
          border: "1px solid var(--line)",
        }}
      />

      {/* capa frontal */}
      <div
        className="relative flex aspect-[3/4] flex-col justify-between rounded-2xl p-7 transition-transform duration-500 ease-out hover:rotate-0"
        style={{
          transform: "rotate(-3deg)",
          backgroundColor: "var(--cream)",
          color: "var(--ink)",
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
        }}
      >
        <div className="flex items-center justify-between">
          <span className="eyebrow" style={{ color: "var(--sand)" }}>
            Guia · Método
          </span>
          <ArvenMark style={{ width: 22, height: "auto", color: "var(--ink)" }} />
        </div>

        <div>
          <span
            className="display block"
            style={{ fontSize: "clamp(3.5rem, 9vw, 5rem)", lineHeight: 0.9 }}
          >
            ADv
          </span>
          <span
            className="eyebrow mt-2 block"
            style={{ color: "var(--fg-subtle)", letterSpacing: "0.22em" }}
          >
            {adv.poweredBy}
          </span>
        </div>

        <p className="text-[0.95rem] leading-snug font-medium">{adv.subtitle}</p>
      </div>
    </div>
  );
}

export function Adv() {
  return (
    <section id="adv" className="theme-ink-deep grain relative overflow-hidden">
      <div className="shell py-16 md:py-24">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Texto + acoes */}
          <div data-reveal>
            <span className="eyebrow">05 / Metodologia proprietária</span>
            <div className="mt-8 flex items-end gap-4">
              <span
                className="display"
                style={{
                  fontSize: "clamp(4rem, 11vw, 8rem)",
                  lineHeight: 0.85,
                  color: "var(--cream)",
                }}
              >
                ADv
              </span>
              <span className="eyebrow mb-3" style={{ color: "var(--sand-soft)" }}>
                {adv.poweredBy}
              </span>
            </div>
            <p className="mt-5 text-lg" style={{ color: "var(--cream)" }}>
              {adv.subtitle}
            </p>
            <p className="lead mt-5 max-w-md">{adv.lead}</p>

            <div className="mt-9 flex flex-wrap items-center gap-6">
              <EbookButton />
              <ScheduleButton variant="link" />
            </div>
          </div>

          {/* Mockup do material */}
          <div data-reveal style={{ "--reveal-delay": "140ms" } as React.CSSProperties}>
            <AdvBundle />
          </div>
        </div>

        {/* Pilares do método */}
        <div
          className="mt-16 grid gap-x-10 gap-y-8 border-t pt-10 sm:grid-cols-3"
          style={{ borderColor: "var(--line)" }}
        >
          {adv.pillars.map((p, i) => (
            <div
              key={p.title}
              data-reveal
              style={{ "--reveal-delay": `${String(i * 110)}ms` } as React.CSSProperties}
            >
              <div className="flex items-baseline gap-4">
                <span className="display" style={{ fontSize: "1.3rem", color: "var(--sand)" }}>
                  0{i + 1}
                </span>
                <h3 className="display" style={{ fontSize: "1.3rem", color: "var(--cream)" }}>
                  {p.title}
                </h3>
              </div>
              <p className="lead mt-3 max-w-xs text-[0.95rem]">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
