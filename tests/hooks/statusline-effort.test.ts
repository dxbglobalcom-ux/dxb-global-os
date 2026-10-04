// THE TURN'S EFFORT ON THE STATUS LINE — the real status line, run where it stands (~/.claude/hooks).
// His question of 2026-10-04, looking at the /effort menu during a design turn: "neden hala /effor
// seçtiğimde altta high görüorm kendisi şuan maxte değil mi" — the menu shows the session's own
// level; the turn's level (a skill's `effort: max`, design-max-skill-every-turn-2026-10-04) is written
// only in the transcript, field `effort` on each assistant step (measured 2026-10-04). His word to
// showing it on the bar: "evet ekle" (statusline-turn-effort-2026-10-04). The bar reads the last
// assistant step's effort from the transcript Claude Code names on its stdin, and the design mode
// from its flag ($XDG_RUNTIME_DIR/dxb-design-max/<session_id>). Every case gets its own temporary
// directory as XDG_RUNTIME_DIR and for its transcript.
import { spawnSync } from "node:child_process";
import { accessSync, constants, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir, userInfo } from "node:os";
import { join } from "node:path";
import { afterAll, describe as vdescribe, expect, it } from "vitest";

// The same home rule as context-gate.test.ts: the sandboxed battery cannot read the CEO's home and SKIPS.
const CANDIDATES = [...new Set([process.env.DXB_CLAUDE_HOME, userInfo().homedir,
  /^\/home\/[^/]+/.exec(process.cwd())?.[0]].filter((h): h is string => !!h))];
const readable = (h: string) => {
  try { accessSync(join(h, ".claude", "hooks", "dxb-statusline.js"), constants.R_OK); return true; } catch { return false; }
};
const FOUND = CANDIDATES.find(readable);
const REASON = FOUND ? null : `status line unreadable as ${userInfo().username} — tried ${CANDIDATES.join(", ")}; ` +
  `run "pnpm vitest run tests/hooks" as the host user`;
const describe = (title: string, fn: () => void) =>
  REASON ? vdescribe.skip(`[SKIPPED — ${REASON}] ${title}`, fn) : vdescribe(title, fn);
const STATUS_LINE = join(FOUND ?? CANDIDATES[0], ".claude", "hooks", "dxb-statusline.js");
const SID = "e4f0c1a2-77aa-4000-8000-000000000000";

const tmp: string[] = [];
afterAll(() => { for (const d of tmp) rmSync(d, { recursive: true, force: true }); });
function box(): string {
  const dir = mkdtempSync(join(tmpdir(), "barbox"));
  tmp.push(dir);
  return dir;
}

/** a transcript of JSON lines, as Claude Code writes it */
function transcript(dir: string, rows: object[]): string {
  const file = join(dir, `${SID}.jsonl`);
  writeFileSync(file, rows.map((r) => JSON.stringify(r) + "\n").join(""));
  return file;
}
const step = (effort: string) => ({ type: "assistant", effort, perTurnEffort: effort, message: { content: [] } });
const said = { type: "user", message: { content: "devam" } };
/** the shapes of a skill's call as Claude Code writes them (measured in session fd7d67f2, 2026-10-04) */
const skillCall = (skill: string, effort = "high") => ({
  type: "assistant", effort, perTurnEffort: effort,
  message: { content: [{ type: "tool_use", name: "Skill", input: { skill } }] },
});
const toolResult = { type: "user", message: { content: [{ type: "tool_result", tool_use_id: "t", content: "Launching skill" }] } };
const skillText = { type: "user", isMeta: true, message: { content: "Skill /dxb-design-max is already loaded above; instructions unchanged." } };
const effortCommand = (level: string) => ({
  type: "user", message: { content: `<local-command-stdout>Set effort level to ${level} (this session only): …</local-command-stdout>` },
});
const commandName = { type: "user", message: { content: "<command-name>/effort</command-name>" } };
const queued = { type: "attachment", attachment: { type: "queued_command", prompt: "bak" } };

