import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// 09-02 gate: v_morning_briefing is the ONE briefing content source. The view
// reads global state (demo seed may be present), so every assertion is a
// DELTA against a baseline snapshot taken before seeding — plus shape
// invariants that must hold on ANY database state (a quiet night must still
// yield 3 well-formed blocks; the 07:00 cron can never crash on empty).
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const SEED = "briefing-view-test";
// Cost departments carry a per-run suffix: a prior aborted run's leftovers must
// never inflate this run's absolute numbers (learned live — 26m outage run).
const RUN = `${process.pid}-${Math.floor(Math.random() * 1e6)}`;
const DEPT_A = `briefing-a-${RUN}`;
const DEPT_B = `briefing-b-${RUN}`;

type Block = { sort: number; block: string; payload: Record<string, unknown> };

async function readView(): Promise<Block[]> {
  const res = await sql<Block>`
    select sort, block, payload from v_morning_briefing order by sort
  `.execute(getDb());
  return res.rows;
}

function block(rows: Block[], name: string): Record<string, unknown> {
  const hit = rows.find((r) => r.block === name);
  if (!hit) throw new Error(`block ${name} missing`);
  return hit.payload;
}

const ids = {
  taskInside: "", // task with a 'done' event inside the overnight window
  taskFresh: "", // future-stamped done event — deterministic recent_done top
  taskEdge: "", // task with an event BEFORE the window (must not count)
  taskApproval: "",
  approvals: [] as string[],
};

async function insertTask(objective: string): Promise<string> {
  const res = await sql<{ id: string }>`
    insert into tasks (department, objective, output_contract, model_tier, status)
    values ('engineering', ${objective}, 'test-contract', 'L4', 'queued')
    returning id
  `.execute(getDb());
  return res.rows[0].id;
}

// The view window opens at yesterday 19:00 Europe/Berlin — recompute the same
// expression here (independent SQL) so the edge seeds are exact.
async function windowStart(): Promise<Date> {
  const res = await sql<{ ts: Date }>`
    select (((now() at time zone 'Europe/Berlin')::date - 1)
            + time '19:00') at time zone 'Europe/Berlin' as ts
  `.execute(getDb());
  return new Date(res.rows[0].ts);
}

let baseline: Block[];

beforeAll(async () => {
  baseline = await readView();
  const start = await windowStart();
  const inside = new Date(start.getTime() + 60_000); // 1 min after window opens
  const before = new Date(start.getTime() - 60_000); // 1 min before → excluded

  ids.taskInside = await insertTask(`${SEED} gece biten iş`);
  ids.taskFresh = await insertTask(`${SEED} taze biten iş`);
  ids.taskEdge = await insertTask(`${SEED} pencere dışı iş`);
  ids.taskApproval = await insertTask(`${SEED} onay bekleyen iş`);

  // Overnight block seeds: one done-event JUST inside the edge (window
  // inclusion witness — counted, but on a busy live night it may fall off the
  // LIMIT-5 recent_done list), one FRESH event stamped 2 s in the future
  // (deterministic top of recent_done regardless of live traffic — R4.2
  // live-data fix), one BEFORE the edge (exclusion witness).
  const fresh = new Date(Date.now() + 2000);
  await sql`
    insert into task_events (task_id, event, from_status, to_status, actor, payload, created_at)
    values
      (${ids.taskInside}::uuid, 'status_change', 'running', 'done', 'test',
       ${JSON.stringify({ seed: SEED })}::jsonb, ${inside.toISOString()}::timestamptz),
      (${ids.taskFresh}::uuid, 'status_change', 'running', 'done', 'test',
       ${JSON.stringify({ seed: SEED })}::jsonb, ${fresh.toISOString()}::timestamptz),
      (${ids.taskEdge}::uuid, 'status_change', 'running', 'done', 'test',
       ${JSON.stringify({ seed: SEED })}::jsonb, ${before.toISOString()}::timestamptz)
  `.execute(getDb());

  // Approvals block seeds: 2 pending (one high, one low) + 1 approved (must not count).
  const appr = await sql<{ id: string }>`
    insert into approvals (task_id, action_type, payload, risk_class, status)
    values
      (${ids.taskApproval}::uuid, 'email.send', ${JSON.stringify({ seed: SEED })}::jsonb, 'high', 'pending'),
      (${ids.taskApproval}::uuid, 'ad_spend',   ${JSON.stringify({ seed: SEED })}::jsonb, 'low',  'pending'),
      (${ids.taskApproval}::uuid, 'email.send', ${JSON.stringify({ seed: SEED })}::jsonb, 'low',  'approved')
    returning id
  `.execute(getDb());
  ids.approvals = appr.rows.map((r) => r.id);

  // Cost block seeds: two departments inside 24h, one outside (25h ago → excluded).
  const now = new Date();
  const in24h = new Date(now.getTime() - 60 * 60 * 1000);
  const out24h = new Date(now.getTime() - 25 * 60 * 60 * 1000);
  await sql`
    insert into cost_ledger (department, model, mode, cost_eur, source, meta, created_at)
    values
      (${DEPT_A}, 'claude-fable-5', 'api', 0.300000, 'manual',
       ${JSON.stringify({ seed: SEED })}::jsonb, ${in24h.toISOString()}::timestamptz),
      (${DEPT_B}, 'claude-fable-5', 'api', 0.100000, 'manual',
       ${JSON.stringify({ seed: SEED })}::jsonb, ${in24h.toISOString()}::timestamptz),
      (${DEPT_A}, 'claude-fable-5', 'api', 9.999999, 'manual',
       ${JSON.stringify({ seed: SEED })}::jsonb, ${out24h.toISOString()}::timestamptz)
  `.execute(getDb());
});

