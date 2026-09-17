// B46 — THE CROWD IS FOUND *AND* OPENED, AND A HOLE IS NOT CALLED COVERED.
//
// WHAT WENT WRONG. This engine exists to read what people say. Measured on 2026-09-17 on a live
// sweep of this repository's own engine, before any repair:
//
//     kapsama: 28 çalıştı · 3 boş · 4 HATA          bulunan adres: 2 004
//     okunan gövde: 14                              reddit.raw = 245 176 bayt  ->  Reddit'ten 0 sayfa
//     yedek zinciri: 14 kapak satırı, 13'ü "YENİ BAYT YOK", yalnız 1'i gerçekten açtı
//
// Two separate faults, and both are about ORDER rather than capability:
//
//   1. THE SELECTOR WALKED THE ALPHABET. It takes one address per channel per round, and the
//      channels are visited in `sorted(glob("*.raw"))` order, so with a budget of 14 (8 inside the
//      fleet) the round ends around `openalex` and `reddit`, `stackoverflow`, `twitter`, `youtube`
//      and `zhihu` never get a turn. The engine found 445 Reddit addresses and opened none of them.
//   2. THE LAST RESORT WAS SKIPPED BY A STALE VARIABLE. `covered` was inferred AFTER the loop from
//      `$sub` — which holds whatever the loop variable was left at, not the stand-in that actually
//      answered — and from `-s` alone, so an 80-byte error text counted as a cover and the walk to
//      the site's own page never happened.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Bench, makeBench, runSweep } from "./engine-copy.js";

let b: Bench;
beforeAll(() => {
  b = makeBench();
});
afterAll(() => b?.dispose());

describe("the page selector gives the crowd its turn", () => {
  it("opens Reddit when Reddit brought addresses, even on a small budget", () => {
    // Every channel answers with twenty addresses of its own, so the only thing deciding who
    // gets read is the selector's order — which is exactly the thing under test.
    const r = runSweep(b, "what do people say about it", ["--tier", "max", "--pages", "8", "--no-browser", "--no-read"], {
      DXB_STUB_URLS: "1",
    });
    const urls = readFileSync(join(r.out, "pages", "urls.txt"), "utf8");
    const picked = urls.split("\n").filter(Boolean);
    expect(picked.length, `sweep said:\n${r.stdout.slice(-1800)}`).toBeGreaterThan(0);
    expect(urls, `the selector picked:\n${urls}`).toMatch(/reddit/);
  });

  it("gives the crowd channels the larger share of a small budget", () => {
    const r = runSweep(b, "what do people say about it", ["--tier", "max", "--pages", "8", "--no-browser", "--no-read"], {
      DXB_STUB_URLS: "1",
    });
    const picked = readFileSync(join(r.out, "pages", "urls.txt"), "utf8").split("\n").filter(Boolean);
    const crowd = picked.filter((u) => /reddit|hackernews|twitter|youtube|stackoverflow|lobsters|quora|v2ex|zhihu/.test(u));
    // On a budget of 8, at least half of what is read must come from where people talk.
    expect(crowd.length, `picked:\n${picked.join("\n")}`).toBeGreaterThanOrEqual(4);
  });
});

describe("a cover is a cover only when new bytes came back", () => {
  it("walks to the site itself when every stand-in failed", () => {
    // Every channel fails. The cascade must then say plainly that the hole stands, and the
    // last-resort walk to the site's own page must actually be attempted.
    // `wide` is the narrowest tier that carries a site-scoped channel (lobsters, devto,
    // producthunt, v2ex, quora) — a channel whose address the readers can walk to on their own.
    const r = runSweep(b, "a question nothing answers", ["--tier", "wide", "--pages", "0", "--no-browser", "--timeout", "4"], {
      DXB_STUB_RC: "7",
      DXB_STUB_BODY: "",
    });
    expect(r.stdout).toMatch(/yedek zinciri devrede/);
    // the walk is announced for at least one dead channel with a site of its own
    expect(r.stdout, r.stdout.slice(-2500)).toMatch(/son care:/);
    // five site-scoped channels, each walked with a 4 s ceiling and no browser door
  }, 40_000);

  it("never announces a stand-in that returned an error as the cover", () => {
    const r = runSweep(b, "a question nothing answers", ["--tier", "core", "--pages", "0", "--no-browser"], {
      DXB_STUB_RC: "7",
    });
    for (const line of r.stdout.split("\n")) {
      // "x -> y  ok (N bayt)" may only appear for a stand-in that truly answered; with every
      // door returning exit 7 there can be none.
      expect(line).not.toMatch(/->\s+\S+\s+ok \(\d+ bayt\)/);
    }
  });
});

describe("what the sweep prints about its own reading is measured from disk", () => {
  it("separates pages that carry real content from pages that merely answered", () => {
    const r = runSweep(b, "a question with thin answers", ["--tier", "core", "--pages", "2", "--no-browser"], {
      DXB_STUB_BODY: thinPage(b),
    });
    // The old line said "okunan 14/14 · okunamayan: 0" while four of the fourteen were an XML
    // descriptor, a donation page and two API endpoints. The count now says how many of them
    // actually carry something to read.
    expect(r.stdout).toMatch(/gercek icerikli:/);
  });
});

/** A page that answers, and says nothing — 12 words. */
function thinPage(bench: Bench): string {
  const p = join(bench.root, "thin.txt");
  execFileSync("bash", ["-c", `printf '%s' "Access to this resource requires an account. Please sign in to continue." > ${JSON.stringify(p)}`]);
  return p;
}
