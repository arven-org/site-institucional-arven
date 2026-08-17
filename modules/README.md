# modules/

Logica de negocio. Um modulo por dominio (contracts, goals, mrr, alerts, ingestion).

## Regras

1. **Modulos nao se importam diretamente.** Comunicacao entre modulos passa por views publicas no banco ou por helpers em `lib/`. Acoplamento direto vira refatoracao na proxima fatia.
2. **Cada modulo expoe sua API pelo `public.ts`.** Rotas em `app/` so importam de `public.ts`. O resto e privado ao modulo.
3. **Estrutura padrao por modulo:**
   - `schemas.ts`, validacao Zod
   - `queries.ts`, leitura server-side
   - `actions.ts`, server actions (escrita)
   - `jobs/`, cron jobs (unica pasta que pode importar service-role)
   - `public.ts`, fachada exportada
   - `__tests__/`
4. **RLS e a primeira linha de defesa.** Server actions confiam em RLS, nao re-validam autorizacao.

ESLint aplica essas regras (`eslint.config.mjs`, `import/no-restricted-paths`).
