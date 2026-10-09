#!/usr/bin/env node
/**
 * A PART OF A ROW IS DONE — ONE DATED NOTE, NEVER A CLOSE.
 *
 * HIS ORDER, 2026-10-09: "bir satırda bazen işin sadece bir kısmı bitmiştir.
 * dikkat edin sakın kapatmayın herşey tamamen bitince satır kapanır. bir kısmı
 * değil. oraya sadece ne bittiği ile ilgili not düşülür hikaye değil."
 *
 * So a partly finished open row is not closed, not moved and not rewritten. It
 * gets one short dated note of what finished, appended to its third cell (what
 * is open) as ` ✓ <date> — <note>`, and the same line as a bullet under
 * `## Done notes` in its own file, .planning/board-rows/<ID>.md. Every other
 * byte of the board stays as it was.
 *
 * A note, not a story: one sentence, no newline, no `|`, at most 140
 * characters. The row must still pass the records ruler's R5 ceiling (1,600
 * bytes, tests/b43/records-truth.ts) after the note — if it would not, nothing
 * is written and the row's detail has to move to its file first.
 *
 * The row file is written before the board. A board that already carries the
 * note while the row file lacks its bullet (a half-written earlier run) is
 * repaired: only the bullet is written, and the run says REPAIRED.
 *
 * Usage:
 *   node scripts/board/note-done.mjs <ID> "<note>" [--date YYYY-MM-DD] [--board <path>] [--rows-dir <path>]
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const BOARD_PATH = "HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md";
const ROWS_DIR = ".planning/board-rows";
const ROW_CEILING = 1600;
const NOTE_MAX = 140;
const HEADING = "## Done notes";

function refuse(reason) {
  process.stderr.write(`REFUSED: ${reason}\n`);
  process.exit(1);
}

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function parseArgs(argv) {
  const positional = [];
  const opts = { date: today(), board: BOARD_PATH, rowsDir: ROWS_DIR };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--date" || a === "--board" || a === "--rows-dir") {
      if (i + 1 >= argv.length) refuse(`${a} needs a value`);
      const v = argv[++i];
      if (a === "--date") opts.date = v;
      else if (a === "--board") opts.board = v;
      else opts.rowsDir = v;
    } else positional.push(a);
  }
  if (positional.length !== 2) refuse('usage: note-done.mjs <ID> "<note>" [--date YYYY-MM-DD] [--board <path>] [--rows-dir <path>]');
  return { id: positional[0], note: positional[1], ...opts };
}

/** Why the note is not a note, or null when it is one. */
function noteFault(note) {
  if (note.trim() === "") return "the note is empty";
  if (/[\r\n]/.test(note)) return "the note has a newline — one line only";
  if (note.includes("|")) return "the note contains `|`, which would split the board cell";
  if ([...note].length > NOTE_MAX) return `the note is ${[...note].length} characters, over ${NOTE_MAX} — a note, not a story`;
  if (/[.!?]\s+\S/.test(note)) return "the note holds more than one sentence — a note, not a story";
  return null;
}

/** Index of the n-th unescaped `|` in the line (0-based n), or -1. */
function nthPipe(line, n) {
  let seen = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === "|" && line[i - 1] !== "\\") {
      if (seen === n) return i;
      seen++;
    }
  }
  return -1;
}

function writeAtomic(path, text) {
  const tmp = join(dirname(path), `.${basename(path)}.note-done.${process.pid}.tmp`);
  writeFileSync(tmp, text);
  renameSync(tmp, path);
}

const args = parseArgs(process.argv.slice(2));
const { id, note, date } = args;
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) refuse(`--date ${date} is not YYYY-MM-DD`);
const fault = noteFault(note);
if (fault) refuse(fault);

const boardPath = resolve(REPO, args.board);
const rowsDir = resolve(REPO, args.rowsDir);
if (!existsSync(boardPath)) refuse(`board not found: ${boardPath}`);

