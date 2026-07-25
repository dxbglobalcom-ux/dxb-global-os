import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/index.js";

// E8.4 verification — AUDIT_AND_LOGGING_SPEC §8/§9/§13/§21:
//   v_audit_trail resolves BOTH detail_ref shapes (canonical §4 + legacy
//   writer keys) to the family record in one query; the ONE audit-family
//   mutation control_audit_mark_reviewed updates file_changes.review_status,
//   writes a canonical-shape audit row, is idempotent, and reviewed_flagged
//   is the only log write that broadcasts (alert.raised on dxb:alerts).
// Pure DB against the local Supabase stack; probe rows cleaned in afterAll
// (audit probe rows removed as postgres — test hygiene, the append-only
// grants under test bind authenticated, not the owner).
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const db = () => getDb();
const probeTaskIds: string[] = [];
const probeRunIds: string[] = [];
const probeDecisionIds: number[] = [];
const probeFileChangeIds: number[] = [];
const probeAuditIds: number[] = [];
const probeIdemKeys: string[] = [];

async function makeRun(objective: string): Promise<{ taskId: string; runId: string }> {
  const task = await sql<{ id: string }>`
    INSERT INTO tasks (department, objective, output_contract, model_tier, status)
    -- 'inbox', not 'queued': these rows are FK anchors only. A 'queued' probe
    -- races the RESIDENT daemon's drain tick, which claims it mid-suite and
    -- writes real-actor decision rows onto the CEO ticker (2026-07-25 triage).
    VALUES ('engineering', ${objective}, 'probe output', 'L4', 'inbox')
    RETURNING id
  `.execute(db());
  const taskId = task.rows[0].id;
  probeTaskIds.push(taskId);
  const run = await sql<{ id: string }>`
    INSERT INTO agent_runs (task_id, status, model_id)
    VALUES (${taskId}::uuid, 'succeeded', 'claude-opus-4-8')
    RETURNING id
  `.execute(db());
  const runId = run.rows[0].id;
  probeRunIds.push(runId);
  return { taskId, runId };
}

async function makeFileChange(runId: string, path: string): Promise<number> {
  const row = await sql<{ id: number }>`
    INSERT INTO file_changes (run_id, path, op, diff_summary)
    VALUES (${runId}::uuid, ${path}, 'modify', 'probe diff summary')
    RETURNING id
  `.execute(db());
  const id = Number(row.rows[0].id);
  probeFileChangeIds.push(id);
  return id;
}

function markReviewed(payload: Record<string, unknown>, key: string) {
  probeIdemKeys.push(key);
  return sql<{ resp: { ok: boolean; error?: string; audit_id?: number; review_status?: string } }>`
    SELECT public.control_audit_mark_reviewed(${JSON.stringify(payload)}::jsonb, ${key}) AS resp
  `.execute(db());
}

afterAll(async () => {
  if (probeAuditIds.length > 0) {
    await sql`DELETE FROM audit_log WHERE id = ANY(${probeAuditIds}::bigint[])`.execute(db());
  }
  await sql`DELETE FROM audit_log WHERE action = 'audit.mark_reviewed' AND (payload->>'path') LIKE 'probe/e84/%'`.execute(db());
  if (probeIdemKeys.length > 0) {
    await sql`DELETE FROM control_idempotency WHERE key = ANY(${probeIdemKeys}::text[])`.execute(db());
  }
  if (probeDecisionIds.length > 0) {
    await sql`DELETE FROM decision_log WHERE id = ANY(${probeDecisionIds}::bigint[])`.execute(db());
  }
  if (probeFileChangeIds.length > 0) {
    await sql`DELETE FROM file_changes WHERE id = ANY(${probeFileChangeIds}::bigint[])`.execute(db());
  }
  if (probeRunIds.length > 0) {
    // E8.4b: flagged-review probes raise alerts rows (FK → agent_runs);
    // probe hygiene as postgres — real alerts are otherwise kept (§22).
    await sql`DELETE FROM alerts WHERE run_id = ANY(${probeRunIds}::uuid[])`.execute(db());
    await sql`DELETE FROM decision_log WHERE run_id = ANY(${probeRunIds}::uuid[])`.execute(db());
    await sql`DELETE FROM agent_runs WHERE id = ANY(${probeRunIds}::uuid[])`.execute(db());
  }
  if (probeTaskIds.length > 0) {
    await sql`DELETE FROM task_events WHERE task_id = ANY(${probeTaskIds}::uuid[])`.execute(db());
    await sql`DELETE FROM tasks WHERE id = ANY(${probeTaskIds}::uuid[])`.execute(db());
  }
  await closeDb();
});

