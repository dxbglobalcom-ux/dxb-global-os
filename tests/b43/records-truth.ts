// B43 — THE RECORDS RULER OF 2026-09-19: does any record still say his eye has NOT come where the
// ledger says it HAS?
//
// Why this file exists. On 2026-09-19 the CEO opened a session and was told "W5 and the W9 plan
// wait for his word". He had accepted both on 2026-09-15 15:5x. The sentence had been false for
// four days and 57 commits touched the file without removing it; two sessions on 2026-09-16 had
// swept the same class by hand and missed it. The ruler he ordered the same day ("plan hazırla
// cetvelle birlikte inşaatçıya ver") is this file. It is dictated by the checker session
// (dxb-global-os-25, Fable 5.1) and committed by the builder (dxb-global-os-bd, Opus 5), under
// the audit law of 2026-09-15.
//
// The fourth rule, R4, is why the ruler cannot be forgotten: an acceptance of his eye registered
// in the ledger from 2026-09-15 on with no row here turns the ruler red until its row is added.
//
// What it is NOT. It is not the inverse acceptance gate he closed on 2026-09-16
// (inverse-gate-closed-both-said-no-2026-09-16): that gate scanned prose for a pattern and rang on
// correct trees. This ruler scans for NAMED subjects only — each row of ACCEPTED is one ledger
// entry of his eye, spelled the way the records spell it — and it rings only when a sentence
// names such a subject AND says his eye or his word has not come. A new acceptance adds one row
// here by hand; the ruler cannot guess subjects, and does not try. It touches ledger-truth.mjs
// in no way; rule R1 merely runs it.
//
// Usage:
//   node --no-warnings tests/b43/records-truth.ts              — the table, exit 1 on any failure
//   node --no-warnings tests/b43/records-truth.ts --verdicts   — plus one RULER-VERDICT line per rule
//   npx vitest run tests/b43/records-truth.test.ts             — the ruler bites, and the tree passes
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** THE CONSTANTS — every subject, pattern and path of this ruler lives here. */
export const C = {
  /** the two records the CEO's position is read from */
  records: [".planning/STATE.md", "HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md"],
  ledger: "scripts/governance/ceo-approvals.json",
  ledgerGate: "scripts/governance/ledger-truth.mjs",
  /**
   * WHAT HIS EYE HAS COVERED — one row per ledger entry, the subject spelled as the records spell
   * it. A sentence naming one of these subjects may no longer say his eye or his word is awaited.
   */
  accepted: [
    { id: "w1-records-accepted-2026-09-15", subject: /\bW1\b(?![…/])/ },
    { id: "studio-seats-w5-to-w6c-accepted-2026-09-15", subject: /\bW5b?\b|\bW6[bc]?\b/ },
    { id: "studio-b08-step0-w9-w7-w8-accepted-2026-09-15", subject: /\bW[79]\b|\bW8\b(?! guard)|B08 step \(0\)/ },
    { id: "studio-b43-road-accepted-by-his-eye-2026-09-16", subject: /\bW1[0-3]\b|his eye on the clock/ },
    { id: "w14-and-w15-accepted-by-his-eye-2026-09-16", subject: /\bW1[45]\b/ },
    { id: "b44-and-b45-accepted-by-his-eye-2026-09-16", subject: /\bB4[45]\b/ },
    { id: "sept14-block-accepted-and-the-gate-asks-both-first-2026-09-16", subject: /2026-09-14 block/ },
    { id: "b47-accepted-by-his-eye-2026-09-19", subject: /\bB47\b/ },
    { id: "b39-closed-by-his-eye-2026-09-19", subject: /\bB39\b/ },
    { id: "b46-closed-by-his-word-2026-09-21", subject: /\bB46\b/ },
    { id: "b48-accepted-by-his-eye-2026-09-21", subject: /\bB48\b/ },
    { id: "b49-accepted-by-his-eye-2026-09-21", subject: /\bB49\b/ },
    // HIS CLICK ON THE DELETE LIST — and the subject is spelled as narrowly as the thing he
    // actually approved: the folder-by-folder list with sizes that had to stand in front of him
    // before anything was removed (his gate of 2026-09-05, "ne 15 gb yaaa"). It is deliberately
    // NOT /\bB50\b/. B50 is an OPEN row whose record must still be able to say his eye has not
    // closed it (LAW B); a row spelled B50 would make R2 forbid exactly the sentence LAW B
    // requires, and the ruler would enforce one of his laws by breaking another.
    {
      id: "b50-sweep-click-2026-09-21",
      subject: /\b(folder-by-folder )?list with sizes\b|\bhis click of 19:12\b|\bthe sweep he clicked\b/i,
    },
    { id: "b50-accepted-by-his-eye-2026-09-21", subject: /\bB50\b/ },
    { id: "b52-accepted-by-his-eye-2026-09-22", subject: /\bB52\b/ },
    { id: "b54-accepted-by-his-eye-2026-09-24", subject: /\bB54\b/ },
  ],
  /**
   * R4 — the ruler cannot be forgotten: every acceptance of his eye registered in the ledger from
   * the day the ruler law was made (2026-09-15) must have a row above, or the ruler is red with
   * the row it wants. An acceptance is recognised by its id ("-accepted") or its opening words.
   */
  acceptanceSince: "2026-09-15",
  acceptanceId: /-accepted(-|$)/,
  acceptanceOpening: /^(HIS EYE|ACCEPTED BY HIS|.{0,40}ACCEPTED BY (THE CEO'S OWN|HIS) EYE)/,
  /** the awaiting form — the sentence says his eye or his word has not come */
  awaiting:
    /\bwait(s|ing)? (only )?(on|for) (him|his (word|eye))\b|\bhis eye on\b|\bnot yet (looked at|accepted|confirmed)\b|\bhis word did not cover\b|\bNOT ACCEPTED BY HIS EYE\b|\bstill waits on\b/i,
  /** a sentence that itself says the eye came, or names its own correction, is not a claim of waiting */
  cleared: /(?<!\bnot )(?<!\bNOT )\baccepted by his eye\b|\bwas given\b|\bwere accepted\b|\bcorrected 2026-09-19\b|\bnothing( anywhere)? waits on him\b/i,
  /** a sentence boundary in these records: a full stop, a semicolon, or the middle dot they use as a list separator */
  sentenceBreak: /(?<=[.;])\s+|\s·\s/,
};

export type Verdict = { rule: string; pass: boolean; failures: string[] };
export type RulerReport = { verdicts: Verdict[]; pass: boolean };

const here = fileURLToPath(new URL(".", import.meta.url));
/** repository root: two levels above tests/b43 — or the root handed in */
export const repoRoot = (root?: string) => root ?? join(here, "..", "..");

export function readLedger(root: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(root, C.ledger), "utf8")) as Record<string, unknown>;
}

