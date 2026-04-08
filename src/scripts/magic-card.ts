/**
 * MagicCard — vanilla port of Magic UI MagicCard (gradient mode).
 * Tracks mouse position and paints:
 *  1. A radial gradient on the border (via background clip trick)
 *  2. A soft spotlight inside the card
 * Markup: element with [data-magic-card] + a child .magic-card__spotlight
 */
(function () {
  const GRADIENT_SIZE = 300;
  const BORDER_FROM = 'rgba(96,165,250,0.7)';   // blue-ish
  const BORDER_TO   = 'rgba(59,130,246,0.2)';
  const BORDER_FALLBACK = 'rgba(255,255,255,0.08)'; // var(--border)
  const SPOTLIGHT_COLOR = 'rgba(59,130,246,0.06)';

  document.querySelectorAll<HTMLElement>('[data-magic-card]').forEach((card) => {
    const spotlight = card.querySelector<HTMLElement>('.magic-card__spotlight');

    function paint(x: number, y: number) {
      card.style.background = `
        linear-gradient(var(--bg-surface) 0 0) padding-box,
        radial-gradient(
          ${GRADIENT_SIZE}px circle at ${x}px ${y}px,
          ${BORDER_FROM},
          ${BORDER_TO},
          ${BORDER_FALLBACK} 100%
        ) border-box
      `;
      if (spotlight) {
        spotlight.style.background = `radial-gradient(${GRADIENT_SIZE}px circle at ${x}px ${y}px, ${SPOTLIGHT_COLOR}, transparent 100%)`;
        spotlight.style.opacity = '1';
      }
    }

    function reset() {
      card.style.background = '';
      if (spotlight) spotlight.style.opacity = '0';
    }

    card.addEventListener('pointermove', (e: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      paint(e.clientX - rect.left, e.clientY - rect.top);
    });

    card.addEventListener('pointerleave', reset);
  });
})();
