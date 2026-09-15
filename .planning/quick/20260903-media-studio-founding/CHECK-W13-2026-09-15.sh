#!/bin/bash
# THE CHECKER'S RULER for W13 — THE STUDIO'S CONTRACT REGISTERED WHERE THE RULE DEMANDS (handoff §7 W13:
# F028 F057 F058 F059 F060 F061 F062 F065) — dictated by the checker session (Fable 5.1) BEFORE the work, copied
# and committed by the builder alone as records(ruler) (the audit law c7570071). Builder and checker run the same
# script; the evidence header carries its md5. RECORDS ONLY: W13 writes specs, the index, requirement rows, a
# PLAN.md and (on his word) a directive file — no code, no migration, no database row. Every grep here is
# WORD-BOUNDED (-w): "snapshot" is not "shot", "immediately" is not "media" (the builder's own lesson, 2026-09-15).
#
#   bash CHECK-W13-2026-09-15.sh baseline   # what is true before the work (prints, no verdict)
#   bash CHECK-W13-2026-09-15.sh w13        # the order: PASS on every line = W13 complete per the ruler
#   bash CHECK-W13-2026-09-15.sh guard      # what W13 must NOT have done (built anything)
#   the shared battery stays CHECK-W9-B08-2026-09-15.sh battery — every commit passes it too.
#
# THE CHECKER'S ANSWERS TO THE BUILDER'S QUESTIONS (they are the ruler's assumptions):
#  Q2 scope — W13 REGISTERS; it builds nothing. Where a finding implies a schema, a trigger or a column (F058 cost
#     column, F059 broadcast trigger, F060 decision_log kind, F061 workflow entity) the spec carries the GAP as a
#     named registered adaptation and says who builds it (W14 / his word). The guard proves nothing was built.
#  Q3 marker grammar — one block per touched spec, its first line EXACTLY of this shape:
#        **Registered adaptation (2026-09-15, B43 — W13, audit F0xx[, F0yy]):** <!-- OPEN: B43 --> …
#     Where the block records one of HIS rulings it names the ledger id verbatim (ledger-truth checks the claim).
#     No CEO-OK marker is invented: a CEO-OK id appears only where an entry with that id exists.
#  Q4 the founding directive — a file under docs/ceo-directives carries HIS name as authority layer 2; a text
#     reconstructed from the board is the author's, not his (audit F003). So: the file is created only after his
#     own word in the builder's box, and then it is MARKED reconstructed (never "verbatim transcript"). Until his
#     word, F028 stays open on the board with "waits on his word", and W13 closes without it.
#  Q5 PLAN.md — ONE file, the row's own `.planning/quick/20260903-media-studio-founding/PLAN.md` (board law 7):
#     opens with W13's two sentences (what is on his screen · the single proving command), then a register of the
#     five approved plans as the ledger recorded them (ids, dates, what) marked reconstructed from the ledger, and
#     the rule that every plan approved from now on is appended there before the session ends. Not five files.
#  REQUIREMENTS — `.planning/REQUIREMENTS.md` (the only one on disk) gets the rows.
#  ⚠ UNVERIFIED by any terminal: nothing on a screen changes in W13; nothing is listed apart.
set -u
D="/home/dxb/DxB Global OS"; H="$D/HOLDING-OS-MASTER-PLAN"; Q="$D/.planning/quick/20260903-media-studio-founding"
LEDGER="$D/scripts/governance/ceo-approvals.json"; BOARD="$H/00-BOARD-OPEN-WORK.md"; EVID="$Q/EVIDENCE-W13-2026-09-15.md"
PLAN="$Q/PLAN.md"; REQ="$D/.planning/REQUIREMENTS.md"; DIRDIR="$D/docs/ceo-directives"
CO="supabase_db_DxB_Global_OS"; CB="supabase_db_DxB_Build"
q(){ docker exec -i "$1" psql -U postgres -d postgres -At -c "$2" 2>&1; }
fail=0; ran=0; verdict=0
ok(){ printf "PASS  %-70s %s\n" "$1" "$2"; ran=$((ran+1)); }
no(){ printf "FAIL  %-70s %s\n" "$1" "$2"; fail=1; ran=$((ran+1)); }
trap '[[ $verdict == 1 ]] || { echo; echo "CHECK $part: FAIL — the ruler died before its last line ($ran lines ran)"; }' EXIT
chk(){ if [[ "$2" =~ $3 ]]; then ok "$1" "$2"; else no "$1" "$2 (expected: $3)"; fi; }
info(){ printf "INFO  %-70s %s\n" "$1" "$2"; }
part="${1:-baseline}"
BLOCK='\*\*Registered adaptation (2026-09-15, B43 — W13, audit F0'
w(){ grep -cw -- "$2" "$1" 2>/dev/null | head -1; }            # word-bounded count in one file
blk(){ grep -c -- "$BLOCK" "$1" 2>/dev/null | head -1; }
corpus(){ grep -rlw --include=*.md -- "$1" "$H" | grep -v 00-BOARD-OPEN-WORK | wc -l; }   # files in the corpus (board excluded)
w13_hash(){ git -C "$D" log --format='%h %s' -20 | grep -E ' W13[ :(]' | grep -v 'records(ruler)' | head -1 | cut -d' ' -f1; }
his_word_on_directive(){ grep -o '"studio-founding-directive-[a-z0-9-]*-2026-09-[0-9]*"' "$LEDGER" | head -1; }
SPECS="DATA_MODEL EVENT_MODEL COST_CONTROL_SPEC APPROVAL_ENGINE_SPEC OBSERVABILITY_SPEC WORKFLOW_ENGINE_SPEC"

