# Design: Blog Section + Slug Page Redesign

**Data:** 2026-04-07
**Status:** Aprovado

---

## Objetivo

1. Adicionar seção de preview do blog na homepage (`src/pages/index.astro`) antes do CTA final.
2. Redesenhar a página de post individual (`src/pages/blog/[slug].astro`) no estilo editorial Linear (dark, breadcrumb, cover image, corpo prose, nav prev/next).

---

## Contexto

- Projeto **Astro** com `@sanity/client@^7` já instalado.
- Sanity project ID: `8b9xqel2`, dataset: `production`.
- `src/lib/sanity.ts` atual tem apenas `getAllPosts()` e `getPostBySlug()` com campos básicos (sem imagem, sem body portableText completo).
- O export Next.js (em `C:\Users\Renato\Downloads\exportsanity\`) usa o mesmo projeto Sanity com schema rico: `image`, `categories`, `readingMinutes`, `body` (portableText), `author`, `emFoco`.
- Renderização portableText: **padrão apenas** (h1–h6, p, blockquote, ul, ol, links, imagens inline). Sem blocos custom por enquanto.
- Referência visual: Linear customer case study pages (dark, editorial).

---

## Dependências novas

```
@portabletext/html   — SSR portableText → HTML, zero JS no cliente
```

Instalação: `npm install @portabletext/html`

Sem `@sanity/image-url` — URLs de imagem via GROQ `asset->url` direto.

---

## Parte 1 — Upgrade de `src/lib/sanity.ts`

### Novos campos em `getPostBySlug()`
Adicionar `body`, `author`, e via GROQ a URL da imagem:
```groq
image { alt, "url": asset->url }
```

### Nova função `getRecentPosts(limit = 3)`
```groq
*[_type == "post"] | order(publishedAt desc) [0...$limit] {
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  image { alt, "url": asset->url }
}
```

### Nova função `getAdjacentPosts(publishedAt)`
- **Anterior** (mais antigo): `*[_type == "post" && publishedAt < $publishedAt] | order(publishedAt desc) [0] { _id, title, slug }`
- **Próximo** (mais recente): `*[_type == "post" && publishedAt > $publishedAt] | order(publishedAt asc) [0] { _id, title, slug }`

---

## Parte 2 — Homepage: seção blog preview (`src/pages/index.astro`)

### Posição
Entre `<!-- FAQ -->` e `<!-- CTA FINAL -->`.

### Comportamento
- Chama `getRecentPosts(3)` no frontmatter com `try/catch` silencioso.
- Se zero posts retornados: seção **não renderiza** (sem flash vazio).
- Se posts: renderiza seção completa.

### Estrutura HTML
```html
<section class="blog-preview">
  <div class="blog-preview__head">
    <div>
      <p class="blog-preview__tag">Blog</p>
      <h2 class="blog-preview__headline">Do que aprendemos operando funis</h2>
    </div>
    <a href="/blog" class="btn btn--ghost">Ver todos os artigos</a>
  </div>
  <div class="blog-preview__grid">
    <!-- para cada post: -->
    <a href="/blog/{slug}" class="blog-preview__card">
      <div class="blog-preview__img-wrap">
        <img src="{url}?w=600&fm=webp" alt="{alt}" ... />
        <!-- se sem imagem: placeholder div bg-raised -->
      </div>
      <div class="blog-preview__info">
        <time class="blog-preview__date">{data formatada pt-BR}</time>
        <h3 class="blog-preview__title">{title}</h3>
        <p class="blog-preview__excerpt">{excerpt}</p>
      </div>
    </a>
  </div>
</section>
```

### CSS (no `<style>` do index.astro ou em global.css)
- `.blog-preview`: `border: 1px solid var(--border)`, `border-radius: var(--radius-lg)`, `background: var(--bg-surface)`, padding `40px`.
- `.blog-preview__head`: flex, space-between, align-start, `border-bottom: 1px solid var(--border)`, `padding-bottom: 28px`, `margin-bottom: 28px`.
- `.blog-preview__tag`: mesmo estilo de `.hero__tag` (mono, uppercase, tertiary).
- `.blog-preview__headline`: 22px, weight 500, `--text-primary`, letter-spacing -0.3px.
- `.blog-preview__grid`: `display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border)`.
- `.blog-preview__card`: `display: flex; flex-direction: column; background: var(--bg-surface); text-decoration: none; transition: background 0.15s`. Hover: `background: var(--bg-raised)`.
- `.blog-preview__img-wrap`: `aspect-ratio: 16/9; overflow: hidden`. Img: `width: 100%; height: 100%; object-fit: cover`.
- `.blog-preview__info`: `padding: 16px`.
- `.blog-preview__date`: mono, 11px, `--text-tertiary`, uppercase.
- `.blog-preview__title`: 15px, weight 500, `--text-primary`, margin 6px 0 4px.
- `.blog-preview__excerpt`: 13px, `--text-secondary`, line-height 1.6, `display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden`.
- **Mobile** (`< 768px`): `grid-template-columns: 1fr`.

---

## Parte 3 — Slug page redesign (`src/pages/blog/[slug].astro`)

### Frontmatter
```ts
const { slug } = Astro.params;
const post = slug ? await getPostBySlug(slug) : null;
if (!post) return Astro.redirect('/blog', 302);
const { prev, next } = slug ? await getAdjacentPosts(post.publishedAt) : { prev: null, next: null };
// render portableText
import { toHTML } from '@portabletext/html';
const bodyHtml = post.body ? toHTML(post.body) : '';
```

### Estrutura HTML
```html
<Base title="{post.title} — Arven" ...>
  <article class="blog-post">

    <!-- Breadcrumb -->
    <nav class="blog-post__breadcrumb">
      <a href="/blog">Blog</a>
      <span>/</span>
      <span>{post.title}</span>
    </nav>

    <!-- Header -->
    <header class="blog-post__header">
      <time class="blog-post__date">{data}</time>
      <h1 class="blog-post__title">{post.title}</h1>
      {post.excerpt && <p class="blog-post__excerpt">{post.excerpt}</p>}
      {post.author && <p class="blog-post__author">{post.author}</p>}
    </header>

    <!-- Cover image -->
    {post.image?.url && (
      <figure class="blog-post__cover">
        <img src="{post.image.url}?w=1200&fm=webp"
             alt="{post.image.alt || post.title}"
             width="1200" height="630" loading="eager" />
      </figure>
    )}

    <!-- Body -->
    <div class="blog-post__body" set:html={bodyHtml} />

    <!-- Nav prev/next -->
    {(prev || next) && (
      <footer class="blog-post__nav">
        {prev && (
          <a href="/blog/{prev.slug.current}" class="blog-post__nav-item blog-post__nav-item--prev">
            <span class="blog-post__nav-label">Anterior</span>
            <span class="blog-post__nav-title">{prev.title}</span>
          </a>
        )}
        {next && (
          <a href="/blog/{next.slug.current}" class="blog-post__nav-item blog-post__nav-item--next">
            <span class="blog-post__nav-label">Próximo</span>
            <span class="blog-post__nav-title">{next.title}</span>
          </a>
        )}
      </footer>
    )}

  </article>
