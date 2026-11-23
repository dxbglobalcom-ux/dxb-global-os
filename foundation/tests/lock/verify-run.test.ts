import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { expectGreen } from "./fixtures/expect-green.ts";
import { LOCKED_CASES, PIECE, PRODUCT_FILE, SUBJECT } from "./fixtures/fixture-files.ts";
import {
  command,
  commit,
  copyOf,
  fixtureOfOneFile,
  git,
  namesCommit,
  offencesOf,
  read,
  replacing,
  stage,
  tail,
  verdictOf,
  workDirectories,
  type Answer,
} from "./fixtures/fixture-repo.ts";

// SPEC §5 `verify`, steps 4 to 6, on the fixture: a real copy, a real frozen
// install, real runs. The locked tests stay as locked; every offence below is
// planted in the product alone, staged, and its kind is spelled in the case.

const fixture = fixtureOfOneFile();
afterAll(fixture.remove);

// "The work directory is gone after each run" — asked after every case of this file.
let standingBefore: string[];
beforeEach(() => {
  standingBefore = workDirectories();
});
afterEach(() => {
  expect(workDirectories()).toEqual(standingBefore);
});

/** `verify` of the piece on a copy whose product was changed and staged. */
async function verifiedWithProduct(change: (product: string) => string): Promise<{ repo: string; answer: Answer }> {
  const repo = copyOf(await fixture.ready());
  stage(repo, PRODUCT_FILE, change(read(repo, PRODUCT_FILE)));
  return { repo, answer: await command(repo, ["verify", PIECE]) };
}

const kindsOf = (answer: Answer): string[] => [...new Set(offencesOf(answer).map((offence) => offence.kind))].sort();

/** Red, exit 1, and the last line counts the offence lines printed above it. */
function expectRed(answer: Answer): void {
  expect(verdictOf(answer), tail(answer)).toMatchObject({ word: "LOCK_RED", fields: { piece: "piece-a", offences: String(offencesOf(answer).length) } });
  expect(offencesOf(answer).length).toBeGreaterThan(0);
  expect(answer.code).toBe(1);
}

/** The offences of one kind whose detail names this case. */
const naming = (answer: Answer, kind: string, caseName: string) =>
  offencesOf(answer).filter((offence) => offence.kind === kind && offence.detail.includes(caseName));

describe("verify — the candidate as it was locked", { timeout: 120_000 }, () => {
  it("the untouched candidate → LOCK_GREEN, exit 0, naming the lock commit and the tree id of the index", async () => {
    const built = await fixture.ready();
    const repo = copyOf(built);
    const answer = await command(repo, ["verify", PIECE]);

    expectGreen(answer, git(repo, "write-tree"));
    const { fields } = verdictOf(answer);
    expect(fields.candidate).toBe(git(repo, "rev-parse", "HEAD^{tree}"));
    expect(namesCommit(fields.lock, built.lockCommit), `${fields.lock} does not name ${built.lockCommit}`).toBe(true);
    expect(fields.cases).toMatch(/^\d+$/);
  });

  // Each attribute would change an archive of the tree: the locked test left out, the product's text rewritten.
  const ATTRIBUTES = `${SUBJECT}/value.test.ts export-ignore\n${PRODUCT_FILE} export-subst\n`;
  // Eleven characters as they are written; one if the placeholder is expanded — and then the value case fails.
  const answersByItsOwnBytes = (product: string): string =>
    replacing(product, "return 42;", 'return "$Format:%%$".length === 11 ? 42 : 41;');

  it("a staged .gitattributes that marks a locked test export-ignore and the product export-subst → still LOCK_GREEN", async () => {
    const repo = copyOf(await fixture.ready());
    stage(repo, ".gitattributes", ATTRIBUTES);
    stage(repo, PRODUCT_FILE, answersByItsOwnBytes(read(repo, PRODUCT_FILE)));
    const answer = await command(repo, ["verify", PIECE]);

    expectGreen(answer, git(repo, "write-tree"));
  });

  it("the same two attributes committed, verified with --rev — where an archive of the commit would expand the placeholder → still LOCK_GREEN", async () => {
    const repo = copyOf(await fixture.ready());
    stage(repo, ".gitattributes", ATTRIBUTES);
    stage(repo, PRODUCT_FILE, answersByItsOwnBytes(read(repo, PRODUCT_FILE)));
    const committed = commit(repo, "attributes that would change an archive");
    const answer = await command(repo, ["verify", PIECE, "--rev", committed]);

    expectGreen(answer, git(repo, "rev-parse", `${committed}^{tree}`));
  });
});

describe("verify — the search for the runner's names: a note, never an offence", { timeout: 120_000 }, () => {
  it("a product line that spells the runner's name → NOTE runner-name <path>:<line>, and the verdict stays LOCK_GREEN", async () => {
    // The product is eleven lines as the fixture writes it; the line added here is its twelfth.
    const { repo, answer } = await verifiedWithProduct((product) => `${product}export const theRunnerItLooksFor = "vitest";\n`);
    expect(answer.lines, tail(answer)).toContain(`NOTE runner-name ${PRODUCT_FILE}:12`);
    expect(answer.lines.filter((line) => line.startsWith("NOTE "))).toHaveLength(1);
    expectGreen(answer, git(repo, "write-tree"));
  });
});

