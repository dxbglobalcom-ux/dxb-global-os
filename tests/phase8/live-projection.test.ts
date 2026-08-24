import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// 08-02 Task 3: (a) the broadcast payload shape lib/realtime.ts reads is
// pinned against a real DB write; (b) DASH-05 purity — the dashboard owns
// ZERO write paths — is a machine gate from this plan onward. 08-03/08-05
// extend PURITY_ALLOWLIST explicitly when their write seams land.

const ACTOR = "test:live-projection";
let taskId: string;
let startedAt: string;

beforeAll(async () => {
  const clock = await sql<{ t: string }>`select localtimestamp::text as t`.execute(getDb());
  startedAt = clock.rows[0].t;
  const res = await sql<{ id: string }>`
    insert into tasks (department, objective, output_contract, model_tier)
    values ('engineering', 'live-projection test host task', 'n/a', 'L4')
    returning id
  `.execute(getDb());
  taskId = res.rows[0].id;
});

afterAll(async () => {
  const db = getDb();
  await sql`delete from realtime.messages where topic like 'dxb:%' and inserted_at >= ${startedAt}::timestamp`.execute(db);
  await sql`delete from task_events where actor = ${ACTOR}`.execute(db);
  if (taskId) await sql`delete from tasks where id = ${taskId}::uuid`.execute(db);
  await closeDb();
});

describe("broadcast payload contract (lib/realtime.ts DxbBroadcastPayload)", () => {
  it("task transition write produces the exact field set the UI consumes", async () => {
    await sql`
      insert into task_events (task_id, event, from_status, to_status, actor)
      values (${taskId}::uuid, 'status_change', 'queued', 'running', ${ACTOR})
    `.execute(getDb());

    const res = await sql<{ payload: Record<string, unknown> }>`
      select payload from realtime.messages
      where topic = 'dxb:task_events' and extension = 'broadcast'
        and inserted_at >= ${startedAt}::timestamp
      order by inserted_at desc, id desc limit 1
    `.execute(getDb());

    const payload = res.rows[0].payload;
    // Contract fields (typed in lib/realtime.ts) — all present:
    expect(payload.operation).toBe("INSERT");
    expect(payload.table).toBe("task_events");
    expect(payload.schema).toBe("public");
    expect(payload).toHaveProperty("record");
    expect(payload).toHaveProperty("old_record");

    // Fields the board + Horizon Line deltas read from record:
    const record = payload.record as Record<string, unknown>;
    expect(record.task_id).toBe(taskId);
    expect(record.from_status).toBe("queued");
    expect(record.to_status).toBe("running");
    expect(record.actor).toBe(ACTOR);
    expect(record).toHaveProperty("created_at");
  });
});

