import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
// NOT the src path: the hook package resolves "@dxb/shared" to dist — the
// suite must share THAT module instance (one getDb singleton) or closeDb in
// the fail-closed leg would close a different pool than the one the gates use.
import { closeDb, getDb } from "@dxb/shared";
import {
  checkConfidence,
  checkSpawn,
  invalidatePolicyCache,
  loadPolicies,
  monitorContext,
  monitorTokens,
  postTask,
  preTask,
  type HookCtx,
  type PostTaskResult,
} from "../../packages/hook/src/index.js";

// E10.1 verification — FABLE_5_HOOK_SPEC §20/§21 + roadmap acceptance:
//   policy violation → RED + decision_log row. Coverage: every one of the 17
//   standards' mechanisms has at least one RED and one PASS case (§20 34-case
//   base; std 9's mechanism IS the post-gate verdict itself — its RED/PASS
//   pair is the non-PASS/PASS verdict pair), evidence-less done → REVISE,
//   revision exhaust → ESCALATE (chain decision_log rows incl. the manager
//   hop + approval item), FAIL-CLOSED on DB loss, fn_hook_set_policy CEO
//   wall / idempotency twin / high-risk downgrade audit / NOT_FOUND,
//   invalid_policy reject, conflict → most-restrictive + alert, violations →
//   alerts trigger, seed proof (17 distinct standards), anon zero grant.
// Suite deletes ONLY what it creates (id watermarks; E9.3 incident rule).

const db = () => getDb();
const M = "e10t";

let baseViolationId = 0;
let baseDecisionId = 0;
let realMilestoneId: string | null = null;
let realProjectId: string | null = null;
let gatedEmployeeId: string | null = null;
let fxRunId: string;
let fxToolCallId: string;

/** CEO-context fn call (request.jwt.claims idiom, tests/e9). */
async function ceoSetPolicy(
  payload: Record<string, unknown>,
  key: string,
): Promise<Record<string, unknown>> {
  return db()
    .transaction()
    .execute(async (trx) => {
      await sql`SELECT set_config('request.jwt.claims',
        '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true)`.execute(trx);
      const res = await sql<{ resp: Record<string, unknown> }>`
        SELECT fn_hook_set_policy(${JSON.stringify(payload)}::jsonb, ${key}) AS resp
      `.execute(trx);
      return res.rows[0].resp;
    });
}

/** A ctx that PASSES every pre-gate check (each RED case breaks ONE thing). */
function goodCtx(overrides: Partial<HookCtx> = {}): HookCtx {
  return {
    employee: {
      id: null,
      slug: `${M}-employee`,
      department: "engineering",
      mcpProfile: "engineering",
      managerId: null,
      personaGate: "passed",
    },
    task: {
      id: null,
      objective: `${M} objective: verify the hook engine`,
      outputContract: "a verified verdict with evidence",
      budgetMaxTokens: null,
      budgetMaxCostEur: null,
      milestoneId: null,
      planRequired: false,
      requiresMemory: false,
    },
    project: realProjectId ? { id: realProjectId } : { id: randomUUID(), purpose: "test" },
    grants: null,
    requestedTools: null,
    budget: null,
    runId: null,
    actor: "system",
    ...overrides,
  };
}

/** A result package that PASSES every post-gate check. */
function goodResult(overrides: Partial<PostTaskResult> = {}): PostTaskResult {
  return {
    output: "a complete delivery with substance",
    evidence: [{ kind: "verification", note: "vitest run green" }],
    acceptanceMap: { "verified verdict": "postTask returned PASS with recorded evidence" },
    decisionsClaimed: 0,
    memoryWritten: false,
    ...overrides,
  };
}

async function violationsSince(id: number) {
  return db()
    .selectFrom("hook_violations")
    .selectAll()
    .where("id", ">", String(id))
    .orderBy("id")
    .execute();
}

