// THE COST GATE under vitest — the real hook (~/.claude/hooks/dxb-cost-gate.py), spawned where it
// stands with a PreToolUse payload on stdin, exactly as Claude Code runs it. CEO order 2026-09-27:
// every Bash command runs with GNU grep (Claude Code's shell snapshot shadows grep with its embedded
// ugrep — 26 GB on 2026-08-17); no whole-file read over 400 lines; no wait over 4 minutes inside a
// subagent (its cache dies at 5 — 2.4 M tokens were written again on 2026-09-26/27); and, by his order
// of ~20:05 the same day, no SendMessage that resumes a subagent idle more than 4 minutes. His order of
// ~20:22 closed the whole-file rule's escape routes and let a subagent that is still running be messaged.
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
const F402 = file("f402.txt", 402);
const F250 = file("f250.txt", 250);
const F200 = file("f200.txt", 200);
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
/** exit 0 and nothing on stdout or stderr: a non-Bash call goes through untouched */
const allowed = (r: { status: number | null; stdout: string; stderr: string }) =>
  r.status === 0 && r.stdout === "" && r.stderr === "";

/** subagent transcripts as Claude Code keeps them — agent-<id>.jsonl, one JSON entry a line — in the
 *  folder DXB_COST_GATE_SUBAGENTS_DIR points the gate at */
