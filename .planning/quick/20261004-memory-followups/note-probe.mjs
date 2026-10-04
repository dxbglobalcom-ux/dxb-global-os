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
// the probe's OWN task row (Sol's re-check, 2026-10-04): its cost rows and nothing else's are removed
// by that id. Department "note-probe" has no seat and no lane, so no drain ever claims it.
const anyTask = await db
  .insertInto("tasks")
  .values({
    department: "note-probe",
    objective: "note-probe 2026-10-04 — the call's own record",
    output_contract: "none",
    model_tier: "L4",
    approval_class: "none",
    budget_max_tokens: 4000,
    priority: 5,
    status: "queued",
  })
  .returning("id")
  .executeTakeFirstOrThrow();
const canary = `NOTE_PROBE_${stamp}`;
// a cost row the call leaves makes the battery's B39 "clean book" case red (measured 2026-10-04 — two
// probe rows left the book at 1 lane instead of 2); they are removed by the probe's own task id below

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

// what the employee's child wrote: the index id its tool returned, read back three ways and compared
// exactly (Sol's single pass, 2026-10-04: a canary substring proved too little)
const body = `${canary} — the employee's note from a real task.`;
// the model echoes the tool's JSON as an array or as its one object — the id is read from either
const returned = String(out.result?.text ?? out.result).match(/"index_id"\s*:\s*"([0-9a-f-]{36})"/)?.[1] ?? null;
console.log(`the tool returned index_id=${returned}`);
const row = returned
  ? await db.selectFrom("memory_index").select(["id", "store", "ref", "trust_tier"]).where("id", "=", returned).executeTakeFirst()
  : undefined;
console.log(`memory_index row: ${JSON.stringify(row ?? null)}`);
const file = row ? join(memRoot, row.ref) : null;
const fileBody = file && existsSync(file) ? readFileSync(file, "utf8") : null;
// the writer stores frontmatter (its own id among it) + the body + "\n" (memory-router obsidian.ts)
const parts = fileBody?.split("\n---\n") ?? [];
const noteText = parts.length === 2 ? parts[1] : null;
const idInNote = fileBody?.includes(`\nid: ${JSON.stringify(returned)}\n`) ?? false;
console.log(`in the handed root: exists=${fileBody !== null} body_equal=${noteText === `${body}\n`} id_in_note=${idInNote}`);

// the scheduler side — the same recall Hamza's lanes call
const recall = await recallMemory(db, { query: canary, kind: "artifact", limit: 5 }, { caller: "note-probe" });
const back = recall.rows.find((r) => r.id === returned);
console.log(`scheduler-side recall: rows=${recall.rows.length} same_id=${Boolean(back)} same_note=${back?.body === fileBody}`);

const companyAfter = drawerCount();
console.log(`company drawer files: before=${companyBefore} after=${companyAfter}`);

const ok =
  row?.store === "obsidian" &&
  noteText === `${body}\n` &&
  idInNote &&
  back?.body === fileBody &&
  companyBefore === companyAfter;
console.log(ok ? "NOTE_PROBE_OK" : "NOTE_PROBE_FAIL");

// removal: only this probe's own index row, the call's own cost rows and its root
if (row) await db.deleteFrom("memory_index").where("id", "=", row.id).execute();
else if (recall.rows.length) console.log(`LEFTOVER memory_index rows the reply did not name: ${recall.rows.map((r) => r.id)}`);
const costGone = await db.deleteFrom("cost_ledger").where("task_id", "=", anyTask.id).returning("id").execute();
const taskGone = await db.deleteFrom("tasks").where("id", "=", anyTask.id).returning("id").execute();
console.log(`removed: cost_ledger ${costGone.length} · its own task ${taskGone.length}`);
rmSync(memRoot, { recursive: true, force: true });
console.log(`removed: memory_index ${row ? 1 : 0} · root ${existsSync(memRoot) ? "STILL THERE" : "gone"}`);

console.log(`SESSIONS ${receipts.map((r) => r.match(/session=(\S+)/)?.[1]).join(" ")}`);
await db.destroy();
console.log("PROBE_DONE");
if (!ok) process.exit(1);
