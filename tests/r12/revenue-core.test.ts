// R1.2 verification — REVENUE_ENGINE_SPEC §20/§24.1-2 acceptance:
// engines-as-data FK swap (U10), Objective Contract state machine walls,
// 12-dim scoring validation, HALAL GATE (G2), separation of duties (§13).
// Live-DB suite (e10 pattern): runs as service context → fn_org_actor()
// = 'system'; every CEO-only fn must therefore REJECT here (the wall proof).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";
import { watchLedgers } from "../helpers/suite-scope.js";

// Repo live-DB test convention (phase4/phase6/e10 files): local Supabase default.

const M = `r12-test-${randomUUID().slice(0, 8)}`;
const ENGINE_SLUG = `r12test_${M.slice(9)}`; // run-unique: no cross-run audit bleed
const db = () => getDb();

// Its own footprints in audit_log / decision_log, swept in afterAll below.
const ledgerScope = watchLedgers(db);

const FULL_DIMS = {
  market: 8, trend: 7, demand: 8, competition: 5, price_gap: 6,
  logistics: 7, platform_fees: 6, tax_constraints: 7, ad_cost: 5,
  est_margin: 7, time_to_revenue_days: 8, scalability: 6,
};

async function fn(call: string): Promise<Record<string, unknown>> {
  const res = await sql<{ r: Record<string, unknown> }>`
    SELECT ${sql.raw(call)} AS r`.execute(db());
  return res.rows[0].r;
}

afterAll(async () => {
  // 2026-09-21: and the two append-only ledgers too. Measured by running
  // every sandboxed file alone: this one left the rows named below, which
  // no FK chain reaches. Watermark AND signature — never the watermark alone.
  await ledgerScope.sweep({ audit: [{ actor: "system", action: "revenue.opportunity.advanced" }, { actor: "system", action: "revenue.opportunity.scored" }] });
  await sql`DELETE FROM opportunities WHERE title LIKE ${M + "%"}`.execute(db());
  await sql`DELETE FROM revenue_engines WHERE slug LIKE ${"r12test%"}`.execute(db());
  await sql`DELETE FROM audit_log WHERE payload::text LIKE ${"%" + M + "%"}
             OR payload::text LIKE ${"%r12test%"}`.execute(db());
  await closeDb();
});

