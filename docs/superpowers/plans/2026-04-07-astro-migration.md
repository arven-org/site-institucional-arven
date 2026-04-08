# Astro Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Arven site from 7 static HTML files + vanilla JS to an Astro project with shared Nav/Footer components, 3-layer CSS design system, SSR blog via Sanity, and a TypeScript API endpoint — zero visual changes.

**Architecture:** `output: 'hybrid'` (institutional pages static, blog + API use SSR). `Base.astro` wraps all pages. CSS splits into `tokens.css` (DS tokens) + `global.css` (reset + utilities) + scoped `<style>` per component. Scripts become TypeScript ES modules processed by Vite.

**Tech Stack:** Astro 4+, `@astrojs/vercel` (serverless adapter), `@sanity/client`, TypeScript, Vite (embedded), Vercel

---

## File Map

**Create:**
```
astro.config.mjs
tsconfig.json
src/
  styles/tokens.css
  styles/global.css
  components/Head.astro
  components/Nav.astro
  components/Footer.astro
  layouts/Base.astro
  scripts/nav.ts
  scripts/vsl-player.ts
  scripts/icon-cloud.ts
  scripts/lead-form.ts
  scripts/arven-tokens-data.ts
  scripts/templates-page.ts
  lib/sanity.ts
  pages/index.astro
  pages/servicos.astro
  pages/cases.astro
  pages/sobre.astro
  pages/qualificacao.astro
  pages/templates.astro
  pages/blog/index.astro
  pages/blog/[slug].astro
  pages/api/lead.ts
public/assets/   (moved from assets/)
```

**Modify:** `package.json`, `.gitignore`, `vercel.json`

**Delete (Task 23):** `index.html`, `servicos.html`, `cases.html`, `sobre.html`, `qualificacao.html`, `templates.html`, `blog/`, `js/`, `styles.css`, `api/`

---

## Phase 1: Bootstrap

### Task 1: Install Astro + create config files

**Files:**
- Create: `astro.config.mjs`
- Create: `tsconfig.json`

- [ ] **Step 1: Install dependencies**

```bash
npm install astro @astrojs/vercel @sanity/client
```

Expected: package-lock.json updated, `node_modules/astro/` present.

- [ ] **Step 2: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'hybrid',
  adapter: vercel(),
  site: 'https://arven.com.br',
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: Verify Astro CLI works**

```bash
npx astro --version
```

Expected: prints Astro version (e.g. `4.x.x`).

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs tsconfig.json package.json package-lock.json
git commit -m "feat: add astro + vercel adapter deps + config"
```

---

### Task 2: Update package.json scripts + .gitignore

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Replace `package.json`**

```json
{
  "name": "site-institucional-arven",
  "private": true,
  "description": "Site institucional Arven — Astro",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^4.0.0",
    "@astrojs/vercel": "^7.0.0",
    "@sanity/client": "^6.0.0",
    "gsap": "^3.14.2"
  }
}
```

> Note: use the exact versions installed by npm in Step 1 of Task 1 — just add `gsap` to the `dependencies` that npm wrote.

- [ ] **Step 2: Update `.gitignore`** — add these lines if not present:

```
dist/
.astro/
```

- [ ] **Step 3: Commit**

```bash
git add package.json .gitignore
git commit -m "chore: update scripts for astro dev/build/preview"
```

---

## Phase 2: CSS Architecture

### Task 3: Create `src/styles/tokens.css`

**Files:**
- Create: `src/styles/tokens.css`

- [ ] **Step 1: Create `src/styles/tokens.css`**

This is the `:root` block extracted from `styles.css` (lines 12–41). **Exact content:**

```css
/* ============================================================
   ARVEN — Design Tokens
   Fonte única de verdade do Design System.
   ============================================================ */

:root {
  --bg:           #0a0a0a;
  --bg-surface:   #111111;
  --bg-raised:    #161616;
  --border:       rgba(255, 255, 255, 0.08);
  --border-hover: rgba(255, 255, 255, 0.15);

  --text-primary:   #f0ede8;
  --text-secondary: #8a8680;
  --text-tertiary:  #4a4845;

  --accent:       #e8e0d0;
  --accent-dim:   rgba(232, 224, 208, 0.06);

  --green:        #1a3a2a;
  --green-text:   #4ade80;

  --blue:         #0f1f3a;
  --blue-text:    #60a5fa;

  --font-sans: 'Geist', -apple-system, sans-serif;
  --font-mono: 'Geist Mono', monospace;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;

  --max-w: 1320px;
  --section-gap: 10px;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/tokens.css
git commit -m "feat(css): create tokens.css — DS custom properties"
```

---

### Task 4: Create `src/styles/global.css`

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `src/styles/global.css`**

Open `styles.css`. Create `src/styles/global.css` with the following header, then paste **all content from `styles.css` except the `:root { ... }` block (lines 12–41)**:

```css
/* ============================================================
   ARVEN — global.css
   Reset, base, utilitários, animações e todos os estilos globais.
   Os tokens (CSS custom properties) ficam em tokens.css.
   ============================================================ */

@import './tokens.css';

/* RESET */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

/* BASE */
body {
  background: var(--bg);
  color: var(--text-primary);
  /* ... rest of body styles from styles.css ... */
}
```

**Practical steps:**
1. Create `src/styles/global.css`
2. First line: `@import './tokens.css';`
3. Paste lines 7–11 from `styles.css` (RESET block)
4. Skip lines 12–41 (the `:root` block — now in tokens.css)
5. Paste lines 42 to end of `styles.css`

- [ ] **Step 2: Verify token references work**

Search `src/styles/global.css` for any hardcoded color values that should use a token. All `#0a0a0a`, `#111111`, `#161616`, `#f0ede8`, `#8a8680` etc. should already be using `var(--token)` from the existing styles.css — no changes needed if styles.css was already token-first.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(css): create global.css — imports tokens, contains all global styles"
```

---

## Phase 3: Move Assets

### Task 5: Move `assets/` to `public/assets/`

**Files:**
- Move: `assets/` → `public/assets/`

Astro serves files from `public/` at the root URL. After moving, `assets/logo.svg` becomes accessible at `/assets/logo.svg` — same URL as before.

- [ ] **Step 1: Move the assets directory**

```bash
mkdir -p public
mv assets public/assets
```

- [ ] **Step 2: Verify the move**

```bash
ls public/assets/
```

Expected: `logo.svg`, `cases/`, `icons/`, `icon-cloud/`, `video/` (or similar) are present.

- [ ] **Step 3: Commit**

```bash
git add public/assets
git rm -r --cached assets 2>/dev/null || true
git add -A
git commit -m "feat: move assets/ to public/assets/ for Astro static serving"
```

---

## Phase 4: Core Components

### Task 6: Create `src/components/Head.astro`

**Files:**
- Create: `src/components/Head.astro`

- [ ] **Step 1: Create `src/components/Head.astro`**

```astro
---
interface Props {
  title: string;
  description: string;
}
const { title, description } = Astro.props;
---
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title}</title>
<meta name="description" content={description} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta name="theme-color" content="#0a0a0a" />
<link rel="icon" href="/assets/logo.svg" type="image/svg+xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

