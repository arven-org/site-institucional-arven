/**
 * NPS — especificação Arven v1.0
 * Fluxo linear: P1 → P2 → … → P7 → Confirmação → POST /api/nps
 */
(function () {
  var form = document.getElementById('arven-nps-form') as HTMLFormElement | null;
  if (!form) return;

  type Segment = 'promotor' | 'neutro' | 'detrator';

  var P2_QUESTION: Record<Segment, string> = {
    promotor: 'O que mais contribuiu para você dar essa nota alta?',
    neutro: 'O que te impediu de dar uma nota mais alta?',
    detrator: 'O que mais influenciou negativamente sua experiência?',
  };

  var TAGS: Record<Segment, string[]> = {
    promotor: [
      'Resultados entregues',
      'Comunicação clara',
      'Estratégia sólida',
      'Time proativo',
      'Custo-benefício',
      'Confiança no processo',
    ],
    neutro: [
      'Resultados razoáveis',
      'Esperava mais agilidade',
      'Boa relação, mas caro',
      'Estratégia ok, execução fraca',
      'Pouco acompanhamento',
      'Sem diferencial claro',
    ],
    detrator: [
      'Resultados abaixo do esperado',
      'Comunicação falhou',
      'Falta de estratégia clara',
      'Atendimento demorou',
      'Preço não justificado',
      'Processo confuso',
    ],
  };

  var shell = form.closest('.lead-form-shell');
  var successPanel = (
    shell ? shell.querySelector('#nps-form-success') : document.getElementById('nps-form-success')
  ) as HTMLElement | null;

  var steps = form.querySelectorAll<HTMLElement>('.lead-form__step');
  var progress = form.querySelector<HTMLElement>('.lead-form__progress-fill');
  var progressBar = form.querySelector<HTMLElement>('.lead-form__progress');
  var stepLabel = form.querySelector<HTMLElement>('[data-nps-step-label]');
  var circleEl = form.querySelector<SVGCircleElement>('[data-nps-circle]');
  var circleCircumference = 2 * Math.PI * 20;

  var btnPrev = form.querySelector<HTMLButtonElement>('[data-nps-action="prev"]');
  var btnNext = form.querySelector<HTMLButtonElement>('[data-nps-action="next"]');
  var btnSubmit = form.querySelector<HTMLButtonElement>('[data-nps-action="submit"]');

  var notaBtns = form.querySelectorAll<HTMLButtonElement>('.nps-nota-btn');
  var p2Root = document.getElementById('nps-p2-tags');
  var p2QuestionEl = document.getElementById('nps-p2-question');
  var reviewRoot = form.querySelector<HTMLElement>('[data-nps-review]');

  var idx = 0;
  var total = steps.length; /* 8 */

  var score: number | null = null;
  var segment: Segment | null = null;
  /** Razões P2 — mantidas ao re-renderizar se mesmo segmento */
  var reasonsSelected: string[] = [];
  var lastRenderedSegment: Segment | null = null;

  function segmentFromScore(n: number): Segment {
    if (n >= 9) return 'promotor';
    if (n >= 7) return 'neutro';
    return 'detrator';
  }

  function escapeHtml(s: string) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /** Renderiza tags P2 e liga max 3 seleções */
  function renderP2(): void {
    if (!p2Root || !p2QuestionEl || score === null) return;
    var seg = segmentFromScore(score);
    segment = seg;

    if (lastRenderedSegment !== seg) {
      reasonsSelected = [];
      lastRenderedSegment = seg;
    }

    p2QuestionEl.textContent = P2_QUESTION[seg];
    p2Root.innerHTML = '';

    TAGS[seg].forEach(function (tag) {
      var id = 'nps-tag-' + String(tag).replace(/[^a-zA-Z0-9]/g, '').slice(0, 40) + Math.random().toString(36).slice(2, 7);
      var lab = document.createElement('label');
      lab.className = 'nps-tag-label';
      lab.htmlFor = id;
      var inp = document.createElement('input');
      inp.type = 'checkbox';
      inp.id = id;
      inp.className = 'nps-tag-checkbox';
      inp.value = tag;
      if (reasonsSelected.indexOf(tag) >= 0) inp.checked = true;

      inp.addEventListener('change', function () {
        var errBox = form!.querySelector<HTMLElement>('.lead-form__error');
        var boxes = p2Root!.querySelectorAll<HTMLInputElement>('.nps-tag-checkbox');
        var checked = Array.prototype.filter.call(boxes, function (c: HTMLInputElement) { return c.checked; });
        if (checked.length > 3) {
          inp.checked = false;
          if (errBox) {
            errBox.hidden = false;
            errBox.textContent = 'Você pode escolher no máximo 3 opções.';
          }
          return;
        }
        reasonsSelected = Array.prototype.map.call(
          p2Root!.querySelectorAll<HTMLInputElement>('.nps-tag-checkbox:checked'),
          function (c: HTMLInputElement) { return c.value; }
        );
        if (errBox) errBox.hidden = true;
        updateNextEnabled();
      });

      lab.appendChild(inp);
      lab.appendChild(document.createTextNode(' ' + tag));
      p2Root.appendChild(lab);
    });

    updateNextEnabled();
  }

  function getStepKey(): string | null {
    return steps[idx] ? steps[idx].getAttribute('data-step') : null;
  }

  function countP2Checked(): number {
    if (!p2Root) return 0;
    return p2Root.querySelectorAll<HTMLInputElement>('.nps-tag-checkbox:checked').length;
  }

  function countServicesChecked(): number {
    return form!.querySelectorAll<HTMLInputElement>('input[name="nps-service"]:checked').length;
  }

  function getChurnValue(): string | null {
    var r = form!.querySelector<HTMLInputElement>('input[name="nps-churn"]:checked');
    return r ? r.value : null;
  }

  function updateNextEnabled(): void {
    if (!btnNext) return;
    var key = getStepKey();
    var ok = true;
    if (key === 'p1') ok = score !== null;
    else if (key === 'p2') {
      var n = countP2Checked();
      ok = n >= 1 && n <= 3;
    } else if (key === 'p4') ok = countServicesChecked() >= 1;
    else if (key === 'p6') ok = !!getChurnValue();
    btnNext.disabled = !ok;
  }

  function showStep(i: number): void {
    idx = Math.max(0, Math.min(i, total - 1));
    steps.forEach(function (el, j) {
      var on = j === idx;
      el.hidden = !on;
      el.setAttribute('aria-hidden', on ? 'false' : 'true');
    });

    var errEl = form!.querySelector<HTMLElement>('.lead-form__error');
    if (errEl) errEl.hidden = true;

    if (progress) progress.style.width = ((idx + 1) / total) * 100 + '%';
    if (progressBar) progressBar.setAttribute('aria-valuenow', String(idx + 1));
    if (stepLabel) stepLabel.textContent = idx + 1 + '/' + total;
    if (circleEl) {
      circleEl.style.strokeDashoffset = String(circleCircumference * (1 - (idx + 1) / total));
    }

    var key = getStepKey();

    if (btnPrev) {
      if (idx === 0) btnPrev.setAttribute('hidden', '');
      else btnPrev.removeAttribute('hidden');
    }

    var isReview = key === 'revisao';
    if (btnNext) {
      if (isReview) btnNext.setAttribute('hidden', '');
      else btnNext.removeAttribute('hidden');
    }
    if (btnSubmit) {
      var showSubmit = isReview && isFormComplete();
      if (showSubmit) {
        btnSubmit.removeAttribute('hidden');
        btnSubmit.setAttribute('aria-hidden', 'false');
      } else {
        btnSubmit.setAttribute('hidden', '');
        btnSubmit.setAttribute('aria-hidden', 'true');
      }
    }

    if (key === 'p2') renderP2();
    if (key === 'revisao') renderReview();

    updateNextEnabled();

    if (key === 'revisao' && isFormComplete() && btnSubmit && !btnSubmit.hasAttribute('hidden')) {
      btnSubmit.focus({ preventScroll: true });
    } else {
      var panel = steps[idx];
      var focusable = panel.querySelector<HTMLElement>(
        'input:not([type="hidden"]), textarea, button.nps-nota-btn, .nps-tag-checkbox'
      );
      if (focusable) focusable.focus({ preventScroll: true });
    }
  }

  function renderReview(): void {
    if (!reviewRoot || score === null) return;
    segForPayload = segmentFromScore(score);
    var churn = getChurnValue();
    var rows: [string, string][] = [
      ['Nota NPS', String(score)],
      ['Segmento', segForPayload],
      ['Razões (P2)', gatherReasons().join('; ') || '—'],
      ['Comentário aberto (P3)', getVal('nps-opentext') || '—'],
      ['Serviços (P4)', gatherServices().join('; ') || '—'],
      ['Melhoria (P5)', getVal('nps-improve') || '—'],
      ['Contrato / plano (P6)', labelChurn(churn) || '—'],
      ['Oportunidade (P7)', getVal('nps-upsell') || '—'],
    ];
    reviewRoot.innerHTML = rows
      .map(function (row) {
        return (
          "<dt class='lead-form__review-dt'>" +
          escapeHtml(row[0]) +
          "</dt><dd class='lead-form__review-dd'>" +
          escapeHtml(row[1]) +
          '</dd>'
        );
      })
      .join('');
  }

  function getVal(id: string): string {
    var el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
    return el && el.value ? el.value.trim() : '';
  }

  function gatherServices(): string[] {
    return Array.prototype.map.call(
      form!.querySelectorAll<HTMLInputElement>('input[name="nps-service"]:checked'),
      function (c: HTMLInputElement) { return c.value; }
    );
  }

  function labelChurn(val: string | null): string {
    if (!val) return '';
    var map: Record<string, string> = {
      expand: 'Muito satisfeito — planejo continuar e expandir',
      renew: 'Satisfeito — pretendo renovar normalmente',
      undecided: 'Indeciso — depende dos próximos resultados',
      reduce: 'Pensando em reduzir escopo ou pausar',
      churn: 'Provável que não renove',
    };
    return map[val] || val;
  }

  function gatherReasons(): string[] {
    if (!p2Root) return reasonsSelected.slice();
    return Array.prototype.map.call(
      p2Root.querySelectorAll<HTMLInputElement>('.nps-tag-checkbox:checked'),
      function (c: HTMLInputElement) { return c.value; }
    );
  }

  /** Todas as respostas obrigatórias preenchidas (para exibir «Confirmar envio» só na revisão). */
  function isFormComplete(): boolean {
    if (score === null) return false;
    var r = gatherReasons();
    if (r.length < 1 || r.length > 3) return false;
    if (gatherServices().length < 1) return false;
    if (!getChurnValue()) return false;
    return true;
  }

  var segForPayload: Segment = 'detrator';

  function validateCurrentStep(): boolean {
    var errBox = form!.querySelector<HTMLElement>('.lead-form__error');
    var key = getStepKey();
    if (key === 'p1' && score === null) {
      if (errBox) { errBox.hidden = false; errBox.textContent = 'Selecione uma nota de 0 a 10 para continuar.'; }
      return false;
    }
    if (key === 'p2') {
      var n = countP2Checked();
      if (n < 1 || n > 3) {
        if (errBox) {
          errBox.hidden = false;
          errBox.textContent = n < 1 ? 'Selecione pelo menos uma razão.' : 'Selecione no máximo 3 razões.';
        }
        return false;
      }
    }
    if (key === 'p4' && countServicesChecked() < 1) {
      if (errBox) { errBox.hidden = false; errBox.textContent = 'Selecione pelo menos um serviço.'; }
      return false;
    }
    if (key === 'p6' && !getChurnValue()) {
      if (errBox) { errBox.hidden = false; errBox.textContent = 'Selecione uma opção sobre seu contrato ou plano.'; }
      return false;
    }
    if (errBox) errBox.hidden = true;
    return true;
  }

  /* P1 — seleção de nota (não auto-avança; usuário clica Continuar) */
  notaBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var n = parseInt(btn.getAttribute('data-nota') ?? '', 10);
      if (isNaN(n)) return;
      var newSeg = segmentFromScore(n);
      if (score !== n) {
        score = n;
        reasonsSelected = [];
        lastRenderedSegment = null;
      } else {
        score = n;
      }
      notaBtns.forEach(function (b) { b.classList.remove('nps-nota-btn--selected'); });
      btn.classList.add('nps-nota-btn--selected');
      segment = newSeg;
      updateNextEnabled();
    });
  });

  if (btnNext) {
    btnNext.addEventListener('click', function () {
      if (!validateCurrentStep()) return;
      showStep(idx + 1);
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', function () {
      showStep(idx - 1);
    });
  }

  /* Listeners para revalidar botão */
  form.addEventListener('change', function (e) {
    var t = e.target as HTMLElement;
    if (t && ((t as HTMLInputElement).name === 'nps-service' || (t as HTMLInputElement).name === 'nps-churn')) {
      updateNextEnabled();
    }
  });

  if (btnSubmit) {
    btnSubmit.addEventListener('click', function () {
      var hp = form!.querySelector<HTMLInputElement>('[name="_honeypot"]');
      if (hp && hp.value && String(hp.value).trim() !== '') return;

      if (score === null) {
        showStep(0);
        var errBox = form!.querySelector<HTMLElement>('.lead-form__error');
        if (errBox) { errBox.hidden = false; errBox.textContent = 'Dados incompletos. Volte ao início.'; }
        return;
      }

      segForPayload = segmentFromScore(score);
      var churn = getChurnValue();
      if (!churn) {
        showStep(5);
        var errBox2 = form!.querySelector<HTMLElement>('.lead-form__error');
        if (errBox2) { errBox2.hidden = false; errBox2.textContent = 'Selecione uma opção sobre o contrato.'; }
        return;
      }

      var prevLabel = btnSubmit.textContent;
      btnSubmit.disabled = true;
      if (btnPrev) btnPrev.disabled = true;
      btnSubmit.textContent = 'Enviando…';

      var urlParams = new URLSearchParams(window.location.search);
      var urlParams = new URLSearchParams(window.location.search);
      var payload = {
        score: score,
        nps_segment: segForPayload,
        reasons: gatherReasons(),
        opentext: getVal('nps-opentext') || null,
        services: gatherServices(),
        improve: getVal('nps-improve') || null,
        churn: churn,
        upsell: getVal('nps-upsell') || null,
        submitted_at: new Date().toISOString(),
        _honeypot: hp ? hp.value : '',
        source: 'arven_site_nps',
        page: window.location.pathname + window.location.search,
        referrer: document.referrer || null,
        ref: urlParams.get('ref'),
        utm_source: urlParams.get('utm_source'),
      };

      fetch('/api/nps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          if (!res.ok) throw new Error('fail');
        })
        .then(function () {
          form!.setAttribute('hidden', '');
          form!.setAttribute('aria-hidden', 'true');
          if (successPanel) {
            successPanel.hidden = false;
            var t = document.getElementById('nps-success-title');
            if (t) t.focus({ preventScroll: true });
          }
        })
        .catch(function () {
          btnSubmit.disabled = false;
          if (btnPrev) btnPrev.disabled = false;
          btnSubmit.textContent = prevLabel || 'Confirmar envio';
          var errBox3 = form!.querySelector<HTMLElement>('.lead-form__error');
          if (errBox3) {
            errBox3.hidden = false;
            errBox3.textContent = 'Não foi possível enviar agora. Verifique sua conexão e tente novamente.';
          }
        });
    });
  }

  form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
      e.preventDefault();
      var key = getStepKey();
      if (key === 'revisao') {
        if (btnSubmit && !btnSubmit.hidden && !btnSubmit.disabled) btnSubmit.click();
      } else if (btnNext && !btnNext.hidden && !btnNext.disabled) btnNext.click();
    }
  });

  showStep(0);
})();
