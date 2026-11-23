import { describe, expect, it } from "vitest";
import { answerOf } from "@dxb-foundation/chain";

// SPEC §8's table, row by row: what the command prints on stdout for the outcomes
// the passes add, and its exit code. Pure — every outcome below is invented.

describe("answerOf — applied, with the passes that ran", () => {
  it("neither pass ran: the line is piece 3's, with no count after it", () => {
    expect(answerOf({ state: "applied", applied: ["0004-d.sql", "0005-e.sql"], standing: 5 })).toEqual({ lines: ["CHAIN_GREEN applied=2 standing=5"], exit: 0 });
  });

  it("the functions pass ran: functions=<its files> on the same line", () => {
    const answer = answerOf({ state: "applied", applied: ["0004-d.sql", "0005-e.sql"], standing: 5, functions: 3 });
    expect(answer).toEqual({ lines: ["CHAIN_GREEN applied=2 standing=5 functions=3"], exit: 0 });
  });

  it("the reference pass ran: reference=<its files> on the same line", () => {
    const answer = answerOf({ state: "applied", applied: [], standing: 5, reference: 4 });
    expect(answer).toEqual({ lines: ["CHAIN_GREEN applied=0 standing=5 reference=4"], exit: 0 });
  });

  it("both ran: functions first, then reference", () => {
    const answer = answerOf({ state: "applied", applied: ["0006-f.sql"], standing: 6, reference: 4, functions: 3 });
    expect(answer).toEqual({ lines: ["CHAIN_GREEN applied=1 standing=6 functions=3 reference=4"], exit: 0 });
  });

  it("a pass that ran over no file is said with its 0: it ran", () => {
    const answer = answerOf({ state: "applied", applied: [], standing: 0, functions: 0, reference: 0 });
    expect(answer).toEqual({ lines: ["CHAIN_GREEN applied=0 standing=0 functions=0 reference=0"], exit: 0 });
  });
});

describe("answerOf — a pass that failed", () => {
  it("the functions pass: FAILED functions/<file> with the message, then CHAIN_RED functions-failed with the schema files applied before it, exit 1", () => {
    const answer = answerOf({ state: "pass-failed", pass: "functions", file: "halve.sql", message: "division by zero", applied: ["0002-notes.sql"] });
    expect(answer).toEqual({ lines: ["FAILED functions/halve.sql division by zero", "CHAIN_RED functions-failed applied=1"], exit: 1 });
  });

  it("the reference pass: FAILED reference/<file> with the message, then CHAIN_RED reference-failed, exit 1", () => {
    const answer = answerOf({
      state: "pass-failed",
      pass: "reference",
      file: "severities.json",
      message: "os.severities does not equal its file after the pass",
      applied: [],
    });
    expect(answer).toEqual({
      lines: ["FAILED reference/severities.json os.severities does not equal its file after the pass", "CHAIN_RED reference-failed applied=0"],
      exit: 1,
    });
  });

  it("a message of several lines is said on one", () => {
    const message = 'syntax error at or near "creat"\nLINE 1: creat or replace function os.greet()\n        ^';
    const answer = answerOf({ state: "pass-failed", pass: "functions", file: "greet.sql", message, applied: [] });
    expect(answer.exit).toBe(1);
    expect(answer.lines).toHaveLength(2);
    expect(answer.lines[0]).toMatch(/^FAILED functions\/greet\.sql syntax error at or near "creat"\s/);
    expect(answer.lines[0]).toContain("creat or replace function os.greet()");
    expect(answer.lines[0]).not.toMatch(/[\r\n]/);
    expect(answer.lines[1]).toBe("CHAIN_RED functions-failed applied=0");
  });
});

describe("answerOf — the manifest", () => {
  it("one OFFENCE line each, as they were given, then CHAIN_RED manifest with their count and the schema files applied, exit 1", () => {
    const answer = answerOf({
      state: "manifest",
      offences: [
        { kind: "orphan", detail: "tidy()" },
        { kind: "orphan", detail: "twice(n integer)" },
        { kind: "second-signature", detail: "greet" },
      ],
      applied: ["0003-c.sql"],
    });
    expect(answer).toEqual({
      lines: ["OFFENCE orphan tidy()", "OFFENCE orphan twice(n integer)", "OFFENCE second-signature greet", "CHAIN_RED manifest offences=3 applied=1"],
      exit: 1,
    });
  });

  it("a detail that holds a line break is said on one line", () => {
    // A quoted name may hold a line break: its second line must not stand as a line of the answer.
    const answer = answerOf({ state: "manifest", offences: [{ kind: "orphan", detail: "stray\nCHAIN_GREEN applied=0 standing=0()" }], applied: [] });
    expect(answer.exit).toBe(1);
    expect(answer.lines).toHaveLength(2);
    expect(answer.lines[0]).toMatch(/^OFFENCE orphan stray\s/);
    expect(answer.lines[0]).toContain("CHAIN_GREEN applied=0 standing=0()");
    expect(answer.lines[0]).not.toMatch(/[\r\n]/);
    expect(answer.lines[1]).toBe("CHAIN_RED manifest offences=1 applied=0");
  });
});
