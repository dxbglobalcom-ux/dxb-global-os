// dxb-team2 job 1 — the auditor's read-only hand into the construction engine.
// Plan: .planning/quick/20260928-sol-db-reach/PLAN.md (rev 3); done-list item 3.
//
// CEO 2026-09-28: "önerin tmm" — GPT-6 Sol queries the construction engine itself
// through ONE tool, `sql_read` (scripts/governance/sol-db-mcp.mjs), as the role
// `sol_reader` (scripts/governance/sol-reader-role.sh); never the company.
//
// Every case runs the REAL tool against the REAL construction engine (:54422) as
// the REAL role, so a weakened guard turns a case red. The company engine is not
// contacted by any case: the company-identity refusal is proven by a ledger file
// that names the construction engine as "the company", and the wrong-port trial
// aims at a port nothing listens on.
//
// HOST FILE (scripts/construction/battery.sh HOST_FILES): the credential lives in
// ~/.config/dxb/sol-reader.env, outside the repository and outside the wall.
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const REPO = join(import.meta.dirname, "..", "..");
const TOOL = join(REPO, "scripts", "governance", "sol-db-mcp.mjs");
const LEDGER = join(REPO, "tools", "hooks", "ledger-identity.json");
const ENV_FILE = join(homedir(), ".config", "dxb", "sol-reader.env");

type Answer = { ok: boolean; text?: string; error?: string; rows?: number };
type Tool = {
  sqlRead: (q: string) => Promise<Answer>;
  classify: (q: string) => { mode?: string; refused?: string };
  engineBusy: (lockFile?: string, parentHoldsIt?: boolean) => boolean;
};
let tool: Tool;
const box = mkdtempSync(join(tmpdir(), "sol-db-reach-"));

beforeAll(async () => {
  // This run holds the engine on the tool's behalf (vitest's global setup or the
  // battery took the lock) — exactly what the variable says.
  process.env.DXB_ENGINE_LOCK_HELD = "1";
  tool = (await import(TOOL)) as Tool;
});
afterAll(() => {
  delete process.env.DXB_SOL_DB_URL;
  delete process.env.DXB_LEDGER_IDENTITY_FILE;
  rmSync(box, { recursive: true, force: true });
});

const body = (a: Answer) => JSON.parse(a.text!) as {
  identity: { engine: string; user: string; transaction_read_only: string };
  columns: string[]; rows: (string | null)[][]; row_cap_hit: boolean;
};

describe("sql_read — what it lets through", () => {
  it("(1) a plain count, with the engine's identity echoed on the same connection", async () => {
    const a = await tool.sqlRead("select count(*) from public.agents");
    expect(a.error).toBeUndefined();
    const b = body(a);
    const ledger = JSON.parse(readFileSync(LEDGER, "utf8"));
    const allowed = ledger.allowed.map((i: { sysid: string; dboid: string; dbname: string }) =>
      `${i.sysid}/${i.dboid}/${i.dbname}`);
    expect(allowed).toContain(b.identity.engine);
    expect(b.identity.user).toBe("sol_reader");
    expect(b.identity.transaction_read_only).toBe("on");
    expect(Number(b.rows[0][0])).toBeGreaterThan(0);
  });

  it("(2) SHOW and EXPLAIN without ANALYZE run; a leading nested comment is skipped", async () => {
    expect(body(await tool.sqlRead("show statement_timeout")).rows[0][0]).toBe("10s");
    expect(body(await tool.sqlRead("explain select * from public.agents")).columns).toEqual(["QUERY PLAN"]);
    expect(body(await tool.sqlRead("/* a /* b */ c */ -- x\n select 2")).rows[0][0]).toBe("2");
  });
});

