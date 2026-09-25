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
#
# 2026-09-24, row B55, the watch behind the pinned model: scripts/model-watch/model-watch.py runs
# Monday and Thursday (dxb-model-watch.timer). While a new model id, or news its Sonnet judge calls serious for
# how our models work, waits for him, it leaves ONE line (NOTICE.txt) that goes right under the
# title — he is told first, and his order is that the session does not swell ("oturumu
# şişirmesin"): every detail stays in --status. A source without a good read for five days adds
# one line of its own: a watch that fails in silence is believed. Neither → not one byte is added.
# The lines are paid for inside the same 8,000 bytes (the refuter's B4, 2026-09-24: they sat outside
# the budget and broke it exactly when there was something to tell him): WHAT HAPPENS NEXT, the one
# block no ruler pins, gives up as many bytes as they take.
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

position=$(section '^## The CEO.s live order')   # his live order, newest block first — the budget below keeps the newest and counts the rest
next=$(section '^## Next')                                    # the work in hand, with its reason
waiting=$(section '^## What is open')                         # what cannot move without him — core §0 line 3
cupboard=$(cat "$CUPBOARD" 2>/dev/null || true)               # one page: what exists, where, how it opens (ruler R5 keeps it one page)

# B55: the model watch's one line, and its staleness line, in plain bash (no python on this path).
# Each is led by a newline and sits at the end of the title line: with nothing serious waiting and
# every source read within five days, $watch is empty and the block is byte-for-byte what it was.
MODEL_WATCH="${DXB_MODEL_WATCH_STATE:-${HOME:-}/.local/state/dxb/model-watch}"
watch=""
if [ -s "$MODEL_WATCH/NOTICE.txt" ] && [ -r "$MODEL_WATCH/NOTICE.txt" ]; then
  IFS= read -r notice < "$MODEL_WATCH/NOTICE.txt" || true
  watch+=$'\n'"$notice"
fi
if [ -r "$MODEL_WATCH/sources.tsv" ]; then
  stale="" since=""
  cutoff=$(( ${EPOCHSECONDS:-$(date +%s)} - 5 * 86400 ))       # five days: the watch runs Monday and Thursday, 3-4 days apart
  # one line per source: name, what it is called, last good read (epoch, date), last error
  while IFS=$'\t' read -r name _ ok_epoch day _; do
    if [[ "$ok_epoch" =~ ^[0-9]+$ ]] && [ "$ok_epoch" -lt "$cutoff" ]; then
      stale+="${stale:+, }$name"
      # the oldest good read among them; "never" is older than any date
      if [ "$since" != never ] && { [ "$day" = never ] || [ -z "$since" ] || [[ "$day" < "$since" ]]; }; then since="$day"; fi
    fi
  done < "$MODEL_WATCH/sources.tsv"
  if [ -n "$stale" ]; then
    watch+=$'\n'"--- MODEL WATCH: no good read of $stale since $since — python3 scripts/model-watch/model-watch.py --status ---"
  fi
fi
next_budget=2200
if [ -n "$watch" ]; then
  next_budget=$(( next_budget - $(printf '%s' "$watch" | wc -c) ))   # bytes, not characters: "—" is three
fi

cat <<EOF
=== DXB — WHERE THE WORK STANDS ===${watch}
Always-on core: AGENTS.md (authority order, the boundaries, the doors).
Open work: HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md — the single register.
Starting, or picking up work? Open the door: dxb-start.

YOUR FIRST REPLY TELLS HIM WHERE THE WORK STANDS, THEN ANSWERS HIM (core §0).
Never ask him what to do. Everything below was read from .planning/STATE.md just now —
answer him FROM IT. Re-opening a file to be told this again is the laziness he named.

--- HIS LAST ORDER ---
$(clip "${position:-"(.planning/STATE.md could not be read — read it yourself before any work)"}" 2500)

--- WHAT HAPPENS NEXT ---
$(clip "${next:-"(no Next block found — read .planning/STATE.md before answering him)"}" "$next_budget")

--- WHAT WAITS ON HIM ---
$(clip "${waiting:-"(no open-work block found — read HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md)"}" 1000)

--- THE CUPBOARD ---
$(clip "${cupboard:-"(.claude/CUPBOARD.md is missing — the drawers are listed in AGENTS.md §4)"}" 1500)
=== END ===
EOF
