import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./site.css";
import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { RevealProvider } from "@/components/site/reveal-provider";
import { LeadGateProvider } from "@/components/site/lead-gate/provider";
import { JsonLd } from "@/components/site/json-ld";
import { brand } from "@/lib/site/content";

/**
 * Tipografia do site. A marca usa NewBlack (fonte comercial, minimalista).
 * Enquanto os arquivos .woff2/.otf da NewBlack nao entram no repo, usamos um
 * stand-in minimalista com a MESMA variavel (--font-newblack), entao a troca
 * final e de uma linha so:
 *
 *   import localFont from "next/font/local";
 *   const newblack = localFont({
 *     variable: "--font-newblack",
 *     display: "swap",
 *     src: [
 *       { path: "../../public/fonts/newblack/NewBlack-Regular.woff2", weight: "400", style: "normal" },
 *       { path: "../../public/fonts/newblack/NewBlack-Medium.woff2",  weight: "500", style: "normal" },
 *       { path: "../../public/fonts/newblack/NewBlack-Bold.woff2",    weight: "700", style: "normal" },
 *     ],
 *   });
 */
const newblack = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-newblack",
  display: "swap",
});

const title = "Arven, inteligência aplicada ao crescimento";
const description =
  "Transformamos dados, mídia e tecnologia em performance real e escalável. Tráfego pago, analytics, automação e IA em uma única direção.";

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s | Arven",
  },
  description,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Arven",
    title,
    description,
    url: "https://www.arvenoficial.com",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Arven" }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

/** Entidade Arven legivel por maquina: desambigua a marca para Google e LLMs. */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.arvenoficial.com/#organization",
  name: "Arven",
  alternateName: ["Arven Oficial", "Arven Solutions"],
  url: "https://www.arvenoficial.com",
  logo: {
    "@type": "ImageObject",
    url: "https://www.arvenoficial.com/icon-512.png",
    width: 512,
    height: 512,
  },
  description:
    "Time de performance que transforma dados, midia e tecnologia em crescimento real e escalavel. Trafego pago, qualificacao e CRM, criativos (metodo ADv), automacao e IA para mercados de alto valor, como advogados e mentores.",
  slogan: brand.promise,
  email: brand.email,
  address: { "@type": "PostalAddress", addressRegion: "SC", addressCountry: "BR" },
  areaServed: { "@type": "Country", name: "Brasil" },
  sameAs: [brand.social.instagram, brand.social.linkedin],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    email: brand.email,
    availableLanguage: "Portuguese",
  },
  knowsAbout: [
    "Marketing de performance",
    "Trafego pago",
    "Geracao de leads qualificados",
    "CRM e qualificacao de leads",
    "Criativos para midia paga",
    "Automacao de marketing",
    "Inteligencia artificial aplicada a marketing",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.arvenoficial.com/#website",
  url: "https://www.arvenoficial.com",
  name: "Arven",
  description,
  inLanguage: "pt-BR",
  publisher: { "@id": "https://www.arvenoficial.com/#organization" },
};

export const viewport: Viewport = {
  themeColor: "#fcfcfc",
  colorScheme: "light",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`arven-site ${newblack.variable}`}>
      <link rel="preconnect" href="https://cdn.sanity.io" />
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <LeadGateProvider>
        <RevealProvider />
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </LeadGateProvider>
    </div>
  );
}
