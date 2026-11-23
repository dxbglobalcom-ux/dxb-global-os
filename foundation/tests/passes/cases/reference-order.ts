import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import { CASE_MS, inAThrowawayDatabase } from "../../chain/fixtures/throwaway-database.ts";
import { rowsIn } from "../fixtures/looking-at-os.ts";
import { MAKES_OS, fileOf, marked } from "../fixtures/pass-files.ts";
import { inReference, passesRoot } from "../fixtures/passes-on-disk.ts";

// SPEC §5, "order among the vocabularies", and §9.3: a table is written after every table
// it references and removed in the opposite order, whatever the tables' names; a table's
// reference to itself orders nothing; a circle cannot be ordered and fails the pass.

/** os.handlers, whose rows name a row of os.<referenced> (NO ACTION: the server checks each statement as it ends). */
const handlersOf = (referenced: string): string =>
  [`create table os.${referenced} (name text primary key);`, `create table os.handlers (id text primary key, about text not null references os.${referenced} (name));`, ""].join("\n") +
  marked(referenced) +
  marked("handlers");

// A row that names a row of its own table, and is written before it in the file.
const UNITS_TABLE = `create table os.units (name text primary key, part_of text references os.units (name));\n${marked("units")}`;

// Two vocabularies that reference each other, and a third that stands apart and lies before both by name.
const A_CIRCLE = [
  "create table os.aa_apart (name text primary key);",
  "create table os.alpha (name text primary key, beta text);",
  "create table os.beta (name text primary key, alpha text references os.alpha (name));",
  "alter table os.alpha add foreign key (beta) references os.beta (name);",
  "",
].join("\n") + ["aa_apart", "alpha", "beta"].map(marked).join("");

// SPEC §12.11, the audit's graph: two circles — bravo and charlie, echo and foxtrot — and a table on the path from
// the one to the other. It is in neither circle, and lies before every table of both by name.
const TWO_CIRCLES_AND_A_PATH =
  [
    "create table os.aa_bridge (name text primary key, echo text);",
    "create table os.bravo (name text primary key, charlie text, bridge text references os.aa_bridge (name));",
    "create table os.charlie (name text primary key, bravo text references os.bravo (name));",
    "alter table os.bravo add foreign key (charlie) references os.charlie (name);",
    "create table os.echo (name text primary key, foxtrot text);",
    "create table os.foxtrot (name text primary key, echo text references os.echo (name));",
    "alter table os.echo add foreign key (foxtrot) references os.foxtrot (name);",
    "alter table os.aa_bridge add foreign key (echo) references os.echo (name);",
    "",
  ].join("\n") + ["aa_bridge", "bravo", "charlie", "echo", "foxtrot"].map(marked).join("");

export function referenceOrder(): void {
  describe("the reference pass — vocabularies that reference each other", { timeout: CASE_MS }, () => {
    it.each([
      ["before the referencing one by name", "event_types"],
      ["after the referencing one by name", "topics"],
    ])("the referenced table %s: both gain rows that hang together, then both lose them — applied each time", async (_what, referenced) => {
      await inAThrowawayDatabase(async (db) => {
        const one = { [`${referenced}.json`]: fileOf({ name: "opened" }), "handlers.json": fileOf({ id: "h1", about: "opened" }) };
        const two = { [`${referenced}.json`]: fileOf({ name: "opened" }, { name: "closed" }), "handlers.json": fileOf({ id: "h1", about: "opened" }, { id: "h2", about: "closed" }) };
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + handlersOf(referenced) }, reference: one });
        const rewritten = (files: Readonly<Record<string, string>>): void => {
          for (const [name, text] of Object.entries(files)) writeFileSync(inReference(root, name), text);
        };
        const standing = async (): Promise<unknown[]> => [
          await rowsIn(db.client, `select name from os.${referenced} order by name collate "C"`),
          await rowsIn(db.client, 'select id, about from os.handlers order by id collate "C"'),
        ];

        // Built from nothing: the referencing row needs the referenced one to stand.
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, reference: 2 });
        expect(await standing()).toEqual([[{ name: "opened" }], [{ id: "h1", about: "opened" }]]);

        rewritten(two);
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, reference: 2 });
        expect(await standing()).toEqual([
          [{ name: "closed" }, { name: "opened" }],
          [
            { id: "h1", about: "opened" },
            { id: "h2", about: "closed" },
          ],
        ]);

        // And back: the referenced row can go only once the row that names it is gone.
        rewritten(one);
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, reference: 2 });
        expect(await standing()).toEqual([[{ name: "opened" }], [{ id: "h1", about: "opened" }]]);
      });
    });

    it("a table that references itself is ordered by nothing: its rows are written, and removed, whatever their order in the file", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({
          schema: { "0001-os.sql": MAKES_OS + UNITS_TABLE },
          reference: { "units.json": fileOf({ name: "leaf", part_of: "branch" }, { name: "branch", part_of: "trunk" }, { name: "trunk", part_of: null }) },
        });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, reference: 1 });
        expect(await rowsIn(db.client, 'select name, part_of from os.units order by name collate "C"')).toEqual([
          { name: "branch", part_of: "trunk" },
          { name: "leaf", part_of: "branch" },
          { name: "trunk", part_of: null },
        ]);

        writeFileSync(inReference(root, "units.json"), fileOf({ name: "trunk", part_of: null }));
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, reference: 1 });
        expect(await rowsIn(db.client, "select name, part_of from os.units")).toEqual([{ name: "trunk", part_of: null }]);
      });
    });

    it("two that reference each other in a circle: pass-failed, said of the first of the two by name, with both named — and nothing written", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({
          schema: { "0001-os.sql": MAKES_OS + A_CIRCLE },
          reference: {
            "aa_apart.json": fileOf({ name: "apart" }),
            "alpha.json": fileOf({ name: "a1", beta: null }),
            "beta.json": fileOf({ name: "b1", alpha: null }),
          },
        });
        expect(await applyChain({ target: db.target, root })).toEqual({
          state: "pass-failed",
          pass: "reference",
          file: "alpha.json",
          message: "the vocabularies reference each other in a circle: alpha, beta",
          applied: ["0001-os.sql"],
        });
        expect(await rowsIn(db.client, "select name from os.aa_apart union all select name from os.alpha union all select name from os.beta")).toEqual([]);
      });
    });

    it("two circles joined by a path: the circle that holds the first table by name is said, with its own tables only — not the table on the path, not the other circle", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({
          schema: { "0001-os.sql": MAKES_OS + TWO_CIRCLES_AND_A_PATH },
          reference: {
            "aa_bridge.json": fileOf({ name: "the bridge", echo: null }),
            "bravo.json": fileOf({ name: "b1", charlie: null, bridge: null }),
            "charlie.json": fileOf({ name: "c1", bravo: null }),
            "echo.json": fileOf({ name: "e1", foxtrot: null }),
            "foxtrot.json": fileOf({ name: "f1", echo: null }),
          },
        });
        expect(await applyChain({ target: db.target, root })).toEqual({
          state: "pass-failed",
          pass: "reference",
          file: "bravo.json",
          message: "the vocabularies reference each other in a circle: bravo, charlie",
          applied: ["0001-os.sql"],
        });
        const everyRow = ["aa_bridge", "bravo", "charlie", "echo", "foxtrot"].map((table) => `select name from os.${table}`).join(" union all ");
        expect(await rowsIn(db.client, everyRow)).toEqual([]);
      });
    });
  });
}
