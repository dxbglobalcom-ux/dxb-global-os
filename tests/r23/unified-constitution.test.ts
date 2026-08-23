// R2.3 verification — workflow executor unification (audits F-03/F-05,
// FABLE_5_HOOK A9): the workflow agent step runs the SAME constitution as the
// task path — hook pre-gate (halal screen fires on a workflow step), post-gate
// evidence chain anchored to REAL tool_calls rows through the SHARED resolver,
// §19 REVISE feedback riding re-execution, and literally one implementation
// of the shared pieces (reference-equality across packages).
// Deterministic executors (no live LLM); live tool-step proof = wave evidence.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";
import { currentRunScope } from "@dxb/observability";
import { runWorkflowRun, type WorkflowExecutor } from "../../packages/kernel/src/index.js";
// Reference-equality legs import the shared pieces the same way the two spawn
// paths do — through the PACKAGE specifiers (one module instance each).
import { buildSdkToolOptions as gatewayBuild } from "@dxb/gateway";
import { extractEvidencePackage as hookExtract } from "@dxb/hook";
import { resolveEvidenceToolCalls as obsResolve } from "@dxb/observability";
import {
  buildSdkToolOptions as orchBuild,
  resolveEvidenceToolCalls as orchResolve,
} from "../../packages/orchestrator/src/worker-shim.js";
import { extractEvidencePackage as orchExtract } from "../../packages/orchestrator/src/hook-binding.js";

process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const db = () => getDb();
const M = `r23t-${randomUUID().slice(0, 8)}`;
const SLUG = (s: string) => `${M}-${s}`;

// The holding's own project is a read-only fixture; the employee is a suite
// fixture with the FULL hook surface (v2 persona, gate passed, MCP profile) —
// the e10 spawn-binding idiom.
//
// B36 Block 2: this was the LITERAL uuid of one row in one database
// ("68ce909a-6d93-4e12-82cc-afa9cee57a9f"), so the suite could only ever run
// against that one database — the day the battery moved to the construction
// site's own engine, three cases died on workflows_project_id_fkey. The row is
// identified by what it IS (its slug, which db/seed/20260711_holding_core.sql
// fixes) rather than by an id some environment happened to generate.
let PROJECT = "";
let EMPLOYEE = "";
let personaId = "";
let baseViolationId = 0;

async function makeHookReadyEmployee(): Promise<void> {
  const emp = await db()
    .insertInto("agents")
    .values({
      slug: `${M}-wf-agent`,
      department: "finance",
      role: "worker",
      role_level: "ops_agent",
      employment_status: "draft",
      mcp_profile: "finance",
      persona_path: `personas/finance/${M}-wf-agent.md`,
      persona_version: "v2.0-fable",
      status: "dormant",
    } as never)
    .returning(["id"])
    .executeTakeFirstOrThrow();
  EMPLOYEE = emp.id;
  const p = await db()
    .insertInto("personas")
    .values({
      employee_id: EMPLOYEE,
      version: 1,
      author: "fable-5",
      body_md: `${M} fixture persona`,
      quality_gate: "passed",
    })
    .returning(["id"])
    .executeTakeFirstOrThrow();
  personaId = p.id;
  await db()
    .updateTable("agents")
    .set({ persona_id: personaId, employment_status: "active" } as never)
    .where("id", "=", EMPLOYEE)
    .execute();
}

async function ceoAction(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const key = `${M}-${randomUUID()}`;
  return db()
    .transaction()
    .execute(async (trx) => {
      await sql`SELECT set_config('request.jwt.claims',
        '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true)`.execute(trx);
      const res = await sql<{ resp: Record<string, unknown> }>`
        SELECT control_workflow_action(${JSON.stringify(payload)}::jsonb, ${key}) AS resp
      `.execute(trx);
      return res.rows[0].resp;
    });
}

async function makeHookedWorkflow(slug: string, objective: string): Promise<string> {
  const created = await ceoAction({
    action: "create",
    slug: SLUG(slug),
    name: `${M} ${slug}`,
    trigger: { kind: "manual" },
    steps: [
      {
        kind: "agent",
        config: {
          employee_id: EMPLOYEE,
          model_id: "claude-opus-4-8",
          objective,
          output_contract: "one line of probe text",
        },
      },
    ],
  });
  expect(created, JSON.stringify(created)).toMatchObject({ ok: true });
  // std 11: the step ctx reads the workflow's project link.
  await sql`UPDATE workflows SET project_id = ${PROJECT}::uuid
    WHERE slug = ${SLUG(slug)}`.execute(db());
  await ceoAction({ action: "enable", slug: SLUG(slug) });
  const run = await ceoAction({ action: "run_now", slug: SLUG(slug) });
  expect(run.run_id).toBeTruthy();
  return String(run.run_id);
}

