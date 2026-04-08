import { createClient } from '@sanity/client';

export const sanity = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SanityImage {
  url: string;
  alt?: string;
}

export interface SanityPost {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt?: string;
  image?: SanityImage;
}

export interface SanityPostFull extends SanityPost {
  author?: string;
  body?: unknown; // portableText blocks array
}

export interface SanityAdjacentPost {
  _id: string;
  title: string;
  slug: { current: string };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getAllPosts(): Promise<SanityPost[]> {
  return sanity.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      image { alt, "url": asset->url }
    }
  `);
}

export async function getRecentPosts(limit = 3): Promise<SanityPost[]> {
  return sanity.fetch(
    `*[_type == "post"] | order(publishedAt desc) [0..$limit] {
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      image { alt, "url": asset->url }
    }`,
    { limit: limit - 1 } // GROQ [0..$limit] is inclusive; limit-1 gives exactly `limit` items
  );
}

export async function getPostBySlug(slug: string): Promise<SanityPostFull | null> {
  const post = await sanity.fetch(
    `*[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      author,
      body,
      image { alt, "url": asset->url }
    }`,
    { slug }
  );
  return post ?? null;
}

export async function getAdjacentPosts(publishedAt: string): Promise<{
  prev: SanityAdjacentPost | null;
  next: SanityAdjacentPost | null;
}> {
  const [prev, next] = await Promise.all([
    sanity.fetch<SanityAdjacentPost | null>(
      `*[_type == "post" && publishedAt < $publishedAt] | order(publishedAt desc) [0] {
        _id, title, slug
      }`,
      { publishedAt }
    ),
    sanity.fetch<SanityAdjacentPost | null>(
      `*[_type == "post" && publishedAt > $publishedAt] | order(publishedAt asc) [0] {
        _id, title, slug
      }`,
      { publishedAt }
    ),
  ]);
  return { prev: prev ?? null, next: next ?? null };
}
