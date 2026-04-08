/**
 * Number Ticker — spring animation (stiffness: 100, damping: 60)
 * Starts when element enters viewport (IntersectionObserver, once).
 * Respects prefers-reduced-motion.
 * Markup: <span data-ticker="40">0</span>
 */
(function () {
  const tickers = document.querySelectorAll<HTMLElement>('[data-ticker]');
  if (!tickers.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animate(el: HTMLElement) {
    const target = parseFloat(el.dataset.ticker ?? '0');
    const decimals = parseInt(el.dataset.tickerDecimals ?? '0', 10);
    const suffix = el.dataset.tickerSuffix ?? '';
    if (isNaN(target)) return;

    // Reset to 0 for animation (SSR renders the real value for crawlers)
    el.textContent = '0';

    if (reduced) {
      el.textContent = fmt(target, decimals) + suffix;
      return;
    }

    let current = 0;
    let velocity = 0;
    const stiffness = 100;
    const damping = 60;
    let last: number | null = null;

    function tick(now: number) {
      if (last === null) last = now;
      const dt = Math.min((now - last) / 1000, 0.064); // cap at 64 ms
      last = now;

      const force = stiffness * (target - current) - damping * velocity;
      velocity += force * dt;
      current += velocity * dt;

      const done = Math.abs(target - current) < 0.02 && Math.abs(velocity) < 0.02;
      el.textContent = fmt(done ? target : current, decimals) + suffix;
      if (!done) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function fmt(n: number, decimals: number): string {
    return n.toFixed(decimals);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animate(e.target as HTMLElement);
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  tickers.forEach((el) => io.observe(el));
})();
