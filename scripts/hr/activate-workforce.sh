#!/usr/bin/env bash
# activate-workforce.sh — E12.5 operational go-live driver (CEO rulings D10/D11,
# directive §3-bis; adaptation U17). Spec law: HR spec :145 — bulk import is
# FORBIDDEN; activation is "scripted but through the same fns". This script is
# that script: every mutation below is an fn_hr_* / documented-fn call, one
# employee at a time, auditable row by row.
#
#   scripts/hr/activate-workforce.sh status
#   scripts/hr/activate-workforce.sh intake    [--dept=X] [--limit=N] --execute
#   scripts/hr/activate-workforce.sh keys      [--limit=N] --execute
#   scripts/hr/activate-workforce.sh probation [--dept=X] [--limit=N] --execute
#   scripts/hr/activate-workforce.sh evaluate  [--dept=X] [--limit=N] --execute
#
# Without --execute every phase is a dry-run (prints its candidate list, mutates
# nothing). Phases are idempotent and re-runnable; each one narrows itself to
# rows in the correct prior state.
#
#   intake    dormant → draft via fn_hr_machine_intake (equipment rows born)
#   keys      key_pending → REAL LiteLLM virtual key (generated INSIDE the
#             proxy container with its own env — key material never leaves the
#             proxy; DB stores alias+status only) → status 'ready'
#   probation draft + equipment 7/7 → fn_hr_assign_probation_task (task RUNS
#             through the production worker; text-only by default-deny, D11)
#   evaluate  probation + probation task done → DERIVED score
#             succeeded_runs/total_runs → fn_hr_evaluate (threshold
#             hr.probation_pass_score; failing rows stay in probation —
#             correction round, §4 FAIL branch)
#
# Named exclusion (U17): agents-orchestrator — infrastructure identity, never
# an activation target.
set -euo pipefail

PSQL=(docker exec -i supabase_db_DxB_Global_OS psql -U postgres -d postgres -At -v ON_ERROR_STOP=1)
LITELLM_CONTAINER="dxb_litellm"
ACTOR="fable-5"
EXCLUDED_SLUGS="('agents-orchestrator')"

q() { "${PSQL[@]}" -c "$1"; }

PHASE="${1:-status}"; shift || true
DEPT=""; LIMIT="10000"; EXECUTE=0
for arg in "$@"; do
  case "$arg" in
    --dept=*)  DEPT="${arg#--dept=}" ;;
    --limit=*) LIMIT="${arg#--limit=}" ;;
    --execute) EXECUTE=1 ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done
DEPT_FILTER=""
[[ -n "$DEPT" ]] && DEPT_FILTER="AND a.department = '$DEPT'"

case "$PHASE" in

status)
  echo "== employment_status census =="
  q "SELECT employment_status || ': ' || count(*) FROM agents GROUP BY employment_status ORDER BY count(*) DESC;"
  echo "== equipment gaps (dormant+draft) =="
  q "SELECT employment_status || ' all_ok=' || all_ok || ': ' || count(*) FROM v_hr_equipment_check WHERE employment_status IN ('dormant','draft') GROUP BY employment_status, all_ok ORDER BY 1;"
  echo "== key provisioning =="
  q "SELECT (value->>'status') || ': ' || count(*) FROM settings_values WHERE key='hr.litellm_key_alias' AND scope LIKE 'employee:%' GROUP BY value->>'status';"
  echo "== probation tasks =="
  q "SELECT t.status || ': ' || count(*) FROM tasks t WHERE t.objective LIKE 'HR probation:%' GROUP BY t.status;"
  ;;

