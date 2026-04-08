# Site institucional Arven

Repositório: **[github.com/arven-org/site-institucional-arven](https://github.com/arven-org/site-institucional-arven)**

Site estático (HTML, CSS, JS). Deploy recomendado: **Vercel** + domínio **arvenoficial.com**.

## Requisitos no teu Mac

- [Git](https://git-scm.com/)

Os VSL em **`public/assets/video/`** estão **codificados para web** (H.264 + AAC, `faststart`):

- `vsl-arven.mp4` — desktop, 1920×1080, ~5.2 Mbps (master `VSL_SITE_ARVEN).mp4`)
- `vsl-arven-mobile.mp4` — vertical 720×1280, ~3.2 Mbps (master `vsl_site_arven_mobile.mp4`)
- `vsl-arven-poster.jpg` / `vsl-arven-mobile-poster.jpg` — pôsteres correspondentes

A escolha entre desktop/mobile **não** usa `<source media>` (não é confiável no Safari iOS). Em vez disso, [`src/scripts/vsl-player.ts`](src/scripts/vsl-player.ts) lê os atributos `data-vsl-src-desktop`, `data-vsl-src-mobile`, `data-vsl-poster-desktop` e `data-vsl-poster-mobile` do `<video>` e troca `src`/`poster` via `matchMedia("(max-width: 900px)")` **antes** de qualquer fetch (o vídeo usa `preload="none"`).

## Clonar / clone

```bash
git clone https://github.com/arven-org/site-institucional-arven.git
cd site-institucional-arven
```

## Primeiro push (referência)

```bash
git remote add origin https://github.com/arven-org/site-institucional-arven.git
git branch -M main
git push -u origin main
```

Para **regenerar** os ficheiros a partir dos masters (ajusta caminhos):

```bash
# Desktop — 1920×1080, 5.2 Mbps
ffmpeg -y -i "/caminho/VSL_SITE_ARVEN).mp4" \
  -c:v libx264 -preset medium -profile:v high -pix_fmt yuv420p \
  -b:v 5200k -maxrate 5600k -bufsize 11200k \
  -c:a aac -b:a 160k -ac 2 -movflags +faststart \
  public/assets/video/vsl-arven.mp4

# Mobile — vertical 720×1280, 3.2 Mbps
ffmpeg -y -i "/caminho/vsl_site_arven_mobile.mp4" \
  -c:v libx264 -preset medium -profile:v high -pix_fmt yuv420p \
  -b:v 3200k -maxrate 3500k -bufsize 7000k \
  -vf "scale=720:1280" \
  -c:a aac -b:a 128k -ac 2 -movflags +faststart \
  public/assets/video/vsl-arven-mobile.mp4

# Pôsteres (1 frame ~1.5s do início)
ffmpeg -y -ss 1.5 -i public/assets/video/vsl-arven.mp4 \
  -frames:v 1 -vf "scale=1280:720" -q:v 4 \
  public/assets/video/vsl-arven-poster.jpg
ffmpeg -y -ss 1.5 -i public/assets/video/vsl-arven-mobile.mp4 \
  -frames:v 1 -vf "scale=720:1280" -q:v 4 \
  public/assets/video/vsl-arven-mobile-poster.jpg
```

## Vercel

Se o projeto na Vercel ainda apontar para outro repo GitHub, em **Settings → Git** reconecta a **[site-institucional-arven](https://github.com/arven-org/site-institucional-arven)** (ou importa de novo este repositório).

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → importar **site-institucional-arven**.
2. **Framework Preset:** Other (site estático).
3. **Root Directory:** `.` (raiz do repositório = esta pasta).
4. **Build Command:** vazio.
5. **Output Directory:** vazio (ficheiros na raiz).

### Domínio `arvenoficial.com`

1. No projeto Vercel → **Settings** → **Domains** → adicionar `arvenoficial.com` e `www.arvenoficial.com`.
2. Na OVH/Registro.br onde está o domínio, aponta os registos que a Vercel indicar (normalmente **A** para Vercel ou **CNAME** para `cname.vercel-dns.com`).
3. Ativa **redirect** de `www` → apex ou o contrário, conforme preferires.

O ficheiro `vercel.json` define **cabeçalhos de segurança** (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, etc.) e cache longo para imagens/SVG em `/assets/`.

## Auditoria (CI)

No GitHub Actions corre **Lighthouse CI** em cada push/PR para `main`/`master`, com base em `lighthouserc.json` (páginas principais + limites mínimos de acessibilidade e SEO).

Para testar localmente:

```bash
npx --yes @lhci/cli@0.14.x autorun
```

## Estrutura útil

- `index.html`, `cases.html`, `servicos.html`, `sobre.html`, `qualificacao.html`, `blog/index.html`
- `styles.css`, `js/`, `assets/`
