#!/usr/bin/env node
// B20 — THE PROJECT IS COUNTED THE SAME WAY EVERY TIME.
//
// THE DEFECT, opened 2026-07-17 and measured again 2026-08-26. The roadmap's
// status token sits in no fixed cell: two table shapes live in one file (5 and
// 6 columns), a status is written `✓ …` in one row and `**✓ COMPLETE …**` in
// the next, 45 description cells carry a pipe inside backticks, and one row
// keeps its CEO-OK marker past the closing pipe. So every session re-derived
// the completion figure by hand and every session got a different number —
// `.planning/STATE.md`'s own history records 67 → 73 → 74 with an openly
// admitted "+1 drift". That is the mechanical half of the CEO's complaint
// "KALİTE Mİ DÜŞÜYOR UYGULARKEN ANLAMIYORUM": he cannot see progress because
// progress was not measurable.
//
// This file is the one place that counts. It reads the roadmap, refuses to
// guess, and fails loudly on a row it cannot read — so the format cannot rot
// back into hand-counting. `ledger-truth.mjs` re-measures its numbers against
// the STATE claims written in the corpus, which is what stops silent drift.
//
// Usage:  node scripts/governance/roadmap-tally.mjs [--json]   (pnpm roadmap:tally)

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const ROADMAP = "HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md";

/** A step id: E1.1, E12.5b, R4.3, W5.1. Never a header, never a rule line. */
const STEP_ID = /^[A-Z]\d+(?:\.\d+[a-z]?)?$/;

/** The five tokens a status cell may open with, and what each one means. */
export const STATUS = {
  "✓": "done",
  "◐": "partial",
  "○": "open",
  "✗": "cancelled",
  "—": "none",
};

/** A private-use character no document contains, standing in for a masked pipe. */
const MASK = "";

/** Pipes inside `code spans` are text, not cell walls. Blind them first. */
function cellsOf(line) {
  const masked = line.replace(/`[^`]*`/g, (span) => span.split("|").join(MASK));
  return masked
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.split(MASK).join("|").trim());
}

/** Emphasis is decoration; the token underneath is the status. */
function statusToken(cell) {
  return cell.split("**").join("").trimStart().slice(0, 1);
}

/** The last cell that actually carries a status — a trailing marker is not one. */
function statusCell(cells) {
  for (let i = cells.length - 1; i >= 1; i--) {
    const c = cells[i];
    if (!c) continue;
    if (/^<!--.*-->$/.test(c)) continue;
    return c;
  }
  return "";
}

export function roadmapTally(repo = REPO) {
  const lines = readFileSync(path.join(repo, ROADMAP), "utf8").split("\n");
  const rows = [];
  const unreadable = [];
  lines.forEach((line, i) => {
    if (!line.startsWith("|")) return;
    const cells = cellsOf(line);
    const id = cells[0];
    if (!STEP_ID.test(id)) return;
    const cell = statusCell(cells);
    const status = STATUS[statusToken(cell)];
    if (!status) {
      unreadable.push({ id, line: i + 1, cell: cell.slice(0, 60) });
      return;
    }
    rows.push({ id, line: i + 1, status });
  });
  const count = { done: 0, partial: 0, open: 0, cancelled: 0, none: 0 };
  for (const r of rows) count[r.status]++;
  return { rows, unreadable, count, total: rows.length };
}

function main() {
  const t = roadmapTally();
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ total: t.total, ...t.count, unreadable: t.unreadable }, null, 2));
  } else {
    console.log(`roadmap tally — ${ROADMAP}`);
    console.log(`  rows counted   ${t.total}`);
    for (const [k, v] of Object.entries(t.count)) console.log(`  ${k.padEnd(14)} ${v}`);
    console.log(`  done share     ${t.total ? Math.round((t.count.done / t.total) * 100) : 0}%`);
  }
  if (t.unreadable.length) {
    console.error(
      `\nrefused to guess ${t.unreadable.length} row(s) — give each a status token (${Object.keys(STATUS).join(" ")}):`,
    );
    for (const u of t.unreadable) console.error(`  ${ROADMAP}:${u.line} ${u.id} → "${u.cell}"`);
    process.exit(1);
  }
  if (!t.total) {
    console.error("refused: counted zero rows — the parser has lost the table, not the project");
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
