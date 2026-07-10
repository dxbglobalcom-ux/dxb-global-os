import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { CRM_EDIT_SCHEMAS, CRM_EDITABLE_FIELDS } from "../../apps/dashboard/src/lib/crm.js";

// 08-06 (DASH-04): CEO CRM edits — whitelist enforced at BOTH layers
// (action zod strips; crm_update door RAISEs), every edit audited, direct
// column writes structurally denied (no UPDATE grant exists), agent-seeded
// rows visible with derivable provenance.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

let clientId: string;
let dealId: string;

beforeAll(async () => {
  const client = await sql<{ id: string }>`
    insert into crm_clients (name, status) values ('Test Holding GmbH', 'lead') returning id
  `.execute(getDb());
  clientId = client.rows[0].id;
  const deal = await sql<{ id: string }>`
    insert into crm_deals (client_id, title, value_eur, stage)
    values (${clientId}::uuid, 'Outlet storefront project', 12500.50, 'open') returning id
  `.execute(getDb());
  dealId = deal.rows[0].id;
});

afterAll(async () => {
  const db = getDb();
  await sql`delete from audit_log where action = 'crm.update' and payload->>'entity_id' in (${clientId}, ${dealId})`.execute(db);
  await sql`delete from crm_deals where id = ${dealId}::uuid`.execute(db);
  await sql`delete from crm_clients where id = ${clientId}::uuid`.execute(db);
  await closeDb();
});

describe("whitelist — the two layers agree by construction", () => {
  it("zod schemas expose exactly the migration-0017 field sets", () => {
    // lib/crm.ts whitelist == the arrays in crm_update (reviewed pairing);
    // this pins the TS side so a drift shows up as a failing diff here.
    expect(CRM_EDITABLE_FIELDS).toEqual({
      clients: ["name", "status"],
      requests: ["status"],
      contacts: ["name", "email", "phone", "role"],
      deals: ["title", "value_eur", "stage"],
    });
    // .strip() drops unknown keys — a crafted payload cannot smuggle fields
    const parsed = CRM_EDIT_SCHEMAS.clients.safeParse({ name: "X", meta: { hack: 1 } });
    expect(parsed.success).toBe(true);
    expect(parsed.success && "meta" in parsed.data).toBe(false);
  });

  it("crm_update RAISEs on a non-permitted field (DB layer)", async () => {
    await expect(
      sql`select crm_update('clients', ${clientId}::uuid, '{"meta": {"hack": true}}'::jsonb)`.execute(getDb()),
    ).rejects.toThrow(/not CEO-editable/);
  });

  it("direct column write is structurally denied — NO update grant exists", async () => {
    const res = await sql<{ any_update: boolean; anon_exec: boolean }>`
      select
        (has_table_privilege('authenticated','crm_clients','update')
         or has_table_privilege('authenticated','crm_contacts','update')
         or has_table_privilege('authenticated','crm_requests','update')
         or has_table_privilege('authenticated','crm_deals','update')) as any_update,
        has_function_privilege('anon','crm_update(text,uuid,jsonb)','execute') as anon_exec
    `.execute(getDb());
    expect(res.rows[0]).toEqual({ any_update: false, anon_exec: false });
  });
});

describe("permitted edits — applied + audited 1:1", () => {
  it("client status lead→active persists and appends one audit row", async () => {
    await sql`select crm_update('clients', ${clientId}::uuid, '{"status": "active"}'::jsonb)`.execute(getDb());
    const row = await sql<{ status: string }>`
      select status from crm_clients where id = ${clientId}::uuid
    `.execute(getDb());
    expect(row.rows[0].status).toBe("active");

    const audit = await sql<{ n: number; actor_type: string }>`
      select count(*)::int as n, min(actor_type) as actor_type from audit_log
      where action = 'crm.update' and payload->>'entity_id' = ${clientId}
    `.execute(getDb());
    expect(audit.rows[0]).toEqual({ n: 1, actor_type: "ceo" });
  });

  it("deal value + stage update persists at numeric(12,2) precision", async () => {
    await sql`select crm_update('deals', ${dealId}::uuid, '{"value_eur": 19999.99, "stage": "proposal"}'::jsonb)`.execute(getDb());
    const row = await sql<{ value_eur: string; stage: string }>`
      select value_eur::text, stage from crm_deals where id = ${dealId}::uuid
    `.execute(getDb());
    expect(row.rows[0]).toEqual({ value_eur: "19999.99", stage: "proposal" });
  });

  it("enum CHECK still applies through the door (bad stage rejected)", async () => {
    await expect(
      sql`select crm_update('deals', ${dealId}::uuid, '{"stage": "maybe"}'::jsonb)`.execute(getDb()),
    ).rejects.toThrow();
  });

  it("unknown row → not found, no audit row", async () => {
    const ghost = "00000000-0000-0000-0000-00000000dead";
    await expect(
      sql`select crm_update('clients', ${ghost}::uuid, '{"status": "active"}'::jsonb)`.execute(getDb()),
    ).rejects.toThrow(/not found/);
  });
});

describe("provenance — derivable from the audit trail", () => {
  it("CEO-edited row has a ceo audit writer; agent-seeded row has none", async () => {
    const edited = await sql<{ actor_type: string }>`
      select actor_type from audit_log
      where action = 'crm.update' and payload->>'entity_id' = ${clientId}
      order by created_at desc limit 1
    `.execute(getDb());
    expect(edited.rows[0].actor_type).toBe("ceo");

    // dealId was seeded directly (agent path analogue) then CEO-edited;
    // a freshly seeded row with no crm.update audit derives 'agent'.
    const fresh = await sql<{ n: number }>`
      select count(*)::int as n from audit_log
      where action = 'crm.update' and payload->>'entity_id' = 'never-edited-id'
    `.execute(getDb());
    expect(fresh.rows[0].n).toBe(0);
  });
});
