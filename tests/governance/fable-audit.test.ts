// FABLE THE AUDITOR — wherever Sol audits a plan or a job's commits, Fable 5.1 audits the same thing at the
// same time, blind, read-only, one pass (CEO 2026-11-09). fable-audit.sh runs it in the second writer's
// walled box (walled-box.sh): HEAD only, the job's blind view only, no write anywhere it could matter. A stub
// stands in for the claude binary — no real model is ever called. bwrap itself runs for real.
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const ROOT = resolve(__dirname, "../..");
const TOOL = join(ROOT, "scripts/governance/fable-audit.sh");
const VERDICT = "A1 the seam leaks.";
const tmp: string[] = [];
afterAll(() => { for (const d of tmp) rmSync(d, { recursive: true, force: true }); });

// The stub runs inside the box: it records its arguments, its stdin and what it could read and write into
// its own (bound) folder, then prints a fixed verdict and exits with STUB_EXIT.
function setup() {
  const dir = mkdtempSync(join(tmpdir(), "fableaudit"));
  const job = mkdtempSync(join(tmpdir(), "fableaudit-job"));
  tmp.push(dir, job);
  mkdirSync(join(job, "blind"));
  writeFileSync(join(job, "blind", "A.md"), "plan A\n");
  mkdirSync(join(job, "sealed"));
  writeFileSync(join(job, "sealed", "key.md"), "A = opus\n");
  const probe = join(ROOT, `.fable-audit-write-probe.${process.pid}.${Date.now()}`);
  const stub = join(dir, "claude-stub.sh");
  writeFileSync(stub, [
    "#!/usr/bin/env bash",
    `printf '%s\\n' "$@" > '${dir}/args'`,
    `cat > '${dir}/stdin'`,
    `{ echo x > '${probe}' 2>/dev/null && echo repo-write=done || echo repo-write=refused`,
    `  echo x > "$HOME/work/probe" 2>/dev/null && echo head-write=done || echo head-write=refused`,
    `  [ -f "$HOME/work/package.json" ] && echo head=present || echo head=absent`,
    `  [ -e "$HOME/work/.git" ] && echo git=present || echo git=absent`,
    `  [ -f '${job}/blind/A.md' ] && echo blind=readable || echo blind=absent`,
    `  [ -e '${job}/sealed/key.md' ] && echo sealed=visible || echo sealed=absent`,
    `  echo "leak=\${FABLE_AUDIT_LEAK:-unset}"; } > '${dir}/seen'`,
    `echo '${VERDICT}'`,
    'exit "${STUB_EXIT:-0}"',
  ].join("\n"));
  chmodSync(stub, 0o755);
  const brief = join(dir, "brief.md");
  // the stub itself tries the write at ${probe}; the brief names no live path (the launcher refuses one, below)
  writeFileSync(brief, "Audit blind/A.md. Then create a file in the repository.\n");
  const run = (args: string[], env: Record<string, string> = {}) =>
    spawnSync("bash", [TOOL, ...args], {
      encoding: "utf8",
      env: { ...process.env, DXB_CLAUDE_BIN: stub, DXB_WALLED_BOX_TEST_BIND: dir, FABLE_AUDIT_LEAK: "the lead's environment", ...env },
    });
  const args = () => readFileSync(join(dir, "args"), "utf8").trim().split("\n");
  const after = (flag: string) => args()[args().indexOf(flag) + 1];
  const seen = () => readFileSync(join(dir, "seen"), "utf8");
  return { dir, job, brief, probe, run, args, after, seen };
}

