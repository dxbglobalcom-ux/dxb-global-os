// The files of the throwaway repository the lock tool is judged on (SPEC §7), as
// text. The builder writes them out: while they lie here none of them is a test
// of the foundation's own run, and none is type-checked as the foundation's code.
//
// The locked tests are written so that the product alone decides each outcome —
// all but `copied.test.ts`, which asks what the copy it runs in kept of the tree.

export const PIECE = "piece-a";
export const SUBJECT = "foundation/tests/subject";
/** A second subject directory, locked by no piece until a case locks it as OTHER_PIECE. */
export const OTHER_PIECE = "piece-b";
export const OTHER_SUBJECT = "foundation/tests/other";

export const PRODUCT_FILE = "foundation/product/src/index.ts";
export const PRODUCT_MANIFEST = "foundation/product/package.json";
/** A committed link outside every closed place: `latest.ts` beside the product's package file, pointing at its source. */
export const PRODUCT_LINK = { path: "foundation/product/latest.ts", target: "src/index.ts" };

/** A workspace package outside the foundation's scope, with a dependency no package of the scope has. */
const OUTSIDE_PACKAGE = "packages/old-chain";
export const OUTSIDE_DEPENDENCY = "pg";
/** Committed with its executable bit (mode 100755). */
export const EXECUTABLE_FILE = `${SUBJECT}/fixtures/runs-by-itself.sh`;

export const FOUNDATION_SCRIPTS = {
  "foundation:lock": "node foundation/lock/src/cli.ts lock",
  "foundation:test": "vitest run --config foundation/tests/vitest.config.ts",
  "foundation:verify": "node foundation/lock/src/cli.ts verify",
};

export const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

const PRODUCT = `// The fixture's product: what the locked tests judge, and what a case changes to plant an offence.

/** Called once by the run's set-up file, before any test file. */
export function start(): void {}

export const answer = (): number => {
  return 42;
};
export const availability = (): string => "available";
export const readiness = (): string => "ready";
export const rows: string[] = ["alpha", "beta", "gamma"];
`;

const CONFIG = `import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  test: {
    include: ["**/*.test.ts"],
    globalSetup: ["./support/start-the-product.ts"],
  },
});
`;

const SET_UP = `import { start } from "@dxb-foundation/product";

export default function setup(): void {
  start();
}
`;

const HELPER = `export const doubled = (value: number): number => value * 2;
`;

const VALUE_TEST = `import { describe, expect, it } from "vitest";
import { answer } from "@dxb-foundation/product";
import { doubled } from "../shared/doubled.ts";

describe("the value", () => {
  describe("as the product returns it", () => {
    it("is 42", () => {
      expect(answer()).toBe(42);
    });
  });

  it("is doubled by the helper", () => {
    expect(doubled(answer())).toBe(84);
  });

  it("is a number", () => {
    expect(typeof answer()).toBe("number");
  });

  it("is a number", () => {
    expect(Number.isInteger(answer())).toBe(true);
  });
});
`;

const STATES_TEST = `import { expect, it } from "vitest";
import { availability, readiness } from "@dxb-foundation/product";

it("answers while the product is available", (context) => {
  if (availability() === "unavailable") context.skip();
  expect(availability()).toBe("available");
});

it("is ready before it is used", () => {
  if (readiness() === "not ready") return;
  expect(readiness()).toBe("ready");
});
`;

const ROWS_TEST = `import { describe, expect, it } from "vitest";
import { rows } from "@dxb-foundation/product";

describe("every row", () => {
  it.each(rows)("row %s is spelled in lower case", (row) => {
    expect(row).toBe(row.toLowerCase());
  });
});
`;

const STARTED_TEST = `import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

const script = fileURLToPath(new URL("./fixtures/say-ready.ts", import.meta.url));

it("the file started by path says it is ready", () => {
  expect(execFileSync(process.execPath, [script], { encoding: "utf8" })).toBe("READY\\n");
});
`;

const COPIED_TEST = `import { lstatSync, readlinkSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const executable = fileURLToPath(new URL("./fixtures/runs-by-itself.sh", import.meta.url));
const link = fileURLToPath(new URL("../../product/latest.ts", import.meta.url));

describe("the copy", () => {
  it("keeps the executable bit of a file committed with it", () => {
    expect(statSync(executable).mode & 0o111).toBe(0o111);
  });

  it("keeps a committed link a link, pointing where it pointed", () => {
    expect(lstatSync(link).isSymbolicLink()).toBe(true);
    expect(readlinkSync(link)).toBe("src/index.ts");
  });
});
`;

const OUTSIDE_SCRIPT = `import pg from "pg";

process.stdout.write(\`DRIVER \${typeof pg.Client}\\n\`);
`;

/**
 * A test no lock of the built fixture holds: a case stages it into SUBJECT and locks again. It passes only
 * when the install gave the package outside the scope its own dependency.
 */
export const OUTSIDE_TEST_FILE = `${SUBJECT}/old-chain.test.ts`;
export const OUTSIDE_TEST = `import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

const script = fileURLToPath(new URL("../../../${OUTSIDE_PACKAGE}/src/names-its-driver.mjs", import.meta.url));

it("the old chain finds its own dependency", () => {
  expect(execFileSync(process.execPath, [script], { encoding: "utf8" })).toBe("DRIVER function\\n");
});
`;

