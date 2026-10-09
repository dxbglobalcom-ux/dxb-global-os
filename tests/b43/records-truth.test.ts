// B43 — THE RECORDS RULER'S OWN TEST: does the metre BITE before the records are judged by it?
//
// Same discipline as tests/b46/research-ruler.test.ts and tests/personas/persona-ruler.test.ts:
// the ruler is broken on purpose on a COPY of the record held in memory, and each break must go
// red; then the records as they actually stand must pass every rule. Dictated by the checker
// session on 2026-09-19, committed by the builder (audit law, 2026-09-15).
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { C, commitMsgRefusals, r2NoAwaitingOnAccepted, r4NoAcceptanceWithoutARow, r5OpenRowsStayThin, runRuler, scopeIds, staleRows } from "./records-truth.js";

const root = process.cwd();
const STATE = ".planning/STATE.md";
const BOARD = "HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md";
/** the ruler measured on ONE line standing alone — independent of how the real records stand today */
const withLine = (line: string) => ({ [STATE]: line + "\n", [BOARD]: "" });

describe("the records ruler bites", () => {
  it("rings when a record says an accepted subject still waits for his word", () => {
    const v = r2NoAwaitingOnAccepted(root, withLine("W5 and the W9 plan wait for his word (he closed the session before answering)."));
    expect(v.pass).toBe(false);
    expect(v.failures.join("\n")).toContain("studio-seats-w5-to-w6c-accepted-2026-09-15");
    expect(v.failures.join("\n")).toContain("studio-b08-step0-w9-w7-w8-accepted-2026-09-15");
  });
  it("rings on the 'his eye on' form and on 'still waits on'", () => {
    expect(r2NoAwaitingOnAccepted(root, withLine("**Waiting on him only:** his eye on W13 (LAW B).")).pass).toBe(false);
    expect(r2NoAwaitingOnAccepted(root, withLine("The bind still waits on B08 step (0).")).pass).toBe(false);
  });
  it("stays quiet on a sentence that says the eye came, and on a subject it does not know", () => {
    expect(r2NoAwaitingOnAccepted(root, withLine("W13 was accepted by his eye on 2026-09-16 and waits for nothing.")).pass).toBe(true);
    // THE FIXTURE MAY NOT NAME A LIVE SUBJECT. It said "B46 waits on his eye (LAW B)" as the
    // example of a subject the ruler does not know. On 2026-09-21 the CEO closed B46 with one
    // sentence (11879bfd), the ledger gained b46-closed-by-his-word-2026-09-21, the ruler began
    // ringing CORRECTLY - and this test went red. The record was right and the fixture was stale:
    // a fixture that names a subject whose status can change breaks on the day it changes. B99 is
    // fictional, has no board row, and the guard on the line below says so out loud - so if it
    // ever stops being fictional, this fails where the reason is written.
    expect(C.accepted.some((row) => row.subject.test("B99"))).toBe(false);
    expect(r2NoAwaitingOnAccepted(root, withLine("B99 waits on his eye (LAW B).")).pass).toBe(true);
    expect(r2NoAwaitingOnAccepted(root, withLine("the media_jobs row 16277dac, asked twice and unanswered (the W8 guard pins it).")).pass).toBe(true);
  });

  it("R2 knows his click on the delete list, and does NOT mistake it for accepting the row it served", () => {
    // He clicked the list on 2026-09-21 19:12 (b50-sweep-click-2026-09-21), so no record may say
    // that list still waits on him.
    const v = r2NoAwaitingOnAccepted(root, withLine("The folder-by-folder list with sizes still waits on his eye."));
    expect(v.pass).toBe(false);
    expect(v.failures.join("\n")).toContain("b50-sweep-click-2026-09-21");

    // But the click was on the LIST, not on the row it served. While B50 was open its record had to
    // stay free to say the author was done and his word had not arrived — LAW B — and a click row
    // spelled B50 would have forbidden exactly that. He closed B50 the same evening and it now has
    // an acceptance row of its own; the CLICK's row must still not be the one carrying it.
    const click = C.accepted.find((r) => r.id === "b50-sweep-click-2026-09-21");
    expect(click, "the click's row is gone — this case would prove nothing without it").toBeDefined();
    expect(click?.subject.test("B50")).toBe(false);

    // AND THE FIXTURE MAY NOT NAME A LIVE SUBJECT — the lesson this file learned on B46, and learned
    // again here on B50: this half was written as "B50 … WAITING ON HIS EYE" while B50 was open, and
    // went red the hour he closed it. B98 is fictional, has no board row, and the line below says so.
    expect(C.accepted.some((row) => row.subject.test("B98"))).toBe(false);
    expect(r2NoAwaitingOnAccepted(root, withLine("B98 — AUTHOR DONE, WAITING ON HIS EYE (LAW B).")).pass).toBe(true);
  });
  it("names every subject row against a registered approval", () => {
    expect(C.accepted.length).toBeGreaterThanOrEqual(7);
  });
  it("R4 rings when the ledger gains an acceptance of his eye that has no row here", () => {
    const fake = { "b99-accepted-by-his-eye-2026-09-30": { date: "2026-09-30", what: "HIS EYE HAS PASSED OVER B99." } };
    const v = r4NoAcceptanceWithoutARow(root, fake);
    expect(v.pass).toBe(false);
    expect(v.failures[0]).toContain("b99-accepted-by-his-eye-2026-09-30");
    const older = { "old-accepted-2026-08-01": { date: "2026-08-01", what: "ACCEPTED BY HIS OWN EYE." } };
    expect(r4NoAcceptanceWithoutARow(root, older).pass).toBe(true);
    const order = { "x-ordered-2026-09-30": { date: "2026-09-30", what: "W99 ORDERED, not accepted." } };
    expect(r4NoAcceptanceWithoutARow(root, order).pass).toBe(true);
  });
});

