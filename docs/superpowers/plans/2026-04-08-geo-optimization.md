# GEO Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all GEO audit quick wins and medium-term fixes to raise the composite GEO score from 28/100 to ~55-65/100 by adding structured data, crawlability signals, meta tags, llms.txt, and content improvements.

**Architecture:** All changes are in Astro components (Head.astro, Base.astro, page files) and static files (public/). Schema markup uses JSON-LD injected via Astro components. Sitemap uses the official @astrojs/sitemap integration. No new runtime dependencies beyond the sitemap integration.

**Tech Stack:** Astro 6, @astrojs/sitemap, JSON-LD (inline `<script type="application/ld+json">`), static files in `public/`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `astro.config.mjs` | Modify | Fix site URL, add sitemap integration |
| `public/robots.txt` | Create | Allow all crawlers, point to sitemap |
| `public/llms.txt` | Create | LLM-readable site summary |
| `src/components/Head.astro` | Modify | Add canonical, OG tags, Twitter Cards, Organization JSON-LD |
| `src/components/SchemaOrg.astro` | Create | Reusable Organization JSON-LD component |
| `src/components/SchemaFAQ.astro` | Create | FAQPage JSON-LD component |
| `src/components/SchemaService.astro` | Create | Service JSON-LD component |
| `src/components/SchemaBlogPosting.astro` | Create | BlogPosting JSON-LD component |
| `src/components/SchemaBreadcrumb.astro` | Create | BreadcrumbList JSON-LD component |
| `src/layouts/Base.astro` | Modify | Accept og:image prop, wire schema slots |
| `src/pages/index.astro` | Modify | Add FAQPage schema, unique description |
| `src/pages/servicos.astro` | Modify | Add Service schema, unique description |
| `src/pages/cases.astro` | Modify | Unique description |
| `src/pages/sobre.astro` | Modify | Unique description |
| `src/pages/qualificacao.astro` | Modify | Unique description |
| `src/pages/blog/index.astro` | Modify | Unique description |
| `src/pages/blog/[slug].astro` | Modify | Add BlogPosting + Breadcrumb schema |

---

## Task 1: Fix site URL in astro.config.mjs

**Files:**
- Modify: `astro.config.mjs`

The `site` property is set to `https://arven.com.br` but production is `https://www.arvenoficial.com`. This breaks all Astro-generated URLs (sitemaps, canonical tags, og:url).

- [ ] **Step 1: Update the site URL**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  adapter: vercel(),
  site: 'https://www.arvenoficial.com',
  integrations: [sitemap()],
});
```

- [ ] **Step 2: Install @astrojs/sitemap**

Run: `npm install @astrojs/sitemap`

- [ ] **Step 3: Verify the build works**

Run: `npm run build`
Expected: Build succeeds. A `sitemap-index.xml` and `sitemap-0.xml` are generated in `dist/`.

- [ ] **Step 4: Commit**

```bash
git add astro.config.mjs package.json package-lock.json
git commit -m "fix(config): correct site URL and add sitemap integration

Site was pointing to arven.com.br but production is arvenoficial.com.
Added @astrojs/sitemap for automatic sitemap generation.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Create robots.txt

**Files:**
- Create: `public/robots.txt`

Currently no robots.txt exists. AI crawlers can access everything but can't discover the sitemap.

- [ ] **Step 1: Create the robots.txt file**

```
# public/robots.txt
User-agent: *
Allow: /

# AI Crawlers — explicitly welcomed
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://www.arvenoficial.com/sitemap-index.xml
```

- [ ] **Step 2: Verify the file is served**

Run: `npm run build && ls dist/robots.txt`
Expected: File exists in build output.

- [ ] **Step 3: Commit**

```bash
git add public/robots.txt
git commit -m "feat(seo): add robots.txt with sitemap directive and AI crawler rules

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Create llms.txt

**Files:**
- Create: `public/llms.txt`

The llms.txt standard helps LLMs understand your site structure. Currently missing.

- [ ] **Step 1: Create the llms.txt file**

```markdown
# Arven

> Assessoria de aquisicao B2B. Estruturamos a operacao que conecta investimento em midia a contrato fechado para empresas B2B no Brasil.

