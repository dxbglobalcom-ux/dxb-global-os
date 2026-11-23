import { afterAll, describe, expect, it } from "vitest";
import type { LockFile } from "@dxb-foundation/lock";
import { expectRefused } from "./fixtures/expectations.ts";
import { OTHER_SUBJECT, PIECE, SUBJECT, json } from "./fixtures/fixture-files.ts";
import { command, copyOf, fixtureOfOneFile, read, replacing, stage, tail, type Answer } from "./fixtures/fixture-repo.ts";

// SPEC §10 item 7, on the fixture: the lock before this one is HEAD's, never the
// index's — and what `lock` prints of the difference, which is what the lead
// reads before committing a lock (SPEC §8). Every printed line is spelled here.

const LOCK_PATH = `foundation/locks/${PIECE}.json`;
const VALUE_TEST = `${SUBJECT}/value.test.ts`;
const HELPER = "foundation/tests/shared/doubled.ts";

const fixture = fixtureOfOneFile();
afterAll(fixture.remove);

/** One `lock` run on a copy, started by the first case that asks and read by every case of its suite. */
function oneRun(change: (repo: string) => void, ...dirs: string[]): () => Promise<Answer> {
  let running: Promise<Answer> | undefined;
  return () =>
    (running ??= fixture.ready().then((built) => {
      const repo = copyOf(built);
      change(repo);
      return command(repo, ["lock", PIECE, ...dirs]);
    }));
}

const linesStarting = (answer: Answer, start: string): string[] => answer.lines.filter((line) => line.startsWith(start));

describe("lock — a lock file for the piece that is staged and is not HEAD's", { timeout: 120_000 }, () => {
  it("narrowed by hand to another directory and no case → LOCK_REFUSED, exit 2, and nothing is written over it", async () => {
    const repo = copyOf(await fixture.ready());
    const committed = JSON.parse(read(repo, LOCK_PATH)) as LockFile;
    const narrowed = json({ ...committed, dirs: [OTHER_SUBJECT], cases: [] });
    stage(repo, LOCK_PATH, narrowed);

    expectRefused(await command(repo, ["lock", PIECE]), "HEAD");
    expect(read(repo, LOCK_PATH)).toBe(narrowed);
  });
});

describe("lock — the difference it prints against HEAD's lock: a case, a helper and a script changed, all staged", { timeout: 120_000 }, () => {
  const locked = oneRun((repo) => {
    const oneCaseMore = replacing(read(repo, VALUE_TEST), '  it("is a number", () => {\n    expect(typeof', '  it("is positive", () => {\n    expect(answer()).toBeGreaterThan(0);\n  });\n\n  it("is a number", () => {\n    expect(typeof');
    stage(repo, VALUE_TEST, oneCaseMore);
    stage(repo, HELPER, `${read(repo, HELPER)}// changed after the lock\n`);
    stage(repo, "package.json", replacing(read(repo, "package.json"), "vitest run --config foundation/tests/vitest.config.ts", "vitest run --config foundation/tests/vitest.config.ts --bail=1"));
  });

  it("the lock is written", async () => {
    const answer = await locked();
    expect(answer.lines.at(-1), tail(answer)).toMatch(/^LOCK_WRITTEN piece=piece-a cases=13 protected=\d+$/);
  });

  it("CASE added <the new case>, once — and no case is said to be removed", async () => {
    const answer = await locked();
    expect(linesStarting(answer, "CASE added "), tail(answer)).toEqual([expect.stringMatching(/foundation\/tests\/subject\/value\.test\.ts.*the value.*is positive/)]);
    expect(linesStarting(answer, "CASE removed ")).toEqual([]);
  });

  it("PROTECTED changed <the helper>, and <the locked test> — nothing else", async () => {
    const answer = await locked();
    expect(linesStarting(answer, "PROTECTED "), tail(answer)).toEqual([
      "PROTECTED changed foundation/tests/shared/doubled.ts",
      "PROTECTED changed foundation/tests/subject/value.test.ts",
    ]);
  });

  it("SCRIPT changed <name>", async () => {
    const answer = await locked();
    expect(linesStarting(answer, "SCRIPT "), tail(answer)).toEqual(["SCRIPT changed foundation:test"]);
  });

  it("no directory is said to be added or removed", async () => {
    expect(linesStarting(await locked(), "DIRS ")).toEqual([]);
  });
});

describe("lock — the difference it prints when the piece is given a second directory", { timeout: 120_000 }, () => {
  const locked = oneRun(() => {}, SUBJECT, OTHER_SUBJECT);

  it("DIRS added <dir>, and none removed", async () => {
    const answer = await locked();
    expect(linesStarting(answer, "DIRS "), tail(answer)).toEqual(["DIRS added foundation/tests/other"]);
  });

  it("CASE added <the case of that directory>, PROTECTED added <its test>", async () => {
    const answer = await locked();
    expect(linesStarting(answer, "CASE added "), tail(answer)).toEqual([expect.stringMatching(/foundation\/tests\/other\/single\.test\.ts.*the other piece has one case/)]);
    expect(answer.lines).toContain("PROTECTED added foundation/tests/other/single.test.ts");
  });
});
