import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/index.js";

// E8.4b verification — OBSERVABILITY_SPEC §3/§4/§8/§9/§13, COST_CONTROL R4,
// MODEL_ROUTING §9/§17, GAP-10:
//   every real alarm source fires (run failure, cost thresholds with dedup,
//   fallback depth ≥2 / chain exhausted, budget stop), fn_alerts_evaluate
//   covers the time-based checks (queue age, heartbeat loss, escalation),
//   and control_alerts_action drives the full lifecycle (ack → AUDIT ROW =
//   roadmap acceptance, resolve, assign, mute) idempotently behind grants.
// Sources with system-wide side effects (cost, budget flags, catalog edits)
// are probed inside ROLLBACK transactions — zero residue (E7.1 idiom).
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const db = () => getDb();
const probeTaskIds: string[] = [];
const probeRunIds: string[] = [];
const probeAlertIds: string[] = [];
const probeAuditIds: number[] = [];
const probeIdemKeys: string[] = [];

async function makeRun(objective: string): Promise<{ taskId: string; runId: string }> {
  const task = await sql<{ id: string }>`
    INSERT INTO tasks (department, objective, output_contract, model_tier, status)
    VALUES ('engineering', ${objective}, 'probe output', 'L4', 'queued')
    RETURNING id
  `.execute(db());
  const taskId = task.rows[0].id;
  probeTaskIds.push(taskId);
  const run = await sql<{ id: string }>`
    INSERT INTO agent_runs (task_id, status, model_id)
    VALUES (${taskId}::uuid, 'running', 'claude-opus-4-8')
    RETURNING id
  `.execute(db());
  const runId = run.rows[0].id;
  probeRunIds.push(runId);
  return { taskId, runId };
}

async function makeAlert(level: string, title: string): Promise<string> {
  const row = await sql<{ id: string }>`
    INSERT INTO alerts (level, source, title, affected_area)
    VALUES (${level}, 'probe', ${title}, 'e84b test')
    RETURNING id
  `.execute(db());
  probeAlertIds.push(row.rows[0].id);
  return row.rows[0].id;
}

function alertAction(payload: Record<string, unknown>, key: string) {
  probeIdemKeys.push(key);
  return sql<{ resp: { ok: boolean; error?: string; audit_id?: number; alert_id?: string } }>`
    SELECT public.control_alerts_action(${JSON.stringify(payload)}::jsonb, ${key}) AS resp
  `.execute(db());
}

