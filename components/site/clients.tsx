import { ClientCard } from "./client-card";
import { clients, moreClients } from "@/lib/site/content";

export function Clients() {
  const featuredLoop = [...clients, ...clients];
  // fileira menor: um "set" largo o suficiente para nao abrir buraco no loop
  const moreSet = [...moreClients, ...moreClients, ...moreClients];
  const moreLoop = [...moreSet, ...moreSet];

  return (
    <section id="clientes" className="theme-ink-deep relative overflow-hidden">
      <div className="shell pt-16 md:pt-24">
        <div className="mb-12 flex flex-col gap-4 text-center" data-reveal>
          <span className="eyebrow mx-auto">01 / Parceiros & Clientes</span>
          <h2
            className="display mx-auto max-w-2xl"
            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
          >
            Quem já cresce com a ARVEN.
          </h2>
        </div>
      </div>

      {/* Carrossel principal, destaques, deslizando para a direita */}
      <div className="relative" data-reveal>
        <div className="marquee">
          <div className="marquee-track marquee-reverse">
            {featuredLoop.map((c, i) => (
              <div
                key={`f-${c.photo}-${String(i)}`}
                className="w-[168px] shrink-0 pr-4 sm:w-[196px]"
              >
                <ClientCard name={c.name} kind={c.kind} photo={`/images/clientes/${c.photo}`} />
              </div>
            ))}
          </div>
        </div>
        <Fades />
      </div>

      {/* Fileira menor, e muitos outros, deslizando para a esquerda */}
      <p className="mt-12 text-center" data-reveal>
        <span className="eyebrow" style={{ color: "var(--sand)" }}>
          E dezenas de outros crescendo com a Arven
        </span>
      </p>
      <div className="relative mt-6 pb-16 md:pb-24" data-reveal>
        <div className="marquee">
          <div className="marquee-track">
            {moreLoop.map((c, i) => (
              <div key={`m-${c.photo}-${String(i)}`} className="w-[60px] shrink-0 pr-3 sm:w-[72px]">
                <ClientCard name={c.name} photo={`/images/clientes/${c.photo}`} variant="avatar" />
              </div>
            ))}
          </div>
        </div>
        <Fades />
      </div>
    </section>
  );
}

function Fades() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32"
        style={{ background: "linear-gradient(90deg, var(--ink-deep), transparent)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32"
        style={{ background: "linear-gradient(-90deg, var(--ink-deep), transparent)" }}
      />
    </>
  );
}
