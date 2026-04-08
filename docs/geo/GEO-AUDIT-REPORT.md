# GEO Audit Report — arvenoficial.com

**Date:** 2026-04-08
**Business Type:** B2B Agency (Demand Generation / Acquisition Advisory)
**Domain:** https://www.arvenoficial.com/
**Framework:** Astro 6 + Vercel (SSR/SSG)

---

## Composite GEO Score: 28/100 — Poor

| Category | Weight | Score | Weighted | Status |
|---|---|---|---|---|
| AI Citability & Visibility | 25% | 27/100 | 6.75 | Poor |
| Brand Authority Signals | 20% | 8/100 | 1.60 | Critical |
| Content Quality & E-E-A-T | 20% | 38/100 | 7.60 | Poor |
| Technical Foundations | 15% | 62/100 | 9.30 | Fair |
| Structured Data | 10% | 5/100 | 0.50 | Critical |
| Platform Optimization | 10% | 24/100 | 2.40 | Poor |
| **TOTAL** | **100%** | | **28.15** | **Poor** |

### Score Interpretation
- 0-20: Critical — Virtually invisible to AI search
- **21-40: Poor — Minimal AI discoverability (CURRENT)**
- 41-60: Fair — Some visibility with significant gaps
- 61-80: Good — Solid presence with room for improvement
- 81-100: Excellent — Strong AI search visibility

---

## Executive Summary

Arven's website has **strong technical foundations** (SSR, security headers, clean URLs) but is **almost invisible to AI search engines** due to:

1. **Zero structured data** — No JSON-LD, no schema markup of any kind
2. **No robots.txt or sitemap.xml** — AI crawlers can access everything but can't discover pages efficiently
3. **No brand authority** — "Arven" is ambiguous (Pokemon character, Norwegian film, etc.) with near-zero external mentions
4. **No author/team identity** — No named experts, no credentials, no E-E-A-T signals
5. **Domain mismatch** — `astro.config.mjs` says `arven.com.br` but production is `arvenoficial.com`

The good news: most critical fixes are **low-effort technical changes** (robots.txt, sitemap, schema, canonical tags) that can dramatically improve scores within days.

---

## 1. AI Citability & Visibility (27/100)

### Citability Score: 42/100

**Best-performing content for AI citation:**

| Rank | Page | Content | Score |
|---|---|---|---|
| 1 | /cases | EAG: "75% CAC reduction, R$930 → R$234 in 7 months" | 70.6 |
| 2 | /cases | CSC: "ROAS 7x, <R$25 per qualified lead" | 66.5 |
| 3 | /cases | QuartaVia: "ROAS 6.6x, R$40M revenue in 2024" | 64.3 |
| 4 | /sobre | "R$10M monthly managed media, 50+ active operations" | 57.0 |
| 5 | / (home) | Four-stage methodology description | 47.0 |

**Worst-performing:**

| Page | Score | Issue |
|---|---|---|
| /qualificacao | 12/100 | Pure form, no informational content |
| /blog previews | 22/100 | Thin, title-only, no depth |
| /servicos | 28/100 | Zero statistics, generic process descriptions |
| / FAQ section | 35/100 | Answers are vague, not quotable |

### AI Crawler Access: 80/100

All crawlers allowed by default (no robots.txt = allow all). But no sitemap means crawlers must discover pages by link-following only.

| Crawler | Status |
|---|---|
| GPTBot (OpenAI) | Allowed |
| OAI-SearchBot | Allowed |
| ChatGPT-User | Allowed |
| ClaudeBot (Anthropic) | Allowed |
| PerplexityBot | Allowed |
| Google-Extended | Allowed |
| Bingbot | Allowed |
| CCBot (Common Crawl) | Allowed |

### llms.txt: Missing (0/100)

No `llms.txt` file exists. Recommended template:

```markdown
# Arven

> Assessoria de aquisicao B2B. Estruturamos a operacao que conecta investimento em midia a contrato fechado para empresas B2B no Brasil.

## Servicos
- [Gestao de Midia e Performance](https://www.arvenoficial.com/servicos): Paid media management optimized by revenue
- [Automacao e Qualificacao com IA](https://www.arvenoficial.com/servicos): AI-powered lead qualification 24/7
- [Estrutura Comercial](https://www.arvenoficial.com/servicos): Sales process design with CRM and playbooks

## Resultados
- [Cases de Sucesso](https://www.arvenoficial.com/cases): Client results including 75% CAC reduction, 7x ROAS

## Sobre
- [A Arven](https://www.arvenoficial.com/sobre): R$10M+ monthly managed media, 50+ active operations

## Blog
- [Blog](https://www.arvenoficial.com/blog): Articles on B2B acquisition, demand generation

## Contato
- [Qualificacao](https://www.arvenoficial.com/qualificacao): Business qualification form
```