beforeAll(async () => {
  // This suite drives `fn_hook_set_policy`, which is idempotent BY KEY: a key it
  // has already seen returns the recorded response and DOES NOT APPLY the change
  // (migration 20260714030000_e10_hook_engine.sql:231-236). The keys below are
  // constant, and until 2026-08-23 they were cleared only in afterAll — so a run
  // that never reached afterAll (killed, timed out, machine frozen) left them
  // behind, and the NEXT run's "§17 invalid policy JSON → gate REJECTS" case got
  // ok:true from a replay while the broken rule was never written. The gate then
  // correctly answered PASS and the case failed for a reason that had nothing to
  // do with the code under test. Measured 2026-08-23: reproduced on demand by
  // inserting one `e10t-invalid-rule` row. A suite may not inherit the residue of
  // a predecessor that was killed.
  await sql`DELETE FROM control_idempotency WHERE key LIKE ${M + "-%"}`.execute(db());
  const v = await sql<{ mx: number | null }>`SELECT max(id)::int AS mx FROM hook_violations`.execute(db());
  baseViolationId = v.rows[0]?.mx ?? 0;
  const d = await sql<{ mx: number | null }>`SELECT max(id)::int AS mx FROM decision_log`.execute(db());
  baseDecisionId = d.rows[0]?.mx ?? 0;
  const m = await sql<{ id: string; project_id: string }>`
    SELECT id, project_id FROM project_milestones LIMIT 1`.execute(db());
  realMilestoneId = m.rows[0]?.id ?? null;
  realProjectId = m.rows[0]?.project_id ?? null;
  const e = await sql<{ id: string }>`
    SELECT a.id FROM agents a
     WHERE EXISTS (SELECT 1 FROM personas p
                    WHERE p.employee_id = a.id AND p.quality_gate = 'passed')
     LIMIT 1`.execute(db());
  gatedEmployeeId = e.rows[0]?.id ?? null;
  // run + tool_calls fixture for the std 15 tool_call_proof leg.
  const run = await db()
    .insertInto("agent_runs")
    .values({ employee_id: null, task_id: null, error: M })
    .returning("id")
    .executeTakeFirstOrThrow();
  fxRunId = run.id;
  const tc = await db()
    .insertInto("tool_calls")
    .values({ run_id: fxRunId, tool: `${M}.verify` })
    .returning("id")
    .executeTakeFirstOrThrow();
  fxToolCallId = tc.id;
  invalidatePolicyCache();
});

afterAll(async () => {
  // Restore every policy this suite may have touched, sweep only own rows.
  for (const [id, severity, enabled] of [
    ["std.task_completeness", "block", true],
    ["std.no_shallow_output", "block", true],
    ["std.budget_fit", "block", true],
  ] as const) {
    await sql`UPDATE hook_policies
                 SET severity = ${severity}, enabled = ${enabled},
                     rule = CASE WHEN id = 'std.budget_fit'
                       THEN '{"check":"budget_fit","source":"cost_ledger","respect_hard_stop":true}'::jsonb
                       ELSE rule END
               WHERE id = ${id}`.execute(db());
  }
  // Sweep only THIS suite's alerts: engine calls without a run (':no-run')
  // happen only from tests; run-scoped rows use the fixture run. The old
  // unscoped delete wiped REAL wave alerts on every run (hygiene defect).
  await sql`DELETE FROM alerts WHERE source = 'hook'
              AND (dedup_key LIKE '%:no-run'
                   OR run_id = ${fxRunId}
                   OR dedup_key LIKE ${"%" + fxRunId})`.execute(db());
  // Sweep ONLY this suite's escalations (fixture run id) — the old unscoped
  // delete would have wiped the REAL 2026-07-18 wave escalation history; it
  // only survived because the missing outbox leg aborted the sweep (FK).
  // Order matters: outbox rows go before their approvals (FK).
  // Two probe shapes: run-scoped (fixture run) AND run-less (goodCtx has no
  // run — payload employee carries the e10t marker instead).
  await sql`DELETE FROM outbox WHERE approval_id IN
              (SELECT id FROM approvals WHERE action_type = 'hook_escalation'
                  AND (payload->>'run_id' = ${fxRunId}
                       OR payload->>'employee' LIKE ${M + "%"}))`.execute(db());
  await sql`DELETE FROM approvals WHERE action_type = 'hook_escalation'
              AND (payload->>'run_id' = ${fxRunId}
                   OR payload->>'employee' LIKE ${M + "%"})`.execute(db());
  // Own rows only, and until 2026-09-21 this line did not say so: `id >
  // watermark` deletes whatever ANY writer put there while the suite ran.
  // Proven by the adversarial pass that day — a foreign violation inserted
  // while the fixture run was alive was gone when the suite ended, and its
  // alert (swept by run, so kept) was left pointing at a row that no longer
  // exists. This suite's violations carry the fixture run, or no run at all
  // (the run-less probes above); a real writer always has a run of its own.
  await sql`DELETE FROM hook_violations
             WHERE id > ${baseViolationId}
               AND (run_id IS NULL OR run_id = ${fxRunId})`.execute(db());
  await sql`DELETE FROM decision_log
             WHERE id > ${baseDecisionId}
               AND (decided_by IN ('hook', ${M}) OR rationale LIKE ${"%" + M + "%"})`.execute(db());
  await sql`DELETE FROM tool_calls WHERE id = ${fxToolCallId}`.execute(db());
  await sql`DELETE FROM agent_runs WHERE id = ${fxRunId}`.execute(db());
  await sql`DELETE FROM control_idempotency WHERE key LIKE ${M + "-%"}`.execute(db());
  invalidatePolicyCache();
  await closeDb();
});

