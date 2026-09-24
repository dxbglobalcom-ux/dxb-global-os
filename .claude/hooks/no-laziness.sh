#!/usr/bin/env bash
# UserPromptSubmit hook — STANDING ORDER 13: LAZINESS IS FORBIDDEN.
# CEO order 2026-07-27 (verbatim: "TEMBELLİK KESİNLİKLE BU PROJEDE YASAKLANMALI …
# HOOK OLARAK KURULMALI. OPUS 5 BAZEN KAPASİTESİNİ KULLANMAK İSTEMİOR VE BU BİZİ
# MAHVEDİYOR").
#
# Fires on EVERY prompt, not only at session start: the defect the CEO named is
# MID-SESSION drift — an author who started disciplined and got shallow after an
# hour. A once-per-session injection cannot reach that hour.
#
# 2026-08-16 — the closing line changed on the CEO's order ("kanıtı göster
# şeklinde olur"). It used to ask the author to answer "verified?"; it now
# orders the evidence itself to be printed. Reason he was given: Anthropic's
# own Opus 5 guidance says instructions like "include a final verification
# step" / "use a subagent to verify" cause over-verification on this model,
# because it verifies without being told. His evidence law is untouched — what
# changed is that the turn must SHOW the proof, not report that it checked.
#
# 2026-09-14 — ONE LINE PER PROMPT, on the CEO's order. He measured a session at
# 165k tokens before its first piece of work; shown that this hook and its twin
# (ceo-language.sh) added 2,923 bytes to every prompt, he ruled: "sadece bu ikisi
# bu şekilde olsun uzun şeyler olmasın" — both orders stay on every prompt, SHORT.
# This file still OWNS the full text (scripts/governance/rules.json,
# so13_full_capacity); the LONG FORM below is its single home and is no longer
# emitted. Open this file when the one line is not enough.
#
# 2026-09-24 — the one line rewritten on the CEO's yes to prompt-audit card H3
# (registered as b53-tools-h2-h3-h5-2026-09-24): "full capacity on every turn"
# left the emitted line (an effort booster Opus 5.5 over-applies; the award
# standard stays in the long form below), and "print the evidence before the
# turn ends" became proof in the work, kept out of his message until he asks,
# which reconciles it with dxb-ceo-report step 5. Kept within a few bytes of
# the old line (408 → 426) under his 2026-09-14 ruling that both per-prompt
# lines stay short.
#
# LONG FORM (owned here, verbatim as it was emitted 2026-08-16 → 2026-09-14):
#   THE ORDER, in his own words (2026-08-01): every piece of work is done to a
#   standard worthy of an award — the fine details thought through, and then
#   actually done. Full capacity, every turn.
#   These are laziness = governance violation:
#    1. Stating as fact what you did not measure THIS session. Memory and a search
#       hit tell you WHERE to look; the answer comes from the file or the command.
#       Never answer out of a summary.
#    2. Partial delivery — shipping the easy half, or closing a row with a named leg
#       still open. Blocked part: name it, finish EVERYTHING else in full.
#    3. Leaving the ledger behind reality — you changed the system and did not close
#       or correct the row that tracks it. Then you have not finished.
#    4. Stopping at the first obstacle (standing order 12: an obstacle is the START
#       of the work), or asking the CEO to run/click/install what you can do.
#    5. Skipping the battery: tests, tsc, DB suite, i18n purity, RULE #0 pass,
#       resident-service restart.
#    6. Opening a NEW spec/plan instead of finishing the spec that already owns the
#       contract (PLAN.md ≠ a plan).
#    7. Seeing a defect and not fixing it AT ITS SOURCE in the same turn — but the
#       fix stays INSIDE what he asked for. Outside it: tell him in one line and ask.
#    8. Reporting a prediction as a result.
#   BEFORE ENDING ANY TURN, SHOW THE EVIDENCE — do not report that you checked,
#   print what the check printed: the command and its decisive output behind every
#   fact and every completion claim, the row you closed or corrected, and what you
#   left out and why. What a terminal cannot observe is labelled ⚠ UNVERIFIED and
#   listed apart.
set -euo pipefail

cat <<'EOF2'
STANDING ORDER 13 — TEMBELLİK YASAK (CEO 2026-07-27): measure before you state; finish all of it or name the blocked part; keep the record current; fix a defect at its source, inside what he asked; back every claim with its command and output in the work, and show him the proof only when he asks; what a terminal cannot observe is ⚠ UNVERIFIED. The eight forms of laziness: the LONG FORM in .claude/hooks/no-laziness.sh.
EOF2
