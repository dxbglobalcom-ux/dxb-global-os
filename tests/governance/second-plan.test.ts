// THE SECOND PLAN — in a dxb-team2 plan job the lead and Fable write the same plan independently, and Sol
// audits both blind as "A" and "B" (CEO 2026-10-19). "They did not look at each other" is proven by the
// tool and its record: Fable runs in its own process with reading tools only and deny rules over the
// lead's scratchpad, the job folder and the session transcripts; the lead's plan is sealed before Fable's
// is revealed, and SEALS.log keeps that order. A stub stands in for the claude binary — no real model is
// ever called.
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const TOOL = resolve(__dirname, "../../scripts/governance/second-plan.sh");
const FABLE_PLAN = "# Second plan\nTake maximum care with the seam.";
const tmp: string[] = [];
afterAll(() => { for (const d of tmp) rmSync(d, { recursive: true, force: true }); });

// The stub records its arguments (one per line) and its stdin, waits until the test releases it, then
// prints a fixed plan and exits with STUB_EXIT.
function setup() {
  const dir = mkdtempSync(join(tmpdir(), "secondplan"));
  tmp.push(dir);
  const stub = join(dir, "claude-stub.sh");
  writeFileSync(stub, [
    "#!/usr/bin/env bash",
    `printf '%s\\n' "$@" > '${dir}/args'`,
    `cat > '${dir}/stdin'`,
    `while [ ! -f '${dir}/go' ]; do sleep 0.05; done`,
    `printf '%s\\n' '${FABLE_PLAN.split("\n").join("' '")}'`,
    'exit "${STUB_EXIT:-0}"',
  ].join("\n"));
  chmodSync(stub, 0o755);
  const job = join(dir, "job");
  const brief = join(dir, "brief.md");
  writeFileSync(brief, "Write the plan for the thing.\n");
  const lead = join(dir, "lead-plan.md");
  writeFileSync(lead, "# Lead plan\nThe maximum is three.\n");
  const run = (args: string[], stubExit = "0") =>
    spawnSync("bash", [TOOL, ...args], {
      encoding: "utf8",
      env: { ...process.env, DXB_CLAUDE_BIN: stub, STUB_EXIT: stubExit },
    });
  const release = () => writeFileSync(join(dir, "go"), "");
  const sealed = (name: string) => join(job, "sealed", name);
  const read = (name: string) => readFileSync(sealed(name), "utf8");
  const ended = async () => {
    for (let i = 0; i < 80; i++) {
      if (existsSync(sealed("fable.raw")) && /EXIT=\d+\n?$/.test(read("fable.raw"))) return;
      await new Promise((r) => setTimeout(r, 50));
    }
    throw new Error("the stub never ended");
  };
  return { dir, job, brief, lead, run, release, sealed, read, ended };
}

