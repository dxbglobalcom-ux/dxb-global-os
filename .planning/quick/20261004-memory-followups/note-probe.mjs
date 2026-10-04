// The memory drawer's open check (2026-10-04): a REAL task-lane call — `defaultExecutor`, a staffed
// seat, the company's own Claude home and work folder — commits a note through its own dxb-mcp child,
// and the scheduler side reads the same note back with the same `recallMemory` Hamza's lanes use.
// Run through run-lanes-probe.sh (the resident's shape, the construction engine). The drawer root is a
// fresh construction folder handed down exactly as the scheduler hands the company's: DXB_MEMORY_ROOT
// in the parent's env, carried to the child by companyIsolation. The company's own drawer is counted
// before and after and must not move.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const fail = (why) => {
  console.log(`PROBE_ABORT ${why}`);
  process.exit(2);
};

const dbUrl = new URL(process.env.DXB_DATABASE_URL ?? "postgresql://x@nowhere:1/x");
if (dbUrl.port !== "54422") fail(`DXB_DATABASE_URL is not the construction engine (port ${dbUrl.port})`);
if (process.env.DXB_COMPANY_DATABASE_URL) fail("DXB_COMPANY_DATABASE_URL is set — the company must not be reachable");
if (process.cwd() !== ROOT) fail(`cwd ${process.cwd()} is not the residents' WorkingDirectory`);

const stamp = randomUUID().slice(0, 8);
const memRoot = join(ROOT, "var", `note-probe-${stamp}`);
mkdirSync(memRoot);
process.env.DXB_MEMORY_ROOT = memRoot;

const dist = (pkg, file) => join(ROOT, "packages", pkg, "dist", file);
const { companyClaudeHome } = await import(dist("kernel", "sdk-isolation.js"));
const { getDb } = await import(dist("shared", "index.js"));
const { recallMemory } = await import(dist("memory-router", "index.js"));
const { defaultExecutor } = await import(dist("orchestrator", "worker-shim.js"));

const receipts = [];
const log = console.log.bind(console);
console.log = (...a) => {
  const line = a.map(String).join(" ");
  if (line.startsWith("[isolation]")) receipts.push(line);
  log(...a);
};

// the company's drawer, counted (names only) — it must not move
const companyHome = companyClaudeHome();
const drawerCount = () => {
  let n = 0;
  for (const sub of ["artifact", "relation"]) {
    const d = join(companyHome, "memory-store", sub);
    if (existsSync(d)) n += readdirSync(d).length;
  }
  return n;
};
const companyBefore = drawerCount();

const db = getDb();
const seat = await db.selectFrom("agents").select(["id", "slug", "department"]).where("slug", "=", "finance-financial-analyst").executeTakeFirstOrThrow();
const anyTask = await db.selectFrom("tasks").select(["id"]).orderBy("created_at").limit(1).executeTakeFirstOrThrow();
const t0 = (await db.selectNoFrom((eb) => eb.fn("now", []).as("t")).executeTakeFirst()).t;
const canary = `NOTE_PROBE_${stamp}`;

const out = await defaultExecutor({
  id: anyTask.id,
  department: seat.department,
  objective:
    `Call the tool mcp__dxb-mcp__memory_commit exactly once with this input: ` +
    JSON.stringify({
      facts: [],
      artifact: { path: `note-probe/${canary}.md`, body: `${canary} — the employee's note from a real task.` },
      provenance: { agent: seat.slug, task_id: null, origin: "agent", source: "reasoning" },
    }) +
    ` Then reply with the JSON the tool returned, nothing else.`,
  output_contract: "result: the tool's JSON; confidence 0-1; evidence: [the tool call]; acceptance_map: {}",
  model_tier: "L4",
  approval_class: "none",
  budget_max_tokens: 4000,
  priority: 5,
  status: "running",
  agent_id: seat.id,
});
console.log(`task lane: toolSurfaceMounted=${out.toolSurfaceMounted} result=${JSON.stringify(out.result?.text ?? out.result).slice(0, 300)}`);

// what the employee's child wrote, read from the engine and the drawer
const rows = await db
  .selectFrom("memory_index")
  .select(["id", "store", "ref", "trust_tier"])
  .where("store", "=", "obsidian")
  .where("created_at", ">=", t0)
  .execute();
console.log(`memory_index rows since the call: ${JSON.stringify(rows)}`);
const onDisk = rows.map((r) => {
  const file = join(memRoot, r.ref);
  return { ref: r.ref, exists: existsSync(file), holdsCanary: existsSync(file) && readFileSync(file, "utf8").includes(canary) };
});
console.log(`in the handed root: ${JSON.stringify(onDisk)}`);

// the scheduler side — the same recall Hamza's lanes call
const recall = await recallMemory(db, { query: canary, kind: "artifact", limit: 5 }, { caller: "note-probe" });
const found = recall.rows.filter((r) => r.body.includes(canary));
console.log(`scheduler-side recall: rows=${recall.rows.length} holding the canary=${found.length}`);

const companyAfter = drawerCount();
console.log(`company drawer files: before=${companyBefore} after=${companyAfter}`);

const ok = rows.length === 1 && onDisk[0]?.holdsCanary === true && found.length === 1 && companyBefore === companyAfter;
console.log(ok ? "NOTE_PROBE_OK" : "NOTE_PROBE_FAIL");

// removal: the probe's index row, its cost row, its root
if (rows.length) await db.deleteFrom("memory_index").where("id", "in", rows.map((r) => r.id)).execute();
await db.deleteFrom("cost_ledger").where("task_id", "=", anyTask.id).where("created_at", ">=", t0).execute();
rmSync(memRoot, { recursive: true, force: true });
console.log(`removed: memory_index ${rows.length} · root ${existsSync(memRoot) ? "STILL THERE" : "gone"}`);

console.log(`SESSIONS ${receipts.map((r) => r.match(/session=(\S+)/)?.[1]).join(" ")}`);
await db.destroy();
console.log("PROBE_DONE");
if (!ok) process.exit(1);
