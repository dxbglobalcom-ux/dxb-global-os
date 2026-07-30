#!/usr/bin/env node
// ledger-truth.mjs — the corpus tells the truth, or the battery goes red.
//
// WHY THIS EXISTS (CEO, 2026-07-28): "her gelen model bir şeyleri atlıyor
// mutlaka" — every arriving model misses something. Measured that night: two
// commitments were written in a document, never built, and tracked on no
// ledger at all; five records claimed a state the database contradicted (one
// said the holding had ONE employee while it had 199); and a roadmap row sat
// half-finished for ten days after its own audit trail proved it done.
// Nothing catches any of that today, so the board's Law 1 ("if work is open
// anywhere in the corpus, it has a row here") and Law 5 (ledger parity) are
// honour rules. This gate gives those two existing laws teeth. It invents no
// new law.
//
// THE RULE IT ENFORCES — every durable statement is one of two things:
//   STATE   what is true NOW      -> carries a marker, re-measured every run
//   EVENT   what happened ONCE    -> frozen forever, must carry its date
// The defect that started this was a STATE claim written in EVENT clothing.
//
// MARKERS (HTML comments — invisible when rendered, so the CEO's reading
// experience is unchanged):
//   <!-- STATE: <claim-id> = <value> @ <YYYY-MM-DD> -->
//   <!-- OPEN: <board-row-id> -->
//   <!-- HISTORY -->
// Placement: on its own line (covers until the next marker or the next
// heading), or appended inside a table row's last cell (covers that row only).
// Inline wins where it is present — markdown tables cannot carry comment lines
// between their rows.
//
// CHECKS
//   1. stale state    a STATE value no longer matches the live measurement
//   2. dangling open  an OPEN marker names a board row that is absent or closed
//   3. unmarked promise  a line declaring open work with no OPEN/HISTORY marker
//
// WHY A SCRIPT AND NOT A TEST: the suite runs against `dxb_test` (C47), a clone.
// A clone cannot prove what is true in the company. This reads the COMPANY
// database — with SELECT only, so C47's law (construction never writes into the
// company) still holds. Row counts are reported before and after so a write
// would be visible (U36 audit discipline).
//
// CLI
//   node scripts/governance/ledger-truth.mjs            check   (exit 0 = clean)
//   node scripts/governance/ledger-truth.mjs --update    rewrite drifted STATE
//                                                        values + dates in place
//   node scripts/governance/ledger-truth.mjs --list      print every marker found
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

// fileURLToPath, not URL.pathname: this repository's directory name contains a
// space, and pathname hands back "DxB%20Global%20OS".
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const BOARD = "HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md";
const CLAIMS = "scripts/governance/claims.json";
const RULES = "scripts/governance/rules.json";
const APPROVALS = "scripts/governance/ceo-approvals.json";

// ---- checks 4 and 5, added 2026-07-30 under the CEO's context-architecture order ----------
//
// CHECK 4 — ONE RULE, ONE OWNER. Measured that day: the same rule lived in dozens of files and
// the copies had drifted, so a rule the CEO had given could sit in a ledger for nine days binding
// nobody. Registered fingerprints (rules.json) must appear in their owner and nowhere else in the
// ACTIVE instruction surfaces. Naming a rule is always fine; restating its text is not.
//
// CHECK 5 — LAW B: FINISHED IS NOT APPROVED. His words: "iş tamamlanınca bitti anlamına gelmez —
// ben bakmam lazım ne yazılmış ve yapılmış." His own example: the board said the rival analysis
// was done and approved; he had never approved it. A claim of his approval now needs a registered
// entry (ceo-approvals.json) named by a <!-- CEO-OK: id --> marker.

