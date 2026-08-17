import { type Metadata } from "next";
import { getAllPosts, formatDate } from "@/lib/site/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Ideias sobre performance, criativos e crescimento em mercados de alto valor. Método e bastidores da Arven.",
};

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <section className="relative overflow-hidden">
      <div className="shell pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="max-w-2xl" data-reveal>
          <span className="eyebrow">Blog</span>
          <h1 className="display mt-6" style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}>
            Performance, criativos e crescimento.
          </h1>
          <p className="lead mt-8 max-w-lg">
            Método, bastidores e o que aprendemos operando mídia e demanda qualificada para os nomes
            mais influentes do Brasil.
          </p>
        </div>

        <div className="mt-16 border-t" style={{ borderColor: "var(--line)" }}>
          {posts.map((post, i) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block border-b py-10"
              style={
                {
                  borderColor: "var(--line)",
                  "--reveal-delay": `${String(i * 80)}ms`,
                } as React.CSSProperties
              }
              data-reveal
            >
              <div className="grid gap-6 md:grid-cols-[0.9fr_1.6fr] md:items-baseline">
                <div className="flex items-center gap-3">
                  <span className="eyebrow" style={{ color: "var(--sand)" }}>
                    {post.category}
                  </span>
                  <span className="eyebrow" style={{ color: "var(--fg-subtle)" }}>
                    {formatDate(post.date)}
                  </span>
                </div>
                <div>
                  <h2
                    className="display transition-opacity group-hover:opacity-70"
                    style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}
                  >
                    {post.title}
                  </h2>
                  <p className="lead mt-4 max-w-xl text-[1rem]">{post.excerpt}</p>
                  <span
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium"
                    style={{ color: "var(--fg)" }}
                  >
                    Ler artigo
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
