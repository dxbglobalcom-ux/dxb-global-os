import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "pg";
import { expect, vi } from "vitest";
import { connectionString, loginConnectionString } from "@dxb-foundation/bench";
import { snapshotOf } from "@dxb-foundation/chain";
import { columnOf } from "../../chain/fixtures/looking.ts";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import { asLogin } from "../../roles/fixtures/tcp-logins.ts";
import type { Step } from "../../roles/fixtures/the-run.ts";
import { withTheSessionSaying } from "./clean.ts";
import { CASE_MS, asTheOwner, fixtureEqual } from "../fixtures/changes.ts";
import { EXPECTED_FIXTURE } from "../fixtures/the-chains.ts";
import { expectEqual, expectRedBy, snapshotPrinted } from "../fixtures/the-check.ts";

// SPEC §11.1 rows 6, 7 and 9, on the fixture chain: the text read through a session that asks for another client
// encoding; a temporary table a login holds open; a carriage return inside a line; and the reader's own statements,
// recorded in process.

/** The statements a `pg` Client was asked to send, each as its text — a query is a string or a config object. */
const textsOf = (calls: readonly unknown[][]): string[] =>
  calls.map(([query]) => (typeof query === "string" ? query : String((query as { text?: unknown }).text)));

/** A statement as it is judged: white space at its ends dropped, runs of it made one space, in lower case. */
const plain = (statement: string): string => statement.trim().replace(/\s+/g, " ").toLowerCase();

/** SPEC §4.4's ten `set local`, name → value (lower case, quotes taken off). */
const THE_TEN = {
  search_path: "",
  extra_float_digits: "3",
  timezone: "utc",
  datestyle: "iso, ymd",
  intervalstyle: "postgres",
  bytea_output: "hex",
  quote_all_identifiers: "off",
  standard_conforming_strings: "on",
  row_security: "off",
  client_encoding: "utf8",
};

/**
 * What writes, locks or sets a role (the test hand's list): a statement that begins with one of these words —
 * every data or definition write, a lock, a role or session change, a session-wide `set` (anything but `set local`),
 * `reset`/`discard`, a procedure or anonymous block, a notification, a prepared or two-phase transaction, a
 * maintenance command — or that holds anywhere a call that writes or locks: an advisory lock, a sequence's
 * advancing, a row lock, a large object's writing, a notification, a role set through set_config.
 */
const BEGINS_WITH_A_WRITE =
  /^(insert|update|delete|merge|create|alter|drop|truncate|grant|revoke|comment|security label|lock|copy|call|do|reset|discard|listen|notify|unlisten|prepare|commit|end|savepoint|release|vacuum|analyze|analyse|cluster|reindex|refresh|checkpoint|load|import|reassign|set role|set session|set local role|set local session|set (?!local ))/;
