// dxb-team2 §5 (2026-10-06) — the engine's lock may QUEUE instead of refusing.
//
// Every run on the construction engine takes one lock,
// `${TMPDIR:-/tmp}/dxb-construction-battery.lock`, at three sites: battery.sh,
// run.sh and tests/global-teardown.ts. With `flock -n` a second run is refused
// outright (exit 2), so two writing helpers running their own vitest files side
// by side collide instead of taking turns. `DXB_ENGINE_LOCK_WAIT=<seconds>` (a
// positive integer) makes each site wait that long first, saying so once on
// stderr, and refuse exactly as before when the wait runs out. Anything else —
// unset, empty, "abc", "0", "-5", "1e3" — is today's immediate refusal.
//
// WHAT THIS FILE NEVER TOUCHES. Every case runs with a private TMPDIR, so the
// real engine lock is never taken or waited on, and with a private PATH whose
// `sudo`, `pnpm` and `psql` are stubs: run.sh's last step reaches a stub instead
// of the wall, and even a battery that somehow got past its lock could reach
// neither a database nor a suite. No database is opened here.
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { accessSync, constants, chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it, vi } from "vitest";

const REPO = join(__dirname, "../..");
const RUN = join(REPO, "scripts/construction/run.sh");
const BATTERY = join(REPO, "scripts/construction/battery.sh");
const WALL = "/usr/local/sbin/dxb-construction-sandbox";
const LOCK_NAME = "dxb-construction-battery.lock";

const wallInstalled = (() => {
  try {
    accessSync(WALL, constants.X_OK);
    return true;
  } catch {
    return false;
  }
})();

interface Bench {
  dir: string;
  lock: string;
  bin: string;
}
const benches: Bench[] = [];
const holders: ChildProcess[] = [];

function bench(): Bench {
  const dir = mkdtempSync(join(tmpdir(), "engine-lock-wait-"));
  const bin = join(dir, "bin");
  mkdirSync(bin);
  const stub = (name: string, body: string) => {
    writeFileSync(join(bin, name), `#!/bin/sh\n${body}\n`);
    chmodSync(join(bin, name), 0o755);
  };
  stub("sudo", 'echo "STUB-WALL-REACHED"; exit 0');
  stub("pnpm", 'echo "STUB-PNPM-REACHED"; exit 97');
  stub("psql", 'echo "STUB-PSQL-REACHED" >&2; exit 97');
  const b = { dir, lock: join(dir, LOCK_NAME), bin };
  benches.push(b);
  return b;
}

/** Hold the bench's lock for `seconds`, resolving once it is really held. */
function holdLock(b: Bench, seconds: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("flock", ["-n", b.lock, "sh", "-c", `echo HELD; exec sleep ${seconds}`], {
      stdio: ["ignore", "pipe", "ignore"],
      detached: true, // its own group, so cleanup reaches the `sleep` that owns the descriptor
    });
    holders.push(child);
    child.stdout?.on("data", (d: Buffer) => {
      if (d.toString().includes("HELD")) resolve();
    });
    child.on("exit", (code) => reject(new Error(`the test's own holder could not take the lock (exit ${code})`)));
    child.on("error", reject);
  });
}

/** The environment of a run that nobody is holding the engine for. */
function envFor(b: Bench, wait?: string): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, TMPDIR: b.dir, PATH: `${b.bin}:${process.env.PATH ?? ""}` };
  delete env.DXB_ENGINE_LOCK_HELD;
  delete env.DXB_CONSTRUCTION_SANDBOX;
  delete env.DXB_ENGINE_LOCK_WAIT;
  if (wait !== undefined) env.DXB_ENGINE_LOCK_WAIT = wait;
  return env;
}

function runScript(script: string, b: Bench, wait?: string) {
  const t0 = Date.now();
  const r = spawnSync("bash", [script, "true"], { env: envFor(b, wait), encoding: "utf8", timeout: 15_000 });
  return { status: r.status, out: r.stdout, err: r.stderr, all: r.stdout + r.stderr, secs: (Date.now() - t0) / 1000 };
}

const count = (s: string, needle: RegExp) => (s.match(new RegExp(needle, "g")) ?? []).length;

afterEach(() => {
  for (const h of holders.splice(0)) {
    try {
      if (h.pid) process.kill(-h.pid, "SIGKILL");
    } catch {
      /* already gone */
    }
  }
  for (const b of benches.splice(0)) rmSync(b.dir, { recursive: true, force: true });
});