## Servicos
- [Gestao de Midia e Performance](https://www.arvenoficial.com/servicos): Campanhas em todas as fontes de trafego, otimizadas por receita gerada. Rastreamento end-to-end do clique ao contrato.
- [Automacao e Qualificacao com IA](https://www.arvenoficial.com/servicos): Qualificacao automatizada de leads 24/7 com IA. Leads entregues ao comercial com contexto e score.
- [Estrutura Comercial](https://www.arvenoficial.com/servicos): Processo comercial com CRM, playbooks, dashboards e coaching de pipeline.

## Resultados
- [Cases de Sucesso](https://www.arvenoficial.com/cases): EAG (CAC -75%, de R$930 para R$234), QuartaVia (ROAS 6.6x, R$40M em 2024), CSC Advogados (ROAS 7x, <R$25/lead qualificado)

## Sobre
- [A Arven](https://www.arvenoficial.com/sobre): R$10M+ geridos mensalmente em midia paga, 50+ operacoes de aquisicao ativas, R$40M+ em midia gerenciada ao longo da carreira

## Blog
- [Blog](https://www.arvenoficial.com/blog): Artigos sobre aquisicao B2B, geracao de demanda, qualificacao de leads e processo comercial

## Contato
- [Qualificacao](https://www.arvenoficial.com/qualificacao): Formulario de qualificacao para diagnostico gratuito da operacao de aquisicao
```

- [ ] **Step 2: Verify the file is served**

Run: `npm run build && ls dist/llms.txt`
Expected: File exists in build output.

- [ ] **Step 3: Commit**

```bash
git add public/llms.txt
git commit -m "feat(geo): add llms.txt for AI search engine discoverability

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Add canonical tags, complete OG tags, and Twitter Cards to Head.astro

**Files:**
- Modify: `src/components/Head.astro`
- Modify: `src/layouts/Base.astro`

Currently Head.astro has basic og:title and og:description but is missing: canonical URL, og:url, og:type, og:image, og:locale, Twitter Card tags.

- [ ] **Step 1: Update the Head.astro Props interface and add all meta tags**

The component needs to accept `currentPath` (for canonical), `ogImage` (optional), and `ogType` (optional).

```astro
---
// src/components/Head.astro
interface Props {
  title: string;
  description: string;
  currentPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
}
const { title, description, currentPath, ogImage, ogType = 'website' } = Astro.props;

const siteUrl = 'https://www.arvenoficial.com';
const canonicalUrl = currentPath ? `${siteUrl}${currentPath}` : siteUrl;
const imageUrl = ogImage ?? `${siteUrl}/assets/logo.svg`;
---
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalUrl} />

<!-- Open Graph -->
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonicalUrl} />
<meta property="og:type" content={ogType} />
<meta property="og:image" content={imageUrl} />
<meta property="og:locale" content="pt_BR" />
<meta property="og:site_name" content="Arven" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={imageUrl} />

<meta name="theme-color" content="#0a0a0a" />
<link rel="icon" href="/assets/logo.svg" type="image/svg+xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 2: Update Base.astro to pass currentPath and new props to Head**

```astro
---
// src/layouts/Base.astro
import Head from '../components/Head.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  currentPage?: 'index' | 'servicos' | 'cases' | 'sobre' | 'qualificacao' | 'templates' | 'blog';
  ogImage?: string;
  ogType?: 'website' | 'article';
}
const { title, description, currentPage, ogImage, ogType } = Astro.props;
const currentPath = Astro.url.pathname;
---
<html lang="pt-BR">
  <head>
    <Head title={title} description={description} currentPath={currentPath} ogImage={ogImage} ogType={ogType} />
    <slot name="head" />
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

Note: We added `<slot name="head" />` inside `<head>` so pages can inject JSON-LD schemas into the head.

- [ ] **Step 3: Verify the build works**

Run: `npm run build`
Expected: Build succeeds. Check `dist/index.html` contains `<link rel="canonical"`, `og:url`, `og:type`, `og:image`, `twitter:card`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Head.astro src/layouts/Base.astro
git commit -m "feat(seo): add canonical tags, complete OG tags, and Twitter Cards

Adds canonical URL, og:url, og:type, og:image, og:locale, og:site_name,
and Twitter Card meta tags to all pages via Head.astro.
Adds head slot to Base.astro for JSON-LD injection.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Add Organization JSON-LD schema

**Files:**
- Create: `src/components/SchemaOrg.astro`
- Modify: `src/layouts/Base.astro`

No structured data exists anywhere on the site. Organization schema is the most critical — it tells AI models who "Arven" is and disambiguates from the Pokemon character.

- [ ] **Step 1: Create the SchemaOrg component**

```astro
---
// src/components/SchemaOrg.astro
// Organization schema — rendered on every page via Base.astro
const schema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Arven",
  "legalName": "ARVEN CONSULTORIA TECNOLOGIA & OUTSOURCING",
  "url": "https://www.arvenoficial.com",
  "logo": "https://www.arvenoficial.com/assets/logo.svg",
  "description": "Assessoria de aquisição B2B. Estruturamos a operação que conecta investimento em mídia a contrato fechado para empresas B2B no Brasil.",
  "foundingDate": "2024",
  "taxID": "65.183.229/0001-54",
  "areaServed": {
    "@type": "Country",
    "name": "Brazil"
  },
  "knowsLanguage": "pt-BR",
  "sameAs": [
    "https://www.instagram.com/arvensolutions/",
    "https://www.linkedin.com/company/arvenaquisicao"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "sales",
    "url": "https://www.arvenoficial.com/qualificacao",
    "availableLanguage": "Portuguese"
  },
  "makesOffer": [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Gestão de Mídia e Performance",
        "description": "Campanhas em todas as fontes de tráfego, otimizadas por receita gerada. Rastreamento end-to-end do clique ao contrato."
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Automação e Qualificação com IA",
        "description": "Qualificação automatizada de leads 24/7 com IA. Leads entregues ao comercial com contexto completo e score de prontidão."
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Estrutura Comercial",
        "description": "Processo comercial com CRM, playbooks, dashboards de gestão e coaching de pipeline."
      }
    }
  ]
};
---
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

- [ ] **Step 2: Import and render SchemaOrg in Base.astro**

Add to the `<head>` section of Base.astro, before the `<slot name="head" />`:

```astro
<head>
    <Head title={title} description={description} currentPath={currentPath} ogImage={ogImage} ogType={ogType} />
    <SchemaOrg />
    <slot name="head" />
</head>
```

Add the import at the top:
```astro
import SchemaOrg from '../components/SchemaOrg.astro';
```

- [ ] **Step 3: Verify the build works**

Run: `npm run build`
Expected: Build succeeds. Check `dist/index.html` contains `<script type="application/ld+json">` with `"@type": "Organization"`.

- [ ] **Step 4: Commit**

```bash
git add src/components/SchemaOrg.astro src/layouts/Base.astro
git commit -m "feat(schema): add Organization JSON-LD to all pages

Adds Organization schema with CNPJ, sameAs (Instagram, LinkedIn),
services, contact point, and area served. Helps AI models disambiguate
'Arven' from other entities (Pokemon character, etc).

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Add FAQPage JSON-LD schema to homepage

**Files:**
- Create: `src/components/SchemaFAQ.astro`
- Modify: `src/pages/index.astro`

The homepage has 6 FAQ pairs in `<details>` elements but no FAQPage schema markup.

- [ ] **Step 1: Create the SchemaFAQ component**

```astro
---
// src/components/SchemaFAQ.astro
interface Props {
  faqs: { question: string; answer: string }[];
}
const { faqs } = Astro.props;

const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
};
---
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

- [ ] **Step 2: Add the FAQPage schema to index.astro**

Add this import at the top of the frontmatter:
```astro
import SchemaFAQ from '../components/SchemaFAQ.astro';
```

Then add the component inside a `<Fragment slot="head">` block, placed right before the closing `</Base>` tag (but inside it). The FAQs are hardcoded since they're static content:

```astro
<Fragment slot="head">
  <SchemaFAQ faqs={[
    {
      question: "O que é assessoria de aquisição?",
      answer: "É a operação que une estratégia, mídia paga, funil, CRM e dados para gerar demanda qualificada e entregar leads prontos para o seu time comercial fechar. Do primeiro clique ao agendamento, com uma visão única da operação."
    },
    {
      question: "Para quem a Arven faz sentido?",
      answer: "Negócios B2B e de ticket médio alto: consultoria, educação, serviços profissionais, SaaS e empresas que dependem de reuniões ou propostas para vender. Se a aquisição é o gargalo do crescimento, costumamos ser um bom encaixe."
    },
    {
      question: "Como funciona o diagnóstico gratuito?",
      answer: "Você entra em contato, alinhamos contexto e analisamos sua operação atual: público, funil, canais e números. Você sai com clareza sobre onde está o gargalo e o que faria sentido atacar primeiro, sem compromisso de contratar."
    },
    {
      question: "Vocês cuidam só de anúncios ou do funil inteiro?",
      answer: "Do funil inteiro: campanhas, páginas, automações, integração com CRM, qualificação e ritmo com o comercial quando o projeto pede. Não somos só gestão de tráfego isolada. Desenhamos e operamos a máquina de demanda como um sistema."
    },
    {
      question: "E se eu já tiver time de marketing ou agência?",
      answer: "Podemos assumir a operação ponta a ponta ou complementar onde falta profundidade (dados, funil, integração com vendas). O diagnóstico mostra o que já está maduro e onde a Arven entrega mais alavancagem."
    },
    {
      question: "Como funciona investimento e contrato?",
      answer: "O modelo e o valor dependem do escopo da operação e do estágio do negócio. Isso só dá para cravar depois do diagnóstico. Em geral trabalhamos com retainer de assessoria; mídia é budget à parte, transparente e sob sua conta."
    }
  ]} />
</Fragment>
```

- [ ] **Step 3: Verify the build works**

Run: `npm run build`
Expected: Build succeeds. Check `dist/index.html` contains `"@type": "FAQPage"` with 6 questions.

- [ ] **Step 4: Commit**

```bash
git add src/components/SchemaFAQ.astro src/pages/index.astro
git commit -m "feat(schema): add FAQPage JSON-LD to homepage

Marks up the 6 existing FAQ pairs with FAQPage schema for
Google AI Overviews, ChatGPT, and Gemini rich results.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Add Service JSON-LD schema to /servicos

**Files:**
- Create: `src/components/SchemaService.astro`
- Modify: `src/pages/servicos.astro`

Three services are described on /servicos but have no machine-readable markup.

- [ ] **Step 1: Create the SchemaService component**

```astro
---
// src/components/SchemaService.astro
interface ServiceDef {
  name: string;
  description: string;
  provider?: string;
  areaServed?: string;
  url?: string;
}
interface Props {
  services: ServiceDef[];
}
const { services } = Astro.props;

const schemas = services.map(svc => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": svc.name,
  "description": svc.description,
  "provider": {
    "@type": "Organization",
    "name": svc.provider ?? "Arven",
    "url": "https://www.arvenoficial.com"
  },
  "areaServed": {
    "@type": "Country",
    "name": svc.areaServed ?? "Brazil"
  },
  "url": svc.url ?? "https://www.arvenoficial.com/servicos"
}));
---
{schemas.map(schema => (
  <script type="application/ld+json" set:html={JSON.stringify(schema)} />
))}
```

- [ ] **Step 2: Add Service schema to servicos.astro**

Add import at the top of the frontmatter:
```astro
import SchemaService from '../components/SchemaService.astro';
```

Add `<Fragment slot="head">` before closing `</Base>`:
```astro
<Fragment slot="head">
  <SchemaService services={[
    {
      name: "Gestao de Midia e Performance",
      description: "Campanhas em todas as fontes de trafego, otimizadas por receita gerada. Rastreamento end-to-end do clique ao contrato assinado. Reports semanais com visao completa: investimento, leads, reunioes agendadas e contratos fechados."
    },
    {
      name: "Automacao e Qualificacao com IA",
      description: "Qualificacao automatizada de leads 24/7 com IA. Mapeamento de criterios de lead pronto para o comercial. Leads entregues com contexto completo, historico de interacao e score de prontidao."
    },
    {
      name: "Estrutura Comercial",
      description: "Diagnostico e implementacao do processo comercial com CRM, playbooks e dashboards de gestao. Acompanhamento continuo com rituais de gestao, coaching de pipeline e otimizacao de conversao."
    }
  ]} />
</Fragment>
```

- [ ] **Step 3: Verify the build works**

Run: `npm run build`
Expected: Build succeeds. Check `dist/servicos/index.html` contains three `"@type": "Service"` blocks.

- [ ] **Step 4: Commit**

```bash
git add src/components/SchemaService.astro src/pages/servicos.astro
git commit -m "feat(schema): add Service JSON-LD to /servicos

Marks up 3 service offerings with Service schema for AI discoverability.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Add BlogPosting JSON-LD schema to blog posts

**Files:**
- Create: `src/components/SchemaBlogPosting.astro`
- Modify: `src/pages/blog/[slug].astro`

Blog posts from Sanity have no structured data. BlogPosting schema is high-impact for AI search.

- [ ] **Step 1: Create the SchemaBlogPosting component**

```astro
---
// src/components/SchemaBlogPosting.astro
interface Props {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  author?: string;
  image?: string;
}
const { title, description, url, datePublished, author, image } = Astro.props;

const schema: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": title,
  "description": description,
  "url": url,
  "datePublished": datePublished,
  "publisher": {
    "@type": "Organization",
    "name": "Arven",
    "url": "https://www.arvenoficial.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.arvenoficial.com/assets/logo.svg"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": url
  }
};

if (author) {
  schema.author = { "@type": "Person", "name": author };
} else {
  schema.author = { "@type": "Organization", "name": "Arven" };
}

if (image) {
  schema.image = image;
}
---
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

- [ ] **Step 2: Add BlogPosting schema to [slug].astro**

Add import at the top of the frontmatter (after existing imports):
```astro
import SchemaBlogPosting from '../../components/SchemaBlogPosting.astro';
```

Add `<Fragment slot="head">` inside the `<Base>` component (before closing `</Base>`):
```astro
<Fragment slot="head">
  <SchemaBlogPosting
    title={post.title}
    description={post.excerpt ?? 'Leia este artigo no blog da Arven.'}
    url={`https://www.arvenoficial.com/blog/${post.slug.current}`}
    datePublished={post.publishedAt}
    author={post.author}
    image={post.image?.url ? `${post.image.url}?w=1200&fm=webp` : undefined}
  />
</Fragment>
```

Also update the `<Base>` tag to pass `ogType="article"` and the image:
```astro
<Base
  title={`${post.title} — Arven`}
  description={post.excerpt ?? 'Leia este artigo no blog da Arven.'}
  currentPage="blog"
  ogType="article"
  ogImage={post.image?.url ? `${post.image.url}?w=1200&fm=webp` : undefined}
>
```

- [ ] **Step 3: Verify the build works**

Run: `npm run build`
Expected: Build succeeds. Blog posts are SSR (prerender=false) so we can't check dist directly, but there should be no build errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/SchemaBlogPosting.astro src/pages/blog/\[slug\].astro
git commit -m "feat(schema): add BlogPosting JSON-LD to blog posts

Dynamic schema from Sanity data: headline, datePublished, author, image.
Also passes ogType=article and ogImage to Head.astro for social sharing.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 9: Add BreadcrumbList JSON-LD to inner pages

**Files:**
- Create: `src/components/SchemaBreadcrumb.astro`
- Modify: `src/pages/servicos.astro`
- Modify: `src/pages/cases.astro`
- Modify: `src/pages/sobre.astro`
- Modify: `src/pages/qualificacao.astro`
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/blog/[slug].astro`

BreadcrumbList schema helps AI understand site hierarchy.

- [ ] **Step 1: Create the SchemaBreadcrumb component**

```astro
---
// src/components/SchemaBreadcrumb.astro
interface BreadcrumbItem {
  name: string;
  url: string;
}
interface Props {
  items: BreadcrumbItem[];
}
const { items } = Astro.props;

const schema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": item.name,
    "item": item.url
  }))
};
---
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

- [ ] **Step 2: Add breadcrumbs to servicos.astro**

Add import:
```astro
import SchemaBreadcrumb from '../components/SchemaBreadcrumb.astro';
```

Update existing `<Fragment slot="head">` (or add one if merging with Service schema from Task 7):
```astro
<Fragment slot="head">
  <SchemaService services={[...]} />
  <SchemaBreadcrumb items={[
    { name: "Arven", url: "https://www.arvenoficial.com/" },
    { name: "Servicos", url: "https://www.arvenoficial.com/servicos" }
  ]} />
</Fragment>
```

- [ ] **Step 3: Add breadcrumbs to cases.astro**

Add import:
```astro
import SchemaBreadcrumb from '../components/SchemaBreadcrumb.astro';
```

Add before closing `</Base>`:
```astro
<Fragment slot="head">
  <SchemaBreadcrumb items={[
    { name: "Arven", url: "https://www.arvenoficial.com/" },
    { name: "Resultados", url: "https://www.arvenoficial.com/cases" }
  ]} />
</Fragment>
```

- [ ] **Step 4: Add breadcrumbs to sobre.astro**

Add import:
```astro
import SchemaBreadcrumb from '../components/SchemaBreadcrumb.astro';
```

Add before closing `</Base>`:
```astro
<Fragment slot="head">
  <SchemaBreadcrumb items={[
    { name: "Arven", url: "https://www.arvenoficial.com/" },
    { name: "Sobre", url: "https://www.arvenoficial.com/sobre" }
  ]} />
</Fragment>
```

- [ ] **Step 5: Add breadcrumbs to qualificacao.astro**

Add import:
```astro
import SchemaBreadcrumb from '../components/SchemaBreadcrumb.astro';
```

Add before closing `</Base>`:
```astro
<Fragment slot="head">
  <SchemaBreadcrumb items={[
    { name: "Arven", url: "https://www.arvenoficial.com/" },
    { name: "Qualificacao", url: "https://www.arvenoficial.com/qualificacao" }
  ]} />
</Fragment>
```

- [ ] **Step 6: Add breadcrumbs to blog/index.astro**

Add import:
```astro
import SchemaBreadcrumb from '../../components/SchemaBreadcrumb.astro';
```

Add before closing `</Base>`:
```astro
<Fragment slot="head">
  <SchemaBreadcrumb items={[
    { name: "Arven", url: "https://www.arvenoficial.com/" },
    { name: "Blog", url: "https://www.arvenoficial.com/blog" }
  ]} />
</Fragment>
```

- [ ] **Step 7: Add breadcrumbs to blog/[slug].astro**

Update existing `<Fragment slot="head">` to include breadcrumbs:
```astro
<Fragment slot="head">
  <SchemaBlogPosting ... />
  <SchemaBreadcrumb items={[
    { name: "Arven", url: "https://www.arvenoficial.com/" },
    { name: "Blog", url: "https://www.arvenoficial.com/blog" },
    { name: post.title, url: `https://www.arvenoficial.com/blog/${post.slug.current}` }
  ]} />
</Fragment>
```

- [ ] **Step 8: Verify the build works**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 9: Commit**

```bash
git add src/components/SchemaBreadcrumb.astro src/pages/servicos.astro src/pages/cases.astro src/pages/sobre.astro src/pages/qualificacao.astro src/pages/blog/index.astro src/pages/blog/\[slug\].astro
git commit -m "feat(schema): add BreadcrumbList JSON-LD to all inner pages

Helps AI models and search engines understand site hierarchy.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 10: Write unique meta descriptions per page

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/servicos.astro`
- Modify: `src/pages/cases.astro`
- Modify: `src/pages/sobre.astro`
- Modify: `src/pages/qualificacao.astro`
- Modify: `src/pages/blog/index.astro`

Currently most pages share the same description: "A Arven desenha e opera funis de aquisição para empresas B2B. Do primeiro clique ao lead qualificado, pronto para o seu time fechar."

Each page needs a unique, keyword-rich description under 160 characters.

- [ ] **Step 1: Update index.astro description**

Keep the current description — it's already unique and good:
```
"A Arven desenha e opera funis de aquisição para empresas B2B. Do primeiro clique ao lead qualificado, pronto para o seu time fechar."
```
No change needed.

- [ ] **Step 2: Update servicos.astro description**

Change the `description` prop in the `<Base>` tag:
```astro
description="Gestão de mídia paga, automação com IA e estrutura comercial. Três serviços que formam a operação completa de aquisição B2B da Arven."
```

- [ ] **Step 3: Update cases.astro description**

Change the `description` prop in the `<Base>` tag:
```astro
description="Cases reais: CAC reduzido em 75%, ROAS 7x, leads qualificados a menos de R$25. Resultados de quem já opera com a assessoria Arven."
```

- [ ] **Step 4: Update sobre.astro description**

Change the `description` prop in the `<Base>` tag:
```astro
description="R$10M geridos mensalmente em mídia paga e 50+ operações ativas. Conheça a Arven: assessoria de aquisição B2B orientada a receita."
```

- [ ] **Step 5: Update qualificacao.astro description**

Already unique: "Formulário para entendermos o momento do seu negócio. Envie suas respostas e nossa equipe retorna em breve." No change needed.

- [ ] **Step 6: Update blog/index.astro description**

Change the `description` prop in the `<Base>` tag:
```astro
description="Artigos sobre aquisição B2B, geração de demanda, qualificação de leads e processo comercial. Conteúdo direto de quem opera funis todo dia."
```

- [ ] **Step 7: Verify the build works**

Run: `npm run build`
Expected: Build succeeds. Each page's HTML has a unique `<meta name="description">`.

- [ ] **Step 8: Commit**

```bash
git add src/pages/servicos.astro src/pages/cases.astro src/pages/sobre.astro src/pages/blog/index.astro
git commit -m "feat(seo): write unique meta descriptions per page

Replaces duplicate descriptions across servicos, cases, sobre, and blog
with page-specific, keyword-rich descriptions under 160 characters.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 11: Fix number ticker SSR rendering

**Files:**
- Modify: `src/pages/index.astro`

The number ticker on the homepage renders `R$0M` in the SSR HTML because the initial text content is "0" and the JS animates it to the target value. Crawlers see "0" instead of the real value.

- [ ] **Step 1: Update the ticker markup to show real values in HTML**

In `src/pages/index.astro`, change the numbers section. The `data-ticker` attribute still drives the animation, but the initial text content should be the real value so crawlers see it:

Find:
```html
<span class="numbers__value"><span>R$</span><span data-ticker="10">0</span><span>M</span></span>
```
Replace with:
```html
<span class="numbers__value"><span>R$</span><span data-ticker="10">10</span><span>M</span></span>
```

Find:
```html
<span class="numbers__value"><span data-ticker="50" data-ticker-suffix="+">0</span></span>
```
Replace with:
```html
<span class="numbers__value"><span data-ticker="50" data-ticker-suffix="+">50+</span></span>
```

Find:
```html
<span class="numbers__value"><span>R$</span><span data-ticker="40">0</span><span>M+</span></span>
```
Replace with:
```html
<span class="numbers__value"><span>R$</span><span data-ticker="40">40</span><span>M+</span></span>
```

- [ ] **Step 2: Update the number-ticker.ts script to reset to 0 before animating**

In `src/scripts/number-ticker.ts`, the `animate` function should reset the text to "0" before starting the animation so the visual spring effect still works. Add this line at the beginning of the `animate` function, before the `if (reduced)` check:

Find (in the `animate` function, after `if (isNaN(target)) return;`):
```ts
    if (reduced) {
```
Insert before it:
```ts
    // Reset to 0 for animation (SSR renders the real value for crawlers)
    el.textContent = '0';

```

The reduced-motion path already sets the final value, so it will overwrite the "0" immediately.

- [ ] **Step 3: Verify the build works**

Run: `npm run build`
Expected: Build succeeds. Check `dist/index.html` — the numbers section should show "10", "50+", "40" in the HTML source (not "0").

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/scripts/number-ticker.ts
git commit -m "fix(seo): render real number values in SSR HTML for crawlers

Tickers now show actual values (10, 50+, 40) in server-rendered HTML.
The JS resets to 0 and animates on viewport entry, preserving the
spring animation for users while giving crawlers real content.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 12: Add WebSite JSON-LD schema

**Files:**
- Modify: `src/components/SchemaOrg.astro`

Add a WebSite schema alongside the Organization schema for site-level identity.

- [ ] **Step 1: Add WebSite schema to SchemaOrg.astro**

Add a second schema object and render both:

```astro
---
// src/components/SchemaOrg.astro
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Arven",
  "legalName": "ARVEN CONSULTORIA TECNOLOGIA & OUTSOURCING",
  "url": "https://www.arvenoficial.com",
  "logo": "https://www.arvenoficial.com/assets/logo.svg",
  "description": "Assessoria de aquisição B2B. Estruturamos a operação que conecta investimento em mídia a contrato fechado para empresas B2B no Brasil.",
  "foundingDate": "2024",
  "taxID": "65.183.229/0001-54",
  "areaServed": {
    "@type": "Country",
    "name": "Brazil"
  },
  "knowsLanguage": "pt-BR",
  "sameAs": [
    "https://www.instagram.com/arvensolutions/",
    "https://www.linkedin.com/company/arvenaquisicao"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "sales",
    "url": "https://www.arvenoficial.com/qualificacao",
    "availableLanguage": "Portuguese"
  },
  "makesOffer": [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Gestão de Mídia e Performance",
        "description": "Campanhas em todas as fontes de tráfego, otimizadas por receita gerada. Rastreamento end-to-end do clique ao contrato."
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Automação e Qualificação com IA",
        "description": "Qualificação automatizada de leads 24/7 com IA. Leads entregues ao comercial com contexto completo e score de prontidão."
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Estrutura Comercial",
        "description": "Processo comercial com CRM, playbooks, dashboards de gestão e coaching de pipeline."
      }
    }
  ]
};

const siteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Arven",
  "url": "https://www.arvenoficial.com",
  "description": "Assessoria de aquisição B2B. Estruturamos a operação que conecta investimento em mídia a contrato fechado.",
  "inLanguage": "pt-BR",
  "publisher": {
    "@type": "Organization",
    "name": "Arven",
    "url": "https://www.arvenoficial.com"
  }
};
---
<script type="application/ld+json" set:html={JSON.stringify(orgSchema)} />
<script type="application/ld+json" set:html={JSON.stringify(siteSchema)} />
```

- [ ] **Step 2: Verify the build works**

Run: `npm run build`
Expected: Build succeeds. Check `dist/index.html` contains both `"@type": "Organization"` and `"@type": "WebSite"` JSON-LD blocks.

- [ ] **Step 3: Commit**

```bash
git add src/components/SchemaOrg.astro
git commit -m "feat(schema): add WebSite JSON-LD schema

Adds site-level identity schema alongside Organization for
complete structured data coverage.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 13: Final build verification and push

**Files:** None (verification only)

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Verify key files in dist/**

Run the following checks:
```bash
# Verify robots.txt
cat dist/robots.txt

# Verify llms.txt
cat dist/llms.txt

# Verify sitemap exists
cat dist/sitemap-index.xml

# Verify canonical tag on homepage
grep 'rel="canonical"' dist/index.html

# Verify Organization JSON-LD on homepage
grep '"@type":"Organization"' dist/index.html

# Verify FAQPage JSON-LD on homepage
grep '"@type":"FAQPage"' dist/index.html

# Verify Service JSON-LD on servicos page
grep '"@type":"Service"' dist/servicos/index.html

# Verify BreadcrumbList on servicos
grep '"@type":"BreadcrumbList"' dist/servicos/index.html

# Verify unique descriptions
grep 'name="description"' dist/index.html
grep 'name="description"' dist/servicos/index.html
grep 'name="description"' dist/cases/index.html
grep 'name="description"' dist/sobre/index.html

# Verify Twitter Cards
grep 'twitter:card' dist/index.html

# Verify number ticker SSR values
grep 'data-ticker="10"' dist/index.html
```

Expected: All checks pass. Each page has unique description, JSON-LD schemas are present, canonical URLs are correct.

- [ ] **Step 3: Push to remote**

```bash
git push
```

Expected: Push succeeds. Vercel build triggers automatically.

---

## Summary of Expected GEO Score Impact

| Category | Before | After (Projected) |
|----------|--------|-------------------|
| AI Citability & Visibility | 27/100 | ~45/100 (llms.txt, better meta) |
| Brand Authority Signals | 8/100 | ~15/100 (sameAs, Organization schema) |
| Content Quality & E-E-A-T | 38/100 | ~42/100 (unique descriptions, SSR fix) |
| Technical Foundations | 62/100 | ~85/100 (robots.txt, sitemap, canonical, OG) |
| Structured Data | 5/100 | ~55/100 (Org, FAQ, Service, Blog, Breadcrumb, WebSite) |
| Platform Optimization | 24/100 | ~40/100 (schema, sitemap, meta improvements) |
| **Composite Score** | **28/100** | **~50-55/100** |
