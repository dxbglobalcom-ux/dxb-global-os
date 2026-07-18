import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// E12.4 (GAP-05) — cross-company CRM isolation, proven at the DATA layer
// with the exact query pattern EntityView runs (clients filter on
// company_id; children scope through the client_id inner join). State-
// independent: fixtures are slug-prefixed and swept; the holding company
// row is only READ.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const db = () => getDb();
const M = `e124t-${randomUUID().slice(0, 8)}`;

let companyB = "";
let holdingId = "";
let clientA = "";
let clientB = "";

afterAll(async () => {
  await sql`DELETE FROM crm_deals WHERE title LIKE ${`${M}%`}`.execute(db());
  await sql`DELETE FROM crm_clients WHERE name LIKE ${`${M}%`}`.execute(db());
  await sql`DELETE FROM companies WHERE slug = ${`${M}-co`}`.execute(db());
  await closeDb();
});

describe("E12.4 CRM company isolation", () => {
  it("(1) fn_default_company_id resolves the holding (oldest active company)", async () => {
    const res = await sql<{ id: string; def: string }>`
      SELECT (SELECT id FROM companies WHERE status='active' ORDER BY created_at LIMIT 1) AS id,
             fn_default_company_id() AS def
    `.execute(db());
    holdingId = res.rows[0].id;
    expect(res.rows[0].def).toBe(holdingId);
  });

  it("(2) a client inserted WITHOUT company_id lands on the holding (default fn)", async () => {
    const res = await sql<{ id: string; company_id: string }>`
      INSERT INTO crm_clients (name, status) VALUES (${`${M} defaulted`}, 'lead')
      RETURNING id, company_id
    `.execute(db());
    expect(res.rows[0].company_id).toBe(holdingId);
    clientA = res.rows[0].id;
  });

  it("(3) clients query scoped by company returns ONLY that company's rows", async () => {
    const co = await sql<{ id: string }>`
      INSERT INTO companies (slug, name, mission, status)
      VALUES (${`${M}-co`}, ${`${M} Co`}, 'isolation fixture', 'active')
      RETURNING id
    `.execute(db());
    companyB = co.rows[0].id;
    const cb = await sql<{ id: string }>`
      INSERT INTO crm_clients (name, status, company_id)
      VALUES (${`${M} b-client`}, 'active', ${companyB}::uuid)
      RETURNING id
    `.execute(db());
    clientB = cb.rows[0].id;

    const forB = await sql<{ id: string }>`
      SELECT id FROM crm_clients WHERE company_id = ${companyB}::uuid AND name LIKE ${`${M}%`}
    `.execute(db());
    expect(forB.rows.map((r) => r.id)).toEqual([clientB]);

    const forHolding = await sql<{ id: string }>`
      SELECT id FROM crm_clients WHERE company_id = ${holdingId}::uuid AND name LIKE ${`${M}%`}
    `.execute(db());
    expect(forHolding.rows.map((r) => r.id)).toEqual([clientA]);
  });

  it("(4) children scope through their client join — the other company's deals never leak", async () => {
    await sql`INSERT INTO crm_deals (client_id, title, value_eur, stage)
      VALUES (${clientA}::uuid, ${`${M} deal-holding`}, 100, 'open'),
             (${clientB}::uuid, ${`${M} deal-b`}, 200, 'open')`.execute(db());

    const dealsB = await sql<{ title: string }>`
      SELECT d.title FROM crm_deals d
        JOIN crm_clients c ON c.id = d.client_id
       WHERE c.company_id = ${companyB}::uuid AND d.title LIKE ${`${M}%`}
    `.execute(db());
    expect(dealsB.rows.map((r) => r.title)).toEqual([`${M} deal-b`]);

    const dealsHolding = await sql<{ title: string }>`
      SELECT d.title FROM crm_deals d
        JOIN crm_clients c ON c.id = d.client_id
       WHERE c.company_id = ${holdingId}::uuid AND d.title LIKE ${`${M}%`}
    `.execute(db());
    expect(dealsHolding.rows.map((r) => r.title)).toEqual([`${M} deal-holding`]);
  });

  it("(5) company_id is a hard wall: NULL insert impossible once the default fn is bypassed", async () => {
    let refused = false;
    try {
      await sql`INSERT INTO crm_clients (name, status, company_id)
        VALUES (${`${M} orphan`}, 'lead', NULL)`.execute(db());
    } catch (err) {
      refused = /not-null|null value/i.test(err instanceof Error ? err.message : String(err));
    }
    expect(refused).toBe(true);
  });
});