describe("the records as they stand", () => {
  it("pass every rule of the ruler", () => {
    const report = runRuler({ root });
    const text = report.verdicts.flatMap((v) => v.failures).join("\n");
    expect(text).toBe("");
    expect(report.pass).toBe(true);
  });
  it("R5 rings when an open row grows past the ceiling, and not on a closed row", () => {
    const board = readFileSync(join(root, C.board), "utf8");
    expect(r5OpenRowsStayThin(root, board).pass, "the tree itself must pass").toBe(true);
    const fat = `| B97 | 2026-09-28 | ${"x".repeat(C.rowCeiling)} | - | - | AUTHOR | - |`;
    const open = board.replace("<!-- BOARD-SECTION: open -->", `<!-- BOARD-SECTION: open -->\n${fat}`);
    const v = r5OpenRowsStayThin(root, open);
    expect(v.pass).toBe(false);
    expect(v.failures[0]).toMatch(/B97 is \d+ bytes/);
    const closed = board.replace("<!-- BOARD-SECTION: closed -->", `<!-- BOARD-SECTION: closed -->\n${fat}`);
    expect(r5OpenRowsStayThin(root, closed).pass).toBe(true);
  });
});

describe("R6 — an open row keeps up with the work committed on it (CEO 2026-10-09)", () => {
  // A synthetic board: line 1 opens the open section, line 2 is B51, line 4 opens the closed section.
  const board = [
    "<!-- BOARD-SECTION: open -->",
    "| B51 | 2026-09-28 | the defect still stands | - | - | AUTHOR | - |",
    "| B5 | 2026-09-01 | an older row | - | - | AUTHOR | - |",
    "<!-- BOARD-SECTION: closed -->",
    "| B510 | 2026-09-01 | a closed row | - | - | DONE | - |",
  ].join("\n");
  const SEP28 = Date.parse("2026-09-28T12:00:00Z") / 1000;
  const OCT04 = Date.parse("2026-10-04T12:00:00Z") / 1000;
  const OCT05 = Date.parse("2026-10-05T12:00:00Z") / 1000;
  const editedOn = (s: number) => () => s;
  const commit = (ct: number, subject: string, hash = "d364e81a") => ({ ct, hash, date: new Date(ct * 1000).toISOString().slice(0, 10), subject });

  it("(a) the B51 case: a B51-scoped commit after the row's last edit is stale", () => {
    const s = staleRows(board, editedOn(SEP28), [commit(OCT04, "fix(B51 move 5, bundle 2): the defect is gone")]);
    expect(s.map((r) => r.id)).toEqual(["B51"]);
    expect(s[0].line).toBe(2);
    expect(s[0].commit.hash).toBe("d364e81a");
  });
  it("(b) the row edited after the commit is not stale", () => {
    expect(staleRows(board, editedOn(OCT05), [commit(OCT04, "fix(B51 move 5, bundle 2): the defect is gone")])).toEqual([]);
  });
  it("(c) the id outside the scope parentheses is not counted", () => {
    const subjects = ["fix(records): audit finding B51 closed", "records: B51 mentioned in passing", "fix(records) B51: not a scope"];
    expect(staleRows(board, editedOn(SEP28), subjects.map((s) => commit(OCT04, s)))).toEqual([]);
  });
  it("(d) a scope that names no row is not counted", () => {
    expect(staleRows(board, editedOn(SEP28), [commit(OCT04, "fix(watch-links): Excel turbo prints its summary")])).toEqual([]);
  });
  it("(e) a row in the closed section is ignored", () => {
    expect(staleRows(board, editedOn(SEP28), [commit(OCT04, "fix(B510): a closed row's work")])).toEqual([]);
  });
  it("(f) B5, B51 and B510 never match one another", () => {
    expect(staleRows(board, editedOn(SEP28), [commit(OCT04, "fix(B510): a closed row's work")]).map((r) => r.id)).toEqual([]);
    expect(staleRows(board, editedOn(SEP28), [commit(OCT04, "fix(B5): only B5")]).map((r) => r.id)).toEqual(["B5"]);
    expect(staleRows(board, editedOn(SEP28), [commit(OCT04, "fix(B51): only B51")]).map((r) => r.id)).toEqual(["B51"]);
  });
  it("(g) a multi-id scope counts for each id it names", () => {
    const s = staleRows(board, editedOn(SEP28), [commit(OCT04, "records(B51 bundle 2, STATE, ledger): the row and STATE")]);
    expect(s.map((r) => r.id)).toEqual(["B51"]);
    expect(staleRows(board, editedOn(SEP28), [commit(OCT04, "records(STATE, B5): both")]).map((r) => r.id)).toEqual(["B5"]);
  });
  it("names the NEWEST naming commit", () => {
    const s = staleRows(board, editedOn(SEP28), [commit(OCT04, "fix(B51): older", "aaaa"), commit(OCT05, "fix(B51): newer", "bbbb")]);
    expect(s[0].commit.hash).toBe("bbbb");
  });
  it("(h) a `-` is part of an id, not a boundary: B03-bis never names B03", () => {
    const bis = ["<!-- BOARD-SECTION: open -->", "| B03 | 2026-09-01 | the row | - | - | AUTHOR | - |", "| B03-bis | 2026-09-01 | its leg | - | - | AUTHOR | - |"].join("\n");
    expect(staleRows(bis, editedOn(SEP28), [commit(OCT04, "fix(B03-bis): the leg's work")]).map((r) => r.id)).toEqual(["B03-bis"]);
    const ids = ["B03", "B03-bis", "B04", "B51"];
    expect(scopeIds("fix(B03-bis): the second leg", ids)).toEqual(["B03-bis"]);
    expect(scopeIds("fix(B03, B04): both", ids)).toEqual(["B03", "B04"]);
    expect(scopeIds("records(B51 bundle 2, STATE): the row and STATE", ids)).toEqual(["B51"]);
    expect(scopeIds("fix(pre-B03): a prefix is not the id", ids)).toEqual([]);
  });
});

