// THE CONTEXT GATE under vitest — the real hook and the real status line, run where they stand.
// The CEO's numbers of 2026-09-26 ("tmm önerini yapalım"; 40 / 45 from 2026-09-21 until then): at
// 50 % of its context a session hands over at the first clean break, and at 55 % it opens no more
// subagents; on his word of 2026-09-26 ("tmm önerini uygula.") a hook holds them. The hook lives
// outside the repository, in ~/.claude/hooks, and is spawned there with sample stdin: never a copy
// of its logic. Every case gets its own temporary directory
// as XDG_RUNTIME_DIR (where the status line keeps each session's context record) and as the gate's
// log directory, so nothing lands in the machine's own claude-ctx or ~/.claude/logs.
import { spawnSync } from "node:child_process";
import { accessSync, constants, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir, userInfo } from "node:os";
import { join } from "node:path";
import { afterAll, describe as vdescribe, expect, it } from "vitest";

// The battery redirects HOME (HOME=/tmp/home), but the hooks live in the real home: read the passwd
// entry, not $HOME (measured 2026-09-26 02:38: 73 failures). DXB_CLAUDE_HOME overrides explicitly.
// The full battery runs sandboxed as another user (dxbbuild) who cannot read the CEO's home: then no
// candidate is readable and every suite SKIPS with the reason in its title, instead of 73 red cases.
// Candidates: DXB_CLAUDE_HOME, the passwd home, the repo owner's home (/home/<user> prefix of cwd).
// DXB_HOOKS_FORCE_UNREADABLE=1 is test-only: it forces the no-readable-candidate path to prove the skip.
const CANDIDATES = [...new Set([process.env.DXB_CLAUDE_HOME, userInfo().homedir,
  /^\/home\/[^/]+/.exec(process.cwd())?.[0]].filter((h): h is string => !!h))];
const readable = (h: string) => ["dxb-context-gate.py", "dxb-statusline.js", "../settings.json"].every((f) => {
  try { accessSync(join(h, ".claude", "hooks", f), constants.R_OK); return true; } catch { return false; }
});
const FOUND = process.env.DXB_HOOKS_FORCE_UNREADABLE === "1" ? undefined : CANDIDATES.find(readable);
const HOOKS_REASON = FOUND ? null : `hooks unreadable as ${userInfo().username} — tried ${CANDIDATES.join(", ")}; ` +
  `the sandboxed battery cannot read the CEO's home; run "pnpm vitest run tests/hooks" as the host user`;
if (HOOKS_REASON) console.warn(`SKIPPED — ${HOOKS_REASON}`);
const describe = (title: string, fn: () => void) =>
  HOOKS_REASON ? vdescribe.skip(`[SKIPPED — ${HOOKS_REASON}] ${title}`, fn) : vdescribe(title, fn);
const CLAUDE_HOME = FOUND ?? CANDIDATES[0];
const HOOKS = join(CLAUDE_HOME, ".claude", "hooks");
const GATE = join(HOOKS, "dxb-context-gate.py");
const STATUS_LINE = join(HOOKS, "dxb-statusline.js");
const SETTINGS = join(CLAUDE_HOME, ".claude", "settings.json");
const SID = "0d08dc67-e2e0-4000-8000-000000000000";
const HOUR = 3600;

const tmp: string[] = [];
afterAll(() => { for (const d of tmp) rmSync(d, { recursive: true, force: true }); });

/** a fresh directory standing in for XDG_RUNTIME_DIR and the gate's log directory */
function box(): string {
  const dir = mkdtempSync(join(tmpdir(), "ctxbox"));
  tmp.push(dir);
  return dir;
}

const recordPath = (dir: string, sid: string) => join(dir, "claude-ctx", `${sid}.json`);

