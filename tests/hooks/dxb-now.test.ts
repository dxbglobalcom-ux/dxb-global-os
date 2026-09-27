// THE CLOCK ON THE WALL under vitest — the real hook (.claude/hooks/dxb-now.sh), spawned where it
// stands with a pinned "now" (DXB_NOW_EPOCH), a temporary transcript and TZ=Europe/Berlin, so every
// case is deterministic. CEO 2026-09-27: sessions mis-named dates to him and no hook told them the
// time; the hook prints the clock, the dates behind "dün" and when the session opened.
import { spawnSync } from "node:child_process";
import { accessSync, constants, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir, userInfo } from "node:os";
import { join } from "node:path";
import { afterAll, describe as vdescribe, expect, it } from "vitest";

// The full battery runs sandboxed as another user (dxbbuild): if that user cannot read the hook or
// the settings, the suite SKIPS with the reason in its title instead of turning red.
// DXB_HOOKS_FORCE_UNREADABLE=1 is test-only: it forces that path to prove the skip.
const HOOK = join(process.cwd(), ".claude", "hooks", "dxb-now.sh");
const SETTINGS = join(process.cwd(), ".claude", "settings.json");
const readable = (f: string) => { try { accessSync(f, constants.R_OK); return true; } catch { return false; } };
const REASON = process.env.DXB_HOOKS_FORCE_UNREADABLE !== "1" && [HOOK, SETTINGS].every(readable) ? null :
  `${HOOK} or ${SETTINGS} unreadable as ${userInfo().username}; run "pnpm vitest run tests/hooks" as the host user`;
if (REASON) console.warn(`SKIPPED — ${REASON}`);
const describe = (title: string, fn: () => void) =>
  REASON ? vdescribe.skip(`[SKIPPED — ${REASON}] ${title}`, fn) : vdescribe(title, fn);

/** 2026-09-27 17:34:00 CEST (UTC+2) */
const NOW = Date.UTC(2026, 8, 27, 15, 34, 0) / 1000;

const tmp = mkdtempSync(join(tmpdir(), "dxb-now-"));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

/** a transcript whose first line carries `iso` as its timestamp */
function transcript(name: string, iso: string): string {
  const file = join(tmp, name);
  writeFileSync(file, `{"timestamp":"${iso}"}\n{"timestamp":"2026-09-27T15:30:00.000Z"}\n`);
  return file;
}

/** the hook as Claude Code runs it: the prompt's JSON on stdin, Berlin time, "now" pinned */
function run(stdin: string, env: Record<string, string> = {}) {
  const r = spawnSync("bash", [HOOK], {
    input: stdin, encoding: "utf8", timeout: 10_000,
    env: { ...process.env, TZ: "Europe/Berlin", DXB_NOW_EPOCH: String(NOW), DXB_NOW_TRANSCRIPT: "", ...env },
  });
  return { status: r.status, lines: r.stdout.replace(/\n$/, "").split("\n") };
}

describe("dxb-now.sh — the clock on every prompt", () => {
  it("T1 names now with its weekday, and the absolute dates behind dün, evvelsi gün and geçen hafta bugün", () => {
    const r = run("");
    const head = "ŞU AN — Pazar 27 Eylül 2026, 17:34";
    expect(r.status).toBe(0);
    expect(r.lines[0].slice(0, head.length)).toBe(head);
    for (const s of ["dün = Cumartesi 26 Eylül", "evvelsi gün = Cuma 25 Eylül", "geçen hafta bugün = Pazar 20 Eylül"]) {
      expect(r.lines[0]).toContain(s);
    }
  });

  it("T2 says when the session opened and how long ago, naming the day once it is not today", () => {
    const today = transcript("today.jsonl", "2026-09-27T14:52:45.127Z");
    expect(run(JSON.stringify({ session_id: "s", transcript_path: today, prompt: "hi" })).lines[0])
      .toContain("bu oturum 16:52'de açıldı (42 dk önce)");
    const yesterday = transcript("yesterday.jsonl", "2026-09-26T21:10:00Z");
    expect(run("", { DXB_NOW_TRANSCRIPT: yesterday }).lines[0])
      .toContain("bu oturum Cumartesi 26 Eylül 23:10'de açıldı (18 sa 24 dk önce)");
  });

  it("T3 with empty stdin or a missing transcript: still two lines, exit 0, no session part", () => {
    for (const stdin of ["", JSON.stringify({ transcript_path: join(tmp, "missing.jsonl") })]) {
      const r = run(stdin);
      expect(r.status).toBe(0);
      expect(r.lines).toHaveLength(2);
      expect(r.lines[0]).not.toContain("bu oturum");
    }
  });

  it("T3 a malformed DXB_NOW_EPOCH never fails the prompt", () => {
    expect(run("", { DXB_NOW_EPOCH: "not-a-number" }).status).toBe(0);
  });

  it("T4 settings.json parses and runs dxb-now.sh before no-laziness.sh on every prompt", () => {
    const settings = JSON.parse(readFileSync(SETTINGS, "utf8"));
    const commands: string[] = settings.hooks.UserPromptSubmit
      .flatMap((g: { hooks: { command: string }[] }) => g.hooks.map((h) => h.command));
    const at = (name: string) => commands.findIndex((c) => c.includes(name));
    expect(at("dxb-now.sh")).toBeGreaterThanOrEqual(0);
    expect(at("dxb-now.sh")).toBeLessThan(at("no-laziness.sh"));
  });
});
