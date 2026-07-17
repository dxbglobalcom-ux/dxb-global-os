// §22 gradual-transition flag — R2.3: moved verbatim from the orchestrator's
// hook-binding so BOTH spawn paths (task worker-shim, workflow agent step)
// read one implementation. The flag is the hook package's own business.
import { sql } from "kysely";
import { getDb } from "@dxb/shared";

export async function hookEnabled(employeeId: string | null): Promise<boolean> {
  try {
    const res = await sql<{ v: unknown }>`
      SELECT resolve_setting('hook.enabled', ${employeeId}::uuid) AS v
    `.execute(getDb());
    return res.rows[0]?.v === true;
  } catch (err) {
    console.error("[hook] hook.enabled read failed — assuming ENABLED (fail-closed):", err);
    return true;
  }
}

/** §22 "flag kapalı dönem geçicidir ve alert'lidir": a spawn flowing past a
 *  disabled hook is recorded loudly. Best-effort — never blocks dispatch. */
export async function alertHookDisabled(): Promise<void> {
  try {
    await sql`
      INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                          suggested_action, dedup_key)
      VALUES ('attention', 'hook', 'Hook disabled — spawns are flowing ungated',
              'hook binding', 'settings hook.enabled = false',
              'Re-enable the hook (fn_hook_set_policy governs policies; the flag is the §22 kill-switch). Hook-less production is a temporary state by spec.',
              'hook:disabled')
      ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
      DO NOTHING`.execute(getDb());
  } catch (err) {
    console.error("[hook] hook:disabled alert failed (spawn continues):", err);
  }
}
