// THE CONTEXT GATE under vitest — the real hook and the real status line, run where they stand.
// The CEO's numbers of 2026-09-26 ("tmm önerini yapalım"; 40 / 45 from 2026-09-21 until then): from
// 50 % of its context a session hands over at the first clean break; on his word of 2026-09-26
// ("tmm önerini uygula.") a hook holds them. Since 2026-11-16 the hook only informs (his word of
// 2026-11-10: the meter shows, it does not stop): it says its line once at 50 % and once at 60 %, not on
// every prompt, and refuses no tool -- until then it refused the Agent tool from 60 %. The hook lives
// outside the repository, in ~/.claude/hooks, and is spawned there with sample stdin: never a copy
// of its logic. Every case gets its own temporary directory
// as XDG_RUNTIME_DIR (where the status line keeps each session's context record, and the gate what it
// has already said) and as the gate's
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
const OTHER = "0d08dc67-e2e0-4000-8000-000000000002";
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
/** where the gate keeps the thresholds it has already said to a session */
const saidPath = (dir: string, sid: string) => join(dir, "claude-ctx", `${sid}.gate-said`);

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

/** runs the real gate where its state file cannot be written: the failure belongs in the .err log, and exit 0
 *  and a clean stderr still hold */
function gateWithBrokenState(dir: string, input: unknown): string {
  const r = spawnSync("python3", [GATE], { input: JSON.stringify(input), encoding: "utf8", env: gateEnv(dir) });
  expect(r.status, r.stderr).toBe(0);
  expect(r.stderr).toBe("");
  return r.stdout;
}

const answer = (out: string) => JSON.parse(out).hookSpecificOutput;
const logged = (dir: string) => readFileSync(LOG(dir), "utf8").trim().split("\n").map((l) => JSON.parse(l));

/** the prompt's additionalContext, after checking the answer's event */
function said(out: string): string {
  const a = answer(out);
  expect(a.hookEventName).toBe("UserPromptSubmit");
  return a.additionalContext;
}

/** the line said once from 50 %, word for word */
const redLine = (pct: number) =>
  `🔴 CONTEXT ${pct}% — past 50 %: hand over at the first clean break (dxb-team3 §7): no battery running, tree `
  + "committed, report sent; then the handover note and the successor session through operator. The job continues "
  + "in the successor; nothing is cut. Said once; the status line keeps showing the number.";

/** the line said once from 60 %, word for word */
const finishLine = (pct: number) =>
  `🔴 CONTEXT ${pct}% — past 60 %: finish the piece in hand well and hand over at this clean break (dxb-team3 §7). `
  + "The clean break and the quality decide, not the number; you judge it. Said once.";

describe("under 50 % the gate is silent; its line is said once at 50 % and once at 60 %, not on every prompt", () => {
  it("says nothing and logs nothing when the session has no record", () => {
    const dir = box();
    expect(gate(dir, prompt(SID))).toBe("");
    expect(gate(dir, pre(SID, "Agent", SPAWN))).toBe("");
    expect(existsSync(LOG(dir))).toBe(false);
    expect(existsSync(ERR(dir))).toBe(false);
  });
  it("at 49: nothing on a prompt, nothing on Agent, nothing remembered", () => {
    const dir = box();
    record(dir, SID, 49);
    expect(gate(dir, prompt(SID))).toBe("");
    expect(gate(dir, pre(SID, "Agent", SPAWN))).toBe("");
    expect(existsSync(LOG(dir))).toBe(false);
    expect(existsSync(saidPath(dir, SID))).toBe(false);
  });
  it("at 50: the line once — the next prompt, and one at 55, carry nothing — and exactly one line logged", () => {
    const dir = box();
    record(dir, SID, 50);
    expect(said(gate(dir, prompt(SID)))).toBe(redLine(50));
    expect(gate(dir, prompt(SID))).toBe("");
    record(dir, SID, 55);
    expect(gate(dir, prompt(SID))).toBe("");
    const lines = logged(dir);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ decision: "red-line", used_pct: 50, event: "UserPromptSubmit", session_id: SID });
    expect(Object.keys(lines[0]).sort()).toEqual(["decision", "event", "record_age_s", "session_id", "ts", "used_pct"]);
  });
  it("first seen at 59: the 50 line; at 60 the 60 line, once; at 61 and at 90 nothing more", () => {
    const dir = box();
    record(dir, SID, 59);
    expect(said(gate(dir, prompt(SID)))).toBe(redLine(59));
    record(dir, SID, 60);
    expect(said(gate(dir, prompt(SID)))).toBe(finishLine(60));
    for (const pct of [60, 61, 90]) {
      record(dir, SID, pct);
      expect(gate(dir, prompt(SID)), String(pct)).toBe("");
    }
    expect(logged(dir).map((l) => [l.decision, l.used_pct])).toEqual([["red-line", 59], ["red-line", 60]]);
  });
  it("a session already past 60 the first time the gate sees it gets the 60 line only", () => {
    const dir = box();
    record(dir, SID, 72);
    expect(said(gate(dir, prompt(SID)))).toBe(finishLine(72));
    expect(gate(dir, prompt(SID))).toBe("");
    expect(logged(dir)).toHaveLength(1);
  });
  it("what one session was told does not silence another", () => {
    const dir = box();
    record(dir, SID, 50);
    record(dir, OTHER, 50);
    expect(said(gate(dir, prompt(SID)))).toBe(redLine(50));
    expect(said(gate(dir, prompt(OTHER)))).toBe(redLine(50));
  });
  it("an old record still says its line: 61 written two hours ago, and the log carries its age", () => {
    const dir = box();
    record(dir, SID, 61, 2 * HOUR);
    expect(said(gate(dir, prompt(SID)))).toBe(finishLine(61));
    expect(logged(dir)[0].record_age_s).toBeGreaterThanOrEqual(7000);
  });
});

