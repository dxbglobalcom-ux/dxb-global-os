// A run that a case starts and does not wait for, and the moment the server shows
// it inside a file that sleeps: what the contention and lost-identity cases stand on.
import type { Client } from "pg";
import { applyChain, type Outcome } from "@dxb-foundation/chain";
import { valueOf } from "./looking.ts";

export type StartedRun = {
  /** True once the run has ended, either way. */
  ended(): boolean;
  /** The run's outcome, or the error it ended in — asked when the case wants it. */
  outcome(): Promise<Outcome>;
  /** Resolves when the run has ended, either way; never rejects. */
  over: Promise<void>;
};

/**
 * `applyChain`, started. Its ending is caught here whichever way it goes, so a
 * case that fails before it asks for the outcome leaves no rejection unhandled.
 */
export function startRun(input: Parameters<typeof applyChain>[0]): StartedRun {
  let ended = false;
  const settled = applyChain(input).then(
    (outcome) => ({ outcome }),
    (failure: unknown) => ({ failure }),
  );
  const over = settled.then(() => {
    ended = true;
  });
  return {
    ended: () => ended,
    over,
    outcome: async () => {
      const how = await settled;
      if ("failure" in how) throw how.failure;
      return how.outcome;
    },
  };
}

// The margins of every case that acts while a file sleeps. The act is started
// the moment the server shows the run's session asleep — asked every 50 ms, not
// after a guessed delay — so what is left of the sleep is the margin: close to
// 3 s for an act that costs one connection or one small file, 2 s for a wait of
// 1 s that must run out. Each such case then says that the run had not ended.
// A case that first waits for a second run's connection (untilASessionJoins)
// spends some tens of milliseconds of that margin on it, and never more than 2 s.
const SLEEP_SECONDS = 3;
// A run reaches its first file in well under a second; this is the room of a busy machine.
const SEEN_ASLEEP_WITHIN_MS = 20_000;

/** Asks the server every 50 ms until it shows what is waited for; one that never shows it within `ms` is an error. */
async function seenWithin(ms: number, shown: () => Promise<boolean>, otherwise: string): Promise<void> {
  const deadline = Date.now() + ms;
  while (!(await shown())) {
    if (Date.now() > deadline) throw new Error(`${otherwise} within ${ms} ms`);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

/** A file that sleeps before it does anything else. `execute` discards what the select answers. */
export const sleepingFile = (then: string): string => `select pg_sleep(${SLEEP_SECONDS});\n${then}\n`;

/**
 * Waits until the server shows a session of this database inside `pg_sleep` —
 * the run is in its sleeping file then, and stays there for what is left of
 * the sleep. A run that never gets there is an error.
 */
export async function untilASessionSleeps(client: Client, database: string): Promise<void> {
  const sleeping = "select count(*)::int from pg_catalog.pg_stat_activity where datname = $1 and wait_event = 'PgSleep'";
  const asleep = async (): Promise<boolean> => (await valueOf(client, sleeping, [database])) !== 0;
  await seenWithin(SEEN_ASLEEP_WITHIN_MS, asleep, `no session of ${database} was seen sleeping`);
}

// A second run opens its first connection some tens of milliseconds after it is started; this is the room of a busy machine.
const SEEN_JOINING_WITHIN_MS = 2_000;

/**
 * Waits until the server shows a client's session in this database that began after `moment` — the server's
 * clock, read while a first run slept in its file: asleep, that run opens no other. So the session is a second
 * run's first connection: it has read the disk (a run opens no connection before, SPEC §6 step 1) and stands
 * at the lock. Seen within the sleep, or an error.
 */
export async function untilASessionJoins(client: Client, database: string, moment: unknown): Promise<void> {
  const begunSince = "select count(*)::int from pg_catalog.pg_stat_activity where datname = $1 and backend_type = 'client backend' and backend_start > $2::timestamptz";
  const joined = async (): Promise<boolean> => (await valueOf(client, begunSince, [database, moment])) !== 0;
  await seenWithin(SEEN_JOINING_WITHIN_MS, joined, `no session of ${database} was seen to begin after ${String(moment)}`);
}
