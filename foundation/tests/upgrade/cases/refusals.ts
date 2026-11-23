import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readInstances } from "@dxb-foundation/bench";
import { chainCommand } from "../../chain/fixtures/command.ts";
import { COMMAND_MS } from "../fixtures/the-rows.ts";

// Piece 6b's SPEC §6 A.2: `rows --kept` refuses a before it cannot read, or that is not a rows' text, before any
// connection; `rows` with any other words answers its own usage line; `snapshot`'s usage line and piece 3's are
// unchanged. Every file a case writes lies in `scratch`, a temporary directory outside the repository.

const ROWS_USAGE = "usage: cli.ts rows [--kept <file>]";
const SNAPSHOT_USAGE = "usage: cli.ts snapshot [--check <file>]";
const CHAIN_USAGE = "usage: cli.ts up [--root <dir>] [--wait <seconds>]";

const ascii = (text: string): Buffer => Buffer.from(text, "utf8");

export function refusalCases(scratch: () => string): void {
  const written = (name: string, content: Buffer | string): string => {
    const path = join(scratch(), name);
    writeFileSync(path, content);
    return path;
  };
  const kept = (path: string) => chainCommand(["rows", "--kept", path], COMMAND_MS);

  describe("A.2 rows --kept refuses before any connection", { timeout: COMMAND_MS }, () => {
    // What gives "before any connection" its force: with no instance standing, a command that connected first
    // could not have answered a refusal of its own — it would have failed on the connection.
    it("no instance stands while these cases run", () => {
      expect(readInstances()).toEqual([]);
    });

    const unreadable: [string, () => string][] = [
      ["a file that is absent", () => join(scratch(), "absent.rows.txt")],
      [
        "a directory",
        () => {
          mkdirSync(join(scratch(), "a-directory"));
          return join(scratch(), "a-directory");
        },
      ],
      [
        "a file that cannot be read",
        () => {
          const path = written("unreadable.rows.txt", "rows-format 1\nrow os.a {}\n");
          chmodSync(path, 0o000);
          return path;
        },
      ],
    ];
    it.each(unreadable)("%s → ROWS_REFUSED no-before, exit 2", async (_what, made) => {
      const said = await kept(made());
      expect(said.lines, said.stderr).toEqual(["ROWS_REFUSED no-before"]);
      expect(said.code).toBe(2);
    });

    it("the absent file is still absent after the refusal: the command never writes a file", async () => {
      const path = join(scratch(), "still-absent.rows.txt");
      await kept(path);
      expect(() => readFileSync(path)).toThrow(/ENOENT/);
    });

    const malformed: [string, Buffer][] = [
      ["no bytes at all", ascii("")],
      ["a first line that is not rows-format 1", ascii("rows-format 2\nrow os.a {}\n")],
      ["a snapshot's text, not a rows' text", ascii("snapshot-format 1\nschema os owner os_owner\n")],
      ["a first line missing", ascii("row os.a {}\nrow os.b {}\n")],
      ["a line out of order", ascii("rows-format 1\nrow os.b {}\nrow os.a {}\n")],
      ["out of order by UTF-8 bytes, though in order by UTF-16 code units", ascii('rows-format 1\nrow os.a {"x": "\u{1F600}"}\nrow os.a {"x": "！"}\n')],
      ["a carriage return ending each line", ascii("rows-format 1\r\nrow os.a {}\r\n")],
      ["a carriage return inside a line", ascii("rows-format 1\nrow os.a {}\rx\n")],
      ["no final newline", ascii("rows-format 1\nrow os.a {}")],
      ["an empty line", ascii("rows-format 1\n\nrow os.a {}\n")],
      ["an empty last line", ascii("rows-format 1\nrow os.a {}\n\n")],
      ["a byte-order mark before the first line", Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), ascii("rows-format 1\nrow os.a {}\n")])],
      ["a byte that is never UTF-8 (0xff)", Buffer.concat([ascii('rows-format 1\nrow os.a {"x": "'), Buffer.from([0xff]), ascii('"}\n')])],
      ["a continuation byte with nothing before it (0x80)", Buffer.concat([ascii('rows-format 1\nrow os.a {"x": "'), Buffer.from([0x80]), ascii('"}\n')])],
      ["a character cut short (0xe2 0x82)", Buffer.concat([ascii('rows-format 1\nrow os.a {"x": "'), Buffer.from([0xe2, 0x82]), ascii('"}\n')])],
      ["an overlong spelling of '/' (0xc0 0xaf)", Buffer.concat([ascii('rows-format 1\nrow os.a {"x": "'), Buffer.from([0xc0, 0xaf]), ascii('"}\n')])],
    ];
    it.each(malformed)("%s → ROWS_REFUSED before-malformed, exit 2", async (what, bytes) => {
      const said = await kept(written(`malformed-${what.replaceAll(/[^a-z0-9]+/gi, "-")}.rows.txt`, bytes));
      expect(said.lines, said.stderr).toEqual(["ROWS_REFUSED before-malformed"]);
      expect(said.code).toBe(2);
    });

    // With no instance standing, a before the command accepts can only be answered by its reach for a connection,
    // which fails: the file with a line held twice is answered as the same file with the line once is, and the
    // answer is the refused connection's — never a refusal of the file. Rows are a multiset (SPEC §5).
    it("a row held twice, side by side, is no malformation: answered as the file holding it once is, by the refused connection", async () => {
      const once = await kept(written("held-once.rows.txt", "rows-format 1\nrow os.a {}\n"));
      const twice = await kept(written("held-twice.rows.txt", "rows-format 1\nrow os.a {}\nrow os.a {}\n"));
      expect(twice.lines, twice.stderr).toEqual(once.lines);
      expect(twice.code).toBe(once.code);
      for (const refusal of ["ROWS_REFUSED before-malformed", "ROWS_REFUSED no-before"]) expect(twice.lines).not.toContain(refusal);
      expect(twice.stderr).toMatch(/ECONNREFUSED/);
    });

    it("the first line alone is a rows' text (a database with no covered schema): no refusal, the refused connection", async () => {
      const said = await kept(written("first-line-alone.rows.txt", "rows-format 1\n"));
      for (const refusal of ["ROWS_REFUSED before-malformed", "ROWS_REFUSED no-before"]) expect(said.lines).not.toContain(refusal);
      expect(said.stderr).toMatch(/ECONNREFUSED/);
    });
  });

  describe("A.2 the usage lines", { timeout: COMMAND_MS }, () => {
    const notTheRowsWords: [string, string[]][] = [
      ["rows extra", ["rows", "extra"]],
      ["rows --kept", ["rows", "--kept"]],
      ["rows --kept a b", ["rows", "--kept", "a", "b"]],
      ["rows --kept a --kept b", ["rows", "--kept", "a", "--kept", "b"]],
      ["rows --check a", ["rows", "--check", "a"]],
      ["rows --root a", ["rows", "--root", "a"]],
      ["rows --kept --kept", ["rows", "--kept", "--kept"]],
    ];
    it.each(notTheRowsWords)("%s → its own usage line, exit 2", async (_said, words) => {
      const said = await chainCommand(words, COMMAND_MS);
      expect(said.lines, said.stderr).toEqual([ROWS_USAGE]);
      expect(said.code).toBe(2);
    });

    const notTheSnapshotsWords: [string, string[]][] = [
      ["snapshot extra", ["snapshot", "extra"]],
      ["snapshot --kept a", ["snapshot", "--kept", "a"]],
    ];
    it.each(notTheSnapshotsWords)("%s → snapshot's usage line, unchanged, exit 2", async (_said, words) => {
      const said = await chainCommand(words, COMMAND_MS);
      expect(said.lines, said.stderr).toEqual([SNAPSHOT_USAGE]);
      expect(said.code).toBe(2);
    });

    const noCall: [string, string[]][] = [
      ["no word", []],
      ["row", ["row"]],
      ["Rows", ["Rows"]],
      ["kept", ["kept"]],
      ["--kept a", ["--kept", "a"]],
    ];
    it.each(noCall)("%s, none of up, snapshot or rows → piece 3's usage line unchanged, exit 2", async (_said, words) => {
      const said = await chainCommand(words, COMMAND_MS);
      expect(said.lines, said.stderr).toEqual([CHAIN_USAGE]);
      expect(said.code).toBe(2);
    });
  });
}