/** the bar as he reads it: ANSI colours stripped */
function bar(dir: string, transcript_path?: string, sid = SID,
  live: { prompt_id?: string; effort?: string } = {}): string {
  const r = spawnSync("node", [STATUS_LINE], {
    input: JSON.stringify({
      session_id: sid, transcript_path, model: { display_name: "Opus 5.5" }, workspace: { current_dir: "/x" },
      ...(live.prompt_id !== undefined ? { prompt_id: live.prompt_id } : {}),
      ...(live.effort !== undefined ? { effort: { level: live.effort } } : {}),
    }),
    encoding: "utf8", env: { ...process.env, XDG_RUNTIME_DIR: dir }, timeout: 10_000,
  });
  expect(r.error).toBeUndefined();
  expect(r.status, r.stderr).toBe(0);
  // eslint-disable-next-line no-control-regex
  return r.stdout.replace(/\x1b\[[0-9;]*m/g, "");
}

describe("the bar shows the level the turn really runs at", () => {
  it("the last step ran at max: 'tur: max'", () => {
    const dir = box();
    expect(bar(dir, transcript(dir, [said, step("high"), step("max"), step("max")]))).toContain("tur: max");
  });
  it("the last step ran at high: 'tur: high'", () => {
    const dir = box();
    expect(bar(dir, transcript(dir, [step("max"), said, step("high")]))).toContain("tur: high");
  });
  it("a new prompt with no step yet shows the session's own level — the first step of the turn before", () => {
    const dir = box();
    expect(bar(dir, transcript(dir, [said, step("high"), step("max"), said, { type: "attachment" }]))).toContain("tur: high");
  });
  it("no transcript, an unreadable one, or no step with an effort: no turn mark, the bar still stands", () => {
    const dir = box();
    for (const t of [undefined, join(dir, "missing.jsonl"), transcript(dir, [said, { type: "assistant" }])]) {
      const out = bar(dir, t);
      expect(out).not.toContain("tur:");
      expect(out).toContain("Opus 5.5");
    }
  });
  it("a long transcript is read from its end only and still gives the last step", () => {
    const dir = box();
    const filler = Array.from({ length: 4000 }, () => ({ type: "user", message: { content: "x".repeat(500) } }));
    expect(bar(dir, transcript(dir, [step("max"), ...filler, step("high")]))).toContain("tur: high");
  });
  it("an effort that is not one of the five levels is not shown", () => {
    const dir = box();
    expect(bar(dir, transcript(dir, [step("max\u001b[31mevil")]))).not.toContain("tur:");
  });
});

// His words of 2026-10-04: "alttaki tur yazısı tamamiyle aynı etkileşimde olmalı skill aktifse o turda max
// yazmalı çubukta. çubuk her turu canlı interaktif göstermeli". A step that thinks for minutes is written
// only when it ends; the bar must not wait for it.
describe("the bar shows the request in flight now, not the last step that finished", () => {
  it("the moment the lifting skill is called, before any max step is written: 'tur: max'", () => {
    const dir = box();
    expect(bar(dir, transcript(dir, [said, skillCall("dxb-design-max")]))).toContain("tur: max");
    expect(bar(dir, transcript(dir, [said, skillCall("dxb-design-max"), toolResult, skillText]))).toContain("tur: max");
  });
  it("his next message after a lifted turn: back to the session's level until the skill is called again", () => {
    const dir = box();
    const lifted = [said, skillCall("dxb-design-max"), toolResult, skillText, step("max"), step("max")];
    expect(bar(dir, transcript(dir, [...lifted, said]))).toContain("tur: high");
    expect(bar(dir, transcript(dir, [...lifted, said, skillCall("dxb-design-max")]))).toContain("tur: max");
  });
  it("a message he sends while the turn runs does not end the lift", () => {
    const dir = box();
    expect(bar(dir, transcript(dir, [said, skillCall("dxb-design-max"), toolResult, step("max"), queued]))).toContain("tur: max");
  });
  it("another skill lifts nothing", () => {
    const dir = box();
    expect(bar(dir, transcript(dir, [said, skillCall("dxb-verify"), toolResult]))).toContain("tur: high");
  });
  it("an /effort set since the last step is the level of the next request", () => {
    const dir = box();
    expect(bar(dir, transcript(dir, [said, step("high"), commandName, effortCommand("max")]))).toContain("tur: max");
    expect(bar(dir, transcript(dir, [said, step("high"), commandName, effortCommand("max"), said]))).toContain("tur: max");
    expect(bar(dir, transcript(dir, [said, step("max"), effortCommand("high"), said]))).toContain("tur: high");
  });
});

// Measured 2026-10-04 18:28-18:39 (.planning/quick/20261004-live-turn-bar/evidence/prompt-id-probe.txt): during a
// fresh session's turns the transcript gives the bar nothing, while every render's payload carries `effort.level`
// (the session's own level) and the turn's `prompt_id` — the same id the design-max hook writes into
// <session_id>.turn when the lifting skill is called in that turn.
describe("the bar reads the turn in flight from its own payload and the skill's turn marker", () => {
  const PROMPT = "964970d0-1a2b-4c3d-8e4f-000000000000";
  const EARLIER = "5ec70c6f-1a2b-4c3d-8e4f-000000000000";
  const marker = (dir: string, id: string) => {
    mkdirSync(join(dir, "dxb-design-max"), { recursive: true, mode: 0o700 });
    writeFileSync(join(dir, "dxb-design-max", `${SID}.turn`), id);
  };
  it("the marker holds this render's prompt_id: 'tur: max' with no transcript at all", () => {
    const dir = box();
    marker(dir, PROMPT);
    expect(bar(dir, undefined, SID, { prompt_id: PROMPT, effort: "high" })).toContain("tur: max");
  });
  it("a marker of an earlier prompt: the payload's level, even when the transcript's last turn lifted", () => {
    const dir = box();
    marker(dir, EARLIER);
    const t = transcript(dir, [said, skillCall("dxb-design-max"), toolResult, step("max")]);
    const out = bar(dir, t, SID, { prompt_id: PROMPT, effort: "high" });
    expect(out).toContain("tur: high");
    expect(out).not.toContain("tur: max");
  });
  it("no marker, payload effort medium: 'tur: medium'", () => {
    expect(bar(box(), undefined, SID, { prompt_id: PROMPT, effort: "medium" })).toContain("tur: medium");
  });
  it("payload effort max (his /effort), no marker: 'tur: max'", () => {
    expect(bar(box(), undefined, SID, { prompt_id: PROMPT, effort: "max" })).toContain("tur: max");
  });
  it("a link at the marker pointing to a file holding the right id is not trusted: the payload's level", () => {
    const dir = box();
    mkdirSync(join(dir, "dxb-design-max"), { mode: 0o700 });
    writeFileSync(join(dir, "elsewhere"), PROMPT);
    symlinkSync(join(dir, "elsewhere"), join(dir, "dxb-design-max", `${SID}.turn`));
    const out = bar(dir, undefined, SID, { prompt_id: PROMPT, effort: "high" });
    expect(out).toContain("tur: high");
    expect(out).not.toContain("tur: max");
  });
  it("a payload without effort and no marker: the transcript rules as before", () => {
    const dir = box();
    expect(bar(dir, transcript(dir, [said, skillCall("dxb-design-max")]), SID, { prompt_id: PROMPT })).toContain("tur: max");
    expect(bar(dir, transcript(dir, [said, step("high")]), SID, { prompt_id: PROMPT })).toContain("tur: high");
  });
});

describe("the bar shows when design at max is open for this session", () => {
  const flags = (dir: string) => join(dir, "dxb-design-max");
  it("its flag stands: 'tasarım açık'; another session's flag: nothing", () => {
    const dir = box();
    mkdirSync(flags(dir), { mode: 0o700 });
    writeFileSync(join(flags(dir), SID), "");
    expect(bar(dir)).toContain("tasarım açık");
    expect(bar(dir, undefined, "e4f0c1a2-77aa-4000-8000-000000000001")).not.toContain("tasarım");
  });
  it("a link at the flag is no flag", () => {
    const dir = box();
    mkdirSync(flags(dir), { mode: 0o700 });
    writeFileSync(join(dir, "elsewhere"), "");
    symlinkSync(join(dir, "elsewhere"), join(flags(dir), SID));
    expect(bar(dir)).not.toContain("tasarım");
  });
});
