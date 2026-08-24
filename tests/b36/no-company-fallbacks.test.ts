import { describe, expect, it } from "vitest";
import { bindingsIn, scan } from "../../scripts/b36/count-company-fallbacks.mjs";

// B36 · Block 4 — THE COMPANY'S ADDRESS IS NOT A DEFAULT ANYWHERE.
//
// What this closes, measured 2026-08-24 before the block was built: 95 files in
// this repository bound the holding's own address to DXB_DATABASE_URL as a
// FALLBACK — 83 in the battery, 8 scripts, 3 seeds, and one live application
// route. Each was inert while something else set the variable first, and each
// fired the moment nothing did: a suite run by a bare `vitest`, a seed run from
// a shell with no environment, a script started by hand. That is how the
// construction site could write into the CEO's books without one line of code
// ever saying it meant to.
//
// THE RULE THIS FILE HOLDS. No tracked file may bind the company's address to
// DXB_DATABASE_URL. Not as `=`, not as `??=`, not as `||=`, not as a `??`
// default, not through a const, not in an env object handed to a child process.
// A file that needs an engine is told which one; a file that is not told stops
// (packages/shared/src/db.ts:39).
//
// WHY IT IMPORTS THE COUNTER INSTEAD OF SEARCHING FOR ITSELF. The figure was
// published three times from three throw-away shell pipelines and came out 94,
// 93 and 96 — a number nobody can reproduce by running one command is not a
// measurement. `scripts/b36/count-company-fallbacks.mjs` parses the code with
// TypeScript's own parser and is the single definition of what a fallback IS.
// Importing it means the gate and the definition cannot drift apart.
//
// WHY NO LINE HERE SPELLS THE ADDRESS. tests/b36/battery-carries-no-company-key
// forbids a connectable company address on any live line in the battery, and it
// is right to: this file would otherwise become the key it exists to look for.
// The port is a constant and the addresses are composed, exactly as that file
// composes its own.
//
// WHAT IS DELIBERATELY NOT COUNTED, and why it is not a loophole:
//   · markdown — every report written about this work quotes the address, so a
//     total that includes documentation is stale the day after it is published;
//   · a file that carries the address without BINDING it to DXB_DATABASE_URL —
//     a scanner's own search string, an assertion, a comment recording history,
//     and `scripts/systemd/install.sh`, which writes the company's address for
//     the company's OWN daemons under DXB_COMPANY_DATABASE_URL, a name no other
//     tool reads (the two units map it back inside their own ExecStart).
// Both classes are listed by the counter in its own output, never hidden.

interface Binding {
  line: number;
  shape: string;
}
interface Fallback {
  file: string;
  line: number;
  shape: string;
  hits: number;
}
interface Scan {
  executable: Fallback[];
  documented: string[];
  mention: string[];
  occurrences: number;
  scanned: number;
}

/** The company's Postgres engine on this machine (supabase_db_DxB_Global_OS). */
const COMPANY_PORT = "54322";
const COMPANY = `postgresql://postgres:postgres@127.0.0.1:${COMPANY_PORT}/postgres`;

describe("B36 Block 4 — nothing falls back to the company's database", () => {
  // MEASURE THE INSTRUMENT FIRST. A gate reporting a comfortable zero has said
  // nothing until it has been shown finding the thing it looks for. On
  // 2026-08-23 a detector in this same block reported zero because `\b` is a
  // backspace in PostgreSQL's regular expressions, and nobody had ever asked it
  // to find anything. This one is asked, in every shape the counter claims to
  // read.
  it("(0) the counter finds a fallback in each shape it claims to read", () => {
    const shapes: Array<[string, string, string]> = [
      ["assignment", "a.ts", `process.env.DXB_DATABASE_URL = "${COMPANY}";`],
      ["nullish assignment", "b.ts", `process.env.DXB_DATABASE_URL ??= "${COMPANY}";`],
      ["or assignment", "c.ts", `process.env.DXB_DATABASE_URL ||= "${COMPANY}";`],
      ["nullish default", "d.ts", `const u = process.env.DXB_DATABASE_URL ?? "${COMPANY}";`],
      [
        "const indirection",
        "e.mjs",
        `const C = "${COMPANY}";\nconst u = process.env.DXB_DATABASE_URL ?? C;`,
      ],
      ["child env object", "f.ts", `spawn("node", { env: { DXB_DATABASE_URL: "${COMPANY}" } });`],
      ["a shell line", "g.sh", `export DXB_DATABASE_URL="${COMPANY}"`],
    ];
    for (const [name, file, text] of shapes) {
      expect(
        (bindingsIn(file, text) as Binding[]).length,
        `the counter cannot see a company fallback written as ${name} — it is blind, not clean`,
      ).toBeGreaterThan(0);
    }
  });

  it("(0b) and it does not cry over a record of the address", () => {
    expect(
      bindingsIn("note.ts", `// it used to read ${COMPANY}`) as Binding[],
      "a comment recording history is not a fallback",
    ).toEqual([]);
    expect(
      bindingsIn("report.md", `process.env.DXB_DATABASE_URL ??= "${COMPANY}";`) as Binding[],
      "a report quoting the deleted line is not a fallback",
    ).toEqual([]);
    expect(
      bindingsIn("daemon.ts", `process.env.DXB_COMPANY_DATABASE_URL = "${COMPANY}";`) as Binding[],
      "a name no tool reads by accident is not a fallback into DXB_DATABASE_URL",
    ).toEqual([]);
  });

  it("(1) the sweep really walked this repository", () => {
    const r = scan() as Scan;
    expect(
      r.scanned,
      "the walk found almost no files — `git ls-files` is not answering where this runs",
    ).toBeGreaterThan(1000);
  });

  it("(2) no tracked file binds the company's address to DXB_DATABASE_URL", () => {
    const r = scan() as Scan;
    const offenders = r.executable.map((e) => `${e.file}:${e.line}  ${e.shape}  (${e.hits})`);
    expect(
      offenders,
      "these files fall through to the CEO's own database when nothing sets the address:\n" +
        offenders.join("\n"),
    ).toEqual([]);
  });
});
