/**
 * Renderiza um bloco JSON-LD no HTML servido (Server Component friendly).
 * O escape de "<" previne XSS via conteudo dinamico (padrao da doc do Next).
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
