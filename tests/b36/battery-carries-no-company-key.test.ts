import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// B36 · the independent auditor's first FAIL on Block 2, 2026-08-23:
//
//   "Take the company's 54322/postgres connection out of the full battery.
//    tests/b36/block1-question.test.ts:26 hands the company's address and the
//    write-capable `postgres` account to a subprocess."
//
// (That file, and the hook it questioned, were deleted on 2026-08-25 on the
// CEO's order — "artık yazılmasın". The quote stays because it is why this file
// exists; the RULE below outlives both of them and is what is enforced here.)
//
// He was right, and the finding is larger than the line he cited: two files in
// tests/b36 carried the holding's address together with its superuser password,
// one of them opening a real connection to the CEO's own database on every
// battery run. The construction site is being cut out of the company (board row
// B36) and a construction battery that carries the key to the company has not
// been cut out of anything.
//
// THE RULE THIS FILE HOLDS. No file the battery loads may carry a CONNECTABLE
// address for the company's engine. Nothing at all — there is no tolerated
// shape any more.
//
// There was one, until 2026-08-24: `process.env.DXB_DATABASE_URL ??=
// "…:54322/postgres"`, the fallback that opened 82 suites. It could not fire
// while vitest.config.ts set the variable first, and it was still the company's
// address sitting in 82 files, waiting for one run that did not go through that
// config. Block 4 deleted every one of them, so this file stopped making the
// exception and now counts that shape as what it always was — a key.
//
// WHERE THE COMPANY IS STILL REACHED FROM, deliberately and outside the
// battery: `pnpm b36:prove-block1` (scripts/b36/prove-block1.mjs), the drill
// that answers Block 1's fixed question against the real holding. That command
// is run by hand and by Block 6's `verify:separation`; it is not `pnpm test`.

const REPO = process.cwd();

/** The company's Postgres engine on this machine (supabase_db_DxB_Global_OS). */
const COMPANY_PORT = "54322";

/** A line that could open a connection to the company — not a mention of it. */
const CONNECTABLE = new RegExp(String.raw`postgres(?:ql)?://[^"'\s\`]*:${COMPANY_PORT}`);
/**
 * The judgement, as a pure function so it can be shown to work before it is
 * believed. A comment may name the company — that is how this repository
 * records what went wrong — but no live line may spell an address that reaches
 * it.
 */
export function keysIn(text: string): Array<{ line: number; text: string }> {
  const out: Array<{ line: number; text: string }> = [];
  text.split("\n").forEach((line, i) => {
    const t = line.trimStart();
    if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*") || t.startsWith("#")) return;
    if (!CONNECTABLE.test(line)) return;
    out.push({ line: i + 1, text: line.trim().slice(0, 140) });
  });
  return out;
}

/** Every file the battery loads from this repository's own tests directory. */
function batteryFiles(): string[] {
  const found: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) {
        walk(p);
        continue;
      }
      if (/\.(ts|tsx|mts|cts|js|mjs)$/.test(entry)) found.push(p);
    }
  };
  walk(join(REPO, "tests"));
  found.push(join(REPO, "vitest.config.ts"));
  return found;
}

describe("B36 — the battery carries no key to the company", () => {
  // MEASURE THE INSTRUMENT FIRST. On 2026-08-23 a detector in this same block
  // reported a comfortable zero because `\b` is a backspace in PostgreSQL's
  // regular expressions and not a word boundary — it had never been shown to
  // register the thing it was looking for. This one is.
  it("(0) the detector sees a key, including the fallback Block 4 removed", () => {
    const positive = `  const COMPANY = "postgresql://postgres:postgres@127.0.0.1:${COMPANY_PORT}/postgres";`;
    expect(keysIn(positive), "the detector cannot see a company address at all").toHaveLength(1);

    expect(
      keysIn(`// it used to read postgresql://postgres:postgres@127.0.0.1:${COMPANY_PORT}/postgres`),
      "a comment recording history is not a key",
    ).toEqual([]);

    expect(
      keysIn(
        `process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:${COMPANY_PORT}/postgres";`,
      ),
      "Block 4 deleted the fallback and this file stopped excusing it — it is a key like any other",
    ).toHaveLength(1);

    expect(
      keysIn(`      .some((l) => l.includes("${COMPANY_PORT}/postgres"));`),
      "a scanner's own search string is not an address",
    ).toEqual([]);
  });

  it("(1) the sweep really walked the battery", () => {
    const files = batteryFiles();
    expect(
      files.length,
      "the file walk found almost nothing — it is looking in the wrong place",
    ).toBeGreaterThan(90);
    expect(files.some((f) => f.endsWith("vitest.config.ts"))).toBe(true);
  });

  it("(2) no file the battery loads can open a connection to the company", () => {
    const offenders: string[] = [];
    for (const file of batteryFiles()) {
      for (const hit of keysIn(readFileSync(file, "utf8"))) {
        offenders.push(`${relative(REPO, file)}:${hit.line}  ${hit.text}`);
      }
    }
    expect(
      offenders,
      "these lines carry a connectable address for the CEO's own database into `pnpm test`:\n" +
        offenders.join("\n"),
    ).toEqual([]);
  });
});