describe("seed (§21/§24)", () => {
  it("covers all 17 standards with at least one enabled rule", async () => {
    const res = await sql<{ n: number; d: number }>`
      SELECT count(*)::int AS n, count(DISTINCT standard_no)::int AS d
        FROM hook_policies`.execute(db());
    expect(res.rows[0].n).toBeGreaterThanOrEqual(17);
    expect(res.rows[0].d).toBe(17);
  });

  it("append-only + zero grant: anon/authenticated cannot write or execute", async () => {
    const res = await sql<{ p: boolean }>`SELECT
        has_table_privilege('authenticated', 'hook_violations', 'INSERT') OR
        has_table_privilege('authenticated', 'hook_violations', 'UPDATE') OR
        has_table_privilege('authenticated', 'hook_violations', 'DELETE') OR
        has_table_privilege('authenticated', 'hook_policies', 'UPDATE') OR
        has_table_privilege('anon', 'hook_violations', 'INSERT') OR
        has_function_privilege('anon', 'fn_hook_set_policy(jsonb, text)', 'EXECUTE') AS p
      `.execute(db());
    expect(res.rows[0].p).toBe(false);
  });
});

describe("pre-gate — 17-standard mechanisms (§2/§6)", () => {
  it("std 1 RED: missing output_contract → REJECT missing_acceptance + violation + decision_log (roadmap acceptance)", async () => {
    const before = await violationsSince(baseViolationId);
    const verdict = await preTask(goodCtx({ task: { ...goodCtx().task, outputContract: null } }));
    expect(verdict.verdict).toBe("REJECT");
    if (verdict.verdict !== "REJECT") return;
    expect(verdict.reason).toContain("missing_acceptance");
    const after = await violationsSince(baseViolationId);
    const mine = after.filter((v) => !before.some((b) => b.id === v.id));
    expect(mine).toHaveLength(1);
    expect(mine[0].policy_id).toBe("std.task_completeness");
    expect(mine[0].action_taken).toBe("rejected");
    // decision_log row — THE roadmap acceptance leg.
    const dl = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM decision_log
       WHERE id > ${baseDecisionId} AND decided_by = 'hook'
         AND decision = 'hook_reject' AND rationale LIKE '%std.task_completeness%'
    `.execute(db());
    expect(dl.rows[0].n).toBeGreaterThanOrEqual(1);
  });

  it("std 1 PASS: complete task passes and injects the project purpose (std 11)", async () => {
    const verdict = await preTask(
      goodCtx({ project: null, task: { ...goodCtx().task, milestoneId: realMilestoneId } }),
    );
    expect(verdict.verdict).toBe("PASS");
    if (verdict.verdict !== "PASS") return;
    expect(verdict.inject.projectId).toBe(realProjectId);
  });

  it("std 3 RED+PASS: plan_required without/with a task_plan decision row", async () => {
    const red = await preTask(goodCtx({ task: { ...goodCtx().task, planRequired: true } }));
    expect(red.verdict).toBe("REJECT");

    const dec = await db()
      .insertInto("decision_log")
      .values({
        run_id: null,
        decided_by: M,
        decision: "task_plan",
        rationale: `${M} plan evidence`,
        data_used: [M],
        alternatives: null,
        confidence: null,
        risk: null,
        approval_id: null,
        outcome: null,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    const pass = await preTask(
      goodCtx({
        task: { ...goodCtx().task, planRequired: true },
        planDecisionId: String(dec.id),
      }),
    );
    expect(pass.verdict).toBe("PASS");
  });

  it("std 5 (pre) RED+PASS: COST hard-stop blocks the spawn; fitting budget passes", async () => {
    const red = await preTask(goodCtx({ budget: { hardStop: true } }));
    expect(red.verdict).toBe("REJECT");
    const pass = await preTask(
      goodCtx({
        budget: { remainingEur: 10, hardStop: false },
        task: { ...goodCtx().task, budgetMaxCostEur: 5 },
      }),
    );
    expect(pass.verdict).toBe("PASS");
    const overBudget = await preTask(
      goodCtx({
        budget: { remainingEur: 2, hardStop: false },
        task: { ...goodCtx().task, budgetMaxCostEur: 5 },
      }),
    );
    expect(overBudget.verdict).toBe("REJECT");
  });

  it("std 11 RED: neither project ctx nor milestone → missing_project_link", async () => {
    const red = await preTask(goodCtx({ project: null }));
    expect(red.verdict).toBe("REJECT");
    if (red.verdict !== "REJECT") return;
    expect(red.reason).toContain("missing_project_link");
  });

  it("std 12 RED+PASS: no MCP profile / tools outside grants reject; granted surface passes", async () => {
    const noProfile = await preTask(
      goodCtx({ employee: { ...goodCtx().employee, mcpProfile: null } }),
    );
    expect(noProfile.verdict).toBe("REJECT");

    const outside = await preTask(
      goodCtx({ grants: ["dxb-mcp.queue_list"], requestedTools: ["dxb-mcp.payments_send"] }),
    );
    expect(outside.verdict).toBe("REJECT");
    if (outside.verdict !== "REJECT") return;
    expect(outside.reason).toContain("payments_send");

    const inside = await preTask(
      goodCtx({ grants: ["dxb-mcp.queue_list"], requestedTools: ["dxb-mcp.queue_list"] }),
    );
    expect(inside.verdict).toBe("PASS");
  });

  it("persona gate (std 12 row) RED+PASS incl. the DB-lookup leg", async () => {
    const red = await preTask(
      goodCtx({ employee: { ...goodCtx().employee, personaGate: "pending" } }),
    );
    expect(red.verdict).toBe("REJECT");
    if (red.verdict !== "REJECT") return;
    expect(red.reason).toContain("persona quality gate");

    const ghost = await preTask(
      goodCtx({ employee: { ...goodCtx().employee, id: randomUUID(), personaGate: undefined } }),
    );
    expect(ghost.verdict).toBe("REJECT");

    if (gatedEmployeeId) {
      const real = await preTask(
        goodCtx({
          employee: { ...goodCtx().employee, id: gatedEmployeeId, personaGate: undefined },
        }),
      );
      expect(real.verdict).toBe("PASS");
    }
  });

  it("§6 gate order: permission failure wins over later completeness failure", async () => {
    const verdict = await preTask(
      goodCtx({
        employee: { ...goodCtx().employee, mcpProfile: null },
        task: { ...goodCtx().task, objective: null, outputContract: null },
      }),
    );
    expect(verdict.verdict).toBe("REJECT");
    if (verdict.verdict !== "REJECT") return;
    expect(verdict.violations[0].policyId).toBe("std.permission_bounds");
  });

  it("§27 CEO exception: block failure degrades to warn + record — the CEO is never blocked", async () => {
    const before = await violationsSince(baseViolationId);
    const verdict = await preTask(goodCtx({ actor: "ceo", project: null }));
    expect(verdict.verdict).toBe("PASS");
    if (verdict.verdict !== "PASS") return;
    expect(verdict.warnings.length).toBeGreaterThanOrEqual(1);
    const after = await violationsSince(baseViolationId);
    const mine = after.filter((v) => !before.some((b) => b.id === v.id));
    expect(mine.some((v) => v.action_taken === "warned" && v.detail.includes("§27"))).toBe(true);
  });

  it("§17 invalid policy JSON → gate REJECTS (never silently skipped)", async () => {
    const r1 = await ceoSetPolicy(
      { action: "set_policy", policy_id: "std.budget_fit", rule: { broken: true } },
      `${M}-invalid-rule`,
    );
    expect(r1.ok).toBe(true);
    invalidatePolicyCache();
    const verdict = await preTask(goodCtx());
    expect(verdict.verdict).toBe("REJECT");
    if (verdict.verdict !== "REJECT") return;
    expect(verdict.reason).toContain("invalid_policy");
    const restore = await ceoSetPolicy(
      {
        action: "set_policy",
        policy_id: "std.budget_fit",
        rule: { check: "budget_fit", source: "cost_ledger", respect_hard_stop: true },
      },
      `${M}-restore-rule`,
    );
    expect(restore.ok).toBe(true);
    invalidatePolicyCache();
  });

  it("§17 FAIL-CLOSED: DB unreachable → REJECT hook_unavailable (spawn held, no throw)", async () => {
    const url = process.env.DXB_DATABASE_URL;
    await closeDb();
    process.env.DXB_DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:1/void";
    invalidatePolicyCache();
    try {
      const verdict = await preTask(goodCtx());
      expect(verdict.verdict).toBe("REJECT");
      if (verdict.verdict !== "REJECT") return;
      expect(verdict.reason).toBe("hook_unavailable");
    } finally {
      await closeDb();
      process.env.DXB_DATABASE_URL = url;
      invalidatePolicyCache();
    }
  });
});

describe("R1.5 halal_screen — immutable Islamic boundaries (MASTER_PLAN §11)", () => {
  it("RED: haram term in objective → REJECT + violation + decision_log (fail-closed)", async () => {
    const before = await violationsSince(baseViolationId);
    const verdict = await preTask(
      goodCtx({ task: { ...goodCtx().task, objective: `${M}: launch an alcohol brand campaign` } }),
    );
    expect(verdict.verdict).toBe("REJECT");
    if (verdict.verdict !== "REJECT") return;
    expect(verdict.reason).toContain("halal_screen");
    expect(verdict.reason).toContain("alcohol");
    const after = await violationsSince(baseViolationId);
    const mine = after.filter((v) => !before.some((b) => b.id === v.id));
    expect(mine.some((v) => v.policy_id === "const.halal_screen" && v.action_taken === "rejected")).toBe(true);
    const dl = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM decision_log
       WHERE id > ${baseDecisionId} AND decided_by = 'hook'
         AND decision = 'hook_reject' AND rationale LIKE '%const.halal_screen%'
    `.execute(db());
    expect(dl.rows[0].n).toBeGreaterThanOrEqual(1);
  });

  it("RED (TR): Turkish haram term → REJECT (tr-locale lowering)", async () => {
    const verdict = await preTask(
      goodCtx({ task: { ...goodCtx().task, objective: `${M}: KUMAR sitesi için reklam metni yaz` } }),
    );
    expect(verdict.verdict).toBe("REJECT");
    if (verdict.verdict !== "REJECT") return;
    expect(verdict.reason).toContain("gambling");
  });

  it("PASS: letter-boundary — 'ham veri'/'stok raporu' class words do NOT false-positive", async () => {
    const verdict = await preTask(
      goodCtx({
        task: {
          ...goodCtx().task,
          objective: `${M}: ham veri setinden stok raporu çıkar ve pipeline'ı doğrula`,
        },
      }),
    );
    expect(verdict.verdict).toBe("PASS");
  });

  it("§27: CEO is never blocked — degrade to warn, violation recorded 'warned'", async () => {
    const before = await violationsSince(baseViolationId);
    const verdict = await preTask(
      goodCtx({
        actor: "ceo",
        task: { ...goodCtx().task, objective: `${M}: evaluate a casino sponsorship offer` },
      }),
    );
    expect(verdict.verdict).toBe("PASS");
    if (verdict.verdict !== "PASS") return;
    expect(verdict.warnings.some((w) => w.policyId === "const.halal_screen")).toBe(true);
    const after = await violationsSince(baseViolationId);
    const mine = after.filter((v) => !before.some((b) => b.id === v.id));
    expect(mine.some((v) => v.policy_id === "const.halal_screen" && v.action_taken === "warned")).toBe(true);
  });
});

