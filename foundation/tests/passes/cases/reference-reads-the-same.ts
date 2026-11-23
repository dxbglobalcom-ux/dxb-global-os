import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import { valueOf } from "../../chain/fixtures/looking.ts";
import { CASE_MS, inAThrowawayDatabase } from "../../chain/fixtures/throwaway-database.ts";
import { rowsIn, rowsToTheInstant } from "../fixtures/looking-at-os.ts";
import { referenceFailedAt } from "../fixtures/outcomes.ts";
import { MAKES_OS, marked } from "../fixtures/pass-files.ts";
import { inReference, passesRoot } from "../fixtures/passes-on-disk.ts";

// SPEC §12.6: equal means reads the same. Whether a row is written, and the proof, compare
// each column's text — not the type's equality — so a database upgraded from an earlier
// state reads as one built from nothing. A column of type json can be owned; and the
// pass's transaction is in UTC, so a time the file writes without an offset is the same
// instant on every database. Each file below is spelled as text: its digits are the point.

const RATIOS_TABLE = `create table os.ratios (name text primary key, ratio numeric not null);\n${marked("ratios")}`;
const A_RATIO_OF_1_1 = '[\n  {"name": "wide", "ratio": 1.1}\n]\n';
const A_RATIO_OF_1_10 = '[\n  {"name": "wide", "ratio": 1.10}\n]\n';

// A key whose type calls `Alpha` and `alpha` equal (measured on the bench: the collation is made, and a second row of the other spelling is refused as a duplicate).
const TAGS_TABLE = [
  "create collation os.ignores_case (provider = icu, locale = 'und-u-ks-level2', deterministic = false);",
  "create table os.tags (name text collate os.ignores_case primary key, weight integer not null);",
  "",
].join("\n") + marked("tags");

// The nested values are spelled as the server writes a json value it read: the text is the same whichever way the pass reads the file.
const SHAPES_TABLE = `create table os.shapes (name text primary key, form json not null);\n${marked("shapes")}`;
const SHAPES = '[\n  {"name": "dot", "form": {"label": "a dot", "sides": 0}},\n  {"name": "edge", "form": {"label": "an edge", "sides": 1}}\n]\n';
const SHAPES_WITH_ANOTHER_EDGE = '[\n  {"name": "dot", "form": {"label": "a dot", "sides": 0}},\n  {"name": "edge", "form": {"label": "an edge", "sides": 2}}\n]\n';
const SHAPES_BY_NAME = 'select name, form::text as form from os.shapes order by name collate "C"';

const WINDOWS_TABLE = `create table os.windows (name text primary key, opens timestamptz not null);\n${marked("windows")}`;
const A_TIME_WITH_NO_OFFSET = '[\n  {"name": "night", "opens": "2026-01-02 03:04:05"}\n]\n';
const OPENS_IN_UTC = "select to_char(opens at time zone 'UTC', 'YYYY-MM-DD HH24:MI:SS') from os.windows where name = 'night'";

export function referenceReadsTheSame(): void {
  describe("the reference pass — equal means reads the same", { timeout: CASE_MS }, () => {
    it("1.1 stands and the file says 1.10: the row is written and reads 1.10 — and the run after it writes nothing", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + RATIOS_TABLE }, reference: { "ratios.json": A_RATIO_OF_1_1 } });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, reference: 1 });
        expect(await valueOf(db.client, "select ratio::text from os.ratios")).toBe("1.1");

        writeFileSync(inReference(root, "ratios.json"), A_RATIO_OF_1_10);
        const applied = { state: "applied", applied: [], standing: 1, reference: 1 };
        expect(await applyChain({ target: db.target, root })).toStrictEqual(applied);
        expect(await valueOf(db.client, "select ratio::text from os.ratios")).toBe("1.10");

        const asWritten = await rowsToTheInstant(db.client, "os.ratios");
        expect(await applyChain({ target: db.target, root })).toStrictEqual(applied);
        expect(await rowsToTheInstant(db.client, "os.ratios")).toEqual(asWritten);
      });
    });

    it("a key the type calls equal and that reads otherwise — Alpha stands, the file says alpha — is not rewritten, and fails the proof", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + TAGS_TABLE }, reference: { "tags.json": '[\n  {"name": "Alpha", "weight": 1}\n]\n' } });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, reference: 1 });
        const asItStood = await rowsToTheInstant(db.client, "os.tags");

        writeFileSync(inReference(root, "tags.json"), '[\n  {"name": "alpha", "weight": 1}\n]\n');
        expect(await applyChain({ target: db.target, root })).toEqual(referenceFailedAt("tags.json", "os.tags does not equal its file after the pass"));
        expect(await rowsToTheInstant(db.client, "os.tags")).toEqual(asItStood);
        expect(await rowsIn(db.client, "select name, weight from os.tags")).toEqual([{ name: "Alpha", weight: 1 }]);
      });
    });

    it("a column of type json is owned: written, changed where it reads otherwise, and left where it reads the same", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + SHAPES_TABLE }, reference: { "shapes.json": SHAPES } });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, reference: 1 });
        expect(await rowsIn(db.client, SHAPES_BY_NAME)).toEqual([
          { name: "dot", form: '{"label": "a dot", "sides": 0}' },
          { name: "edge", form: '{"label": "an edge", "sides": 1}' },
        ]);
        const [theDot] = await rowsToTheInstant(db.client, "os.shapes");
        expect(theDot).toMatch(/^\(dot,.* written by \d+$/);

        writeFileSync(inReference(root, "shapes.json"), SHAPES_WITH_ANOTHER_EDGE);
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, reference: 1 });
        expect(await rowsIn(db.client, SHAPES_BY_NAME)).toEqual([
          { name: "dot", form: '{"label": "a dot", "sides": 0}' },
          { name: "edge", form: '{"label": "an edge", "sides": 2}' },
        ]);
        expect((await rowsToTheInstant(db.client, "os.shapes"))[0]).toBe(theDot);
      });
    });

    it("a time the file writes without an offset is read as UTC, whatever time zone the database gives its sessions — and the run after it writes nothing", async () => {
      await inAThrowawayDatabase(async (db) => {
        // Every session opened on this database from here on is in this zone: the run's among them, not the test's own, which is open already.
        await db.client.query(`alter database "${db.identity.dbname}" set timezone = 'Asia/Dubai'`);
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + WINDOWS_TABLE }, reference: { "windows.json": A_TIME_WITH_NO_OFFSET } });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, reference: 1 });
        expect(await valueOf(db.client, OPENS_IN_UTC)).toBe("2026-01-02 03:04:05");

        const asWritten = await rowsToTheInstant(db.client, "os.windows");
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, reference: 1 });
        expect(await rowsToTheInstant(db.client, "os.windows")).toEqual(asWritten);
      });
    });
  });
}
