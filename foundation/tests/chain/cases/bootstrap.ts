import type { Client } from "pg";
import { describe, expect, it } from "vitest";
import { ChainRefused, applyChain } from "@dxb-foundation/chain";
import { dropTheConstraint, swallowWhatIsWritten, writeARowByHand, type ConstraintKind } from "../fixtures/by-hand.ts";
import { PEOPLE, chainOf } from "../fixtures/chain-files.ts";
import { chainRoot } from "../fixtures/chain-on-disk.ts";
import { columnOf, granteesOnSchema, granteesOnTable, ledgerOf, standingIn, valueOf } from "../fixtures/looking.ts";
import { refusalOf } from "../fixtures/refusal.ts";
import { CASE_MS, LOGIN, inAThrowawayDatabase, type Throwaway } from "../fixtures/throwaway-database.ts";

// SPEC §5 and §9.4, "the bootstrap": the ledger this runner makes, what it leaves
// to nobody but its owner, and the ledgers it does not know. A chain of no files
// is the run that makes the ledger and nothing else.

const makeTheLedger = (db: Throwaway) => applyChain({ target: db.target, root: chainRoot() });

type ByHand = { position: number; file: string; kind: string; hash: string };
const WELL_FORMED: ByHand = { position: 1, file: "0001-by-hand.sql", kind: "schema", hash: "a".repeat(64) };

/**
 * What the ledger says to one row written by the test's own hand, in a
 * transaction that is rolled back: "accepted", or the SQLSTATE of its refusal.
 */
async function saidToARow(client: Client, row: Partial<ByHand>): Promise<string> {
  const { position, file, kind, hash } = { ...WELL_FORMED, ...row };
  const insert = "insert into os_chain.ledger (position, file, kind, hash, applied_at, applied_by, runner_version) values ($1, $2, $3, $4, now(), 'a hand', '1')";
  await client.query("begin");
  try {
    await client.query(insert, [position, file, kind, hash]);
    return "accepted";
  } catch (refused) {
    return String((refused as { code?: unknown }).code);
  } finally {
    await client.query("rollback");
  }
}

const UNIQUE_VIOLATION = "23505";
const CHECK_VIOLATION = "23514";

// SPEC §12.2: row 0's hash, read once from a ledger this runner made and spelled here. Another text of the
// bootstrap carries another hash — a change of contract: every ledger that stands becomes one the runner does not know.
const ROW_0_HASH = "2179aece49242b6bde8643739f2c3bdf4939c21d5f95770b97c0debe74fced00";

/** SPEC §12.2: what "known" includes. Each is dropped by the test's own hand from a ledger a real run made. */
const CONSTRAINTS: [string, ConstraintKind, string][] = [
  ["the primary key on position", "p", "position"],
  ["the unique on file", "u", "file"],
  ["the check on position", "c", "position"],
  ["the check on kind", "c", "kind"],
  ["the check on hash", "c", "hash"],
];

/** The ledgers SPEC §5 says this runner does not know: each made by the test's own hand, some from a ledger a real run made. */
const UNKNOWN_LEDGERS: [string, (db: Throwaway) => Promise<unknown>][] = [
  [
    "row 0 carries another hash",
    async (db) => {
      await makeTheLedger(db);
      await db.client.query("update os_chain.ledger set hash = repeat('0', 64) where position = 0");
    },
  ],
  [
    "row 0 is absent",
    async (db) => {
      await makeTheLedger(db);
      await db.client.query("delete from os_chain.ledger where position = 0");
    },
  ],
  ["the schema os_chain holds no table", (db) => db.client.query("create schema os_chain")],
  [
    "the table os_chain.ledger is of another shape",
    async (db) => {
      await db.client.query("create schema os_chain");
      await db.client.query("create table os_chain.ledger (id integer primary key, note text)");
    },
  ],
  ...CONSTRAINTS.map(([what, kind, column]): [string, (db: Throwaway) => Promise<unknown>] => [
    `${what} was dropped`,
    async (db) => {
      await makeTheLedger(db);
      await dropTheConstraint(db.client, kind, column);
    },
  ]),
  [
    "a second row of kind ledger stands at a later position",
    async (db) => {
      await makeTheLedger(db);
      await writeARowByHand(db.client, { position: 1, file: "(another ledger)", kind: "ledger" });
    },
  ],
  [
    // SPEC §12.1: known when it is read — and unknown when the row of the pending file is not there after its insert.
    "a trigger swallows every row written to it",
    async (db) => {
      await makeTheLedger(db);
      await swallowWhatIsWritten(db.client);
    },
  ],
];

