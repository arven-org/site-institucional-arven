import { type Metadata } from "next";
import { NpsClient } from "./_nps-client";

export const metadata: Metadata = {
  title: "Avaliação NPS",
  description: "Ajude-nos a entender sua experiência. Leva poucos minutos.",
  // Pesquisa por link tokenizado: fora do indice.
  robots: { index: false, follow: false },
};

export default function NpsPage() {
  return <NpsClient />;
}
