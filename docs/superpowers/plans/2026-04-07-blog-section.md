# Blog Section + Slug Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a blog preview section to the homepage before the final CTA, and redesign the blog slug page in a Linear-style editorial layout (breadcrumb, cover image, prose body, prev/next navigation).

**Architecture:** Upgrade `src/lib/sanity.ts` with richer GROQ queries (images via `asset->url`, body portableText, adjacent posts). Add `@portabletext/html` for SSR portableText → HTML rendering in Astro. CSS lives in `global.css` following existing BEM conventions.

**Tech Stack:** Astro 6, `@sanity/client@^7`, `@portabletext/html` (new), plain CSS custom properties (no Tailwind).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `package.json` | Modify | Add `@portabletext/html` dependency |
| `src/lib/sanity.ts` | Modify | Add `getRecentPosts()`, `getAdjacentPosts()`, upgrade `getPostBySlug()` |
| `src/styles/global.css` | Modify | Add `blog-preview__*` and `blog-post__*` CSS blocks |
| `src/pages/index.astro` | Modify | Insert blog preview section before CTA final |
| `src/pages/blog/[slug].astro` | Modify | Full redesign: breadcrumb, cover, prose, prev/next |

---

## Task 1: Install `@portabletext/html`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
npm install @portabletext/html
```

Expected output: `added 1 package` (or similar, no errors).

- [ ] **Step 2: Verify TypeScript resolves it**

```bash
npx astro check
```

Expected: 0 errors (package has its own types).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @portabletext/html for SSR portableText rendering"
```

---

## Task 2: Upgrade `src/lib/sanity.ts`

**Files:**
- Modify: `src/lib/sanity.ts`

This task adds three things:
1. New `SanityImage` and `SanityPostFull` TypeScript interfaces.
2. New `getRecentPosts(limit)` function.
3. New `getAdjacentPosts(publishedAt)` function.
4. Upgrade `getPostBySlug()` to include `body`, `author`, and `image.url`.

- [ ] **Step 1: Replace the contents of `src/lib/sanity.ts`**

Open `src/lib/sanity.ts` and replace entirely with:

```typescript
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
    `*[_type == "post"] | order(publishedAt desc) [0...$limit] {
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      image { alt, "url": asset->url }
    }`,
    { limit: limit - 1 } // GROQ [0...$limit] is inclusive, so limit-1 gives exactly `limit` items
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx astro check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/sanity.ts
git commit -m "feat(sanity): add getRecentPosts, getAdjacentPosts, upgrade getPostBySlug"
```

---

## Task 3: Add CSS for blog preview section

**Files:**
- Modify: `src/styles/global.css` (append at end of file)

- [ ] **Step 1: Append blog preview styles to `src/styles/global.css`**

Add the following block at the very end of the file:

