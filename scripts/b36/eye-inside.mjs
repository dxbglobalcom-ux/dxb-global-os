#!/usr/bin/env node
/**
 * B36 · Block 3-bis — WHAT THE CONSTRUCTION DOES, MEASURED FROM WHERE IT LIVES.
 *
 * This is the half of the acceptance screen that runs AS the construction: inside
 * its sandbox, and — separately — as its bare operating-system identity with no
 * sandbox at all. It does two things and prints one JSON object:
 *
 *   1. REAL WORK on its own engine. Not a handshake: it logs in, reads the
 *      engine's own system identifier (which is what proves it is a different
 *      database, not the holding's), counts the tables and reads a table. If this
 *      half fails, the other half proves nothing — a runtime that cannot work
 *      anywhere is not being "refused", it is broken.
 *
 *   2. THE SAME RUNTIME, TURNED AT THE HOLDING. Every address the holding answers
 *      on, handed in on the command line because the sandbox has no Docker to ask.
 *      Each attempt is timed, so the screen can show that the refusal is instant
 *      rather than a hang.
 *
 * Nothing here writes. Every attempt against the holding is a connect or a login
 * that must fail; the CEO's order stands — not one letter enters the company's
 * database.
 */
import { connect as tcpConnect } from "node:net";
import { realpathSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const HOME = process.env.HOME || "/tmp";

const flag = (name) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : "";
};

/**
 * pnpm links `pg` through a symlink whose siblings are not beside it. Anchoring the
 * require at pg's real file puts them back within reach — without this the probe
 * reports a false refusal, which is exactly the fault this file exists to avoid.
 */
function loadPg() {
  const req = createRequire(join(REPO, "packages/shared/package.json"));
  return req(realpathSync(req.resolve("pg")));
}

function knock(host, port, ms = 3000) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const s = tcpConnect({ host, port });
    const done = (ok, why) => {
      try { s.destroy(); } catch { /* gone */ }
      resolve({ target: `${host}:${port}`, ok, why, ms: Date.now() - t0 });
    };
    const timer = setTimeout(() => done(false, "zaman aşımı"), ms);
    s.on("connect", () => { clearTimeout(timer); done(true, "bağlandı"); });
    s.on("error", (e) => { clearTimeout(timer); done(false, e.code || e.message); });
  });
}

const out = {
  identity: {
    uid: process.getuid(),
    gid: process.getgid(),
    groups: process.getgroups().join(","),
    sandbox: process.env.DXB_CONSTRUCTION_SANDBOX === "1",
  },
  ownEngine: null,
  attempts: [],
  login: null,
};

// ---------------------------------------------- 1. real work on its own engine
{
  const t0 = Date.now();
  try {
    const { Client } = loadPg();
    const c = new Client({
      connectionString: "postgresql://postgres:postgres@127.0.0.1:54422/postgres",
      connectionTimeoutMillis: 5000,
    });
    await c.connect();
    const id = await c.query("SELECT system_identifier::text AS id FROM pg_control_system()");
    const tables = await c.query(
      "SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'");
    const agents = await c.query("SELECT count(*)::int AS n FROM agents");
    await c.end();
    out.ownEngine = {
      ok: true,
      engineId: id.rows[0].id,
      tables: tables.rows[0].n,
      rows: agents.rows[0].n,
      ms: Date.now() - t0,
    };
  } catch (e) {
    out.ownEngine = { ok: false, why: String(e.message || e).split("\n")[0], ms: Date.now() - t0 };
  }
}

// -------------------------------------- 2. the same runtime, turned at the holding
{
  const targets = (flag("targets") || "").split(",").map((x) => x.trim()).filter(Boolean);
  for (const t of targets) {
    const i = t.lastIndexOf(":");
    out.attempts.push(await knock(t.slice(0, i), Number(t.slice(i + 1))));
  }
}

// ------------------------- and a real PostgreSQL login at the container address
{
  const target = flag("login-target");
  if (!target) {
    out.login = { target: "(verilmedi)", ok: false, layer: "unknown", why: "hedef verilmedi" };
  } else {
    const i = target.lastIndexOf(":");
    const host = target.slice(0, i);
    const port = Number(target.slice(i + 1));
    const first = await knock(host, port);
    if (!first.ok) {
      out.login = { target, ok: false, layer: "network", why: first.why, ms: first.ms };
    } else {
      let url = null;
      try {
        url = readFileSync(join(HOME, ".config/dxb/company-gateway.env"), "utf8").split("\n")
          .find((l) => l.startsWith("DXB_COMPANY_GATEWAY_URL="))
          ?.slice("DXB_COMPANY_GATEWAY_URL=".length).trim() || null;
      } catch { /* no credential here, which is the point */ }
      if (!url) {
        out.login = { target, ok: true, layer: "credential", why: "ağ geçirdi; sadece parola durdurdu" };
      } else {
        const t0 = Date.now();
        try {
          const u = new URL(url); u.hostname = host; u.port = String(port);
          const { Client } = loadPg();
          const c = new Client({ connectionString: u.toString(), connectionTimeoutMillis: 5000 });
          await c.connect();
          const r = await c.query("SELECT current_user");
          await c.end();
          out.login = { target, ok: true, layer: "none", who: r.rows[0].current_user, ms: Date.now() - t0 };
        } catch (e) {
          out.login = { target, ok: true, layer: "postgres", why: String(e.message || e).split("\n")[0] };
        }
      }
    }
  }
}

console.log(JSON.stringify(out));
