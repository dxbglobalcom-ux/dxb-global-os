// L5 E2E runner (TEST_STRATEGY §3 L5, §24: `pnpm --filter dashboard exec
// playwright test`). Test files live in tests/e2e/ at the repo root (§5-6).
//
// AUTH MODEL: the engineers hold the dashboard login through their own
// account on the construction engine (CEO 2026-10-21, ledger
// engineer-account-holds-the-keys-2026-10-21) — never the CEO's. Therefore:
//   - public.spec.ts runs ALWAYS (no session needed);
//   - authed.spec.ts runs only when DXB_E2E_STATE points at a storageState
//     JSON minted without a human by `node scripts/test/e2e-state-mint.mjs`
//     (chmod 600, OUTSIDE the repo; see that file and board row B03-bis).
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "../../tests/e2e",
  outputDir: "../../tests/e2e/evidence/artifacts",
  timeout: 60_000, // §17: 60s per E2E scenario, fixed
  fullyParallel: false,
  retries: 0, // §17: silent retry-until-green is forbidden
  reporter: [["list"]],
  use: {
    baseURL: process.env.DXB_E2E_BASE_URL ?? "http://localhost:3000",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
