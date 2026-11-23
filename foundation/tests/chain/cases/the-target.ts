import { describe, expect, it } from "vitest";
import { TargetRefused } from "@dxb-foundation/bench";
import { applyChain } from "@dxb-foundation/chain";
import { PEOPLE, chainOf } from "../fixtures/chain-files.ts";
import { chainRoot } from "../fixtures/chain-on-disk.ts";
import { filesLedgered, hasTheLedgersSchema, standingOf } from "../fixtures/looking.ts";
import { refusalOf } from "../fixtures/refusal.ts";
import { sleepingFile, startRun, untilASessionSleeps } from "../fixtures/running.ts";
import { CASE_MS, inAThrowawayDatabase } from "../fixtures/throwaway-database.ts";

// SPEC §6, "the guard", and §9.4, "the target": every connection of a run is
// asked who it is before it is sent anything else, and the bench's refusal is
// not caught.

// The lost-identity case rests on a sleep as its margin (SPEC §10): the list is
// rewritten once the server shows the first file's session asleep, and the next
// file's connection cannot open before the sleep ends. See fixtures/running.ts.

export function theTarget(): void {
  describe("the target", { timeout: CASE_MS }, () => {
    it("a database whose identity the list does not hold is refused: not-listed, and no schema os_chain is made in it", async () => {
      await inAThrowawayDatabase(async (db) => {
        // The list holds the instance's own database, as the machine's real list does — and not this one.
        db.relist([{ sysid: db.identity.sysid, dboid: "5", dbname: "postgres" }]);
        const refusal = await refusalOf(TargetRefused, () => applyChain({ target: db.target, root: chainRoot(chainOf(PEOPLE)) }));
        expect(refusal.reason).toBe("not-listed");
        expect(await hasTheLedgersSchema(db.client)).toBe(false);
        expect(await standingOf(db.client, "public.people")).toEqual([]);
      });
    });

    it("a list that loses the identity while a file sleeps: the next file's connection is refused, and the first file stays ledgered", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = chainRoot({
          "0001-slow.sql": sleepingFile("create table public.slow (id integer);"),
          "0002-next.sql": "create table public.next (id integer);\n",
        });
        const run = startRun({ target: db.target, root });
        try {
          await untilASessionSleeps(db.client, db.identity.dbname);
          db.relist([]);
          expect(run.ended()).toBe(false);
          const refusal = await refusalOf(TargetRefused, () => run.outcome());
          expect(refusal.reason).toBe("not-listed");
        } finally {
          await run.over;
        }
        expect(await filesLedgered(db.client)).toEqual(["(ledger)", "0001-slow.sql"]);
        expect(await standingOf(db.client, "public.slow", "public.next")).toEqual(["public.slow"]);

        // The list holds it again: the refused run let the lock go, and the next one applies what was left.
        db.relist([db.identity]);
        expect(await applyChain({ target: db.target, root })).toEqual({ state: "applied", applied: ["0002-next.sql"], standing: 2 });
      });
    });
  });
}
