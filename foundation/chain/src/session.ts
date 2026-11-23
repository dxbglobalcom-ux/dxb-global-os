// How the runner reaches its target: every connection it opens is opened here, and is asked who it is before anything else.
import { Client, DatabaseError } from "pg";
import { assertFoundationTarget } from "@dxb-foundation/bench";

export type Target = { connectionString: string; statePath?: string };

const CONNECT_MS = 10_000;

/**
 * A session of its own on the target, for `work` alone: opened, passed through the bench's guard before any other
 * statement is sent on it (SPEC §6), and closed however the work ends. A TargetRefused is thrown on, not caught.
 */
export async function inASession<T>(target: Target, work: (conn: Client) => Promise<T>): Promise<T> {
  const conn = new Client({ connectionString: target.connectionString, connectionTimeoutMillis: CONNECT_MS });
  // A connection lost while it idles shows in the next query's rejection; without a listener it would end the process.
  conn.on("error", () => undefined);
  await conn.connect();
  try {
    await assertFoundationTarget(conn, { statePath: target.statePath });
    return await work(conn);
  } finally {
    await conn.end();
  }
}

/**
 * `work` in one transaction that the runner owns on `conn`, committed when the work ends well. When the server
 * refuses a statement the transaction is rolled back here and the refusal thrown on. Any other failure is thrown
 * on as it is: the session is lost or about to be closed, and its end undoes what it left open.
 */
export async function inOneTransaction(conn: Client, work: () => Promise<void>): Promise<void> {
  await conn.query("begin");
  try {
    await work();
    await conn.query("commit");
  } catch (failure) {
    if (failure instanceof DatabaseError) await conn.query("rollback");
    throw failure;
  }
}
