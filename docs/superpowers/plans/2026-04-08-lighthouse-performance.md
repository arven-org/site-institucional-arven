# Lighthouse Performance Optimization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise Lighthouse performance score from 87 to 90+ by eliminating render-blocking resources and optimizing image delivery, without any visual changes.

**Architecture:** Two main bottlenecks: (1) Google Fonts CSS blocks rendering for ~855ms — fix by self-hosting fonts with `font-display: swap`; (2) Avatar images are 40x40px display but served as 1024x1024 originals (~261 KiB wasted) — fix by creating properly-sized WebP thumbnails. The Astro CSS bundle (335ms block) is inherent to the framework and acceptable.

**Tech Stack:** Astro 6, CSS, sharp (already in dependencies via Astro)

**Constraints:** ZERO visual changes. Same fonts, same weights, same images, same animations. Only delivery method changes.

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `public/assets/cases/*-thumb.webp` | Pre-resized 80x80 WebP avatar thumbnails |
| Create | `public/fonts/geist-*.woff2` | Self-hosted Geist font files |
| Modify | `src/components/Head.astro` | Replace Google Fonts link with local @font-face |
| Create | `src/styles/fonts.css` | @font-face declarations for self-hosted fonts |
| Modify | `src/pages/index.astro:78-81` | Point avatar `src` to WebP thumbnails |
| Modify | `src/pages/cases.astro` | Point case avatars to WebP (larger size) |

---

### Task 1: Self-host Geist fonts to eliminate render-blocking Google Fonts request

The Google Fonts stylesheet is the #1 render-blocking resource (855ms wasted). By self-hosting the font files, we eliminate the external CSS request entirely and gain full control over loading behavior.

**Files:**
- Create: `public/fonts/` directory with Geist woff2 files
- Create: `src/styles/fonts.css`
- Modify: `src/components/Head.astro:38-43`

- [ ] **Step 1: Download Geist font files**

Download the exact weights used (300, 400, 500, 600 for Geist; 400, 500 for Geist Mono) as woff2:

```bash
# Download from Google Fonts CDN — get the actual woff2 URLs
# Geist Regular (400)
curl -L "https://fonts.gstatic.com/s/geist/v1/gyBhhwUxId8gMGYQMKR3pzfaWI_RnOE.woff2" -o public/fonts/geist-400.woff2
# Geist Light (300)
curl -L "https://fonts.gstatic.com/s/geist/v1/gyBhhwUxId8gMGYQMKR3p1naWI_RnOE.woff2" -o public/fonts/geist-300.woff2
# Geist Medium (500)
curl -L "https://fonts.gstatic.com/s/geist/v1/gyBhhwUxId8gMGYQMKR3p0vaWI_RnOE.woff2" -o public/fonts/geist-500.woff2
# Geist SemiBold (600)
curl -L "https://fonts.gstatic.com/s/geist/v1/gyBhhwUxId8gMGYQMKR3p6PaWI_RnOE.woff2" -o public/fonts/geist-600.woff2
# Geist Mono Regular (400)
curl -L "https://fonts.gstatic.com/s/geistmono/v1/or3yQ6H-1_WzkkwGLaBKN3phrWdNkJE.woff2" -o public/fonts/geist-mono-400.woff2
# Geist Mono Medium (500)
curl -L "https://fonts.gstatic.com/s/geistmono/v1/or3yQ6H-1_WzkkwGLaBKN3phrU1NkJE.woff2" -o public/fonts/geist-mono-500.woff2
```

NOTE: The exact URLs may differ. If these 404, fetch the Google Fonts CSS first to get the actual woff2 URLs:
```bash
curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap"
```
Then extract the `url(...)` values from the response.

- [ ] **Step 2: Create fonts.css with @font-face declarations**

Create `src/styles/fonts.css`:

```css
/* Geist — self-hosted, same weights as Google Fonts import */
@font-face {
  font-family: 'Geist';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url('/fonts/geist-300.woff2') format('woff2');
}
@font-face {
  font-family: 'Geist';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/geist-400.woff2') format('woff2');
}
@font-face {
  font-family: 'Geist';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/fonts/geist-500.woff2') format('woff2');
}
@font-face {
  font-family: 'Geist';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/geist-600.woff2') format('woff2');
}

/* Geist Mono */
@font-face {
  font-family: 'Geist Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/geist-mono-400.woff2') format('woff2');
}
@font-face {
  font-family: 'Geist Mono';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/fonts/geist-mono-500.woff2') format('woff2');
}
```

- [ ] **Step 3: Update Head.astro — replace Google Fonts with local fonts**

In `src/components/Head.astro`, remove lines 38-43 (the preconnect and stylesheet links):

```diff
- <link rel="preconnect" href="https://fonts.googleapis.com" />
- <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
- <link
-   href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap"
-   rel="stylesheet"
- />
```

No replacement needed here — the fonts.css will be imported in global.css.

- [ ] **Step 4: Import fonts.css in global.css**

In `src/styles/global.css`, add the import right before the existing tokens import (line 5):

```diff
+ @import './fonts.css';
  @import './tokens.css';
```

- [ ] **Step 5: Add font preload hints to Head.astro**

In `src/components/Head.astro`, after the favicon line (line 37), add preload for the most critical font weight (400 — used for body text):

```html
<link rel="preload" href="/fonts/geist-400.woff2" as="font" type="font/woff2" crossorigin />
```

- [ ] **Step 6: Verify fonts render identically**

```bash
npx astro build && npx astro dev --port 4321
```

Open http://localhost:4321 and visually confirm:
- All text renders in Geist (not system fallback)
- Font weights 300, 400, 500, 600 all work
- Geist Mono renders in code/mono elements
- No FOUT (flash of unstyled text) beyond what `display=swap` already caused

