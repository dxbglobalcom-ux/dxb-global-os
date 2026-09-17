// B46 — THE JUDGE IS ONE METRE, AND IT IS NOT INVERTED.
//
// WHAT WENT WRONG, measured on 2026-09-17 by running the engine's own judging condition
// (`sweep.sh:286`) against the four pages it actually met that day:
//
//     Tavily quota notice      135 bytes  ->  ok    (counted as a working channel)
//     Firecrawl quota notice   102 bytes  ->  ok    (counted as a working channel)
//     "Access Denied" page     161 bytes  ->  ok    (counted as sound content)
//     A real Quora answer page 7 650 B    ->  FAIL  (thrown away)
//
// The judge accepted every empty refusal and discarded the one page with 400 paragraphs of real
// people on it. Two causes, both structural rather than clever: the sweep kept its OWN copy of the
// word list (so a marker removed from the owner on the same day — "Access Denied" — stayed removed
// in one place and present in the other), and it decided by GREP rather than by reading, so a
// banner printed on top of the content condemned the content under it. The reading chain one floor
// up already knew the correct rule — `rlib.looks_like_wall()` counts the words before it calls a
// banner a wall — and nobody carried it down.
//
// This case is the metre. It runs the REAL sweep on a copy of the engine with the outside world
// stubbed (tests/b46/engine-copy.ts), and it asserts the verdict the coverage table prints.

import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACCESS_DENIED,
  Bench,
  FIRECRAWL_QUOTA,
  QUORA_LOGIN_SHELL,
  QUORA_WITH_BANNER,
  TAVILY_QUOTA,
  judge,
  makeBench,
  runSweep,
  sample,
} from "./engine-copy.js";

let b: Bench;
beforeAll(() => {
  b = makeBench();
});
afterAll(() => b?.dispose());

/** Fires one channel whose answer is the given body, and returns what the table said about it. */
function verdictFor(body: string, channel = "google"): string {
  const file = sample(b, `body-${Math.random().toString(36).slice(2, 8)}.txt`, body);
  const r = runSweep(b, "a question the bench asks", ["--tier", "core", "--pages", "0", "--no-browser"], {
    DXB_STUB_BODY: file,
    DXB_STUB_ONLY: channel,
  });
  return r.verdicts[channel] ?? `(no row for ${channel} — table was:\n${Object.keys(r.verdicts).join(", ")})`;
}

describe("the sweep's judge, on the pages this engine actually met", () => {
  it("refuses a door's own quota notice instead of stamping it ok", () => {
    expect(verdictFor(TAVILY_QUOTA)).not.toMatch(/^ok$/);
    expect(verdictFor(FIRECRAWL_QUOTA)).not.toMatch(/^ok$/);
  });

  it("refuses a page that says access is denied", () => {
    expect(verdictFor(ACCESS_DENIED)).not.toMatch(/^ok$/);
  });

  it("KEEPS a real page that carries the site's error sentence on top of its content", () => {
    // The whole point. 420 paragraphs of people talking, under one banner line.
    expect(verdictFor(QUORA_WITH_BANNER)).toMatch(/^ok$/);
  });

  it("still refuses the same site's login shell, which carries the banner and nothing else", () => {
    expect(verdictFor(QUORA_LOGIN_SHELL)).not.toMatch(/^ok$/);
  });
});

describe("one metre — the sweep and the reading chain answer the same way", () => {
  const cases: [string, string, "BROKEN" | "OK"][] = [
    ["tavily quota", TAVILY_QUOTA, "BROKEN"],
    ["firecrawl quota", FIRECRAWL_QUOTA, "BROKEN"],
    ["access denied", ACCESS_DENIED, "BROKEN"],
    ["quora login shell", QUORA_LOGIN_SHELL, "BROKEN"],
    ["quora answers under a banner", QUORA_WITH_BANNER, "OK"],
  ];

  for (const [name, body, want] of cases) {
    it(`${name} → ${want}, from the engine's single judge`, () => {
      const f = sample(b, `judge-${name.replace(/\W+/g, "-")}.txt`, body);
      expect(judge(b, f)).toBe(want);
    });
  }

  it("the sweep holds no second copy of the word list", () => {
    // A second copy drifts. On 2026-09-17 it drifted within four hours, and a refused page
    // became content because one list had been updated and the other had not.
    const sweep = readFileSync(`${b.engine}/scripts/sweep.sh`, "utf8");
    expect(sweep).not.toMatch(/SITE_ERROR_RE=".*\|/);
  });
});