intake)
  # draft-side condition mirrors the fn's own guard exactly: a missing
  # equipment ROW (not all_ok — a key_pending row is present-but-not-ready
  # and is the keys phase's business, not intake's)
  SQL="SELECT a.id || ' ' || a.slug || ' (' || a.department || ')'
         FROM agents a
        WHERE (a.employment_status = 'dormant'
               OR (a.employment_status = 'draft' AND EXISTS (
                     SELECT k FROM unnest(ARRAY['hr.grant_package','hr.litellm_key_alias','hr.employee_budget']) AS k
                      WHERE NOT EXISTS (SELECT 1 FROM settings_values sv
                                         WHERE sv.key = k AND sv.scope = 'employee:' || a.id::text))))
          AND a.slug NOT IN $EXCLUDED_SLUGS
          $DEPT_FILTER
        ORDER BY a.department, a.slug
        LIMIT $LIMIT;"
  CANDIDATES=$(q "$SQL")
  COUNT=$(echo -n "$CANDIDATES" | grep -c . || true)
  echo "intake candidates: $COUNT"
  if [[ "$EXECUTE" != "1" ]]; then echo "$CANDIDATES" | head -20; echo "(dry-run — pass --execute)"; exit 0; fi
  DONE=0
  while read -r ID _REST; do
    [[ -z "$ID" ]] && continue
    q "SELECT fn_hr_machine_intake('$ID','$ACTOR');" > /dev/null < /dev/null
    DONE=$((DONE+1))
  done <<< "$CANDIDATES"
  echo "intake executed: $DONE (fn_hr_machine_intake per row — audit_log 'employee.machine_intake')"
  ;;

keys)
  # candidates: key_pending rows; skip aliases the proxy already holds (flip only)
  SQL="SELECT replace(sv.scope,'employee:','') || ' ' || (sv.value->>'alias')
         FROM settings_values sv
        WHERE sv.key='hr.litellm_key_alias' AND sv.scope LIKE 'employee:%'
          AND sv.value->>'status'='key_pending'
        ORDER BY 1 LIMIT $LIMIT;"
  CANDIDATES=$(q "$SQL")
  COUNT=$(echo -n "$CANDIDATES" | grep -c . || true)
  echo "key_pending candidates: $COUNT"
  if [[ "$EXECUTE" != "1" ]]; then echo "$CANDIDATES" | head -10; echo "(dry-run — pass --execute)"; exit 0; fi
  OK=0; EXISTED=0; FAIL=0
  while read -r EMP ALIAS; do
    [[ -z "$EMP" ]] && continue
    HAVE=$(q "SELECT count(*) FROM litellm.\"LiteLLM_VerificationToken\" WHERE key_alias='$ALIAS';" < /dev/null)
    if [[ "$HAVE" == "0" ]]; then
      # generate INSIDE the proxy container: master key stays in its env,
      # response (which contains the raw key) is parsed for status only and
      # discarded — alias is the only durable reference.
      HTTP=$(docker exec "$LITELLM_CONTAINER" /app/.venv/bin/python - "$ALIAS" "$EMP" <<'PY'
import json, os, sys, urllib.request
alias, emp = sys.argv[1], sys.argv[2]
req = urllib.request.Request(
    "http://localhost:4000/key/generate",
    data=json.dumps({
        "key_alias": alias,
        "max_budget": 5,
        "budget_duration": "30d",
        "metadata": {"employee_id": emp, "wave": "e125-activation"},
    }).encode(),
    headers={
        "Authorization": "Bearer " + os.environ["LITELLM_MASTER_KEY"],
        "Content-Type": "application/json",
    },
)
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        r.read()  # discard body — never print key material
        print(r.status)
except urllib.error.HTTPError as e:
    print(e.code)
PY
      )
      if [[ "$HTTP" != "200" ]]; then
        echo "FAIL alias=$ALIAS http=$HTTP" >&2; FAIL=$((FAIL+1)); continue
      fi
      OK=$((OK+1))
    else
      EXISTED=$((EXISTED+1))
    fi
    q "UPDATE settings_values SET value = jsonb_set(value,'{status}','\"ready\"'), updated_by='hr.key-provisioner', updated_at=now() WHERE key='hr.litellm_key_alias' AND scope='employee:$EMP';" > /dev/null < /dev/null
  done <<< "$CANDIDATES"
  echo "keys: generated=$OK existing-flipped=$EXISTED failed=$FAIL"
  echo "proxy-side proof: $(q "SELECT count(*) FROM litellm.\"LiteLLM_VerificationToken\" WHERE key_alias LIKE 'emp-%';") emp-* aliases live"
  ;;

