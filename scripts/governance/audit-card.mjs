#!/usr/bin/env node
// THE SCORE CARD GATE — dxb-team2 §3 and §6, held by a machine (CEO 2026-10-01: "tmm makineyi de kur").
//
// Before 2026-10-01 the lead filled the card by hand, picked the auditor's effort by hand, and
// refuter.sh fell back to `high` in silence when no effort was given — nothing checked that a card
// existed or that the effort matched it. This file is that check. refuter.sh calls it before every
// audit; an audit without a valid card does not start.
//
//   node scripts/governance/audit-card.mjs check <card-file> [--effort medium|high|xhigh]
//
// The card is a plain file (a CARD.md beside the job's plan, or any file) holding these lines:
//   job: <the job in one sentence>
//   range: <git range of the work under audit, e.g. 635e32bc..HEAD>
//   blast: 0|1|2      reasoning: 0|1|2
//   risk: 0|1|2       ambiguity: 0|1|2
// Total 0-2 light → medium · 3-5 normal → high · 6-8 critical → xhigh.
//
// THE FLOOR is measured, not declared: the files the range touches are matched against the
// guarded classes below, and a hit raises the class to that floor whatever the axes say. The effort
// may be raised above the card's (a fix that spread, §4 FIX) but never lowered beneath it.
// Prints one JSON object on success (exit 0); one REFUTER_FAIL line on refusal (exit 2).
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const AXES = ["blast", "risk", "reasoning", "ambiguity"];
export const LEVELS = ["medium", "high", "xhigh"];
export const CLASSES = ["light", "normal", "critical"];

// dxb-team2 §3: "a job touching money, the database, security, approval or governance files is at
// least normal". One table, so a change of the floor is one edit here and the door's sentence.
export const FLOOR = [
  { name: "database", min: "normal", re: /^(db|supabase)\/|\.sql$|^scripts\/(bootstrap-db|restore-db)\.sh$|^scripts\/migration\// },
  { name: "money", min: "normal", re: /^packages\/revenue\/|(^|\/)(payments?|billing|invoices?|wallet|money)(\/|\.|-|_)/i },
  { name: "security", min: "normal", re: /^packages\/gateway\/|^vps\/|(^|\/)[^/]*(auth|vault|secret|security|credential|sandbox|bwrap)[^/]*$/i },
  { name: "approval", min: "normal", re: /approv/i },
  { name: "governance", min: "normal", re: /^scripts\/governance\/|^\.planning\/governance\/|^HOLDING-OS-MASTER-PLAN\/00-CEO-DIRECTIVE|^docs\/ceo-directives\/|^\.claude\/|^\.agents\/|^tools\/hooks\/|(^|\/)(CLAUDE|AGENTS)\.md$/ },
];

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

export function floorOf(files) {
  const hits = [];
  for (const f of files) for (const g of FLOOR) if (g.re.test(f)) hits.push({ file: f, guard: g.name, min: g.min });
  const min = hits.reduce((m, h) => Math.max(m, CLASSES.indexOf(h.min)), 0);
  return { hits, min: hits.length ? CLASSES[min] : null };
}

export function filesIn(range, repo = REPO) {
  if (!/^[\w./~^@{}-]+\.\.[\w./~^@{}-]+$/.test(range)) fail(`\`range: ${range}\` is not a git range A..B.`);
  const [a, b] = range.split("..");
  for (const end of [a, b]) {
    const r = spawnSync("git", ["-C", repo, "rev-parse", "--verify", "--quiet", `${end}^{commit}`], { encoding: "utf8" });
    if (r.status !== 0) fail(`\`${end}\` in the card's range is not a commit in this repository.`);
  }
  const d = spawnSync("git", ["-C", repo, "diff", "--name-only", range], { encoding: "utf8" });
  if (d.status !== 0) fail(`git diff ${range} failed: ${d.stderr.trim()}`);
  const files = d.stdout.split("\n").filter(Boolean);
  if (!files.length) fail(`the range ${range} changes no file — there is nothing to audit.`);
  return files;
}

export function route(card, files, effort) {
  const total = AXES.reduce((s, a) => s + card[a], 0);
  const scored = classOf(total);
  const floor = floorOf(files);
  const cls = floor.min && CLASSES.indexOf(floor.min) > CLASSES.indexOf(scored) ? floor.min : scored;
  const required = LEVELS[CLASSES.indexOf(cls)];
  if (effort !== undefined && effort !== "") {
    if (!LEVELS.includes(effort)) fail(`--effort ${effort} — the auditor runs at medium, high or xhigh.`);
    if (LEVELS.indexOf(effort) < LEVELS.indexOf(required))
      fail(`--effort ${effort} is beneath the card: ${cls} work is audited at ${required} or higher.`);
  }
  return {
    total, scored, class: cls, floorRaised: cls !== scored,
    floor: floor.hits.length ? { min: floor.min, guards: [...new Set(floor.hits.map((h) => h.guard))], first: floor.hits.slice(0, 5).map((h) => h.file) } : null,
    files: files.length, required, effort: effort || required,
  };
}

// The block Sol reads first: the card as the lead wrote it, and what the machine made of it.
export function briefBlock(text, r) {
  const floor = r.floor ? `measured floor: ${r.floor.guards.join(", ")} files touched (e.g. ${r.floor.first.join(", ")}) → at least ${r.floor.min}` : "measured floor: no guarded file touched";
  return [
    "THE LEAD'S SCORE CARD (dxb-team2 §3), as written — check it too: does it under-grade this job?",
    text.trim(),
    `MACHINE: axes total ${r.total} → ${r.scored}; ${floor}; class ${r.class}; ${r.files} files in the range; you run at ${r.effort}.`,
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
    const r = route(card, filesIn(card.range), effort);
    console.log(JSON.stringify({ ...r, range: card.range, brief: briefBlock(text, r) }));
  } catch (e) {
    if (!e.refusal) throw e;
    console.error(`REFUTER_FAIL: ${e.message}`);
    process.exit(2);
  }
}
