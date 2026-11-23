import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import { valueOf } from "../../chain/fixtures/looking.ts";
import { CASE_MS, inAThrowawayDatabase } from "../../chain/fixtures/throwaway-database.ts";
import { rowsIn, rowsToTheInstant } from "../fixtures/looking-at-os.ts";
import { referenceFailedAt } from "../fixtures/outcomes.ts";
import { EVENT_TYPES_TABLE, KINDS_TABLE, MAKES_OS, RATES_TABLE, TOPICS_TABLE, WHAT_THE_KINDS_SEQUENCE_GAVE, fileOf, marked } from "../fixtures/pass-files.ts";
import { inReference, passesRoot, standsWith } from "../fixtures/passes-on-disk.ts";

// SPEC §12.7: rows that are there are changed and rows that are not are inserted — two
// statements, no `on conflict` — and a table that already reads as its file is sent no
// statement at all. A key the file holds twice, and a column a row names twice, are said
// before any write. And §12.9: a primary key's included columns are not its key.

// os.kinds, which draws from a sequence for every row written to it, and a trigger that notes every statement sent
// to it in a table of its own. The trigger's function lives in `public`; a run with no functions/ reads no manifest.
const KINDS_WATCHED =
  KINDS_TABLE +
  [
    "create table os.statements_seen (operation text not null);",
    "create function public.notes_the_statement() returns trigger language plpgsql as $f$ begin insert into os.statements_seen values (tg_op); return null; end $f$;",
    "create trigger notes_the_statement after insert or update or delete on os.kinds for each statement execute function public.notes_the_statement();",
    "",
  ].join("\n");

// A column of the table's own that must hold a value and has no default: only a row that stands has one.
const NOTED_TABLE = `create table os.noted (name text primary key, label text not null, note text not null);\n${marked("noted")}`;
const NOTED_BY_NAME = 'select name, label, note from os.noted order by name collate "C"';

const LATE_KEYED_TABLE = `create table os.late_keyed (name text, weight integer not null, primary key (name) deferrable initially deferred);\n${marked("late_keyed")}`;

// The key is `id` alone: `label` only rides in the key's index, and is the table's own.
const BADGES_TABLE = `create table os.badges (id integer, tone text not null, label text not null default 'unnamed', primary key (id) include (label));\n${marked("badges")}`;
const BADGES_BY_ID = "select id, tone, label from os.badges order by id";

// what the file holds · what makes the table · the table · its file's text · SPEC §12.7's message, spelled
const A_KEY_TWICE: [string, string, string, string, string][] = [
  [
    "two keys of two columns twice: the first by its values' text is said, the values in the key's order",
    RATES_TABLE,
    "rates",
    fileOf({ region: "us", code: "a", rate: 1 }, { region: "eu", code: "b", rate: 2 }, { region: "us", code: "a", rate: 3 }, { region: "eu", code: "b", rate: 4 }, { region: "eu", code: "a", rate: 5 }),
    "the file holds a key twice: eu, b",
  ],
  ["a row twice in a file that carries the key alone", TOPICS_TABLE + marked("topics"), "topics", fileOf({ name: "weather" }, { name: "tides" }, { name: "weather" }), "the file holds a key twice: weather"],
];

// Each is event_types.json. The disk reads each as rows of the same three keys: a name said twice is one key to it.
const A_COLUMN_TWICE: [string, string, string][] = [
  [
    "two columns twice: the first by name is said",
    '[\n  {"name": "job.opened", "weight": 1, "description": "a job was opened", "weight": 2, "description": "a job is open"}\n]\n',
    "the file names the column description twice in one row",
  ],
  [
    "the second time spelled with an escape",
    '[\n  {"name": "job.opened", "description": "a job was opened", "weight": 1, "\\u0077eight": 2}\n]\n',
    "the file names the column weight twice in one row",
  ],
  [
    "in the second row alone",
    '[\n  {"name": "job.opened", "description": "a job was opened", "weight": 1},\n  {"name": "job.closed", "description": "a job was closed", "weight": 2, "weight": 3}\n]\n',
    "the file names the column weight twice in one row",
  ],
];

