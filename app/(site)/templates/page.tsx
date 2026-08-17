import { type Metadata } from "next";
import { TemplatesClient } from "./_templates-client";

export const metadata: Metadata = {
  title: "Design Tokens",
  description: "Tokens de design da marca Arven. Acesso restrito a parceiros e equipe.",
  robots: { index: false, follow: false },
};

export default function TemplatesPage() {
  return <TemplatesClient />;
}
