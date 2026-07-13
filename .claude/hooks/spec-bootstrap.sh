#!/usr/bin/env bash
# SessionStart hook — SPEC BOOTSTRAP (CEO order 2026-07-13).
# Injects the corpus discipline into EVERY new session and every post-compact
# reload, so no author (Fable, Opus, anyone) can start work without the plan
# hierarchy in context. Injects POINTERS + live position, not the corpus body
# (~600k chars — would blow the context ceiling; specs are read on demand).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STATE="$ROOT/.planning/STATE.md"

# head -c cuts bytes; iconv -c drops a trailing partial multibyte char cleanly.
last_activity=$(grep -m1 '^last_activity_desc:' "$STATE" 2>/dev/null \
  | head -c 400 | iconv -f UTF-8 -t UTF-8 -c 2>/dev/null || true)

cat <<EOF
=== DXB SPEC BOOTSTRAP (mandatory, CEO directive 2026-07-13) ===
THE PLAN EXISTS ONCE: HOLDING-OS-MASTER-PLAN/ (the corpus — 31 specs + CEO
directives). Execution tracking: HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md.
Map of current/dead plans: .planning/README.md.

RULES (binding on every author):
1. NO project work before reading .planning/STATE.md and the roadmap row you
   are about to execute, plus its module SPEC in the corpus.
2. PLAN.md files are execution tickets, NEVER plans — zero new design
   decisions. Deviations = registered adaptations written into the SPEC.
3. On contradiction: CEO directive > MASTER_PLAN.md > module spec. Corpus wins.
4. Evidence-Before-Done: no "done" without executed verification.
5. SPEC-GAP = YOUR DEFECT (CEO ruling 2026-07-13): if you discover a spec
   contract that a ✓-closed roadmap row skipped, FIX IT IMMEDIATELY in that
   same session — the CEO is never the one who orders the fix. Only if the
   item belongs to a FUTURE roadmap row do you record it as a boundary
   instead of jumping ahead.

LIVE POSITION (from STATE.md):
${last_activity:-"(STATE.md unreadable — read it manually before any work)"}
=== END SPEC BOOTSTRAP ===
EOF
