import { describe, expect, it } from "vitest";
import { judgeStructure, type LockFile, type Offence } from "@dxb-foundation/lock";

// SPEC §5 step 3, the rules that need no history, pinned without git: one lock
// against one listing of a candidate's tree. Pure — every path and blob id
// below is invented. Each planted fault is one change to a candidate that
// otherwise equals its lock, and its offence is spelled here.

/** An invented blob id: forty hex digits that end in `n`. */
const blob = (n: number): string => n.toString(16).padStart(40, "0");

const LOCKED_TEST = "foundation/tests/subject/value.test.ts";
const HELPER = "foundation/tests/shared/doubled.ts";
const TOOL_FILE = "foundation/lock/src/reporter.mjs";
const PRODUCT_FILE = "foundation/product/src/index.ts";

const LOCK: LockFile = {
  format: 1,
  piece: "piece-a",
  dirs: ["foundation/tests/subject"],
  config: "foundation/tests/vitest.config.ts",
  protected: {
    "foundation/lock/package.json": blob(1),
    "foundation/lock/src/cli.ts": blob(2),
    "foundation/lock/src/index.ts": blob(3),
    [TOOL_FILE]: blob(4),
    "foundation/tests/package.json": blob(5),
    [HELPER]: blob(6),
    "foundation/tests/subject/fixtures/say-ready.ts": blob(7),
    [LOCKED_TEST]: blob(8),
    "foundation/tests/support/start-the-product.ts": blob(9),
    "foundation/tests/vitest.config.ts": blob(10),
    "foundation/tsconfig.json": blob(11),
    "pnpm-lock.yaml": blob(12),
    "pnpm-workspace.yaml": blob(13),
  },
  scripts: {
    "foundation:lock": "node foundation/lock/src/cli.ts lock",
    "foundation:test": "vitest run --config foundation/tests/vitest.config.ts",
    "foundation:verify": "node foundation/lock/src/cli.ts verify",
  },
  cases: [{ file: LOCKED_TEST, suite: ["the value"], name: "is 42", count: 1 }],
};

/** What the candidate holds beside the protected files: nothing of it is the lock's. */
const UNPROTECTED = {
  "package.json": blob(100),
  [PRODUCT_FILE]: blob(101),
  "foundation/product/package.json": blob(102),
  "foundation/tests/other/single.test.ts": blob(103),
  "foundation/locks/piece-a.json": blob(104),
};

type Candidate = { tree: Map<string, string>; scripts: Record<string, string> };

/** The offences of a candidate that equals its lock, after one change to it. */
function judged(plant: (candidate: Candidate) => void): Offence[] {
  const candidate: Candidate = {
    tree: new Map(Object.entries({ ...LOCK.protected, ...UNPROTECTED })),
    scripts: { ...LOCK.scripts, build: "tsc --build" },
  };
  plant(candidate);
  return judgeStructure({ lock: LOCK, candidate: candidate.tree, candidateScripts: candidate.scripts });
}

describe("judgeStructure — a candidate that equals its lock", () => {
  it("finds no offence", () => {
    expect(judged(() => {})).toEqual([]);
  });

  it("finds no offence in a changed product file that no lock protects", () => {
    expect(judged(({ tree }) => tree.set(PRODUCT_FILE, blob(999)))).toEqual([]);
  });

  it("finds no offence in a script that is not the foundation's, changed or added", () => {
    const offences = judged(({ scripts }) => {
      scripts.build = "tsc --build --force";
      scripts.lint = "eslint .";
    });
    expect(offences).toEqual([]);
  });
});

describe("judgeStructure — a protected file whose content is not the lock's", () => {
  it.each([
    ["a locked test", LOCKED_TEST],
    ["a helper outside the subject directory", HELPER],
    ["a file of the lock tool", TOOL_FILE],
    ["the lockfile", "pnpm-lock.yaml"],
  ])("%s changed → protected-changed <path>", (_what, path) => {
    expect(judged(({ tree }) => tree.set(path, blob(999)))).toEqual([{ kind: "protected-changed", detail: path }]);
  });

  it("a protected file gone → protected-missing <path>", () => {
    expect(judged(({ tree }) => tree.delete(HELPER))).toEqual([{ kind: "protected-missing", detail: HELPER }]);
  });
});

describe("judgeStructure — a closed directory", () => {
  it.each([
    ["a subject directory", "foundation/tests/subject/slipped-in.test.ts"],
    ["a subject directory, deeper", "foundation/tests/subject/fixtures/slipped-in.ts"],
    ["foundation/lock/", "foundation/lock/src/slipped-in.ts"],
    ["foundation/tests/ itself", "foundation/tests/vitest.workspace.ts"],
  ])("a file added to %s → closed-dir-added <path>", (_what, path) => {
    expect(judged(({ tree }) => tree.set(path, blob(999)))).toEqual([{ kind: "closed-dir-added", detail: path }]);
  });

  it("a file added deeper under foundation/tests/, in a directory no lock names → no offence", () => {
    expect(judged(({ tree }) => tree.set("foundation/tests/other/second.test.ts", blob(999)))).toEqual([]);
  });
});

describe("judgeStructure — nothing installed may come from the tree", () => {
  it.each([
    ["at the root", "node_modules/.bin/vitest"],
    ["inside a package", "foundation/product/node_modules/left-pad/index.js"],
  ])("a path with a node_modules segment %s → candidate-carries-node-modules <path>", (_what, path) => {
    expect(judged(({ tree }) => tree.set(path, blob(999)))).toEqual([{ kind: "candidate-carries-node-modules", detail: path }]);
  });

  it("a file that only has the word in its name is not such a path", () => {
    expect(judged(({ tree }) => tree.set("foundation/product/src/node_modules.ts", blob(999)))).toEqual([]);
  });
});

describe("judgeStructure — the foundation's scripts of the root package file", () => {
  it("one changed → scripts-changed <name>", () => {
    const offences = judged(({ scripts }) => {
      scripts["foundation:test"] = "vitest run --config foundation/tests/another.config.ts";
    });
    expect(offences).toEqual([{ kind: "scripts-changed", detail: "foundation:test" }]);
  });

  it("one added → scripts-changed <name>", () => {
    const offences = judged(({ scripts }) => {
      scripts["foundation:quick"] = "vitest run --config foundation/tests/vitest.config.ts --bail=1";
    });
    expect(offences).toEqual([{ kind: "scripts-changed", detail: "foundation:quick" }]);
  });

  it("one removed → scripts-changed <name>", () => {
    const offences = judged(({ scripts }) => {
      delete scripts["foundation:verify"];
    });
    expect(offences).toEqual([{ kind: "scripts-changed", detail: "foundation:verify" }]);
  });
});

describe("judgeStructure — all offences are collected", () => {
  it("a changed test, a missing helper and an added file are three offences", () => {
    const offences = judged(({ tree }) => {
      tree.set(LOCKED_TEST, blob(999));
      tree.delete(HELPER);
      tree.set("foundation/tests/subject/slipped-in.test.ts", blob(998));
    });
    expect(offences).toHaveLength(3);
    expect(offences).toEqual(
      expect.arrayContaining([
        { kind: "protected-changed", detail: LOCKED_TEST },
        { kind: "protected-missing", detail: HELPER },
        { kind: "closed-dir-added", detail: "foundation/tests/subject/slipped-in.test.ts" },
      ]),
    );
  });
});