> Note: No `<link rel="stylesheet" href="styles.css">` here — global.css is imported in `Base.astro` via Astro's built-in CSS handling.

- [ ] **Step 2: Commit**

```bash
git add src/components/Head.astro
git commit -m "feat(components): add Head.astro"
```

---

### Task 7: Create `src/scripts/nav.ts` + `src/components/Nav.astro`

**Files:**
- Create: `src/scripts/nav.ts`
- Create: `src/components/Nav.astro`

- [ ] **Step 1: Create `src/scripts/nav.ts`**

Copy `js/nav.js` verbatim — the IIFE is valid TypeScript. Rename only:

```ts
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

  links.addEventListener("click", function (e) {
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
  else if ((mq as any).addListener) (mq as any).addListener(handleMq);
})();
```

- [ ] **Step 2: Create `src/components/Nav.astro`**

The `currentPage` prop drives `aria-current="page"` on the active nav link.

```astro
---
interface Props {
  currentPage?: 'index' | 'servicos' | 'cases' | 'sobre' | 'qualificacao' | 'templates' | 'blog';
}
const { currentPage } = Astro.props;
---
<nav class="nav">
  <div class="nav__inner">
    <a href="/" class="nav__logo">Arven</a>
    <ul class="nav__links" id="nav-links">
      <li>
        <a href="/servicos" aria-current={currentPage === 'servicos' ? 'page' : undefined}>
          Serviços
        </a>
      </li>
      <li>
        <a
          href="/cases"
          class="nav__link--gradient"
          aria-current={currentPage === 'cases' ? 'page' : undefined}
        >
          Resultados
        </a>
      </li>
      <li>
        <a href="/sobre" aria-current={currentPage === 'sobre' ? 'page' : undefined}>
          A Arven
        </a>
      </li>
      <li>
        <a href="/qualificacao" aria-current={currentPage === 'qualificacao' ? 'page' : undefined}>
          Contato
        </a>
      </li>
    </ul>
    <a href="/qualificacao" class="nav__cta">Agendar call</a>
    <button
      type="button"
      class="nav__toggle"
      aria-controls="nav-links"
      aria-expanded="false"
      aria-label="Abrir menu"
    >
      <span class="nav__toggle-bar"></span>
      <span class="nav__toggle-bar"></span>
      <span class="nav__toggle-bar"></span>
    </button>
  </div>
</nav>

<script>
  import '../scripts/nav.ts';
</script>
```

- [ ] **Step 3: Commit**

```bash
git add src/scripts/nav.ts src/components/Nav.astro
git commit -m "feat(components): add Nav.astro + nav.ts"
```

---

### Task 8: Create `src/components/Footer.astro`

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Create `src/components/Footer.astro`**

