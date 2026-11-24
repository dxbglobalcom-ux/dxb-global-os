import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readInstances } from "@dxb-foundation/bench";
import { chainCommand } from "../../chain/fixtures/command.ts";
import { COMMAND_MS, EXPECTED_FURTHER, EXPECTED_REAL } from "../fixtures/the-outside.ts";

// Piece 6c's SPEC §5 and §6 A: `outside` refuses a before or an expected text it cannot read, or that is not of its
// spelling, before any connection — the before judged first; `inventory` and `outside` with any other words answer
// their own usage lines; `snapshot`'s, `rows`' and piece 3's are unchanged. Every file a case writes lies in
// `scratch`, a temporary directory outside the repository.

const INVENTORY_USAGE = "usage: cli.ts inventory";
const OUTSIDE_USAGE = "usage: cli.ts outside --before <file> [--check <file>]";
const SNAPSHOT_USAGE = "usage: cli.ts snapshot [--check <file>]";
const ROWS_USAGE = "usage: cli.ts rows [--kept <file>]";
const CHAIN_USAGE = "usage: cli.ts up [--root <dir>] [--wait <seconds>]";

const DIGEST = "a".repeat(64);
/** An inventory in its spelling — what the command must accept as a before, and then reach for the database. */
const AN_INVENTORY = `inventory-format 1\nread pg_namespace 1\nrow out pg_namespace ${DIGEST} schema x\n`;

const bytes = (text: string): Buffer => Buffer.from(text, "utf8");

const BEFORE_MALFORMED: [string, Buffer][] = [
  ["no bytes at all", bytes("")],
  ["a first line that is not inventory-format 1", bytes(`inventory-format 2\nrow out pg_namespace ${DIGEST} schema x\n`)],
  ["an outside text, not an inventory", bytes("outside-format 1\nadded row pg_namespace schema x\n")],
  ["a snapshot's text, not an inventory", bytes("snapshot-format 1\nschema os owner os_owner\n")],
  ["a first line missing", bytes(`row out pg_namespace ${DIGEST} schema x\n`)],
  ["a line out of order", bytes(`inventory-format 1\nrow out pg_namespace ${DIGEST} schema y\nrow out pg_namespace ${DIGEST} schema x\n`)],
  ["out of order by UTF-8 bytes, though in order by UTF-16 code units", bytes(`inventory-format 1\nrow out pg_namespace ${DIGEST} schema "\u{1F600}"\nrow out pg_namespace ${DIGEST} schema "！"\n`)],
  ["a carriage return ending each line", bytes(`inventory-format 1\r\nrow out pg_namespace ${DIGEST} schema x\r\n`)],
  ["no final newline", bytes(`inventory-format 1\nrow out pg_namespace ${DIGEST} schema x`)],
  ["an empty line", bytes(`inventory-format 1\n\nrow out pg_namespace ${DIGEST} schema x\n`)],
  ["an empty last line", bytes(`inventory-format 1\nrow out pg_namespace ${DIGEST} schema x\n\n`)],
  ["a byte-order mark before the first line", Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), bytes(AN_INVENTORY)])],
  ["a byte that is never UTF-8 (0xff)", Buffer.concat([bytes(`inventory-format 1\nrow out pg_namespace ${DIGEST} schema "`), Buffer.from([0xff]), bytes('"\n')])],
];

const EXPECTED_MALFORMED: [string, Buffer][] = [
  ["no bytes at all", bytes("")],
  ["an inventory, not an outside text", bytes(AN_INVENTORY)],
  ["a first line that is not outside-format 1", bytes("outside-format 2\n")],
  ["a line out of order", bytes("outside-format 1\nremoved row pg_namespace schema x\nadded row pg_namespace schema x\n")],
  ["a carriage return ending each line", bytes("outside-format 1\r\nadded row pg_namespace schema x\r\n")],
  ["no final newline", bytes("outside-format 1\nadded row pg_namespace schema x")],
  ["an empty line", bytes("outside-format 1\n\nadded row pg_namespace schema x\n")],
  ["a byte-order mark before the first line", Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), bytes("outside-format 1\n")])],
];