if [[ $part == baseline ]]; then
  echo "== BASELINE (no verdict)"
  for s in $SPECS; do echo "$s: block=$(blk "$H/$s.md") OPEN-B43=$(grep -c 'OPEN: B43' "$H/$s.md") media_jobs=$(w "$H/$s.md" media_jobs) media-studio=$(w "$H/$s.md" media-studio)"; done
  echo "AGENT_ORCHESTRATION: budget_minutes=$(w "$H/AGENT_ORCHESTRATION_SPEC.md" budget_minutes) judge_ms=$(w "$H/AGENT_ORCHESTRATION_SPEC.md" judge_ms)  corpus files: queue_sheet_times=$(corpus queue_sheet_times) budget_minutes=$(corpus budget_minutes) DXB_LANE_REST_SECONDS=$(corpus DXB_LANE_REST_SECONDS) judge_ms=$(corpus judge_ms)"
  echo "00-INDEX B43=$(w "$H/00-INDEX.md" B43)  REQUIREMENTS B43=$(w "$REQ" B43) media-studio=$(w "$REQ" media-studio)  PLAN.md=$(ls "$PLAN" 2>/dev/null | wc -l)  directive dir=$(ls -d "$DIRDIR"/*2026-09* 2>/dev/null | wc -l) his word=$(his_word_on_directive)"
  echo "db pins: media_jobs triggers=$(q $CO "select count(*) from pg_trigger where tgrelid='public.media_jobs'::regclass and not tgisinternal") migrations=$(q $CO 'select count(*) from supabase_migrations.schema_migrations')/$(q $CB 'select count(*) from supabase_migrations.schema_migrations') approval_rules=$(q $CO 'select count(*) from approval_rules') workflows=$(q $CO 'select count(*) from workflows')"
  verdict=1; exit 0
fi

