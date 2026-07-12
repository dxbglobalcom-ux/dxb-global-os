// E5.4b — HR job handlers (HR spec §3: run INSIDE the kernel/scheduler worker, no new
// resident service — R5). Each handler is a pure SQL pass over existing tables; LLM-using
// HR work is NOT here (that is a normal agent run per spec §14). All four write their
// findings to audit_log (job log idiom) and broadcast only when something needs eyes.
//
// Handlers receive the shared kysely instance from the caller (outbox-executor scheduler)
// so this package stays connection-free (same pattern as memory-router handlers).
import type { Kysely } from "kysely";
import { sql } from "kysely";

// hr.performance_daily (spec §2 "Performans değerlendirme"): fold yesterday's run/violation
// counts into employee_records.performance_history for employees that actually ran.
// Score formula v1 (spec §26 risk note: multi-source, CEO-visible in settings later):
// success_ratio of agent_runs in the window; employees with zero runs get no entry (no noise).
export async function hrPerformanceDaily(db: Kysely<any>): Promise<void> {
  await sql`
    WITH window_runs AS (
      SELECT employee_id,
             count(*)                                   AS runs,
             count(*) FILTER (WHERE status = 'succeeded') AS ok
        FROM agent_runs
       WHERE started_at >= now() - interval '1 day'
         AND employee_id IS NOT NULL
       GROUP BY employee_id
    ), updated AS (
      UPDATE employee_records er
         SET performance_history = er.performance_history ||
               jsonb_build_object('event', 'daily_kpi', 'at', now(),
                                  'runs', w.runs, 'ok', w.ok,
                                  'score', round(w.ok::numeric / w.runs, 2)),
             updated_at = now()
        FROM window_runs w
       WHERE er.employee_id = w.employee_id
       RETURNING er.employee_id
    )
    INSERT INTO audit_log (actor, actor_type, action, payload)
    SELECT 'hr.performance_daily', 'system', 'hr.job.performance_daily',
           jsonb_build_object('employees_scored', count(*))
      FROM updated
  `.execute(db);
}

// hr.probation_check (spec §26 edge: indefinite probation): employees past
// hr.probation_max_days get an audit alert + org broadcast (forced-evaluation signal).
export async function hrProbationCheck(db: Kysely<any>): Promise<void> {
  await sql`
    WITH overdue AS (
      SELECT employee_id, slug, days_in_probation
        FROM v_hr_probation_queue
       WHERE overdue
    ), logged AS (
      INSERT INTO audit_log (actor, actor_type, action, payload)
      SELECT 'hr.probation_check', 'system', 'hr.probation_overdue',
             jsonb_build_object('employee_id', employee_id, 'slug', slug,
                                'days', days_in_probation)
        FROM overdue
      RETURNING 1
    )
    SELECT notify_broadcast('org', 'hr.probation_overdue',
             jsonb_build_object('count', (SELECT count(*) FROM overdue)))
     WHERE EXISTS (SELECT 1 FROM overdue)
  `.execute(db);
}

// hr.stale_persona_scan (spec §3): non-archived employees still on a v0 placeholder
// persona (unwritten) or with no bound persona — the "awaiting authorship" watchlist.
export async function hrStalePersonaScan(db: Kysely<any>): Promise<void> {
  await sql`
    INSERT INTO audit_log (actor, actor_type, action, payload)
    SELECT 'hr.stale_persona_scan', 'system', 'hr.stale_persona_scan',
           jsonb_build_object(
             'unbound', count(*) FILTER (WHERE persona_id IS NULL),
             'v0_placeholder', count(*) FILTER (WHERE persona_version LIKE 'v0%'),
             'at', now())
      FROM agents
     WHERE employment_status <> 'archived'
  `.execute(db);
}

// hr.training_queue (spec §2 "Eğitim verme"): employees with open training_needs —
// digest count to audit; the training itself is a persona revision + library grant
// (owning flow), never executed here.
export async function hrTrainingQueue(db: Kysely<any>): Promise<void> {
  await sql`
    INSERT INTO audit_log (actor, actor_type, action, payload)
    SELECT 'hr.training_queue', 'system', 'hr.training_queue',
           jsonb_build_object('employees_with_needs', count(*), 'at', now())
      FROM employee_records
     WHERE training_needs IS NOT NULL AND array_length(training_needs, 1) > 0
  `.execute(db);
}
