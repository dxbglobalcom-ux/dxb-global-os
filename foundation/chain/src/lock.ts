// One runner at a time (SPEC §6.2): a session-level advisory lock on the target database, on a connection of its own.
import { performance } from "node:perf_hooks";
import { setTimeout as sleep } from "node:timers/promises";
import type { Client } from "pg";
import { ChainRefused } from "./outcome.ts";
import type { InASession } from "./session.ts";

// The package's one key: the eight bytes of "os_chain" read as one number. The server keeps an
// advisory lock per database, so the same key serves every target.
const KEY = "8030867441089341806";
const ASK = "select pg_catalog.pg_try_advisory_lock($1::bigint) as granted";
const ASKED_EVERY_MS = 100;

/**
 * Asks for the lock at once, and then again until it is granted or `waitSeconds` have passed. True when this
 * session holds it to keep. The wait is an upper bound (SPEC §12.8): the lock is not asked again once the deadline
 * has passed, and a grant that comes after it is not taken — the refusal closes the session, and the lock goes with it.
 */
async function granted(conn: Client, waitSeconds: number): Promise<boolean> {
  const deadline = performance.now() + waitSeconds * 1_000;
  const ask = async (): Promise<boolean> => (await conn.query(ASK, [KEY])).rows[0]?.granted === true;
  // The first ask is the run's "at once": with no wait it is the only one, and its answer is taken as it comes.
  if (await ask()) return true;
  for (;;) {
    const left = deadline - performance.now();
    if (left <= 0) return false;
    await sleep(Math.min(ASKED_EVERY_MS, left));
    // A sleep may end late: the deadline is asked again before the lock is, and once more when the lock answers.
    if (performance.now() >= deadline) return false;
    if (await ask()) return performance.now() < deadline;
  }
}

/**
 * `work` while this run holds the target's lock, on a session of the run's own (`inASession`). Not granted at once
 * (or within `waitSeconds`) → ChainRefused("busy").
 * The lock lives exactly as long as its session, and the session is closed however the work ends: that is what
 * lets the lock go on every path. `assertHeld` is for the work to call before each thing it writes — it throws
 * once that session no longer answers, for then the lock is gone and another run may have begun.
 */
export async function underTheLock<T>(inASession: InASession, waitSeconds: number | undefined, work: (assertHeld: () => Promise<void>) => Promise<T>): Promise<T> {
  if (waitSeconds !== undefined && !(Number.isFinite(waitSeconds) && waitSeconds >= 0)) {
    throw new RangeError(`lockWaitSeconds must be a number of seconds, zero or more — not ${waitSeconds}`);
  }
  return inASession(async (conn) => {
    if (!(await granted(conn, waitSeconds ?? 0))) throw new ChainRefused("busy");
    return work(async () => {
      try {
        await conn.query("select 1");
      } catch (cause) {
        throw new Error("the chain's lock is lost: its session no longer answers", { cause });
      }
    });
  });
}
