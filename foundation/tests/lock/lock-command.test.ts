import { afterAll, describe, expect, it } from "vitest";
import type { LockFile } from "@dxb-foundation/lock";
import { FOUNDATION_SCRIPTS, LOCKED_CASES, PIECE, PROTECTED_BESIDE_THE_TOOL, SUBJECT } from "./fixtures/fixture-files.ts";
import { command, copyOf, fixtureOfOneFile, git, read, replacing, stage, tail, write } from "./fixtures/fixture-repo.ts";

// SPEC §5 `lock`, on the fixture: what the real command wrote into
// foundation/locks/ when the fixture was built, and what it refuses to lock.
// Every expected case and path is spelled in fixtures/fixture-files.ts or here;
// a blob id is asked of git, never of the tool.

const LOCK_PATH = `foundation/locks/${PIECE}.json`;
const VALUE_TEST = `${SUBJECT}/value.test.ts`;

const fixture = fixtureOfOneFile();
afterAll(fixture.remove);

/** The lock the fixture's build committed. */
const theLock = async (): Promise<LockFile> => JSON.parse(read((await fixture.ready()).original, LOCK_PATH)) as LockFile;

describe("lock — the cases it holds", { timeout: 120_000 }, () => {
  it("holds every case of the locked tests with its file, its suite path and its name, and no other", async () => {
    const { cases } = await theLock();
    expect(cases).toHaveLength(LOCKED_CASES.length);
    expect(cases).toEqual(expect.arrayContaining(LOCKED_CASES));
  });

  it("holds a case inside two suites with the whole path, outer first", async () => {
    expect((await theLock()).cases).toContainEqual({
      file: VALUE_TEST,
      suite: ["the value", "as the product returns it"],
      name: "is 42",
      count: 1,
    });
  });

  it("holds the name two cases of one suite carry once, with count 2", async () => {
    const twice = (await theLock()).cases.filter((locked) => locked.name === "is a number");
    expect(twice).toEqual([{ file: VALUE_TEST, suite: ["the value"], name: "is a number", count: 2 }]);
  });

  it.each(["alpha", "beta", "gamma"])("holds the row %s of the each as a case of its own", async (row) => {
    expect((await theLock()).cases).toContainEqual({
      file: `${SUBJECT}/rows.test.ts`,
      suite: ["every row"],
      name: `row ${row} is spelled in lower case`,
      count: 1,
    });
  });
});

describe("lock — what it records beside the cases", { timeout: 120_000 }, () => {
  it("names its piece, its subject directory, its config and the foundation's scripts — not the root's other script", async () => {
    const lock = await theLock();
    expect(lock).toMatchObject({ format: 1, piece: "piece-a", dirs: ["foundation/tests/subject"], config: "foundation/tests/vitest.config.ts" });
    expect(lock.scripts).toEqual(FOUNDATION_SCRIPTS);
  });

  it.each([
    ["the helper outside the subject directory, reached by a relative import", "foundation/tests/shared/doubled.ts"],
    ["the set-up file the config names", "foundation/tests/support/start-the-product.ts"],
    ["the fixture file started by path", "foundation/tests/subject/fixtures/say-ready.ts"],
    ["a locked test", "foundation/tests/subject/states.test.ts"],
    ["the config", "foundation/tests/vitest.config.ts"],
    ["always: the tests' package file", "foundation/tests/package.json"],
    ["always: the foundation's tsconfig", "foundation/tsconfig.json"],
    ["always: the lockfile", "pnpm-lock.yaml"],
    ["always: the workspace file", "pnpm-workspace.yaml"],
  ])("protects %s, with the blob id git gives it at the lock commit", async (_what, path) => {
    const { original, lockCommit } = await fixture.ready();
    expect((await theLock()).protected[path]).toBe(git(original, "rev-parse", `${lockCommit}:${path}`));
  });

  it("protects every file of the tool, each with its blob id", async () => {
    const { original, lockCommit } = await fixture.ready();
    const toolFiles = git(original, "ls-tree", "-r", "--name-only", lockCommit, "--", "foundation/lock").split("\n");
    expect(toolFiles).toEqual(expect.arrayContaining(["foundation/lock/package.json", "foundation/lock/src/cli.ts", "foundation/lock/src/reporter.mjs"]));
    const lock = await theLock();
    for (const path of toolFiles) expect(lock.protected[path], path).toBe(git(original, "rev-parse", `${lockCommit}:${path}`));
  });

  it("protects those and nothing else — not the product, not another piece's subject directory, not the root package file", async () => {
    const { original, lockCommit } = await fixture.ready();
    const toolFiles = git(original, "ls-tree", "-r", "--name-only", lockCommit, "--", "foundation/lock").split("\n");
    expect(Object.keys((await theLock()).protected).sort()).toEqual([...PROTECTED_BESIDE_THE_TOOL, ...toolFiles].sort());
  });
});

describe("lock — the same input gives the same bytes", { timeout: 120_000 }, () => {
  it("run again, with its directory and then without one, it writes the lock it wrote before and stages nothing", async () => {
    const built = await fixture.ready();
    const repo = copyOf(built);
    for (const args of [["lock", PIECE, SUBJECT], ["lock", PIECE]]) {
      const answer = await command(repo, args);
      expect(answer.lines.at(-1), tail(answer)).toMatch(/^LOCK_WRITTEN piece=piece-a cases=\d+ protected=\d+$/);
      expect(answer.code).toBe(0);
      expect(read(repo, LOCK_PATH)).toBe(read(built.original, LOCK_PATH));
      expect(git(repo, "status", "--porcelain")).toBe("");
    }
  });
});

describe("lock — what it refuses", { timeout: 120_000 }, () => {
  /** `lock` of the piece after one change to a copy: refused with a reason, exit 2, the standing lock as it stood. */
  async function expectRefused(change: (repo: string) => void): Promise<void> {
    const built = await fixture.ready();
    const repo = copyOf(built);
    change(repo);
    const answer = await command(repo, ["lock", PIECE]);
    expect(answer.lines.at(-1), tail(answer)).toMatch(/^LOCK_REFUSED \S/);
    expect(answer.code).toBe(2);
    expect(read(repo, LOCK_PATH)).toBe(read(built.original, LOCK_PATH));
  }

  it.each([
    ["a retry", "{ retry: 2 }"],
    ["a repeat", "{ repeats: 2 }"],
  ])("a locked test that declares %s", async (_what, declared) => {
    await expectRefused((repo) => {
      const declaring = replacing(read(repo, VALUE_TEST), 'it("is doubled by the helper", () => {', `it("is doubled by the helper", ${declared}, () => {`);
      stage(repo, VALUE_TEST, declaring);
    });
  });

  it("a test file with no case", async () => {
    await expectRefused((repo) => {
      stage(repo, `${SUBJECT}/nothing-yet.test.ts`, 'import { describe } from "vitest";\n\ndescribe("nothing yet", () => {});\n');
    });
  });

  it("a relative import that leaves foundation/tests/ — the test reaches the product past its package", async () => {
    await expectRefused((repo) => {
      const reaching = replacing(read(repo, VALUE_TEST), 'from "@dxb-foundation/product";', 'from "../../product/src/index.ts";');
      stage(repo, VALUE_TEST, reaching);
    });
  });

  it("a running tool that differs from foundation/lock/ in the index", async () => {
    await expectRefused((repo) => {
      const toolFile = "foundation/lock/src/index.ts";
      write(repo, toolFile, `${read(repo, toolFile)}\n// edited in the working tree, not staged\n`);
    });
  });
});
