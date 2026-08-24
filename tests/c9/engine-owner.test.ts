import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// Ledger 10d/10e (2026-07-24): the engine owner door. CEO-only (fn_org_actor),
// validates engine + department, audited. Tests run inside rolled-back
// transactions; the CEO jwt is impersonated via request.jwt.claims so the
// SECURITY DEFINER fn sees auth.uid() (fn_org_actor → 'ceo').

const SEED = "c9-engine-owner-test";
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

describe("10d/10e — control_engine_set_owner door", () => {
  it("CEO sets an engine owner department; audit + decision rows written", async () => {
    await inTrx(async (trx) => {
      await sql`select set_config('request.jwt.claims', ${CEO_JWT}, true)`.execute(trx);
      const res = await sql<{ out: { ok: boolean } }>`
        select control_engine_set_owner('social_selling', 'marketing', ${SEED}) as out
      `.execute(trx);
      expect(res.rows[0].out.ok).toBe(true);

      const eng = await sql<{ owner_department: string }>`
        select owner_department from revenue_engines where slug = 'social_selling'
      `.execute(trx);
      expect(eng.rows[0].owner_department).toBe("marketing");

      const audit = await sql<{ n: string }>`
        select count(*) as n from audit_log
        where action = 'engine.owner.assigned' and payload->>'rationale' = ${SEED}
      `.execute(trx);
      expect(Number(audit.rows[0].n)).toBe(1);

      const dec = await sql<{ n: string }>`
        select count(*) as n from decision_log
        where decided_by = 'ceo' and rationale = ${SEED}
      `.execute(trx);
      expect(Number(dec.rows[0].n)).toBe(1);
    });
  });

  it("rejects a non-CEO actor", async () => {
    await inTrx(async (trx) => {
      const res = await sql<{ out: { ok: boolean; error: string } }>`
        select control_engine_set_owner('social_selling', 'marketing', ${SEED}) as out
      `.execute(trx);
      expect(res.rows[0].out.ok).toBe(false);
      expect(res.rows[0].out.error).toBe("PERMISSION_DENIED");
    });
  });

  it("rejects an unknown engine and an unknown department", async () => {
    await inTrx(async (trx) => {
      await sql`select set_config('request.jwt.claims', ${CEO_JWT}, true)`.execute(trx);
      const badEngine = await sql<{ out: { ok: boolean; error: string } }>`
        select control_engine_set_owner('no-such-engine', 'marketing', ${SEED}) as out
      `.execute(trx);
      expect(badEngine.rows[0].out.ok).toBe(false);
      expect(badEngine.rows[0].out.error).toBe("VALIDATION_FAILED");

      const badDept = await sql<{ out: { ok: boolean; error: string } }>`
        select control_engine_set_owner('social_selling', 'no-such-dept', ${SEED}) as out
      `.execute(trx);
      expect(badDept.rows[0].out.ok).toBe(false);
      expect(badDept.rows[0].out.error).toBe("VALIDATION_FAILED");
    });
  });
});