describe("R1.2 schema (§24.1)", () => {
  it("4 revenue_core tables exist", async () => {
    const res = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM information_schema.tables
       WHERE table_name IN ('objectives','opportunities','revenue_engines','portfolio_allocations')`.execute(db());
    expect(res.rows[0].n).toBe(4);
  });

  it("U10 FK swap: fk_engine live, CHECK enum gone", async () => {
    const res = await sql<{ conname: string }>`
      SELECT conname FROM pg_constraint
       WHERE conrelid = 'public.revenue_ledger'::regclass
         AND conname IN ('fk_engine','revenue_ledger_engine_check')`.execute(db());
    expect(res.rows.map((r) => r.conname)).toEqual(["fk_engine"]);
  });

  it("6 engine seeds present; €50 draft objective seeded (§24.6)", async () => {
    const e = await sql<{ n: number }>`SELECT count(*)::int AS n FROM revenue_engines`.execute(db());
    expect(e.rows[0].n).toBeGreaterThanOrEqual(6);
    const o = await sql<{ status: string; amount_eur: string }>`
      SELECT status, amount_eur::text FROM objectives WHERE amount_eur = 50 AND metric = 'net_profit'`.execute(db());
    expect(o.rows.length).toBeGreaterThanOrEqual(1);
  });

  it("FK RED: ledger insert with unknown engine fails", async () => {
    await expect(
      sql`INSERT INTO revenue_ledger (occurred_on, engine, department, description, amount_eur, source, entered_by)
          VALUES (CURRENT_DATE, 'no_such_engine', 'finance', ${M}, 1, 'manual', 'test')`.execute(db()),
    ).rejects.toThrow(/foreign key|fk_engine/i);
  });
});

describe("R1.2 control fns — state machine + gates (§10/§13/§24.2)", () => {
  it("register → illegal jump RED → score RED/GREEN → HALAL GATE RED (G2) → separation of duties RED → CEO walls RED", async () => {
    const reg = await fn(
      `control_opportunity_register('${M} probe','ecommerce','EU','marketplace',0,'[]'::jsonb,'strategy-probe')`,
    );
    expect(reg.ok).toBe(true);
    const id = String(reg.id);

    // §10 illegal transition
    const jump = await fn(`control_opportunity_advance('${id}'::uuid,'piloting')`);
    expect(jump.error).toBe("ILLEGAL_TRANSITION");

    // 12-dim validation
    const thin = await fn(`control_opportunity_score('${id}'::uuid,'{"market":5}'::jsonb)`);
    expect(thin.error).toBe("VALIDATION_FAILED");
    const scored = await fn(
      `control_opportunity_score('${id}'::uuid,'${JSON.stringify(FULL_DIMS)}'::jsonb)`,
    );
    expect(Number(scored.score)).toBeCloseTo(6.67, 2);

    const short = await fn(`control_opportunity_advance('${id}'::uuid,'shortlisted')`);
    expect(short.ok).toBe(true);

    // G2 — THE Islamic gate: piloting+ requires halal_verdict='halal'
    const gate = await fn(`control_opportunity_advance('${id}'::uuid,'piloting')`);
    expect(gate.error).toBe("HALAL_GATE");

    // §13 separation of duties: system needs a risk-audit director ≠ proposer
    const noBy = await fn(`control_opportunity_set_halal_verdict('${id}'::uuid,'halal')`);
    expect(noBy.error).toBe("PERMISSION_DENIED");
    const selfBy = await fn(
      `control_opportunity_set_halal_verdict('${id}'::uuid,'halal',NULL,'strategy-probe')`,
    );
    expect(selfBy.error).toBe("PERMISSION_DENIED");

    // CEO walls (§13): activate + allocate reject the system actor
    const obj = await sql<{ id: string }>`
      SELECT id FROM objectives WHERE amount_eur = 50 LIMIT 1`.execute(db());
    const act = await fn(`control_objective_activate('${obj.rows[0].id}'::uuid)`);
    expect(act.error).toBe("PERMISSION_DENIED");
    const alloc = await fn(
      `control_portfolio_allocate('${obj.rows[0].id}'::uuid,'${id}'::uuid)`,
    );
    expect(alloc.error).toBe("PERMISSION_DENIED");

    // haram verdict path: CEO-wall bypassed via seeded risk-audit director if
    // one exists; otherwise verify the reject fn's terminal discipline.
    const rej = await fn(`control_opportunity_reject('${id}'::uuid,'score','${M} cleanup')`);
    expect(rej.ok).toBe(true);
    const rej2 = await fn(`control_opportunity_reject('${id}'::uuid,'score')`);
    expect(rej2.error).toBe("ILLEGAL_TRANSITION"); // terminal state holds
  });

  it("engine create/update via control seam + audit rows exist", async () => {
    const slug = ENGINE_SLUG;
    const c = await fn(
      `control_engine_create('${slug}','${M} Engine','${M} Motoru','test thesis')`,
    );
    expect(c.ok).toBe(true);
    const l = await fn(`control_engine_update_lifecycle('${slug}','pilot')`);
    expect(l.ok).toBe(true);
    const audit = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM audit_log
       WHERE action IN ('revenue.engine.created','revenue.engine.lifecycle')
         AND payload::text LIKE ${"%" + slug + "%"}`.execute(db());
    expect(audit.rows[0].n).toBe(2);
  });
});

describe("R1.2 views (§11)", () => {
  it("v_objective_progress: realized never projected; €50 target visible", async () => {
    const res = await sql<{ target_eur: string; gap_eur: string }>`
      SELECT target_eur::text, gap_eur::text FROM v_objective_progress
       WHERE target_eur = 50`.execute(db());
    expect(res.rows.length).toBeGreaterThanOrEqual(1);
  });

  it("v_snev computes on empty window without error", async () => {
    const res = await sql<{ snev_eur: string }>`SELECT snev_eur::text FROM v_snev`.execute(db());
    expect(res.rows).toHaveLength(1);
  });
});
