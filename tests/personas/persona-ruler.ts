// THE PERSONA RULER — one metre for the builder and the checker.
//
// Why this file exists, measured on 2026-09-15: W5/W6/W6b were written by one session and
// re-measured by another, and the two sessions counted different things. The builder counted one
// "sentence" per LINE and reported 118 → 0 sentences over 80 words; the checker counted from full
// stop to full stop and found 116 still over 80 words (the longest 260, design-image-prompt-engineer).
// Neither lied: W6b had inserted line breaks at "; ", " → " and " — " instead of writing shorter
// sentences (52 910 → 52 975 words, nothing removed, nothing shortened). The CEO's ruling on the
// method: the checker's ruler is a RUNNABLE SCRIPT, handed to the builder before the work, and both
// sides run the same script. This file is that script. The vitest test and scripts/persona-ruler.sh
// are two doors into this one implementation — there is no second ruler.
//
// Scope, on purpose: the ruler measures the files named in persona-ruler.concepts.json and NOTHING
// else. A persona outside that contract is reported NOT-MEASURED and is submitted exactly as before;
// the ruler was written for the sixteen studio seats and it does not stop another department's work
// before that department's own writing pass has been ordered (no bureaucracy ahead of need).
//
// Run it:
//   bash scripts/persona-ruler.sh                 — the whole contract
//   bash scripts/persona-ruler.sh personas/a.md   — the named files
//   npx vitest run tests/personas/persona-ruler.test.ts

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";

/** THE CONSTANTS — every threshold of the ruler lives here and nowhere else. */
export const RULER = {
  /** rule 1 — a sentence is at most this many words */
  MAX_SENTENCE_WORDS: 80,
  /** rule 3 — the deepest "(" … ")" nesting allowed on one line */
  MAX_PAREN_DEPTH: 1,
  /** rule 5 — a repeated window of this many words is a duplicated clause */
  DUPLICATE_WINDOW_WORDS: 12,
  /** the delivered body starts here (the line itself is part of the body) */
  BODY_START: /^# PERSONA — /,
  /** the delivered body ends at the line BEFORE this one; §12 is measured only for identity */
  BODY_END: /^## 12\. /,
  /**
   * A SENTENCE ENDS at "." "!" "?" followed by whitespace or the end of the line — and at nothing
   * else. ";" ":" "→" "—" "·" and a line break are NOT terminators. This single definition is the
   * whole reason W6b's line breaks did not count as shorter sentences.
   */
  TERMINATORS: [".", "!", "?"] as const,
  /** rule 2 — a body line that is a whole thought ends with one of these */
  LINE_END: /[.:)?!»]$/,
  /**
   * An ENUMERATED STEP LINE: a line that opens with "(n)", or a line that carries a CHAIN of
   * arrows (two or more " → "). Such a line is measured per step — split at "(n)" and " → " — and
   * each step must obey the word limit on its own. A single arrow inside ordinary prose is prose.
   */
  ENUM_OPEN: /^\s*\(\d+\)/,
  ENUM_CHAIN_MIN_ARROWS: 2,
  ARROW: " → ",
  /** rule 6 — a word of the recorded-voice family is allowed only inside a prohibition */
  VOICE_RESIDUE: /voice-over|voice over|narration|scratch|AI voice|TTS/i,
  VOICE_PROHIBITION: /no |never |not |NO |cancelled|removed|refus/,
  /** rule 7 — the two written roads may never be named without the engine-born road */
  ROAD_PHOTO: /real photograph/i,
  ROAD_SHEET: /written sheet/i,
  ROAD_ENGINE_BORN: /engine-born|casting take|AHMET/i,
  /** rule 8 — model names live in the database, never in a delivered body */
  MODEL_NAME: /GPT-6 Astra|GPT Astra|Astra's|Solo 5\.6|Fable 5\.1|Opus 5/,
  /** rule 11 — the shared law paragraph, from its first words to its last */
  LAW_START: "Everything of a piece — script, storyboard, panels, stills, first frames, the cut — is made here",
  LAW_END: "open from the start on either route.",
  /** rule 13 — the dossier rows the ruler reads (the only dossier fact it measures) */
  DOSSIER_VERSIONS: /^\| 31 \| Version history \|(.*)\|\s*$/m,
  DOSSIER_UPDATED: /^\| 33 \| Last updated \|(.*)\|\s*$/m,
  DATE: /\d{4}-\d{2}-\d{2}/g,
} as const;