// Active instruction only. Every exclusion is named with its reason rather than left implicit:
// the adaptation table and the dated notes are RECORDS of what was decided on a day — annotating
// them would be rewriting history — and the CEO's own documents are never edited by us.
const DUP_SCOPE_FILES = [".claude/CLAUDE.md"];
const DUP_SCOPE_DIRS = [
  { dir: ".claude/skills", ext: ".md", recurse: true },
  { dir: ".claude/hooks", ext: ".sh", recurse: false },
  { dir: "HOLDING-OS-MASTER-PLAN", ext: ".md", recurse: false },
];
const DUP_EXCLUDE = (rel) =>
  rel.endsWith("00-INDEX.md") || path.basename(rel).startsWith("00-NOTE-");

// A claim that the CEO approved something. Deliberately tight: "CEO onayı gerekir" states a RULE
// (approval is required) and must not ring; only an assertion that he HAS approved does.
const APPROVAL_CLAIM =
  /\bCEO[- ](APPROVED|approved|accepted)\b|CEO ONAYI VERİLDİ|CEO onayı (verildi|alındı)|CEO kabul etti|Accepted by the CEO|CEO acceptance \d{4}-\d{2}-\d{2}/;

// Naming the concept is not claiming the event. These forms describe a session that has NOT
// happened, a rule about how approval works, or a pipeline state called "CEO-approved" — none of
// them assert that he approved anything, and a tripwire that rings on them teaches people to
// ignore it. Each exclusion was measured against a real line on 2026-07-30, not imagined.
const APPROVAL_NOT_A_CLAIM =
  /acceptance session|approving his own work|→\s*CEO-approved|CEO-approved →|becomes `APPROVED`|only by explicit CEO acceptance|CEO-accepted states/;
const MARK_CEO_OK = /<!--\s*CEO-OK:\s*([a-z0-9\-]+)\s*-->/i;

// The corpus this gate governs. Deliberately NOT included, each for a stated
// reason: `.planning/quick/**` (execution tickets — one-shot by definition, not
// corpus), `.planning/phases/**` and `_ARCHIVE/**` (history the project keeps
// on purpose), `references/**` (the CEO's own documents — we do not annotate
// what he wrote). Scope narrowing is named here, never silent.
const SCOPE = [
  "HOLDING-OS-MASTER-PLAN",
  ".planning",
  ".planning/research",
  ".planning/research/study-cards",
  ".planning/research/rival-intel",
];

// Vocabulary that, in THIS corpus, declares unfinished work. Tuned to zero by
// the one-time sweep of 2026-07-28, which is where its value comes from: a
// tripwire that rings constantly teaches people to ignore it, so after the
// sweep any ring is real. It is a word list, not an oracle — a promise phrased
// in words nobody anticipated will pass. That limit is written down rather than
// papered over.
const TRIGGERS = [
  /\bREMAINING\b/,
  /EMBED when/i,
  /\bwaits? on\b/i,
  /\bnot yet built\b/i,
  /\bnever built\b/i,
  /\bstill open\b/i,
  /\bTODO\b/,
  /\bbekliyor\b/i,
  /\baçık kal/i,
  /kalan bacak/i,
  /◐/,
];

// The board is exempt from the tripwire — it IS the register of open work.
// Demanding that its own rows carry markers pointing at themselves would be
// tautological noise. The tripwire's job is to find open-work declared
// ANYWHERE ELSE, which is exactly the class that went untracked. The board is
// still fully subject to checks 1 and 2.
const TRIPWIRE_EXEMPT = new Set([BOARD]);

// Ledgers track work with an explicit status token, so in a ledger the TOKEN is
// the declaration and the surrounding prose is evidence. Running the full word
// list over them flags closed rows for words buried in their own closing
// evidence — noise that would train everyone to ignore the gate. Here the
// tripwire fires on the unfinished token alone: every ◐ row must name the board
// row that carries it. That is Law 1 stated exactly.
const LEDGERS = new Set([
  "HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md",
  "HOLDING-OS-MASTER-PLAN/00-INDEX.md",
  "HOLDING-OS-MASTER-PLAN/00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md",
]);
const LEDGER_TRIGGER = /◐/;