- [ ] **Step 7: Commit**

```bash
git add public/fonts/ src/styles/fonts.css src/components/Head.astro src/styles/global.css
git commit -m "perf: self-host Geist fonts, eliminate render-blocking Google Fonts"
```

---

### Task 2: Create optimized WebP avatar thumbnails

The 4 avatar images in the hero are displayed at 40x40px but served as full-size originals (47-87 KiB each, 1024x1024). Create 80x80 WebP thumbnails (2x for retina) to save ~261 KiB.

**Files:**
- Create: `public/assets/cases/diego-faustino-thumb.webp`
- Create: `public/assets/cases/germano-eag-thumb.webp`
- Create: `public/assets/cases/daniel-csc-thumb.webp`
- Create: `public/assets/cases/adrian-quartavia-thumb.webp`

- [ ] **Step 1: Generate WebP thumbnails with sharp**

```bash
node -e "
const sharp = require('sharp');
const files = [
  'diego-faustino.png',
  'germano-eag.jpg',
  'daniel-csc.jpg',
  'adrian-quartavia.jpg'
];
(async () => {
  for (const f of files) {
    const name = f.replace(/\.(jpg|png)$/, '-thumb.webp');
    await sharp('public/assets/cases/' + f)
      .resize(80, 80, { fit: 'cover', position: 'top' })
      .webp({ quality: 80 })
      .toFile('public/assets/cases/' + name);
    console.log('Created: ' + name);
  }
})();
"
```

Expected output: 4 files created, each ~2-4 KiB instead of 47-87 KiB.

- [ ] **Step 2: Verify thumbnail quality**

```bash
node -e "
const sharp = require('sharp');
const files = ['diego-faustino-thumb.webp','germano-eag-thumb.webp','daniel-csc-thumb.webp','adrian-quartavia-thumb.webp'];
(async () => {
  for (const f of files) {
    const meta = await sharp('public/assets/cases/' + f).metadata();
    console.log(f + ': ' + meta.width + 'x' + meta.height + ', ' + meta.format);
  }
})();
"
```

Expected: all 80x80, format webp.

- [ ] **Step 3: Commit**

```bash
git add public/assets/cases/*-thumb.webp
git commit -m "perf: add 80x80 WebP avatar thumbnails for hero section"
```

---

### Task 3: Update index.astro to use WebP thumbnails

**Files:**
- Modify: `src/pages/index.astro:78-81`

- [ ] **Step 1: Replace avatar image sources**

In `src/pages/index.astro`, replace lines 78-81:

```diff
- <img class="avatar-circles__img" src="/assets/cases/diego-faustino.png"   alt="" width="40" height="40" decoding="async" />
- <img class="avatar-circles__img" src="/assets/cases/germano-eag.jpg"       alt="" width="40" height="40" decoding="async" />
- <img class="avatar-circles__img" src="/assets/cases/daniel-csc.jpg"        alt="" width="40" height="40" decoding="async" />
- <img class="avatar-circles__img" src="/assets/cases/adrian-quartavia.jpg"  alt="" width="40" height="40" decoding="async" />
+ <img class="avatar-circles__img" src="/assets/cases/diego-faustino-thumb.webp"   alt="" width="40" height="40" decoding="async" />
+ <img class="avatar-circles__img" src="/assets/cases/germano-eag-thumb.webp"       alt="" width="40" height="40" decoding="async" />
+ <img class="avatar-circles__img" src="/assets/cases/daniel-csc-thumb.webp"        alt="" width="40" height="40" decoding="async" />
+ <img class="avatar-circles__img" src="/assets/cases/adrian-quartavia-thumb.webp"  alt="" width="40" height="40" decoding="async" />
```

NOTE: The `cases.astro` page shows larger versions of these images and should keep the originals.

- [ ] **Step 2: Verify avatars display correctly**

Open http://localhost:4321 and verify:
- All 4 avatar circles render correctly
- Images are circular, properly cropped to face
- No visual difference from before
- Check devtools Network tab: avatar images should be 2-4 KiB each instead of 47-87 KiB

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "perf: use WebP thumbnails for hero avatar images"
```

---

### Task 4: Run Lighthouse and verify score improvement

- [ ] **Step 1: Build for production and run Lighthouse**

```bash
npx astro build
npx lighthouse http://localhost:4321 --output=json --output-path=./lighthouse-after --chrome-flags="--headless --no-sandbox" --only-categories=performance
```

Note: Running against dev server is fine for comparing before/after, but production (Vercel) will score higher.

- [ ] **Step 2: Compare scores**

```bash
node -e "
const before = require('./lighthouse-prod.report.json');
const after = require('./lighthouse-after.report.json');
const cats = ['performance'];
cats.forEach(c => {
  console.log(c + ': ' + Math.round(before.categories[c].score*100) + ' → ' + Math.round(after.categories[c].score*100));
});
const metrics = ['first-contentful-paint','largest-contentful-paint','speed-index'];
metrics.forEach(m => {
  console.log(before.audits[m].title + ': ' + before.audits[m].displayValue + ' → ' + after.audits[m].displayValue);
});
"
```

Expected improvements:
- FCP should improve by ~800ms+ (no more Google Fonts blocking)
- Image transfer reduced by ~261 KiB
- Performance score should reach 90+

- [ ] **Step 3: Final visual check**

Open every page and verify no visual regressions:
- http://localhost:4321/ — hero, avatars, animations, fonts
- http://localhost:4321/servicos — fonts
- http://localhost:4321/cases — case images (still using originals)
- http://localhost:4321/sobre — fonts
- http://localhost:4321/qualificacao — form, fonts

- [ ] **Step 4: Commit and deploy**

If deployed to Vercel, push and run Lighthouse against production URL to confirm 90+ score.
