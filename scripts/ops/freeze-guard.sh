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
#   4. OOM shield — see below. Rewritten 2026-07-29 (C49 reopened).
#
# Never touches: scheduler, next-server, docker containers, claude CLI,
# real Chrome's browser process, VS Code, Postgres, LibreOffice.
#
# ── Why this script exists in the shape it does ─────────────────────────────
# The machine runs ~6.4 GB of live processes on 7.4 GB of RAM, so its 6 GB of
# disk swap sits permanently full (measured 2026-07-29 16:30: swap free 0 of
# 6143 MiB). earlyoom's two conditions are "available memory below 10%" AND
# "free swap below 10%"; the second is therefore always true, and every dip in
# memory becomes a kill. earlyoom then picks the highest oom_score on the
# machine — and Electron raises its own window renderers to oom_score_adj=300,
# which measured 872-894 against 666-700 for everything unshielded. The CEO's
# editor was not unlucky; it was structurally the designated victim, 38 times
# in three days.
#
# An unprivileged process may only RAISE oom_score_adj, never lower it, so the
# editor cannot be protected directly. It is protected indirectly: everything
# whose loss is cheap is pushed above it, in two tiers, so the kernel's own
# victim choice always lands somewhere that costs the CEO nothing or costs him
# one click on Reload.
#
# The 2026-07-28 version of this shield covered only chroma-mcp,
# headless_shell and kilo-serve — small processes that are usually ABSENT at
# the moment of pressure — and it ran from cron once a minute, while earlyoom
# acts within a second of crossing its threshold. Measured result: at 16:30:01
# the guard logged "raised 1 expendable(s)" and at 16:30:54 earlyoom killed a
# VS Code window anyway. Hence the two changes here: a wider shield that always
# has a candidate (the browser's tab renderers), and residency (systemd --user,
# a few seconds) instead of a cron slot it cannot win from.
#
# Root-level relief — earlyoom's own --avoid/--prefer flags, and compressed
# swap (zram) to end the permanent swap saturation — needs a root password this
# process does not have. Recorded on the board as C49's remaining leg.
#
# Environment:
#   FREEZE_GUARD_LOG        log file (default: var/freeze-guard.log)
#   FREEZE_GUARD_STATE      how long each suspended process has stood still
#   FREEZE_GUARD_INTERVAL   seconds between passes; 0/unset = single pass
#   FREEZE_GUARD_DRY_KILL   1 = shield only, never kill (used by the suite)
set -uo pipefail
LOG="${FREEZE_GUARD_LOG:-/home/ghost/DxB Global OS/var/freeze-guard.log}"
DRY_KILL="${FREEZE_GUARD_DRY_KILL:-0}"

# ── A SESSION IS NEVER JUNK, HOWEVER LONG IT STANDS STILL ───────────────────
# CEO ruling 2026-07-29. A draft of this guard proposed closing agent sessions
# that had been suspended for over half an hour, on the evidence of one that
# had stood still for forty-four hours with eight helpers attached. The CEO
# stopped it: *"BU DÜNDEN BERİ AÇIK ... DÜN AKŞAMDAN BERİ KENDİSİNE GÖREV
# VERMEDİM DEVAM EDECEĞİZ."* He leaves sessions standing for days on purpose
# and returns to them. Idle time is therefore NOT evidence of abandonment, and
# no rule in this file may ever infer it from age, from being suspended, or
# from silence. The only thing this guard treats as finished is a helper whose
# session is provably GONE from the process table.

# Kill-list tiers. A shielded process scores its own base (lowest measured on
# this machine: 666) plus the tier, so even the smallest shielded process at
# the lower tier reaches 1366 — comfortably above the editor's measured 894.
SHIELD_SCAFFOLDING=1000 # agent scaffolding: nothing of the CEO's is lost
SHIELD_BROWSER_TAB=700  # one browser tab: costs a click on Reload

last_shield_log=0

