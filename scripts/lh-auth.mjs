// Authed-page Lighthouse runner (08-07 residual — VERIFICATION §4.3 / §5.7).
//
// The classifier correctly blocks agents from minting a session (credential
// material must never enter a transcript), so the CEO logs in HIMSELF in a
// headed browser window this script opens; the script then reuses that
// session's cookies to run Lighthouse against the four authed pages.
//
// No secrets are printed or persisted: cookies go into a chmod-600 temp file
// that is deleted before exit; output is scores only.
//
// Run:  node scripts/lh-auth.mjs        (from repo root; :3100 must be up)
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { writeFileSync, chmodSync, rmSync, readFileSync } from "node:fs";

const ORIGIN = "http://localhost:3100";
const PAGES = [
  ["cockpit", "/"],
  ["approvals", "/approvals"],
  ["costs", "/costs"],
  ["crm", "/crm"],
];
const HEADERS_FILE = "/var/tmp/dxb/lh-headers.json";

const browser = await chromium.launchPersistentContext("", { headless: false });
const page = browser.pages()[0] ?? (await browser.newPage());
await page.goto(`${ORIGIN}/login`);
console.log("Login penceresi açıldı — giriş + TOTP'yi tamamla; sonrasını script yapar.");

// Wait (up to 5 min) for the CEO to finish login + TOTP: done when the app
// navigates off /login.
await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 300_000 });
console.log("Oturum algılandı, cookie'ler devralınıyor…");

const cookies = await browser.cookies(ORIGIN);
const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
writeFileSync(HEADERS_FILE, JSON.stringify({ Cookie: cookieHeader }));
chmodSync(HEADERS_FILE, 0o600);
const chromePath = browser.browser()?.browserType().executablePath()
  ?? chromium.executablePath();
await browser.close();

const rows = [];
try {
  for (const [name, path] of PAGES) {
    const out = `/var/tmp/dxb/lh-${name}.json`;
    execFileSync(
      "npx",
      [
        "--no-install", "lighthouse", `${ORIGIN}${path}`,
        "--extra-headers", HEADERS_FILE,
        "--only-categories=performance,accessibility",
        '--chrome-flags=--headless=new',
        "--output=json", `--output-path=${out}`, "--quiet",
      ],
      { stdio: ["ignore", "ignore", "inherit"], env: { ...process.env, CHROME_PATH: chromePath } },
    );
    const r = JSON.parse(readFileSync(out, "utf8"));
    rows.push({
      page: `${path} (${name})`,
      perf: Math.round(r.categories.performance.score * 100),
      a11y: Math.round(r.categories.accessibility.score * 100),
      lcp_s: (r.audits["largest-contentful-paint"].numericValue / 1000).toFixed(2),
    });
  }
} finally {
  rmSync(HEADERS_FILE, { force: true });
}

console.table(rows);
const fail = rows.filter((r) => r.perf < 90 || r.a11y < 90 || Number(r.lcp_s) >= 2.5);
console.log(fail.length === 0 ? "§9.4 GATE: PASS (≥90 + LCP<2.5s her sayfada)" : `§9.4 GATE: FAIL → ${fail.map((f) => f.page).join(", ")}`);
process.exit(fail.length === 0 ? 0 : 1);
