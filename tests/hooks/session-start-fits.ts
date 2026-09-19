// THE SESSION-START RULER — does the position block the CEO ordered actually ARRIVE?
//
// Core §0: a session's first reply tells him where the work stands, read from this hook, never
// from a file. Measured 2026-09-19 on two sessions: the hook produced 51,738 bytes, the harness
// refused it ("Output too large … Preview (first 2KB)"), and the session opened STATE.md by hand.
// This ruler is dictated by the checker session (Fable 5.1) and committed by the builder (Opus 5)
// under the audit law of 2026-09-15; it is RED on the hook as it stood that day and must stay
// green on every hook after it.
//
//   node --no-warnings tests/hooks/session-start-fits.ts        — the table, exit 1 on any failure
//   npx vitest run tests/hooks/session-start-fits.test.ts       — the same rules under vitest
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** THE CONSTANTS — the budget and the shape, in one place. */
export const C = {
  hook: ".claude/hooks/spec-bootstrap.sh",
  state: ".planning/STATE.md",
  /** the whole block must be delivered by the harness as one piece: measured refused at 51,738 */
  maxBytes: 8000,
  headings: ["--- HIS LAST ORDER ---", "--- WHAT HAPPENS NEXT ---", "--- WHAT WAITS ON HIM ---", "=== END ==="],
  /** a cut section ends on a sentence, never mid-word: the character before a "(+N more lines" note */
  sentenceEnd: /[.·)*`"”]\s*$/,
  moreLines: /^\(\+\d+ more lines/,
  /** how much of the newest live-order block must appear verbatim (his order, not a summary of it) */
  verbatimHead: 200,
};

export type Verdict = { rule: string; pass: boolean; failures: string[] };
export type RulerReport = { verdicts: Verdict[]; pass: boolean; bytes: number };

const here = fileURLToPath(new URL(".", import.meta.url));
export const repoRoot = (root?: string) => root ?? join(here, "..", "..");

export function runHook(root: string, hookPath?: string): string {
  return execFileSync("bash", [hookPath ?? join(root, C.hook)], {
    cwd: root,
    env: { ...process.env, CLAUDE_PROJECT_DIR: root },
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

/** the newest dated block of "## The CEO's live order": its first non-empty line */
export function newestOrder(root: string): string {
  const lines = readFileSync(join(root, C.state), "utf8").split("\n");
  const start = lines.findIndex((l) => /^## The CEO.s live order/.test(l));
  for (let i = start + 1; i < lines.length && !lines[i].startsWith("## "); i++) {
    if (lines[i].trim()) return lines[i];
  }
  return "";
}

export function measure(out: string, root: string): RulerReport {
  const bytes = Buffer.byteLength(out, "utf8");
  const v: Verdict[] = [];
  v.push({ rule: `R1 the block is ≤ ${C.maxBytes} bytes (the harness delivers it whole)`, pass: bytes <= C.maxBytes, failures: bytes <= C.maxBytes ? [] : [`${bytes} bytes`] });
  const missing = C.headings.filter((h) => !out.includes(h));
  v.push({ rule: "R2 the three headings and the END line are present", pass: missing.length === 0, failures: missing.map((h) => `missing ${h}`) });
  const lines = out.split("\n");
  const midWord: string[] = [];
  lines.forEach((l, i) => {
    if (C.moreLines.test(l)) {
      const prev = lines[i - 1] ?? "";
      if (!C.sentenceEnd.test(prev)) midWord.push(`line ${i}: cut ends "${prev.slice(-40)}"`);
    }
  });
  v.push({ rule: "R3 every cut ends on a sentence, never mid-word", pass: midWord.length === 0, failures: midWord });
  const head = newestOrder(root).slice(0, C.verbatimHead);
  const ok = head.length > 0 && out.includes(head);
  v.push({ rule: `R4 his newest order appears verbatim (first ${C.verbatimHead} chars)`, pass: ok, failures: ok ? [] : [`not found: "${head.slice(0, 60)}…"`] });
  return { verdicts: v, pass: v.every((x) => x.pass), bytes };
}

export function runRuler(opts: { root?: string; hookPath?: string } = {}): RulerReport {
  const root = repoRoot(opts.root);
  return measure(runHook(root, opts.hookPath), root);
}

function main() {
  const r = runRuler();
  console.log(`SESSION-START RULER — ${C.hook} → ${r.bytes} bytes`);
  for (const v of r.verdicts) {
    console.log(`  ${v.pass ? "PASS" : "FAIL"}  ${v.rule}`);
    for (const f of v.failures) console.log(`        ${f}`);
  }
  const failed = r.verdicts.filter((v) => !v.pass).length;
  console.log(`${r.verdicts.length - failed}/${r.verdicts.length} PASS, ${r.verdicts.reduce((n, v) => n + v.failures.length, 0)} failures`);
  process.exit(r.pass ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