const text = readFileSync(boardPath, "utf8");
const lines = text.split("\n");
const openHits = [];
let closedHit = false;
let section = "";
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].endsWith("\r") ? lines[i].slice(0, -1) : lines[i];
  const mark = /<!-- BOARD-SECTION: (\w+) -->/.exec(line);
  if (mark) { section = mark[1]; continue; }
  if (!line.startsWith("| ")) continue;
  if (line.split("|")[1].trim() !== id) continue;
  if (section === "open") openHits.push(i);
  else if (section === "closed") closedHit = true;
}
if (openHits.length === 0) {
  refuse(closedHit
    ? `${id} stands only in a closed section — a closed row takes no done note`
    : `${id} is not a row in any open section of ${args.board}`);
}
if (openHits.length > 1) refuse(`${id} stands ${openHits.length} times in the open sections — fix the board first`);

const at = openHits[0];
const cr = lines[at].endsWith("\r");
const row = cr ? lines[at].slice(0, -1) : lines[at];
const cellEnd = nthPipe(row, 3);
if (cellEnd === -1) refuse(`${id} has fewer than three cells`);
let insertAt = cellEnd;
while (insertAt > 0 && /[ \t]/.test(row[insertAt - 1])) insertAt--;
const mark = `✓ ${date} — ${note}`;
const bullet = `- ${mark}`;
const rowFile = join(rowsDir, `${id}.md`);
const body = existsSync(rowFile) ? readFileSync(rowFile, "utf8") : null;
const fileCarries = body !== null && body.split(/\r?\n/).some((l) => l.trimEnd() === bullet);
const boardCarries = row.includes(mark);
// Idempotent: the same note on the same day is already there — refuse rather than write it twice.
// A board that carries it while the row file lacks it is a half-written earlier run: repair the file only.
if (boardCarries && (body === null || fileCarries)) refuse(`${id} already carries "${mark}"; nothing written`);
let noted = null;
if (!boardCarries) {
  noted = `${row.slice(0, insertAt)} ${mark}${row.slice(insertAt)}`;
  const size = Buffer.byteLength(noted, "utf8");
  if (size > ROW_CEILING) {
    refuse(`${id} would be ${size} bytes, over the R5 ceiling of ${ROW_CEILING} — move its detail word for word to ${args.rowsDir}/${id}.md first; nothing written`);
  }
}

// The row file is written BEFORE the board: if it fails, the board is untouched and a retry starts clean.
let rowStatus;
if (body === null) {
  rowStatus = `row file ${rowFile} not found — skipped`;
} else if (fileCarries) {
  rowStatus = `row file ${rowFile} — already carries the bullet`;
} else {
  const eol = body.includes("\r\n") ? "\r\n" : "\n";
  const endsWithEol = body.endsWith("\n");
  const rl = body.split(eol);
  if (endsWithEol) rl.pop();
  const h = rl.findIndex((l) => l.trimEnd() === HEADING);
  if (h === -1) {
    while (rl.length > 0 && rl[rl.length - 1].trim() === "") rl.pop();
    rl.push("", HEADING, "", bullet);
  } else {
    // Insert after the section's last non-blank line, before the next heading if any.
    let next = rl.findIndex((l, j) => j > h && /^#{1,2} /.test(l));
    if (next === -1) next = rl.length;
    let last = next - 1;
    while (last > h && rl[last].trim() === "") last--;
    if (last === h) rl.splice(h + 1, 0, "", bullet);
    else rl.splice(last + 1, 0, bullet);
  }
  writeAtomic(rowFile, rl.join(eol) + eol);
  rowStatus = `row file ${rowFile} — bullet added under ${HEADING}${h === -1 ? " (heading created)" : ""}`;
}

if (noted === null) {
  process.stdout.write(`REPAIRED ${id} ${mark} — the board already carried it\n${rowStatus}\n`);
  process.exit(0);
}
lines[at] = cr ? `${noted}\r` : noted;
writeAtomic(boardPath, lines.join("\n"));

process.stdout.write(`NOTED ${id} ${mark}\n${rowStatus}\n`);