```css
/* ============================================================
   BLOG PREVIEW (homepage section)
   ============================================================ */
.blog-preview {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  overflow: hidden;
}

.blog-preview__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 32px 32px 28px;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.blog-preview__tag {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

.blog-preview__headline {
  font-size: 22px;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: -0.3px;
  line-height: 1.3;
}

.blog-preview__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
}

.blog-preview__card {
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  text-decoration: none;
  transition: background 0.15s;
}

.blog-preview__card:hover {
  background: var(--bg-raised);
}

.blog-preview__img-wrap {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--bg-raised);
}

.blog-preview__img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.blog-preview__card:hover .blog-preview__img-wrap img {
  transform: scale(1.03);
}

.blog-preview__info {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.blog-preview__date {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}

.blog-preview__title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
  margin: 0 0 6px;
}

.blog-preview__excerpt {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 768px) {
  .blog-preview__head {
    padding: 24px 20px 20px;
  }

  .blog-preview__grid {
    grid-template-columns: 1fr;
  }
}

/* ============================================================
   BLOG POST (slug page)
   ============================================================ */
.blog-post {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 0 80px;
}

.blog-post__breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-tertiary);
  margin-bottom: 40px;
}

.blog-post__breadcrumb a {
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color 0.15s;
}

.blog-post__breadcrumb a:hover {
  color: var(--text-secondary);
}

.blog-post__breadcrumb span:last-child {
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.blog-post__header {
  max-width: 720px;
  margin: 0 auto 40px;
}

.blog-post__date {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-tertiary);
  display: block;
  margin-bottom: 12px;
}

.blog-post__title {
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  line-height: 1.15;
  margin: 0 0 16px;
}

.blog-post__excerpt {
  font-size: 17px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 16px;
}

.blog-post__author {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 0;
}

.blog-post__cover {
  margin: 0 0 48px;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.blog-post__cover img {
  width: 100%;
  height: auto;
  display: block;
}

/* Prose body */
.blog-post__body {
  max-width: 720px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-secondary);
}

.blog-post__body h2 {
  font-size: 24px;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: -0.3px;
  margin: 48px 0 16px;
  line-height: 1.3;
}

.blog-post__body h3 {
  font-size: 20px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 36px 0 12px;
  line-height: 1.3;
}

.blog-post__body h4 {
  font-size: 17px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 28px 0 10px;
}

.blog-post__body p {
  margin-bottom: 20px;
}

.blog-post__body blockquote {
  border-left: 3px solid var(--border-hover);
  padding-left: 20px;
  margin: 28px 0;
  color: var(--text-secondary);
  font-style: italic;
}

.blog-post__body ul,
.blog-post__body ol {
  padding-left: 24px;
  margin-bottom: 20px;
}

.blog-post__body li {
  margin-bottom: 8px;
}

.blog-post__body a {
  color: var(--text-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: opacity 0.15s;
}

.blog-post__body a:hover {
  opacity: 0.7;
}

.blog-post__body strong {
  color: var(--text-primary);
  font-weight: 600;
}

.blog-post__body em {
  font-style: italic;
}

.blog-post__body img {
  width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  margin: 32px 0;
  display: block;
}

/* Prev / Next navigation */
.blog-post__nav {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid var(--border);
  padding-top: 32px;
  margin-top: 64px;
  max-width: 720px;
  margin-left: auto;
  margin-right: auto;
}

.blog-post__nav-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 45%;
  text-decoration: none;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: background 0.15s, border-color 0.15s;
}

.blog-post__nav-item:hover {
  background: var(--bg-raised);
  border-color: var(--border-hover);
}

.blog-post__nav-item--next {
  align-items: flex-end;
  text-align: right;
  margin-left: auto;
}

.blog-post__nav-label {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
}

.blog-post__nav-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
}

@media (max-width: 600px) {
  .blog-post {
    padding: 24px 0 48px;
  }

  .blog-post__nav {
    flex-direction: column;
  }

  .blog-post__nav-item {
    max-width: 100%;
  }

  .blog-post__nav-item--next {
    align-items: flex-start;
    text-align: left;
    margin-left: 0;
  }
}
```

- [ ] **Step 2: Verify build**

```bash
npx astro check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(css): add blog-preview and blog-post styles"
```

---

## Task 4: Add blog preview section to homepage

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Add import in frontmatter**

In `src/pages/index.astro`, the frontmatter block is:
```astro
---
import Base from '../layouts/Base.astro';
---
```

Replace with:
```astro
---
import Base from '../layouts/Base.astro';
import { getRecentPosts } from '../lib/sanity.ts';

let recentPosts: Awaited<ReturnType<typeof getRecentPosts>> = [];
try {
  recentPosts = await getRecentPosts(3);
} catch {
  // Sanity unavailable — section won't render
}
---
```

- [ ] **Step 2: Insert blog preview section**

Locate the `<!-- CTA FINAL -->` comment in `src/pages/index.astro`. Insert the new section **immediately above** it:

```astro
    {recentPosts.length > 0 && (
    <!-- BLOG PREVIEW -->
    <section class="blog-preview">
      <div class="blog-preview__head">
        <div>
          <p class="blog-preview__tag">Blog</p>
          <h2 class="blog-preview__headline">Do que aprendemos<br />operando funis de aquisição</h2>
        </div>
        <a href="/blog" class="btn btn--ghost">Ver todos os artigos</a>
      </div>
      <div class="blog-preview__grid">
        {recentPosts.map((post) => (
          <a href={`/blog/${post.slug.current}`} class="blog-preview__card">
            <div class="blog-preview__img-wrap">
              {post.image?.url ? (
                <img
                  src={`${post.image.url}?w=600&fm=webp`}
                  alt={post.image.alt ?? post.title}
                  width="600"
                  height="338"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div style="width:100%;height:100%;background:var(--bg-raised);" />
              )}
            </div>
            <div class="blog-preview__info">
              <time class="blog-preview__date" datetime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
              <h3 class="blog-preview__title">{post.title}</h3>
              {post.excerpt && (
                <p class="blog-preview__excerpt">{post.excerpt}</p>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
    )}

```

> **Note:** The `{recentPosts.length > 0 && ( ... )}` wrapper ensures the section is completely absent from the DOM when there are no posts.

- [ ] **Step 3: Verify build**

```bash
npx astro check && npx astro build
```

Expected: no TypeScript errors, build succeeds.

- [ ] **Step 4: Verify visually**