const HOLDS_A_WRITE =
  /pg_(try_)?advisory|\bnextval\s*\(|\bsetval\s*\(|\bfor (no key )?update\b|\bfor (key )?share\b|\blo_(create|import|unlink|put|from_bytea|truncate|creat)\b|\bpg_notify\s*\(|set_config\s*\(\s*'(role|session_authorization)'|\binsert into\b|\bdelete from\b/;

export function theAuditReading(step: Step): void {
  // Measured (2026-11-23): pg 8.22 writes `client_encoding UTF8` into every startup packet (pg-protocol's
  // serializer), and the server takes that explicit parameter over the `-c` of `options` — a session opened by the
  // driver with these options says client_encoding UTF8, source `client`. The case pins the bytes all the same.
  step("§11.1 row 6 with a non-ASCII comment standing in os, the text read through a session whose options say client_encoding=LATIN1 equals the text read without them, byte for byte", CASE_MS, async () => {
    await asTheOwner("comment on sequence os.ticket_seq is 'Größe ü'");
    try {
      const text = await snapshotOf({ connectionString: connectionString() });
      expect(text.includes("\ncomment sequence os.ticket_seq 00001|Größe ü\n")).toBe(true);
      expect(await snapshotOf({ connectionString: withTheSessionSaying({ client_encoding: "LATIN1" }) })).toBe(text);
    } finally {
      await asTheOwner("comment on sequence os.ticket_seq is null");
    }
    await fixtureEqual();
  });

  step("§11.1 row 6 while a login holds a session in which it made a temporary table: SNAPSHOT_EQUAL, and the printed text holds no pg_temp", CASE_MS, async () => {
    await asLogin(loginConnectionString("os_reader"), async (reader) => {
      await reader.query("create temporary table snap_temp (id integer, note text)");
      const temporary = await onTheInstance((client) =>
        columnOf(
          client,
          `select n.nspname::text from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid = c.relnamespace
            where c.relowner = pg_catalog.to_regrole('os_reader') and c.relpersistence = 't' order by 1`,
        ),
      );
      // The table and its toast table and index, in the session's two temporary schemas.
      expect(temporary.length, temporary.join(" ")).toBe(3);
      expect(temporary.every((schema) => /^pg_(toast_)?temp_\d+$/.test(schema)), temporary.join(" ")).toBe(true);
      await fixtureEqual();
      const printed = await snapshotPrinted();
      expect(printed.code, printed.stderr.slice(-1_500)).toBe(0);
      expect(printed.stdout.includes("pg_temp")).toBe(false);
      expect(printed.stdout.includes("pg_toast_temp")).toBe(false);
    });
    await fixtureEqual();
  });

  // A raw carriage return, and beside it a backslash and an `r` that the comment really holds: §4.2 doubles the
  // backslash first, so the two stay apart — `\r` for the one, `\\r` for the other.
  step("§11.1 row 7 a comment holding \\r\\n: the difference holds the two characters \\r and no raw carriage return; snapshot prints no raw one; what it prints, as a file, is SNAPSHOT_EQUAL", CASE_MS, async () => {
    const scratch = mkdtempSync(join(tmpdir(), "dxb-foundation-snapshot-cr-"));
    await asTheOwner("comment on sequence os.ticket_seq is E'one\\r\\ntwo\\\\r'");
    try {
      await expectRedBy(EXPECTED_FIXTURE, {
        actualOnly: ["comment sequence os.ticket_seq 00001|one\\r", "comment sequence os.ticket_seq 00002|two\\\\r"],
      });
      const printed = await snapshotPrinted();
      expect(printed.code, printed.stderr.slice(-1_500)).toBe(0);
      expect(printed.stdout.includes("\r")).toBe(false);
      const file = join(scratch, "printed.snapshot.txt");
      writeFileSync(file, printed.stdout);
      await expectEqual(file, printed.stdout.split("\n").length - 1);
    } finally {
      await asTheOwner("comment on sequence os.ticket_seq is null");
      rmSync(scratch, { recursive: true, force: true });
    }
    await fixtureEqual();
  });

  step("§11.1 row 9 the reader's own statements, recorded in process: the guard's, then start transaction … read only, the ten set local before any read, nothing that writes, locks or sets a role, the rollback last", CASE_MS, async () => {
    const spy = vi.spyOn(Client.prototype, "query");
    let guard: string[];
    let reading: string[];
    try {
      // The guard's own statements, as the guard sends them on a connection of the test's.
      await onTheInstance(async () => undefined);
      guard = textsOf(spy.mock.calls);
      spy.mockClear();
      await snapshotOf({ connectionString: connectionString() });
      reading = textsOf(spy.mock.calls);
    } finally {
      spy.mockRestore();
    }
    // The instrument is seen to record: the guard said something, and the reading far more.
    expect(guard.length).toBeGreaterThan(0);
    expect(reading.length).toBeGreaterThan(guard.length + 11);
    expect(reading.slice(0, guard.length)).toEqual(guard);
    const after = reading.slice(guard.length).map(plain);
    expect(reading.map(plain).filter((statement) => BEGINS_WITH_A_WRITE.test(statement) || HOLDS_A_WRITE.test(statement))).toEqual([]);
    expect(after[0]).toBe("start transaction isolation level repeatable read, read only");
    expect(after.filter((statement) => statement.startsWith("start transaction") || statement === "begin")).toHaveLength(1);
    expect(after.at(-1)).toBe("rollback");
    // The settings: every statement after the transaction's first that is a `set local`, up to the first that is not.
    const firstRead = after.findIndex((statement, at) => at > 0 && !statement.startsWith("set local "));
    const settings = after
      .slice(1, firstRead)
      .flatMap((statement) => statement.split(";"))
      .map((part) => part.trim())
      .filter((part) => part !== "");
    const said = Object.fromEntries(
      settings.map((part) => {
        const [, name = part, value = ""] = /^set local (\S+)\s*(?:=|\bto\b)\s*(.*)$/.exec(part) ?? [];
        return [name, value.replace(/^'(.*)'$/, "$1")];
      }),
    );
    expect(said).toEqual(THE_TEN);
    expect(after.slice(firstRead).filter((statement) => statement.startsWith("set ")), "no setting after the first read").toEqual([]);
  });
}
