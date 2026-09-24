// THE OPENING RULER under vitest — it bites on copies, and the repository as it stands passes.
// Dictated by the checker session on 2026-09-19 (row B47 L1), committed by the builder (audit law, 2026-09-15).
// The bite cases follow the b46 pattern: a copy is made under mkdtemp, fattened, and the ruler
// must ring on the copy while the real tree stays green.
import { cpSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { C, collect, frontmatterBytes, measure, runRuler, skillsIn } from "./opening-budget.ts";

const root = process.cwd();
const tmp: string[] = [];
afterAll(() => { for (const d of tmp) rmSync(d, { recursive: true, force: true }); });

// The model watch (row B55) puts its lines under the hook's title from its state directory. Pinned
// here (the refuter's C2, 2026-09-24), so the ruler measures the repository and not whatever the
// machine's watch holds today: a quiet watch by default, its loudest state in a case of its own.
const quiet = mkdtempSync(join(tmpdir(), "model-watch-quiet-"));
const loud = mkdtempSync(join(tmpdir(), "model-watch-loud-"));
tmp.push(quiet, loud);
writeFileSync(join(loud, "NOTICE.txt"), "--- MODEL WATCH: 99 serious items wait for him — python3 scripts/model-watch/model-watch.py --status ---\n");
writeFileSync(join(loud, "sources.tsv"), ["models", "docs", "release-notes", "claude-code", "engineering", "judge"].map((n) => `${n}\tx\t0\tnever\terr\n`).join(""));
process.env.DXB_MODEL_WATCH_STATE = quiet;

/** a copy of the pieces the ruler reads, with the pieces needed for the hook to run, so a bite never touches the real tree */
function copy(): string {
  const dir = mkdtempSync(join(tmpdir(), "opening-budget-"));
  tmp.push(dir);
  mkdirSync(join(dir, ".claude", "hooks"), { recursive: true });
  cpSync(join(root, ".claude", "CLAUDE.md"), join(dir, ".claude", "CLAUDE.md"));
  cpSync(join(root, ".claude", "skills"), join(dir, ".claude", "skills"), { recursive: true });
  cpSync(join(root, ".claude", "hooks", "spec-bootstrap.sh"), join(dir, ".claude", "hooks", "spec-bootstrap.sh"));
  mkdirSync(join(dir, ".planning"), { recursive: true });
  cpSync(join(root, ".planning", "STATE.md"), join(dir, ".planning", "STATE.md"));
  return dir;
}

describe("the opening ruler bites on a copy", () => {
  it("rings on a core that has grown past its budget", () => {
    const dir = copy();
    writeFileSync(join(dir, ".claude", "CLAUDE.md"), "x".repeat(C.maxCore + 1));
    const r = runRuler({ root: dir });
    expect(r.verdicts[0].pass).toBe(false);
  });
  it("rings on the total, not only on the piece, when the opening as a whole is too big", () => {
    const inp = collect(root);
    const r = measure({ ...inp, core: "x".repeat(C.maxTotal) });
    expect(r.verdicts[3].pass).toBe(false);
    expect(r.verdicts[3].failures[0]).toContain(String(C.maxTotal + inp.hook.bytes + r.bytes.skills));
  });
  it("rings when the skills' listed descriptions outgrow their budget, and names the heaviest", () => {
    const dir = copy();
    mkdirSync(join(dir, ".claude", "skills", "fat-skill"));
    writeFileSync(join(dir, ".claude", "skills", "fat-skill", "SKILL.md"), `---\nname: fat-skill\ndescription: ${"d".repeat(C.maxSkills)}\n---\n`);
    const r = runRuler({ root: dir });
    expect(r.verdicts[1].pass).toBe(false);
    expect(r.verdicts[1].failures[0]).toContain("fat-skill");
  });
  it("rings when the position block fails its own ruler, and carries that ruler's reason", () => {
    const inp = collect(root);
    const r = measure({ ...inp, hook: { ...inp.hook, pass: false, verdicts: [{ rule: "R1 the block is ≤ 8000 bytes (the harness delivers it whole)", pass: false, failures: ["52329 bytes"] }] } });
    expect(r.verdicts[2].pass).toBe(false);
    expect(r.verdicts[2].failures[0]).toContain("52329");
  });
  it("rings on a cupboard page that is no longer one page", () => {
    const r = measure({ ...collect(root), cupboard: "c".repeat(C.maxCupboard + 1) });
    expect(r.verdicts[4].pass).toBe(false);
    expect(r.verdicts[4].failures[0]).toContain(String(C.maxCupboard + 1));
  });
  it("names a cupboard page that does not exist instead of hiding it", () => {
    const r = measure({ ...collect(root), cupboard: null });
    expect(r.verdicts[4].pass).toBe(true);
    expect(r.verdicts[4].rule).toContain("NOT YET WRITTEN");
  });
  it("counts only the listed frontmatter, a multi-line description whole, and nothing of the body", () => {
    const md = "---\nname: a\ndescription: one\n  two\nother: no\n---\n# body that is not counted\n";
    expect(frontmatterBytes(md)).toBe(Buffer.byteLength("name: a") + Buffer.byteLength("description: one\n  two"));
    expect(frontmatterBytes("# no frontmatter\n")).toBe(0);
    expect(skillsIn(join(root, "does-not-exist"))).toEqual([]);
  });
});

describe("the repository as it stands", () => {
  it("keeps the opening inside every budget, and reports the global skills without judging them", () => {
    const r = runRuler({ root });
    expect(r.verdicts.flatMap((v) => v.failures).join("\n")).toBe("");
    expect(r.pass).toBe(true);
    expect(r.verdicts[5].rule).toContain("outside the repo, reported only");
  });
  it("keeps it inside every budget with the model watch at its loudest: a notice, and every source and the judge stale", () => {
    process.env.DXB_MODEL_WATCH_STATE = loud;
    try {
      const r = runRuler({ root });
      expect(r.verdicts.flatMap((v) => v.failures).join("\n")).toBe("");
      expect(r.pass).toBe(true);
    } finally {
      process.env.DXB_MODEL_WATCH_STATE = quiet;
    }
  });
});
