import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { ClassifiedIntent } from "../../packages/kernel/src/index.js";
import { watchLedgers, watchSideAlerts } from "../helpers/suite-scope.js";
import { drainTasks, intakeIntentOnce } from "../../packages/orchestrator/src/index.js";

// B51 step 2 — the critical gate run ONCE along the real path, on the construction engine, with real models
// (CEO 2026-10-09: "düzeltmeyi ve gereken neyse onu yap"). One run, two readings: the gate works · the line
// moves. An intent row → intakeIntentOnce with its DEFAULT decompose and dispatch (the class rides the envelope
// onto the task, the task is tied to the holding's project as every intake does) → runWorkerOnce
// drained by drainTasks — the resident's own loop, with the default executor and the default QA judge, so a
// chain the classifier splits runs in dependency order exactly as the company would run it: staffing, the hook's pre-gate, the seat's run, the
// post-gate, and — the post-gate passing — the critical gate: Opus writes, Sol 6.1 and Astra 6 try to
// refute through the Codex CLI on the subscription lane, the author revises once, one decision_log row.
//
// The classification is the one step held still: measured 2026-10-09, the real classifier split the same
// intent once into one task and once into a five-task chain whose strategy task waited on research tasks that
// failed the knowledge-shelf standard — the gate was never reached (evidence/gate-live-3*, -4*). The run that
// went through the real classifier and reached the gate is evidence/gate-live-2-old-judges.log. Here the
// intent is classified as what it is, one strategy task, so the run proves the gate and nothing else.
//
// It costs real subscription quota and takes minutes, so it runs only when asked: DXB_LIVE_GATE=1. Before
// it sweeps what it wrote it prints every row of the run, whole, as one JSON line (GATE_EVIDENCE) — the
// record a reader takes instead of the engine, which is left as it was found.

const LIVE = process.env.DXB_LIVE_GATE === "1";
const ledgerScope = watchLedgers(() => getDb());
// A chain that waits in the queue raises the engine-wide queue-age alert, tied to no task — measured
// 2026-10-09 when a stopped run left one behind and the battery's bench ruler went red. Taken back here.
const sideAlerts = watchSideAlerts(() => getDb());
const taskIds: string[] = [];
let intentId: string | null = null;
const WORKER = "b51-gate-live";

afterAll(async () => {
  if (!LIVE) return closeDb();
  const db = getDb();
  if (taskIds.length > 0) {
    // the ladder may have born children of these tasks — they are this run's too
    const kids = await sql<{ id: string }>`
      WITH RECURSIVE t AS (SELECT id FROM tasks WHERE id = ANY(${taskIds}::uuid[])
                           UNION SELECT c.id FROM tasks c JOIN t ON c.parent_task_id = t.id)
      SELECT id FROM t`.execute(db);
    for (const k of kids.rows) if (!taskIds.includes(k.id)) taskIds.push(k.id);
    const runs = db.selectFrom("agent_runs").select("id").where("task_id", "in", taskIds);
    await db.deleteFrom("tool_calls").where("run_id", "in", runs).execute();
    await db.deleteFrom("file_changes").where("run_id", "in", runs).execute();
    await db.deleteFrom("hook_violations").where("run_id", "in", runs).execute();
    await db.deleteFrom("alerts").where("run_id", "in", runs).execute();
    await db.deleteFrom("alerts").where("task_id", "in", taskIds).execute();
    await sql`DELETE FROM decision_log WHERE run_id IN (SELECT id FROM agent_runs WHERE task_id = ANY(${taskIds}::uuid[]))`.execute(db);
    await sql`DELETE FROM audit_log WHERE task_id = ANY(${taskIds}::uuid[])`.execute(db);
    await sql`DELETE FROM cost_ledger WHERE task_id = ANY(${taskIds}::uuid[])`.execute(db);
    await db.deleteFrom("agent_runs").where("task_id", "in", taskIds).execute();
    await db.deleteFrom("task_events").where("task_id", "in", taskIds).execute();
    // a strategy task that passes QA waits at his approval gate — its approval row is this run's too
    const approvals = db.selectFrom("approvals").select("id").where("task_id", "in", taskIds);
    await db.deleteFrom("outbox").where("approval_id", "in", approvals).execute();
    await db.deleteFrom("decision_log").where("approval_id", "in", approvals).execute();
    await db.deleteFrom("approvals").where("task_id", "in", taskIds).execute();
    await db.deleteFrom("tasks").where("id", "in", taskIds).execute();
  }
  if (intentId) await sql`DELETE FROM intents WHERE id = ${intentId}::uuid`.execute(db);
  await ledgerScope.sweep({
    decisions: [
      { decidedBy: "orchestrator:dispatch", decision: "task_plan" },
      { decidedBy: "orchestrator", decision: "critical_gate" },
      { decidedBy: WORKER },
      { decidedBy: "orchestrator:qa" },
      { decidedBy: "orchestrator:escalate" },
    ],
  });
  await sideAlerts.sweep();
  await closeDb();
});

