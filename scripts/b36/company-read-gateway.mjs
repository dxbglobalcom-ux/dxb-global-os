#!/usr/bin/env node
/**
 * B36 · Block 3-bis — THE COMPANY'S READ GATEWAY.
 *
 * The construction site no longer holds an account on the holding's database.
 * It asks THIS service, over a unix socket, for the numbers it is allowed to
 * know — and it asks by NAME. No SQL crosses the socket, in either direction.
 *
 * Why it exists. Three audits rejected Block 3 because the wall was built inside
 * PostgreSQL while the construction runtime held the Docker socket, the
 * credential files and a direct TCP login. The wall is now outside the database:
 * the construction runs inside a sandbox with no network, no docker socket and
 * no credential, and the ONLY thing reaching in from it is this socket.
 *
 * Four things make this read-only, and each one alone would do it:
 *   1. the role it connects as holds SELECT and nothing else (the seal installed
 *      by scripts/b36/company-one-way-window.sql, measured 13 classes / 0 leaking);
 *   2. the connection is opened with default_transaction_read_only=on;
 *   3. every question runs inside a transaction this file starts as READ ONLY;
 *   4. the question itself is not sent by the caller — the caller sends an id,
 *      and the SQL behind that id comes from a catalogue this process FROZE at
 *      startup. A construction run that rewrites claims.txt cannot change what a
 *      running gateway will execute.
 *
 * The credential lives at ~/.config/dxb/company-gateway.env (mode 600), outside
 * the repository, and the sandbox never mounts that directory.
 *
 * Start:  node scripts/b36/company-read-gateway.mjs
 *         (as a resident service: systemctl --user start dxb-company-read)
 */
import { createServer } from "node:net";
import { readFileSync, existsSync, mkdirSync, unlinkSync, chmodSync, realpathSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
// pnpm links `pg` into packages/shared/node_modules as a symlink into the store;
// required through the link, pg's own `pg-types` is not beside it. Anchoring the
// require at pg's real file puts its siblings back within reach.
const require_ = createRequire(join(REPO, "packages/shared/package.json"));
const { Client } = require_(realpathSync(require_.resolve("pg")));

const ENV_FILE = join(process.env.HOME, ".config/dxb/company-gateway.env");
const SOCKET = process.env.DXB_COMPANY_READ_SOCKET
  || join(process.env.XDG_RUNTIME_DIR || "/tmp", "dxb", "company-read.sock");
const CLAIMS = join(REPO, "scripts/governance/claims.json");

// ---------------------------------------------------------------- credential
function credential() {
  if (!existsSync(ENV_FILE)) {
    console.error(`[gateway] no credential at ${ENV_FILE}`);
    console.error(`[gateway] mint it: node scripts/b36/withdraw-company-login.mjs`);
    process.exit(2);
  }
  const line = readFileSync(ENV_FILE, "utf8")
    .split("\n").find((l) => l.startsWith("DXB_COMPANY_GATEWAY_URL="));
  if (!line) { console.error(`[gateway] ${ENV_FILE} carries no DXB_COMPANY_GATEWAY_URL`); process.exit(2); }
  return line.slice("DXB_COMPANY_GATEWAY_URL=".length).trim();
}

// ------------------------------------------------------- the frozen catalogue
//
// Read ONCE, here, and never again. Everything the construction may ask is in
// this map at the moment the service starts; nothing it does afterwards can add
// to it or change what a name means.
const CATALOGUE = (() => {
  const raw = JSON.parse(readFileSync(CLAIMS, "utf8"));
  const out = new Map();
  for (const [id, v] of Object.entries(raw)) {
    if (!v || typeof v !== "object" || typeof v.sql !== "string") continue;
    const sql = v.sql.trim();
    // Belt and braces on top of the three read-only layers: a catalogue entry
    // that is not a plain SELECT is a defect in the records, and it is refused
    // here rather than sent to the holding.
    if (!/^\s*SELECT\b/i.test(sql)
      || /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|COPY|NOTIFY|CALL|DO|SET|VACUUM|REINDEX|REFRESH)\b/i.test(sql)) {
      console.error(`[gateway] catalogue entry refused (not a plain SELECT): ${id}`);
      continue;
    }
    out.set(id, { sql, what: String(v.what || "") });
  }
  out.set("today", { sql: "SELECT current_date", what: "the holding engine's own date" });
  return out;
})();

