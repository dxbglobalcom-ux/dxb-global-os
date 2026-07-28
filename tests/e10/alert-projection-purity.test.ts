import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";

// CEO-caught defect 2026-07-28 01:50 ("inşaat kodları buraya şirkete
// yansıyor"): three construction artifacts stood on the CEO's KRİTİK UYARILAR
// panel — two 'Hook ihlali' rows and "Workflow 'r23t-58311cec-revise' run
// failed (RETRY_EXHAUSTED)".
//
// Root cause chain, measured the same night: earlyoom killed the VS Code
// window three times between 01:49 and 01:53 (journal: `sending SIGTERM to
// process ... "code": badness 893`), so the suite running inside it died and
// `tests/global-teardown.ts` — which owns five residue sweeps — never ran.
// The lesson is NOT a sixth sweep: a sweep only protects the CEO when the run
// survives to reach it. Both classes are closed at the projection instead, so
// a suite killed mid-flight cannot reach his panel at all.
//
// Neither gate knows a test name. Both are intrinsic:
//   A) a POST/RUNTIME violation with run_id IS NULL had no run behind it — those
//      gates fire inside the run scope, so it can only be a direct engine call.
//      The pre-gate is exempt and stays loud: measured over 1963 live rows,
//      pre is 516 null-run / 0 with-run — production rejections look exactly
//      like probes there, and suppressing them would hide real halal and
//      permission rejections from the CEO.
//   B) an alert about a workflow that no longer exists is, by construction,
//      an orphaned projection; deleting a workflow now resolves its open
//      alerts. Measured 2026-07-28 02:02: the r23 suite HAD deleted its
//      fixture workflow rows (0 rows left) while its alert stood.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const db = () => getDb();

/** Every case runs inside a transaction that is ALWAYS rolled back: the suite
 *  drives the LIVE database (E9.3 incident rule — a fixture that escapes lands
 *  on a CEO surface, which is the exact defect under test here). */
async function inRollback<T>(fn: (trx: never) => Promise<T>): Promise<T> {
  let out!: T;
  await db()
    .transaction()
    .execute(async (trx) => {
      out = await fn(trx as never);
      throw new Error("__rollback__");
    })
    .catch((e: unknown) => {
      if (!(e instanceof Error) || e.message !== "__rollback__") throw e;
    });
  return out;
}

afterAll(async () => {
  await closeDb().catch(() => {});
});

