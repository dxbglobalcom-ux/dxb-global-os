---
name: dxb-design-max
description: Use as the FIRST step of every turn of design, plan or architecture work — the rest of that turn runs at Opus 5.5 max while the session stays at its own level. Never for building, fixing or testing.
effort: max
---

# Design at max — one turn at a time

The CEO's order: design, plan and architecture at max, the work after them at the session's level, without his hand on /effort <!-- CEO-OK: design-plan-architecture-at-max-2026-10-03 --> <!-- CEO-OK: design-max-skill-every-turn-2026-10-04 -->.

- This turn now runs at max. Claude Code clears it at his next message (measured 2026-10-04), so while the work is design, plan or architecture, invoke this skill FIRST in every turn. `.claude/hooks/dxb-design-max.py` reminds you on each of his messages until the mode is closed.
- His yes to the plan closes it, as the first step of that turn, with no `cd` before it: `python3 "/home/dxb/DxB Global OS/.claude/hooks/dxb-design-max.py" close`. Building, fixing and testing run at the session's level.
