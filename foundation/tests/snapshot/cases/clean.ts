import { readFileSync } from "node:fs";
import { Client } from "pg";
import { expect } from "vitest";
import { connectionString } from "@dxb-foundation/bench";
import { snapshotOf } from "@dxb-foundation/chain";
import { chainCommand } from "../../chain/fixtures/command.ts";
import { columnOf, ledgerToTheInstant } from "../../chain/fixtures/looking.ts";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import { guarded, logins, tailOf } from "../../roles/fixtures/bench-command.ts";
import { THE_FOUR } from "../../roles/fixtures/catalogue.ts";
import { passwordsInTheFile } from "../../roles/fixtures/the-logins-file.ts";
import { LOOK_MS, type Step } from "../../roles/fixtures/the-run.ts";
import { expectChainSaid, linesOf } from "../fixtures/changes.ts";
import { EXPECTED_REAL } from "../fixtures/the-chains.ts";
import { COMMAND_MS, expectEqual, snapshotPrinted } from "../fixtures/the-check.ts";

// SPEC §6 B.1–B.3: the real chain from nothing equals the committed text; the text is the same read twice, read by
// the command and by the library, read through a session whose own settings are hostile, read in a session that
// cannot write; and the same after the install step, which gives the logins their passwords.

/** The bench's address with these settings said by the connection itself (libpq's `options`), as a login could. */
function withTheSessionSaying(settings: Record<string, string>): string {
  const address = new URL(connectionString());
  address.searchParams.set("options", Object.entries(settings).map(([name, value]) => `-c ${name}=${value}`).join(" "));
  return address.toString();
}

/** Hostile to a reader that did not say its own (SPEC §3 fact 2, §6 B.2): each changes a catalogue text or a float's. */
const HOSTILE = {
  search_path: "os,public",
  DateStyle: "SQL,DMY",
  IntervalStyle: "sql_standard",
  TimeZone: "Asia/Tokyo",
  bytea_output: "escape",
  quote_all_identifiers: "on",
  extra_float_digits: "0",
};

/** What a session opened on `address` says of these settings — the instrument seen to work before it is trusted. */
async function sessionSays(address: string, names: readonly string[]): Promise<Record<string, string>> {
  const client = new Client({ connectionString: address, connectionTimeoutMillis: 10_000 });
  client.on("error", () => undefined);
  await client.connect();
  try {
    const said: Record<string, string> = {};
    for (const name of names) said[name] = String((await client.query({ text: "select pg_catalog.current_setting($1)", values: [name], rowMode: "array" })).rows[0]?.[0]);
    return said;
  } finally {
    await client.end();
  }
}

const realText = (): string => readFileSync(EXPECTED_REAL, "utf8");

/**
 * What a reader that wrote would move: the ledger's rows to the instant (each with the transaction that wrote it) and
 * every relation of the covered schemas. Not every relation of the database: the bench's own services make some while
 * the tests run.
 */
async function standingInTheCoveredSchemas(client: Client): Promise<{ ledger: string[] | "no ledger"; relations: string[] }> {
  const relations = await columnOf(
    client,
    `select n.nspname || '.' || c.relname || ' ' || c.relkind::text from pg_catalog.pg_class c
       join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      where n.nspname in ('os', 'os_chain') or n.nspowner = pg_catalog.to_regrole('os_owner') order by 1`,
  );
  return { ledger: await ledgerToTheInstant(client), relations };
}

export function clean(step: Step): void {
  step("B.1 clean: chain up (the real chain, no --root) → CHAIN_GREEN; snapshot --check expected/real.snapshot.txt → SNAPSHOT_EQUAL", 3 * COMMAND_MS, async () => {
    expectChainSaid(await chainCommand(["up"], COMMAND_MS), "CHAIN_GREEN applied=2 standing=2 functions=0 reference=0", 0);
    await expectEqual(EXPECTED_REAL, linesOf(EXPECTED_REAL));
  });

  step("B.2 read twice by the library, and once by the command's stdout: the same bytes, the committed text's", 3 * COMMAND_MS, async () => {
    const target = { connectionString: connectionString() };
    const first = await snapshotOf(target);
    const second = await snapshotOf(target);
    expect(first).toBe(realText());
    expect(second).toBe(first);
    const printed = await snapshotPrinted();
    expect(printed.code, printed.stderr.slice(-1_500)).toBe(0);
    expect(printed.stdout).toBe(first);
  });

  step("B.2 read through a connection whose own settings are hostile (search_path holding os, DateStyle, IntervalStyle, TimeZone, bytea_output, quote_all_identifiers, extra_float_digits=0): the same bytes", 2 * COMMAND_MS, async () => {
    const hostile = withTheSessionSaying(HOSTILE);
    expect(await sessionSays(hostile, Object.keys(HOSTILE))).toEqual({
      search_path: "os,public",
      DateStyle: "SQL, DMY",
      IntervalStyle: "sql_standard",
      TimeZone: "Asia/Tokyo",
      bytea_output: "escape",
      quote_all_identifiers: "on",
      extra_float_digits: "0",
    });
    expect(await snapshotOf({ connectionString: hostile })).toBe(realText());
  });

  step("B.2 read only: through a session that cannot write (default_transaction_read_only=on) the same bytes, and nothing that stands moved", 2 * COMMAND_MS, async () => {
    const readOnly = withTheSessionSaying({ default_transaction_read_only: "on" });
    expect(await sessionSays(readOnly, ["default_transaction_read_only"])).toEqual({ default_transaction_read_only: "on" });
    const before = await onTheInstance(standingInTheCoveredSchemas);
    expect(await snapshotOf({ connectionString: readOnly })).toBe(realText());
    expect(await snapshotOf({ connectionString: connectionString() })).toBe(realText());
    expect(await onTheInstance(standingInTheCoveredSchemas)).toEqual(before);
  });

  step("B.3 instance logins: LOGINS_SET; then the same bytes, holding none of the file's passwords and no SCRAM-SHA-256", 2 * COMMAND_MS + LOOK_MS, async () => {
    const said = await guarded(() => logins(COMMAND_MS));
    expect(said.lastLine, tailOf(said)).toMatch(/^LOGINS_SET logins=4 /);
    expect(said.code).toBe(0);
    const text = await snapshotOf({ connectionString: connectionString() });
    // Booleans first: a failing expectation must never print a password.
    const passwords = [...passwordsInTheFile(THE_FOUR).values()];
    expect(passwords.length).toBe(4);
    expect(passwords.every((password) => !text.includes(password))).toBe(true);
    expect(text.includes("SCRAM-SHA-256")).toBe(false);
    expect(text === realText()).toBe(true);
    await expectEqual(EXPECTED_REAL, linesOf(EXPECTED_REAL));
  });
}