export const RULES = [
  "sentence-length",
  "line-terminator",
  "paren-depth",
  "paren-balance",
  "no-duplicate-clause",
  "voice-residue",
  "three-roads",
  "no-model-name",
  "section-12-identity",
  "delivery-header",
  "canonical-law-paragraph",
  "concept-contract",
  "dossier-date",
] as const;
export type RuleName = (typeof RULES)[number];

export interface Failure {
  line: number;
  detail: string;
}
export interface FileReport {
  path: string;
  slug: string;
  measured: boolean;
  failures: Record<RuleName, Failure[]>;
  section12Hash: string;
  lawHash: string | null;
  pass: boolean;
}
export interface RulerReport {
  files: FileReport[];
  canonicalSection12: string | null;
  canonicalLaw: string | null;
  pass: boolean;
}

export interface Concept {
  id: string;
  why: string;
  pattern: string;
  seats: string[];
}
export interface Contract {
  departments: Record<string, { seats: Record<string, string>; concepts: Concept[] }>;
}

const HERE = import.meta.dirname;
export const REPO_ROOT = resolve(HERE, "..", "..");
export const CONTRACT_FILE = join(HERE, "persona-ruler.concepts.json");

export function loadContract(file = CONTRACT_FILE): Contract {
  return JSON.parse(readFileSync(file, "utf8")) as Contract;
}

/** every file the contract measures, repo-relative, in contract order */
export function contractFiles(contract: Contract): string[] {
  const out: string[] = [];
  for (const dept of Object.values(contract.departments)) {
    for (const path of Object.values(dept.seats)) out.push(path);
  }
  return out;
}

function conceptsFor(contract: Contract, slug: string): Concept[] {
  const out: Concept[] = [];
  for (const dept of Object.values(contract.departments)) {
    if (!(slug in dept.seats)) continue;
    for (const c of dept.concepts) if (c.seats.includes(slug)) out.push(c);
  }
  return out;
}

// ── the body, line by line ───────────────────────────────────────────────────

export type LineKind = "blank" | "heading" | "comment" | "list" | "enum" | "prose";
export interface Line {
  n: number;
  text: string;
  kind: LineKind;
}

export function classify(raw: string[], from: number, to: number): Line[] {
  const out: Line[] = [];
  let inComment = false;
  for (let i = from; i < to; i++) {
    const text = raw[i]!.replace(/\s+$/, "");
    let kind: LineKind;
    const opensComment = text.includes("<!--");
    if (inComment || opensComment) {
      kind = "comment";
      inComment = (inComment || opensComment) && !text.includes("-->");
    } else if (text.trim() === "") kind = "blank";
    else if (/^#{1,6}\s/.test(text)) kind = "heading";
    else if (RULER.ENUM_OPEN.test(text) || countArrows(text) >= RULER.ENUM_CHAIN_MIN_ARROWS) kind = "enum";
    else if (/^\s*([-*+]|\d+[.)])\s/.test(text)) kind = "list";
    else kind = "prose";
    out.push({ n: i + 1, text, kind });
  }
  return out;
}

function countArrows(text: string): number {
  return text.split(RULER.ARROW).length - 1;
}

export function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export interface Sentence {
  text: string;
  line: number;
  fromEnum: boolean;
}

/**
 * The sentences of a body. Prose lines that stand next to each other are JOINED first — a sentence
 * W6b broke across four lines is one sentence again — and the joined text is then cut at the
 * terminators above. Enumerated step lines are measured as their own steps.
 */
export function sentencesOf(lines: Line[]): Sentence[] {
  const out: Sentence[] = [];
  let block: Line[] = [];
  const flush = () => {
    if (block.length === 0) return;
    const pieces: { text: string; line: number }[] = [];
    let joined = "";
    for (const l of block) {
      pieces.push({ text: l.text.trim(), line: l.n });
      joined += (joined ? " " : "") + l.text.trim();
    }
    const lineAt = (offset: number): number => {
      let pos = 0;
      for (const p of pieces) {
        if (offset <= pos + p.text.length) return p.line;
        pos += p.text.length + 1;
      }
      return pieces[pieces.length - 1]!.line;
    };
    for (const s of cut(joined)) out.push({ text: s.text, line: lineAt(s.offset), fromEnum: false });
    block = [];
  };
  for (const l of lines) {
    if (l.kind === "prose" || l.kind === "list") {
      block.push(l);
      continue;
    }
    flush();
    if (l.kind === "enum") {
      for (const step of l.text.split(/\(\d+\)|\s→\s/)) {
        const t = step.trim();
        if (t) out.push({ text: t, line: l.n, fromEnum: true });
      }
    }
  }
  flush();
  return out;
}

