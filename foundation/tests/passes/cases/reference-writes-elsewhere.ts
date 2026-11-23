import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import { valueOf } from "../../chain/fixtures/looking.ts";
import { CASE_MS, inAThrowawayDatabase, type Throwaway } from "../../chain/fixtures/throwaway-database.ts";
import { rowsIn, rowsToTheInstant } from "../fixtures/looking-at-os.ts";
import { referenceFailedAt } from "../fixtures/outcomes.ts";
import { CLOSED, EVENT_TYPES_TABLE, MAKES_OS, OPENED, fileOf, marked } from "../fixtures/pass-files.ts";
import { inReference, passesRoot, standsWith } from "../fixtures/passes-on-disk.ts";
import { THE_THREE_EVENT_TYPES, eventTypesStand } from "../fixtures/standing.ts";

// SPEC §12.4: a removal cannot reach a table that has no file. Before any write the pass
// reads every reference onto a vocabulary's table — from any table of any schema, the
// vocabulary itself included — and one whose delete or update action writes fails the pass
// at that vocabulary's file. And every statement of the pass says `only`: the rows of an
// inheritance child are not the vocabulary's.

// The file of every case below that begins from the three event types: job.failed is gone from it, and job.opened is changed in it.
const ONE_REMOVED_ONE_CHANGED = fileOf({ ...OPENED, weight: 10 }, CLOSED);

/** A table outside the files whose `event` names an event type, under a reference of this name with these actions. */
const referencing = (table: string, constraint: string, actions: string): string =>
  `create table ${table} (id integer primary key, event text default 'job.opened' constraint ${constraint} references os.event_types (name) ${actions});\n`;

/**
 * os.event_types and what `made` makes beside it, by a run of a root with no reference/; then the three event
 * types, and `used` — the rows of the tables that name them — written by the test's own hand. Answers the root,
 * which holds no reference/ yet: with a reference that writes, no run of the pass ends green.
 */
async function eventTypesInUse(db: Throwaway, made: string, used: string): Promise<string> {
  const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + EVENT_TYPES_TABLE + made } });
  expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1 });
  await db.client.query(
    "insert into os.event_types (name, description, weight) values ('job.opened', 'a job was opened', 1), ('job.closed', 'a job was closed', 2), ('job.failed', 'a job failed', 3)",
  );
  await db.client.query(used);
  return root;
}

// what the reference does · the table · its reference's name · its actions · SPEC §12.4's message, spelled
const REFERENCES_THAT_WRITE: [string, string, string, string, string][] = [
  ["on delete cascade", "os.rules", "rule_event", "on delete cascade", "the reference rule_event on os.rules writes when a row of os.event_types is removed or changed"],
  ["on delete set null", "os.rules", "rule_event", "on delete set null", "the reference rule_event on os.rules writes when a row of os.event_types is removed or changed"],
  ["on delete set default", "os.alerts", "alert_event", "on delete set default", "the reference alert_event on os.alerts writes when a row of os.event_types is removed or changed"],
  ["on update cascade", "os.rules", "rule_event", "on update cascade", "the reference rule_event on os.rules writes when a row of os.event_types is removed or changed"],
  ["on update set null", "os.rules", "rule_event", "on update set null", "the reference rule_event on os.rules writes when a row of os.event_types is removed or changed"],
  ["on delete cascade, from a table of another schema", "public.uses", "far_event", "on delete cascade", "the reference far_event on public.uses writes when a row of os.event_types is removed or changed"],
];

const UNITS_THAT_CASCADE = `create table os.units (name text primary key, part_of text constraint part_of_stands references os.units (name) on delete cascade);\n${marked("units")}`;

// A vocabulary with a file of its own whose reference onto another vocabulary cascades.
const HANDLERS_THAT_CASCADE = `create table os.handlers (id text primary key, about text not null constraint handler_event references os.event_types (name) on delete cascade);\n${marked("handlers")}`;

// Four references onto os.event_types: the first by name writes nothing; two of one name write, on two tables; the last writes too.
const FOUR_REFERENCES = [
  referencing("os.logs", "a0_plain", ""),
  referencing("os.rules", "m_event", "on delete set null"),
  referencing("os.alerts", "m_event", "on delete cascade"),
  referencing("public.far", "z_event", "on delete cascade"),
].join("");

const CHILD_OF_EVENT_TYPES = "create table os.event_types_kept () inherits (os.event_types);\n";