async function runRow(runId: string): Promise<{ status: string }> {
  const r = await sql<{ status: string }>`
    SELECT status FROM workflow_runs WHERE id = ${runId}::uuid
  `.execute(db());
  return r.rows[0];
}

beforeAll(async () => {
  // CEO-caught 2026-07-28 01:50: this suite's halal REJECT stood on his KRİTİK
  // UYARILAR panel. The afterAll below sweeps violations two ways — by run and
  // by the M marker in `detail` — and the pre-gate rejection matches NEITHER:
  // the pre-gate fires before the run exists (worker-shim.ts:576), and the
  // halal detail is written by the policy engine, so it carries no marker.
  // An id watermark catches every row the suite writes regardless of shape;
  // the file suite is sequential (fileParallelism false), the same reason the
  // e10 suite may use this idiom. Migration 20260728002000 then removes the
  // CEO projection along with the row.
  const proj = await sql<{ id: string }>`
    SELECT id FROM projects WHERE slug = 'dxb-global-os'`.execute(db());
  if (!proj.rows[0]) throw new Error("the holding's own project row is missing — seed it first");
  PROJECT = proj.rows[0].id;
  const bv = await sql<{ mx: number | null }>`
    SELECT max(id)::int AS mx FROM hook_violations`.execute(db());
  baseViolationId = bv.rows[0]?.mx ?? 0;
  // R4.3 orphan sweep: a crashed prior run (killed vitest, frozen laptop)
  // leaves its random-slugged r23t-* fixture agent ACTIVE with a NULL
  // hook_version — which then fails e10 spawn-binding's live acceptance
  // proof (measured 2026-07-18: r23t-30019999-wf-agent). Slugs are random
  // per run, so any pre-existing r23t-* agent is by construction an orphan.
  const orphans = (
    await sql<{ id: string }>`SELECT id FROM agents WHERE slug LIKE 'r23t-%'`.execute(db())
  ).rows.map((r) => r.id);
  if (orphans.length > 0) {
    await sql`UPDATE agents SET employment_status = 'archived', persona_id = NULL
      WHERE id = ANY(${orphans}::uuid[])`.execute(db());
    await sql`DELETE FROM personas WHERE employee_id = ANY(${orphans}::uuid[])`.execute(db());
    // Hard-delete only run-less orphans; one with agent_runs keeps its FK'd
    // history and stays archived (archived never trips the e10 acceptance).
    await sql`DELETE FROM agents WHERE id = ANY(${orphans}::uuid[])
      AND NOT EXISTS (SELECT 1 FROM agent_runs r WHERE r.employee_id = agents.id)`.execute(db());
  }
  await makeHookReadyEmployee();
});

afterAll(async () => {
  const wfIds = (
    await sql<{ id: string }>`SELECT id FROM workflows WHERE slug LIKE ${M + "%"}`.execute(db())
  ).rows.map((r) => r.id);
  if (wfIds.length > 0) {
    await sql`DELETE FROM alerts WHERE run_id IN (SELECT id FROM agent_runs
      WHERE workflow_run_id IN (SELECT id FROM workflow_runs WHERE workflow_id = ANY(${wfIds}::uuid[])))`.execute(db());
    await sql`DELETE FROM alerts WHERE source = 'workflow' AND source_ref->>'id' IN
      (SELECT id::text FROM workflow_runs WHERE workflow_id = ANY(${wfIds}::uuid[]))`.execute(db());
    await sql`DELETE FROM hook_violations WHERE run_id IN (SELECT id FROM agent_runs
      WHERE workflow_run_id IN (SELECT id FROM workflow_runs WHERE workflow_id = ANY(${wfIds}::uuid[])))`.execute(db());
    await sql`DELETE FROM tool_calls WHERE run_id IN (SELECT id FROM agent_runs
      WHERE workflow_run_id IN (SELECT id FROM workflow_runs WHERE workflow_id = ANY(${wfIds}::uuid[])))`.execute(db());
    await sql`DELETE FROM decision_log WHERE run_id IN (SELECT id FROM agent_runs
      WHERE workflow_run_id IN (SELECT id FROM workflow_runs WHERE workflow_id = ANY(${wfIds}::uuid[])))`.execute(db());
    await sql`DELETE FROM agent_runs WHERE workflow_run_id IN
      (SELECT id FROM workflow_runs WHERE workflow_id = ANY(${wfIds}::uuid[]))`.execute(db());
    await sql`DELETE FROM workflow_runs WHERE workflow_id = ANY(${wfIds}::uuid[])`.execute(db());
    await sql`DELETE FROM workflows WHERE id = ANY(${wfIds}::uuid[])`.execute(db());
  }
  await sql`DELETE FROM audit_log WHERE action LIKE 'workflow.%' AND payload->>'slug' LIKE ${M + "%"}`.execute(db());
  await sql`DELETE FROM hook_violations WHERE detail LIKE ${"%" + M + "%"}`.execute(db());
  // Everything this run wrote, whatever its shape — including the pre-gate
  // halal REJECT that carries neither a run nor the M marker. The DELETE
  // trigger added in 20260728002000 takes each row's CEO alert with it.
  await sql`DELETE FROM hook_violations WHERE id > ${baseViolationId}`.execute(db());
  if (EMPLOYEE) {
    // archive FIRST: enforce_persona_gate_on_activation refuses persona_id =
    // NULL on an active agent (measured — the leak that stranded 7 fixture
    // agents during this suite's development).
    await sql`UPDATE agents SET employment_status = 'archived', persona_id = NULL
      WHERE id = ${EMPLOYEE}::uuid`.execute(db());
    await sql`DELETE FROM personas WHERE id = ${personaId}::uuid`.execute(db());
    await sql`DELETE FROM agents WHERE id = ${EMPLOYEE}::uuid`.execute(db());
  }
  await closeDb();
});