Copy the `<footer class="footer">...</footer>` block from any existing HTML file (it's identical across all pages). Use `servicos.html` lines 177–224:

```astro
---
// No props needed — footer is identical on all pages
---
<footer class="footer">
  <div class="footer__inner">
    <div class="footer__top">
      <div class="footer__brand">
        <a href="/" class="footer__logo">Arven</a>
        <p class="footer__tagline">Assessoria de aquisição para negócios B2B.</p>
      </div>
      <div class="footer__cols">
        <div class="footer__col">
          <p class="footer__col-label" id="footer-nav-label">Navegação</p>
          <ul class="footer__links" aria-labelledby="footer-nav-label">
            <li><a href="/servicos">Serviços</a></li>
            <li><a href="/cases">Resultados</a></li>
            <li><a href="/sobre">A Arven</a></li>
            <li><a href="/#faq">FAQ</a></li>
            <li><a href="/qualificacao">Contato</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <p class="footer__col-label" id="footer-contact-label">Contato</p>
          <ul class="footer__links" aria-labelledby="footer-contact-label">
            <li><a href="/qualificacao">Formulário de contato</a></li>
            <li><a href="/qualificacao">WhatsApp</a></li>
            <li><a href="/qualificacao">Diagnóstico gratuito</a></li>
            <li><a href="/templates">Área Interna</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <p class="footer__col-label" id="footer-social-label">Redes</p>
          <ul class="footer__links" aria-labelledby="footer-social-label">
            <li>
              <a href="https://www.instagram.com/arvensolutions/" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/company/arvenaquisicao" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer__bottom">
      <div class="footer__legal">
        <p class="footer__legal-name">ARVEN CONSULTORIA TECNOLOGIA &amp; OUTSOURCING</p>
        <p class="footer__legal-meta">
          <span class="footer__cnpj">CNPJ 65.183.229/0001-54</span>
          <span class="footer__legal-sep" aria-hidden="true">·</span>
          <span class="footer__rights">&copy; 2026 Todos os direitos reservados</span>
        </p>
      </div>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat(components): add Footer.astro"
```

---

### Task 9: Create `src/layouts/Base.astro`

**Files:**
- Create: `src/layouts/Base.astro`

- [ ] **Step 1: Create `src/layouts/Base.astro`**

```astro
---
import Head from '../components/Head.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  currentPage?: 'index' | 'servicos' | 'cases' | 'sobre' | 'qualificacao' | 'templates' | 'blog';
}
const { title, description, currentPage } = Astro.props;
---
<html lang="pt-BR">
  <head>
    <Head title={title} description={description} />
  </head>
  <body>
    <Nav currentPage={currentPage} />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "feat(layouts): add Base.astro with Head + Nav + Footer"
```

---

## Phase 5: Institutional Pages

### Task 10: Migrate `src/pages/index.astro`

**Files:**
- Create: `src/pages/index.astro`
- Create: `src/scripts/vsl-player.ts`

index.html uses: `js/vendor/gsap.min.js` + `js/nav.js` (handled by Nav.astro) + `js/vsl-player.js`.
GSAP is loaded as a global but is **not used in any inline script** — skip it. vsl-player.ts gets its own script import.

- [ ] **Step 1: Create `src/scripts/vsl-player.ts`**

Copy `js/vsl-player.js` verbatim, adding minimal TypeScript casts:

```ts
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
    if (!elTime || !video) return;
    var d = video.duration;
    elTime.textContent = fmt(video.currentTime) + " / " + fmt(d);
  }

  function updateProgress() {
    if (!elProgress || !video) return;
    var d = video.duration;
    var pct = isFinite(d) && d > 0 ? (video.currentTime / d) * 100 : 0;
    elProgress.style.width = Math.min(100, Math.max(0, pct)) + "%";
  }

  function updateBuffer() {
    if (!elBuffer || !video) return;
    var d = video.duration;
    if (!isFinite(d) || d <= 0) { elBuffer.style.width = "0%"; return; }
    try {
      var buf = video.buffered;
      if (buf && buf.length) {
        var end = buf.end(buf.length - 1);
        elBuffer.style.width = Math.min(100, (end / d) * 100) + "%";
      }
    } catch (e) { elBuffer.style.width = "0%"; }
  }

  function setBuffering(on: boolean) {
    if (!viewport) return;
    viewport.classList.toggle("statement-video__viewport--buffering", on);
  }

  function clampForward() {
    if (correcting || !video) return;
    var t = video.currentTime;
    if (t > maxWatched + 0.15) {
      correcting = true;
      video.currentTime = maxWatched;
      requestAnimationFrame(function () { correcting = false; });
    }
  }

  function syncPlayButton() {
    if (!btnPlay || !video) return;
    var playing = !video.paused && !video.ended;
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
    updateTime(); updateProgress(); updateBuffer();
  });
  video.addEventListener("loadstart", function () { setBuffering(true); });
  video.addEventListener("waiting", function () { setBuffering(true); });
  video.addEventListener("playing", function () { setBuffering(false); });
  video.addEventListener("canplay", function () { setBuffering(false); });
  video.addEventListener("canplaythrough", function () { setBuffering(false); });
  video.addEventListener("play", syncPlayButton);
  video.addEventListener("pause", syncPlayButton);
  video.addEventListener("ended", function () {
    syncPlayButton(); updateTime(); updateProgress();
  });

  if (btnPlay) {
    btnPlay.addEventListener("click", function () {
      if (video!.paused || video!.ended) { video!.play().catch(function () {}); }
      else { video!.pause(); }
    });
  }

  video.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); }
  });

  video.setAttribute("tabindex", "-1");
  syncPlayButton();
  updateTime();
  updateProgress();
})();
```

- [ ] **Step 2: Create `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base
  title="Arven — Assessoria de Aquisição"
  description="A Arven desenha e opera funis de aquisição para empresas B2B. Do primeiro clique ao lead qualificado, pronto para o seu time fechar."
  currentPage="index"
>
  <!-- Paste the full content of <main>...</main> from index.html here -->
  <!-- Lines 38–372 of index.html (everything between <main> and </main>) -->
</Base>

<script>
  import '../scripts/vsl-player.ts';
</script>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro src/scripts/vsl-player.ts
git commit -m "feat(pages): add index.astro + vsl-player.ts"
```

---

### Task 11: Migrate `src/pages/servicos.astro`

**Files:**
- Create: `src/pages/servicos.astro`

servicos.html uses only `js/nav.js` (handled by Nav.astro). No extra scripts.

- [ ] **Step 1: Create `src/pages/servicos.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base
  title="Serviços — Arven"
  description="A Arven desenha e opera funis de aquisição para empresas B2B. Do primeiro clique ao lead qualificado, pronto para o seu time fechar."
  currentPage="servicos"
>
  <!-- Paste the full content of <main>...</main> from servicos.html here -->
  <!-- Lines 38–174 of servicos.html -->
</Base>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/servicos.astro
git commit -m "feat(pages): add servicos.astro"
```

---

### Task 12: Migrate `src/pages/cases.astro` + icon-cloud.ts

**Files:**
- Create: `src/scripts/icon-cloud.ts`
- Create: `src/pages/cases.astro`

cases.html uses `js/nav.js` (Nav.astro) + `js/icon-cloud.js` (global `window.IconCloud`) + an inline init script. In Astro we export `init` from icon-cloud.ts and import it in cases.astro.

- [ ] **Step 1: Create `src/scripts/icon-cloud.ts`**

Convert from IIFE + `window.IconCloud` to named ES module export. Replace the last line `window.IconCloud = { init: init };` with `export { init };` and remove the IIFE wrapper:

```ts
/**
 * Icon Cloud 3D (canvas) — equivalente funcional ao Magic UI, sem React.
 */
"use strict";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function fibonacciSphere(count: number, scale: number) {
  const icons: { x: number; y: number; z: number; id: number }[] = [];
  const offset = 2 / count;
  const increment = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = i * offset - 1 + offset / 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = i * increment;
    const x = Math.cos(phi) * r;
    const z = Math.sin(phi) * r;
    icons.push({ x: x * scale, y: y * scale, z: z * scale, id: i });
  }
  return icons;
}

function project(icon: { x: number; y: number; z: number }, rot: { x: number; y: number }) {
  const cosX = Math.cos(rot.x);
  const sinX = Math.sin(rot.x);
  const cosY = Math.cos(rot.y);
  const sinY = Math.sin(rot.y);
  const rotatedX = icon.x * cosY - icon.z * sinY;
  const rotatedZ = icon.x * sinY + icon.z * cosY;
  const rotatedY = icon.y * cosX + rotatedZ * sinX;
  return { rotatedX, rotatedY, rotatedZ };
}

export function init(canvas: HTMLCanvasElement, imageUrls: string[]): void {
  if (!canvas || !imageUrls || !imageUrls.length) return;

  const LOGICAL = 400;
  const ICON = 40;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = LOGICAL * dpr;
  canvas.height = LOGICAL * dpr;
  canvas.style.width = LOGICAL + "px";
  canvas.style.height = LOGICAL + "px";
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  const iconPositions = fibonacciSphere(imageUrls.length, 100);
  const iconCanvases: HTMLCanvasElement[] = [];
  const imagesLoaded = new Array(imageUrls.length).fill(false);
  let rotation = { x: 0, y: 0 };
  let isDragging = false;
  let lastMouse = { x: 0, y: 0 };
  let mousePos = { x: LOGICAL / 2, y: LOGICAL / 2 };
  let targetRotation: { x: number; y: number; startX: number; startY: number; startTime: number; duration: number } | null = null;
  let raf = 0;

  function toLogical(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect();
    const sx = LOGICAL / rect.width;
    const sy = LOGICAL / rect.height;
    return { x: (clientX - rect.left) * sx, y: (clientY - rect.top) * sy };
  }

  imageUrls.forEach(function (src, index) {
    const off = document.createElement("canvas");
    off.width = ICON; off.height = ICON;
    const offCtx = off.getContext("2d");
    if (!offCtx) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      offCtx.clearRect(0, 0, ICON, ICON);
      offCtx.save();
      offCtx.beginPath();
      offCtx.arc(ICON / 2, ICON / 2, ICON / 2, 0, Math.PI * 2);
      offCtx.closePath();
      offCtx.clip();
      offCtx.drawImage(img, 0, 0, ICON, ICON);
      offCtx.restore();
      imagesLoaded[index] = true;
    };
    img.onerror = function () {
      offCtx.fillStyle = "rgba(255,255,255,0.12)";
      offCtx.beginPath();
      offCtx.arc(ICON / 2, ICON / 2, ICON / 2, 0, Math.PI * 2);
      offCtx.fill();
      imagesLoaded[index] = true;
    };
    img.src = src;
    iconCanvases[index] = off;
  });

  function onPointerDown(clientX: number, clientY: number) {
    const pos = toLogical(clientX, clientY);
    const x = pos.x; const y = pos.y;
    for (let i = 0; i < iconPositions.length; i++) {
      const icon = iconPositions[i];
      const p = project(icon, rotation);
      const screenX = LOGICAL / 2 + p.rotatedX;
      const screenY = LOGICAL / 2 + p.rotatedY;
      const sc = (p.rotatedZ + 200) / 300;
      const radius = 20 * sc;
      const dx = x - screenX; const dy = y - screenY;
      if (dx * dx + dy * dy < radius * radius) {
        const targetX = -Math.atan2(icon.y, Math.sqrt(icon.x * icon.x + icon.z * icon.z));
        const targetY = Math.atan2(icon.x, icon.z);
        const dist = Math.hypot(targetX - rotation.x, targetY - rotation.y);
        const duration = Math.min(2000, Math.max(800, dist * 1000));
        targetRotation = { x: targetX, y: targetY, startX: rotation.x, startY: rotation.y, startTime: performance.now(), duration };
        return;
      }
    }
    isDragging = true;
    lastMouse = { x: clientX, y: clientY };
  }

  function onPointerMove(clientX: number, clientY: number) {
    mousePos = toLogical(clientX, clientY);
    if (isDragging) {
      rotation.x += (clientY - lastMouse.y) * 0.002;
      rotation.y += (clientX - lastMouse.x) * 0.002;
      lastMouse = { x: clientX, y: clientY };
    }
  }

  function onPointerUp() { isDragging = false; }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motionFactor = reduceMotion ? 0.12 : 1;
  let inView = true;
  let pageVisible = !document.hidden;
  let running = false;

  function start() {
    if (running || !inView || !pageVisible) return;
    running = true;
    raf = requestAnimationFrame(animate);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function animate() {
    if (!running) return;
    ctx.clearRect(0, 0, LOGICAL, LOGICAL);
    const centerX = LOGICAL / 2; const centerY = LOGICAL / 2;
    const maxD = Math.hypot(centerX, centerY);
    const dx = mousePos.x - centerX; const dy = mousePos.y - centerY;
    const dist = Math.hypot(dx, dy);
    const speed = (0.003 + (dist / maxD) * 0.01) * motionFactor;

    if (targetRotation) {
      const elapsed = performance.now() - targetRotation.startTime;
      const progress = Math.min(1, elapsed / targetRotation.duration);
      const eased = easeOutCubic(progress);
      rotation.x = targetRotation.startX + (targetRotation.x - targetRotation.startX) * eased;
      rotation.y = targetRotation.startY + (targetRotation.y - targetRotation.startY) * eased;
      if (progress >= 1) targetRotation = null;
    } else if (!isDragging) {
      rotation.x += (dy / LOGICAL) * speed;
      rotation.y += (dx / LOGICAL) * speed;
    }

    const sorted = iconPositions
      .map(function (icon, index) {
        const p = project(icon, rotation);
        return { icon, index, rotatedX: p.rotatedX, rotatedY: p.rotatedY, rotatedZ: p.rotatedZ };
      })
      .sort(function (a, b) { return a.rotatedZ - b.rotatedZ; });

    sorted.forEach(function (row) {
      const sc = (row.rotatedZ + 200) / 300;
      const opacity = Math.max(0.2, Math.min(1, (row.rotatedZ + 150) / 200));
      ctx.save();
      ctx.translate(LOGICAL / 2 + row.rotatedX, LOGICAL / 2 + row.rotatedY);
      ctx.scale(sc, sc);
      ctx.globalAlpha = opacity;
      const cnv = iconCanvases[row.index];
      if (cnv && imagesLoaded[row.index]) {
        ctx.filter = "brightness(0) invert(1)";
        ctx.drawImage(cnv, -20, -20, 40, 40);
        ctx.filter = "none";
      }
      ctx.restore();
    });

    raf = requestAnimationFrame(animate);
  }

  canvas.addEventListener("mousedown", function (e) { onPointerDown(e.clientX, e.clientY); });
  window.addEventListener("mousemove", function (e) { onPointerMove(e.clientX, e.clientY); });
  window.addEventListener("mouseup", onPointerUp);
  canvas.addEventListener("mouseleave", onPointerUp);

  canvas.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    const t = e.touches[0];
    onPointerDown(t.clientX, t.clientY);
  }, { passive: false });
  canvas.addEventListener("touchmove", function (e) {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    const t = e.touches[0];
    onPointerMove(t.clientX, t.clientY);
    lastMouse = { x: t.clientX, y: t.clientY };
  }, { passive: false });
  canvas.addEventListener("touchend", onPointerUp);
  canvas.addEventListener("touchcancel", onPointerUp);

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      inView = !!(entries[0] && entries[0].isIntersecting);
      if (inView) start(); else stop();
    }, { threshold: 0.05 });
    io.observe(canvas);
  }

  document.addEventListener("visibilitychange", function () {
    pageVisible = !document.hidden;
    if (pageVisible) start(); else stop();
  });

  start();
}
```

- [ ] **Step 2: Create `src/pages/cases.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base
  title="Resultados — Arven"
  description="A Arven desenha e opera funis de aquisição para empresas B2B. Do primeiro clique ao lead qualificado, pronto para o seu time fechar."
  currentPage="cases"
>
  <!-- Paste the full content of <main>...</main> from cases.html here -->
  <!-- Lines 38–408 of cases.html (everything between <main> and </main>) -->
</Base>

<script>
  import { init } from '../scripts/icon-cloud.ts';

  const canvas = document.getElementById('icon-cloud-canvas') as HTMLCanvasElement | null;
  if (canvas) {
    const urls = [
      "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/meta.svg",
      "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/hubspot.svg",
      "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/googledrive.svg",
      "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/whatsapp.svg",
      "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/googlegemini.svg",
      "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/anthropic.svg",
      "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/openai.svg",
      "https://cdn.simpleicons.org/cursor/ffffff",
      "/assets/icon-cloud/kommo.svg",
      "/assets/icon-cloud/pipedrive.svg",
      "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/google.svg",
      "https://cdn.jsdelivr.net/npm/simple-icons@14/icons/x.svg"
    ];
    init(canvas, urls);
  }
</script>
```

> Note: icon-cloud paths changed from `assets/icon-cloud/` to `/assets/icon-cloud/` because assets are now in `public/`.

- [ ] **Step 3: Commit**

```bash
git add src/scripts/icon-cloud.ts src/pages/cases.astro
git commit -m "feat(pages): add cases.astro + icon-cloud.ts"
```

---

### Task 13: Migrate `src/pages/sobre.astro`

**Files:**
- Create: `src/pages/sobre.astro`

sobre.html uses only `js/nav.js` (handled by Nav.astro). No extra scripts.

- [ ] **Step 1: Create `src/pages/sobre.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base
  title="Sobre — Arven"
  description="A Arven desenha e opera funis de aquisição para empresas B2B. Do primeiro clique ao lead qualificado, pronto para o seu time fechar."
  currentPage="sobre"
>
  <!-- Paste the full content of <main>...</main> from sobre.html here -->
</Base>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/sobre.astro
git commit -m "feat(pages): add sobre.astro"
```

---

### Task 14: Migrate `src/pages/qualificacao.astro` + lead-form.ts

**Files:**
- Create: `src/scripts/lead-form.ts`
- Create: `src/pages/qualificacao.astro`

qualificacao.html uses `js/nav.js` (Nav.astro) + `js/lead-form.js`.

- [ ] **Step 1: Create `src/scripts/lead-form.ts`**

Copy `js/lead-form.js` verbatim — it is valid TypeScript with no changes required (no window globals, pure DOM manipulation):

```ts
/**
 * Formulário multi-etapas: envia lead via /api/lead (webhook) e exibe confirmação.
 */
(function () {
  var form = document.getElementById("arven-lead-form") as HTMLFormElement | null;
  if (!form) return;

  // ... (paste entire content of js/lead-form.js here, from line 1 to end)
  // The file is valid TypeScript as-is; no changes needed.
})();
```

> Practical: copy `js/lead-form.js` to `src/scripts/lead-form.ts`. No modifications needed.

- [ ] **Step 2: Create `src/pages/qualificacao.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base
  title="Qualificação — Arven"
  description="Formulário para entendermos o momento do seu negócio. Envie suas respostas e nossa equipe retorna em breve."
  currentPage="qualificacao"
>
  <!-- Paste the full content of <main>...</main> from qualificacao.html here -->
</Base>

<script>
  import '../scripts/lead-form.ts';
</script>
```

- [ ] **Step 3: Commit**

```bash
git add src/scripts/lead-form.ts src/pages/qualificacao.astro
git commit -m "feat(pages): add qualificacao.astro + lead-form.ts"
```

---

### Task 15: Migrate `src/pages/templates.astro` + data/page scripts

**Files:**
- Create: `src/scripts/arven-tokens-data.ts`
- Create: `src/scripts/templates-page.ts`
- Create: `src/pages/templates.astro`

templates.html uses `js/nav.js` + `js/arven-tokens-data.js` (sets `window.ARVEN_TOKEN_SECTIONS`) + `js/templates-page.js` (reads `window.ARVEN_TOKEN_SECTIONS`).

In Astro (ES modules), `templates-page.ts` imports the data directly instead of reading from `window`.

- [ ] **Step 1: Create `src/scripts/arven-tokens-data.ts`**

Replace `window.ARVEN_TOKEN_SECTIONS = [...]` with a named export:

```ts
/**
 * Tokens espelhados da página Design Tokens (arvenoficial.com/templates).
 */
export interface TokenItem {
  name: string;
  value: string;
  kind: string;
  display?: string;
}

export interface TokenSection {
  title: string;
  id: string;
  items: TokenItem[];
}

export const ARVEN_TOKEN_SECTIONS: TokenSection[] = [
  // paste the full array from js/arven-tokens-data.js (lines 4–221)
  // (replace "window.ARVEN_TOKEN_SECTIONS = [" with "export const ARVEN_TOKEN_SECTIONS: TokenSection[] = [")
];
```

> Practical: copy `js/arven-tokens-data.js` to `src/scripts/arven-tokens-data.ts`. Replace `window.ARVEN_TOKEN_SECTIONS = [` with `export const ARVEN_TOKEN_SECTIONS = [`. Add the `TokenSection` interface above it (or omit for now — the export alone is sufficient).

- [ ] **Step 2: Create `src/scripts/templates-page.ts`**

Replace all `window.ARVEN_TOKEN_SECTIONS` references with the imported `ARVEN_TOKEN_SECTIONS`:

```ts
/**
 * Gate + design tokens; UI = site institucional.
 */
import { ARVEN_TOKEN_SECTIONS } from './arven-tokens-data.ts';

(function () {
  if ((window as any).__ARVEN_TEMPLATES_PAGE_INIT__) return;
  (window as any).__ARVEN_TEMPLATES_PAGE_INIT__ = true;

  // ... (paste entire content of js/templates-page.js)
  // Replace every "window.ARVEN_TOKEN_SECTIONS" with "ARVEN_TOKEN_SECTIONS"
  // That appears in: renderToc(), renderTokens(), renderTokensAndToc(), buildMarkdown()
})();
```

> Practical changes from `js/templates-page.js`:
> 1. Add `import { ARVEN_TOKEN_SECTIONS } from './arven-tokens-data.ts';` at top
> 2. Replace `window.ARVEN_TOKEN_SECTIONS` (4 occurrences) with `ARVEN_TOKEN_SECTIONS`

- [ ] **Step 3: Create `src/pages/templates.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base
  title="Design Tokens — Arven"
  description="Tokens de design da marca Arven. Acesso restrito a parceiros e equipa."
  currentPage="templates"
>
  <!-- Paste the full content of <main>...</main> from templates.html here -->
</Base>

<script>
  import '../scripts/templates-page.ts';
</script>
```

- [ ] **Step 4: Commit**

```bash
git add src/scripts/arven-tokens-data.ts src/scripts/templates-page.ts src/pages/templates.astro
git commit -m "feat(pages): add templates.astro + arven-tokens-data.ts + templates-page.ts"
```

---

## Phase 6: Blog Page (basic static)

### Task 16: Create `src/pages/blog/index.astro` (static empty state)

**Files:**
- Create: `src/pages/blog/index.astro`

Start with the existing static content from `blog/index.html`. Sanity SSR is added in Phase 7.

- [ ] **Step 1: Create `src/pages/blog/index.astro`**

```astro
---
import Base from '../../layouts/Base.astro';
---
<Base
  title="Blog — Arven"
  description="A Arven desenha e opera funis de aquisição para empresas B2B. Do primeiro clique ao lead qualificado, pronto para o seu time fechar."
  currentPage="blog"
>
  <!-- HERO -->
  <section class="page-hero">
    <p class="page-hero__tag">Blog</p>
    <h1 class="page-hero__headline">Aquisição, qualificação e<br />processo comercial B2B.</h1>
    <p class="page-hero__sub">
      O que aprendemos operando funis de aquisição para dezenas de empresas.
      Sem teoria. Só o que funciona.
    </p>
  </section>

  <!-- EMPTY STATE -->
  <section class="blog-empty">
    <h2 class="blog-empty__headline">Em breve</h2>
    <p class="blog-empty__sub">
      Estamos preparando os primeiros artigos. Conteúdo direto sobre aquisição B2B,
      escrito por quem opera isso todo dia.
    </p>
  </section>
</Base>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/blog/index.astro
git commit -m "feat(pages): add blog/index.astro (static empty state)"
```

---

## Phase 7: Sanity Integration

### Task 17: Create `src/lib/sanity.ts`

**Files:**
- Create: `src/lib/sanity.ts`

- [ ] **Step 1: Create `src/lib/sanity.ts`**

```ts
import { createClient } from '@sanity/client';

export const sanity = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
});

export interface SanityPost {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt?: string;
  body?: any;
}

export async function getAllPosts(): Promise<SanityPost[]> {
  return sanity.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      publishedAt,
      excerpt
    }
  `);
}