kill_pids() { # $1 = reason, $2 = signal (default TERM), stdin = pids
  local pids signal="${2:-TERM}"
  pids=$(tr '\n' ' ' | sed 's/ $//')
  [[ -z "$pids" ]] && return 0
  if [[ "$DRY_KILL" == "1" ]]; then
    echo "[$(date '+%F %T')] $1: DRY RUN, would kill $pids" >> "$LOG"
    return 0
  fi
  echo "[$(date '+%F %T')] $1: killing $pids" >> "$LOG"
  # shellcheck disable=SC2086
  kill "-$signal" $pids 2>/dev/null || true
}

run_once() {
  # ── memory pressure, measured once per pass ───────────────────────────────
  local mem_total=0 mem_avail=0 swap_total=0 swap_free=0 key val
  while read -r key val _; do
    case "$key" in
      MemTotal:) mem_total=$val ;;
      MemAvailable:) mem_avail=$val ;;
      SwapTotal:) swap_total=$val ;;
      SwapFree:) swap_free=$val; break ;;
    esac
  done < /proc/meminfo
  local mem_avail_pct=100 swap_free_pct=100
  [[ "$mem_total" -gt 0 ]] && mem_avail_pct=$((mem_avail * 100 / mem_total))
  [[ "$swap_total" -gt 0 ]] && swap_free_pct=$((swap_free * 100 / swap_total))
  # earlyoom's own SIGTERM limits are 10%/10% (measured in /etc/default/earlyoom:
  # EARLYOOM_ARGS="-r 3600" — no --avoid, no tuned limits). Acting at 20% gives
  # this guard headroom before earlyoom starts choosing victims.
  local under_pressure=0
  if [[ "$mem_avail_pct" -lt 20 || "$swap_free_pct" -lt 20 ]]; then under_pressure=1; fi

  # Under pressure the chroma-mcp grace drops to 60s: measured 2026-07-28, this
  # guard killed chroma-mcp at 01:49:02 — ONE SECOND after earlyoom had already
  # SIGTERMed the CEO's VS Code window at 01:49:01. A fixed 6-minute grace loses
  # that race every time.
  local chroma_max=360
  [[ "$under_pressure" -eq 1 ]] && chroma_max=60

  # ── ONE process table read per pass ───────────────────────────────────────
  # Four `ps` calls plus a subshell per candidate cost 4% of a core at a 3s
  # cadence (measured 2026-07-29). A guard against resource exhaustion may not
  # itself be a resource problem: one read, no forks inside the loop.
  local pid ppid etimes state args tier cur now
  local stuck_chroma="" old_headless="" ghost_hosts=""
  local raised_scaffolding=0 raised_tab=0
  while read -r pid ppid etimes state args; do
    [[ -z "${args:-}" ]] && continue
    # The editor is never a candidate for anything this script does.
    case "$args" in *"/usr/share/code/code"*) continue ;; esac
    case "$args" in *"freeze-guard.sh"*) continue ;; esac

    tier=0
    case "$args" in
      *chroma-mcp*)
        [[ "$etimes" -gt "$chroma_max" ]] && stuck_chroma+="$pid"$'\n'
        tier=$SHIELD_SCAFFOLDING ;;
      *headless_shell*)
        [[ "$etimes" -gt 1800 ]] && old_headless+="$pid"$'\n'
        tier=$SHIELD_SCAFFOLDING ;;
      *"kilo serve"* | *"@playwright/mcp"* | *playwright-mcp* | *context7-mcp* | *memory-mcp*)
        tier=$SHIELD_SCAFFOLDING ;;
      # Chrome: renderers only. The browser process, the GPU process and the
      # network service are shared — killing one kills every tab at once.
      *"/opt/google/chrome/chrome"*)
        case "$args" in *--type=renderer*) tier=$SHIELD_BROWSER_TAB ;; esac ;;
    esac
    # Ghost extension hosts and widowed tool servers: the session that started
    # them is GONE from the process table, so the kernel re-parented them to
    # init. This is the ONLY evidence of abandonment this guard accepts — never
    # idleness, never age, never being suspended (CEO ruling, top of file). By
    # 2026-07-29 four full tool stacks had piled up because nothing swept the
    # ones whose session had ended.
    if [[ "$ppid" -eq 1 ]]; then
      case "$args" in
        # The claude-mem worker is a resident daemon and is SUPPOSED to have no
        # parent; it hosts live sessions. It is never a widow.
        *"/.bun/bin/bun"*) : ;;
        *"kilo serve"* | *app-server* | *mcp*)
          ghost_hosts+="$pid"$'\n' ;;
      esac
    fi

    # ── OOM shield. Idempotent: a score is only ever raised, never lowered.
    [[ "$tier" -eq 0 ]] && continue
    # A SUSPENDED process is never offered as a victim. Measured 2026-07-29
    # 17:15: the killer fired SIX times in ninety seconds, and three of its
    # choices were suspended helpers of the CEO's standing sessions. A stopped
    # process cannot act on the polite signal it is sent, so nothing is freed
    # and the killer immediately fires again — the shield had turned them into
    # a wall in front of the live processes that CAN yield memory. Left
    # unshielded they score around 666 against the editor's 880, so they stay
    # safe without ever blocking the queue.
    [[ "$state" == T* ]] && continue
    [[ -w "/proc/$pid/oom_score_adj" ]] || continue
    read -r cur < "/proc/$pid/oom_score_adj" 2>/dev/null || continue
    [[ "$cur" -ge "$tier" ]] && continue
    if echo "$tier" > "/proc/$pid/oom_score_adj" 2>/dev/null; then
      if [[ "$tier" -eq "$SHIELD_SCAFFOLDING" ]]; then
        raised_scaffolding=$((raised_scaffolding + 1))
      else
        raised_tab=$((raised_tab + 1))
      fi
    fi
    # Only candidate lines reach this loop — the pre-filter below is what keeps
    # the guard cheap. Measured 2026-07-29 at a 3s cadence: 6.2% of a core when
    # the shell examined all ~250 processes itself, against 0.x% when awk hands
    # it only the two dozen lines that can possibly match.
  done < <(ps -weo pid=,ppid=,etimes=,stat=,args= \
    | awk '!/\/usr\/share\/code\/code/ && !/freeze-guard/ && (/mcp/ || /headless_shell/ || /kilo serve/ || /app-server/ || /\/opt\/google\/chrome\/chrome/)')

  # 1. stuck chroma-mcp (child + uv wrapper both match the pattern)
  printf '%s' "$stuck_chroma" | kill_pids "chroma-mcp stuck >${chroma_max}s"
  # 2. orphaned Playwright headless browsers
  printf '%s' "$old_headless" | kill_pids "headless_shell orphan >30min"
  # 3. helper with no session left to serve (parent gone)
  printf '%s' "$ghost_hosts" | kill_pids "helper with no session (parent gone)"

  # Log only what a human would want to read: a change, under pressure, at most
  # once a minute — a three-second loop would otherwise write 20 lines a minute.
  now=$(date +%s)
  if [[ "$under_pressure" -eq 1 ]] \
    && [[ $((raised_scaffolding + raised_tab)) -gt 0 ]] \
    && [[ $((now - last_shield_log)) -ge 60 ]]; then
    echo "[$(date '+%F %T')] oom shield: $raised_scaffolding scaffolding + $raised_tab browser tab(s) raised above the editor (mem ${mem_avail_pct}%, swap free ${swap_free_pct}%)" >> "$LOG"
    last_shield_log=$now
  fi
}

interval="${FREEZE_GUARD_INTERVAL:-0}"
if [[ "$interval" -gt 0 ]]; then
  echo "[$(date '+%F %T')] freeze-guard resident: pass every ${interval}s" >> "$LOG"
  while :; do
    run_once
    sleep "$interval"
  done
else
  run_once
fi