if [[ $part == w13 ]]; then
  echo "== W13 — THE CONTRACT REGISTERED"
  n=1
  for s in $SPECS; do
    chk "$n  $s: one W13 adaptation block (exact grammar) + OPEN: B43 marker" "$(blk "$H/$s.md") $(grep -c 'OPEN: B43' "$H/$s.md")" "^[1-9] [1-9]"; n=$((n+1))
  done
  chk "7  F057 DATA_MODEL names media_jobs, scene, shot and the DXB code"     "$(w "$H/DATA_MODEL.md" media_jobs) $(w "$H/DATA_MODEL.md" scene) $(w "$H/DATA_MODEL.md" shot) $(grep -c 'DXB-' "$H/DATA_MODEL.md")" "^[1-9]+ [1-9]+ [1-9]+ [1-9]"
  chk "8  F059 EVENT_MODEL names media_jobs and the gap (no broadcast trigger / polling)" "$(w "$H/EVENT_MODEL.md" media_jobs) $(grep -ciw 'trigger' "$H/EVENT_MODEL.md")" "^[1-9]+ [1-9]"
  chk "9  F058 COST_CONTROL names card time and cost per delivered second"    "$(w "$H/COST_CONTROL_SPEC.md" media_jobs) $(grep -ci 'per delivered second\|delivered second' "$H/COST_CONTROL_SPEC.md")" "^[1-9]+ [1-9]"
  chk "10 F060 APPROVAL_ENGINE names his accept/reject of a film → decision_log" "$(grep -ciw 'film' "$H/APPROVAL_ENGINE_SPEC.md") $(w "$H/APPROVAL_ENGINE_SPEC.md" decision_log)" "^[1-9]+ [1-9]"
  chk "11 F062 OBSERVABILITY names the times table (queue_sheet_times)"       "$(w "$H/OBSERVABILITY_SPEC.md" queue_sheet_times)" "^[1-9]"
  chk "12 F061 WORKFLOW_ENGINE names the production line / dispatch book"     "$(w "$H/WORKFLOW_ENGINE_SPEC.md" queue_dispatch) $(grep -ci 'production line\|dispatch book' "$H/WORKFLOW_ENGINE_SPEC.md")" "^[0-9]+ [1-9]"
  chk "13 F062 AGENT_ORCHESTRATION: the clock + the QA receipt (budget_minutes, DXB_LANE_REST_SECONDS, judge_ms)" "$(w "$H/AGENT_ORCHESTRATION_SPEC.md" budget_minutes) $(w "$H/AGENT_ORCHESTRATION_SPEC.md" DXB_LANE_REST_SECONDS) $(w "$H/AGENT_ORCHESTRATION_SPEC.md" judge_ms)" "^[1-9]+ [1-9]+ [1-9]"
  chk "14 F062 corpus minus board carries all four tokens (files)"            "$(corpus queue_sheet_times) $(corpus budget_minutes) $(corpus DXB_LANE_REST_SECONDS) $(corpus judge_ms)" "^[1-9]+ [1-9]+ [1-9]+ [1-9]"
  chk "15 F057 00-INDEX: a registered decision row for B43 (after U43)"       "$(sed -n '/^| U43 /,/^## Verification/p' "$H/00-INDEX.md" | grep -cw 'B43')" "^[1-9]"
  chk "16 F057 REQUIREMENTS rows name B43 and media-studio"                   "$(w "$REQ" B43) $(w "$REQ" media-studio)" "^[1-9]+ [1-9]"
  chk "17 F065 PLAN.md exists on the row's folder"                            "$(ls "$PLAN" 2>/dev/null | wc -l)" "^1$"
  chk "18 F065 PLAN.md opens with the two sentences (screen · single command = this ruler)" "$(grep -c 'CHECK-W13-2026-09-15.sh' "$PLAN" 2>/dev/null | head -1)" "^[1-9]"
  chk "19 F065 PLAN.md registers the five approved plans by ledger id"        "$(grep -o 'studio-hands-build-plan-approved-2026-09-03\|hands-lanes-plan-approved-2026-09-05\|plan-2-dispatch-book-delegated-2026-09-05\|budget-per-job-zero-idle-plan-approved-2026-09-13\|continuity-rule-[a-z-]*-2026-09-14' "$PLAN" 2>/dev/null | sort -u | wc -l)" "^5$"
  chk "20 F065 PLAN.md says it is reconstructed from the ledger (no invented plan text)" "$(grep -ci 'reconstructed' "$PLAN" 2>/dev/null | head -1)" "^[1-9]"
  hw=$(his_word_on_directive)
  if [[ -n "$hw" ]]; then
    chk "21 F028 his word registered → the directive file exists under docs/ceo-directives (2026-09-03 studio)" "$(ls -d "$DIRDIR"/*2026-09-03* 2>/dev/null | wc -l)" "^1$"
    chk "22 F028 the file is MARKED reconstructed from the board, never a verbatim transcript" "$(grep -rci 'reconstructed' "$DIRDIR"/*2026-09-03*/ 2>/dev/null | awk -F: '{s+=$2} END{print s+0}')" "^[1-9]"
  else
    chk "21 F028 no word from him yet → no directive file created in his name" "$(ls -d "$DIRDIR"/*2026-09* 2>/dev/null | wc -l)" "^0$"
    chk "22 F028 the board says it waits on his word"                          "$(grep -c 'F028[^.]*waits on his word\|F028 open[^.]*his word' "$BOARD")" "^[1-9]"
  fi
  chk "23 EVIDENCE-W13 exists and carries THIS ruler's md5"                   "$(grep -c "$(md5sum "$0" | cut -d' ' -f1)" "$EVID" 2>/dev/null | head -1)" "^[1-9]"
  chk "24 ledger: his word for W13 registered (w13-…-2026-09-15)"             "$(grep -o '"w13-[a-z0-9-]*-2026-09-15"' "$LEDGER" | head -1)" "w13-"
  chk "25 board B43: F057 F058 F059 F060 F061 F062 F065 closed"               "$(grep -o 'F057 closed\|F058 closed\|F059 closed\|F060 closed\|F061 closed\|F062 closed\|F065 closed' "$BOARD" | sort -u | wc -l)" "^7$"
  chk "26 STATE names W13 as done on his order, not accepted (LAW B)"         "$(grep -c 'W13.*NOT YET ACCEPTED BY HIS EYE' "$D/.planning/STATE.md")" "^[1-9]"
  chk "27 verify:ledger"                                                       "$(node "$D/scripts/governance/ledger-truth.mjs" 2>&1 | tail -1 | grep -o 'ledger truth OK')" "OK"
