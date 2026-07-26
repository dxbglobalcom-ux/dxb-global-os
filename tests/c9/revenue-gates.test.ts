// W2.3 — THE TWO WRITTEN GATES FIRE (REVENUE_ENGINE_SPEC G3 + G4).
//
// Measured before writing (2026-07-26): `capital_required_eur` was compared
// nowhere and `evidence_refs` was validated nowhere — both rules existed only
// as spec sentences. G4: "while capital_limit=0, scoring hard-filters
// capital_required_eur=0 opportunities; capital raises are CEO-only." G3:
// "proposals must carry research evidence refs — a proposal without
// opportunity citations is gate-rejected (anti-laziness rule)."
//
// Every case runs inside a rolled-back transaction (c9 idiom): the live
// pipeline of the holding is never touched, and an active objective — a thing
// only the CEO may create — can be staged honestly for the duration of a test.
// No jwt is set, so fn_org_actor() = 'system': the Hamza path, which is exactly
// the actor G3 was written against.
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const SEED = `c9-revenue-gates-${randomUUID().slice(0, 8)}`;
const ROLLBACK = new Error("rollback-sentinel");
const CEO_JWT = JSON.stringify({
  sub: "00000000-0000-0000-0000-000000000001",
  email: "ceo-test",
});

const FULL_DIMS = {
  market: 8, trend: 7, demand: 8, competition: 5, price_gap: 6,
  logistics: 7, platform_fees: 6, tax_constraints: 7, ad_cost: 5,
  est_margin: 7, time_to_revenue_days: 8, scalability: 6,
};

type Out = { ok: boolean; id?: string; error?: string; detail?: string };

afterAll(async () => {
  await closeDb();
});

const inTrx = async (fn: (trx: never) => Promise<void>) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
      await fn(trx as never);
      throw ROLLBACK;
    })
    .catch((e) => {
      if (e !== ROLLBACK) throw e;
    });

/** Register an opportunity through the audited door (never a direct insert). */
async function register(trx: never, title: string, capital: number): Promise<Out> {
  const res = await sql<{ out: Out }>`
    select control_opportunity_register(${title}, 'ecommerce', 'EU', 'marketplace',
                                        ${capital}::numeric, '[]'::jsonb, ${SEED}) as out
  `.execute(trx);
  return res.rows[0].out;
}

async function score(trx: never, id: string): Promise<Out> {
  const res = await sql<{ out: Out }>`
    select control_opportunity_score(${id}::uuid, ${JSON.stringify(FULL_DIMS)}::jsonb) as out
  `.execute(trx);
  return res.rows[0].out;
}

/** Stage an ACTIVE objective for the length of a rolled-back test. Direct
 *  insert on purpose: activation is CEO-only (§13) and this suite is 'system';
 *  the wall itself is already proven in tests/r12/revenue-core.test.ts. */
async function stageActiveObjective(trx: never, capitalLimit: number): Promise<string> {
  const res = await sql<{ id: string }>`
    insert into objectives (title, amount_eur, metric, status, period, capital_limit_eur)
    values (${`${SEED} active`}, 500, 'net_profit', 'active',
            daterange(current_date, current_date + 30, '[]'), ${capitalLimit}::numeric)
    returning id
  `.execute(trx);
  return res.rows[0].id;
}