export function theBootstrap(): void {
  describe("the bootstrap — the ledger this runner makes", { timeout: CASE_MS }, () => {
    it("a chain of no files leaves row 0 alone", async () => {
      await inAThrowawayDatabase(async (db) => {
        expect(await makeTheLedger(db)).toEqual({ state: "applied", applied: [], standing: 0 });
        expect(await ledgerOf(db.client)).toEqual([
          { position: 0, file: "(ledger)", kind: "ledger", hash: expect.stringMatching(/^[0-9a-f]{64}$/), applied_by: LOGIN, runner_version: "1" },
        ]);
      });
    });

    it("row 0 carries the hash of the bootstrap as this contract holds it, spelled here", async () => {
      await inAThrowawayDatabase(async (db) => {
        await makeTheLedger(db);
        expect(await valueOf(db.client, "select hash from os_chain.ledger where position = 0")).toBe(ROW_0_HASH);
      });
    });

    it("the schema and the table are the login's own, and the table has the seven columns of SPEC §5, none of them nullable", async () => {
      await inAThrowawayDatabase(async (db) => {
        await makeTheLedger(db);
        expect(await valueOf(db.client, "select pg_get_userbyid(nspowner)::text from pg_namespace where nspname = 'os_chain'")).toBe(LOGIN);
        expect(await valueOf(db.client, "select pg_get_userbyid(relowner)::text from pg_class where oid = 'os_chain.ledger'::regclass")).toBe(LOGIN);
        const columns = await columnOf(
          db.client,
          `select column_name || ' ' || data_type || case is_nullable when 'NO' then ' not null' else '' end
             from information_schema.columns where table_schema = 'os_chain' and table_name = 'ledger'`,
        );
        expect(columns.sort()).toEqual([
          "applied_at timestamp with time zone not null",
          "applied_by text not null",
          "file text not null",
          "hash text not null",
          "kind text not null",
          "position integer not null",
          "runner_version text not null",
        ]);
        const primaryKey = await columnOf(
          db.client,
          `select a.attname from pg_index i join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any (i.indkey)
            where i.indrelid = 'os_chain.ledger'::regclass and i.indisprimary`,
        );
        expect(primaryKey).toEqual(["position"]);
      });
    });

    it("the table itself holds a position and a file to one row each, the kind to the two kinds, the hash to 64 lower-case hex digits", async () => {
      await inAThrowawayDatabase(async (db) => {
        await makeTheLedger(db);
        // Seen first: a well-formed row is taken — so each refusal below is of the one thing that row changes.
        expect(await saidToARow(db.client, {})).toBe("accepted");
        expect(await saidToARow(db.client, { position: 0 })).toBe(UNIQUE_VIOLATION);
        expect(await saidToARow(db.client, { file: "(ledger)" })).toBe(UNIQUE_VIOLATION);
        expect(await saidToARow(db.client, { kind: "functions" })).toBe(CHECK_VIOLATION);
        expect(await saidToARow(db.client, { hash: "A".repeat(64) })).toBe(CHECK_VIOLATION);
        expect(await saidToARow(db.client, { hash: "g".repeat(64) })).toBe(CHECK_VIOLATION);
        expect(await saidToARow(db.client, { hash: "a".repeat(63) })).toBe(CHECK_VIOLATION);
        expect(await saidToARow(db.client, { hash: "a".repeat(65) })).toBe(CHECK_VIOLATION);
        // And none of them stayed: the hand's rows were all rolled back.
        expect(await ledgerOf(db.client)).toHaveLength(1);
      });
    });

    it("in a database that carries planted default privileges, the schema and the ledger have no grantee but their owner", async () => {
      await inAThrowawayDatabase(async (db) => {
        for (const grantee of ["pg_monitor", "public"]) {
          await db.client.query(`alter default privileges for role postgres grant usage on schemas to ${grantee}`);
          await db.client.query(`alter default privileges for role postgres grant select on tables to ${grantee}`);
        }
        // Seen first: what this login makes here is born granted to both — the planting works.
        await db.client.query("create schema planted_probe");
        await db.client.query("create table planted_probe.born_granted (id integer)");
        expect(await granteesOnSchema(db.client, "planted_probe")).toEqual(["PUBLIC", "pg_monitor", "postgres"]);
        expect(await granteesOnTable(db.client, "planted_probe.born_granted")).toEqual(["PUBLIC", "pg_monitor", "postgres"]);

        expect(await makeTheLedger(db)).toMatchObject({ state: "applied" });
        const besideTheOwner = (grantees: string[]): string[] => grantees.filter((grantee) => grantee !== LOGIN);
        expect(besideTheOwner(await granteesOnSchema(db.client, "os_chain"))).toEqual([]);
        expect(besideTheOwner(await granteesOnTable(db.client, "os_chain.ledger"))).toEqual([]);
      });
    });
  });

  describe("the bootstrap — a ledger this runner does not know", { timeout: CASE_MS }, () => {
    it.each(UNKNOWN_LEDGERS)("%s: ledger-unknown, and nothing is changed", async (_what, makeItSo) => {
      await inAThrowawayDatabase(async (db) => {
        await makeItSo(db);
        const before = await standingIn(db.client);
        // A file is pending: a runner that took this ledger for its own would apply it.
        const refusal = await refusalOf(ChainRefused, () => applyChain({ target: db.target, root: chainRoot(chainOf(PEOPLE)) }));
        expect(refusal.reason).toBe("ledger-unknown");
        expect(await standingIn(db.client)).toEqual(before);
      });
    });
  });
}
