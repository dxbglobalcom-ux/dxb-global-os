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
      // Third class, measured 2026-07-26 13:53: a policy-mutation case
      // mid-flight raises 'hook:conflict:*' while its temporary severities
      // disagree; the policies roll back, the alert stays. Unlike the classes
      // above this one CAN occur in production, so the sweep is
      // SELF-VERIFYING: an unresolved conflict alert is removed only when the
      // live hook_policies table shows NO actual severity disagreement on any
      // gate/check pair — a real conflict survives the sweep untouched.
      const hc = await sql`
        DELETE FROM alerts a
         WHERE a.source = 'hook'
           AND a.dedup_key LIKE 'hook:conflict:%'
           AND a.resolved_at IS NULL
           AND NOT EXISTS (
             -- same grouping the engine uses (policies.ts resolveConflicts):
             -- a "check" is gate + rule->>'check', never the whole rule body
             SELECT 1 FROM hook_policies p
              WHERE p.enabled
              GROUP BY p.gate, p.rule->>'check'
             HAVING count(DISTINCT p.severity) > 1
           )
      `.execute(getDb());
      const k = Number(hc.numAffectedRows ?? 0);
      if (k > 0) {
        console.log(
          `[global-teardown] swept ${k} stale hook-conflict alert(s) (no live policy disagreement)`,
        );
      }
      // Fourth class, caught by the CEO himself on the Görevler board
      // 2026-07-27 00:05: "Başarısız 9" — seven of those nine rows were MINE.
      // The e8 observability suites open real `tasks` rows and fail them on
      // purpose (that IS the thing under test), and nothing swept the rows
      // afterwards, so a full-suite run posted seven fresh failures onto the
      // CEO's board. Alerts were already swept above; tasks were not.
      //
      // Test-owned by construction: production never writes an objective or
      // label starting with "E8.1 observability" or "E8.3 probe". Children are
      // removed first (no ON DELETE CASCADE on these FKs) in the same order the
      // purge door uses.
      const probeWhere = sql`
        SELECT id FROM tasks
         WHERE objective LIKE 'E8.1 observability%' OR objective LIKE 'E8.3 probe%'
            OR label LIKE 'E8.1 observability%' OR label LIKE 'E8.3 probe%'
      `;
      await sql`UPDATE tasks SET parent_task_id = NULL WHERE parent_task_id IN (${probeWhere})`.execute(getDb());
      // The run's own children first — measured 2026-07-27: deleting agent_runs
      // straight away trips tool_calls_run_id_fkey. Depth before breadth.
      const probeRuns = sql`SELECT id FROM agent_runs WHERE task_id IN (${probeWhere})`;
      // column names measured, not assumed (pg_constraint → conkey → attname):
      // approvals points at a run through `reanalysis_run_id`, everyone else
      // through `run_id`.
      for (const gchild of [
        "tool_calls", "file_changes", "decision_log", "hook_violations",
        "library_usage_log", "memory_index", "alerts",
      ]) {
        await sql`DELETE FROM ${sql.raw(gchild)} WHERE run_id IN (${probeRuns})`.execute(getDb());
      }
      await sql`UPDATE approvals SET reanalysis_run_id = NULL WHERE reanalysis_run_id IN (${probeRuns})`.execute(getDb());
      await sql`UPDATE agent_runs SET parent_run_id = NULL WHERE parent_run_id IN (${probeRuns})`.execute(getDb());
      for (const child of ["task_events", "agent_runs", "cost_ledger", "alerts", "approvals"]) {
        await sql`DELETE FROM ${sql.raw(child)} WHERE task_id IN (${probeWhere})`.execute(getDb());
      }
      const probes = await sql`DELETE FROM tasks WHERE id IN (${probeWhere})`.execute(getDb());
      const p = Number(probes.numAffectedRows ?? 0);
      if (p > 0) {
        console.log(`[global-teardown] swept ${p} test-probe task row(s) (e8 observability class)`);
      }
      // Fifth class, measured 2026-07-27 right after W2.6 shipped: the r31
      // voice suite drives a real call, and answering a call MIRRORS both turns
      // onto the CEO's chat board (U15 D13 one-conversation law). The suite
      // deleted its `voice_calls` and `intents` rows and never knew about the
      // mirror, so four probe turns landed inside the morning briefing's own
      // conversation — the 12-hour idle rule attaches new turns to the newest
      // thread, which is now Hamza's briefing.
      //
      // This class is the worst of the five: it is not an alert the CEO can
      // dismiss, it is text inside a conversation he is meant to read.
      // Test-owned by construction — production voice turns are the CEO's own
      // speech, and these strings come from `tests/r31/voice-line.test.ts`
      // (the second pattern is the TTS-normalised form of "R31 probe:", which
      // the intake rewrites before the mirror sees it).
      const chatProbes = await sql`
        DELETE FROM chat_messages
         WHERE source = 'voice'
           -- ILIKE and the STEM, not the sentence: the intake normalises the
           -- probe text before the mirror sees it, so the same case reaches the
           -- board as "R31 probe:", "F31 Probe", "Pre-31 Probe" and "ve otuz bir
           -- probe … görevin nedir". Measured 2026-07-27: a case-sensitive
           -- pattern swept 178 rows and left 15 behind.
           AND (content ILIKE '%probe%şirketin görev%' OR content LIKE 'R31 %')
      `.execute(getDb());
      const c = Number(chatProbes.numAffectedRows ?? 0);
      if (c > 0) {
        console.log(`[global-teardown] swept ${c} voice-probe chat message(s) off the CEO board (r31 class)`);
        // A thread the sweep emptied was never a conversation — the same rule
        // migration 20260726006000 applied to the CEO's three lost "selam"
        // attempts. A thread that still holds a message is history: untouched.
        const ghosts = await sql`
          DELETE FROM chat_sessions s
           WHERE NOT EXISTS (SELECT 1 FROM chat_messages m WHERE m.session_id = s.id)
        `.execute(getDb());
        const g = Number(ghosts.numAffectedRows ?? 0);
        if (g > 0) console.log(`[global-teardown] swept ${g} emptied chat thread(s)`);
      }
    } finally {
      await closeDb().catch(() => {});
    }
  };
}
