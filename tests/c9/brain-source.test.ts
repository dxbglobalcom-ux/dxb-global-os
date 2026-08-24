import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// MODEL_ROUTING_SPEC §4b (0021g delta, built 2026-07-25 after the CEO's
// "why is every brain glm-5.2" catch): agents.brain_source separates the
// never-assigned seed placeholder ('default') from a real CEO assignment
// ('ceo_override' — stamped by the §4b-regime door). Surfaces render the
// placeholder honestly instead of echoing glm-5.2 as if it were chosen.

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
  // U21 (2026-07-26): the live workforce is no longer unassigned — the quality
  // tier law ran the §4b routing-assignment pass, so all 205 rows moved to
  // brain_source='slot'. Counting live 'default' rows would now assert that the
  // assignment never happened. What the column actually owes us is that a NEWLY
  // created agent starts as an honest placeholder, so the probe creates its own
  // row inside the rollback transaction.
  it("a newly created agent row starts at brain_source='default'", async () => {
    await inTrx(async (trx) => {
      const res = await sql<{ brain_source: string; brain: string }>`
        insert into agents (slug, role, department, role_level, persona_path)
        values (${SEED + "-probe"}, 'specialist', 'risk-audit', 'specialist',
                ${"personas/risk-audit/" + SEED + "-probe.md"})
        returning brain_source, brain
      `.execute(trx as never);
      expect(res.rows[0].brain_source).toBe("default");
      expect(res.rows[0].brain).toBeTruthy();
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
      // U21: this used to assign 'glm-5.2', which is now retired AND banned —
      // the door correctly refuses it, so the door's SUCCESS path has to be
      // proven with a model that is actually hireable. Read it from the live
      // catalog so a future roster change cannot silently rot this test.
      const pick = await sql<{ id: string }>`
        select id from model_catalog
        where status = 'active' and banned = false and mechanical_only = false
        order by id limit 1
      `.execute(trx as never);
      const res = await sql<{ out: { ok: boolean } }>`
        select control_org_assign_model_group(${pick.rows[0].id},
          array[${emp.rows[0].id}]::uuid[], ${SEED}, ${SEED + "-key"}) as out
      `.execute(trx as never);
      expect(res.rows[0].out.ok).toBe(true);

      const row = await sql<{ brain_source: string }>`
        select brain_source from agents where id = ${emp.rows[0].id}
      `.execute(trx as never);
      expect(row.rows[0].brain_source).toBe("ceo_override");
    });
  });

  // U21 safety claim, proven rather than asserted in a comment: retiring a model
  // in a migration is only half the dismissal — the dashboard door must refuse
  // to re-hire it, otherwise a fired model walks back in through the org page.
  it("the model-group door refuses a banned model (U21 dismissal holds)", async () => {
    await inTrx(async (trx) => {
      await sql`select set_config('request.jwt.claims', ${CEO_JWT}, true)`.execute(
        trx as never,
      );
      const emp = await sql<{ id: string }>`
        select id from agents
        where employment_status = 'active' and department = 'risk-audit'
        limit 1
      `.execute(trx as never);
      const banned = await sql<{ id: string }>`
        select id from model_catalog where banned = true order by id limit 1
      `.execute(trx as never);
      expect(banned.rows.length, "U21 retired eight models — none found").toBe(1);
      const res = await sql<{ out: { ok: boolean } }>`
        select control_org_assign_model_group(${banned.rows[0].id},
          array[${emp.rows[0].id}]::uuid[], ${SEED + "-banned"}, ${SEED + "-banned-key"}) as out
      `.execute(trx as never);
      expect(res.rows[0].out.ok).toBe(false);

      const row = await sql<{ brain_source: string }>`
        select brain_source from agents where id = ${emp.rows[0].id}
      `.execute(trx as never);
      expect(row.rows[0].brain_source).not.toBe("ceo_override");
    });
  });
});
