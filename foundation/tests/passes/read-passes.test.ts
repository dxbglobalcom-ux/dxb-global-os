import { chmodSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { readChain, readPasses } from "@dxb-foundation/chain";
import { PEOPLE, chainOf } from "../chain/fixtures/chain-files.ts";
import { emptyDirectory, removeTheChainRoots } from "../chain/fixtures/chain-on-disk.ts";
import { inFunctions, inReference, passesRoot, standsWith } from "./fixtures/passes-on-disk.ts";

// SPEC §4, the passes on the disk: `<root>/functions` and `<root>/reference` read from
// the directories alone — no database. Every root below is a temporary directory of its
// own, and every offence's kind and detail is spelled here.

afterAll(removeTheChainRoots);

const GREET = "create or replace function os.greet() returns text language sql as $f$ select 'hello'::text $f$;\n";
const TWO_ROWS = '[\n  {"name": "job.opened", "weight": 1},\n  {"name": "job.closed", "weight": 2}\n]\n';

/** A function file's text for the function of this name: a function file begins with its own function (SPEC §12.1). */
const makes = (name: string): string => `create or replace function os.${name}() returns integer language sql as $f$ select 1 $f$;\n`;

/** A name of this many characters before its ending: a letter, then the letter `n` to the length. */
const aNameOf = (length: number): string => `a${"n".repeat(length - 1)}`;

describe("readPasses — a pass's directory decides whether the pass is read", () => {
  it("a root that holds neither directory: no offence, and neither key", () => {
    expect(readPasses(passesRoot({ schema: chainOf(PEOPLE) }))).toStrictEqual({ offences: [] });
  });

  it("a root that does not exist: the same, and nothing is thrown", () => {
    expect(readPasses(join(emptyDirectory(), "never-made"))).toStrictEqual({ offences: [] });
  });

  it("a root with no schema/ is read all the same: the chain's own directory is not this reading's", () => {
    const root = emptyDirectory();
    standsWith(root, "functions", { "greet.sql": GREET });
    expect(readPasses(root)).toStrictEqual({ functions: [{ name: "greet.sql", text: GREET }], offences: [] });
  });

  it("functions/ alone: its files, and no reference key", () => {
    const root = passesRoot({ functions: { "greet.sql": GREET } });
    expect(readPasses(root)).toStrictEqual({ functions: [{ name: "greet.sql", text: GREET }], offences: [] });
  });

  it("reference/ alone: its files, and no functions key", () => {
    const root = passesRoot({ reference: { "event_types.json": TWO_ROWS } });
    expect(readPasses(root)).toStrictEqual({ reference: [{ name: "event_types.json", text: TWO_ROWS }], offences: [] });
  });

  it("a directory that stands and holds nothing is a pass of no files", () => {
    expect(readPasses(passesRoot({ functions: {}, reference: {} }))).toStrictEqual({ functions: [], reference: [], offences: [] });
  });
});

describe("readPasses — the files of the two directories", () => {
  it("come back by name, by code unit, each with the entry's name and its text", () => {
    // Written out of order. By code unit a digit lies before the underscore; a locale's order has it the other way round.
    const root = passesRoot({
      functions: { "twice.sql": makes("twice"), "a_x.sql": makes("a_x"), "greet.sql": GREET, "a1.sql": makes("a1"), "a.sql": makes("a") },
      reference: { "topics.json": "[]\n", "event_types.json": TWO_ROWS },
    });
    expect(readPasses(root)).toStrictEqual({
      functions: [
        { name: "a.sql", text: makes("a") },
        { name: "a1.sql", text: makes("a1") },
        { name: "a_x.sql", text: makes("a_x") },
        { name: "greet.sql", text: GREET },
        { name: "twice.sql", text: makes("twice") },
      ],
      reference: [
        { name: "event_types.json", text: TWO_ROWS },
        { name: "topics.json", text: "[]\n" },
      ],
      offences: [],
    });
  });

  it("a name of 63 characters is a name of the pattern, in either directory", () => {
    const root = passesRoot({ functions: { [`${aNameOf(63)}.sql`]: makes(aNameOf(63)) }, reference: { [`${aNameOf(63)}.json`]: "[]" } });
    const read = readPasses(root);
    expect(read.offences).toEqual([]);
    expect(read.functions?.map((file) => file.name)).toEqual([`${aNameOf(63)}.sql`]);
    expect(read.reference?.map((file) => file.name)).toEqual([`${aNameOf(63)}.json`]);
  });

  it.each([
    ["an empty array", "[]"],
    ["an empty array with white space in and around it", " [ ]\n"],
    ["objects that carry the same keys in another order", '[{"name": "a", "weight": 1}, {"weight": 2, "name": "b"}]\n'],
    ["a value of any JSON kind — the server reads the values, not this reading", '[{"name": null, "tags": ["x"], "meta": {"K": 1}, "ratio": 1.10}]\n'],
  ])("a reference file is well-formed: %s", (_what, text) => {
    const root = passesRoot({ reference: { "event_types.json": text } });
    expect(readPasses(root)).toStrictEqual({ reference: [{ name: "event_types.json", text }], offences: [] });
  });
});

describe("readPasses — the offences of the two directories, each planted and named", () => {
  it.each(["functions", "reference"] as const)("unknown-entry: %s in the root is a file, not a directory — and the pass has no key", (directory) => {
    const root = passesRoot({});
    writeFileSync(join(root, directory), "not a directory\n");
    expect(readPasses(root)).toStrictEqual({ offences: [{ kind: "unknown-entry", detail: directory }] });
  });

  it("unknown-entry: functions and reference in the root are links, though each leads to a directory of good files", () => {
    const behind = passesRoot({ functions: { "greet.sql": GREET }, reference: { "event_types.json": TWO_ROWS } });
    const root = passesRoot({});
    symlinkSync(join(behind, "functions"), join(root, "functions"));
    symlinkSync(join(behind, "reference"), join(root, "reference"));
    expect(readPasses(root)).toStrictEqual({
      offences: [
        { kind: "unknown-entry", detail: "functions" },
        { kind: "unknown-entry", detail: "reference" },
      ],
    });
  });

  it.each([
    ["another ending", "greet.txt"],
    ["the ending in capitals", "greet.SQL"],
    ["a capital letter", "Greet.sql"],
    ["a digit first", "1st.sql"],
    ["an underscore first", "_greet.sql"],
    ["a hyphen", "greet-all.sql"],
    ["a schema file's name", "0001-os.sql"],
    ["a dot inside the name", "os.greet.sql"],
    ["no name before the ending", ".sql"],
    ["a name of 64 characters", `${aNameOf(64)}.sql`],
    ["a reference file's ending", "greet.json"],
  ])("unknown-entry: in functions/, a file with %s", (_what, name) => {
    const root = passesRoot({ functions: { "twice.sql": makes("twice"), [name]: GREET } });
    expect(readPasses(root).offences).toEqual([{ kind: "unknown-entry", detail: `functions/${name}` }]);
  });

  it.each([
    ["another ending", "event_types.txt"],
    ["the ending in capitals", "event_types.JSON"],
    ["a capital letter", "Event_types.json"],
    ["a digit first", "2nd.json"],
    ["a hyphen", "event-types.json"],
    ["a name of 64 characters", `${aNameOf(64)}.json`],
    ["a function file's ending", "event_types.sql"],
  ])("unknown-entry: in reference/, a file with %s", (_what, name) => {
    const root = passesRoot({ reference: { "topics.json": "[]\n", [name]: TWO_ROWS } });
    expect(readPasses(root).offences).toEqual([{ kind: "unknown-entry", detail: `reference/${name}` }]);
  });

  it("unknown-entry: a directory, whatever its name, in either directory", () => {
    const root = passesRoot({ functions: {}, reference: {} });
    mkdirSync(inFunctions(root, "greet.sql"));
    mkdirSync(inFunctions(root, "old"));
    mkdirSync(inReference(root, "event_types.json"));
    expect(readPasses(root).offences).toEqual([
      { kind: "unknown-entry", detail: "functions/greet.sql" },
      { kind: "unknown-entry", detail: "functions/old" },
      { kind: "unknown-entry", detail: "reference/event_types.json" },
    ]);
  });

  it("unknown-entry: a link, also one that carries a file's name and leads to a file", () => {
    const root = passesRoot({ functions: {}, reference: {} });
    writeFileSync(join(root, "outside.sql"), GREET);
    writeFileSync(join(root, "outside.json"), TWO_ROWS);
    symlinkSync(join(root, "outside.sql"), inFunctions(root, "greet.sql"));
    symlinkSync(join(root, "outside.json"), inReference(root, "event_types.json"));
    expect(readPasses(root).offences).toEqual([
      { kind: "unknown-entry", detail: "functions/greet.sql" },
      { kind: "unknown-entry", detail: "reference/event_types.json" },
    ]);
  });

  it.each([
    ["no bytes", ""],
    ["white space only", " \n\t\r\n"],
  ])("empty: a function file of %s", (_what, content) => {
    const root = passesRoot({ functions: { "greet.sql": content } });
    expect(readPasses(root).offences).toEqual([{ kind: "empty", detail: "functions/greet.sql" }]);
  });

  it.each([
    ["a byte that begins no character", [0xff]],
    ["a character cut off in its middle", [0xc3]],
  ])("unreadable: a file that is not valid UTF-8 — %s — in either directory", (_what, bytes) => {
    const notText = (before: string): Uint8Array => Uint8Array.from([...Buffer.from(before), ...bytes, 0x0a]);
    const root = passesRoot({ functions: { "greet.sql": notText("-- ") }, reference: { "event_types.json": notText("[] ") } });
    expect(readPasses(root).offences).toEqual([
      { kind: "unreadable", detail: "functions/greet.sql" },
      { kind: "unreadable", detail: "reference/event_types.json" },
    ]);
  });

  it("unreadable: a file this user may not read, in either directory", () => {
    const root = passesRoot({ functions: { "greet.sql": GREET }, reference: { "event_types.json": TWO_ROWS } });
    chmodSync(inFunctions(root, "greet.sql"), 0o000);
    chmodSync(inReference(root, "event_types.json"), 0o000);
    // Seen first: a user who may read every file whatever its mode would make this case say nothing.
    expect(() => readFileSync(inFunctions(root, "greet.sql"))).toThrow(/EACCES/);
    expect(readPasses(root).offences).toEqual([
      { kind: "unreadable", detail: "functions/greet.sql" },
      { kind: "unreadable", detail: "reference/event_types.json" },
    ]);
  });

  it.each([
    ["not JSON", '[{"name": "a"}'],
    ["not JSON: a comment in it", '[{"name": "a"}] // the first\n'],
    ["not an array: an object", '{"name": "a"}'],
    ["not an array: a number", "7"],
    ["not an array: null", "null"],
    ["an element that is a number", '[{"name": "a"}, 7]'],
    ["an element that is a string", '[{"name": "a"}, "b"]'],
    ["an element that is null", '[{"name": "a"}, null]'],
    ["an element that is an array", '[{"name": "a"}, ["name", "b"]]'],
    ["an object of no keys", "[{}]"],
    ["a key with a capital letter", '[{"Name": "a"}]'],
    ["a key with a hyphen", '[{"event-type": "a"}]'],
    ["a key that begins with a digit", '[{"1st": "a"}]'],
    ["a key of no characters", '[{"": "a"}]'],
    ["a key of 64 characters", `[{"${aNameOf(64)}": "a"}]`],
    ["two objects, the second with a key fewer", '[{"name": "a", "weight": 1}, {"name": "b"}]'],
    ["two objects, the second with a key more", '[{"name": "a"}, {"name": "b", "weight": 2}]'],
    ["two objects with as many keys, of other names", '[{"name": "a"}, {"title": "b"}]'],
    ["a file of no bytes", ""],
    ["a file of white space only", " \n\t\r\n"],
  ])("malformed: a reference file that is %s", (_what, text) => {
    const root = passesRoot({ reference: { "topics.json": "[]\n", "event_types.json": text } });
    expect(readPasses(root).offences).toEqual([{ kind: "malformed", detail: "reference/event_types.json" }]);
  });

  it("says the offences of both directories together — by kind as SPEC §7 orders them, then by detail", () => {
    const root = passesRoot({
      functions: { "nothing.sql": "", "Greet.sql": GREET, "greet.sql": GREET },
      reference: {
        "not_text.json": Uint8Array.from([0x5b, 0x5d, 0xff]),
        "broken.json": "[{}]",
        "notes.txt": "beside the vocabularies\n",
        "also_broken.json": "{}",
      },
    });
    expect(readPasses(root).offences).toEqual([
      { kind: "unknown-entry", detail: "functions/Greet.sql" },
      { kind: "unknown-entry", detail: "reference/notes.txt" },
      { kind: "empty", detail: "functions/nothing.sql" },
      { kind: "unreadable", detail: "reference/not_text.json" },
      { kind: "malformed", detail: "reference/also_broken.json" },
      { kind: "malformed", detail: "reference/broken.json" },
    ]);
  });
});

// What follows a function's name and its brackets in the texts below: whether the server would take it is not this reading's.
const SAYS_HELLO = "returns text language sql as $f$ select 'hello'::text $f$;\n";

describe("readPasses — a function file begins with its own function (SPEC §12.1)", () => {
  it.each([
    ["only a comment", "-- not yet\n"],
    ["only a comment that spells the statement", `-- create or replace function os.greet() ${SAYS_HELLO}`],
    ["only a grant on its function", "grant execute on function os.greet() to pg_monitor;\n"],
    ["only an alter function", "alter function os.greet() cost 5;\n"],
    ["a do block that makes its function if it is not there", "do $$ begin if to_regprocedure('os.greet()') is null then execute 'create function os.greet() returns integer language sql as ''select 1'''; end if; end $$;\n"],
    ["its function named without the schema", `create or replace function greet() ${SAYS_HELLO}`],
    ["its function in another schema", `create or replace function public.greet() ${SAYS_HELLO}`],
    ["another function's name", `create or replace function os.salute() ${SAYS_HELLO}`],
    ["a longer name that begins with its own", `create or replace function os.greets() ${SAYS_HELLO}`],
    ["a shorter name that its own begins with", `create or replace function os.gree() ${SAYS_HELLO}`],
    ["a block comment first", `/* says hello */\n${GREET}`],
    ["create function, without or replace", `create function os.greet() ${SAYS_HELLO}`],
    ["a statement before its function", `grant usage on schema os to pg_monitor;\n${GREET}`],
    ["white space inside os.<name>, after the dot", `create or replace function os. greet() ${SAYS_HELLO}`],
    ["white space inside os.<name>, before the dot", `create or replace function os .greet() ${SAYS_HELLO}`],
    ["its name in quotes", `create or replace function "os"."greet"() ${SAYS_HELLO}`],
    ["another kind of thing of its name", "create or replace view os.greet as select 'hello'::text as word;\n"],
  ])("malformed: a function file with %s", (_what, text) => {
    const root = passesRoot({ functions: { "greet.sql": text, "twice.sql": makes("twice") } });
    expect(readPasses(root).offences).toEqual([{ kind: "malformed", detail: "functions/greet.sql" }]);
  });

  it.each([
    ["upper case", `CREATE OR REPLACE FUNCTION OS.GREET() ${SAYS_HELLO}`],
    ["mixed case", `Create Or Replace Function os.Greet() ${SAYS_HELLO}`],
    ["line comments and blank lines first", `-- says hello\n\n  -- to whoever asks\r\n\t${GREET}`],
    ["a comment of no text first, and one that spells another function", `--\n-- create or replace function os.salute()\n${GREET}`],
    ["a procedure", "create or replace procedure os.greet() language sql as $p$ select 1 $p$;\n"],
    ["an aggregate", "create or replace aggregate os.greet(integer) (sfunc = int4pl, stype = integer);\n"],
    ["any white space between the words", `create\n  or\treplace   function\r\n os.greet() ${SAYS_HELLO}`],
    ["white space before the bracket", `create or replace function os.greet (word text) ${SAYS_HELLO}`],
    ["its own revoke and grant after it", `${GREET}revoke all on function os.greet() from public;\ngrant execute on function os.greet() to pg_monitor;\n`],
  ])("a function file is well-formed: %s", (_what, text) => {
    const root = passesRoot({ functions: { "greet.sql": text } });
    expect(readPasses(root)).toStrictEqual({ functions: [{ name: "greet.sql", text }], offences: [] });
  });

  it("malformed is said of both directories' files, by detail, after the other kinds of the disk", () => {
    const root = passesRoot({
      functions: { "salute.sql": "-- not yet\n", "greet.sql": "grant execute on function os.greet() to pg_monitor;\n", "nothing.sql": "" },
      reference: { "broken.json": "[{}]" },
    });
    expect(readPasses(root).offences).toEqual([
      { kind: "empty", detail: "functions/nothing.sql" },
      { kind: "malformed", detail: "functions/greet.sql" },
      { kind: "malformed", detail: "functions/salute.sql" },
      { kind: "malformed", detail: "reference/broken.json" },
    ]);
  });
});

describe("readPasses — .gitkeep (SPEC §12.12)", () => {
  it("a regular file of that name, in either directory, is neither a file of the pass nor an offence — whatever it holds", () => {
    const root = passesRoot({
      functions: { ".gitkeep": "", "greet.sql": GREET },
      reference: { ".gitkeep": Uint8Array.from([0xff]), "event_types.json": TWO_ROWS },
    });
    expect(readPasses(root)).toStrictEqual({
      functions: [{ name: "greet.sql", text: GREET }],
      reference: [{ name: "event_types.json", text: TWO_ROWS }],
      offences: [],
    });
  });

  it("a directory that holds nothing else stands, and is a pass of no files", () => {
    const root = passesRoot({ functions: { ".gitkeep": "" }, reference: { ".gitkeep": "kept for git\n" } });
    expect(readPasses(root)).toStrictEqual({ functions: [], reference: [], offences: [] });
  });

  it("unknown-entry still: a directory and a link of that name, and another file whose name begins with a dot", () => {
    const root = passesRoot({ functions: { ".gitignore": "*.tmp\n" }, reference: {} });
    mkdirSync(inFunctions(root, ".gitkeep"));
    writeFileSync(join(root, "outside"), "");
    symlinkSync(join(root, "outside"), inReference(root, ".gitkeep"));
    expect(readPasses(root).offences).toEqual([
      { kind: "unknown-entry", detail: "functions/.gitignore" },
      { kind: "unknown-entry", detail: "functions/.gitkeep" },
      { kind: "unknown-entry", detail: "reference/.gitkeep" },
    ]);
  });
});

describe("readChain — beside the two directories", () => {
  it("still answers schema/ alone: the passes' files and their offences are not its", () => {
    const root = passesRoot({
      schema: chainOf(PEOPLE),
      functions: { "greet.sql": GREET, "Greet.sql": GREET, "nothing.sql": "" },
      reference: { "event_types.json": TWO_ROWS, "broken.json": "[{}]" },
    });
    expect(readChain(root)).toEqual({ files: [{ name: PEOPLE.name, number: 1, hash: PEOPLE.sha256, text: PEOPLE.text }], offences: [] });
  });
});
