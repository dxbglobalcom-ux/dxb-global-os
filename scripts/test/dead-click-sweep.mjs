// Ledger 3a/3b — repo-wide dead-click sweep (2026-07-24). For every nav
// route (plus optional detail routes via argv), flags elements that LOOK
// clickable but do nothing:
//   pointer-no-action  cursor:pointer, visible, no interactive ancestor
//                      (a[href]/button/select/label/input/textarea/summary/
//                      [role=button|tab]) and no React onClick within 6
//                      ancestor levels (__reactProps$ — React delegates DOM
//                      listeners to the root, CDP getEventListeners is blind)
//   anchor-no-href     <a> without href or href="#"
//   dead-button        enabled <button> outside any form with no React onClick
//
// React 19 selective hydration: Suspense islands hydrate AFTER networkidle,
// so every candidate is re-verified once after an extra settle — the first
// pass alone reports working late-hydrating controls as dead (measured
// 2026-07-24: 364 false positives, all vanished after settle).
//
// Usage: node scripts/test/dead-click-sweep.mjs [extraRoute ...]
//   requires :3000 up and ~/.dxb/e2e-state.json (CEO storageState)
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join } from "node:path";

const require = createRequire(
  new URL("../../apps/dashboard/package.json", import.meta.url),
);
const { chromium } = require("@playwright/test");

const NAV_ROUTES = [
  "/ai/knowledge","/ai/library","/ai/mcp","/ai/memory","/ai/models","/ai/orchestration",
  "/ai/plugins","/ai/skills","/alerts","/approvals","/chat","/fin/budgets","/fin/capacity",
  "/fin/costs","/fin/pnl","/fin/providers","/fin/tokens","/gov/audit","/gov/decisions",
  "/gov/permissions","/gov/policies","/gov/risks","/gov/security","/intelligence","/live",
  "/ops/automations","/ops/projects","/ops/runtime","/ops/tasks","/ops/workflows","/org",
  "/org/companies","/org/departments","/org/directors","/org/employees","/org/hr",
  "/overview","/revenue","/revenue/crm","/revenue/objectives","/revenue/opportunities",
  "/revenue/portfolio","/sys/backups","/sys/health","/sys/integrations","/sys/logs",
  "/sys/settings",
];
const ROUTES = [...NAV_ROUTES, ...process.argv.slice(2)];

const SCAN = () => {
  const hasReactClick = (el) => {
    let n = el;
    for (let i = 0; i < 6 && n; i++) {
      const key = Object.keys(n).find((k) => k.startsWith("__reactProps$"));
      const p = key ? n[key] : null;
      if (p && (p.onClick || p.onMouseDown || p.onPointerDown)) return true;
      n = n.parentElement;
    }
    return false;
  };
  const out = [];
  const label = (el) =>
    (el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 60).replace(/\s+/g, " ");
  for (const el of document.body.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (r.width <= 4 || r.height <= 4) continue;
    const tag = el.tagName.toLowerCase();
    if (tag === "a") {
      const href = el.getAttribute("href");
      if (!href || href === "#") out.push({ kind: "anchor-no-href", tag, text: label(el) });
      continue;
    }
    if (tag === "button") {
      if (!el.disabled && !el.closest("form") && !hasReactClick(el))
        out.push({ kind: "dead-button", tag, text: label(el) });
      continue;
    }
    if (getComputedStyle(el).cursor !== "pointer") continue;
    if (
      el.closest(
        'a[href], button, select, label, input, textarea, summary, [role="button"], [role="tab"]',
      )
    )
      continue;
    if (hasReactClick(el)) continue;
    out.push({ kind: "pointer-no-action", tag, text: label(el) });
  }
  return out;
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  storageState: join(homedir(), ".dxb", "e2e-state.json"),
});
await ctx.addCookies([
  { name: "dxb-locale", value: "en", domain: "localhost", path: "/" },
]);
const page = await ctx.newPage();
await page.setViewportSize({ width: 1920, height: 950 });

const findings = [];
for (const route of ROUTES) {
  try {
    await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    let rows = await page.evaluate(SCAN);
    if (rows.length > 0) {
      // selective-hydration settle, then re-verify
      await page.waitForTimeout(3000);
      rows = await page.evaluate(SCAN);
    }
    for (const r of rows) findings.push({ route, ...r });
  } catch (e) {
    findings.push({ route, kind: "SWEEP-ERROR", tag: "-", text: String(e).slice(0, 80) });
  }
}
await browser.close();

const seen = new Set();
for (const f of findings) {
  const k = `${f.route}|${f.kind}|${f.text}`;
  if (seen.has(k)) continue;
  seen.add(k);
  console.log(`${f.route} | ${f.kind} | <${f.tag}> "${f.text}"`);
}
console.log(`DEAD-CLICK SWEEP: ${seen.size} findings across ${ROUTES.length} routes`);
process.exit(seen.size ? 1 : 0);
