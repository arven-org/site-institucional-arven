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
