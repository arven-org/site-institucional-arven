/**
 * Arven - Captura de Atribuicao (first-touch + last-touch)
 *
 * Modelo: registra o PRIMEIRO toque (imutavel ate expirar) e o ULTIMO toque
 * de campanha (sobrescrito a cada nova UTM/click ID). Visita organica
 * posterior NUNCA apaga a ultima campanha. Espelha o padrao Stripe/Segment.
 *
 * LGPD: persistencia em localStorage so ocorre apos consentimento explicito.
 * Sem consentimento, opera em modo "session-only" usando sessionStorage,
 * que e apagado ao fechar a aba.
 *
 * Carregar em <head> de todas as paginas, antes de qualquer form.
 *
 * API publica:
 *   window.ArvenAttribution.get()           -> { first_touch, last_touch, session_count }
 *   window.ArvenAttribution.toPayload()     -> payload achatado pronto pro webhook
 *   window.ArvenAttribution.grantConsent()  -> migra dados de sessao pra localStorage
 *   window.ArvenAttribution.revokeConsent() -> limpa localStorage, mantem sessionStorage
 *   window.ArvenAttribution.reset()         -> limpa tudo
 *
 * Evento: dispara "arven:attribution" em window apos cada captura,
 *   com detail = { phase: "first" | "last" | "refresh", data }.
 */
