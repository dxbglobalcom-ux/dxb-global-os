// One real review on the construction engine (Sol F1's end-to-end leg, Fable's end call 2026-10-04):
// pin a fixture tool, drift it benignly, let the real worker claim the tool-less review (real executor,
// real QA), then the watch records the verdict. Cleans what it wrote. Run with DXB_DATABASE_URL = the bench.
import { randomUUID } from "node:crypto";
import { sql } from "kysely";
import { getDb, closeDb } from "../../../packages/shared/dist/index.js";
import { approvedCorpus, checkPins, computeToolHash, pinAll, watchToolLocks } from "../../../packages/gateway/dist/index.js";
import { qa, runWorkerOnce } from "../../../packages/orchestrator/dist/index.js";

if (!/54422/.test(process.env.DXB_DATABASE_URL ?? "")) throw new Error("bench only (54422)");
const db = getDb();
const SERVER = `probe-road-${randomUUID().slice(0, 8)}`;
const base = { server: SERVER, tool: "record_read", description: "Read one record by its id.", inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } };
const drifted = { ...base, description: "Read one record by its id. Returns the record as JSON, or null when it does not exist." };
let taskId = null;
try {
  await pinAll(db, [base]);
  const r = await checkPins(db, [drifted], new Set([SERVER]), approvedCorpus([], new Set(["dxb-mcp"]), computeToolHash));
  console.log("locked:", JSON.stringify(r.quarantined));
  taskId = (await sql`SELECT payload->>'task_id' AS t FROM audit_log WHERE action='tool_review_opened' AND payload->>'server'=${SERVER}`.execute(db)).rows[0].t;
  const t0 = Date.now();
  const run = await runWorkerOnce({ workerId: "probe-road", departments: ["security"] });
  console.log("worker:", JSON.stringify(run).slice(0, 400), `${Math.round((Date.now() - t0) / 1000)}s`);
  if (run.status === "review") {
    const q = await qa(taskId);
    console.log("qa:", JSON.stringify(q).slice(0, 300));
  }
  const task = (await sql`SELECT status, tools_allowed, result->>'text' AS text FROM tasks WHERE id=${taskId}::uuid`.execute(db)).rows[0];
  console.log("task:", task.status, "tools_allowed:", task.tools_allowed, "text:", String(task.text).slice(0, 300));
  const calls = (await sql`SELECT count(*)::int AS n FROM tool_calls c JOIN agent_runs a ON a.id = c.run_id WHERE a.task_id=${taskId}::uuid`.execute(db).catch(() => ({ rows: [{ n: "n/a" }] }))).rows[0].n;
  console.log("tool calls in the run:", calls);
  const names = (await sql`SELECT c.* FROM tool_calls c JOIN agent_runs a ON a.id = c.run_id WHERE a.task_id=${taskId}::uuid ORDER BY 1`.execute(db).catch((e) => ({ rows: [String(e)] }))).rows;
  console.log("tool call rows:", JSON.stringify(names).slice(0, 1500));
  const w = await watchToolLocks(db, { servers: [SERVER] });
  console.log("watch:", JSON.stringify(w));
  const v = (await sql`SELECT payload FROM audit_log WHERE action='tool_drift_verdict' AND payload->>'server'=${SERVER}`.execute(db)).rows;
  console.log("verdict rows:", JSON.stringify(v));
  const a = (await sql`SELECT level, title FROM alerts WHERE dedup_key LIKE ${`pin:%:${SERVER}:%`}`.execute(db)).rows;
  console.log("alerts:", JSON.stringify(a));
} finally {
  if (taskId) {
    const runs = (await sql`SELECT id FROM agent_runs WHERE task_id=${taskId}::uuid`.execute(db)).rows.map((x) => x.id);
    for (const id of runs) {
      await sql`DELETE FROM tool_calls WHERE run_id=${id}::uuid`.execute(db).catch(() => {});
    }
    for (const t of ["approvals", "cost_ledger", "crm_requests", "generated_work", "media_jobs", "revenue_scout_runs", "task_dependencies", "task_events", "alerts"]) {
      await sql`DELETE FROM ${sql.table(t)} WHERE task_id=${taskId}::uuid`.execute(db).catch((e) => console.log("cleanup", t, String(e).slice(0, 120)));
    }
    await sql`DELETE FROM agent_runs WHERE task_id=${taskId}::uuid`.execute(db).catch((e) => console.log("cleanup agent_runs", String(e).slice(0, 160)));
    await sql`DELETE FROM audit_log WHERE task_id=${taskId}::uuid`.execute(db);
    await sql`DELETE FROM tasks WHERE id=${taskId}::uuid`.execute(db).catch((e) => console.log("cleanup tasks", String(e).slice(0, 160)));
  }
  await sql`DELETE FROM alerts WHERE dedup_key LIKE ${`pin:%:${SERVER}:%`}`.execute(db);
  await sql`DELETE FROM tool_pins WHERE server=${SERVER}`.execute(db);
  await sql`DELETE FROM audit_log WHERE payload->>'server'=${SERVER}`.execute(db);
  console.log("cleaned", SERVER, taskId);
  await closeDb();
}
