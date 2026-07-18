// CEO storageState minting helper (lh-auth precedent — VERIFICATION §4.3
// discipline: credential material never enters a transcript or the repo).
//
// The CEO runs this HIMSELF, logs in (and completes TOTP if enrolled) in
// the headed window; the script saves the session's storageState to
// ~/.dxb/e2e-state.json (chmod 600, OUTSIDE the repo) and exits. Then:
//   DXB_E2E_STATE=$HOME/.dxb/e2e-state.json pnpm --filter dashboard exec playwright test
//
//   node scripts/test/e2e-login.mjs        (:3000 must be up)
import { mkdirSync, chmodSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(
  new URL("../../apps/dashboard/package.json", import.meta.url),
);
const { chromium } = require("@playwright/test");

const ORIGIN = process.env.DXB_E2E_BASE_URL ?? "http://localhost:3000";
const OUT = join(homedir(), ".dxb", "e2e-state.json");
mkdirSync(join(homedir(), ".dxb"), { recursive: true });

const browser = await chromium.launch({ headless: false });
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.goto(`${ORIGIN}/login`);
console.log("Login window is open — sign in yourself; the script does the rest.");

// Done when the app shell appears (up to 5 minutes).
await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 300_000 });
await page.waitForLoadState("networkidle");

await ctx.storageState({ path: OUT });
chmodSync(OUT, 0o600);
console.log(`storageState saved: ${OUT} (chmod 600 — never commit this file)`);
console.log("Run the authed tier with:");
console.log('  DXB_E2E_STATE="$HOME/.dxb/e2e-state.json" pnpm --filter @dxb/dashboard exec playwright test');
await browser.close();
