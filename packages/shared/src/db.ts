// The ONE database access path. No other file may construct a pg Pool
// (single-client rule, master-plan PHASE-03 file spec — grep-gated in CI checks).
// Session-mode direct connection ONLY (local 54322 / VPS 5432) — never a
// transaction-pooler URL (kysely + pg-boss shared constraint).
import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import type { DB } from "./db-types.js";

let db: Kysely<DB> | null = null;
let pool: pg.Pool | null = null;

export function getDb(): Kysely<DB> {
  if (db) return db;
  const url = process.env.DXB_DATABASE_URL;
  if (!url) {
    throw new Error(
      "DXB_DATABASE_URL is not set. Copy the template from db/README.md into .env " +
        "(session-mode direct Postgres URL, e.g. local Supabase on port 54322).",
    );
  }
  pool = new pg.Pool({ connectionString: url });
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