describe("fable-audit.sh", () => {
  it("runs Fable 5.2 at high on the brief, read-only and walled off, and ends with FABLE_AUDIT_DONE", () => {
    const t = setup();
    const r = t.run([t.job, t.brief]);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout.trim().split("\n").pop()).toBe("FABLE_AUDIT_DONE exit=0");
    expect(readFileSync(join(t.job, "fable-audit.md"), "utf8")).toBe(`${VERDICT}\n`);
    expect(t.after("--model")).toBe("claude-fable-5-2");
    expect(t.after("--effort")).toBe("high");
    expect(t.after("--tools")).toBe("Read,Grep,Glob");
    expect(t.args()).toContain("-p");
    expect(t.args()).toContain("--no-session-persistence");
    expect(t.args()).toContain("--strict-mcp-config");
    expect(JSON.parse(t.after("--mcp-config"))).toEqual({ mcpServers: {} });
    const settings = JSON.parse(t.after("--settings"));
    expect(settings.disableAllHooks).toBe(true);
    expect(settings.permissions.deny).toEqual(expect.arrayContaining([`Read(/${t.job}/sealed/**)`]));
    expect(readFileSync(join(t.dir, "stdin"), "utf8")).toBe(readFileSync(t.brief, "utf8"));
    const seen = t.seen();
    expect(seen).toContain("head=present");
    expect(seen).toContain("git=absent");
    expect(seen).toContain("leak=unset");
    expect(seen).toContain("blind=readable"); // the plan audit's A and B
    expect(seen).toContain("sealed=absent"); // never the key or the originals
  });

  it("cannot write the repository: a brief asking it to create a file leaves none behind", () => {
    const t = setup();
    expect(t.run([t.job, t.brief]).status).toBe(0);
    expect(t.seen()).toContain("repo-write=refused");
    expect(t.seen()).toContain("head-write=refused");
    expect(existsSync(t.probe)).toBe(false);
  });

  it("takes max for an important job, reports the model's exit, and audits once only", () => {
    const t = setup();
    const r = t.run([t.job, t.brief, "max"], { STUB_EXIT: "3" });
    expect(r.stdout.trim().split("\n").pop()).toBe("FABLE_AUDIT_DONE exit=3");
    expect(r.status).toBe(3);
    expect(t.after("--effort")).toBe("max");
    expect(t.run([t.job, t.brief]).status).not.toBe(0); // fable-audit.md stands: one pass
  });

  // Measured 2026-11-22: a brief that said "Repository: <the live path>" sent the auditor to a path the box
  // does not have — HEAD is the box's working directory — and the audit lost every source but blind/.
  it("refuses a brief that names the live repository's path, before the one pass is spent", () => {
    const t = setup();
    const live = join(t.dir, "live.md");
    writeFileSync(live, `Repository: ${ROOT}. Read .planning/STATE.md and audit blind/A.md.\n`);
    const r = t.run([t.job, live]);
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain("relative");
    expect(r.stderr).toContain("live.md:1");
    expect(existsSync(join(t.dir, "args"))).toBe(false); // the model never ran
    expect(existsSync(join(t.job, "fable-audit.md"))).toBe(false); // the pass is still there
    expect(t.run([t.job, t.brief]).status).toBe(0);
  });

  it("lets the brief name the job's blind folder by its own path, also when the job lies inside the repository", () => {
    const t = setup();
    const job = join(ROOT, "node_modules", ".cache", `fableaudit-job.${process.pid}.${Date.now()}`);
    tmp.push(job);
    mkdirSync(join(job, "blind"), { recursive: true });
    writeFileSync(join(job, "blind", "A.md"), "plan A\n");
    const brief = join(t.dir, "inside.md");
    writeFileSync(brief, `Read ${job}/blind/A.md first, then .planning/STATE.md.\n`);
    const r = t.run([job, brief]);
    expect(r.status, r.stderr).toBe(0);
    expect(readFileSync(join(job, "fable-audit.md"), "utf8")).toBe(`${VERDICT}\n`);
  });

  it("refuses a relative job folder, a missing brief and an effort other than high or max", () => {
    const t = setup();
    expect(t.run(["relative/job", t.brief]).status).not.toBe(0);
    expect(t.run([t.job, join(t.dir, "missing.md")]).status).not.toBe(0);
    expect(t.run([t.job, t.brief, "xhigh"]).status).not.toBe(0);
    expect(existsSync(join(t.job, "fable-audit.md"))).toBe(false);
  });
});
