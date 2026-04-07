/**
 * Gate + design tokens (mesmos dados/uso: copiar, #, .md); UI = site institucional.
 */
(function () {
  var STORAGE_KEY = "arven_templates_session_v1";
  var HASH_HEX = "2d5a0ef2aeb36f5be57f0b3e30567a3ac858ea60d3ce6074a33f78883217ea11";

  var gateWrap = document.getElementById("templates-gate-wrap");
  var appWrap = document.getElementById("templates-app-wrap");
  var form = document.getElementById("templates-gate-form");
  var input = document.getElementById("templates-gate-password");
  var errEl = document.getElementById("templates-gate-error");
  var submitBtn = document.getElementById("templates-gate-submit");
  var tokensRoot = document.getElementById("tokens-root");
  var btnMd = document.getElementById("templates-download-md");
  var tocEl = document.getElementById("templates-toc");

  function showError(msg) {
    if (errEl) {
      errEl.textContent = msg;
      errEl.hidden = false;
    }
  }

  function hideError() {
    if (errEl) errEl.hidden = true;
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function escAttr(s) {
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  var tokenActionsBound = false;

  function sha256Hex(str) {
    if (!window.crypto || !crypto.subtle) return Promise.reject(new Error("no_crypto"));
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(function (buf) {
      return Array.from(new Uint8Array(buf))
        .map(function (b) {
          return b.toString(16).padStart(2, "0");
        })
        .join("");
    });
  }

  function cssForSwatch(item) {
    if (item.kind === "color") return item.value;
    if (item.kind === "hsl-space") return "hsl(" + item.value + ")";
    if (item.kind === "special" && item.value === "transparent") return "transparent";
    return null;
  }

  function tokenId(name) {
    return "token-" + name.replace(/^--/, "").replace(/[^a-z0-9-]/gi, "-");
  }

  function copyCss(item) {
    return item.name + ": " + item.value + ";";
  }

  function renderToc() {
    if (!tocEl || !window.ARVEN_TOKEN_SECTIONS || tocEl.dataset.rendered) return;
    var ul = document.createElement("ul");
    ul.className = "templates-toc__list";
    for (var s = 0; s < ARVEN_TOKEN_SECTIONS.length; s++) {
      var sec = ARVEN_TOKEN_SECTIONS[s];
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + sec.id;
      a.textContent = sec.title;
      li.appendChild(a);
      ul.appendChild(li);
    }
    tocEl.appendChild(ul);
    tocEl.dataset.rendered = "1";
  }

  function renderTokens() {
    if (!tokensRoot || !window.ARVEN_TOKEN_SECTIONS) return;
    var html = "";
    for (var s = 0; s < ARVEN_TOKEN_SECTIONS.length; s++) {
      var sec = ARVEN_TOKEN_SECTIONS[s];
      html += '<section class="templates-tok-sec" id="' + escapeHtml(sec.id) + '">';
      html += '<h2 class="templates-tok-sec__title">' + escapeHtml(sec.title) + "</h2>";
      html += '<div class="templates-tok-grid">';
      for (var i = 0; i < sec.items.length; i++) {
        var item = sec.items[i];
        var bg = cssForSwatch(item);
        var tid = tokenId(item.name);
        var line = copyCss(item);
        html += '<article class="templates-tok-card" id="' + tid + '">';
        if (item.kind === "raw") {
          html +=
            '<div class="templates-tok-card__swatch templates-tok-card__swatch--text" aria-hidden="true">—</div>';
        } else if (item.kind === "special" && item.value === "transparent") {
          html +=
            '<div class="templates-tok-card__swatch templates-tok-card__swatch--checker" aria-hidden="true"></div>';
        } else if (bg) {
          html +=
            '<div class="templates-tok-card__swatch" style="background:' +
            escapeHtml(bg) +
            '" aria-hidden="true"></div>';
        } else {
          html +=
            '<div class="templates-tok-card__swatch templates-tok-card__swatch--text" aria-hidden="true">—</div>';
        }
        html += '<div class="templates-tok-card__body">';
        html += '<span class="templates-tok-card__name">' + escapeHtml(item.name) + "</span>";
        html +=
          '<span class="templates-tok-card__val">' +
          escapeHtml(item.display || item.value) +
          "</span>";
        html += "</div>";
        html += '<div class="templates-tok-card__actions">';
        html +=
          '<button type="button" class="templates-tok-act templates-tok-act--copy" data-copy="' +
          escAttr(line) +
          '" title="Copiar var(...)"><span class="templates-tok-act__lbl">Copiar</span><span class="sr-only"> variável CSS</span></button>';
        html +=
          '<button type="button" class="templates-tok-act templates-tok-act--hash" data-anchor="' +
          tid +
          '" title="Copiar link deste token">#</button>';
        html += "</div>";
        html += "</article>";
      }
      html += "</div></section>";
    }
    tokensRoot.innerHTML = html;
  }

  function renderTokensAndToc() {
    if (!tokensRoot || !window.ARVEN_TOKEN_SECTIONS || tokensRoot.dataset.rendered) return;
    renderTokens();
    renderToc();
    tokensRoot.dataset.rendered = "1";
  }

  function buildMarkdown() {
    var lines = [
      "# Design Tokens",
      "",
      "Variáveis primitivas e semânticas (referência espelhada do site Arven).",
      "",
    ];
    for (var s = 0; s < ARVEN_TOKEN_SECTIONS.length; s++) {
      var sec = ARVEN_TOKEN_SECTIONS[s];
      lines.push("## " + sec.title);
      lines.push("");
      for (var i = 0; i < sec.items.length; i++) {
        lines.push("- `" + sec.items[i].name + "`: " + sec.items[i].value);
      }
      lines.push("");
    }
    return lines.join("\n");
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (res, rej) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        res();
      } catch (e) {
        rej(e);
      }
      document.body.removeChild(ta);
    });
  }

  function bindTokenActions() {
    if (!tokensRoot || tokenActionsBound) return;
    tokenActionsBound = true;
    tokensRoot.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-copy]");
      if (btn && btn.getAttribute("data-copy")) {
        e.preventDefault();
        copyText(btn.getAttribute("data-copy")).catch(function () {});
        return;
      }
      var h = e.target.closest("[data-anchor]");
      if (h) {
        e.preventDefault();
        var id = h.getAttribute("data-anchor");
        var url = window.location.origin + window.location.pathname + "#" + id;
        copyText(url).catch(function () {});
      }
    });
  }

  function showApp() {
    if (gateWrap) gateWrap.setAttribute("hidden", "");
    if (appWrap) {
      appWrap.removeAttribute("hidden");
      appWrap.setAttribute("aria-hidden", "false");
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {}
    renderTokensAndToc();
    bindTokenActions();
    var h = document.getElementById("tokens-page-title");
    if (h) h.focus({ preventScroll: true });
  }

  function tryRestore() {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        renderTokensAndToc();
        bindTokenActions();
        if (gateWrap) gateWrap.setAttribute("hidden", "");
        if (appWrap) {
          appWrap.removeAttribute("hidden");
          appWrap.setAttribute("aria-hidden", "false");
        }
        return true;
      }
    } catch (e) {}
    return false;
  }

  if (tryRestore()) {
    /* já autenticado */
  } else if (form && input) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideError();
      var raw = (input.value || "").trim();
      if (!raw) {
        showError("Digite a senha.");
        return;
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Verificando…";
      }
      sha256Hex(raw)
        .then(function (hex) {
          if (hex === HASH_HEX) {
            input.value = "";
            showApp();
          } else {
            showError("Senha incorreta.");
          }
        })
        .catch(function () {
          showError("Não foi possível validar neste ambiente. Use o site em HTTPS.");
        })
        .then(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Entrar";
          }
        });
    });
  }

  if (btnMd) {
    btnMd.addEventListener("click", function () {
      var md = buildMarkdown();
      var blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "arven-design-tokens.md";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(a.href);
      document.body.removeChild(a);
    });
  }
})();