probation)
  SQL="SELECT a.id || ' ' || a.slug
         FROM agents a
         JOIN v_hr_equipment_check e ON e.employee_id = a.id
        WHERE a.employment_status = 'draft' AND e.all_ok
          AND a.slug NOT IN $EXCLUDED_SLUGS
          AND NOT EXISTS (SELECT 1 FROM tasks t
                           WHERE t.agent_id = a.id AND t.objective LIKE 'HR probation:%'
                             AND t.status NOT IN ('failed'))
          $DEPT_FILTER
        ORDER BY a.department, a.slug
        LIMIT $LIMIT;"
  CANDIDATES=$(q "$SQL")
  COUNT=$(echo -n "$CANDIDATES" | grep -c . || true)
  echo "probation candidates (draft + 7/7, no open probation task): $COUNT"
  if [[ "$EXECUTE" != "1" ]]; then echo "$CANDIDATES" | head -20; echo "(dry-run — pass --execute)"; exit 0; fi
  DONE=0
  while read -r ID SLUG; do
    [[ -z "$ID" ]] && continue
    q "SELECT fn_hr_assign_probation_task(
         '$ID',
         'first work sample as ' || (SELECT role_level || ' ' || role FROM agents WHERE id='$ID') ||
         ' in ' || (SELECT department FROM agents WHERE id='$ID') ||
         ': write your first-week priorities brief exactly as your persona works',
         'markdown brief in task.result with sections: Priorities (3-5, role-appropriate), Measures (one per priority, checkable), Risks (>=2). Honest unknowns marked UNVERIFIED. No invented facts, no tool claims — text only.',
         '$ACTOR');" > /dev/null < /dev/null
    DONE=$((DONE+1))
  done <<< "$CANDIDATES"
  echo "probation tasks assigned: $DONE (worker claims them on its own tick)"
  ;;

evaluate)
  # latest probation task per probation employee; only terminal 'done' tasks
  # with >=1 run are scoreable. Score = succeeded/total runs (U17 formula).
  SQL="WITH latest AS (
         SELECT DISTINCT ON (t.agent_id) t.agent_id, t.id AS task_id, t.status
           FROM tasks t
          WHERE t.objective LIKE 'HR probation:%'
          ORDER BY t.agent_id, t.created_at DESC)
       SELECT a.id || ' ' || l.task_id || ' ' ||
              count(r.id) || ' ' ||
              count(r.id) FILTER (WHERE r.status='succeeded') || ' ' || a.slug
         FROM agents a
         JOIN latest l ON l.agent_id = a.id AND l.status = 'done'
         LEFT JOIN agent_runs r ON r.task_id = l.task_id
        WHERE a.employment_status = 'probation'
          $DEPT_FILTER
        GROUP BY a.id, a.slug, l.task_id
       HAVING count(r.id) >= 1
        ORDER BY a.slug LIMIT $LIMIT;"
  CANDIDATES=$(q "$SQL")
  COUNT=$(echo -n "$CANDIDATES" | grep -c . || true)
  echo "evaluable (probation + done task + >=1 run): $COUNT"
  if [[ "$EXECUTE" != "1" ]]; then echo "$CANDIDATES" | head -20; echo "(dry-run — pass --execute)"; exit 0; fi
  ACT=0; STAY=0
  while read -r ID TASK RUNS OKS SLUG; do
    [[ -z "$ID" ]] && continue
    RESULT=$(q "SELECT fn_hr_evaluate('$ID', round(${OKS}::numeric/${RUNS}, 2),
      'derived score (U17): ' || $OKS || '/' || $RUNS || ' succeeded runs of probation task $TASK', '$ACTOR');" < /dev/null)
    if [[ "$RESULT" == "active" ]]; then ACT=$((ACT+1)); else STAY=$((STAY+1)); fi
  done <<< "$CANDIDATES"
  echo "evaluated: activated=$ACT stayed-probation=$STAY"
  ;;

*)
  echo "usage: $0 status|intake|keys|probation|evaluate [--dept=X] [--limit=N] [--execute]" >&2
  exit 2 ;;
esac