/** a context record in the shape the status line writes; `ageS` sets its mtime that many seconds back */
function record(dir: string, sid: string, used_pct: unknown, ageS?: number): void {
  const file = recordPath(dir, sid);
  const at = new Date(Date.now() - (ageS ?? 0) * 1000);
  mkdirSync(join(dir, "claude-ctx"), { recursive: true });
  writeFileSync(file, JSON.stringify({
    session_id: sid, used_pct, tokens: 1000, total_tokens: 1000000, model: "Fable 5.1", cwd: "/x", ts: at.toISOString(),
  }));
  if (ageS !== undefined) utimesSync(file, at, at);
}

/** a UserPromptSubmit input as Claude Code sends it */
const prompt = (sid: string) => ({ session_id: sid, hook_event_name: "UserPromptSubmit", prompt: "hi", cwd: "/x" });

/** a PreToolUse input as Claude Code sends it; `agent` makes it a subagent's, `id` names its instance */
function pre(sid: string, tool: string, input: Record<string, unknown>, agent?: string, id = "a0") {
  return {
    session_id: sid, hook_event_name: "PreToolUse", tool_name: tool, tool_input: input,
    effort: { level: "xhigh" }, ...(agent ? { agent_id: id, agent_type: agent } : {}),
  };
}
const SPAWN = { description: "d", prompt: "p", subagent_type: "scout" };

const LOG = (dir: string) => join(dir, "logs", "dxb-context-gate.jsonl");
const ERR = (dir: string) => join(dir, "logs", "dxb-context-gate.err");
/** the box as the gate's whole world: its record directory and its log directory */
const gateEnv = (dir: string) =>
  ({ ...process.env, XDG_RUNTIME_DIR: dir, DXB_CONTEXT_GATE_LOG_DIR: join(dir, "logs"), PYTHONDONTWRITEBYTECODE: "1" });

/** runs the real gate; exit 0, a clean stderr and no traceback in the .err log are part of every
 *  answer — no case here feeds invalid JSON on stdin, the one input that is a failure, not silence */
function gate(dir: string, input: unknown): string {
  const r = spawnSync("python3", [GATE], {
    input: typeof input === "string" ? input : JSON.stringify(input),
    encoding: "utf8",
    env: gateEnv(dir),
  });
  expect(r.status, r.stderr).toBe(0);
  expect(r.stderr).toBe("");
  expect(existsSync(ERR(dir)), existsSync(ERR(dir)) ? readFileSync(ERR(dir), "utf8") : "").toBe(false);
  return r.stdout;
}

const answer = (out: string) => JSON.parse(out).hookSpecificOutput;
const logged = (dir: string) => readFileSync(LOG(dir), "utf8").trim().split("\n").map((l) => JSON.parse(l));

/** the red line on a prompt: its event, the number and the handover */
function expectRedLine(out: string, pct: number): void {
  const a = answer(out);
  expect(a.hookEventName).toBe("UserPromptSubmit");
  expect(a.additionalContext).toContain(`CONTEXT ${pct}%`);
  expect(a.additionalContext).toContain("hand over");
}

/** a refused Agent / Task call: the number, the handover and the successor through operator */
function expectDeny(out: string, pct: number): void {
  const a = answer(out);
  expect(a.hookEventName).toBe("PreToolUse");
  expect(a.permissionDecision).toBe("deny");
  expect(a.permissionDecisionReason).toContain(`CONTEXT ${pct}%`);
  expect(a.permissionDecisionReason).toMatch(/hand ?over/);
  expect(a.permissionDecisionReason).toContain("operator");
}

