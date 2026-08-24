import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";
import {
  DAILY_ROWS_SHOWN,
  DAILY_WINDOW_DAYS,
  berlinDay,
  berlinDayRangeISO,
  dailyBreakdown,
  type CostDailySource,
} from "../../apps/dashboard/src/lib/costs.js";
import { formatEur } from "../../apps/dashboard/src/lib/format.js";

// E11.1 verification — COST_CONTROL_SPEC §5/§7 + roadmap acceptance
// "UI'da gün/dept/model kırılımı gerçek cost_ledger verisiyle":
//   1. v_cost_breakdown day grain EQUALS an independent Berlin-day raw SQL
//      aggregate over cost_ledger (view never consulted on the raw side).
//   2. Berlin midnight boundary: 23:59/00:01 Berlin land on different days.
//   3. dailyBreakdown module (the page's exact code path over the view)
//      matches raw per-day sums at rendered precision; order/ratio/window.
//   4. berlinDayRangeISO pins: summer/winter offsets + 23h/25h DST days.
//   5. Threshold alarms on the `cost` channel: pushing month spend past 70%
//      fires the attention alert via trigger (probe inside a rolled-back tx).
// Suite deletes ONLY what it creates (meta seed marker).

const db = () => getDb();
const SEED = "e111t";
const NOW = new Date();

// Two fixed Berlin days well inside the 30-day window (yesterday/day before,
// relative to the Berlin calendar so the window edge can't clip them).
const dayToday = berlinDay(NOW);
const dayMinus = (days: number) =>
  new Date(Date.parse(`${dayToday}T12:00:00Z`) - days * 86_400_000)
    .toISOString()
    .slice(0, 10);
const D1 = dayMinus(2);
const D2 = dayMinus(1);

async function seedRow(
  dept: string,
  model: string,
  cost: string,
  tokens: { p: number; c: number },
  atISO: string,
) {
  await sql`
    insert into cost_ledger (department, model, mode, prompt_tokens,
                             completion_tokens, cost_eur, source, meta, created_at)
    values (${dept}, ${model}, 'api', ${tokens.p}, ${tokens.c},
            ${cost}::numeric, 'manual', ${JSON.stringify({ seed: SEED })}::jsonb,
            ${atISO}::timestamptz)
  `.execute(db());
}

const midISO = (day: string) => {
  const { startISO } = berlinDayRangeISO(day);
  return new Date(Date.parse(startISO) + 12 * 3_600_000).toISOString();
};

beforeAll(async () => {
  // Day×dept×model spread across two Berlin days, awkward 6-decimal values.
  await seedRow("engineering", "claude-fable-5", "0.123456", { p: 1000, c: 200 }, midISO(D1));
  await seedRow("engineering", "claude-haiku-4-5", "1.000001", { p: 50, c: 5 }, midISO(D1));
  await seedRow("finance", "claude-fable-5", "3.333333", { p: 7000, c: 900 }, midISO(D1));
  await seedRow("finance", "claude-fable-5", "0.999999", { p: 300, c: 30 }, midISO(D2));
  await seedRow("design", "claude-haiku-4-5", "2.718281", { p: 4242, c: 424 }, midISO(D2));

  // Berlin-midnight boundary pair around D2: 23:59 of D1 vs 00:01 of D2.
  // Magnitudes stay small so seeding never crosses the REAL 70% threshold
  // trigger (those alerts would outlive the suite — the probe test below
  // exercises it inside a rolled-back transaction instead).
  const d2start = Date.parse(berlinDayRangeISO(D2).startISO);
  await seedRow("boundary", "claude-fable-5", "1.000000", { p: 1, c: 1 },
    new Date(d2start - 60_000).toISOString());
  await seedRow("boundary", "claude-fable-5", "2.000000", { p: 2, c: 2 },
    new Date(d2start + 60_000).toISOString());

  // Outside the 30-day window — must never surface in the daily module.
  await seedRow("ancient", "claude-fable-5", "99.000000", { p: 9, c: 9 },
    midISO(dayMinus(DAILY_WINDOW_DAYS + 5)));
});

