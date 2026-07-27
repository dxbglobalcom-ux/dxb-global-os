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
      // E10.1: suites and packages must share ONE @dxb/shared instance (one
      // getDb pool singleton) — the hook fail-closed test closes/reopens that
      // pool; two instances would silently test the wrong one. dist (not src):
      // this matches what every package itself resolves.
      "@dxb/shared": fileURLToPath(
        new URL("./packages/shared/dist/index.js", import.meta.url),
      ),
      // R1.3: root suites import the revenue job handlers directly (tests/r13);
      // dist for the same one-instance reason as @dxb/shared.
      "@dxb/revenue": fileURLToPath(
        new URL("./packages/revenue/dist/index.js", import.meta.url),
      ),
      // R2.3: the unified constitution is shared through @dxb/gateway and
      // @dxb/hook — root suites (r22/r23) and package-src graphs must load
      // ONE instance of each (reference-equality is itself a test assertion).
      "@dxb/gateway": fileURLToPath(
        new URL("./packages/gateway/dist/index.js", import.meta.url),
      ),
      "@dxb/hook": fileURLToPath(
        new URL("./packages/hook/dist/index.js", import.meta.url),
      ),
      // 2026-07-27: tests/r31 asserts what the live answer lanes actually
      // deliver as an employee's identity, so it must load the SAME module the
      // scheduler loads — dist, for the one-instance reason above.
      "@dxb/voice": fileURLToPath(
        new URL("./packages/voice/dist/index.js", import.meta.url),
      ),
    },
  },
  test: {
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    // Phase-3+ integration tests share one local Postgres — parallel files
    // interfere (cross-file claims/wipes). Sequential is correct at DXB scale.
    fileParallelism: false,
    // Post-suite sweep: in the sequential run, files that execute AFTER the
    // owning suite re-raise ':no-run' probe alerts with nobody left to sweep
    // them (a halal-probe alert reached the CEO's Alerts page 2026-07-25).
    // One global teardown owns that test-only class.
    globalSetup: "./tests/global-teardown.ts",
  },
});
