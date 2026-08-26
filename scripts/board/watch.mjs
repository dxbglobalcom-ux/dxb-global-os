#!/usr/bin/env node
/**
 * THE BOARD'S NIGHT WATCHMAN.
 *
 * HIS QUESTION, 2026-08-26: "artık bu hazırladığın yerden herşeyi takip
 * edeceğim değil mi? … çünkü takip etmek istiyorum."
 *
 * The honest answer was NO, not yet: the page was a photograph taken whenever
 * somebody remembered to run the command, and its own header claimed it was
 * re-read at every open — which was false, and false on a surface HE reads.
 * A page that lies about its own freshness is worse than no page.
 *
 * This closes it. It watches the three files the page is made of and rewrites
 * the page within a second of any of them changing. Nothing else: it opens no
 * database, holds no credential, and never writes to the board.
 *
 * Run:  node scripts/board/watch.mjs
 *       (as a resident service: systemctl --user start dxb-board)
 */
import { execFile } from "node:child_process";
import { watch } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const RENDER = join(REPO, "scripts/board/render.mjs");

// The things the page is made of. The movement history is derived from git
// rather than from a file, so a new commit matters too.
//
// AND IT IS .git/logs/HEAD, NOT .git/HEAD. Measured 2026-08-26 12:24: a commit
// was made, the page was NOT redrawn, and .git/HEAD's own mtime still read
// 2026-07-05 — it holds the words "ref: refs/heads/master" and git does not
// rewrite it to commit. The reflog is appended on every HEAD movement there is
// (commit, checkout, reset, merge, rebase), so that is the file to watch.
// .git/HEAD stays beside it for the case where reflogs are switched off.
//
// The approval register is NOT among them any more: his order of 2026-08-26
// took the approval ledger off this page, so nothing here reads that file.
const IZLENEN = [
  "HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md",
  "scripts/board/tr.json",
  ".git/logs/HEAD",
  ".git/HEAD",
];

let bekleyen = null;
let calisiyor = false;
let tekrar = false;

function ciz(sebep) {
  if (calisiyor) { tekrar = true; return; }
  calisiyor = true;
  execFile("node", [RENDER, "--movement-refresh"], { cwd: REPO }, (err, out, errOut) => {
    calisiyor = false;
    // This machine's own clock, not UTC — a log stamped two hours off the wall
    // clock is a small lie, and it is the kind that makes a bigger one believable.
    const n = new Date();
    const iki = (x) => String(x).padStart(2, "0");
    const damga = `${n.getFullYear()}-${iki(n.getMonth() + 1)}-${iki(n.getDate())} ${iki(n.getHours())}:${iki(n.getMinutes())}:${iki(n.getSeconds())}`;
    if (err) console.error(`[tahta] ${damga} · ${sebep} · ÇİZİLEMEDİ: ${String(errOut || err.message).trim()}`);
    else console.error(`[tahta] ${damga} · ${sebep} · ${String(out).trim().split("\n").pop()}`);
    if (tekrar) { tekrar = false; ciz("arka arkaya değişiklik"); }
  });
}

/** An editor writes a file several times in a second; one redraw is enough. */
function tetikle(sebep) {
  clearTimeout(bekleyen);
  bekleyen = setTimeout(() => ciz(sebep), 400);
}

for (const rel of IZLENEN) {
  try {
    watch(join(REPO, rel), { persistent: true }, () => tetikle(rel));
    console.error(`[tahta] izleniyor: ${rel}`);
  } catch (e) {
    // A file that cannot be watched is named out loud rather than silently
    // dropped — otherwise the page would go stale for a reason nobody could see.
    console.error(`[tahta] ⚠ İZLENEMİYOR: ${rel} — ${e.message}`);
  }
}

ciz("başlangıç");
console.error("[tahta] nöbetçi ayakta — tahta değişince sayfa yeniden çizilir");
