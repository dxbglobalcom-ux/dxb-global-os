import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { sql } from "kysely";
import { closeDb, getDb, StepsSnapshot } from "../../packages/shared/src/index.js";
import {
  drainWorkflowRuns,
  eventMatches,
  dispatchEventTriggers,
  runWorkflowRun,
  StepError,
  type WorkflowExecutor,
} from "../../packages/kernel/src/index.js";
import { pinHookOff, watchLedgers } from "../helpers/suite-scope.js";

// R2.3: the workflow agent step now runs the SAME hook constitution as the
// task path. This suite's fixtures predate the hook (no persona/project
// surface) — pinned off per the registered A13 mechanism (loud in DB,
// restored in afterAll); the hooked workflow path is proven in tests/r23.
pinHookOff(() => getDb());

// E9.1 verification — WORKFLOW_ENGINE_SPEC §20/§21/§24:
//   control_workflow_action full surface (create/update/copy/enable/disable/
//   run_now/cancel_run/resume_run) behind the CEO wall, B7b money-out guard,
//   §10 state machine + snapshot versioning + resume, PARK ≠ retry/timeout,
//   §17-19 error/retry/fallback classes, §25/26 singleton + edge cases, and
//   the §24 smoke-wf end to end through the kernel runner library.
// Suite cleans up EVERYTHING it creates (E8.4b lesson: suites must not
// pollute /alerts or any other CEO surface).

const db = () => getDb();

// Its own footprints in audit_log / decision_log, swept in afterAll below.
const ledgerScope = watchLedgers(db);
const SLUG = (s: string) => `e9t-${s}`;
const probeAgentIds: string[] = [];

// ── helpers ──────────────────────────────────────────────────────────────────

/** CEO-context call: auth.uid() reads request.jwt.claims sub (Supabase). */
async function ceoAction(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const key = `e9t-${randomUUID()}`;
  return ceoActionKeyed(payload, key);
}

