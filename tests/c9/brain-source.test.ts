import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// MODEL_ROUTING_SPEC §4b (0021g delta, built 2026-07-25 after the CEO's
// "why is every brain glm-5.2" catch): agents.brain_source separates the
// never-assigned seed placeholder ('default') from a real CEO assignment
// ('ceo_override' — stamped by the §4b-regime door). Surfaces render the
// placeholder honestly instead of echoing glm-5.2 as if it were chosen.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const SEED = "c9-brain-source-test";
const ROLLBACK = new Error("rollback-sentinel");
const CEO_JWT = JSON.stringify({
  sub: "00000000-0000-0000-0000-000000000001",
  email: "ceo-test",
});

afterAll(async () => {
  await closeDb();
});

const inTrx = async (fn: (trx: unknown) => Promise<void>) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
      await fn(trx);
      throw ROLLBACK;
    })
    .catch((e) => {
      if (e !== ROLLBACK) throw e;
    });

describe("§4b — agents.brain_source", () => {
  it("unassigned workforce rows carry brain_source='default'", async () => {
    await inTrx(async (trx) => {
      const res = await sql<{ n: string }>`
        select count(*) as n from agents
        where employment_status <> 'archived' and brain_source = 'default'
      `.execute(trx as never);
      expect(Number(res.rows[0].n)).toBeGreaterThan(0);
    });
  });

  it("the model-group door stamps brain_source='ceo_override'", async () => {
    await inTrx(async (trx) => {
      await sql`select set_config('request.jwt.claims', ${CEO_JWT}, true)`.execute(
        trx as never,
      );
      const emp = await sql<{ id: string }>`
        select id from agents
        where employment_status = 'active' and department = 'risk-audit'
        limit 1
      `.execute(trx as never);
      const res = await sql<{ out: { ok: boolean } }>`
        select control_org_assign_model_group('glm-5.2',
          array[${emp.rows[0].id}]::uuid[], ${SEED}, ${SEED + "-key"}) as out
      `.execute(trx as never);
      expect(res.rows[0].out.ok).toBe(true);

      const row = await sql<{ brain_source: string }>`
        select brain_source from agents where id = ${emp.rows[0].id}
      `.execute(trx as never);
      expect(row.rows[0].brain_source).toBe("ceo_override");
    });
  });
});
