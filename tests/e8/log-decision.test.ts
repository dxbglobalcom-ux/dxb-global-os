import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { pinHookOff } from "../helpers/suite-scope.js";
import { logDecision } from "@dxb/observability";
import { dispatch } from "../../packages/orchestrator/src/dispatch.js";
import { escalate } from "../../packages/orchestrator/src/escalate.js";
import { qa } from "../../packages/orchestrator/src/qa.js";
import { runWorkerOnce } from "../../packages/orchestrator/src/worker-shim.js";

// E8.2 verification (roadmap: "decision_log 8 alan dolu satır"; AUDIT §10/§20).
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const db = () => getDb();
const probeDecisionIds: string[] = [];
const probeTaskIds: string[] = [];

afterAll(async () => {
  if (probeDecisionIds.length > 0) {
    await sql`DELETE FROM decision_log WHERE id = ANY(${probeDecisionIds}::bigint[])`.execute(db());
  }
  if (probeTaskIds.length > 0) {
    await sql`DELETE FROM decision_log WHERE rationale LIKE '%e8.2 probe%' OR rationale LIKE '%E8.2 probe%'`.execute(db());
    await sql`DELETE FROM tool_calls WHERE run_id IN (SELECT id FROM agent_runs WHERE task_id = ANY(${probeTaskIds}::uuid[]))`.execute(db());
    // E8.4b: failed probe runs raise alerts rows (FK) — sweep before the runs.
    await sql`DELETE FROM alerts WHERE task_id = ANY(${probeTaskIds}::uuid[]) OR run_id IN (SELECT id FROM agent_runs WHERE task_id = ANY(${probeTaskIds}::uuid[]))`.execute(db());
    await sql`DELETE FROM agent_runs WHERE task_id = ANY(${probeTaskIds}::uuid[])`.execute(db());
    await sql`DELETE FROM task_events WHERE task_id = ANY(${probeTaskIds}::uuid[])`.execute(db());
    // approvals (and their outbox rows) referencing probe tasks must go
    // before the tasks (FK chain outbox→approvals→tasks) — the missing legs
    // that aborted this sweep silently (2026-07-25 triage).
    await sql`DELETE FROM outbox WHERE approval_id IN
                (SELECT id FROM approvals WHERE task_id = ANY(${probeTaskIds}::uuid[]))`.execute(db());
    await sql`DELETE FROM approvals WHERE task_id = ANY(${probeTaskIds}::uuid[])`.execute(db());
    await sql`DELETE FROM tasks WHERE id = ANY(${probeTaskIds}::uuid[])`.execute(db());
  }
  await closeDb();
});

// Compile gate (AUDIT §20 "eksik alan derlenmez"): these MUST stay type errors.
// If either line stops erroring, the 8-field contract regressed.
// @ts-expect-error — rationale omitted: the record must not compile
const _missingRationale: Parameters<typeof logDecision>[0] = {
  runId: null,
  decidedBy: "x",
  decision: "x",
  dataUsed: [],
  alternatives: null,
  confidence: null,
  risk: null,
};
// @ts-expect-error — alternatives omitted: the record must not compile
const _missingAlternatives: Parameters<typeof logDecision>[0] = {
  runId: null,
  decidedBy: "x",
  decision: "x",
  rationale: "x",
  dataUsed: [],
  confidence: null,
  risk: null,
};
void _missingRationale;
void _missingAlternatives;

async function dispatchProbe(objective: string, department = "engineering"): Promise<string> {
  const { taskIds } = await dispatch([
    {
      department,
      objective,
      output_contract: "single line of probe text",
      model_tier: "L4",
      approval_class: "none",
      budget: { max_tokens: 1000, max_cost_eur: 0.1 },
      priority: 5,
      parent_task_id: null,
      deps: [],
    } as never,
  ]);
  probeTaskIds.push(...taskIds);
  return taskIds[0];
}

// E10.2: this suite predates the hook — pin the §22 flag off for its
// lifetime (restored + alert swept in the helper afterAll).
pinHookOff(() => getDb());

