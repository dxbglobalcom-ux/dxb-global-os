#!/usr/bin/env bash
# Research skill growth ruler — the CEO's decision 3 of 2026-09-26: a ruler, not a law.
# NOT wired into the battery until the audit drawer is deleted; on that day TOTAL_MAX is
# re-set from the measured post-drawer line count of .claude/skills/dxb-research.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILL_DIR="$ROOT/.claude/skills/dxb-research"
SKILL_MAX=120
TOTAL_MAX=7500

skill_lines=$(wc -l < "$SKILL_DIR/SKILL.md")
total_lines=$(find "$SKILL_DIR" \( -name __pycache__ -o -name runs \) -prune -o -type f \
  \( -name '*.py' -o -name '*.sh' -o -name '*.md' -o -name '*.tsv' -o -name '*.yaml' -o -name '*.json' \) \
  -print0 | xargs -0 cat | wc -l)

fail=0
verdict() { if [ "$1" -le "$2" ]; then echo PASS; else echo FAIL; fi; }

printf '%-10s %8s %8s  %s\n' "measure" "lines" "max" "verdict"
for row in "SKILL.md:$skill_lines:$SKILL_MAX" "total:$total_lines:$TOTAL_MAX"; do
  IFS=: read -r name n max <<< "$row"
  v=$(verdict "$n" "$max")
  [ "$v" = FAIL ] && fail=1
  printf '%-10s %8s %8s  %s\n' "$name" "$n" "$max" "$v"
done

exit "$fail"
