/**
 * Menu mobile: drawer, clique fora fecha, foco básico, scroll lock.
 * Markup: .nav, .nav__toggle, .nav__links (#nav-links)
 */
(function () {
  var nav = document.querySelector(".nav");
  if (!nav) return;
  var toggle = nav.querySelector(".nav__toggle");
  var links = nav.querySelector(".nav__links");
  if (!toggle || !links) return;

  var mq = window.matchMedia("(max-width: 900px)");
  var isOpen = false;
  var labelOpen = toggle.getAttribute("aria-label") || "Abrir menu";

  function firstFocusable() {
    return links!.querySelector('a[href], button:not([disabled])');
  }

  function setOpen(open: boolean) {
    isOpen = open;
    nav!.classList.toggle("nav--open", open);
    toggle!.setAttribute("aria-expanded", open ? "true" : "false");
    toggle!.setAttribute("aria-label", open ? "Fechar menu" : labelOpen);
    document.documentElement.style.overflow = open ? "hidden" : "";

    if (open && mq.matches) {
      window.requestAnimationFrame(function () {
        var el = firstFocusable();
        if (el) (el as HTMLElement).focus();
      });
    } else if (!open) {
      (toggle as HTMLElement).focus();
    }
  }

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    setOpen(!isOpen);
  });

  links!.addEventListener("click", function (e) {
    var target = e.target as HTMLElement;
    if (target && target.tagName === "A") setOpen(false);
  });

  document.addEventListener("click", function (e) {
    if (!isOpen) return;
    if (nav!.contains(e.target as Node)) return;
    setOpen(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen) setOpen(false);
  });

  function handleMq() {
    if (!mq.matches && isOpen) setOpen(false);
  }
  if (mq.addEventListener) mq.addEventListener("change", handleMq);
  else if (mq.addListener) mq.addListener(handleMq);
})();
