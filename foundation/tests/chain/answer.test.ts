import { describe, expect, it } from "vitest";
import { TargetRefused } from "@dxb-foundation/bench";
import { ChainRefused, answerOf } from "@dxb-foundation/chain";

// SPEC §8's table, row by row: what the command prints on stdout for an outcome
// or a refusal, and its exit code. Pure — every outcome below is invented. The
// table's last row, the usage line, is no outcome: the command's own cases say it.

describe("answerOf — a run that ended in an outcome", () => {
  it("applied: CHAIN_GREEN with how many were applied now and how many stand, exit 0", () => {
    const answer = answerOf({ state: "applied", applied: ["0004-d.sql", "0005-e.sql"], standing: 5 });
    expect(answer).toEqual({ lines: ["CHAIN_GREEN applied=2 standing=5"], exit: 0 });
  });

  it("applied, with nothing to apply: CHAIN_GREEN applied=0, exit 0", () => {
    expect(answerOf({ state: "applied", applied: [], standing: 3 })).toEqual({ lines: ["CHAIN_GREEN applied=0 standing=3"], exit: 0 });
  });

  it("offences: one OFFENCE line each, as they were given, then CHAIN_RED with their count, exit 1", () => {
    const answer = answerOf({
      state: "offences",
      offences: [
        { kind: "changed", detail: "0001-a.sql" },
        { kind: "renamed", detail: "0003-c.sql 0003-c-renamed.sql" },
        { kind: "before-applied", detail: "0005-late.sql" },
      ],
    });
    expect(answer).toEqual({
      lines: ["OFFENCE changed 0001-a.sql", "OFFENCE renamed 0003-c.sql 0003-c-renamed.sql", "OFFENCE before-applied 0005-late.sql", "CHAIN_RED offences=3"],
      exit: 1,
    });
  });

  it("file-failed: FAILED with the file and the server's message, then CHAIN_RED with how many were applied before it, exit 1", () => {
    const answer = answerOf({ state: "file-failed", file: "0003-c.sql", message: "division by zero", applied: ["0001-a.sql", "0002-b.sql"] });
    expect(answer).toEqual({ lines: ["FAILED 0003-c.sql division by zero", "CHAIN_RED file-failed applied=2"], exit: 1 });
  });

  it("file-failed: a message of several lines is said on one", () => {
    const message = 'syntax error at or near "creat"\nLINE 1: creat table public.c (id integer);\n        ^';
    const answer = answerOf({ state: "file-failed", file: "0001-a.sql", message, applied: [] });
    expect(answer.exit).toBe(1);
    expect(answer.lines).toHaveLength(2);
    expect(answer.lines[0]).toMatch(/^FAILED 0001-a\.sql syntax error at or near "creat"\s/);
    expect(answer.lines[0]).toContain("creat table public.c (id integer);");
    expect(answer.lines[0]).not.toMatch(/[\r\n]/);
    expect(answer.lines[1]).toBe("CHAIN_RED file-failed applied=0");
  });
});

describe("answerOf — a run that was refused", () => {
  it.each([
    ["no-chain", "CHAIN_REFUSED no-chain"],
    ["busy", "CHAIN_REFUSED busy"],
    ["ledger-unknown", "CHAIN_REFUSED ledger-unknown"],
  ] as const)("ChainRefused %s: %s, exit 2", (reason, line) => {
    expect(answerOf(new ChainRefused(reason))).toEqual({ lines: [line], exit: 2 });
  });

  it.each([
    ["company", "CHAIN_REFUSED target-company"],
    ["old-bench", "CHAIN_REFUSED target-old-bench"],
    ["not-listed", "CHAIN_REFUSED target-not-listed"],
    ["unreadable", "CHAIN_REFUSED target-unreadable"],
  ] as const)("the bench's TargetRefused %s: %s, exit 2", (reason, line) => {
    expect(answerOf(new TargetRefused(reason))).toEqual({ lines: [line], exit: 2 });
  });
});
