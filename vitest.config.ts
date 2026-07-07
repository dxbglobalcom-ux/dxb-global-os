import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // Phase-3+ integration tests share one local Postgres — parallel files
    // interfere (cross-file claims/wipes). Sequential is correct at DXB scale.
    fileParallelism: false,
  },
});
