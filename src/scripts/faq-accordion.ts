/**
 * Smooth accordion for <details> FAQ items.
 * Measures real content height and animates open/close with JS.
 */
const DURATION = 700;
const EASING = 'ease';

document.querySelectorAll<HTMLDetailsElement>('.faq__item').forEach((item) => {
  const summary = item.querySelector<HTMLElement>('.faq__q');
  const answer = item.querySelector<HTMLElement>('.faq__a');
  if (!summary || !answer) return;

  let animation: Animation | null = null;

  summary.addEventListener('click', (e) => {
    e.preventDefault();

    // Cancel any running animation
    if (animation) animation.cancel();

    const summaryH = summary.offsetHeight;

    if (item.open) {
      // Closing: animate from full height → summary-only height
      const startH = item.offsetHeight;
      const endH = summaryH;

      animation = item.animate(
        { height: [`${startH}px`, `${endH}px`] },
        { duration: DURATION, easing: EASING },
      );
      animation.onfinish = () => {
        item.open = false;
        item.style.height = '';
        item.style.overflow = '';
        animation = null;
      };
      item.style.overflow = 'hidden';
    } else {
      // Opening: set open, measure, then animate from summary-only → full
      item.open = true;
      const endH = item.offsetHeight;
      const startH = summaryH;

      animation = item.animate(
        { height: [`${startH}px`, `${endH}px`] },
        { duration: DURATION, easing: EASING },
      );
      animation.onfinish = () => {
        item.style.height = '';
        item.style.overflow = '';
        animation = null;
      };
      item.style.overflow = 'hidden';
    }
  });
});