const OTHER_TEST = `import { expect, it } from "vitest";
import { answer } from "@dxb-foundation/product";

it("the other piece has one case", () => {
  expect(answer()).toBeGreaterThan(0);
});
`;

/** Every case the locked tests of PIECE hold, as the lock must record them — spelled here, never collected. */
export const LOCKED_CASES = [
  { file: `${SUBJECT}/copied.test.ts`, suite: ["the copy"], name: "keeps a committed link a link, pointing where it pointed", count: 1 },
  { file: `${SUBJECT}/copied.test.ts`, suite: ["the copy"], name: "keeps the executable bit of a file committed with it", count: 1 },
  { file: `${SUBJECT}/rows.test.ts`, suite: ["every row"], name: "row alpha is spelled in lower case", count: 1 },
  { file: `${SUBJECT}/rows.test.ts`, suite: ["every row"], name: "row beta is spelled in lower case", count: 1 },
  { file: `${SUBJECT}/rows.test.ts`, suite: ["every row"], name: "row gamma is spelled in lower case", count: 1 },
  { file: `${SUBJECT}/started.test.ts`, suite: [], name: "the file started by path says it is ready", count: 1 },
  { file: `${SUBJECT}/states.test.ts`, suite: [], name: "answers while the product is available", count: 1 },
  { file: `${SUBJECT}/states.test.ts`, suite: [], name: "is ready before it is used", count: 1 },
  { file: `${SUBJECT}/value.test.ts`, suite: ["the value", "as the product returns it"], name: "is 42", count: 1 },
  { file: `${SUBJECT}/value.test.ts`, suite: ["the value"], name: "is doubled by the helper", count: 1 },
  { file: `${SUBJECT}/value.test.ts`, suite: ["the value"], name: "is a number", count: 2 },
];

/** What PIECE's lock must protect beside the tool's own files — spelled here, never derived. */
export const PROTECTED_BESIDE_THE_TOOL = [
  "foundation/tests/package.json",
  "foundation/tests/shared/doubled.ts",
  "foundation/tests/subject/copied.test.ts",
  "foundation/tests/subject/fixtures/runs-by-itself.sh",
  "foundation/tests/subject/fixtures/say-ready.ts",
  "foundation/tests/subject/rows.test.ts",
  "foundation/tests/subject/started.test.ts",
  "foundation/tests/subject/states.test.ts",
  "foundation/tests/subject/value.test.ts",
  "foundation/tests/support/start-the-product.ts",
  "foundation/tests/vitest.config.ts",
  "foundation/tsconfig.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
];

/**
 * path → text of every file the builder writes as it is spelled here. Not here:
 * the tool (copied from this repository), the root package file, the workspace
 * file and the lockfile (made from what this repository has installed),
 * `foundation/locks/` (the tool writes it) and PRODUCT_LINK (a link has no text).
 */
export const FIXTURE_FILES: Record<string, string> = {
  ".gitignore": "node_modules/\n",
  "foundation/tsconfig.json": json({
    compilerOptions: {
      target: "ES2023",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      strict: true,
      noEmit: true,
      allowImportingTsExtensions: true,
      verbatimModuleSyntax: true,
    },
  }),
  [PRODUCT_MANIFEST]: json({
    name: "@dxb-foundation/product",
    version: "0.0.0",
    private: true,
    type: "module",
    exports: { ".": "./src/index.ts" },
  }),
  [PRODUCT_FILE]: PRODUCT,
  [`${OUTSIDE_PACKAGE}/package.json`]: json({
    name: "old-chain",
    version: "0.0.0",
    private: true,
    type: "module",
    dependencies: { [OUTSIDE_DEPENDENCY]: "catalog:" },
  }),
  [`${OUTSIDE_PACKAGE}/src/names-its-driver.mjs`]: OUTSIDE_SCRIPT,
  "foundation/tests/package.json": json({
    name: "@dxb-foundation/tests",
    version: "0.0.0",
    private: true,
    type: "module",
    dependencies: { "@dxb-foundation/product": "workspace:*" },
    devDependencies: { vitest: "catalog:" },
  }),
  "foundation/tests/vitest.config.ts": CONFIG,
  "foundation/tests/support/start-the-product.ts": SET_UP,
  "foundation/tests/shared/doubled.ts": HELPER,
  [`${SUBJECT}/value.test.ts`]: VALUE_TEST,
  [`${SUBJECT}/states.test.ts`]: STATES_TEST,
  [`${SUBJECT}/rows.test.ts`]: ROWS_TEST,
  [`${SUBJECT}/started.test.ts`]: STARTED_TEST,
  [`${SUBJECT}/fixtures/say-ready.ts`]: 'process.stdout.write("READY\\n");\n',
  [`${SUBJECT}/copied.test.ts`]: COPIED_TEST,
  [EXECUTABLE_FILE]: "#!/bin/sh\nprintf 'RAN\\n'\n",
  [`${OTHER_SUBJECT}/single.test.ts`]: OTHER_TEST,
};
