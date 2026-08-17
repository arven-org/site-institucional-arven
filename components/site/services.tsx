import { services } from "@/lib/site/content";

export function Services() {
  return (
    <section id="servicos" className="relative overflow-hidden">
      <div className="shell py-16 md:py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <span className="eyebrow" data-reveal>
              04 / Serviços
            </span>
            <h2
              className="display mt-6"
              style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)" }}
              data-reveal
            >
              Soluções para escalar com eficiência.
            </h2>
          </div>
          <p
            className="lead max-w-xs md:text-right"
            data-reveal
            style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
          >
            Quatro frentes que operam juntas, com o mesmo objetivo: resultado que se sustenta no
            tempo.
          </p>
        </div>

        <div
          className="mt-16 grid gap-px sm:grid-cols-2 lg:grid-cols-4"
          style={{ backgroundColor: "var(--line)" }}
        >
          {services.map((service, i) => (
            <article
              key={service.id}
              className="group relative flex min-h-[300px] flex-col justify-between p-8 transition-colors duration-500"
              style={
                {
                  backgroundColor: "var(--cream)",
                  "--reveal-delay": `${String(i * 90)}ms`,
                } as React.CSSProperties
              }
              data-reveal
            >
              <div className="flex items-start justify-between">
                <span className="eyebrow" style={{ color: "var(--sand)" }}>
                  0{i + 1}
                </span>
                <span
                  className="text-lg opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
                  style={{ transform: "translateX(-6px)", color: "var(--fg)" }}
                >
                  &rarr;
                </span>
              </div>

              <div>
                <h3 className="display" style={{ fontSize: "1.5rem" }}>
                  {service.title}
                </h3>
                <p className="lead mt-4 text-[0.92rem]">{service.body}</p>
                <p
                  className="mt-4 max-h-0 overflow-hidden text-[0.85rem] opacity-0 transition-all duration-500 group-hover:max-h-44 group-hover:opacity-100"
                  style={{ color: "var(--fg-subtle)" }}
                >
                  {service.detail}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