export function referenceWritesElsewhere(): void {
  describe("the reference pass — a removal cannot reach a table that has no file", { timeout: CASE_MS }, () => {
    it.each(REFERENCES_THAT_WRITE)("a reference %s: pass-failed at the vocabulary's file before any write — the referencing rows and the vocabulary as they stood", async (_what, table, constraint, actions, message) => {
      await inAThrowawayDatabase(async (db) => {
        const root = await eventTypesInUse(db, referencing(table, constraint, actions), `insert into ${table} (id, event) values (1, 'job.failed'), (2, 'job.opened')`);
        const before = { uses: await rowsToTheInstant(db.client, table), eventTypes: await rowsToTheInstant(db.client, "os.event_types") };
        expect([before.uses.length, before.eventTypes.length]).toEqual([2, 3]);

        standsWith(root, "reference", { "event_types.json": ONE_REMOVED_ONE_CHANGED });
        expect(await applyChain({ target: db.target, root })).toEqual(referenceFailedAt("event_types.json", message));
        expect(await rowsToTheInstant(db.client, table)).toEqual(before.uses);
        expect(await rowsToTheInstant(db.client, "os.event_types")).toEqual(before.eventTypes);
      });
    });

    it("an empty array over a vocabulary that a cascading reference names: refused as any other file is — nothing is emptied, here or there", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await eventTypesInUse(db, referencing("os.rules", "rule_event", "on delete cascade"), "insert into os.rules (id, event) values (1, 'job.failed'), (2, 'job.opened')");
        const before = { rules: await rowsToTheInstant(db.client, "os.rules"), eventTypes: await rowsToTheInstant(db.client, "os.event_types") };
        expect([before.rules.length, before.eventTypes.length]).toEqual([2, 3]);

        standsWith(root, "reference", { "event_types.json": "[]\n" });
        const message = "the reference rule_event on os.rules writes when a row of os.event_types is removed or changed";
        expect(await applyChain({ target: db.target, root })).toEqual(referenceFailedAt("event_types.json", message));
        expect(await rowsToTheInstant(db.client, "os.rules")).toEqual(before.rules);
        expect(await rowsToTheInstant(db.client, "os.event_types")).toEqual(before.eventTypes);
      });
    });

    it("a vocabulary that references itself with cascade: pass-failed at its own file, its rows as they stood", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + UNITS_THAT_CASCADE } });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1 });
        await db.client.query("insert into os.units values ('trunk', null), ('branch', 'trunk'), ('leaf', 'branch')");
        const before = await rowsToTheInstant(db.client, "os.units");

        // The trunk is gone from the file: removed, it would take the branch and the leaf — which the file holds — with it.
        standsWith(root, "reference", { "units.json": fileOf({ name: "branch", part_of: "trunk" }, { name: "leaf", part_of: "branch" }) });
        const message = "the reference part_of_stands on os.units writes when a row of os.units is removed or changed";
        expect(await applyChain({ target: db.target, root })).toEqual(referenceFailedAt("units.json", message));
        expect(before).toHaveLength(3);
        expect(await rowsToTheInstant(db.client, "os.units")).toEqual(before);
      });
    });

    it("a vocabulary whose reference onto another vocabulary cascades: pass-failed at the referenced one's file, and neither is written", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({
          schema: { "0001-os.sql": MAKES_OS + EVENT_TYPES_TABLE + HANDLERS_THAT_CASCADE },
          reference: { "event_types.json": THE_THREE_EVENT_TYPES, "handlers.json": fileOf({ id: "h1", about: "job.opened" }) },
        });
        const message = "the reference handler_event on os.handlers writes when a row of os.event_types is removed or changed";
        expect(await applyChain({ target: db.target, root })).toEqual(referenceFailedAt("event_types.json", message, ["0001-os.sql"]));
        expect(await valueOf(db.client, "select (select count(*) from os.event_types)::int + (select count(*) from os.handlers)::int")).toBe(0);
      });
    });

    it("several references onto one vocabulary: the first that writes is said — by the reference's name, then by its table — not one that writes nothing", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + EVENT_TYPES_TABLE + FOUR_REFERENCES }, reference: { "event_types.json": THE_THREE_EVENT_TYPES } });
        const message = "the reference m_event on os.alerts writes when a row of os.event_types is removed or changed";
        expect(await applyChain({ target: db.target, root })).toEqual(referenceFailedAt("event_types.json", message, ["0001-os.sql"]));
        expect(await valueOf(db.client, "select count(*)::int from os.event_types")).toBe(0);
      });
    });

    it.each([
      ["no action, unsaid", ""],
      ["no action, said", "on delete no action on update no action"],
      ["restrict", "on delete restrict on update restrict"],
    ])("a reference of %s still passes: a value not in use is removed, another is changed, and the referencing rows are as they stood", async (_what, actions) => {
      await inAThrowawayDatabase(async (db) => {
        const root = await eventTypesInUse(db, referencing("os.rules", "rule_event", actions), "insert into os.rules (id, event) values (1, 'job.closed'), (2, 'job.opened')");
        const rules = await rowsToTheInstant(db.client, "os.rules");
        expect(rules).toHaveLength(2);

        standsWith(root, "reference", { "event_types.json": ONE_REMOVED_ONE_CHANGED });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, reference: 1 });
        expect(await rowsIn(db.client, 'select name, weight from os.event_types order by name collate "C"')).toEqual([
          { name: "job.closed", weight: 2 },
          { name: "job.opened", weight: 10 },
        ]);
        expect(await rowsToTheInstant(db.client, "os.rules")).toEqual(rules);
      });
    });
  });

  describe("the reference pass — an inheritance child's rows are not the vocabulary's", { timeout: CASE_MS }, () => {
    it("a pass that removes a row and changes one: the child's rows — one of a key the file does not hold, one of a key it changes — are as they stood", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = await eventTypesStand(db, CHILD_OF_EVENT_TYPES);
        await db.client.query("insert into os.event_types_kept (name, description, weight) values ('job.archived', 'kept by the child', 9), ('job.opened', 'the child''s own', 7)");
        const kept = await rowsToTheInstant(db.client, "os.event_types_kept");
        expect(kept).toHaveLength(2);

        writeFileSync(inReference(root, "event_types.json"), ONE_REMOVED_ONE_CHANGED);
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, reference: 1 });
        expect(await rowsIn(db.client, 'select name, weight from only os.event_types order by name collate "C"')).toEqual([
          { name: "job.closed", weight: 2 },
          { name: "job.opened", weight: 10 },
        ]);
        expect(await rowsToTheInstant(db.client, "os.event_types_kept")).toEqual(kept);
      });
    });
  });
}