afterAll(async () => {
  if (probeAuditIds.length > 0) {
    await sql`DELETE FROM audit_log WHERE id = ANY(${probeAuditIds}::bigint[])`.execute(db());
  }
  if (probeIdemKeys.length > 0) {
    await sql`DELETE FROM control_idempotency WHERE key = ANY(${probeIdemKeys}::text[])`.execute(db());
  }
  // Probe hygiene as postgres — production alerts are append-kept (§22).
  if (probeAlertIds.length > 0) {
    await sql`DELETE FROM alerts WHERE id = ANY(${probeAlertIds}::uuid[])`.execute(db());
  }
  if (probeRunIds.length > 0) {
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

describe("E8.4b alarm sources (OBSERVABILITY §3)", () => {
  it("agent run failure → High alert row + alert.raised on dxb:alerts", async () => {
    const { taskId, runId } = await makeRun("E8.4b probe: run failure alert");
    const since = new Date(Date.now() - 1000);

    await sql`
      UPDATE agent_runs SET status = 'failed', ended_at = now(),
             error = 'probe: provider exploded'
      WHERE id = ${runId}::uuid
    `.execute(db());

    const alert = await sql<{ id: string; level: string; source: string; probable_cause: string; task_id: string }>`
      SELECT id, level, source, probable_cause, task_id
      FROM alerts WHERE run_id = ${runId}::uuid
    `.execute(db());
    expect(alert.rows).toHaveLength(1);
    expect(alert.rows[0]).toMatchObject({
      level: "high",
      source: "agent_run",
      probable_cause: "probe: provider exploded",
      task_id: taskId,
    });

    const msgs = await sql<{ payload: Record<string, any> }>`
      SELECT payload FROM realtime.messages
      WHERE topic = 'dxb:alerts' AND extension = 'broadcast'
        AND inserted_at >= ${since.toISOString()}::timestamp
    `.execute(db());
    const mine = msgs.rows.filter(
      (r) => r.payload.type === "alert.raised" && r.payload.payload?.alert_id === alert.rows[0].id,
    );
    expect(mine).toHaveLength(1);
    expect(mine[0].payload.entity).toMatchObject({ kind: "alert", id: alert.rows[0].id });
    expect(mine[0].payload.corr).toMatchObject({ task_id: taskId, run_id: runId });
    expect(mine[0].payload.payload).toMatchObject({ level: "high", source: "agent_run" });
  });

  it("cost ledger crossing 70/90/100% raises each threshold ONCE (dedup) — rolled back", async () => {
    await db().transaction().execute(async (trx) => {
      const cap = await sql<{ monthly_cap_eur: string }>`
        SELECT monthly_cap_eur FROM budget_state WHERE id = true
      `.execute(trx);
      const over = Number(cap.rows[0].monthly_cap_eur) * 1.01; // pushes past 100%
      await sql`
        INSERT INTO cost_ledger (model, mode, cost_eur, source, department)
        VALUES ('probe-model', 'api', ${over}, 'hook', 'engineering')
      `.execute(trx);

      const month = await sql<{ m: string }>`SELECT to_char(now(), 'YYYYMM') AS m`.execute(trx);
      const alerts = await sql<{ level: string; dedup_key: string }>`
        SELECT level, dedup_key FROM alerts
        WHERE source = 'cost' AND dedup_key LIKE 'cost-' || ${month.rows[0].m} || '-%'
          AND resolved_at IS NULL
        ORDER BY dedup_key
      `.execute(trx);
      expect(alerts.rows.map((r) => r.dedup_key.split("-")[2])).toEqual(["100", "70", "90"]);
      expect(new Set(alerts.rows.map((r) => r.level))).toEqual(
        new Set(["critical", "attention", "high"]),
      );

      // second write while alerts are active → dedup swallows every level
      await sql`
        INSERT INTO cost_ledger (model, mode, cost_eur, source, department)
        VALUES ('probe-model', 'api', 0.01, 'hook', 'engineering')
      `.execute(trx);
      const again = await sql<{ n: number }>`
        SELECT count(*)::int AS n FROM alerts
        WHERE source = 'cost' AND dedup_key LIKE 'cost-' || ${month.rows[0].m} || '-%'
          AND resolved_at IS NULL
      `.execute(trx);
      expect(again.rows[0].n).toBe(alerts.rows.length);

      throw new Error("ROLLBACK-PROBE");
    }).catch((err) => {
      if (!String(err).includes("ROLLBACK-PROBE")) throw err;
    });
  });

  it("budget hard-stop / breaker flags → Critical alerts — rolled back", async () => {
    await db().transaction().execute(async (trx) => {
      await sql`UPDATE budget_state SET hard_stopped = true, breaker_tripped = true WHERE id = true`.execute(trx);
      const rows = await sql<{ dedup_key: string; level: string }>`
        SELECT dedup_key, level FROM alerts
        WHERE dedup_key IN ('budget-hard-stop', 'budget-breaker') AND resolved_at IS NULL
      `.execute(trx);
      expect(rows.rows).toHaveLength(2);
      expect(rows.rows.every((r) => r.level === "critical")).toBe(true);
      throw new Error("ROLLBACK-PROBE");
    }).catch((err) => {
      if (!String(err).includes("ROLLBACK-PROBE")) throw err;
    });
  });

  it("fallback depth ≥2 → High; exhausted chain → Critical (ROUTING §9/§17) — rolled back", async () => {
    await db().transaction().execute(async (trx) => {
      // Make the first hop ineligible so fable-5 → opus(banned) → sonnet = depth 2.
      await sql`UPDATE model_catalog SET banned = true WHERE id = 'claude-opus-4-8'`.execute(trx);
      const fb = await sql<{ resp: { ok: boolean; model_id?: string } }>`
        SELECT fn_model_fallback('fable-5', 'execution', 'probe outage') AS resp
      `.execute(trx);
      expect(fb.rows[0].resp.ok).toBe(true);
      const high = await sql<{ level: string }>`
        SELECT level FROM alerts WHERE dedup_key = 'fallback-execution' AND resolved_at IS NULL
      `.execute(trx);
      expect(high.rows).toHaveLength(1);
      expect(high.rows[0].level).toBe("high");

      // Kill the whole chain below fable-5 → CHAIN_EXHAUSTED → Critical.
      await sql`UPDATE model_catalog SET banned = true WHERE id = 'claude-sonnet-5'`.execute(trx);
      const dead = await sql<{ resp: { ok: boolean; error?: string } }>`
        SELECT fn_model_fallback('fable-5', 'execution', 'probe outage') AS resp
      `.execute(trx);
      expect(dead.rows[0].resp).toMatchObject({ ok: false, error: "CHAIN_EXHAUSTED" });
      const crit = await sql<{ level: string }>`
        SELECT level FROM alerts WHERE dedup_key = 'chain-exhausted-execution' AND resolved_at IS NULL
      `.execute(trx);
      expect(crit.rows).toHaveLength(1);
      expect(crit.rows[0].level).toBe("critical");
      throw new Error("ROLLBACK-PROBE");
    }).catch((err) => {
      if (!String(err).includes("ROLLBACK-PROBE")) throw err;
    });
  });
});

describe("E8.4b fn_alerts_evaluate — time-based checks (queue age, heartbeat, escalation)", () => {
  it("stale queued task → queue-age alert; stale snapshot → heartbeat alert — rolled back", async () => {
    await db().transaction().execute(async (trx) => {
      await sql`
        INSERT INTO tasks (department, objective, output_contract, model_tier, status, created_at)
        VALUES ('engineering', 'E8.4b probe: ancient queued task', 'probe', 'L4', 'queued',
                now() - interval '2 hours')
      `.execute(trx);
      await sql`INSERT INTO system_health_snapshots (at, cpu) VALUES (now() - interval '1 hour', 0.1)`.execute(trx);

      const res = await sql<{ resp: { ok: boolean; raised: number } }>`
        SELECT fn_alerts_evaluate() AS resp
      `.execute(trx);
      expect(res.rows[0].resp.ok).toBe(true);

      const raised = await sql<{ dedup_key: string; level: string }>`
        SELECT dedup_key, level FROM alerts
        WHERE dedup_key IN ('queue-age', 'heartbeat-loss') AND resolved_at IS NULL
      `.execute(trx);
      const byKey = Object.fromEntries(raised.rows.map((r) => [r.dedup_key, r.level]));
      expect(byKey["queue-age"]).toBe("attention");
      expect(byKey["heartbeat-loss"]).toBe("high");
      throw new Error("ROLLBACK-PROBE");
    }).catch((err) => {
      if (!String(err).includes("ROLLBACK-PROBE")) throw err;
    });
  });

  it("empty snapshot table = probe never started → NO heartbeat alert (honest pre-Phase-7)", async () => {
    await db().transaction().execute(async (trx) => {
      const empty = await sql<{ n: number }>`SELECT count(*)::int AS n FROM system_health_snapshots`.execute(trx);
      expect(empty.rows[0].n).toBe(0); // live baseline: Phase-7 probe not running yet
      await sql`SELECT fn_alerts_evaluate()`.execute(trx);
      const hb = await sql<{ n: number }>`
        SELECT count(*)::int AS n FROM alerts WHERE dedup_key = 'heartbeat-loss' AND resolved_at IS NULL
      `.execute(trx);
      expect(hb.rows[0].n).toBe(0);
      throw new Error("ROLLBACK-PROBE");
    }).catch((err) => {
      if (!String(err).includes("ROLLBACK-PROBE")) throw err;
    });
  });

  it("unacknowledged past deadline escalates ONE level, once, with alert.escalated — rolled back", async () => {
    await db().transaction().execute(async (trx) => {
      const row = await sql<{ id: string }>`
        INSERT INTO alerts (level, source, title, at)
        VALUES ('attention', 'probe', 'E8.4b probe: stale unacked', now() - interval '5 hours')
        RETURNING id
      `.execute(trx);
      const id = row.rows[0].id;

      const first = await sql<{ resp: { escalated: number } }>`SELECT fn_alerts_evaluate() AS resp`.execute(trx);
      expect(first.rows[0].resp.escalated).toBeGreaterThanOrEqual(1);
      const after = await sql<{ level: string; escalated_from: string; escalated_at: string }>`
        SELECT level, escalated_from, escalated_at FROM alerts WHERE id = ${id}::uuid
      `.execute(trx);
      expect(after.rows[0]).toMatchObject({ level: "high", escalated_from: "attention" });
      expect(after.rows[0].escalated_at).toBeTruthy();

      // single-step policy: a second sweep does NOT bump it again
      await sql`SELECT fn_alerts_evaluate()`.execute(trx);
      const again = await sql<{ level: string }>`SELECT level FROM alerts WHERE id = ${id}::uuid`.execute(trx);
      expect(again.rows[0].level).toBe("high");

      const msgs = await sql<{ payload: Record<string, any> }>`
        SELECT payload FROM realtime.messages
        WHERE topic = 'dxb:alerts' AND extension = 'broadcast'
      `.execute(trx);
      const esc = msgs.rows.filter(
        (r) => r.payload.type === "alert.escalated" && r.payload.payload?.alert_id === id,
      );
      expect(esc).toHaveLength(1);
      throw new Error("ROLLBACK-PROBE");
    }).catch((err) => {
      if (!String(err).includes("ROLLBACK-PROBE")) throw err;
    });
  });
});

describe("E8.4b control_alerts_action — lifecycle behind the control seam (§8/§13)", () => {
  it("ack → acknowledged_at + AUDIT ROW with canonical detail_ref (ROADMAP ACCEPTANCE) + broadcast", async () => {
    const id = await makeAlert("high", "E8.4b probe: ack me");
    const since = new Date(Date.now() - 1000);

    const res = await alertAction({ op: "ack", alert_id: id, note: "seen it" }, `e84b-ack-${id}`);
    expect(res.rows[0].resp).toMatchObject({ ok: true, op: "ack" });
    probeAuditIds.push(Number(res.rows[0].resp.audit_id!));

    const alert = await sql<{ acknowledged_at: string; ceo_action: string }>`
      SELECT acknowledged_at, ceo_action FROM alerts WHERE id = ${id}::uuid
    `.execute(db());
    expect(alert.rows[0].acknowledged_at).toBeTruthy();
    expect(alert.rows[0].ceo_action).toBe("seen it");

    // ack → audit satırı, drilled through v_audit_trail to the alerts family
    const trail = await sql<{ action: string; ref_table: string; ref_summary: Record<string, unknown> }>`
      SELECT action, ref_table, ref_summary FROM v_audit_trail
      WHERE id = ${res.rows[0].resp.audit_id}
    `.execute(db());
    expect(trail.rows[0].action).toBe("alert.ack");
    expect(trail.rows[0].ref_table).toBe("alerts");
    expect(trail.rows[0].ref_summary).toMatchObject({ level: "high", source: "probe" });

    const msgs = await sql<{ payload: Record<string, any> }>`
      SELECT payload FROM realtime.messages
      WHERE topic = 'dxb:alerts' AND extension = 'broadcast'
        AND inserted_at >= ${since.toISOString()}::timestamp
    `.execute(db());
    const mine = msgs.rows.filter(
      (r) => r.payload.type === "alert.acknowledged" && r.payload.payload?.alert_id === id,
    );
    expect(mine).toHaveLength(1);
  });

  it("resolve stamps resolved_at (+auto-ack) and frees the dedup key; assign + mute validate", async () => {
    const id = await makeAlert("attention", "E8.4b probe: resolve me");

    const agent = await sql<{ id: string }>`SELECT id FROM agents ORDER BY slug LIMIT 1`.execute(db());
    const assign = await alertAction(
      { op: "assign", alert_id: id, employee_id: agent.rows[0].id },
      `e84b-assign-${id}`,
    );
    expect(assign.rows[0].resp).toMatchObject({ ok: true, op: "assign" });
    probeAuditIds.push(Number(assign.rows[0].resp.audit_id!));

    const badMute = await alertAction({ op: "mute", alert_id: id, minutes: 99999 }, `e84b-badmute-${id}`);
    expect(badMute.rows[0].resp).toMatchObject({ ok: false, error: "VALIDATION_FAILED" });

    const res = await alertAction(
      { op: "resolve", alert_id: id, mitigation: "probe resolved" },
      `e84b-resolve-${id}`,
    );
    expect(res.rows[0].resp).toMatchObject({ ok: true, op: "resolve" });
    probeAuditIds.push(Number(res.rows[0].resp.audit_id!));

    const alert = await sql<{ resolved_at: string; acknowledged_at: string; mitigation: string; responsible_employee: string }>`
      SELECT resolved_at, acknowledged_at, mitigation, responsible_employee
      FROM alerts WHERE id = ${id}::uuid
    `.execute(db());
    expect(alert.rows[0].resolved_at).toBeTruthy();
    expect(alert.rows[0].acknowledged_at).toBeTruthy(); // resolve implies ack
    expect(alert.rows[0].mitigation).toBe("probe resolved");
    expect(alert.rows[0].responsible_employee).toBe(agent.rows[0].id);

    // lifecycle wall: resolved alerts refuse further ops
    const dead = await alertAction({ op: "ack", alert_id: id }, `e84b-dead-${id}`);
    expect(dead.rows[0].resp).toMatchObject({ ok: false, error: "VALIDATION_FAILED" });
  });

  it("idempotent replay + IDEMPOTENCY_MISMATCH + exactly one audit row", async () => {
    const id = await makeAlert("attention", "E8.4b probe: idempotency");
    const key = `e84b-idem-${id}`;

    const first = await alertAction({ op: "ack", alert_id: id }, key);
    const replay = await alertAction({ op: "ack", alert_id: id }, key);
    expect(replay.rows[0].resp).toEqual(first.rows[0].resp);
    probeAuditIds.push(Number(first.rows[0].resp.audit_id!));

    const clash = await alertAction({ op: "resolve", alert_id: id }, key);
    expect(clash.rows[0].resp).toMatchObject({ ok: false, error: "IDEMPOTENCY_MISMATCH" });

    const count = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM audit_log
      WHERE action LIKE 'alert.%' AND (payload->>'alert_id') = ${id}
    `.execute(db());
    expect(count.rows[0].n).toBe(1);
  });

  it("grants: anon zero, authenticated executes fn but cannot touch the table directly (§13)", async () => {
    const grants = await sql<{ anon_exec: boolean; auth_exec: boolean; eval_auth: boolean }>`
      SELECT has_function_privilege('anon', 'public.control_alerts_action(jsonb, text)', 'EXECUTE') AS anon_exec,
             has_function_privilege('authenticated', 'public.control_alerts_action(jsonb, text)', 'EXECUTE') AS auth_exec,
             has_function_privilege('authenticated', 'public.fn_alerts_evaluate()', 'EXECUTE') AS eval_auth
    `.execute(db());
    expect(grants.rows[0]).toEqual({ anon_exec: false, auth_exec: true, eval_auth: false });

    await expect(
      db().transaction().execute(async (trx) => {
        await sql`SET LOCAL ROLE authenticated`.execute(trx);
        await sql`UPDATE alerts SET acknowledged_at = now() WHERE false`.execute(trx);
      }),
    ).rejects.toThrow(/permission denied/);
  });
});

describe("E8.4b v_alerts_active — the real priority queue (CC-SPEC §4)", () => {
  it("orders severity → unacked → age, hides muted, carries critical pending approvals", async () => {
    const attention = await makeAlert("attention", "E8.4b probe: low prio");
    const critical = await makeAlert("critical", "E8.4b probe: top prio");
    const muted = await makeAlert("high", "E8.4b probe: muted away");
    const mute = await alertAction({ op: "mute", alert_id: muted, minutes: 30 }, `e84b-mute-${muted}`);
    probeAuditIds.push(Number(mute.rows[0].resp.audit_id!));

    const rows = await sql<{ id: string; kind: string; level: string }>`
      SELECT id, kind, level FROM v_alerts_active
    `.execute(db());
    const ids = rows.rows.map((r) => r.id);
    expect(ids).toContain(critical);
    expect(ids).toContain(attention);
    expect(ids).not.toContain(muted);
    expect(ids.indexOf(critical)).toBeLessThan(ids.indexOf(attention));
    // approval union leg: every pending critical approval rides along
    const pendingCritical = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM approvals WHERE status = 'pending' AND risk_class = 'critical'
    `.execute(db());
    expect(rows.rows.filter((r) => r.kind === "approval")).toHaveLength(pendingCritical.rows[0].n);
  });
});
