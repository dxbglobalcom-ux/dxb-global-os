// THE EFFORT WARNING — the real hook, run where it stands in the repository.
// The CEO's order of 2026-10-06: he opens a session at effort high and switches it himself with
// /effort. While the talk is plan, design or architecture, every reply warns him to switch to max until
// he has; once the plan is approved and the build starts, every reply warns him to switch to high until
// he has. The lead sets the mode from Bash (`dxb-effort-warn.py plan|build|off`); the hook carries the
// warning into each of his messages until the session's live level matches it. The live level is the
// newest of the status line's record, the transcript's last assistant step and the transcript's last
// /effort row (`Set effort level to …`). Plan permission mode counts as plan mode; with no mode, a
// message naming a plan, a design or an architecture reminds the lead, and a session not at high reminds
// the lead before code (Fable's review, 2026-10-06). Every case gets its own temporary directory as
// XDG_RUNTIME_DIR (and as HOME for the CLI) and its own transcript, so nothing lands in the machine's
// own folders.
import { spawnSync } from "node:child_process";
import {
  chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, accessSync, constants,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const ROOT = resolve(__dirname, "../..");
const HOOK = join(ROOT, ".claude", "hooks", "dxb-effort-warn.py");
const SETTINGS = join(ROOT, ".claude", "settings.json");
const SID = "7c3e9a10-6f2b-4000-8000-000000000000";
const OTHER = "7c3e9a10-6f2b-4000-8000-000000000001";
const MAX_LINE = "⚠ Muhittin Bey, plan konuşmasındayız — /effort max'a geçin.";
const HIGH_LINE = "⚠ Muhittin Bey, plan bitti — koda geçmeden /effort high'a geçin.";
const CODE_LINE = "⚠ Muhittin Bey, koda geçmeden /effort high'a geçin.";

const tmp: string[] = [];
afterAll(() => { for (const d of tmp) rmSync(d, { recursive: true, force: true }); });

/** a fresh directory standing in for XDG_RUNTIME_DIR, with room for the case's transcript */
function box(): string {
  const dir = mkdtempSync(join(tmpdir(), "effortwarn"));
  tmp.push(dir);
  return dir;
}

const MODES = (dir: string) => join(dir, "dxb-effort");
const modeFile = (dir: string, sid: string) => join(MODES(dir), sid);
const env = (dir: string, sid?: string) => {
  const e: NodeJS.ProcessEnv = { ...process.env, XDG_RUNTIME_DIR: dir, PYTHONDONTWRITEBYTECODE: "1" };
  delete e.CLAUDE_CODE_SESSION_ID;
  if (sid !== undefined) e.CLAUDE_CODE_SESSION_ID = sid;
  return e;
};

const at = (secondsAgo: number) => new Date(Date.now() - secondsAgo * 1000).toISOString();

/** a transcript whose assistant steps carry the given levels, oldest first; `pad` puts that many bytes before them;
 * a step's third element is its sessionId (SID when absent, no sessionId field when null); a level written
 * "/effort max" is the row a /effort switch writes (measured in this repository's transcripts, 2026-10-06) */
function transcript(dir: string, steps: [string, number, (string | null)?][], pad = 0, file = join(dir, "transcript.jsonl")): string {
  const rows: string[] = [];
  if (pad) rows.push(JSON.stringify({ type: "user", message: { content: "x".repeat(pad) } }));
  for (const [effort, ago, sid = SID] of steps) {
    if (effort.startsWith("/effort ")) {
      const switched: Record<string, unknown> = {
        type: "user", timestamp: at(ago), message: { role: "user",
          content: `<local-command-stdout>Set effort level to ${effort.slice(8)} (this session only): Maximum capability</local-command-stdout>` },
      };
      if (sid !== null) switched.sessionId = sid;
      rows.push(JSON.stringify(switched));
      continue;
    }
    rows.push(JSON.stringify({ type: "user", timestamp: at(ago + 1), message: { content: "hi" } }));
    const step: Record<string, unknown> = { type: "assistant", timestamp: at(ago), effort, message: { content: [] } };
    if (sid !== null) step.sessionId = sid;
    rows.push(JSON.stringify(step));
  }
  writeFileSync(file, rows.map((r) => r + "\n").join(""));
  return file;
}

/** a status line record in the shape persist() writes */
function record(dir: string, sid: string, effort: string, secondsAgo: number, sessionField = sid): void {
  mkdirSync(join(dir, "claude-ctx"), { recursive: true });
  writeFileSync(join(dir, "claude-ctx", `${sid}.json`), JSON.stringify({
    session_id: sessionField, used_pct: 10, tokens: 1000, total_tokens: 1000000, model: "Opus 5.5", cwd: "/x",
    ts: at(secondsAgo), effort,
  }));
}

/** a UserPromptSubmit input as Claude Code sends it (no effort field — measured 2026-10-06) */
const prompt = (sid: string, transcriptPath: string, text = "devam", permissionMode = "default") => ({
  session_id: sid, transcript_path: transcriptPath, cwd: ROOT, prompt_id: "a1b2c3d4-0000-4000-8000-000000000000",
  permission_mode: permissionMode, hook_event_name: "UserPromptSubmit", prompt: text,
});

/** a hook that blocks (a FIFO opened for reading) fails the case instead of hanging the suite */
const LIMIT_MS = 10_000;

/** runs the real hook on stdin; exit 0 and a clean stderr are part of every answer */
function hook(dir: string, input: unknown): string {
  const r = spawnSync("python3", [HOOK], {
    input: typeof input === "string" ? input : JSON.stringify(input), encoding: "utf8", env: env(dir), timeout: LIMIT_MS,
  });
  expect(r.error, "the hook did not finish in time").toBeUndefined();
  expect(r.status, r.stderr).toBe(0);
  expect(r.stderr).toBe("");
  return r.stdout;
}

/** the hook's additionalContext, after checking the output's shape */
function warning(out: string): string {
  const parsed = JSON.parse(out).hookSpecificOutput;
  expect(parsed.hookEventName).toBe("UserPromptSubmit");
  return parsed.additionalContext;
}

/** runs the CLI as the lead runs it from Bash, with the session id in its env */
function cli(dir: string, arg: string | string[], sid?: string) {
  const r = spawnSync("python3", [HOOK, ...(Array.isArray(arg) ? arg : [arg])],
    { encoding: "utf8", env: { ...env(dir, sid), HOME: dir }, timeout: LIMIT_MS });
  expect(r.error, "the CLI did not finish in time").toBeUndefined();
  return r;
}

function setMode(dir: string, mode: string, sid = SID) {
  const r = cli(dir, mode, sid);
  expect(r.status, r.stderr).toBe(0);
  return r;
}

describe("no mode: the hook says nothing", () => {
  it("a session with no mode at high is silent", () => {
    const dir = box();
    expect(hook(dir, prompt(SID, transcript(dir, [["high", 5]])))).toBe("");
  });
  it("a session with no mode and no known level is silent", () => {
    const dir = box();
    expect(hook(dir, prompt(SID, join(dir, "missing.jsonl")))).toBe("");
  });
  it("another session's mode does not reach this session", () => {
    const dir = box();
    setMode(dir, "plan", OTHER);
    expect(hook(dir, prompt(SID, transcript(dir, [["high", 5]])))).toBe("");
  });
});

describe("plan mode warns to switch to max until the live level is max", () => {
  it("the CLI answers one line and writes the mode file 0600 in a 0700 folder", () => {
    const dir = box();
    const r = setMode(dir, "plan");
    expect(r.stdout.split("\n")[0]).toBe("effort mode: plan — the CEO is warned to switch to max until he does");
    expect(readdirSync(MODES(dir))).toEqual([SID]);
    expect(readFileSync(modeFile(dir, SID), "utf8")).toBe("plan");
    expect((spawnSync("stat", ["-c", "%a", MODES(dir)], { encoding: "utf8" }).stdout).trim()).toBe("700");
  });
  it("last step at high: the max line, the level named, no file until he switches, the build command", () => {
    const dir = box();
    setMode(dir, "plan");
    const text = warning(hook(dir, prompt(SID, transcript(dir, [["max", 60], ["high", 5]]))));
    expect(text).toContain(MAX_LINE);
    expect(text).toContain("PLAN mode");
    expect(text).toContain("dxb-team2");
    expect(text).toContain("runs at high");
    expect(text).toContain("write no file");
    expect(text).toContain(`python3 "${HOOK}" build`);
  });
  it("last step at high but a NEWER status line record at max: silent (he has switched)", () => {
    const dir = box();
    setMode(dir, "plan");
    record(dir, SID, "max", 1);
    expect(hook(dir, prompt(SID, transcript(dir, [["high", 30]])))).toBe("");
  });
  it("an OLDER record at max but a newer step at high: the max line", () => {
    const dir = box();
    setMode(dir, "plan");
    record(dir, SID, "max", 60);
    const text = warning(hook(dir, prompt(SID, transcript(dir, [["high", 5]]))));
    expect(text).toContain(MAX_LINE);
    expect(text).toContain("runs at high");
  });
  it("last step at max and no record: silent", () => {
    const dir = box();
    setMode(dir, "plan");
    expect(hook(dir, prompt(SID, transcript(dir, [["high", 60], ["max", 5]])))).toBe("");
  });
  it("nothing known (no record, no transcript): the max line naming an unknown level", () => {
    const dir = box();
    setMode(dir, "plan");
    const text = warning(hook(dir, prompt(SID, join(dir, "missing.jsonl"))));
    expect(text).toContain(MAX_LINE);
    expect(text).toContain("an unknown level");
  });
  it("a record whose session_id field differs is ignored", () => {
    const dir = box();
    setMode(dir, "plan");
    record(dir, SID, "max", 1, OTHER);
    const text = warning(hook(dir, prompt(SID, transcript(dir, [["high", 30]]))));
    expect(text).toContain(MAX_LINE);
  });
  it("only the transcript's tail is read, and its cut first line is tolerated", () => {
    const dir = box();
    setMode(dir, "plan");
    expect(hook(dir, prompt(SID, transcript(dir, [["high", 5]], 300 * 1024)))).toContain("runs at high");
  });
});

describe("only this session's steps in the transcript count (Sol A2)", () => {
  it("own step at high and a NEWER step of another session at max: the max line still appears", () => {
    const dir = box();
    setMode(dir, "plan");
    const text = warning(hook(dir, prompt(SID, transcript(dir, [["high", 30], ["max", 5, OTHER]]))));
    expect(text).toContain(MAX_LINE);
    expect(text).toContain("runs at high");
  });
  it("own step at max and a NEWER step of another session at high: silent", () => {
    const dir = box();
    setMode(dir, "plan");
    expect(hook(dir, prompt(SID, transcript(dir, [["max", 30], ["high", 5, OTHER]])))).toBe("");
  });
  it("a step with no sessionId does not count", () => {
    const dir = box();
    setMode(dir, "plan");
    const text = warning(hook(dir, prompt(SID, transcript(dir, [["max", 5, null]]))));
    expect(text).toContain("an unknown level");
  });
});

// /proc/self/attr/exec opens as a regular file whose read raises EINVAL (measured on this machine, 2026-10-06)
const RAISING = "/proc/self/attr/exec";

describe("a source that cannot be read leaves the other one in use (Sol A3)", () => {
  it("the precondition: reading the raising path really raises", () => {
    const r = spawnSync("python3", ["-c",
      `import os\nfd = os.open(${JSON.stringify(RAISING)}, os.O_RDONLY | os.O_NONBLOCK)\ntry:\n    os.read(fd, 1)\nexcept OSError as e:\n    print(type(e).__name__)`,
    ], { encoding: "utf8" });
    expect(r.stdout.trim()).toBe("OSError");
  });
  it("a transcript whose read raises and a record at high in plan mode: the max line naming high", () => {
    const dir = box();
    setMode(dir, "plan");
    record(dir, SID, "high", 1);
    const text = warning(hook(dir, prompt(SID, RAISING)));
    expect(text).toContain(MAX_LINE);
    expect(text).toContain("runs at high");
  });
  it("a transcript whose read raises and no record: the max line naming an unknown level", () => {
    const dir = box();
    setMode(dir, "plan");
    const text = warning(hook(dir, prompt(SID, RAISING)));
    expect(text).toContain("an unknown level");
  });
});

/** runs the hook's own functions in-process with os.read counted; the first read of a growPath appends `grow` bytes to it */
describe("every read is bounded (Sol B4)", () => {
  const run = (dir: string, call: string, grow = 0, growPath?: string) => {
    const code = [
      "import importlib.util, json, os, sys",
      `spec = importlib.util.spec_from_file_location("ew", ${JSON.stringify(HOOK)})`,
      "ew = importlib.util.module_from_spec(spec); spec.loader.exec_module(ew)",
      "real = os.read; total = [0]; grown = [False]",
      "def counted(fd, n):",
      "    chunk = real(fd, n); total[0] += len(chunk)",
      "    if len(sys.argv) > 1 and not grown[0]:",
      "        grown[0] = True",
      `        with open(sys.argv[1], 'ab') as f: f.write(b'x' * ${grow})`,
      "    return chunk",
      "os.read = counted",
      `answer = ${call}`,
      "print(json.dumps({'read': total[0], 'answer': repr(answer)}))",
    ].join("\n");
    const r = spawnSync("python3", ["-c", code, ...(growPath ? [growPath] : [])], { encoding: "utf8", env: env(dir), timeout: LIMIT_MS });
    expect(r.status, r.stderr).toBe(0);
    return JSON.parse(r.stdout) as { read: number; answer: string };
  };
  it("a transcript that grows while it is read is read no further than TAIL_BYTES (256 KB)", () => {
    const dir = box();
    const file = transcript(dir, [["high", 5]], 300 * 1024);
    const r = run(dir, `ew.live_level(${JSON.stringify(SID)}, ${JSON.stringify(file)})`, 512 * 1024, file);
    expect(r.read).toBeLessThanOrEqual(256 * 1024);
  });
  it("a mode file of 64 KB is read no further than 4 KB", () => {
    const dir = box();
    setMode(dir, "plan");
    writeFileSync(modeFile(dir, SID), "plan" + " ".repeat(64 * 1024));
    const r = run(dir, `ew.read_mode(${JSON.stringify(SID)})`);
    expect(r.read).toBeLessThanOrEqual(4 * 1024);
  });
  it("a status line record of 64 KB is read no further than 4 KB", () => {
    const dir = box();
    mkdirSync(join(dir, "claude-ctx"), { recursive: true });
    writeFileSync(join(dir, "claude-ctx", `${SID}.json`), JSON.stringify({ session_id: SID, effort: "max", ts: at(1), pad: "x".repeat(64 * 1024) }));
    const r = run(dir, `ew.record_level(${JSON.stringify(SID)})`);
    expect(r.read).toBeLessThanOrEqual(4 * 1024);
  });
});

const STATUS_LINE = join(homedir(), ".claude", "hooks", "dxb-statusline.js");
// The status line lives in the CEO's home; the sandboxed half of the battery cannot read it, so
// these cases SKIP there with their reason, as context-gate.test.ts does (they run on the host).
const STATUS_LINE_READABLE = (() => { try { accessSync(STATUS_LINE, constants.R_OK); return true; } catch { return false; } })();
const describeStatusLine = STATUS_LINE_READABLE ? describe
  : (title: string, fn: () => void) => describe.skip(`[SKIPPED — ${STATUS_LINE} unreadable here; run tests/hooks as the host user] ${title}`, fn);

describeStatusLine("the status line records /effort even when the payload has no context meter (Sol A4)", () => {
  const render = (dir: string, payload: Record<string, unknown>) => {
    const e: NodeJS.ProcessEnv = { ...process.env, XDG_RUNTIME_DIR: dir };
    delete e.CLAUDE_CODE_AUTO_COMPACT_WINDOW;
    const r = spawnSync("node", [STATUS_LINE], {
      input: JSON.stringify({ session_id: SID, model: { display_name: "Opus 5.5" }, workspace: { current_dir: "/x" }, ...payload }),
      encoding: "utf8", env: e, timeout: LIMIT_MS,
    });
    expect(r.status, r.stderr).toBe(0);
  };
  const saved = (dir: string) => JSON.parse(readFileSync(join(dir, "claude-ctx", `${SID}.json`), "utf8"));
  const meter = { context_window: { remaining_percentage: 90, total_tokens: 1000000, current_usage: { input_tokens: 1000 } } };
  it("a meter-less payload with no earlier reading writes no record — dxb-ctx never sees a null used_pct", () => {
    const dir = box();
    render(dir, { effort: { level: "max" } });
    expect(existsSync(join(dir, "claude-ctx", `${SID}.json`))).toBe(false);
  });
  it("a meter at high, then a meter-less max: the record says max and keeps the meter's last used_pct", () => {
    const dir = box();
    render(dir, { ...meter, effort: { level: "high" } });
    expect(saved(dir)).toMatchObject({ effort: "high", used_pct: 12 });
    render(dir, { effort: { level: "max" } });
    expect(saved(dir)).toMatchObject({ effort: "max", used_pct: 12 });
  });
  for (const raw of ["null", "[1,2]", "7", "\"text\""]) {
    it(`a ${raw} payload still draws the bar (the model's fallback name) and exits 0`, () => {
      const dir = box();
      const r = spawnSync("node", [STATUS_LINE], { input: raw, encoding: "utf8", env: { ...process.env, XDG_RUNTIME_DIR: dir }, timeout: LIMIT_MS });
      expect(r.status, r.stderr).toBe(0);
      expect(r.stdout).toContain("Claude");
    });
  }
  it("the hook reads that record: plan mode, a meter-less max render and an older step at high is silent", () => {
    const dir = box();
    setMode(dir, "plan");
    render(dir, { ...meter, effort: { level: "high" } });
    render(dir, { effort: { level: "max" } });
    expect(hook(dir, prompt(SID, transcript(dir, [["high", 30]])))).toBe("");
  });
});

describe("build mode warns to switch to high until the live level is high", () => {
  it("the CLI answers one line", () => {
    const r = setMode(box(), "build");
    expect(r.stdout.split("\n")[0]).toBe("effort mode: build — the CEO is warned to switch to high until he does");
  });
  it("at max: the high line, no code until he switches, the off command", () => {
    const dir = box();
    setMode(dir, "plan");
    setMode(dir, "build");
    const text = warning(hook(dir, prompt(SID, transcript(dir, [["max", 5]]))));
    expect(text).toContain(HIGH_LINE);
    expect(text).toContain("BUILD mode");
    expect(text).toContain("runs at max");
    expect(text).toContain("write no code");
    expect(text).toContain(`python3 "${HOOK}" off`);
    expect(text).not.toContain(MAX_LINE);
  });
  it("at high: silent", () => {
    const dir = box();
    setMode(dir, "build");
    expect(hook(dir, prompt(SID, transcript(dir, [["high", 5]])))).toBe("");
  });
  it("a newer record at high beats an older step at max: silent", () => {
    const dir = box();
    setMode(dir, "build");
    record(dir, SID, "high", 1);
    expect(hook(dir, prompt(SID, transcript(dir, [["max", 30]])))).toBe("");
  });
});

describe("off removes the mode", () => {
  it("off removes this session's mode only, and the next prompt is silent", () => {
    const dir = box();
    setMode(dir, "plan");
    setMode(dir, "plan", OTHER);
    const r = setMode(dir, "off");
    expect(r.stdout).toContain("effort mode: off");
    expect(existsSync(modeFile(dir, SID))).toBe(false);
    expect(existsSync(modeFile(dir, OTHER))).toBe(true);
    expect(hook(dir, prompt(SID, transcript(dir, [["high", 5]])))).toBe("");
  });
  it("off with no mode set is not an error", () => {
    expect(setMode(box(), "off").status).toBe(0);
  });
});

describe("only a trusted folder and a regular file count as a mode", () => {
  it("a link at the mode file is no mode", () => {
    const dir = box();
    mkdirSync(MODES(dir), { mode: 0o700 });
    writeFileSync(join(dir, "elsewhere"), "plan");
    symlinkSync(join(dir, "elsewhere"), modeFile(dir, SID));
    expect(hook(dir, prompt(SID, transcript(dir, [["high", 5]])))).toBe("");
  });
  it("a FIFO at the mode file is no mode, and does not block the hook", () => {
    const dir = box();
    mkdirSync(MODES(dir), { mode: 0o700 });
    expect(spawnSync("mkfifo", [modeFile(dir, SID)]).status).toBe(0);
    expect(hook(dir, prompt(SID, transcript(dir, [["high", 5]])))).toBe("");
  });
  it("a mode folder that is a link is no mode", () => {
    const dir = box();
    const real = join(dir, "real");
    mkdirSync(real, { mode: 0o700 });
    writeFileSync(join(real, SID), "plan");
    symlinkSync(real, MODES(dir));
    expect(hook(dir, prompt(SID, transcript(dir, [["high", 5]])))).toBe("");
  });
  it("a group-writable mode folder is no mode", () => {
    const dir = box();
    setMode(dir, "plan");
    chmodSync(MODES(dir), 0o770);
    expect(hook(dir, prompt(SID, transcript(dir, [["high", 5]])))).toBe("");
  });
  it("the CLI writes through a link at the mode file by replacing it, never through it", () => {
    const dir = box();
    mkdirSync(MODES(dir), { mode: 0o700 });
    const target = join(dir, "target");
    writeFileSync(target, "untouched");
    symlinkSync(target, modeFile(dir, SID));
    setMode(dir, "plan");
    expect(readFileSync(target, "utf8")).toBe("untouched");
    expect(readFileSync(modeFile(dir, SID), "utf8")).toBe("plan");
  });
});

describe("a session id shaped like a path names nothing", () => {
  it("the CLI refuses it with exit 2 and writes nothing", () => {
    const dir = box();
    const r = cli(dir, "plan", "../../escape");
    expect(r.status).toBe(2);
    expect(r.stderr).not.toBe("");
    expect(readdirSync(dir)).toEqual([]);
  });
  it("the hook is silent for it, even with a file standing where the path points", () => {
    const dir = box();
    writeFileSync(join(dir, "escape"), "plan");
    expect(hook(dir, prompt("../escape", transcript(dir, [["high", 5]])))).toBe("");
  });
});

describe("as a hook it never fails a session", () => {
  it("garbage stdin: exit 0, nothing on stdout or stderr", () => {
    expect(hook(box(), "{not json")).toBe("");
  });
  it("empty stdin: exit 0, nothing on stdout or stderr", () => {
    expect(hook(box(), "")).toBe("");
  });
  it("a non-object JSON: exit 0, silent", () => {
    expect(hook(box(), "[1,2]")).toBe("");
  });
});

describe("the CLI", () => {
  it("without CLAUDE_CODE_SESSION_ID exits 2 with a reason", () => {
    const r = cli(box(), "plan");
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("CLAUDE_CODE_SESSION_ID");
  });
});

describe("settings.json registers the hook", () => {
  it("as the first command of UserPromptSubmit, before no-laziness.sh", () => {
    const settings = JSON.parse(readFileSync(SETTINGS, "utf8"));
    const group = settings.hooks.UserPromptSubmit[0].hooks;
    expect(group[0]).toEqual({ type: "command", command: 'python3 "$CLAUDE_PROJECT_DIR/.claude/hooks/dxb-effort-warn.py"' });
    expect(group[1].command).toContain("no-laziness.sh");
  });
});

describe("a /effort switch is read from its transcript row (Fable A2)", () => {
  it("plan mode, a step at high, then a NEWER /effort max row: silent — he has switched, before any reply", () => {
    const dir = box();
    setMode(dir, "plan");
    expect(hook(dir, prompt(SID, transcript(dir, [["high", 30], ["/effort max", 5]])))).toBe("");
  });
  it("build mode, a step at max, then a NEWER /effort high row and an OLDER record at max: silent", () => {
    const dir = box();
    setMode(dir, "build");
    record(dir, SID, "max", 20);
    expect(hook(dir, prompt(SID, transcript(dir, [["max", 30], ["/effort high", 5]])))).toBe("");
  });
  it("an OLDER /effort max row and a newer step at high: the max line naming high", () => {
    const dir = box();
    setMode(dir, "plan");
    const text = warning(hook(dir, prompt(SID, transcript(dir, [["/effort max", 30], ["high", 5]]))));
    expect(text).toContain(MAX_LINE);
    expect(text).toContain("runs at high");
  });
  it("another session's /effort row does not count", () => {
    const dir = box();
    setMode(dir, "plan");
    const text = warning(hook(dir, prompt(SID, transcript(dir, [["high", 30], ["/effort max", 5, OTHER]]))));
    expect(text).toContain("runs at high");
  });
});

describe("plan permission mode starts the plan warning by itself (Fable A3)", () => {
  it("no mode set, permission mode plan, at high: the max line", () => {
    const dir = box();
    const text = warning(hook(dir, prompt(SID, transcript(dir, [["high", 5]]), "devam", "plan")));
    expect(text).toContain(MAX_LINE);
    expect(text).toContain("runs at high");
  });
  it("no mode set, permission mode plan, at max: silent", () => {
    const dir = box();
    expect(hook(dir, prompt(SID, transcript(dir, [["max", 5]]), "devam", "plan"))).toBe("");
  });
  it("build mode set wins over permission mode plan: the high line at max", () => {
    const dir = box();
    setMode(dir, "build");
    expect(warning(hook(dir, prompt(SID, transcript(dir, [["max", 5]]), "devam", "plan")))).toContain(HIGH_LINE);
  });
});

describe("with no mode, his words naming a plan, a design or an architecture remind the lead (Fable A3)", () => {
  for (const text of ["bunun planını yapalım", "Mimarisini konuşalım", "şu ekranın tasarımı nasıl olsun", "let's design it"]) {
    it(`"${text}": the lead is told to run plan — no line for the CEO is ordered`, () => {
      const dir = box();
      const out = warning(hook(dir, prompt(SID, transcript(dir, [["high", 5]]), text)));
      expect(out).toContain(`python3 "${HOOK}" plan`);
      expect(out).not.toContain(MAX_LINE);
    });
  }
  it("a subagent's report arriving through the prompt is not his message: silent, even at max", () => {
    const dir = box();
    const report = "<task-notification><result>the generator's design and the plan</result></task-notification>";
    expect(hook(dir, prompt(SID, transcript(dir, [["max", 5]]), report))).toBe("");
  });
  it("an ordinary message is silent", () => {
    const dir = box();
    expect(hook(dir, prompt(SID, transcript(dir, [["high", 5]]), "şu testi düzelt"))).toBe("");
  });
  it("a word that only contains the stem is not a match (planet, explain)", () => {
    const dir = box();
    expect(hook(dir, prompt(SID, transcript(dir, [["high", 5]]), "explain the planet"))).toBe("");
  });
});

describe("with no mode, a session not at high reminds the lead before code (Fable A4)", () => {
  it("at max: the lead gets the code line and is told to write no code until he switches", () => {
    const dir = box();
    const out = warning(hook(dir, prompt(SID, transcript(dir, [["max", 5]]), "şunu düzelt")));
    expect(out).toContain(CODE_LINE);
    expect(out).toContain("runs at max");
    expect(out).toContain("write no code");
  });
  it("at medium after a /effort medium row: the code line", () => {
    const dir = box();
    expect(warning(hook(dir, prompt(SID, transcript(dir, [["high", 30], ["/effort medium", 5]]))))).toContain(CODE_LINE);
  });
});

describe("the CLI tells the lead whether this reply opens with the warning (Fable A1, A3)", () => {
  /** the session's transcript where Claude Code keeps it, under HOME */
  const own = (dir: string, steps: [string, number, (string | null)?][]) => {
    const folder = join(dir, ".claude", "projects", "-x");
    mkdirSync(folder, { recursive: true });
    return transcript(dir, steps, 0, join(folder, `${SID}.jsonl`));
  };
  it("plan at high: open this reply with the max line", () => {
    const dir = box();
    own(dir, [["high", 5]]);
    const r = setMode(dir, "plan");
    expect(r.stdout).toContain("live level high");
    expect(r.stdout).toContain(MAX_LINE);
  });
  it("plan already at max: no warning in this reply", () => {
    const dir = box();
    own(dir, [["max", 5]]);
    const r = setMode(dir, "plan");
    expect(r.stdout).toContain("already at max");
    expect(r.stdout).not.toContain(MAX_LINE);
  });
  it("build at max (the plan's question): close this reply with the high line", () => {
    const dir = box();
    own(dir, [["max", 5]]);
    const r = setMode(dir, "build");
    expect(r.stdout).toContain(HIGH_LINE);
  });
  it("build already at high: no warning", () => {
    const dir = box();
    own(dir, [["high", 5]]);
    expect(setMode(dir, "build").stdout).toContain("already at high");
  });
  it("no transcript: the level is unknown and the line is given", () => {
    const r = setMode(box(), "plan");
    expect(r.stdout).toContain("live level unknown");
    expect(r.stdout).toContain(MAX_LINE);
  });
});

describe("the CLI refuses a word it does not know (Fable B12)", () => {
  for (const args of [["max"], ["plan", "now"], ["PLAN"]]) {
    it(`${JSON.stringify(args)}: exit 2, the usage on stderr, no mode written`, () => {
      const dir = box();
      const r = cli(dir, args, SID);
      expect(r.status).toBe(2);
      expect(r.stderr).toContain("usage");
      expect(existsSync(MODES(dir))).toBe(false);
    });
  }
});