</Base>
```

### CSS (em global.css ou scoped)

**Breadcrumb:**
- `.blog-post__breadcrumb`: flex, gap 8px, font-size 13px, `--text-tertiary`, margin-bottom 32px.
- `a` no breadcrumb: hover `--text-secondary`.

**Header:**
- `.blog-post__header`: max-width 720px, margin 0 auto, margin-bottom 40px.
- `.blog-post__date`: mono, 12px, `--text-tertiary`.
- `.blog-post__title`: clamp(28px, 4vw, 48px), weight 500, `--text-primary`, letter-spacing -0.5px, margin 12px 0 16px.
- `.blog-post__excerpt`: 17px, `--text-secondary`, line-height 1.7, margin-bottom 16px.
- `.blog-post__author`: 13px, `--text-tertiary`, mono.

**Cover:**
- `.blog-post__cover`: margin 0 0 48px, `border-radius: var(--radius-lg)`, overflow hidden. Img: `width: 100%; height: auto; display: block`.

**Body (`blog-post__body` prose styles):**
Max-width 720px, margin 0 auto, font-size 16px, color `--text-primary`, line-height 1.8.
- `h2`: 24px, weight 500, margin 40px 0 16px, letter-spacing -0.3px.
- `h3`: 20px, weight 500, margin 32px 0 12px.
- `p`: margin-bottom 20px, color `--text-secondary`.
- `blockquote`: border-left 3px solid `--border-hover`, padding-left 20px, color `--text-secondary`, font-style italic.
- `ul, ol`: padding-left 24px, margin-bottom 20px. `li`: margin-bottom 8px.
- `a`: color `--text-primary`, text-decoration underline, opacity 0.8 on hover.
- `strong`: color `--text-primary`, weight 600.
- `img`: width 100%, height auto, border-radius `--radius-md`, margin 32px 0.

**Nav prev/next:**
- `.blog-post__nav`: `display: flex; justify-content: space-between; gap: 16px; border-top: 1px solid var(--border); padding-top: 32px; margin-top: 64px`.
- `.blog-post__nav-item`: flex-column, gap 4px, max-width 45%, text-decoration none, padding 16px, border 1px solid var(--border), border-radius var(--radius-md), transition background 0.15s. Hover: background `--bg-raised`.
- `--next`: `align-items: flex-end; text-align: right`.
- `.blog-post__nav-label`: 11px, mono, uppercase, `--text-tertiary`.
- `.blog-post__nav-title`: 14px, weight 500, `--text-primary`.

---

## Ficheiros a modificar/criar

| Ficheiro | Ação |
|---|---|
| `package.json` | Adicionar `@portabletext/html` |
| `src/lib/sanity.ts` | Upgrade `getPostBySlug()`, nova `getRecentPosts()`, nova `getAdjacentPosts()` |
| `src/pages/index.astro` | Inserir `<section class="blog-preview">` antes do CTA final |
| `src/pages/blog/[slug].astro` | Redesenhar completo no estilo Linear |
| `src/styles/global.css` | Adicionar estilos `blog-preview__*` e `blog-post__*` |

---

## Fora do escopo

- Blocos custom portableText (blogCard, blogDivider, etc.) — para depois.
- Sanity Studio — já configurado no projeto Sanity existente.
- Página `/blog/index.astro` — não alterada agora.
