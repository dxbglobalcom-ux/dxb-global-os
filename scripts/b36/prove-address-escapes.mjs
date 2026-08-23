#!/usr/bin/env node
// B36 — proof, re-runnable and READ-ONLY, that an address cannot be judged by
// its text, and that the hook no longer tries.
//
// On 2026-08-23 an independent audit rejected the claim that the SessionEnd hook
// could no longer reach the holding's database. The guard at the time reduced
// both addresses to `server:port/database` and compared those strings. This
// script re-runs that rule against six spellings, then CONNECTS with each one
// (SELECT only) and asks the server which database it actually reached.
//
// Nothing here writes anywhere. Every connection runs one identity query.
//
//   DXB_COMPANY_URL=… node scripts/b36/prove-address-escapes.mjs
//
// Exit 0 = every spelling that reaches the company is refused by the live hook.
import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/dist/db.js";

const run = promisify(execFile);
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const HOOK = join(REPO, "tools/hooks/dist/tag-subscription-call.js");
const company = JSON.parse(readFileSync(join(REPO, "tools/hooks/company-fingerprint.json"), "utf8"));

const url = process.env.DXB_COMPANY_URL;
if (!url) {
  console.error("DXB_COMPANY_URL is not set — this script carries no company address of its own.");
  process.exit(2);
}

/** The guard as it stood on 2026-08-23, kept only to show what it waved through. */
function deletedRule(a, b) {
  const t = (u) => {
    try {
      const x = new URL(u);
      const host = x.hostname.replace(/^\[|\]$/g, "").toLowerCase();
      const server = host === "localhost" || host === "127.0.0.1" || host === "::1" ? "loopback" : host;
      return `${server}:${x.port || "5432"}/${decodeURIComponent(x.pathname.replace(/^\//, ""))}`;
    } catch {
      return "unparseable";
    }
  };
  const [ta, tb] = [t(a), t(b)];
  if (ta === "unparseable" || tb === "unparseable") return "REFUSE";
  return ta === tb ? "REFUSE" : "ALLOW";
}

const u = new URL(url);
const port = u.port || "5432";
const cred = `${u.username}:${u.password}`;
const db = decodeURIComponent(u.pathname.replace(/^\//, ""));
const SPELLINGS = [
  ["as written", url],
  ["?host= query parameter", `postgresql://${cred}@example.invalid:${port}/${db}?host=${u.hostname}`],
  ["no database in the path", `postgresql://${cred}@${u.hostname}:${port}`],
  ["short IPv4", `postgresql://${cred}@127.1:${port}/${db}`],
  ["IPv4 as one number", `postgresql://${cred}@2130706433:${port}/${db}`],
  ["trailing dot", `postgresql://${cred}@localhost.:${port}/${db}`],
  ["another loopback address", `postgresql://${cred}@127.0.0.2:${port}/${db}`],
];

const tmp = mkdtempSync(join(tmpdir(), "b36-proof-"));
const transcript = join(tmp, "t.jsonl");
writeFileSync(
  transcript,
  JSON.stringify({ type: "assistant", message: { model: "b36-proof", usage: { input_tokens: 1, output_tokens: 1 } } }) + "\n",
);

let escapes = 0;
let refused = 0;
console.log("spelling                  | deleted rule | actually reached        | live hook");
console.log("--------------------------+--------------+-------------------------+----------");
for (const [name, spelling] of SPELLINGS) {
  process.env.DXB_DATABASE_URL = spelling;
  let reached = "(no connection)";
  let isCompany = false;
  try {
    const r = await sql`
      select (select system_identifier::text from pg_control_system()) sysid,
             (select oid::text from pg_database where datname = current_database()) dboid,
             current_database() dbname`.execute(getDb());
    const id = r.rows[0];
    isCompany = id.sysid === company.sysid && (id.dboid === company.dboid || id.dbname === company.dbname);
    reached = `${id.dbname} (oid ${id.dboid})${isCompany ? " ← THE COMPANY" : ""}`;
  } catch (e) {
    reached = `ERR ${String(e.message).slice(0, 20)}`;
  } finally {
    await closeDb();
  }

  const old = deletedRule(spelling, url);
  if (isCompany && old === "ALLOW") escapes++;

  const env = { ...process.env, DXB_CONSTRUCTION_DATABASE_URL: spelling };
  delete env.DXB_DATABASE_URL;
  const child = run("node", [HOOK], { env });
  child.child.stdin?.end(JSON.stringify({ session_id: randomUUID(), transcript_path: transcript }));
  const { stderr } = await child;
  const verdict = stderr.includes("refusing to write") ? "REFUSES" : "would write";
  if (isCompany && verdict === "REFUSES") refused++;

  console.log(
    `${name.padEnd(25)} | ${old.padEnd(12)} | ${reached.padEnd(23)} | ${verdict}`,
  );
}
rmSync(tmp, { recursive: true, force: true });

const reachable = SPELLINGS.length;
console.log("");
console.log(`ESCAPES THROUGH THE DELETED RULE: ${escapes} of ${reachable - 1} disguises`);
console.log(`REFUSED BY THE LIVE HOOK        : ${refused}`);
console.log(refused === escapes + 1 ? "ALL_ESCAPES_CLOSED" : "AN ESCAPE IS STILL OPEN");
process.exit(refused === escapes + 1 ? 0 : 1);
