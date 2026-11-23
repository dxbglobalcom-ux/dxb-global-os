import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// The foundation's own test run. Its root is this directory, so nothing of the
// old system's battery — its root config, its set-up, its environment — is loaded.
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  // Given inline, so the runner searches no directory — this one or any above it — for a PostCSS
  // configuration: a file found there would be loaded into the runner's own process.
  css: { postcss: { plugins: [] } },
  test: {
    include: ["**/*.test.ts"],
    // The suites share one host lock and one bench; they run one file at a time.
    fileParallelism: false,
  },
});