const SUBS = join(tmp, "subagents");
function transcript(id: string, entries: Record<string, unknown>[]): void {
  mkdirSync(SUBS, { recursive: true });
  writeFileSync(join(SUBS, `agent-${id}.jsonl`), entries.map((e) => JSON.stringify(e) + "\n").join(""));
}
/** an ISO timestamp `min` minutes back (negative: ahead), as the transcripts write it */
const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();
/** the lead's SendMessage to `to` — a resume when `to` names a subagent in SUBS */
const send = (to: string, message = "x") =>
  gate("SendMessage", { to, message }, undefined, { DXB_COST_GATE_SUBAGENTS_DIR: SUBS });

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

  it("T3 rule 5 is off (CEO 2026-10-01): a whole file over 400 lines passes through Bash and Read", () => {
    const cmd = `cat ${F401}`;
    expect(ran(bash(cmd), cmd)).toBe(REBIND + cmd);
    const r = gate("Read", { file_path: F401 });
    expect(r.status).toBe(0);
    expect(r.stdout).toBe("");
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

  it("T5 settings.json parses and sends Grep, Bash, Read and SendMessage through the cost gate", () => {
    const settings = JSON.parse(readFileSync(join(CLAUDE, "settings.json"), "utf8"));
    const entry = settings.hooks.PreToolUse.find((g: { hooks: { command: string }[] }) =>
      g.hooks.some((h) => h.command.includes("dxb-cost-gate.py")));
    expect(entry.matcher).toBe("Grep|Bash|Read|SendMessage");
  });

  it("T6 one call costs under 100 ms (the best of three, so a busy machine does not decide it)", () => {
    const ms = [0, 1, 2].map(() => {
      const t = performance.now();
      bash("grep -c foo x");
      return performance.now() - t;
    });
    expect(Math.min(...ms)).toBeLessThan(100);
  });

  // A SendMessage to a finished subagent resumes it; past 4 minutes its cache is dead and the resume writes
  // its whole context again — six resumes, 2.4 M tokens on 2026-09-26/27. CEO order 2026-09-27 ~20:05.
  it("T8a a resume of a subagent idle 10 minutes is refused with its idle time and context; the log keeps no message text", () => {
    transcript("a10", [
      { type: "user", timestamp: ago(12), message: { role: "user", content: "go" } },
      { type: "assistant", timestamp: ago(10), message: { role: "assistant", usage: {
        input_tokens: 2, cache_creation_input_tokens: 1_998, cache_read_input_tokens: 298_000, output_tokens: 700 } } },
    ]);
    const r = send("a10", "repair list: private words");
    expect(denied(r)).toBe(true);
    expect(r.stderr).toContain("idle for 10 min");
    expect(r.stderr).toContain("300,000");
    expect(r.stderr).toContain("Open a FRESH `helper-writer`");
    const last = readFileSync(join(LOGS, "dxb-cost-gate.jsonl"), "utf8").trim().split("\n").at(-1) ?? "";
    expect(JSON.parse(last)).toMatchObject({ tool: "SendMessage", decision: "deny", why: "resume-cold", idle_min: 10 });
    expect(last).not.toContain("private words");
  });

  it("T8b a subagent idle 2 minutes still holds its cache: the SendMessage passes", () => {
    transcript("a2", [{ type: "assistant", timestamp: ago(2), message: { role: "assistant", usage: { input_tokens: 9 } } }]);
    expect(allowed(send("a2"))).toBe(true);
  });

  it("T8c a target with no transcript here — main, an unknown id, another session's address — passes", () => {
    for (const to of ["main", "a0000000000000000", "uds:/run/user/1000/cc-socks/1.sock"]) {
      expect(allowed(send(to)), to).toBe(true);
    }
  });

  it("T8d a transcript with no timestamp line passes", () => {
    transcript("anostamp", [{ type: "summary", summary: "x" },
      { type: "assistant", message: { role: "assistant", usage: { input_tokens: 9 } } }]);
    expect(allowed(send("anostamp"))).toBe(true);
  });

  it("T8e a timestamp in the future — clock skew, a negative idle — passes", () => {
    transcript("afuture", [{ type: "assistant", timestamp: ago(-10), message: { role: "assistant", usage: { input_tokens: 9 } } }]);
    expect(allowed(send("afuture"))).toBe(true);
  });

  // A subagent still running spends the turn anyway, so refusing it saves nothing; only a finished one — its final
  // report, or a user text no reply followed (a stopped one) — is held to the 4 minutes. Its last MESSAGE decides:
  // attachment entries after it do not, and a message line longer than the first tail chunk is still found.
  const call = (id: string) => ({ type: "tool_use", id, name: "Bash", input: { command: "ls" } });
  const answer = (id: string) => ({ type: "tool_result", tool_use_id: id, content: "ok" });
  const said = (role: "assistant" | "user", min: number, content: unknown) =>
    ({ type: role, timestamp: ago(min), message: { role, content, ...(role === "assistant" ? { usage: { input_tokens: 9 } } : {}) } });

  it("T8f last message a tool result it is thinking over, 10 minutes old: running, the SendMessage passes", () => {
    transcript("arun1", [said("assistant", 11, [call("t1")]), said("user", 10, [answer("t1")])]);
    expect(allowed(send("arun1"))).toBe(true);
  });

  it("T8g last message a tool call whose result is pending, 10 minutes old: running, the SendMessage passes", () => {
    transcript("arun2", [said("user", 12, "go"), said("assistant", 10, [call("t1")])]);
    expect(allowed(send("arun2"))).toBe(true);
  });

  it("T8h last message a user text no reply followed — a stopped subagent — 10 minutes old: refused", () => {
    transcript("astop", [said("assistant", 11, [call("t1")]), said("user", 11, [answer("t1")]),
      said("user", 10, [{ type: "text", text: "[Request interrupted by user]" }])]);
    const r = send("astop");
    expect(denied(r)).toBe(true);
    expect(r.stderr).toContain("idle for 10 min");
  });

  it("T8i a last message line of 300 KB, 10 minutes old, is found through the bigger tail: refused", () => {
    transcript("along", [said("user", 12, "go"), said("assistant", 10, [{ type: "text", text: "r".repeat(300 * 1024) }])]);
    const r = send("along");
    expect(denied(r)).toBe(true);
    expect(r.stderr).toContain("idle for 10 min");
  });

  it("T8j attachment entries after a final report 10 minutes old do not make the subagent look fresh: refused", () => {
    transcript("aattach", [said("assistant", 10, [{ type: "text", text: "done" }]),
      { type: "attachment", timestamp: ago(1), attachment: { type: "x" } },
      { type: "attachment", timestamp: ago(0), attachment: { type: "y" } }]);
    expect(denied(send("aattach"))).toBe(true);
  });
});

// The repository's scripts/ops/dxb-cost-gate.py is the source install-cost-gate.sh puts in place; the
// live copy had drifted from it (rule 5's switch-off and the cold-resume advice lived only in the CEO's
// home — Fable's review, 2026-10-06). The two are one text.
describe("the live cost gate equals scripts/ops/dxb-cost-gate.py", () => {
  it("byte for byte", () => {
    const tracked = join(__dirname, "..", "..", "scripts", "ops", "dxb-cost-gate.py");
    expect(readFileSync(GATE, "utf8") === readFileSync(tracked, "utf8"),
      `${GATE} differs from ${tracked} — bring the change into the repository and run install-cost-gate.sh`).toBe(true);
  });
});