fi

if [[ $part == guard ]]; then
  echo "== GUARD — W13 built nothing"
  h=$(w13_hash)
  chk "G1 the W13 commit is on the branch (subject starts with W13)"          "${h:-none}" "^[0-9a-f]{7,}$"
  chk "G2 files outside records in that commit (db/ packages/ apps/ tests/ scripts/ except the ledger)" "$(git -C "$D" show --stat=200 --format='' "${h:-HEAD}" | grep -E '^ (db|packages|apps|tests|scripts)/' | grep -v 'scripts/governance/ceo-approvals.json' | wc -l)" "^0$"
  chk "G3 migrations unchanged: repo = company = construction = 169"          "$(ls "$D"/db/migrations/*.sql | wc -l) $(q $CO 'select count(*) from supabase_migrations.schema_migrations') $(q $CB 'select count(*) from supabase_migrations.schema_migrations')" "^169 169 169$"
  chk "G4 media_jobs triggers still 0 (no broadcast trigger built)"           "$(q $CO "select count(*) from pg_trigger where tgrelid='public.media_jobs'::regclass and not tgisinternal")" "^0$"
  chk "G5 approval_rules still 8, workflows still 0"                          "$(q $CO 'select count(*) from approval_rules') $(q $CO 'select count(*) from workflows')" "^8 0$"
  chk "G6 no invented CEO-OK: every CEO-OK id in the six specs exists in the ledger" "$(grep -ho 'CEO-OK: [a-z0-9-]*' "$H"/DATA_MODEL.md "$H"/EVENT_MODEL.md "$H"/COST_CONTROL_SPEC.md "$H"/APPROVAL_ENGINE_SPEC.md "$H"/OBSERVABILITY_SPEC.md "$H"/WORKFLOW_ENGINE_SPEC.md | cut -d' ' -f2 | sort -u | while read -r id; do grep -q "\"$id\"" "$LEDGER" || echo "$id"; done | wc -l)" "^0$"
  chk "G7 W8 pin: media_jobs 16277dac still failed|true"                      "$(q $CO "select status||'|'||(error is not null) from media_jobs where id::text like '16277dac%'")" "^failed\|t"
  chk "G8 shared battery (CHECK-W9-B08) FAIL lines"                           "$(bash "$Q/CHECK-W9-B08-2026-09-15.sh" battery 2>&1 | grep -c '^FAIL')" "^0$"
fi

want=0; [[ $part == w13 ]] && want=27; [[ $part == guard ]] && want=8
[[ $ran == $want ]] || { fail=1; echo "FAIL  lines ran $ran of $want"; }
verdict=1
echo; [[ $fail == 0 ]] && echo "CHECK $part: ALL PASS" || { echo "CHECK $part: FAIL"; exit 1; }
