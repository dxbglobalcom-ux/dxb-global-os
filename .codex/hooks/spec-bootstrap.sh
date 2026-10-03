#!/usr/bin/env bash
# SessionStart hook — LIVE POSITION.
#
# This hook used to restate six rules that are now owned elsewhere: the authority order and the
# boundaries live in AGENTS.md, the procedures live behind the doors in .agents/skills/,
# and "measure, never guess" has its own directive. Restating them here made this the second copy
# of each, and second copies drift — which is the defect the CEO ordered fixed on 2026-07-30.
#
# What only this hook can do is read the CURRENT state at session start and put it in front of the
# author. That is all it does now — and it must carry ALL THREE things core §0 demands of the first
# reply, or the author opens the file anyway and the CEO pays for the same words twice. Measured
# 2026-08-10: the character cut below ended the position mid-word ("a diagnos"), a session went and
# re-read the corpus, and he caught it: "ne diye tekrar tekrar okuyorsun". Cuts are on line
# boundaries now, and what is left behind is counted out loud.
#
# Measured 2026-09-19: the line cut was no cut at all. STATE.md's lines are paragraphs of 1–3 KB, so
# "20 lines" of the live order came to 29,515 bytes and the whole block to 51,738 — the harness
# refuses hook output of that size and hands the session a 2 KB preview and a file path, and the
# session opens the file by hand, which is the laziness of 2026-08-10 caused by this hook itself.
# The cut is by BYTES now, at a sentence boundary, inside a budget the harness delivers whole
# (tests/hooks/session-start-fits.test.ts holds the budget and proves it). HIS LAST ORDER keeps
# the newest block and counts the older ones out loud; they are history and belong to
# STATE-ARCHIVE.md.
#
# 2026-09-19, row B47, his order "savaşçı ajan geldiği zaman ne nerede, hangi alet nerede hemen
# hepsini bilmesi lazım": a fourth block, THE CUPBOARD, delivers .claude/CUPBOARD.md — one page
# naming every drawer (doors, plugins, MCP servers, the fleet, the operator) and how it opens. The
# three budgets above it shrank to make room inside the same 8,000 bytes (3300/2700/1100 →
# 2500/2200/1000 + 1500, the last equal to ruler R5 so a page the ruler passes arrives whole), measured; tests/hooks/opening-budget.ts R5 keeps the page one page.
set -euo pipefail
ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
STATE="$ROOT/.planning/STATE.md"
CUPBOARD="$ROOT/.claude/CUPBOARD.md"   # B47 (2026-09-19): the warrior knows the cupboard at the opening

# One reader for the state photograph's sections, so a heading change breaks in one place.
section() {
  awk -v want="$1" '
    $0 ~ want {grab=1; next}
    grab && /^## / {exit}
    grab {print}
  ' "$STATE" 2>/dev/null | sed '/^$/d' | iconv -f UTF-8 -t UTF-8 -c 2>/dev/null || true
}

# Cut to a BYTE budget at a sentence boundary, and say what was left behind. A session handed half
# a sentence goes looking for the other half; a session told "+N more paragraphs, and where they
# are" does not. The boundary is the last ". " or " · " inside the budget; the paragraphs that did
# not fit at all are counted.
clip() {
  local text="$1" budget="$2" total kept head rest
  total=$(printf '%s\n' "$text" | wc -l)
  if [ "$(printf '%s' "$text" | wc -c)" -le "$budget" ]; then
    printf '%s\n' "$text"
    return 0
  fi
  head=$(printf '%s' "$text" | head -c "$budget")
  # back off to the last sentence boundary inside the budget (". " or " · "); keep the period
  if [[ "$head" == *". "* || "$head" == *" · "* ]]; then
    local a="${head%. *}" b="${head% · *}"
    if [ "${#a}" -ge "${#b}" ]; then head="$a."; else head="$b."; fi
  fi
  kept=$(printf '%s\n' "$head" | wc -l)
  printf '%s\n' "$head"
  rest=$(( total - kept ))
  [ "$rest" -lt 0 ] && rest=0
  # a cut ALWAYS says so, even when it fell inside the first paragraph (rest = 0)
  printf '(+%d more lines, and the cut paragraph continues — the rest of this section is in .planning/STATE.md)\n' "$rest"
  return 0
}

left=$(section '^## Where we left off')      # the three headings every session rewrites at its end (CEO 2026-09-28)
next=$(section '^## Next')
waiting=$(section '^## Waiting on his approval')
cupboard=$(cat "$CUPBOARD" 2>/dev/null || true)               # one page: what exists, where, how it opens (ruler R5 keeps it one page)

next_budget=2000

cat <<EOF
=== DXB — WHERE THE WORK STANDS ===
Always-on core: AGENTS.md (authority order, the boundaries, the doors).
Open work: HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md — the single register.
Asked to learn the holding? dxb-start. A job: dxb-team2.

YOUR FIRST REPLY TELLS HIM WHERE THE WORK STANDS, THEN ANSWERS HIM (core §0).
Everything below was read from .planning/STATE.md just now —
answer him FROM IT. Before this session ends, REWRITE these three headings in STATE.md —
replace, never append. What he accepted is in scripts/governance/ceo-approvals.json.

--- WHERE WE LEFT OFF ---
$(clip "${left:-"(no 'Where we left off' heading in .planning/STATE.md — read it yourself before any work)"}" 2000)

--- NEXT ---
$(clip "${next:-"(no 'Next' heading in .planning/STATE.md — read it before answering him)"}" "$next_budget")

--- WAITING ON HIS APPROVAL ---
$(clip "${waiting:-"(no 'Waiting on his approval' heading in .planning/STATE.md — read it before answering him)"}" 1500)

--- THE CUPBOARD ---
$(clip "${cupboard:-"(.claude/CUPBOARD.md is missing — the drawers are listed in AGENTS.md §4)"}" 1500)
=== END ===
EOF
