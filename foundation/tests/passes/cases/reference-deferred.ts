import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import { valueOf } from "../../chain/fixtures/looking.ts";
import { CASE_MS, inAThrowawayDatabase } from "../../chain/fixtures/throwaway-database.ts";
import { rowsToTheInstant } from "../fixtures/looking-at-os.ts";
import { referenceFailedAt } from "../fixtures/outcomes.ts";
import { CLOSED, EVENT_TYPES_TABLE, MAKES_OS, OPENED, fileOf } from "../fixtures/pass-files.ts";
import { inReference, passesRoot } from "../fixtures/passes-on-disk.ts";
import { THE_THREE_EVENT_TYPES, eventTypesStand } from "../fixtures/standing.ts";

// SPEC §12.8: what is deferred happens inside the pass. Its transaction makes every
// constraint immediate, so a deferred reference's refusal comes at the statement — answered
// as `pass-failed` at that file, not thrown from the commit — and a deferred trigger has
// run before the proof reads the table.

// A table outside the files whose reference is checked only when its transaction ends (NO ACTION, so it writes nothing).
const JOBS_LOG_CHECKED_LATE =
  "create table os.jobs_log (id integer primary key, event text not null constraint logged_event_waits references os.event_types (name) deferrable initially deferred);\n";

// Rewrites a row once the transaction that wrote it ends. Its function lives in `public`, as the trigger's of reference-failing.ts does.
const REWRITES_LATE = [
  "create function public.rewrites_late() returns trigger language plpgsql as $f$ begin update os.event_types set description = 'rewritten' where name = new.name; return null; end $f$;",
  "create constraint trigger rewrites_late after insert on os.event_types deferrable initially deferred for each row execute function public.rewrites_late();",
  "",
].join("\n");

export function referenceDeferred(): void {
  describe("the reference pass — what is deferred happens inside the pass", { timeout: CASE_MS }, () => {
    it("a deferred reference from a table outside the files, onto a value the file no longer holds: pass-failed at that file with the server's message — not thrown", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await eventTypesStand(db, JOBS_LOG_CHECKED_LATE);
        await db.client.query("insert into os.jobs_log (id, event) values (1, 'job.failed')");
        const before = { eventTypes: await rowsToTheInstant(db.client, "os.event_types"), jobsLog: await rowsToTheInstant(db.client, "os.jobs_log") };
        expect([before.eventTypes.length, before.jobsLog.length]).toEqual([3, 1]);

        writeFileSync(inReference(root, "event_types.json"), fileOf({ ...OPENED, weight: 10 }, CLOSED));
        const message = 'update or delete on table "event_types" violates foreign key constraint "logged_event_waits" on table "jobs_log"';
        expect(await applyChain({ target: db.target, root })).toEqual(referenceFailedAt("event_types.json", message));
        expect(await rowsToTheInstant(db.client, "os.event_types")).toEqual(before.eventTypes);
        expect(await rowsToTheInstant(db.client, "os.jobs_log")).toEqual(before.jobsLog);
      });
    });

    it("a deferred constraint trigger that rewrites the row: it has run before the proof, so os.<table> does not equal its file — and nothing is left written", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + EVENT_TYPES_TABLE + REWRITES_LATE }, reference: { "event_types.json": THE_THREE_EVENT_TYPES } });
        expect(await applyChain({ target: db.target, root })).toEqual(referenceFailedAt("event_types.json", "os.event_types does not equal its file after the pass", ["0001-os.sql"]));
        expect(await valueOf(db.client, "select count(*)::int from os.event_types")).toBe(0);
      });
    });
  });
}