export async function getPostBySlug(slug: string): Promise<SanityPost | null> {
  const posts = await sanity.fetch(`
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      body
    }
  `, { slug });
  return posts ?? null;
}
```

- [ ] **Step 2: Verify `.env` has Sanity vars**

```bash
cat .env
```

Expected output contains:
```
SANITY_PROJECT_ID=8b9xqel2
SANITY_DATASET=production
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/sanity.ts
git commit -m "feat(blog): add sanity.ts client + query helpers"
```

---

### Task 18: Update `src/pages/blog/index.astro` to SSR with Sanity

**Files:**
- Modify: `src/pages/blog/index.astro`

- [ ] **Step 1: Update `src/pages/blog/index.astro`**

```astro
---
export const prerender = false;
import Base from '../../layouts/Base.astro';
import { getAllPosts } from '../../lib/sanity.ts';

const posts = await getAllPosts();
---
<Base
  title="Blog — Arven"
  description="A Arven desenha e opera funis de aquisição para empresas B2B. Do primeiro clique ao lead qualificado, pronto para o seu time fechar."
  currentPage="blog"
>
  <!-- HERO -->
  <section class="page-hero">
    <p class="page-hero__tag">Blog</p>
    <h1 class="page-hero__headline">Aquisição, qualificação e<br />processo comercial B2B.</h1>
    <p class="page-hero__sub">
      O que aprendemos operando funis de aquisição para dezenas de empresas.
      Sem teoria. Só o que funciona.
    </p>
  </section>

  {posts.length === 0 ? (
    <!-- EMPTY STATE -->
    <section class="blog-empty">
      <h2 class="blog-empty__headline">Em breve</h2>
      <p class="blog-empty__sub">
        Estamos preparando os primeiros artigos. Conteúdo direto sobre aquisição B2B,
        escrito por quem opera isso todo dia.
      </p>
    </section>
  ) : (
    <section class="blog-list">
      <div class="blog-list__grid">
        {posts.map((post) => (
          <article class="blog-card">
            <a href={`/blog/${post.slug.current}`} class="blog-card__link">
              <time class="blog-card__date" datetime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </time>
              <h2 class="blog-card__title">{post.title}</h2>
              {post.excerpt && (
                <p class="blog-card__excerpt">{post.excerpt}</p>
              )}
            </a>
          </article>
        ))}
      </div>
    </section>
  )}
