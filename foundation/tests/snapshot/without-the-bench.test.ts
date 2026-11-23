import { createHash } from "node:crypto";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { readInstances } from "@dxb-foundation/bench";
import { differenceOf, readChain, readPasses } from "@dxb-foundation/chain";
import { chainCommand } from "../chain/fixtures/command.ts";
import { removeTheChainRoots } from "../chain/fixtures/chain-on-disk.ts";
import { REAL_ROOT } from "../roles/fixtures/the-run.ts";
import { COMMAND_MS } from "./fixtures/the-check.ts";
import { EXPECTED_FIXTURE, EXPECTED_REAL, FIXTURE_SCHEMA_FILES, REAL_SCHEMA_FILES, fixtureRoot, schemaFileOfTheFixture } from "./fixtures/the-chains.ts";
import { offencesOf } from "./fixtures/the-form.ts";

// Piece 6a's SPEC §6 A: what is true without the bench — the pure difference, the command's refusals before any
// connection, and the two expected texts held to §4.2 and §4.3. Every file a case writes lies in a temporary
// directory outside the repository.

const scratch = mkdtempSync(join(tmpdir(), "dxb-foundation-snapshot-"));
afterAll(() => {
  try {
    chmodSync(join(scratch, "unreadable.txt"), 0o600);
  } catch {
    // Not made: the case that makes it did not run.
  }
  rmSync(scratch, { recursive: true, force: true });
  removeTheChainRoots();
});

const SNAPSHOT_USAGE = "usage: cli.ts snapshot [--check <file>]";
const CHAIN_USAGE = "usage: cli.ts up [--root <dir>] [--wait <seconds>]";

describe("A.1 differenceOf — lines as multisets, each list sorted by bytes", () => {
  it("equal texts: nothing on either side", () => {
    const text = "snapshot-format 1\nrole a\nrole b\n";
    expect(differenceOf(text, text)).toEqual({ expectedOnly: [], actualOnly: [] });
  });

  it("one changed line: the old line on the expected side, the new on the actual side", () => {
    expect(differenceOf("snapshot-format 1\nrole a\nrole b\nrole c\n", "snapshot-format 1\nrole a\nrole B\nrole c\n")).toEqual({
      expectedOnly: ["role b"],
      actualOnly: ["role B"],
    });
  });

  it("a line twice against once: the one it holds more of, once — and the other way round", () => {
    expect(differenceOf("snapshot-format 1\nrole a\nrole a\n", "snapshot-format 1\nrole a\n")).toEqual({ expectedOnly: ["role a"], actualOnly: [] });
    expect(differenceOf("snapshot-format 1\nrole a\n", "snapshot-format 1\nrole a\nrole a\nrole a\n")).toEqual({ expectedOnly: [], actualOnly: ["role a", "role a"] });
  });

  it("each list is sorted by UTF-8 bytes, whatever order the lines came in — U+FF01 before U+1F600, which UTF-16 order puts after it", () => {
    const expected = "snapshot-format 1\nz\nb\n\u{1F600}\n！\nB\n";
    const actual = "snapshot-format 1\n";
    expect(differenceOf(expected, actual)).toEqual({ expectedOnly: ["B", "b", "z", "！", "\u{1F600}"], actualOnly: [] });
    expect(differenceOf(actual, expected)).toEqual({ expectedOnly: [], actualOnly: ["B", "b", "z", "！", "\u{1F600}"] });
  });

  it("a final newline missing is not equal: the difference is not empty, on either side", () => {
    const whole = "snapshot-format 1\nrole a\nrole b\n";
    const cut = "snapshot-format 1\nrole a\nrole b";
    for (const [one, other] of [[whole, cut], [cut, whole]] as const) {
      const { expectedOnly, actualOnly } = differenceOf(one, other);
      expect(expectedOnly.length + actualOnly.length).toBeGreaterThan(0);
    }
  });
});

