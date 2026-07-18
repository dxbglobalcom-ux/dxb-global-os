#!/usr/bin/env bash
# E12.5 activation wave monitor — the cadence legs the resident scheduler does
# not own: (1) fn_hr_evaluate promotion (derived scores, no model call) and
# (2) a ONE-SHOT correction round for employees whose probation task the
# escalation ladder hard-stopped (audit 'task.blocked' — terminal by design,
# no phase re-assigns them; correction-round precedent set 2026-07-18 pilots).
# Runs detached (setsid); exits when the wave has nothing left it can move.
# Employees still failing after their correction round stay in probation —
# that boundary belongs to fn_hr_evaluate / the CEO, not this loop.
set -uo pipefail
cd "$(dirname "$0")/../.."

PSQL=(docker exec -i supabase_db_DxB_Global_OS psql -U postgres -d postgres -At -v ON_ERROR_STOP=1)
q() { "${PSQL[@]}" -c "$1"; }
LOG="var/wave-monitor.log"
INTERVAL="${WAVE_MONITOR_INTERVAL:-300}"
ACTOR="fable-5"

while true; do
  TS=$(date '+%F %T')

  EVAL=$(bash scripts/hr/activate-workforce.sh evaluate --execute 2>&1 | tail -1)

  CORR=$(q "SELECT count(*) FROM (
    SELECT fn_hr_assign_probation_task(a.id,
      'correction round (clean infra) — first work sample as ' || a.role_level || ' ' || a.role || ' in ' || a.department || ': write your first-week priorities brief exactly as your persona works',
      'markdown brief in task.result with sections: Priorities (3-5, role-appropriate), Measures (one per priority, checkable), Risks (>=2). Honest unknowns marked UNVERIFIED. No invented facts, no tool claims — text only.',
      '$ACTOR')
    FROM agents a
    WHERE a.employment_status = 'probation'
      AND EXISTS (SELECT 1 FROM tasks t
                    JOIN audit_log au ON au.task_id = t.id AND au.action = 'task.blocked'
                   WHERE t.agent_id = a.id AND t.objective LIKE 'HR probation:%'
                     AND t.status = 'failed')
      AND NOT EXISTS (SELECT 1 FROM tasks t2
                       WHERE t2.agent_id = a.id
                         AND t2.objective LIKE 'HR probation: correction%')
  ) s;")

  CENSUS=$(q "SELECT string_agg(employment_status || '=' || c, ' ' ORDER BY c DESC) FROM (
    SELECT employment_status, count(*) c FROM agents GROUP BY employment_status) x;")
  SNAP=$(q "SELECT coalesce(string_agg(s || '=' || c, ' ' ORDER BY s), 'none') FROM (
    SELECT t.status s, count(*) c FROM tasks t
     WHERE t.objective LIKE 'HR probation:%' GROUP BY t.status) x;")
  QAERR=$(grep -c 'verdict malformed twice' var/scheduler.log 2>/dev/null || echo 0)
  echo "[$TS] census: $CENSUS | tasks: $SNAP | corrections+$CORR | $EVAL | qa-malformed-total=$QAERR" >> "$LOG"

  OPEN=$(q "SELECT count(*) FROM tasks
             WHERE objective LIKE 'HR probation:%'
               AND status IN ('queued','review','running');")
  if [[ "$OPEN" == "0" && "$CORR" == "0" && "$EVAL" == *"activated=0 stayed-probation=0"* ]]; then
    echo "[$TS] WAVE MONITOR EXIT — no open probation tasks, nothing evaluable, no corrections owed" >> "$LOG"
    break
  fi

  sleep "$INTERVAL"
done
