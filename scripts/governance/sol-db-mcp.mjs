#!/usr/bin/env node
// dxb-team2 job 1 — THE AUDITOR'S ONE TOOL: `sql_read`, a read-only query into
// the CONSTRUCTION engine, served to GPT-6 Sol over MCP stdio.
// Plan: .planning/quick/20260928-sol-db-reach/PLAN.md (rev 3).
//
// CEO 2026-09-28: "önerin tmm" — the auditor gathers database evidence with its
// own hand instead of receiving the author's output; never the company's
// database. On the plan: "Tamam onaylıyorum."
//
// WHY AN MCP SERVER. Sol runs in Codex's read-only sandbox, which refuses TCP
// and unix sockets (measured 2026-09-28). A Codex MCP server runs outside that
// sandbox, and scripts/governance/refuter.sh approves exactly one tool of one
// server — this one. So everything that makes the reach read-only has to hold
// HERE and in the database role, never in Sol's good behaviour:
//
//   1. THE ROLE is the wall: `sol_reader` (scripts/governance/sol-reader-role.sql)
//      has SELECT in four schemas and no write verb, sequence, TEMP, CREATE or
//      effectful function anywhere. Everything below is a second layer.
//   2. IDENTITY, not address: on the SAME connection that runs the query, the
//      server's cluster id + database oid + database name must be on
//      tools/hooks/ledger-identity.json allowed[] and must not be the company's.
//   3. ONE STATEMENT: every statement goes by the extended protocol, where
//      PostgreSQL itself refuses a second command; the text must start with
//      SELECT / WITH / TABLE / VALUES (run through a NO SCROLL cursor) or SHOW /
//      EXPLAIN (never ANALYZE / ANALYSE, in any spelling). COPY is refused.
//   4. CAPS: inside BEGIN READ ONLY with a 10 s statement timeout; 200 rows, 4096
//      UTF-8 bytes per cell (plus the cut marker), 64 KiB per answer; ROLLBACK always, then the
//      connection closes. The cell and answer caps bound what SOL RECEIVES; they
//      are applied in this process, after PostgreSQL has sent the rows, so what
//      bounds the transfer itself is the 10 s timeout and the 201-row fetch.
//   4b. NO DRIFT: before every query, on the same connection, the role is asked
//      whether it can execute any SECURITY DEFINER function, any function of the
//      one-way window's c_effectful sentence (read out of
//      scripts/b36/company-one-way-window.sql, never copied), or anything of an
//      outbound-connection extension (dblink, postgres_fdw, http). A function a
//      later migration or extension adds — in any schema, `extensions` and
//      `supabase_migrations` included, where no default privilege guards it —
//      makes the tool refuse until sol-reader-role.sh is run again (Sol's xhigh
//      audit of 2026-09-28, finding A).
//   5. THE BENCH IS NOT SHARED WITH THE BATTERY: while the construction
//      battery's lock is held, the tool answers "engine busy" and runs nothing.
//      The lock is read from /proc/locks, never taken, so the tool cannot make
//      the battery refuse to start.
//
// THE ONE WRITE: every call is appended as one JSON line to
// ~/.local/state/dxb/sol-db-mcp.log — made by this process, not by Sol, and Sol
// cannot choose its path or its content beyond the query text it sent.
//
// NOT A POOL. packages/shared/src/db.ts is the one pg Pool of the application;
// this is a single pg.Client per call, outside the application, under its own
// login — the same shape the test suites use.
import { createInterface } from "node:readline";
import { createRequire } from "node:module";
import { readFileSync, appendFileSync, mkdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const pg = createRequire(join(REPO, "packages/shared/package.json"))("pg");

// Read at every call, so the guard is always the file as it stands now.
const identityFile = () =>
  process.env.DXB_LEDGER_IDENTITY_FILE ?? join(REPO, "tools/hooks/ledger-identity.json");
const ENV_FILE = join(homedir(), ".config/dxb/sol-reader.env");
const LOG_FILE = join(homedir(), ".local/state/dxb/sol-db-mcp.log");
const LOCK_FILE = join(process.env.TMPDIR || "/tmp", "dxb-construction-battery.lock");
const ENGINE = { host: "127.0.0.1", port: "54422" };

const MAX_ROWS = 200;
const MAX_CELL = 4096; // bytes
const MAX_ANSWER = 64 * 1024; // bytes
const WINDOW_SQL = join(REPO, "scripts/b36/company-one-way-window.sql");
const OUTBOUND_EXTENSIONS = ["dblink", "postgres_fdw", "http", "pgsql-http"];
// `extensions` and `supabase_migrations` are the two readable schemas no default
// privilege guards: a function born there is PUBLIC's. There, a callable function
// must belong to one of these vetted extensions or be a trigger function (which
// cannot be called); anything else — SECURITY INVOKER included — is drift
// (Sol's xhigh re-check, 2026-09-28). `public` and `pgboss` are guarded by the
// one-way window's default privileges, which hand new functions to no reader.
const VETTED_EXTENSIONS = ["pgcrypto", "uuid-ossp", "pg_stat_statements"];

/** The window's one sentence for "a function whose call leaves something behind". */
function effectfulPredicate() {
  const m = readFileSync(WINDOW_SQL, "utf8").match(/c_effectful CONSTANT text := \$flt\$([\s\S]*?)\$flt\$;/);
  if (!m) throw new Error("cannot read c_effectful out of company-one-way-window.sql");
  return m[1];
}
const TIMEOUT = "10s";

// ---------------------------------------------------------------- the text
/** Drop leading whitespace and comments (`--` lines and nested block comments). */
export function stripLeading(q) {
  let s = q;
  for (;;) {
    s = s.replace(/^\s+/, "");
    if (s.startsWith("--")) {
      const nl = s.indexOf("\n");
      s = nl < 0 ? "" : s.slice(nl + 1);
      continue;
    }
    if (s.startsWith("/*")) {
      let depth = 0, i = 0;
      while (i < s.length) {
        if (s.startsWith("/*", i)) { depth++; i += 2; }
        else if (s.startsWith("*/", i)) { depth--; i += 2; if (depth === 0) break; }
        else i++;
      }
      if (depth !== 0) return null; // an unterminated comment hides what follows
      s = s.slice(i);
      continue;
    }
    return s;
  }
}

/** Decide how a query may run, or why it may not. Pure; tested directly. */
export function classify(query) {
  if (typeof query !== "string" || !query.trim()) return { refused: "empty query" };
  const body = stripLeading(query);
  if (body === null) return { refused: "unterminated comment" };
  const word = (body.match(/^[A-Za-z]+/)?.[0] ?? "").toUpperCase();
  if (["SELECT", "WITH", "TABLE", "VALUES"].includes(word)) return { mode: "cursor", body };
  if (word === "SHOW") return { mode: "plain", body };
  if (word === "EXPLAIN") {
    // Refused wherever the word stands — option list, bare keyword, any case.
    // A column that happens to be called "analyze" is refused too: the cost
    // of a false refusal is one rephrased query; the cost of a miss is a write.
    if (/analy[sz]e/i.test(body)) return { refused: "EXPLAIN ANALYZE executes the statement" };
    return { mode: "plain", body };
  }
  if (word === "COPY") return { refused: "COPY is refused (use SELECT)" };
  return { refused: `only SELECT, WITH, TABLE, VALUES, SHOW or EXPLAIN may run (got ${word || "?"})` };
}

// -------------------------------------------------------------- the bench
/** Is the construction battery's lock held right now? Read, never taken. */
export function engineBusy(lockFile = LOCK_FILE, parentHoldsIt = process.env.DXB_ENGINE_LOCK_HELD === "1") {
  // The battery and a vitest run set this for their own children; refuter.sh
  // unsets it before Codex starts, so Sol's tool never inherits it.
  if (parentHoldsIt) return false;
  let ino;
  try { ino = statSync(lockFile).ino; } catch { return false; } // no lock file, no battery
  let locks = "";
  try { locks = readFileSync("/proc/locks", "utf8"); } catch { return false; }
  // "1: FLOCK  ADVISORY  WRITE 12345 fd:01:678901 0 EOF"
  return locks.split("\n").some((l) => {
    const dev = l.trim().split(/\s+/)[5];
    return dev !== undefined && dev.split(":")[2] === String(ino);
  });
}

// ----------------------------------------------------------- the engine
function readJson(file) { return JSON.parse(readFileSync(file, "utf8")); }
const triple = (i) => `${i.sysid}/${i.dboid}/${i.dbname}`;

function connectionString() {
  if (process.env.DXB_SOL_DB_URL) return process.env.DXB_SOL_DB_URL; // tests only
  const m = readFileSync(ENV_FILE, "utf8").match(/^DXB_SOL_READER_URL=(\S+)$/m);
  if (!m) throw new Error(`no DXB_SOL_READER_URL in ${ENV_FILE}`);
  const u = new URL(m[1]);
  if (u.hostname !== ENGINE.host || u.port !== ENGINE.port) {
    throw new Error(`the credential points at ${u.hostname}:${u.port}, not the construction engine`);
  }
  return m[1];
}

const bytes = (s) => Buffer.byteLength(s, "utf8");

/** Cut a cell at MAX_CELL UTF-8 bytes, never inside a character. */
export const cut = (v) => {
  if (v === null) return null;
  const s = String(v);
  const n = bytes(s);
  if (n <= MAX_CELL) return s;
  // The marker is inside the budget: head + marker ≤ MAX_CELL bytes.
  const marker = `…[cut at ${MAX_CELL} of ${n} bytes]`;
  const head = Buffer.from(s, "utf8").subarray(0, MAX_CELL - bytes(marker)).toString("utf8").replace(/\uFFFD+$/, "");
  return head + marker;
};

export async function sqlRead(query) {
  const plan = classify(query);
  if (plan.refused) return { ok: false, error: `REFUSED: ${plan.refused}` };
  if (engineBusy()) {
    return { ok: false, error: "REFUSED: engine busy — the construction battery holds the bench; ask again when it ends" };
  }

  const client = new pg.Client({
    connectionString: connectionString(),
    connectionTimeoutMillis: 5000,
    query_timeout: 15000,
    application_name: "sol-db-mcp",
    types: { getTypeParser: () => (v) => v }, // every value stays text
  });
  const ext = (text) => client.query({ text, queryMode: "extended", rowMode: "array" });
  try {
    await client.connect();
    const ledger = readJson(identityFile());
    const who = (await ext(
      `SELECT (SELECT system_identifier::text FROM pg_control_system()),
              (SELECT oid::text FROM pg_database WHERE datname = current_database()),
              current_database(), inet_server_port()::text, current_user::text`,
    )).rows[0];
    const here = { sysid: who[0], dboid: who[1], dbname: who[2] };
    if (ledger.company && triple(here) === triple(ledger.company)) {
      return { ok: false, error: `REFUSED: ${triple(here)} is the company's database` };
    }
    if (!(ledger.allowed ?? []).some((a) => triple(a) === triple(here))) {
      return { ok: false, error: `REFUSED: ${triple(here)} is not a permitted construction engine` };
    }

    await ext("BEGIN READ ONLY");
    await ext(`SET LOCAL statement_timeout = '${TIMEOUT}'`);
    const ro = (await ext("SELECT current_setting('transaction_read_only')")).rows[0][0];
    if (ro !== "on") return { ok: false, error: "REFUSED: the transaction is not read-only" };

    const drift = (await ext(
      `SELECT string_agg(DISTINCT p.oid::regprocedure::text, ', ')
         FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE ((${effectfulPredicate()}) OR p.prosecdef
               OR EXISTS (SELECT 1 FROM pg_depend d JOIN pg_extension e ON e.oid = d.refobjid
                           WHERE d.classid = 'pg_proc'::regclass AND d.objid = p.oid
                             AND d.deptype = 'e'
                             AND e.extname = ANY ('{${OUTBOUND_EXTENSIONS.join(",")}}'::text[]))
               OR (n.nspname IN ('extensions', 'supabase_migrations')
                   AND p.prorettype NOT IN ('trigger'::regtype, 'event_trigger'::regtype)
                   AND NOT EXISTS (SELECT 1 FROM pg_depend d JOIN pg_extension e ON e.oid = d.refobjid
                                    WHERE d.classid = 'pg_proc'::regclass AND d.objid = p.oid
                                      AND d.deptype = 'e'
                                      AND e.extname = ANY ('{${VETTED_EXTENSIONS.join(",")}}'::text[]))))
          AND has_function_privilege(p.oid, 'EXECUTE')`,
    )).rows[0][0];
    if (drift) {
      return {
        ok: false,
        engine: triple(here),
        error: `REFUSED: role drift — sol_reader can execute ${drift.slice(0, 500)}; ` +
          "run scripts/governance/sol-reader-role.sh before this tool answers again",
      };
    }

    // Rows come in batches of 25 and stop once the answer budget is spent, so
    // no more rows are pulled from the engine than can be shown. A single cell
    // still crosses whole before it is cut — its transfer is bounded by the 10 s
    // statement timeout. Rewriting Sol's query to cut cells server-side was
    // weighed and refused: wrapping it in a subquery can change its row order and
    // column shape, and false evidence is the worse failure (lead's decision on
    // Sol's re-check, 2026-09-28).
    let fields;
    let rows = [];
    let more = false;
    let spent = 0;
    if (plan.mode === "cursor") {
      await ext(`DECLARE sol_read NO SCROLL CURSOR FOR ${plan.body}`);
      for (;;) {
        const batch = await ext("FETCH 25 FROM sol_read");
        fields ??= batch.fields;
        for (const r of batch.rows) {
          const row = r.map(cut);
          if (rows.length === MAX_ROWS) { more = true; break; }
          rows.push(row);
          spent += bytes(JSON.stringify(row));
        }
        if (more || batch.rows.length < 25 || spent > MAX_ANSWER) {
          if (!more && batch.rows.length === 25) more = true; // stopped by the budget, not the end
          break;
        }
      }
    } else {
      const res = await ext(plan.body);
      fields = res.fields;
      rows = res.rows.map((r) => r.map(cut));
      if (rows.length > MAX_ROWS) { rows = rows.slice(0, MAX_ROWS); more = true; }
    }

    const identity = {
      engine: triple(here), address: `${client.host}:${client.port}`, server_port: who[3],
      user: who[4], transaction_read_only: ro,
    };
    const answer = { identity, columns: (fields ?? []).map((f) => f.name), rows, row_cap_hit: more };
    let text = JSON.stringify(answer);
    if (bytes(text) > MAX_ANSWER) {
      // The note is inside the budget: rows go until answer + note ≤ MAX_ANSWER bytes.
      answer.answer_cap_hit = `cut at ${MAX_ANSWER} bytes to 000 rows`;
      while (answer.rows.length && bytes(JSON.stringify(answer)) > MAX_ANSWER) answer.rows.pop();
      answer.answer_cap_hit = `cut at ${MAX_ANSWER} bytes to ${String(answer.rows.length).padStart(3, "0")} rows`;
      text = JSON.stringify(answer);
    }
    return { ok: true, text, rows: answer.rows.length, engine: identity.engine };
  } catch (e) {
    return { ok: false, error: `ERROR: ${e.message}` };
  } finally {
    await client.query("ROLLBACK").catch(() => {});
    await client.end().catch(() => {});
  }
}

function log(entry) {
  try {
    mkdirSync(dirname(LOG_FILE), { recursive: true });
    appendFileSync(LOG_FILE, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + "\n", { mode: 0o600 });
  } catch { /* a log that cannot be written must not become an error Sol reads as evidence */ }
}

// ------------------------------------------------------------- MCP stdio
const TOOL = {
  name: "sql_read",
  description:
    "Run ONE read-only SQL statement (SELECT, WITH, TABLE, VALUES, SHOW, or EXPLAIN without " +
    "ANALYZE) against the DxB CONSTRUCTION database engine (port 54422) as the read-only role " +
    "sol_reader. Visible schemas: public, pgboss, supabase_migrations, extensions. Answers carry " +
    "the engine identity; at most 200 rows, 4 KB per cell, 10 s per statement. Never the company's " +
    "database.",
  inputSchema: {
    type: "object",
    properties: { query: { type: "string", description: "one SQL statement" } },
    required: ["query"],
    additionalProperties: false,
  },
};

async function handle(msg) {
  const { id, method, params } = msg;
  if (method === "initialize") {
    return {
      protocolVersion: params?.protocolVersion ?? "2025-06-18",
      capabilities: { tools: {} },
      serverInfo: { name: "dxbdb", version: "1.0.0" },
    };
  }
  if (method === "ping") return {};
  if (method === "tools/list") return { tools: [TOOL] };
  if (method === "tools/call") {
    if (params?.name !== "sql_read") throw Object.assign(new Error(`unknown tool ${params?.name}`), { code: -32602 });
    const query = params?.arguments?.query;
    const t0 = Date.now();
    const r = await sqlRead(query);
    log({ query, ok: r.ok, engine: r.engine, rows: r.rows ?? 0, error: r.error, ms: Date.now() - t0 });
    return { content: [{ type: "text", text: r.ok ? r.text : r.error }], isError: !r.ok };
  }
  if (id === undefined) return undefined; // a notification
  throw Object.assign(new Error(`method not found: ${method}`), { code: -32601 });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const rl = createInterface({ input: process.stdin });
  const send = (o) => process.stdout.write(JSON.stringify(o) + "\n");
  rl.on("line", async (line) => {
    if (!line.trim()) return;
    let msg;
    try { msg = JSON.parse(line); } catch { return send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } }); }
    try {
      const result = await handle(msg);
      if (msg.id !== undefined && result !== undefined) send({ jsonrpc: "2.0", id: msg.id, result });
    } catch (e) {
      if (msg.id !== undefined) send({ jsonrpc: "2.0", id: msg.id, error: { code: e.code ?? -32603, message: e.message } });
    }
  });
}
