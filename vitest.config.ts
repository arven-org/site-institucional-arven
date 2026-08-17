import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: false,
    setupFiles: ["tests/setup/load-env.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx", "tests/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["lib/**", "modules/**"],
      exclude: ["**/__tests__/**", "**/*.test.ts", "**/types.ts"],
    },
  },
  resolve: {
    alias: {
      "@/app": path.resolve(__dirname, "./app"),
      "@/modules": path.resolve(__dirname, "./modules"),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/components": path.resolve(__dirname, "./components"),
      "@/design-tokens": path.resolve(__dirname, "./design-tokens"),
      "@/tests": path.resolve(__dirname, "./tests"),
      "@/scripts": path.resolve(__dirname, "./scripts"),
    },
  },
});
