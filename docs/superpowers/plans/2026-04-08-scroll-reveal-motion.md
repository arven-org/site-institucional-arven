# Scroll Reveal Motion System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add GSAP-powered scroll reveal animations to all below-the-fold sections across homepage, `/blog`, and `/blog/[slug]`.

**Architecture:** A single vanilla script (`scroll-reveal.ts`) lazy-loads GSAP and uses IntersectionObserver to trigger `opacity + translateY` animations. Two data attributes drive everything: `data-reveal` for individual elements, `data-reveal-stagger` for grouped children. CSS provides the initial hidden state to prevent flash before JS loads.

**Tech Stack:** GSAP (already installed), IntersectionObserver API, CSS data-attribute selectors.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/scripts/scroll-reveal.ts` | Create | Central reveal script: lazy GSAP import, IO observers, reduced-motion check |
| `src/styles/global.css` | Modify | Add `[data-reveal]` initial opacity + reduced-motion override |
| `src/pages/index.astro` | Modify | Add `data-reveal*` attributes to below-fold sections + script import |
| `src/pages/blog/index.astro` | Modify | Add `data-reveal-stagger` to card grids + script import |
| `src/pages/blog/[slug].astro` | Modify | Add `data-reveal` with sequential delays + script import |

---

## Task 1: Create `src/scripts/scroll-reveal.ts`

**Files:**
- Create: `src/scripts/scroll-reveal.ts`

- [ ] **Step 1: Create the scroll reveal script**

Create `src/scripts/scroll-reveal.ts` with exactly this content:

```typescript
/**
 * Scroll Reveal — GSAP lazy-loaded + IntersectionObserver.
 * Attributes:
 *   data-reveal              → fade-up individual element
 *   data-reveal-delay="0.1"  → optional delay in seconds
 *   data-reveal-stagger      → observe container, animate [data-reveal-item] children
 *   data-reveal-stagger="0.1"→ custom stagger interval (default 0.08)
 * Respects prefers-reduced-motion.
 */
(function () {
  const allReveal = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  const allStagger = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal-stagger]'));

  if (!allReveal.length && !allStagger.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    allReveal.forEach((el) => { el.style.opacity = '1'; });
    allStagger.forEach((container) => {
      container.querySelectorAll<HTMLElement>('[data-reveal-item]').forEach((item) => {
        item.style.opacity = '1';
      });
    });
    return;
  }

  import('gsap').then(({ gsap }) => {
    // ── Individual elements ──────────────────────────────────────────────
    allReveal.forEach((el) => {
      gsap.set(el, { opacity: 0, y: 24 });
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const delay = parseFloat(el.dataset.revealDelay ?? '0');
          gsap.to(el, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', delay });
          revealObserver.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: '-40px 0px' }
    );

    allReveal.forEach((el) => revealObserver.observe(el));

    // ── Stagger groups ───────────────────────────────────────────────────
    allStagger.forEach((container) => {
      const items = Array.from(container.querySelectorAll<HTMLElement>('[data-reveal-item]'));
      if (!items.length) return;

      const staggerDelay = parseFloat(container.dataset.revealStagger ?? '0.08');
      gsap.set(items, { opacity: 0, y: 24 });

      const staggerObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            gsap.to(items, {
              opacity: 1,
              y: 0,
              duration: 0.55,
              ease: 'power2.out',
              stagger: staggerDelay,
            });
            staggerObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.1, rootMargin: '-20px 0px' }
      );

      staggerObserver.observe(container);
    });
  });
})();
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx astro check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/scripts/scroll-reveal.ts
git commit -m "feat(motion): add scroll-reveal script with GSAP lazy load + IntersectionObserver"
```

---

## Task 2: Add CSS initial state for reveal elements

**Files:**
- Modify: `src/styles/global.css:91` (insert after the `.page-hero__sub` animation line)

- [ ] **Step 1: Insert reveal CSS rules**

In `src/styles/global.css`, find the line:

```css
.page-hero__sub      { animation: fadeUp 0.5s ease 0.1s both; }
```

Insert the following block **immediately after** that line (before the `/* NAVEGAÇÃO */` comment):

```css

