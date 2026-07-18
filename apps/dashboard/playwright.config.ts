// L5 E2E runner (TEST_STRATEGY §3 L5, §24: `pnpm --filter dashboard exec
// playwright test`). Test files live in tests/e2e/ at the repo root (§5-6).
//
// AUTH MODEL (measured constraint, 2026-07-18): the CEO account has no MFA
// factor enrolled, so an automated form login would trigger the ENROLL step
// and MUTATE the CEO's auth state — forbidden. And session-cookie extraction
// from existing browser profiles is classifier-blocked (credential material
// never enters transcripts — lh-auth rule). Therefore:
//   - public.spec.ts runs ALWAYS (no session needed);
//   - authed.spec.ts runs only when DXB_E2E_STATE points at a storageState
//     JSON the CEO minted HIMSELF via `node scripts/test/e2e-login.mjs`
//     (headed window, he logs in, state saved chmod 600 OUTSIDE the repo).
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