afterAll(async () => {
  await sql`delete from cost_ledger where meta->>'seed' = ${SEED}`.execute(db());
  await closeDb();
});

describe("E11.1 — v_cost_breakdown day grain vs independent raw SQL", () => {
  it("view day×dept×model sums equal a raw Berlin-day aggregate over cost_ledger", async () => {
    const view = await sql<{
      day: string; department: string | null; model: string; cost: string;
    }>`
      select day::text as day, department, model, cost_eur::text as cost
      from v_cost_breakdown
      where department in ('engineering', 'finance', 'design', 'boundary')
        and day >= ${D1}::date
    `.execute(db());

    // Independent aggregate: no view, different SQL text. Same universe as
    // the view query (NOT seed-filtered): on a live ledger the seeded keys
    // can collide with real rows (measured 2026-07-17: a live 0-cost
    // engineering/fable row shared the seed's day|dept|model key), so both
    // sides must aggregate the same row set to be comparable.
    const raw = await sql<{
      day: string; department: string | null; model: string; cost: string;
    }>`
      select (c.created_at at time zone 'Europe/Berlin')::date::text as day,
             c.department, c.model, sum(c.cost_eur)::numeric(10,4)::text as cost
      from cost_ledger c
      where c.department in ('engineering', 'finance', 'design', 'boundary')
        and (c.created_at at time zone 'Europe/Berlin')::date >= ${D1}::date
      group by 1, 2, 3
    `.execute(db());
    expect(raw.rows.length).toBeGreaterThan(0);

    const key = (r: { day: string; department: string | null; model: string }) =>
      `${r.day}|${r.department}|${r.model}`;
    // The view's grain is finer (× mode × agent_id) — ACCUMULATE per key; a
    // plain Map(map) would silently keep only the last row of a key.
    const viewByKey = new Map<string, number>();
    for (const r of view.rows) {
      viewByKey.set(key(r), (viewByKey.get(key(r)) ?? 0) + Number(r.cost));
    }
    for (const r of raw.rows) {
      expect((viewByKey.get(key(r)) ?? 0).toFixed(4), key(r)).toBe(Number(r.cost).toFixed(4));
    }
  });

  it("Berlin midnight boundary: 23:59 and 00:01 land on different view days", async () => {
    const res = await sql<{ day: string; cost: string }>`
      select day::text as day, cost_eur::text as cost
      from v_cost_breakdown where department = 'boundary' order by day
    `.execute(db());
    expect(res.rows.map((r) => [r.day, r.cost])).toEqual([
      [D1, "1.0000"],
      [D2, "2.0000"],
    ]);
  });
});

describe("E11.1 — dailyBreakdown module (the page's code path)", () => {
  // kysely-backed source: SAME module logic, different row fetch (the seam
  // the page fills with PostgREST over v_cost_breakdown).
  const kyselyDaily: CostDailySource = {
    async sumByDay(sinceDay) {
      const res = await sql<{ day: string; cost: string; ptok: string; ctok: string }>`
        select day::text as day, sum(cost_eur) as cost,
               coalesce(sum(prompt_tokens), 0) as ptok,
               coalesce(sum(completion_tokens), 0) as ctok
        from v_cost_breakdown where day >= ${sinceDay}::date group by day
      `.execute(db());
      return res.rows.map((r) => ({
        day: r.day,
        totalEur: Number(r.cost),
        tokens: Number(r.ptok) + Number(r.ctok),
      }));
    },
  };

  it("every rendered day total matches raw SUM at rendered precision", async () => {
    const entries = await dailyBreakdown(kyselyDaily, NOW);
    expect(entries.length).toBeGreaterThanOrEqual(2);
    expect(entries.length).toBeLessThanOrEqual(DAILY_ROWS_SHOWN);

    const raw = await sql<{ day: string; total: string; tok: string }>`
      select (created_at at time zone 'Europe/Berlin')::date::text as day,
             sum(cost_eur) as total,
             sum(prompt_tokens + completion_tokens) as tok
      from cost_ledger
      where (created_at at time zone 'Europe/Berlin')::date
            >= (${dayToday}::date - ${DAILY_WINDOW_DAYS - 1}::int)
      group by 1
    `.execute(db());
    const rawByDay = new Map(raw.rows.map((r) => [r.day, r]));

    for (const e of entries) {
      const r = rawByDay.get(e.day);
      expect(r, e.day).toBeDefined();
      expect(e.formatted).toBe(formatEur(Number(r!.total)));
      expect(e.tokens).toBe(Number(r!.tok));
    }
    // newest day first; ratios normalized to the max bar
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i - 1].day.localeCompare(entries[i].day)).toBeGreaterThan(0);
    }
    expect(Math.max(...entries.map((e) => e.ratio))).toBe(1);
  });

  it("window discipline: the out-of-window seed day never surfaces", async () => {
    const entries = await dailyBreakdown(kyselyDaily, NOW);
    const ancient = dayMinus(DAILY_WINDOW_DAYS + 5);
    expect(entries.find((e) => e.day === ancient)).toBeUndefined();
  });
});

