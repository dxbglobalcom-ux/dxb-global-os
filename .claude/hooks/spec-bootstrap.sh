#!/usr/bin/env bash
# SessionStart hook — LIVE POSITION.
#
# This hook used to restate six rules that are now owned elsewhere: the authority order and the
# boundaries live in .claude/CLAUDE.md, the procedures live behind the doors in .claude/skills/,
# and "measure, never guess" has its own directive. Restating them here made this the second copy
# of each, and second copies drift — which is the defect the CEO ordered fixed on 2026-07-30.
#
# What only this hook can do is read the CURRENT state at session start and put it in front of the
# author. That is all it does now.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STATE="$ROOT/.planning/STATE.md"

# The CEO's live order section, verbatim, up to the next heading. If the shape ever changes, the
# fallback tells the author to read the file rather than printing something that might be wrong.
position=$(awk '
  /^## The CEO.s live order/ {grab=1; next}
  grab && /^## / {exit}
  grab {print}
' "$STATE" 2>/dev/null | sed '/^$/d' | head -c 1200 | iconv -f UTF-8 -t UTF-8 -c 2>/dev/null || true)

# What happens next, straight from the state photograph. Added 2026-07-31 after a fresh session
# answered the CEO's greeting with "what would you like me to do?" — it had been handed his last
# ORDER but not the current POSITION, so it had nothing to tell him.
next=$(awk '
  /^## Next/ {grab=1; next}
  grab && /^## / {exit}
  grab {print}
' "$STATE" 2>/dev/null | sed '/^$/d' | head -c 1200 | iconv -f UTF-8 -t UTF-8 -c 2>/dev/null || true)

cat <<EOF
=== DXB — WHERE THE WORK STANDS ===
Always-on core: .claude/CLAUDE.md (authority order, the boundaries, the doors).
Open work: HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md — the single register.
Starting, or picking up work? Open the door: dxb-start.

YOUR FIRST REPLY TELLS HIM WHERE THE WORK STANDS, THEN ANSWERS HIM (core §0).
Never ask him what to do — the position is below and in .planning/STATE.md.

--- HIS LAST ORDER ---
${position:-"(.planning/STATE.md could not be read — read it yourself before any work)"}

--- WHAT HAPPENS NEXT ---
${next:-"(no Next block found — read .planning/STATE.md before answering him)"}
=== END ===
EOF
