import { writeFileSync } from "node:fs";
import type { Client } from "pg";
import { describe, expect, it } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import { filesLedgered, valueOf } from "../../chain/fixtures/looking.ts";
import { CASE_MS, inAThrowawayDatabase } from "../../chain/fixtures/throwaway-database.ts";
import { rowsIn, rowsToTheInstant } from "../fixtures/looking-at-os.ts";
import { CLOSED, EVENT_TYPES_BY_NAME, EVENT_TYPES_TABLE, FAILED, MAKES_OS, OPENED, RATES_TABLE, ROUTING_RULES_SEEDED, fileOf, marked } from "../fixtures/pass-files.ts";
import { inReference, passesRoot, standsWith } from "../fixtures/passes-on-disk.ts";
import { eventTypesStand } from "../fixtures/standing.ts";

// SPEC §5 and §9.3, the reference pass on its green paths: after the pass a vocabulary's
// rows, read in the columns its file owns, are exactly the file's rows — and a table of os
// that has no file is not touched.

const LIMITS_TABLE = `create table os.limits (name text primary key, ceiling bigint not null, ratio numeric not null, note text default 'unsaid');\n${marked("limits")}`;
// Spelled as text: 2^53 + 1 is no number of JavaScript's, and 1.10 read as one loses its last digit.
const LIMITS = '[\n  {"name": "wide", "ceiling": 9007199254740993, "ratio": 1.10, "note": null}\n]\n';

/** One event type's row as the server writes it, with the transaction that wrote it. */
const writtenAs = async (client: Client, name: string): Promise<string | undefined> =>
  (await rowsToTheInstant(client, "os.event_types")).find((row) => row.includes(name));

