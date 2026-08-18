# GEO Audit Report: Arven

**Data:** 2026-08-17
**URL:** https://www.arvenoficial.com
**Tipo de negócio:** Agência/Serviços (marketing de performance para mercados de alto valor)
**Páginas analisadas:** 9 (home, /blog, 6 posts, /templates)

---

## Executive Summary

**Overall GEO Score (baseline): 38/100 (Crítico)**

O site tem uma fundação técnica rara (SSR completo, URLs limpas, HTTPS e headers corretos), mas era quase invisível como entidade para sistemas de IA: zero structured data, sem robots/sitemap/llms.txt, marca "Arven" ambígua na web e a prova social renderizando "R$0Mi" para crawlers. **Grande parte da camada técnica foi corrigida no mesmo dia do audit** (ver seção "Corrigido em 17/08"); o que resta depende de conteúdo e decisões de negócio.

### Score Breakdown (baseline, pré-correções)

| Categoria                | Score  | Peso | Ponderado  |
| ------------------------ | ------ | ---- | ---------- |
| AI Citability            | 55/100 | 25%  | 13,8       |
| Brand Authority          | 12/100 | 20%  | 2,4        |
| Content E-E-A-T          | 40/100 | 20%  | 8,0        |
| Technical GEO            | 69/100 | 15%  | 10,4       |
| Schema & Structured Data | 5/100  | 10%  | 0,5        |
| Platform Optimization    | 33/100 | 10%  | 3,3        |
| **Overall GEO Score**    |        |      | **38/100** |

Prontidão por plataforma (baseline): AI Overviews 31, ChatGPT 40, Perplexity 40, Gemini 20, Copilot 36.

---

## Corrigido em 17/08 (deploy verificado em produção)

- `robots.txt` (allow geral + AI crawlers, disallow da área logada, referência ao sitemap)
- `sitemap.xml` dinâmico (posts do Sanity com lastmod, ISR 1h)
- `llms.txt` com resumo da empresa, páginas-chave e contato
- JSON-LD completo: Organization (sameAs Instagram/LinkedIn, knowsAbout), WebSite, Service (4 serviços), BlogPosting + BreadcrumbList em todos os posts (com speakable)
- Canonical em todas as páginas públicas; `metadataBase`
- og:image padrão (`/og.png` 1200x630) + capa do post como og:image + `twitter:card summary_large_image` + `article:published_time`
- Contadores da home agora fazem SSR do valor final (crawlers liam "R$0Mi" / "0%"; hoje leem R$8Mi, +70, 70%)
- Título da home sem duplicar a marca; meta description dos posts com fallback do primeiro parágrafo
- HSTS completo (`includeSubDomains; preload`)
- Imagens da home: 4,8MB → 0,4MB (webp 480px) + preconnect ao CDN do Sanity
- Favicon completo (ico/png/apple-touch/manifest) — antes não existia

Com isso, estimativa pós-correção: **Technical ~85, Schema ~70, Citability ~62 → GEO Score estimado ~52-55**. Reauditar em 2-4 semanas após reindexação.

---

## Critical Issues (dependem de você)

1. **Sem Política de Privacidade e Termos de Uso** (404) num site que capta leads — não-conformidade LGPD. Criar `/politica-de-privacidade` e `/termos-de-uso` (preciso do CNPJ/razão social para gerar).
2. **Sem CNPJ, razão social, endereço e telefone** em qualquer página — público advogado verifica isso. Adicionar ao rodapé.
3. **Link do LinkedIn no rodapé retorna 404** (`linkedin.com/company/arvensolutions` não existe ou foi removida). Criar/corrigir a company page e me passar a URL certa.
4. **Posts sem autor** + misattribution no case EAG (Marcelo Germano, que é cliente, aparece na posição de autor). Definir 1-2 autores reais com bio/credencial.

## High Priority

