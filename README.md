# Arven, sistema operacional de contratos

Plataforma modular extensivel. Substitui o ArvenOS na gestao de contratos. v1 entrega o modulo de contratos e a camada de metas/forecast; a fundacao aguenta modulos futuros (pipeline de leads, dashboards) sem refatoracao.

A fonte da verdade tecnica esta em [`arven-contratos-spec.md`](./arven-contratos-spec.md).

## Stack

- Next.js 16 (App Router, RSC, Server Actions)
- TypeScript estrito
- Supabase (Postgres + Auth + Storage), RLS em toda tabela
- Tailwind v4 + tokens CSS, dark-first
- Recharts, Zod, Vitest
- pnpm, deploy Vercel

## Setup local

Pre-requisitos: Node 22+, pnpm 11+, [OrbStack](https://orbstack.dev) rodando, [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started).

```bash
# 1. Instalar deps
pnpm install

# 2. Subir Supabase local (Postgres + Auth + Storage + Studio + Inbucket)
pnpm db:start

# 3. Pegar as keys do stack local (output do `db:start`) e popular .env.local
cp .env.example .env.local
# edite .env.local com URL, anon key e service-role key

# 4. Aplicar migrations
supabase db reset

# 5. Subir o dev server
pnpm dev
```

Aberto em `http://localhost:3000`. Supabase Studio em `http://localhost:54323`. Inbox de emails (magic link) em `http://localhost:54324`.

### Criar usuario inicial

Como `enable_signup = false`, novos usuarios sao criados via Studio ou via service-role:

```bash
# Via Studio: http://localhost:54323 > Authentication > Users > Add user
# Defina email + senha temporaria. O profile e auto-criado pelo trigger.
# Pra promover a admin, edite a tabela profiles direto no Studio.
```

No fluxo de login, voce so digita o email, recebe o magic link no Inbucket local, clica, entra.

## Comandos

```bash
pnpm dev               # dev server (Turbopack)
pnpm build             # build de prod
pnpm lint              # ESLint
pnpm typecheck         # tsc --noEmit
pnpm format            # Prettier
pnpm test              # Vitest, tudo
pnpm test:rls          # so a suite de RLS (precisa do stack local)
pnpm db:start          # supabase start
pnpm db:stop           # supabase stop
pnpm db:reset          # reset + reaplica migrations + seed
pnpm db:types          # gera lib/supabase/types.ts do schema local
```

## Estrutura

```
app/              Rotas Next.js (camada fina, so apresentacao)
modules/          Logica de negocio, um modulo por dominio
lib/              Infra transversal (supabase, auth, money, dates, errors)
components/       Design system (primitives, charts, layout)
design-tokens/    Tokens CSS, tipografia, motion
supabase/         Banco como codigo (migrations, config, policies docs)
tests/            Setup, suite de RLS, integration
```

Boundaries forcadas por ESLint (`eslint.config.mjs`):

- `modules/*` nao se importam entre si
- `lib/` nao depende de modules/app/components
- `components/` nao depende de modules
- `@/lib/supabase/service` (bypassa RLS) so importavel em `app/api/cron`, `app/api/webhooks`, `scripts/`, `modules/*/jobs/`

## Padroes nao negociaveis

- RLS habilitado em toda tabela, policy na mesma migration que cria a tabela
- Valor monetario sempre em centavos (`bigint`), nunca em reais. `mrr_cents` e a fonte da verdade
- Contrato nunca apagado, mudancas de status sao append-only via trigger
- Historico de MRR vive em `mrr_snapshots`, congelado, nao recalculado ao vivo
- Zod em toda fronteira de entrada (form, webhook, action)
- Sem travessao em nenhum texto (lint reprova)

## Sequencia de construcao

1. ~~Fundacao~~ (esta fatia)
2. Schema completo + triggers + RLS (clients, contracts, contract*status_log, mrr_snapshots, alerts, growth*\*)
3. Modulo de contratos (CRUD, 4 estados, PDF storage)
4. Seed dos 21 clientes (valida soma R$ 64.100)
5. Job diario de snapshot + motor de status + alertas
6. Camada de metas/forecast + tela principal sobreposta
7. Ingestao Google Form com portao de aprovacao

Cada fatia entregue com testes passando.
