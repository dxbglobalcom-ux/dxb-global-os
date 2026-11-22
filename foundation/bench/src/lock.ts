import { spawnSync } from "node:child_process";
import { closeSync, constants, existsSync, fstatSync, openSync, statSync } from "node:fs";
import { userInfo } from "node:os";

export class LockRefused extends Error {
  name = "LockRefused";
}

export type HostLock = { readonly path: string; held(): boolean; release(): void };

/** `/run/user/<uid>/dxb-foundation-bench.lock`; without that directory, `/tmp/dxb-foundation-bench-<uid>.lock`. */
export function defaultLockPath(): string {
  const uid = userInfo().uid;
  const runtimeDirectory = `/run/user/${uid}`;
  return existsSync(runtimeDirectory) ? `${runtimeDirectory}/dxb-foundation-bench.lock` : `/tmp/dxb-foundation-bench-${uid}.lock`;
}

// The locks this process took, each with the descriptor it holds. The kernel's
// lock belongs to that descriptor's open file: it lasts while the descriptor is
// open here and ends with this process, however the process ends. No pid file,
// no flag: an object that is not in this map holds nothing.
const taken = new Map<HostLock, number>();

/** util-linux `flock` ends with 1 when the lock is another's — at once with `-n`, or after the wait. */
const HELD_BY_ANOTHER = 1;

/**
 * Asks the kernel for the exclusive lock on the open file behind `descriptor`.
 * True when that open file holds it after the call — which is also the answer
 * for one that already held it. False when another open file holds it.
 */
function kernelGrants(descriptor: number, waitSeconds?: number): boolean {
  const howLong = waitSeconds ? ["--timeout", String(waitSeconds)] : ["--nonblock"];
  const asked = spawnSync("flock", [...howLong, "3"], {
    stdio: ["ignore", "ignore", "pipe", descriptor],
    encoding: "utf8",
    timeout: ((waitSeconds ?? 0) + 10) * 1_000,
  });
  if (asked.error !== undefined) throw asked.error;
  if (asked.status === 0) return true;
  if (asked.status === HELD_BY_ANOTHER) return false;
  throw new Error(`flock ended with ${asked.status ?? asked.signal}: ${asked.stderr.trim()}`);
}

/** True when `path` still names the very file `descriptor` has open — a lock on a file that was replaced guards nothing. */
function stillNames(path: string, descriptor: number): boolean {
  const named = statSync(path, { throwIfNoEntry: false });
  const open = fstatSync(descriptor);
  return named !== undefined && named.dev === open.dev && named.ino === open.ino;
}

function heldNow(lock: HostLock): boolean {
  const descriptor = taken.get(lock);
  return descriptor !== undefined && stillNames(lock.path, descriptor) && kernelGrants(descriptor);
}

/** Synchronous. Not acquired at once (or within waitSeconds) → LockRefused. */
export function acquireHostLock(opts?: { path?: string; waitSeconds?: number }): HostLock {
  const path = opts?.path ?? defaultLockPath();
  const waitSeconds = opts?.waitSeconds;
  if (waitSeconds !== undefined && !(Number.isFinite(waitSeconds) && waitSeconds >= 0)) {
    throw new RangeError(`waitSeconds must be a number of seconds, zero or more — not ${waitSeconds}`);
  }
  // Opened for reading only and never truncated or removed: what the file holds is nothing to the lock.
  const descriptor = openSync(path, constants.O_RDONLY | constants.O_CREAT | constants.O_NOFOLLOW, 0o600);
  let granted = false;
  try {
    granted = kernelGrants(descriptor, waitSeconds);
  } finally {
    if (!granted) closeSync(descriptor);
  }
  if (!granted) throw new LockRefused(`the host lock ${path} is held by another`);

  const lock: HostLock = Object.freeze({
    path,
    held: () => heldNow(lock),
    release: () => {
      const held = taken.get(lock);
      if (held === undefined) return;
      taken.delete(lock);
      // Closing the only descriptor of the open file is what gives the lock back.
      closeSync(held);
    },
  });
  taken.set(lock, descriptor);
  return lock;
}

/** Throws unless this process holds the lock now — asked of the kernel, not of a flag. */
export function assertHeld(lock: HostLock): void {
  if (!heldNow(lock)) throw new LockRefused(`the host lock ${lock.path} is not held by this process`);
}

/** Throws unless `lock` is the one host lock and this process holds it now: a lock on another path guards nothing of the bench. */
export function assertTheHostLock(lock: HostLock): void {
  assertHeld(lock);
  if (lock.path !== defaultLockPath()) {
    throw new LockRefused(`${lock.path} is held, and it is not the host lock ${defaultLockPath()}`);
  }
}