describe("under 50 % the gate is silent; from 50 % every prompt carries the red line", () => {
  it("says nothing and logs nothing when the session has no record", () => {
    const dir = box();
    expect(gate(dir, prompt(SID))).toBe("");
    expect(gate(dir, pre(SID, "Agent", SPAWN))).toBe("");
    expect(existsSync(LOG(dir))).toBe(false);
    expect(existsSync(ERR(dir))).toBe(false);
  });
  it("at 49: nothing on a prompt, nothing on Agent", () => {
    const dir = box();
    record(dir, SID, 49);
    expect(gate(dir, prompt(SID))).toBe("");
    expect(gate(dir, pre(SID, "Agent", SPAWN))).toBe("");
    expect(existsSync(LOG(dir))).toBe(false);
  });
  it("at 50: the red line on a prompt, Agent still allowed, and exactly one red-line line logged", () => {
    const dir = box();
    record(dir, SID, 50);
    expectRedLine(gate(dir, prompt(SID)), 50);
    expect(gate(dir, pre(SID, "Agent", SPAWN))).toBe("");
    const lines = logged(dir);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ decision: "red-line", used_pct: 50, event: "UserPromptSubmit", tool: null, session_id: SID });
    expect(Object.keys(lines[0]).sort()).toEqual(
      ["agent_type", "decision", "event", "record_age_s", "session_id", "tool", "ts", "used_pct"]);
  });
  it("at 54: the red line on a prompt, Agent and Task still allowed", () => {
    const dir = box();
    record(dir, SID, 54);
    expectRedLine(gate(dir, prompt(SID)), 54);
    expect(gate(dir, pre(SID, "Agent", SPAWN))).toBe("");
    expect(gate(dir, pre(SID, "Task", SPAWN))).toBe("");
    expect(logged(dir).map((l) => l.decision)).toEqual(["red-line"]);
  });
});

describe("from 55 % the Agent / Task tool is refused until a handover", () => {
  it("at 55: Agent and Task denied, the prompt still carries the red line, and all three logged", () => {
    const dir = box();
    record(dir, SID, 55);
    expectDeny(gate(dir, pre(SID, "Agent", SPAWN)), 55);
    expectDeny(gate(dir, pre(SID, "Task", SPAWN)), 55);
    expectRedLine(gate(dir, prompt(SID)), 55);
    expect(logged(dir).map((l) => [l.decision, l.tool, l.used_pct])).toEqual([
      ["deny", "Agent", 55], ["deny", "Task", 55], ["red-line", null, 55],
    ]);
  });
  it("at 56 denies a subagent's Agent call and logs its agent_type", () => {
    const dir = box();
    record(dir, SID, 56);
    expectDeny(gate(dir, pre(SID, "Agent", SPAWN, "builder", "a1")), 56);
    expect(logged(dir).map((l) => [l.decision, l.agent_type])).toEqual([["deny", "builder"]]);
  });
  it("at 90 never touches another tool: Write, Edit, Bash and Read pass and nothing is logged", () => {
    const dir = box();
    record(dir, SID, 90);
    for (const [tool, input] of [
      ["Write", { file_path: "/x/a.ts", content: "x" }],
      ["Edit", { file_path: "/x/a.ts", old_string: "a", new_string: "b" }],
      ["Bash", { command: "ls" }],
      ["Read", { file_path: "/x/a.ts" }],
    ] as const) {
      expect(gate(dir, pre(SID, tool, input)), tool).toBe("");
    }
    expect(existsSync(LOG(dir))).toBe(false);
  });
  it("keeps obliging on an old record: 56 written two hours ago still denies, and the log carries its age", () => {
    const dir = box();
    record(dir, SID, 56, 2 * HOUR);
    expectDeny(gate(dir, pre(SID, "Agent", SPAWN)), 56);
    expect(logged(dir)[0].record_age_s).toBeGreaterThanOrEqual(7000);
  });
});

