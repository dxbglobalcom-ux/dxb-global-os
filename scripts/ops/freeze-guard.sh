#!/usr/bin/env bash
# freeze-guard — X230 RAM safety valve (CEO order 2026-07-18: "solve the freeze
# in the background, risk-free"). The machine froze three times on 2026-07-18
# with swap exhausted; measured drivers were transient process leaks, not the
# project residents. This sweep kills ONLY known leak patterns:
#
#   1. chroma-mcp (claude-mem per-hook spawn): normal life <4 min; measured
#      spike 10 concurrent x ~200MB. Older than 6 min = stuck.
#   2. Playwright headless_shell browsers older than 30 min: design passes
#      finish in minutes; an old headless_shell is an orphan. The CEO's real
#      Chrome is /opt/google/chrome/chrome and is NEVER matched.
#   3. kilo-serve / codex app-server whose parent died (ppid=1): ghost
#      extension hosts (recorded freeze factor, memory note 2026-07-15).
#
# Never touches: scheduler, next-server, docker containers, claude CLI,
# real Chrome, VS Code. Runs from cron every minute; silent unless it kills.
set -uo pipefail
LOG="${FREEZE_GUARD_LOG:-/home/ghost/DxB Global OS/var/freeze-guard.log}"

kill_pids() { # $1 = reason, stdin = pids
  local pids
  pids=$(tr '\n' ' ' | sed 's/ $//')
  [[ -z "$pids" ]] && return 0
  echo "[$(date '+%F %T')] $1: killing $pids" >> "$LOG"
  # shellcheck disable=SC2086
  kill $pids 2>/dev/null || true
}

# 1. stuck chroma-mcp (child + uv wrapper both match the pattern)
ps -eo pid,etimes,args | awk '$3 != "awk" && /chroma-mcp/ && $2 > 360 {print $1}' \
  | kill_pids "chroma-mcp stuck >6min"

# 2. orphaned Playwright headless browsers
ps -eo pid,etimes,comm | awk '$3 == "headless_shell" && $2 > 1800 {print $1}' \
  | kill_pids "headless_shell orphan >30min"

# 3. ghost extension hosts (parent gone)
ps -eo pid,ppid,args | awk '$2 == 1 && (/kilo serve/ || /app-server/) && !/awk/ {print $1}' \
  | kill_pids "ghost extension host (ppid=1)"