const MARK_STATE = /<!--\s*STATE:\s*([a-z0-9_]+)\s*=\s*(.+?)\s*@\s*(\d{4}-\d{2}-\d{2})\s*-->/i;
const MARK_OPEN = /<!--\s*OPEN:\s*([A-Za-z0-9.\-]+)\s*-->/;
const MARK_HISTORY = /<!--\s*HISTORY\s*-->/;
const ANY_MARKER = /<!--\s*(STATE:|OPEN:|HISTORY)/;

const argv = process.argv.slice(2);
const UPDATE = argv.includes("--update");
const LIST = argv.includes("--list");

// ---------------------------------------------------------------- db access
const PSQL = ["exec", "-i", "supabase_db_DxB_Global_OS", "psql", "-U", "postgres", "-d", "postgres", "-qtA", "-c"];

function measure(sql) {
  // SELECT-only by construction: anything that could write is refused here
  // rather than trusted to the query author.
  if (!/^\s*SELECT\b/i.test(sql) || /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE)\b/i.test(sql)) {
    throw new Error(`refused: claim query is not read-only -> ${sql}`);
  }
  return execFileSync("docker", [...PSQL, sql], { encoding: "utf8" }).trim();
}

// ------------------------------------------------------------- file walking
function corpusFiles() {
  const out = [];
  for (const dir of SCOPE) {
    const abs = path.join(REPO, dir);
    if (!existsSync(abs)) continue;
    for (const f of readdirSync(abs)) {
      if (f.endsWith(".md")) out.push(path.join(dir, f));
    }
  }
  return out.sort();
}

// A marker on its own line covers the lines that follow it until the next
// marker or the next markdown heading. A marker inside a line covers that line
// only, and wins over any block marker in force.
function coverageOf(lines) {
  const cover = new Array(lines.length).fill(null);
  let block = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isOwnLine = /^\s*<!--/.test(line.trim());
    const m = line.match(MARK_STATE) || line.match(MARK_OPEN) || (MARK_HISTORY.test(line) ? ["history"] : null);
    if (m && isOwnLine) {
      block = kindOf(line);
      cover[i] = block;
      continue;
    }
    if (/^#{1,6}\s/.test(line)) block = null;
    cover[i] = m ? kindOf(line) : block;
  }
  return cover;
}

// EVERY marker on the line, not just the first. A table row can legitimately
// carry several STATE claims in different cells; checking only the first would
// let a stale number ride along beside a fresh one — precisely the silent miss
// this tool exists to prevent. (Found and fixed while building it, 2026-07-28:
// the first version returned one marker per line and reported 5 claims where
// the corpus held 8.)
const ALL_MARKERS = /<!--\s*(?:STATE:\s*([a-z0-9_]+)\s*=\s*(.+?)\s*@\s*(\d{4}-\d{2}-\d{2})|OPEN:\s*([A-Za-z0-9.\-]+)|(HISTORY))\s*-->/gi;

function markersOn(line) {
  const out = [];
  for (const m of line.matchAll(ALL_MARKERS)) {
    if (m[5]) out.push({ kind: "history" });
    else if (m[4]) out.push({ kind: "open", row: m[4] });
    else out.push({ kind: "state", id: m[1], value: m[2], date: m[3] });
  }
  return out;
}

function kindOf(line) {
  return markersOn(line)[0] ?? null;
}

// ------------------------------------------------------------- board parsing
// The board already organises itself into open and closed sections. This makes
// that organisation MACHINE-DECLARED instead of inferred: each section carries
// one `<!-- BOARD-SECTION: open|closed -->` line. One marker per section beats
// a status column on fifty rows, and the parser never guesses — a row found
// outside any declared section is a hard failure, not a default.
const BOARD_SECTION = /<!--\s*BOARD-SECTION:\s*(open|closed)\s*-->/i;