describe("run.sh — the door", () => {
  it.skipIf(!wallInstalled)("unset: refuses at once with exit 2 while the engine is held", async () => {
    const b = bench();
    await holdLock(b, 3);
    const r = runScript(RUN, b);
    expect(r.status).toBe(2);
    expect(r.err).toContain("REFUSED: another run already holds the construction engine.");
    expect(r.all).not.toMatch(/waiting up to/);
    expect(r.all).not.toContain("STUB-WALL-REACHED");
    expect(r.secs).toBeLessThan(0.8);
  });

  it.skipIf(!wallInstalled)("DXB_ENGINE_LOCK_WAIT=1: waits ~1 s, says so once, then refuses as today", async () => {
    const b = bench();
    await holdLock(b, 3);
    const r = runScript(RUN, b, "1");
    expect(r.status).toBe(2);
    expect(count(r.err, /waiting up to 1 s for the construction engine/)).toBe(1);
    expect(r.err).toContain("REFUSED: another run already holds the construction engine.");
    expect(r.all).not.toContain("STUB-WALL-REACHED");
    expect(r.secs).toBeGreaterThanOrEqual(0.9);
    expect(r.secs).toBeLessThan(2.5);
  });

  it.skipIf(!wallInstalled)("DXB_ENGINE_LOCK_WAIT=10: queues behind a 1 s holder and then goes through", async () => {
    const b = bench();
    await holdLock(b, 1);
    const r = runScript(RUN, b, "10");
    expect(r.status).toBe(0);
    expect(count(r.err, /waiting up to 10 s for the construction engine/)).toBe(1);
    expect(r.all).not.toContain("REFUSED");
    expect(r.out).toContain("STUB-WALL-REACHED"); // the step after the lock was reached
    expect(r.secs).toBeGreaterThanOrEqual(0.5);
    expect(r.secs).toBeLessThan(4);
  });

  it.skipIf(!wallInstalled)("a free engine with the wait set is taken without a waiting line", () => {
    const b = bench();
    const r = runScript(RUN, b, "5");
    expect(r.status).toBe(0);
    expect(r.all).not.toMatch(/waiting up to/);
    expect(r.out).toContain("STUB-WALL-REACHED");
  });

  for (const bad of ["", "abc", "0", "-5", "1e3", "2.5", " 3"]) {
    it.skipIf(!wallInstalled)(`invalid DXB_ENGINE_LOCK_WAIT=${JSON.stringify(bad)} behaves as unset`, async () => {
      const b = bench();
      await holdLock(b, 3);
      const r = runScript(RUN, b, bad);
      expect(r.status).toBe(2);
      expect(r.err).toContain("REFUSED: another run already holds the construction engine.");
      expect(r.all).not.toMatch(/waiting up to/);
      expect(r.secs).toBeLessThan(0.8);
    });
  }
});

describe("battery.sh — refuses before it does any work", () => {
  it("unset: refuses at once with exit 2", async () => {
    const b = bench();
    await holdLock(b, 3);
    const r = runScript(BATTERY, b);
    expect(r.status).toBe(2);
    expect(r.out).toContain("REFUSED: another construction battery is already running against this engine.");
    expect(r.all).not.toMatch(/waiting up to|=== 1\/2|STUB-/);
    expect(r.secs).toBeLessThan(0.8);
  });

  it("DXB_ENGINE_LOCK_WAIT=1: waits ~1 s, says so once, then refuses as today", async () => {
    const b = bench();
    await holdLock(b, 4);
    const r = runScript(BATTERY, b, "1");
    expect(r.status).toBe(2);
    expect(count(r.err, /waiting up to 1 s for the construction engine/)).toBe(1);
    expect(r.out).toContain("REFUSED: another construction battery is already running against this engine.");
    expect(r.all).not.toMatch(/=== 1\/2|STUB-/);
    expect(r.secs).toBeGreaterThanOrEqual(0.9);
    expect(r.secs).toBeLessThan(2.5);
  });

  it('invalid DXB_ENGINE_LOCK_WAIT="abc" behaves as unset', async () => {
    const b = bench();
    await holdLock(b, 3);
    const r = runScript(BATTERY, b, "abc");
    expect(r.status).toBe(2);
    expect(r.out).toContain("REFUSED: another construction battery is already running against this engine.");
    expect(r.all).not.toMatch(/waiting up to|=== 1\/2|STUB-/);
    expect(r.secs).toBeLessThan(0.8);
  });
});

