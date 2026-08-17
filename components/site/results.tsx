import { Counter } from "./counter";
import { ScheduleButton } from "./schedule-button";
import { metrics } from "@/lib/site/content";

export function Results() {
  return (
    <section id="resultados" className="theme-olive grain relative overflow-hidden">
      <div className="shell py-16 md:py-24">
        <div className="max-w-2xl">
          <span className="eyebrow" data-reveal>
            03 / Resultados
          </span>
          <h2 className="display mt-6" style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)" }} data-reveal>
            Números que sustentam a operação.
          </h2>
          <p
            className="lead mt-8"
            data-reveal
            style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
          >
            Escala de mídia, funil qualificado e retorno medido. Resultado de clientes reais, não
            promessa.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-8">
          {metrics.map((m, i) => (
            <div
              key={m.id}
              className="border-t pt-8"
              style={
                {
                  borderColor: "var(--line-strong)",
                  "--reveal-delay": `${String(i * 110)}ms`,
                } as React.CSSProperties
              }
              data-reveal
            >
              <div
                className="display"
                style={{ fontSize: "clamp(2.6rem, 5.4vw, 4rem)", color: "var(--cream)" }}
              >
                {"static" in m ? (
                  m.static
                ) : (
                  <Counter
                    value={m.value}
                    prefix={"prefix" in m ? m.prefix : ""}
                    suffix={m.suffix}
                  />
                )}
              </div>
              <p
                className="eyebrow mt-4"
                style={{ color: "var(--cream)", letterSpacing: "0.14em" }}
              >
                {m.label}
              </p>
              <p className="lead mt-3 text-[0.88rem]">{m.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-6" data-reveal>
          <ScheduleButton tone="light" />
          <span className="lead text-[0.92rem]">
            Quer números assim na sua operação? Vamos conversar.
          </span>
        </div>
      </div>
    </section>
  );
}
