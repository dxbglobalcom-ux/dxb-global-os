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

test.describe("accessibility battery (E13.0) — login surface", () => {
  test("keyboard path: Tab reaches email → password → submit, focus visible", async ({ page }) => {
    await page.goto("/login");
    await page.keyboard.press("Tab");
    const order: string[] = [];
    for (let i = 0; i < 6 && order.length < 3; i++) {
      const desc = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el) return "";
        const input = el as HTMLInputElement;
        return el.tagName === "INPUT" ? `input:${input.type}` : el.tagName === "BUTTON" ? "button" : "";
      });
      if (desc && !order.includes(desc)) order.push(desc);
      await page.keyboard.press("Tab");
    }
    expect(order).toContain("input:email");
    expect(order).toContain("input:password");
    expect(order.indexOf("input:email")).toBeLessThan(order.indexOf("input:password"));
  });

  test("inputs carry accessible names (label/aria) — screen-reader path exists", async ({ page }) => {
    await page.goto("/login");
    for (const type of ["email", "password"]) {
      const named = await page.evaluate((t) => {
        const el = document.querySelector(`input[type="${t}"]`) as HTMLInputElement;
        if (!el) return false;
        return Boolean(
          el.labels?.length ||
            el.getAttribute("aria-label") ||
            el.getAttribute("aria-labelledby") ||
            el.placeholder,
        );
      }, type);
      expect(named, `input[type=${type}] accessible name`).toBe(true);
    }
  });

  test("prefers-reduced-motion: page renders and the §6 kill-switch CSS is served", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    // globals.css §6 (line ~269) declares the reduce override — assert the
    // rule actually reached the browser, not just the repo.
    const hasRule = await page.evaluate(() =>
      [...document.styleSheets].some((s) => {
        try {
          return [...s.cssRules].some(
            (r) => r instanceof CSSMediaRule && r.conditionText.includes("prefers-reduced-motion"),
          );
        } catch {
          return false;
        }
      }),
    );
    expect(hasRule).toBe(true);
    await ctx.close();
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
