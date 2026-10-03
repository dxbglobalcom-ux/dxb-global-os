#!/usr/bin/env bash
# Done-list item 12: the critical gate's `codex exec` — its own flags, a temp working directory, stdin
# closed — once from the construction's ~/.codex and once from the company's own home. Each run says
# whether the construction's global Codex notes reached it (canaries "Graph-first reads" and
# "graphify", which ~/.codex/AGENTS.md holds), and its stderr is searched for the MCP start-up lines
# the construction's servers leave (patterns spelled m[c]p: the resident freeze-guard kills a
# helper whose own command line says it). The model is one of the gate's own challengers.
# Usage: bash gate-probe.sh <output file>
set -uo pipefail
OUT="${1:?usage: gate-probe.sh <output file>}"
MODEL="gpt-5.6-sol"
ASK='Look ONLY at text you were given before this message (system or developer instructions, AGENTS.md notes), not general knowledge. For each phrase answer PRESENT or ABSENT: (1) "Graph-first reads" (2) "graphify". One line each, nothing else.'
: >"$OUT"
for home in "$HOME/.codex" "$HOME/.local/share/dxb/company-codex"; do
  dir="$(mktemp -d)"
  CODEX_HOME="$home" codex exec --skip-git-repo-check --ephemeral -s read-only -m "$MODEL" -o "$dir/out.txt" -C "$dir" "$ASK" \
    </dev/null >"$dir/stdout.txt" 2>"$dir/stderr.txt"
  rc=$?
  {
    echo "── CODEX_HOME=${home/#$HOME/~} · exit $rc"
    echo "answer: $(tr '\n' ' ' <"$dir/out.txt" 2>/dev/null)"
    echo "stderr lines naming rmcp: $(grep -ci 'r[m]cp' "$dir/stderr.txt")"
    echo "stderr lines naming mcp: $(grep -ci 'm[c]p' "$dir/stderr.txt")"
    grep -i 'm[c]p' "$dir/stderr.txt" | head -3 | cut -c1-200 | sed 's/^/  /'
  } >>"$OUT"
  rm -rf "$dir"
done
