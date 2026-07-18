// L5 public tier — every scenario here runs WITHOUT a session (the auth
// wall itself is the subject). Runs on every `playwright test` invocation.
import { expect, test } from "@playwright/test";

test.describe("auth wall (proxy.ts)", () => {
  test("protected route without a session bounces to /login", async ({ page }) => {
    await page.goto("/overview");
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("approvals route is walled too (decision surface never leaks)", async ({ page }) => {
    await page.goto("/approvals");
    await page.waitForURL(/\/login/, { timeout: 15_000 });
  });
});

test.describe("login screen", () => {
  test("renders the credentials form (email + password + submit)", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test("no horizontal overflow at 1280 (RULE #0 battery, machine leg)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 860 });
    await page.goto("/login");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});

test.describe("boundary layer (E12.3) — anonymous face", () => {
  test("unknown route reveals NOTHING to anonymous visitors: wall first, /login", async ({ page }) => {
    // Measured truth 2026-07-18: the proxy wall outranks 404 (307 → /login),
    // so anonymous probing cannot enumerate which routes exist. The styled
    // root 404 itself is an authed surface — pinned in authed.spec.ts.
    await page.goto("/definitely-not-a-route");
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