describe("second-plan.sh", () => {
  it("start launches Fable with reading tools only, max effort, and absolute deny rules; brief on stdin", async () => {
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
    expect(settings.permissions.deny).toEqual(
      expect.arrayContaining([
        "Read(//tmp/**)",
        `Read(/${t.job}/**)`,
        "Read(//home/dxb/.claude/**)",
        "Read(//home/dxb/.claude-mem/**)",
      ]),
    );
    expect(args).toContain("--strict-mcp-config"); // claude-mem's search could read the lead's observations
    expect(JSON.parse(after("--mcp-config"))).toEqual({ mcpServers: {} });
    expect(readFileSync(join(t.dir, "stdin"), "utf8")).toBe("Write the plan for the thing.\n");
    expect(t.read("brief.md")).toBe("Write the plan for the thing.\n");
    expect(t.read("SEALS.log")).toMatch(/^\S+ brief sha256=[0-9a-f]{64}\n$/);
    expect(t.read("fable.raw").trim().split("\n").pop()).toBe("EXIT=0");
  });

  it("refuses to start twice", async () => {
    const t = setup();
    expect(t.run(["start", t.job, t.brief]).status).toBe(0);
    const again = t.run(["start", t.job, t.brief]);
    expect(again.status).not.toBe(0);
    t.release();
    await t.ended();
  });

  it("reveal refuses before the lead's seal, and before EXIT=0", async () => {
    const t = setup();
    t.run(["start", t.job, t.brief]);
    t.release();
    await t.ended();
    const early = t.run(["reveal", t.job]);
    expect(early.status).not.toBe(0);
    expect(existsSync(t.sealed("fable.plan.md"))).toBe(false);

    const u = setup();
    u.run(["start", u.job, u.brief]);
    expect(u.run(["seal", u.job, u.lead]).status).toBe(0);
    const running = u.run(["reveal", u.job]);
    expect(running.status).not.toBe(0);
    expect(existsSync(u.sealed("fable.plan.md"))).toBe(false);
    u.release();
    await u.ended();
    expect(u.run(["reveal", u.job]).status).toBe(0);
  });

  it("reveal refuses when Fable ended with a non-zero exit", async () => {
    const t = setup();
    t.run(["start", t.job, t.brief], "3");
    t.release();
    await t.ended();
    t.run(["seal", t.job, t.lead]);
    const r = t.run(["reveal", t.job]);
    expect(r.status).not.toBe(0);
    expect(existsSync(t.sealed("fable.plan.md"))).toBe(false);
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
    // a fresh job where the reveal is forced first: the lead can no longer seal
    const u = setup();
    u.run(["start", u.job, u.brief]);
    u.release();
    await u.ended();
    writeFileSync(u.sealed("fable.plan.md"), "revealed\n");
    expect(u.run(["seal", u.job, u.lead]).status).not.toBe(0);
    expect(existsSync(u.sealed("opus.plan.md"))).toBe(false);
  });

  it("blind writes A and B with a key, passes on 'maximum', and SEALS.log keeps brief, opus, fable, blind in order", async () => {
    const t = setup();
    t.run(["start", t.job, t.brief]);
    expect(t.run(["blind", t.job]).status).not.toBe(0);
    t.run(["seal", t.job, t.lead]);
    t.release();
    await t.ended();
    t.run(["reveal", t.job]);
    const r = t.run(["blind", t.job]);
    expect(r.status, r.stderr).toBe(0);
    const key = t.read("key.md");
    const aIs = /A\s*=\s*(opus|fable)/.exec(key)![1];
    const bIs = /B\s*=\s*(opus|fable)/.exec(key)![1];
    expect([aIs, bIs].sort()).toEqual(["fable", "opus"]);
    expect(t.read("A.md")).toBe(t.read(`${aIs}.plan.md`));
    expect(t.read("B.md")).toBe(t.read(`${bIs}.plan.md`));
    const log = t.read("SEALS.log").trim().split("\n");
    expect(log.map((l) => l.split(" ")[1])).toEqual(["brief", "opus", "fable", "blind"]);
    expect(log[1]).toMatch(/ opus sha256=[0-9a-f]{64}$/);
    expect(log[2]).toMatch(/ fable sha256=[0-9a-f]{64}$/);
    expect(log[3]).toMatch(new RegExp(` blind A=${aIs} B=${bIs}$`));
    const s = t.run(["status", t.job]);
    expect(s.status).toBe(0);
    expect(s.stdout).toContain("opus sha256=");
    expect(s.stdout).toContain("key.md");
  });

  it("blind refuses, naming the hit, when a plan names a model or an effort level", async () => {
    for (const leak of ["Written by Opus at full tilt.", "Run it at xhigh.", "Ask SOL later.", "Effort: MAX."]) {
      const t = setup();
      writeFileSync(t.lead, `# Lead plan\n${leak}\n`);
      t.run(["start", t.job, t.brief]);
      t.run(["seal", t.job, t.lead]);
      t.release();
      await t.ended();
      t.run(["reveal", t.job]);
      const r = t.run(["blind", t.job]);
      expect(r.status, leak).not.toBe(0);
      expect(r.stderr.toLowerCase(), leak).toContain(/opus|xhigh|sol|max/i.exec(leak)![0].toLowerCase());
      expect(existsSync(t.sealed("A.md"))).toBe(false);
    }
  });

  it("blind passes with --reviewed once the lead has read the hits, and logs that it did", async () => {
    const t = setup();
    writeFileSync(t.lead, "# Lead plan\nThe critical gate's seat stays with Sol.\n");
    t.run(["start", t.job, t.brief]);
    t.run(["seal", t.job, t.lead]);
    t.release();
    await t.ended();
    t.run(["reveal", t.job]);
    expect(t.run(["blind", t.job]).status).not.toBe(0);
    const r = t.run(["blind", t.job, "--reviewed"]);
    expect(r.status, r.stderr).toBe(0);
    expect(existsSync(t.sealed("A.md"))).toBe(true);
    expect(t.read("SEALS.log")).toMatch(/ blind hits reviewed by the lead: 1\n.* blind A=/);
  });
});
