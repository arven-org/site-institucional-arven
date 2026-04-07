# Site institucional Arven

Repositório: **[github.com/arven-org/site-institucional-arven](https://github.com/arven-org/site-institucional-arven)**

Site estático (HTML, CSS, JS). Deploy recomendado: **Vercel** + domínio **arvenoficial.com**.

## Requisitos no teu Mac

- [Git](https://git-scm.com/)
- [Git LFS](https://git-lfs.com/) — **obrigatório** por causa do ficheiro `assets/video/vsl-arven.mp4` (~250 MB). Sem LFS o GitHub bloqueia o push.

```bash
brew install git-lfs
git lfs install
```

## Clonar / clone

```bash
git clone https://github.com/arven-org/site-institucional-arven.git
cd site-institucional-arven
git lfs pull
```

## Primeiro push (referência)

```bash
git lfs install
git remote add origin https://github.com/arven-org/site-institucional-arven.git
git branch -M main
git push -u origin main
```

Se o vídeo já tiver sido commitado sem LFS, corre antes:

```bash
git lfs migrate import --include="*.mp4"
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