```bash
npm run dev
```

Open `http://localhost:4321`. Scroll past the FAQ section — the blog preview grid should appear before the final CTA. If Sanity has posts with images, they render. If no posts, section is invisible (correct).

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(homepage): add blog preview section before final CTA"
```

---

## Task 5: Redesign blog slug page

**Files:**
- Modify: `src/pages/blog/[slug].astro`

- [ ] **Step 1: Replace entire file content**

Replace `src/pages/blog/[slug].astro` with:

```astro
---
export const prerender = false;
import Base from '../../layouts/Base.astro';
import { getPostBySlug, getAdjacentPosts } from '../../lib/sanity.ts';
import { toHTML } from '@portabletext/html';

const { slug } = Astro.params;
const post = slug ? await getPostBySlug(slug) : null;

if (!post) {
  return Astro.redirect('/blog', 302);
}

const { prev, next } = await getAdjacentPosts(post.publishedAt);

const bodyHtml = post.body ? toHTML(post.body as any) : '';

const formattedDate = new Date(post.publishedAt).toLocaleDateString('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
---
<Base
  title={`${post.title} — Arven`}
  description={post.excerpt ?? 'Leia este artigo no blog da Arven.'}
  currentPage="blog"
>
  <article class="blog-post">

    <nav class="blog-post__breadcrumb" aria-label="Navegação">
      <a href="/blog">Blog</a>
      <span aria-hidden="true">/</span>
      <span>{post.title}</span>
    </nav>

    <header class="blog-post__header">
      <time class="blog-post__date" datetime={post.publishedAt}>{formattedDate}</time>
      <h1 class="blog-post__title">{post.title}</h1>
      {post.excerpt && <p class="blog-post__excerpt">{post.excerpt}</p>}
      {post.author && <p class="blog-post__author">{post.author}</p>}
    </header>

    {post.image?.url && (
      <figure class="blog-post__cover">
        <img
          src={`${post.image.url}?w=1200&fm=webp`}
          alt={post.image.alt ?? post.title}
          width="1200"
          height="630"
          loading="eager"
          decoding="async"
        />
      </figure>
    )}

    <div class="blog-post__body" set:html={bodyHtml} />

    {(prev || next) && (
      <footer class="blog-post__nav">
        {prev && (
          <a href={`/blog/${prev.slug.current}`} class="blog-post__nav-item blog-post__nav-item--prev">
            <span class="blog-post__nav-label">Anterior</span>
            <span class="blog-post__nav-title">{prev.title}</span>
          </a>
        )}
        {next && (
          <a href={`/blog/${next.slug.current}`} class="blog-post__nav-item blog-post__nav-item--next">
            <span class="blog-post__nav-label">Próximo</span>
            <span class="blog-post__nav-title">{next.title}</span>
          </a>
        )}
      </footer>
    )}

  </article>
</Base>
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx astro check
```

Expected: 0 errors.

- [ ] **Step 3: Build**

```bash
npx astro build
```

Expected: build succeeds with no errors.

- [ ] **Step 4: Verify visually**

```bash
npm run dev
```

Navigate to a blog post URL (e.g. `http://localhost:4321/blog/<slug>`). Verify:
- Breadcrumb appears at top: "Blog / Título do post"
- Title is large (48px desktop)
- Cover image renders full-width with rounded corners (if post has image)
- Body text renders with correct prose styles (h2, h3, p, lists, links)
- Prev/Next nav appears at bottom if adjacent posts exist

- [ ] **Step 5: Commit**

```bash
git add src/pages/blog/[slug].astro
git commit -m "feat(blog): redesign slug page — Linear editorial style with prev/next nav"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] `@portabletext/html` installed → Task 1
- [x] `getRecentPosts()` added → Task 2
- [x] `getAdjacentPosts()` added → Task 2
- [x] `getPostBySlug()` upgraded (body, author, image.url) → Task 2
- [x] CSS `blog-preview__*` → Task 3
- [x] CSS `blog-post__*` → Task 3
- [x] Homepage section with 3 posts, no render if 0 posts → Task 4
- [x] Slug page: breadcrumb, title, cover, body, prev/next → Task 5
- [x] Mobile responsive → Task 3 (media queries included)

**Type consistency:** `SanityPost`, `SanityPostFull`, `SanityAdjacentPost` defined in Task 2 and used consistently in Tasks 4 and 5. `post.image?.url`, `post.slug.current`, `prev.slug.current` all match the TypeScript interfaces.

**No placeholders:** All CSS values are concrete. All HTML is complete Astro syntax. All GROQ queries are exact strings. No TBDs.
