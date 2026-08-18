import "server-only";

import { getServerEnv } from "@/lib/env";
import { log } from "@/lib/logger";
import type { Block, Post } from "@/lib/site/blog";

/**
 * Blog no Sanity, como no site anterior (mesmas env: SANITY_PROJECT_ID,
 * SANITY_DATASET). Sem SDK: GROQ via HTTP API (dataset publico, sem token),
 * cacheado por ISR. Erro de rede degrada pra lista vazia — o blog local segue.
 */

const API_VERSION = "2024-01-01";
const DEFAULT_PROJECT_ID = "8b9xqel2";
const DEFAULT_DATASET = "production";
const REVALIDATE_SECONDS = 300;

interface SanitySpan {
  _type?: string;
  text?: string;
}

interface SanityBlock {
  _type?: string;
  style?: string;
  listItem?: string;
  children?: SanitySpan[];
}

interface SanityPost {
  title?: string;
  slug?: { current?: string };
  publishedAt?: string;
  excerpt?: string;
  image?: { url?: string; alt?: string };
  body?: SanityBlock[];
}

async function sanityFetch<T>(query: string, params: Record<string, string> = {}): Promise<T> {
  const env = getServerEnv();
  const projectId = env.SANITY_PROJECT_ID ?? DEFAULT_PROJECT_ID;
  const dataset = env.SANITY_DATASET ?? DEFAULT_DATASET;

  const search = new URLSearchParams({ query });
  for (const [key, value] of Object.entries(params)) {
    search.set(`$${key}`, JSON.stringify(value));
  }

  const url = `https://${projectId}.apicdn.sanity.io/v${API_VERSION}/data/query/${dataset}?${search.toString()}`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new Error(`Sanity respondeu ${String(res.status)}`);
  }
  const json = (await res.json()) as { result: T };
  return json.result;
}

/** Converte portable text pros blocos tipados do PostBody do site novo. */
function toBlocks(body: SanityBlock[] | undefined): Block[] {
  if (!Array.isArray(body)) return [];

  const blocks: Block[] = [];
  let listItems: string[] | null = null;

  for (const node of body) {
    if (node._type !== "block") continue;
    const text = (node.children ?? [])
      .map((span) => span.text ?? "")
      .join("")
      .trim();
    if (!text) continue;

    if (node.listItem) {
      listItems = listItems ?? [];
      listItems.push(text);
      continue;
    }
    if (listItems) {
      blocks.push({ type: "ul", items: listItems });
      listItems = null;
    }

    switch (node.style) {
      case "h1":
      case "h2":
        blocks.push({ type: "h2", text });
        break;
      case "h3":
      case "h4":
        blocks.push({ type: "h3", text });
        break;
      case "blockquote":
        blocks.push({ type: "quote", text });
        break;
      default:
        blocks.push({ type: "p", text });
    }
  }
  if (listItems) blocks.push({ type: "ul", items: listItems });

  const firstParagraph = blocks.findIndex((b) => b.type === "p");
  if (firstParagraph !== -1) {
    const paragraph = blocks[firstParagraph] as { text: string };
    blocks[firstParagraph] = { type: "lead", text: paragraph.text };
  }
  return blocks;
}

function readingMinutes(blocks: Block[]): number {
  const words = blocks
    .flatMap((b) => (b.type === "ul" ? b.items : [b.text]))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(2, Math.round(words / 180));
}

function toPost(raw: SanityPost): Post | null {
  const slug = raw.slug?.current;
  const title = raw.title;
  const publishedAt = raw.publishedAt;
  if (!slug || !title || !publishedAt) return null;

  const body = toBlocks(raw.body);
  const imageUrl = raw.image?.url;
  const alt = raw.image?.alt;
  return {
    slug,
    title,
    excerpt: raw.excerpt ?? "",
    category: "Artigo",
    date: publishedAt.slice(0, 10),
    readingMinutes: readingMinutes(body),
    body,
    ...(imageUrl ? { image: { url: imageUrl, ...(alt ? { alt } : {}) } } : {}),
  };
}

const LIST_FIELDS = 'title, slug, publishedAt, excerpt, image { alt, "url": asset->url }';

export async function getSanityPosts(): Promise<Post[]> {
  try {
    const rows = await sanityFetch<SanityPost[]>(
      `*[_type == "post"] | order(publishedAt desc) { ${LIST_FIELDS} }`,
    );
    return rows.map(toPost).filter((p): p is Post => p !== null);
  } catch (err) {
    log.error("sanity_posts_failed", {
      message: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

export async function getSanityPost(slug: string): Promise<Post | undefined> {
  try {
    const row = await sanityFetch<SanityPost | null>(
      `*[_type == "post" && slug.current == $slug][0] { ${LIST_FIELDS}, body }`,
      { slug },
    );
    return row ? (toPost(row) ?? undefined) : undefined;
  } catch (err) {
    log.error("sanity_post_failed", {
      slug,
      message: err instanceof Error ? err.message : String(err),
    });
    return undefined;
  }
}