// ---------------------------------------------------------------------------
// DASH-05 purity gate: the dashboard is a pure projection. Any PostgREST
// write chain (.from(...)....insert/update/upsert/delete) or .rpc( call in
// apps/dashboard/src must appear in this allowlist or the suite fails.
const PURITY_ALLOWLIST: string[] = [
  // 08-03 → E9.3: CEO approval decisions — .rpc('decide_approvals') seam
  // (migration 0015 UNTOUCHED) now lives on the (command) route.
  "app/(command)/approvals/actions.ts",
  // 08-05: CEO intent submission — single intents INSERT (migration 0016
  // column grants pin text/lang/source/actor; kernel worker owns the rest)
  "app/api/intent/route.ts",
  // 08-06: CEO CRM edits — single .rpc('crm_update') seam (migration 0017
  // DEFINER door: field whitelist in-database, audit row per edit)
  // E12.4: the CRM edit seam moved home with the shell migration (old
  // cockpit routes died the same commit — GAP-05 tek-anahtar idiomu).
  "app/(command)/revenue/crm/actions.ts",
  // E7.1: routing sandbox — READ-ONLY .rpc('fn_select_model') simulation
  "app/api/ai/simulate/route.ts",
  // E7.2: model routing control seam (.rpc('fn_update_routing') DEFINER door)
  "app/api/control/models/route.ts",
  // E6.x: settings control seam (.rpc control_settings_set / _undo)
  "app/api/control/settings/route.ts",
  // E12.2: widget layout seam — same control_settings_set fn, layout-schema
  // Zod wall in front (CC-SPEC §10; scope='ceo_dashboard', key='layout')
  "app/api/control/layout/route.ts",
  // E6.x: org control seam (.rpc control_org_create_company / _department)
  "app/api/control/org/route.ts",
  // E6.x: revenue control seam (.rpc fn_revenue_record)
  "app/api/control/revenue/route.ts",
  // E8.4: audit mark_reviewed control seam (.rpc control_audit_mark_reviewed)
  "app/api/control/audit/route.ts",
  // E8.4b: alert lifecycle control seam (.rpc control_alerts_action)
  "app/api/control/alerts/route.ts",
  // E9.1: workflow control seam (.rpc control_workflow_action)
  "app/api/control/workflows/route.ts",
  // E9.2: run-history slot labels — READ-ONLY .rpc('fn_routing_slots')
  "app/(command)/ops/workflows/page.tsx",
  // E9.3: approval center control seam (.rpc control_approvals_action)
  "app/api/control/approvals/route.ts",
  // E9.4: project OS control seam (.rpc control_project_action)
  "app/api/control/projects/route.ts",
  // E9.5: holding library control seam (.rpc control_library_action)
  "app/api/control/library/route.ts",
  // E10.1: hook policy control seam (.rpc fn_hook_set_policy)
  "app/api/control/hook/route.ts",
  // C1/C7/C10 (2026-07-19): CEO Chat Board — pending-message INSERT into
  // chat_messages only; Hamza's answer half drains in the resident scheduler
  // (PHASE-08 LOCKED: no LLM in the projection), dispatch rides /api/intent.
  "app/api/chat/route.ts",
  // 9c (2026-07-24): cost reset door (.rpc control_cost_reset — SECURITY
  // DEFINER, one audit_log costs.reset row per call)
  "app/api/control/cost-reset/route.ts",
  // 10d (2026-07-24): engine ownership door (.rpc control_engine_set_owner)
  "app/api/control/engines/route.ts",
  // W2.1 (2026-07-26): the objective door — the CEO states the number from the
  // dashboard instead of psql (.rpc control_objective_create/_activate/_close,
  // all SECURITY DEFINER with their own CEO gate + audit + decision rows;
  // Idempotency-Key required by the handler)
  "app/api/control/objectives/route.ts",
  // C12 (2026-07-19): add-model seam — catalog INSERT + key handoff to the
  // vault file (name+key+note only; §4c chain)
  "app/api/control/model-key/route.ts",
  // C4/C18 (2026-07-19): list purge door (.rpc control_records_purge —
  // status-guarded, audited)
  "app/api/control/purge/route.ts",
  // U15 D9/D12 (2026-07-25): JARVIS mute/hard-off door
  // (.rpc control_voice_daemon_set_state — SECURITY DEFINER single-row door,
  // migration 20260725005000). The route landed with commit 514f119 but its
  // allowlist row did not — caught by this gate on the next full run.
  "app/api/voice/daemon/route.ts",
];

const DASHBOARD_SRC = join(__dirname, "../../apps/dashboard/src");

function collectSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return collectSourceFiles(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

describe("DASH-05 purity gate — zero non-allowlisted write paths", () => {
  it("finds no PostgREST write chains or rpc calls outside the allowlist", () => {
    const offenders: string[] = [];
    for (const file of collectSourceFiles(DASHBOARD_SRC)) {
      const rel = file.slice(DASHBOARD_SRC.length + 1);
      if (PURITY_ALLOWLIST.includes(rel)) continue;
      const flat = readFileSync(file, "utf8").replace(/\s+/g, "");
      // window after each .from(...) chain start: any write verb is a violation
      const fromChains = flat.matchAll(/\.from\([^)]*\)([^;]{0,300})/g);
      for (const [, chain] of fromChains) {
        if (/\.(insert|update|upsert|delete)\(/.test(chain)) {
          offenders.push(`${rel}: PostgREST write in from-chain`);
        }
      }
      if (/\.rpc\(/.test(flat)) offenders.push(`${rel}: rpc call`);
    }
    expect(offenders).toEqual([]);
  });
});
