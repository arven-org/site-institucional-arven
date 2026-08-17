import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./site.css";
import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { RevealProvider } from "@/components/site/reveal-provider";
import { LeadGateProvider } from "@/components/site/lead-gate/provider";

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
  },
};

export const viewport: Viewport = {
  themeColor: "#fcfcfc",
  colorScheme: "light",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`arven-site ${newblack.variable}`}>
      <LeadGateProvider>
        <RevealProvider />
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </LeadGateProvider>
    </div>
  );
}