describe("E8.4 v_audit_trail — detail_ref resolved to the family record (§8)", () => {
  it("resolves the LEGACY writer shape ({\"<table>_id\": N}) — pre-E8.4 rows drill", async () => {
    // The pre-E8.4 live legacy rows this test originally leaned on have been
    // swept by suite hygiene since; re-prove the legacy leg hermetically in a
    // rolled-back transaction instead of depending on live residue.
    await db().transaction().execute(async (trx) => {
      const scl = await sql<{ id: number }>`
        INSERT INTO settings_change_log (key, scope, new_value, changed_by, change_source)
        VALUES ('e84.probe.legacy-shape', 'global', '"probe"'::jsonb, 'test:e84-audit', 'system')
        RETURNING id
      `.execute(trx);
      const audit = await sql<{ id: number }>`
        INSERT INTO audit_log (actor, actor_type, action, detail_ref)
        VALUES ('test:e84-audit', 'system', 'settings.change',
                jsonb_build_object('settings_change_log_id', ${scl.rows[0].id}::bigint))
        RETURNING id
      `.execute(trx);
      const rows = await sql<{ ref_table: string; ref_id: string; ref_summary: Record<string, unknown> | null }>`
        SELECT ref_table, ref_id, ref_summary FROM v_audit_trail WHERE id = ${audit.rows[0].id}
      `.execute(trx);
      expect(rows.rows).toHaveLength(1);
      expect(rows.rows[0].ref_table).toBe("settings_change_log");
      expect(rows.rows[0].ref_id).toBe(String(scl.rows[0].id));
      // property-path assertion (an inline {key: "..."} literal trips the
      // gitleaks generic-api-key rule — it is a settings key name, not a secret)
      expect(rows.rows[0].ref_summary?.key).toBe("e84.probe.legacy-shape");
      throw new Error("ROLLBACK-PROBE");
    }).catch((err) => {
      if (!String(err).includes("ROLLBACK-PROBE")) throw err;
    });
  });

  it("resolves the CANONICAL §4 shape ({\"table\",\"id\"}) + surfaces decision risk for the filter", async () => {
    const { runId } = await makeRun("E8.4 probe: canonical detail_ref");
    const dec = await sql<{ id: number }>`
      INSERT INTO decision_log (run_id, decided_by, decision, rationale, data_used, alternatives, confidence, risk, outcome)
      VALUES (${runId}::uuid, 'orchestrator', 'e84 probe decision', 'probe rationale',
              ARRAY['probe:data'], '[{"option":"other","why_not":"probe"}]'::jsonb, 0.9, 'high', 'applied')
      RETURNING id
    `.execute(db());
    const decisionId = Number(dec.rows[0].id);
    probeDecisionIds.push(decisionId);

    const audit = await sql<{ id: number }>`
      INSERT INTO audit_log (actor, actor_type, action, payload, detail_ref)
      VALUES ('e84-test', 'system', 'decision',
              '{"probe": true}'::jsonb,
              jsonb_build_object('table', 'decision_log', 'id', ${decisionId}::bigint))
      RETURNING id
    `.execute(db());
    probeAuditIds.push(Number(audit.rows[0].id));

    const row = await sql<{ ref_table: string; ref_summary: Record<string, unknown>; ref_risk: string }>`
      SELECT ref_table, ref_summary, ref_risk FROM v_audit_trail WHERE id = ${audit.rows[0].id}
    `.execute(db());
    expect(row.rows[0].ref_table).toBe("decision_log");
    expect(row.rows[0].ref_summary).toMatchObject({
      decided_by: "orchestrator",
      decision: "e84 probe decision",
      risk: "high",
      outcome: "applied",
    });
    expect(row.rows[0].ref_risk).toBe("high"); // §7 risk filter column
  });

  it("v_decision_log answers the 8 directive questions + run→task context in one query", async () => {
    const probe = await sql<Record<string, unknown>>`
      SELECT decided_by, decision, rationale, data_used, alternatives, confidence,
             risk, approval_id, outcome, employee, task_objective
      FROM v_decision_log WHERE decision = 'e84 probe decision'
    `.execute(db());
    expect(probe.rows).toHaveLength(1);
    const d = probe.rows[0];
    // 10.2: who / rationale / data / alternatives / confidence / risk / approval / outcome
    expect(d.decided_by).toBe("orchestrator");
    expect(d.rationale).toBe("probe rationale");
    expect(d.data_used).toEqual(["probe:data"]);
    expect(Array.isArray(d.alternatives)).toBe(true);
    expect(Number(d.confidence)).toBeCloseTo(0.9);
    expect(d.risk).toBe("high");
    expect(d).toHaveProperty("approval_id");
    expect(d.outcome).toBe("applied");
    expect(d.task_objective).toBe("E8.4 probe: canonical detail_ref");
  });
});