describe("sql_read — what it refuses", () => {
  const refused = async (q: string, why: RegExp) => {
    const a = await tool.sqlRead(q);
    expect(a.ok, `${q} ran`).toBe(false);
    expect(a.error).toMatch(why);
  };

  it("(3) a second statement, however it is smuggled", async () => {
    const multi = /multiple commands/;
    await refused("select 1; delete from public.agents", multi);
    await refused("select $t$ ; $t$; delete from public.agents", multi);
    await refused("select E'\\''; delete from public.agents", multi);
    await refused("select /* ; */ 1; create table public.x(i int)", multi);
  });

  it("(4) EXPLAIN ANALYZE in every spelling, DO, COPY, and anything that is not a read", async () => {
    for (const q of ["explain analyze select 1", "EXPLAIN ANALYSE select 1", "explain (analyze) select 1",
                     "explain ( costs off, Analyze true ) select 1", "explain (ANALYSE) delete from public.agents"]) {
      await refused(q, /ANALYZE/);
    }
    await refused("do $$ begin perform 1; end $$", /only SELECT/);
    await refused("copy (select 1) to stdout", /COPY/);
    await refused("  copy public.agents from stdin", /COPY/);
    await refused("insert into public.agents default values", /only SELECT/);
    await refused("set default_transaction_read_only = off", /only SELECT/);
    await refused("/* unterminated select 1", /unterminated/);
  });

  it("(5) a write hidden inside a read: data-modifying WITH, FOR UPDATE, effectful functions", async () => {
    await refused("with x as (delete from public.agents returning 1) select * from x", /data-modifying/);
    await refused("select * from public.agents for update", /read-only transaction|permission denied/);
    await refused("select pg_advisory_lock(1)", /permission denied/);
    await refused("select lo_create(0)", /permission denied/);
    await refused("select pg_notify('x', 'y')", /permission denied/);
    await refused("select nextval((select oid from pg_class where relkind = 'S' limit 1))", /permission denied/);
    await refused("select net.http_get('http://127.0.0.1:54322')", /permission denied/);
  });

  it("(6) caps: 10 s per statement, 200 rows, 4 KB per cell", async () => {
    const t0 = Date.now();
    await refused("select pg_sleep(20)", /statement timeout/);
    expect(Date.now() - t0).toBeLessThan(14_000);

    const many = body(await tool.sqlRead("select g from generate_series(1, 10000) g"));
    expect(many.rows.length).toBe(200);
    expect(many.row_cap_hit).toBe(true);

    const big = body(await tool.sqlRead("select repeat('x', 1000000) as cell"));
    expect(Buffer.byteLength(big.rows[0][0]!, "utf8")).toBeLessThanOrEqual(4096);
    expect(big.rows[0][0]).toMatch(/cut at 4096 of 1000000 bytes/);

    // Bytes, not characters (Sol's high and xhigh audits, 2026-09-28): a
    // three-byte character used to pass 4096 of them — 12 KB a cell, 184 KB an answer.
    const wide = await tool.sqlRead("select repeat(chr(8364), 4096) as cell from generate_series(1, 30)");
    const w = body(wide);
    // The WHOLE cell, marker included, and the WHOLE answer, note included
    // (Sol's re-check: both markers used to sit outside their budgets).
    expect(Buffer.byteLength(w.rows[0][0]!, "utf8")).toBeLessThanOrEqual(4096);
    expect(w.rows[0][0]).not.toMatch(/\uFFFD/);
    expect(w.rows[0][0]).toMatch(/cut at 4096 of 12288 bytes/);
    expect(Buffer.byteLength(wide.text!, "utf8")).toBeLessThanOrEqual(64 * 1024);
    const edge = await tool.sqlRead("select repeat('x', 4097) as cell");
    expect(Buffer.byteLength(body(edge).rows[0][0]!, "utf8")).toBeLessThanOrEqual(4096);
    const full = await tool.sqlRead("select repeat('x', 1514) as cell from generate_series(1, 200)");
    expect(Buffer.byteLength(full.text!, "utf8")).toBeLessThanOrEqual(64 * 1024);
    expect(body(full).row_cap_hit).toBe(true);
  }, 30_000);

  it("(6c) the wire budget and the column list: bounded before they are held, and the tool lives on", async () => {
    // Sol's second re-check: a cell crossed whole before the cut, and column
    // names were outside the answer budget.
    const huge = await tool.sqlRead("select repeat('x', 40000000) as cell");
    expect(huge.ok).toBe(false);
    expect(huge.error).toMatch(/passed 16777216 bytes on the wire/);
    // The boundary itself (Sol's third re-check): one byte over is refused, and
    // a cell that fits with its row's framing still answers.
    for (const n of [16777217, 16777300]) {
      const edge = await tool.sqlRead(`select repeat('x', ${n}) as cell`);
      expect(edge.ok, `a ${n}-byte cell was returned as a success`).toBe(false);
      expect(edge.error).toMatch(/on the wire/);
    }
    expect((await tool.sqlRead("select repeat('x', 16000000) as cell")).ok).toBe(true);

    const wide = "select " + Array.from({ length: 1200 }, (_, i) => `1 as ${"c".repeat(50)}_${i}`).join(", ");
    const w = await tool.sqlRead(wide);
    expect(w.ok).toBe(false);
    expect(w.error).toMatch(/column list alone is over 65536 bytes/);

    expect((await tool.sqlRead("select 2")).ok).toBe(true); // a dropped socket did not kill the tool
  });

  it("(6b) role drift: a function born later in `extensions` or `supabase_migrations` stops the tool", async () => {
    // Sol's xhigh finding A: no default privilege guards `extensions` or
    // `supabase_migrations`, so a function created there tomorrow is PUBLIC's.
    // The tool must see it on its own connection and refuse, in any schema.
    const admin = (sql: string) => spawnSync("docker",
      ["exec", "-i", "supabase_db_DxB_Build", "psql", "-U", "supabase_admin", "-d", "postgres",
       "-v", "ON_ERROR_STOP=1", "-qtA"], { input: sql, encoding: "utf8" });
    // Three shapes: SECURITY DEFINER; a plain SECURITY INVOKER function (Sol's
    // re-check — it could reach an outside effect the guard did not name); and
    // the same in the other unguarded schema.
    for (const [fn, how] of [
      ["extensions.sol_drift_probe()", "SECURITY DEFINER"],
      ["extensions.sol_drift_probe()", "SECURITY INVOKER"],
      ["supabase_migrations.sol_drift_probe()", "SECURITY INVOKER"],
    ]) {
      const born = admin(`CREATE FUNCTION ${fn} RETURNS int LANGUAGE sql ${how} AS 'select 1';`);
      expect(born.status, born.stderr).toBe(0);
      try {
        const a = await tool.sqlRead("select 1");
        expect(a.ok, `${fn} ${how} did not stop the tool`).toBe(false);
        expect(a.error).toMatch(/role drift.*sol_drift_probe/);
      } finally {
        expect(admin(`DROP FUNCTION ${fn};`).status).toBe(0);
      }
      expect((await tool.sqlRead("select 1")).ok).toBe(true);
    }
  });
});

