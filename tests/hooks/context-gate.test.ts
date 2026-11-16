// THE CONTEXT GATE under vitest — the real hook and the real status line, run where they stand.
// The CEO's numbers of 2026-09-26 ("tmm önerini yapalım"; 40 / 45 from 2026-09-21 until then): from
// 50 % of its context a session hands over at the first clean break; on his word of 2026-09-26
// ("tmm önerini uygula.") a hook holds them. Since 2026-11-16 the hook only informs (his word of
// 2026-11-10: the meter shows, it does not stop): it says its line once at 50 % and once at 60 %, not on
// every prompt, and refuses no tool -- until then it refused the Agent tool from 60 %. A threshold the context
// has fallen back below (a compaction) is forgotten, so each climb says its line once; two prompts of one
// session decide one after the other, under the session's lock; the state is read only as a regular file,
// never through a link and never blocking (the blind audit of 90a0f96e, 2026-11-16). The hook lives
// outside the repository, in ~/.claude/hooks, and is spawned there with sample stdin: never a copy
// of its logic. Every case gets its own temporary directory
// as XDG_RUNTIME_DIR (where the status line keeps each session's context record, and the gate what it
// has already said) and as the gate's
// log directory, so nothing lands in the machine's own claude-ctx or ~/.claude/logs.
import { spawn, spawnSync } from "node:child_process";
import {
  accessSync, constants, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, utimesSync, writeFileSync,
} from "node:fs";
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
/** the thresholds the gate remembers having said to a session */
const remembered = (dir: string, sid: string): unknown => JSON.parse(readFileSync(saidPath(dir, sid), "utf8"));
/** the file two prompts of one session take turns on */
const lockPath = (dir: string, sid: string) => join(dir, "claude-ctx", `${sid}.gate-lock`);

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

/** a gate that blocks (a FIFO opened for reading, a lock waited on without an end) fails its case instead of
 *  hanging the suite: every spawn here carries this limit */
const LIMIT_MS = 10_000;

/** runs the real gate; exit 0, a clean stderr and no traceback in the .err log are part of every
 *  answer — no case here feeds invalid JSON on stdin, the one input that is a failure, not silence */
function gate(dir: string, input: unknown): string {
  const r = spawnSync("python3", [GATE], {
    input: typeof input === "string" ? input : JSON.stringify(input),
    encoding: "utf8",
    env: gateEnv(dir),
    timeout: LIMIT_MS,
  });
  expect(r.error, "the gate did not finish in time").toBeUndefined();
  expect(r.status, r.stderr).toBe(0);
  expect(r.stderr).toBe("");
  expect(existsSync(ERR(dir)), existsSync(ERR(dir)) ? readFileSync(ERR(dir), "utf8") : "").toBe(false);
  return r.stdout;
}

/** runs the real gate where its state file cannot be written: the failure belongs in the .err log, and exit 0
 *  and a clean stderr still hold */
function gateWithBrokenState(dir: string, input: unknown): string {
  const r = spawnSync("python3", [GATE], { input: JSON.stringify(input), encoding: "utf8", env: gateEnv(dir), timeout: LIMIT_MS });
  expect(r.error, "the gate did not finish in time").toBeUndefined();
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
  + "in the successor; nothing is cut. Said once; `dxb-ctx --pct` prints the number.";

/** the line said once from 60 %, word for word */
const finishLine = (pct: number) =>
  `🔴 CONTEXT ${pct}% — past 60 %: finish the piece in hand well and hand over at this clean break (dxb-team3 §7). `
  + "The clean break and the quality decide, not the number; you judge it. Said once.";

/** takes the session's lock as a prompt of it still deciding would, and holds it until the returned function is
 *  called; the holder ends by itself after the limit, so a failing case leaves no process behind */
async function holdLock(dir: string, sid: string): Promise<() => Promise<void>> {
  const code = "import fcntl, os, sys\n"
    + "fd = os.open(sys.argv[1], os.O_RDWR | os.O_CREAT, 0o600)\n"
    + "fcntl.flock(fd, fcntl.LOCK_EX)\n"
    + "print('held', flush=True)\n"
    + "sys.stdin.read()\n";
  const holder = spawn("python3", ["-c", code, lockPath(dir, sid)], { stdio: ["pipe", "pipe", "inherit"], timeout: 3 * LIMIT_MS });
  const gone = new Promise<void>((done) => { holder.on("close", () => done()); });
  await new Promise<void>((held, failed) => {
    holder.stdout.once("data", () => held());
    holder.once("close", () => failed(new Error("the lock's holder ended before it held the lock")));
  });
  return async () => { holder.stdin.end(); await gone; };
}

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
    // a session that never reached a threshold leaves nothing beside its record, a lock neither
    expect(readdirSync(join(dir, "claude-ctx"))).toEqual([`${SID}.json`]);
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
  it("what it leaves beside the record is its state and its lock: the state whole, no temporary file", () => {
    const dir = box();
    record(dir, SID, 50);
    gate(dir, prompt(SID));
    expect(readdirSync(join(dir, "claude-ctx")).sort()).toEqual([`${SID}.gate-lock`, `${SID}.gate-said`, `${SID}.json`]);
    expect(readFileSync(saidPath(dir, SID), "utf8")).toBe("[50]");
  });
});

