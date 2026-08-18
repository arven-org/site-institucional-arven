import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.arvenoficial.com"),
  title: {
    default: "Arven",
    template: "%s | Arven",
  },
  description: "Sistema operacional de contratos da Arven.",
  // Default seguro: so o grupo (site) reabre a indexacao no proprio layout.
  robots: { index: false, follow: false },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
