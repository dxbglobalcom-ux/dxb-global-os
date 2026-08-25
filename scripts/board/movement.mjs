#!/usr/bin/env node
/**
 * WHAT MOVED ON WHICH ROW, AND WHEN.
 *
 * HIS QUESTION, 2026-08-26: "artık bu hazırladığın yerden herşeyi takip
 * edeceğim değil mi? tahtada yapılanlarla ilgili herşey oraya yansıyacak mı?
 * çünkü takip etmek istiyorum."
 *
 * Showing him the board's rows answers "what is left". It does not answer
 * "what is happening" — for that he needs to see, per row, when it last moved
 * and how often. That is not written anywhere by hand; it is already in the
 * repository's own history, and this file reads it out.
 *
 * Method, and it is a measurement rather than a guess: every commit that ever
 * touched the board file is read back, its rows are split out, and each row's
 * text is fingerprinted. A row "moved" in a commit when its fingerprint differs
 * from the previous commit's. No commit message is trusted for this — only the
 * text of the row itself.
 *
 * The result is cached in var/board/hareket.json against the current HEAD, so
 * the walk costs its seconds once rather than on every open.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const BOARD_PATH = "HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md";
const CACHE = join(REPO, "var/board/hareket.json");

const git = (args) =>
  execFileSync("git", args, { cwd: REPO, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });

const fp = (s) => createHash("sha256").update(s).digest("hex").slice(0, 12);

/** The rows of one version of the board, id -> its whole line. */
function rowsOf(text) {
  const out = new Map();
  for (const line of text.split("\n")) {
    const m = /^\|\s*(B\d+(?:-bis)?|C\d+)\s*\|/.exec(line);
    if (m) out.set(m[1], fp(line));
  }
  return out;
}

export function movement({ refresh = false } = {}) {
  const head = git(["rev-parse", "HEAD"]).trim();
  if (!refresh && existsSync(CACHE)) {
    try {
      const cached = JSON.parse(readFileSync(CACHE, "utf8"));
      if (cached.head === head) return cached;
    } catch { /* a damaged cache is rebuilt, never trusted */ }
  }

  // Oldest first, so each version is compared with the one before it.
  const log = git(["log", "--reverse", "--format=%H%x09%cI%x09%s", "--", BOARD_PATH])
    .split("\n").filter(Boolean)
    .map((l) => { const [sha, iso, ...rest] = l.split("\t"); return { sha, iso, subject: rest.join("\t") }; });

  const hareket = {};   // row id -> [{ date, sha, subject }], newest first
  let previous = new Map();
  for (const c of log) {
    let text = "";
    try { text = git(["show", `${c.sha}:${BOARD_PATH}`]); } catch { continue; }
    const now = rowsOf(text);
    for (const [id, hash] of now) {
      // A row that appears for the first time counts as a movement — that is the
      // day it was opened, and it belongs in its own history.
      if (previous.get(id) !== hash) {
        (hareket[id] ||= []).unshift({ date: c.iso.slice(0, 10), time: c.iso.slice(11, 16), sha: c.sha.slice(0, 8), subject: c.subject });
      }
    }
    previous = now;
  }

  const out = { head, boardCommits: log.length, hareket };
  mkdirSync(dirname(CACHE), { recursive: true });
  writeFileSync(CACHE, JSON.stringify(out), "utf8");
  return out;
}

if (process.argv[1] && process.argv[1].endsWith("movement.mjs")) {
  const t0 = Date.now();
  const m = movement({ refresh: process.argv.includes("--refresh") });
  const rows = Object.keys(m.hareket).length;
  const total = Object.values(m.hareket).reduce((a, v) => a + v.length, 0);
  console.log(`tahtaya dokunan commit: ${m.boardCommits} · hareket görülen satır: ${rows} · toplam hareket: ${total} · ${Date.now() - t0} ms`);
  for (const id of ["B12", "B39", "B22"]) {
    const h = m.hareket[id];
    if (h) console.log(`  ${id}: ${h.length} hareket · en son ${h[0].date} ${h[0].time}`);
  }
}
