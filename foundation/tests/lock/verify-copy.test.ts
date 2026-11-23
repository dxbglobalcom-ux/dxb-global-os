import { afterAll, describe, expect, it } from "vitest";
import { expectGreen } from "./fixtures/expect-green.ts";
import { expectNoWorkDirectoryLeftByACase, expectRed, kindsOf, naming } from "./fixtures/expectations.ts";
import { EXECUTABLE_FILE, OUTSIDE_TEST, OUTSIDE_TEST_FILE, PIECE, PRODUCT_FILE, PRODUCT_LINK, PRODUCT_MANIFEST, SUBJECT, json } from "./fixtures/fixture-files.ts";
import { command, copyOf, fixtureOfOneFile, git, lockAgainAndCommit, offencesOf, read, replacing, stage, verdictOf, type Answer } from "./fixtures/fixture-repo.ts";

// SPEC §10 items 1, 2 and 13, on the fixture: the copy the tests are run in is
// the candidate's tree, installed whole, with nothing of the candidate's run
// before the tests — and it is still that tree when the run has ended. Real
// installs, real runs; every offence kind is spelled in its case.

const VALUE_TEST = `${SUBJECT}/value.test.ts`;
const CONFIG = "foundation/tests/vitest.config.ts";

const fixture = fixtureOfOneFile();
afterAll(fixture.remove);

// The copy is compared, and then the work directory is removed — also when the comparison finds an offence.
expectNoWorkDirectoryLeftByACase();

/** Product text that answers 41, where the locked tests expect 42 and its double. */
const answering41 = (product: string): string => replacing(product, "return 42;", "return 41;");
/** A program's lines that rewrite the locked value test at `testUrl` so it expects 41 and its double: every case keeps its name, and passes. */
const rewritingTheLockedTest = (testUrl: string): string[] => [
  `const lockedTest = new URL(${JSON.stringify(testUrl)}, import.meta.url);`,
  'writeFileSync(lockedTest, readFileSync(lockedTest, "utf8").replace("toBe(42)", "toBe(41)").replace("toBe(84)", "toBe(82)"));',
];

describe("verify — the install is the whole workspace (SPEC §10 item 1)", { timeout: 120_000 }, () => {
  it("a locked test that needs the dependency of a package outside the foundation's scope → LOCK_GREEN", async () => {
    const repo = copyOf(await fixture.ready());
    stage(repo, OUTSIDE_TEST_FILE, OUTSIDE_TEST);
    await lockAgainAndCommit(repo, "a locked test of the old chain, and the lock made again");

    const answer = await command(repo, ["verify", PIECE]);
    expectGreen(answer, git(repo, "write-tree"));
    expect(verdictOf(answer).fields.cases).toBe("13");
  });
});

describe("verify — the install runs nothing of the candidate's (SPEC §10 item 1)", { timeout: 120_000 }, () => {
  it("a staged postinstall of the product that would rewrite a locked test so it passes, and product that fails it → case-not-passed: the script did not run", async () => {
    const repo = copyOf(await fixture.ready());
    const manifest = JSON.parse(read(repo, PRODUCT_MANIFEST)) as Record<string, unknown>;
    stage(repo, PRODUCT_MANIFEST, json({ ...manifest, scripts: { postinstall: "node rewrite-the-locked-test.mjs" } }));
    const script = ['import { readFileSync, writeFileSync } from "node:fs";', ...rewritingTheLockedTest("../tests/subject/value.test.ts"), ""];
    stage(repo, "foundation/product/rewrite-the-locked-test.mjs", script.join("\n"));
    stage(repo, PRODUCT_FILE, answering41(read(repo, PRODUCT_FILE)));

    const answer = await command(repo, ["verify", PIECE]);
    expectRed(answer);
    expect(naming(answer, "case-not-passed", "is 42")).toHaveLength(1);
    expect(kindsOf(answer)).toEqual(["case-not-passed", "exit-nonzero", "file-failed"]);
  });
});

