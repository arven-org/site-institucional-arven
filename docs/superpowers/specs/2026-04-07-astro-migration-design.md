# Migração para Astro — Design Spec

**Data:** 2026-04-07
**Status:** Aprovado

---

## Contexto

O site institucional da Arven é composto por 7 páginas HTML estáticas, 1 CSS global (~2500 linhas), 6 arquivos JS vanilla e uma API serverless Vercel (`api/lead.js`). O blog usa Sanity Studio como CMS.

O problema: qualquer mudança em nav ou footer exige editar todos os arquivos HTML. A migração para Astro resolve isso com componentes reutilizáveis, mantendo output HTML estático e zero JS desnecessário no browser.

---

## Decisões

| Aspecto | Decisão |
|---|---|
| Framework | Astro puro (vanilla JS + TypeScript) |
| Output | `hybrid` — páginas estáticas por padrão, SSR onde necessário |
| CSS | tokens.css + global.css + `<style>` scoped por componente |
| Scripts | `src/scripts/` importados via `<script>` Astro (Vite processa) |
| Blog | SSR com `@sanity/client` (project ID: `8b9xqel2`, dataset: `production`) |
| API | `src/pages/api/lead.ts` (migrado de `api/lead.js`) |
| Deploy | Vercel com `@astrojs/vercel` adapter |

---

## Estrutura de pastas

```
src/
├── components/
│   ├── Head.astro              ← <head>: meta, fonts, favicon, theme-color
│   ├── Nav.astro               ← navbar com aria-current dinâmico via prop
│   └── Footer.astro            ← footer
├── layouts/
│   └── Base.astro              ← Head + Nav + <slot /> + Footer
├── pages/
│   ├── index.astro             ← estática
│   ├── servicos.astro          ← estática
│   ├── cases.astro             ← estática
│   ├── sobre.astro             ← estática
│   ├── qualificacao.astro      ← estática
│   ├── templates.astro         ← estática
│   ├── blog/
│   │   ├── index.astro         ← SSR (lista posts do Sanity)
│   │   └── [slug].astro        ← SSR (post individual do Sanity)
│   └── api/
│       └── lead.ts             ← SSR (migrado de api/lead.js)
├── scripts/
│   ├── nav.ts                  ← migrado de js/nav.js
│   ├── lead-form.ts            ← migrado de js/lead-form.js
│   ├── vsl-player.ts           ← migrado de js/vsl-player.js
│   ├── icon-cloud.ts           ← migrado de js/icon-cloud.js
│   ├── templates-page.ts       ← migrado de js/templates-page.js
│   └── arven-tokens-data.ts    ← migrado de js/arven-tokens-data.js
├── lib/
│   └── sanity.ts               ← sanity client + helpers de query
└── styles/
    ├── tokens.css              ← CSS custom properties (fonte única do DS)
    ├── global.css              ← reset, base, utilitários, @keyframes
    └── [scoped via <style> em cada componente .astro]

public/
└── assets/                     ← movido de assets/ (imagens, vídeo, SVGs, logo)
```

---

## Layout base

`Base.astro` aceita props tipadas e serve como wrapper de todas as páginas:

```astro
---
interface Props {
  title: string;
  description: string;
  currentPage: 'index' | 'servicos' | 'cases' | 'sobre' | 'qualificacao' | 'templates';
}
const { title, description, currentPage } = Astro.props;
---
<html lang="pt-BR">
  <Head {title} {description} />
  <body>
    <Nav {currentPage} />
    <main><slot /></main>
    <Footer {currentPage} />
  </body>
</html>
```

Cada página contém apenas o conteúdo único (o `<main>` atual), sem repetir `<html>`, `<head>`, nav ou footer.

---

## CSS — Arquitetura em 3 camadas

### `tokens.css`
Fonte única de verdade do Design System. Contém exclusivamente CSS custom properties:
- Cores: `--bg`, `--bg-surface`, `--bg-raised`, `--text-primary`, `--text-secondary`, `--text-tertiary`
- Bordas: `--border`, `--border-hover`
- Tipografia: `--font-sans`, `--font-mono`
- Espaçamento: `--section-gap`, `--max-w`
- Raios: `--radius-sm`, `--radius-md`, `--radius-lg`
- Tokens de marca: `--green`, `--green-text`, `--blue`, `--blue-text`

### `global.css`
Importa `tokens.css`. Contém: reset, estilos de `body`/`html`, classes utilitárias (`.sr-only`, `.btn`), animações `@keyframes`, estilos verdadeiramente globais.

### Scoped por componente
Estilos específicos de cada componente/seção ficam em `<style>` dentro do `.astro` correspondente. Usa `var(--token)` para referenciar os tokens.

---

## Scripts

Cada script JS é movido para `src/scripts/` e importado no componente Astro que o usa via `<script>`:

| Script | Usado em |
|---|---|
| `nav.ts` | `Nav.astro` |
| `lead-form.ts` | `pages/qualificacao.astro` |
| `vsl-player.ts` | `pages/index.astro` |
| `icon-cloud.ts` | `pages/index.astro` |
| `templates-page.ts` | `pages/templates.astro` |
| `arven-tokens-data.ts` | `pages/index.astro` (ou onde usado) |

O Vite (embutido no Astro) faz bundling, tree-shaking e deduplicação automaticamente.

---

## Blog + Sanity

**`src/lib/sanity.ts`:**
```ts
import { createClient } from '@sanity/client';

export const sanity = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
});
```

**`pages/blog/index.astro`** — lista posts ordenados por data, SSR.

**`pages/blog/[slug].astro`** — post individual por slug, SSR. Retorna 404 se não encontrado.

As queries GROQ são ajustadas conforme o schema real do Sanity Studio existente.

---

## API endpoint

**`src/pages/api/lead.ts`** migra toda a lógica de `api/lead.js`:
- Validação de campos obrigatórios
- Validação de e-mail e WhatsApp
- Honeypot anti-spam
- Repasse para `LEAD_WEBHOOK_URL`
- Mesmos status codes e respostas JSON

```ts
export const prerender = false;

export async function POST({ request }: APIContext) {
  // lógica migrada de api/lead.js
  // usa import.meta.env.LEAD_WEBHOOK_URL
}
```

O arquivo `api/lead.js` é deletado após a migração.

---

## Vercel config

O `vercel.json` simplifica: rewrites e redirects de `.html` são removidos (Astro gera URLs limpas nativamente). Permanecem apenas os headers de segurança e cache de assets:

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

---

## Build config

**`astro.config.mjs`:**
```js
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'hybrid',
  adapter: vercel(),
  site: 'https://arven.com.br',
});
```

**Novas dependências:**
- `astro`
- `@astrojs/vercel`
- `@sanity/client`

**Scripts `package.json`:**
```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview"
}
```

**`.gitignore` — adicionar:**
```
dist/
.astro/
```

---

## Variáveis de ambiente

Arquivo `.env` (gitignored):
```
SANITY_PROJECT_ID=8b9xqel2
SANITY_DATASET=production
LEAD_WEBHOOK_URL=<webhook n8n>
```

As mesmas variáveis devem estar configuradas no painel Vercel (Settings → Environment Variables).

---

## O que NÃO muda

- Todo o HTML/CSS visual — nenhum componente é redesenhado
- O `styles.css` atual é a base do `global.css` + `tokens.css`
- Os scripts JS são migrados sem reescrita lógica (renomeados para `.ts`)
- O `api/lead.js` é migrado sem reescrita lógica
- O deploy continua no Vercel
- A URL do site não muda
