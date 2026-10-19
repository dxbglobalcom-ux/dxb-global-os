// THE SECOND PLAN — in a dxb-team2 plan job the lead and Fable write the same plan independently, and Sol
// audits both blind as "A" and "B" (CEO 2026-10-19). "They did not look at each other" is proven by the
// tool and its record (Sol's A1-A3 and B3, fixed 2026-10-19): Fable runs walled off in bwrap with HEAD and
// the brief only; a watcher on its output's inode makes any read before `reveal` void the job; every step
// re-verifies the hashes it was sealed with; Sol's view holds the brief, A and B, while the key and the
// originals stay in a folder the audit may not read. Stubs stand in for the claude binary and refuter.sh —
// no real model is ever called. bwrap itself runs for real.
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const TOOL = resolve(__dirname, "../../scripts/governance/second-plan.sh");
const FABLE_PLAN = "# Second plan\nTake maximum care with the seam.";
const tmp: string[] = [];
afterAll(() => {
  for (const d of tmp) {
    // a job that never reached reveal leaves its watcher running
    const pid = join(d, "job", "sealed", "watch.pid");
    if (existsSync(pid)) try { process.kill(Number(readFileSync(pid, "utf8"))); } catch { /* already gone */ }
    // and its output folder in the runtime dir, which only reveal removes
    const raw = join(d, "job", "sealed", "raw.path");
    if (existsSync(raw)) rmSync(dirname(readFileSync(raw, "utf8").trim()), { recursive: true, force: true });
    rmSync(d, { recursive: true, force: true });
  }
});

// The stub runs inside the box. It records its arguments, its stdin and what it can see into its own
// (bound) folder, waits until the test releases it, then prints a fixed plan and exits with STUB_EXIT.
function setup() {
  const dir = mkdtempSync(join(tmpdir(), "secondplan"));
  tmp.push(dir);
  const outside = mkdtempSync(join(tmpdir(), "secondplan-outside"));
  tmp.push(outside);
  writeFileSync(join(outside, "draft.md"), "the lead's draft\n");
  const stub = join(dir, "claude-stub.sh");
  writeFileSync(stub, [
    "#!/usr/bin/env bash",
    `printf '%s\\n' "$@" > '${dir}/args'`,
    `cat > '${dir}/stdin'`,
    `{ [ -e '${outside}/draft.md' ] && echo draft=visible || echo draft=absent`,
    `  [ -e '${resolve(__dirname, "../..")}/package.json' ] && echo live=visible || echo live=absent`,
    `  [ -f "$HOME/work/package.json" ] && echo head=present || echo head=absent`,
    `  [ -e "$HOME/work/.git" ] && echo git=present || echo git=absent`,
    `  echo "leak=\${SECOND_PLAN_LEAK:-unset}"; echo "pwd=$PWD"; } > '${dir}/seen'`,
    `while [ ! -f '${dir}/go' ]; do sleep 0.05; done`,
    `printf '%s\\n' '${FABLE_PLAN.split("\n").join("' '")}'`,
    'exit "${STUB_EXIT:-0}"',
  ].join("\n"));
  chmodSync(stub, 0o755);
  const refuter = join(dir, "refuter-stub.sh");
  writeFileSync(refuter, `#!/usr/bin/env bash\nprintf '%s\\n' "$@" > '${dir}/refuter-args'\necho SOL_VERDICT\nexit "\${REFUTER_EXIT:-0}"\n`);
  chmodSync(refuter, 0o755);
  const job = join(dir, "job");
  const brief = join(dir, "brief.md");
  writeFileSync(brief, "Write the plan for the thing.\n");
  const lead = join(dir, "lead-plan.md");
  writeFileSync(lead, "# Lead plan\nThe maximum is three.\n");
  const run = (args: string[], env: Record<string, string> = {}) =>
    spawnSync("bash", [TOOL, ...args], {
      encoding: "utf8",
      env: {
        ...process.env, DXB_CLAUDE_BIN: stub, DXB_REFUTER_BIN: refuter, DXB_SECOND_PLAN_TEST_BIND: dir,
        SECOND_PLAN_LEAK: "the lead's environment", ...env,
      },
    });
  const release = () => writeFileSync(join(dir, "go"), "");
  const sealed = (name: string) => join(job, "sealed", name);
  const read = (name: string) => readFileSync(sealed(name), "utf8");
  const log = () => read("SEALS.log").trim().split("\n");
  // waits on fable.exit only — reading fable.raw before reveal is exactly what the watcher reports
  const ended = async () => {
    for (let i = 0; i < 200; i++) {
      if (existsSync(sealed("fable.exit"))) return;
      await new Promise((r) => setTimeout(r, 50));
    }
    throw new Error("the stub never ended");
  };
  const toRevealed = async () => {
    expect(run(["start", job, brief]).status).toBe(0);
    expect(run(["seal", job, lead]).status).toBe(0);
    release();
    await ended();
    const r = run(["reveal", job]);
    expect(r.status, r.stderr).toBe(0);
  };
  return { dir, job, brief, lead, run, release, sealed, read, log, ended, toRevealed };
}

