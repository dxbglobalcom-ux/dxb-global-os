// THE COST GATE under vitest — the real hook (~/.claude/hooks/dxb-cost-gate.py), spawned where it
// stands with a PreToolUse payload on stdin, exactly as Claude Code runs it. CEO order 2026-09-27:
// every Bash command runs with GNU grep (Claude Code's shell snapshot shadows grep with its embedded
// ugrep — 26 GB on 2026-08-17); no whole-file read over 400 lines; no wait over 4 minutes inside a
// subagent (its cache dies at 5 — 2.4 M tokens were written again on 2026-09-26/27).
import { spawnSync } from "node:child_process";
import { accessSync, constants, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir, userInfo } from "node:os";
import { join } from "node:path";
import { afterAll, describe as vdescribe, expect, it } from "vitest";

// The battery redirects HOME and the full battery runs sandboxed as another user (dxbbuild) who cannot
// read the CEO's home: the gate is looked up as tests/hooks/code-gate.test.ts looks up its hooks, and
// when no candidate is readable the suite SKIPS with the reason in its title instead of turning red.
// DXB_HOOKS_FORCE_UNREADABLE=1 is test-only: it forces that path to prove the skip.
const CANDIDATES = [...new Set([process.env.DXB_CLAUDE_HOME, userInfo().homedir,
  /^\/home\/[^/]+/.exec(process.cwd())?.[0]].filter((h): h is string => !!h))];
const readable = (h: string) => [join("hooks", "dxb-cost-gate.py"), "settings.json"].every((f) => {
  try { accessSync(join(h, ".claude", f), constants.R_OK); return true; } catch { return false; }
});
const FOUND = process.env.DXB_HOOKS_FORCE_UNREADABLE === "1" ? undefined : CANDIDATES.find(readable);
const REASON = FOUND ? null : `cost gate unreadable as ${userInfo().username} — tried ${CANDIDATES.join(", ")}; ` +
  `the sandboxed battery cannot read the CEO's home; run "pnpm vitest run tests/hooks" as the host user`;
if (REASON) console.warn(`SKIPPED — ${REASON}`);
const describe = (title: string, fn: () => void) =>
  REASON ? vdescribe.skip(`[SKIPPED — ${REASON}] ${title}`, fn) : vdescribe(title, fn);
const CLAUDE = join(FOUND ?? CANDIDATES[0], ".claude");
const GATE = join(CLAUDE, "hooks", "dxb-cost-gate.py");
const REBIND = "unset -f grep 2>/dev/null; ";
/** {0,260}, built at runtime so this file never carries the shape (as scripts/ops/test-cost-gate.py) */
const W = "{0," + "260}";

const tmp = mkdtempSync(join(tmpdir(), "cost-gate-"));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));
/** the gate's decision log for every call made here, never ~/.claude/logs */
const LOGS = join(tmp, "logs");

/** a text file of n lines, as wc -l counts them */
function file(name: string, n: number): string {
  const f = join(tmp, name);
  writeFileSync(f, Array.from({ length: n }, (_, i) => `line ${i + 1}\n`).join(""));
  return f;
}
const F401 = file("f401.txt", 401);
const F400 = file("f400.txt", 400);
const MISSING = join(tmp, "missing.txt");

/** runs the real gate on one PreToolUse payload; `agent` makes it a subagent's call */
function gate(tool: string, input: Record<string, unknown>, agent?: string, env: Record<string, string> = {}) {
  const r = spawnSync("python3", [GATE], {
    input: JSON.stringify({
      session_id: "cost-gate-test", hook_event_name: "PreToolUse", tool_name: tool, tool_input: input,
      cwd: tmp, ...(agent ? { agent_id: "a1", agent_type: agent } : {}),
    }),
    encoding: "utf8", timeout: 10_000, env: { ...process.env, DXB_COST_GATE_LOG_DIR: LOGS, ...env },
  });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}
const bash = (command: string, extra: Record<string, unknown> = {}, agent?: string, env: Record<string, string> = {}) =>
  gate("Bash", { command, ...extra }, agent, env);
/** the command Claude Code runs: the rewrite when the gate printed one, else the original */
const ran = (r: { stdout: string }, command: string): string =>
  r.stdout ? JSON.parse(r.stdout).hookSpecificOutput.updatedInput.command : command;
/** exit 2, the reason on stderr and nothing on stdout: a refused call is never rewritten */
const denied = (r: { status: number | null; stdout: string }) => r.status === 2 && r.stdout === "";

