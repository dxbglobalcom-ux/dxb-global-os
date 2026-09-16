#!/usr/bin/env bash
# hr-demo-hire.sh — E5.4b acceptance run (HR spec §21/§24): end-to-end hire through the
# HR factory fns, plus the atomicity failure-injection proof. Uses the same psql idiom as
# sync-personas-to-db.sh. The probe employee is cleaned up at the end (roster unpolluted).
#
# Recorded adaptation (spec §24-3 expects `pnpm --filter hr run demo:hire`): the package
# script delegates to this file — packages/hr stays connection-free, DB access via the
# established docker-exec psql idiom, no new node DB dependency.
set -euo pipefail

PSQL=(docker exec -i supabase_db_DxB_Global_OS psql -U postgres -d postgres -At -v ON_ERROR_STOP=1)
SLUG="hr-demo-probe"

q() { "${PSQL[@]}" -c "$1"; }

echo "== E5.4b demo:hire — probe slug: $SLUG =="

# 0) pre-clean any previous probe (idempotent re-runs; unbind before persona delete)
q "DELETE FROM tasks WHERE agent_id IN (SELECT id FROM agents WHERE slug='$SLUG');" >/dev/null
q "UPDATE agents SET employment_status='draft', status='dormant' WHERE slug='$SLUG';" >/dev/null
# W15 / F056: personas are unbound through the door, never by a raw UPDATE
q "SELECT fn_persona_bind(id, NULL, 'demo-hire') FROM agents WHERE slug='$SLUG' AND persona_id IS NOT NULL;" >/dev/null
q "DELETE FROM personas WHERE employee_id IN (SELECT id FROM agents WHERE slug='$SLUG');" >/dev/null
q "DELETE FROM settings_values WHERE scope IN (SELECT 'employee:'||id FROM agents WHERE slug='$SLUG');" >/dev/null
q "DELETE FROM employee_records WHERE employee_id IN (SELECT id FROM agents WHERE slug='$SLUG');" >/dev/null
q "DELETE FROM agents WHERE slug='$SLUG';" >/dev/null

# 1) create (atomic 7-step birth) — people-hr, manager = CHRO via dept director fallback
EMP=$(q "SELECT fn_hr_create_employee('$SLUG','people-hr','worker','ops_agent',NULL,'glm-5.2',ARRAY['demo probe'],ARRAY['sandbox only'],'ceo');")
echo "created: $EMP"

# 2) equipment before key provisioning (expect e5 false → all_ok f)
echo "equipment pre-key: $(q "SELECT e1_org_row||' '||e2_record||' '||e3_hook||' '||e4_grants||' '||e5_litellm_key||' '||e6_budget||' '||e7_persona_task||' all_ok='||all_ok FROM v_hr_equipment_check WHERE employee_id='$EMP';")"

# 3) draft->probation MUST be blocked now (equipment gate proof)
if q "SELECT fn_hr_assign_probation_task('$EMP','early attempt','must fail','ceo');" 2>/dev/null; then
  echo "FAIL: probation transition succeeded with incomplete equipment"; exit 1
else
  echo "blocked as expected: draft->probation refused (missing e5 + persona)"
fi

# 4) simulate the LiteLLM key provisioning job completing (A2 eventual pattern —
#    in production the proxy job flips this; simulation is labeled, not hidden)
q "UPDATE settings_values SET value = jsonb_set(value,'{status}','\"ready\"'), updated_by='hr-demo(simulated-key-job)', updated_at=now() WHERE key='hr.litellm_key_alias' AND scope='employee:$EMP';" >/dev/null
echo "key provisioning simulated -> ready"

