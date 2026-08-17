import { ArvenMark } from "./logo";
import { deliverables } from "@/lib/site/content";

export function About() {
  return (
    <section id="sobre" className="theme-ink grain relative overflow-hidden">
      <div className="shell py-16 md:py-24">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="max-w-md">
            <span className="eyebrow" data-reveal>
              02 / Quem somos
            </span>
            <h2
              className="display mt-6"
              style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)" }}
              data-reveal
            >
              Não somos agência. Somos um time de performance.
            </h2>
            <p
              className="lead mt-8"
              data-reveal
              style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
            >
              Time 100% presencial, em Santa Catarina, operando lado a lado com o cliente. Unimos
              mídia, dados e tecnologia para transformar informação em decisão, e decisão em
              crescimento.
            </p>
          </div>

          <div>
            <span className="eyebrow" data-reveal style={{ color: "var(--sand)" }}>
              O que você recebe
            </span>
            <div
              className="mt-6 grid gap-px sm:grid-cols-2"
              style={{ backgroundColor: "var(--line)" }}
            >
              {deliverables.map((item, i) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-5 p-7"
                  style={
                    {
                      backgroundColor: "var(--ink)",
                      "--reveal-delay": `${String(i * 90)}ms`,
                    } as React.CSSProperties
                  }
                  data-reveal
                >
                  <ArvenMark style={{ width: 34, height: "auto", color: "var(--sand)" }} />
                  <div>
                    <h3 className="text-[1.02rem] font-medium" style={{ color: "var(--cream)" }}>
                      {item.title}
                    </h3>
                    <p className="lead mt-2.5 text-[0.9rem]">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