export function referenceTwoStatements(): void {
  describe("the reference pass — a table that already reads as its file is sent no statement", { timeout: CASE_MS }, () => {
    it("a run that changes nothing fires no trigger and draws from no sequence; a run that adds a row fires it, and draws for that row alone", async () => {
      await inAThrowawayDatabase(async (db) => {
        const two = fileOf({ name: "plain", label: "Plain" }, { name: "urgent", label: "Urgent" });
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + KINDS_WATCHED }, reference: { "kinds.json": two } });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, reference: 1 });
        const seenAtFirst = await rowsToTheInstant(db.client, "os.statements_seen");
        expect(seenAtFirst.length).toBeGreaterThan(0);
        expect(await valueOf(db.client, WHAT_THE_KINDS_SEQUENCE_GAVE)).toBe("2, given");

        const applied = { state: "applied", applied: [], standing: 1, reference: 1 };
        expect(await applyChain({ target: db.target, root })).toStrictEqual(applied);
        expect(await rowsToTheInstant(db.client, "os.statements_seen")).toEqual(seenAtFirst);
        expect(await valueOf(db.client, WHAT_THE_KINDS_SEQUENCE_GAVE)).toBe("2, given");

        writeFileSync(inReference(root, "kinds.json"), fileOf({ name: "plain", label: "Plain" }, { name: "urgent", label: "Urgent" }, { name: "late", label: "Late" }));
        expect(await applyChain({ target: db.target, root })).toStrictEqual(applied);
        expect((await rowsToTheInstant(db.client, "os.statements_seen")).length).toBeGreaterThan(seenAtFirst.length);
        expect(await valueOf(db.client, WHAT_THE_KINDS_SEQUENCE_GAVE)).toBe("3, given");
        expect(await rowsIn(db.client, "select name, row_no from os.kinds order by row_no")).toEqual([
          { name: "plain", row_no: 1 },
          { name: "urgent", row_no: 2 },
          { name: "late", row_no: 3 },
        ]);
      });
    });
  });

  describe("the reference pass — rows that are there are changed, rows that are not are inserted", { timeout: CASE_MS }, () => {
    it("a not-null column of the table's own with no default: a standing row is changed and keeps it; a new row is refused with the server's message", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + NOTED_TABLE } });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1 });
        await db.client.query("insert into os.noted values ('a', 'A', 'his note'), ('b', 'B', 'another of his')");

        standsWith(root, "reference", { "noted.json": fileOf({ name: "a", label: "A, changed" }, { name: "b", label: "B" }) });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, reference: 1 });
        expect(await rowsIn(db.client, NOTED_BY_NAME)).toEqual([
          { name: "a", label: "A, changed", note: "his note" },
          { name: "b", label: "B", note: "another of his" },
        ]);
        const asChanged = await rowsToTheInstant(db.client, "os.noted");

        writeFileSync(inReference(root, "noted.json"), fileOf({ name: "a", label: "A, changed again" }, { name: "b", label: "B" }, { name: "c", label: "C" }));
        expect(await applyChain({ target: db.target, root })).toEqual(referenceFailedAt("noted.json", 'null value in column "note" of relation "noted" violates not-null constraint'));
        expect(await rowsToTheInstant(db.client, "os.noted")).toEqual(asChanged);
      });
    });

    it("a deferrable primary key serves: rows written from nothing, then one changed, one added and one removed", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + LATE_KEYED_TABLE }, reference: { "late_keyed.json": fileOf({ name: "a", weight: 1 }, { name: "b", weight: 2 }) } });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, reference: 1 });

        writeFileSync(inReference(root, "late_keyed.json"), fileOf({ name: "b", weight: 20 }, { name: "c", weight: 3 }));
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, reference: 1 });
        expect(await rowsIn(db.client, 'select name, weight from os.late_keyed order by name collate "C"')).toEqual([
          { name: "b", weight: 20 },
          { name: "c", weight: 3 },
        ]);
      });
    });

    it("a primary key with an included column the file does not carry: the key is its key columns, and the included one keeps what stands there", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + BADGES_TABLE }, reference: { "badges.json": fileOf({ id: 1, tone: "warm" }, { id: 2, tone: "cool" }) } });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, reference: 1 });
        expect(await rowsIn(db.client, BADGES_BY_ID)).toEqual([
          { id: 1, tone: "warm", label: "unnamed" },
          { id: 2, tone: "cool", label: "unnamed" },
        ]);

        await db.client.query("update os.badges set label = 'named by hand' where id = 1");
        writeFileSync(inReference(root, "badges.json"), fileOf({ id: 1, tone: "hot" }, { id: 2, tone: "cool" }));
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, reference: 1 });
        expect(await rowsIn(db.client, BADGES_BY_ID)).toEqual([
          { id: 1, tone: "hot", label: "named by hand" },
          { id: 2, tone: "cool", label: "unnamed" },
        ]);
      });
    });
  });

  describe("the reference pass — what a file says twice is said before any write", { timeout: CASE_MS }, () => {
    it.each(A_KEY_TWICE)("%s", async (_what, made, table, text, message) => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + made }, reference: { [`${table}.json`]: text } });
        expect(await applyChain({ target: db.target, root })).toEqual(referenceFailedAt(`${table}.json`, message, ["0001-os.sql"]));
        expect(await valueOf(db.client, `select count(*)::int from os.${table}`)).toBe(0);
      });
    });

    it.each(A_COLUMN_TWICE)("a column a row names twice — %s", async (_what, text, message) => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + EVENT_TYPES_TABLE }, reference: { "event_types.json": text } });
        expect(await applyChain({ target: db.target, root })).toEqual(referenceFailedAt("event_types.json", message, ["0001-os.sql"]));
        expect(await valueOf(db.client, "select count(*)::int from os.event_types")).toBe(0);
      });
    });
  });
}