/** Every row the run left, whole — read before the sweep. */
async function evidence(taskId: string) {
  const db = getDb();
  const rows = async (q: ReturnType<typeof sql>) => (await q.execute(db)).rows;
  return {
    task: await rows(sql`SELECT id, department, agent_id, task_class, model_tier, status, objective, result, feedback, created_at, updated_at FROM tasks WHERE id = ${taskId}::uuid`),
    events: await rows(sql`SELECT event, from_status, to_status, actor, payload, created_at FROM task_events WHERE task_id = ${taskId}::uuid ORDER BY created_at, id`),
    runs: await rows(sql`SELECT * FROM agent_runs WHERE task_id = ${taskId}::uuid ORDER BY started_at`),
    decisions: await rows(sql`SELECT d.* FROM decision_log d WHERE d.run_id IN (SELECT id FROM agent_runs WHERE task_id = ${taskId}::uuid) OR (d.decided_by = ${WORKER}) ORDER BY d.id`),
    gate_rows: await rows(sql`SELECT * FROM decision_log WHERE decision = 'critical_gate' AND run_id IN (SELECT id FROM agent_runs WHERE task_id = ${taskId}::uuid)`),
    hook_violations: await rows(sql`SELECT policy_id, gate, detail, action_taken, created_at FROM hook_violations WHERE run_id IN (SELECT id FROM agent_runs WHERE task_id = ${taskId}::uuid)`),
    cost: await rows(sql`SELECT * FROM cost_ledger WHERE task_id = ${taskId}::uuid`),
  };
}

describe.skipIf(!LIVE)("B51 — the critical gate, once, along the real path (live)", () => {
  it(
    "a strategy task reaches the gate, one critical_gate row per run",
    async () => {
      const db = getDb();
      // The intake claims the OLDEST received intent: this one must be the only one waiting.
      const waiting = await sql<{ n: number }>`SELECT count(*)::int AS n FROM intents WHERE status = 'received' AND source <> 'voice'`.execute(db);
      expect(waiting.rows[0]?.n).toBe(0);
      const born = await sql<{ id: string }>`
        INSERT INTO intents (text, lang, source)
        VALUES (${"Decide the holding's strategy for its first continuous-revenue line next quarter: a paid " +
          "Turkish-language newsletter on applied AI, or a B2B AI-automation service for small businesses. " +
          "One decision, three reasons, the main risk, and the first week's single step; mark any figure " +
          "you cannot source as a [placeholder]."}, 'en', 'dashboard')
        RETURNING id`.execute(db);
      intentId = born.rows[0]!.id;

      const intake = await intakeIntentOnce({
        classifyFn: async (text) =>
          ClassifiedIntent.parse({
            intent_summary: text,
            task_class: "strategy",
            departments: ["strategy"],
            approval_class: "internal",
            complexity: "single",
          }),
      });
      console.log(`INTAKE ${JSON.stringify(intake)}`);
      expect(intake.processed && intake.status).toBe("dispatched");
      if (!intake.processed || intake.status !== "dispatched") return;
      taskIds.push(...intake.taskIds);
      const tasks = await db.selectFrom("tasks").select(["id", "department", "task_class"]).where("id", "in", intake.taskIds).execute();
      console.log(`TASKS ${JSON.stringify(tasks)}`);
      const gated = tasks.find((t) => t.task_class === "strategy");
      expect(gated, "the classifier routed the intent as strategy").toBeDefined();
      const taskId = gated!.id;

      // The resident's loop, a pass at a time, until the strategy task has left the queue and been judged
      // (or a ceiling — a chain of five real runs and their QA verdicts fits well inside it).
      const departments = [...new Set(tasks.map((t) => t.department))];
      const passes: unknown[] = [];
      for (let i = 0; i < 16; i++) {
        passes.push(await drainTasks({ workerId: WORKER, departments, execCap: 1, reviewCap: 3 }));
        const s = await db.selectFrom("tasks").select("status").where("id", "=", taskId).executeTakeFirstOrThrow();
        if (!["queued", "claimed", "running"].includes(s.status)) break;
      }
      const chain = await db.selectFrom("tasks").select(["id", "department", "task_class", "status"]).where("id", "in", taskIds).execute();
      console.log(`CHAIN ${JSON.stringify({ passes, chain })}`);
      const run = { taskId, passes: passes.length };
      const ev = await evidence(taskId);
      console.log(`GATE_EVIDENCE ${JSON.stringify({ run, ...ev })}`);
      // Two readings, printed apart (Fable's cross-read): the gate FIRED (a row) · the panel ANSWERED (no
      // challenger 'unavailable'). A dead panel is recorded and the work goes on (§4e), so it does not fail
      // this test — it is printed as what it is.
      const panel = String((ev.gate_rows[0] as { rationale?: string } | undefined)?.rationale ?? "").match(/challengers: ([^;]*)/)?.[1] ?? "none";
      console.log(`${/unavailable|none/.test(panel) ? "PANEL ABSENT" : "PANEL ANSWERED"} ${panel}`);

      expect((ev.task[0] as { task_class: string }).task_class).toBe("strategy");
      // One gate round per run (§4e). A run QA turns back is requeued by the ladder, and its next attempt is a
      // new deliverable that meets the gate again — measured 2026-10-09: two runs, two gate rows. A run that
      // dies before the post-gate passes (an SDK error, an ESCALATE) never reaches the gate and leaves no row.
      // So: every SUCCEEDED run of the strategy task has exactly one gate row, and there is at least one.
      const runIds = (ev.runs as Array<{ id: string; status: string }>).filter((r) => r.status === "succeeded").map((r) => r.id).sort();
      expect(runIds.length).toBeGreaterThan(0);
      expect((ev.gate_rows as Array<{ run_id: string }>).map((g) => g.run_id).sort()).toEqual(runIds);
    },
    50 * 60_000,
  );
});