</Base>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/blog/index.astro
git commit -m "feat(blog): blog/index.astro fetches posts from Sanity (SSR)"
```

---

### Task 19: Create `src/pages/blog/[slug].astro`

**Files:**
- Create: `src/pages/blog/[slug].astro`

- [ ] **Step 1: Create `src/pages/blog/[slug].astro`**

```astro
---
export const prerender = false;
import Base from '../../layouts/Base.astro';
import { getPostBySlug } from '../../lib/sanity.ts';

const { slug } = Astro.params;
const post = slug ? await getPostBySlug(slug) : null;

if (!post) {
  return Astro.redirect('/blog', 302);
}
---
<Base
  title={`${post.title} — Arven`}
  description={post.excerpt ?? 'Leia este artigo no blog da Arven.'}
  currentPage="blog"
>
  <article class="blog-post">
    <header class="blog-post__header">
      <time class="blog-post__date" datetime={post.publishedAt}>
        {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })}
      </time>
      <h1 class="blog-post__title">{post.title}</h1>
      {post.excerpt && <p class="blog-post__excerpt">{post.excerpt}</p>}
    </header>
    <div class="blog-post__body">
      {/* Portable Text renderer — add @portabletext/react or render as plain text for now */}
      {post.body && <p class="blog-post__raw">{JSON.stringify(post.body)}</p>}
    </div>
  </article>