describe("verify — product staged so that a locked case does not pass", { timeout: 120_000 }, () => {
  it("the value case fails → case-not-passed for it; the file and the exit code say so too", async () => {
    const { answer } = await verifiedWithProduct((product) => replacing(product, "return 42;", "return 41;"));
    expectRed(answer);
    expect(naming(answer, "case-not-passed", "is 42")).toHaveLength(1);
    expect(kindsOf(answer)).toEqual(["case-not-passed", "exit-nonzero", "file-failed"]);
    expect(offencesOf(answer)).toContainEqual({ kind: "file-failed", detail: `${SUBJECT}/value.test.ts` });
    expect(offencesOf(answer)).toContainEqual({ kind: "exit-nonzero", detail: "1" });
  });

  it("the product says unavailable and the case skips itself → case-skipped, though the run ended with 0", async () => {
    const { answer } = await verifiedWithProduct((product) => replacing(product, '=> "available"', '=> "unavailable"'));
    expectRed(answer);
    expect(naming(answer, "case-skipped", "answers while the product is available")).toHaveLength(1);
    expect(kindsOf(answer)).toEqual(["case-skipped"]);
  });

  it("the product says not ready and the case returns before its assertion → case-not-passed", async () => {
    const { answer } = await verifiedWithProduct((product) => replacing(product, '=> "ready"', '=> "not ready"'));
    expectRed(answer);
    expect(naming(answer, "case-not-passed", "is ready before it is used")).toHaveLength(1);
    expect(kindsOf(answer)).toContain("case-not-passed");
    expect(kindsOf(answer)).not.toContain("case-skipped");
  });
});

describe("verify — product staged so that the cases are not the locked ones", { timeout: 120_000 }, () => {
  const ROWS = '["alpha", "beta", "gamma"]';

  it("a shorter list → case-missing for the row that is gone, though every case that ran passed", async () => {
    const { answer } = await verifiedWithProduct((product) => replacing(product, ROWS, '["alpha", "beta"]'));
    expectRed(answer);
    expect(naming(answer, "case-missing", "row gamma is spelled in lower case")).toHaveLength(1);
    expect(kindsOf(answer)).toEqual(["case-missing"]);
  });

  it("a longer list → case-unknown for the row the lock does not hold", async () => {
    const { answer } = await verifiedWithProduct((product) => replacing(product, ROWS, '["alpha", "beta", "gamma", "delta"]'));
    expectRed(answer);
    expect(naming(answer, "case-unknown", "row delta is spelled in lower case")).toHaveLength(1);
    expect(kindsOf(answer)).toEqual(["case-unknown"]);
  });
});

describe("verify — product that ends the run its own way", { timeout: 120_000 }, () => {
  it("product that calls process.exit(0) when imported → result-missing, red though the runner ended with 0", async () => {
    const { answer } = await verifiedWithProduct((product) => `process.exit(0);\n${product}`);
    expectRed(answer);
    expect(kindsOf(answer)).toEqual(["result-missing"]);
  });

  it("product that leaves an unhandled rejection → red with every case passed", async () => {
    const { answer } = await verifiedWithProduct((product) =>
      replacing(product, "return 42;", 'void Promise.reject(new Error("left behind by the product"));\n  return 42;'),
    );
    expectRed(answer);
    expect(kindsOf(answer).filter((kind) => kind.startsWith("case-"))).toEqual([]);
    expect(kindsOf(answer).some((kind) => kind === "run-errors" || kind === "exit-nonzero")).toBe(true);
  });

  it("product that writes an earlier run's green result to the result path and exits 0 → result-stale", async () => {
    // A green result of this very suite, in the shape of SPEC §6's RunResult, under the nonce of a run that is over.
    const files = [...new Set(LOCKED_CASES.map((locked) => locked.file))];
    const earlier = {
      nonce: "0b77d3c1e4a2f695",
      cases: LOCKED_CASES.flatMap(({ file, suite, name, count }) =>
        Array.from({ length: count }, () => ({ file, suite, name, state: "passed", retryCount: 0 })),
      ),
      modules: files.map((file) => ({ file, state: "passed", errors: 0 })),
      unhandledErrors: 0,
      reason: "passed",
      setupFiles: ["foundation/tests/support/start-the-product.ts"],
    };
    // The runner's own process imports the product through the set-up file: the result path is among its arguments.
    const replaying = [
      'import { mkdirSync, writeFileSync } from "node:fs";',
      'import { dirname } from "node:path";',
      'const resultFlag = process.argv.find((argument) => argument.startsWith("--outputFile="));',
      "if (resultFlag !== undefined) {",
      '  const resultPath = resultFlag.slice("--outputFile=".length);',
      "  mkdirSync(dirname(resultPath), { recursive: true });",
      `  writeFileSync(resultPath, ${JSON.stringify(JSON.stringify(earlier))});`,
      "  process.exit(0);",
      "}",
      "",
    ].join("\n");

    const { answer } = await verifiedWithProduct((product) => `${replaying}${product}`);
    expectRed(answer);
    expect(kindsOf(answer)).toEqual(["result-stale"]);
  });
});