describe("R6 at commit time — the commit being made cannot slip past (commit-msg hook)", () => {
  // Pre-commit runs before the commit exists, so R6 cannot see its subject. The commit-msg hook can:
  // when STATE is staged, every open row named in the subject's scope must be changed in the staged board.
  const board = ["<!-- BOARD-SECTION: open -->", "| B51 | 2026-09-28 | the defect | - | - | AUTHOR | - |", "| B03-bis | 2026-09-01 | a leg | - | - | AUTHOR | - |", "<!-- BOARD-SECTION: closed -->", "| B40 | 2026-09-01 | closed | - | - | DONE | - |"].join("\n");
  const STAGED = [".planning/STATE.md", "HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md"];
  const rowChanged = "@@ -2 +2 @@\n-| B51 | 2026-09-28 | the defect | - | - | AUTHOR | - |\n+| B51 | 2026-09-28 | the defect ✓ 2026-10-09 — move 5 done | - | - | AUTHOR | - |\n";
  const otherRowChanged = "@@ -3 +3 @@\n-| B03-bis | 2026-09-01 | a leg |\n+| B03-bis | 2026-09-01 | a leg ✓ 2026-10-09 — done |\n";

  it("refuses: B51 in scope, STATE staged, the B51 row unchanged", () => {
    expect(commitMsgRefusals("records(B51 bundle 2, STATE): STATE moves on", [".planning/STATE.md", "packages/x.ts"], board, "")).toEqual(["B51"]);
    expect(commitMsgRefusals("records(B51): STATE moves on", [...STAGED, "packages/x.ts"], board, otherRowChanged)).toEqual(["B51"]);
  });
  it("passes: the same commit with the B51 row changed in the staged board", () => {
    expect(commitMsgRefusals("records(B51 bundle 2, STATE): STATE moves on", STAGED, board, rowChanged)).toEqual([]);
  });
  it("passes: a records-only STATE commit naming a row the job's own commit already rewrote (Fable, 2026-10-09)", () => {
    expect(commitMsgRefusals("records(B51 step 2, STATE): the job is told", [".planning/STATE.md"], board, "")).toEqual([]);
  });
  it("passes: STATE not staged", () => {
    expect(commitMsgRefusals("fix(B51 move 5): the code", ["src/x.ts"], board, "")).toEqual([]);
  });
  it("passes: the id is not in the scope, or names a closed row", () => {
    expect(commitMsgRefusals("records(STATE): B51 mentioned in passing", [".planning/STATE.md"], board, "")).toEqual([]);
    expect(commitMsgRefusals("records(B40): a closed row", [".planning/STATE.md"], board, "")).toEqual([]);
  });
  it("B03-bis in scope does not ask for a B03 row change, and a B03-bis change satisfies it", () => {
    expect(commitMsgRefusals("fix(B03-bis): the leg", STAGED, board, otherRowChanged)).toEqual([]);
    expect(commitMsgRefusals("fix(B03-bis): the leg", [...STAGED, "packages/x.ts"], board, rowChanged)).toEqual(["B03-bis"]);
  });
});