function cut(text: string): { text: string; offset: number }[] {
  const out: { text: string; offset: number }[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (!(RULER.TERMINATORS as readonly string[]).includes(c)) continue;
    const next = text[i + 1];
    if (next !== undefined && !/\s/.test(next)) continue;
    const raw = text.slice(start, i + 1);
    const piece = raw.trim();
    // the offset must point at the first WORD of the sentence: the space that follows the previous
    // full stop still belongs to the previous line, and reporting it names the wrong line to edit.
    if (piece) out.push({ text: piece, offset: start + (raw.length - raw.trimStart().length) });
    start = i + 1;
  }
  const rawTail = text.slice(start);
  const tail = rawTail.trim();
  if (tail) out.push({ text: tail, offset: start + (rawTail.length - rawTail.trimStart().length) });
  return out;
}

export function md5(s: string): string {
  return createHash("md5").update(s).digest("hex");
}

/** the law paragraph exactly as this file carries it, or null when it carries none */
export function lawParagraph(body: string): string | null {
  const a = body.indexOf(RULER.LAW_START);
  if (a < 0) return null;
  const b = body.indexOf(RULER.LAW_END, a);
  if (b < 0) return "UNTERMINATED";
  return body.slice(a, b + RULER.LAW_END.length);
}

// ── the measurement ──────────────────────────────────────────────────────────

function emptyFailures(): Record<RuleName, Failure[]> {
  const f = {} as Record<RuleName, Failure[]>;
  for (const r of RULES) f[r] = [];
  return f;
}

