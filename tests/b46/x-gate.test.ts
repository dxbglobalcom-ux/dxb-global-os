// B42 — THE X GATE. Every X read on this machine goes through the CEO's own account, and X counts
// per account: on 2026-10-18 three parallel research helpers made about 60 calls in ~15 minutes and
// drew `HTTP 429 (session quota)` twice. The gate (dxb-research/scripts/xgate.py, wired into
// bin/opencli and hidden.py) lets one reader through at a time, inside one budget, and stops on
// X's first warning. These tests drive the real shim against a stand-in opencli that answers the
// way X does, with the gate pointed at a throwaway folder — not one call reaches X.

import { execFileSync, spawn } from "node:child_process";
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const SKILL = resolve(__dirname, "../../.claude/skills/dxb-research");
const SHIM = join(SKILL, "bin", "opencli");
const XGATE = join(SKILL, "scripts", "xgate.py");

// X's own words, as opencli prints them (clis/twitter/shared.js describeTwitterApiError).
const SAY_429 =
  "HTTP 429: SearchTimeline fetch failed — rate-limited by Twitter (session quota); retry after cooldown (typically 15-30 min)";
const SAY_DEAD = "AUTH_REQUIRED: Not logged into x.com (no ct0 cookie)";
const SAY_FROZEN = "redirected to https://x.com/account/access — captcha required";

let dir: string;
let bin: string;
let gate: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "xgate-"));
  bin = join(dir, "bin");
  gate = join(dir, "gate");
  execFileSync("mkdir", ["-p", bin]);
  // The stand-in: answers by FAKE_X, leaves a trace of every start, sleeps FAKE_SLEEP seconds.
  writeFileSync(
    join(bin, "opencli"),
    `#!/bin/sh
echo "start $(date +%s.%N)" >> "${dir}/trace"
[ -n "$FAKE_SLEEP" ] && sleep "$FAKE_SLEEP"
case "$FAKE_X" in
  429) echo "${SAY_429}" >&2; echo "end $(date +%s.%N)" >> "${dir}/trace"; exit 1 ;;
  dead) echo "${SAY_DEAD}" >&2; exit 77 ;;
  frozen) echo "${SAY_FROZEN}" >&2; exit 1 ;;
  *) echo "- text: our rate limit post was fine"; echo "end $(date +%s.%N)" >> "${dir}/trace"; exit 0 ;;
esac
`,
  );
  chmodSync(join(bin, "opencli"), 0o755);
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

function env(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  return {
    ...process.env,
    PATH: `${bin}:${process.env.PATH}`,
    DXB_XGATE_DIR: gate,
    PYTHONDONTWRITEBYTECODE: "1",
    ...extra,
  };
}

function opencli(args: string[], extra: Record<string, string> = {}): { out: string; err: string; code: number } {
  try {
    const out = execFileSync("python3", [SHIM, ...args], { encoding: "utf8", env: env(extra), stdio: "pipe" });
    return { out, err: "", code: 0 };
  } catch (e) {
    const x = e as { stdout?: string; stderr?: string; status?: number };
    return { out: String(x.stdout ?? ""), err: String(x.stderr ?? ""), code: x.status ?? 1 };
  }
}