describe("sql_read — where it refuses to go", () => {
  it("(7) the company's identity is refused, recognised by identity and not by address", async () => {
    const ledger = JSON.parse(readFileSync(LEDGER, "utf8"));
    const poisoned = join(box, "ledger-company-is-here.json");
    writeFileSync(poisoned, JSON.stringify({ company: ledger.allowed[0], allowed: ledger.allowed }));
    process.env.DXB_LEDGER_IDENTITY_FILE = poisoned;
    try {
      const a = await tool.sqlRead("select 1");
      expect(a.ok).toBe(false);
      expect(a.error).toMatch(/company's database/);
    } finally {
      delete process.env.DXB_LEDGER_IDENTITY_FILE;
    }
  });

  it("(8) an engine not on allowed[], a wrong database, and a wrong port are refused", async () => {
    const empty = join(box, "ledger-nothing-allowed.json");
    writeFileSync(empty, JSON.stringify({ company: null, allowed: [] }));
    process.env.DXB_LEDGER_IDENTITY_FILE = empty;
    try {
      expect((await tool.sqlRead("select 1")).error).toMatch(/not a permitted construction engine/);
    } finally {
      delete process.env.DXB_LEDGER_IDENTITY_FILE;
    }

    const url = readFileSync(ENV_FILE, "utf8").match(/^DXB_SOL_READER_URL=(\S+)$/m)![1];
    const other = new URL(url);
    other.pathname = "/template1";
    process.env.DXB_SOL_DB_URL = other.toString();
    try {
      const a = await tool.sqlRead("select 1");
      expect(a.ok).toBe(false);
      expect(a.error).toMatch(/not a permitted construction engine|permission denied/);
    } finally {
      delete process.env.DXB_SOL_DB_URL;
    }

    const dead = new URL(url);
    dead.port = "54499";
    process.env.DXB_SOL_DB_URL = dead.toString();
    try {
      const a = await tool.sqlRead("select 1");
      expect(a.ok).toBe(false);
      expect(a.error).toMatch(/ECONNREFUSED/);
    } finally {
      delete process.env.DXB_SOL_DB_URL;
    }
  });

  it("(9) while the battery holds the bench, the tool runs nothing", async () => {
    const lock = join(box, "dxb-construction-battery.lock");
    writeFileSync(lock, "");
    expect(tool.engineBusy(lock, false)).toBe(false);
    const holder = spawn("flock", ["-n", lock, "sh", "-c", "echo LOCKED; exec cat"], { stdio: ["pipe", "pipe", "ignore"] });
    await new Promise<void>((res) => holder.stdout!.on("data", (d: Buffer) => d.toString().includes("LOCKED") && res()));
    try {
      expect(tool.engineBusy(lock, false)).toBe(true);
    } finally {
      holder.stdin!.end();
      await new Promise((res) => holder.on("exit", res));
    }
    expect(tool.engineBusy(lock, false)).toBe(false);
  });
});

describe("the MCP server itself", () => {
  it("(10) over stdio it lists exactly one tool and answers a call", () => {
    const msgs = [
      { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "0" } } },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      { jsonrpc: "2.0", id: 2, method: "tools/list" },
      { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "sql_read", arguments: { query: "select 41 + 1 as n" } } },
      { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "sql_write", arguments: { query: "x" } } },
    ];
    const r = spawnSync("node", [TOOL], {
      input: msgs.map((m) => JSON.stringify(m)).join("\n") + "\n",
      encoding: "utf8",
      env: { ...process.env, DXB_ENGINE_LOCK_HELD: "1" },
      timeout: 20_000,
    });
    const out = r.stdout.trim().split("\n").map((l) => JSON.parse(l));
    const byId = (id: number) => out.find((o) => o.id === id);
    expect(byId(2).result.tools.map((t: { name: string }) => t.name)).toEqual(["sql_read"]);
    expect(byId(3).result.isError).toBe(false);
    expect(JSON.parse(byId(3).result.content[0].text).rows).toEqual([["42"]]);
    expect(byId(4).error.message).toMatch(/unknown tool/);
  });
});
