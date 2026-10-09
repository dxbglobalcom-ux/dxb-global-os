#!/usr/bin/env bash
# SessionStart hook — LIVE POSITION.
#
# This hook used to restate six rules that are now owned elsewhere: the authority order and the
# boundaries live in .claude/CLAUDE.md, the procedures live behind the doors in .claude/skills/,
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

# His list item 2 (his yes of 2026-10-04): a locked tool returns only when the repository's manifest
# carries its new text, and putting it there is the construction's step — a person reads the locked text
# first (pnpm construction:pins:add). So the opening names the locks that wait for it, read from the
# company engine with SELECT only. Empty is silent; an engine that does not answer within 3 s is silent
# too — the opening must never hang on it.
locks=$(timeout 3 docker exec -i supabase_db_DxB_Global_OS psql -U postgres -d postgres -At -c \
  "SELECT count(*) || '|' || coalesce(string_agg(coalesce(a.id::text, p.server || '/' || p.tool), ', ' ORDER BY a.id), '')
     FROM tool_pins p
     LEFT JOIN LATERAL (SELECT id FROM audit_log WHERE action = 'tool_quarantined'
                          AND payload->>'server' = p.server AND payload->>'tool' = p.tool
                        ORDER BY id DESC LIMIT 1) a ON true
    WHERE p.quarantined" </dev/null 2>/dev/null || true)
locks_line=""
if [[ "$locks" =~ ^([1-9][0-9]*)\|(.*)$ ]]; then
  locks_line="LOCKED TOOLS WAITING FOR THE MANIFEST: ${BASH_REMATCH[1]} (audit ${BASH_REMATCH[2]}) — read each: pnpm construction:pins:add <audit_id>; vouch with --yes; commit."
fi

# The CEO, 2026-10-09 ("Bana eski şeyleri getirip önüme koymayın artık"): a board row that work has
# passed — a commit scoped to its id, newer than the row's last edit (the records ruler's R6) — is named
# here before a session can repeat it as current. Empty is silent; two git calls, ~0.3 s, capped at 3 s.
stale=$(timeout 3 node --no-warnings "$ROOT/tests/b43/records-truth.ts" --stale 2>/dev/null || true)
stale_line=""
if [[ -n "$stale" ]]; then
  # Budgeted (Sol B5, 2026-10-09): at most five rows, each cut to 200 characters, so the position block
  # always fits its own ruler; the rest is counted and the full list is one command away.
  stale_n=$(printf '%s\n' "$stale" | wc -l)
  stale_head=$(printf '%s\n' "$stale" | head -5 | cut -c1-200)
  stale_more=""
  (( stale_n > 5 )) && stale_more="
(+$((stale_n - 5)) more — node --no-warnings tests/b43/records-truth.ts --stale)"
  stale_line="BOARD ROWS BEHIND THEIR WORK — measure before you repeat them; the job that moved them rewrites them:
$stale_head$stale_more"
fi

cat <<EOF
=== DXB — WHERE THE WORK STANDS ===
Always-on core: .claude/CLAUDE.md (authority order, the boundaries, the doors).
Open work: HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md — the single register.
Asked to learn the holding? dxb-start. A job: dxb-team2.
${locks_line:+$locks_line
}${stale_line:+$stale_line
}
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
$(clip "${cupboard:-"(.claude/CUPBOARD.md is missing — the drawers are listed in .claude/CLAUDE.md §4)"}" 1500)
=== END ===
EOF
