import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { RevisionRefused, chainAt } from "@dxb-foundation/chain";
import { LAST_CHAIN, MIDDLE_CHAIN, aRepository, aTemporaryDirectory, filesUnder, git, removeTheRepositories, stateOf, type Repository } from "./fixtures/a-repository.ts";

// Piece 6b's SPEC §6 A.4: chainAt on a throwaway repository the case makes (fixtures/a-repository.ts) — the chain's
// three directories as a commit holds them, from git's objects, written below `into`; never the working tree or the
// index; nothing written beside `into` or in the repository. No bench.

let made: Repository;
let before: Record<string, string>;

beforeAll(() => {
  made = aRepository();
  before = stateOf(made.repo);
});
afterAll(() => removeTheRepositories());

/** A path that does not stand yet, alone in a fresh parent: what is written beside it can be seen. */
function aPlaceForInto(): { parent: string; into: string } {
  const parent = aTemporaryDirectory("dxb-foundation-upgrade-into-");
  return { parent, into: join(parent, "into") };
}

/** The reason chainAt refused with, or an error when it answered — or threw anything but a RevisionRefused. */
function reasonOf(call: () => unknown): string {
  try {
    call();
  } catch (failure) {
    if (failure instanceof RevisionRefused) return String((failure as { reason: unknown }).reason);
    throw failure;
  }
  throw new Error("chainAt answered where it must refuse");
}

describe("A.4 chainAt — the chain as a commit holds it", () => {
  it("the fixture is what the case says: three commits on main, the working tree and the index ahead of the last", () => {
    expect(git(made.repo, "rev-list", "--count", "main")).toBe("3");
    expect(git(made.repo, "rev-parse", "main", "middle")).toBe(`${made.last}\n${made.middle}`);
    expect(git(made.repo, "--no-optional-locks", "status", "--porcelain=v1", "--", "db").split("\n").sort()).toEqual([
      " M db/schema/0001-a.sql",
      "?? db/schema/0005-untracked.sql",
      "A  db/schema/0004-staged.sql",
      "M  db/reference/r.json",
    ]);
  });

  it("the middle commit: every file of schema/, functions/ and reference/ at its path below db/, byte for byte — the CRLF, the file without a final newline, the bytes that are not UTF-8, the empty and the nested file among them — and none of db/'s other directories", () => {
    const { parent, into } = aPlaceForInto();
    expect(chainAt(made.repo, made.middle, into)).toEqual({ commit: made.middle, files: 7 });
    expect(filesUnder(into)).toEqual(MIDDLE_CHAIN);
    expect(readdirSync(into).sort()).toEqual(["functions", "reference", "schema"]);
    expect(readdirSync(parent)).toEqual(["into"]);
  });

  it("a branch name, a short id and a full id resolve to the same commit and the same files", () => {
    for (const revision of ["middle", made.middle.slice(0, 7), made.middle, "main~1"]) {
      const { into } = aPlaceForInto();
      expect(chainAt(made.repo, revision, into), revision).toEqual({ commit: made.middle, files: 7 });
      expect(filesUnder(into), revision).toEqual(MIDDLE_CHAIN);
    }
  });

  it("the first commit holds no chain: files 0, and no directory is made in an empty into", () => {
    const { parent, into } = aPlaceForInto();
    mkdirSync(into);
    expect(chainAt(made.repo, made.first, into)).toEqual({ commit: made.first, files: 0 });
    expect(readdirSync(into)).toEqual([]);
    expect(readdirSync(parent)).toEqual(["into"]);
  });

  it("the first commit with into missing: files 0, and into is not made (the lead's reading)", () => {
    const { parent, into } = aPlaceForInto();
    expect(chainAt(made.repo, made.first, into)).toEqual({ commit: made.first, files: 0 });
    expect(existsSync(into)).toBe(false);
    expect(readdirSync(parent)).toEqual([]);
  });

  it("the last commit, by HEAD and by main: its files — not the working tree's change, not the index's, not the untracked file", () => {
    for (const revision of ["HEAD", "main", made.last]) {
      const { into } = aPlaceForInto();
      expect(chainAt(made.repo, revision, into), revision).toEqual({ commit: made.last, files: 7 });
      expect(filesUnder(into), revision).toEqual(LAST_CHAIN);
    }
  });

  it("an into that stands empty is written into", () => {
    const { into } = aPlaceForInto();
    mkdirSync(into);
    expect(chainAt(made.repo, "middle", into)).toEqual({ commit: made.middle, files: 7 });
    expect(filesUnder(into)).toEqual(MIDDLE_CHAIN);
  });
});

