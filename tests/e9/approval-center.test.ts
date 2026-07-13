import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/index.js";
import { classifyOperation } from "../../packages/kernel/src/index.js";

// E9.3 verification — APPROVAL_ENGINE_SPEC §20/§21/§24:
//   fn_classify_operation (priority scan, fail-closed unknown→gated),
//   approval_rules locked immutability (B7b layer 1),
//   control_approvals_action: CEO wall, 7 actions, idempotency replay +
//   MISMATCH, pending-only, single-level delegation, locked policy reject,
//   outbox release INSIDE the fn transaction (B7b layer 2 via 0003 trigger),
//   B7b grant proof (no direct outbox/approvals write for authenticated),
//   v_approvals_center flags (money_out/stale/expired), v_approval_fatigue,
//   §9 deadline + money_out>24h alert sweeps in fn_alerts_evaluate.
// The 0015 path (decide_approvals) is untouched — tests/phase4 + phase8
// rerun green as the roadmap acceptance's other half.
// Suite cleans up EVERYTHING it creates (E8.4b lesson).
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const db = () => getDb();
const PROBE = "e93-probe";

// ── helpers ──────────────────────────────────────────────────────────────────

/** CEO-context call: auth.uid() reads request.jwt.claims sub (Supabase). */
async function ceoAction(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return ceoActionKeyed(payload, `e93t-${randomUUID()}`);
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
        SELECT control_approvals_action(${JSON.stringify(payload)}::jsonb, ${key}) AS resp
      `.execute(trx);
      return res.rows[0].resp;
    });
}

/** system-context call (postgres session → actor 'system'). */
async function systemAction(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await sql<{ resp: Record<string, unknown> }>`
    SELECT control_approvals_action(${JSON.stringify(payload)}::jsonb, ${`e93t-${randomUUID()}`}) AS resp
  `.execute(db());
  return res.rows[0].resp;
}

async function makeEmployee(slug: string): Promise<string> {
  const row = await sql<{ id: string }>`
    INSERT INTO agents (slug, department, role, persona_path, persona_version,
                        status, employment_status)
    VALUES (${`e93t-${slug}-${randomUUID().slice(0, 8)}`}, 'engineering', 'worker',
            'personas/test/probe.md', 'v2.0-test', 'dormant', 'dormant')
    RETURNING id
  `.execute(db());
  return row.rows[0].id;
}

/** Pending approval fixture. purpose = PROBE marks every row for the sweep. */
async function makeApproval(over: Record<string, unknown> = {}): Promise<string> {
  const row = await sql<{ id: string }>`
    INSERT INTO approvals (task_id, action_type, payload, risk_class, status,
                           operation, operation_class, purpose,
                           requester_employee_id, deadline, cost_estimate,
                           recommended_action, reasoning_summary, alternatives)
    VALUES (NULL,
            ${over.action_type ?? "payment.e93probe"},
            ${JSON.stringify(over.payload ?? { amount_eur: 42, recipient: "probe GmbH" })}::jsonb,
            ${over.risk_class ?? "high"}, 'pending',
            ${over.operation ?? over.action_type ?? "payment.e93probe"},
            ${over.operation_class ?? null},
            ${PROBE},
            ${over.requester_employee_id ?? null},
            ${over.deadline ?? null},
            ${over.cost_estimate ?? null},
            ${over.recommended_action ?? "review and decide"},
            ${over.reasoning_summary ?? "probe reasoning"},
            ${JSON.stringify(over.alternatives ?? [{ option: "wait", cost: 0 }])}::jsonb)
    RETURNING id
  `.execute(db());
  return row.rows[0].id;
}

async function approvalRow(id: string): Promise<Record<string, unknown>> {
  const res = await sql<Record<string, unknown>>`
    SELECT * FROM approvals WHERE id = ${id}
  `.execute(db());
  return res.rows[0];
}

// ── §6 classification: rule scan, priority, fail-closed ─────────────────────

describe("fn_classify_operation (§3/§6/§16)", () => {
  it("unknown operation fails CLOSED: gated/other, no rule", async () => {
    const res = await sql<{ c: { gate: string; risk_class: string; rule_id: string | null } }>`
      SELECT fn_classify_operation('totally.unknown.e93', '{}'::jsonb) AS c
    `.execute(db());
    expect(res.rows[0].c).toMatchObject({ gate: "gated", risk_class: "other", rule_id: null });
  });

  it("every money-out family classifies money_out/gated (dashboard prefix parity)", async () => {
    // Mirrors MONEY_OUT_PREFIXES in apps/dashboard/src/lib/approvals.ts —
    // the seed and the badge must never drift apart.
    for (const base of ["payment", "transfer", "ad_spend", "refund", "payout"]) {
      for (const op of [base, `${base}.stripe`, `${base}_wise`]) {
        const res = await sql<{ c: { gate: string; risk_class: string } }>`
          SELECT fn_classify_operation(${op}) AS c
        `.execute(db());
        expect(res.rows[0].c, op).toMatchObject({ gate: "gated", risk_class: "money_out" });
      }
    }
  });

  it("priority-ordered FIRST match wins", async () => {
    await sql`INSERT INTO approval_rules (operation_pattern, risk_class, gate, locked, priority, updated_by)
              VALUES ('payment.e93special*', 'other', 'notify', false, 5, ${PROBE})`.execute(db());
    const res = await sql<{ c: { gate: string; rule_id: string } }>`
      SELECT fn_classify_operation('payment.e93special.case') AS c
    `.execute(db());
    expect(res.rows[0].c.gate).toBe("notify"); // priority 5 beats the locked 10
    const still = await sql<{ c: { gate: string } }>`
      SELECT fn_classify_operation('payment.other.case') AS c
    `.execute(db());
    expect(still.rows[0].c.gate).toBe("gated"); // sibling ops untouched
  });

  it("kernel wrapper returns the same classification (§3 single point)", async () => {
    const c = await classifyOperation("transfer.sepa");
    expect(c).toMatchObject({ gate: "gated", risk_class: "money_out" });
    const unknown = await classifyOperation("mystery.op.e93");
    expect(unknown.gate).toBe("gated");
  });
});

// ── B7b layer 1: locked rules immutable ─────────────────────────────────────

describe("approval_rules locked wall (B7b layer 1)", () => {
  it("direct UPDATE and DELETE of a locked rule raise", async () => {
    await expect(
      sql`UPDATE approval_rules SET gate = 'autonomous' WHERE operation_pattern = 'payment.*'`.execute(db()),
    ).rejects.toThrow(/locked \(B7b\)/);
    await expect(
      sql`DELETE FROM approval_rules WHERE operation_pattern = 'payment.*'`.execute(db()),
    ).rejects.toThrow(/locked \(B7b\)/);
  });

  it("change_policy on a locked rule is rejected with a clean error", async () => {
    const apprId = await makeApproval({});
    const rule = await sql<{ id: string }>`
      SELECT id FROM approval_rules WHERE operation_pattern = 'payment.*'
    `.execute(db());
    const res = await ceoAction({
      op: "decide", approval_id: apprId, action: "change_policy",
      rule_id: rule.rows[0].id, set: { gate: "autonomous" },
    });
    expect(res.ok).toBe(false);
    expect(res.error).toBe("VALIDATION_FAILED");
    expect(String(res.detail)).toMatch(/locked/);
  });
});

// ── grant walls (§13/§16) ────────────────────────────────────────────────────

describe("grant walls", () => {
  it("B7b DB proof: authenticated has NO direct outbox INSERT or approvals UPDATE", async () => {
    const res = await sql<{ outbox_insert: boolean; approvals_update: boolean; appr_trunc: boolean; outbox_trunc: boolean }>`
      SELECT has_table_privilege('authenticated', 'outbox', 'INSERT') AS outbox_insert,
             has_table_privilege('authenticated', 'approvals', 'UPDATE') AS approvals_update,
             has_table_privilege('anon', 'approvals', 'TRUNCATE') AS appr_trunc,
             has_table_privilege('anon', 'outbox', 'TRUNCATE') AS outbox_trunc
    `.execute(db());
    expect(res.rows[0]).toEqual({
      outbox_insert: false, approvals_update: false,
      appr_trunc: false, outbox_trunc: false,
    });
  });

  it("anon cannot execute the control fn or the classifier", async () => {
    const res = await sql<{ ctl: boolean; cls: boolean }>`
      SELECT has_function_privilege('anon', 'control_approvals_action(jsonb,text)', 'EXECUTE') AS ctl,
             has_function_privilege('anon', 'fn_classify_operation(text,jsonb)', 'EXECUTE') AS cls
    `.execute(db());
    expect(res.rows[0]).toEqual({ ctl: false, cls: false });
  });

  it("system actor cannot DECIDE (§13: decisions are CEO-only)", async () => {
    const apprId = await makeApproval({});
    const res = await systemAction({ op: "decide", approval_id: apprId, action: "approve" });
    expect(res).toMatchObject({ ok: false, error: "PERMISSION_DENIED" });
    expect((await approvalRow(apprId)).status).toBe("pending");
  });
});

// ── the 7 CEO actions (R4/§6) ────────────────────────────────────────────────

describe("control_approvals_action — 7 actions", () => {
  it("approve: approved + outbox born in the SAME fn transaction + decision_log + audit", async () => {
    const apprId = await makeApproval({});
    const res = await ceoAction({ op: "decide", approval_id: apprId, action: "approve", note: "e93 yes" });
    expect(res.ok).toBe(true);
    expect(res.outbox_id).toBeTruthy();

    const row = await approvalRow(apprId);
    expect(row.status).toBe("approved");
    expect(row.decided_action).toBe("approve");
    expect(row.decided_by).toBe("ceo");

    const outbox = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM outbox WHERE approval_id = ${apprId}
    `.execute(db());
    expect(outbox.rows[0].n).toBe(1);

    const dl = await sql<{ decision: string }>`
      SELECT decision FROM decision_log WHERE approval_id = ${apprId}
    `.execute(db());
    expect(dl.rows[0].decision).toBe("approve"); // R7 decision bond

    const audit = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM audit_log
       WHERE action = 'approval.approve' AND detail_ref = ${JSON.stringify({ table: "approvals", id: apprId })}::jsonb
    `.execute(db());
    expect(audit.rows[0].n).toBe(1);
  });

  it("reject: rejected, NO outbox row", async () => {
    const apprId = await makeApproval({});
    const res = await ceoAction({ op: "decide", approval_id: apprId, action: "reject", note: "e93 no" });
    expect(res.ok).toBe(true);
    expect((await approvalRow(apprId)).status).toBe("rejected");
    const outbox = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM outbox WHERE approval_id = ${apprId}
    `.execute(db());
    expect(outbox.rows[0].n).toBe(0);
  });

  it("approve_with_modifications: payload merged, delta stored, original hash audited (A6)", async () => {
    const apprId = await makeApproval({ payload: { amount_eur: 42, recipient: "probe GmbH" } });
    const noMods = await ceoAction({
      op: "decide", approval_id: apprId, action: "approve_with_modifications",
    });
    expect(noMods).toMatchObject({ ok: false, error: "VALIDATION_FAILED" });

    const res = await ceoAction({
      op: "decide", approval_id: apprId, action: "approve_with_modifications",
      modifications: { amount_eur: 30 }, note: "capped",
    });
    expect(res.ok).toBe(true);

    const row = await approvalRow(apprId);
    expect(row.status).toBe("approved");
    expect(row.decided_action).toBe("approve_with_modifications");
    expect((row.payload as Record<string, unknown>).amount_eur).toBe(30);
    expect((row.payload as Record<string, unknown>).recipient).toBe("probe GmbH");
    expect((row.modifications as Record<string, unknown>).amount_eur).toBe(30);

    const audit = await sql<{ payload: { payload_hash: string } }>`
      SELECT payload FROM audit_log WHERE action = 'approval.approve_with_modifications'
       AND payload->>'approval_id' = ${apprId}
    `.execute(db());
    // hash of the ORIGINAL payload — pre-merge (A6)
    expect(audit.rows[0].payload.payload_hash).not.toBe(null);
  });

  it("delegate: analysis task to the employee, approval STAYS pending, single level only (§26)", async () => {
    const empId = await makeEmployee("delegate");
    const apprId = await makeApproval({});
    const res = await ceoAction({
      op: "decide", approval_id: apprId, action: "delegate",
      employee_id: empId, note: "analyze this",
    });
    expect(res.ok).toBe(true);
    expect(res.task_id).toBeTruthy();

    const row = await approvalRow(apprId);
    expect(row.status).toBe("pending"); // decision stays with the CEO
    expect(row.delegated_to).toBe(empId);
    const reviews = row.previous_reviews as Array<Record<string, unknown>>;
    expect(reviews.some((r) => r.type === "delegation")).toBe(true);

    const task = await sql<{ status: string; agent_id: string }>`
      SELECT status, agent_id FROM tasks WHERE id = ${String(res.task_id)}
    `.execute(db());
    expect(task.rows[0]).toMatchObject({ status: "queued", agent_id: empId });

    const again = await ceoAction({
      op: "decide", approval_id: apprId, action: "delegate", employee_id: empId,
    });
    expect(again).toMatchObject({ ok: false, error: "VALIDATION_FAILED" });
    expect(String(again.detail)).toMatch(/single-level/);
  });

  it("request_info: review appended + task to the requester when known", async () => {
    const empId = await makeEmployee("requester");
    const apprId = await makeApproval({ requester_employee_id: empId });
    const res = await ceoAction({
      op: "decide", approval_id: apprId, action: "request_info", note: "which vendor?",
    });
    expect(res.ok).toBe(true);
    expect(res.task_id).toBeTruthy();
    const reviews = (await approvalRow(apprId)).previous_reviews as Array<Record<string, unknown>>;
    expect(reviews.some((r) => r.type === "info_request" && r.note === "which vendor?")).toBe(true);
  });

  it("reanalyze: catalog-validated model, L3 analysis task, system appends the result (§6)", async () => {
    const apprId = await makeApproval({});
    const bad = await ceoAction({
      op: "decide", approval_id: apprId, action: "reanalyze", model_id: "no-such-model",
    });
    expect(bad).toMatchObject({ ok: false, error: "VALIDATION_FAILED" });

    const model = await sql<{ id: string }>`
      SELECT id FROM model_catalog WHERE banned = false AND status = 'active' LIMIT 1
    `.execute(db());
    const res = await ceoAction({
      op: "decide", approval_id: apprId, action: "reanalyze", model_id: model.rows[0].id,
    });
    expect(res.ok).toBe(true);
    const task = await sql<{ model_tier: string }>`
      SELECT model_tier FROM tasks WHERE id = ${String(res.task_id)}
    `.execute(db());
    expect(task.rows[0].model_tier).toBe("L3"); // "re-analyze with STRONGER model"

    // system lane: the analysis result lands as previous_reviews, row stays pending
    const sys = await systemAction({
      op: "append_review", approval_id: apprId,
      review: { type: "reanalysis_result", verdict: "safe", confidence: 0.93 },
    });
    expect(sys.ok).toBe(true);
    const row = await approvalRow(apprId);
    expect(row.status).toBe("pending");
    const reviews = row.previous_reviews as Array<Record<string, unknown>>;
    expect(reviews.some((r) => r.type === "reanalysis_result")).toBe(true);
  });

  it("change_policy on an UNLOCKED rule: settings_change_log + rule updated + approval linked", async () => {
    await sql`INSERT INTO approval_rules (operation_pattern, risk_class, gate, locked, priority, updated_by)
              VALUES ('e93policy.*', 'other', 'gated', false, 60, ${PROBE})`.execute(db());
    const rule = await sql<{ id: string }>`
      SELECT id FROM approval_rules WHERE operation_pattern = 'e93policy.*'
    `.execute(db());
    const apprId = await makeApproval({ action_type: "e93policy.case", operation: "e93policy.case" });
    const res = await ceoAction({
      op: "decide", approval_id: apprId, action: "change_policy",
      rule_id: rule.rows[0].id, set: { gate: "notify" }, note: "always fine",
    });
    expect(res.ok).toBe(true);
    expect(res.policy_change_id).toBeTruthy();

    const updated = await sql<{ gate: string; updated_by: string }>`
      SELECT gate, updated_by FROM approval_rules WHERE id = ${rule.rows[0].id}
    `.execute(db());
    expect(updated.rows[0]).toMatchObject({ gate: "notify", updated_by: "ceo" });

    const scl = await sql<{ old_value: { gate: string }; new_value: { gate: string } }>`
      SELECT old_value, new_value FROM settings_change_log
       WHERE id = ${Number(res.policy_change_id)}
    `.execute(db());
    expect(scl.rows[0].old_value.gate).toBe("gated");
    expect(scl.rows[0].new_value.gate).toBe("notify");

    expect((await approvalRow(apprId)).policy_change_id).toBe(String(res.policy_change_id));
  });
});