describe("G4 — zero-capital-first filter (REVENUE_ENGINE_SPEC §2 G4)", () => {
  it("with no active objective the limit is 0: an opportunity needing capital is refused at scoring", async () => {
    await inTrx(async (trx) => {
      const reg = await register(trx, `${SEED} needs 500`, 500);
      expect(reg.ok).toBe(true);

      const out = await score(trx, reg.id as string);
      expect(out.ok).toBe(false);
      expect(out.error).toBe("CAPITAL_LIMIT");

      const row = await sql<{ state: string; score: string | null }>`
        select state, score::text from opportunities where id = ${reg.id}::uuid
      `.execute(trx);
      // Refused, not rejected: the CEO may raise the limit and the row must survive.
      expect(row.rows[0].state).toBe("discovered");
      expect(row.rows[0].score).toBeNull();
    });
  });

  it("the refusal is written down, never silent", async () => {
    await inTrx(async (trx) => {
      const reg = await register(trx, `${SEED} audited refusal`, 250);
      await score(trx, reg.id as string);

      const audit = await sql<{ n: string; limit_eur: string; required: string }>`
        select count(*)::text as n,
               max(payload->>'capital_limit_eur') as limit_eur,
               max(payload->>'capital_required_eur') as required
          from audit_log
         where action = 'revenue.opportunity.capital_filtered'
           and payload->>'opportunity_id' = ${reg.id}
      `.execute(trx);
      expect(Number(audit.rows[0].n)).toBe(1);
      expect(Number(audit.rows[0].limit_eur)).toBe(0);
      expect(Number(audit.rows[0].required)).toBe(250);
    });
  });

  it("a zero-capital opportunity still scores — the gate does not over-reach", async () => {
    await inTrx(async (trx) => {
      const reg = await register(trx, `${SEED} free`, 0);
      const out = await score(trx, reg.id as string);
      expect(out.ok).toBe(true);
    });
  });

  it("the CEO's own limit governs: the same opportunity scores once an active objective allows it", async () => {
    await inTrx(async (trx) => {
      await stageActiveObjective(trx, 1000);
      const reg = await register(trx, `${SEED} within raised limit`, 500);
      const out = await score(trx, reg.id as string);
      expect(out.ok).toBe(true);
    });
  });

  it("a row scored under a higher limit cannot advance after the limit drops", async () => {
    await inTrx(async (trx) => {
      const objective = await stageActiveObjective(trx, 1000);
      const reg = await register(trx, `${SEED} limit drops`, 500);
      expect((await score(trx, reg.id as string)).ok).toBe(true);

      await sql`update objectives set capital_limit_eur = 0 where id = ${objective}::uuid`.execute(trx);

      const adv = await sql<{ out: Out }>`
        select control_opportunity_advance(${reg.id}::uuid, 'shortlisted') as out
      `.execute(trx);
      expect(adv.rows[0].out.ok).toBe(false);
      expect(adv.rows[0].out.error).toBe("CAPITAL_LIMIT");
    });
  });
});

describe("G3 — proposals must cite research evidence (REVENUE_ENGINE_SPEC §2 G3)", () => {
  const propose = async (trx: never, title: string, evidence: string): Promise<Out> => {
    const res = await sql<{ out: Out }>`
      select control_objective_create(${title}, 50, 'net_profit', 'proposed', 'hamza',
                                      ${evidence}::jsonb) as out
    `.execute(trx);
    return res.rows[0].out;
  };

  it("a proposal with no citations is refused", async () => {
    await inTrx(async (trx) => {
      const out = await propose(trx, `${SEED} empty evidence`, "[]");
      expect(out.ok).toBe(false);
      expect(out.error).toBe("EVIDENCE_GATE");
    });
  });

  it("a proposal citing an opportunity that does not exist is refused (unbacked evidence)", async () => {
    await inTrx(async (trx) => {
      const ghost = randomUUID();
      const out = await propose(trx, `${SEED} ghost evidence`, JSON.stringify([ghost]));
      expect(out.ok).toBe(false);
      expect(out.error).toBe("EVIDENCE_GATE");
      expect(String(out.detail)).toContain(ghost);
    });
  });

  it("a proposal citing a live opportunity is accepted and keeps its refs", async () => {
    await inTrx(async (trx) => {
      const reg = await register(trx, `${SEED} cited`, 0);
      const evidence = JSON.stringify([{ opportunity_id: reg.id, note: "scout run" }]);
      const out = await propose(trx, `${SEED} backed proposal`, evidence);
      expect(out.ok).toBe(true);

      const row = await sql<{ status: string; refs: unknown }>`
        select status, evidence_refs as refs from objectives where id = ${out.id}::uuid
      `.execute(trx);
      expect(row.rows[0].status).toBe("proposed");
      expect(JSON.stringify(row.rows[0].refs)).toContain(reg.id as string);
    });
  });

  it("a CEO draft is untouched by the gate — the door he actually uses still works", async () => {
    await inTrx(async (trx) => {
      // The CEO's own door creates `draft` (api/control/objectives). Impersonate
      // him: as 'system' a draft is already refused by the D4 rule, so testing
      // this leg without the jwt would prove nothing about G3.
      await sql`select set_config('request.jwt.claims', ${CEO_JWT}, true)`.execute(trx);
      const res = await sql<{ out: Out }>`
        select control_objective_create(${`${SEED} plain draft`}, 50, 'net_profit', 'draft',
                                        'ceo', '[]'::jsonb) as out
      `.execute(trx);
      expect(res.rows[0].out.ok).toBe(true);
    });
  });
});
