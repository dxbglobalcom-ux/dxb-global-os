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

/** the bar as he reads it: ANSI colours stripped */
function bar(dir: string, transcript_path?: string, sid = SID): string {
  const r = spawnSync("node", [STATUS_LINE], {
    input: JSON.stringify({
      session_id: sid, transcript_path, model: { display_name: "Opus 5.5" }, workspace: { current_dir: "/x" },
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
  it("the step read is the LAST assistant step, after any later user or tool lines", () => {
    const dir = box();
    expect(bar(dir, transcript(dir, [step("high"), step("max"), said, { type: "attachment" }]))).toContain("tur: max");
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
