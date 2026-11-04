#!/usr/bin/env bash
# One blind prediction run for the eye measurement (B84 decision 13). The judge sees the packet and
# nothing else, by wall and not by promise: same box as scripts/governance/second-plan.sh — empty
# home, empty /tmp, no repository, no transcripts, no memory, no Desktop, Read tool only.
# Usage: predict.sh <packet-dir> <out-file> [effort]     (<packet-dir>/BRIEF.md is the prompt)
set -euo pipefail
packet="$1"; out="$2"; effort="${3:-high}"
[ -f "$packet/BRIEF.md" ] || { echo "no BRIEF.md in $packet" >&2; exit 2; }
bin="$(readlink -f "${DXB_CLAUDE_BIN:-/home/dxb/.local/bin/claude}")"
uid="$(id -u)"
box="$(mktemp -d "${XDG_CACHE_HOME:-$HOME/.cache}/dxb-goz-box.XXXXXX")"
trap 'rm -rf "$box"' EXIT
python3 -c '
import json, sys
d = json.load(open(sys.argv[1]))
json.dump({k: d[k] for k in ("oauthAccount", "userID", "hasCompletedOnboarding", "machineID", "installMethod") if k in d},
          open(sys.argv[2], "w"))' "$HOME/.claude.json" "$box/claude.json" 2>/dev/null || echo '{}' >"$box/claude.json"
settings='{"disableAllHooks":true}'
wall=(--dev-bind / / --tmpfs /tmp --tmpfs /var/tmp --tmpfs /dev/shm --tmpfs "/run/user/$uid" --tmpfs "$HOME"
  --ro-bind "$bin" "$bin"
  --dir "$HOME/.claude" --bind "$HOME/.claude/.credentials.json" "$HOME/.claude/.credentials.json"
  --bind "$box/claude.json" "$HOME/.claude.json"
  --ro-bind "$packet" "$HOME/packet" --chdir "$HOME/packet"
  --unshare-pid --proc /proc --die-with-parent
  --clearenv --setenv HOME "$HOME" --setenv USER "$(id -un)" --setenv PATH /usr/local/bin:/usr/bin:/bin
  --setenv LANG "${LANG:-C.UTF-8}")
bwrap "${wall[@]}" -- "$bin" -p --model opus --effort "$effort" --no-session-persistence --tools "Read,Glob" \
  --strict-mcp-config --mcp-config '{"mcpServers":{}}' --settings "$settings" \
  <"$packet/BRIEF.md" >"$out" 2>"$out.err"
echo "PREDICT_EXIT=$? $(date -Iseconds)" >>"$out.err"
