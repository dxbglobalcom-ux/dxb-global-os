#!/usr/bin/env bash
# Done-list items 12 and 20: the critical gate's `codex exec` with the runner's OWN flags
# (packages/orchestrator/src/critical-gate.ts runCodex: exec --skip-git-repo-check --ephemeral
# -s read-only -m <model> -c model_reasoning_effort="high" --output-schema <schema> -o <out>
# -C <temp dir>, stdin closed; the effort pinned 2026-10-03, done-list item 23) — the
# construction's ~/.codex as the control, then both of the gate's challengers from the company's own
# home. The question is asked in the gate's own answer shape: the construction's global Codex notes
# (~/.codex/AGENTS.md holds "Graph-first reads" and "graphify") are reported as objections when the
# challenger was given them. Both streams of every run are kept WHOLE (Sol's single pass, 2026-10-03
# 14:16: the first probe kept only counts, used no schema and only an `ok` for the second model).
# The three runs go in parallel, so the probe stays inside one command's four minutes.
# Usage (in the resident's shape — systemd-run, the unit's env files): bash gate-probe.sh <output file>
set -uo pipefail
OUT="${1:?usage: gate-probe.sh <output file>}"
COMPANY="$HOME/.local/share/dxb/company-codex"
# a copy of critical-gate.ts's OUTPUT_SCHEMA
SCHEMA='{"type":"object","properties":{"verdict":{"type":"string","enum":["sound","flawed"]},"objections":{"type":"array","items":{"type":"object","properties":{"severity":{"type":"string","enum":["high","medium","low"]},"claim":{"type":"string"},"why":{"type":"string"}},"required":["severity","claim","why"],"additionalProperties":false}}},"required":["verdict","objections"],"additionalProperties":false}'
ASK='This is a probe of what you were given, not a review. Look ONLY at text you received before this message (system or developer instructions, AGENTS.md notes), not general knowledge. If the phrase "Graph-first reads" or the word "graphify" appears in that text, return verdict "flawed" with one objection per phrase found (severity low, claim = the phrase, why = where you saw it). If neither appears, return verdict "sound" with no objections.'
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

run() { # <n> <label> <home> <model>
  local dir="$WORK/$1" rc
  mkdir -p "$dir/cwd"
  printf '%s' "$SCHEMA" >"$dir/cwd/schema.json"
  CODEX_HOME="$3" codex exec --skip-git-repo-check --ephemeral -s read-only -m "$4" \
    -c 'model_reasoning_effort="high"' --output-schema "$dir/cwd/schema.json" -o "$dir/cwd/out.json" -C "$dir/cwd" "$ASK" \
    </dev/null >"$dir/stdout.txt" 2>"$dir/stderr.txt"
  rc=$?
  {
    echo "══ $2 · CODEX_HOME=${3/#$HOME/~} · model $4 · exit $rc"
    echo "── answer (-o):"
    cat "$dir/cwd/out.json" 2>&1
    echo
    echo "── stdout, whole:"
    cat "$dir/stdout.txt"
    echo "── stderr, whole:"
    cat "$dir/stderr.txt"
    echo
  } >"$dir/report.txt"
}

run 1 control "$HOME/.codex" gpt-5.6-sol &
run 2 company "$COMPANY" gpt-5.6-sol &
run 3 company "$COMPANY" gpt-5.5 &
wait
cat "$WORK/1/report.txt" "$WORK/2/report.txt" "$WORK/3/report.txt" >"$OUT"
echo "GATE_PROBE_DONE" >>"$OUT"
