// Global post-suite sweep (vitest globalSetup teardown — runs ONCE after ALL
// test files). Root cause 2026-07-25: the suite runs files SEQUENTIALLY
// (fileParallelism false) and several suites (e10, r13, r23, r42) probe the
// hook engine with ':no-run' calls — a file that runs AFTER the owning suite
// re-raises the same probe alert with nobody left to sweep it (measured: the
// halal_screen probe alert of full-suite run 05:57-06:01 reached the CEO's
// Alerts page at 05:59). Per-file sweeps stay (they scope the data rows);
// this teardown owns the one CEO-visible class: engine-call ':no-run' hook
// alerts, which by construction come only from tests (engine calls without a
// run happen nowhere in production — e10 suite comment).
export default function globalSetup(): () => Promise<void> {
  return async function teardown(): Promise<void> {
    process.env.DXB_DATABASE_URL ??=
      "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
    // Root has no direct 'pg' dependency — ride the shared package's own
    // pool exactly like the suites do (dist path: resolvable from vite-node
    // without the test-runner alias map).
    const { getDb, closeDb } = await import("../packages/shared/dist/index.js");
    const { sql } = await import("kysely");
    try {
      const res = await sql`
        DELETE FROM alerts WHERE source = 'hook' AND dedup_key LIKE '%:no-run'
      `.execute(getDb());
      const n = Number(res.numAffectedRows ?? 0);
      if (n > 0) {
        console.log(`[global-teardown] swept ${n} test-probe hook alert(s) (:no-run class)`);
      }
      // Second test-only class, measured on the CEO's Alerts page 2026-07-26
      // 04:23 ("Workflow 'e9t-retry' run failed"): e9 sweeps its own alerts,
      // but the RESIDENT scheduler can pick up a leftover queued run AFTER
      // that sweep and raise a fresh one — nobody is left to clean it. The
      // e9t- prefix is test-owned by construction (no production workflow
      // carries it), so this is safe and belongs at the very end of the run.
      const wf = await sql`
        DELETE FROM alerts WHERE source = 'workflow' AND affected_area LIKE 'workflow:e9t-%'
      `.execute(getDb());
      const m = Number(wf.numAffectedRows ?? 0);
      if (m > 0) {
        console.log(`[global-teardown] swept ${m} test-probe workflow alert(s) (e9t- class)`);
      }
    } finally {
      await closeDb().catch(() => {});
    }
  };
}