---

## 2. Brand Authority Signals (8/100)

**Critical problem: Brand name ambiguity.** "Arven" is shared by a Pokemon character (high search volume), a Turkish pharma company, a Norwegian film, and others. AI models cannot confidently associate "Arven" with B2B acquisition advisory.

| Platform | Status | Points |
|---|---|---|
| Wikipedia | Absent (disambiguation page lists other entities) | 0/30 |
| Reddit | Absent (only Pokemon card results) | 0/20 |
| YouTube | Absent (no channel or videos) | 0/15 |
| LinkedIn | Minimal (company page not indexed) | 3/10 |
| Industry Directories | Minimal (not on G2, Clutch, Capterra) | 5/25 |

---

## 3. Content Quality & E-E-A-T (38/100)

### E-E-A-T Breakdown

| Dimension | Score | Key Issue |
|---|---|---|
| Experience | 12/25 | Case studies exist but no first-person narrative, no process screenshots |
| Expertise | 7/25 | **No named author/founder anywhere on the site** — weakest signal |
| Authoritativeness | 8/25 | Real client names but no external citations, no media mentions |
| Trustworthiness | 11/25 | HTTPS + CNPJ present, but no privacy policy, no contact info, no physical address |

### Content Depth

| Page | Word Count | Assessment |
|---|---|---|
| / (homepage) | ~800 | Adequate for homepage |
| /servicos | ~400 | **Thin** — critically underweight |
| /cases | ~600 | Short — cases lack depth |
| /sobre | ~250 | **Thin** — critically underweight |
| /blog index | ~100 | Thin — just titles |

### Critical Content Gaps
- No privacy policy (LGPD requirement)
- No terms of service
- No physical address or phone number
- No author bylines on blog posts
- No team/founder bios on /sobre
- Number ticker renders "R$0M" to crawlers (JS-dependent)
- All non-blog pages share identical meta descriptions

---

## 4. Technical Foundations (62/100)

### Strengths

| Area | Score | Notes |
|---|---|---|
| SSR Quality | 95/100 | Astro renders full HTML; all content visible without JS |
| Security Headers | 95/100 | HSTS, CSP, X-Frame-Options, X-Content-Type-Options all configured |
| URL Structure | 90/100 | Clean, descriptive, flat hierarchy |

### Weaknesses

| Area | Score | Issue |
|---|---|---|
| Crawlability | 15/100 | No robots.txt, no sitemap, no canonical tags |
| Meta Tags | 40/100 | Missing og:image, og:url, og:type, Twitter Cards; duplicate descriptions |
| Core Web Vitals | 60/100 | Render-blocking Google Fonts, no preload hints |
| Mobile | 70/100 | No responsive images (srcset), base font 15px (below 16px threshold) |
| Additional | 30/100 | Zero structured data, no preload hints |

### Domain Mismatch (Critical)
`astro.config.mjs` declares `site: 'https://arven.com.br'` but production is `https://www.arvenoficial.com`. This breaks any Astro-generated URLs (sitemaps, canonical tags, og:url).

---

## 5. Structured Data (5/100)

**Zero schema markup exists on any page.** No JSON-LD, no Microdata, no RDFa.

| Schema | Status | Impact |
|---|---|---|
| Organization + sameAs | Missing | Critical — no entity identity for AI models |
| Article/BlogPosting | Missing | High — blog posts invisible to structured parsers |
| Person (author) | Missing | High — no E-E-A-T author signals |
| Service | Missing | High — 3 services without machine-readable description |
| FAQPage | Missing | Medium — 6 FAQ pairs exist but no markup |
| BreadcrumbList | Missing | Low — no navigation schema |
| WebSite | Missing | Low — no site-level identity |
| speakable | Missing | Medium — no AI assistant voice content flagged |

Full JSON-LD templates for all schemas are available in the detailed schema report.

---

## 6. Platform Optimization (24/100)

| Platform | Score | Status | Key Gap |
|---|---|---|---|
| Google AI Overviews | 32/100 | Poor | No schema, H2s are brand-voice not query-matching |
| Google Gemini | 22/100 | Poor | No YouTube, no Google Business Profile, no Knowledge Graph |
| Perplexity AI | 18/100 | Critical | No community validation, no original research data |
| ChatGPT Web Search | 16/100 | Critical | Entity ambiguity, no sameAs, no author credentials |
| Bing Copilot | 14/100 | Critical | No IndexNow, no Bing Webmaster Tools, no sitemap |