// ------------------------------------------------------------- the connection
const client = new Client({
  connectionString: credential(),
  // The server itself refuses a write on this connection, before any
  // transaction is opened.
  options: "-c default_transaction_read_only=on",
  application_name: "dxb-company-read-gateway",
});

async function answer(id) {
  const entry = CATALOGUE.get(id);
  if (!entry) throw new Error(`no such question: ${id}`);
  await client.query("BEGIN READ ONLY");
  try {
    const r = await client.query(entry.sql);
    await client.query("COMMIT");
    const row = r.rows[0] ?? {};
    const value = Object.values(row)[0];
    return value === undefined || value === null ? "" : String(value);
  } catch (e) {
    try { await client.query("ROLLBACK"); } catch { /* the connection is gone; the next request reconnects */ }
    throw e;
  }
}

// ------------------------------------------------------------------ the door
function reply(sock, obj) { sock.write(JSON.stringify(obj) + "\n"); }

async function handle(sock, line) {
  let req;
  try { req = JSON.parse(line); } catch { return reply(sock, { ok: false, error: "not JSON" }); }
  const op = req && typeof req === "object" ? req.op : null;

  switch (op) {
    case "ping":
      return reply(sock, { ok: true, value: "company-read-gateway" });
    case "catalogue":
      return reply(sock, { ok: true, value: [...CATALOGUE.keys()].sort().join(",") });
    case "ask": {
      const id = typeof req.id === "string" ? req.id : "";
      // The caller sends a NAME. If it sends anything that looks like SQL, that
      // is not a question this service knows, and the refusal says so plainly.
      try { return reply(sock, { ok: true, value: await answer(id) }); }
      catch (e) { return reply(sock, { ok: false, error: String(e.message || e) }); }
    }
    default:
      return reply(sock, { ok: false, error: `no such operation: ${String(op)}` });
  }
}

const server = createServer((sock) => {
  let buf = "";
  sock.on("data", async (chunk) => {
    buf += chunk.toString("utf8");
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i); buf = buf.slice(i + 1);
      if (line.trim()) await handle(sock, line);
    }
  });
  sock.on("error", () => { /* a caller that hung up is not this service's problem */ });
});

await client.connect();
const who = await client.query("SELECT current_user, current_setting('transaction_read_only') AS ro");
mkdirSync(dirname(SOCKET), { recursive: true });
if (existsSync(SOCKET)) unlinkSync(SOCKET);
server.listen(SOCKET, () => {
  // 0666 on the socket, and the DIRECTORY is the gate. The socket lives inside
  // /run/user/1000/dxb, which is the owner's own runtime directory (mode 700),
  // so nothing on this machine can reach the path — except the construction
  // sandbox, into which root binds this one file by name. Inside that sandbox
  // the payload runs as `dxbbuild`, which is in none of the owner's groups, so
  // 0660 would refuse the only caller the door exists for.
  chmodSync(SOCKET, 0o666);
  console.error(`[gateway] listening on ${SOCKET}`);
  console.error(`[gateway] connected as ${who.rows[0].current_user}, transaction_read_only=${who.rows[0].ro}`);
  console.error(`[gateway] frozen catalogue: ${CATALOGUE.size} named questions`);
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    try { server.close(); if (existsSync(SOCKET)) unlinkSync(SOCKET); } catch { /* shutting down */ }
    try { await client.end(); } catch { /* shutting down */ }
    process.exit(0);
  });
}
