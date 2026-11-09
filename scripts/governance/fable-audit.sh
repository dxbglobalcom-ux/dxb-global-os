#!/usr/bin/env bash
# Fable 5.1 the auditor (CEO 2026-11-09): wherever Sol audits — a plan, or a job's commits — Fable audits
# the same thing at the same time, blind, read-only, one pass. The lead hands both the same brief.
# Fable runs in walled-box.sh's box: HEAD read-only and nothing else of the machine, reading tools only,
# hooks off, no MCP server. A plan audit's A and B are not in HEAD, so the job's blind/ view — and only
# it, never sealed/ with the key and the originals — is bound read-only at its own path.
# Effort: high for a normal job, max for an important or complex one.
# Usage: fable-audit.sh <job-folder-abs> <brief-file> [high|max]
#   Writes <job>/fable-audit.md (the audit) and <job>/fable-audit.err; its last stdout line is
#   FABLE_AUDIT_DONE exit=<n>, and it exits <n>. Runs detached: setsid nohup fable-audit.sh … &
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CLAUDE="${DXB_CLAUDE_BIN:-/home/dxb/.local/bin/claude}"
MODEL=claude-fable-5-1
# shellcheck source=walled-box.sh
. "$REPO/scripts/governance/walled-box.sh"

die() { echo "fable-audit: $*" >&2; exit 1; }

job="${1:-}"; brief="${2:-}"; effort="${3:-high}"
[[ "$job" == /* ]] || die "usage: fable-audit.sh <job-folder-abs> <brief-file> [high|max] — the job folder must be absolute"
[ -f "$brief" ] || die "no brief file: $brief"
case "$effort" in high|max) ;; *) die "Fable's audit effort is high or max, not: $effort" ;; esac
out="$job/fable-audit.md"
[ ! -e "$out" ] || die "already audited: $out exists — one pass only"
mkdir -p "$job"

box="$(box_make fable-audit)" || die "the box could not be made"
trap 'rm -rf "$box"' EXIT
settings="{\"disableAllHooks\":true,\"permissions\":{\"deny\":[\"Read(//tmp/**)\",\"Read(/$job/sealed/**)\",\"Read(//home/dxb/.claude/**)\",\"Read(//home/dxb/.claude-mem/**)\"]}}"
view=()
# the box's reading tools only reach the working directory and an added one: blind/ is added, read-only
[ ! -d "$job/blind" ] || { view=(--ro-bind "$job/blind" "$job/blind"); export DXB_BOX_ADD_DIR="$job/blind"; }

set +e
box_run "$box" "$MODEL" "$effort" "$settings" "${view[@]}" <"$brief" >"$out" 2>"$job/fable-audit.err"
rc=$?
set -e
echo "FABLE_AUDIT_DONE exit=$rc"
exit "$rc"