describe("dxb-cost-gate.py — GNU grep, a slice not the file, no long wait in a subagent", () => {
  it("T1 an allowed Bash call comes back rewritten to drop the ugrep function, once; a denied one does not", () => {
    const r = bash("grep -c foo x", { description: "count foo", timeout: 60000 });
    expect(r.status).toBe(0);
    const out = JSON.parse(r.stdout).hookSpecificOutput;
    expect(out.hookEventName).toBe("PreToolUse");
    expect(out.updatedInput).toEqual({ command: `${REBIND}grep -c foo x`, description: "count foo", timeout: 60000 });
    const again = `${REBIND}grep -c foo x`;
    expect(ran(bash(again), again).split("unset -f grep").length - 1).toBe(1);
    expect(denied(bash(`grep -oE '.${W}growth total.${W}' notes.md`))).toBe(true);
  });

  it("T2 the wide-window rule of 2026-08-17/19 still refuses, with its own reason", () => {
    const r = bash(`grep -oE '.${W}growth total.${W}' notes.md`);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("wide repetition");
  });

  it("T3 a whole file over 400 lines is refused through Bash and Read; a slice, a bound or a missing file passes", () => {
    for (const cmd of [`cat ${F401}`, `sed -n '1,500p' ${F401}`]) {
      const r = bash(cmd);
      expect(denied(r), cmd).toBe(true);
      expect(r.stderr).toContain("MEASURE FIRST");
    }
    for (const cmd of [`cat ${F401} | head -20`, `sed -n '1,80p' ${F401}`, `cat ${F400}`, `cat ${MISSING}`]) {
      expect(ran(bash(cmd), cmd), cmd).toBe(REBIND + cmd);
    }
    expect(denied(gate("Read", { file_path: F401 }))).toBe(true);
    for (const input of [{ file_path: F401, limit: 120 }, { file_path: F400 }, { file_path: MISSING }]) {
      const r = gate("Read", input);
      expect(r.status, JSON.stringify(input)).toBe(0);
      expect(r.stdout).toBe("");
    }
  });

  it("T4 a subagent's long wait belongs to the lead; the lead itself is never held", () => {
    const long: [string, Record<string, unknown>][] = [
      ["ls", { timeout: 300000 }], ["ls", { run_in_background: true }], ["bash scripts/battery.sh", {}]];
    for (const [cmd, extra] of long) {
      const r = bash(cmd, extra, "builder");
      expect(denied(r), cmd + JSON.stringify(extra)).toBe(true);
      expect(r.stderr).toContain("belongs to the lead");
    }
    const lane = "pnpm exec vitest run tests/hooks/dxb-now.test.ts";
    expect(ran(bash(lane, {}, "builder"), lane)).toBe(REBIND + lane);
    for (const [cmd, extra] of long) {
      const r = bash(cmd, extra);
      expect(r.status).toBe(0);
      expect(JSON.parse(r.stdout).hookSpecificOutput.updatedInput).toEqual({ command: REBIND + cmd, ...extra });
    }
  });

  it("T5 settings.json parses and sends Grep, Bash and Read through the cost gate", () => {
    const settings = JSON.parse(readFileSync(join(CLAUDE, "settings.json"), "utf8"));
    const entry = settings.hooks.PreToolUse.find((g: { hooks: { command: string }[] }) =>
      g.hooks.some((h) => h.command.includes("dxb-cost-gate.py")));
    expect(entry.matcher).toBe("Grep|Bash|Read");
  });

  it("T6 one call costs under 100 ms (the best of three, so a busy machine does not decide it)", () => {
    const ms = [0, 1, 2].map(() => {
      const t = performance.now();
      bash("grep -c foo x");
      return performance.now() - t;
    });
    expect(Math.min(...ms)).toBeLessThan(100);
  });

  // cd is banned here, so nearly every command spells its paths through a variable — R="…"; cat "$R/…".
  // A path is resolved from the command line itself before it is measured (the lead's probe, 2026-09-27).
  it("T7a the lead's probe — D=<dir>; cat \"$D/<401-line file>\" — is refused", () => {
    const r = bash(`D=${tmp}; cat "$D/f401.txt"`);
    expect(denied(r)).toBe(true);
    expect(r.stderr).toContain("MEASURE FIRST");
  });

  it("T7b the same probe over a 400-line file passes", () => {
    const cmd = `D=${tmp}; cat "$D/f400.txt"`;
    expect(ran(bash(cmd), cmd)).toBe(REBIND + cmd);
  });

  it("T7c R=\"$HOME/x\"; cat \"$R/f\" resolves through $HOME and is refused", () => {
    mkdirSync(join(tmp, "home", "x"), { recursive: true });
    file(join("home", "x", "f"), 401);
    expect(denied(bash(`R="$HOME/x"; cat "$R/f"`, {}, undefined, { HOME: join(tmp, "home") }))).toBe(true);
  });

  it("T7d a path the gate cannot resolve passes, logged as unmeasured-path", () => {
    const cmd = `cat "$UNKNOWN/f"`;
    expect(ran(bash(cmd), cmd)).toBe(REBIND + cmd);
    const last = readFileSync(join(LOGS, "dxb-cost-gate.jsonl"), "utf8").trim().split("\n").at(-1) ?? "";
    expect(JSON.parse(last)).toMatchObject({ decision: "unmeasured-path", paths: ["$UNKNOWN/f"] });
  });
});
