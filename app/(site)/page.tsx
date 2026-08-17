import { Hero } from "@/components/site/hero";
import { About } from "@/components/site/about";
import { Results } from "@/components/site/results";
import { Services } from "@/components/site/services";
import { Integrations } from "@/components/site/integrations";
import { Adv } from "@/components/site/adv";
import { ImageBand } from "@/components/site/image-band";
import { Clients } from "@/components/site/clients";
import { CTA } from "@/components/site/cta";

export default function HomePage() {
  return (
    <>
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