---

## Prioritized Action Plan

### Quick Wins (1-2 days, high impact)

| # | Action | Impact | Effort | Platforms Affected |
|---|---|---|---|---|
| 1 | **Fix `site` in astro.config.mjs** to `https://www.arvenoficial.com` | Critical | 5 min | All |
| 2 | **Create `public/robots.txt`** allowing all crawlers + sitemap directive | Critical | 10 min | All 5 |
| 3 | **Install `@astrojs/sitemap`** and generate sitemap.xml | Critical | 15 min | All 5 |
| 4 | **Add `<link rel="canonical">`** to Head.astro | Critical | 10 min | All 5 |
| 5 | **Add Organization JSON-LD** to Head.astro (name, CNPJ, sameAs) | Critical | 20 min | Google AIO, ChatGPT, Gemini, Bing |
| 6 | **Add FAQPage JSON-LD** to homepage (6 existing Q&As) | High | 15 min | Google AIO, ChatGPT, Gemini |
| 7 | **Complete OG tags** (og:image, og:url, og:type) + Twitter Cards | High | 20 min | All 5 |
| 8 | **Create `public/llms.txt`** | High | 10 min | ChatGPT, Perplexity, Claude |
| 9 | **Write unique meta descriptions** per page | High | 20 min | All 5 |
| 10 | **Fix number ticker SSR** — render real values in HTML | Medium | 15 min | All crawlers |

### Medium-Term (1-2 weeks)

| # | Action | Impact | Effort |
|---|---|---|---|
| 11 | **Add founder/team identity** to /sobre with names, photos, credentials, LinkedIn | Critical (E-E-A-T) | 2-3 hours |
| 12 | **Add privacy policy** (/privacidade) — LGPD requirement | Critical (Trust) | 1-2 hours |
| 13 | **Add Service JSON-LD** to /servicos for 3 offerings | High | 30 min |
| 14 | **Add BlogPosting JSON-LD** dynamically from Sanity data | High | 1 hour |
| 15 | **Add BreadcrumbList JSON-LD** to all inner pages | Medium | 30 min |
| 16 | **Add author bylines** to blog posts with Person schema | High | 1 hour |
| 17 | **Expand /servicos** with concrete data and statistics | High | 2-3 hours |
| 18 | **Expand /sobre** to 800-1200 words with team, timeline, milestones | High | 2-3 hours |
| 19 | **Add client testimonial quotes** to case studies | High | 1-2 hours |
| 20 | **Claim Google Business Profile** | High | 30 min + verification |
| 21 | **Verify in Bing Webmaster Tools** + implement IndexNow | Medium | 30 min |
| 22 | **Add contact information** (email, WhatsApp, address) to footer | Medium | 15 min |

### Strategic (1-3 months)

| # | Action | Impact | Effort |
|---|---|---|---|
| 23 | **Publish 20-30 blog posts** covering B2B acquisition subtopics | High (Topical Authority) | Ongoing |
| 24 | **Create YouTube channel** and upload VSL + case study walkthroughs | High (Gemini, Google) | 1-2 weeks |
| 25 | **Build external mentions** — Clutch, G2, LinkedIn posts, guest articles | High (Brand Authority) | Ongoing |
| 26 | **Consider "Arven Aquisicao" branding** to disambiguate from Pokemon | Medium (Entity) | Strategic decision |
| 27 | **Add English content layer** (at least one landing page + llms.txt) | Medium (Global AI) | 1 week |
| 28 | **Create Reclame Aqui profile** | Low (Brazilian trust) | 30 min |

---

## Estimated Impact

If Quick Wins (#1-10) are implemented:
- **Projected GEO Score: 45-55/100** (from current 28)
- Technical score jumps to ~85/100
- Schema score jumps to ~40-50/100
- Platform scores improve 15-20 points each

If Quick Wins + Medium-Term (#1-22) are implemented:
- **Projected GEO Score: 55-65/100**
- Content/E-E-A-T score reaches ~60/100
- Brand authority begins building

Full implementation (#1-28) over 3 months:
- **Projected GEO Score: 70-80/100**
- Competitive AI search visibility for Brazilian B2B acquisition queries

---

*Report generated by GEO Audit Tool — 2026-04-08*
*5 parallel subagents: AI Visibility, Platform Analysis, Technical SEO, Content Quality, Schema Markup*
