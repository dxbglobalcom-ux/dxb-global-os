// A throwaway database on the foundation's own instance: what every database
// case works in. It is made under a fresh random name through the bench's own
// address, known by the identity the server gives, reached by a run through a
// list file of its own, and dropped by the oid recorded when it was made — never
// by a pattern of names. The instance's own `postgres` database is only where
// `create database` and `drop database` are said from: nothing is applied to it.
import { randomBytes } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "pg";
import { assertFoundationTarget, connectionString, readIdentity, type Identity, type InstanceRecord, type ListFile } from "@dxb-foundation/bench";
import type { Target } from "@dxb-foundation/chain";

/** One case: a database made (0.06 s, measured), a run or two, the database dropped (0.5 s) — with room for a busy machine. */
export const CASE_MS = 30_000;

/** The login of every session on the bench's address: the address spells the user, and a ledger row records the session's login. */
export const LOGIN = "postgres";

export type Throwaway = {
  identity: Identity;
  /** What a run is given: the database's address, and the list file that names its identity. */
  target: Target;
  /** A connection of the test's own to the database: it looks, and it plays the other hand. */
  client: Client;
  /** Rewrites the list file to hold exactly these identities — none, for a list that loses the database. */
  relist(identities: readonly Identity[]): void;
};

// The oid of every database made here, kept after its drop: what `databasesLeft` asks the server about.
const madeOids = new Set<string>();

async function connected<T>(address: string, work: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: address, connectionTimeoutMillis: 10_000 });
  await client.connect();
  try {
    return await work(client);
  } finally {
    await client.end();
  }
}

/**
 * A connection to the instance's own database — to make, to drop and to read the catalog of databases, nothing else.
 * It passes the bench's guard under the machine's own list before `work` is sent anything (SPEC §12.7): an address
 * that led to a cluster the list does not hold is refused here, before a `create database` reaches it.
 */
export const onTheInstance = <T>(work: (client: Client) => Promise<T>): Promise<T> =>
  connected(connectionString(), async (client) => {
    await assertFoundationTarget(client);
    return work(client);
  });

/** The bench's address, with another database of the same cluster in the place of its own. */
function addressOf(database: string): string {
  const address = new URL(connectionString());
  address.pathname = `/${database}`;
  return address.toString();
}

/** The record a list holds for an identity. The guard reads the identity alone; the rest only gives the record its shape. */
const recordOf = (identity: Identity): InstanceRecord => ({
  ...identity,
  project: "DxB_Foundation",
  dbContainer: "a-throwaway-database",
  containers: ["a-throwaway-database"],
  volumes: [],
  madeAt: new Date().toISOString(),
});

/** Makes the database and answers the oid the server gave it — asked in the session that made it, by its whole name. */
async function make(name: string): Promise<string> {
  return onTheInstance(async (instance) => {
    await instance.query(`create database ${name}`);
    const { rows } = await instance.query("select oid::text as oid from pg_catalog.pg_database where datname = $1", [name]);
    return String(rows[0].oid);
  });
}

/**
 * Drops the one database that carries `oid`, by the name the server gives for
 * it now. A name other than the one it was made under is not dropped: the oid
 * then says something this fixture did not make. Sessions a run left open in
 * it are ended with it.
 */
async function dropTheOneMadeAs(oid: string, madeName: string): Promise<void> {
  await onTheInstance(async (instance) => {
    const { rows } = await instance.query("select datname from pg_catalog.pg_database where oid = $1::oid", [oid]);
    if (rows.length === 0) return;
    const name = String(rows[0].datname);
    if (name !== madeName) throw new Error(`database ${oid} is named ${name}, not ${madeName} as it was made: not dropped`);
    await instance.query(`drop database "${name}" with (force)`);
  });
}

/** Runs `work` in a database of its own, made before it and dropped after it, however the work ends. */
export async function inAThrowawayDatabase(work: (db: Throwaway) => Promise<void>): Promise<void> {
  // Hex digits after a letter: a name that needs no quoting and meets no other.
  const name = `chain_test_${randomBytes(8).toString("hex")}`;
  const oid = await make(name);
  madeOids.add(oid);
  const listDirectory = mkdtempSync(join(tmpdir(), "dxb-foundation-chain-list-"));
  const statePath = join(listDirectory, "instances.json");
  const relist = (identities: readonly Identity[]): void => {
    const list: ListFile = { instances: identities.map(recordOf) };
    writeFileSync(statePath, JSON.stringify(list));
  };
  try {
    await connected(addressOf(name), async (client) => {
      const identity = await readIdentity(client);
      if (identity.dboid !== oid) throw new Error(`the connection to ${name} answers database ${identity.dboid}, not ${oid}`);
      relist([identity]);
      await work({ identity, target: { connectionString: addressOf(name), statePath }, client, relist });
    });
  } finally {
    await dropTheOneMadeAs(oid, name);
    rmSync(listDirectory, { recursive: true, force: true });
  }
}

/**
 * Two databases of their own on one list: the first's list file names both, and both targets read it — so a run
 * aimed at either passes the guard, and nothing but the run itself keeps it on the one it began on.
 */
export function inTwoThrowawayDatabases(work: (first: Throwaway, second: Throwaway) => Promise<void>): Promise<void> {
  return inAThrowawayDatabase((first) =>
    inAThrowawayDatabase(async (second) => {
      first.relist([first.identity, second.identity]);
      await work(first, { ...second, target: { ...second.target, statePath: first.target.statePath }, relist: first.relist });
    }),
  );
}

/** The names of the databases made here that the server still holds — asked by the oids recorded, not by a pattern. */
export async function databasesLeft(): Promise<string[]> {
  return onTheInstance(async (instance) => {
    const { rows } = await instance.query("select datname from pg_catalog.pg_database where oid = any($1::oid[]) order by datname", [[...madeOids]]);
    return rows.map((row) => String(row.datname));
  });
}

/** How many databases were made here since the process began: a count of none proves nothing was looked for. */
export const databasesMade = (): number => madeOids.size;
