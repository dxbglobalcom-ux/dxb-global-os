import { rmSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ChainRefused, applyChain } from "@dxb-foundation/chain";
import { PEOPLE, chainOf } from "../fixtures/chain-files.ts";
import { chainRoot, inSchema } from "../fixtures/chain-on-disk.ts";
import { refusalOf } from "../fixtures/refusal.ts";
import { sleepingFile, startRun, untilASessionSleeps } from "../fixtures/running.ts";
import { CASE_MS, inAThrowawayDatabase } from "../fixtures/throwaway-database.ts";

// SPEC §6 step 2 and §9.4, "one runner at a time". The first run sits in a file
// that sleeps; the second is started once the server shows it asleep. The
// margins are said where the sleep is made: fixtures/running.ts.

// Longer than the sleep by far: the second run is let in when the first ends, not when this runs out.
const LONG_WAIT_SECONDS = 30;

const slowChain = (): string => chainRoot({ "0001-slow.sql": sleepingFile("create table public.slow (id integer);") });
const SLOW_APPLIED = { state: "applied", applied: ["0001-slow.sql"], standing: 1 };

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

    it("a second run with a wait runs after the first, and applies nothing", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = slowChain();
        const first = startRun({ target: db.target, root });
        try {
          await untilASessionSleeps(db.client, db.identity.dbname);
          // It found the file standing: it read the ledger after the first run had committed it.
          expect(await applyChain({ target: db.target, root, lockWaitSeconds: LONG_WAIT_SECONDS })).toEqual({ state: "applied", applied: [], standing: 1 });
          expect(await first.outcome()).toEqual(SLOW_APPLIED);
        } finally {
          await first.over;
        }
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
}
