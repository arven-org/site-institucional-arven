/**
 * Smooth accordion for <details> FAQ items.
 * Intercepts click to animate close before removing [open].
 */
document.querySelectorAll<HTMLDetailsElement>('.faq__item').forEach((item) => {
  const summary = item.querySelector('summary');
  if (!summary) return;

  summary.addEventListener('click', (e) => {
    e.preventDefault();

    if (item.open) {
      // Closing: let CSS transition grid-template-rows → 0fr, then remove [open]
      item.classList.add('faq__item--closing');
      const answer = item.querySelector('.faq__a') as HTMLElement | null;
      if (answer) {
        answer.addEventListener('transitionend', () => {
          item.classList.remove('faq__item--closing');
          item.open = false;
        }, { once: true });
      } else {
        item.open = false;
      }
    } else {
      // Opening: set [open] and let CSS animate
      item.open = true;
    }
  });
});
