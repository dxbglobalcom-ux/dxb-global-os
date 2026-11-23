import { rmSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ChainRefused, applyChain } from "@dxb-foundation/chain";
import { writeARowByHand } from "../fixtures/by-hand.ts";
import { PEOPLE, chainOf } from "../fixtures/chain-files.ts";
import { chainRoot, inSchema } from "../fixtures/chain-on-disk.ts";
import { filesLedgered, serverClock, standingOf } from "../fixtures/looking.ts";
import { refusalOf } from "../fixtures/refusal.ts";
import { sleepingFile, startRun, untilASessionJoins, untilASessionSleeps, type StartedRun } from "../fixtures/running.ts";
import { CASE_MS, inAThrowawayDatabase, type Throwaway } from "../fixtures/throwaway-database.ts";

// SPEC §6 step 2 and §9.4, "one runner at a time". The first run sits in a file
// that sleeps; the second is started once the server shows it asleep. The
// margins are said where the sleep is made: fixtures/running.ts.

// Longer than the sleep by far: the second run is let in when the first ends, not when this runs out.
const LONG_WAIT_SECONDS = 30;

const slowChain = (): string => chainRoot({ "0001-slow.sql": sleepingFile("create table public.slow (id integer);") });
const SLOW_APPLIED = { state: "applied", applied: ["0001-slow.sql"], standing: 1 };

/**
 * SPEC §12.8: a first run asleep in its file, and a second with a long wait that is seen to stand at the lock
 * while the first still sleeps — it waits for the first, it does not merely come after it. Then `work`, within
 * what is left of the sleep. Both runs are over when this ends, however the work ends.
 */
async function withASecondRunAtTheLock(db: Throwaway, root: string, work: (first: StartedRun, second: StartedRun) => Promise<void>): Promise<void> {
  const first = startRun({ target: db.target, root });
  let second: StartedRun | undefined;
  try {
    await untilASessionSleeps(db.client, db.identity.dbname);
    const whileTheFirstSleeps = await serverClock(db.client);
    second = startRun({ target: db.target, root, lockWaitSeconds: LONG_WAIT_SECONDS });
    // The first had not ended when the second was started,
    expect(first.ended()).toBe(false);
    await untilASessionJoins(db.client, db.identity.dbname, whileTheFirstSleeps);
    // and with the second's connection open and the first still asleep, the second had not ended either.
    expect([first.ended(), second.ended()]).toEqual([false, false]);
    await work(first, second);
  } finally {
    await Promise.all([first.over, second?.over]);
  }
}

