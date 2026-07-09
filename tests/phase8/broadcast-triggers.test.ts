import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// 08-01 Task 1 proof (DASH-07 foundation): every write to the three cockpit
// tables lands a Broadcast row in realtime.messages on its dxb:* channel
// (Broadcast-from-DB, Pattern 6 — postgres_changes is forbidden project-wide).
// Rows created here are cleaned up surgically; no global wipes (hermes may own
// live rows in this database).
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const ACTOR = "test:broadcast-triggers";
let taskId: string;
let approvalId: string;
let costId: string;
// realtime.messages.inserted_at is timestamp WITHOUT time zone (DB-naive) —
// take the watermark from the DB clock, never from the JS clock.
let startedAt: string;

async function channelCount(topic: string): Promise<number> {
  const res = await sql<{ n: string }>`
    select count(*)::text as n from realtime.messages
    where topic = ${topic} and extension = 'broadcast' and inserted_at >= ${startedAt}::timestamp
  `.execute(getDb());
  return Number(res.rows[0].n);
}

async function lastPayload(topic: string): Promise<Record<string, unknown>> {
  const res = await sql<{ payload: Record<string, unknown> }>`
    select payload from realtime.messages
    where topic = ${topic} and extension = 'broadcast' and inserted_at >= ${startedAt}::timestamp
    order by inserted_at desc, id desc limit 1
  `.execute(getDb());
  return res.rows[0].payload;
}

beforeAll(async () => {
  const clock = await sql<{ t: string }>`select localtimestamp::text as t`.execute(getDb());
  startedAt = clock.rows[0].t;
  const res = await sql<{ id: string }>`
    insert into tasks (department, objective, output_contract, model_tier)
    values ('engineering', 'broadcast-triggers test host task', 'n/a', 'L4')
    returning id
  `.execute(getDb());
  taskId = res.rows[0].id;
});

afterAll(async () => {
  const db = getDb();
  await sql`delete from realtime.messages where topic like 'dxb:%' and inserted_at >= ${startedAt}::timestamp`.execute(db);
  if (costId) await sql`delete from cost_ledger where id = ${costId}::bigint`.execute(db);
  if (approvalId) await sql`delete from approvals where id = ${approvalId}::uuid`.execute(db);
  await sql`delete from task_events where actor = ${ACTOR}`.execute(db);
  if (taskId) await sql`delete from tasks where id = ${taskId}::uuid`.execute(db);
  await closeDb();
});

describe("broadcast-from-DB triggers (migration 0013)", () => {
  it("task_events INSERT broadcasts on dxb:task_events", async () => {
    const before = await channelCount("dxb:task_events");
    await sql`
      insert into task_events (task_id, event, actor)
      values (${taskId}::uuid, 'status_change', ${ACTOR})
    `.execute(getDb());
    expect(await channelCount("dxb:task_events")).toBe(before + 1);

    const payload = await lastPayload("dxb:task_events");
    expect(payload.operation).toBe("INSERT");
    expect(payload.table).toBe("task_events");
    expect((payload.record as Record<string, unknown>).actor).toBe(ACTOR);
  });

  it("approvals INSERT and draft→pending UPDATE both broadcast on dxb:approvals", async () => {
    const before = await channelCount("dxb:approvals");
    const res = await sql<{ id: string }>`
      insert into approvals (task_id, action_type, payload, risk_class)
      values (${taskId}::uuid, 'test.broadcast', '{}'::jsonb, 'low')
      returning id
    `.execute(getDb());
    approvalId = res.rows[0].id;
    expect(await channelCount("dxb:approvals")).toBe(before + 1);

    await sql`update approvals set status = 'pending' where id = ${approvalId}::uuid`.execute(getDb());
    expect(await channelCount("dxb:approvals")).toBe(before + 2);

    const payload = await lastPayload("dxb:approvals");
    expect(payload.operation).toBe("UPDATE");
    expect((payload.record as Record<string, unknown>).status).toBe("pending");
    expect((payload.old_record as Record<string, unknown>).status).toBe("draft");
  });

  it("cost_ledger INSERT broadcasts on dxb:cost_ledger", async () => {
    const before = await channelCount("dxb:cost_ledger");
    const res = await sql<{ id: string }>`
      insert into cost_ledger (department, model, mode, cost_eur, source)
      values ('engineering', 'test-model', 'api', 0, 'hook')
      returning id::text as id
    `.execute(getDb());
    costId = res.rows[0].id;
    expect(await channelCount("dxb:cost_ledger")).toBe(before + 1);

    const payload = await lastPayload("dxb:cost_ledger");
    expect(payload.operation).toBe("INSERT");
    expect(payload.table).toBe("cost_ledger");
  });

  it("channel RLS: exactly one SELECT policy, authenticated-only, scoped to dxb:% broadcast", async () => {
    const res = await sql<{ polname: string; roles: string; cmd: string }>`
      select p.polname,
             array_to_string(array(select rolname from pg_roles where oid = any(p.polroles)), ',') as roles,
             p.polcmd as cmd
      from pg_policy p join pg_class c on c.oid = p.polrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'realtime' and c.relname = 'messages'
    `.execute(getDb());
    expect(res.rows.length).toBe(1);
    expect(res.rows[0].polname).toBe("dxb_ceo_broadcast_read");
    expect(res.rows[0].roles).toBe("authenticated");
    expect(res.rows[0].cmd).toBe("r"); // SELECT only — nobody INSERTs around the triggers
  });
});
