import { ArvenMark } from "./logo";
import { integrations } from "@/lib/site/content";

const nodes = integrations.flatMap((g) => g.items);
const N = nodes.length;
const CX = 50;
const CY = 50;
const RX = 42;
const RY = 40;

const points = nodes.map((node, i) => {
  const angle = ((-90 + (360 / N) * i) * Math.PI) / 180;
  return {
    ...node,
    x: CX + RX * Math.cos(angle),
    y: CY + RY * Math.sin(angle),
  };
});

export function Integrations() {
  return (
    <section id="integracoes" className="relative overflow-hidden">
      <div className="shell py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow" data-reveal>
            Integrações
          </span>
          <h2 className="display mt-6" style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)" }} data-reveal>
            Sua operação, conectada de ponta a ponta.
          </h2>
          <p
            className="lead mx-auto mt-8 max-w-lg"
            data-reveal
            style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
          >
            Integramos nossa inteligência às ferramentas que seu time já usa. CRM, mídia e IA
            orquestrados como um sistema só, com a Arven no centro.
          </p>
        </div>

        {/* Hub de integracoes */}
        <div
          className="relative mx-auto mt-16 w-full max-w-3xl"
          style={{ aspectRatio: "16 / 11" }}
          data-reveal
        >
          {/* linhas conectoras, com fluxo animado */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {points.map((p, i) => (
              <line
                key={`line-${p.name}`}
                x1={CX}
                y1={CY}
                x2={p.x}
                y2={p.y}
                className="int-spoke"
                vectorEffect="non-scaling-stroke"
                style={{ animationDelay: `${String(i * 240)}ms` }}
              />
            ))}
          </svg>

          {/* orbita sutil */}
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
            style={{
              width: `${String(RX * 2)}%`,
              height: `${String(RY * 2)}%`,
              border: "1px solid var(--line)",
              opacity: 0.6,
            }}
          />

          {/* hub central */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div aria-hidden className="int-hub-ring absolute inset-0 rounded-full" />
            <div
              className="relative flex h-16 w-16 items-center justify-center rounded-full md:h-20 md:w-20"
              style={{ backgroundColor: "var(--ink)" }}
            >
              <ArvenMark style={{ width: 34, height: "auto", color: "var(--cream)" }} />
            </div>
          </div>

          {/* nodes */}
          {points.map((p) => (
            <div
              key={p.name}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${String(p.x)}%`, top: `${String(p.y)}%` }}
            >
              <div
                title={p.name}
                className="flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 md:h-14 md:w-14"
                style={{ backgroundColor: "var(--cream)", border: "1px solid var(--line)" }}
              >
                {p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.logo}
                    alt={p.name}
                    loading="lazy"
                    className="h-5 w-auto opacity-60 transition-opacity duration-300 group-hover:opacity-100 md:h-6"
                  />
                ) : (
                  <span
                    className="text-[0.6rem] leading-none font-medium opacity-70"
                    style={{ color: "var(--fg)" }}
                  >
                    {p.name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* legenda de categorias */}
        <div
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2"
          data-reveal
        >
          {integrations.map((g) => (
            <span key={g.label} className="eyebrow" style={{ color: "var(--fg-subtle)" }}>
              {g.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
