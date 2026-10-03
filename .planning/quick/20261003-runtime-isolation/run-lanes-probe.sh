#!/usr/bin/env bash
# Runs lanes-probe.mjs in the resident's own shape — a transient user unit with the scheduler unit's
# WorkingDirectory and env files, so none of a Claude Code session's variables reach it — pointed at
# the construction engine, then checks by the runs' own session ids that nothing of theirs was left
# where the construction keeps its sessions, and lists every Claude file written meanwhile.
#
# It fails LOUDLY (Sol's single pass, 2026-10-03 14:16: read errors were swallowed and a failed probe
# or a missing session id still ended in exit 0): the probe's own non-zero exit, no PROBE_DONE, fewer
# session ids than the probe's receipts (or a receipt without one), and any read error of the
# transcript check each print `PROBE_FAIL: <reason>` and make the script exit 1.
# Usage: bash run-lanes-probe.sh <output file>
#   LANES_PROBE=<script> runs another probe in the same shape (the failure paths are proven that way).
set -uo pipefail
ROOT="/home/dxb/DxB Global OS"
OUT="${1:?usage: run-lanes-probe.sh <output file>}"
MARK="$(mktemp)"
ERR="$(mktemp)"
trap 'rm -f "$MARK" "$ERR"' EXIT
sleep 1
status=0
fail() {
  echo "PROBE_FAIL: $*" >>"$OUT"
  echo "PROBE_FAIL: $*" >&2
  status=1
}

rc=0
systemd-run --user --wait --pipe --collect --quiet -p OOMScoreAdjust=100 --working-directory="$ROOT" \
  --setenv=LANES_PROBE="${LANES_PROBE:-.planning/quick/20261003-runtime-isolation/lanes-probe.mjs}" \
  /bin/bash -lc 'set -a; for f in ./.env ./.env.local ./.env.daemon; do [ -f "$f" ] && source "$f"; done; set +a
    export DXB_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54422/postgres"; unset DXB_COMPANY_DATABASE_URL
    exec node "$LANES_PROBE"' >"$OUT" 2>&1 || rc=$?
echo "PROBE_EXIT=$rc" >>"$OUT"
[ "$rc" -eq 0 ] || fail "the probe exited $rc"
grep -q '^PROBE_DONE$' "$OUT" || fail "no PROBE_DONE — the probe did not finish"

receipts="$(grep -c '^\[isolation\]' "$OUT")"
ids="$(sed -n 's/^SESSIONS //p' "$OUT")"
n=0
for id in $ids; do
  n=$((n + 1))
  [ "$id" = "?" ] && fail "a receipt without a session id"
done
[ "$n" -gt 0 ] || fail "no session ids — nothing to check the transcripts by"
[ "$n" -eq "$receipts" ] || fail "$n session ids for $receipts receipts"

{
  echo "── transcript check, by session id ──"
  for id in $ids; do
    [ "$id" = "?" ] && continue
    named="$(find "$HOME/.claude" -name "*$id*" 2>"$ERR")" || fail "find under ~/.claude failed: $(head -c 300 "$ERR")"
    [ -s "$ERR" ] && fail "find under ~/.claude reported: $(head -c 300 "$ERR")"
    inside="$(grep -rl --include='*.jsonl' -- "$id" "$HOME/.claude/projects" 2>"$ERR")"
    [ $? -le 1 ] || fail "grep of the transcripts failed: $(head -c 300 "$ERR")"
    config="$(grep -c -- "$id" "$HOME/.claude.json" 2>"$ERR")"
    [ $? -le 1 ] || fail "grep of ~/.claude.json failed: $(head -c 300 "$ERR")"
    echo "session $id: files named $(printf '%s' "$named" | grep -c . || true) · transcripts holding it $(printf '%s' "$inside" | grep -c . || true) · in ~/.claude.json ${config:-0}"
  done
  echo "── Claude files written during the probe (newer than its start) ──"
  places=()
  for p in "$HOME/.claude" "$HOME/.claude.json" "$HOME/.cache/claude-cli-nodejs" "$HOME/.config/claude" "$HOME/.local/state/claude" "$HOME/.local/share/claude"; do
    [ -e "$p" ] && places+=("$p")
  done
  written="$(find "${places[@]}" -newer "$MARK" -type f 2>"$ERR")" || fail "find of the written files failed: $(head -c 300 "$ERR")"
  printf '%s\n' "$written" | sed "s|$HOME|~|" | sort
  echo "── managed-policy tier (machine-specific) ──"
  ls -la /etc/claude-code 2>&1 | head -3
} >>"$OUT"

echo "RUN_LANES_PROBE_STATUS=$status" >>"$OUT"
exit "$status"
