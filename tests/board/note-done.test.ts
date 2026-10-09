// A PART OF A ROW IS DONE — ONE DATED NOTE, NEVER A CLOSE.
//
// HIS ORDER, 2026-10-09: "bir satırda bazen işin sadece bir kısmı bitmiştir.
// dikkat edin sakın kapatmayın herşey tamamen bitince satır kapanır. bir kısmı
// değil. oraya sadece ne bittiği ile ilgili not düşülür hikaye değil."
//
// These cases pin scripts/board/note-done.mjs: the note lands at the end of the
// row's third cell and nowhere else, a closed row is never touched, a story is
// refused, and the R5 ceiling (1,600 bytes) holds. Every case runs on a temp
// copy of a small synthetic board — the real board is never written.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SCRIPT = join(REPO, "scripts/board/note-done.mjs");
const DATE = "2026-10-09";

const OPEN_ROW = "| B90 | 2026-09-21 | **The test row.** Some *italic* and a [link](x.md) <!-- OPEN: B90 --> | [[SOME_SPEC]] §1 | Not yet built | CEO | One command goes green |";
const OTHER_ROW = "| B91 | 2026-09-22 | Another open row <!-- CEO-OK: x-2026-09-22 --> | [[OTHER]] | Why | Lead | It closes |";
const CLOSED_ROW = "| B80 | 2026-08-01 | A closed row | [[SPEC]] | — | — | Closed 2026-09-01 |";

const BOARD = [
  "# Board",
  "",
  "<!-- BOARD-SECTION: open -->",
  "| ID | Opened | What is open | Owning spec | Why still open | Waits on | What closes it |",
  "|---|---|---|---|---|---|---|",
  OPEN_ROW,
  OTHER_ROW,
  "",
  "<!-- BOARD-SECTION: closed -->",
  "| ID | Opened | What was open | Owning spec | — | — | Closed |",
  "|---|---|---|---|---|---|---|",
  CLOSED_ROW,
  "",
].join("\n");

const ROW_FILE = "# B90 — The test row\n\n## What closes it\n\nOne command goes green\n";

let dir: string;
let board: string;
let rows: string;

function run(...args: string[]) {
  return spawnSync("node", [SCRIPT, ...args, "--date", DATE, "--board", board, "--rows-dir", rows], { encoding: "utf8" });
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "note-done-"));
  board = join(dir, "board.md");
  rows = join(dir, "rows");
  mkdirSync(rows);
  writeFileSync(board, BOARD);
  writeFileSync(join(rows, "B90.md"), ROW_FILE);
});

afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe("note-done — a partly finished row gets one dated note", () => {
  it("writes the note at the end of cell 3 and leaves every other byte alone", () => {
    const r = run("B90", "the parser is built");
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain(`NOTED B90 ✓ ${DATE} — the parser is built`);
    const after = readFileSync(board, "utf8");
    const expected = OPEN_ROW.replace(
      "<!-- OPEN: B90 --> |",
      `<!-- OPEN: B90 --> ✓ ${DATE} — the parser is built |`,
    );
    expect(after).toBe(BOARD.replace(OPEN_ROW, expected));
    const cells = expected.split("|");
    expect(cells[3].trim().endsWith(`✓ ${DATE} — the parser is built`)).toBe(true);
  });

  it("a second note accumulates after the first", () => {
    expect(run("B90", "first part done").status).toBe(0);
    expect(run("B90", "second part done").status).toBe(0);
    const row = readFileSync(board, "utf8").split("\n").find((l) => l.startsWith("| B90 |"))!;
    expect(row).toContain(`<!-- OPEN: B90 --> ✓ ${DATE} — first part done ✓ ${DATE} — second part done | [[SOME_SPEC]]`);
  });

  it("the same note twice is refused and the board stays as it was", () => {
    expect(run("B90", "first part done").status).toBe(0);
    const once = readFileSync(board, "utf8");
    const r = run("B90", "first part done");
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("already carries");
    expect(readFileSync(board, "utf8")).toBe(once);
  });

  it("the row file gets the heading once and one bullet per note", () => {
    run("B90", "first part done");
    run("B90", "second part done");
    const body = readFileSync(join(rows, "B90.md"), "utf8");
    expect(body.match(/^## Done notes$/gm)).toHaveLength(1);
    expect(body).toBe(`${ROW_FILE}\n## Done notes\n\n- ✓ ${DATE} — first part done\n- ✓ ${DATE} — second part done\n`);
  });

  it("a missing row file is skipped and said so; the board is still written", () => {
    const r = run("B91", "half of it shipped");
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toMatch(/not found — skipped/);
    expect(readFileSync(board, "utf8")).toContain(`<!-- CEO-OK: x-2026-09-22 --> ✓ ${DATE} — half of it shipped |`);
    expect(existsSync(join(rows, "B91.md"))).toBe(false);
  });

  const refusals: Array<[string, string, string, RegExp]> = [
    ["a row that stands only in a closed section", "B80", "done", /closed section/],
    ["an unknown id", "B99", "done", /not a row in any open section/],
    ["a note with `|`", "B90", "a | b", /`\|`/],
    ["a note with a newline", "B90", "line one\nline two", /newline/],
    ["a note longer than 140 characters", "B90", "x".repeat(141), /over 140/],
    ["a note of two sentences", "B90", "The parser is built. Then we tested it", /more than one sentence/],
    ["an empty note", "B90", "  ", /empty/],
  ];
  for (const [what, id, note, reason] of refusals) {
    it(`refuses ${what} and writes nothing`, () => {
      const r = run(id, note);
      expect(r.status).toBe(1);
      expect(r.stderr).toMatch(reason);
      expect(readFileSync(board, "utf8")).toBe(BOARD);
      expect(readFileSync(join(rows, "B90.md"), "utf8")).toBe(ROW_FILE);
    });
  }

  it("refuses when the note would push the row past the 1,600-byte R5 ceiling", () => {
    const fat = OPEN_ROW.replace("**The test row.**", `**The test row.** ${"y".repeat(1600 - Buffer.byteLength(OPEN_ROW) - 10)}`);
    const fatBoard = BOARD.replace(OPEN_ROW, fat);
    writeFileSync(board, fatBoard);
    expect(Buffer.byteLength(fat)).toBeLessThanOrEqual(1600);
    const r = run("B90", "a short note");
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/over the R5 ceiling of 1600/);
    expect(readFileSync(board, "utf8")).toBe(fatBoard);
    expect(readFileSync(join(rows, "B90.md"), "utf8")).toBe(ROW_FILE);
  });

  it("keeps CRLF line endings where the files carry them", () => {
    const crlf = BOARD.replace(/\n/g, "\r\n");
    writeFileSync(board, crlf);
    writeFileSync(join(rows, "B90.md"), ROW_FILE.replace(/\n/g, "\r\n"));
    expect(run("B90", "done in part").status).toBe(0);
    const after = readFileSync(board, "utf8");
    expect(after).toBe(crlf.replace("<!-- OPEN: B90 --> |", `<!-- OPEN: B90 --> ✓ ${DATE} — done in part |`));
    expect(readFileSync(join(rows, "B90.md"), "utf8")).toBe(
      `${ROW_FILE}\n## Done notes\n\n- ✓ ${DATE} — done in part\n`.replace(/\n/g, "\r\n"),
    );
  });
});