const starts = () => (existsSync(join(dir, "trace")) ? readFileSync(join(dir, "trace"), "utf8").match(/^start/gm)?.length ?? 0 : 0);
const lines = (f: string) => (existsSync(join(gate, f)) ? readFileSync(join(gate, f), "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);
const state = () => (existsSync(join(gate, "state.json")) ? JSON.parse(readFileSync(join(gate, "state.json"), "utf8")) : {});
const now = () => Date.now() / 1000;
const plant = (rows: object[]) => {
  execFileSync("mkdir", ["-p", gate]);
  writeFileSync(join(gate, "calls.jsonl"), rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
};

describe("a read X answers normally", () => {
  it("passes through unchanged, is counted once, and a post that says 'rate limit' is not X saying it", () => {
    const r = opencli(["twitter", "search", "opus", "--limit", "5"]);
    expect(r.code, r.err).toBe(0);
    expect(r.out).toContain("our rate limit post was fine");
    expect(lines("calls.jsonl")).toHaveLength(1);
    expect(lines("calls.jsonl")[0].caller).toBe("research");
    expect(state()).toEqual({});
  });

  it("does not gate opencli's bare help, nor another site", () => {
    opencli(["twitter", "--help"]);
    opencli(["reddit", "search", "opus"]);
    expect(lines("calls.jsonl")).toHaveLength(0);
  });
});

describe("X's first 429 pauses every reader; the second in 24 h closes X for the day", () => {
  it("pauses 30 minutes and refuses the next call without starting it", () => {
    const first = opencli(["twitter", "search", "opus"], { FAKE_X: "429" });
    expect(first.code).toBe(1);
    const pause = state().pause_until - now();
    expect(pause).toBeGreaterThan(29 * 60);
    expect(pause).toBeLessThanOrEqual(30 * 60);
    const before = starts();
    const next = opencli(["twitter", "search", "opus"]);
    expect(next.code).toBe(76);
    expect(next.err).toContain("429");
    expect(starts()).toBe(before);
  });

  it("closes X until the next day on a second 429", () => {
    execFileSync("mkdir", ["-p", gate]);
    writeFileSync(join(gate, "events.jsonl"), JSON.stringify({ ts: now() - 3600, kind: "429" }) + "\n");
    opencli(["twitter", "search", "opus"], { FAKE_X: "429" });
    const st = state();
    expect(st.pause_until).toBeUndefined();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    expect(Math.round(st.closed_until)).toBe(Math.round(midnight.getTime() / 1000));
  });
});

describe("a warning page freezes X until a person clears it; a login wall marks the session dead", () => {
  it("freezes, never self-clears, and opens only on `clear frozen`", () => {
    opencli(["twitter", "thread", "https://x.com/a/status/1"], { FAKE_X: "frozen" });
    expect(state().frozen.detail).toContain("account/access");
    const refused = opencli(["twitter", "search", "opus"]);
    expect(refused.code).toBe(76);
    expect(refused.err).toContain("DONDURULDU");
    execFileSync("python3", [XGATE, "clear", "frozen"], { env: env() });
    expect(opencli(["twitter", "search", "opus"]).code).toBe(0);
  });

  it("marks the session dead on AUTH_REQUIRED and refuses until `clear session_dead`", () => {
    opencli(["twitter", "search", "opus"], { FAKE_X: "dead" });
    expect(state().session_dead).toBeTruthy();
    expect(opencli(["twitter", "search", "opus"]).code).toBe(76);
    execFileSync("python3", [XGATE, "clear", "session_dead"], { env: env() });
    expect(opencli(["twitter", "search", "opus"]).code).toBe(0);
  });
});

describe("one budget for every caller", () => {
  it("refuses the 21st call in 15 minutes", () => {
    plant(Array.from({ length: 20 }, (_, i) => ({ ts: now() - 800 + i * 10, caller: "research" })));
    const r = opencli(["twitter", "search", "opus"]);
    expect(r.code).toBe(76);
    expect(starts()).toBe(0);
  });

  it("refuses the 151st call of the day", () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const since = start.getTime() / 1000;
    const span = Math.max(1, now() - 16 * 60 - since);
    plant(Array.from({ length: 150 }, (_, i) => ({ ts: since + (span * i) / 150, caller: "research" })));
    expect(opencli(["twitter", "search", "opus"]).code).toBe(76);
  });

  it("holds the room to 50 a day while research may still read", () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const since = start.getTime() / 1000;
    const span = Math.max(1, now() - 16 * 60 - since);
    plant(Array.from({ length: 50 }, (_, i) => ({ ts: since + (span * i) / 50, caller: "room" })));
    expect(opencli(["twitter", "search", "opus"], { DXB_X_CALLER: "room" }).code).toBe(76);
    expect(opencli(["twitter", "search", "opus"]).code).toBe(0);
  });
});

describe("one reader at a time, at least 3 seconds apart", () => {
  it("waits out the spacing after the last call", () => {
    plant([{ ts: now() - 1, caller: "research" }]);
    const t0 = Date.now();
    expect(opencli(["twitter", "search", "opus"]).code).toBe(0);
    expect(Date.now() - t0).toBeGreaterThanOrEqual(1800);
  });

  it("never lets two readers overlap", async () => {
    const run = () =>
      new Promise<number>((done) => {
        const p = spawn("python3", [SHIM, "twitter", "search", "opus"], { env: env({ FAKE_SLEEP: "1.5" }), stdio: "ignore" });
        p.on("exit", (c) => done(c ?? 1));
      });
    const codes = await Promise.all([run(), run()]);
    expect(codes).toEqual([0, 0]);
    const t = readFileSync(join(dir, "trace"), "utf8")
      .trim()
      .split("\n")
      .map((l) => l.split(" ") as [string, string]);
    expect(t.map(([k]) => k)).toEqual(["start", "end", "start", "end"]);
    expect(Number(t[2][1]) - Number(t[1][1])).toBeGreaterThanOrEqual(2.9);
  }, 20000);
});

describe("hidden.py reads an X page's final address, never its body", () => {
  const verdict = (href: string, password = false) =>
    execFileSync(
      "python3",
      ["-c", `import sys; sys.path.insert(0, ${JSON.stringify(join(SKILL, "scripts"))}); import hidden; print(hidden.x_verdict(${JSON.stringify(href)}, ${password ? "True" : "False"}))`],
      { encoding: "utf8", env: env() },
    ).trim();

  it("names the access page frozen, the login wall dead, a post ok, and a t.co that left X ok", () => {
    expect(verdict("https://x.com/account/access")).toBe("frozen");
    expect(verdict("https://x.com/i/flow/login?redirect_after_login=%2Fhome")).toBe("session_dead");
    expect(verdict("https://x.com/karpathy/status/1")).toBe("ok");
    expect(verdict("https://example.com/login")).toBe("ok");
    expect(verdict("https://x.com/home", true)).toBe("session_dead");
  });
});
