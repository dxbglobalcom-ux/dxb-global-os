import { createHash } from "node:crypto";
import { chmodSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { ChainRefused, readChain, type ChainFile } from "@dxb-foundation/chain";
import { BORN_AND_PETS, PEOPLE, PLACES, REMARKS, VISITS, chainOf, type FixtureFile } from "./fixtures/chain-files.ts";
import { chainRoot, emptyDirectory, inSchema, removeTheChainRoots } from "./fixtures/chain-on-disk.ts";
import { refusalOf } from "./fixtures/refusal.ts";

// SPEC §4, the chain on the disk: `<root>/schema` read from the directory alone —
// no database. Every chain below is written into a temporary directory of its
// own, and every offence's kind and detail is spelled here.

afterAll(removeTheChainRoots);

/** A fixture file as readChain must give it back: the number is spelled by the case, the hash is the literal beside the text. */
const asRead = (file: FixtureFile, number: number): ChainFile => ({ name: file.name, number, hash: file.sha256, text: file.text });

const SOME_SQL = "create table public.other (id integer);\n";

describe("the fixture files — seen to be what they say before a hash is trusted", () => {
  it.each([PEOPLE, PLACES, VISITS, BORN_AND_PETS, REMARKS])("the literal beside $name is the SHA-256 of its bytes", (file) => {
    expect(createHash("sha256").update(file.text, "utf8").digest("hex")).toBe(file.sha256);
  });
});

describe("readChain — the files of <root>/schema", () => {
  it("come back by number, each with its name, its number, the SHA-256 of its bytes and its text", () => {
    // Written last to first: the order is the number's, not the one the files were made in.
    const root = chainRoot(chainOf(REMARKS, VISITS, PLACES, PEOPLE));
    expect(readChain(root)).toEqual({
      files: [asRead(PEOPLE, 1), asRead(PLACES, 2), asRead(VISITS, 3), asRead(REMARKS, 10)],
      offences: [],
    });
  });

  it("a schema/ that holds nothing is a chain of no files", () => {
    expect(readChain(chainRoot())).toEqual({ files: [], offences: [] });
  });

  it("a file that is only a comment is a file like any other — it is not empty", () => {
    const root = chainRoot({ ...chainOf(PEOPLE), "0002-a-note.sql": "-- nothing to do yet\n" });
    const read = readChain(root);
    expect(read.offences).toEqual([]);
    expect(read.files.map((file) => file.name)).toEqual(["0001-people.sql", "0002-a-note.sql"]);
  });

  it("what lies in the root beside schema/ is not the chain's: it is not read", () => {
    const root = chainRoot(chainOf(PEOPLE));
    mkdirSync(join(root, "functions"));
    writeFileSync(join(root, "functions", "not-a-chain-file.txt"), SOME_SQL);
    writeFileSync(join(root, "README.md"), "beside the chain\n");
    expect(readChain(root)).toEqual({ files: [asRead(PEOPLE, 1)], offences: [] });
  });
});

describe("readChain — the disk's own offences, each planted and named", () => {
  it.each([
    ["another ending", "notes.txt"],
    ["a number of three digits", "001-short.sql"],
    ["a number of five digits", "00001-long.sql"],
    ["a capital letter", "0002-People.sql"],
    ["an underscore", "0002-more_people.sql"],
    ["a hyphen at the end of the name", "0002-people-.sql"],
    ["two hyphens together", "0002-more--people.sql"],
    ["no word after the number", "0002.sql"],
    ["the ending in capitals", "0002-people.SQL"],
    ["a name that begins with a dot", ".keep"],
  ])("unknown-entry: a file with %s", (_what, name) => {
    const root = chainRoot({ ...chainOf(PEOPLE), [name]: SOME_SQL });
    expect(readChain(root).offences).toEqual([{ kind: "unknown-entry", detail: name }]);
  });

  it("unknown-entry: a directory, whatever its name", () => {
    const root = chainRoot(chainOf(PEOPLE));
    mkdirSync(inSchema(root, "archive"));
    mkdirSync(inSchema(root, "0002-a-directory.sql"));
    expect(readChain(root).offences).toEqual([
      { kind: "unknown-entry", detail: "0002-a-directory.sql" },
      { kind: "unknown-entry", detail: "archive" },
    ]);
  });

  it("unknown-entry: a link, also one that carries a file's name and leads to a file — or to nothing", () => {
    const root = chainRoot(chainOf(PEOPLE));
    writeFileSync(join(root, "outside.sql"), SOME_SQL);
    symlinkSync(join(root, "outside.sql"), inSchema(root, "0002-a-link.sql"));
    symlinkSync(join(root, "never-written.sql"), inSchema(root, "0003-a-dangling-link.sql"));
    expect(readChain(root).offences).toEqual([
      { kind: "unknown-entry", detail: "0002-a-link.sql" },
      { kind: "unknown-entry", detail: "0003-a-dangling-link.sql" },
    ]);
  });

  it("duplicated-number: two files carry the same number — both named, in ascending order", () => {
    const root = chainRoot({ "0002-sites.sql": SOME_SQL, ...chainOf(PEOPLE, PLACES) });
    expect(readChain(root).offences).toEqual([{ kind: "duplicated-number", detail: "0002-places.sql 0002-sites.sql" }]);
  });

  it("duplicated-content: two files carry the same bytes — both named, in ascending order", () => {
    const root = chainRoot({ "0002-people-again.sql": PEOPLE.text, ...chainOf(PEOPLE) });
    expect(readChain(root).offences).toEqual([{ kind: "duplicated-content", detail: "0001-people.sql 0002-people-again.sql" }]);
  });

  it.each([
    ["no bytes", ""],
    ["white space only", " \n\t\r\n"],
  ])("empty: a file of %s", (_what, content) => {
    const root = chainRoot({ ...chainOf(PEOPLE), "0002-nothing.sql": content });
    expect(readChain(root).offences).toEqual([{ kind: "empty", detail: "0002-nothing.sql" }]);
  });

  it.each([
    ["a byte that begins no character", [0xff]],
    ["a character cut off in its middle", [0xc3]],
  ])("unreadable: a file that is not valid UTF-8 — %s", (_what, bytes) => {
    const notText = Uint8Array.from([...Buffer.from("create table public.other (id integer); -- "), ...bytes, 0x0a]);
    const root = chainRoot({ ...chainOf(PEOPLE), "0002-not-text.sql": notText });
    expect(readChain(root).offences).toEqual([{ kind: "unreadable", detail: "0002-not-text.sql" }]);
  });

  it("unreadable: a file this user may not read", () => {
    const root = chainRoot({ ...chainOf(PEOPLE), "0002-locked.sql": SOME_SQL });
    chmodSync(inSchema(root, "0002-locked.sql"), 0o000);
    // Seen first: a user who may read every file whatever its mode would make this case say nothing.
    expect(() => readFileSync(inSchema(root, "0002-locked.sql"))).toThrow(/EACCES/);
    expect(readChain(root).offences).toEqual([{ kind: "unreadable", detail: "0002-locked.sql" }]);
  });

  it("says every offence, none hiding another — by kind as SPEC §4 lists them, then by detail", () => {
    const root = chainRoot({
      "beta.txt": "b\n",
      "0003-sites.sql": SOME_SQL,
      "0002-nothing.sql": "",
      "alpha.txt": "a\n",
      ...chainOf(PEOPLE),
      "0003-places.sql": PLACES.text,
    });
    expect(readChain(root).offences).toEqual([
      { kind: "unknown-entry", detail: "alpha.txt" },
      { kind: "unknown-entry", detail: "beta.txt" },
      { kind: "duplicated-number", detail: "0003-places.sql 0003-sites.sql" },
      { kind: "empty", detail: "0002-nothing.sql" },
    ]);
  });
});

describe("readChain — no chain", () => {
  it.each<[string, () => string]>([
    ["holds no schema/", () => emptyDirectory()],
    ["does not exist", () => join(emptyDirectory(), "never-made")],
    [
      "holds a file named schema, not a directory",
      () => {
        const root = emptyDirectory();
        writeFileSync(join(root, "schema"), SOME_SQL);
        return root;
      },
    ],
  ])("a root that %s is refused: no-chain", async (_what, prepare) => {
    const refusal = await refusalOf(ChainRefused, () => readChain(prepare()));
    expect(refusal.reason).toBe("no-chain");
  });
});