(() => {
  "use strict";

  const STORAGE_KEY = "arven_attribution_v2";
  const CONSENT_COOKIE = "arven_consent";
  const TTL_DAYS = 90;
  const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

  const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id"];
  const CLICK_KEYS = ["fbclid", "gclid", "ttclid", "msclkid", "li_fat_id", "twclid"];
  const CAMPAIGN_KEYS = [...UTM_KEYS, ...CLICK_KEYS];

  // -----------------------------------------------------------------------
  // Consentimento
  // -----------------------------------------------------------------------

  const hasConsent = () => {
    if (window.__arvenAttributionConsent === true) return true;
    return document.cookie.split(";").some((c) => c.trim().startsWith(CONSENT_COOKIE + "=granted"));
  };

  // -----------------------------------------------------------------------
  // Storage abstraction: localStorage com consent, senao sessionStorage
  // -----------------------------------------------------------------------

  const store = {
    read() {
      const backend = hasConsent() ? window.localStorage : window.sessionStorage;
      try {
        const raw = backend.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.first_touch?.captured_at) return null;
        if (Date.now() - parsed.first_touch.captured_at > TTL_MS) return null;
        return parsed;
      } catch {
        return null;
      }
    },
    write(state) {
      const backend = hasConsent() ? window.localStorage : window.sessionStorage;
      try {
        backend.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        // Quota cheia ou storage bloqueado (modo privado iOS, cookies off).
        // Emite evento pra quem quiser observar (Sentry, etc).
        window.dispatchEvent(new CustomEvent("arven:attribution:error", { detail: { err: String(err) } }));
      }
    },
    clearAll() {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
      try { window.sessionStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
    },
  };

  // -----------------------------------------------------------------------
  // Captura da URL atual
  // -----------------------------------------------------------------------

  const captureFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const data = {};
    let isCampaign = false;

    for (const key of CAMPAIGN_KEYS) {
      const val = params.get(key);
      if (val) {
        data[key] = val;
        isCampaign = true;
      }
    }

    if (!isCampaign && !store.read()) {
      // Primeira visita sem campanha: registra como organica/direta
      // para preservar landing_page e referrer do verdadeiro first-touch.
      return {
        touch: {
          utm_source: document.referrer ? "(referral)" : "(direct)",
          utm_medium: document.referrer ? "referral" : "(none)",
          landing_page: window.location.pathname,
          referrer: document.referrer || "(direct)",
          captured_at: Date.now(),
        },
        isCampaign: false,
      };
    }

    if (!isCampaign) return null;

    return {
      touch: {
        ...data,
        landing_page: window.location.pathname,
        referrer: document.referrer || "(direct)",
        captured_at: Date.now(),
      },
      isCampaign: true,
    };
  };

  // Assinatura de campanha: dois toques sao "a mesma campanha" se todos os
  // identificadores presentes (UTMs + click IDs) batem. Ignora timestamps,
  // landing_page e referrer, que mudam dentro da mesma campanha.
  const sameCampaign = (a, b) => {
    if (!a || !b) return false;
    for (const key of CAMPAIGN_KEYS) {
      if ((a[key] || null) !== (b[key] || null)) return false;
    }
    return true;
  };

  // -----------------------------------------------------------------------
  // Resolucao de atribuicao
  // -----------------------------------------------------------------------

  const resolve = () => {
    const stored = store.read();
    const current = captureFromUrl();

    // Sem novo toque e sem stored: nada a fazer.
    if (!current && !stored) {
      return null;
    }

    // Toque atual existe, mas ja temos stored.
    if (current && stored) {
      if (current.isCampaign) {
        // So conta como nova campanha se a assinatura mudou
        // (evita inflar session_count em refreshes / chamadas repetidas).
        if (sameCampaign(current.touch, stored.last_touch)) {
          return stored;
        }
        const next = {
          first_touch: stored.first_touch,
          last_touch: current.touch,
          session_count: (stored.session_count || 1) + 1,
        };
        store.write(next);
        window.dispatchEvent(new CustomEvent("arven:attribution", { detail: { phase: "last", data: next } }));
        return next;
      }
      // Visita organica posterior nao toca em last_touch (preserva campanha).
      return stored;
    }

    // Primeiro registro de tudo: first_touch = last_touch = current.touch.
    if (current && !stored) {
      const next = {
        first_touch: current.touch,
        last_touch: current.touch,
        session_count: 1,
      };
      store.write(next);
      window.dispatchEvent(new CustomEvent("arven:attribution", { detail: { phase: "first", data: next } }));
      return next;
    }

    return stored;
  };

  // -----------------------------------------------------------------------
  // Payload pro webhook
  // Shape aninhado (first_touch / last_touch) + aliases top-level derivados
  // do last_touch, pra compatibilidade com consumers que leem campaign.utm_source.
  // -----------------------------------------------------------------------

  const normalizeTouch = (touch) => {
    if (!touch) return null;
    const out = {};
    for (const key of CAMPAIGN_KEYS) {
      if (touch[key]) out[key] = touch[key];
    }
    if (touch.landing_page) out.landing_page = touch.landing_page;
    if (touch.referrer) out.referrer = touch.referrer;
    if (touch.captured_at) out.captured_at = touch.captured_at;
    return out;
  };

  const toPayload = () => {
    const state = resolve();
    const consent = hasConsent();
    const persistence = consent ? "localStorage" : "sessionStorage";

    if (!state) {
      return { first_touch: null, last_touch: null, session_count: 0, consent, persistence };
    }

    const first = normalizeTouch(state.first_touch);
    const last = normalizeTouch(state.last_touch);

    // Aliases top-level (compat): last_touch e a fonte canonica pra
    // atribuicao de conversao em modelos last-non-direct.
    const aliases = {};
    if (last) {
      for (const key of CAMPAIGN_KEYS) {
        if (last[key]) aliases[key] = last[key];
      }
    }

    return {
      ...aliases,
      first_touch: first,
      last_touch: last,
      session_count: state.session_count,
      consent,
      persistence,
    };
  };

  // -----------------------------------------------------------------------
  // Migracao de sessao -> persistente quando consentimento eh dado depois
  // -----------------------------------------------------------------------

  const grantConsent = () => {
    let sessionState = null;
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) sessionState = JSON.parse(raw);
    } catch { /* noop */ }

    window.__arvenAttributionConsent = true;
    document.cookie = `${CONSENT_COOKIE}=granted; Max-Age=${TTL_DAYS * 24 * 60 * 60}; Path=/; SameSite=Lax`;

    if (sessionState) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionState));
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch { /* noop */ }
    } else {
      resolve();
    }
  };

  const revokeConsent = () => {
    window.__arvenAttributionConsent = false;
    document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  };

  // -----------------------------------------------------------------------
  // API publica
  // -----------------------------------------------------------------------

  window.ArvenAttribution = Object.freeze({
    get: resolve,
    toPayload,
    grantConsent,
    revokeConsent,
    reset: store.clearAll,
    _internals: Object.freeze({ STORAGE_KEY, TTL_DAYS, CAMPAIGN_KEYS }),
  });

  // Roda na carga pra capturar first-touch mesmo se o usuario nao submeter.
  resolve();
})();