describe("the gate refuses nothing: the meter only informs (CEO 2026-11-10)", () => {
  it("at any percentage Agent and Task pass — a subagent's too — and nothing is logged or remembered", () => {
    for (const pct of [49, 50, 59, 60, 61, 90, 100]) {
      const dir = box();
      record(dir, SID, pct);
      expect(gate(dir, pre(SID, "Agent", SPAWN)), String(pct)).toBe("");
      expect(gate(dir, pre(SID, "Task", SPAWN)), String(pct)).toBe("");
      expect(gate(dir, pre(SID, "Agent", SPAWN, "builder", "a1")), String(pct)).toBe("");
      expect(existsSync(LOG(dir)), String(pct)).toBe(false);
      expect(existsSync(saidPath(dir, SID)), String(pct)).toBe(false);
    }
  });
  it("at 90 no other tool is touched either: Write, Edit, Bash and Read pass and nothing is logged", () => {
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
    expect(existsSync(join(dir, "trav.gate-said"))).toBe(false);
  });
  it("exits 0 with nothing on stderr when the reader of its answer is gone: the line at 61 into a closed pipe — and it is not counted as said", () => {
    const dir = box();
    record(dir, SID, 61);
    // python3 gets its stdin 0.3 s late, so `true` has closed the pipe before the answer is written;
    // the status is python3's own (PIPESTATUS), not the pipeline's
    const r = spawnSync("bash", ["-c", '{ sleep 0.3; cat; } | python3 "$1" | true; exit "${PIPESTATUS[1]}"', "bash", GATE], {
      input: JSON.stringify(prompt(SID)),
      encoding: "utf8",
      env: gateEnv(dir),
    });
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toBe("");
    expect(existsSync(saidPath(dir, SID))).toBe(false);
  });
  it("a state file that cannot be understood means not said yet: the line is said, and then remembered", () => {
    for (const garbage of ["{", "", '{"50": true}', '"50"', "[true, \"50\", 7, [50]]", "\u0000\u0001"]) {
      const dir = box();
      record(dir, SID, 55);
      writeFileSync(saidPath(dir, SID), garbage);
      expect(said(gate(dir, prompt(SID))), garbage).toBe(redLine(55));
      expect(gate(dir, prompt(SID)), garbage).toBe("");
    }
  });
  it("a state file that cannot be read or written never crashes the prompt: the line is said, the failure goes to the .err log", () => {
    const dir = box();
    record(dir, SID, 55);
    mkdirSync(saidPath(dir, SID));  // a directory where the state file belongs: neither readable nor writable as one
    // nothing could be remembered, so the line is said again rather than lost
    for (let turn = 0; turn < 2; turn++) expect(said(gateWithBrokenState(dir, prompt(SID)))).toBe(redLine(55));
    expect(readFileSync(ERR(dir), "utf8")).toContain("IsADirectoryError");
  });
  it("a link planted under the state file's name is never written through: the file it points at stands, the line is said", () => {
    const dir = box();
    record(dir, SID, 55);
    const elsewhere = join(dir, "elsewhere.txt");
    writeFileSync(elsewhere, "not the gate's");
    expect(spawnSync("ln", ["-s", elsewhere, saidPath(dir, SID)]).status).toBe(0);
    expect(said(gateWithBrokenState(dir, prompt(SID)))).toBe(redLine(55));
    expect(readFileSync(elsewhere, "utf8")).toBe("not the gate's");
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
    expect(said(gate(dir, prompt(BAR_SID)))).toBe(redLine(54));
    const low = box();
    statusLine(low, 90);
    expect(JSON.parse(readFileSync(recordPath(low, BAR_SID), "utf8")).used_pct).toBe(12);
    expect(gate(low, prompt(BAR_SID))).toBe("");
  });
});

describe("his numbers stand in one place, and the gate is wired", () => {
  type Entry = { matcher?: string; hooks: { type: string; command: string }[] };
  const runsGate = (e: Entry) => e.hooks.some((h) => h.command.endsWith("dxb-context-gate.py"));

  it("holds 50 and 60 as RED_LINE_PCT and FINISH_LINE_PCT, and no number or answer that refuses a tool", () => {
    const source = readFileSync(GATE, "utf8");
    expect(source).toMatch(/^RED_LINE_PCT = 50$/m);
    expect(source).toMatch(/^FINISH_LINE_PCT = 60$/m);
    expect(source).not.toContain("AGENT_DENY_PCT");
    expect(source).not.toContain("permissionDecision");
  });
  it("is wired in ~/.claude/settings.json on every prompt, and on no tool call", () => {
    const hooks = JSON.parse(readFileSync(SETTINGS, "utf8")).hooks as Record<string, Entry[]>;
    expect(hooks.UserPromptSubmit.some(runsGate)).toBe(true);
    expect((hooks.PreToolUse ?? []).some(runsGate)).toBe(false);
  });
});

// The repository holds these hooks' source (scripts/ops/, installed by scripts/ops/install-cost-gate.sh);
// a live copy edited by hand and never brought back is how the cost gate's twin drifted (Fable's review,
// 2026-10-06). The live file and its tracked copy are one text.
describe("the live hooks equal their tracked copies in scripts/ops", () => {
  for (const [name, live] of [["dxb-context-gate.py", GATE], ["dxb-statusline.js", STATUS_LINE]] as const) {
    it(name, () => {
      const tracked = join(__dirname, "..", "..", "scripts", "ops", name);
      expect(readFileSync(live, "utf8") === readFileSync(tracked, "utf8"),
        `${live} differs from ${tracked} — bring the change into the repository and run install-cost-gate.sh`).toBe(true);
    });
  }
});