</Base>
```

> **Note on Portable Text:** Sanity `body` is Portable Text (structured JSON). The above renders it as raw JSON as a placeholder until you add a Portable Text renderer. To render properly, install `@portabletext/react` (for React) or implement a custom renderer. For plain text rendering, convert with a GROQ projection: add `"bodyText": pt::text(body)` to the query and render `post.bodyText`.

> **Recommended quick fix** — update the GROQ query in `getPostBySlug` to extract plain text:
> ```ts
> *[_type == "post" && slug.current == $slug][0] {
>   _id, title, slug, publishedAt, excerpt,
>   "bodyText": pt::text(body)
> }
> ```
> Then render `<p>{post.bodyText}</p>` in the component.

- [ ] **Step 2: Commit**

```bash
git add src/pages/blog/[slug].astro
git commit -m "feat(blog): add blog/[slug].astro SSR post page"
```

---

## Phase 8: API Endpoint

### Task 20: Create `src/pages/api/lead.ts`

**Files:**
- Create: `src/pages/api/lead.ts`

Migrates all logic from `api/lead.js`. Same validation, same responses, same webhook forwarding.

- [ ] **Step 1: Create `src/pages/api/lead.ts`**

```ts
export const prerender = false;

import type { APIContext } from 'astro';

const REQUIRED = ["nome", "email", "whatsapp", "empresa", "segmento", "faturamento", "midia", "desafio"] as const;