function boardRows() {
  const text = readFileSync(path.join(REPO, BOARD), "utf8");
  const rows = new Map();
  let section = null;
  let lineNo = 0;
  for (const line of text.split("\n")) {
    lineNo++;
    const s = line.match(BOARD_SECTION);
    if (s) {
      section = s[1].toLowerCase();
      continue;
    }
    if (!/^\|/.test(line) || /^\|\s*-+/.test(line)) continue;
    const id = line.split("|").map((c) => c.trim())[1];
    if (!/^[BC]\d+(-bis)?$/.test(id || "")) continue;
    if (!section) {
      failures.push(`${BOARD}:${lineNo} — row "${id}" sits outside any declared BOARD-SECTION; the gate will not guess whether it is open`);
      continue;
    }
    rows.set(id, section);
  }
  return rows;
}

// ------------------------------------------------------------------- checks
const failures = [];
const found = { state: 0, open: 0, history: 0, triggers: 0, ceoOk: 0, rules: 0 };
const claims = JSON.parse(readFileSync(path.join(REPO, CLAIMS), "utf8"));
const rules = JSON.parse(readFileSync(path.join(REPO, RULES), "utf8"));
const approvals = JSON.parse(readFileSync(path.join(REPO, APPROVALS), "utf8"));
const board = boardRows();

// ------------------------------------------------- check 4: one rule, one owner
function dupScopeFiles() {
  const out = [...DUP_SCOPE_FILES];
  const walk = (dir, ext, recurse) => {
    const abs = path.join(REPO, dir);
    if (!existsSync(abs)) return;
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      const rel = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (recurse) walk(rel, ext, recurse);
      } else if (entry.name.endsWith(ext) && !DUP_EXCLUDE(rel)) {
        out.push(rel);
      }
    }
  };
  for (const s of DUP_SCOPE_DIRS) walk(s.dir, s.ext, s.recurse);
  return out;
}

for (const [id, rule] of Object.entries(rules)) {
  if (id.startsWith("_")) continue;
  found.rules++;
  const holders = [];
  for (const rel of dupScopeFiles()) {
    const text = readFileSync(path.join(REPO, rel), "utf8");
    if (text.includes(rule.fingerprint)) holders.push(rel);
  }
  if (!holders.includes(rule.owner)) {
    failures.push(
      `${RULES} — rule "${id}" claims ${rule.owner} owns it, but that file does not contain its text ("${rule.fingerprint}"). The rule has lost its home.`,
    );
  }
  for (const rel of holders) {
    if (rel === rule.owner) continue;
    failures.push(
      `${rel} — restates rule "${id}", which belongs to ${rule.owner}. Point at the owner instead of copying it: two homes become two different rules. [${rule.what}]`,
    );
  }
}
const measured = new Map();
const edits = new Map();

