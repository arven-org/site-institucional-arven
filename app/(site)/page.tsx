import { type Metadata } from "next";
import { JsonLd } from "@/components/site/json-ld";
import { Hero } from "@/components/site/hero";
import { About } from "@/components/site/about";
import { Results } from "@/components/site/results";
import { Services } from "@/components/site/services";
import { Integrations } from "@/components/site/integrations";
import { Adv } from "@/components/site/adv";
import { ImageBand } from "@/components/site/image-band";
import { Clients } from "@/components/site/clients";
import { CTA } from "@/components/site/cta";

export const metadata: Metadata = {
  // absolute: evita o template do layout duplicar a marca ("... | Arven").
  title: { absolute: "Arven, inteligência aplicada ao crescimento" },
  alternates: { canonical: "/" },
};

const ORG_ID = "https://www.arvenoficial.com/#organization";

/** Servicos da home em schema.org, amarrados a entidade Organization. */
const servicesJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://www.arvenoficial.com/#servico-midia-paga",
      name: "Mídia Paga",
      serviceType: "Gestão de tráfego pago",
      description:
        "Tráfego pago orientado por dados no LinkedIn, Google, Meta e TikTok Ads. Do teste à escala, com mais de R$8 milhões geridos por mês.",
      provider: { "@id": ORG_ID },
      areaServed: { "@type": "Country", name: "Brasil" },
      availableLanguage: "pt-BR",
      url: "https://www.arvenoficial.com/#servicos",
    },
    {
      "@type": "Service",
      "@id": "https://www.arvenoficial.com/#servico-qualificacao-crm",
      name: "Qualificação e CRM",
      serviceType: "Implementação de CRM e qualificação de leads",
      description:
        "Mais de 70 CRMs implementados em 2026, prontos para o comercial. Integração com Kommo, HubSpot, Salesforce e Pipedrive.",
      provider: { "@id": ORG_ID },
      areaServed: { "@type": "Country", name: "Brasil" },
      availableLanguage: "pt-BR",
      url: "https://www.arvenoficial.com/#servicos",
    },
    {
      "@type": "Service",
      "@id": "https://www.arvenoficial.com/#servico-criativos-adv",
      name: "Criativos e ADv",
      serviceType: "Produção de criativos para mídia paga",
      description:
        "Metodologia própria de criativos que parecem conteúdo, não propaganda. Criada para os advogados mais influentes do Brasil, com mais de 70% de qualificação.",
      provider: { "@id": ORG_ID },
      areaServed: { "@type": "Country", name: "Brasil" },
      availableLanguage: "pt-BR",
      url: "https://www.arvenoficial.com/#adv",
    },
    {
      "@type": "Service",
      "@id": "https://www.arvenoficial.com/#servico-automacao-ia",
      name: "Automação e IA",
      serviceType: "Automação de marketing e inteligência artificial",
      description:
        "IA aplicada a processos, projetos, comercial e marketing. Automações orquestradas com banco de dados exclusivo por cliente.",
      provider: { "@id": ORG_ID },
      areaServed: { "@type": "Country", name: "Brasil" },
      availableLanguage: "pt-BR",
      url: "https://www.arvenoficial.com/#servicos",
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={servicesJsonLd} />
      <Hero />
      <Clients />
      <About />
      <Results />
      <Services />
      <Integrations />
      <Adv />
      <ImageBand />
      <CTA />
    </>
  );
}