# 5) persona submit + gate (minimal valid body >=200 chars; author fable-5 — K2 period)
PID=$(q "SELECT fn_persona_submit('$EMP', '# PERSONA — HR Demo Probe
## 1. Role identity
Sandbox probe employee proving the E5.4b activation chain end to end. This body exists only to satisfy the persona gate inside the demo run; it is deleted with the probe at the end of the script. No production duties, no tool access, sandbox project only.
## 4. Decision method
Decides nothing alone; every action is the demo script. Escalation target: people-hr.', 'fable-5');")
q "SELECT fn_persona_gate('$PID','passed','E5.4b demo probe — gate exercised for chain proof (Fable in person); probe is deleted at script end.');" >/dev/null
# W15 / F056: the door gate-checks the persona, keeps persona_version true and writes the audit row
q "SELECT fn_persona_bind('$EMP'::uuid, '$PID'::uuid, 'demo-hire');" >/dev/null
echo "persona submitted+passed+bound: $PID"

# 6) equipment now (expect 7/7)
EQ=$(q "SELECT (e1_org_row AND e2_record AND e3_hook AND e4_grants AND e5_litellm_key AND e6_budget AND e7_persona_task)::text||' all_ok='||all_ok FROM v_hr_equipment_check WHERE employee_id='$EMP';")
echo "equipment 7/7: $EQ"
[[ "$EQ" == *"all_ok=t"* ]] || { echo "FAIL: equipment not 7/7"; exit 1; }

# 7) draft->probation + sandbox task
TASK=$(q "SELECT fn_hr_assign_probation_task('$EMP','summarize one audit_log day','summary text in task.result','ceo');")
STATUS=$(q "SELECT employment_status FROM agents WHERE id='$EMP';")
echo "probation task: $TASK · employment_status: $STATUS"
[[ "$STATUS" == "probation" ]] || { echo "FAIL: not in probation"; exit 1; }

# 8) evaluate below threshold (stays probation), then above (activates)
R1=$(q "SELECT fn_hr_evaluate('$EMP',0.5,'first round — below threshold','ceo');")
R2=$(q "SELECT fn_hr_evaluate('$EMP',0.9,'second round — passes','ceo');")
STATUS2=$(q "SELECT employment_status FROM agents WHERE id='$EMP';")
echo "evaluate 0.5 -> $R1 · evaluate 0.9 -> $R2 · employment_status: $STATUS2"
[[ "$R1" == "probation" && "$R2" == "active" && "$STATUS2" == "active" ]] || { echo "FAIL: evaluation chain wrong"; exit 1; }

# 9) §21 acceptance sweep: unequipped probation/active employees -> 0
SWEEP=$(q "SELECT count(*) FROM agents a WHERE a.employment_status IN ('probation','active') AND NOT EXISTS (SELECT 1 FROM v_hr_equipment_check e WHERE e.employee_id=a.id AND e.all_ok);")
echo "unequipped probation/active employees: $SWEEP"
[[ "$SWEEP" == "0" ]] || { echo "FAIL: unequipped active employees exist"; exit 1; }

# 10) atomicity failure-injection (spec §20): duplicate slug -> exception, zero partial rows
BEFORE=$(q "SELECT count(*) FROM settings_values WHERE scope LIKE 'employee:%';")
if q "SELECT fn_hr_create_employee('$SLUG','people-hr','worker','ops_agent',NULL,'glm-5.2',NULL,NULL,'ceo');" 2>/dev/null; then
  echo "FAIL: duplicate create did not raise"; exit 1
fi
AFTER=$(q "SELECT count(*) FROM settings_values WHERE scope LIKE 'employee:%';")
echo "atomicity: duplicate-create raised, settings rows before=$BEFORE after=$AFTER (no partials)"
[[ "$BEFORE" == "$AFTER" ]] || { echo "FAIL: partial rows leaked"; exit 1; }

# 11) cleanup — probe leaves the building (roster stays at production count)
# order matters: the activation lock forbids persona removal while active — de-activate first
q "DELETE FROM tasks WHERE agent_id='$EMP';" >/dev/null
q "UPDATE agents SET employment_status='draft', status='dormant' WHERE id='$EMP';" >/dev/null
# W15 / F056: unbind through the door (the agent was stood down on the line above, as the door requires)
q "SELECT fn_persona_bind('$EMP'::uuid, NULL, 'demo-hire');" >/dev/null
q "DELETE FROM personas WHERE employee_id='$EMP';" >/dev/null
q "DELETE FROM settings_values WHERE scope='employee:$EMP';" >/dev/null
q "DELETE FROM employee_records WHERE employee_id='$EMP';" >/dev/null
q "DELETE FROM agents WHERE id='$EMP';" >/dev/null
echo "cleanup done — probe removed"

echo "== demo:hire PASS =="