// The second auditor's finding, 2026-11-16: the state was never cleared, so after /compact or an automatic
// compaction the number fell, climbed again, and nothing was said the second time.
describe("a threshold the context has fallen back below is forgotten: each climb says its line once", () => {
  it("told at 72, down to 55: nothing is said and only 50 is remembered; up to 61 again: the 60 line again", () => {
    const dir = box();
    record(dir, SID, 72);
    expect(said(gate(dir, prompt(SID)))).toBe(finishLine(72));
    expect(remembered(dir, SID)).toEqual([50, 60]);
    record(dir, SID, 55);
    expect(gate(dir, prompt(SID))).toBe("");
    expect(remembered(dir, SID)).toEqual([50]);
    record(dir, SID, 61);
    expect(said(gate(dir, prompt(SID)))).toBe(finishLine(61));
    expect(gate(dir, prompt(SID))).toBe("");
  });
  it("told both, down to 45: the state is empty again; the next climb says the 50 line, then the 60 line", () => {
    const dir = box();
    record(dir, SID, 45);
    writeFileSync(saidPath(dir, SID), "[50, 60]");
    expect(gate(dir, prompt(SID))).toBe("");
    expect(remembered(dir, SID)).toEqual([]);
    record(dir, SID, 55);
    expect(said(gate(dir, prompt(SID)))).toBe(redLine(55));
    expect(gate(dir, prompt(SID))).toBe("");
    record(dir, SID, 61);
    expect(said(gate(dir, prompt(SID)))).toBe(finishLine(61));
    expect(logged(dir).map((l) => l.used_pct)).toEqual([55, 61]);
  });
});

// Sol's finding B, 2026-11-16: read, say and write were not ordered between two prompts of one session — a
// prompt at 55 and one at 61 overlapping could leave [50], and the 60 line was said again.
describe("two prompts of one session decide one after the other", () => {
  it("while a prompt at 55 still holds the session's lock, one at 61 says nothing, returns in time and loses nothing; after it both thresholds are recorded", async () => {
    const dir = box();
    record(dir, SID, 55);
    expect(said(gate(dir, prompt(SID)))).toBe(redLine(55));
    const release = await holdLock(dir, SID);
    let waitedMs = 0;
    try {
      record(dir, SID, 61);
      const started = Date.now();
      expect(gate(dir, prompt(SID))).toBe("");
      waitedMs = Date.now() - started;
      expect(remembered(dir, SID)).toEqual([50]);
    } finally {
      await release();
    }
    // a short, bounded wait for the lock — far from the limit that would fail the spawn
    expect(waitedMs).toBeLessThan(3000);
    expect(said(gate(dir, prompt(SID)))).toBe(finishLine(61));
    expect(remembered(dir, SID)).toEqual([50, 60]);
    expect(gate(dir, prompt(SID))).toBe("");
    expect(logged(dir).map((l) => l.used_pct)).toEqual([55, 61]);
  });
  it("another session's lock does not hold this one back", async () => {
    const dir = box();
    record(dir, SID, 55);
    const release = await holdLock(dir, OTHER);
    try {
      expect(said(gate(dir, prompt(SID)))).toBe(redLine(55));
    } finally {
      await release();
    }
  });
  it("a lock that cannot be taken at all — a directory or a FIFO under its name — costs the order, never the line: said, remembered, the failure in the .err log", () => {
    for (const [what, plant] of [
      ["a directory", (file: string) => mkdirSync(file)],
      ["a FIFO", (file: string) => expect(spawnSync("mkfifo", [file], { timeout: LIMIT_MS }).status).toBe(0)],
    ] as const) {
      const dir = box();
      record(dir, SID, 55);
      plant(lockPath(dir, SID));
      expect(said(gateWithBrokenState(dir, prompt(SID))), what).toBe(redLine(55));
      expect(readFileSync(ERR(dir), "utf8"), what).toContain("Error");
      expect(gateWithBrokenState(dir, prompt(SID)), what).toBe("");
    }
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
      timeout: LIMIT_MS,
    });
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toBe("");
    expect(existsSync(saidPath(dir, SID))).toBe(false);
  });
  it("a state file that cannot be understood means not said yet: the line is said, and then remembered", () => {
    // the whole list counts or none of it: a known threshold beside anything else is not a record (Sol's B), and
    // neither is a list longer than the gate ever writes
    for (const garbage of ["{", "", '{"50": true}', '"50"', "[true, \"50\", 7, [50]]", "\u0000\u0001",
      '[50, "garbage"]', "[50, 70]", "[50.0]", `[50${" ".repeat(300)}]`]) {
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
    expect(spawnSync("ln", ["-s", elsewhere, saidPath(dir, SID)], { timeout: LIMIT_MS }).status).toBe(0);
    expect(said(gateWithBrokenState(dir, prompt(SID)))).toBe(redLine(55));
    expect(readFileSync(elsewhere, "utf8")).toBe("not the gate's");
  });
  it("a link under the state file's name is not read through either: a list the gate would trust, behind a link, is not a record", () => {
    const dir = box();
    record(dir, SID, 55);
    const elsewhere = join(dir, "elsewhere.json");
    writeFileSync(elsewhere, "[50, 60]");
    expect(spawnSync("ln", ["-s", elsewhere, saidPath(dir, SID)], { timeout: LIMIT_MS }).status).toBe(0);
    expect(said(gate(dir, prompt(SID)))).toBe(redLine(55));
    expect(readFileSync(elsewhere, "utf8")).toBe("[50, 60]");
  });
  it("a FIFO planted under the state file's name does not block the prompt: the line is said in the gate's normal time, and the state takes its place (Sol's A)", () => {
    const dir = box();
    record(dir, SID, 55);
    expect(spawnSync("mkfifo", [saidPath(dir, SID)], { timeout: LIMIT_MS }).status).toBe(0);
    expect(said(gate(dir, prompt(SID)))).toBe(redLine(55));
    expect(statSync(saidPath(dir, SID)).isFile()).toBe(true);
    expect(gate(dir, prompt(SID))).toBe("");
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
      timeout: LIMIT_MS,
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