// ── walls: pending-only + idempotency (§8/§17) ───────────────────────────────

describe("decision walls", () => {
  it("deciding a non-pending approval is refused", async () => {
    const apprId = await makeApproval({});
    await ceoAction({ op: "decide", approval_id: apprId, action: "reject" });
    const res = await ceoAction({ op: "decide", approval_id: apprId, action: "approve" });
    expect(res).toMatchObject({ ok: false, error: "VALIDATION_FAILED" });
    expect(String(res.detail)).toMatch(/rejected, not pending/);
  });

  it("idempotency: replay returns the SAME response (no double release), body drift → MISMATCH", async () => {
    const apprId = await makeApproval({});
    const key = `e93t-idem-${randomUUID()}`;
    const payload = { op: "decide", approval_id: apprId, action: "approve", note: "once" };

    const first = await ceoActionKeyed(payload, key);
    expect(first.ok).toBe(true);
    const replay = await ceoActionKeyed(payload, key);
    expect(replay).toEqual(first);

    const outbox = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM outbox WHERE approval_id = ${apprId}
    `.execute(db());
    expect(outbox.rows[0].n).toBe(1); // double release impossible (§8)

    const drift = await ceoActionKeyed({ ...payload, note: "twice" }, key);
    expect(drift).toMatchObject({ ok: false, error: "IDEMPOTENCY_MISMATCH" });
  });
});

// ── views (§4/§7/§26) ────────────────────────────────────────────────────────

describe("v_approvals_center + v_approval_fatigue", () => {
  it("center row carries money_out, stale (7d+) and expired flags + requester join", async () => {
    const empId = await makeEmployee("center");
    const apprId = await makeApproval({
      requester_employee_id: empId,
      deadline: new Date(Date.now() - 3600_000), // already past
    });
    await sql`UPDATE approvals SET created_at = now() - interval '8 days'
              WHERE id = ${apprId}`.execute(db());
    const res = await sql<Record<string, unknown>>`
      SELECT money_out, stale, expired, requester_slug, age_seconds
        FROM v_approvals_center WHERE id = ${apprId}
    `.execute(db());
    expect(res.rows[0].money_out).toBe(true); // payment.* fixture
    expect(res.rows[0].stale).toBe(true);
    expect(res.rows[0].expired).toBe(true);
    expect(String(res.rows[0].requester_slug)).toMatch(/^e93t-center/);
    expect(Number(res.rows[0].age_seconds)).toBeGreaterThan(7 * 24 * 3600);
  });

  it("fatigue view aggregates per class with pending counts (R6 — no table)", async () => {
    await makeApproval({}); // ensures ≥1 pending money_out
    const res = await sql<{ operation_class: string; pending_count: number }>`
      SELECT operation_class, pending_count::int AS pending_count
        FROM v_approval_fatigue WHERE operation_class = 'money_out'
    `.execute(db());
    expect(res.rows.length).toBe(1);
    expect(res.rows[0].pending_count).toBeGreaterThanOrEqual(1);
  });
});

// ── §9 alert sweeps ──────────────────────────────────────────────────────────

describe("fn_alerts_evaluate approval sweeps (§9)", () => {
  it("money_out pending >24h raises ONE High alert (dedup on replay)", async () => {
    const apprId = await makeApproval({});
    await sql`UPDATE approvals SET created_at = now() - interval '25 hours'
              WHERE id = ${apprId}`.execute(db());
    await sql`SELECT fn_alerts_evaluate()`.execute(db());
    await sql`SELECT fn_alerts_evaluate()`.execute(db());
    const res = await sql<{ n: number; level: string }>`
      SELECT count(*)::int AS n, min(level) AS level FROM alerts
       WHERE dedup_key = ${"approval-moneyout-" + apprId} AND resolved_at IS NULL
       GROUP BY dedup_key
    `.execute(db());
    expect(res.rows[0]).toMatchObject({ n: 1, level: "high" });
  });

  it("deadline window: <25% remaining → attention; already expired → high EXPIRED", async () => {
    const nearId = await makeApproval({ deadline: new Date(Date.now() + 30 * 60_000) });
    await sql`UPDATE approvals SET created_at = now() - interval '3 hours'
              WHERE id = ${nearId}`.execute(db()); // 3.5h window, 30m left < 25%
    const expiredId = await makeApproval({ deadline: new Date(Date.now() - 60_000) });
    await sql`SELECT fn_alerts_evaluate()`.execute(db());

    const near = await sql<{ level: string; title: string }>`
      SELECT level, title FROM alerts WHERE dedup_key = ${"approval-deadline-" + nearId}
    `.execute(db());
    expect(near.rows[0].level).toBe("attention");

    const expired = await sql<{ level: string; title: string }>`
      SELECT level, title FROM alerts WHERE dedup_key = ${"approval-deadline-" + expiredId}
    `.execute(db());
    expect(expired.rows[0].level).toBe("high");
    expect(expired.rows[0].title).toMatch(/EXPIRED/);
  });
});

// ── cleanup (suites must leave CEO surfaces clean) ───────────────────────────
// Runs BEFORE too: a killed previous run must not fail this one (self-heal).

async function sweepProbeRows(): Promise<void> {
  const ids = (
    await sql<{ id: string }>`SELECT id FROM approvals WHERE purpose = ${PROBE}`.execute(db())
  ).rows.map((r) => r.id);
  if (ids.length > 0) {
    await sql`DELETE FROM alerts WHERE source = 'approvals'
      AND source_ref->>'id' = ANY(${ids.map(String)}::text[])`.execute(db());
    await sql`DELETE FROM outbox WHERE approval_id = ANY(${ids}::uuid[])`.execute(db());
    await sql`DELETE FROM decision_log WHERE approval_id = ANY(${ids}::uuid[])`.execute(db());
    await sql`DELETE FROM audit_log WHERE action LIKE 'approval.%'
      AND payload->>'approval_id' = ANY(${ids.map(String)}::text[])`.execute(db());
    await sql`DELETE FROM approvals WHERE id = ANY(${ids}::uuid[])`.execute(db());
  }
  // task sweep by shape (covers delegate/request_info via probe agents and
  // reanalyze via its fixed objective prefix — also heals aborted runs)
  await sql`DELETE FROM tasks WHERE output_contract = 'analysis-report-v1'
    AND agent_id IN (SELECT id FROM agents WHERE slug LIKE 'e93t-%')`.execute(db());
  await sql`DELETE FROM tasks WHERE output_contract = 'analysis-report-v1'
    AND objective LIKE 'Re-analyze approval %'`.execute(db());
  await sql`DELETE FROM settings_change_log WHERE change_source = 'ui'
    AND key LIKE 'approval_rules.e93%'`.execute(db());
  await sql`DELETE FROM approval_rules WHERE updated_by = ${PROBE}
    OR operation_pattern LIKE 'e93%' OR operation_pattern LIKE 'payment.e93%'`.execute(db());
  await sql`DELETE FROM control_idempotency WHERE key LIKE 'e93t-%'`.execute(db());
  await sql`DELETE FROM agents WHERE slug LIKE 'e93t-%'`.execute(db());
}

beforeAll(async () => {
  await sweepProbeRows();
});

afterAll(async () => {
  await sweepProbeRows();
  await closeDb();
});
