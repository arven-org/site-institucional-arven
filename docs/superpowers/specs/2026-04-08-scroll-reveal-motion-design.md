# Design: Scroll Reveal Motion System

**Data:** 2026-04-08
**Status:** Aprovado

---

## Objetivo

Aplicar motion system híbrido (CSS above-the-fold já existente + GSAP lazy para scroll reveals) nas páginas homepage, `/blog` e `/blog/[slug]`. Abordagem A: reveal único e consistente via `data-reveal` / `data-reveal-stagger`, coerente com o design editorial do site.

---

## Contexto

- Projeto **Astro 6** com GSAP já instalado (`dependencies`).
- Above-the-fold já animado via CSS keyframes (`heroBlurInUp`, `fadeUp`) — não tocar.
- Elementos abaixo do fold: nenhuma animação de entrada ainda.
- Referência: doc de motion da ArvenLP (Next.js) — adaptar padrão GSAP lazy + IntersectionObserver para Astro.
- `prefers-reduced-motion` já respeitado no `number-ticker.ts` — manter o mesmo padrão.

---

## Abordagem

**Um único efeito:** `opacity: 0 → 1` + `y: 24px → 0`, `duration: 0.55s`, `ease: "power2.out"`.

Coerente com `cubic-bezier(0.22, 1, 0.36, 1)` já usado no CSS hero (equivalente aproximado em GSAP: `power2.out`).

**Dois atributos HTML:**
- `data-reveal` — anima o elemento individual
- `data-reveal-stagger` — observa o container, anima filhos `[data-reveal-item]` com stagger
- `data-reveal-delay="0.08"` — delay opcional em segundos (usado no slug para sequência de entrada)

---

## Parte 1 — Script `src/scripts/scroll-reveal.ts`

```typescript
(function () {
  // Lazy load GSAP — só no cliente, após interação com viewport
  const allReveal = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  const allStagger = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal-stagger]'));

  if (!allReveal.length && !allStagger.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    // Estado final imediato — sem animação
    allReveal.forEach((el) => { el.style.opacity = '1'; });
    allStagger.forEach((container) => {
      container.querySelectorAll<HTMLElement>('[data-reveal-item]').forEach((item) => {
        item.style.opacity = '1';
      });
    });
    return;
  }

  import('gsap').then(({ gsap }) => {
    // ── Elementos individuais ────────────────────────────────────────────
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

    // ── Grupos com stagger ───────────────────────────────────────────────
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

---

## Parte 2 — CSS `src/styles/global.css`

Adicionar no bloco de animações (após as regras `heroBlurInUp`):

```css
/* Scroll reveal — estado inicial (GSAP controla y via JS) */
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

**Nota:** `opacity: 0` via CSS garante que elementos ficam invisíveis mesmo antes do JS carregar (evita flash). O `y` NÃO é aplicado via CSS para não conflitar com transforms existentes — GSAP aplica via `gsap.set()`.

---

## Parte 3 — Markup por página

### Homepage (`src/pages/index.astro`)

```html
<!-- NÚMEROS: stagger nos 3 items -->
<div class="numbers__grid" data-reveal-stagger="0.1">
  <div class="numbers__item" data-reveal-item>...</div>
  <div class="numbers__item" data-reveal-item>...</div>
  <div class="numbers__item" data-reveal-item>...</div>
</div>

<!-- FRAMEWORK: head individual, pillars e metrics em stagger -->
<div class="framework__head" data-reveal>...</div>
<div class="framework__focal" data-reveal>...</div>
<div class="framework__pillars" data-reveal-stagger>
  <div class="framework__pillar" data-reveal-item>...</div> × 4
</div>
<div class="framework__metrics" data-reveal-stagger>
  <div class="framework__metric" data-reveal-item>...</div> × 4
</div>

<!-- MÉTODO: steps em stagger -->
<div class="method__steps" data-reveal-stagger="0.1">
  <div class="step" data-reveal-item>...</div> × 4
</div>

<!-- VSL: cta text -->
<div class="statement-video__cta" data-reveal>...</div>

<!-- FAQ: head + items em stagger -->
<header class="faq__head" data-reveal>...</header>
<div class="faq__list" data-reveal-stagger="0.06">
  <details class="faq__item" data-reveal-item>...</details> × 6
</div>

<!-- BLOG PREVIEW: cards em stagger -->
<div class="blog-preview__grid" data-reveal-stagger>
  <a class="blog-preview__card" data-reveal-item>...</a> × 3
</div>

<!-- CTA FINAL -->
<div class="cta-final__inner" data-reveal>...</div>
```

### `/blog` (`src/pages/blog/index.astro`)

```html
<!-- Featured 2 cards em stagger -->
<div class="blog-featured" data-reveal-stagger="0.1">
  <a class="blog-featured__card" data-reveal-item>...</a> × 2
</div>

<!-- Rest cards em stagger (delay menor — grid mais denso) -->
<div class="blog-rest" data-reveal-stagger="0.07">
  <a class="blog-rest__card" data-reveal-item>...</a> × N
</div>
```

### `/blog/[slug]` (`src/pages/blog/[slug].astro`)

```html
<!-- Entrada sequencial com delay crescente -->
<nav class="blog-post__breadcrumb" data-reveal data-reveal-delay="0">...</nav>
<header class="blog-post__header" data-reveal data-reveal-delay="0.08">...</header>
<figure class="blog-post__cover" data-reveal data-reveal-delay="0.16">...</figure>
<div class="blog-post__body" data-reveal data-reveal-delay="0.22">...</div>
<!-- Nav prev/next: observado independente, sem delay fixo -->
<footer class="blog-post__nav" data-reveal>...</footer>
```

---

## Parte 4 — Integração do script nas páginas

Cada página adiciona ao final:

```astro
<script>
  import '../scripts/scroll-reveal.ts';
</script>
```

(ou `../../scripts/scroll-reveal.ts` para as páginas de blog)

---

## Ficheiros a modificar/criar

| Ficheiro | Ação |
|---|---|
| `src/scripts/scroll-reveal.ts` | Criar |
| `src/styles/global.css` | Adicionar regra `[data-reveal]` no bloco de animações |
| `src/pages/index.astro` | Adicionar atributos `data-reveal*` + `<script>` |
| `src/pages/blog/index.astro` | Adicionar atributos `data-reveal*` + `<script>` |
| `src/pages/blog/[slug].astro` | Adicionar atributos `data-reveal*` + `<script>` |

---

## Fora do escopo

- Outras páginas (`/sobre`, `/servicos`, `/cases`, `/qualificacao`) — para depois.
- Pin/scrub ScrollTrigger — não necessário para este estilo editorial.
- Parallax na cover do slug — não solicitado.
- Transição entre rotas — Astro não tem router client-side por padrão.
