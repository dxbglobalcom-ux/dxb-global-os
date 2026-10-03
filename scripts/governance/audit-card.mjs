#!/usr/bin/env node
// THE SCORE CARD GATE — dxb-team2 §3 and §6, held by a machine (CEO 2026-10-01: "tmm makineyi de kur").
//
// Before 2026-10-01 the lead filled the card by hand, picked the auditor's effort by hand, and
// refuter.sh fell back to `high` in silence when no effort was given — nothing checked that a card
// existed or that the effort matched it. This file is that check, and only that: refuter.sh calls it
// before every audit; an audit without a valid card does not start, and its effort is never beneath
// the card.
//
// It does NOT judge which files are dangerous. A first version tried (path lists, then content
// patterns); Sol's audits found a new gap every round, and the CEO named why: "sistem tahmin edemez
// onu sadece sen bilirsin … milyar tane tehlikeli olabilecek şey olabilir". The grading is the lead's
// judgment, written on the card. Sol is shown it for information, audits at the level it gives and
// never re-grades it (the CEO, 2026-10-03: "kalıcı olsun senin puanladığını o puanlamasın"; dxb-team2 §6).
//
//   node scripts/governance/audit-card.mjs check <card-file> [--effort medium|high|xhigh]
//
// The card is a plain file (a CARD.md beside the job's plan, or any file) holding these lines:
//   job: <the job in one sentence>
//   range: <git range of the work under audit, e.g. 635e32bc..HEAD>
//   blast: 0|1|2      reasoning: 0|1|2
//   risk: 0|1|2       ambiguity: 0|1|2
// Total 0-2 light → medium · 3-5 normal → high · 6-8 critical → xhigh. The effort may be raised above
// the card's (a fix that spread, §4 FIX), never lowered beneath it.
// Prints one JSON object on success (exit 0); one REFUTER_FAIL line on refusal (exit 2).
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const AXES = ["blast", "risk", "reasoning", "ambiguity"];
export const LEVELS = ["medium", "high", "xhigh"];
export const CLASSES = ["light", "normal", "critical"];

const fail = (msg) => {
  const e = new Error(msg);
  e.refusal = true;
  throw e;
};

export function parseCard(text) {
  const card = {};
  for (const line of text.split("\n")) {
    const m = /^\s*(?:[-*]\s*)?\**([a-z]+)\**\s*:\s*(.*?)\s*$/i.exec(line);
    if (m && !(m[1].toLowerCase() in card)) card[m[1].toLowerCase()] = m[2];
  }
  if (!card.job) fail("the card has no `job:` line — the job in one sentence.");
  if (!card.range) fail("the card has no `range:` line — the git range of the work under audit.");
  for (const a of AXES) {
    if (!(a in card)) fail(`the card has no \`${a}:\` line (0, 1 or 2).`);
    if (!/^[012]$/.test(card[a])) fail(`\`${a}: ${card[a]}\` — each axis is 0, 1 or 2.`);
    card[a] = Number(card[a]);
  }
  return card;
}

export const classOf = (total) => (total <= 2 ? "light" : total <= 5 ? "normal" : "critical");

// The range must name real commits and change something — an audit of nothing is refused.
export function countFiles(range, repo = REPO) {
  if (!/^[\w./~^@{}-]+\.\.[\w./~^@{}-]+$/.test(range)) fail(`\`range: ${range}\` is not a git range A..B.`);
  const [a, b] = range.split("..");
  for (const end of [a, b]) {
    const r = spawnSync("git", ["-C", repo, "rev-parse", "--verify", "--quiet", `${end}^{commit}`], { encoding: "utf8" });
    if (r.status !== 0) fail(`\`${end}\` in the card's range is not a commit in this repository.`);
  }
  const d = spawnSync("git", ["-C", repo, "diff", "--name-only", "-z", range], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (d.status !== 0) fail(`git diff ${range} failed: ${d.stderr.trim()}`);
  const n = d.stdout.split("\0").filter(Boolean).length;
  if (!n) fail(`the range ${range} changes no file — there is nothing to audit.`);
  return n;
}

export function route(card, files, effort) {
  const total = AXES.reduce((s, a) => s + card[a], 0);
  const cls = classOf(total);
  const required = LEVELS[CLASSES.indexOf(cls)];
  if (effort !== undefined && effort !== "") {
    if (!LEVELS.includes(effort)) fail(`--effort ${effort} — the auditor runs at medium, high or xhigh.`);
    if (LEVELS.indexOf(effort) < LEVELS.indexOf(required))
      fail(`--effort ${effort} is beneath the card: ${cls} work is audited at ${required} or higher.`);
  }
  return { total, class: cls, files, required, effort: effort || required };
}

// The block Sol reads first: the card as the lead wrote it, for information, and what the machine made of it.
export function briefBlock(text, r) {
  return [
    "THE LEAD'S SCORE CARD (dxb-team2 §3), shown for information — it is the lead's grading. Audit the work at the level it gives; do not re-grade the card.",
    text.trim(),
    `MACHINE: axes total ${r.total} → class ${r.class}; ${r.files} files in the range; you run at ${r.effort}.`,
    "",
    "",
  ].join("\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [cmd, file, ...rest] = process.argv.slice(2);
  const i = rest.indexOf("--effort");
  const effort = i >= 0 ? rest[i + 1] ?? "" : undefined;
  try {
    if (cmd !== "check" || !file) fail("usage: audit-card.mjs check <card-file> [--effort medium|high|xhigh]");
    let text;
    try { text = readFileSync(file, "utf8"); } catch { fail(`no card at ${file} — an audit does not start without the job's score card (dxb-team2 §3).`); }
    const card = parseCard(text);
    const r = route(card, countFiles(card.range), effort);
    console.log(JSON.stringify({ ...r, range: card.range, brief: briefBlock(text, r) }));
  } catch (e) {
    if (!e.refusal) throw e;
    console.error(`REFUTER_FAIL: ${e.message}`);
    process.exit(2);
  }
}
