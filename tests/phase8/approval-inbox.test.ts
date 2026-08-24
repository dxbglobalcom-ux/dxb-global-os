import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  GATE_FATIGUE_THRESHOLD,
  groupApprovals,
  isMoneyOut,
  type InboxApproval,
} from "../../apps/dashboard/src/lib/approvals.js";

// 08-03: GATE-03 decision surface proofs — risk grouping (pure logic),
// single-transaction batch decide with 1:1 audit rows, all-or-nothing
// rollback on a poisoned batch, and the privilege wall (anon has no door).

let taskId: string;
const ids: Record<string, string> = {};

async function seed(name: string, riskClass: string, actionType: string, status = "pending") {
  const res = await sql<{ id: string }>`
    insert into approvals (task_id, action_type, payload, risk_class, status)
    values (${taskId}::uuid, ${actionType},
            ${JSON.stringify({ seed: name, amount_eur: 42 })}::jsonb,
            ${riskClass}, ${status})
    returning id
  `.execute(getDb());
  ids[name] = res.rows[0].id;
}

async function auditCount(): Promise<number> {
  const res = await sql<{ n: number }>`
    select count(*)::int as n from audit_log
    where action = 'approval.decision'
      and payload->>'approval_id' = any(${Object.values(ids)})
  `.execute(getDb());
  return res.rows[0].n;
}

beforeAll(async () => {
  const res = await sql<{ id: string }>`
    insert into tasks (department, objective, output_contract, model_tier)
    values ('finance', 'approval-inbox test host task', 'n/a', 'L4')
    returning id
  `.execute(getDb());
  taskId = res.rows[0].id;

  // 2 high (one money-OUT), 2 medium, 2 low — master plan step 5 seed shape
  await seed("high_pay", "high", "payment.stripe");
  await seed("high_mail", "high", "email.send");
  await seed("med_a", "medium", "email.send");
  await seed("med_b", "medium", "contract.review");
  await seed("low_a", "low", "email.send");
  await seed("low_b", "low", "email.send");
});

afterAll(async () => {
  const db = getDb();
  const all = Object.values(ids);
  await sql`delete from audit_log where action = 'approval.decision' and payload->>'approval_id' = any(${all})`.execute(db);
  await sql`delete from realtime.messages where topic = 'dxb:approvals'`.execute(db);
  await sql`delete from outbox where approval_id = any(${all}::uuid[])`.execute(db);
  await sql`delete from approvals where id = any(${all}::uuid[])`.execute(db);
  if (taskId) await sql`delete from tasks where id = ${taskId}::uuid`.execute(db);
  await closeDb();
});

describe("risk grouping (pure inbox logic)", () => {
  const row = (risk: string): InboxApproval => ({
    id: risk,
    task_id: "t",
    action_type: "email.send",
    payload: {},
    risk_class: risk,
    created_at: "2026-07-10T00:00:00Z",
    department: null,
    objective: null,
  });

  it("groups high→medium→low; unknown risk fails safe into high (never batchable)", () => {
    const groups = groupApprovals([row("low"), row("high"), row("medium"), row("weird")]);
    expect(groups.high.map((r) => r.id)).toEqual(["high", "weird"]);
    expect(groups.medium.map((r) => r.id)).toEqual(["medium"]);
    expect(groups.low.map((r) => r.id)).toEqual(["low"]);
  });

  it("money-OUT derives from action_type families (B7b badge)", () => {
    expect(isMoneyOut("payment.stripe")).toBe(true);
    expect(isMoneyOut("transfer.wise")).toBe(true);
    expect(isMoneyOut("ad_spend")).toBe(true);
    expect(isMoneyOut("email.send")).toBe(false);
    expect(isMoneyOut("contract.review")).toBe(false);
  });

  it("fatigue threshold is the LOCKED 50", () => {
    expect(GATE_FATIGUE_THRESHOLD).toBe(50);
  });
});

