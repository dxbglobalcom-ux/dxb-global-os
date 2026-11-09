# Sourced, never run: the walled box a second model works in, shared by second-plan.sh (the second plan
# writer) and fable-audit.sh (Fable the auditor) — CEO 2026-10-19, 2026-11-09.
# THE MODEL SEES THE BRIEF AND HEAD, NOTHING ELSE. It runs inside bwrap: /tmp (the lead's scratchpad),
# /var/tmp, /dev/shm, the runtime dir and the whole home are empty tmpfs; inside the home only a
# `git archive` of HEAD (no .git, so no git status and nothing uncommitted), read-only, a minimal
# ~/.claude.json (account and onboarding only) and the credentials file are put back. No live tree, no
# transcripts, no auto-memory, no global CLAUDE.md, no claude-mem, no Desktop; a fresh /proc and a cleared
# environment. HEAD's own .claude/CLAUDE.md is a shared, committed input and stays. Measured 2026-10-19:
# from inside the box a shell finds the lead's scratchpad, the Desktop and the live tree "No such file or
# directory". Reading tools only, hooks off, no MCP server — and the caller's deny rules stay as a second belt.
# Needs REPO and CLAUDE set by the caller.

# box_make <name>: makes a box and prints its folder — HEAD without .git, and an account-only config
box_make() {
  command -v bwrap >/dev/null ||
    { echo "walled-box: bwrap is missing; without it the model is not walled off" >&2; return 1; }
  local box
  # each step returns on failure: errexit does not reach into the caller's $(box_make …)
  box="$(mktemp -d "${XDG_CACHE_HOME:-$HOME/.cache}/dxb-$1.XXXXXX")" || return 1
  mkdir "$box/tree" || return 1
  git -C "$REPO" archive "${DXB_BOX_REF:-HEAD}" | tar -x -C "$box/tree" || { rm -rf "$box"; return 1; }
  python3 -c '
import json, sys
d = json.load(open(sys.argv[1]))
json.dump({k: d[k] for k in ("oauthAccount", "userID", "hasCompletedOnboarding", "machineID", "installMethod") if k in d},
          open(sys.argv[2], "w"))' "$HOME/.claude.json" "$box/claude.json" 2>/dev/null || echo '{}' >"$box/claude.json"
  echo "$box"
}

# box_run <box> <model> <effort> <settings-json> [bwrap arguments…]: runs claude -p in the box on this
# shell's stdin, answers on stdout; the extra arguments add to the wall (a folder bound read-only)
box_run() {
  local box="$1" model="$2" effort="$3" settings="$4" bin uid
  shift 4
  bin="$(readlink -f "$CLAUDE")"
  uid="$(id -u)"
  local wall=(--dev-bind / / --tmpfs /tmp --tmpfs /var/tmp --tmpfs /dev/shm --tmpfs "/run/user/$uid" --tmpfs "$HOME"
    --ro-bind "$bin" "$bin"
    --dir "$HOME/.claude" --bind "$HOME/.claude/.credentials.json" "$HOME/.claude/.credentials.json"
    --bind "$box/claude.json" "$HOME/.claude.json"
    --ro-bind "$box/tree" "$HOME/work" --chdir "$HOME/work"
    --unshare-pid --proc /proc --die-with-parent
    --clearenv --setenv HOME "$HOME" --setenv USER "$(id -un)" --setenv PATH /usr/local/bin:/usr/bin:/bin
    --setenv LANG "${LANG:-C.UTF-8}" "$@")
  # tests only: a stub's own folder, so it can record what it saw and be held and released
  [ -z "${DXB_WALLED_BOX_TEST_BIND:-}" ] || wall+=(--bind "$DXB_WALLED_BOX_TEST_BIND" "$DXB_WALLED_BOX_TEST_BIND"
    --setenv STUB_EXIT "${STUB_EXIT:-0}")
  bwrap "${wall[@]}" -- "$bin" -p --model "$model" --effort "$effort" --no-session-persistence --tools "Read,Grep,Glob" \
    --strict-mcp-config --mcp-config '{"mcpServers":{}}' --settings "$settings" ${DXB_BOX_ADD_DIR:+--add-dir "$DXB_BOX_ADD_DIR"}
}