describe("A.2 the command refuses before any connection, and answers its usage lines", { timeout: COMMAND_MS }, () => {
  // What gives "before any connection" its force: with no instance standing, a command that connected first
  // could not have answered a refusal of its own — it would have failed on the connection.
  it("no instance stands while these cases run", () => {
    expect(readInstances()).toEqual([]);
  });

  const written = (name: string, content: string): string => {
    const path = join(scratch, name);
    writeFileSync(path, content);
    return path;
  };

  const refusals: [string, () => string][] = [
    ["a file that is absent", () => join(scratch, "absent.txt")],
    [
      "a directory",
      () => {
        mkdirSync(join(scratch, "a-directory"));
        return join(scratch, "a-directory");
      },
    ],
    [
      "a file that cannot be read",
      () => {
        const path = written("unreadable.txt", "snapshot-format 1\nrole a\n");
        chmodSync(path, 0o000);
        return path;
      },
    ],
  ];
  it.each(refusals)("%s → SNAPSHOT_REFUSED no-expected, exit 2", async (_what, made) => {
    const path = made();
    const said = await chainCommand(["snapshot", "--check", path], COMMAND_MS);
    expect(said.lines, said.stderr).toEqual(["SNAPSHOT_REFUSED no-expected"]);
    expect(said.code).toBe(2);
  });

  it("the absent file is still absent after the refusal: the command never writes an expected text", async () => {
    const path = join(scratch, "still-absent.txt");
    await chainCommand(["snapshot", "--check", path], COMMAND_MS);
    expect(() => readFileSync(path)).toThrow(/ENOENT/);
  });

  const malformed: [string, string][] = [
    ["no bytes at all", ""],
    ["a first line that is not snapshot-format 1", "snapshot-format 2\nrole a\n"],
    ["a first line missing", "role a\nrole b\n"],
    ["a line out of order", "snapshot-format 1\nrole b\nrole a\n"],
    ["a carriage return", "snapshot-format 1\r\nrole a\r\n"],
    ["a carriage return inside a line", "snapshot-format 1\nrole a\rb\n"],
    ["no final newline", "snapshot-format 1\nrole a"],
    ["an empty line", "snapshot-format 1\n\nrole a\n"],
    ["an empty last line", "snapshot-format 1\nrole a\n\n"],
  ];
  it.each(malformed)("%s → SNAPSHOT_REFUSED expected-malformed, exit 2", async (what, content) => {
    const said = await chainCommand(["snapshot", "--check", written(`malformed-${what.replaceAll(" ", "-")}.txt`, content)], COMMAND_MS);
    expect(said.lines, said.stderr).toEqual(["SNAPSHOT_REFUSED expected-malformed"]);
    expect(said.code).toBe(2);
  });

  const notTheSnapshotsWords: [string, string[]][] = [
    ["snapshot extra", ["snapshot", "extra"]],
    ["snapshot --check", ["snapshot", "--check"]],
    ["snapshot --check a b", ["snapshot", "--check", "a", "b"]],
    ["snapshot --check a --check b", ["snapshot", "--check", "a", "--check", "b"]],
    ["snapshot --root a", ["snapshot", "--root", "a"]],
    ["snapshot --fix", ["snapshot", "--fix"]],
  ];
  it.each(notTheSnapshotsWords)("%s → its own usage line, exit 2", async (_said, words) => {
    const said = await chainCommand(words, COMMAND_MS);
    expect(said.lines, said.stderr).toEqual([SNAPSHOT_USAGE]);
    expect(said.code).toBe(2);
  });

  const neitherCall: [string, string[]][] = [
    ["no word", []],
    ["down", ["down"]],
    ["snapshots", ["snapshots"]],
    ["Snapshot", ["Snapshot"]],
    ["check", ["check"]],
  ];
  it.each(neitherCall)("%s, neither up nor snapshot → piece 3's usage line unchanged, exit 2", async (_said, words) => {
    const said = await chainCommand(words, COMMAND_MS);
    expect(said.lines, said.stderr).toEqual([CHAIN_USAGE]);
    expect(said.code).toBe(2);
  });
});