/* Scroll reveal — initial hidden state (GSAP controls y via JS) */
[data-reveal],
[data-reveal-stagger] > [data-reveal-item] {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal],
  [data-reveal-stagger] > [data-reveal-item] {
    opacity: 1 !important;
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
git commit -m "feat(css): add [data-reveal] initial hidden state with reduced-motion override"
```

---

## Task 3: Add reveal attributes to homepage

**Files:**
- Modify: `src/pages/index.astro`

This task adds `data-reveal`, `data-reveal-stagger`, and `data-reveal-item` attributes to existing HTML elements in `index.astro`, plus the script import. No structural changes — only attribute additions.

- [ ] **Step 1: Add `data-reveal-stagger` to numbers grid**

Find:
```html
      <div class="numbers__grid">
```

Replace with:
```html
      <div class="numbers__grid" data-reveal-stagger="0.1">
```

Then add `data-reveal-item` to each of the three `.numbers__item` divs.

Find:
```html
        <div class="numbers__item">
          <span class="numbers__value"><span>R$</span><span data-ticker="10">0</span><span>M</span></span>
```

Replace with:
```html
        <div class="numbers__item" data-reveal-item>
          <span class="numbers__value"><span>R$</span><span data-ticker="10">0</span><span>M</span></span>
```

Find:
```html
        <div class="numbers__item">
          <span class="numbers__value"><span data-ticker="50" data-ticker-suffix="+">0</span></span>
```

Replace with:
```html
        <div class="numbers__item" data-reveal-item>
          <span class="numbers__value"><span data-ticker="50" data-ticker-suffix="+">0</span></span>
```

Find:
```html
        <div class="numbers__item">
          <span class="numbers__value"><span>R$</span><span data-ticker="40">0</span><span>M+</span></span>
```

Replace with:
```html
        <div class="numbers__item" data-reveal-item>
          <span class="numbers__value"><span>R$</span><span data-ticker="40">0</span><span>M+</span></span>
```

- [ ] **Step 2: Add `data-reveal` to framework head and focal**

Find:
```html
      <div class="framework__head">
```

Replace with:
```html
      <div class="framework__head" data-reveal>
```

Find:
```html
      <div class="framework__focal">
```

Replace with:
```html
      <div class="framework__focal" data-reveal>
```

- [ ] **Step 3: Add `data-reveal-stagger` to framework pillars and metrics**

Find:
```html
      <div class="framework__pillars">
```

Replace with:
```html
      <div class="framework__pillars" data-reveal-stagger>
```

Then add `data-reveal-item` to each of the four `.framework__pillar` divs:

Find each (4 occurrences):
```html
        <div class="framework__pillar">
```

Replace each with:
```html
        <div class="framework__pillar" data-reveal-item>
```

Find:
```html
      <div class="framework__metrics">
```

Replace with:
```html
      <div class="framework__metrics" data-reveal-stagger>
```

Then add `data-reveal-item` to each of the four `.framework__metric` divs:

Find each (4 occurrences):
```html
        <div class="framework__metric">
```

Replace each with:
```html
        <div class="framework__metric" data-reveal-item>
```

- [ ] **Step 4: Add `data-reveal-stagger` to method steps**

Find:
```html
      <div class="method__steps">
```

Replace with:
```html
      <div class="method__steps" data-reveal-stagger="0.1">
```

Then add `data-reveal-item` to each of the four `.step` divs:

Find each (4 occurrences):
```html
        <div class="step">
```

Replace each with:
```html
        <div class="step" data-reveal-item>
```

- [ ] **Step 5: Add `data-reveal` to VSL section CTA**

Find:
```html
        <div class="statement-video__cta">
```

Replace with:
```html
        <div class="statement-video__cta" data-reveal>
```

- [ ] **Step 6: Add `data-reveal` to FAQ head and `data-reveal-stagger` to FAQ list**

Find:
```html
        <header class="faq__head">
```

Replace with:
```html
        <header class="faq__head" data-reveal>
```

Find:
```html
        <div class="faq__list">
```

Replace with:
```html
        <div class="faq__list" data-reveal-stagger="0.06">
```

Then add `data-reveal-item` to each of the six `<details class="faq__item">`:

Find each (6 occurrences):
```html
          <details class="faq__item">
```

Replace each with:
```html
          <details class="faq__item" data-reveal-item>
```

- [ ] **Step 7: Add `data-reveal-stagger` to blog preview grid**

Find:
```html
        <div class="blog-preview__grid">
```

Replace with:
```html
        <div class="blog-preview__grid" data-reveal-stagger>
```

Then find the blog card link inside the `.map()`. Find:
```html
            <a href={`/blog/${post.slug.current}`} class="blog-preview__card">
```

Replace with:
```html
            <a href={`/blog/${post.slug.current}`} class="blog-preview__card" data-reveal-item>
```

- [ ] **Step 8: Add `data-reveal` to CTA final inner**

Find:
```html
      <div class="cta-final__inner">
```

Replace with:
```html
      <div class="cta-final__inner" data-reveal>
```

- [ ] **Step 9: Add scroll-reveal script import**

Find (at the end of the file):
```html
<script>
  import '../scripts/magic-card.ts';
</script>
```

Add immediately after:
```html

<script>
  import '../scripts/scroll-reveal.ts';
</script>
```

- [ ] **Step 10: Verify build**

```bash
npx astro check && npx astro build
```

Expected: 0 errors, build succeeds.

- [ ] **Step 11: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(homepage): add scroll-reveal data attributes to all below-fold sections"
```

---

## Task 4: Add reveal attributes to blog index page

**Files:**
- Modify: `src/pages/blog/index.astro`

- [ ] **Step 1: Add `data-reveal-stagger` to featured cards container**

Find:
```html
      <div class="blog-featured">
```

Replace with:
```html
      <div class="blog-featured" data-reveal-stagger="0.1">
```

Find (inside the `.map()`):
```html
          <a href={`/blog/${post.slug.current}`} class="blog-featured__card">
```

Replace with:
```html
          <a href={`/blog/${post.slug.current}`} class="blog-featured__card" data-reveal-item>
```

- [ ] **Step 2: Add `data-reveal-stagger` to rest cards container**

Find:
```html
        <div class="blog-rest">
```

Replace with:
```html
        <div class="blog-rest" data-reveal-stagger="0.07">
```

Find (inside the `.map()`):
```html
            <a href={`/blog/${post.slug.current}`} class="blog-rest__card">
```

Replace with:
```html
            <a href={`/blog/${post.slug.current}`} class="blog-rest__card" data-reveal-item>
```

- [ ] **Step 3: Add script import at the end of the file**

Add at the very end of `src/pages/blog/index.astro` (after the closing `</Base>`):

```html

<script>
  import '../../scripts/scroll-reveal.ts';
</script>
```

- [ ] **Step 4: Verify build**

```bash
npx astro check && npx astro build
```

Expected: 0 errors, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/pages/blog/index.astro
git commit -m "feat(blog): add scroll-reveal stagger to blog index card grids"
```

---

## Task 5: Add reveal attributes to blog slug page

**Files:**
- Modify: `src/pages/blog/[slug].astro`

- [ ] **Step 1: Add `data-reveal` with sequential delays to article elements**

Find:
```html
    <nav class="blog-post__breadcrumb" aria-label="Navegação">
```

Replace with:
```html
    <nav class="blog-post__breadcrumb" aria-label="Navegação" data-reveal>
```

Find:
```html
    <header class="blog-post__header">
```

Replace with:
```html
    <header class="blog-post__header" data-reveal data-reveal-delay="0.08">
```

Find:
```html
      <figure class="blog-post__cover">
```

Replace with:
```html
      <figure class="blog-post__cover" data-reveal data-reveal-delay="0.16">
```

Find:
```html
    <div class="blog-post__body" set:html={bodyHtml} />
```

Replace with:
```html
    <div class="blog-post__body" set:html={bodyHtml} data-reveal data-reveal-delay="0.22" />
```

Find:
```html
      <footer class="blog-post__nav">
```

Replace with:
```html
      <footer class="blog-post__nav" data-reveal>
```

- [ ] **Step 2: Add script import at the end of the file**

Add at the very end of `src/pages/blog/[slug].astro` (after the closing `</Base>`):

```html

<script>
  import '../../scripts/scroll-reveal.ts';
</script>
```

- [ ] **Step 3: Verify build**

```bash
npx astro check && npx astro build
```

Expected: 0 errors, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/pages/blog/[slug].astro
git commit -m "feat(blog/slug): add scroll-reveal with sequential delays for editorial entrance"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Script `scroll-reveal.ts` with lazy GSAP + IntersectionObserver → Task 1
- [x] CSS initial hidden state + `prefers-reduced-motion` override → Task 2
- [x] Homepage: numbers (stagger 0.1), framework head/focal (reveal), pillars (stagger 0.08), metrics (stagger 0.08), method steps (stagger 0.1), VSL cta (reveal), FAQ head (reveal), FAQ list (stagger 0.06), blog preview grid (stagger 0.08), CTA final inner (reveal) → Task 3
- [x] Blog index: featured (stagger 0.1), rest (stagger 0.07) → Task 4
- [x] Blog slug: breadcrumb (0), header (0.08), cover (0.16), body (0.22), nav (0) → Task 5
- [x] `prefers-reduced-motion` in script and CSS → Tasks 1 and 2
- [x] Script import in all 3 pages → Tasks 3, 4, 5

**Type consistency:** `data-reveal`, `data-reveal-item`, `data-reveal-stagger`, `data-reveal-delay` — same attribute names in script (Task 1), CSS (Task 2), and all markup (Tasks 3-5). Script reads `dataset.revealDelay` and `dataset.revealStagger` — matches the HTML attribute names.

**No placeholders:** All code complete. All attribute placements reference exact existing markup. All commands have expected output.