/** R1 — the records' own gate, ledger-truth.mjs, exits 0 (run, not re-implemented). */
export function r1LedgerGate(root: string): Verdict {
  try {
    execFileSync("node", [join(root, C.ledgerGate)], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    return { rule: "R1 ledger-truth exits 0", pass: true, failures: [] };
  } catch (e) {
    const err = e as { stdout?: Buffer; stderr?: Buffer; status?: number };
    const tail = `${err.stdout ?? ""}${err.stderr ?? ""}`.trim().split("\n").slice(-6).join("\n");
    return { rule: "R1 ledger-truth exits 0", pass: false, failures: [`exit ${err.status}: ${tail}`] };
  }
}

/** R2 — no sentence in the records names an accepted subject and still says his eye or word is awaited. */
export function r2NoAwaitingOnAccepted(root: string, texts?: Record<string, string>): Verdict {
  const failures: string[] = [];
  for (const rel of C.records) {
    const text = texts?.[rel] ?? readFileSync(join(root, rel), "utf8");
    text.split("\n").forEach((line, i) => {
      for (const sentence of line.split(C.sentenceBreak)) {
        if (!C.awaiting.test(sentence) || C.cleared.test(sentence)) continue;
        for (const row of C.accepted) {
          if (row.subject.test(sentence)) {
            failures.push(`${rel}:${i + 1} — says his eye/word is awaited on a subject the ledger holds as accepted (${row.id}): "${sentence.trim().slice(0, 140)}"`);
          }
        }
      }
    });
  }
  return { rule: "R2 no awaiting sentence on an accepted subject", pass: failures.length === 0, failures };
}

/** R3 — every ledger id this ruler names exists in the ledger (the ruler's own table cannot lie). */
export function r3TableIsRegistered(root: string): Verdict {
  const ledger = readLedger(root);
  const failures = C.accepted.filter((r) => !ledger[r.id]).map((r) => `${r.id} is not in ${C.ledger}`);
  return { rule: "R3 every subject row names a registered approval", pass: failures.length === 0, failures };
}

/** R4 — every acceptance of his eye in the ledger since the ruler law has its row here. */
export function r4NoAcceptanceWithoutARow(root: string, ledgerOverride?: Record<string, unknown>): Verdict {
  const ledger = (ledgerOverride ?? readLedger(root)) as Record<string, { date?: string; what?: string }>;
  const named = new Set(C.accepted.map((r) => r.id));
  const failures = Object.keys(ledger)
    .filter((id) => !id.startsWith("_"))
    .filter((id) => (ledger[id].date ?? "") >= C.acceptanceSince)
    .filter((id) => C.acceptanceId.test(id) || C.acceptanceOpening.test(ledger[id].what ?? ""))
    .filter((id) => !named.has(id))
    .map((id) => `${id} (${ledger[id].date}) is an acceptance of his eye with no row in C.accepted — add its row, spelled as the records spell its subject`);
  return { rule: "R4 every acceptance since the ruler law has its row", pass: failures.length === 0, failures };
}

export function runRuler(opts: { root?: string; texts?: Record<string, string> } = {}): RulerReport {
  const root = repoRoot(opts.root);
  const verdicts = [r1LedgerGate(root), r2NoAwaitingOnAccepted(root, opts.texts), r3TableIsRegistered(root), r4NoAcceptanceWithoutARow(root)];
  return { verdicts, pass: verdicts.every((v) => v.pass) };
}

function main() {
  const wantVerdicts = process.argv.includes("--verdicts");
  const report = runRuler();
  console.log("RECORDS RULER 2026-09-19 — " + C.records.join(" · "));
  for (const v of report.verdicts) {
    console.log(`  ${v.pass ? "PASS" : "FAIL"}  ${v.rule}`);
    for (const f of v.failures) console.log(`        ${f}`);
    if (wantVerdicts) console.log(`RULER-VERDICT ${v.rule} ${v.pass ? "PASS" : "FAIL"} ${v.failures.length}`);
  }
  const failed = report.verdicts.filter((v) => !v.pass).length;
  console.log(`${report.verdicts.length - failed}/${report.verdicts.length} PASS, ${report.verdicts.reduce((n, v) => n + v.failures.length, 0)} failures`);
  process.exit(report.pass ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