describe("A.3 both expected texts obey SPEC §4.2 and hold no line of a kind §4.3 does not name", () => {
  it("the judge is seen to work first: it finds each offence planted in a text that is otherwise in the form", () => {
    const good = "snapshot-format 1\nschema os owner os_owner\nschema os_chain owner postgres\n";
    expect(offencesOf(good)).toEqual([]);
    const planted: [string, string][] = [
      ["snapshot-format 1\nschema os owner os_owner\nschema os_chain owner postgres", "no final newline"],
      ["snapshot-format 1\r\nschema os owner os_owner\n", "a carriage return"],
      ["snapshot-format 2\nschema os owner os_owner\n", `line 1 is not "snapshot-format 1"`],
      ["snapshot-format 1\nschema os_chain owner postgres\nschema os owner os_owner\n", "line 3 is out of order"],
      ["snapshot-format 1\n\nschema os owner os_owner\n", "line 2 is empty"],
      ["snapshot-format 1\nsnapshot-settings TimeZone=UTC\n", "line 2 is of no kind §4.3 names: snapshot-settings"],
      ["snapshot-format 1\nschema os  owner os_owner\n", "line 2 has a double space outside its last field"],
      ["snapshot-format 1\nrole-setting * in postgres app.settings.jwt_exp=604800\n", "line 2 says the value of a dotted setting"],
      ["snapshot-format 1\nschema os owner os_owner config -\n", "line 2 is not of its kind's shape: schema os owner os_owner config -"],
    ];
    for (const [text, offence] of planted) expect(offencesOf(text)).toContain(offence);
  });

  it.each([
    ["real", EXPECTED_REAL],
    ["fixture", EXPECTED_FIXTURE],
  ])("expected/%s.snapshot.txt: the first line, sorted by bytes, no \\r, no empty line, no double space outside a last field, a final newline, every line of §4.3's kinds and shapes", (_name, path) => {
    expect(offencesOf(readFileSync(path, "utf8"))).toEqual([]);
  });
});

describe("A.3 the texts carry the chains' ledger: each schema file's SHA-256, as the runner writes it (SPEC §7)", () => {
  const sha256 = (bytes: Buffer): string => createHash("sha256").update(bytes).digest("hex");
  const ledgerLines = (path: string): string[] => readFileSync(path, "utf8").split("\n").filter((line) => line.startsWith("ledger ") && !line.startsWith("ledger 0 "));
  const expectedLedger = (names: readonly string[]): string[] =>
    names.map((name, at) => `ledger ${at + 1} ${name} schema ${sha256(schemaFileOfTheFixture(name))} runner 1`);

  it("real: the files of db/schema, by position", () => {
    const names = readChain(REAL_ROOT).files.map((file) => file.name);
    expect(names).toEqual([...REAL_SCHEMA_FILES]);
    expect(ledgerLines(EXPECTED_REAL)).toEqual(expectedLedger(names));
  });

  it("fixture: the real two, then the fixture's own", () => {
    expect(ledgerLines(EXPECTED_FIXTURE)).toEqual(expectedLedger([...REAL_SCHEMA_FILES, ...FIXTURE_SCHEMA_FILES]));
  });

  it("the fixture chain, assembled, reads with no offence: its schema files, its function files and its reference file", () => {
    const root = fixtureRoot();
    expect(readChain(root).offences).toEqual([]);
    const passes = readPasses(root);
    expect(passes.offences).toEqual([]);
    expect(passes.functions?.map((file) => file.name)).toEqual(["count_parts.sql", "next_ticket.sql", "parts_touch.sql"]);
    expect(passes.reference?.map((file) => file.name)).toEqual(["kinds.json"]);
  });
});
