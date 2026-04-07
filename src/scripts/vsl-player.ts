/**
 * VSL: controles próprios — tempo, progresso visual (sem seek), buffer/carregamento,
 * sem avançar além do que já foi assistido.
 */
(function () {
  var root = document.querySelector("[data-vsl-root]");
  var video = document.querySelector("[data-vsl-player]") as HTMLVideoElement | null;
  if (!root || !video) return;

  var btnPlay = root.querySelector("[data-vsl-play]");
  var elTime = root.querySelector("[data-vsl-time]");
  var elProgress = root.querySelector("[data-vsl-progress]") as HTMLElement | null;
  var elBuffer = root.querySelector("[data-vsl-buffer]") as HTMLElement | null;
  var viewport = root.querySelector(".statement-video__viewport");

  var maxWatched = 0;
  var correcting = false;

  function fmt(sec: number): string {
    if (!isFinite(sec) || sec < 0) return "0:00";
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function updateTime() {
    if (!elTime) return;
    var d = video!.duration;
    elTime.textContent = fmt(video!.currentTime) + " / " + fmt(d);
  }

  function updateProgress() {
    if (!elProgress) return;
    var d = video!.duration;
    var pct = isFinite(d) && d > 0 ? (video!.currentTime / d) * 100 : 0;
    elProgress.style.width = Math.min(100, Math.max(0, pct)) + "%";
  }

  function updateBuffer() {
    if (!elBuffer) return;
    var d = video!.duration;
    if (!isFinite(d) || d <= 0) {
      elBuffer.style.width = "0%";
      return;
    }
    try {
      var buf = video!.buffered;
      if (buf && buf.length) {
        var end = buf.end(buf.length - 1);
        elBuffer.style.width = Math.min(100, (end / d) * 100) + "%";
      }
    } catch (e) {
      elBuffer.style.width = "0%";
    }
  }

  function setBuffering(on: boolean) {
    if (!viewport) return;
    viewport.classList.toggle("statement-video__viewport--buffering", on);
  }

  function clampForward() {
    if (correcting) return;
    var t = video!.currentTime;
    if (t > maxWatched + 0.15) {
      correcting = true;
      video!.currentTime = maxWatched;
      requestAnimationFrame(function () {
        correcting = false;
      });
    }
  }

  function syncPlayButton() {
    if (!btnPlay) return;
    var playing = !video!.paused && !video!.ended;
    btnPlay.setAttribute("aria-label", playing ? "Pausar" : "Reproduzir");
    btnPlay.classList.toggle("is-playing", playing);
  }

  video.addEventListener("timeupdate", function () {
    if (correcting || video!.seeking) return;
    var t = video!.currentTime;
    if (t > maxWatched) maxWatched = t;
    updateTime();
    updateProgress();
  });

  video.addEventListener("seeking", clampForward);
  video.addEventListener("seeked", clampForward);

  video.addEventListener("progress", updateBuffer);
  video.addEventListener("loadedmetadata", function () {
    updateTime();
    updateProgress();
    updateBuffer();
  });

  video.addEventListener("loadstart", function () {
    setBuffering(true);
  });
  video.addEventListener("waiting", function () {
    setBuffering(true);
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

  video.addEventListener("play", syncPlayButton);
  video.addEventListener("pause", syncPlayButton);
  video.addEventListener("ended", function () {
    syncPlayButton();
    updateTime();
    updateProgress();
  });

  if (btnPlay) {
    btnPlay.addEventListener("click", function () {
      if (video!.paused || video!.ended) {
        video!.play().catch(function () {});
      } else {
        video!.pause();
      }
    });
  }

  video.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
    }
  });

  video.setAttribute("tabindex", "-1");

  syncPlayButton();
  updateTime();
  updateProgress();
})();