describe("runtime rules — monitor, single kill authority (§6)", () => {
  it("std 6 RED+PASS: spawn without rationale / over depth rejects; disciplined spawn passes", async () => {
    const noReason = await checkSpawn(goodCtx({ spawnDepth: 0, spawnRationale: null }));
    expect(noReason.ok).toBe(false);
    const tooDeep = await checkSpawn(goodCtx({ spawnDepth: 3, spawnRationale: `${M} split` }));
    expect(tooDeep.ok).toBe(false);
    const fine = await checkSpawn(goodCtx({ spawnDepth: 1, spawnRationale: `${M} split` }));
    expect(fine.ok).toBe(true);
  });

  it("std 5 (runtime) RED+PASS: over-budget WARNS (hard stop stays COST_CONTROL's)", async () => {
    const before = await violationsSince(baseViolationId);
    const over = await monitorTokens(goodCtx(), 250_000);
    expect(over.exceeded).toBe(true);
    const after = await violationsSince(baseViolationId);
    const mine = after.filter((v) => !before.some((b) => b.id === v.id));
    expect(mine).toHaveLength(1);
    expect(mine[0].action_taken).toBe("warned");
    const under = await monitorTokens(goodCtx(), 1_000);
    expect(under.exceeded).toBe(false);
  });

  it("std 10 RED+PASS: context over threshold demands a memory-router reload", async () => {
    const over = await monitorContext(goodCtx(), 0.95);
    expect(over.reloadRequired).toBe(true);
    const under = await monitorContext(goodCtx(), 0.5);
    expect(under.reloadRequired).toBe(false);
  });

  it("std 13 RED+PASS: confidence under threshold escalates; violations→alerts trigger fires (A4)", async () => {
    // Drives the suite's REAL run fixture, which is also the production shape:
    // the runtime monitors fire inside the run scope (worker-shim.ts:576 — the
    // pre-gate is the only one that precedes the run). Migration
    // 20260728002000 suppresses the CEO projection of a runtime/post violation
    // that carries no run at all, so a null-run ctx here would have asserted a
    // shape production can never produce.
    const low = await checkConfidence(goodCtx({ runId: fxRunId }), 0.1);
    expect(low.escalationRequired).toBe(true);
    // Scope to THIS suite's alert — the unscoped LIKE also counted the real
    // 2026-07-18 wave escalations still unresolved on the live DB (measured 4,
    // made this 5≠1).
    const alert = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM alerts
       WHERE source = 'hook' AND level = 'high' AND resolved_at IS NULL
         AND dedup_key = ${`hook:std.escalation_required:escalated:${fxRunId}`}`.execute(db());
    expect(alert.rows[0].n).toBe(1);
    const high = await checkConfidence(goodCtx({ runId: fxRunId }), 0.9);
    expect(high.escalationRequired).toBe(false);
  });
});

describe("post-gate — evidence package (§6/§20)", () => {
  it("std 7 RED (spec §20 integration): evidence-less 'done' → REVISE with unverified_done", async () => {
    const verdict = await postTask(goodCtx(), goodResult({ evidence: [] }));
    expect(verdict.verdict).toBe("REVISE");
    if (verdict.verdict !== "REVISE") return;
    expect(verdict.feedback.join(" ")).toContain("unverified_done");
  });

  it("std 7/9 PASS: full evidence package passes — and ONLY a PASS may close the run (std 9)", async () => {
    const verdict = await postTask(goodCtx(), goodResult());
    expect(verdict.verdict).toBe("PASS");
  });

  it("std 4 RED: empty acceptance_map — no criterion answered", async () => {
    const verdict = await postTask(goodCtx(), goodResult({ acceptanceMap: {} }));
    expect(verdict.verdict).toBe("REVISE");
    if (verdict.verdict !== "REVISE") return;
    expect(verdict.violations.some((v) => v.policyId === "std.acceptance_coverage")).toBe(true);
  });

  it("std 2 RED: shallow answers fail the depth proxy", async () => {
    const verdict = await postTask(goodCtx(), goodResult({ acceptanceMap: { criterion: "ok" } }));
    expect(verdict.verdict).toBe("REVISE");
    if (verdict.verdict !== "REVISE") return;
    expect(verdict.violations.some((v) => v.policyId === "std.no_shallow_output")).toBe(true);
  });

  it("std 8 + std 16 RED: empty output = incomplete delivery AND mismatch with the mapped claims", async () => {
    const verdict = await postTask(goodCtx(), goodResult({ output: "" }));
    expect(verdict.verdict).toBe("REVISE");
    if (verdict.verdict !== "REVISE") return;
    const ids = verdict.violations.map((v) => v.policyId);
    expect(ids).toContain("std.output_schema");
    expect(ids).toContain("std.output_matches_request");
  });

  it("std 14 RED+PASS: claimed decisions must exist as decision_log rows on the run", async () => {
    const red = await postTask(
      goodCtx({ runId: fxRunId }),
      goodResult({ decisionsClaimed: 2 }),
    );
    expect(red.verdict).toBe("REVISE");
    if (red.verdict !== "REVISE") return;
    expect(red.violations.some((v) => v.policyId === "std.decision_rationale")).toBe(true);

    for (let i = 0; i < 2; i++) {
      await db()
        .insertInto("decision_log")
        .values({
          run_id: fxRunId,
          decided_by: M,
          decision: "workflow_branch",
          rationale: `${M} decision ${i}`,
          data_used: [M],
          alternatives: null,
          confidence: null,
          risk: null,
          approval_id: null,
          outcome: null,
        })
        .execute();
    }
    const pass = await postTask(
      goodCtx({ runId: fxRunId }),
      goodResult({
        decisionsClaimed: 2,
        evidence: [{ kind: "verification", toolCallId: fxToolCallId }],
      }),
    );
    expect(pass.verdict).toBe("PASS");
  });

  it("std 15 RED+PASS: verification evidence must be proven in tool_calls when a run exists", async () => {
    const noProof = await postTask(
      goodCtx({ runId: fxRunId }),
      goodResult({ evidence: [{ kind: "verification", note: "trust me" }] }),
    );
    expect(noProof.verdict).toBe("REVISE");
    if (noProof.verdict !== "REVISE") return;
    expect(noProof.violations.some((v) => v.policyId === "std.verification_executed")).toBe(true);

    const proven = await postTask(
      goodCtx({ runId: fxRunId }),
      goodResult({ evidence: [{ kind: "verification", toolCallId: fxToolCallId }] }),
    );
    expect(proven.verdict).toBe("PASS");
  });

  it("std 17 RED+PASS: memory-requiring task without/with memory evidence", async () => {
    const red = await postTask(
      goodCtx({ task: { ...goodCtx().task, requiresMemory: true } }),
      goodResult(),
    );
    expect(red.verdict).toBe("REVISE");
    if (red.verdict !== "REVISE") return;
    expect(red.violations.some((v) => v.policyId === "std.memory_write")).toBe(true);

    const pass = await postTask(
      goodCtx({ task: { ...goodCtx().task, requiresMemory: true } }),
      goodResult({ memoryWritten: true }),
    );
    expect(pass.verdict).toBe("PASS");
  });

  it("§19/§7 integration: revision limit exhausted → ESCALATE with chain decision rows (manager hop) + approval item + high alert", async () => {
    const before = await violationsSince(baseViolationId);
    // Real run fixture — the post-gate runs INSIDE the run scope in both
    // production callers, and 20260728002000 no longer projects a runless
    // post-gate violation onto the CEO's panel (that shape is an engine probe).
    const verdict = await postTask(
      goodCtx({ revisionRound: 2, runId: fxRunId }),
      goodResult({ evidence: [] }),
    );
    expect(verdict.verdict).toBe("ESCALATE");
    if (verdict.verdict !== "ESCALATE") return;
    expect(verdict.chain).toEqual(["manager", "orchestrator", "ceo"]);
    expect(verdict.approvalId).toBeTruthy();

    const after = await violationsSince(baseViolationId);
    const mine = after.filter((v) => !before.some((b) => b.id === v.id));
    expect(mine.some((v) => v.action_taken === "escalated")).toBe(true);

    // §7: every hop is a decision_log row — the MANAGER hop is the roadmap's
    // named assertion; 3 hops for the default chain.
    const hops = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM decision_log
       WHERE id > ${baseDecisionId} AND decided_by = 'hook'
         AND decision = 'hook_escalation' AND rationale LIKE '%→ manager%'
    `.execute(db());
    expect(hops.rows[0].n).toBeGreaterThanOrEqual(1);

    const approval = await sql<{ status: string }>`
      SELECT status FROM approvals WHERE id = ${verdict.approvalId}`.execute(db());
    expect(approval.rows[0].status).toBe("pending");

    // ON THIS SUITE'S OWN RUN, and the unscoped count is what went red.
    // Measured 2026-09-21 on the construction engine: four OPEN high alerts
    // carried this policy and THE BENCH ITSELF WROTE THEM. `tests/phase4/
    // velocity.test.ts` boots the real scheduler, whose drain carries no
    // department fence (`scheduler.ts:563`, `drainTasks({})`), so while that
    // case runs, the resident worker claims whatever the construction queue
    // holds — here the W9 road proof's own kept task, three times (10:24:36
    // reaped → 10:25:16 claimed → 10:25:18 failed, and again at 10:28 and
    // 10:36), each a real post-gate ESCALATE. A suite may not delete another
    // suite's rows (E9.3), so the assertion, not the cleanup, was the defect.
    // What this line proves is narrow and is all it ever proved: THIS
    // escalation raised exactly one open high alert, not none and not a
    // second copy. The dedup key's own shape — `hook:<policy>:<action>:<run>`,
    // so an early 'revised' cannot mask a later 'escalated' — is asserted
    // separately below, on the trigger.
    const alert = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM alerts
       WHERE source = 'hook' AND level = 'high' AND resolved_at IS NULL
         AND run_id = ${fxRunId}
         AND dedup_key LIKE 'hook:std.no_unverified_done:%'`.execute(db());
    expect(alert.rows[0].n).toBe(1);
  });
});

describe("fn_hook_set_policy — the ONLY policy door (§13)", () => {
  it("CEO wall: without a session the fn refuses (system actor rejected too)", async () => {
    const res = await sql<{ resp: Record<string, unknown> }>`
      SELECT fn_hook_set_policy('{"action":"set_policy","policy_id":"std.task_completeness"}'::jsonb,
                                ${M + "-wall"}) AS resp`.execute(db());
    expect(res.rows[0].resp.ok).toBe(false);
    expect(res.rows[0].resp.error).toBe("PERMISSION_DENIED");
  });

  it("unknown policy → NOT_FOUND; invalid severity → VALIDATION_FAILED", async () => {
    const missing = await ceoSetPolicy(
      { action: "set_policy", policy_id: "std.does_not_exist" },
      `${M}-missing`,
    );
    expect(missing.error).toBe("NOT_FOUND");
    const badSev = await ceoSetPolicy(
      { action: "set_policy", policy_id: "std.task_completeness", severity: "loud" },
      `${M}-badsev`,
    );
    expect(badSev.error).toBe("VALIDATION_FAILED");
  });

  it("block→warn = HIGH-risk audited change; version bumps; idempotency replay + MISMATCH", async () => {
    const key = `${M}-downgrade`;
    const r1 = await ceoSetPolicy(
      { action: "set_policy", policy_id: "std.task_completeness", severity: "warn" },
      key,
    );
    expect(r1.ok).toBe(true);
    expect(r1.risk).toBe("high");

    const audit = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM audit_log
       WHERE action = 'hook.set_policy' AND id = ${r1.audit_id as number}
         AND payload ->> 'risk' = 'high'`.execute(db());
    expect(audit.rows[0].n).toBe(1);

    // replay: byte-same response, no second write
    const replay = await ceoSetPolicy(
      { action: "set_policy", policy_id: "std.task_completeness", severity: "warn" },
      key,
    );
    expect(replay).toEqual(r1);

    // same key, different payload → MISMATCH
    const mismatch = await ceoSetPolicy(
      { action: "set_policy", policy_id: "std.task_completeness", severity: "block" },
      key,
    );
    expect(mismatch.error).toBe("IDEMPOTENCY_MISMATCH");

    // warn severity now ACTS as warn: the gate records but passes (std 1 leg)
    invalidatePolicyCache();
    const verdict = await preTask(goodCtx({ task: { ...goodCtx().task, outputContract: null } }));
    expect(verdict.verdict).toBe("PASS");
    if (verdict.verdict === "PASS") {
      expect(verdict.warnings.some((w) => w.policyId === "std.task_completeness")).toBe(true);
    }

    const restore = await ceoSetPolicy(
      { action: "set_policy", policy_id: "std.task_completeness", severity: "block" },
      `${M}-restore-sev`,
    );
    expect(restore.ok).toBe(true);
    invalidatePolicyCache();
  });

  it("broadcast lands on dxb:settings (hook_policy.changed — §10 cache drop)", async () => {
    const since = new Date(Date.now() - 2000);
    const r = await ceoSetPolicy(
      { action: "set_policy", policy_id: "std.no_shallow_output", enabled: false },
      `${M}-broadcast`,
    );
    expect(r.ok).toBe(true);
    const msgs = await sql<{ payload: { type: string; policy_id?: string } }>`
      SELECT payload FROM realtime.messages
       WHERE topic = 'dxb:settings' AND extension = 'broadcast'
         AND inserted_at >= ${since.toISOString()}::timestamp`.execute(db());
    expect(
      msgs.rows.some(
        (m) =>
          m.payload.type === "hook_policy.changed" &&
          m.payload.policy_id === "std.no_shallow_output",
      ),
    ).toBe(true);

    // disabled policy no longer gates (shallow map passes std 2 now)
    invalidatePolicyCache();
    const verdict = await postTask(goodCtx(), goodResult({ acceptanceMap: { criterion: "ok — done well" } }));
    expect(verdict.verdict).toBe("PASS");

    const restore = await ceoSetPolicy(
      { action: "set_policy", policy_id: "std.no_shallow_output", enabled: true },
      `${M}-broadcast-restore`,
    );
    expect(restore.ok).toBe(true);
    invalidatePolicyCache();
  });

  it("§27 conflict: same gate+check with differing severities → most restrictive wins + attention alert", async () => {
    const r = await ceoSetPolicy(
      { action: "set_policy", policy_id: "std.no_shallow_output", severity: "warn" },
      `${M}-conflict`,
    );
    expect(r.ok).toBe(true);
    invalidatePolicyCache();
    const load = await loadPolicies();
    const conflict = load.conflicts.find((c) => c.check === "acceptance_coverage");
    expect(conflict).toBeTruthy();
    const row = load.rows.find((p) => p.id === "std.no_shallow_output");
    expect(row?.severity).toBe("block"); // most restrictive applied
    const alert = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM alerts
       WHERE dedup_key = 'hook:conflict:post:acceptance_coverage' AND resolved_at IS NULL
    `.execute(db());
    expect(alert.rows[0].n).toBe(1);

    const restore = await ceoSetPolicy(
      { action: "set_policy", policy_id: "std.no_shallow_output", severity: "block" },
      `${M}-conflict-restore`,
    );
    expect(restore.ok).toBe(true);
    invalidatePolicyCache();
  });
});
