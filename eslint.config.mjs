import nextConfig from "eslint-config-next";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EM_DASH = "—";

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "supabase/.temp/**",
      "supabase/.branches/**",
      "next-env.d.ts",
      "lib/supabase/types.ts",
      "coverage/**",
    ],
  },
  ...nextConfig,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/require-await": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-restricted-syntax": [
        "error",
        {
          selector: `Literal[value=/${EM_DASH}/]`,
          message: "Travessao (em-dash) proibido. Use virgula, parenteses ou ponto.",
        },
        {
          selector: `TemplateElement[value.raw=/${EM_DASH}/]`,
          message: "Travessao (em-dash) proibido. Use virgula, parenteses ou ponto.",
        },
        {
          selector: `JSXText[value=/${EM_DASH}/]`,
          message: "Travessao (em-dash) proibido. Use virgula, parenteses ou ponto.",
        },
      ],
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "./lib",
              from: ["./modules", "./app", "./components"],
              message: "lib/ e infra transversal. Nao pode depender de modulos, app ou components.",
            },
            {
              target: "./components",
              from: "./modules",
              message: "components/ e design system. Nao pode depender de logica de modulo.",
            },
            {
              target: "./modules/contracts",
              from: [
                "./modules/goals",
                "./modules/mrr",
                "./modules/alerts",
                "./modules/ingestion",
              ],
              message:
                "Modulos nao se importam diretamente. Comunique via lib/ ou views publicas no banco.",
            },
            {
              target: "./modules/goals",
              from: [
                "./modules/contracts",
                "./modules/mrr",
                "./modules/alerts",
                "./modules/ingestion",
              ],
              message:
                "Modulos nao se importam diretamente. Comunique via lib/ ou views publicas no banco.",
            },
            {
              target: "./modules/mrr",
              from: [
                "./modules/contracts",
                "./modules/goals",
                "./modules/alerts",
                "./modules/ingestion",
              ],
              message:
                "Modulos nao se importam diretamente. Comunique via lib/ ou views publicas no banco.",
            },
            {
              target: "./modules/alerts",
              from: [
                "./modules/contracts",
                "./modules/goals",
                "./modules/mrr",
                "./modules/ingestion",
              ],
              message:
                "Modulos nao se importam diretamente. Comunique via lib/ ou views publicas no banco.",
            },
            {
              target: "./modules/ingestion",
              from: [
                "./modules/contracts",
                "./modules/goals",
                "./modules/mrr",
                "./modules/alerts",
              ],
              message:
                "Modulos nao se importam diretamente. Comunique via lib/ ou views publicas no banco.",
            },
          ],
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/supabase/service",
              message:
                "Service-role bypassa RLS. Importe so de app/api/cron, app/api/webhooks, scripts/, modules/*/jobs/, ou modules/*/server/. Auditoria obrigatoria.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "app/api/cron/**/*.ts",
      "app/api/webhooks/**/*.ts",
      "scripts/**/*.ts",
      "modules/*/jobs/**/*.ts",
      "modules/*/server/**/*.ts",
      "tests/**/*.ts",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  {
    files: ["*.mjs", "*.cjs", "*.config.ts", "*.config.mjs"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    /**
     * O proprio arquivo de config define a regra do travessao, entao precisa
     * conter o caractere literalmente. Suspende a checagem so aqui.
     */
    files: ["eslint.config.mjs"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
);
