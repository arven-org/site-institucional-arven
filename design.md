# Arven — Design System

> Fonte única de verdade para design, tokens, componentes e padrões visuais.
> Utilizado no site institucional (Astro) e em qualquer sistema que precise seguir a identidade Arven.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Tech Stack](#2-tech-stack)
3. [Arquitetura de Estilos](#3-arquitetura-de-estilos)
4. [Design Tokens](#4-design-tokens)
5. [Tipografia](#5-tipografia)
6. [Sistema de Cor](#6-sistema-de-cor)
7. [Espaçamento e Layout](#7-espaçamento-e-layout)
8. [Border Radius](#8-border-radius)
9. [Componentes](#9-componentes)
10. [Animações](#10-animações)
11. [Responsividade](#11-responsividade)
12. [Acessibilidade](#12-acessibilidade)
13. [Convenções de Nomenclatura](#13-convenções-de-nomenclatura)
14. [Modo Claro (Light Variant)](#14-modo-claro-light-variant)

---

## 1. Visão Geral

A Arven tem uma identidade **dark-first, minimal e técnica**. O visual remete a ferramentas de engenharia e dashboards SaaS — backgrounds quase pretos, hierarquia de texto em tons de creme/cinza, bordas sutis e uso intencional de fontes mono para labels e metadados.

**Princípios:**
- **Dark por padrão.** Background `#0a0a0a`, superfícies em `#111` e `#161616`.
- **Hierarquia via opacidade, não cor.** Texto primário, secundário e terciário são variações de brilho do mesmo branco-creme.
- **Espaço como elemento de design.** Padding generoso, gaps consistentes, sem decorações desnecessárias.
- **Mono para metadados.** Tags, labels de passo, timestamps e valores numéricos usam `Geist Mono`.
- **Bordas de 1px, nunca sombras fortes.** Cards se delimitam por `border: 1px solid var(--border)`, não box-shadow.

---

## 2. Tech Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | [Astro](https://astro.build) (SSG/SSR) |
| Estilização | CSS puro — sem Tailwind, sem CSS-in-JS |
| Fontes | Geist + Geist Mono (self-hosted, variable font) |
| CMS | Sanity (conteúdo do blog) |
| Deploy | Vercel |
| Schema | JSON-LD via componentes Astro dedicados |

---

## 3. Arquitetura de Estilos

```
src/styles/
  tokens.css    ← CSS custom properties (fonte única de verdade)
  fonts.css     ← @font-face declarations (Geist + Geist Mono)
  global.css    ← reset, base, animações, todos os componentes
```

`global.css` importa os dois outros via `@import` no topo. Não há CSS por componente — tudo fica em `global.css`, organizado por seções com comentários `/* === SEÇÃO === */`.

**Regra:** Nenhum valor de cor, raio ou fonte deve ser escrito literal em `global.css`. Sempre usar o token correspondente de `tokens.css`.

---

## 4. Design Tokens

Definidos em `src/styles/tokens.css` como CSS custom properties no `:root`.

### 4.1 Cores

```css
:root {
  /* Backgrounds */
  --bg:           #0a0a0a;   /* página, nível mais baixo */
  --bg-surface:   #111111;   /* cards, painéis */
  --bg-raised:    #161616;   /* hover de card, estados elevados */

  /* Bordas */
  --border:       rgba(255, 255, 255, 0.08);   /* borda padrão */
  --border-hover: rgba(255, 255, 255, 0.15);   /* borda em foco/hover */

  /* Texto */
  --text-primary:   #f0ede8;   /* títulos, corpo principal */
  --text-secondary: #a8a4a0;   /* subtítulos, descrições */
  --text-tertiary:  #6b6763;   /* labels, metadados, placeholders */

  /* Accent */
  --accent:     #e8e0d0;               /* accent claro */
  --accent-dim: rgba(232, 224, 208, 0.06); /* hover de bg sutil */

  /* Semânticas (badges, ícones) */
  --green:      #1a3a2a;   /* bg de badge verde */
  --green-text: #4ade80;   /* texto de badge verde */
  --blue:       #0f1f3a;   /* bg de badge azul */
  --blue-text:  #60a5fa;   /* texto de badge azul / ícones */
}
```

### 4.2 Tipografia

```css
:root {
  --font-sans: 'Geist', -apple-system, sans-serif;
  --font-mono: 'Geist Mono', monospace;
}
```

### 4.3 Layout

```css
:root {
  --max-w:       1320px;  /* largura máxima do conteúdo */
  --section-gap: 32px;    /* gap entre seções no <main> */
}
```

### 4.4 Border Radius

```css
:root {
  --radius-sm: 6px;   /* botões, inputs, badges pequenos */
  --radius-md: 10px;  /* cards menores, vídeo frame */
  --radius-lg: 14px;  /* cards principais, seções */
}
```

---

## 5. Tipografia

### Fontes

| Nome | Uso | Fallback |
|------|-----|----------|
| **Geist** (variable, 100–900) | Corpo, títulos, UI | `-apple-system, sans-serif` |
| **Geist Mono** (variable, 100–900) | Tags, labels, timestamps, números | `monospace` |

As fontes são self-hosted em `/public/fonts/` como `.woff2` (latin + latin-ext). Dois arquivos por fonte: `geist-latin.woff2` e `geist-latin-ext.woff2` (com `unicode-range` para carregar só o necessário).

### Escala de Texto

| Token / Uso | `font-size` | `font-weight` | `line-height` | `letter-spacing` |
|-------------|-------------|---------------|---------------|------------------|
| Hero headline | `clamp(32px, 4vw, 48px)` | 500 | 1.12 | -0.8px |
| Page hero headline | `clamp(28px, 3.5vw, 40px)` | 500 | 1.15 | -0.6px |
| Section headline (24px) | 24px | 500 | 1.3 | -0.3px |
| Section headline (28px) | 28px | 500–600 | 1.25–1.32 | -0.4–0.5px |
| Focal value | `clamp(36px, 4vw, 48px)` | 500 | 1 | -0.8px |
| Body / sub | 14–15px | 400 | 1.65–1.75 | — |
| Small body | 12–13px | 400 | 1.5–1.7 | — |
| Card headline | 20px | 500 | 1.3 | -0.3px |
| Nav links | 13px | 400 | — | — |
| Mono tag / label | 10–11px | 400–500 | — | 0.06–0.12em |
| Button | 13px (14px mobile) | 500 | 1.4 | — |

### Regras de Uso de Mono

Use `--font-mono` **apenas** para:
- Tags de seção (ex: `"01 — MÉTODO"`)
- Numeração de passos (`01`, `02` …)
- Timestamps e metadados de blog
- Valores numéricos de métricas isoladas
- Rótulos de coluna no footer

---

## 6. Sistema de Cor

### Hierarquia de Texto

```
--text-primary   → títulos, conteúdo crítico
--text-secondary → subtítulos, corpo explicativo
--text-tertiary  → metadata, labels mono, placeholders, separadores
```

Nunca inverta a hierarquia — texto terciário nunca deve carregar informação essencial.

### Hierarquia de Background

```
--bg          → fundo da página (mais fundo)
--bg-surface  → cards, seções, painéis
--bg-raised   → estado hover de card, elementos flutuantes
```

Cards são empilhados sobre `--bg`. O hover eleva de `--bg-surface` para `--bg-raised` com `transition: background 0.15s`.

### Gradiente de Destaque (Animated Gradient)

Usado no link "Resultados" do nav e em destaques pontuais:

```css
background-image: linear-gradient(
  90deg,
  #ffaa40 0%,
  #9c40ff 50%,
  #ffaa40 100%
);
background-size: 300% 100%;
background-clip: text;
-webkit-background-clip: text;
color: transparent;
-webkit-text-fill-color: transparent;
animation: nav-gradient-text 8s linear infinite;
```

### Cores de Status (Badges)

| Cor | Background | Texto |
|-----|-----------|-------|
| Verde | `--green` (#1a3a2a) | `--green-text` (#4ade80) |
| Azul | `--blue` (#0f1f3a) | `--blue-text` (#60a5fa) |

### Highlight de Texto (underline)

```css
.text-highlight {
  text-decoration: underline;
  text-decoration-color: rgba(255, 255, 255, 0.25);
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
}
```

---

## 7. Espaçamento e Layout

### Wrapper Principal

```css
main {
  max-width: var(--max-w);   /* 1320px */
  margin: 0 auto;
  padding: 24px 24px 0;
  display: flex;
  flex-direction: column;
  gap: var(--section-gap);   /* 32px */
}
```

Todas as seções ficam dentro de `<main>` e recebem o gap automático.

### Padding Padrão de Seção (Card)

| Tamanho | Uso |
|---------|-----|
| `64px 56px` | Hero principal |
| `56px 56px 48px` | Page hero (páginas internas) |
| `40px` | Cabeçalhos de seção (`.method__head`, `.faq__inner`) |
| `32px 28px` | Cards de serviço |
| `28px 24px` | Cards de case header |
| `24px 20px` | Cards menores, cells de grid |

### Grid Padrão de Seção

Cards de "mosaic" usam `gap: 1px; background: var(--border)` no container, com cells em `background: var(--bg-surface)`. Isso cria linhas divisórias de 1px sem usar `border` individual em cada cell.

```css
/* Padrão de grid divisório */
.section__grid {
  display: grid;
  grid-template-columns: repeat(N, 1fr);
  gap: 1px;
  background: var(--border);   /* a "borda" é o fundo do grid */
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.section__cell {
  background: var(--bg-surface);  /* cobre o gap background */
}
```

### Breakpoints

| Nome | Valor | Uso |
|------|-------|-----|
| Desktop | — | Default (mobile-last approach) |
| Tablet/Mobile | `max-width: 900px` | Colapsa grids, ativa nav drawer |
| Mobile | `max-width: 640px` | Ajustes de padding, texto menor |
| Small mobile | `max-width: 480px` | Footer, ajustes mínimos |
| Reduced motion | `prefers-reduced-motion: reduce` | Desativa animações |

---

## 8. Border Radius

| Token | Valor | Aplicação |
|-------|-------|-----------|
| `--radius-sm` | `6px` | Botões, inputs, badges, hamburger button, thumbnail de ícone |
| `--radius-md` | `10px` | Cards de vídeo/mídia, orbit badges, containers menores |
| `--radius-lg` | `14px` | Seções principais, cards de conteúdo, grids de serviços |

Cards de seção usam sempre `--radius-lg`. Nunca use `border-radius` literal — referencie sempre um token.

---

## 9. Componentes

### 9.1 Navegação (`Nav.astro`)

```html
<nav class="nav">
  <div class="nav__inner">
    <a href="/" class="nav__logo">Arven</a>
    <ul class="nav__links" id="nav-links">
      <li><a href="/servicos">Serviços</a></li>
      <li><a href="/cases" class="nav__link--gradient">Resultados</a></li>
      <!-- … -->
    </ul>
    <a href="/qualificacao" class="nav__cta">Agendar call</a>
    <button class="nav__toggle" aria-controls="nav-links" aria-expanded="false">
      <span class="nav__toggle-bar"></span>
      <span class="nav__toggle-bar"></span>
      <span class="nav__toggle-bar"></span>
    </button>
  </div>
</nav>
```

**Comportamento:**
- Desktop: nav sticky no topo, links inline, CTA button à direita, hamburger oculto.
- Mobile (≤900px): links ocultos, hamburger visível. Ao clicar, adiciona `.nav--open` no `.nav` e o drawer anima para baixo.
- O drawer usa `position: fixed` com `top: var(--nav-offset)` e `height: calc(100dvh - var(--nav-offset))`. O offset é `calc(56px + env(safe-area-inset-top))` para respeitar notch em iOS.
- **Atenção:** `.nav` tem `backdrop-filter: blur(12px)`, o que cria um containing block CSS para filhos `position: fixed`. Por isso o drawer usa `top: 100%` + `height` em viewport units — não `inset`.
- Script de controle em `src/scripts/nav.ts`.

**Estados do link ativo:** `aria-current="page"` no `<a>` da página atual.

---

### 9.2 Botões (`.btn`)

```html
<!-- Primário -->
<a href="/qualificacao" class="btn btn--primary">Agendar call</a>

<!-- Ghost -->
<button class="btn btn--ghost">Ver mais</button>
```

| Variante | Background | Texto | Borda |
|----------|-----------|-------|-------|
| `btn--primary` | `--text-primary` | `--bg` | `--text-primary` |
| `btn--ghost` | transparente | `--text-secondary` | `--border` |
| `btn--light-primary` | `#0a0a0a` | `#f5f3ef` | `#0a0a0a` |
| `btn--light-secondary` | transparente | `#0a0a0a` | `rgba(0,0,0,0.2)` |
| `btn--light-ghost` | transparente | `rgba(0,0,0,0.55)` | transparente |

As variantes `light-*` são para uso sobre backgrounds claros (seção `.method--light`).

**Especificações base:**
```css
.btn {
  font-size: 13px;       /* 14px em mobile */
  font-weight: 500;
  padding: 10px 20px;    /* 13px 22px em mobile */
  border-radius: var(--radius-sm);
  min-height: 44px;      /* apenas em mobile, Apple HIG */
  touch-action: manipulation;
}
```

---

### 9.3 Hero (`.hero`)

Seção de abertura da homepage. Dois painéis: copy à esquerda + funil animado à direita.

```
.hero
  └── .hero__inner  (grid: 1fr | 232-300px)
        ├── .hero__lead    (col 1, row 1) — tag + headline + cta
        ├── .hero__viz     (col 2, row 1-2) — .hero-funnel
        └── .hero__rest    (col 1, row 2) — conteúdo adicional
```

**Headline animada:** Cada linha do título é um `<span class="hero__line">` que anima com `heroBlurInUp` (opacity + blur + translateY), com stagger de 0.12s entre linhas.

**Funil (`.hero-funnel`):** Lista de 5 steps que aparecem em sequência (delay 1.12s–1.60s). Cada step fica progressivamente mais estreito (`--funnel-w: 100% → 76%`) e mais azul-saturado.

**Fundo decorativo:**
```css
.hero::after {
  /* radial-gradient azul sutil no canto inferior esquerdo */
  background: radial-gradient(ellipse at center, rgba(96, 165, 250, 0.06) 0%, transparent 70%);
}
```

---

### 9.4 Page Hero (`.page-hero`)

Cabeçalho de páginas internas. Estrutura mais simples que o hero.

```html
<section class="page-hero page-hero--servicos">
  <p class="page-hero__tag">SERVIÇOS</p>
  <h1 class="page-hero__headline">Título da página</h1>
  <p class="page-hero__sub">Subtítulo explicativo</p>
</section>
```

**Modificadores:**
| Classe | Efeito |
|--------|--------|
| `page-hero--naked` | Sem borda/background/padding (texto puro) |
| `page-hero--compact` | Padding reduzido (40px) |
| `page-hero--servicos` | Layout 2 colunas: copy + visual |
| `page-hero--cases` | Layout 2 colunas: copy + visual |
| `page-hero--qualificacao` | Max-width ampliado no título |

---

### 9.5 Numbers Grid (`.numbers`)

Grid de 3 (desktop) ou 2 (tablet) colunas com métricas numéricas.

```html
<section class="numbers">
  <div class="numbers__grid">
    <div class="numbers__item">
      <span class="numbers__value">+120</span>
      <span class="numbers__label">clientes atendidos</span>
    </div>
  </div>
</section>
```

- Valor: `font-size: 26px; font-weight: 500; letter-spacing: -0.5px`
- Label: `font-size: 12px; color: var(--text-secondary)`
- Animação de contagem via JS (SSR-friendly: renderiza valor final, JS anima)

---

### 9.6 Method Steps (`.method`)

Seção de metodologia com cabeçalho + grid de passos.

```
.method
  ├── .method__head  — headline + sub + CTA button
  └── .method__steps (grid 4 cols desktop, 2 tablet, 1 mobile)
        └── .step
              ├── .step__num    (mono, tertiary — "01")
              ├── .step__title  (primary, 13px bold)
              └── .step__desc   (secondary, 12px)
```

**Variante clara (`.method--light`):** Usa CSS local vars `--ml-*` para sobrescrever cores, com `background: linear-gradient(135deg, #fff 0%, #e8eeff 55%, #dce6ff 100%)`. Requer botões com variantes `btn--light-*`.

---

### 9.7 Framework (`.framework`)

Diagrama hierárquico: focal value (resultado) → 4 pilares → 4 métricas.

```
.framework
  ├── .framework__head    — headline + sub
  ├── .framework__focal   — valor central com linha decorativa embaixo
  ├── .framework__pillars (grid 4 cols) — 4 pilares
  └── .framework__metrics (grid 4 cols) — 4 métricas derivadas
```

Cada `.framework__pillar` tem um pseudo-element `::before` (círculo de 5px) na borda superior, simulando nó de diagrama.

---

### 9.8 Service Cards (`.services__grid`)

Grid de 3 cards (desktop) ou 1 coluna (mobile) com serviços.

```html
<div class="services__grid">
  <article class="service-card">
    <p class="service-card__tag">SERVIÇO</p>
    <h2 class="service-card__headline">Nome do Serviço</h2>
    <p class="service-card__audience">Para quem é…</p>
    <ul class="service-card__steps">
      <li class="service-step">
        <span class="service-step__num">01</span>
        <span class="service-step__text">Descrição do passo</span>
      </li>
    </ul>
    <div class="service-card__cta">
      <a href="/qualificacao" class="btn btn--ghost">Saiba mais</a>
    </div>
  </article>
</div>
```

---

### 9.9 FAQ (`.faq`)

Accordion nativo com `<details>`/`<summary>`.

```html
<section class="faq">
  <div class="faq__inner">
    <div class="faq__head">
      <p class="faq__tag">FAQ</p>
      <h2 class="faq__headline">Perguntas frequentes</h2>
    </div>
    <ul class="faq__list">
      <details class="faq__item">
        <summary class="faq__q">Pergunta?</summary>
        <div class="faq__a"><p>Resposta.</p></div>
      </details>
    </ul>
  </div>
</section>
```

O indicador de abertura é um chevron CSS (`::after` com `border-right + border-bottom + rotate`). Sem JS necessário.

---

### 9.10 Blog Cards

**Dois layouts de card:**

1. **Featured** (`.blog-featured__card`) — imagem 16:9 full-width + título grande (20px) + excerpt 3 linhas
2. **Rest** (`.blog-rest__card`) — imagem 16:9 + título menor (15px) + excerpt 2 linhas

```
.blog-index
  ├── .blog-featured (grid 2 cols)
  │     └── .blog-featured__card × 2
  └── .blog-rest (grid 3 cols)
        └── .blog-rest__card × N
```

Hover: `background: var(--bg-raised)` + `transform: scale(1.03)` na imagem.

---

### 9.11 Case Detail (`.case-detail`)

Cards expandidos de caso de sucesso. Estrutura de seções aninhadas:

```
.case-detail
  ├── .case-detail__header   — logo do cliente + badges (segmento, resultado)
  ├── .case-detail__context  — texto narrativo + foto opcional
  ├── .case-detail__metrics  — grid de métricas do resultado
  └── .case-detail__spotlight — destaque de número / frase
```

---

### 9.12 CTA Final (`.cta-final`)

Seção de chamada para ação centrada, com borda gradiente opcional.

```css
/* Borda gradiente via padding-box / border-box */
.cta-final {
  border: 1px solid transparent;
  background:
    linear-gradient(var(--bg-surface) 0 0) padding-box,
    linear-gradient(var(--border) 0 0) border-box;
}
```

Aceita efeito de spotlight via JS (rastreamento de mouse em `.magic-card__spotlight`).

---

### 9.13 Lead Form (`.lead-form`)

Formulário de qualificação multi-step com layout de 2 colunas:

```
.lead-form-layout (grid 340px | 1fr)
  ├── .lead-form-aside   — ilustração SVG + copy de apoio
  └── .lead-form         — campos do formulário
```

O aside usa `border-radius: var(--radius-lg) 0 0 var(--radius-lg)` e o form `0 var(--radius-lg) var(--radius-lg) 0` para formar um único card visual.

---

### 9.14 Footer (`.footer`)

```
.footer
  ├── .footer__top (grid 280px | 1fr)
  │     ├── .footer__brand — logo + tagline
  │     └── .footer__cols  — colunas de links
  └── .footer__bottom
        └── .footer__legal — razão social + CNPJ + copyright
```

Labels de coluna: `font-mono, 10px, uppercase, letter-spacing: 0.12em, --text-tertiary`.

---

## 10. Animações

### 10.1 Keyframes Globais

| Nome | Efeito | Uso |
|------|--------|-----|
| `fadeUp` | `opacity 0→1 + translateY(12px→0)` | Sub-headlines, CTAs, page hero |
| `heroBlurInUp` | `opacity + blur(10px→0) + translateY(20px→0)` | Linhas do hero headline |
| `heroFunnelStep` | `opacity + translateY(14px→0) + blur(6px→0)` | Steps do funil hero |
| `nav-gradient-text` | `background-position` animada 300% | Gradient no link "Resultados" |
| `signalBlink` | `opacity + r` (SVG circle) | Antena no SVG do form |
| `vslLoadBar` | `background-position` shimmer | Buffer bar do vídeo |
| `orbit-magic` | `rotate + translateY + rotate-reverse` | Orbit nodes em página Serviços |

### 10.2 Scroll Reveal

Elementos com `data-reveal` ou filhos de `[data-reveal-stagger]` com `data-reveal-item` começam com `opacity: 0` e são animados por GSAP (via `src/scripts/reveal.ts`).

```html
<div data-reveal>Anima ao entrar na viewport</div>

<ul data-reveal-stagger>
  <li data-reveal-item>Item 1</li>
  <li data-reveal-item>Item 2</li>
</ul>
```

**Importante:** `prefers-reduced-motion: reduce` desativa todas as animações e reseta `opacity: 1 !important`.

### 10.3 Durações e Easings Padrão

| Uso | Duração | Easing |
|-----|---------|--------|
| Hover de card/botão | `0.15s` | `ease` ou `linear` |
| Hero lines | `0.85s` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Funnel steps | `0.55s` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| fadeUp geral | `0.5–0.55s` | `ease` |
| Nav drawer | `0.22s` | `ease` |
| Imagem hover (scale) | `0.3s` | `ease` |

---

## 11. Responsividade

### Breakpoints

```css
@media (max-width: 900px)  { /* tablet/mobile: colapsa grids principais */ }
@media (max-width: 768px)  { /* mobile: botões 44px, oculta .br-md */ }
@media (max-width: 640px)  { /* mobile pequeno: ajustes de padding/texto */ }
@media (max-width: 480px)  { /* very small: footer legal */ }
@media (prefers-reduced-motion: reduce) { /* sem animação */ }
@media (hover: none)       { /* touch devices: controls de vídeo visíveis */ }
```

### Padrões Responsivos por Componente

| Componente | Desktop | ≤900px | ≤640px |
|------------|---------|--------|--------|
| Hero | 2 col (copy + funil) | 1 col stacked | — |
| Numbers | 3 col | 2 col | 1 col |
| Method steps | 4 col | 2 col | 1 col |
| Framework pillars | 4 col | 2 col | 1 col |
| Services | 3 col | 1 col | — |
| Blog featured | 2 col | 1 col | — |
| Blog rest | 3 col | 1 col | — |
| Lead form | 340px aside + 1fr | 1 col stacked | — |
| Footer | 280px brand + cols | 1 col | — |
| Nav | links inline | drawer (hamburguer) | — |

### Mobile Nav Drawer

O nav drawer no mobile usa:
- `position: fixed`
- `top: var(--nav-offset)` onde `--nav-offset: calc(56px + env(safe-area-inset-top))`
- `height: calc(100dvh - var(--nav-offset))` — `dvh` para Dynamic Viewport Height (evita bug de barra de endereço mobile)
- Overflow-y: auto para scroll interno se necessário
- Scroll lock no `<html>` (`overflow: hidden`) enquanto aberto

---

## 12. Acessibilidade

### Padrões obrigatórios

- **Touch targets:** Mínimo `44px × 44px` em mobile (Apple HIG). Botões usam `min-height: 44px` e `touch-action: manipulation`.
- **Focus visible:** Todos os elementos interativos têm `:focus-visible` com `box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--border-hover)` (anel duplo: cor do fundo + cor de destaque).
- **Screen reader:** Elementos decorativos têm `aria-hidden="true"`. Headlines com animação por linha usam `<span class="sr-only">` com o texto completo + `aria-hidden="true"` no bloco animado.
- **Reduced motion:** Todas as animações CSS e JS respeitam `prefers-reduced-motion: reduce`.
- **Semantic HTML:** `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<details>`/`<summary>` usados corretamente.
- **ARIA nav:** `aria-controls`, `aria-expanded`, `aria-label` no botão hamburguer; `aria-current="page"` no link ativo.
- **Landmark único:** Apenas um `<main>` por página.

### Classe utilitária `.sr-only`

```css
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## 13. Convenções de Nomenclatura

O projeto usa **BEM** (Block Element Modifier) com algumas simplificações:

```
.block                  → componente raiz
.block__element         → parte interna do componente
.block--modifier        → variação do bloco
.block__element--state  → estado do elemento
```

**Exemplos:**
```css
.hero           /* bloco */
.hero__headline /* elemento */
.hero--compact  /* modificador */

.btn            /* bloco */
.btn--primary   /* modificador */
.btn--ghost     /* modificador */

.nav            /* bloco */
.nav__links     /* elemento */
.nav--open      /* modificador (estado JS) */
```

**Modificadores de estado adicionados por JS:**
- `.nav--open` — nav mobile aberto
- `.vsl-started` — vídeo iniciado
- `.is-playing` — vídeo em reprodução
- `.is-hidden` — overlay oculto

---

## 14. Modo Claro (Light Variant)

O sistema é **dark por padrão** e não tem modo claro global. Existe apenas a variante de seção `.method--light`, que usa CSS vars locais prefixadas `--ml-*`:

```css
.method--light {
  --ml-bg: #fafaf8;
  --ml-surface: #ffffff;
  --ml-surface-hover: #f2f1ee;
  --ml-border: rgba(10, 10, 10, 0.08);
  --ml-border-outer: rgba(10, 10, 10, 0.12);
  --ml-text: #0a0a0a;
  --ml-muted: #4a4845;
  --ml-subtle: #6b6863;

  background: linear-gradient(135deg, #ffffff 0%, #e8eeff 55%, #dce6ff 100%);
}
```

Para criar uma nova seção com tema claro, siga o mesmo padrão: defina vars locais no modificador e use-as nos filhos. Não altere os tokens globais de `:root`.

---

## Referência Rápida de Tokens

```css
/* Copie e cole onde precisar referenciar o design system */

/* Backgrounds */
--bg: #0a0a0a
--bg-surface: #111111
--bg-raised: #161616

/* Texto */
--text-primary: #f0ede8
--text-secondary: #a8a4a0
--text-tertiary: #6b6763

/* Bordas */
--border: rgba(255,255,255,0.08)
--border-hover: rgba(255,255,255,0.15)

/* Accent */
--accent: #e8e0d0
--accent-dim: rgba(232,224,208,0.06)

/* Status */
--green: #1a3a2a    --green-text: #4ade80
--blue: #0f1f3a     --blue-text: #60a5fa

/* Tipografia */
--font-sans: 'Geist', -apple-system, sans-serif
--font-mono: 'Geist Mono', monospace

/* Espaço / Layout */
--max-w: 1320px
--section-gap: 32px

/* Raio */
--radius-sm: 6px
--radius-md: 10px
--radius-lg: 14px
```
