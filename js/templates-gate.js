/**
 * Gate client-side para /templates.html. Sessão em sessionStorage.
 * A senha valida por hash SHA-256 (não armazenar plaintext no repo).
 */
(function () {
  var STORAGE_KEY = "arven_templates_session_v1";
  var HASH_HEX = "2d5a0ef2aeb36f5be57f0b3e30567a3ac858ea60d3ce6074a33f78883217ea11";

  var gate = document.getElementById("templates-gate");
  var content = document.getElementById("templates-content");
  var form = document.getElementById("templates-gate-form");
  var input = document.getElementById("templates-gate-password");
  var err = document.getElementById("templates-gate-error");
  var submitBtn = document.getElementById("templates-gate-submit");

  if (!gate || !content || !form || !input) return;

  function showError(msg) {
    if (err) {
      err.textContent = msg;
      err.hidden = false;
    }
  }

  function hideError() {
    if (err) err.hidden = true;
  }

  function unlock() {
    gate.setAttribute("hidden", "");
    gate.setAttribute("aria-hidden", "true");
    content.removeAttribute("hidden");
    content.setAttribute("aria-hidden", "false");
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {}
    var h = content.querySelector("h1, h2");
    if (h) h.focus({ preventScroll: true });
  }

  function restoreSession() {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        unlock();
        return true;
      }
    } catch (e) {}
    return false;
  }

  function sha256Hex(str) {
    if (!window.crypto || !crypto.subtle) {
      return Promise.reject(new Error("no_crypto"));
    }
    var enc = new TextEncoder();
    return crypto.subtle.digest("SHA-256", enc.encode(str)).then(function (buf) {
      return Array.from(new Uint8Array(buf))
        .map(function (b) {
          return b.toString(16).padStart(2, "0");
        })
        .join("");
    });
  }

  if (restoreSession()) {
    return;
  }

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
    }
    sha256Hex(raw)
      .then(function (hex) {
        if (hex === HASH_HEX) {
          input.value = "";
          unlock();
        } else {
          showError("Senha incorreta.");
        }
      })
      .catch(function () {
        showError("Não foi possível validar neste ambiente. Use HTTPS (site publicado) ou outro navegador.");
      })
      .then(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
})();
