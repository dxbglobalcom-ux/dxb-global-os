import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// W2.1 — the objective door (REVENUE_ENGINE_SPEC §7).
//
// Measured before building: control_objective_create/_activate/_close had
// existed since the revenue wave with NO caller in the product — no screen, no
// API. Setting a target meant opening psql. The CEO's framing of the whole
// system is "I give the number, the OS works out how", and the number had no way
// in.
//
// These cases prove the DOOR, not the form: the function is reachable as the
// CEO, the target lands active, the audit and decision trail exist, and the same
// idempotency key cannot create the target twice.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const SEED = "c9-objective-door";
const ROLLBACK = new Error("rollback-sentinel");
const CEO_JWT = JSON.stringify({
  sub: "00000000-0000-0000-0000-000000000001",
  email: "ceo-test",
});

const inTrx = async (fn: (trx: never) => Promise<void>) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
      await sql`select set_config('request.jwt.claims', ${CEO_JWT}, true)`.execute(trx);
      await fn(trx as never);
      throw ROLLBACK;
    })
    .catch((e) => {
      if (e !== ROLLBACK) throw e;
    });

afterAll(async () => {
  await closeDb();
});

describe("W2.1 — a target can enter the company without psql", () => {
  // MEASURED while building the door: the function refuses `active` on create
  // ("create accepts only draft|proposed") and then refuses to activate without
  // a period. Both rules are right — a target that runs is a different act from
  // a target written down, and a target with no deadline cannot be measured — so
  // the door performs both steps for the CEO and defaults the period to the
  // current month. These cases mirror exactly what the route does.
  it("creates and activates in one gesture, with the audit trail", async () => {
    await inTrx(async (trx) => {
      const key = `${SEED}-create`;
      const created = await sql<{ out: { ok: boolean; id: string } }>`
        SELECT control_objective_create(${`${SEED} first revenue test`}, 50, 'net_profit',
                                        'draft', 'ceo', '[]'::jsonb, NULL, NULL, 0, ${key}) AS out
      `.execute(trx);
      expect(created.rows[0].out.ok).toBe(true);
      const res = await sql<{ out: { ok: boolean; id: string } }>`
        SELECT control_objective_activate(${created.rows[0].out.id}::uuid,
                                          date_trunc('month', now())::date,
                                          (date_trunc('month', now()) + interval '1 month - 1 day')::date,
                                          ${key + ":activate"}) AS out
      `.execute(trx);
      expect(res.rows[0].out.ok).toBe(true);

      const row = await sql<{ status: string; amount_eur: string; capital_limit_eur: string }>`
        SELECT status, amount_eur::text, capital_limit_eur::text
          FROM objectives WHERE id = ${created.rows[0].out.id}
      `.execute(trx);
      expect(row.rows[0].status).toBe("active");
      expect(Number(row.rows[0].amount_eur)).toBe(50);
      // The zero-capital default is the safe end of the G4 filter: a target
      // arrives unable to spend anything until the CEO raises the limit.
      expect(Number(row.rows[0].capital_limit_eur)).toBe(0);

      const audit = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM audit_log
         WHERE action IN ('revenue.objective.created', 'revenue.objective.activated')
      `.execute(trx);
      expect(Number(audit.rows[0].n)).toBeGreaterThan(0);
    });
  });

  it("the same idempotency key cannot set the same target twice", async () => {
    await inTrx(async (trx) => {
      const key = `${SEED}-idem`;
      const first = await sql<{ out: { ok: boolean; id: string } }>`
        SELECT control_objective_create(${`${SEED} idem probe`}, 100, 'net_profit',
                                        'draft', 'ceo', '[]'::jsonb, NULL, NULL, 0, ${key}) AS out
      `.execute(trx);
      const second = await sql<{ out: { ok: boolean; id: string } }>`
        SELECT control_objective_create(${`${SEED} idem probe`}, 100, 'net_profit',
                                        'draft', 'ceo', '[]'::jsonb, NULL, NULL, 0, ${key}) AS out
      `.execute(trx);
      expect(second.rows[0].out.id).toBe(first.rows[0].out.id);

      const n = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM objectives WHERE title = ${`${SEED} idem probe`}
      `.execute(trx);
      expect(Number(n.rows[0].n)).toBe(1);
    });
  });

  it("a target with no deadline is refused — it could not be measured", async () => {
    await inTrx(async (trx) => {
      const created = await sql<{ out: { id: string } }>`
        SELECT control_objective_create(${`${SEED} no period`}, 10, 'net_profit',
                                        'draft', 'ceo', '[]'::jsonb, NULL, NULL, 0,
                                        ${`${SEED}-noperiod-create`}) AS out
      `.execute(trx);
      const act = await sql<{ out: { ok: boolean; detail: string } }>`
        SELECT control_objective_activate(${created.rows[0].out.id}::uuid, NULL, NULL,
                                          ${`${SEED}-noperiod-activate`}) AS out
      `.execute(trx);
      expect(act.rows[0].out.ok).toBe(false);
      expect(act.rows[0].out.detail).toContain("period");
    });
  });

  it("a draft target can be activated afterwards", async () => {
    await inTrx(async (trx) => {
      const created = await sql<{ out: { id: string } }>`
        SELECT control_objective_create(${`${SEED} two step`}, 250, 'net_profit',
                                        'draft', 'ceo', '[]'::jsonb, NULL, NULL, 0,
                                        ${`${SEED}-two-step-create`}) AS out
      `.execute(trx);
      const activated = await sql<{ out: { ok: boolean } }>`
        SELECT control_objective_activate(${created.rows[0].out.id}::uuid,
                                          date_trunc('month', now())::date,
                                          (date_trunc('month', now()) + interval '1 month - 1 day')::date,
                                          ${`${SEED}-two-step-activate`}) AS out
      `.execute(trx);
      expect(activated.rows[0].out.ok).toBe(true);
      const row = await sql<{ status: string }>`
        SELECT status FROM objectives WHERE id = ${created.rows[0].out.id}
      `.execute(trx);
      expect(row.rows[0].status).toBe("active");
    });
  });
});
