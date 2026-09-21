// B43 — THE RECORDS RULER'S OWN TEST: does the metre BITE before the records are judged by it?
//
// Same discipline as tests/b46/research-ruler.test.ts and tests/personas/persona-ruler.test.ts:
// the ruler is broken on purpose on a COPY of the record held in memory, and each break must go
// red; then the records as they actually stand must pass every rule. Dictated by the checker
// session on 2026-09-19, committed by the builder (audit law, 2026-09-15).
import { describe, expect, it } from "vitest";
import { C, r2NoAwaitingOnAccepted, r4NoAcceptanceWithoutARow, runRuler } from "./records-truth.js";

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
});
