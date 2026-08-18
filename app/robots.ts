import type { MetadataRoute } from "next";

/**
 * robots.txt. Site publico aberto a todos os crawlers, incluindo os de IA
 * (GPTBot, ClaudeBot, PerplexityBot etc.). A area logada fica fora do crawl;
 * /templates NAO entra aqui de proposito: o noindex da propria pagina resolve,
 * e bloquear via robots impediria o Google de ler o noindex.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/auth/", "/dashboard", "/login", "/clientes", "/contratos"],
      },
    ],
    sitemap: "https://www.arvenoficial.com/sitemap.xml",
  };
}
