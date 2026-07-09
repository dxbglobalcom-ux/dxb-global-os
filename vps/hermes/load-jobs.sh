#!/usr/bin/env bash
# hermes bounded-job loader (07-06 Task 1, Pitfall 9 enforcement at LOAD time).
# A job file missing ANY mandatory field (schedule, max_steps, max_tokens,
# max_cost_eur, artifact, on_output) is REJECTED — loudly: stderr line + audit
# row. Valid jobs are linked into jobs.enabled/ (the only dir hermes's cron is
# pointed at), each with a state stamp the watchdog reads. Field parity with
# tools/dxb-cli/src/watchdog-decide.ts validateJob() — change BOTH or neither.
set -euo pipefail

HERMES_DIR="${HERMES_DIR:-/opt/dxb/vps/hermes}"
JOBS="$HERMES_DIR/jobs"
ENABLED="$HERMES_DIR/jobs.enabled"
COMPOSE="${DXB_COMPOSE:-/opt/dxb/vps/compose.yaml}"

mkdir -p "$ENABLED"
rm -f "$ENABLED"/*.md 2>/dev/null || true

audit_reject() { # $1=file $2=missing
  sudo docker compose -f "$COMPOSE" --profile core exec -T db psql -U postgres -d postgres -q -c \
    "INSERT INTO audit_log (actor, actor_type, action, payload) VALUES ('hermes:load-jobs','system','hermes_job_rejected', jsonb_build_object('file','$1','missing','$2'));" \
    2>/dev/null || echo "load-jobs: audit write failed (db down?) — rejection still enforced" >&2
}

ok=0; rejected=0
for f in "$JOBS"/*.md; do
  [ -e "$f" ] || continue
  missing=""
  for field in "schedule:" "max_steps:" "max_tokens:" "max_cost_eur:" "artifact:" "on_output:"; do
    grep -q "$field" "$f" || missing="$missing $field"
  done
  if [ -n "$missing" ]; then
    echo "REJECT $(basename "$f") — missing:$missing" >&2
    audit_reject "$(basename "$f")" "$missing"
    rejected=$((rejected+1))
    continue
  fi
  ln -sf "$f" "$ENABLED/$(basename "$f")"
  ok=$((ok+1))
done
echo "LOAD_JOBS_OK enabled=$ok rejected=$rejected"