for (const rel of corpusFiles()) {
  const abs = path.join(REPO, rel);
  const raw = readFileSync(abs, "utf8");
  const lines = raw.split("\n");
  const cover = coverageOf(lines);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const here of markersOn(line)) {
      // --- check 1: stale state -------------------------------------------
      if (here.kind === "state") {
        found.state++;
        const claim = claims[here.id];
        if (!claim) {
          failures.push(`${rel}:${i + 1} — STATE claim "${here.id}" is not registered in ${CLAIMS}`);
          continue;
        }
        if (!measured.has(here.id)) measured.set(here.id, measure(claim.sql));
        const actual = measured.get(here.id);
        if (actual !== here.value) {
          if (UPDATE) {
            const today = measure("SELECT current_date");
            lines[i] = lines[i].replace(
              new RegExp(`<!--\\s*STATE:\\s*${here.id}\\s*=.*?-->`),
              `<!-- STATE: ${here.id} = ${actual} @ ${today} -->`,
            );
            edits.set(rel, lines);
          } else {
            failures.push(
              `${rel}:${i + 1} — STALE: "${here.id}" says ${here.value} (as of ${here.date}), the system says ${actual}  [${claim.what}]`,
            );
          }
        }
      }

      // --- check 2: dangling open -----------------------------------------
      if (here.kind === "open") {
        found.open++;
        const status = board.get(here.row);
        if (!status) failures.push(`${rel}:${i + 1} — OPEN marker names board row "${here.row}", which does not exist`);
        else if (status === "closed")
          failures.push(`${rel}:${i + 1} — OPEN marker names board row "${here.row}", which is CLOSED: this text claims work that is finished`);
      }

      if (here.kind === "history") found.history++;
    }

    // --- check 5: an unregistered claim of the CEO's approval ---------------
    // LAW B. The board is NOT exempt here: its own rows are exactly where a
    // "he approved it" can hide, and his example of the defect was on it.
    // A CEO-OK marker is validated wherever it appears, not only on a line the
    // claim vocabulary happened to match. Found 2026-07-31 while closing B21:
    // the row was marked correctly and the gate never looked, because its
    // sentence was phrased as a quotation of the CEO rather than as an
    // assertion about him. A mistyped or stale approval id would have passed.
    const ok = line.match(MARK_CEO_OK);
    if (ok) {
      found.ceoOk++;
      if (!approvals[ok[1]]) {
        failures.push(
          `${rel}:${i + 1} — CEO-OK marker names approval "${ok[1]}", which is not registered in ${APPROVALS}`,
        );
      }
    }

    if (APPROVAL_CLAIM.test(line) && !APPROVAL_NOT_A_CLAIM.test(line)) {
      if (!ok && !MARK_HISTORY.test(line) && !cover[i]) {
        failures.push(
          `${rel}:${i + 1} — claims the CEO approved something with no registered approval behind it. LAW B: only his own eye accepts. Register it in ${APPROVALS} with his words and mark the line, or stop claiming it — ${line.trim().slice(0, 100)}`,
        );
      }
    }

    // --- check 3: unmarked promise ----------------------------------------
    if (TRIPWIRE_EXEMPT.has(rel)) continue;
    // A line that is ONLY a marker carries no claim of its own. A line with an
    // inline marker DOES, and is still counted — otherwise the totals would
    // quietly shrink as the sweep progressed and look like the work vanished.
    if (/^\s*<!--[^>]*-->\s*$/.test(line)) continue;
    const isLedger = LEDGERS.has(rel);
    const hit = isLedger ? LEDGER_TRIGGER.test(line) : TRIGGERS.some((t) => t.test(line));
    if (!hit) continue;
    found.triggers++;
    if (!cover[i]) {
      failures.push(
        isLedger
          ? `${rel}:${i + 1} — a ◐ row with no OPEN marker: work is unfinished here and no board row carries it — ${line.trim().slice(0, 90)}`
          : `${rel}:${i + 1} — declares open work with no OPEN/HISTORY marker: ${line.trim().slice(0, 110)}`,
      );
    }
  }
}

// -------------------------------------------------------------------- output
if (LIST) {
  console.log(
    `markers: STATE ${found.state} · OPEN ${found.open} · HISTORY ${found.history} · CEO-OK ${found.ceoOk}`,
  );
  console.log(`rules with a registered single owner: ${found.rules}`);
  console.log(`open-work trigger lines seen: ${found.triggers}`);
  console.log(`board rows parsed: ${board.size} (${[...board.values()].filter((v) => v === "open").length} open)`);
}

if (UPDATE) {
  for (const [rel, lines] of edits) writeFileSync(path.join(REPO, rel), lines.join("\n"));
  console.log(`updated ${edits.size} file(s) to the measured values — review the diff before committing`);
  process.exit(0);
}

if (failures.length) {
  for (const f of failures) console.error("FAIL — " + f);
  console.error(`\n${failures.length} failure(s). The corpus and the system disagree.`);
  process.exit(1);
}

console.log(
  `ledger truth OK: ${found.state} state claims re-measured, ${found.open} open markers resolved against ${board.size} board rows, ` +
    `${found.triggers} trigger lines all accounted for, ${found.rules} rules each in exactly one owner, ` +
    `${found.ceoOk} CEO approval claims each backed by a registered approval`,
);
