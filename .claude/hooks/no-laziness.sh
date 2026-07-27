#!/usr/bin/env bash
# UserPromptSubmit hook — STANDING ORDER 13: LAZINESS IS FORBIDDEN.
# CEO order 2026-07-27 (verbatim: "TEMBELLİK KESİNLİKLE BU PROJEDE YASAKLANMALI …
# HOOK OLARAK KURULMALI. OPUS 5 BAZEN KAPASİTESİNİ KULLANMAK İSTEMİOR VE BU BİZİ
# MAHVEDİYOR").
#
# Fires on EVERY prompt, not only at session start: the defect the CEO named is
# MID-SESSION drift — an author who started disciplined and got shallow after an
# hour. A once-per-session injection cannot reach that hour. Full text:
# .claude/CLAUDE.md STANDING ORDER 13.
set -euo pipefail

cat <<'EOF'
=== ⛔ STANDING ORDER 13 — LAZINESS IS FORBIDDEN (CEO 2026-07-27, SEVEREST) ===
USE FULL CAPACITY ON EVERY TURN. These nine ARE laziness = governance violation:
 1. Answering from memory/grep/a summary instead of reading the file or running
    the command (RULE #0-A is an EFFORT rule, not only an honesty rule).
 2. Partial delivery — shipping the easy half, or closing a row with a named leg
    still open. Blocked part: name it, finish EVERYTHING else in full.
 3. Deferral language ("later", "next session", "we can do this afterwards") for
    work that is in scope and possible NOW.
 4. Leaving the ledger behind reality — you changed the system and did not close
    or correct the row that tracks it. Then you have not finished.
 5. Stopping at the first obstacle (standing order 12: an obstacle is the START
    of the work), or asking the CEO to run/click/install what you can do.
 6. Skipping the battery: tests, tsc, DB suite, i18n purity, RULE #0 pass,
    resident-service restart.
 7. Opening a NEW spec/plan instead of finishing the spec that already owns the
    contract (PLAN.md ≠ a plan).
 8. Seeing a defect and not fixing it AT ITS SOURCE in the same turn.
 9. Reporting a prediction as a result.
BEFORE ENDING ANY TURN answer in writing: measured? · complete? · recorded? ·
verified (command → output)?
=== END STANDING ORDER 13 ===
EOF
