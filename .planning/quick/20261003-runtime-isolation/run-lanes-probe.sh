#!/usr/bin/env bash
# Runs lanes-probe.mjs in the resident's own shape — a transient user unit with the scheduler unit's
# WorkingDirectory and env files, so none of a Claude Code session's variables reach it — pointed at
# the construction engine, then checks by the runs' own session ids that nothing of theirs was left
# where the construction keeps its sessions, and lists every Claude file written meanwhile.
# Usage: bash run-lanes-probe.sh <output file>
set -euo pipefail
ROOT="/home/dxb/DxB Global OS"
OUT="${1:?usage: run-lanes-probe.sh <output file>}"
MARK="$(mktemp)"
trap 'rm -f "$MARK"' EXIT
sleep 1

rc=0
systemd-run --user --wait --pipe --collect --quiet -p OOMScoreAdjust=100 --working-directory="$ROOT" \
  /bin/bash -lc 'set -a; for f in ./.env ./.env.local ./.env.daemon; do [ -f "$f" ] && source "$f"; done; set +a
    export DXB_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54422/postgres"; unset DXB_COMPANY_DATABASE_URL
    exec node .planning/quick/20261003-runtime-isolation/lanes-probe.mjs' >"$OUT" 2>&1 || rc=$?
echo "PROBE_EXIT=$rc" >>"$OUT"

{
  echo "── transcript check, by session id ──"
  ids="$(sed -n 's/^SESSIONS //p' "$OUT")"
  [ -n "$ids" ] || echo "NO SESSION IDS"
  for id in $ids; do
    named="$( (find "$HOME/.claude" -name "*$id*" 2>/dev/null || true) | wc -l)"
    inside="$( (grep -rl --include='*.jsonl' -- "$id" "$HOME/.claude/projects" 2>/dev/null || true) | wc -l)"
    config="$(grep -c -- "$id" "$HOME/.claude.json" 2>/dev/null || true)"
    echo "session $id: files named ${named} · transcripts holding it ${inside} · in ~/.claude.json ${config:-0}"
  done
  echo "── Claude files written during the probe (newer than its start) ──"
  find "$HOME/.claude" "$HOME/.claude.json" "$HOME/.cache/claude-cli-nodejs" "$HOME/.config/claude" "$HOME/.local/state/claude" \
    "$HOME/.local/share/claude" -newer "$MARK" -type f 2>/dev/null | sed "s|$HOME|~|" | sort || true
  echo "── managed-policy tier (machine-specific) ──"
  ls -la /etc/claude-code 2>&1 | head -3 || true
} >>"$OUT"
