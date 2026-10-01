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
// THE FLOOR is measured, not declared, and it FAILS CLOSED (Sol's re-check, 2026-10-01: a list of
// guarded paths is never complete — a database consumer, a renamed file, a quoted or binary name slips
// past it). A range may stay light ONLY when every path it touches — both sides of a rename — is on
// the LIGHT allow-list (prose, screen layout, images) and no changed line of a screen file reaches the
// database or a credential. Any path on FLOOR names its guard; any other path names "unlisted". Either
// raises the class to at least normal. The effort may be raised above the card's (a fix that spread,
// §4 FIX) but never lowered beneath it.
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
// least normal". FLOOR names WHY a path is guarded (it is reported to Sol); LIGHT is the only way to
// stay beneath normal; CONTENT reads the changed lines of the LIGHT screen files, the one kind of light
// file that can still hold code.
export const FLOOR = [
  { name: "database", re: /^(db|supabase)\/|\.sql$|^scripts\/(bootstrap-db|restore-db)\.sh$|^scripts\/(migration|b36)\/|^packages\/shared\/src\/db/ },
  { name: "money", re: /^packages\/revenue\/|(^|\/)(payments?|billing|invoices?|wallet|money)(\/|\.|-|_)|(^|\/)[^/]*(cost|budget|spend|quota)[^/]*\.(ts|tsx|mjs|cjs|js|py|sh)$/i },
  { name: "security", re: /^packages\/gateway\/|^vps\/|^scripts\/(ops|systemd|hooks)\/|^\.codex\/|^\.githooks?\/|(^|\/)[^/]*(auth|vault|secret|security|credential|sandbox|bwrap|permission|polic(y|ies)|rls|sudoers)[^/]*$/i },
  { name: "approval", re: /approv/i },
  { name: "governance", re: /^scripts\/(governance|hooks)\/|^\.planning\/governance\/|^HOLDING-OS-MASTER-PLAN\/|^docs\/ceo-directives\/|^\.claude\/|^\.agents\/|^\.codex\/|^tools\/hooks\/|(^|\/)(CLAUDE|AGENTS)\.md$/ },
];
export const LIGHT = [
  /^\.planning\/(?!governance\/).*\.(md|txt)$/,                 // records and evidence prose
  /^(docs|references)\/.*\.(md|txt|png|jpe?g|webp|svg|gif)$/,   // reading material
  /^apps\/[^/]+\/src\/.*\.(tsx|jsx|css|scss)$/,                 // screen layout (CONTENT-checked)
  /^apps\/[^/]+\/public\/.*\.(png|jpe?g|webp|svg|gif|ico|woff2?)$/, // screen assets
  /^apps\/[^/]+\/(messages|locales|i18n)\/[^/]+\.json$/,       // screen copy
];
const SCREEN = /\.(tsx|jsx)$/;
export const CONTENT = [
  { name: "database", re: /\bfrom\s+["'](pg|kysely|postgres|@supabase\/supabase-js)["']|require\(\s*["']pg["']\s*\)|\bpsql\b|DATABASE_URL|postgres(ql)?:\/\/|\.(from|rpc)\(\s*["']|\b(INSERT\s+INTO|DELETE\s+FROM|UPDATE\s+[\w."]+\s+SET|CREATE\s+(OR\s+REPLACE\s+)?(TABLE|FUNCTION|ROLE|POLICY|TRIGGER|VIEW)|ALTER\s+(TABLE|ROLE|DEFAULT|FUNCTION)|DROP\s+(TABLE|ROLE|FUNCTION)|GRANT\s+\w|REVOKE\s+\w)\b|["']use server["']/i },
  { name: "security", re: /bypassPermissions|dangerously|sandbox_mode|\bsudo\b|\bchmod\b|credential|password|api[_-]?key|\bsecret\b|process\.env|fetch\(/i },
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

export function floorOf(files, lines = {}, binary = []) {
  const hits = [];
  for (const f of files) {
    const guards = FLOOR.filter((g) => g.re.test(f));
    for (const g of guards) hits.push({ file: f, guard: g.name });
    if (!guards.length && !LIGHT.some((re) => re.test(f))) hits.push({ file: f, guard: "unlisted" });
    else if (!guards.length && SCREEN.test(f) && binary.includes(f)) hits.push({ file: f, guard: "unreadable" });
  }
  for (const [f, text] of Object.entries(lines))
    for (const g of CONTENT) if (SCREEN.test(f) && g.re.test(text)) hits.push({ file: `${f} (changed lines)`, guard: g.name });
  return { hits, min: hits.length ? "normal" : null };
}

export function filesIn(range, repo = REPO) {
  if (!/^[\w./~^@{}-]+\.\.[\w./~^@{}-]+$/.test(range)) fail(`\`range: ${range}\` is not a git range A..B.`);
  const [a, b] = range.split("..");
  for (const end of [a, b]) {
    const r = spawnSync("git", ["-C", repo, "rev-parse", "--verify", "--quiet", `${end}^{commit}`], { encoding: "utf8" });
    if (r.status !== 0) fail(`\`${end}\` in the card's range is not a commit in this repository.`);
  }
  // -z: names unquoted, whatever they hold · -M with --name-status: BOTH sides of a rename are kept,
  // so a guarded file cannot leave its guard behind by moving.
  const d = spawnSync("git", ["-C", repo, "diff", "--name-status", "-z", "-M", range], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (d.status !== 0) fail(`git diff ${range} failed: ${d.stderr.trim()}`);
  const parts = d.stdout.split("\0").filter((x) => x !== "");
  const files = [];
  for (let i = 0; i < parts.length; ) {
    const st = parts[i++];
    const n = /^[RC]/.test(st) ? 2 : 1;
    for (let k = 0; k < n; k++) files.push(parts[i++]);
  }
  if (!files.length) fail(`the range ${range} changes no file — there is nothing to audit.`);
  return [...new Set(files)];
}

// The changed lines of the LIGHT screen files (the only light files that can hold code), and which
// files git treats as binary — an unreadable screen file cannot prove itself harmless.
export function changedLines(range, files, repo = REPO) {
  const screens = files.filter((f) => SCREEN.test(f) && LIGHT.some((re) => re.test(f)));
  if (!screens.length) return {};
  const out = {};
  for (const f of screens) {
    const d = spawnSync("git", ["--literal-pathspecs", "-C", repo, "-c", "core.quotePath=false", "diff", "-U0", "--no-color", "--text", "-M", range, "--", f],
      { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    if (d.status !== 0) fail(`git diff -U0 ${range} -- ${f} failed: ${d.stderr.trim()}`);
    const body = d.stdout.split("\n").filter((l) => /^[+-]/.test(l) && !/^(\+\+\+|---) /.test(l)).map((l) => l.slice(1)).join("\n");
    if (body) out[f] = body;
  }
  return out;
}

export function binaryIn(range, repo = REPO) {
  const d = spawnSync("git", ["-C", repo, "diff", "--numstat", "-z", "-M", range], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (d.status !== 0) fail(`git diff --numstat ${range} failed: ${d.stderr.trim()}`);
  const out = [];
  const parts = d.stdout.split("\0");
  for (let i = 0; i < parts.length; i++) {
    const m = /^(-|\d+)\t(-|\d+)\t(.*)$/.exec(parts[i]);
    if (!m) continue;
    const names = m[3] === "" ? [parts[++i], parts[++i]] : [m[3]];
    if (m[1] === "-" && m[2] === "-") out.push(...names);
  }
  return out;
}

export function route(card, files, effort, lines = {}, binary = []) {
  const total = AXES.reduce((s, a) => s + card[a], 0);
  const scored = classOf(total);
  const floor = floorOf(files, lines, binary);
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
    const files = filesIn(card.range);
    const r = route(card, files, effort, changedLines(card.range, files), binaryIn(card.range));
    console.log(JSON.stringify({ ...r, range: card.range, brief: briefBlock(text, r) }));
  } catch (e) {
    if (!e.refusal) throw e;
    console.error(`REFUTER_FAIL: ${e.message}`);
    process.exit(2);
  }
}
