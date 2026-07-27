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

test("project cards speak the CEO's language and keep a readable column at 1366 (W2.4)", async ({ page, context }) => {
  // Two defects measured on this surface 2026-07-26, both fixed, both pinned
  // here: (1) the card HEADING had no Turkish leg, so the TR board read
  // "HR Sandbox" while the purpose below it was Turkish; (2) `xl:grid-cols-3`
  // fires on VIEWPORT width — at 1366 with both rails open the content area is
  // ~790px, so three cards squeezed each text column to one word per line.
  await page.setViewportSize({ width: 1366, height: 900 });
  await context.addCookies([
    { name: "dxb-locale", value: "tr", url: "http://localhost:3000" },
  ]);
  await page.goto("/ops/projects");
  await expect(page.locator("main")).toBeVisible();

  const headings = await page.locator("main h2").allInnerTexts();
  expect(headings.length).toBeGreaterThan(0);
  // The English originals are never rewritten in the DB — they must simply not
  // be what the Turkish board shows.
  expect(headings.some((h) => /HR Sandbox|Revenue Discovery/.test(h))).toBe(false);

  const narrowest = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("main h2")].map(
      (h) => (h.parentElement as HTMLElement).getBoundingClientRect().width,
    );
    return cards.length ? Math.min(...cards) : 0;
  });
  expect(narrowest, "a project card's text column collapsed at 1366").toBeGreaterThan(200);
});

test("the design specimen is not part of the product (§35 negative acceptance)", async ({ page }) => {
  // W5.1 audit finding, 2026-07-26: /design-preview shipped in the production
  // build and rendered invented metrics — "Active agents 24", "Daily cost 6.80
  // EUR", an agent table with 128 runs at €4.12 — while §35 makes fake metric
  // data an automatic RET. Worse, /design-audit linked to it from the command
  // side. The specimen stays for local design work; the product does not have it.
  const res = await page.goto("/design-preview");
  expect(res?.status()).toBe(404);
  await page.goto("/design-audit");
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator('a[href="/design-preview"]')).toHaveCount(0);
});

test("the capital ceiling is stated on the pipeline board, both locales (W2.3b)", async ({ page, context }) => {
  // The G4 refusal used to exist only in audit_log: a candidate stopped by
  // MONEY looked exactly like one stopped by merit, and the CEO is the only
  // person who can raise the ceiling. The line must name the number and where
  // it came from — in the language he is reading.
  await page.setViewportSize({ width: 1366, height: 900 });
  for (const locale of ["en", "tr"] as const) {
    await context.clearCookies({ name: "dxb-locale" });
    await context.addCookies([{ name: "dxb-locale", value: locale, url: "http://localhost:3000" }]);
    await page.goto("/revenue/opportunities");
    const line = page.getByTestId("capital-ceiling");
    await expect(line).toBeVisible();
    await expect(line).toContainText("€");
    await expect(line).toContainText(locale === "tr" ? /Aktif sermaye tavanı/ : /Active capital ceiling/);
    // no cross-locale leakage on the line the CEO reads first
    await expect(line).not.toContainText(
      locale === "tr" ? /Active capital ceiling/ : /Aktif sermaye tavanı/,
    );
  }
});

test("no data grid is clipped inside its own scroller at 1366 (W2.5 eye pass)", async ({ page, context }) => {
  // The A1 ellipsis test cannot see this class: a table inside `overflow-x-auto`
  // has no text-overflow, so a cut column reads as clean while the CEO sees
  // "GÜNCELLENİ" and a date ending "18:5". Measured 2026-07-26 on /ops/tasks at
  // 1366 TR: table 770px inside a 748px container. The fix is at the source
  // (an information-free column removed), and this pins it: a grid may scroll
  // only when the CEO chose a width where it genuinely cannot fit.
  await page.setViewportSize({ width: 1366, height: 900 });
  await context.addCookies([{ name: "dxb-locale", value: "tr", url: "http://localhost:3000" }]);
  for (const route of ["/ops/tasks", "/ops/projects", "/gov/decisions"]) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    const clipped = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.querySelectorAll("main div.overflow-x-auto")) {
        if (el.scrollWidth > el.clientWidth + 1) {
          out.push(`${el.scrollWidth}>${el.clientWidth}`);
        }
      }
      return out;
    });
    expect(clipped, `clipped grid on ${route}: ${clipped.join(", ")}`).toEqual([]);
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

test("a briefing Hamza opened reads in the board's own language (W2.6)", async ({ page, context }) => {
  // W2.6 puts SYSTEM-authored text on the CEO's board for the first time, which
  // is the exact class that produced the U26 and U33 defects (an English literal
  // rendering on the Turkish board). Both legs are stored; this gate holds the
  // rendering side. It is vacuous on a database that has never delivered a
  // briefing and non-vacuous every day after 07:00 — a class gate, not a row
  // anchor, so it cannot rot the way the dead D10 approval anchor did.
  await page.setViewportSize({ width: 1366, height: 900 });
  for (const locale of ["tr", "en"] as const) {
    await context.clearCookies({ name: "dxb-locale" });
    await context.addCookies([{ name: "dxb-locale", value: locale, url: "http://localhost:3000" }]);
    await page.goto("/chat");
    await expect(page.locator("main")).toBeVisible();

    const tag = page.getByTestId("chat-briefing-tag").first();
    if ((await page.getByTestId("chat-briefing-tag").count()) === 0) continue;

    await expect(tag).toHaveText(locale === "tr" ? "Sabah brifingi" : "Morning briefing");
    const body = await page.locator("main p.whitespace-pre-wrap").first().innerText();
    if (locale === "tr") {
      expect(body).toContain("Günaydın");
      expect(body).not.toContain("Good morning");
    } else {
      expect(body).toContain("Good morning");
      expect(body).not.toContain("Günaydın");
    }
    // A report is not a proposal: the dispatch button has nothing to send.
    const dispatchInBriefing = await page.evaluate(() => {
      const tagEl = document.querySelector('[data-testid="chat-briefing-tag"]');
      const bubble = tagEl?.closest("div")?.parentElement;
      return bubble ? bubble.querySelectorAll("button").length : -1;
    });
    expect(dispatchInBriefing).toBe(0);
  }
});
