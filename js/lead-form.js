/**
 * Formulário multi-etapas: envia lead via /api/lead (webhook) e exibe confirmação.
 */
(function () {
  var form = document.getElementById("arven-lead-form");
  if (!form) return;

  var shell = form.closest(".lead-form-shell");
  var successPanel = shell ? shell.querySelector("#lead-form-success") : document.getElementById("lead-form-success");

  var steps = form.querySelectorAll(".lead-form__step");
  var progress = form.querySelector(".lead-form__progress-fill");
  var stepLabel = form.querySelector("[data-lead-step-label]");
  var btnPrev = form.querySelector('[data-lead-action="prev"]');
  var btnNext = form.querySelector('[data-lead-action="next"]');
  var btnSubmit = form.querySelector('[data-lead-action="submit"]');
  var reviewRoot = form.querySelector("[data-lead-review]");

  var idx = 0;
  var total = steps.length;

  function showSuccessPanel() {
    form.setAttribute("hidden", "");
    form.setAttribute("aria-hidden", "true");
    if (successPanel) {
      successPanel.hidden = false;
      var t = document.getElementById("lead-form-success-title");
      if (t) t.focus({ preventScroll: true });
    }
  }

  function showStep(i) {
    idx = Math.max(0, Math.min(i, total - 1));
    steps.forEach(function (el, j) {
      var on = j === idx;
      el.hidden = !on;
      el.setAttribute("aria-hidden", on ? "false" : "true");
    });
    if (progress) {
      progress.style.width = ((idx + 1) / total) * 100 + "%";
      progress.parentElement.setAttribute("aria-valuenow", String(idx + 1));
      progress.parentElement.setAttribute("aria-valuemax", String(total));
    }
    if (stepLabel) {
      stepLabel.textContent = "Passo " + (idx + 1) + " de " + total;
    }
    if (btnPrev) {
      if (idx === 0) btnPrev.setAttribute("hidden", "");
      else btnPrev.removeAttribute("hidden");
    }
    if (btnNext) {
      if (idx === total - 1) btnNext.setAttribute("hidden", "");
      else btnNext.removeAttribute("hidden");
    }
    if (btnSubmit) {
      if (idx === total - 1) btnSubmit.removeAttribute("hidden");
      else btnSubmit.setAttribute("hidden", "");
    }

    if (idx === total - 1) {
      renderReview();
    }

    var focusable = steps[idx].querySelector("input, select, textarea, button");
    if (focusable) focusable.focus({ preventScroll: true });
  }

  function getVal(name) {
    var el = form.querySelector('[name="' + name + '"]');
    if (!el) return "";
    if (el.type === "checkbox") return el.checked ? "Sim" : "Não";
    return (el.value || "").trim();
  }

  function validateStep(i) {
    var panel = steps[i];
    var required = panel.querySelectorAll("[required]");
    for (var r = 0; r < required.length; r++) {
      var field = required[r];
      if (field.type === "radio") {
        var group = panel.querySelectorAll('[name="' + field.name + '"]');
        var okRadio = false;
        for (var g = 0; g < group.length; g++) {
          if (group[g].checked) okRadio = true;
        }
        if (!okRadio) return false;
        continue;
      }
      if (!field.value || !String(field.value).trim()) return false;
    }
    if (panel.querySelector('[name="email"]')) {
      var email = getVal("email");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
      var digits = getVal("whatsapp").replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 13) return false;
    }
    return true;
  }

  function validateAllDataSteps() {
    for (var s = 0; s < total - 1; s++) {
      if (!validateStep(s)) return s;
    }
    return -1;
  }

  function renderReview() {
    if (!reviewRoot) return;
    var rows = [
      ["Nome", getVal("nome")],
      ["E-mail", getVal("email")],
      ["WhatsApp", getVal("whatsapp")],
      ["Empresa", getVal("empresa")],
      ["Site", getVal("site") || "—"],
      ["Segmento", labelForSelect("segmento")],
      ["Faturamento mensal", labelForSelect("faturamento")],
      ["Mídia paga hoje", labelForSelect("midia")],
      ["Detalhe mídia / volume", getVal("midia_detalhe") || "—"],
      ["Maior desafio", getVal("desafio")],
      ["Expectativa com a Arven", getVal("expectativa") || "—"],
    ];
    reviewRoot.innerHTML = rows
      .map(function (row) {
        return (
          "<dt class='lead-form__review-dt'>" +
          escapeHtml(row[0]) +
          "</dt><dd class='lead-form__review-dd'>" +
          escapeHtml(row[1]) +
          "</dd>"
        );
      })
      .join("");
  }

  function labelForSelect(name) {
    var el = form.querySelector('[name="' + name + '"]');
    if (!el || !el.options) return "";
    var opt = el.options[el.selectedIndex];
    return opt ? opt.text : "";
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function collectCampaign() {
    var p = new URLSearchParams(window.location.search);
    var keys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "utm_id",
      "fbclid",
      "gclid",
      "msclkid",
    ];
    var o = {};
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var v = p.get(k);
      if (v) o[k] = v;
    }
    return o;
  }

  function buildWebhookPayload() {
    return {
      _honeypot: getVal("_honeypot"),
      source: "arven_site_qualificacao",
      page: window.location.pathname + window.location.search,
      referrer: document.referrer || "",
      campaign: collectCampaign(),
      lead: {
        nome: getVal("nome"),
        email: getVal("email"),
        whatsapp: getVal("whatsapp"),
        empresa: getVal("empresa"),
        site: getVal("site") || null,
        segmento: getVal("segmento"),
        segmento_label: labelForSelect("segmento"),
        faturamento: getVal("faturamento"),
        faturamento_label: labelForSelect("faturamento"),
        midia: getVal("midia"),
        midia_label: labelForSelect("midia"),
        midia_detalhe: getVal("midia_detalhe") || null,
        desafio: getVal("desafio"),
        expectativa: getVal("expectativa") || null,
      },
    };
  }

  function postLeadWebhook() {
    return fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildWebhookPayload()),
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", function () {
      if (!validateStep(idx)) {
        form.querySelector(".lead-form__error").hidden = false;
        return;
      }
      form.querySelector(".lead-form__error").hidden = true;
      showStep(idx + 1);
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener("click", function () {
      form.querySelector(".lead-form__error").hidden = true;
      showStep(idx - 1);
    });
  }

  if (btnSubmit) {
    btnSubmit.addEventListener("click", function () {
      var bad = validateAllDataSteps();
      if (bad >= 0) {
        showStep(bad);
        var err = form.querySelector(".lead-form__error");
        if (err) {
          err.hidden = false;
          err.textContent = "Confira os campos obrigatórios antes de enviar.";
        }
        return;
      }
      var errEl = form.querySelector(".lead-form__error");
      if (errEl) errEl.hidden = true;

      var prevLabel = btnSubmit.textContent;
      btnSubmit.disabled = true;
      if (btnPrev) btnPrev.disabled = true;
      btnSubmit.textContent = "Enviando…";

      postLeadWebhook()
        .then(function (res) {
          if (res.ok) return;
          return res
            .json()
            .catch(function () {
              return {};
            })
            .then(function (j) {
              throw new Error((j && j.error) || "webhook_failed");
            });
        })
        .then(function () {
          showSuccessPanel();
        })
        .catch(function () {
          btnSubmit.disabled = false;
          if (btnPrev) btnPrev.disabled = false;
          btnSubmit.textContent = prevLabel;
          if (errEl) {
            errEl.hidden = false;
            errEl.textContent =
              "Não foi possível enviar agora. Verifique sua conexão e tente de novo.";
          }
        });
    });
  }

  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      if (idx < total - 1 && btnNext && !btnNext.hidden) btnNext.click();
      else if (idx === total - 1 && btnSubmit && !btnSubmit.hidden && !btnSubmit.disabled) btnSubmit.click();
    }
  });

  showStep(0);
})();
