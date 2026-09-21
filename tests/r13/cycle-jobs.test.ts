// R1.3 verification — REVENUE_ENGINE_SPEC §3/§22/§24.3: the four cycle
// handlers run against the live DB; intake screen auto-flags a haram-term
// opportunity to 'review' (NEVER a verdict), digests land in audit_log,
// brief broadcasts, rollup snapshots without inventing gap alerts.
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";
import { revenueBrief, revenueRollup, revenueScan, revenueScore } from "@dxb/revenue";
import { watchLedgers } from "../helpers/suite-scope.js";

const M = `r13-test-${randomUUID().slice(0, 8)}`;
const db = () => getDb();

// Its own footprints in audit_log / decision_log, swept in afterAll below.
const ledgerScope = watchLedgers(db);

afterAll(async () => {
  // 2026-09-21: and the two append-only ledgers too. Measured by running
  // every sandboxed file alone: this one left the rows named below, which
  // no FK chain reaches. Watermark AND signature — never the watermark alone.
  await ledgerScope.sweep({ audit: [{ actor: "revenue.brief" }, { actor: "revenue.rollup" }, { actor: "revenue.scan" }, { actor: "revenue.score" }] });
  await sql`DELETE FROM opportunities WHERE title LIKE ${M + "%"}`.execute(db());
  await sql`DELETE FROM audit_log WHERE payload::text LIKE ${"%" + M + "%"}`.execute(db());
  await closeDb();
});

describe("R1.3 cycle jobs (§3 daily loop, pre-R2 digest semantics)", () => {
  it("scan: haram-term opportunity auto-flags to REVIEW; clean one stays pending; digest row lands", async () => {
    const dirty = await sql<{ r: { id: string } }>`
      SELECT control_opportunity_register(${M + " kumar sitesi reklam kampanyası"}, 'ecommerce') AS r`.execute(db());
    const clean = await sql<{ r: { id: string } }>`
      SELECT control_opportunity_register(${M + " halal gida e-ticaret hattı"}, 'ecommerce') AS r`.execute(db());

    await revenueScan(db());

    const verdicts = await sql<{ id: string; halal_verdict: string; halal_reason: string | null }>`
      SELECT id, halal_verdict, halal_reason FROM opportunities WHERE title LIKE ${M + "%"}`.execute(db());
    const dirtyRow = verdicts.rows.find((r) => r.id === dirty.rows[0].r.id)!;
    const cleanRow = verdicts.rows.find((r) => r.id === clean.rows[0].r.id)!;
    expect(dirtyRow.halal_verdict).toBe("review");
    expect(dirtyRow.halal_reason).toContain("intake screen term");
    expect(cleanRow.halal_verdict).toBe("pending");

    const digest = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM audit_log
       WHERE action = 'revenue.job.scan' AND created_at > now() - interval '1 minute'`.execute(db());
    expect(digest.rows[0].n).toBeGreaterThanOrEqual(1);
  });

  it("score: backlog digest row with unscored count", async () => {
    await revenueScore(db());
    const res = await sql<{ payload: { unscored_backlog: number } }>`
      SELECT payload FROM audit_log
       WHERE action = 'revenue.job.score'
       ORDER BY id DESC LIMIT 1`.execute(db());
    expect(res.rows[0].payload.unscored_backlog).toBeGreaterThanOrEqual(1); // the two fixtures
  });

  it("brief: audit payload carries objectives (€50 draft) + pipeline + snev", async () => {
    await revenueBrief(db());
    const res = await sql<{ payload: { objectives: unknown[]; pipeline: object; snev: object } }>`
      SELECT payload FROM audit_log
       WHERE action = 'revenue.job.brief'
       ORDER BY id DESC LIMIT 1`.execute(db());
    const p = res.rows[0].payload;
    expect(Array.isArray(p.objectives)).toBe(true);
    expect(JSON.stringify(p.objectives)).toContain("50");
    expect(p.pipeline).toBeTypeOf("object");
    expect(p.snev).toBeTypeOf("object");
  });

  it("rollup: snapshot row lands; no gap alert without an active objective", async () => {
    const alertsBefore = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM alerts WHERE dedup_key LIKE 'revenue:gap:%'`.execute(db());
    await revenueRollup(db());
    const snap = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM audit_log
       WHERE action = 'revenue.job.rollup' AND created_at > now() - interval '1 minute'`.execute(db());
    expect(snap.rows[0].n).toBeGreaterThanOrEqual(1);
    const alertsAfter = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM alerts WHERE dedup_key LIKE 'revenue:gap:%'`.execute(db());
    expect(alertsAfter.rows[0].n).toBe(alertsBefore.rows[0].n); // draft has no pace
  });

  it("schedules: spec §24.3 query returns the 4 revenue crons", async () => {
    const res = await sql<{ name: string }>`
      SELECT name FROM pgboss.schedule WHERE name LIKE 'revenue%' ORDER BY name`.execute(db());
    expect(res.rows.map((r) => r.name)).toEqual([
      "revenue.brief", "revenue.rollup", "revenue.scan", "revenue.score",
    ]);
  });
});
