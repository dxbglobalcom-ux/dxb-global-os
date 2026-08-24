import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  COST_DIMENSIONS,
  costBreakdown,
  periodStart,
  periodTotal,
  type CostRowsSource,
} from "../../apps/dashboard/src/lib/costs.js";
import { formatEur } from "../../apps/dashboard/src/lib/format.js";

// COST-04 gate: the page's aggregate module vs INDEPENDENT raw SQL SUM —
// string-compared at rendered precision across all three dimensions, plus
// the local-midnight period boundary and a built-in sensitivity proof
// (corrupt one tag inside a transaction → equality must break → rollback).

const SEED = "cost-view-test";
const NOW = new Date();

// kysely-backed source: SAME module logic, different row fetch (the seam
// the page fills with PostgREST).
const kyselySource: CostRowsSource = {
  async sumBy(dimension, sinceISO) {
    const res = await sql<{ key: string | null; total: string }>`
      select ${sql.ref(dimension)} as key, sum(cost_eur) as total
      from cost_ledger
      where created_at >= ${sinceISO}::timestamptz
      group by ${sql.ref(dimension)}
    `.execute(getDb());
    return res.rows.map((row) => ({ key: row.key ?? "", totalEur: Number(row.total) }));
  },
  async totalSince(sinceISO) {
    const res = await sql<{ total: string | null }>`
      select sum(cost_eur) as total from cost_ledger
      where created_at >= ${sinceISO}::timestamptz
    `.execute(getDb());
    return Number(res.rows[0].total ?? 0);
  },
};

async function seedRow(dept: string, model: string, mode: string, cost: string, at: Date) {
  await sql`
    insert into cost_ledger (department, model, mode, cost_eur, source, meta, created_at)
    values (${dept}, ${model}, ${mode}, ${cost}::numeric, 'manual',
            ${JSON.stringify({ seed: SEED })}::jsonb, ${at.toISOString()}::timestamptz)
  `.execute(getDb());
}

beforeAll(async () => {
  // ≥3 depts × ≥2 models × 2 modes, awkward 6-decimal values
  const base = new Date(NOW.getTime() - 60 * 60 * 1000); // 1h ago (inside 'today' at 03:00+)
  await seedRow("engineering", "claude-fable-5", "api", "0.123456", base);
  await seedRow("engineering", "claude-haiku-4-5", "subscription", "1.000001", base);
  await seedRow("finance", "claude-fable-5", "api", "3.333333", base);
  await seedRow("finance", "claude-haiku-4-5", "free-tier", "0.000001", base);
  await seedRow("design", "claude-fable-5", "subscription", "2.718281", base);
  await seedRow("design", "claude-haiku-4-5", "api", "0.999999", base);

  // period boundary pair around LOCAL midnight (periodStart contract)
  const midnight = periodStart("today", NOW);
  await seedRow("boundary", "claude-fable-5", "api", "10.000000", new Date(midnight.getTime() - 60 * 1000)); // yesterday 23:59
  await seedRow("boundary", "claude-fable-5", "api", "20.000000", new Date(midnight.getTime() + 60 * 1000)); // today 00:01
});

afterAll(async () => {
  await sql`delete from cost_ledger where meta->>'seed' = ${SEED}`.execute(getDb());
  await closeDb();
});

describe("COST-04 — module totals EQUAL independent raw SQL (rendered precision)", () => {
  for (const dimension of COST_DIMENSIONS) {
    it(`dimension '${dimension}': every rendered total matches raw SUM byte-for-byte`, async () => {
      const entries = await costBreakdown(kyselySource, dimension, "30d", NOW);
      expect(entries.length).toBeGreaterThan(0);

      // independent aggregate: different SQL text, no module code involved
      const raw = await sql<{ key: string | null; total: string }>`
        select coalesce(${sql.ref(dimension)}, '') as key, sum(cost_eur) as total
        from cost_ledger
        where created_at >= now() - interval '30 days'
        group by 1
      `.execute(getDb());
      const rawByKey = new Map(raw.rows.map((r) => [r.key || "—", formatEur(Number(r.total))]));

      expect(entries.length).toBe(rawByKey.size);
      for (const entry of entries) {
        expect(entry.formatted).toBe(rawByKey.get(entry.key));
      }
      // sorted descending, ratios normalized to the max bar
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i - 1].totalEur).toBeGreaterThanOrEqual(entries[i].totalEur);
      }
      expect(entries[0].ratio).toBe(1);
    });
  }

  it("period boundary: yesterday-23:59 excluded from 'today', today-00:01 included", async () => {
    const start = periodStart("today", NOW).toISOString();
    const res = await sql<{ n: number }>`
      select count(*)::int as n from cost_ledger
      where meta->>'seed' = ${SEED} and department = 'boundary'
        and created_at >= ${start}::timestamptz
    `.execute(getDb());
    expect(res.rows[0].n).toBe(1); // only the 00:01 row

    // and the module's today-total reflects exactly that
    const moduleToday = await periodTotal(kyselySource, "today", NOW);
    const rawToday = await sql<{ total: string | null }>`
      select sum(cost_eur) as total from cost_ledger where created_at >= ${start}::timestamptz
    `.execute(getDb());
    expect(formatEur(moduleToday)).toBe(formatEur(Number(rawToday.rows[0].total ?? 0)));
  });

  it("sensitivity proof: corrupting one tag breaks equality (then rolls back)", async () => {
    await getDb()
      .transaction()
      .execute(async (trx) => {
        await sql`
          update cost_ledger set department = 'engineering'
          where meta->>'seed' = ${SEED} and department = 'finance'
            and model = 'claude-fable-5'
        `.execute(trx);

        const trxSource: CostRowsSource = {
          async sumBy(dimension, sinceISO) {
            const res = await sql<{ key: string | null; total: string }>`
              select ${sql.ref(dimension)} as key, sum(cost_eur) as total from cost_ledger
              where created_at >= ${sinceISO}::timestamptz group by ${sql.ref(dimension)}
            `.execute(trx);
            return res.rows.map((row) => ({ key: row.key ?? "", totalEur: Number(row.total) }));
          },
          async totalSince() {
            return 0;
          },
        };

        // module (inside trx, sees corruption) vs pre-corruption raw truth
        const entries = await costBreakdown(trxSource, "department", "30d", NOW);
        const engineering = entries.find((e) => e.key === "engineering");
        const rawOutside = await sql<{ total: string }>`
          select sum(cost_eur) as total from cost_ledger
          where created_at >= now() - interval '30 days' and department = 'engineering'
        `.execute(getDb()); // separate connection = uncorrupted view
        expect(engineering?.formatted).not.toBe(formatEur(Number(rawOutside.rows[0].total)));

        throw new Error("rollback-sensitivity-probe");
      })
      .catch((err: Error) => {
        if (err.message !== "rollback-sensitivity-probe") throw err;
      });

    // corruption rolled back — equality restored
    const res = await sql<{ n: number }>`
      select count(*)::int as n from cost_ledger
      where meta->>'seed' = ${SEED} and department = 'finance'
    `.execute(getDb());
    expect(res.rows[0].n).toBe(2);
  });
});