export function measureFile(repoRoot: string, path: string, contract: Contract): FileReport {
  const slug = path.replace(/^.*\//, "").replace(/\.md$/, "");
  const src = readFileSync(join(repoRoot, path), "utf8");
  const raw = src.split("\n");
  const failures = emptyFailures();

  const headers = raw.map((l, i) => (RULER.BODY_START.test(l) ? i : -1)).filter((i) => i >= 0);
  if (headers.length !== 1) {
    failures["delivery-header"].push({
      line: headers[0] !== undefined ? headers[0] + 1 : 0,
      detail: `${headers.length} "# PERSONA — " lines (exactly 1 required)`,
    });
  }
  const start = headers[0] ?? 0;
  const endIdx = raw.findIndex((l, i) => i > start && RULER.BODY_END.test(l));
  const end = endIdx < 0 ? raw.length : endIdx;
  if (endIdx < 0) {
    failures["section-12-identity"].push({ line: raw.length, detail: "no '## 12. ' section in this file" });
  }

  const lines = classify(raw, start, end);
  const body = lines.map((l) => l.text).join("\n");
  const sentences = sentencesOf(lines);

  // 1 sentence-length
  for (const s of sentences) {
    const w = words(s.text);
    if (w > RULER.MAX_SENTENCE_WORDS) {
      failures["sentence-length"].push({
        line: s.line,
        detail: `${w} words${s.fromEnum ? " (enumerated step)" : ""}: ${clip(s.text)}`,
      });
    }
  }

  // 2 line-terminator
  for (const l of lines) {
    // headings, comments, list items and enumerated steps are exempt by the rule's own definition
    if (l.kind !== "prose") continue;
    if (!RULER.LINE_END.test(l.text.trim())) {
      failures["line-terminator"].push({ line: l.n, detail: `ends "${l.text.trim().slice(-28)}"` });
    }
  }

  // 3/4 parentheses
  for (const l of lines) {
    if (l.kind === "comment" || l.kind === "blank") continue;
    let depth = 0;
    let max = 0;
    let broken = false;
    for (const c of l.text) {
      if (c === "(") depth++;
      else if (c === ")") depth--;
      if (depth < 0) broken = true;
      if (depth > max) max = depth;
    }
    if (max > RULER.MAX_PAREN_DEPTH) {
      failures["paren-depth"].push({ line: l.n, detail: `depth ${max}: ${clip(l.text)}` });
    }
    if (depth !== 0 || broken) {
      failures["paren-balance"].push({ line: l.n, detail: `unbalanced (${depth > 0 ? "+" : ""}${depth}): ${clip(l.text)}` });
    }
  }

  // 5 no-duplicate-clause — the shared law paragraph is excluded by contract
  const law = lawParagraph(body);
  let forDuplicates = body;
  // The law paragraph is excluded from the duplicate search by BLANKING it, never by cutting it
  // out: removing its newlines would shift every line number reported after it.
  if (law && law !== "UNTERMINATED") forDuplicates = forDuplicates.split(law).join(law.replace(/[^\n]/g, " "));
  const tokens: { w: string; line: number }[] = [];
  {
    let lineNo = start + 1;
    for (const chunk of forDuplicates.split("\n")) {
      for (const w of chunk.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/)) {
        if (w) tokens.push({ w, line: lineNo });
      }
      lineNo++;
    }
  }
  // One repeated passage is ONE failure, not one per sliding window: after a duplicate is
  // reported, the windows that merely slide along the same passage are recorded and kept quiet.
  const seen = new Map<string, number>();
  let quietUntil = -1;
  for (let i = 0; i + RULER.DUPLICATE_WINDOW_WORDS <= tokens.length; i++) {
    const window = tokens.slice(i, i + RULER.DUPLICATE_WINDOW_WORDS).map((t) => t.w).join(" ");
    const first = seen.get(window);
    if (first === undefined) {
      seen.set(window, tokens[i]!.line);
      continue;
    }
    if (i < quietUntil) continue;
    quietUntil = i + RULER.DUPLICATE_WINDOW_WORDS;
    failures["no-duplicate-clause"].push({ line: tokens[i]!.line, detail: `also at line ${first}: "${window}"` });
  }

  // 6 voice-residue · 7 three-roads
  for (const s of sentences) {
    if (RULER.VOICE_RESIDUE.test(s.text) && !RULER.VOICE_PROHIBITION.test(s.text)) {
      failures["voice-residue"].push({ line: s.line, detail: clip(s.text) });
    }
    if (RULER.ROAD_PHOTO.test(s.text) && RULER.ROAD_SHEET.test(s.text) && !RULER.ROAD_ENGINE_BORN.test(s.text)) {
      failures["three-roads"].push({ line: s.line, detail: clip(s.text) });
    }
  }

  // 8 no-model-name
  for (const l of lines) {
    const m = l.text.match(RULER.MODEL_NAME);
    if (m) failures["no-model-name"].push({ line: l.n, detail: `"${m[0]}" in the delivered body` });
  }

  // 12 concept-contract
  for (const c of conceptsFor(contract, slug)) {
    if (!new RegExp(c.pattern, "i").test(body)) {
      failures["concept-contract"].push({ line: start + 1, detail: `concept "${c.id}" is gone (${c.why})` });
    }
  }

  // 13 dossier-date
  const v = src.match(RULER.DOSSIER_VERSIONS);
  const u = src.match(RULER.DOSSIER_UPDATED);
  if (v && u) {
    const versionDates = (v[1]!.match(RULER.DATE) ?? []).sort();
    const updated = (u[1]!.match(RULER.DATE) ?? [])[0] ?? "";
    const latest = versionDates[versionDates.length - 1] ?? "";
    if (latest && updated < latest) {
      failures["dossier-date"].push({ line: 0, detail: `field 33 ${updated} < latest date in field 31 ${latest}` });
    }
  } else {
    failures["dossier-date"].push({ line: 0, detail: "dossier field 31 or 33 not found" });
  }

  const section12 = endIdx < 0 ? "" : md5(raw.slice(end).join("\n"));
  return {
    path,
    slug,
    measured: true,
    failures,
    section12Hash: section12,
    lawHash: law === null ? null : md5(law),
    pass: false,
  };
}

function clip(s: string): string {
  const one = s.replace(/\s+/g, " ").trim();
  return one.length <= 110 ? one : `${one.slice(0, 107)}…`;
}

function majority(values: string[]): string | null {
  const count = new Map<string, number>();
  for (const v of values) count.set(v, (count.get(v) ?? 0) + 1);
  let best: string | null = null;
  let bestN = 0;
  for (const [v, n] of count) if (n > bestN) [best, bestN] = [v, n];
  return best;
}