export function oneRunnerAtATime(): void {
  describe("one runner at a time", { timeout: CASE_MS }, () => {
    it("while a run sits in a file that sleeps, a second run with no wait is refused at once: busy — and the first goes on to its end", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = slowChain();
        const first = startRun({ target: db.target, root });
        try {
          await untilASessionSleeps(db.client, db.identity.dbname);
          const refusal = await refusalOf(ChainRefused, () => applyChain({ target: db.target, root }));
          expect(refusal.reason).toBe("busy");
          expect(first.ended()).toBe(false);
          expect(await first.outcome()).toEqual(SLOW_APPLIED);
        } finally {
          await first.over;
        }
      });
    });

    it("a second run with a wait stands at the lock while the first sleeps, runs after it, and applies nothing", async () => {
      await inAThrowawayDatabase(async (db) => {
        await withASecondRunAtTheLock(db, slowChain(), async (first, second) => {
          // It found the file standing: it read the ledger after the first run had committed it.
          expect(await second.outcome()).toEqual({ state: "applied", applied: [], standing: 1 });
          expect(await first.outcome()).toEqual(SLOW_APPLIED);
        });
      });
    });

    it("a file added while a run waits for the lock is applied by that run: its disk is the disk as it stands under the lock", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = slowChain();
        await withASecondRunAtTheLock(db, root, async (first, second) => {
          // SPEC §12.5. The second run read the disk before it opened its connection, and this file was not there.
          // Written within the sleep: one small file, and the first run is seen not to have ended after it.
          writeFileSync(inSchema(root, "0002-added.sql"), "create table public.added (id integer);\n");
          expect(first.ended()).toBe(false);
          expect(await second.outcome()).toEqual({ state: "applied", applied: ["0002-added.sql"], standing: 2 });
          expect(await first.outcome()).toEqual(SLOW_APPLIED);
        });
        expect(await filesLedgered(db.client)).toEqual(["(ledger)", "0001-slow.sql", "0002-added.sql"]);
        expect(await standingOf(db.client, "public.slow", "public.added")).toEqual(["public.slow", "public.added"]);
      });
    });

    it("a wait that runs out is the same refusal: busy, after the wait and not before", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = slowChain();
        const first = startRun({ target: db.target, root });
        try {
          await untilASessionSleeps(db.client, db.identity.dbname);
          const asked = Date.now();
          const refusal = await refusalOf(ChainRefused, () => applyChain({ target: db.target, root, lockWaitSeconds: 1 }));
          const waitedMs = Date.now() - asked;
          expect(refusal.reason).toBe("busy");
          expect(first.ended()).toBe(false);
          expect(waitedMs).toBeGreaterThanOrEqual(900);
          expect(await first.outcome()).toEqual(SLOW_APPLIED);
        } finally {
          await first.over;
        }
      });
    });

    it("after a run ended — in a failed file, well, in offences — the next takes the lock at once", async () => {
      await inAThrowawayDatabase(async (db) => {
        // No run below waits: each one that is not refused shows that the run before it let the lock go.
        const root = chainRoot({ ...chainOf(PEOPLE), "0002-divides.sql": "select 1/0;\n" });
        const run = () => applyChain({ target: db.target, root });
        expect(await run()).toMatchObject({ state: "file-failed", file: "0002-divides.sql" });
        writeFileSync(inSchema(root, "0002-divides.sql"), "select 1/1;\n");
        expect(await run()).toEqual({ state: "applied", applied: ["0002-divides.sql"], standing: 2 });
        rmSync(inSchema(root, "0001-people.sql"));
        expect(await run()).toEqual({ state: "offences", offences: [{ kind: "missing", detail: "0001-people.sql" }] });
        expect(await run()).toEqual({ state: "offences", offences: [{ kind: "missing", detail: "0001-people.sql" }] });
      });
    });
  });

  // SPEC §12.1: a run says the position of every row it writes — the count of the ledger it read under the
  // lock, plus one — and the primary key refuses a second row there. So a ledger that moved under a run
  // stops it before the file's text is sent.
  describe("the ledger moved under a run", { timeout: CASE_MS }, () => {
    it("another hand writes at the position a run's third file will want: ledger-moved, the third left nothing, the first two stay ledgered", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = chainRoot({
          ...chainOf(PEOPLE),
          "0002-slow.sql": sleepingFile("create table public.slow (id integer);"),
          "0003-later.sql": "create table public.later (id integer);\n",
        });
        const run = startRun({ target: db.target, root });
        try {
          await untilASessionSleeps(db.client, db.identity.dbname);
          // Row 0 is the ledger's own and the first two files hold 1 and 2: the third will want 3. Written within
          // the sleep — one insert, which waits for nothing: the second file's row, not yet committed, holds another
          // position and another name.
          await writeARowByHand(db.client, { position: 3, file: "0009-by-another-hand.sql", kind: "schema" });
          expect(run.ended()).toBe(false);
          const refusal = await refusalOf(ChainRefused, () => run.outcome());
          expect(refusal.reason).toBe("ledger-moved");
        } finally {
          await run.over;
        }
        expect(await filesLedgered(db.client)).toEqual(["(ledger)", "0001-people.sql", "0002-slow.sql", "0009-by-another-hand.sql"]);
        expect(await standingOf(db.client, "public.people", "public.slow", "public.later")).toEqual(["public.people", "public.slow"]);
      });
    });
  });
}
