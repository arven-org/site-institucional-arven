import { ArvenLogo } from "./logo";
import { brand, nav, footerServices } from "@/lib/site/content";

export function SiteFooter() {
  const year = 2026;
  return (
    <footer className="theme-ink-deep relative overflow-hidden">
      <div className="shell py-20">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <ArvenLogo />
            <p className="lead mt-6 text-[0.9rem]">
              Inteligência aplicada ao crescimento. Transformamos dados, mídia e tecnologia em
              performance real e escalável.
            </p>
          </div>

          <FooterCol title="Navegação" items={nav.map((n) => ({ label: n.label, href: n.href }))} />
          <FooterCol
            title="Serviços"
            items={footerServices.map((s) => ({ label: s, href: "#servicos" }))}
          />

          <div>
            <h4 className="eyebrow">Contato</h4>
            <ul className="mt-5 space-y-3 text-[0.9rem]" style={{ color: "var(--fg-muted)" }}>
              <li>
                <a href={`mailto:${brand.email}`} className="link-underline">
                  {brand.email}
                </a>
              </li>
            </ul>
            <div className="mt-6 flex gap-4 text-[0.9rem]" style={{ color: "var(--fg-muted)" }}>
              <a
                href={brand.social.linkedin}
                className="link-underline"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <a
                href={brand.social.instagram}
                className="link-underline"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div
          className="mt-16 flex flex-col gap-4 border-t pt-8 text-xs sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "var(--line)", color: "var(--fg-subtle)" }}
        >
          <span>&copy; {year} Arven. Todos os direitos reservados.</span>
          <span className="eyebrow" style={{ letterSpacing: "0.16em" }}>
            {brand.tagline}
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="eyebrow">{title}</h4>
      <ul className="mt-5 space-y-3 text-[0.9rem]" style={{ color: "var(--fg-muted)" }}>
        {items.map((item) => (
          <li key={item.label}>
            <a href={item.href} className="link-underline">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
