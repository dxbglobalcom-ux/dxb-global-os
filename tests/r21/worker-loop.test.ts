// R2.1 verification — resident worker loop (external audit F-01): one drain
// pass moves every stage the OS owns, no manual runWorkerOnce/qa/escalate
// call anywhere in the production chain.
//   1. queued → claim + execute → review (agent_runs born, claimed event
//      actor = resident worker id)
//   2. review (confident) → QA pass → done — TERMINAL, approval_class 'none'
//   3. review (confident) → QA fail → failed → ladder requeues in the SAME
//      drain (leg order: review before failed picker)
//   4. review (low confidence <0.6) → ladder path, QA evaluator NEVER called
//   5. failed with exhausted ladder (5 fails) → blocked once; next drain
//      excludes it (no re-chew)
//   6. execCap bounds the execution leg
// Suite deletes ONLY what it creates (r21t department watermark; E9.3 rule).
// Hook pinned OFF: the gate assembly is E10.2-proven; this suite proves the
// LOOP. Departments are injected — the drain's department scoping doubles as
// suite isolation (production omits the arg and spans all departments).
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";
import { drainTasks } from "../../packages/orchestrator/src/worker-loop.js";
import type { Executor } from "../../packages/orchestrator/src/worker-shim.js";
import { pinHookOff, sweepByDepartment } from "../helpers/suite-scope.js";

const db = () => getDb();
const M = "r21t";
const WORKER = `${M}-resident`;

pinHookOff(db);

let seq = 0;
async function makeTask(
  status: string,
  overrides: Record<string, unknown> = {},
): Promise<{ id: string; department: string }> {
  seq += 1;
  const department = `${M}-d${seq}`;
  const row = await db()
    .insertInto("tasks")
    .values({
      department,
      objective: `${M} loop probe ${seq}`,
      output_contract: "one line of probe text",
      model_tier: "L4",
      approval_class: "none",
      budget_max_tokens: 1000,
      priority: 5,
      status,
      ...overrides,
    } as never)
    .returning(["id", "department"])
    .executeTakeFirstOrThrow();
  return row;
}

async function taskStatus(id: string): Promise<string> {
  const r = await db()
    .selectFrom("tasks")
    .select("status")
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
  return r.status;
}

/** Append n failed transitions so failCount(task) = n (ladder fuel). */
async function seedFailEvents(taskId: string, n: number): Promise<void> {
  for (let i = 0; i < n; i++) {
    await db()
      .insertInto("task_events")
      .values({
        task_id: taskId,
        event: "transition",
        from_status: "running",
        to_status: "failed",
        actor: WORKER,
        payload: JSON.stringify({ error: `probe fail ${i + 1}` }),
      })
      .execute();
  }
}

const okExecutor: Executor = async () => ({
  result: { text: "probe deliverable" },
  confidence: 0.92,
});

afterAll(async () => {
  await sweepByDepartment(db(), M);
  await closeDb();
});

describe("R2.1 resident worker loop (audit F-01 drain semantics)", () => {
  it("leg 1: queued → claimed by the loop → executed → review, agent_runs born", async () => {
    const t = await makeTask("queued");

    // reviewCap 0: freeze the drain at the execution leg — the review leg
    // otherwise QAs the fresh row with the REAL default evaluator (LLM).
    const res = await drainTasks({
      workerId: WORKER,
      departments: [t.department],
      execute: okExecutor,
      reviewCap: 0,
    });

    expect(res.executed).toBe(1);
    expect(await taskStatus(t.id)).toBe("review");

    const claimed = await sql<{ actor: string }>`
      SELECT actor FROM task_events
      WHERE task_id = ${t.id}::uuid AND event = 'claimed'`.execute(db());
    expect(claimed.rows[0]?.actor).toBe(WORKER);

    const runs = await sql<{ status: string }>`
      SELECT status FROM agent_runs WHERE task_id = ${t.id}::uuid`.execute(db());
    expect(runs.rows.length).toBe(1);
    expect(runs.rows[0].status).toBe("succeeded");
  });

  it("leg 2: confident review → QA pass → done (terminal, approval_class none)", async () => {
    const t = await makeTask("review", {
      result: JSON.stringify({ text: "probe deliverable", confidence: 0.92 }),
    });

    const res = await drainTasks({
      workerId: WORKER,
      departments: [t.department],
      evaluate: async () => ({ pass: true, confidence: 0.95, notes: "contract met" }),
    });

    expect(res.reviewed).toBe(1);
    expect(await taskStatus(t.id)).toBe("done");
  });

  it("leg 2→3: QA fail → failed → ladder requeues in the same drain", async () => {
    const t = await makeTask("review", {
      result: JSON.stringify({ text: "weak deliverable", confidence: 0.9 }),
    });

    const res = await drainTasks({
      workerId: WORKER,
      departments: [t.department],
      evaluate: async () => ({ pass: false, confidence: 0.9, notes: "contract missed" }),
    });

    // review → failed (qa-fail) then the failed picker (runs after) requeues:
    // fail_count 1 → retry-same-tier.
    expect(res.reviewed).toBe(1);
    expect(res.escalated).toBe(1);
    expect(await taskStatus(t.id)).toBe("queued");
  });

  it("leg 2 routing: low-confidence review feeds the ladder, QA never called", async () => {
    const t = await makeTask("review", {
      result: JSON.stringify({ text: "unsure deliverable", confidence: 0.4 }),
    });
    // convertLowConfidence reads the review-transition event payload.
    await db()
      .insertInto("task_events")
      .values({
        task_id: t.id,
        event: "transition",
        from_status: "running",
        to_status: "review",
        actor: WORKER,
        payload: JSON.stringify({ confidence: 0.4 }),
      })
      .execute();

    let qaCalled = false;
    const res = await drainTasks({
      workerId: WORKER,
      departments: [t.department],
      evaluate: async () => {
        qaCalled = true;
        return { pass: true, confidence: 1, notes: "must not run" };
      },
    });

    expect(qaCalled).toBe(false);
    expect(res.escalated).toBe(1);
    // review → failed (low-confidence) → ladder fail_count 1 → requeued.
    expect(await taskStatus(t.id)).toBe("queued");
  });

  it("leg 3: exhausted ladder → blocked once; next drain excludes the blocked task", async () => {
    const t = await makeTask("failed");
    await seedFailEvents(t.id, 5);

    const first = await drainTasks({ workerId: WORKER, departments: [t.department] });
    expect(first.escalated).toBe(1);
    expect(await taskStatus(t.id)).toBe("failed"); // blocked keeps 'failed'

    const blocked = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM audit_log
      WHERE task_id = ${t.id}::uuid AND action = 'task.blocked'`.execute(db());
    expect(blocked.rows[0].n).toBe(1);

    const second = await drainTasks({ workerId: WORKER, departments: [t.department] });
    expect(second.escalated).toBe(0); // picker excludes blocked tasks
  });

  it("execCap bounds the execution leg", async () => {
    const a = await makeTask("queued");
    const b = await makeTask("queued", { department: a.department });
    const c = await makeTask("queued", { department: a.department });

    const res = await drainTasks({
      workerId: WORKER,
      departments: [a.department],
      execute: okExecutor,
      execCap: 1,
      reviewCap: 0, // same freeze as leg 1 — no live-LLM QA in this suite
    });

    expect(res.executed).toBe(1);
    const statuses = await Promise.all([taskStatus(a.id), taskStatus(b.id), taskStatus(c.id)]);
    expect(statuses.filter((s) => s === "queued").length).toBe(2);
    expect(statuses.filter((s) => s === "review").length).toBe(1);
  });
});