describe("E8.4 control_audit_mark_reviewed — the single audit-family mutation (§8/§9)", () => {
  it("reviewed_ok: updates review_status + writes a canonical-ref audit row that drills back", async () => {
    const { runId } = await makeRun("E8.4 probe: mark reviewed ok");
    const fcId = await makeFileChange(runId, "probe/e84/ok.ts");

    const res = await markReviewed({ file_change_id: fcId, status: "reviewed_ok" }, `e84-ok-${fcId}`);
    expect(res.rows[0].resp).toMatchObject({ ok: true, review_status: "reviewed_ok" });
    const auditId = res.rows[0].resp.audit_id!;
    probeAuditIds.push(Number(auditId));

    const fc = await sql<{ review_status: string }>`
      SELECT review_status FROM file_changes WHERE id = ${fcId}
    `.execute(db());
    expect(fc.rows[0].review_status).toBe("reviewed_ok");

    // Roadmap acceptance chain, DB side: the audit row resolves to the family
    // record through v_audit_trail (canonical shape written by the fn).
    const trail = await sql<{ ref_table: string; ref_summary: Record<string, unknown> }>`
      SELECT ref_table, ref_summary FROM v_audit_trail WHERE id = ${auditId}
    `.execute(db());
    expect(trail.rows[0].ref_table).toBe("file_changes");
    expect(trail.rows[0].ref_summary).toMatchObject({
      path: "probe/e84/ok.ts",
      review_status: "reviewed_ok",
    });
  });

  it("replay with the same key is idempotent; same key + different payload → IDEMPOTENCY_MISMATCH", async () => {
    const { runId } = await makeRun("E8.4 probe: idempotency");
    const fcId = await makeFileChange(runId, "probe/e84/idem.ts");
    const key = `e84-idem-${fcId}`;

    const first = await markReviewed({ file_change_id: fcId, status: "reviewed_ok" }, key);
    const replay = await markReviewed({ file_change_id: fcId, status: "reviewed_ok" }, key);
    expect(replay.rows[0].resp).toEqual(first.rows[0].resp); // stored response, no second audit row
    probeAuditIds.push(Number(first.rows[0].resp.audit_id!));

    const clash = await markReviewed({ file_change_id: fcId, status: "reviewed_flagged" }, key);
    expect(clash.rows[0].resp).toMatchObject({ ok: false, error: "IDEMPOTENCY_MISMATCH" });

    const count = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM audit_log
      WHERE action = 'audit.mark_reviewed' AND (payload->>'file_change_id')::bigint = ${fcId}
    `.execute(db());
    expect(count.rows[0].n).toBe(1);
  });

  it("reviewed_flagged → alerts ROW + alert.raised on dxb:alerts (§9; E8.4b single producer)", async () => {
    // E8.4b refit: the fn INSERTs an alerts row and trg_alerts_broadcast is
    // the ONE alerts-channel producer — envelope entity is the alert itself.
    const { taskId, runId } = await makeRun("E8.4 probe: flagged alert");
    const fcId = await makeFileChange(runId, "probe/e84/flagged.ts");
    const since = new Date(Date.now() - 1000);

    const res = await markReviewed(
      { file_change_id: fcId, status: "reviewed_flagged", note: "suspicious diff" },
      `e84-flag-${fcId}`,
    );
    expect(res.rows[0].resp).toMatchObject({ ok: true, review_status: "reviewed_flagged" });
    probeAuditIds.push(Number(res.rows[0].resp.audit_id!));
    const alertId = (res.rows[0].resp as { alert_id?: string }).alert_id;
    expect(alertId).toBeTruthy();

    const alert = await sql<Record<string, unknown>>`
      SELECT level, source, title, run_id, task_id, source_ref
      FROM alerts WHERE id = ${alertId}::uuid
    `.execute(db());
    expect(alert.rows[0]).toMatchObject({
      level: "attention",
      source: "file_review",
      run_id: runId,
      task_id: taskId,
      source_ref: { table: "file_changes", id: fcId },
    });

    const msgs = await sql<{ payload: Record<string, any> }>`
      SELECT payload FROM realtime.messages
      WHERE topic = 'dxb:alerts' AND extension = 'broadcast'
        AND inserted_at >= ${since.toISOString()}::timestamp
    `.execute(db());
    const mine = msgs.rows.filter(
      (r) => r.payload.type === "alert.raised" && r.payload.payload?.alert_id === alertId,
    );
    expect(mine).toHaveLength(1);
    expect(mine[0].payload.entity).toMatchObject({ kind: "alert", id: alertId });
    expect(mine[0].payload.corr).toMatchObject({ task_id: taskId, run_id: runId });
    expect(mine[0].payload.payload).toMatchObject({
      source: "file_review",
      level: "attention",
    });
  });

  it("validation + actor wall: unknown row / bad status refuse; anon holds NO execute grant", async () => {
    const bogus = await markReviewed({ file_change_id: 999999999, status: "reviewed_ok" }, "e84-bogus-row");
    expect(bogus.rows[0].resp).toMatchObject({ ok: false, error: "VALIDATION_FAILED" });

    const { runId } = await makeRun("E8.4 probe: validation");
    const fcId = await makeFileChange(runId, "probe/e84/badstatus.ts");
    const bad = await markReviewed({ file_change_id: fcId, status: "unreviewed" }, `e84-bad-${fcId}`);
    expect(bad.rows[0].resp).toMatchObject({ ok: false, error: "VALIDATION_FAILED" });

    // The real wall: anon cannot even EXECUTE the fn (SECURITY DEFINER makes
    // in-body current_user the owner, so grants are the enforcement layer;
    // authenticated always carries a jwt through PostgREST → 'ceo').
    const grants = await sql<{ anon_exec: boolean; auth_exec: boolean }>`
      SELECT has_function_privilege('anon', 'public.control_audit_mark_reviewed(jsonb, text)', 'EXECUTE') AS anon_exec,
             has_function_privilege('authenticated', 'public.control_audit_mark_reviewed(jsonb, text)', 'EXECUTE') AS auth_exec
    `.execute(db());
    expect(grants.rows[0]).toEqual({ anon_exec: false, auth_exec: true });
  });

  it("append-only wall holds for authenticated (§13/§21 re-proof)", async () => {
    await expect(
      db().transaction().execute(async (trx) => {
        await sql`SET LOCAL ROLE authenticated`.execute(trx);
        await sql`UPDATE decision_log SET decision = 'x' WHERE false`.execute(trx);
      }),
    ).rejects.toThrow(/permission denied/);
    await expect(
      db().transaction().execute(async (trx) => {
        await sql`SET LOCAL ROLE authenticated`.execute(trx);
        await sql`UPDATE file_changes SET review_status = 'reviewed_ok' WHERE false`.execute(trx);
      }),
    ).rejects.toThrow(/permission denied/); // column mutates ONLY through the fn
  });
});
