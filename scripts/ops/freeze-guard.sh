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
#   4. OOM shield + pressure-adaptive threshold (added 2026-07-28 — see below).
#
# Never touches: scheduler, next-server, docker containers, claude CLI,
# real Chrome, VS Code. Runs from cron every minute; silent unless it acts.
set -uo pipefail
LOG="${FREEZE_GUARD_LOG:-/home/ghost/DxB Global OS/var/freeze-guard.log}"

# ── memory pressure, measured once per run ──────────────────────────────────
mem_avail_pct=$(awk '/^MemTotal:/{t=$2} /^MemAvailable:/{a=$2} END{if(t>0) printf "%d", a*100/t; else print 100}' /proc/meminfo)
swap_free_pct=$(awk '/^SwapTotal:/{t=$2} /^SwapFree:/{f=$2} END{if(t>0) printf "%d", f*100/t; else print 100}' /proc/meminfo)
# earlyoom's own SIGTERM limits are 10%/10% (measured in /etc/default/earlyoom:
# EARLYOOM_ARGS="-r 3600" — no --avoid, no tuned limits). Acting at 20% gives
# this guard a full minute of headroom before earlyoom starts choosing victims.
under_pressure=0
if [[ "$mem_avail_pct" -lt 20 || "$swap_free_pct" -lt 20 ]]; then under_pressure=1; fi

kill_pids() { # $1 = reason, stdin = pids
  local pids
  pids=$(tr '\n' ' ' | sed 's/ $//')
  [[ -z "$pids" ]] && return 0
  echo "[$(date '+%F %T')] $1: killing $pids" >> "$LOG"
  # shellcheck disable=SC2086
  kill $pids 2>/dev/null || true
}

# 1. stuck chroma-mcp (child + uv wrapper both match the pattern). Under
#    pressure the threshold drops to 60s: measured 2026-07-28, this guard killed
#    chroma-mcp at 01:49:02 — ONE SECOND after earlyoom had already SIGTERMed
#    the CEO's VS Code window at 01:49:01. A fixed 6-minute grace loses that
#    race every time.
CHROMA_MAX=360
[[ "$under_pressure" -eq 1 ]] && CHROMA_MAX=60
ps -eo pid,etimes,args | awk -v m="$CHROMA_MAX" '$3 != "awk" && /chroma-mcp/ && $2 > m {print $1}' \
  | kill_pids "chroma-mcp stuck >${CHROMA_MAX}s"

# 2. orphaned Playwright headless browsers
ps -eo pid,etimes,comm | awk '$3 == "headless_shell" && $2 > 1800 {print $1}' \
  | kill_pids "headless_shell orphan >30min"

# 3. ghost extension hosts (parent gone)
ps -eo pid,ppid,args | awk '$2 == 1 && (/kilo serve/ || /app-server/) && !/awk/ {print $1}' \
  | kill_pids "ghost extension host (ppid=1)"

# 4. OOM shield — earlyoom kills whichever process scores highest, and Electron
#    raises its own windows to oom_score_adj=300, which makes the CEO's editor
#    the permanent first victim (measured 2026-07-28: score 894 for a VS Code
#    window vs 666-686 for everything else; three windows SIGTERMed between
#    01:49 and 01:53, one working session lost). An unprivileged process may
#    only RAISE oom_score_adj, never lower it, so the editor cannot be shielded
#    directly. Instead the processes this script ALREADY treats as expendable
#    are pushed above it, so the kernel's own victim choice lands on something
#    whose loss costs nothing. Idempotent; runs every minute.
shield=0
while read -r p; do
  [[ -w "/proc/$p/oom_score_adj" ]] || continue
  cur=$(cat "/proc/$p/oom_score_adj" 2>/dev/null || echo 1000)
  [[ "$cur" -ge 1000 ]] && continue
  echo 1000 > "/proc/$p/oom_score_adj" 2>/dev/null && shield=$((shield + 1))
done < <(ps -eo pid,comm,args | awk '!/awk/ && (/chroma-mcp/ || $2 == "headless_shell" || /kilo serve/) {print $1}')
if [[ "$shield" -gt 0 && "$under_pressure" -eq 1 ]]; then
  echo "[$(date '+%F %T')] oom shield: raised $shield expendable(s) above the editor (mem ${mem_avail_pct}%, swap free ${swap_free_pct}%)" >> "$LOG"
fi
