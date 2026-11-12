// THE SESSION SETS ITS OWN EFFORT — the real hook, run where it stands in the repository.
// The CEO's order of 2026-11-10: the session sets its own level by the course of the talk; he does not
// switch it and is never asked to. Talk runs at medium, a plan, a design, an architecture or code at high,
// a truly complex, important job at xhigh; max is not used. The level is carried by three small skills
// (`dxb-effort-medium`, `dxb-effort-high`, `dxb-effort-xhigh`) whose `effort` field sets the turn they are
// opened in, in the background. On each of his messages the hook tells the lead the session's own level
// and asks it to decide, before it thinks about the substance, what the reply needs. The session's own
// level is the newest of the status line's record and the transcript's last /effort row (`Set effort level
// to …`); a step in the transcript may carry a skill's lift, so it never tells the session's level. A
// message naming a plan, a design or an architecture — or his permission mode `plan` — also opens the
// dxb-team3 door (the CEO, 2026-10-09). The hook keeps no state and takes no argument: the modes
// `plan|plan-max|build|off` and their warning lines are gone. Every case gets its own temporary directory
// as XDG_RUNTIME_DIR and its own transcript, so nothing lands in the machine's own folders.
import { spawnSync } from "node:child_process";
import {
  existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync, accessSync, constants,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const ROOT = resolve(__dirname, "../..");
const HOOK = join(ROOT, ".claude", "hooks", "dxb-effort-warn.py");
const SETTINGS = join(ROOT, ".claude", "settings.json");
const SKILLS = join(ROOT, ".claude", "skills");
const SID = "7c3e9a10-6f2b-4000-8000-000000000000";
const OTHER = "7c3e9a10-6f2b-4000-8000-000000000001";
const LEVEL_SKILLS = ["medium", "high", "xhigh"] as const;

const tmp: string[] = [];
afterAll(() => { for (const d of tmp) rmSync(d, { recursive: true, force: true }); });

/** a fresh directory standing in for XDG_RUNTIME_DIR, with room for the case's transcript */
function box(): string {
  const dir = mkdtempSync(join(tmpdir(), "effortwarn"));
  tmp.push(dir);
  return dir;
}

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
    session_id: sessionField, used_pct: 10, tokens: 1000, total_tokens: 1000000, model: "Fable 5.2", cwd: "/x",
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
function context(out: string): string {
  const parsed = JSON.parse(out).hookSpecificOutput;
  expect(parsed.hookEventName).toBe("UserPromptSubmit");
  return parsed.additionalContext;
}

/** the level the hook says the session runs at: a level, or "unknown" */
function told(text: string): string {
  if (text.includes("own level is not known")) return "unknown";
  const found = /This session runs at (low|medium|high|xhigh|max)\./.exec(text);
  expect(found, text).not.toBeNull();
  return found![1];
}

const skillCall = (level: string) => `Skill("dxb-effort-${level}")`;

describe("each of his messages tells the lead the session's level and how to set its own (CEO 2026-11-10)", () => {
  it("at high, an ordinary message: the level, the three skills, the first action — and he is never asked to switch", () => {
    const dir = box();
    record(dir, SID, "high", 2);
    const text = context(hook(dir, prompt(SID, transcript(dir, [["high", 5]]))));
    expect(told(text)).toBe("high");
    for (const level of LEVEL_SKILLS) expect(text).toContain(skillCall(level));
    expect(text).toContain("before you think about the substance");
    expect(text).toContain("first action");
    expect(text).toContain("he does not switch it and is never asked to");
    expect(text).not.toContain("geçin");
    expect(text).not.toContain("/effort");
    expect(text).not.toContain("until he has switched");
  });
  it("names what each level is for: talk at medium, plan and code at high, a truly complex job at xhigh, never max", () => {
    const dir = box();
    record(dir, SID, "medium", 2);
    const text = context(hook(dir, prompt(SID, transcript(dir, []))));
    expect(text).toMatch(/talk, a question, a fact, a reading or a record: medium/);
    expect(text).toMatch(/a plan, a design, an architecture, or code: high/);
    expect(text).toMatch(/truly complex, important job's plan or work: xhigh/);
    // the level follows the job, never a kind of work (his word, 2026-11-10): no blanket "eye-facing code at xhigh".
    // No kind of work is named at xhigh: the fine-design point of 2026-11-11 was withdrawn the same day
    expect(text).not.toContain("look of a page");
    expect(text).not.toContain("fine design piece");
    expect(text).toContain("- a truly complex, important job's plan or work: xhigh.\n");
    expect(text).toContain("max is not used");
    expect(text).not.toContain("dxb-effort-max");
    expect(text).not.toContain("dxb-effort-low");
  });
  it("in a dxb-team3 job managing runs at high, xhigh open for the distribution — said with its scope (CEO 2026-11-11, that door only)", () => {
    const dir = box();
    record(dir, SID, "medium", 2);
    const text = context(hook(dir, prompt(SID, transcript(dir, []))));
    // the scope is in the printed text itself: his word of the same day keeps the point inside that door
    expect(text).toContain("- in a dxb-team3 job, a managing turn -- you open a hand (the Agent tool), write a brief or verify a piece that came back: high");
    expect(text).toContain("xhigh is open while you think through who does what (the CEO, 2026-11-11, for that door only)");
    // managing is named before talk, so a verification is never read as "a reading or a record: medium"
    expect(text.indexOf("a managing turn")).toBeGreaterThan(-1);
    expect(text.indexOf("a managing turn")).toBeLessThan(text.indexOf("talk, a question"));
  });
  it("keeps his word on short code (2026-10-29): narrow glue may stay at medium, the cost of an error decides, none at low", () => {
    const dir = box();
    record(dir, SID, "medium", 2);
    const text = context(hook(dir, prompt(SID, transcript(dir, []))));
    expect(text).toContain("narrow glue");
    expect(text).toContain("what an error costs");
    expect(text).toContain("no code at low");
  });
  it("he sees it: the level is named in a few words only in the reply where it changes", () => {
    const dir = box();
    record(dir, SID, "medium", 2);
    const text = context(hook(dir, prompt(SID, transcript(dir, []))));
    expect(text).toContain("differs from the reply before");
    expect(text).toContain("otherwise say nothing about effort");
  });
  it("a level not known yet: the lead opens the skill of the level the reply needs, whichever it is", () => {
    const dir = box();
    const text = context(hook(dir, prompt(SID, join(dir, "missing.jsonl"))));
    expect(told(text)).toBe("unknown");
    expect(text).toContain("Your first action is the skill of the level the reply needs");
    for (const level of LEVEL_SKILLS) expect(text).toContain(skillCall(level));
  });
  it("the hook keeps no state: it leaves nothing behind in the runtime directory", () => {
    const dir = box();
    hook(dir, prompt(SID, join(dir, "missing.jsonl")));
    expect(readdirSync(dir)).toEqual([]);
  });
});

describe("the session's own level: the status line's record and the /effort row, newest first", () => {
  it("a record at medium and a NEWER step at xhigh (a skill's lift): still medium — a step is not the session's setting", () => {
    const dir = box();
    record(dir, SID, "medium", 30);
    expect(told(context(hook(dir, prompt(SID, transcript(dir, [["xhigh", 5]])))))).toBe("medium");
  });
  it("a record at high and an OLDER step at medium: high", () => {
    const dir = box();
    record(dir, SID, "high", 1);
    expect(told(context(hook(dir, prompt(SID, transcript(dir, [["medium", 30]])))))).toBe("high");
  });
  it("a record at high, then a NEWER /effort medium row: medium — he switched, before any render", () => {
    const dir = box();
    record(dir, SID, "high", 30);
    expect(told(context(hook(dir, prompt(SID, transcript(dir, [["high", 40], ["/effort medium", 2]])))))).toBe("medium");
  });
  it("an OLDER /effort max row and a newer record at high: high", () => {
    const dir = box();
    record(dir, SID, "high", 1);
    expect(told(context(hook(dir, prompt(SID, transcript(dir, [["/effort max", 30]])))))).toBe("high");
  });
  it("a /effort row and a NEWER step at another level, no record: the row — the step may be a lift", () => {
    const dir = box();
    expect(told(context(hook(dir, prompt(SID, transcript(dir, [["/effort medium", 30], ["high", 5]])))))).toBe("medium");
  });
  it("no record and no /effort row, the last step at xhigh: unknown — the step may be the last turn's lift (Sol A1)", () => {
    const dir = box();
    const text = context(hook(dir, prompt(SID, transcript(dir, [["high", 30], ["xhigh", 5]]))));
    expect(told(text)).toBe("unknown");
    expect(text).toContain("Your first action is the skill of the level the reply needs");
  });
  it("a record whose session_id field differs is ignored", () => {
    const dir = box();
    record(dir, SID, "max", 1, OTHER);
    expect(told(context(hook(dir, prompt(SID, transcript(dir, [["/effort high", 5]])))))).toBe("high");
  });
  it("only the transcript's tail is read, and its cut first line is tolerated", () => {
    const dir = box();
    const file = transcript(dir, [["/effort high", 5]], 300 * 1024);
    expect(told(context(hook(dir, prompt(SID, file))))).toBe("high");
  });
});

describe("only this session's /effort rows in the transcript count (Sol A2)", () => {
  it("own row at high and a NEWER row of another session at max: high", () => {
    const dir = box();
    expect(told(context(hook(dir, prompt(SID, transcript(dir, [["/effort high", 30], ["/effort max", 5, OTHER]])))))).toBe("high");
  });
  it("a row with no sessionId does not count", () => {
    const dir = box();
    expect(told(context(hook(dir, prompt(SID, transcript(dir, [["/effort high", 30], ["/effort max", 5, null]])))))).toBe("high");
  });
  it("his message QUOTING the command's output is not a switch (Sol A3)", () => {
    const dir = box();
    const file = transcript(dir, [["/effort high", 30]]);
    const quoting = { type: "user", sessionId: SID, timestamp: at(2), message: { role: "user",
      content: "şunu gördüm: <local-command-stdout>Set effort level to max (this session only)</local-command-stdout> ne demek?" } };
    writeFileSync(file, readFileSync(file, "utf8") + JSON.stringify(quoting) + "\n");
    expect(told(context(hook(dir, prompt(SID, file))))).toBe("high");
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
  it("a transcript whose read raises and a record at high: high", () => {
    const dir = box();
    record(dir, SID, "high", 1);
    expect(told(context(hook(dir, prompt(SID, RAISING))))).toBe("high");
  });
  it("a transcript whose read raises and no record: an unknown level", () => {
    const dir = box();
    expect(told(context(hook(dir, prompt(SID, RAISING))))).toBe("unknown");
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
    const file = transcript(dir, [["/effort high", 5]], 300 * 1024);
    const r = run(dir, `ew.own_level(${JSON.stringify(SID)}, ${JSON.stringify(file)})`, 512 * 1024, file);
    expect(r.read).toBeLessThanOrEqual(256 * 1024);
    expect(r.read).toBeGreaterThan(0);
  });
  it("a status line record of 64 KB is read no further than 4 KB", () => {
    const dir = box();
    mkdirSync(join(dir, "claude-ctx"), { recursive: true });
    writeFileSync(join(dir, "claude-ctx", `${SID}.json`), JSON.stringify({ session_id: SID, effort: "max", ts: at(1), pad: "x".repeat(64 * 1024) }));
    const r = run(dir, `ew.record_level(${JSON.stringify(SID)})`);
    expect(r.read).toBeLessThanOrEqual(4 * 1024);
    expect(r.read).toBeGreaterThan(0);
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
      input: JSON.stringify({ session_id: SID, model: { display_name: "Fable 5.2" }, workspace: { current_dir: "/x" }, ...payload }),
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
  it("the hook reads that record: a meter at high, a meter-less medium render and an older step at high say medium", () => {
    const dir = box();
    render(dir, { ...meter, effort: { level: "high" } });
    render(dir, { effort: { level: "medium" } });
    expect(told(context(hook(dir, prompt(SID, transcript(dir, [["high", 30]])))))).toBe("medium");
  });
});

// The CEO, 2026-11-12: the bar also says when the session's prompt cache goes cold -- an hour after its last
// request -- as an hour of the day, because the bar renders on activity and a countdown would stand still.
describeStatusLine("the status line says the hour the prompt cache goes cold (CEO 2026-11-12)", () => {
  const bar = (dir: string, transcriptPath: unknown) => {
    const e: NodeJS.ProcessEnv = { ...process.env, XDG_RUNTIME_DIR: dir, TZ: "UTC" };
    const r = spawnSync("node", [STATUS_LINE], {
      input: JSON.stringify({ session_id: SID, model: { display_name: "Fable 5.2" }, workspace: { current_dir: "/x" }, transcript_path: transcriptPath }),
      encoding: "utf8", env: e, timeout: LIMIT_MS,
    });
    expect(r.status, r.stderr).toBe(0);
    return r.stdout.replace(/\x1b\[[0-9;]*m/g, "");
  };
  /** a transcript of rows [type, minutes ago, sidechain?], oldest first */
  const rowsAt = (dir: string, rows: [string, number, boolean?][]) => {
    const file = join(dir, "t.jsonl");
    writeFileSync(file, rows.map(([type, minutesAgo, side]) => JSON.stringify({
      type, isSidechain: side === true, timestamp: at(minutesAgo * 60), message: { content: [] } }) + "\n").join(""));
    return file;
  };
  const hourIn = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString().slice(11, 16);
  it("ten minutes after the last request: the hour fifty minutes from now", () => {
    const dir = box();
    const text = bar(dir, rowsAt(dir, [["assistant", 40], ["user", 12], ["assistant", 10], ["user", 1]]));
    // the minute may turn between the row's writing and the bar's reading
    expect([`· önbellek ${hourIn(50)}`, `· önbellek ${hourIn(49)}`].some((t) => text.endsWith(t)), text).toBe(true);
  });
  it("a subagent's step in the same file does not warm this session's cache", () => {
    const dir = box();
    const text = bar(dir, rowsAt(dir, [["assistant", 30], ["assistant", 2, true]]));
    expect([`· önbellek ${hourIn(30)}`, `· önbellek ${hourIn(29)}`].some((t) => text.endsWith(t)), text).toBe(true);
  });
  it("more than an hour after the last request: the cache is cold, and the bar says so", () => {
    const dir = box();
    expect(bar(dir, rowsAt(dir, [["assistant", 61]]))).toMatch(/· önbellek soğudu$/);
  });
  it("no transcript, one that cannot be read, or one with no request yet: nothing is said", () => {
    const dir = box();
    for (const path of [undefined, 7, join(dir, "missing.jsonl"), dir, rowsAt(dir, [["user", 3]])]) {
      expect(bar(dir, path), String(path)).not.toContain("önbellek");
    }
  });
});

describe("a plan talk opens the dxb-team3 door at once (CEO 2026-10-09)", () => {
  const door = 'Skill("dxb-team3")';
  for (const text of ["planı konuşalım", "Bu ekranın tasarımını yapalım", "mimariyi değerlendir", "let's design the schema",
    "which architecture fits", "tasarla bakalım"]) {
    it(`"${text}": the level first, then the door — only if the reply would be plan work`, () => {
      const dir = box();
      record(dir, SID, "medium", 2);
      const out = context(hook(dir, prompt(SID, transcript(dir, []), text)));
      expect(out).toContain(door);
      expect(out).toContain("anything beyond plain facts about what exists");
      expect(out).toContain("generic plan mode");
      expect(out.indexOf(skillCall("high"))).toBeLessThan(out.indexOf(door));
    });
  }
  it("his permission mode plan, whatever his words: the door", () => {
    const dir = box();
    record(dir, SID, "high", 2);
    expect(context(hook(dir, prompt(SID, transcript(dir, []), "devam", "plan")))).toContain(door);
  });
  it("an ordinary message: the level, and no door sentence", () => {
    const dir = box();
    record(dir, SID, "high", 2);
    const out = context(hook(dir, prompt(SID, transcript(dir, []), "bugün hava nasıl")));
    expect(told(out)).toBe("high");
    expect(out).not.toContain(door);
  });
  it("a word that only contains the stem is not a match (planet, explain)", () => {
    const dir = box();
    record(dir, SID, "high", 2);
    expect(context(hook(dir, prompt(SID, transcript(dir, []), "explain the planet")))).not.toContain(door);
  });
});

describe("what is not his message gets none of his message's text", () => {
  const REPORT = "<task-notification>\n<task-id>x</task-id>plan done</task-notification>";
  // measured 2026-11-11 in a trial: the turn a hand's report opens fell back to the session's medium and a
  // money piece was verified there; in a dxb-team3 job managing runs at high (the CEO, 2026-11-11, that door
  // only), so the hook says so then. A background command's completion opens with the same tag (measured the
  // same day), so the line names both.
  /** the one line a report gets: the line itself, its scope, the one skill — and none of his message's text */
  function reportLine(text: string): void {
    expect(text).not.toContain("\n");
    expect(text).toContain("A report has arrived -- a hand's or a background command's, not his message.");
    expect(text).toContain("In a dxb-team3 job,");
    expect(text).toContain("for that door only");
    expect(text).toContain(skillCall("high"));
    expect(text).not.toContain(skillCall("medium"));
    expect(text).not.toContain(skillCall("xhigh"));
    expect(text).not.toContain("EFFORT -- first");
    expect(text).not.toContain("Decide what this reply is");
    expect(text).not.toContain('Skill("dxb-team3")');
  }
  it("a report arriving below high: one line — in a dxb-team3 job verifying it is managing, at high — never the level talk or the door", () => {
    for (const level of ["low", "medium"]) {
      const dir = box();
      record(dir, SID, level, 2);
      for (const mode of ["default", "plan"]) {
        const text = context(hook(dir, prompt(SID, transcript(dir, []), REPORT, mode)));
        reportLine(text);
        expect(text).toContain(`This session runs at ${level}`);
      }
    }
  });
  it("a report arriving with the level not known: the same one line, saying so — not his message's text", () => {
    const dir = box();
    for (const mode of ["default", "plan"]) {
      const text = context(hook(dir, prompt(SID, join(dir, "missing.jsonl"), REPORT, mode)));
      reportLine(text);
      expect(text).toContain("This session's own level is not known");
    }
  });
  it("a report arriving at high, xhigh or max: silent (measured 2026-10-06: one tripped the net)", () => {
    for (const level of ["high", "xhigh", "max"]) {
      const dir = box();
      record(dir, SID, level, 2);
      expect(hook(dir, prompt(SID, transcript(dir, []), REPORT))).toBe("");
      expect(hook(dir, prompt(SID, transcript(dir, []), "<task-notification>plan done</task-notification>", "plan"))).toBe("");
    }
  });
  it("his own message QUOTING that tag is his message: the level and, in plan mode, the door (Sol B2)", () => {
    const dir = box();
    record(dir, SID, "medium", 2);
    const out = context(hook(dir, prompt(SID, transcript(dir, []), "Bu <task-notification> etiketinin mimarisini tasarlayalım.", "plan")));
    expect(told(out)).toBe("medium");
    expect(out).toContain('Skill("dxb-team3")');
  });
  it("another hook event: silent", () => {
    const dir = box();
    expect(hook(dir, { ...prompt(SID, transcript(dir, [["high", 5]])), hook_event_name: "PreToolUse" })).toBe("");
  });
  it("a prompt that is not text: silent", () => {
    const dir = box();
    expect(hook(dir, { ...prompt(SID, transcript(dir, [["high", 5]])), prompt: 7 })).toBe("");
  });
});

// The CEO, 2026-11-12: a long writer was opened into a 5-hour window standing at 86 % and the window ran out
// 22 minutes later -- the status line had the number, no hook or door read it. The hook now says it on every
// turn, his message or a report: the account's 5-hour window and the week, as the status line last wrote
// them, with the record's age. It is a number and a pointer to the door, never a gate.
describe("the quota is said on every turn, from the status line's record (CEO 2026-11-12)", () => {
  const REPORT = "<task-notification>\n<task-id>x</task-id>plan done</task-notification>";
  const epoch = (secondsFromNow: number) => Math.round(Date.now() / 1000) + secondsFromNow;
  type Win = { used_percentage: unknown; resets_at: unknown } | null;
  /** the account's quota record in the shape persistRateLimits() writes */
  function quota(dir: string, five: Win, week: Win, writtenSecondsAgo = 120): void {
    mkdirSync(join(dir, "claude-ctx"), { recursive: true });
    writeFileSync(join(dir, "claude-ctx", "rate-limits.json"), JSON.stringify({
      session_id: OTHER, seven_day: week, five_hour: five, written_at: at(writtenSecondsAgo),
    }));
  }
  const quotaLine = (text: string) => text.split("\n").filter((l) => l.startsWith("QUOTA -- "));
  /** the record written as raw text: JSON.stringify cannot write NaN, Infinity or an integer of 400 digits */
  function rawQuota(dir: string, five: string, week: string, writtenSecondsAgo = 120): void {
    mkdirSync(join(dir, "claude-ctx"), { recursive: true });
    writeFileSync(join(dir, "claude-ctx", "rate-limits.json"),
      `{"session_id":"${OTHER}","seven_day":${week},"five_hour":${five},"written_at":"${at(writtenSecondsAgo)}"}`);
  }

  it("his message: the 5-hour window's percentage and its reset, the week, the record's age, the door's section", () => {
    const dir = box();
    record(dir, SID, "medium", 2);
    quota(dir, { used_percentage: 86, resets_at: epoch(41 * 60 + 30) }, { used_percentage: 32, resets_at: epoch(35 * 3600 + 90) });
    const text = context(hook(dir, prompt(SID, transcript(dir, []))));
    expect(told(text)).toBe("medium");
    const lines = quotaLine(text);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("5-hour window is 86% used and resets in 0h41m");
    expect(lines[0]).toContain("the week is 32% used and resets in 35h01m");
    expect(lines[0]).toContain("2 min old");
    expect(lines[0]).toContain("dxb-team3");
    expect(lines[0]).toContain("section 3");
    expect(text.trimEnd().endsWith(lines[0])).toBe(true);
  });
  it("it is a number, not a gate: the line lowers no model and no level and stops nothing", () => {
    const dir = box();
    record(dir, SID, "high", 2);
    quota(dir, { used_percentage: 100, resets_at: epoch(600) }, { used_percentage: 99, resets_at: epoch(600) });
    const [line] = quotaLine(context(hook(dir, prompt(SID, transcript(dir, [])))));
    expect(line).toContain("5-hour window is 100% used");
    for (const word of ["medium", "Opus", "LEAN", "must not", "never open", "stop"]) expect(line).not.toContain(word);
  });
  it("no record: no quota line, and his message's text is what it was", () => {
    const dir = box();
    record(dir, SID, "high", 2);
    const text = context(hook(dir, prompt(SID, transcript(dir, []))));
    expect(quotaLine(text)).toHaveLength(0);
    expect(text).not.toContain("QUOTA");
  });
  it("a report arriving at high: the quota line alone -- the moment the lead decides the next hand", () => {
    for (const level of ["high", "xhigh", "max"]) {
      const dir = box();
      record(dir, SID, level, 2);
      quota(dir, { used_percentage: 59, resets_at: epoch(3 * 3600 + 30) }, { used_percentage: 29, resets_at: epoch(40 * 3600) });
      const text = context(hook(dir, prompt(SID, transcript(dir, []), REPORT)));
      expect(text.startsWith("QUOTA -- ")).toBe(true);
      expect(text).not.toContain("\n");
      expect(text).toContain("5-hour window is 59% used and resets in 3h00m");
      expect(text).not.toContain("A report has arrived");
      expect(text).not.toContain("EFFORT -- first");
    }
  });
  it("a report arriving below high: its one line, then the quota line", () => {
    const dir = box();
    record(dir, SID, "medium", 2);
    quota(dir, { used_percentage: 59, resets_at: epoch(3 * 3600 + 30) }, null);
    const lines = context(hook(dir, prompt(SID, transcript(dir, []), REPORT))).split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("A report has arrived");
    expect(lines[1]).toContain("5-hour window is 59% used");
    expect(lines[1]).toContain("the week is not known");
  });
  it("a window past its reset is not quoted: it has reset since the record was written", () => {
    const dir = box();
    record(dir, SID, "high", 2);
    quota(dir, { used_percentage: 100, resets_at: epoch(-300) }, { used_percentage: 21, resets_at: epoch(40 * 3600) }, 1800);
    const [line] = quotaLine(context(hook(dir, prompt(SID, transcript(dir, [])))));
    expect(line).toContain("5-hour window has reset since the record was written");
    expect(line).not.toContain("100%");
    expect(line).toContain("the week is 21% used");
    expect(line).toContain("30 min old");
  });
  it("a window the record does not carry is said so, the other one still told", () => {
    const dir = box();
    record(dir, SID, "high", 2);
    quota(dir, null, { used_percentage: 22, resets_at: epoch(40 * 3600) });
    const [line] = quotaLine(context(hook(dir, prompt(SID, transcript(dir, [])))));
    expect(line).toContain("5-hour window is not known");
    expect(line).toContain("the week is 22% used");
  });
  it("a record too old to trust (over 6 hours), from the future, or with no window at all: no line", () => {
    const cases: [Win, Win, number][] = [
      [{ used_percentage: 50, resets_at: epoch(3600) }, { used_percentage: 20, resets_at: epoch(90000) }, 6 * 3600 + 60],
      [{ used_percentage: 50, resets_at: epoch(3600) }, { used_percentage: 20, resets_at: epoch(90000) }, -600],
      [null, null, 60],
      [{ used_percentage: "86", resets_at: epoch(3600) }, { used_percentage: true, resets_at: epoch(3600) }, 60],
      [{ used_percentage: -1, resets_at: epoch(3600) }, { used_percentage: 1e400, resets_at: epoch(3600) }, 60],
    ];
    for (const [five, week, ago] of cases) {
      const dir = box();
      record(dir, SID, "high", 2);
      quota(dir, five, week, ago);
      const text = context(hook(dir, prompt(SID, transcript(dir, []))));
      expect(text, JSON.stringify([five, week, ago])).not.toContain("QUOTA");
      expect(hook(dir, prompt(SID, transcript(dir, []), REPORT))).toBe("");
    }
  });
  // Sol's pass, 2026-11-12: a number the record cannot mean must not be said, and must never cost him the level
  it("a percentage that is no percentage -- NaN, Infinity, an integer of 400 digits, above 100 -- is not known; the other window and his message's text stand", () => {
    const week = `{"used_percentage":22,"resets_at":${epoch(40 * 3600)}}`;
    for (const used of ["NaN", "Infinity", "-Infinity", "1" + "0".repeat(400), "101", "1e308"]) {
      for (const reset of [String(epoch(3600)), "1" + "0".repeat(400)]) {
        const dir = box();
        record(dir, SID, "medium", 2);
        rawQuota(dir, `{"used_percentage":${used},"resets_at":${reset}}`, week);
        const text = context(hook(dir, prompt(SID, transcript(dir, []))));
        expect(told(text), used).toBe("medium");
        const [line] = quotaLine(text);
        expect(line, `${used} ${reset.length}`).toContain("5-hour window is not known");
        expect(line).toContain("the week is 22% used");
      }
    }
  });
  it("a reset time of 400 digits beside a good percentage: the percentage is told without a reset", () => {
    const dir = box();
    record(dir, SID, "high", 2);
    rawQuota(dir, `{"used_percentage":40,"resets_at":${"1" + "0".repeat(400)}}`, "null");
    const [line] = quotaLine(context(hook(dir, prompt(SID, transcript(dir, [])))));
    expect(line).toContain("5-hour window is 40% used;");
  });
  it("both windows past their reset: the line says so for each -- it does not vanish", () => {
    const dir = box();
    record(dir, SID, "high", 2);
    quota(dir, { used_percentage: 100, resets_at: epoch(-300) }, { used_percentage: 90, resets_at: epoch(-60) }, 1800);
    const [line] = quotaLine(context(hook(dir, prompt(SID, transcript(dir, [])))));
    expect(line).toContain("5-hour window has reset since the record was written");
    expect(line).toContain("the week has reset since the record was written");
    expect(line).not.toMatch(/\d+% used/);
  });
  it("a reset time older than the record itself is not a reset since the record: that window is not known", () => {
    const dir = box();
    record(dir, SID, "high", 2);
    quota(dir, { used_percentage: 64, resets_at: epoch(-3600) }, { used_percentage: 22, resets_at: -5 }, 120);
    const text = context(hook(dir, prompt(SID, transcript(dir, []))));
    expect(text).not.toContain("QUOTA");
    const second = box();
    record(second, SID, "high", 2);
    quota(second, { used_percentage: 64, resets_at: epoch(-3600) }, { used_percentage: 22, resets_at: epoch(40 * 3600) }, 120);
    const [line] = quotaLine(context(hook(second, prompt(SID, transcript(second, [])))));
    expect(line).toContain("5-hour window is not known");
    expect(line).not.toContain("has reset");
    expect(line).not.toContain("64%");
  });
  it("his message's text is what it was, whole: the quota line is appended and nothing else changes", () => {
    for (const [words, mode] of [["devam", "default"], ["Bu işin mimarisini planlayalım.", "plan"]] as const) {
      const bare = box();
      record(bare, SID, "medium", 2);
      const before = context(hook(bare, prompt(SID, transcript(bare, []), words, mode)));
      const dir = box();
      record(dir, SID, "medium", 2);
      quota(dir, { used_percentage: 10, resets_at: epoch(3600 + 30) }, null);
      const after = context(hook(dir, prompt(SID, transcript(dir, []), words, mode)));
      const [line] = quotaLine(after);
      expect(after).toBe(`${before}\n${line}`);
    }
  });
  it("a percentage with no reset time is told without one", () => {
    const dir = box();
    record(dir, SID, "high", 2);
    quota(dir, { used_percentage: 7.5, resets_at: null }, null);
    const [line] = quotaLine(context(hook(dir, prompt(SID, transcript(dir, [])))));
    expect(line).toContain("5-hour window is 7.5% used;");
  });
  it("a record that is garbage, a list, a link or a FIFO: no line, nothing blocks, his message's text stands", () => {
    const writers: ((file: string, dir: string) => void)[] = [
      (file) => writeFileSync(file, "{not json"),
      (file) => writeFileSync(file, "[1,2]"),
      (file, dir) => {
        writeFileSync(join(dir, "elsewhere.json"), JSON.stringify({
          five_hour: { used_percentage: 50, resets_at: epoch(3600) }, seven_day: null, written_at: at(5) }));
        expect(spawnSync("ln", ["-s", join(dir, "elsewhere.json"), file]).status).toBe(0);
      },
      (file) => { expect(spawnSync("mkfifo", [file]).status).toBe(0); },
    ];
    for (const write of writers) {
      const dir = box();
      record(dir, SID, "high", 2);
      write(join(dir, "claude-ctx", "rate-limits.json"), dir);
      const text = context(hook(dir, prompt(SID, transcript(dir, []))));
      expect(told(text)).toBe("high");
      expect(text).not.toContain("QUOTA");
    }
  });
  it("the hook still writes nothing: the runtime directory holds what the case put there", () => {
    const dir = box();
    record(dir, SID, "high", 2);
    quota(dir, { used_percentage: 10, resets_at: epoch(3600) }, null);
    hook(dir, prompt(SID, transcript(dir, [])));
    expect(readdirSync(join(dir, "claude-ctx")).sort()).toEqual(["rate-limits.json", `${SID}.json`].sort());
  });
});

describe("a session id shaped like a path names nothing", () => {
  it("the hook is silent for it, even with a record standing where the path points", () => {
    const dir = box();
    mkdirSync(join(dir, "claude-ctx"), { recursive: true });
    writeFileSync(join(dir, "escape.json"), JSON.stringify({ session_id: "../escape", effort: "max", ts: at(1) }));
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
  it("a record that is a FIFO does not block the hook", () => {
    const dir = box();
    mkdirSync(join(dir, "claude-ctx"), { recursive: true });
    expect(spawnSync("mkfifo", [join(dir, "claude-ctx", `${SID}.json`)]).status).toBe(0);
    expect(told(context(hook(dir, prompt(SID, transcript(dir, [["/effort high", 5]])))))).toBe("high");
  });
});

describe("the modes are gone: the hook takes no argument", () => {
  for (const args of [["plan"], ["plan-max"], ["build"], ["off"], ["anything", "else"]]) {
    it(`${JSON.stringify(args)}: exit 2, the skills named on stderr, nothing written`, () => {
      const dir = box();
      const r = spawnSync("python3", [HOOK, ...args], { encoding: "utf8", env: { ...env(dir, SID), HOME: dir }, timeout: LIMIT_MS });
      expect(r.error, "the hook did not finish in time").toBeUndefined();
      expect(r.status).toBe(2);
      expect(r.stdout).toBe("");
      for (const level of LEVEL_SKILLS) expect(r.stderr).toContain(`dxb-effort-${level}`);
      expect(readdirSync(dir)).toEqual([]);
    });
  }
});

describe("settings.json registers the hook", () => {
  it("as the first command of UserPromptSubmit, before no-laziness.sh", () => {
    const settings = JSON.parse(readFileSync(SETTINGS, "utf8"));
    const group = settings.hooks.UserPromptSubmit[0].hooks;
    expect(group[0]).toEqual({ type: "command", command: 'python3 "$CLAUDE_PROJECT_DIR/.claude/hooks/dxb-effort-warn.py"' });
    expect(group[1].command).toContain("no-laziness.sh");
  });
});

describe("the three skills that carry the level", () => {
  /** a skill file's frontmatter as key → value */
  const frontmatter = (level: string) => {
    const text = readFileSync(join(SKILLS, `dxb-effort-${level}`, "SKILL.md"), "utf8");
    const block = /^---\n([\s\S]*?)\n---\n/.exec(text);
    expect(block, `dxb-effort-${level} has no frontmatter`).not.toBeNull();
    return Object.fromEntries(block![1].split("\n").map((line) => {
      const colon = line.indexOf(":");
      return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()];
    }));
  };
  for (const level of LEVEL_SKILLS) {
    it(`dxb-effort-${level}: its name is its folder's and its effort field is ${level}`, () => {
      const fields = frontmatter(level);
      expect(fields.name).toBe(`dxb-effort-${level}`);
      expect(fields.effort).toBe(level);
      expect(fields.description.length).toBeGreaterThan(20);
    });
  }
  it("there is no skill for low or for max", () => {
    const folders = readdirSync(SKILLS).filter((name) => name.startsWith("dxb-effort-")).sort();
    expect(folders).toEqual(LEVEL_SKILLS.map((level) => `dxb-effort-${level}`).sort());
  });
});
