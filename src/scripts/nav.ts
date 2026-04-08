/**
 * Menu mobile: drawer, overlay, scroll lock, foco e teclado (WCAG-friendly).
 * Markup: .nav, .nav__backdrop (#nav-backdrop), #nav-links, .nav__toggle
 */
(function () {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  const toggle = nav.querySelector(".nav__toggle") as HTMLButtonElement | null;
  const links = nav.querySelector("#nav-links") as HTMLElement | null;
  const backdrop = nav.querySelector("#nav-backdrop") as HTMLElement | null;
  if (!toggle || !links) return;

  const mq = window.matchMedia("(max-width: 900px)");
  let isOpen = false;
  const labelOpen = toggle.getAttribute("aria-label") || "Abrir menu";

  function getMenuLinks(): HTMLElement[] {
    return Array.from(links.querySelectorAll<HTMLElement>("a[href]"));
  }

  /** Em mobile com menu fechado, links não entram na ordem de tabulação. */
  function syncLayerAccessibility() {
    const mobile = mq.matches;
    const anchors = getMenuLinks();
    if (!mobile) {
      links.removeAttribute("aria-hidden");
      anchors.forEach((a) => a.removeAttribute("tabindex"));
      if (backdrop) backdrop.setAttribute("aria-hidden", "true");
      return;
    }
    if (!isOpen) {
      links.setAttribute("aria-hidden", "true");
      anchors.forEach((a) => a.setAttribute("tabindex", "-1"));
      if (backdrop) backdrop.setAttribute("aria-hidden", "true");
    } else {
      links.setAttribute("aria-hidden", "false");
      anchors.forEach((a) => a.removeAttribute("tabindex"));
      if (backdrop) backdrop.setAttribute("aria-hidden", "false");
    }
  }

  function setOpen(open: boolean) {
    isOpen = open;
    nav.classList.toggle("nav--open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Fechar menu" : labelOpen);
    document.documentElement.style.overflow = open && mq.matches ? "hidden" : "";
    syncLayerAccessibility();

    if (open && mq.matches) {
      window.requestAnimationFrame(() => {
        getMenuLinks()[0]?.focus();
      });
    } else if (!open) {
      toggle.focus();
    }
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(!isOpen);
  });

  backdrop?.addEventListener("click", () => {
    if (isOpen) setOpen(false);
  });

  links.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest("a");
    if (a) setOpen(false);
  });

  document.addEventListener("click", (e) => {
    if (!isOpen || !mq.matches) return;
    if (nav.contains(e.target as Node)) return;
    setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen && mq.matches) {
      e.preventDefault();
      setOpen(false);
    }
  });

  /** Tab / Shift+Tab entre ítens do menu e o botão hamburger. */
  toggle.addEventListener("keydown", (e) => {
    if (!isOpen || !mq.matches || e.key !== "Tab") return;
    const items = getMenuLinks();
    if (items.length === 0) return;
    if (e.shiftKey) {
      e.preventDefault();
      items[items.length - 1].focus();
    } else {
      e.preventDefault();
      items[0].focus();
    }
  });

  links.addEventListener("keydown", (e) => {
    if (!isOpen || !mq.matches || e.key !== "Tab") return;
    const items = getMenuLinks();
    if (items.length === 0) return;
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (i < 0) return;
    if (!e.shiftKey && i === items.length - 1) {
      e.preventDefault();
      toggle.focus();
    }
    if (e.shiftKey && i === 0) {
      e.preventDefault();
      toggle.focus();
    }
  });

  function handleMqChange() {
    if (!mq.matches && isOpen) setOpen(false);
    syncLayerAccessibility();
    if (!mq.matches) document.documentElement.style.overflow = "";
  }
  mq.addEventListener("change", handleMqChange);
  syncLayerAccessibility();
})();