export function runRuler(opts: { repoRoot?: string; files?: string[]; contract?: Contract } = {}): RulerReport {
  const repoRoot = opts.repoRoot ?? REPO_ROOT;
  const contract = opts.contract ?? loadContract();
  const under = new Set(contractFiles(contract));
  const asked = (opts.files ?? contractFiles(contract)).map((f) =>
    isAbsolute(f) ? relative(repoRoot, f) : f,
  );
  const measuredPaths = asked.filter((f) => under.has(f));
  const skipped = asked.filter((f) => !under.has(f));

  // Rules 9 and 11 are CROSS-FILE: the canon is what the majority of the CONTRACT carries, never
  // what the handful of files in one submit run happen to carry.
  const all = contractFiles(contract).map((p) => measureFile(repoRoot, p, contract));
  const canonicalSection12 = majority(all.map((f) => f.section12Hash));
  const lawHashes = all.map((f) => f.lawHash).filter((h): h is string => h !== null);
  const canonicalLaw = majority(lawHashes);

  for (const f of all) {
    if (canonicalSection12 && f.section12Hash !== canonicalSection12) {
      f.failures["section-12-identity"].push({
        line: 0,
        detail: `§12 md5 ${f.section12Hash.slice(0, 8)} ≠ canonical ${canonicalSection12.slice(0, 8)}`,
      });
    }
    if (f.lawHash !== null && canonicalLaw && f.lawHash !== canonicalLaw) {
      f.failures["canonical-law-paragraph"].push({
        line: 0,
        detail: `law paragraph md5 ${f.lawHash.slice(0, 8)} ≠ canonical ${canonicalLaw.slice(0, 8)}`,
      });
    }
    f.pass = RULES.every((r) => f.failures[r].length === 0);
  }

  const byPath = new Map(all.map((f) => [f.path, f]));
  const files = measuredPaths.map((p) => byPath.get(p)!);
  for (const p of skipped) {
    files.push({
      path: p,
      slug: p.replace(/^.*\//, "").replace(/\.md$/, ""),
      measured: false,
      failures: emptyFailures(),
      section12Hash: "",
      lawHash: null,
      pass: true,
    });
  }
  return { files, canonicalSection12, canonicalLaw, pass: files.every((f) => f.pass) };
}

// ── the table ────────────────────────────────────────────────────────────────

export function formatReport(report: RulerReport): string {
  const out: string[] = [];
  out.push("PERSONA RULER — one metre for the builder and the checker");
  out.push("");
  RULES.forEach((r, i) => out.push(`  R${String(i + 1).padStart(2)} ${r}`));
  out.push("");
  const head = RULES.map((_, i) => `R${i + 1}`.padStart(4)).join("");
  out.push(`${"seat".padEnd(38)}${head}   verdict`);
  out.push("-".repeat(38 + RULES.length * 4 + 11));
  for (const f of report.files) {
    if (!f.measured) {
      out.push(`${f.slug.padEnd(38)}${"".padEnd(RULES.length * 4)}   NOT-MEASURED (outside the ruler's contract)`);
      continue;
    }
    const cells = RULES.map((r) => {
      const n = f.failures[r].length;
      return (n === 0 ? "·" : String(n)).padStart(4);
    }).join("");
    out.push(`${f.slug.padEnd(38)}${cells}   ${f.pass ? "PASS" : "FAIL"}`);
  }
  out.push("");
  const perRule = RULES.map((r) => {
    const failures = report.files.reduce((n, f) => n + f.failures[r].length, 0);
    const seats = report.files.filter((f) => f.measured && f.failures[r].length > 0).length;
    return { r, failures, seats };
  });
  out.push(`${"rule".padEnd(26)}${"seats failing".padStart(14)}${"failures".padStart(10)}`);
  out.push("-".repeat(50));
  for (const p of perRule) out.push(`${p.r.padEnd(26)}${String(p.seats).padStart(14)}${String(p.failures).padStart(10)}`);
  out.push("");
  for (const f of report.files) {
    if (!f.measured || f.pass) continue;
    out.push(`── ${f.path}`);
    for (const r of RULES) {
      for (const fail of f.failures[r]) {
        out.push(`   ${r} · ${f.path}:${fail.line} — ${fail.detail}`);
      }
    }
  }
  const measured = report.files.filter((f) => f.measured);
  const passing = measured.filter((f) => f.pass).length;
  out.push("");
  out.push(
    `RULER: ${passing}/${measured.length} PASS · §12 canon ${report.canonicalSection12?.slice(0, 8) ?? "—"} · law canon ${report.canonicalLaw?.slice(0, 8) ?? "—"}`,
  );
  return out.join("\n");
}

// ── the shell door (scripts/persona-ruler.sh runs this file directly) ────────

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(import.meta.filename);
if (invokedDirectly) {
  const argv = process.argv.slice(2);
  const verdicts = argv.includes("--verdicts");
  const files = argv.filter((a) => !a.startsWith("--"));
  const report = runRuler(files.length > 0 ? { files } : {});
  console.log(formatReport(report));
  if (verdicts) {
    for (const f of report.files) {
      console.log(`RULER-VERDICT\t${f.slug}\t${!f.measured ? "SKIP" : f.pass ? "PASS" : "FAIL"}`);
    }
  }
  process.exit(report.pass ? 0 : 1);
}
