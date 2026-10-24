#!/usr/bin/env bash
# One seat of the 24 Oct olive-farm test, run walled off in bwrap: the seat's own persistent home (its sessions
# survive for --resume), the credentials file, and ONE work folder bound at ~/work. No repository, no Desktop, no
# memory, no claude-mem, no global CLAUDE.md, no hooks, no MCP server; /tmp and the runtime dir are empty.
# usage: box.sh <seat> <model> <effort> <tools> <workdir> <prompt-file> <out-json> [extra claude args…]
#        box.sh --shell <seat> <workdir> <command…>     (a plain shell in the same wall, for smoke tests)
set -uo pipefail
JOB=/home/dxb/test-kutu/20261024-zeytin
uid="$(id -u)"
bin="$(readlink -f /home/dxb/.local/bin/claude)"

make_home() { # make_home <seat> — a home that holds only an account-only config and a credentials mount point
  local h="$JOB/box/$1"
  mkdir -p "$h/.claude"
  # a fresh copy at every launch: binding the host file pinned its old inode, and when the host refreshed the
  # token (a new file, 2026-10-24 19:28:05) the seat inside kept the expired one and died at 19:28:47
  install -m 600 "$HOME/.claude/.credentials.json" "$h/.claude/.credentials.json"
  [ -f "$h/.claude.json" ] || python3 -c '
import json, sys
d = json.load(open(sys.argv[1]))
json.dump({k: d[k] for k in ("oauthAccount", "userID", "hasCompletedOnboarding", "machineID", "installMethod") if k in d},
          open(sys.argv[2], "w"))' "$HOME/.claude.json" "$h/.claude.json"
  echo "$h"
}

wall() { # wall <home> <workdir>
  WALL=(--dev-bind / / --tmpfs /tmp --tmpfs /var/tmp --tmpfs /dev/shm --tmpfs "/run/user/$uid"
    --bind "$1" "$HOME"
    --ro-bind "$bin" "$bin"
    --bind "$2" "$HOME/work" --chdir "$HOME/work"
    --unshare-pid --proc /proc --die-with-parent
    --clearenv --setenv HOME "$HOME" --setenv USER "$(id -un)" --setenv PATH /usr/local/bin:/usr/bin:/bin
    --setenv LANG C.UTF-8)
}

if [ "${1:-}" = "--shell" ]; then
  h="$(make_home "$2")"; wall "$h" "$3"; shift 3
  exec bwrap "${WALL[@]}" -- bash -c "$*"
fi

seat="$1"; model="$2"; effort="$3"; tools="$4"; work="$5"; prompt="$6"; out="$7"; shift 7
h="$(make_home "$seat")"; wall "$h" "$work"
start=$(date +%s)
echo "$(date '+%F %T') $seat start model=$model effort=$effort" >>"$JOB/TIMES.log"
bwrap "${WALL[@]}" -- "$bin" -p --model "$model" --effort "$effort" --tools "$tools" \
  --dangerously-skip-permissions --strict-mcp-config --mcp-config '{"mcpServers":{}}' \
  --settings '{"disableAllHooks":true}' --output-format json "$@" <"$prompt" >"$out" 2>"$out.err"
rc=$?
python3 - "$out" "$seat" "$rc" "$(( $(date +%s) - start ))" >>"$JOB/TIMES.log" <<'EOF'
import json, sys, time
out, seat, rc, secs = sys.argv[1:]
try:
    d = json.load(open(out)); u = d.get("usage", {})
    tok = sum(u.get(k, 0) or 0 for k in ("input_tokens", "output_tokens", "cache_creation_input_tokens", "cache_read_input_tokens"))
    print(f"{time.strftime('%F %T')} {seat} end rc={rc} seconds={secs} turns={d.get('num_turns')} tokens={tok} "
          f"out_tokens={u.get('output_tokens')} cost_usd={d.get('total_cost_usd')} session={d.get('session_id')} error={d.get('is_error')}")
except Exception as e:
    print(f"{time.strftime('%F %T')} {seat} end rc={rc} seconds={secs} (no json: {e})")
EOF
echo "EXIT=$rc"
