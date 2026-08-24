#!/usr/bin/env node
/**
 * B36 · Block 3-bis — THE PROBE.
 *
 * One file, two runtimes. It fires the same attempts from inside the
 * construction sandbox, where every one of them must be REFUSED, and from the
 * unsandboxed runtime, where the same attempts must SUCCEED. A refusal that was
 * never tested against a working attempt is not a measurement — it is a script
 * that forgot to try.
 *
 * Nothing here writes. Every attempt against the holding is a connect, a stat or
 * a SELECT; the mutating half of the drill runs on the construction engine,
 * which is disposable. The CEO's order stands: not one letter enters the
 * company's database.
 *
 * It prints one JSON object and says nothing else, because prove-wall.mjs reads
 * its output.
 */
import { connect as tcpConnect } from "node:net";
import { execFile } from "node:child_process";
import { accessSync, constants, statSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const HOME = process.env.HOME || "/tmp";
/**
 * pnpm links `pg` into packages/shared/node_modules as a symlink into the store.
 * Required through that path, pg's own dependencies resolve beside the LINK and
 * `pg-types` is not there — measured 2026-08-24, and it made this probe report a
 * false refusal from the unsandboxed runtime. Anchoring the require at pg's real
 * file puts its siblings back within reach.
 */
function loadPg() {
  const require_ = createRequire(join(REPO, "packages/shared/package.json"));
  return require_(realpathSync(require_.resolve("pg")));
}

const results = {};

const record = (id, reached, detail) => { results[id] = { reached, detail }; };

// Who is asking. The wall's first layer is an operating-system identity, so the
// drill has to be able to say which one fired each attempt.
record("identity", true,
  `uid=${process.getuid()} gid=${process.getgid()} groups=${process.getgroups().join(",")}`
  + ` sandbox=${process.env.DXB_CONSTRUCTION_SANDBOX === "1" ? "yes" : "no"}`);

// ------------------------------------------------------------------ TCP doors
function reachable(host, port, ms = 3000) {
  return new Promise((resolve) => {
    const s = tcpConnect({ host, port });
    const done = (v, why) => { try { s.destroy(); } catch { /* gone */ } resolve({ v, why }); };
    const t = setTimeout(() => done(false, "timed out"), ms);
    s.on("connect", () => { clearTimeout(t); done(true, "connected"); });
    s.on("error", (e) => { clearTimeout(t); done(false, e.code || e.message); });
  });
}

const SPELLINGS = ["127.0.0.1", "localhost", "127.1", "2130706433", "127.0.0.2"];

async function anySpellingReaches(port) {
  const hits = [];
  for (const h of SPELLINGS) {
    const r = await reachable(h, port);
    if (r.v) hits.push(h);
  }
  return hits;
}

// ------------------------------------------------------------------- the run
{
  const hits = await anySpellingReaches(54322);
  record("tcp-company-db", hits.length > 0, hits.length ? `reached as ${hits.join(", ")}` : "every spelling refused");
}
{
  const hits = await anySpellingReaches(54321);
  record("tcp-company-http", hits.length > 0, hits.length ? `reached as ${hits.join(", ")}` : "every spelling refused");
}
{
  const r = await reachable("127.0.0.1", 54422);
  record("tcp-construction-db", r.v, r.why);
}

// --------------------------------------------------------------- the socket
{
  // Whether the inode is visible is not the question — whether this identity can
  // TALK to it is. The construction identity can see the socket and is refused by
  // it; inside the sandbox the socket is not there at all.
  const socket = await new Promise((resolve) => {
    let done = false;
    const s = tcpConnect({ path: "/var/run/docker.sock" });
    const end = (v, why) => { if (done) return; done = true; try { s.destroy(); } catch { /* gone */ } resolve({ v, why }); };
    const t2 = setTimeout(() => end(false, "timed out"), 3000);
    s.on("connect", () => { clearTimeout(t2); end(true, "connected"); });
    s.on("error", (e) => { clearTimeout(t2); end(false, e.code || e.message); });
  });
  let stat = null;
  try { statSync("/var/run/docker.sock"); stat = "visible"; } catch (e) { stat = e.code; }
  const dockerPs = await new Promise((resolve) => {
    execFile("docker", ["ps", "--format", "{{.Names}}"], { timeout: 8000 }, (err, out) =>
      resolve(err ? { ok: false, why: String(err.message).split("\n")[0] } : { ok: true, why: `${out.trim().split("\n").length} containers` }));
  });
  const exec = await new Promise((resolve) => {
    execFile("docker", ["exec", "-i", "supabase_db_DxB_Global_OS", "psql", "-U", "supabase_admin", "-d", "postgres", "-qtA", "-c", "select current_user"],
      { timeout: 12000 }, (err, out) => resolve(err ? { ok: false, why: String(err.message).split("\n")[0] } : { ok: true, why: out.trim() }));
  });
  record("docker-socket", socket.v, socket.v ? "connected" : `${socket.why} (inode: ${stat})`);
  record("docker-ps", dockerPs.ok, dockerPs.why);
  record("docker-exec-company", exec.ok, exec.why);
}

// ---------------------------------------------------------------- the papers
{
  const paths = [
    join(REPO, ".env"),
    join(REPO, ".env.daemon"),
    join(REPO, "var/b36/company-window.env"),
    join(HOME, ".config/dxb/company-gateway.env"),
    join(HOME, ".config/systemd/user/dxb-scheduler.service"),
  ];
  const readable = [];
  for (const p of paths) {
    try { accessSync(p, constants.R_OK); readable.push(p.replace(REPO, ".").replace(HOME, "~")); } catch { /* refused */ }
  }
  record("credential-files", readable.length > 0, readable.length ? `readable: ${readable.join(" ")}` : "none readable");
}

// ------------------------------------------------- a real login to the holding
{
  let detail = "no company credential is readable from here";
  let reached = false;
  const credPath = join(HOME, ".config/dxb/company-gateway.env");
  try {
    const { readFileSync } = await import("node:fs");
    const url = readFileSync(credPath, "utf8").split("\n")
      .find((l) => l.startsWith("DXB_COMPANY_GATEWAY_URL="))?.slice("DXB_COMPANY_GATEWAY_URL=".length).trim();
    if (url) {
      const { Client } = loadPg();
      const c = new Client({ connectionString: url, connectionTimeoutMillis: 5000 });
      await c.connect();
      const r = await c.query("SELECT current_user");
      await c.end();
      reached = true; detail = `logged in as ${r.rows[0].current_user}`;
    }
  } catch (e) { detail = String(e.message || e).split("\n")[0]; if (process.env.WALL_PROBE_DEBUG) detail += " || " + String(e.stack||"").split("\n").slice(1,5).join(" / "); }
  record("company-login", reached, detail);
}

// ------------------------------------------------------------- the one door
{
  const { ask } = await import("./company-read-client.mjs");
  try { await ask("ping"); record("gateway-reachable", true, "answers"); }
  catch (e) { record("gateway-reachable", false, String(e.message).split("\n")[0]); }

  try { const v = await ask("ask", "agents_total"); record("gateway-named-question", true, `agents_total = ${v}`); }
  catch (e) { record("gateway-named-question", false, String(e.message).split("\n")[0]); }

  const smuggle = [
    "SELECT 1",
    "ALTER ROLE dxb_gateway PASSWORD 'x'",
    "NOTIFY \"dxb:ops:live\", '{}'",
    "SELECT pg_notify('dxb:ops:live','{}')",
    "INSERT INTO cost_ledger DEFAULT VALUES",
    "agents_total; DROP TABLE agents",
  ];
  const accepted = [];
  for (const s of smuggle) {
    try { await ask("ask", s); accepted.push(s); } catch { /* refused, which is the point */ }
  }
  record("gateway-arbitrary-sql", accepted.length > 0, accepted.length ? `ACCEPTED: ${accepted.join(" | ")}` : `all ${smuggle.length} refused`);

  const ops = ["exec", "query", "sql", "write", "eval"];
  const acceptedOps = [];
  for (const o of ops) {
    try { await ask(o, "SELECT 1"); acceptedOps.push(o); } catch { /* refused */ }
  }
  record("gateway-other-operations", acceptedOps.length > 0, acceptedOps.length ? `ACCEPTED: ${acceptedOps.join(",")}` : `all ${ops.length} refused`);
}

process.stdout.write(JSON.stringify(results, null, 2) + "\n");
