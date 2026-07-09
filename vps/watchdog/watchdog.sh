#!/usr/bin/env bash
# hermes watchdog (07-06 Task 2, master PHASE-07 rule): every 5 minutes
# (systemd timer) inspect the current job window of every enabled hermes job —
# kill when over ANY budget field, or when running past 2 hours without the
# declared artifact on disk. Kill = `systemctl restart hermes` (the in-flight
# job dies; the idle gateway comes back), audit row (actor 'watchdog', action
# 'hermes_job_killed'), anomaly line appended to the morning report artifact.
#
# THRESHOLD PARITY with tools/dxb-cli/src/watchdog-decide.ts decideKill() —
# change BOTH or neither. Facts source: cost_ledger (department='hermes',
# window = since the job's most recent scheduled fire); steps ≈ ledger rows
# (one brain call per row via the LiteLLM virtual key — T-07-21 wiring).
# A window with zero ledger rows is a cron-miss, not a runaway: logged, not
# killed. Per-window kill dedup via the audit trail (no restart loops).
set -euo pipefail

HERMES_DIR="${HERMES_DIR:-/opt/dxb/vps/hermes}"
ENABLED="$HERMES_DIR/jobs.enabled"
COMPOSE="${DXB_COMPOSE:-/opt/dxb/vps/compose.yaml}"
ARTIFACTLESS_LIMIT_MIN=120   # = watchdog-decide.ts ARTIFACTLESS_LIMIT_MS

psql_q() { # $1=sql -> tuples-only, pipe-separated
  sudo docker compose -f "$COMPOSE" --profile core exec -T db \
    psql -U postgres -d postgres -t -A -F'|' -q -c "$1"
}

hermes_active() {
  [ "$(sudo systemctl is-active hermes 2>/dev/null || true)" = "active" ]
}

now_epoch=$(date +%s)
checked=0; killed=0

for f in "$ENABLED"/*.md; do
  [ -e "$f" ] || continue
  job=$(basename "$f" .md)

  # --- mandatory fields (loader already enforced presence; parse values) ---
  schedule=$(grep -m1 'schedule:' "$f" | sed 's/.*schedule:[[:space:]]*"\{0,1\}\([0-9* ]*\)"\{0,1\}.*/\1/')
  min=$(echo "$schedule" | awk '{print $1}')
  hour=$(echo "$schedule" | awk '{print $2}')
  max_steps=$(grep -m1 'max_steps:' "$f" | sed 's/.*max_steps:[[:space:]]*\([0-9]*\).*/\1/')
  max_tokens=$(grep -m1 'max_tokens:' "$f" | sed 's/.*max_tokens:[[:space:]]*\([0-9]*\).*/\1/')
  max_cost=$(grep -m1 'max_cost_eur:' "$f" | sed 's/.*max_cost_eur:[[:space:]]*\([0-9.]*\).*/\1/')
  artifact_tpl=$(grep -m1 'artifact:' "$f" | sed 's/.*artifact:[[:space:]]*"\{0,1\}\([^"]*\)"\{0,1\}.*/\1/')

  # --- current window: most recent scheduled fire (today, else yesterday) ---
  window_start=$(date -d "today ${hour}:${min}" +%s)
  if [ "$window_start" -gt "$now_epoch" ]; then
    window_start=$(date -d "yesterday ${hour}:${min}" +%s)
  fi
  window_iso=$(date -u -d "@$window_start" +%FT%TZ)
  window_date=$(date -d "@$window_start" +%F)
  artifact="$HERMES_DIR/${artifact_tpl//\{date\}/$window_date}"
  checked=$((checked+1))

  # artifact on disk = job completed → healthy, untouched
  [ -s "$artifact" ] && continue

  # --- observed consumption this window (cost_ledger, dept hermes) ---
  row=$(psql_q "SELECT COALESCE(SUM(cost_eur),0), COALESCE(SUM(prompt_tokens+completion_tokens),0), COUNT(*)
                FROM cost_ledger WHERE department='hermes' AND created_at >= '$window_iso';") || {
    echo "watchdog: ledger query failed (db down?) — no decision this tick" >&2
    continue
  }
  spent=$(echo "$row" | cut -d'|' -f1)
  tokens=$(echo "$row" | cut -d'|' -f2)
  steps=$(echo "$row" | cut -d'|' -f3)
  runtime_min=$(( (now_epoch - window_start) / 60 ))

  # --- decideKill() parity: over ANY budget field, or artifactless past 2h ---
  reason=""
  if awk "BEGIN{exit !($spent > $max_cost)}"; then
    reason="over_budget:cost ${spent}>${max_cost}"
  elif [ "$steps" -gt "$max_steps" ]; then
    reason="over_budget:steps ${steps}>${max_steps}"
  elif [ "$tokens" -gt "$max_tokens" ]; then
    reason="over_budget:tokens ${tokens}>${max_tokens}"
  elif [ "$steps" -gt 0 ] && [ "$runtime_min" -gt "$ARTIFACTLESS_LIMIT_MIN" ] && hermes_active; then
    reason="artifactless_2h runtime_min=${runtime_min}"
  fi
  [ -z "$reason" ] && continue

  # --- dedup: this window already killed → don't restart-loop ---
  dup=$(psql_q "SELECT COUNT(*) FROM audit_log WHERE action='hermes_job_killed'
                AND payload->>'job'='$job' AND payload->>'window_start'='$window_iso';") || dup=0
  [ "${dup:-0}" -gt 0 ] && continue

  echo "KILL $job — $reason" >&2
  sudo systemctl restart hermes || echo "watchdog: restart failed" >&2
  psql_q "INSERT INTO audit_log (actor, actor_type, action, payload) VALUES
          ('watchdog','system','hermes_job_killed', jsonb_build_object(
            'job','$job','reason','$reason','window_start','$window_iso',
            'budget_snapshot', jsonb_build_object(
              'spent_eur',$spent,'steps',$steps,'tokens',$tokens,
              'max_cost_eur',$max_cost,'max_steps',$max_steps,'max_tokens',$max_tokens)));" \
    >/dev/null || echo "watchdog: audit write failed — kill still executed" >&2
  mkdir -p "$(dirname "$artifact")"
  echo "> WATCHDOG ANOMALY $(date -u +%FT%TZ): job \`$job\` killed — $reason" >> "$artifact"
  killed=$((killed+1))
done

echo "WATCHDOG_OK checked=$checked killed=$killed"