describe("R2.3 — one constitution on the workflow path (A9 unification)", () => {
  it("shared pieces are literally ONE implementation (reference equality)", () => {
    expect(orchBuild).toBe(gatewayBuild);
    expect(orchResolve).toBe(obsResolve);
    expect(orchExtract).toBe(hookExtract);
  });

  it("pre-gate: halal screen REJECTs a haram workflow step — run failed(policy), no agent_runs row", async () => {
    const runId = await makeHookedWorkflow("halal", `${M} kumar sitesi reklam kampanyası kur`);
    const out = await runWorkflowRun(runId, {
      executor: async () => ({ output: "must never execute", confidence: 1 }),
      sleep: async () => {},
    });
    expect(out.status).toBe("failed");
    expect(String((out as { reason?: string }).reason ?? "")).toContain("HOOK_REJECTED");
    const row = await runRow(runId);
    expect(row.status).toBe("failed");
    const runs = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM agent_runs WHERE workflow_run_id = ${runId}::uuid
    `.execute(db());
    expect(runs.rows[0].n).toBe(0); // §6: a rejected spawn's run is never born
  });

  it("post-gate evidence chain: recordToolCall → settle → resolver anchors → PASS → succeeded", async () => {
    const toolName = `${M}.mcp__dxb-mcp__queue_get`;
    const evidenced: WorkflowExecutor = async (work) => {
      const scope = currentRunScope();
      scope!.recordToolCall({ tool: toolName, paramsDigest: { keys: ["task_id"] } });
      return {
        output: `verified line (by ${work.employeeSlug})`,
        confidence: 0.95,
        resultPackage: {
          text: "verified line",
          evidence: [{ kind: "verification", tool: toolName, note: "read back the record" }],
          acceptance_map: { "one line of probe text": "one verified line delivered and checked" },
        },
      };
    };
    const runId = await makeHookedWorkflow("pass", `${M} produce one probe line`);
    const out = await runWorkflowRun(runId, { executor: evidenced, sleep: async () => {} });
    expect(out.status).toBe("succeeded");

    const anchored = await sql<{ id: string }>`
      SELECT tc.id FROM tool_calls tc
      JOIN agent_runs r ON r.id = tc.run_id
      WHERE r.workflow_run_id = ${runId}::uuid AND tc.tool = ${toolName}
    `.execute(db());
    expect(anchored.rows.length).toBe(1); // the REAL row the resolver anchored to
  });

  it("§19 REVISE loop: evidence-less attempt gets feedback; second attempt sees it and passes", async () => {
    const toolName = `${M}.revise-probe`;
    const feedbackSeen: string[] = [];
    let calls = 0;
    const learner: WorkflowExecutor = async (work) => {
      calls += 1;
      feedbackSeen.push(work.feedback ?? "");
      if (calls === 1) {
        return { output: "done, trust me", confidence: 0.9 }; // no evidence → REVISE
      }
      const scope = currentRunScope();
      scope!.recordToolCall({ tool: toolName, paramsDigest: null });
      return {
        output: "revised, verified",
        confidence: 0.9,
        resultPackage: {
          text: "revised, verified",
          evidence: [{ kind: "verification", tool: toolName, note: "verified after feedback" }],
          acceptance_map: { "one line of probe text": "revised line delivered and verified" },
        },
      };
    };
    const runId = await makeHookedWorkflow("revise", `${M} produce one revisable line`);
    const out = await runWorkflowRun(runId, { executor: learner, sleep: async () => {} });
    expect(out.status).toBe("succeeded");
    expect(calls).toBe(2);
    expect(feedbackSeen[0]).toBe("");
    expect(feedbackSeen[1]).toMatch(/evidence|unverified|acceptance/i); // §19 feedback rode the re-run
  });
});