describe("E11.1 — berlinDayRangeISO pins", () => {
  it("summer day = UTC+2, winter day = UTC+1", () => {
    expect(berlinDayRangeISO("2026-07-14")).toEqual({
      startISO: "2026-07-13T22:00:00.000Z",
      endISO: "2026-07-14T22:00:00.000Z",
    });
    expect(berlinDayRangeISO("2026-01-10").startISO).toBe("2026-01-09T23:00:00.000Z");
  });

  it("DST transition days are 23h (Mar) and 25h (Oct)", () => {
    const mar = berlinDayRangeISO("2026-03-29");
    expect(Date.parse(mar.endISO) - Date.parse(mar.startISO)).toBe(23 * 3_600_000);
    const oct = berlinDayRangeISO("2026-10-25");
    expect(Date.parse(oct.endISO) - Date.parse(oct.startISO)).toBe(25 * 3_600_000);
  });
});

describe("E11.1 — threshold alarms on the cost channel (trigger, rolled back)", () => {
  it("crossing 70% of the monthly cap raises the attention alert, not the 90% one", async () => {
    const month = new Date().toISOString().slice(0, 7).replace("-", "");
    const active = await sql<{ n: number }>`
      select count(*)::int as n from alerts
      where dedup_key like ${"cost-" + month + "-%"} and resolved_at is null
    `.execute(db());
    expect(active.rows[0].n).toBe(0); // precondition: no live cost alert

    await db()
      .transaction()
      .execute(async (trx) => {
        // Cap sized so spend-so-far + the probe row lands between 70% and 90%.
        await sql`
          update budget_state set monthly_cap_eur = greatest(0.05, round((
            (select coalesce(sum(cost_eur), 0) from cost_ledger
              where created_at >= date_trunc('month', now())) + 0.10
          ) / 0.75, 2))
          where id = true
        `.execute(trx);
        await sql`
          insert into cost_ledger (department, model, mode, cost_eur, source, meta)
          values ('boundary', 'claude-fable-5', 'api', 0.10, 'manual',
                  ${JSON.stringify({ seed: SEED, probe: "threshold" })}::jsonb)
        `.execute(trx);

        const fired = await sql<{ level: string; source: string; dedup_key: string }>`
          select level, source, dedup_key from alerts
          where dedup_key like ${"cost-" + month + "-%"} and resolved_at is null
        `.execute(trx);
        expect(fired.rows).toEqual([
          { level: "attention", source: "cost", dedup_key: `cost-${month}-70` },
        ]);
        throw new Error("rollback-threshold-probe");
      })
      .catch((err: Error) => {
        if (err.message !== "rollback-threshold-probe") throw err;
      });

    // Rolled back: no alert residue, cap untouched.
    const after = await sql<{ n: number }>`
      select count(*)::int as n from alerts
      where dedup_key like ${"cost-" + month + "-%"} and resolved_at is null
    `.execute(db());
    expect(after.rows[0].n).toBe(0);
  });
});
