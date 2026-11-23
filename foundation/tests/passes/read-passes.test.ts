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
      functions: { "twice.sql": "-- twice\n", "a_x.sql": "-- a_x\n", "greet.sql": GREET, "a1.sql": "-- a1\n", "a.sql": "-- a\n" },
      reference: { "topics.json": "[]\n", "event_types.json": TWO_ROWS },
    });
    expect(readPasses(root)).toStrictEqual({
      functions: [
        { name: "a.sql", text: "-- a\n" },
        { name: "a1.sql", text: "-- a1\n" },
        { name: "a_x.sql", text: "-- a_x\n" },
        { name: "greet.sql", text: GREET },
        { name: "twice.sql", text: "-- twice\n" },
      ],
      reference: [
        { name: "event_types.json", text: TWO_ROWS },
        { name: "topics.json", text: "[]\n" },
      ],
      offences: [],
    });
  });

  it("a name of 63 characters is a name of the pattern, in either directory", () => {
    const root = passesRoot({ functions: { [`${aNameOf(63)}.sql`]: GREET }, reference: { [`${aNameOf(63)}.json`]: "[]" } });
    const read = readPasses(root);
    expect(read.offences).toEqual([]);
    expect(read.functions?.map((file) => file.name)).toEqual([`${aNameOf(63)}.sql`]);
    expect(read.reference?.map((file) => file.name)).toEqual([`${aNameOf(63)}.json`]);
  });

  it("a function file that is only a comment is a file: it is not empty", () => {
    expect(readPasses(passesRoot({ functions: { "greet.sql": "-- not yet\n" } })).offences).toEqual([]);
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
    const root = passesRoot({ functions: { "twice.sql": "-- twice\n", [name]: GREET } });
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
