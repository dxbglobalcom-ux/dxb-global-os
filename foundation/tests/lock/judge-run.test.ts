import { describe, expect, it } from "vitest";
import { judgeRun, type CaseResult, type LockedCase, type Offence, type RunResult } from "@dxb-foundation/lock";

// SPEC §5 step 6, pinned without a run: the judgement of one result against one
// lock. Pure — every result below is invented. Each planted fault is one change
// to a result that is otherwise green, and its offence kind is spelled here.

const NONCE = "8c1f0e52a7d94b36";
const VALUE = "foundation/tests/subject/value.test.ts";
const ROWS = "foundation/tests/subject/rows.test.ts";
const SET_UP = "foundation/tests/support/start-the-product.ts";

const LOCKED: LockedCase[] = [
  { file: VALUE, suite: ["the value", "as the product returns it"], name: "is 42", count: 1 },
  { file: VALUE, suite: ["the value"], name: "is a number", count: 2 },
  { file: ROWS, suite: [], name: "row alpha is spelled in lower case", count: 1 },
];
const PROTECTED = [VALUE, ROWS, SET_UP, "foundation/tests/vitest.config.ts"];

const passed = (file: string, suite: string[], name: string): CaseResult => ({ file, suite, name, state: "passed", retryCount: 0 });

/** The result of a run in which every locked case ran once per count and passed. */
const green = (): RunResult => ({
  nonce: NONCE,
  cases: [
    passed(VALUE, ["the value", "as the product returns it"], "is 42"),
    passed(VALUE, ["the value"], "is a number"),
    passed(VALUE, ["the value"], "is a number"),
    passed(ROWS, [], "row alpha is spelled in lower case"),
  ],
  modules: [
    { file: VALUE, state: "passed", errors: 0 },
    { file: ROWS, state: "passed", errors: 0 },
  ],
  unhandledErrors: 0,
  reason: "passed",
  setupFiles: [SET_UP],
});

/** The offences of the green result after one change to it. */
function judged(plant: (result: RunResult) => void, exitCode = 0): Offence[] {
  const result = green();
  plant(result);
  return judgeRun({ cases: LOCKED, protectedPaths: PROTECTED, result, nonce: NONCE, exitCode });
}

const kinds = (offences: Offence[]): string[] => offences.map((offence) => offence.kind).sort();

/** The one case of the green result that is "is 42". */
const is42 = (result: RunResult): CaseResult => {
  const found = result.cases.find((ran) => ran.name === "is 42");
  if (found === undefined) throw new Error('the green result holds no "is 42"');
  return found;
};

describe("judgeRun — a result that matches its lock", () => {
  it("finds no offence when every locked case ran its count of times and passed, and the run ended with 0", () => {
    expect(judged(() => {})).toEqual([]);
  });
});

