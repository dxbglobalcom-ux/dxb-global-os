import { existsSync, lstatSync, mkdirSync, readdirSync, readlinkSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { RevisionRefused, chainAt } from "@dxb-foundation/chain";
import { MIDDLE_CHAIN, aTemporaryDirectory, filesUnder, git, gitFed, removeTheRepositories, stateOf, type Repository } from "./fixtures/a-repository.ts";
import { NOT_UTF8, REPLACING_BYTES, withAChainBlobReplaced, withBytesAndAnIndexLink, withTheMiddleCommitReplaced } from "./fixtures/a-repository-bent.ts";

// Piece 6b's SPEC §10.1 rows 2–5, the blind audit's corrections to chainAt (SOL.md A3, A4, B4, B5): replace refs change
// nothing of what is written; a name under the three directories that is not UTF-8 is not-a-file; a revision that
// holds a `:` is unknown-revision; an `into` that is a symbolic link is into-not-empty, wherever it points. Each on a
// throwaway repository of its own (fixtures/a-repository-bent.ts), each bend first seen to bite in plain git. No bench.

let replacedCommit: Repository;
let replacedBlob: Repository & { blob: string };
let bent: Repository;
let bentBefore: Record<string, string>;

beforeAll(() => {
  replacedCommit = withTheMiddleCommitReplaced();
  replacedBlob = withAChainBlobReplaced();
  bent = withBytesAndAnIndexLink();
  bentBefore = stateOf(bent.repo);
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

describe("§10.1 row 2 — a replace ref changes nothing of what is written (SOL A3)", () => {
  it("the commit's replace ref bites in plain git: the middle commit reads as the last one's tree, and only without replace objects as its own", () => {
    const { repo, middle, last } = replacedCommit;
    expect(git(repo, "rev-parse", `${middle}^{tree}`)).toBe(git(repo, "rev-parse", `${last}^{tree}`));
    expect(git(repo, "--no-replace-objects", "rev-parse", `${middle}^{tree}`)).not.toBe(git(repo, "rev-parse", `${last}^{tree}`));
    expect(git(repo, "ls-tree", "-r", "--name-only", middle, "--", "db/schema/").split("\n")).toEqual(["db/schema/0001-a.sql", "db/schema/0002-b.sql", "db/schema/0003-c.sql"]);
  });

  it("chainAt of the middle commit, by its id and by its branch: the middle commit's own files, byte for byte", () => {
    for (const revision of [replacedCommit.middle, "middle"]) {
      const { into } = aPlaceForInto();
      expect(chainAt(replacedCommit.repo, revision, into), revision).toEqual({ commit: replacedCommit.middle, files: 7 });
      expect(filesUnder(into), revision).toEqual(MIDDLE_CHAIN);
    }
  });

  it("the blob's replace ref bites in plain git: the middle commit's schema/0002-b.sql reads as the replacing bytes", () => {
    const { repo, middle, blob } = replacedBlob;
    expect(git(repo, "rev-parse", `${middle}:db/schema/0002-b.sql`)).toBe(blob);
    expect(gitFed(repo, Buffer.alloc(0), "cat-file", "blob", blob)).toEqual(REPLACING_BYTES);
    expect(gitFed(repo, Buffer.alloc(0), "--no-replace-objects", "cat-file", "blob", blob)).toEqual(MIDDLE_CHAIN["schema/0002-b.sql"]);
  });

  it("chainAt of the middle commit: the blob's own bytes, every file byte for byte", () => {
    const { into } = aPlaceForInto();
    expect(chainAt(replacedBlob.repo, "middle", into)).toEqual({ commit: replacedBlob.middle, files: 7 });
    expect(filesUnder(into)).toEqual(MIDDLE_CHAIN);
  });
});

describe("§10.1 row 3 — a name under the three directories that is not UTF-8 is not-a-file (SOL A4)", () => {
  it("the commit holds the name byte for byte, 0xff and all", () => {
    const listed = gitFed(bent.repo, Buffer.alloc(0), "ls-tree", "-r", "-z", "--name-only", "not-utf8", "--", "db/reference/");
    expect(listed).toEqual(Buffer.concat([Buffer.from("db/reference/"), NOT_UTF8, Buffer.from("\0db/reference/r.json\0")]));
  });

  it("→ not-a-file, and nothing written: a missing into is still missing, an empty into still empty", () => {
    const missing = aPlaceForInto();
    expect(reasonOf(() => chainAt(bent.repo, "not-utf8", missing.into))).toBe("not-a-file");
    expect(existsSync(missing.into)).toBe(false);
    expect(readdirSync(missing.parent)).toEqual([]);
    const empty = aPlaceForInto();
    mkdirSync(empty.into);
    expect(reasonOf(() => chainAt(bent.repo, "not-utf8", empty.into))).toBe("not-a-file");
    expect(readdirSync(empty.into)).toEqual([]);
  });

  it("the same name under db/migrations/, outside the three directories, is no refusal: the one file of the chain", () => {
    const { into } = aPlaceForInto();
    expect(chainAt(bent.repo, "not-utf8-outside", into)).toEqual({ commit: git(bent.repo, "rev-parse", "not-utf8-outside"), files: 1 });
    expect(filesUnder(into)).toEqual({ "reference/r.json": Buffer.from("[]\n") });
  });
});

describe("§10.1 row 4 — a revision that holds a `:` is unknown-revision, never handed to git (SOL B4)", () => {
  const withAColon: [string, string, string][] = [
    ["a path in the index, a blob", ":db/schema/0001-a.sql", "blob"],
    ["a path in the index, a gitlink to the middle commit", ":db/staged-link", "commit"],
    ["a stage of a path in the index", ":0:db/schema/0001-a.sql", "blob"],
    ["a path in a tree", "main:db", "tree"],
    ["a path in a tree, a gitlink to the first commit", "gitlink:db/functions/sub", "commit"],
    ["the root tree of HEAD", "HEAD:", "tree"],
    ["a search of the commits' messages", ":/chain changed", "commit"],
  ];

  it("in plain git each of them resolves — to the object named here — so the refusal below is the code's, not git's", () => {
    const resolved = withAColon.map(([, revision]) => git(bent.repo, "cat-file", "-t", git(bent.repo, "rev-parse", "-q", "--verify", "--end-of-options", revision)));
    expect(resolved).toEqual(withAColon.map(([, , type]) => type));
    expect(git(bent.repo, "rev-parse", "-q", "--verify", "--end-of-options", ":db/staged-link")).toBe(bent.middle);
    expect(git(bent.repo, "rev-parse", "-q", "--verify", "--end-of-options", "gitlink:db/functions/sub")).toBe(bent.first);
    expect(git(bent.repo, "rev-parse", "-q", "--verify", "--end-of-options", ":/chain changed")).toBe(bent.last);
  });

  it.each(withAColon)("%s — %s → unknown-revision, and nothing written", (_what, revision) => {
    const { parent, into } = aPlaceForInto();
    expect(reasonOf(() => chainAt(bent.repo, revision, into))).toBe("unknown-revision");
    expect(readdirSync(parent)).toEqual([]);
  });
});

describe("§10.1 row 5 — an into that is a symbolic link is into-not-empty, wherever it points (SOL B5)", () => {
  it("a link to an empty directory → into-not-empty; nothing is written through it, and the link stands as it was", () => {
    const { parent, into } = aPlaceForInto();
    const target = join(parent, "empty");
    mkdirSync(target);
    symlinkSync(target, into);
    expect(reasonOf(() => chainAt(bent.repo, "middle", into))).toBe("into-not-empty");
    expect(readdirSync(target)).toEqual([]);
    expect(lstatSync(into).isSymbolicLink()).toBe(true);
    expect(readlinkSync(into)).toBe(target);
    expect(readdirSync(parent).sort()).toEqual(["empty", "into"]);
  });

  it("a link to nothing → into-not-empty, for a commit with a chain and for one with none; what it points at is not made", () => {
    for (const revision of ["middle", bent.first]) {
      const { parent, into } = aPlaceForInto();
      const nowhere = join(parent, "nowhere");
      symlinkSync(nowhere, into);
      expect(reasonOf(() => chainAt(bent.repo, revision, into)), revision).toBe("into-not-empty");
      expect(existsSync(nowhere), revision).toBe(false);
      expect(readlinkSync(into), revision).toBe(nowhere);
      expect(readdirSync(parent), revision).toEqual(["into"]);
    }
  });
});

describe("§10.1 the bent repository is not written to", () => {
  it("after every call above: HEAD, the index, every file of .git and of the working tree as before", () => {
    expect(stateOf(bent.repo)).toEqual(bentBefore);
  });
});
