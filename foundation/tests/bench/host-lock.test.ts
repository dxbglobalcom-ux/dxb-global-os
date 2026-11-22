import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir, userInfo } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LockRefused, acquireHostLock, assertHeld, defaultLockPath, type HostLock } from "@dxb-foundation/bench";

const holdLock = fileURLToPath(new URL("./fixtures/hold-lock.ts", import.meta.url));

let directory: string;
let path: string;
const children: ChildProcess[] = [];
const taken: HostLock[] = [];

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "dxb-foundation-lock-"));
  path = join(directory, "host.lock");
});

afterEach(() => {
  for (const lock of taken.splice(0)) if (lock.held()) lock.release();
  for (const child of children.splice(0)) {
    child.stdin?.end();
    child.kill("SIGKILL");
  }
  rmSync(directory, { recursive: true, force: true });
});

/** acquireHostLock, remembered so the test's end lets it go whatever happened. */
function take(opts: { path: string; waitSeconds?: number }): HostLock {
  const lock = acquireHostLock(opts);
  taken.push(lock);
  return lock;
}

/** Resolves once the process has said HELD; rejects with what it said if it ends before that. */
function onceItHolds(child: ChildProcess): Promise<ChildProcess> {
  children.push(child);
  return new Promise((resolve, reject) => {
    let said = "";
    let complained = "";
    child.stdout?.on("data", (chunk) => {
      said += String(chunk);
      if (said.includes("HELD")) resolve(child);
    });
    child.stderr?.on("data", (chunk) => (complained += String(chunk)));
    child.on("error", reject);
    child.on("exit", (code, signal) =>
      reject(new Error(`the holder ended before it held the lock (${code ?? signal}): ${complained.trim()}`)),
    );
  });
}

/** Another process that holds the lock through the bench's own acquireHostLock. */
const anotherProcessHolding = (lockPath: string, milliseconds?: number): Promise<ChildProcess> =>
  onceItHolds(spawn(process.execPath, [holdLock, lockPath, ...(milliseconds ? [String(milliseconds)] : [])]));

/** A holder that knows nothing of the bench: util-linux `flock` holds the path until its stdin closes. */
const flockHolding = (lockPath: string): Promise<ChildProcess> =>
  onceItHolds(
    spawn("flock", [
      "-n",
      lockPath,
      process.execPath,
      "-e",
      "process.stdout.write('HELD\\n'); process.stdin.resume(); process.stdin.on('end', () => process.exit(0));",
    ]),
  );

/** What the kernel answers to one non-blocking `flock` on the path: true when the lock is free. */
const kernelSaysFree = (lockPath: string): boolean => spawnSync("flock", ["-n", lockPath, "true"]).status === 0;

const ended = (child: ChildProcess): Promise<void> =>
  new Promise((resolve) => {
    if (child.exitCode !== null || child.signalCode !== null) resolve();
    else child.on("exit", () => resolve());
  });

describe("the host lock — one holder on the machine, held by the kernel", { timeout: 30_000 }, () => {
  it("is taken at the path it was asked for, and says so", () => {
    const lock = take({ path });
    expect(lock.path).toBe(path);
    expect(lock.held()).toBe(true);
    expect(kernelSaysFree(path)).toBe(false);
  });

  it("refuses a second process at once while the first holds", async () => {
    await anotherProcessHolding(path);
    const started = Date.now();
    expect(() => acquireHostLock({ path })).toThrow(LockRefused);
    expect(Date.now() - started).toBeLessThan(2_000);
  });

  it("refuses while a holder that is not the bench holds the kernel's flock on the path", async () => {
    await flockHolding(path);
    expect(() => acquireHostLock({ path })).toThrow(LockRefused);
  });

  it("refuses a second acquireHostLock on the same path from the same process, and the first stays held", () => {
    const first = take({ path });
    expect(() => acquireHostLock({ path })).toThrow(LockRefused);
    expect(first.held()).toBe(true);
    expect(() => assertHeld(first)).not.toThrow();
  });

  it("with waitSeconds, acquires after the first lets go", async () => {
    await anotherProcessHolding(path, 1_500);
    const started = Date.now();
    const lock = take({ path, waitSeconds: 15 });
    const waited = Date.now() - started;
    expect(lock.held()).toBe(true);
    expect(waited).toBeGreaterThanOrEqual(1_000);
    expect(waited).toBeLessThan(10_000);
  });

  it("with waitSeconds, is refused once that time has passed and the holder has not let go", async () => {
    await anotherProcessHolding(path);
    const started = Date.now();
    expect(() => acquireHostLock({ path, waitSeconds: 1 })).toThrow(LockRefused);
    const waited = Date.now() - started;
    expect(waited).toBeGreaterThanOrEqual(900);
    expect(waited).toBeLessThan(8_000);
  });

  it("is freed when its holder is killed with SIGKILL", async () => {
    const holder = await anotherProcessHolding(path);
    expect(() => acquireHostLock({ path })).toThrow(LockRefused);
    holder.kill("SIGKILL");
    await ended(holder);
    const lock = take({ path, waitSeconds: 5 });
    expect(lock.held()).toBe(true);
  });

  it("is not held by a lock file left behind — a file holds nothing, only a living process does", () => {
    writeFileSync(path, "424242\n");
    const lock = take({ path });
    expect(lock.held()).toBe(true);
  });

  it("after release() it is not held: held() is false, assertHeld throws, and the kernel gives it to the next", () => {
    const lock = take({ path });
    expect(() => assertHeld(lock)).not.toThrow();
    lock.release();
    expect(lock.held()).toBe(false);
    expect(() => assertHeld(lock)).toThrow();
    expect(kernelSaysFree(path)).toBe(true);
  });
});

describe("assertHeld — asked of the kernel, not of a flag", { timeout: 30_000 }, () => {
  const sayingItIsHeld = (lockPath: string): HostLock => ({ path: lockPath, held: () => true, release: () => {} });

  it("passes for a lock this process took and still holds", () => {
    expect(() => assertHeld(take({ path }))).not.toThrow();
  });

  it("throws for an object that only says it is held, on a path nobody holds", () => {
    expect(() => assertHeld(take({ path }))).not.toThrow();
    expect(() => assertHeld(sayingItIsHeld(join(directory, "nobody.lock")))).toThrow();
  });

  it("throws for an object that only says it is held, on a path another process holds", async () => {
    expect(() => assertHeld(take({ path }))).not.toThrow();
    const theirs = join(directory, "theirs.lock");
    await anotherProcessHolding(theirs);
    expect(() => assertHeld(sayingItIsHeld(theirs))).toThrow();
  });
});

describe("defaultLockPath — one fixed place per user, moved by no variable of ours", () => {
  it("is /run/user/<uid>/dxb-foundation-bench.lock, or /tmp/dxb-foundation-bench-<uid>.lock without that directory", () => {
    const uid = userInfo().uid;
    const expected = existsSync(`/run/user/${uid}`)
      ? `/run/user/${uid}/dxb-foundation-bench.lock`
      : `/tmp/dxb-foundation-bench-${uid}.lock`;
    expect(defaultLockPath()).toBe(expected);
  });
});