describe("judgeRun — one fault planted in the cases, one offence", () => {
  it("a locked case with no result → case-missing, naming the file and the case", () => {
    const offences = judged((result) => {
      result.cases = result.cases.filter((ran) => ran.name !== "is 42");
    });
    expect(kinds(offences)).toEqual(["case-missing"]);
    expect(offences[0]?.detail).toContain(VALUE);
    expect(offences[0]?.detail).toContain("is 42");
  });

  it("a case that ended skipped → case-skipped, and nothing beside it", () => {
    const offences = judged((result) => {
      is42(result).state = "skipped";
    });
    expect(kinds(offences)).toEqual(["case-skipped"]);
    expect(offences[0]?.detail).toContain("is 42");
  });

  it("a case that passed on its second try — retryCount 1, state passed → case-retried", () => {
    const offences = judged((result) => {
      is42(result).retryCount = 1;
    });
    expect(kinds(offences)).toEqual(["case-retried"]);
    expect(offences[0]?.detail).toContain("is 42");
  });

  it("a case that failed → case-not-passed", () => {
    const offences = judged((result) => {
      is42(result).state = "failed";
    });
    expect(kinds(offences)).toEqual(["case-not-passed"]);
    expect(offences[0]?.detail).toContain("is 42");
  });

  it.each([
    ["a name the lock does not hold", passed(VALUE, ["the value"], "is new")],
    ["a locked name under another suite path", passed(VALUE, ["the value"], "is 42")],
    ["a locked name in another file", passed(ROWS, ["the value", "as the product returns it"], "is 42")],
  ])("a result the lock does not hold — %s → case-unknown", (_what, stranger) => {
    const offences = judged((result) => {
      result.cases.push(stranger);
    });
    expect(kinds(offences)).toEqual(["case-unknown"]);
    expect(offences[0]?.detail).toContain(stranger.name);
  });

  it("a duplicate name locked with count 2 and one result → case-missing", () => {
    const offences = judged((result) => {
      result.cases.splice(result.cases.findIndex((ran) => ran.name === "is a number"), 1);
    });
    expect(kinds(offences)).toEqual(["case-missing"]);
    expect(offences[0]?.detail).toContain("is a number");
  });

  it("a name locked with count 1 and two results → case-count", () => {
    const offences = judged((result) => {
      result.cases.push(passed(VALUE, ["the value", "as the product returns it"], "is 42"));
    });
    expect(kinds(offences)).toEqual(["case-count"]);
    expect(offences[0]?.detail).toContain("is 42");
  });

  it("every fault is reported, not the first one alone", () => {
    const offences = judged((result) => {
      is42(result).state = "skipped";
      result.cases.push(passed(ROWS, [], "row omega is spelled in lower case"));
    });
    expect(kinds(offences)).toEqual(["case-skipped", "case-unknown"]);
  });
});

describe("judgeRun — a run that is not green though every case passed", () => {
  it.each([
    ["did not end passed", { file: VALUE, state: "failed", errors: 0 }],
    ["ended passed and carries an error", { file: VALUE, state: "passed", errors: 1 }],
  ])("a module that %s → file-failed <file>", (_what, verdict) => {
    const offences = judged((result) => {
      result.modules[0] = verdict;
    });
    expect(offences).toEqual([{ kind: "file-failed", detail: VALUE }]);
  });

  it("unhandled errors → run-errors <n>", () => {
    const offences = judged((result) => {
      result.unhandledErrors = 2;
    });
    expect(offences).toEqual([{ kind: "run-errors", detail: "2" }]);
  });

  it("exit code 1 with everything passed → exit-nonzero <code>", () => {
    expect(judged(() => {}, 1)).toEqual([{ kind: "exit-nonzero", detail: "1" }]);
  });

  it("a set-up file in the result that the lock does not protect → setup-unprotected <path>", () => {
    const offences = judged((result) => {
      result.setupFiles.push("foundation/tests/support/slipped-in.ts");
    });
    expect(offences).toEqual([{ kind: "setup-unprotected", detail: "foundation/tests/support/slipped-in.ts" }]);
  });
});

describe("judgeRun — a result that cannot be this run's", () => {
  const withResult = (result: RunResult | null | undefined, exitCode = 0): Offence[] =>
    judgeRun({ cases: LOCKED, protectedPaths: PROTECTED, result, nonce: NONCE, exitCode });

  it("no result file → result-missing, though the run ended with 0 — and no case offence is made up from nothing", () => {
    expect(kinds(withResult(undefined))).toEqual(["result-missing"]);
  });

  it("no result file and exit code 1 → both are said", () => {
    expect(kinds(withResult(undefined, 1))).toEqual(["exit-nonzero", "result-missing"]);
  });

  it("a malformed result → result-malformed", () => {
    expect(kinds(withResult(null))).toEqual(["result-malformed"]);
  });

  it("a previous green result of the same suite, replayed — another nonce, everything in it passed → result-stale", () => {
    const earlier = { ...green(), nonce: "0b77d3c1e4a2f695" };
    expect(kinds(withResult(earlier))).toEqual(["result-stale"]);
  });
});