describe("decide_approvals — single transaction, audit 1:1", () => {
  it("batch-low approves n rows + n audit rows atomically", async () => {
    const batch = [ids.low_a, ids.low_b];
    const res = await sql<{ decided: { decided: number } }>`
      select decide_approvals(${batch}::uuid[], 'approved', null) as decided
    `.execute(getDb());
    expect(res.rows[0].decided).toEqual({ decided: 2, decision: "approved" });

    const rows = await sql<{ id: string; status: string; decided_by: string }>`
      select id, status, decided_by from approvals where id = any(${batch}::uuid[])
    `.execute(getDb());
    expect(rows.rows).toHaveLength(2);
    for (const row of rows.rows) {
      expect(row.status).toBe("approved");
      expect(row.decided_by).toBe("ceo");
    }
    expect(await auditCount()).toBe(2);
  });

  it("poisoned batch (one already decided) → full rollback, zero effect", async () => {
    const before = await auditCount();
    const batch = [ids.med_a, ids.med_b, ids.low_a]; // low_a already approved above

    await expect(
      sql`select decide_approvals(${batch}::uuid[], 'approved', null)`.execute(getDb()),
    ).rejects.toThrow(/not pending/);

    const rows = await sql<{ id: string; status: string }>`
      select id, status from approvals where id = any(${[ids.med_a, ids.med_b]}::uuid[])
    `.execute(getDb());
    for (const row of rows.rows) expect(row.status).toBe("pending");
    expect(await auditCount()).toBe(before);
  });

  it("unknown id in batch → exception (count mismatch), nothing decided", async () => {
    const before = await auditCount();
    const ghost = "00000000-0000-0000-0000-000000000001";
    await expect(
      sql`select decide_approvals(${[ids.med_a, ghost]}::uuid[], 'rejected', 'x')`.execute(getDb()),
    ).rejects.toThrow(/unknown or duplicate/);
    const row = await sql<{ status: string }>`
      select status from approvals where id = ${ids.med_a}::uuid
    `.execute(getDb());
    expect(row.rows[0].status).toBe("pending");
    expect(await auditCount()).toBe(before);
  });

  it("rejection writes decision_note and audit carries it", async () => {
    await sql`select decide_approvals(${[ids.high_mail]}::uuid[], 'rejected', 'not now')`.execute(getDb());
    const row = await sql<{ status: string; decision_note: string }>`
      select status, decision_note from approvals where id = ${ids.high_mail}::uuid
    `.execute(getDb());
    expect(row.rows[0].status).toBe("rejected");
    expect(row.rows[0].decision_note).toBe("not now");
  });

  it("decision broadcasts on dxb:approvals (0013 trigger) for live inbox refresh", async () => {
    const res = await sql<{ payload: Record<string, unknown> }>`
      select payload from realtime.messages
      where topic = 'dxb:approvals' and extension = 'broadcast'
      order by inserted_at desc, id desc limit 1
    `.execute(getDb());
    expect(res.rows.length).toBe(1);
    expect(res.rows[0].payload.table).toBe("approvals");
  });
});

describe("privilege wall — the RPC is the only door and anon has no key", () => {
  it("anon cannot execute; authenticated can", async () => {
    const res = await sql<{ anon: boolean; authed: boolean }>`
      select has_function_privilege('anon', 'decide_approvals(uuid[],text,text)', 'execute') as anon,
             has_function_privilege('authenticated', 'decide_approvals(uuid[],text,text)', 'execute') as authed
    `.execute(getDb());
    expect(res.rows[0].anon).toBe(false);
    expect(res.rows[0].authed).toBe(true);
  });

  it("authenticated has NO direct UPDATE grant on approvals (function is the seam)", async () => {
    const res = await sql<{ can_update: boolean }>`
      select has_table_privilege('authenticated', 'approvals', 'update') as can_update
    `.execute(getDb());
    expect(res.rows[0].can_update).toBe(false);
  });
});
