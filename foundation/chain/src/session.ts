// How the runner reaches its target: every connection it opens is opened here, and is asked who it is before anything else.
import { Client } from "pg";
import { assertFoundationTarget } from "@dxb-foundation/bench";
import type { Identity } from "@dxb-foundation/bench";
import { ChainRefused } from "./outcome.ts";

export type Target = { connectionString: string; statePath?: string };

/** `work` in a session of its own on one run's target — what `sessionsOn` answers. */
export type InASession = <T>(work: (conn: Client) => Promise<T>) => Promise<T>;

const CONNECT_MS = 10_000;

// The driver (pg 8.22, connection-parameters.js) fills what a configuration leaves unsaid from variables of the
// process's environment, and takes a value given here only when it is truthy. So each variable that can reach a
// session is answered here by a truthy value that changes nothing but the name the server sees (SPEC §12.4): the
// caller's shell chooses nothing of a session. What the connection string says still holds — the driver lays it
// over these.
const SAID_HERE_NOT_BY_THE_ENVIRONMENT = {
  application_name: "dxb-foundation-chain", // PGAPPNAME
  options: "-c client_encoding=UTF8", // PGOPTIONS — the encoding the driver asks of every session anyway
  ssl: false, // PGSSLMODE — read only when this is left undefined
  sslnegotiation: "postgres", // PGSSLNEGOTIATION — the driver's own default, spelled
  client_encoding: "utf8", // PGCLIENT_ENCODING — the driver's own default, spelled
  replication: "false", // PGREPLICATION — sent as it is spelled, and the server reads it as no
};

/**
 * The parts of an address that the address itself does not say. The driver would take each of them from the
 * environment (PGUSER, PGHOST, PGPORT, PGDATABASE), and nothing given beside the connection string can stand in
 * for them: the driver lays the string's empty part over it. Read by the driver's own rule — a word of the query
 * first, then the part of the URL.
 */
function leftUnsaidBy(connectionString: string): string[] {
  if (!URL.canParse(connectionString)) return ["user", "host", "port", "database"];
  const { username, hostname, port, pathname, searchParams } = new URL(connectionString);
  const said = {
    user: searchParams.get("user") || username,
    host: searchParams.get("host") || hostname,
    port: searchParams.get("port") || port,
    database: pathname.slice(1),
  };
  return Object.entries(said).flatMap(([part, value]) => (value === "" ? [part] : []));
}

const theSameDatabase = (one: Identity, other: Identity): boolean => one.sysid === other.sysid && one.dboid === other.dboid && one.dbname === other.dbname;

/**
 * One run's sessions on its target. The target is copied here, so what the caller does to its object afterwards
 * moves nothing; and the identity the first session answers — the lock's, which a run opens before any other —
 * is the run's: a later session that answers another ends the run with ChainRefused("target-moved") (SPEC §12.3).
 *
 * Each session is `work`'s alone: opened, passed through the bench's guard before any other statement is sent on
 * it (SPEC §6), and closed however the work ends. A TargetRefused is thrown on, not caught.
 */
export function sessionsOn(target: Target): InASession {
  const { connectionString, statePath } = target;
  const unsaid = leftUnsaidBy(connectionString);
  let answeredFirst: Identity | undefined;
  return async (work) => {
    // Said when a session is first wanted, not before: the disk answers before the target does (SPEC §9a).
    // The address is not said in the message: it carries a password.
    if (unsaid.length > 0) throw new RangeError(`the target's address must itself say its ${unsaid.join(", ")}: the environment says nothing of a session`);
    const conn = new Client({ ...SAID_HERE_NOT_BY_THE_ENVIRONMENT, connectionString, connectionTimeoutMillis: CONNECT_MS });
    // A connection lost while it idles shows in the next query's rejection; without a listener it would end the process.
    conn.on("error", () => undefined);
    await conn.connect();
    try {
      const identity = await assertFoundationTarget(conn, { statePath });
      answeredFirst ??= identity;
      if (!theSameDatabase(identity, answeredFirst)) throw new ChainRefused("target-moved");
      return await work(conn);
    } finally {
      await conn.end();
    }
  };
}

/**
 * `work` in one transaction that the runner owns on `conn`: committed when the work ends well, rolled back when it
 * does not, and the failure thrown on is the work's own. A rollback that fails in its turn is not said in its place
 * (SPEC §12.10): the session is lost or about to be closed, and its end undoes what it left open.
 */
export async function inOneTransaction(conn: Client, work: () => Promise<void>): Promise<void> {
  await conn.query("begin");
  try {
    await work();
    await conn.query("commit");
  } catch (failure) {
    await conn.query("rollback").catch(() => undefined);
    throw failure;
  }
}