afterAll(async () => {
  // Defensive order: any outbox children first (approval decisions spawn
  // outbox rows via the Phase-4 rails), then the seeds themselves.
  await sql`
    delete from outbox where approval_id in
      (select id from approvals where payload->>'seed' = ${SEED})
  `.execute(getDb());
  await sql`delete from task_events where payload->>'seed' = ${SEED}`.execute(getDb());
  // R2.1 reality: the resident worker may claim seed tasks mid-suite and
  // write its own task_events (no seed payload) — delete by task membership
  // too, or the tasks delete below dies on task_events_task_id_fkey
  // (measured 2026-07-17 full-regression with the live scheduler).
  await sql`
    delete from task_events where task_id in
      (select id from tasks where objective like ${SEED + "%"})
  `.execute(getDb());
  await sql`
    delete from agent_runs where task_id in
      (select id from tasks where objective like ${SEED + "%"})
  `.execute(getDb());
  await sql`delete from approvals where payload->>'seed' = ${SEED}`.execute(getDb());
  await sql`delete from cost_ledger where meta->>'seed' = ${SEED}`.execute(getDb());
  await sql`delete from tasks where objective like ${SEED + "%"}`.execute(getDb());
  await closeDb();
});

describe("v_morning_briefing (09-02)", () => {
  it("always returns exactly 3 well-formed blocks in fixed order (quiet-night shape)", async () => {
    const rows = await readView();
    expect(rows.map((r) => [r.sort, r.block])).toEqual([
      [1, "overnight_work"],
      [2, "approvals"],
      [3, "cost_24h"],
    ]);
    // Shape invariants that hold on ANY state — the cron consumer relies on these keys.
    const work = block(rows, "overnight_work");
    expect(work).toHaveProperty("window_start");
    expect(work).toHaveProperty("total_events");
    expect(work).toHaveProperty("by_status");
    expect(work).toHaveProperty("recent_done");
    const appr = block(rows, "approvals");
    expect(appr).toHaveProperty("pending_total");
    expect(appr).toHaveProperty("by_risk");
    expect(appr).toHaveProperty("oldest");
    const cost = block(rows, "cost_24h");
    expect(cost).toHaveProperty("total_eur");
    expect(cost).toHaveProperty("top_departments");
  });

  it("counts overnight events INSIDE the window only (edge proof)", async () => {
    const rows = await readView();
    const before = Number(block(baseline, "overnight_work").total_events);
    const after = Number(block(rows, "overnight_work").total_events);
    // Three events seeded, exactly TWO inside the window (edge witness +
    // fresh witness); the before-edge one must not count.
    expect(after - before).toBe(2);
    const done = block(rows, "overnight_work").recent_done as Array<{
      label: string;
      label_tr: string;
    }>;
    // LIMIT-5 semantics on a live DB: the FUTURE-stamped seed is always the
    // newest in-window event, so its membership is deterministic; the
    // edge-stamped seed may be outranked by real overnight traffic.
    expect(done.length).toBeLessThanOrEqual(5);
    // 010100 contract: the list carries task HEADLINES (label/label_tr), never
    // a `left(objective, 80)` cut. These seeds have no explicit label, so the
    // view falls back to the objective's first line — whole, not truncated.
    const seeded = done.filter((d) => d.label.startsWith(SEED));
    expect(seeded.map((d) => d.label)).toContain(`${SEED} taze biten iş`);
    expect(seeded.map((d) => d.label)).not.toContain(`${SEED} pencere dışı iş`);
    // Both language legs are present on every row (TR falls back to label).
    for (const d of done) expect(d.label_tr).toBeTruthy();
  });

  it("counts pending approvals only, grouped by risk", async () => {
    const rows = await readView();
    const before = block(baseline, "approvals");
    const after = block(rows, "approvals");
    expect(Number(after.pending_total) - Number(before.pending_total)).toBe(2);
    const beforeRisk = (before.by_risk ?? {}) as Record<string, number>;
    const afterRisk = (after.by_risk ?? {}) as Record<string, number>;
    expect((afterRisk.high ?? 0) - (beforeRisk.high ?? 0)).toBe(1);
    expect((afterRisk.low ?? 0) - (beforeRisk.low ?? 0)).toBe(1);
    // The approved seed row must be invisible.
    const oldest = after.oldest as Array<{ label: string }>;
    const seededOldest = oldest.filter((o) => o.label.startsWith(SEED));
    expect(seededOldest.length).toBeLessThanOrEqual(2);
  });

  it("sums 24h cost to the cent and ranks departments (window + order proof)", async () => {
    const rows = await readView();
    const before = Number(block(baseline, "cost_24h").total_eur);
    const after = Number(block(rows, "cost_24h").total_eur);
    // 0.3 + 0.1 inside the window; the 9.999999 row is 25h old and must be excluded.
    expect(after - before).toBeCloseTo(0.4, 6);
    const top = block(rows, "cost_24h").top_departments as Array<{
      department: string;
      total_eur: number;
    }>;
    const a = top.find((t) => t.department === DEPT_A);
    const b = top.find((t) => t.department === DEPT_B);
    if (a && b) {
      expect(top.indexOf(a)).toBeLessThan(top.indexOf(b)); // desc order
      expect(Number(a.total_eur)).toBeCloseTo(0.3, 6);
    } else {
      // Demo seed may out-rank test rows in top-3; the total delta above already
      // proves inclusion — assert desc ordering on whatever IS in top-3.
      const totals = top.map((t) => Number(t.total_eur));
      expect([...totals].sort((x, y) => y - x)).toEqual(totals);
    }
  });

  // Sensitivity via ADD/REMOVE, not decision flips: the Phase-4 rails make
  // decisions immutable ("karar değiştirilemez" trigger) and an approve spawns
  // an outbox row — both discovered live. The view's job is to notice state
  // changes; inserting and deleting an UNDECIDED pending row proves exactly
  // that without fighting (or weakening) the decision-immutability rails.
  it("sensitivity: view reacts to a pending approval appearing and disappearing", async () => {
    const extra = await sql<{ id: string }>`
      insert into approvals (task_id, action_type, payload, risk_class, status)
      values (${ids.taskApproval}::uuid, 'ad_spend',
              ${JSON.stringify({ seed: SEED })}::jsonb, 'medium', 'pending')
      returning id
    `.execute(getDb());
    const withExtra = await readView();
    const before = Number(block(baseline, "approvals").pending_total);
    expect(Number(block(withExtra, "approvals").pending_total) - before).toBe(3);

    await sql`delete from approvals where id = ${extra.rows[0].id}::uuid`.execute(getDb());
    const withoutExtra = await readView();
    expect(Number(block(withoutExtra, "approvals").pending_total) - before).toBe(2);
  });
});
