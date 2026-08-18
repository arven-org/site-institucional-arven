import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPost, formatDate } from "@/lib/site/blog";
import { JsonLd } from "@/components/site/json-ld";
import { PostBody } from "@/components/site/post-body";
import { ScheduleButton } from "@/components/site/schedule-button";
import { EbookButton } from "@/components/site/ebook-button";

interface Params {
  params: Promise<{ slug: string }>;
}

// Revalida periodicamente: posts novos no Sanity entram sem redeploy.
export const revalidate = 300;

export async function generateStaticParams() {
  return (await getAllPosts()).map((p) => ({ slug: p.slug }));
}

function postDescription(post: { excerpt: string; body: { type: string }[] }): string {
  if (post.excerpt) return post.excerpt;
  const first = post.body.find((b): b is { type: "lead" | "p"; text: string } =>
    ["lead", "p"].includes(b.type),
  );
  return first ? first.text.slice(0, 160) : "Leia este artigo no blog da Arven.";
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Artigo não encontrado" };
  const description = postDescription(post);
  const ogImage = post.image ? `${post.image.url}?w=1200&fm=webp` : "/og.png";
  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.image?.alt ?? post.title }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const postUrl = `https://www.arvenoficial.com/blog/${post.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl}#article`,
    headline: post.title,
    description: postDescription(post),
    url: postUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "pt-BR",
    ...(post.image ? { image: [`${post.image.url}?w=1200&fm=webp`] } : {}),
    author: { "@id": "https://www.arvenoficial.com/#organization" },
    publisher: { "@id": "https://www.arvenoficial.com/#organization" },
    isPartOf: { "@id": "https://www.arvenoficial.com/#website" },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "article p:first-of-type"],
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: "https://www.arvenoficial.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.arvenoficial.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
    ],
  };

  return (
    <article className="relative overflow-hidden">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <div className="shell pt-32 pb-24 md:pt-40 md:pb-32">
        {/* cabecalho */}
        <div className="mx-auto max-w-[42rem]">
          <Link
            href="/blog"
            className="link-underline inline-flex items-center gap-2 text-sm"
            style={{ color: "var(--fg-subtle)" }}
          >
            <span aria-hidden>&larr;</span> Blog
          </Link>

          <div className="mt-10 flex flex-wrap items-center gap-3" data-reveal>
            <span className="eyebrow" style={{ color: "var(--sand)" }}>
              {post.category}
            </span>
            <span className="eyebrow" style={{ color: "var(--fg-subtle)" }}>
              {formatDate(post.date)}
            </span>
            <span className="eyebrow" style={{ color: "var(--fg-subtle)" }}>
              {post.readingMinutes} min de leitura
            </span>
          </div>

          <h1
            className="display mt-6 text-balance"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}
            data-reveal
          >
            {post.title}
          </h1>
        </div>

        {/* capa (vem do Sanity, como no site anterior) */}
        {post.image && (
          <figure className="mx-auto mt-12 max-w-[52rem]" data-reveal>
            <img
              src={`${post.image.url}?w=1600&fm=webp`}
              alt={post.image.alt ?? post.title}
              width={1600}
              height={900}
              loading="eager"
              decoding="async"
              className="aspect-[16/9] w-full rounded-2xl object-cover"
              style={{ backgroundColor: "var(--line)" }}
            />
          </figure>
        )}

        {/* corpo */}
        <div className="mt-14" data-reveal>
          <PostBody body={post.body} />
        </div>

        {/* CTA final */}
        <div
          className="mx-auto mt-20 max-w-[42rem] rounded-2xl p-8 md:p-10"
          style={{ backgroundColor: "var(--ink)", color: "var(--cream)" }}
          data-reveal
        >
          <p className="display" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
            Quer aplicar esse método na sua operação?
          </p>
          <p
            className="mt-4 text-[0.98rem]"
            style={{ color: "color-mix(in oklab, var(--cream) 66%, var(--ink))" }}
          >
            Tenha o ebook completo do método ADv ou fale com o nosso time.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <EbookButton />
            <ScheduleButton variant="link" />
          </div>
        </div>
      </div>
    </article>
  );
}