describe("second-plan.sh", () => {
  it("start walls Fable off: brief on stdin, HEAD only, no live tree, no scratchpad, no inherited env", async () => {
    const t = setup();
    const r = t.run(["start", t.job, t.brief]);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toMatch(/^SECOND_PLAN_STARTED \S+\n$/);
    t.release();
    await t.ended();
    const args = readFileSync(join(t.dir, "args"), "utf8").trim().split("\n");
    const after = (flag: string) => args[args.indexOf(flag) + 1];
    expect(args).toContain("-p");
    expect(args).toContain("--no-session-persistence");
    expect(after("--model")).toBe("fable");
    expect(after("--effort")).toBe("max");
    expect(after("--tools")).toBe("Read,Grep,Glob");
    const settings = JSON.parse(after("--settings"));
    expect(settings.disableAllHooks).toBe(true); // the opening hook carried the lead's own recent work
    expect(settings.permissions.deny).toEqual(expect.arrayContaining(["Read(//tmp/**)", "Read(//home/dxb/.claude/**)"]));
    expect(args).toContain("--strict-mcp-config"); // claude-mem's search could read the lead's observations
    expect(JSON.parse(after("--mcp-config"))).toEqual({ mcpServers: {} });
    expect(readFileSync(join(t.dir, "stdin"), "utf8")).toBe("Write the plan for the thing.\n");
    const seen = readFileSync(join(t.dir, "seen"), "utf8");
    expect(seen).toContain("draft=absent"); // the lead's scratchpad lives in /tmp
    expect(seen).toContain("live=absent");
    expect(seen).toContain("head=present");
    expect(seen).toContain("git=absent");
    expect(seen).toContain("leak=unset");
    expect(seen).toMatch(/pwd=.*\/work\n/);
    expect(t.log()[0]).toMatch(/ brief sha256=[0-9a-f]{64}$/);
    expect(t.log()[1]).toMatch(/ box HEAD=[0-9a-f]{40}$/);
    expect(t.log()[2]).toMatch(/ fable started$/);
    expect(t.log()[3]).toMatch(/ fable ended exit=0 sha256=[0-9a-f]{64}$/);
    expect(existsSync(readFileSync(t.sealed("box.path"), "utf8").trim())).toBe(false); // the box is removed
    expect(t.read("raw.path")).toMatch(/^\/run\/user\/\d+\/dxb-second-plan\.\w+\/fable\.raw\n$/); // out of every scanner's way
  });

  it("refuses to start twice", async () => {
    const t = setup();
    expect(t.run(["start", t.job, t.brief]).status).toBe(0);
    expect(t.run(["start", t.job, t.brief]).status).not.toBe(0);
    t.release();
    await t.ended();
  });

  it("reveal refuses before the lead's seal, before Fable ends, and after a non-zero exit", async () => {
    const t = setup();
    t.run(["start", t.job, t.brief]);
    t.release();
    await t.ended();
    expect(t.run(["reveal", t.job]).status).not.toBe(0);
    expect(existsSync(t.sealed("fable.plan.md"))).toBe(false);

    const u = setup();
    u.run(["start", u.job, u.brief]);
    expect(u.run(["seal", u.job, u.lead]).status).toBe(0);
    expect(u.run(["reveal", u.job]).status).not.toBe(0);
    u.release();
    await u.ended();
    expect(u.run(["reveal", u.job]).status).toBe(0);

    const v = setup();
    v.run(["start", v.job, v.brief], { STUB_EXIT: "3" });
    v.release();
    await v.ended();
    v.run(["seal", v.job, v.lead]);
    const r = v.run(["reveal", v.job]);
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain("exit 3");
  });

  it("reveal refuses when Fable's output was read before it — through any path — and logs it", async () => {
    const t = setup();
    t.run(["start", t.job, t.brief]);
    t.release();
    await t.ended();
    readFileSync(t.read("raw.path").trim(), "utf8"); // the lead peeks before its own seal
    t.run(["seal", t.job, t.lead]);
    const r = t.run(["reveal", t.job]);
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain("read before reveal");
    expect(t.read("SEALS.log")).toMatch(/ READ BEFORE REVEAL: [1-9]\d* event\(s\)/);
    expect(existsSync(t.sealed("fable.plan.md"))).toBe(false);
  });

  it("reveal refuses when the watcher is gone", async () => {
    const t = setup();
    t.run(["start", t.job, t.brief]);
    t.run(["seal", t.job, t.lead]);
    t.release();
    await t.ended();
    process.kill(Number(t.read("watch.pid")));
    await new Promise((r) => setTimeout(r, 200));
    const r = t.run(["reveal", t.job]);
    expect(r.status).not.toBe(0);
    expect(t.read("SEALS.log")).toContain("UNWATCHED");
  });

  it("reveal and blind refuse a sealed plan that changed after its seal", async () => {
    const t = setup();
    t.run(["start", t.job, t.brief]);
    t.run(["seal", t.job, t.lead]);
    writeFileSync(t.sealed("opus.plan.md"), "# Lead plan, improved after the fact\n");
    t.release();
    await t.ended();
    const r = t.run(["reveal", t.job]);
    expect(r.status).not.toBe(0);
    expect(t.read("SEALS.log")).toContain("TAMPERED opus sealed");

    const u = setup();
    await u.toRevealed();
    writeFileSync(u.sealed("fable.plan.md"), "# edited\n");
    expect(u.run(["blind", u.job]).status).not.toBe(0);
    expect(existsSync(join(u.job, "blind"))).toBe(false);
  });

  it("seal refuses twice, and refuses once Fable's plan is revealed", async () => {
    const t = setup();
    t.run(["start", t.job, t.brief]);
    expect(t.run(["seal", t.job, t.lead]).status).toBe(0);
    expect(t.run(["seal", t.job, t.lead]).status).not.toBe(0);
    t.release();
    await t.ended();
    const rv = t.run(["reveal", t.job]);
    expect(rv.status, rv.stderr).toBe(0);
    expect(rv.stdout.trim()).toBe(t.sealed("fable.plan.md"));
    expect(t.read("fable.plan.md")).toBe(`${FABLE_PLAN}\n`);
    const u = setup();
    u.run(["start", u.job, u.brief]);
    u.release();
    await u.ended();
    writeFileSync(u.sealed("fable.plan.md"), "revealed\n");
    expect(u.run(["seal", u.job, u.lead]).status).not.toBe(0);
    expect(existsSync(u.sealed("opus.plan.md"))).toBe(false);
  });

  it("blind gives Sol's view the brief, A and B only; the key stays sealed; the log keeps the order", async () => {
    const t = setup();
    t.run(["start", t.job, t.brief]);
    expect(t.run(["blind", t.job]).status).not.toBe(0);
    t.run(["seal", t.job, t.lead]);
    t.release();
    await t.ended();
    t.run(["reveal", t.job]);
    const r = t.run(["blind", t.job]);
    expect(r.status, r.stderr).toBe(0);
    const view = join(t.job, "blind");
    expect(r.stdout.trim()).toBe(view);
    expect(readdirSync(view).sort()).toEqual(["A.md", "B.md", "brief.md"]);
    const key = t.read("key.md");
    const aIs = /A\s*=\s*(opus|fable)/.exec(key)![1];
    const bIs = /B\s*=\s*(opus|fable)/.exec(key)![1];
    expect([aIs, bIs].sort()).toEqual(["fable", "opus"]);
    expect(readFileSync(join(view, "A.md"), "utf8")).toBe(t.read(`${aIs}.plan.md`));
    expect(readFileSync(join(view, "B.md"), "utf8")).toBe(t.read(`${bIs}.plan.md`));
    expect(t.log().map((l) => l.split(" ").slice(1, 3).join(" "))).toEqual([
      expect.stringMatching(/^brief sha256=/), expect.stringMatching(/^box HEAD=/), "fable started",
      expect.stringMatching(/^opus sealed$/), expect.stringMatching(/^fable ended$/), "watch clean",
      "fable revealed", expect.stringMatching(/^blind A=/),
    ]);
  });

  it("blind refuses, naming the hit, when a plan names a model or an effort level", async () => {
    for (const leak of ["Written by Opus at full tilt.", "Run it at xhigh.", "Ask SOL later.", "Effort: MAX."]) {
      const t = setup();
      writeFileSync(t.lead, `# Lead plan\n${leak}\n`);
      await t.toRevealed();
      const r = t.run(["blind", t.job]);
      expect(r.status, leak).not.toBe(0);
      expect(r.stderr.toLowerCase(), leak).toContain(/opus|xhigh|sol|max/i.exec(leak)![0].toLowerCase());
      expect(existsSync(join(t.job, "blind"))).toBe(false);
    }
  });

  it("blind passes with --reviewed once the lead has read the hits, and logs that it did", async () => {
    const t = setup();
    writeFileSync(t.lead, "# Lead plan\nThe critical gate's seat stays with Sol.\n");
    await t.toRevealed();
    expect(t.run(["blind", t.job]).status).not.toBe(0);
    const r = t.run(["blind", t.job, "--reviewed"]);
    expect(r.status, r.stderr).toBe(0);
    expect(t.read("SEALS.log")).toMatch(/ blind hits reviewed by the lead: 1\n.* blind A=/);
  });

  it("audit runs Sol with the sealed folder, the scratchpad and the transcripts denied; sign needs it", async () => {
    const t = setup();
    await t.toRevealed();
    t.run(["blind", t.job]);
    const solBrief = join(t.dir, "sol-brief.md");
    writeFileSync(solBrief, "Audit A and B.\n");
    expect(t.run(["sign", t.job, t.lead]).status).not.toBe(0); // no plan is signed before Sol's audit
    const r = t.run(["audit", t.job, solBrief, "xhigh"]);
    expect(r.status, r.stderr).toBe(0);
    const args = readFileSync(join(t.dir, "refuter-args"), "utf8").trim().split("\n");
    const denied = args.filter((_, i) => args[i - 1] === "--deny-read");
    expect(denied).toEqual(expect.arrayContaining([t.sealed("").replace(/\/$/, ""), "/tmp", `${process.env.HOME}/.claude`]));
    expect(args[args.indexOf("--effort") + 1]).toBe("xhigh");
    expect(args[args.length - 1]).toBe("Audit A and B.");
    expect(readFileSync(join(t.job, "sol-plan.raw"), "utf8")).toBe("SOL_VERDICT\nEXIT=0\n");
    expect(t.run(["audit", t.job, solBrief]).status).not.toBe(0); // one pass only
    const s = t.run(["sign", t.job, t.lead]);
    expect(s.status, s.stderr).toBe(0);
    expect(t.log().slice(-3).map((l) => l.split(" ")[1] + " " + l.split(" ")[2])).toEqual([
      "sol started", "sol ended", expect.stringMatching(/^signed sha256=/),
    ]);
  });
});

describe("refuter.sh --deny-read", () => {
  it("takes absolute paths only, before the brief", () => {
    const r = spawnSync("bash", [resolve(__dirname, "../../scripts/governance/refuter.sh"), "--deny-read", "relative/x", "claim"], { encoding: "utf8" });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("--deny-read takes an absolute path");
    const q = spawnSync("bash", [resolve(__dirname, "../../scripts/governance/refuter.sh"), "--deny-read", '/a"b', "claim"], { encoding: "utf8" });
    expect(q.status).toBe(1);
    expect(q.stderr).toContain("quote");
  });
});
