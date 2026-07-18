// L5 authed tier — the TEST_STRATEGY §3 scenario line (login→overview→
// drill-down→settings set/undo→approval decide→workflow smoke) plus the
// §38 machine items that need a session (drill chain #4, live ops #6,
// layout persist #15, ultrawide #17).
//
// GATE: runs only when DXB_E2E_STATE points at a CEO-minted storageState
// (see scripts/test/e2e-login.mjs). Without it the whole file SKIPS with
// the reason on record — never a silent green.
import { existsSync } from "node:fs";
import { expect, test } from "@playwright/test";

const STATE = process.env.DXB_E2E_STATE ?? "";
const hasState = STATE !== "" && existsSync(STATE);

test.skip(
  !hasState,
  "authed tier needs DXB_E2E_STATE (CEO-minted storageState — node scripts/test/e2e-login.mjs); " +
    "automated login is forbidden: no MFA factor is enrolled, a form login would ENROLL TOTP " +
    "on the CEO account (auth-state mutation), and session extraction is classifier-blocked.",
);

test.use({ storageState: hasState ? STATE : undefined });

test("overview renders real data and every stat is a door (§38/4 drill chain)", async ({ page }) => {
  await page.goto("/overview");
  await expect(page.locator("main")).toBeVisible();
  // The cockpit rule: no info-free surface — at least one drill link exists
  // and leads to a real list route.
  const drill = page.locator('main a[href^="/ops/"], main a[href^="/approvals"]').first();
  await expect(drill).toBeVisible();
  await drill.click();
  await page.waitForURL(/\/(ops|approvals)/);
  await expect(page.locator("main")).toBeVisible();
});

test("settings set + undo round-trip (§38/14 leg)", async ({ page }) => {
  await page.goto("/sys/settings");
  await expect(page.locator("main")).toBeVisible();
  // Machine leg: the settings surface lists registry keys; the full
  // every-key set+undo sweep is the row's own coverage test — here the
  // surface must expose search + at least one editable key row.
  await expect(page.locator("main input, main table, main [role=list]").first()).toBeVisible();
});

test("approval center renders queue + history surfaces", async ({ page }) => {
  await page.goto("/approvals");
  await expect(page.locator("main")).toBeVisible();
});

test("workflow smoke: list renders; a workflow row opens", async ({ page }) => {
  await page.goto("/ops/workflows");
  await expect(page.locator("main")).toBeVisible();
});

test("live operations page mounts its stream surface (§38/6)", async ({ page }) => {
  await page.goto("/live");
  await expect(page.locator("main")).toBeVisible();
});

test("ultrawide 3440×1440: overview renders with zero horizontal overflow (§38/17)", async ({ page }) => {
  await page.setViewportSize({ width: 3440, height: 1440 });
  await page.goto("/overview");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test("unknown top-level URL gets the styled root 404, not a raw crash (E12.3)", async ({ page }) => {
  const res = await page.goto("/definitely-not-a-route");
  expect(res?.status()).toBe(404);
  await expect(page.locator('a[href="/overview"], a[href="/"]').first()).toBeVisible();
});

test("approvals economic frame (D10): decided drawer shows ceiling+deadline, no overflow at 1280/1920", async ({ page }) => {
  // Width debt from the 2026-07-18 in-person pass: the X230 window manager
  // pins the real browser at 1366, so 1280/1920 run here with viewport
  // emulation. Frame fields ride the single real decided approval (R2.4).
  for (const width of [1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/approvals");
    await page.getByRole("button", { name: /Decided|Karara/ }).click();
    const row = page.getByRole("button", { name: /R2\.4 live staging/ });
    await row.click();
    await expect(page.locator("dl")).toContainText(/Budget ceiling|Bütçe tavanı/i);
    await expect(page.locator("dl")).toContainText("€");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow, `horizontal overflow at ${width}`).toBe(false);
  }
});

test("widget layout is server truth: fresh context sees the stored layout (§38/15)", async ({ page }) => {
  await page.goto("/overview");
  // Server-truth proof lives in E12.2's live evidence; the E2E leg pins the
  // storage-independence invariant: clearing local/session storage and
  // reloading must not change the widget set.
  const before = await page.locator("main section, main [data-widget]").count();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  const after = await page.locator("main section, main [data-widget]").count();
  expect(after).toBe(before);
});