describe("A.4 chainAt refuses, each by its reason", () => {
  it.each([
    ["a name no ref carries", "no-such-branch"],
    ["an id no object carries", "0123456789abcdef0123456789abcdef01234567"],
    ["a revision past the first commit", "main~3"],
    ["a revision that names a tree, not a commit", "main:db"],
    ["a revision that begins with -: --all", "--all"],
    ["a revision that begins with -: -h", "-h"],
    ["a revision that begins with -: an id behind a dash", "-HEAD"],
  ])("%s → unknown-revision", (_what, revision) => {
    const { parent, into } = aPlaceForInto();
    expect(reasonOf(() => chainAt(made.repo, revision, into))).toBe("unknown-revision");
    expect(readdirSync(parent).filter((name) => name !== "into")).toEqual([]);
  });

  it("an into that holds a file → into-not-empty, and the file is as it was", () => {
    const { into } = aPlaceForInto();
    mkdirSync(into);
    writeFileSync(join(into, "already.txt"), "here before\n");
    expect(reasonOf(() => chainAt(made.repo, "middle", into))).toBe("into-not-empty");
    expect(filesUnder(into)).toEqual({ "already.txt": Buffer.from("here before\n") });
  });

  it("an into that holds only an empty directory → into-not-empty", () => {
    const { into } = aPlaceForInto();
    mkdirSync(join(into, "schema"), { recursive: true });
    expect(reasonOf(() => chainAt(made.repo, "middle", into))).toBe("into-not-empty");
    expect(readdirSync(into)).toEqual(["schema"]);
    expect(readdirSync(join(into, "schema"))).toEqual([]);
  });

  it("a link under schema/ → not-a-file", () => {
    const { into } = aPlaceForInto();
    expect(reasonOf(() => chainAt(made.repo, "link", into))).toBe("not-a-file");
  });

  it("a gitlink under functions/ → not-a-file", () => {
    const { into } = aPlaceForInto();
    expect(reasonOf(() => chainAt(made.repo, "gitlink", into))).toBe("not-a-file");
  });

  // The lead's readings (2026-11-23): every entry is judged before the first byte is written; a commit with no chain
  // makes no `into`; an `into` that is a regular file is not empty.
  it.each([
    ["unknown-revision", "no-such-branch"],
    ["not-a-file", "link"],
    ["not-a-file", "gitlink"],
  ])("a refused call (%s, at %s) writes nothing: a missing into is still missing, an empty into still empty", (reason, revision) => {
    const missing = aPlaceForInto();
    expect(reasonOf(() => chainAt(made.repo, revision, missing.into))).toBe(reason);
    expect(existsSync(missing.into)).toBe(false);
    expect(readdirSync(missing.parent)).toEqual([]);
    const empty = aPlaceForInto();
    mkdirSync(empty.into);
    expect(reasonOf(() => chainAt(made.repo, revision, empty.into))).toBe(reason);
    expect(readdirSync(empty.into)).toEqual([]);
    expect(readdirSync(empty.parent)).toEqual(["into"]);
  });

  it("an into that is a regular file → into-not-empty, and its bytes are as before", () => {
    const { parent, into } = aPlaceForInto();
    writeFileSync(into, "a file, not a directory\n");
    expect(reasonOf(() => chainAt(made.repo, "middle", into))).toBe("into-not-empty");
    expect(filesUnder(parent)).toEqual({ into: Buffer.from("a file, not a directory\n") });
  });

  it("a link outside the three directories is no refusal: the middle commit, answered above, holds two", () => {
    expect(git(made.repo, "ls-tree", "-r", "middle", "--", "link-outside", "db/migrations/latest.sql").split("\n").map((line) => line.split(" ")[0])).toEqual(["120000", "120000"]);
  });
});

describe("A.4 the repository is not written to", () => {
  it("after every call above: HEAD, the index, every file of .git and of the working tree as before", () => {
    expect(existsSync(join(made.repo, ".git", "index"))).toBe(true);
    expect(stateOf(made.repo)).toEqual(before);
  });
});
