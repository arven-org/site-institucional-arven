/**
 * Scroll Reveal — GSAP + IntersectionObserver.
 * Attributes:
 *   data-reveal              → fade-up individual element
 *   data-reveal-delay="0.1"  → optional delay in seconds
 *   data-reveal-stagger      → observe container, animate [data-reveal-item] children
 *   data-reveal-stagger="0.1"→ custom stagger interval (default 0.08)
 * Respects prefers-reduced-motion.
 */
import { gsap } from 'gsap';

(function () {
  var allReveal = document.querySelectorAll('[data-reveal]');
  var allStagger = document.querySelectorAll('[data-reveal-stagger]');

  if (!allReveal.length && !allStagger.length) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    allReveal.forEach(function (el) {
      (el as HTMLElement).style.opacity = '1';
    });
    allStagger.forEach(function (container) {
      container.querySelectorAll('[data-reveal-item]').forEach(function (item) {
        (item as HTMLElement).style.opacity = '1';
      });
    });
    return;
  }

  // Individual elements
  allReveal.forEach(function (el) {
    gsap.set(el, { opacity: 0, y: 32 });
  });

  var revealObserver = new IntersectionObserver(
    function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        var el = entries[i].target;
        var delay = parseFloat((el as HTMLElement).dataset.revealDelay || '0');
        gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out', delay: delay });
        revealObserver.unobserve(el);
      }
    },
    { threshold: 0.12, rootMargin: '-40px 0px' }
  );

  allReveal.forEach(function (el) { revealObserver.observe(el); });

  // Stagger groups
  allStagger.forEach(function (container) {
    var items = container.querySelectorAll('[data-reveal-item]');
    if (!items.length) return;

    var staggerVal = parseFloat((container as HTMLElement).dataset.revealStagger || '0.15');
    gsap.set(items, { opacity: 0, y: 32 });

    var staggerObserver = new IntersectionObserver(
      function (entries) {
        for (var j = 0; j < entries.length; j++) {
          if (!entries[j].isIntersecting) continue;
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: 'power2.out',
            stagger: staggerVal,
          });
          staggerObserver.unobserve(entries[j].target);
        }
      },
      { threshold: 0.1, rootMargin: '-20px 0px' }
    );

    staggerObserver.observe(container);
  });
})();
