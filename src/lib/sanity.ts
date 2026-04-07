import { createClient } from '@sanity/client';

export const sanity = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
});

export interface SanityPost {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt?: string;
  body?: any;
}

export async function getAllPosts(): Promise<SanityPost[]> {
  return sanity.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      publishedAt,
      excerpt
    }
  `);
}

export async function getPostBySlug(slug: string): Promise<SanityPost | null> {
  const post = await sanity.fetch(`
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      "bodyText": pt::text(body)
    }
  `, { slug });
  return post ?? null;
}