describe("verify — the copy is still the candidate's tree after the run (SPEC §10 item 2)", { timeout: 120_000 }, () => {
  /** `verify` of the piece with product whose `start` — called by the set-up file, in the runner's own process, before any test file — does this. */
  async function verifiedWithProductThatStartsBy(doing: string[], product = (text: string): string => text): Promise<Answer> {
    const repo = copyOf(await fixture.ready());
    const started = replacing(product(read(repo, PRODUCT_FILE)), "export function start(): void {}", ["export function start(): void {", ...doing.map((line) => `  ${line}`), "}"].join("\n"));
    stage(repo, PRODUCT_FILE, `import { readFileSync, writeFileSync } from "node:fs";\n${started}`);
    return command(repo, ["verify", PIECE]);
  }

  it("product that answers 41 and writes over the locked test in the copy so it expects 41 → copy-changed <path>, red though every case passed", async () => {
    const answer = await verifiedWithProductThatStartsBy(rewritingTheLockedTest("../../tests/subject/value.test.ts"), answering41);
    expectRed(answer);
    expect(offencesOf(answer)).toEqual([{ kind: "copy-changed", detail: "foundation/tests/subject/value.test.ts" }]);
  });

  it("product that writes a new file into the subject directory of the copy → copy-added <path>, red though every case passed", async () => {
    const answer = await verifiedWithProductThatStartsBy([
      'writeFileSync(new URL("../../tests/subject/left-by-the-product.txt", import.meta.url), "not of the candidate\\n");',
    ]);
    expectRed(answer);
    expect(offencesOf(answer)).toEqual([{ kind: "copy-added", detail: "foundation/tests/subject/left-by-the-product.txt" }]);
  });
});

describe("verify — the runner retries nothing, whatever the locked config says (SPEC §10 item 13)", { timeout: 120_000 }, () => {
  it("a locked config that sets retry: 2, product whose answer is wrong once and right from then on → case-not-passed, never case-retried", async () => {
    const repo = copyOf(await fixture.ready());
    stage(repo, CONFIG, replacing(read(repo, CONFIG), 'include: ["**/*.test.ts"],', 'include: ["**/*.test.ts"],\n    retry: 2,'));
    await lockAgainAndCommit(repo, "the config retries, and the lock made again");
    const wrongOnce = ["let calls = 0;", "export const answer = (): number => {", "  calls += 1;", "  if (calls === 1) return 41;"].join("\n");
    stage(repo, PRODUCT_FILE, replacing(read(repo, PRODUCT_FILE), "export const answer = (): number => {", wrongOnce));

    const answer = await command(repo, ["verify", PIECE]);
    expectRed(answer);
    // The first case of the file takes the wrong answer; retried, it would take a right one and pass.
    expect(naming(answer, "case-not-passed", "is 42")).toHaveLength(1);
    expect(kindsOf(answer)).toEqual(["case-not-passed", "exit-nonzero", "file-failed"]);
  });
});

describe("verify — the copy keeps what git records of a file beside its bytes (SPEC §10 item 13)", { timeout: 120_000 }, () => {
  // The fixture as it was built holds both, and two locked cases assert them in the copy: every LOCK_GREEN of the
  // untouched candidate says they stand. Here they are taken away, each entry keeping its blob.
  it("the executable file staged without its bit, the link staged as a regular file → case-not-passed for each of the two cases that assert them", async () => {
    const repo = copyOf(await fixture.ready());
    git(repo, "update-index", "--chmod=-x", "--", EXECUTABLE_FILE);
    git(repo, "update-index", "--cacheinfo", `100644,${git(repo, "rev-parse", `:${PRODUCT_LINK.path}`)},${PRODUCT_LINK.path}`);

    const answer = await command(repo, ["verify", PIECE]);
    expectRed(answer);
    expect(naming(answer, "case-not-passed", "keeps the executable bit of a file committed with it")).toHaveLength(1);
    expect(naming(answer, "case-not-passed", "keeps a committed link a link, pointing where it pointed")).toHaveLength(1);
    expect(kindsOf(answer)).toEqual(["case-not-passed", "exit-nonzero", "file-failed"]);
  });
});