export function refusalCases(scratch: () => string): void {
  const written = (name: string, content: Buffer | string): string => {
    const path = join(scratch(), name);
    writeFileSync(path, content);
    return path;
  };
  const named = (what: string): string => what.replaceAll(/[^a-z0-9]+/gi, "-");
  const outside = (...words: string[]) => chainCommand(["outside", ...words], COMMAND_MS);

  describe("A outside refuses before any connection", { timeout: COMMAND_MS }, () => {
    // What gives "before any connection" its force: with no instance standing, a command that connected first
    // could not have answered a refusal of its own — it would have failed on the connection.
    it("no instance stands while these cases run", () => {
      expect(readInstances()).toEqual([]);
    });

    const unreadable: [string, () => string][] = [
      ["a file that is absent", () => join(scratch(), "absent.inventory.txt")],
      ["a directory", () => {
        mkdirSync(join(scratch(), "a-directory"));
        return join(scratch(), "a-directory");
      }],
      ["a file that cannot be read", () => {
        const path = written("unreadable.inventory.txt", AN_INVENTORY);
        chmodSync(path, 0o000);
        return path;
      }],
    ];
    it.each(unreadable)("a before that is %s → OUTSIDE_REFUSED no-before, exit 2", async (_what, made) => {
      const said = await outside("--before", made());
      expect(said.lines, said.stderr).toEqual(["OUTSIDE_REFUSED no-before"]);
      expect(said.code).toBe(2);
    });

    it.each(BEFORE_MALFORMED)("a before with %s → OUTSIDE_REFUSED before-malformed, exit 2", async (what, content) => {
      const said = await outside("--before", written(`before-${named(what)}.txt`, content));
      expect(said.lines, said.stderr).toEqual(["OUTSIDE_REFUSED before-malformed"]);
      expect(said.code).toBe(2);
    });

    it("an expected text that is absent, beside a good before → OUTSIDE_REFUSED no-expected, exit 2", async () => {
      const said = await outside("--before", written("good.inventory.txt", AN_INVENTORY), "--check", join(scratch(), "absent.outside.txt"));
      expect(said.lines, said.stderr).toEqual(["OUTSIDE_REFUSED no-expected"]);
      expect(said.code).toBe(2);
    });

    it("an expected text that is a directory, beside a good before → OUTSIDE_REFUSED no-expected, exit 2", async () => {
      mkdirSync(join(scratch(), "an-expected-directory"));
      const said = await outside("--before", written("good2.inventory.txt", AN_INVENTORY), "--check", join(scratch(), "an-expected-directory"));
      expect(said.lines, said.stderr).toEqual(["OUTSIDE_REFUSED no-expected"]);
      expect(said.code).toBe(2);
    });

    it.each(EXPECTED_MALFORMED)("an expected text with %s, beside a good before → OUTSIDE_REFUSED expected-malformed, exit 2", async (what, content) => {
      const said = await outside("--before", written(`good-${named(what)}.inventory.txt`, AN_INVENTORY), "--check", written(`expected-${named(what)}.txt`, content));
      expect(said.lines, said.stderr).toEqual(["OUTSIDE_REFUSED expected-malformed"]);
      expect(said.code).toBe(2);
    });

    it("the before is judged first: both absent → no-before; a malformed before beside an absent expected text → before-malformed", async () => {
      const both = await outside("--before", join(scratch(), "absent-1.txt"), "--check", join(scratch(), "absent-2.txt"));
      expect(both.lines, both.stderr).toEqual(["OUTSIDE_REFUSED no-before"]);
      expect(both.code).toBe(2);
      const malformed = await outside("--before", written("first-judged.txt", "snapshot-format 1\n"), "--check", join(scratch(), "absent-3.txt"));
      expect(malformed.lines, malformed.stderr).toEqual(["OUTSIDE_REFUSED before-malformed"]);
      expect(malformed.code).toBe(2);
    });

    it("the files are not written: an absent before and an absent expected text are still absent after the refusals", async () => {
      const before = join(scratch(), "still-absent.inventory.txt");
      const expected = join(scratch(), "still-absent.outside.txt");
      await outside("--before", before);
      await outside("--before", written("good3.inventory.txt", AN_INVENTORY), "--check", expected);
      expect(() => readFileSync(before)).toThrow(/ENOENT/);
      expect(() => readFileSync(expected)).toThrow(/ENOENT/);
    });

    // With no instance standing, files the command accepts can only be answered by its reach for a connection,
    // which fails — never a refusal of the files. The committed expected texts are such files.
    it("a good before, alone and with each committed expected text: no refusal of the files — the refused connection", async () => {
      const before = written("good4.inventory.txt", AN_INVENTORY);
      for (const words of [["--before", before], ["--before", before, "--check", EXPECTED_REAL], ["--before", before, "--check", EXPECTED_FURTHER]]) {
        const said = await outside(...words);
        expect(said.lines.filter((line) => line.startsWith("OUTSIDE_REFUSED")), said.stderr).toEqual([]);
        expect(said.lines.filter((line) => line.startsWith("OUTSIDE_EQUAL") || line.startsWith("OUTSIDE_RED"))).toEqual([]);
        expect(said.stderr).toMatch(/ECONNREFUSED/);
        expect(said.code).not.toBe(0);
      }
    });

    it("the first line alone is an inventory: no refusal, the refused connection", async () => {
      const said = await outside("--before", written("first-line-alone.inventory.txt", "inventory-format 1\n"));
      expect(said.lines.filter((line) => line.startsWith("OUTSIDE_REFUSED")), said.stderr).toEqual([]);
      expect(said.stderr).toMatch(/ECONNREFUSED/);
    });

    it("inventory with no instance standing: no text at all on stdout — a text is whole or there is none — and the refused connection", async () => {
      const said = await chainCommand(["inventory"], COMMAND_MS);
      expect(said.lines, said.stderr.slice(-1_500)).toEqual([]);
      expect(said.stderr).toMatch(/ECONNREFUSED/);
      expect(said.code).not.toBe(0);
    });
  });

  describe("A the usage lines", { timeout: COMMAND_MS }, () => {
    const notTheInventorysWords: [string, string[]][] = [
      ["inventory extra", ["inventory", "extra"]],
      ["inventory --before a", ["inventory", "--before", "a"]],
      ["inventory --check a", ["inventory", "--check", "a"]],
    ];
    it.each(notTheInventorysWords)("%s → its own usage line, exit 2", async (_said, words) => {
      const said = await chainCommand(words, COMMAND_MS);
      expect(said.lines, said.stderr).toEqual([INVENTORY_USAGE]);
      expect(said.code).toBe(2);
    });

    const notTheOutsidesWords: [string, string[]][] = [
      ["outside", ["outside"]],
      ["outside --before", ["outside", "--before"]],
      ["outside --check a", ["outside", "--check", "a"]],
      ["outside --check a --before b (the options out of order)", ["outside", "--check", "a", "--before", "b"]],
      ["outside --before a --before b", ["outside", "--before", "a", "--before", "b"]],
      ["outside --before a --check", ["outside", "--before", "a", "--check"]],
      ["outside --before a --check b --check c", ["outside", "--before", "a", "--check", "b", "--check", "c"]],
      ["outside --before a extra", ["outside", "--before", "a", "extra"]],
      ["outside --before a --check b extra", ["outside", "--before", "a", "--check", "b", "extra"]],
      ["outside --before --check a", ["outside", "--before", "--check", "a"]],
      ["outside --kept a", ["outside", "--kept", "a"]],
      ["outside extra", ["outside", "extra"]],
    ];
    it.each(notTheOutsidesWords)("%s → its own usage line, exit 2", async (_said, words) => {
      const said = await chainCommand(words, COMMAND_MS);
      expect(said.lines, said.stderr).toEqual([OUTSIDE_USAGE]);
      expect(said.code).toBe(2);
    });

    it("snapshot's and rows' usage lines are unchanged", async () => {
      for (const [words, usage] of [[["snapshot", "extra"], SNAPSHOT_USAGE], [["rows", "extra"], ROWS_USAGE], [["snapshot", "--before", "a"], SNAPSHOT_USAGE], [["rows", "--before", "a"], ROWS_USAGE]] as const) {
        const said = await chainCommand([...words], COMMAND_MS);
        expect(said.lines, said.stderr).toEqual([usage]);
        expect(said.code).toBe(2);
      }
    });

    const noCall: [string, string[]][] = [
      ["Inventory", ["Inventory"]],
      ["inventories", ["inventories"]],
      ["Outside", ["Outside"]],
      ["outsides", ["outsides"]],
      ["--before a", ["--before", "a"]],
      ["--check a", ["--check", "a"]],
    ];
    it.each(noCall)("%s, none of the command's calls → piece 3's usage line unchanged, exit 2", async (_said, words) => {
      const said = await chainCommand(words, COMMAND_MS);
      expect(said.lines, said.stderr).toEqual([CHAIN_USAGE]);
      expect(said.code).toBe(2);
    });
  });
}
