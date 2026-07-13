import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: {
    // Mirror the dashboard's "@/*" tsconfig path so component tests can load
    // modules with value imports (type-only imports never hit the resolver).
    alias: {
      "@": fileURLToPath(new URL("./apps/dashboard/src", import.meta.url)),
      // Tests import package internals as src paths; workspace deps between
      // packages resolve to dist. @dxb/observability must be ONE module
      // instance in both graphs — its AsyncLocalStorage carries the run scope
      // (two copies = two stores = a silently lost scope).
      "@dxb/observability": fileURLToPath(
        new URL("./packages/observability/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    // Phase-3+ integration tests share one local Postgres — parallel files
    // interfere (cross-file claims/wipes). Sequential is correct at DXB scale.
    fileParallelism: false,
  },
});