describe("E8.2 logDecision — the 8-field row", () => {
  it("writes a row with every field filled (AUDIT acceptance)", async () => {
    const res = await logDecision({
      runId: null,
      decidedBy: "orchestrator:test",
      decision: "workflow_branch",
      rationale: "E8.2 probe: full-field decision row",
      dataUsed: ["task_events", "tasks"],
      alternatives: { rejected: "the other branch" },
      confidence: 0.8,
      risk: "low",
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    probeDecisionIds.push(res.id);

    const row = await sql<Record<string, unknown>>`
      SELECT decided_by, decision, rationale, data_used, alternatives, confidence, risk, created_at
        FROM decision_log WHERE id = ${res.id}::bigint
    `.execute(db());
    const r = row.rows[0];
    expect(r.decided_by).toBe("orchestrator:test");
    expect(r.decision).toBe("workflow_branch");
    expect(r.rationale).toContain("E8.2 probe");
    expect(r.data_used).toEqual(["task_events", "tasks"]);
    expect(r.alternatives).toEqual({ rejected: "the other branch" });
    expect(Number(r.confidence)).toBe(0.8);
    expect(r.risk).toBe("low");
    expect(r.created_at).toBeTruthy(); // 8/8 fields present
  });

  it("never throws on a failed write; marks the task degraded_logging", async () => {
    const taskId = await dispatchProbe("E8.2 probe task for degraded logging marker");
    // Force a constraint failure: risk column has no constraint, so use an
    // impossible approval FK to break the INSERT.
    const res = await logDecision(
      {
        runId: null,
        decidedBy: "orchestrator:test",
        decision: "workflow_branch",
        rationale: "E8.2 probe: doomed write",
        dataUsed: [],
        alternatives: null,
        confidence: null,
        risk: null,
      },
      { approvalId: "00000000-0000-0000-0000-000000000001", taskId },
    );
    expect(res.ok).toBe(false);

    const marker = await sql<{ n: string }>`
      SELECT count(*) AS n FROM task_events
       WHERE task_id = ${taskId}::uuid AND event = 'degraded_logging'
    `.execute(db());
    expect(Number(marker.rows[0].n)).toBe(1);
  });
});

describe("E8.2 §10 call sites — decisions land where the code decides", () => {
  it("dispatch writes one task_plan decision per committed batch", async () => {
    await dispatchProbe("E8.2 probe task for the dispatch decision row");
    const row = await sql<{ id: string; rationale: string; data_used: string[] }>`
      SELECT id, rationale, data_used FROM decision_log
       WHERE decision = 'task_plan' AND decided_by = 'orchestrator:dispatch'
       ORDER BY id DESC LIMIT 1
    `.execute(db());
    probeDecisionIds.push(row.rows[0].id);
    expect(row.rows[0].rationale).toContain("E8.2 probe task for the dispatch decision row".slice(0, 40));
    expect(row.rows[0].data_used).toContain("task_envelopes");
  });

  it("escalate writes an escalation decision on requeue", async () => {
    const taskId = await dispatchProbe("E8.2 probe task for the escalation decision row", "finance");
    const failed = await runWorkerOnce({
      workerId: "e8-2-worker",
      departments: ["finance"],
      execute: async () => {
        throw new Error("E8.2 probe induced failure");
      },
    });
    expect(failed).toMatchObject({ claimed: true, status: "failed" });

    const result = await escalate(db(), taskId);
    expect(result).toMatchObject({ action: "requeued", ladder: "retry-same-tier" });

    const row = await sql<{ id: string; rationale: string; risk: string | null }>`
      SELECT id, rationale, risk FROM decision_log
       WHERE decision = 'escalation' AND decided_by = 'orchestrator:escalate'
       ORDER BY id DESC LIMIT 1
    `.execute(db());
    probeDecisionIds.push(row.rows[0].id);
    expect(row.rows[0].rationale).toContain("fail_count=1");
    expect(row.rows[0].rationale).toContain("retry-same-tier");
  });

  it("qa pass on an approval-class task writes approval_conversion", async () => {
    const { taskIds } = await dispatch([
      {
        department: "design",
        objective: "E8.2 probe task for the approval conversion row",
        output_contract: "single line of probe text",
        model_tier: "L4",
        approval_class: "outward",
        budget: { max_tokens: 1000, max_cost_eur: 0.1 },
        priority: 5,
        parent_task_id: null,
        deps: [],
      } as never,
    ]);
    probeTaskIds.push(...taskIds);
    const taskId = taskIds[0];

    const ran = await runWorkerOnce({
      workerId: "e8-2-worker",
      departments: ["design"],
      execute: async () => ({ result: { text: "probe deliverable" }, confidence: 0.95 }),
    });
    expect(ran).toMatchObject({ claimed: true, taskId, status: "review" });

    const outcome = await qa(taskId, async () => ({
      pass: true,
      confidence: 0.9,
      notes: "E8.2 probe: contract satisfied",
    }));
    expect(outcome.toStatus).toBe("awaiting_approval");

    const row = await sql<{ id: string; rationale: string }>`
      SELECT id, rationale FROM decision_log
       WHERE decision = 'approval_conversion' AND decided_by = 'orchestrator:qa'
       ORDER BY id DESC LIMIT 1
    `.execute(db());
    probeDecisionIds.push(row.rows[0].id);
    expect(row.rows[0].rationale).toContain("outward");
  });

  it("qa fail writes a workflow_branch decision with the verdict confidence", async () => {
    const taskId = await dispatchProbe("E8.2 probe task for the qa-fail branch row", "commerce");
    const ran = await runWorkerOnce({
      workerId: "e8-2-worker",
      departments: ["commerce"],
      execute: async () => ({ result: { text: "weak deliverable" }, confidence: 0.9 }),
    });
    expect(ran).toMatchObject({ claimed: true, taskId, status: "review" });

    const outcome = await qa(taskId, async () => ({
      pass: false,
      confidence: 0.3,
      notes: "E8.2 probe: contract missed",
    }));
    expect(outcome.toStatus).toBe("failed");

    const row = await sql<{ id: string; confidence: string; outcome: string }>`
      SELECT id, confidence, outcome FROM decision_log
       WHERE decision = 'workflow_branch' AND decided_by = 'orchestrator:qa'
       ORDER BY id DESC LIMIT 1
    `.execute(db());
    probeDecisionIds.push(row.rows[0].id);
    expect(Number(row.rows[0].confidence)).toBe(0.3);
    expect(row.rows[0].outcome).toBe("qa-fail");
  });
});
