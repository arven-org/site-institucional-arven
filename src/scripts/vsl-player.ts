/**
 * VSL: controles próprios — tempo, progresso visual (sem seek), buffer/carregamento.
 * Em touch (Safari iOS): não usar clamp em seeking/seeked — o WebKit dispara seeks
 * espúrios e currentTime = maxWatched trava a reprodução.
 */
function isTouchLikeDevice(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia === "undefined") return false;
  if (window.matchMedia("(pointer: coarse)").matches) return true;
  return typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;
}

(function () {
  const root = document.querySelector("[data-vsl-root]");
  const video = document.querySelector("[data-vsl-player]") as HTMLVideoElement | null;
  if (!root || !video) return;

  const source = video.querySelector("source");
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const srcDesktop = video.getAttribute(isSafari ? "data-vsl-src-desktop-fallback" : "data-vsl-src-desktop")
    || video.getAttribute("data-vsl-src-desktop");
  const srcMobile = video.getAttribute(isSafari ? "data-vsl-src-mobile-fallback" : "data-vsl-src-mobile")
    || video.getAttribute("data-vsl-src-mobile");
  const posterDesktop = video.getAttribute("data-vsl-poster-desktop");
  const posterMobile = video.getAttribute("data-vsl-poster-mobile");
  const mqVsl = window.matchMedia("(max-width: 900px)");
  const touchLike = isTouchLikeDevice();

  const btnPlay = root.querySelector("[data-vsl-play]");
  const elTime = root.querySelector("[data-vsl-time]");
  const elProgress = root.querySelector("[data-vsl-progress]") as HTMLElement | null;
  const elBuffer = root.querySelector("[data-vsl-buffer]") as HTMLElement | null;
  const viewport = root.querySelector(".statement-video__viewport");
  const overlay = root.querySelector("[data-vsl-overlay]") as HTMLElement | null;

  let maxWatched = 0;
  let correcting = false;
  let lastAppliedSrc: string | null = null;

  /** WebKit mobile: dois rAF antes de load() evita race com troca de src. */
  function scheduleLoad() {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        try {
          video.load();
        } catch {
          /* noop */
        }
      });
    });
  }

  function applySourceForViewport(): void {
    if (!source || !srcDesktop || !srcMobile) return;
    const pickMobile = mqVsl.matches;
    const pickedSrc = pickMobile ? srcMobile : srcDesktop;
    if (pickedSrc === lastAppliedSrc) return;
    lastAppliedSrc = pickedSrc;
    maxWatched = 0;
    source.setAttribute("src", pickedSrc);
    if (posterDesktop && posterMobile) {
      const p = pickMobile ? posterMobile : posterDesktop;
      video.setAttribute("poster", p);
    }
    scheduleLoad();
  }

  if (source && srcDesktop && srcMobile) {
    lastAppliedSrc = source.getAttribute("src");
    applySourceForViewport();
  } else if (posterDesktop && posterMobile) {
    const pickMobile = mqVsl.matches;
    video.setAttribute("poster", pickMobile ? posterMobile : posterDesktop);
  }

  if (typeof mqVsl.addEventListener === "function") {
    mqVsl.addEventListener("change", applySourceForViewport);
  } else if (typeof (mqVsl as MediaQueryList).addListener === "function") {
    (mqVsl as MediaQueryList).addListener(applySourceForViewport);
  }

  function fmt(sec: number): string {
    if (!isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function updateTime() {
    if (!elTime) return;
    const d = video.duration;
    elTime.textContent = fmt(video.currentTime) + " / " + fmt(d);
  }

  function updateProgress() {
    if (!elProgress) return;
    const d = video.duration;
    const pct = isFinite(d) && d > 0 ? (video.currentTime / d) * 100 : 0;
    elProgress.style.width = Math.min(100, Math.max(0, pct)) + "%";
  }

  function updateBuffer() {
    if (!elBuffer) return;
    const d = video.duration;
    if (!isFinite(d) || d <= 0) {
      elBuffer.style.width = "0%";
      return;
    }
    try {
      const buf = video.buffered;
      if (buf && buf.length) {
        const end = buf.end(buf.length - 1);
        elBuffer.style.width = Math.min(100, (end / d) * 100) + "%";
      }
    } catch {
      elBuffer.style.width = "0%";
    }
  }

  function setBuffering(on: boolean) {
    if (!viewport) return;
    viewport.classList.toggle("statement-video__viewport--buffering", on);
  }

  function clampForward() {
    if (touchLike || correcting) return;
    const t = video.currentTime;
    const slack = 0.4;
    if (t > maxWatched + slack) {
      correcting = true;
      video.currentTime = maxWatched;
      window.requestAnimationFrame(function () {
        correcting = false;
      });
    }
  }

  function requestPlay() {
    const p = video.play();
    if (p !== undefined) p.catch(function () {});
  }

  function syncPlayButton() {
    if (!btnPlay) return;
    const playing = !video.paused && !video.ended;
    btnPlay.setAttribute("aria-label", playing ? "Pausar" : "Reproduzir");
    btnPlay.classList.toggle("is-playing", playing);
  }

  function syncOverlay() {
    if (!overlay) return;
    const playing = !video.paused && !video.ended;
    overlay.classList.toggle("is-hidden", playing);
  }

  video.addEventListener("timeupdate", function () {
    if (correcting || video.seeking) return;
    const t = video.currentTime;
    if (t > maxWatched) maxWatched = t;
    updateTime();
    updateProgress();
  });

  if (!touchLike) {
    video.addEventListener("seeking", clampForward);
    video.addEventListener("seeked", clampForward);
  }

  video.addEventListener("progress", updateBuffer);
  video.addEventListener("loadedmetadata", function () {
    maxWatched = 0;
    updateTime();
    updateProgress();
    updateBuffer();
  });

  /* Drop poster once the first frame is decoded so the browser shows
     the actual HLG-rendered frame instead of a static JPEG. */
  video.addEventListener("loadeddata", function () {
    video.removeAttribute("poster");
  }, { once: true });

  video.addEventListener("loadstart", function () {
    setBuffering(true);
  });
  video.addEventListener("waiting", function () {
    setBuffering(true);
  });
  video.addEventListener("stalled", function () {
    if (!video.paused) setBuffering(true);
  });
  video.addEventListener("playing", function () {
    setBuffering(false);
  });
  video.addEventListener("canplay", function () {
    setBuffering(false);
  });
  video.addEventListener("canplaythrough", function () {
    setBuffering(false);
  });
  video.addEventListener("error", function () {
    setBuffering(false);
    syncPlayButton();
    syncOverlay();
  });

  video.addEventListener("play", function () {
    syncPlayButton();
    syncOverlay();
  });
  video.addEventListener("pause", function () {
    syncPlayButton();
    syncOverlay();
  });
  video.addEventListener("ended", function () {
    syncPlayButton();
    syncOverlay();
    updateTime();
    updateProgress();
  });

  if (btnPlay) {
    btnPlay.addEventListener("click", function () {
      if (video.paused || video.ended) requestPlay();
      else video.pause();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", requestPlay);
    overlay.addEventListener(
      "touchend",
      function (e) {
        e.preventDefault();
        requestPlay();
      },
      { passive: false }
    );
  }

  video.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
    }
  });

  video.setAttribute("tabindex", "-1");

  syncPlayButton();
  syncOverlay();
  updateTime();
  updateProgress();
})();
