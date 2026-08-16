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
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STATE="$ROOT/.planning/STATE.md"

# One reader for the state photograph's sections, so a heading change breaks in one place.
section() {
  awk -v want="$1" '
    $0 ~ want {grab=1; next}
    grab && /^## / {exit}
    grab {print}
  ' "$STATE" 2>/dev/null | sed '/^$/d' | iconv -f UTF-8 -t UTF-8 -c 2>/dev/null || true
}

# Cut to a line boundary and say what was left behind. A session handed half a sentence goes
# looking for the other half; a session told "+N lines, and where they are" does not.
clip() {
  local text="$1" limit="$2" total rest
  total=$(printf '%s\n' "$text" | wc -l)
  printf '%s\n' "$text" | head -n "$limit"
  rest=$(( total - limit ))
  [ "$rest" -gt 0 ] && printf '(+%d more lines — the rest of this section is in .planning/STATE.md)\n' "$rest"
  return 0
}

position=$(section '^## The CEO.s live order')     # his live order — outranks everything written
next=$(section '^## Next')                          # the work in hand, with its reason
waiting=$(section '^## What is open')               # what cannot move without him — core §0 line 3

cat <<EOF
=== DXB — WHERE THE WORK STANDS ===
Always-on core: AGENTS.md (authority order, the boundaries, the doors).
Open work: HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md — the single register.
Starting, or picking up work? Open the door: dxb-start.

YOUR FIRST REPLY TELLS HIM WHERE THE WORK STANDS, THEN ANSWERS HIM (core §0).
Never ask him what to do. Everything below was read from .planning/STATE.md just now —
answer him FROM IT. Re-opening a file to be told this again is the laziness he named.

--- HIS LAST ORDER ---
$(clip "${position:-"(.planning/STATE.md could not be read — read it yourself before any work)"}" 20)

--- WHAT HAPPENS NEXT ---
$(clip "${next:-"(no Next block found — read .planning/STATE.md before answering him)"}" 45)

--- WHAT WAITS ON HIM ---
$(clip "${waiting:-"(no open-work block found — read HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md)"}" 15)
=== END ===
EOF