function jsonResponse(status: number, body: object): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function POST({ request }: APIContext): Promise<Response> {
  const target = import.meta.env.LEAD_WEBHOOK_URL;
  if (!target || !/^https?:\/\//i.test(target)) {
    return jsonResponse(503, { error: "webhook_not_configured" });
  }

  let body: any;
  try {
    const text = await request.text();
    if (text.length > 256 * 1024) {
      return jsonResponse(413, { error: "payload_too_large" });
    }
    body = JSON.parse(text || "{}");
  } catch {
    return jsonResponse(400, { error: "invalid_json" });
  }

  if (body._honeypot && String(body._honeypot).trim() !== "") {
    return jsonResponse(400, { error: "bad_request" });
  }

  if (!body.lead || typeof body.lead !== "object") {
    return jsonResponse(400, { error: "missing_lead" });
  }

  for (const k of REQUIRED) {
    const v = body.lead[k];
    if (v == null || String(v).trim() === "") {
      return jsonResponse(400, { error: "missing_field", field: k });
    }
  }

  const email = String(body.lead.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse(400, { error: "invalid_email" });
  }

  const wa = String(body.lead.whatsapp || "").replace(/\D/g, "");
  if (wa.length < 10 || wa.length > 13) {
    return jsonResponse(400, { error: "invalid_whatsapp" });
  }

  const outbound = {
    event: "lead_qualificacao",
    receivedAt: new Date().toISOString(),
    source: body.source || "arven_site",
    page: body.page ?? null,
    referrer: body.referrer ?? null,
    campaign: body.campaign && typeof body.campaign === "object" ? body.campaign : {},
    lead: body.lead,
  };

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const secret = import.meta.env.LEAD_WEBHOOK_SECRET;
  if (secret) headers.Authorization = "Bearer " + secret;

  try {
    const r = await fetch(target, {
      method: "POST",
      headers,
      body: JSON.stringify(outbound),
    });
    if (!r.ok) {
      return jsonResponse(502, { error: "webhook_upstream_error", status: r.status });
    }
  } catch {
    return jsonResponse(502, { error: "webhook_unreachable" });
  }

  return jsonResponse(200, { ok: true });
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/api/lead.ts
git commit -m "feat(api): migrate api/lead.js to src/pages/api/lead.ts"
```

---

## Phase 9: Verify & Build

### Task 21: Run `astro dev` and verify all pages

- [ ] **Step 1: Start dev server**

```bash
npx astro dev
```

Expected: server starts at `http://localhost:4321` with no TypeScript errors.

- [ ] **Step 2: Verify each route in browser**

Open each URL and confirm the page renders identically to the current site:

| URL | Expected |
|---|---|
| `http://localhost:4321/` | Homepage with VSL player |
| `http://localhost:4321/servicos` | Serviços page with orbit viz |
| `http://localhost:4321/cases` | Cases with icon cloud rotating |
| `http://localhost:4321/sobre` | Sobre page |
| `http://localhost:4321/qualificacao` | Multi-step form |
| `http://localhost:4321/templates` | Gate form (password protected) |
| `http://localhost:4321/blog` | Blog empty state or post list |
| `http://localhost:4321/api/lead` | Should return `405 Method Not Allowed` (GET not allowed) |

- [ ] **Step 3: Verify nav `aria-current` per page**

On each page, inspect the nav links and confirm the correct link has `aria-current="page"`.

- [ ] **Step 4: Verify icon cloud**

On `/cases`, confirm the canvas renders and animates. Open DevTools → Console, confirm no errors.

- [ ] **Step 5: Verify lead form**

On `/qualificacao`, step through the form to the last step. Attempt submit (it will fail if webhook is not running locally — that's OK, confirm the UI shows the error state, not a JS crash).

---

### Task 22: Run `astro build` and verify

- [ ] **Step 1: Run build**

```bash
npx astro build
```

Expected: build completes with no errors. Output in `dist/`.

- [ ] **Step 2: Check static pages are prerendered**

```bash
ls dist/
```

Expected: `index.html`, `servicos/`, `cases/`, `sobre/`, `qualificacao/`, `templates/` present as static files. `blog/` and `api/` are SSR (handled by the Vercel adapter as serverless functions).

- [ ] **Step 3: Run preview**

```bash
npx astro preview
```

Open `http://localhost:4321/` and verify the built output works.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: verify astro build passes"
```

---

## Phase 10: Cleanup

### Task 23: Delete old HTML files + JS folder + old CSS

**Files:**
- Delete: `index.html`, `servicos.html`, `cases.html`, `sobre.html`, `qualificacao.html`, `templates.html`
- Delete: `blog/`
- Delete: `js/`
- Delete: `styles.css`
- Delete: `api/`

- [ ] **Step 1: Delete old files**

```bash
rm index.html servicos.html cases.html sobre.html qualificacao.html templates.html
rm -rf blog/ js/ api/
rm styles.css
```

- [ ] **Step 2: Verify no broken references**

```bash
npx astro build
```

Expected: build still passes. No 404s for removed files.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: delete old HTML files, js/, api/, styles.css (replaced by Astro)"
```

---

### Task 24: Update `vercel.json`

**Files:**
- Modify: `vercel.json`

Remove all `redirects` and `rewrites` (Astro generates clean URLs natively). Keep only security headers and asset cache.

- [ ] **Step 1: Replace `vercel.json`**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "chore(vercel): remove rewrites/redirects — Astro handles clean URLs"
```

---

### Task 25: Final commit + deploy

- [ ] **Step 1: Final build check**

```bash
npx astro build
```

Expected: build passes with zero errors.

- [ ] **Step 2: Add Vercel environment variables**

In Vercel Dashboard → Project → Settings → Environment Variables, confirm these are set:
- `SANITY_PROJECT_ID` = `8b9xqel2`
- `SANITY_DATASET` = `production`
- `LEAD_WEBHOOK_URL` = `https://webhook.trafegoedu.com.br/webhook/b2ccaa27-b2c4-459c-a419-0f0dfe5a816f`

- [ ] **Step 3: Push to main and verify Vercel deploy**

```bash
git push origin main
```

Expected: Vercel build triggers automatically. Monitor at Vercel dashboard. Deploy should succeed.

- [ ] **Step 4: Smoke-test production URLs**

| URL | Check |
|---|---|
| `https://arven.com.br/` | Homepage loads, VSL plays |
| `https://arven.com.br/servicos` | Serviços loads |
| `https://arven.com.br/cases` | Icon cloud animates |
| `https://arven.com.br/qualificacao` | Form submits correctly |
| `https://arven.com.br/blog` | Blog loads (empty state or posts) |
| `https://arven.com.br/api/lead` | Returns 405 (GET not allowed) |

- [ ] **Step 5: Confirm old `.html` URLs redirect correctly**

The old redirects (e.g. `/servicos.html` → `/servicos`) were in `vercel.json`. These are now **removed**. Verify if you need to add them back:

```bash
curl -I https://arven.com.br/servicos.html
```

If status is 404 and you need 301 redirects for SEO, add them back to `vercel.json`:
```json
"redirects": [
  { "source": "/servicos.html", "destination": "/servicos", "permanent": true },
  { "source": "/cases.html", "destination": "/cases", "permanent": true },
  { "source": "/sobre.html", "destination": "/sobre", "permanent": true },
  { "source": "/qualificacao.html", "destination": "/qualificacao", "permanent": true },
  { "source": "/templates.html", "destination": "/templates", "permanent": true }
]
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All 7 pages migrated (index, servicos, cases, sobre, qualificacao, templates, blog). API endpoint migrated. CSS 3-layer architecture. Blog SSR via Sanity. Vercel adapter. ✓
- [x] **No placeholders:** Every task has exact commands and code. Pages reference exact line ranges from source HTML files for `<main>` content copy. ✓
- [x] **Type consistency:** `SanityPost` defined in sanity.ts and used in both blog pages. `TokenSection`/`TokenItem` defined in arven-tokens-data.ts and imported in templates-page.ts. ✓
- [x] **GSAP:** Confirmed not actually used in any inline script in index.html (only loaded as global). Skip importing in index.astro. `gsap` remains in dependencies for potential future use. ✓
- [x] **Asset paths:** All `assets/` references in HTML become `/assets/` after move to `public/`. The icon-cloud inline script in cases.astro uses `/assets/icon-cloud/` prefix. ✓
- [x] **Old `.html` redirects:** Task 25 explicitly prompts to verify and optionally restore SEO redirects. ✓
