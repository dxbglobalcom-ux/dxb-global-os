#!/usr/bin/env node
// B36 — the company database's IDENTITY, taken from the server itself.
//
// Why identity and not an address: an independent audit proved on 2026-08-23
// that comparing two connection STRINGS cannot protect the holding. Six
// spellings that a text/URL comparison called "a different database" all landed
// on the company: `?host=` (the driver obeys the query parameter, not the
// authority), an address with no database in its path (libpq then uses the user
// name, which is `postgres`), `127.1`, `2130706433`, `localhost.` and
// `127.0.0.2`. The parser was not wrong in one place; text is the wrong thing to
// compare. So the guard asks the SERVER who it is:
//
//   system_identifier  — unique per PostgreSQL cluster (pg_control_system())
//   oid + datname      — unique per database inside that cluster
//
// A connection cannot lie about these: whatever spelling reached the socket,
// this is the database the next INSERT would land in.
//
// SELECT only. This script never writes to the company (CLAUDE.md §5).
//
// Usage:
//   DXB_COMPANY_URL=… node scripts/b36/company-fingerprint.mjs           # write
//   DXB_COMPANY_URL=… node scripts/b36/company-fingerprint.mjs --check   # compare
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { sql } from "kysely";
// The ONE database access path (packages/shared/src/db.ts): no other file in this
// repository may construct a pg Pool of its own.
import { closeDb, getDb } from "../../packages/shared/dist/db.js";

const OUT = fileURLToPath(new URL("../../tools/hooks/company-fingerprint.json", import.meta.url));
const url = process.env.DXB_COMPANY_URL;
if (!url) {
  console.error(
    "DXB_COMPANY_URL is not set. This script takes the address on purpose and carries no " +
      "fallback: a hard-coded company address is the very defect B36 exists to remove.",
  );
  process.exit(2);
}

process.env.DXB_DATABASE_URL = url;
const { rows } = await sql`
  select (select system_identifier::text from pg_control_system()) sysid,
         (select oid::text from pg_database where datname = current_database()) dboid,
         current_database() dbname`.execute(getDb());
await closeDb();
const live = rows[0];
if (!live.sysid) {
  console.error("could not read system_identifier — this role may not execute pg_control_system()");
  process.exit(3);
}

if (process.argv.includes("--check")) {
  const saved = JSON.parse(readFileSync(OUT, "utf8"));
  const same =
    saved.sysid === live.sysid && saved.dboid === live.dboid && saved.dbname === live.dbname;
  console.log(`saved : ${saved.sysid}/${saved.dboid} (${saved.dbname})`);
  console.log(`live  : ${live.sysid}/${live.dboid} (${live.dbname})`);
  console.log(same ? "FINGERPRINT_MATCH" : "FINGERPRINT_DRIFT — the guard is aiming at a database that no longer exists");
  process.exit(same ? 0 : 1);
}

writeFileSync(
  OUT,
  JSON.stringify(
    {
      sysid: live.sysid,
      dboid: live.dboid,
      dbname: live.dbname,
      measured_at: new Date().toISOString(),
      measured_by: "scripts/b36/company-fingerprint.mjs",
      what:
        "The holding's own database, identified by its cluster's system_identifier and its own oid " +
        "and name. tools/hooks/tag-subscription-call.ts refuses to write anywhere this matches.",
    },
    null,
    2,
  ) + "\n",
);
console.log(`WROTE ${OUT}`);
console.log(`${live.sysid}/${live.dboid} (${live.dbname})`);
