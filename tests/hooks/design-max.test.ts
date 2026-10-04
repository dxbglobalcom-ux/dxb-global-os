// DESIGN AT MAX — the real hook and the real skill, run where they stand in the repository.
// The CEO's order of 2026-10-03 (design-plan-architecture-at-max-2026-10-03): design, plan and
// architecture run at Opus max, the orchestration after them at high. A session cannot hold max on its
// own: a skill whose frontmatter says `effort: max` runs the rest of ITS turn at max, and Claude Code
// clears it at his next message (measured 2026-10-04, .planning/quick/20261004-design-max/CARD.md). His
// word to the answer of that measurement — "bunu yapalım tmm." (design-max-skill-every-turn-2026-10-04):
// the lead invokes the skill first in each design turn, and this hook reminds it on each of his
// messages until his yes to the plan closes the mode. Every case gets its own temporary directory as
// XDG_RUNTIME_DIR, so nothing lands in the machine's own flag folder.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const ROOT = resolve(__dirname, "../..");
const HOOK = join(ROOT, ".claude", "hooks", "dxb-design-max.py");
const SKILL = join(ROOT, ".claude", "skills", "dxb-design-max", "SKILL.md");
const SETTINGS = join(ROOT, ".claude", "settings.json");
const SID = "5e1f0a2b-d351-4000-8000-000000000000";
const OTHER = "5e1f0a2b-d351-4000-8000-000000000001";

const tmp: string[] = [];
afterAll(() => { for (const d of tmp) rmSync(d, { recursive: true, force: true }); });

/** a fresh directory standing in for XDG_RUNTIME_DIR */
function box(): string {
  const dir = mkdtempSync(join(tmpdir(), "designmax"));
  tmp.push(dir);
  return dir;
}

const FLAGS = (dir: string) => join(dir, "dxb-design-max");
const flag = (dir: string, sid: string) => join(FLAGS(dir), sid);
const env = (dir: string, sid?: string) => {
  const e: NodeJS.ProcessEnv = { ...process.env, XDG_RUNTIME_DIR: dir, PYTHONDONTWRITEBYTECODE: "1" };
  delete e.CLAUDE_CODE_SESSION_ID;
  if (sid !== undefined) e.CLAUDE_CODE_SESSION_ID = sid;
  return e;
};

/** a PostToolUse input for the Skill tool, as Claude Code sends it (measured 2026-10-04) */
const skillCall = (sid: string, skill: string) => ({
  session_id: sid, hook_event_name: "PostToolUse", tool_name: "Skill",
  tool_input: { skill }, tool_response: { success: true, commandName: skill },
});
/** a UserPromptSubmit input */
const prompt = (sid: string) => ({ session_id: sid, hook_event_name: "UserPromptSubmit", prompt: "devam", cwd: ROOT });

/** runs the real hook on stdin; exit 0 and a clean stderr are part of every answer */
function hook(dir: string, input: unknown): string {
  const r = spawnSync("python3", [HOOK], {
    input: typeof input === "string" ? input : JSON.stringify(input), encoding: "utf8", env: env(dir),
  });
  expect(r.status, r.stderr).toBe(0);
  expect(r.stderr).toBe("");
  return r.stdout;
}

/** runs the real hook's close command as the lead runs it from Bash, with the session id in its env */
function close(dir: string, sid?: string) {
  return spawnSync("python3", [HOOK, "close"], { encoding: "utf8", env: env(dir, sid) });
}

describe("the skill's call opens the mode for its own session", () => {
  it("invoking dxb-design-max writes this session's flag and says nothing", () => {
    const dir = box();
    expect(hook(dir, skillCall(SID, "dxb-design-max"))).toBe("");
    expect(existsSync(flag(dir, SID))).toBe(true);
    expect(readdirSync(FLAGS(dir))).toEqual([SID]);
  });
  it("any other skill opens nothing", () => {
    const dir = box();
    expect(hook(dir, skillCall(SID, "dxb-verify"))).toBe("");
    expect(existsSync(FLAGS(dir))).toBe(false);
  });
});

