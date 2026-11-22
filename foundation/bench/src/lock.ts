import { NotBuilt } from "./not-built.ts";

export class LockRefused extends Error {}

export type HostLock = { readonly path: string; held(): boolean; release(): void };

export function defaultLockPath(): string {
  throw new NotBuilt("defaultLockPath");
}

/** Synchronous. Not acquired at once (or within waitSeconds) → LockRefused. */
export function acquireHostLock(opts?: { path?: string; waitSeconds?: number }): HostLock {
  throw new NotBuilt("acquireHostLock");
}

/** Throws unless this process holds the lock now — asked of the kernel, not of a flag. */
export function assertHeld(lock: HostLock): void {
  throw new NotBuilt("assertHeld");
}
