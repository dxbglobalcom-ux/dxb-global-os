// THE OPENING RULER — how much of the session's opening does THIS REPOSITORY own, in bytes?
//
// Row B47 (2026-09-19, his order "Bunu inşaata kuralım"): a fresh session's first request costs
// 57,657 tokens before his first word is read; roughly 37 k of it is the harness's own text and
// is not ours. What IS ours arrives from three places this repository controls, and two of them
// have grown back once already (STATE.md to 1,796 lines; the position hook to 52,329 bytes). This
// ruler holds each piece to a byte budget so the opening cannot grow back in silence. It is
// dictated by the checker session (dxb-global-os-25, Fable 5.1) and committed by the builder under
// the audit law of 2026-09-15; the thresholds are the checker's, set beside the numbers measured
// on 2026-09-19, and a threshold change is its own `records(ruler): …` commit.
//
// One thing, one ruler: the position hook already has its own (session-start-fits.ts) — this
// ruler CALLS it and never measures the hook a second way. The cupboard page (B47 L3) has its
// rule R5 since 2026-09-19; until the page exists the rule names its absence instead of hiding it.
//
//   node --no-warnings tests/hooks/opening-budget.ts        — the table, exit 1 on any failure
//   npx vitest run tests/hooks/opening-budget.test.ts       — the same rules under vitest, biting on copies
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { runRuler as sessionStartRuler, type RulerReport as SessionStartReport } from "./session-start-fits.ts";

/** THE CONSTANTS — every budget in one place. Bytes, UTF-8. Measured 2026-09-19 in the comments. */
export const C = {
  core: ".claude/CLAUDE.md",
  skillsDir: ".claude/skills",
  /** outside the repository — measured and reported, never budgeted here */
  globalSkillsDir: join(homedir(), ".claude", "skills"),
  /** R1 — measured 12,058 */
  maxCore: 13000,
  /** R2 — frontmatter name + description of every project SKILL.md; measured 4,193 over 12 skills */
  maxSkills: 5000,
  /** R4 — core + project skills + the position block the hook delivers; measured 24,128 */
  maxTotal: 26000,
  /** R5 — the cupboard page (B47 L3): one page the warrior reads at the opening — what exists, where, how it opens */
  cupboard: ".claude/CUPBOARD.md",
  maxCupboard: 1500,
};

export type Verdict = { rule: string; pass: boolean; failures: string[] };
export type Piece = { name: string; bytes: number };
export type Inputs = { core: string; skills: Piece[]; hook: SessionStartReport; globalSkills: Piece[]; cupboard: string | null };
export type RulerReport = {
  verdicts: Verdict[];
  pass: boolean;
  bytes: { core: number; skills: number; hook: number; total: number; globalSkills: number; cupboard: number | null };
};

const here = fileURLToPath(new URL(".", import.meta.url));
export const repoRoot = (root?: string) => root ?? join(here, "..", "..");
const bytes = (s: string) => Buffer.byteLength(s, "utf8");

/** frontmatter `name:` + `description:` (a description may run over several lines) — what the harness lists at the opening */
export function frontmatterBytes(skillMd: string): number {
  const m = skillMd.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return 0;
  const fm = m[1];
  const name = fm.match(/^name:.*$/m)?.[0] ?? "";
  const desc = fm.match(/^description:[\s\S]*?(?=^\w[\w-]*:|(?![\s\S]))/m)?.[0] ?? "";
  return bytes(name) + bytes(desc.replace(/\s+$/, ""));
}

export function skillsIn(dir: string): Piece[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((d) => existsSync(join(dir, d, "SKILL.md")))
    .sort()
    .map((d) => ({ name: d, bytes: frontmatterBytes(readFileSync(join(dir, d, "SKILL.md"), "utf8")) }));
}

export function collect(root: string): Inputs {
  return {
    core: readFileSync(join(root, C.core), "utf8"),
    skills: skillsIn(join(root, C.skillsDir)),
    hook: sessionStartRuler({ root }),
    globalSkills: skillsIn(C.globalSkillsDir),
    cupboard: existsSync(join(root, C.cupboard)) ? readFileSync(join(root, C.cupboard), "utf8") : null,
  };
}

export function measure(inp: Inputs): RulerReport {
  const core = bytes(inp.core);
  const skills = inp.skills.reduce((n, p) => n + p.bytes, 0);
  const hook = inp.hook.bytes;
  const total = core + skills + hook;
  const globalSkills = inp.globalSkills.reduce((n, p) => n + p.bytes, 0);
  const cupboard = inp.cupboard === null ? null : bytes(inp.cupboard);
  const v: Verdict[] = [];
  v.push({ rule: `R1 the core (${C.core}) is ≤ ${C.maxCore} bytes`, pass: core <= C.maxCore, failures: core <= C.maxCore ? [] : [`${core} bytes`] });
  const heaviest = [...inp.skills].sort((a, b) => b.bytes - a.bytes).slice(0, 3).map((p) => `${p.name} ${p.bytes}`);
  v.push({
    rule: `R2 the project skills' listed descriptions (${C.skillsDir}) total ≤ ${C.maxSkills} bytes`,
    pass: skills <= C.maxSkills,
    failures: skills <= C.maxSkills ? [] : [`${skills} bytes over ${inp.skills.length} skills — heaviest: ${heaviest.join(", ")}`],
  });
  const hookFailures = inp.hook.verdicts.flatMap((x) => (x.pass ? [] : [`${x.rule}: ${x.failures.join("; ")}`]));
  v.push({ rule: "R3 the position block passes its own ruler (tests/hooks/session-start-fits.ts)", pass: inp.hook.pass, failures: hookFailures });
  v.push({ rule: `R4 the repo-owned opening — core + project skills + position block — is ≤ ${C.maxTotal} bytes`, pass: total <= C.maxTotal, failures: total <= C.maxTotal ? [] : [`${total} bytes`] });
  if (cupboard === null) {
    v.push({ rule: `R5 the cupboard page (${C.cupboard}) is ≤ ${C.maxCupboard} bytes — NOT YET WRITTEN (row B47 L3)`, pass: true, failures: [] });
  } else {
    v.push({ rule: `R5 the cupboard page (${C.cupboard}) is ≤ ${C.maxCupboard} bytes`, pass: cupboard <= C.maxCupboard, failures: cupboard <= C.maxCupboard ? [] : [`${cupboard} bytes`] });
  }
  v.push({ rule: `R0 outside the repo, reported only: global skills (${C.globalSkillsDir}) ${globalSkills} bytes over ${inp.globalSkills.length} skills`, pass: true, failures: [] });
  return { verdicts: v, pass: v.every((x) => x.pass), bytes: { core, skills, hook, total, globalSkills, cupboard } };
}

export function runRuler(opts: { root?: string } = {}): RulerReport {
  return measure(collect(repoRoot(opts.root)));
}

function main() {
  const r = runRuler();
  const b = r.bytes;
  console.log(`OPENING RULER — core ${b.core} · project skills ${b.skills} · position block ${b.hook} · total ${b.total} · cupboard ${b.cupboard ?? "—"} (bytes)`);
  for (const v of r.verdicts) {
    console.log(`  ${v.pass ? "PASS" : "FAIL"}  ${v.rule}`);
    for (const f of v.failures) console.log(`        ${f}`);
  }
  const failed = r.verdicts.filter((v) => !v.pass).length;
  console.log(`${r.verdicts.length - failed}/${r.verdicts.length} PASS, ${r.verdicts.reduce((n, v) => n + v.failures.length, 0)} failures`);
  process.exit(r.pass ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