describe("global-teardown.ts — takeTheEngine, in this process with a private TMPDIR", () => {
  // ENGINE_LOCK is read from TMPDIR when the module loads, so each case loads a
  // fresh copy after pointing TMPDIR at its own bench. process.exit is caught,
  // so a refusal ends the call and not this worker.
  const saved = { ...process.env };
  afterEach(() => {
    for (const k of ["TMPDIR", "DXB_ENGINE_LOCK_WAIT", "DXB_ENGINE_LOCK_HELD", "DXB_CONSTRUCTION_SANDBOX"]) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
    vi.restoreAllMocks();
  });

  async function load(b: Bench, wait?: string) {
    process.env.TMPDIR = b.dir;
    delete process.env.DXB_ENGINE_LOCK_HELD;
    delete process.env.DXB_CONSTRUCTION_SANDBOX;
    delete process.env.DXB_ENGINE_LOCK_WAIT;
    if (wait !== undefined) process.env.DXB_ENGINE_LOCK_WAIT = wait;
    vi.resetModules();
    vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
      throw new Error(`process.exit(${code})`);
    }) as never);
    const errors: string[] = [];
    vi.spyOn(console, "error").mockImplementation((...a: unknown[]) => void errors.push(a.join(" ")));
    const m = await import("../global-teardown.js");
    return { m, errors };
  }

  async function timed(p: Promise<unknown>) {
    const t0 = Date.now();
    let error: unknown = null;
    try {
      await p;
    } catch (e) {
      error = e;
    }
    return { error, secs: (Date.now() - t0) / 1000 };
  }

  it("unset: refuses at once with exit 2", async () => {
    const b = bench();
    await holdLock(b, 3);
    const { m, errors } = await load(b);
    const r = await timed(m.takeTheEngine());
    expect(String(r.error)).toContain("process.exit(2)");
    expect(errors.join("\n")).toContain("REFUSED: another run already holds the construction engine.");
    expect(errors.join("\n")).not.toMatch(/waiting up to/);
    expect(r.secs).toBeLessThan(0.8);
  });

  it("DXB_ENGINE_LOCK_WAIT=1: waits ~1 s, says so once, then refuses", async () => {
    const b = bench();
    await holdLock(b, 3);
    const { m, errors } = await load(b, "1");
    const r = await timed(m.takeTheEngine());
    expect(String(r.error)).toContain("process.exit(2)");
    expect(count(errors.join("\n"), /waiting up to 1 s for the construction engine/)).toBe(1);
    expect(errors.join("\n")).toContain("REFUSED: another run already holds the construction engine.");
    expect(r.secs).toBeGreaterThanOrEqual(0.9);
    expect(r.secs).toBeLessThan(2.5);
  });

  it("DXB_ENGINE_LOCK_WAIT=10: queues behind a 1 s holder, takes the lock, and gives it back", async () => {
    const b = bench();
    await holdLock(b, 1);
    const { m, errors } = await load(b, "10");
    const r = await timed(m.takeTheEngine());
    expect(r.error).toBeNull();
    expect(count(errors.join("\n"), /waiting up to 10 s for the construction engine/)).toBe(1);
    expect(r.secs).toBeGreaterThanOrEqual(0.5);
    // held by this process now: a third party is refused
    expect(spawnSync("flock", ["-n", b.lock, "true"]).status).not.toBe(0);
    m.releaseTheEngine();
    let free = false;
    for (let i = 0; i < 40 && !free; i++) {
      free = spawnSync("flock", ["-n", b.lock, "true"]).status === 0;
      if (!free) await new Promise((res) => setTimeout(res, 50));
    }
    expect(free).toBe(true);
  });

  it('invalid DXB_ENGINE_LOCK_WAIT="0" behaves as unset', async () => {
    const b = bench();
    await holdLock(b, 3);
    const { m, errors } = await load(b, "0");
    const r = await timed(m.takeTheEngine());
    expect(String(r.error)).toContain("process.exit(2)");
    expect(errors.join("\n")).not.toMatch(/waiting up to/);
    expect(r.secs).toBeLessThan(0.8);
  });

  it("engineLockWait reads only a positive integer", async () => {
    const b = bench();
    const { m } = await load(b);
    const cases: Array<[string | undefined, number | null]> = [
      [undefined, null], ["", null], ["abc", null], ["0", null], ["-5", null],
      ["1e3", null], ["2.5", null], [" 3", null], ["1", 1], ["30", 30],
    ];
    for (const [v, want] of cases) expect(m.engineLockWait(v), String(v)).toBe(want);
  });
});