5. **Entidade fragmentada**: domínio `arvenoficial`, Instagram `@arvensolutions`, LinkedIn incerto — e "Arven" colide com agência alemã (arven.io), Grupo Arven (BR), Pokémon e outros. Unificar handles e reforçar sameAs.
6. **Google Search Console + Bing Webmaster Tools**: verificar o site, submeter o sitemap (o índice do Bing alimenta ChatGPT search e Copilot; o Google ainda exibe o title do site antigo em inglês). Habilitar IndexNow.
7. **Cases rasos** (280-380 palavras): reescrever no formato contexto → desafio → método → números antes/depois → depoimento. É o principal ativo de citabilidade da Arven.
8. **Correções no Sanity**: título "reduziram em 75?" → "75%"; "multiplas" → "múltiplas"; slug `/blog/novo-conteudo-com-ia` → renomear (ex.: `case-eag`) e me avisar para criar o redirect 301.
9. **Presença externa ≈ zero**: criar Google Business Profile (SC), canal YouTube com os cases, perfis em diretórios B2B; responder comunidades (Perplexity pesa menções recentes).

## Medium Priority

10. Seção FAQ na home (4-6 perguntas do nicho) + FAQPage schema — formato mais extraível por IA.
11. Cadência editorial: gap fev→ago/2026; cluster "marketing jurídico de performance" (Provimento 205/2021 OAB, CAC/LTV, LGPD na captação).
12. Redirect apex→www é 307 (temporário): no painel Vercel → Domains, marcar como redirect permanente (308).
13. Título do post APAE com ~90 caracteres — criar título editorial curto.
14. CSP (Content-Security-Policy) ausente — implementar em modo Report-Only primeiro.

## Low Priority

15. `Access-Control-Allow-Origin: *` global (restringir a rotas de API).
16. Depoimentos com nome/cargo na home; 1-2 fontes externas por artigo.
17. Wikidata item para a entidade Arven (Wikipedia é inviável agora, sem notabilidade).

---

## Plano 30 dias

### Semana 1: Fundação legal e identidade

- [ ] Política de Privacidade + Termos (me passar CNPJ/razão social)
- [ ] CNPJ + endereço + telefone no rodapé
- [ ] Corrigir/criar LinkedIn e unificar handles
- [ ] Search Console + Bing Webmaster + submeter sitemap

### Semana 2: Autoria e correções de conteúdo

- [ ] Definir autores, bio e byline nos 6 posts (corrigir case EAG)
- [ ] Corrigir títulos/slug no Sanity ("75%", "múltiplas", novo-conteudo-com-ia)
- [ ] Título curto para o post APAE

### Semana 3: Citabilidade

- [ ] Reescrever os 4 cases no formato completo com números
- [ ] Seção FAQ na home + FAQPage schema
- [ ] 1º post do cluster jurídico

### Semana 4: Presença externa

- [ ] Google Business Profile
- [ ] Canal YouTube com 2 cases em vídeo
- [ ] Publicar artigos na company page do LinkedIn

---

## Appendix: Páginas analisadas

| URL                                                          | Observações                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------- |
| /                                                            | Home one-page; agora com Organization/WebSite/Service JSON-LD |
| /blog                                                        | Lista com 6 posts (5 Sanity + 1 local)                        |
| /blog/producao-de-criativos-em-mercados-de-alto-valor        | Melhor artigo (~1.200 palavras)                               |
| /blog/como-a-engenharia-de-vendas-esta-mudando-o-jogo-no-b2b | ~550 palavras, expandir                                       |
| /blog/case-apae                                              | Título longo, sem métricas de resultado                       |
| /blog/case-csc-advogados                                     | Métrica forte (lead < R$25), sem contexto                     |
| /blog/case-evolving                                          | R$350 mil em 2 meses, sem baseline                            |
| /blog/novo-conteudo-com-ia                                   | Slug errado (case EAG), título com "75?"                      |
| /templates                                                   | noindex intencional (acesso restrito) — ok                    |
