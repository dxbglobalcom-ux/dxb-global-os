// The ONE database access path. No other file may construct a pg Pool
// (single-client rule, master-plan PHASE-03 file spec — grep-gated in CI checks).
// Session-mode direct connection ONLY (local 54322 / VPS 5432) — never a
// transaction-pooler URL (kysely + pg-boss shared constraint).
import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import type { DB } from "./db-types.js";

let db: Kysely<DB> | null = null;
let pool: pg.Pool | null = null;

/**
 * Optional deadlines, OFF unless asked for.
 *
 * An audit on 2026-08-23 found the SessionEnd hook could hang forever on an
 * address that accepts a connection and never answers: a guard that cannot
 * finish is a guard that never refuses. A caller that must not wait sets these
 * two variables; every existing caller sets neither and keeps today's behaviour
 * byte for byte.
 *
 *   DXB_DB_CONNECT_TIMEOUT_MS    give up while opening the connection
 *   DXB_DB_STATEMENT_TIMEOUT_MS  give up while waiting for an answer
 */
function timeouts(): {
  connectionTimeoutMillis?: number;
  statement_timeout?: number;
  query_timeout?: number;
} {
  const connect = Number(process.env.DXB_DB_CONNECT_TIMEOUT_MS ?? 0);
  const statement = Number(process.env.DXB_DB_STATEMENT_TIMEOUT_MS ?? 0);
  return {
    ...(connect > 0 ? { connectionTimeoutMillis: connect } : {}),
    ...(statement > 0 ? { statement_timeout: statement, query_timeout: statement } : {}),
  };
}

export function getDb(): Kysely<DB> {
  if (db) return db;
  const url = process.env.DXB_DATABASE_URL;
  if (!url) {
    throw new Error(
      "DXB_DATABASE_URL is not set. Copy the template from db/README.md into .env " +
        "(session-mode direct Postgres URL, e.g. local Supabase on port 54322).",
    );
  }
  pool = new pg.Pool({ connectionString: url, ...timeouts() });
  db = new Kysely<DB>({ dialect: new PostgresDialect({ pool }) });
  return db;
}

export async function closeDb(): Promise<void> {
  if (db) {
    await db.destroy(); // destroys the underlying pool
    db = null;
    pool = null;
  }
}

// LISTEN needs a dedicated session-pinned connection (a pooled client returned
// to the pool would drop the LISTEN registration). This stays in db.ts so the
// single-access-path rule holds: still no other file constructs pg clients —
// consumers get a structural ListenClient, the pg types never leak downstream.
// Caller owns the lifecycle (connect done here; caller must end()).
export interface ListenClient {
  query(text: string, values?: unknown[]): Promise<unknown>;
  on(event: "notification", listener: (msg: { channel: string; payload?: string }) => void): unknown;
  on(event: "error", listener: (err: Error) => void): unknown;
  end(): Promise<void>;
}

export async function createListenClient(): Promise<ListenClient> {
  const url = process.env.DXB_DATABASE_URL;
  if (!url) {
    throw new Error(
      "DXB_DATABASE_URL is not set. Copy the template from db/README.md into .env " +
        "(session-mode direct Postgres URL, e.g. local Supabase on port 54322).",
    );
  }
  // A LISTEN client is long-lived, so it takes the connect deadline only — a
  // statement deadline would cut the very session it exists to keep open.
  const { connectionTimeoutMillis } = timeouts();
  const client = new pg.Client({ connectionString: url, connectionTimeoutMillis });
  await client.connect();
  return client;
}