async function ceoActionKeyed(
  payload: Record<string, unknown>,
  key: string,
): Promise<Record<string, unknown>> {
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

/** system-context call (postgres session → actor 'system'). */
async function systemAction(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const key = `e9t-${randomUUID()}`;
  const res = await sql<{ resp: Record<string, unknown> }>`
    SELECT control_workflow_action(${JSON.stringify(payload)}::jsonb, ${key}) AS resp
  `.execute(db());
  return res.rows[0].resp;
}

async function makeEmployee(slug: string, personaVersion = "v2.0-test"): Promise<string> {
  const row = await sql<{ id: string }>`
    INSERT INTO agents (slug, department, role, persona_path, persona_version,
                        status, employment_status)
    VALUES (${SLUG(slug) + "-" + randomUUID().slice(0, 8)}, 'engineering', 'worker',
            'personas/test/probe.md', ${personaVersion}, 'dormant', 'dormant')
    RETURNING id
  `.execute(db());
  probeAgentIds.push(row.rows[0].id);
  return row.rows[0].id;
}

// Deterministic mock executor — no LLM. Markers in the objective steer it:
//   FAIL_TRANSIENT:n  → throw plain Error on the first n calls of that objective
//   FAIL_FATAL        → throw StepError fatal
//   CONF=x            → returned confidence (review verdicts read this)
const callCounts = new Map<string, number>();
const mockExecutor: WorkflowExecutor = async (work) => {
  const n = (callCounts.get(work.objective) ?? 0) + 1;
  callCounts.set(work.objective, n);
  const failN = work.objective.match(/FAIL_TRANSIENT:(\d+)/);
  if (failN && n <= Number(failN[1])) throw new Error(`transient probe failure #${n}`);
  if (work.objective.includes("FAIL_FATAL")) {
    throw new StepError("fatal probe failure", "fatal", "PROBE_FATAL");
  }
  const conf = work.objective.match(/CONF=([0-9.]+)/);
  return {
    output: `done: ${work.objective.slice(0, 60)} (by ${work.employeeSlug} on ${work.model})`,
    confidence: conf ? Number(conf[1]) : 0.9,
  };
};
const deps = { executor: mockExecutor, sleep: async () => {} };

function agentStep(employeeId: string, objective: string, extra: Record<string, unknown> = {}) {
  return {
    kind: "agent",
    config: {
      employee_id: employeeId,
      model_id: "claude-opus-4-8",
      objective,
      output_contract: "probe output",
      ...extra,
    },
  };
}

async function runStatus(runId: string): Promise<{ status: string; current_step: number | null }> {
  const r = await sql<{ status: string; current_step: number | null }>`
    SELECT status, current_step FROM workflow_runs WHERE id = ${runId}::uuid
  `.execute(db());
  return r.rows[0];
}

// ── control fn surface ───────────────────────────────────────────────────────

describe("control_workflow_action — definition CRUD (§8/§13)", () => {
  it("create validates, inserts steps, returns version 1 + audit row", async () => {
    const emp = await makeEmployee("crud-emp");
    const resp = await ceoAction({
      action: "create",
      slug: SLUG("crud"),
      name: "CRUD probe",
      trigger: { kind: "manual" },
      steps: [agentStep(emp, "crud probe step")],
    });
    expect(resp).toMatchObject({ ok: true, version: 1 });
    const audit = await sql<{ action: string; detail_ref: { table: string } }>`
      SELECT action, detail_ref FROM audit_log WHERE id = ${Number(resp.audit_id)}
    `.execute(db());
    expect(audit.rows[0].action).toBe("workflow.create");
    expect(audit.rows[0].detail_ref).toMatchObject({ table: "workflows" });
  });

  it("CRUD is CEO-only: system actor gets PERMISSION_DENIED (§13)", async () => {
    const resp = await systemAction({
      action: "create",
      slug: SLUG("sys-denied"),
      name: "x",
      trigger: { kind: "manual" },
      steps: [{ kind: "approval", config: { action_type: "x", summary: "y" } }],
    });
    expect(resp).toMatchObject({ ok: false, error: "PERMISSION_DENIED" });
  });

  it("update bumps version; running run keeps its frozen snapshot (§10)", async () => {
    const emp = await makeEmployee("snap-emp");
    await ceoAction({
      action: "create",
      slug: SLUG("snap"),
      name: "Snapshot probe",
      trigger: { kind: "manual" },
      steps: [agentStep(emp, "ORIGINAL objective")],
    });
    const run = await ceoAction({ action: "run_now", slug: SLUG("snap") });
    expect(run.run_id).toBeTruthy();

    const upd = await ceoAction({
      action: "update",
      slug: SLUG("snap"),
      steps: [agentStep(emp, "REPLACED objective")],
    });
    expect(upd).toMatchObject({ ok: true, version: 2 });

    const snap = await sql<{ steps_snapshot: unknown }>`
      SELECT steps_snapshot FROM workflow_runs WHERE id = ${String(run.run_id)}::uuid
    `.execute(db());
    const steps = StepsSnapshot.parse(snap.rows[0].steps_snapshot);
    expect((steps[0].config as { objective: string }).objective).toBe("ORIGINAL objective");

    // the frozen run finishes with the ORIGINAL step (§25 edge: resume on a
    // changed version ends with the old snapshot)
    const outcome = await runWorkflowRun(String(run.run_id), deps);
    expect(outcome.status).toBe("succeeded");
  });

  it("copy appends -copy-n and starts disabled (§8)", async () => {
    const emp = await makeEmployee("copy-emp");
    await ceoAction({
      action: "create",
      slug: SLUG("copysrc"),
      name: "Copy source",
      trigger: { kind: "manual" },
      steps: [agentStep(emp, "copy probe")],
    });
    const resp = await ceoAction({ action: "copy", slug: SLUG("copysrc") });
    expect(resp.ok).toBe(true);
    const row = await sql<{ slug: string; enabled: boolean }>`
      SELECT slug, enabled FROM workflows WHERE id = ${String(resp.workflow_id)}::uuid
    `.execute(db());
    expect(row.rows[0]).toEqual({ slug: SLUG("copysrc") + "-copy-1", enabled: false });
  });

  it("B7b: high-risk workflow with outbox_action step and no earlier approval is REJECTED (§16)", async () => {
    const emp = await makeEmployee("b7b-emp");
    const rejected = await ceoAction({
      action: "create",
      slug: SLUG("b7b-bad"),
      name: "B7b bad",
      trigger: { kind: "manual" },
      risk: "high",
      steps: [agentStep(emp, "send money", { outbox_action: "payment.send" })],
    });
    expect(rejected.ok).toBe(false);
    expect(String(rejected.detail)).toContain("B7b");

    // same steps WITH an approval gate in front → accepted
    const ok = await ceoAction({
      action: "create",
      slug: SLUG("b7b-good"),
      name: "B7b good",
      trigger: { kind: "manual" },
      risk: "high",
      steps: [
        { kind: "approval", config: { action_type: "payment.send", summary: "gate first" } },
        agentStep(emp, "send money gated", { outbox_action: "payment.send" }),
      ],
    });
    expect(ok.ok).toBe(true);

    // raising risk on an ungated definition is also rejected (update leg)
    const low = await ceoAction({
      action: "create",
      slug: SLUG("b7b-low"),
      name: "B7b low",
      trigger: { kind: "manual" },
      risk: "low",
      steps: [agentStep(emp, "outward but low", { outbox_action: "email.send" })],
    });
    expect(low.ok).toBe(true);
    const raise = await ceoAction({ action: "update", slug: SLUG("b7b-low"), risk: "high" });
    expect(raise.ok).toBe(false);
    expect(String(raise.detail)).toContain("B7b");
  });

  it("credential fields cannot enter step config (§16)", async () => {
    const emp = await makeEmployee("secret-emp");
    const resp = await ceoAction({
      action: "create",
      slug: SLUG("secret"),
      name: "Secret probe",
      trigger: { kind: "manual" },
      steps: [agentStep(emp, "leak", { api_key: "sk-nope" })],
    });
    expect(resp.ok).toBe(false);
    expect(String(resp.detail)).toContain("credential");
  });

  it("archived / pre-v2 employees rejected at write time (§2 HR gate)", async () => {
    const legacy = await makeEmployee("legacy-emp", "v1.0-legacy");
    const resp = await ceoAction({
      action: "create",
      slug: SLUG("legacy"),
      name: "Legacy probe",
      trigger: { kind: "manual" },
      steps: [agentStep(legacy, "won't happen")],
    });
    expect(resp.ok).toBe(false);
    expect(String(resp.detail)).toContain("persona v2");
  });

  it("idempotency: same key replays, different body under same key = MISMATCH", async () => {
    const emp = await makeEmployee("idem-emp");
    const key = `e9t-${randomUUID()}`;
    const payload = {
      action: "create",
      slug: SLUG("idem"),
      name: "Idem probe",
      trigger: { kind: "manual" },
      steps: [agentStep(emp, "idem step")],
    };
    const first = await ceoActionKeyed(payload, key);
    const replay = await ceoActionKeyed(payload, key);
    expect(replay).toEqual(first);
    const mismatch = await ceoActionKeyed({ ...payload, name: "Different" }, key);
    expect(mismatch).toMatchObject({ ok: false, error: "IDEMPOTENCY_MISMATCH" });
  });

  it("grants: anon zero execute; authenticated may execute (§13)", async () => {
    const g = await sql<{ anon_exec: boolean; auth_exec: boolean }>`
      SELECT has_function_privilege('anon', 'public.control_workflow_action(jsonb, text)', 'EXECUTE') AS anon_exec,
             has_function_privilege('authenticated', 'public.control_workflow_action(jsonb, text)', 'EXECUTE') AS auth_exec
    `.execute(db());
    expect(g.rows[0]).toEqual({ anon_exec: false, auth_exec: true });
  });
});

// ── run lifecycle ────────────────────────────────────────────────────────────

describe("run lifecycle — state machine, park, resume (§10)", () => {
  it("SPEC §21 five-step e2e: agent→review→approval→agent→end with PARK proof", async () => {
    const emp = await makeEmployee("e2e-emp");
    const created = await ceoAction({
      action: "create",
      slug: SLUG("e2e"),
      name: "Five step",
      trigger: { kind: "manual" },
      timeout_s: 1, // must NOT fire while parked (park ≠ timeout)
      steps: [
        agentStep(emp, "produce the deliverable"),
        {
          kind: "review",
          config: {
            employee_id: emp,
            model_id: "claude-opus-4-8",
            criteria: "CONF=0.95 must be a deliverable",
            min_confidence: 0.6,
          },
        },
        { kind: "approval", config: { action_type: "wf.e2e", summary: "human gate" } },
        agentStep(emp, "final polish after approval"),
      ],
    });
    expect(created.ok).toBe(true);

    const run = await ceoAction({ action: "run_now", slug: SLUG("e2e") });
    const runId = String(run.run_id);

    const parked = await runWorkflowRun(runId, deps);
    expect(parked.status).toBe("waiting_approval");
    expect(await runStatus(runId)).toMatchObject({ status: "waiting_approval", current_step: 3 });

    // PARK proof: age the run far past timeout_s and drain — the parked run
    // is untouched (no retry counter, no timeout; §10)
    await sql`UPDATE workflow_runs SET started_at = now() - interval '2 hours'
              WHERE id = ${runId}::uuid`.execute(db());
    await drainWorkflowRuns(deps);
    expect((await runStatus(runId)).status).toBe("waiting_approval");

    // decide through the LOCKED 0015 path — the drain must notice and resume
    const approval = await sql<{ id: string }>`
      SELECT id FROM approvals WHERE payload->>'workflow_run_id' = ${runId}
      ORDER BY created_at DESC LIMIT 1
    `.execute(db());
    await sql`SELECT decide_approvals(ARRAY[${approval.rows[0].id}]::uuid[], 'approved', 'e9 probe')`.execute(db());

    // un-age the run so the resumed leg doesn't trip the timeout it parked through
    await sql`UPDATE workflow_runs SET started_at = now() WHERE id = ${runId}::uuid`.execute(db());
    const drained = await drainWorkflowRuns(deps);
    expect(drained.resumed).toBe(1);
    expect((await runStatus(runId)).status).toBe("succeeded");

    // resume proof §24/§21: step 4 saw step 1's output through the snapshot
    const snap = await sql<{ steps_snapshot: { result?: { output: string } }[] }>`
      SELECT steps_snapshot FROM workflow_runs WHERE id = ${runId}::uuid
    `.execute(db());
    expect(snap.rows[0].steps_snapshot[3].result?.output).toContain("final polish");
  });

  it("rejected approval fails the run (APPROVAL_REJECTED) without an alert", async () => {
    const emp = await makeEmployee("rej-emp");
    await ceoAction({
      action: "create",
      slug: SLUG("rej"),
      name: "Reject probe",
      trigger: { kind: "manual" },
      steps: [
        { kind: "approval", config: { action_type: "wf.rej", summary: "gate" } },
        agentStep(emp, "never runs"),
      ],
    });
    const run = await ceoAction({ action: "run_now", slug: SLUG("rej") });
    const runId = String(run.run_id);
    await runWorkflowRun(runId, deps);
    const approval = await sql<{ id: string }>`
      SELECT id FROM approvals WHERE payload->>'workflow_run_id' = ${runId} LIMIT 1
    `.execute(db());
    await sql`SELECT decide_approvals(ARRAY[${approval.rows[0].id}]::uuid[], 'rejected', 'no')`.execute(db());
    const drained = await drainWorkflowRuns(deps);
    expect(drained.rejected).toBe(1);
    expect((await runStatus(runId)).status).toBe("failed");
    const alerts = await sql<{ n: string }>`
      SELECT count(*)::text AS n FROM alerts
      WHERE source_ref->>'id' = ${runId}
    `.execute(db());
    expect(alerts.rows[0].n).toBe("0"); // human decision ≠ alarm
  });

  it("singleton: second run_now while in flight is logged + skipped (§26)", async () => {
    const emp = await makeEmployee("singleton-emp");
    await ceoAction({
      action: "create",
      slug: SLUG("singleton"),
      name: "Singleton probe",
      trigger: { kind: "manual" },
      steps: [
        { kind: "approval", config: { action_type: "wf.hold", summary: "hold open" } },
        agentStep(emp, "after gate"),
      ],
    });
    const first = await ceoAction({ action: "run_now", slug: SLUG("singleton") });
    await runWorkflowRun(String(first.run_id), deps); // parks → still in flight
    const second = await ceoAction({ action: "run_now", slug: SLUG("singleton") });
    expect(second).toMatchObject({ ok: true, skipped: true, reason: "singleton" });
    const audit = await sql<{ action: string }>`
      SELECT action FROM audit_log WHERE id = ${Number(second.audit_id)}
    `.execute(db());
    expect(audit.rows[0].action).toBe("workflow.run_skipped");
  });

  it("disabled workflow: trigger skips with reason (§25 edge)", async () => {
    const emp = await makeEmployee("disabled-emp");
    await ceoAction({
      action: "create",
      slug: SLUG("disabled"),
      name: "Disabled probe",
      trigger: { kind: "manual" },
      steps: [agentStep(emp, "never")],
    });
    await ceoAction({ action: "disable", slug: SLUG("disabled") });
    const resp = await ceoAction({ action: "run_now", slug: SLUG("disabled") });
    expect(resp).toMatchObject({ ok: true, skipped: true, reason: "disabled" });
  });

  it("cancel_run ends a parked run; runner then skips it", async () => {
    const emp = await makeEmployee("cancel-emp");
    await ceoAction({
      action: "create",
      slug: SLUG("cancel"),
      name: "Cancel probe",
      trigger: { kind: "manual" },
      steps: [
        { kind: "approval", config: { action_type: "wf.cancel", summary: "gate" } },
        agentStep(emp, "never"),
      ],
    });
    const run = await ceoAction({ action: "run_now", slug: SLUG("cancel") });
    const runId = String(run.run_id);
    await runWorkflowRun(runId, deps);
    const cancelled = await ceoAction({ action: "cancel_run", run_id: runId });
    expect(cancelled.ok).toBe(true);
    expect((await runStatus(runId)).status).toBe("cancelled");
    const outcome = await runWorkflowRun(runId, deps);
    expect(outcome).toMatchObject({ status: "skipped" });
  });
});

// ── §17-19 error handling / retry / fallback / enforcement ──────────────────

describe("error classes, retry, fallback, limits (§17-19)", () => {
  it("retry step: transient failures retried to success; attempts counted", async () => {
    const emp = await makeEmployee("retry-emp");
    const objective = `FAIL_TRANSIENT:2 then succeed ${randomUUID()}`;
    await ceoAction({
      action: "create",
      slug: SLUG("retry"),
      name: "Retry probe",
      trigger: { kind: "manual" },
      steps: [
        agentStep(emp, objective),
        { kind: "retry", config: { max_attempts: 3, backoff_s: 1, on_exhaust: "fail" } },
      ],
    });
    const run = await ceoAction({ action: "run_now", slug: SLUG("retry") });
    const outcome = await runWorkflowRun(String(run.run_id), deps);
    expect(outcome.status).toBe("succeeded");
    expect(callCounts.get(objective)).toBe(3); // 2 failures + 1 success
  });

  it("retry exhausted with on_exhaust=fail → run failed + workflow alert (§17 fatal leg)", async () => {
    const emp = await makeEmployee("exhaust-emp");
    const objective = `FAIL_TRANSIENT:99 never succeeds ${randomUUID()}`;
    await ceoAction({
      action: "create",
      slug: SLUG("exhaust"),
      name: "Exhaust probe",
      trigger: { kind: "manual" },
      steps: [
        agentStep(emp, objective),
        { kind: "retry", config: { max_attempts: 2, on_exhaust: "fail" } },
      ],
    });
    const run = await ceoAction({ action: "run_now", slug: SLUG("exhaust") });
    const runId = String(run.run_id);
    const outcome = await runWorkflowRun(runId, deps);
    expect(outcome).toMatchObject({ status: "failed", reason: "RETRY_EXHAUSTED" });
    expect(callCounts.get(objective)).toBe(2);
    const alert = await sql<{ level: string; source: string }>`
      SELECT level, source FROM alerts WHERE source_ref->>'id' = ${runId}
    `.execute(db());
    expect(alert.rows[0]).toEqual({ level: "high", source: "workflow" });
  });

  it("fallback step: exhausted main path continues on the alternate chain (§19)", async () => {
    const emp = await makeEmployee("fallback-emp");
    const objective = `FAIL_TRANSIENT:99 main path ${randomUUID()}`;
    await ceoAction({
      action: "create",
      slug: SLUG("fallback"),
      name: "Fallback probe",
      trigger: { kind: "manual" },
      steps: [
        agentStep(emp, objective),
        { kind: "retry", config: { max_attempts: 2, on_exhaust: "fallback" } },
        {
          kind: "fallback",
          config: {
            alternate_steps: [agentStep(emp, "alternate path succeeds")].map((s) => ({
              kind: s.kind,
              config: s.config,
            })),
          },
        },
      ],
    });
    const run = await ceoAction({ action: "run_now", slug: SLUG("fallback") });
    const outcome = await runWorkflowRun(String(run.run_id), deps);
    expect(outcome.status).toBe("succeeded");
  });

  it("review fail with on_fail=fail → run failed REVIEW_FAILED (§19)", async () => {
    const emp = await makeEmployee("review-emp");
    await ceoAction({
      action: "create",
      slug: SLUG("review-fail"),
      name: "Review fail probe",
      trigger: { kind: "manual" },
      steps: [
        agentStep(emp, "mediocre work"),
        {
          kind: "review",
          config: {
            employee_id: emp,
            model_id: "claude-opus-4-8",
            criteria: "CONF=0.2 impossible bar",
            min_confidence: 0.8,
            on_fail: "fail",
          },
        },
      ],
    });
    const run = await ceoAction({ action: "run_now", slug: SLUG("review-fail") });
    const outcome = await runWorkflowRun(String(run.run_id), deps);
    expect(outcome).toMatchObject({ status: "failed", reason: "REVIEW_FAILED" });
  });

  it("BUDGET_EXCEEDED: token_limit breached before a step starts (§17)", async () => {
    const emp = await makeEmployee("budget-emp");
    await ceoAction({
      action: "create",
      slug: SLUG("budget"),
      name: "Budget probe",
      trigger: { kind: "manual" },
      token_limit: 100,
      steps: [agentStep(emp, "expensive work")],
    });
    const run = await ceoAction({ action: "run_now", slug: SLUG("budget") });
    const runId = String(run.run_id);
    // usage already booked against this run (P7 LiteLLM counter's seat —
    // ticket adaptation 5: agent_runs is the enforcement source today)
    await sql`
      INSERT INTO agent_runs (workflow_run_id, status, tokens_in, tokens_out, ended_at)
      VALUES (${runId}::uuid, 'succeeded', 900, 200, now())
    `.execute(db());
    const outcome = await runWorkflowRun(runId, deps);
    expect(outcome).toMatchObject({ status: "failed", reason: "BUDGET_EXCEEDED" });
  });

  it("archived-after-definition employee → step-start rejection fails the run (§25 edge)", async () => {
    const emp = await makeEmployee("archive-emp");
    await ceoAction({
      action: "create",
      slug: SLUG("archived"),
      name: "Archive probe",
      trigger: { kind: "manual" },
      steps: [agentStep(emp, "employee vanishes before run")],
    });
    const run = await ceoAction({ action: "run_now", slug: SLUG("archived") });
    await sql`UPDATE agents SET employment_status = 'archived' WHERE id = ${emp}::uuid`.execute(db());
    const outcome = await runWorkflowRun(String(run.run_id), deps);
    expect(outcome).toMatchObject({ status: "failed", reason: "EMPLOYEE_INELIGIBLE" });
  });
});

// ── triggers (§6/§9) ─────────────────────────────────────────────────────────

describe("event triggers", () => {
  it("eventMatches: type + entity_kind filter contract (§9)", () => {
    const env = { type: "approval.decided", entity: { kind: "approval", id: "x" } } as const;
    expect(eventMatches({ type: "approval.decided" }, env)).toBe(true);
    expect(eventMatches({ type: "approval.decided", entity_kind: "approval" }, env)).toBe(true);
    expect(eventMatches({ type: "run.failed" }, env)).toBe(false);
    expect(eventMatches({ entity_kind: "task" }, env)).toBe(false);
    expect(eventMatches({}, env)).toBe(false); // empty match never fires
  });

  it("dispatchEventTriggers fires run_now on a matching enabled workflow", async () => {
    const emp = await makeEmployee("event-emp");
    await ceoAction({
      action: "create",
      slug: SLUG("event"),
      name: "Event probe",
      trigger: { kind: "event", match: { type: "task.event_appended", entity_kind: "task" } },
      steps: [agentStep(emp, "event-triggered work")],
    });
    const fired = await dispatchEventTriggers({
      type: "task.event_appended",
      entity: { kind: "task", id: randomUUID() },
    });
    const mine = fired.find((f) => f.slug === SLUG("event"));
    expect(mine?.fired).toBe(true);
    // and it drains to success
    const drained = await drainWorkflowRuns(deps);
    const wfRun = await sql<{ status: string; triggered_by: string }>`
      SELECT r.status, r.triggered_by FROM workflow_runs r
      JOIN workflows w ON w.id = r.workflow_id WHERE w.slug = ${SLUG("event")}
    `.execute(db());
    expect(drained.processed).toBeGreaterThan(0);
    expect(wfRun.rows[0]).toEqual({ status: "succeeded", triggered_by: "event:task.event_appended" });
  });
});

// ── §24 smoke-wf (roadmap acceptance) ────────────────────────────────────────

describe("WORKFLOW §24 smoke-wf", () => {
  it("steps_snapshot column exists (§24 line 1)", async () => {
    const col = await sql<{ column_name: string }>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'workflow_runs' AND column_name = 'steps_snapshot'
    `.execute(db());
    expect(col.rows[0]?.column_name).toBe("steps_snapshot");
  });

  it("create smoke-wf → ok:true · run_now → run_id · runner → succeeded (§24 lines 2-4)", async () => {
    const emp = await makeEmployee("smoke-emp");
    const created = await ceoAction({
      action: "create",
      slug: SLUG("smoke-wf"),
      name: "Smoke",
      trigger: { kind: "manual" },
      steps: [
        {
          kind: "agent",
          config: {
            employee_id: emp,
            model_role_slot: "execution", // §24 uses the slot path verbatim
            model_id: "claude-opus-4-8", // pin keeps the smoke deterministic if the slot is empty
            objective: "smoke deliverable",
            output_contract: "one line",
          },
        },
      ],
    });
    expect(created.ok).toBe(true);

    const run = await ceoAction({ action: "run_now", slug: SLUG("smoke-wf") });
    expect(run.run_id).toBeTruthy();

    await drainWorkflowRuns(deps);
    const status = await sql<{ status: string }>`
      SELECT status FROM workflow_runs ORDER BY started_at DESC LIMIT 1
    `.execute(db());
    expect(["running", "succeeded"]).toContain(status.rows[0].status); // §24 exact contract
    expect((await runStatus(String(run.run_id))).status).toBe("succeeded");
  });
});

// ── cleanup (suites must leave the CEO surfaces clean — E8.4b lesson) ────────
// Runs BEFORE too: a killed previous run (SIGINT/SIGPIPE skips afterAll)
// must not fail this run on slug uniqueness — the suite self-heals.

async function sweepProbeRows(): Promise<void> {
  const wfIds = await sql<{ id: string }>`
    SELECT id FROM workflows WHERE slug LIKE 'e9t-%'
  `.execute(db());
  const ids = wfIds.rows.map((r) => r.id);
  if (ids.length > 0) {
    await sql`DELETE FROM alerts WHERE source = 'workflow' AND source_ref->>'id' IN
      (SELECT id::text FROM workflow_runs WHERE workflow_id = ANY(${ids}::uuid[]))`.execute(db());
    // the E8.4b run-failure trigger raises its own alert rows for our failed
    // probe agent_runs — they FK run_id and must go before the runs do
    await sql`DELETE FROM alerts WHERE run_id IN
      (SELECT id FROM agent_runs WHERE workflow_run_id IN
        (SELECT id FROM workflow_runs WHERE workflow_id = ANY(${ids}::uuid[])))`.execute(db());
    await sql`DELETE FROM tool_calls WHERE run_id IN
      (SELECT id FROM agent_runs WHERE workflow_run_id IN
        (SELECT id FROM workflow_runs WHERE workflow_id = ANY(${ids}::uuid[])))`.execute(db());
    await sql`DELETE FROM agent_runs WHERE workflow_run_id IN
      (SELECT id FROM workflow_runs WHERE workflow_id = ANY(${ids}::uuid[]))`.execute(db());
    // an approved approval spawns an outbox action (0015 path) — FK first
    await sql`DELETE FROM outbox WHERE approval_id IN
      (SELECT id FROM approvals WHERE payload->>'workflow_id' = ANY(${ids.map(String)}::text[]))`.execute(db());
    await sql`DELETE FROM approvals WHERE payload->>'workflow_id' = ANY(${ids.map(String)}::text[])`.execute(db());
    await sql`DELETE FROM workflow_runs WHERE workflow_id = ANY(${ids}::uuid[])`.execute(db());
    await sql`DELETE FROM workflows WHERE id = ANY(${ids}::uuid[])`.execute(db());
  }
  await sql`DELETE FROM audit_log WHERE action LIKE 'workflow.%'
    AND payload->>'slug' LIKE 'e9t-%'`.execute(db());
  await sql`DELETE FROM audit_log WHERE action = 'approval.decision'
    AND payload->>'note' IN ('e9 probe', 'no')`.execute(db());
  await sql`DELETE FROM decision_log WHERE decided_by = 'orchestrator'
    AND rationale LIKE '%e9t-%'`.execute(db());
  await sql`DELETE FROM control_idempotency WHERE key LIKE 'e9t-%'`.execute(db());
  // slug-LIKE sweep, not the collected ids: a previous aborted run's residue
  // must not fail the next run on agents_slug_key (E8.4b pollution lesson)
  await sql`DELETE FROM agents WHERE slug LIKE 'e9t-%'`.execute(db());
}

beforeAll(async () => {
  await sweepProbeRows();
});

afterAll(async () => {
  // 2026-09-21: and the two append-only ledgers too. Measured by running
  // every sandboxed file alone: this one left the rows named below, which
  // no FK chain reaches. Watermark AND signature — never the watermark alone.
  await ledgerScope.sweep({ audit: [{ actor: "system:outbox", action: "outbox.enqueue_skipped_no_handler" }], idempotencyPrefix: ["wf"] });
  await sweepProbeRows();
  await closeDb();
});
