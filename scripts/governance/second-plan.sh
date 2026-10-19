#!/usr/bin/env bash
# In a dxb-team2 plan job two writers write the same plan independently — the lead (the session itself)
# and Fable at max effort in a SEPARATE process — and Sol audits both blind as "A" and "B" (CEO 2026-10-19).
# "They did not look at each other" is proven by tool and record, not by promise:
#  - Fable gets the brief on stdin and only the reading tools (Bash would bypass the deny rules);
#  - deny rules use the absolute-path prefix "//" — measured 2026-10-19: Read(/tmp/**) did NOT block,
#    Read(//tmp/**) blocked Read, Grep and Glob alike. Denied: /tmp (the lead's draft lives in the
#    scratchpad there), the job folder itself, and ~/.claude (the transcripts carry the lead's thinking);
#  - hooks off and no MCP server — measured 2026-10-19: with them, Fable's session opened with the
#    claude-mem "recent context" of the lead's own work and could search the lead's observations
#    (mcp__plugin_claude-mem_mcp-search__*); with disableAllHooks and an empty --strict-mcp-config, neither;
#  - the lead's plan is sealed before Fable's is revealed, and SEALS.log keeps that order as the proof.
# Usage: second-plan.sh start <job> <brief-file> | seal <job> <lead-plan-file> | reveal <job>
#                       | blind <job> [--reviewed] | status <job>   (<job> is an absolute folder path)
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CLAUDE="${DXB_CLAUDE_BIN:-/home/dxb/.local/bin/claude}"
# the words that would tell Sol who wrote a plan: a model or an effort level, matched as whole words
TELLTALE='max|xhigh|opus|fable|sonnet|sol|gpt|claude'

die() { echo "second-plan: $*" >&2; exit 1; }
now() { date -Iseconds; }
sha() { sha256sum "$1" | cut -d' ' -f1; }

cmd="${1:-}"; job="${2:-}"
[ -n "$cmd" ] && [ -n "$job" ] || die "usage: second-plan.sh start|seal|reveal|blind|status <job> [file]"
[[ "$job" == /* ]] || die "the job folder must be an absolute path: $job"
SEALED="$job/sealed"
LOG="$SEALED/SEALS.log"
fable_last_line() { tail -n 1 "$SEALED/fable.raw" 2>/dev/null || true; }

case "$cmd" in
  start)
    brief="${3:-}"
    [ -f "$brief" ] || die "no brief file: $brief"
    mkdir -p "$job"
    mkdir "$SEALED" 2>/dev/null || die "already started: $SEALED exists"
    cp "$brief" "$SEALED/brief.md"
    echo "$(now) brief sha256=$(sha "$SEALED/brief.md")" >>"$LOG"
    settings="{\"disableAllHooks\":true,\"permissions\":{\"deny\":[\"Read(//tmp/**)\",\"Read(/$job/**)\",\"Read(//home/dxb/.claude/**)\",\"Read(//home/dxb/.claude-mem/**)\"]}}"
    printf '%s' "$settings" >"$SEALED/fable.settings.json"
    # detached through this script's own _run, never through a `bash -c` whose command line names "mcp":
    # measured 2026-10-19, the freeze guard (scripts/ops/freeze-guard.sh) killed that detached wrapper and
    # Fable with it at once — a parentless process whose arguments match "mcp" is a widow to it. _run's
    # arguments do not, and it stays alive as Fable's parent and session leader.
    setsid nohup bash "${BASH_SOURCE[0]}" _run "$job" </dev/null >/dev/null 2>&1 &
    echo "SECOND_PLAN_STARTED $(now)"
    ;;
  _run)
    # the brief is Fable's only stdin, and EXIT=<code> is the raw file's last line
    cd "$REPO"
    set +e
    "$CLAUDE" -p --model fable --effort max --no-session-persistence --tools "Read,Grep,Glob" \
      --strict-mcp-config --mcp-config '{"mcpServers":{}}' --settings "$(cat "$SEALED/fable.settings.json")" \
      <"$SEALED/brief.md" >"$SEALED/fable.raw" 2>"$SEALED/fable.err"
    echo "EXIT=$?" >>"$SEALED/fable.raw"
    ;;
  seal)
    plan="${3:-}"
    [ -d "$SEALED" ] || die "not started: $SEALED is missing"
    [ -f "$plan" ] || die "no lead plan file: $plan"
    [ ! -e "$SEALED/opus.plan.md" ] || die "the lead's plan is already sealed"
    [ ! -e "$SEALED/fable.plan.md" ] || die "Fable's plan is already revealed; the lead's seal must come first"
    cp "$plan" "$SEALED/opus.plan.md"
    echo "$(now) opus sha256=$(sha "$SEALED/opus.plan.md")" >>"$LOG"
    ;;
  reveal)
    [ -f "$SEALED/opus.plan.md" ] || die "the lead's plan is not sealed yet; seal it before revealing Fable's"
    [ ! -e "$SEALED/fable.plan.md" ] || die "Fable's plan is already revealed"
    [ "$(fable_last_line)" = "EXIT=0" ] || die "Fable has not ended with EXIT=0 (last line: $(fable_last_line))"
    sed '$d' "$SEALED/fable.raw" >"$SEALED/fable.plan.md"
    echo "$(now) fable sha256=$(sha "$SEALED/fable.plan.md")" >>"$LOG"
    echo "$SEALED/fable.plan.md"
    ;;
  blind)
    [ -f "$SEALED/opus.plan.md" ] && [ -f "$SEALED/fable.plan.md" ] || die "both plans must be sealed and revealed first"
    [ ! -e "$SEALED/key.md" ] || die "already blinded: $SEALED/key.md exists"
    # a plan about the holding may name models as its subject; the lead reads every hit, and --reviewed
    # records that none of them says who wrote the plan
    hits="$(grep -o -n -i -w -E "$TELLTALE" "$SEALED/opus.plan.md" "$SEALED/fable.plan.md" || true)"
    if [ -n "$hits" ] && [ "${3:-}" != "--reviewed" ]; then
      die "a plan names a model or an effort level; read each hit; when none tells who wrote the plan, rerun with --reviewed:
$hits"
    fi
    [ -z "$hits" ] || echo "$(now) blind hits reviewed by the lead: $(printf '%s\n' "$hits" | wc -l)" >>"$LOG"
    if (( RANDOM % 2 )); then a=opus; b=fable; else a=fable; b=opus; fi
    cp "$SEALED/$a.plan.md" "$SEALED/A.md"
    cp "$SEALED/$b.plan.md" "$SEALED/B.md"
    printf 'A = %s\nB = %s\n' "$a" "$b" >"$SEALED/key.md"
    echo "$(now) blind A=$a B=$b" >>"$LOG"
    ;;
  status)
    [ -d "$SEALED" ] || die "not started: $SEALED is missing"
    ls -l "$SEALED"
    if [[ "$(fable_last_line)" == EXIT=* ]]; then
      echo "fable: ended, $(fable_last_line)"
    else
      echo "fable: still running (no EXIT line yet)"
    fi
    echo "--- SEALS.log"
    cat "$LOG"
    ;;
  *) die "unknown subcommand: $cmd" ;;
esac