describe("while open, each of his messages carries the reminder; closed or never opened, the hook is silent", () => {
  it("no flag: a prompt gets nothing", () => {
    expect(hook(box(), prompt(SID))).toBe("");
  });
  it("open: the prompt carries the reminder, naming the skill and the close command", () => {
    const dir = box();
    hook(dir, skillCall(SID, "dxb-design-max"));
    const out = JSON.parse(hook(dir, prompt(SID))).hookSpecificOutput;
    expect(out.hookEventName).toBe("UserPromptSubmit");
    expect(out.additionalContext).toContain("dxb-design-max");
    expect(out.additionalContext).toContain(`python3 "${HOOK}" close`);
  });
  it("another session's open mode does not reach this session", () => {
    const dir = box();
    hook(dir, skillCall(OTHER, "dxb-design-max"));
    expect(hook(dir, prompt(SID))).toBe("");
  });
  it("close removes this session's flag only, and the next prompt is silent", () => {
    const dir = box();
    hook(dir, skillCall(SID, "dxb-design-max"));
    hook(dir, skillCall(OTHER, "dxb-design-max"));
    const r = close(dir, SID);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain("closed");
    expect(existsSync(flag(dir, SID))).toBe(false);
    expect(existsSync(flag(dir, OTHER))).toBe(true);
    expect(hook(dir, prompt(SID))).toBe("");
  });
  it("close on a mode that is not open says so and still exits 0", () => {
    const r = close(box(), SID);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain("not open");
  });
  it("close without a session id in its env refuses with exit 2 and touches nothing", () => {
    const dir = box();
    hook(dir, skillCall(SID, "dxb-design-max"));
    const r = close(dir);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("CLAUDE_CODE_SESSION_ID");
    expect(existsSync(flag(dir, SID))).toBe(true);
  });
});

describe("no session id names a path outside the flag folder; no input makes the hook fail", () => {
  it("a session id shaped like a path writes nothing, reads nothing, closes nothing", () => {
    const dir = box();
    mkdirSync(join(dir, "victim"));
    writeFileSync(join(dir, "victim", "keep"), "x");
    for (const bad of ["../victim/keep", "/etc/passwd", "a/b", "", "..", "ABCDEFGH-not-hex!"]) {
      expect(hook(dir, skillCall(bad, "dxb-design-max"))).toBe("");
      expect(hook(dir, prompt(bad))).toBe("");
      expect(close(dir, bad).status).toBe(2);
    }
    expect(existsSync(FLAGS(dir))).toBe(false);
    expect(readFileSync(join(dir, "victim", "keep"), "utf8")).toBe("x");
  });
  it("garbage, empty and non-object stdin: exit 0, nothing on stdout or stderr", () => {
    const dir = box();
    for (const input of ["", "not json", "[1,2]", "null", JSON.stringify({ hook_event_name: "UserPromptSubmit" })]) {
      expect(hook(dir, input)).toBe("");
    }
  });
});

describe("the registration and the skill as they stand", () => {
  it("settings.json runs the hook on PostToolUse Skill and on UserPromptSubmit", () => {
    const hooks = JSON.parse(readFileSync(SETTINGS, "utf8")).hooks;
    const runs = (blocks: { matcher?: string; hooks: { command: string }[] }[] | undefined, matcher?: string) =>
      (blocks ?? []).some((b) => (matcher === undefined || b.matcher === matcher) &&
        b.hooks.some((h) => h.command.includes(".claude/hooks/dxb-design-max.py")));
    expect(runs(hooks.PostToolUse, "Skill")).toBe(true);
    expect(runs(hooks.UserPromptSubmit)).toBe(true);
  });
  it("the skill is named dxb-design-max and runs at effort max", () => {
    const text = readFileSync(SKILL, "utf8");
    const front = /^---\n([\s\S]*?)\n---\n/.exec(text)?.[1] ?? "";
    expect(front).toMatch(/^name: dxb-design-max$/m);
    expect(front).toMatch(/^effort: max$/m);
    expect(text).toContain("dxb-design-max.py\" close");
  });
});
