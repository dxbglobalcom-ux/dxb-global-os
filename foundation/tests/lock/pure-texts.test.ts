import { describe, expect, it } from "vitest";
import { relativeImports, serializeLock, type LockFile } from "@dxb-foundation/lock";

// SPEC §6, the two pure texts: which files a source reaches by a relative
// import — that list decides what a lock protects — and the bytes of a lock
// file. Every source and every expected value below is spelled here.

describe("relativeImports — the relative specifiers of one source text", () => {
  const reached = (source: string): string[] => relativeImports(source).sort();

  it.each([
    ["a static import", 'import { a } from "./a.ts";', ["./a.ts"]],
    ["a default import in single quotes", "import b from '../shared/b.ts';", ["../shared/b.ts"]],
    ["a type import", 'import type { T } from "./types.ts";', ["./types.ts"]],
    ["an import for its effect alone", 'import "./side-effect.ts";', ["./side-effect.ts"]],
    ["an export of everything", 'export * from "./c.ts";', ["./c.ts"]],
    ["an export of names", 'export { d, e as f } from "./d.ts";', ["./d.ts"]],
    ["a dynamic import of a literal", 'const later = await import("./later.ts");', ["./later.ts"]],
    ["an import spread over lines", 'import {\n  one,\n  two,\n} from "./many.ts";', ["./many.ts"]],
  ])("%s is reached", (_what, source, expected) => {
    expect(reached(source)).toEqual(expected);
  });

  it.each([
    ["a package", 'import { it } from "vitest";'],
    ["a scoped package — the code under test", 'import { decide } from "@dxb-foundation/bench";'],
    ["a built-in", 'import { readFileSync } from "node:fs";'],
    ["a dynamic import of a package", 'const pg = await import("pg");'],
  ])("%s is not a relative import", (_what, source) => {
    expect(reached(source)).toEqual([]);
  });

  it("every relative specifier of a whole file is found, and nothing else", () => {
    const source = [
      'import { describe, expect, it } from "vitest";',
      'import { answer } from "@dxb-foundation/product";',
      'import { doubled } from "../shared/doubled.ts";',
      'import { refusalOf } from "./fixtures/refusal-of.ts";',
      'export { orderedSteps } from "./fixtures/ordered-steps.ts";',
      "",
      'it("loads one more when it runs", async () => {',
      '  const { late } = await import("./fixtures/late.ts");',
      "  expect(late(doubled(answer()))).toBe(refusalOf);",
      "});",
      "",
    ].join("\n");
    expect(reached(source)).toEqual(["../shared/doubled.ts", "./fixtures/late.ts", "./fixtures/ordered-steps.ts", "./fixtures/refusal-of.ts"]);
  });
});

describe("serializeLock — the same lock gives the same bytes", () => {
  const A = "foundation/tests/subject/a.test.ts";
  const B = "foundation/tests/subject/b.test.ts";

  const written: LockFile = {
    format: 1,
    piece: "piece-a",
    dirs: ["foundation/tests/subject", "foundation/tests/another"],
    config: "foundation/tests/vitest.config.ts",
    protected: { [B]: "b".repeat(40), [A]: "a".repeat(40), "pnpm-lock.yaml": "c".repeat(40) },
    scripts: { "foundation:verify": "node verify", "foundation:lock": "node lock" },
    cases: [
      { file: B, suite: ["outer"], name: "second", count: 1 },
      { file: A, suite: ["outer", "inner"], name: "first", count: 2 },
      { file: A, suite: [], name: "zeroth", count: 1 },
    ],
  };

  /** The same lock, every key and every list in another order. */
  const shuffled: LockFile = {
    cases: [written.cases[2]!, written.cases[0]!, written.cases[1]!],
    scripts: { "foundation:lock": "node lock", "foundation:verify": "node verify" },
    protected: { "pnpm-lock.yaml": "c".repeat(40), [A]: "a".repeat(40), [B]: "b".repeat(40) },
    config: "foundation/tests/vitest.config.ts",
    dirs: ["foundation/tests/another", "foundation/tests/subject"],
    piece: "piece-a",
    format: 1,
  };

  it("does not depend on the order its keys and lists were given in", () => {
    expect(serializeLock(shuffled)).toBe(serializeLock(written));
  });

  it("is JSON of the same lock, indented by two spaces, ending in exactly one newline", () => {
    const text = serializeLock(written);
    expect(text.endsWith("}\n")).toBe(true);
    expect(text.endsWith("\n\n")).toBe(false);
    expect(text).toContain('\n  "piece": "piece-a"');
    const read = JSON.parse(text) as LockFile;
    expect(read.piece).toBe("piece-a");
    expect(read.protected).toEqual(written.protected);
    expect(read.scripts).toEqual(written.scripts);
    expect(read.cases).toHaveLength(3);
    expect(read.cases).toEqual(expect.arrayContaining(written.cases));
  });

  it("writes the protected paths and the directories in order", () => {
    const read = JSON.parse(serializeLock(written)) as LockFile;
    expect(Object.keys(read.protected)).toEqual([A, B, "pnpm-lock.yaml"]);
    expect(read.dirs).toEqual(["foundation/tests/another", "foundation/tests/subject"]);
  });

  it("a different lock gives different bytes", () => {
    const other: LockFile = { ...written, protected: { ...written.protected, [A]: "d".repeat(40) } };
    expect(serializeLock(other)).not.toBe(serializeLock(written));
  });
});