export function referenceReconciled(): void {
  describe("the reference pass — a vocabulary reconciled", { timeout: CASE_MS }, () => {
    it("a row the file changes, one it does not hold, one equal, and a fourth it adds: the table equals the file in the file's columns", async () => {
      await inAThrowawayDatabase(async (db) => {
        // The table is made by a run with no reference/; the three rows are written by hand, the table's own column with them.
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + EVENT_TYPES_TABLE } });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1 });
        await db.client.query(
          `insert into os.event_types (name, description, weight, seen_count) values
             ('job.opened', 'a job was OPENED', 1, 7), ('job.held', 'a job is held', 9, 3), ('job.closed', 'a job was closed', 2, 5)`,
        );
        const theEqualRow = await writtenAs(db.client, "job.closed");

        standsWith(root, "reference", { "event_types.json": fileOf(OPENED, CLOSED, FAILED) });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, reference: 1 });
        // The changed row and the equal row keep what was written in the table's own column; the new row has its default.
        expect(await rowsIn(db.client, EVENT_TYPES_BY_NAME)).toEqual([
          { name: "job.closed", description: "a job was closed", weight: 2, seen_count: 5 },
          { name: "job.failed", description: "a job failed", weight: 3, seen_count: 0 },
          { name: "job.opened", description: "a job was opened", weight: 1, seen_count: 7 },
        ]);
        // And the equal row was not written again by the run that changed its neighbours.
        expect(theEqualRow).toMatch(/job\.closed.* written by \d+$/);
        expect(await writtenAs(db.client, "job.closed")).toBe(theEqualRow);
        expect(await filesLedgered(db.client)).toEqual(["(ledger)", "0001-os.sql"]);
      });
    });

    it("the values are read by the server: a number wider than JavaScript's arrives whole, a scale is kept, a JSON null is an SQL null", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + LIMITS_TABLE }, reference: { "limits.json": LIMITS } });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, reference: 1 });
        expect(await rowsIn(db.client, "select name, ceiling::text, ratio::text, note from os.limits")).toEqual([
          { name: "wide", ceiling: "9007199254740993", ratio: "1.10", note: null },
        ]);
      });
    });
  });

  describe("the reference pass — a key of two columns", { timeout: CASE_MS }, () => {
    it("a row is known by both: one changed, one removed, one added, and the row that shares one column with each is kept", async () => {
      await inAThrowawayDatabase(async (db) => {
        const first = fileOf({ region: "eu", code: "a", rate: 1 }, { region: "eu", code: "b", rate: 2 }, { region: "us", code: "a", rate: 3 });
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + RATES_TABLE }, reference: { "rates.json": first } });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, reference: 1 });

        writeFileSync(inReference(root, "rates.json"), fileOf({ region: "eu", code: "a", rate: 10 }, { region: "us", code: "a", rate: 3 }, { region: "us", code: "b", rate: 4 }));
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, reference: 1 });
        expect(await rowsIn(db.client, 'select region, code, rate from os.rates order by region collate "C", code collate "C"')).toEqual([
          { region: "eu", code: "a", rate: 10 },
          { region: "us", code: "a", rate: 3 },
          { region: "us", code: "b", rate: 4 },
        ]);
      });
    });
  });

  describe("the reference pass — a row already equal is not rewritten", { timeout: CASE_MS }, () => {
    it("a second run over the same file writes no row: every row's xmin is as the first run left it", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await eventTypesStand(db);
        const afterTheFirst = await rowsToTheInstant(db.client, "os.event_types");
        expect(afterTheFirst).toHaveLength(3);

        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, reference: 1 });
        expect(await rowsToTheInstant(db.client, "os.event_types")).toEqual(afterTheFirst);
      });
    });

    it("a run that changes one row writes that row alone", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await eventTypesStand(db);
        const before = { opened: await writtenAs(db.client, "job.opened"), closed: await writtenAs(db.client, "job.closed"), failed: await writtenAs(db.client, "job.failed") };

        writeFileSync(inReference(root, "event_types.json"), fileOf(OPENED, { ...CLOSED, weight: 20 }, FAILED));
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, reference: 1 });
        expect(await valueOf(db.client, "select weight from os.event_types where name = 'job.closed'")).toBe(20);
        expect(await writtenAs(db.client, "job.opened")).toBe(before.opened);
        expect(await writtenAs(db.client, "job.failed")).toBe(before.failed);
        expect(await writtenAs(db.client, "job.closed")).not.toBe(before.closed);
      });
    });
  });

  describe("the reference pass — a row of his policy kind", { timeout: CASE_MS }, () => {
    it("a table a schema file seeded, with no file in reference/, is left as he changed it by hand", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await eventTypesStand(db, ROUTING_RULES_SEEDED);
        await db.client.query("update os.routing_rules set model = 'large' where rule = 'default'");
        await db.client.query("insert into os.routing_rules values ('at night', 'medium')");
        const asHeLeftIt = await rowsToTheInstant(db.client, "os.routing_rules");

        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, reference: 1 });
        expect(await rowsIn(db.client, 'select rule, model from os.routing_rules order by rule collate "C"')).toEqual([
          { rule: "at night", model: "medium" },
          { rule: "default", model: "large" },
        ]);
        expect(await rowsToTheInstant(db.client, "os.routing_rules")).toEqual(asHeLeftIt);
      });
    });
  });

  describe("the reference pass — the directory decides", { timeout: CASE_MS }, () => {
    it("reference/ standing with no file: applied with reference: 0, and a table of os is as it stood", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + ROUTING_RULES_SEEDED }, reference: {} });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, reference: 0 });
        const seeded = await rowsToTheInstant(db.client, "os.routing_rules");
        expect(seeded).toHaveLength(1);

        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, reference: 0 });
        expect(await rowsToTheInstant(db.client, "os.routing_rules")).toEqual(seeded);
      });
    });
  });

  describe("the reference pass — an empty array", { timeout: CASE_MS }, () => {
    it("empties the table", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await eventTypesStand(db);
        expect(await valueOf(db.client, "select count(*)::int from os.event_types")).toBe(3);

        writeFileSync(inReference(root, "event_types.json"), "[]\n");
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, reference: 1 });
        expect(await valueOf(db.client, "select count(*)::int from os.event_types")).toBe(0);
      });
    });
  });
}