describe("the gate never breaks a session: what it cannot read is silent, not a failure", () => {
  it("answers an unreadable record, a used_pct that is not a number, no session_id, [] and empty stdin with nothing, and logs nothing", () => {
    const both = [prompt(SID), pre(SID, "Agent", SPAWN)];
    const { session_id: _dropped, ...noSession } = prompt(SID);
    const cases: [string, (dir: string) => unknown[]][] = [
      ["record file {", (dir) => {
        mkdirSync(join(dir, "claude-ctx"));
        writeFileSync(recordPath(dir, SID), "{");
        return both;
      }],
      ['used_pct "51"', (dir) => { record(dir, SID, "51"); return both; }],
      ["used_pct true", (dir) => { record(dir, SID, true); return both; }],
      ["used_pct absent", (dir) => { record(dir, SID, undefined); return both; }],
      ["prompt without session_id", (dir) => { record(dir, SID, 90); return [noSession]; }],
      ["stdin []", () => ["[]"]],
      ['stdin ""', () => [""]],
    ];
    for (const [name, arrange] of cases) {
      const dir = box();
      for (const input of arrange(dir)) expect(gate(dir, input), name).toBe("");
      expect(existsSync(LOG(dir)), name).toBe(false);
      expect(existsSync(ERR(dir)), name).toBe(false);
    }
  });
  it("reads no record outside claude-ctx: a session_id unlike the status line's (../trav) is silent", () => {
    const dir = box();
    record(dir, "../trav", 90);
    expect(existsSync(join(dir, "trav.json"))).toBe(true);
    expect(gate(dir, prompt("../trav"))).toBe("");
    expect(existsSync(LOG(dir))).toBe(false);
    expect(existsSync(ERR(dir))).toBe(false);
  });
  it("exits 0 with nothing on stderr when the reader of its answer is gone: a deny at 56 into a closed pipe", () => {
    const dir = box();
    record(dir, SID, 56);
    // python3 gets its stdin 0.3 s late, so `true` has closed the pipe before the answer is written;
    // the status is python3's own (PIPESTATUS), not the pipeline's
    const r = spawnSync("bash", ["-c", '{ sleep 0.3; cat; } | python3 "$1" | true; exit "${PIPESTATUS[1]}"', "bash", GATE], {
      input: JSON.stringify(pre(SID, "Agent", SPAWN)),
      encoding: "utf8",
      env: gateEnv(dir),
    });
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toBe("");
  });
});

describe("the status line and the gate read the same record", () => {
  const BAR_SID = "0d08dc67-e2e0-4000-8000-000000000001";
  /** runs the real status line with its record in `dir` and the default auto-compact reserve */
  function statusLine(dir: string, remaining_percentage: number): void {
    const env: NodeJS.ProcessEnv = { ...process.env, XDG_RUNTIME_DIR: dir };
    delete env.CLAUDE_CODE_AUTO_COMPACT_WINDOW;
    const r = spawnSync("node", [STATUS_LINE], {
      input: JSON.stringify({
        session_id: BAR_SID, model: { display_name: "Fable 5.1" }, workspace: { current_dir: "/x" },
        context_window: { remaining_percentage, total_tokens: 1000000, current_usage: { input_tokens: 1000 } },
      }),
      encoding: "utf8",
      env,
    });
    expect(r.status, r.stderr).toBe(0);
  }

  it("55 % remaining is 54 % on the bar and CONTEXT 54% on the prompt; 90 % remaining is 12 % and the gate says nothing", () => {
    const dir = box();
    statusLine(dir, 55);
    expectRedLine(gate(dir, prompt(BAR_SID)), 54);
    const low = box();
    statusLine(low, 90);
    expect(JSON.parse(readFileSync(recordPath(low, BAR_SID), "utf8")).used_pct).toBe(12);
    expect(gate(low, prompt(BAR_SID))).toBe("");
  });
});

describe("his numbers stand in one place, and the gate is wired", () => {
  type Entry = { matcher?: string; hooks: { type: string; command: string }[] };
  const runsGate = (e: Entry) => e.hooks.some((h) => h.command.endsWith("dxb-context-gate.py"));

  it("holds 50 and 55 as RED_LINE_PCT and AGENT_DENY_PCT", () => {
    const source = readFileSync(GATE, "utf8");
    expect(source).toMatch(/^RED_LINE_PCT = 50$/m);
    expect(source).toMatch(/^AGENT_DENY_PCT = 55$/m);
  });
  it("is wired in ~/.claude/settings.json on every prompt and on PreToolUse for Agent|Task", () => {
    const hooks = JSON.parse(readFileSync(SETTINGS, "utf8")).hooks as Record<string, Entry[]>;
    expect(hooks.UserPromptSubmit.some(runsGate)).toBe(true);
    expect(hooks.PreToolUse.some((e) => e.matcher === "Agent|Task" && runsGate(e))).toBe(true);
  });
});
