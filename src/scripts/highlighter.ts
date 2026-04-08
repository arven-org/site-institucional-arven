import { annotate } from 'rough-notation';
import type { RoughAnnotationType } from 'rough-notation/lib/model';

const BORDER_COLOR = 'rgba(255,255,255,0.25)';

document.querySelectorAll<HTMLElement>('[data-highlight]').forEach((el) => {
  const action = (el.dataset.highlight || 'underline') as RoughAnnotationType;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();

      const annotation = annotate(el, {
        type: action,
        color: BORDER_COLOR,
        strokeWidth: 1.5,
        animationDuration: 800,
        iterations: 1,
        padding: 2,
        multiline: true,
      });
      annotation.show();
    },
    { threshold: 0.3 },
  );

  observer.observe(el);
});
