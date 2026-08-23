import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// B36 · BLOCK 1 — THE ONE QUESTION, kept in the battery so it cannot rot.
//
// Agreed with the CEO and the independent auditor on 2026-08-23 as the fixed
// finish line for this block, and the only thing that reopens it:
//
//   "Can the SessionEnd hook send an INSERT, UPDATE or DELETE to the company's
//    database — regardless of how the address is spelled, regardless of a
//    missing or stale identity record, and regardless of a connection failure?"
//
// ─────────────────────────────────────────────────────────────────────────────
// WHERE THE ANSWER LIVES NOW, and why it moved. Until 2026-08-23 this file ran
// the whole drill from inside `pnpm test`, and to do that it handed the
// company's address AND its write-capable `postgres` account to a subprocess —
// line 26. The same auditor called that the first FAIL on Block 2, and he was
// right: the construction site is being cut out of the company, and a
// construction battery holding the key to the company has been cut out of
// nothing.
//
// The answer is now given in two places, and neither of them is weaker:
//
//   1. HERE — the two halves that can be measured without reaching the holding
//      at all, and they are the two that carry the argument:
//        (a) what the compiled hook can write AT ALL — read out of the artefact
//            Claude Code actually runs, which must hold exactly one write
//            construct and it must be the `cost_ledger` insert;
//        (b) that the company is recorded and is NOT among the places the hook
//            is permitted to write.
//      Together with tests/b36/hook-never-writes-company.test.ts — eighteen
//      hostile conditions, every one of them refused, measured on the
//      construction cluster — that is the answer: the only row this hook can
//      emit is a cost_ledger row, and the holding is not a place it may emit it.
//
//   2. `pnpm b36:prove-block1` — the drill, run deliberately and never by the
//      battery. It fires the compiled hook at the REAL holding under eighteen
//      hostile conditions, then looks for the hook's own signature in the
//      company's tables, measures pg_stat_statements on both sides, and checks
//      that the recorded company identity still names the live one. Block 6's
//      `verify:separation` runs it. It is the command whose output goes into
//      EVIDENCE.md, and it is not `pnpm test`.
// ─────────────────────────────────────────────────────────────────────────────

const REPO = process.cwd();
const HOOK = join(REPO, "tools/hooks/dist/tag-subscription-call.js");
const IDENTITY = join(REPO, "tools/hooks/ledger-identity.json");
const DRILL = "scripts/b36/prove-block1.mjs";

interface Identity {
  sysid: string;
  dboid: string;
  dbname: string;
}

describe("B36 Block 1 — the hook and the company's database", () => {
  it("(a) the compiled hook can write exactly one thing, and it is the construction cost ledger", () => {
    const built = readFileSync(HOOK, "utf8");
    // Kysely's write builders and raw SQL write verbs, counted separately so the
    // scan can say it found SOMETHING — a scan that matched nothing at all would
    // be a broken scanner reporting good news, which is how a detector in this
    // same block reported a comfortable zero on 2026-08-23.
    const costLedgerInserts = (built.match(/insertInto\("cost_ledger"\)/g) ?? []).length;
    const constructs = {
      "insertInto (any other table)":
        (built.match(/insertInto\(/g) ?? []).length - costLedgerInserts,
      updateTable: (built.match(/updateTable\(/g) ?? []).length,
      deleteFrom: (built.match(/deleteFrom\(/g) ?? []).length,
      "raw insert/update/delete/truncate": (
        built.match(/\b(insert\s+into|update\s+\w|delete\s+from|truncate)\b/gi) ?? []
      ).length,
    };
    expect(
      costLedgerInserts,
      "the scan found no write at all in the built hook — it proves nothing about the rest",
    ).toBe(1);
    expect(
      Object.entries(constructs).filter(([, n]) => n > 0),
      "the built hook holds a write construct that is not the cost_ledger insert",
    ).toEqual([]);
  });

  it("(b) the company is recorded, and it is not a place this hook may write", () => {
    const l = JSON.parse(readFileSync(IDENTITY, "utf8")) as {
      company: Identity | null;
      allowed: Identity[];
    };
    expect(l.company?.sysid, "the record does not say who the company is").toBeTruthy();
    expect(l.allowed.length, "the record permits nothing at all — the guard has no list").toBeGreaterThan(0);
    // The hook's own rule for "the same database", applied to the record itself:
    // same cluster AND (same oid OR same name).
    const permitted = l.allowed.filter(
      (a) =>
        a.sysid === l.company?.sysid &&
        (a.dboid === l.company?.dboid || a.dbname === l.company?.dbname),
    );
    expect(permitted, "the company's own identity is on the hook's allow list").toEqual([]);
  });

  it("(c) the drill that reaches the holding is a deliberate command, not part of the battery", () => {
    const pkg = JSON.parse(readFileSync(join(REPO, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    const cmd = pkg.scripts["b36:prove-block1"];
    expect(cmd, "`pnpm b36:prove-block1` is gone — Block 1's drill has no door left").toBeTruthy();
    expect(cmd).toContain(DRILL);
    expect(cmd, "the drill's command no longer names the company it must fire at").toContain(
      "DXB_COMPANY_URL=",
    );
    // The drill carries no address of its own: give it none and it stops rather
    // than guessing. The battery therefore cannot reach the holding through it.
    const drill = readFileSync(join(REPO, DRILL), "utf8");
    expect(
      drill,
      "the drill hard-codes an address instead of being handed one",
    ).toContain("this script carries no company address of its own");
  });
});
