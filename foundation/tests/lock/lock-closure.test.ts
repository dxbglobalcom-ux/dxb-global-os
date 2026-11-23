import { afterAll, describe, expect, it } from "vitest";
import type { LockFile } from "@dxb-foundation/lock";
import { expectRefused } from "./fixtures/expectations.ts";
import { PIECE, SUBJECT } from "./fixtures/fixture-files.ts";
import { command, commit, copyOf, fixtureOfOneFile, git, read, replacing, stage, tail, type Answer } from "./fixtures/fixture-repo.ts";

// SPEC §10 items 3 and 4, on the fixture: what a lock protects beyond the files
// it was pointed at is never silently less than what the tests reach. Each case
// is a copy changed, staged and locked again; a blob id is asked of git.

const LOCK_PATH = `foundation/locks/${PIECE}.json`;
const VALUE_TEST = `${SUBJECT}/value.test.ts`;
const HELPER_IMPORT = 'import { doubled } from "../shared/doubled.ts";';

const fixture = fixtureOfOneFile();
afterAll(fixture.remove);

type Locked = { repo: string; answer: Answer };

/** `lock` of the piece again, on a copy after one change to it. */
async function lockedAfter(change: (repo: string) => void): Promise<Locked> {
  const repo = copyOf(await fixture.ready());
  change(repo);
  return { repo, answer: await command(repo, ["lock", PIECE]) };
}

/** Stages the value test with one line more, standing after its imports: what the locked test reaches beside them. */
function reachAlso(repo: string, line: string): void {
  stage(repo, VALUE_TEST, replacing(read(repo, VALUE_TEST), HELPER_IMPORT, `${HELPER_IMPORT}\n${line}`));
}

function expectWritten({ answer }: Locked): void {
  expect(answer.lines.at(-1), tail(answer)).toMatch(/^LOCK_WRITTEN piece=piece-a cases=\d+ protected=\d+$/);
  expect(answer.code).toBe(0);
}

/** The lock was written, and it protects `path` with the blob id the index gives it. */
function expectProtected(locked: Locked, path: string): void {
  expectWritten(locked);
  const lock = JSON.parse(read(locked.repo, LOCK_PATH)) as LockFile;
  expect(lock.protected[path], `${path} is not protected`).toBe(git(locked.repo, "rev-parse", `:${path}`));
}

describe("lock — a relative specifier is resolved as the runner resolves it", { timeout: 120_000 }, () => {
  it.each([
    ["spelled .js while the index holds the .ts", 'import "../shared/second.js";', "foundation/tests/shared/second.ts"],
    ["spelled without an extension", 'import "../shared/second";', "foundation/tests/shared/second.ts"],
    ["spelled .mjs while the index holds the .mts", 'import "../shared/third.mjs";', "foundation/tests/shared/third.mts"],
    ["that names a directory holding an index.ts", 'import "../shared/fourth";', "foundation/tests/shared/fourth/index.ts"],
  ])("a helper outside the subject directory, %s → protected", async (_what, importing, helper) => {
    const locked = await lockedAfter((repo) => {
      stage(repo, helper, "export const reached = true;\n");
      reachAlso(repo, importing);
    });
    expectProtected(locked, helper);
  });
});

describe("lock — what a locked test reaches without an import statement", { timeout: 120_000 }, () => {
  it('a file named by new URL("…", import.meta.url), under foundation/tests/ → protected', async () => {
    const data = "foundation/tests/shared/data.txt";
    const locked = await lockedAfter((repo) => {
      stage(repo, data, "read by the locked test, by its path\n");
      reachAlso(repo, 'const data = new URL("../shared/data.txt", import.meta.url);');
    });
    expectProtected(locked, data);
  });

  it("a new URL that leaves foundation/tests/ — the repository's root — is no import → no refusal, the lock is written", async () => {
    const locked = await lockedAfter((repo) => reachAlso(repo, 'const root = new URL("../../../", import.meta.url);'));
    expectWritten(locked);
  });

  it("import.meta.glob in a locked test — what it reaches cannot be listed → LOCK_REFUSED, the standing lock as it stood", async () => {
    const { repo, answer } = await lockedAfter((repo) => reachAlso(repo, 'const found = import.meta.glob("./fixtures/*.ts");'));
    expectRefused(answer, "import.meta.glob");
    expect(read(repo, LOCK_PATH)).toBe(read((await fixture.ready()).original, LOCK_PATH));
  });
});

describe("lock — a relative specifier that resolves to no file of the index", { timeout: 120_000 }, () => {
  it("an import spelled inside a string → NOTE unresolved-import <from> <specifier>, and the lock is still written", async () => {
    const locked = await lockedAfter((repo) => reachAlso(repo, "const spelled = 'import { gone } from \"./gone.ts\";';"));
    expect(locked.answer.lines, tail(locked.answer)).toContain("NOTE unresolved-import foundation/tests/subject/value.test.ts ./gone.ts");
    expectWritten(locked);
  });

  it("the fixture as it was built reaches nothing that is not there → no such note", async () => {
    const locked = await lockedAfter(() => {});
    expectWritten(locked);
    expect(locked.answer.lines.filter((line) => line.startsWith("NOTE unresolved-import"))).toEqual([]);
  });
});

describe("lock — the root's install settings (SPEC §10 item 3)", { timeout: 120_000 }, () => {
  it("a committed .npmrc at the root → protected", async () => {
    const settings = ".npmrc";
    const locked = await lockedAfter((repo) => {
      stage(repo, settings, "# the fixture's install settings: none, and the file is there\n");
      commit(repo, "the root's install settings");
    });
    expectProtected(locked, settings);
  });
});
