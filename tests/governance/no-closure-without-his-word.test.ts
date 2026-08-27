// B10 — the guard the CEO ordered on 2026-08-27, and the test that keeps it.
//
// WHAT IT IS FOR, in his own words. The author wiped the rented box on his
// order, then decided by himself that board rows B09, B10 and B11 were void
// with it and wrote the closed token on all three. B10 was never about that
// box — it is the dashboard showing the holding's night work as a living
// organism, and not one line of it has been written. He caught it:
// "KAHPE GİBİ NEDEN B10 TAMAMLANDI KAPANDI YAZDIN … BEN BUNU FARKETMESEM BOK
// GİBİ MAHVOLACAKTIK". Then: "1-KOY".
//
// The old gate could not convict it. Its LAW B check catches a CLAIM that he
// approved something; the author claimed nothing, he closed a row in silence.
//
// THIS SUITE CALLS THE REAL RULE, never a copy of it. B39's lesson, measured on
// this repository: a case that holds its own copy of a predicate tests the copy,
// and the predicate can then be deleted from the real file with the suite still
// green. Delete a line from closure-guard.mjs and a case here turns red.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  closuresWithoutHisWord,
  closedRowCount,
} from "../../scripts/governance/closure-guard.mjs";

const REPO = join(import.meta.dirname, "..", "..");
const BOARD = join(REPO, "HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md");
const APPROVALS = join(REPO, "scripts/governance/ceo-approvals.json");

const KAYITLI = { "gercek-onay-2026-08-27": { date: "2026-08-27" } };

const row = (id: string, desc: string) =>
  `| ${id} | 2026-08-27 | ${desc} | SPEC | waits | AUTHOR | test |`;

describe("no closure without his word", () => {
  it("convicts the exact defect he caught: a row closed in silence", () => {
    // His case, replayed: the author's own words on B10 that night, with no
    // approval behind them and no claim of one either.
    const board = row(
      "B10",
      "**✓ CLOSED 2026-08-27 — VOID BY HIS ORDER, NOT DONE BY WORK.** The thing this row tracked no longer exists on any machine.",
    );
    const bad = closuresWithoutHisWord(board, KAYITLI);
    expect(bad).toHaveLength(1);
    expect(bad[0].id).toBe("B10");
    expect(bad[0].reason).toBe("no-marker");
  });

  it("convicts a closure that names an approval nobody registered", () => {
    const board = row(
      "B24",
      "**✓ CLOSED 2026-08-27** <!-- CEO-OK: uydurma-onay-2026-08-27 --> he said yes, honestly",
    );
    const bad = closuresWithoutHisWord(board, KAYITLI);
    expect(bad).toHaveLength(1);
    expect(bad[0].reason).toBe("unregistered");
    expect(bad[0].approvalId).toBe("uydurma-onay-2026-08-27");
  });

  it("lets through a closure his own eye accepted", () => {
    const board = row(
      "B36",
      "**✓ CLOSED 2026-08-27** <!-- CEO-OK: gercek-onay-2026-08-27 --> his sentence is in the register",
    );
    expect(closuresWithoutHisWord(board, KAYITLI)).toEqual([]);
  });

  it("says nothing about a row that is open", () => {
    const board = row("B09", "**Hermes has no brain** — the server runs but cannot think");
    expect(closuresWithoutHisWord(board, KAYITLI)).toEqual([]);
    expect(closedRowCount(board)).toBe(0);
  });

  it("does not mistake a row that QUOTES another ledger's closure for its own", () => {
    // B18's real shape: wide open, and it quotes complaint C9 mid-sentence as
    // "✓ CLOSED (help+ambient)". The token must open a cell, never merely
    // appear inside one.
    const board = row(
      "B18",
      'the help lane is open; complaint C9 reads *"✓ CLOSED (help+ambient) / ◐ filters"* and this row is not',
    );
    expect(closuresWithoutHisWord(board, KAYITLI)).toEqual([]);
    expect(closedRowCount(board)).toBe(0);
  });

  it("reads a pipe inside a code span as text, not as a cell wall", () => {
    const board = row(
      "B20",
      "**✓ CLOSED 2026-08-27** <!-- CEO-OK: gercek-onay-2026-08-27 --> `pnpm a | wc -l` prints it",
    );
    expect(closuresWithoutHisWord(board, KAYITLI)).toEqual([]);
    expect(closedRowCount(board)).toBe(1);
  });

  it("runs against the live board and the live register, and reports what it finds", () => {
    const board = readFileSync(BOARD, "utf8");
    const approvals = JSON.parse(readFileSync(APPROVALS, "utf8"));
    const bad = closuresWithoutHisWord(board, approvals);
    // The board's closed rows are real, so this case does not assert a number
    // that would rot; it asserts the shape of every verdict, so a malformed
    // finding can never reach him as a sentence he cannot act on.
    for (const b of bad) {
      expect(b.id).toMatch(/^[BC]\d+(-bis)?$/);
      expect(b.lineNo).toBeGreaterThan(0);
      expect(["no-marker", "unregistered"]).toContain(b.reason);
    }
    expect(closedRowCount(board)).toBeGreaterThanOrEqual(bad.length);
  });
});