describe("alert projection purity (CEO panel)", () => {
  it.each(["post", "runtime"] as const)(
    "A: a %s-gate violation with NO run raises NO CEO alert",
    async (gate) => {
      const n = await inRollback(async (trx) => {
        const p = await sql<{ id: string }>`
          SELECT id FROM hook_policies WHERE enabled LIMIT 1`.execute(trx);
        const policyId = p.rows[0]?.id;
        expect(policyId, "seeded hook_policies row").toBeTruthy();

        const v = await sql<{ id: string }>`
          INSERT INTO hook_violations (run_id, policy_id, gate, detail, action_taken)
          VALUES (NULL, ${policyId}, ${gate}, 'engine probe without a run', 'revised')
          RETURNING id`.execute(trx);
        expect(v.rows[0]?.id, "the audit row is still written").toBeTruthy();

        const a = await sql<{ n: string }>`
          SELECT count(*)::text AS n FROM alerts
           WHERE source = 'hook' AND dedup_key LIKE '%:no-run'
             AND affected_area = ${`${gate}-gate`}`.execute(trx);
        return Number(a.rows[0].n);
      });
      expect(n).toBe(0);
    },
  );

  it("A-boundary: a PRE-gate violation with no run still alerts (production shape)", async () => {
    // Measured 2026-07-28: pre is 516 null-run / 0 with-run across the live
    // table — both callers gate BEFORE the run exists. Silencing it would hide
    // real halal/permission rejections, so this leg must stay loud.
    const n = await inRollback(async (trx) => {
      const p = await sql<{ id: string }>`
        SELECT id FROM hook_policies WHERE enabled LIMIT 1`.execute(trx);
      await sql`
        INSERT INTO hook_violations (run_id, policy_id, gate, detail, action_taken)
        VALUES (NULL, ${p.rows[0].id}, 'pre', 'real pre-gate rejection', 'rejected')
      `.execute(trx);
      const a = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM alerts
         WHERE source = 'hook' AND affected_area = 'pre-gate'
           AND dedup_key LIKE '%:no-run'`.execute(trx);
      return Number(a.rows[0].n);
    });
    expect(n).toBeGreaterThanOrEqual(1);
  });

  it("A-twin: a hook violation WITH a run still raises the alert (production leg intact)", async () => {
    const found = await inRollback(async (trx) => {
      const p = await sql<{ id: string }>`
        SELECT id FROM hook_policies WHERE enabled LIMIT 1`.execute(trx);
      const r = await sql<{ id: string }>`
        SELECT id FROM agent_runs ORDER BY started_at DESC LIMIT 1`.execute(trx);
      const runId = r.rows[0]?.id;
      expect(runId, "at least one agent_runs row to hang the violation on").toBeTruthy();

      await sql`
        INSERT INTO hook_violations (run_id, policy_id, gate, detail, action_taken)
        VALUES (${runId}, ${p.rows[0].id}, 'pre', 'violation inside a real run', 'rejected')
      `.execute(trx);

      const a = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM alerts
         WHERE source = 'hook' AND run_id = ${runId}
           AND dedup_key LIKE ${"hook:" + p.rows[0].id + ":rejected:%"}`.execute(trx);
      return Number(a.rows[0].n);
    });
    expect(found).toBeGreaterThanOrEqual(1);
  });

  it("B: deleting a workflow resolves its open alerts", async () => {
    const state = await inRollback(async (trx) => {
      const slug = `purity-${randomUUID().slice(0, 8)}`;
      const w = await sql<{ id: string }>`
        INSERT INTO workflows (slug, name, trigger)
        VALUES (${slug}, ${"projection purity fixture"}, '{"kind":"manual"}'::jsonb)
        RETURNING id`.execute(trx);
      expect(w.rows[0]?.id).toBeTruthy();

      await sql`
        INSERT INTO alerts (level, source, title, affected_area)
        VALUES ('high', 'workflow', ${`Workflow '${slug}' run failed (RETRY_EXHAUSTED)`},
                ${`workflow:${slug}`})`.execute(trx);

      const before = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM alerts
         WHERE affected_area = ${`workflow:${slug}`} AND resolved_at IS NULL`.execute(trx);

      await sql`DELETE FROM workflows WHERE slug = ${slug}`.execute(trx);

      const after = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM alerts
         WHERE affected_area = ${`workflow:${slug}`} AND resolved_at IS NULL`.execute(trx);
      return { before: Number(before.rows[0].n), after: Number(after.rows[0].n) };
    });
    expect(state.before).toBe(1);
    expect(state.after).toBe(0);
  });

  it("C: deleting a violation row deletes its alert projection", async () => {
    // Replaces the blind ':no-run' sweep that global-teardown used to run: a
    // suite deletes the violations it created (id watermark, E9.3), and the
    // projection follows. Production violations are never deleted, so a real
    // pre-gate rejection keeps its alert.
    const state = await inRollback(async (trx) => {
      const p = await sql<{ id: string }>`
        SELECT id FROM hook_policies WHERE enabled LIMIT 1`.execute(trx);
      const v = await sql<{ id: string }>`
        INSERT INTO hook_violations (run_id, policy_id, gate, detail, action_taken)
        VALUES (NULL, ${p.rows[0].id}, 'pre', 'probe rejection', 'rejected')
        RETURNING id`.execute(trx);
      const vid = v.rows[0].id;
      const before = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM alerts
         WHERE source_ref->>'table' = 'hook_violations'
           AND source_ref->>'id' = ${String(vid)}`.execute(trx);
      await sql`DELETE FROM hook_violations WHERE id = ${vid}`.execute(trx);
      const after = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM alerts
         WHERE source_ref->>'table' = 'hook_violations'
           AND source_ref->>'id' = ${String(vid)}`.execute(trx);
      return { before: Number(before.rows[0].n), after: Number(after.rows[0].n) };
    });
    expect(state.before).toBe(1);
    expect(state.after).toBe(0);
  });

  it("D: no construction residue stands on the CEO's active alert panel", async () => {
    const rows = await sql<{ affected_area: string | null; dedup_key: string | null }>`
      SELECT affected_area, dedup_key FROM alerts
       WHERE resolved_at IS NULL
         AND ((dedup_key LIKE '%:no-run'
               AND affected_area IN ('post-gate', 'runtime-gate'))
              OR (affected_area LIKE 'workflow:%'
                  AND NOT EXISTS (
                    SELECT 1 FROM workflows w
                     WHERE 'workflow:' || w.slug = alerts.affected_area))
              -- orphaned projection: the violation it points at is gone
              OR (source = 'hook'
                  AND source_ref->>'table' = 'hook_violations'
                  AND NOT EXISTS (
                    SELECT 1 FROM hook_violations hv
                     WHERE hv.id::text = alerts.source_ref->>'id')))
    `.execute(db());
    expect(rows.rows).toEqual([]);
  });
});
