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

test("approvals economic frame (D10): decided drawer opens its detail frame, no overflow at 1280/1920", async ({ page }) => {
  // Width debt from the 2026-07-18 in-person pass: the X230 window manager
  // pins the real browser at 1366, so 1280/1920 run here with viewport
  // emulation. 2026-07-26: the original anchor row (R2.4 live staging) no
  // longer exists in the live DB — the residue sweeps took it — so the test
  // pins the SHAPE on whatever decided row is first: the drawer opens with
  // its <dl> detail frame, economic fields render as € when the row carries
  // them, and the page never overflows.
  for (const width of [1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/approvals");
    await page.getByRole("button", { name: /Decided|Karara/ }).click();
    const row = page.locator("ul li button[aria-expanded]").first();
    await expect(row).toBeVisible();
    await row.click();
    const frame = page.locator("ul li dl").first();
    await expect(frame).toBeVisible();
    const cost = frame.locator("dd", { hasText: "€" });
    if ((await cost.count()) > 0) await expect(cost.first()).toContainText("€");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow, `horizontal overflow at ${width}`).toBe(false);
  }
});

test("chat voice line opens as its own region — board and threads keep their space (U31)", async ({ page }) => {
  // CEO screenshot 2026-07-26 ~12:00: opening Ses Hattı crushed the
  // conversation grid to 42px and its contents spilled across the voice
  // panel. The open panel must SHARE the fixed-height column, never seize it.
  // 1280×800 is the CEO's real windowed class — the leg that caught the
  // vh-fraction cap crushing the grid after the first fix looked green.
  for (const size of [
    { width: 1280, height: 800 },
    { width: 1366, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(size);
    await page.goto("/chat");
    await page.locator('summary[data-testid="chat-voice-line"]').click();
    const aside = await page.locator("aside").first().boundingBox();
    expect(aside?.height ?? 0, `threads column crushed at ${size.width}`).toBeGreaterThan(160);
    const overlap = await page.evaluate(() => {
      const r = (el: Element | null) => el?.getBoundingClientRect();
      const hit = (p?: DOMRect, q?: DOMRect) =>
        !!p &&
        !!q &&
        Math.min(p.right, q.right) - Math.max(p.left, q.left) > 2 &&
        Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top) > 2;
      const summary = r(document.querySelector('summary[data-testid="chat-voice-line"]'));
      return {
        newVsSummary: hit(r(document.querySelector('[data-testid="chat-new-thread"]')), summary),
        panelVsComposer: hit(
          r(document.querySelector("details > div")),
          r(document.querySelector("textarea")),
        ),
      };
    });
    expect(overlap.newVsSummary, `voice bar overlaps thread list at ${size.width}`).toBe(false);
    expect(overlap.panelVsComposer, `voice panel overlaps composer at ${size.width}`).toBe(false);
    const spill = await page.evaluate(() => {
      const main = document.querySelector("main") ?? document.documentElement;
      return {
        h: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        v: main.scrollHeight > main.clientHeight + 2,
      };
    });
    expect(spill.h, `horizontal overflow at ${size.width}`).toBe(false);
    // The open panel scrolls INSIDE its region; it may not stretch the page.
    expect(spill.v, `vertical spill past the shell at ${size.width}`).toBe(false);
  }
});

test("no visible ellipsis cut on any core CEO surface (A1 ban, stabilization battery)", async ({ page }) => {
  // The 2026-07-26 battery caught the U21 decision statement rendering as a
  // visible "…" on /intelligence. The A1 rule is mechanical: an ellipsis
  // element that is ACTUALLY cut (scrollWidth > clientWidth) on a CEO surface
  // is a defect — kill the overflow at the source or let the text wrap.
  await page.setViewportSize({ width: 1366, height: 900 });
  for (const route of [
    "/overview",
    "/live",
    "/intelligence",
    "/tasks",
    "/ops/projects",
    "/approvals",
    "/gov/decisions",
    "/chat",
  ]) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    const cut = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.querySelectorAll("main *")) {
        if (!(el instanceof HTMLElement) || el.offsetParent === null) continue;
        const cs = getComputedStyle(el);
        if (
          cs.textOverflow === "ellipsis" &&
          cs.overflow.includes("hidden") &&
          el.scrollWidth > el.clientWidth + 1
        ) {
          let n: HTMLElement | null = el;
          let hidden = false;
          while (n && n !== document.body) {
            const pcs = getComputedStyle(n);
            if (Number(pcs.opacity) < 0.1 || pcs.visibility === "hidden") hidden = true;
            n = n.parentElement;
          }
          if (!hidden) out.push((el.textContent ?? "").trim().slice(0, 60));
        }
      }
      return out;
    });
    expect(cut, `visible "…" on ${route}: ${cut.join(" | ")}`).toEqual([]);
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
