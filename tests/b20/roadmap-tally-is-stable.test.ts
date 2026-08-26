import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { ROADMAP, roadmapTally } from "../../scripts/governance/roadmap-tally.mjs";

// B20 · NOBODY CAN COUNT THIS PROJECT TWO DIFFERENT WAYS AGAIN.
//
// THE DEFECT THIS FILE HOLDS, opened 2026-07-17. The roadmap's completion
// figure was re-derived by hand every session, and it drifted: STATE.md's own
// comment history records 67 → re-base → 73 → a census that "supersedes carried
// arithmetic" → 74, including one openly recorded "+1 drift". The cause was
// mechanical — two table shapes in one file, a status written `✓` in one row and
// `**✓ COMPLETE**` in the next, 45 description cells carrying a pipe inside
// backticks, and one row keeping a marker past the closing pipe.
//
// The cure is a single parser that refuses to guess. These cases hold the four
// properties that make its number trustworthy: it is the same on every run, it
// is not fooled by a pipe inside code, it never silently drops a row it cannot
// read, and its buckets add up to its total.

const rooms: string[] = [];

afterAll(() => rooms.forEach((r) => rmSync(r, { recursive: true, force: true })));

/** A throwaway repository holding one roadmap file. */
function repoWith(body: string): string {
  const room = mkdtempSync(join(tmpdir(), "dxb-b20-"));
  rooms.push(room);
  mkdirSync(join(room, "HOLDING-OS-MASTER-PLAN"), { recursive: true });
  writeFileSync(join(room, ROADMAP), body, "utf8");
  return room;
}

const HEAD = "| # | İş | Kanıt | Model | Durum |\n|---|----|-------|-------|-------|\n";

describe("B20 — the roadmap tally", () => {
  it("gives the same numbers on every run over the real roadmap", () => {
    const a = roadmapTally();
    const b = roadmapTally();
    expect(a.total).toBeGreaterThan(0);
    expect(b.count).toEqual(a.count);
    expect(b.total).toBe(a.total);
    expect(a.unreadable).toEqual([]);
  });

  it("keeps the real roadmap readable — every row carries a status token", () => {
    expect(roadmapTally().unreadable).toEqual([]);
  });

  it("counts a row whose description carries a pipe inside backticks", () => {
    const t = roadmapTally(
      repoWith(HEAD + "| E1.1 | uses `a | b | c` inside code | proof | F | ✓ 2026-01-01 |\n"),
    );
    expect(t.unreadable).toEqual([]);
    expect(t.count.done).toBe(1);
  });

  it("reads the status through bold, and past a trailing marker", () => {
    const t = roadmapTally(
      repoWith(
        HEAD +
          "| E2.1 | bold status | proof | F | **✓ COMPLETE 2026-01-02** |\n" +
          "| E2.2 | marker past the wall | proof | F | **◐ half** | <!-- CEO-OK: x -->\n",
      ),
    );
    expect(t.unreadable).toEqual([]);
    expect(t.count).toMatchObject({ done: 1, partial: 1 });
  });

  it("names a row it cannot read instead of dropping it", () => {
    const t = roadmapTally(repoWith(HEAD + "| E3.1 | no token at all | proof | F | D1 done-ish |\n"));
    expect(t.total).toBe(0);
    expect(t.unreadable).toHaveLength(1);
    expect(t.unreadable[0]).toMatchObject({ id: "E3.1" });
  });

  it("never counts a header, a rule line or a prose table as a step", () => {
    const t = roadmapTally(repoWith(HEAD + "| Modül | Kilit kabul | — | — | ✓ |\n"));
    expect(t.total).toBe(0);
    expect(t.unreadable).toEqual([]);
  });

  it("adds up: the buckets are the total", () => {
    const t = roadmapTally();
    const sum = Object.values(t.count).reduce((a, b) => a + b, 0);
    expect(sum).toBe(t.total);
  });
});
