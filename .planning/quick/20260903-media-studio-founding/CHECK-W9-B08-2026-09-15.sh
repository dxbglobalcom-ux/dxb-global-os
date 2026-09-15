#!/bin/bash
# THE CHECKER'S RULER for WORK-ORDER-W9-B08-2026-09-15.md — handed to the builder BEFORE the work
# (the ruler rule, CEO 2026-09-15). The builder runs it before claiming any part done and pastes the
# output into the evidence; the checker runs the same script. One metre, two hands.
#
#   bash CHECK-W9-B08-2026-09-15.sh baseline   # what is true before the work (prints, no verdict)
#   bash CHECK-W9-B08-2026-09-15.sh A          # Part A — B08 step (0): gate aligned with U30, 16 seats bound
#   bash CHECK-W9-B08-2026-09-15.sh B          # Part B — W9: the two assigned seats can take a studio task
#   bash CHECK-W9-B08-2026-09-15.sh battery    # the shared battery every commit must pass
#
# Every line is PASS or FAIL with the measured value beside it. Exit 1 on any FAIL in the chosen part.
set -u
D="/home/dxb/DxB Global OS"
CO="supabase_db_DxB_Global_OS"   # company engine (SELECT only here)
CB="supabase_db_DxB_Build"       # construction engine
q(){ docker exec -i "$1" psql -U postgres -d postgres -At -F'|' -c "$2" 2>&1; }
SEATS="'media-creative-director','media-film-director','media-advertising-director','media-screenwriter','media-character-identity','media-storyboard-previz','media-vfx-post','media-ai-video-engineer','media-cinematographer','media-continuity','media-delivery-qc','media-failure-analysis','media-product-brand-consistency','media-sound-music','design-image-prompt-engineer','marketing-short-video-editing-coach'"
GATE_BEFORE="b21b62c7a5f74a6163dd8eab96f3d592"
fail=0
ok(){ printf "PASS  %-58s %s\n" "$1" "$2"; }
no(){ printf "FAIL  %-58s %s\n" "$1" "$2"; fail=1; }
chk(){ # chk "name" "measured" "expected-regex"
  if [[ "$2" =~ $3 ]]; then ok "$1" "$2"; else no "$1" "$2 (expected: $3)"; fi; }

part="${1:-baseline}"

gate_md5_co(){ q $CO "select md5(pg_get_functiondef('enforce_persona_gate_on_activation'::regproc))"; }
gate_md5_cb(){ q $CB "select md5(pg_get_functiondef('enforce_persona_gate_on_activation'::regproc))"; }
gate_list_co(){ q $CO "select pg_get_functiondef('enforce_persona_gate_on_activation'::regproc)" | grep -o "NOT IN ([^)]*)" | head -1; }
bound_mismatch(){ q $CO "select count(*) from agents a join personas pb on pb.id=a.persona_id where a.slug in ($SEATS) and pb.version <> (select max(version) from personas p2 where p2.employee_id=a.id and p2.quality_gate='passed')"; }
bound_authors(){ q $CO "select string_agg(author||' x '||n, ', ') from (select p.author, count(*) n from agents a join personas p on p.id=a.persona_id where a.slug in ($SEATS) group by 1) s"; }

if [[ $part == baseline || $part == A ]]; then
  echo "== PART A — B08 step (0)"
  m=$(gate_md5_co); l=$(gate_list_co)
  if [[ $part == A ]]; then
    if [[ "$m" != "$GATE_BEFORE" ]]; then ok "A1 company gate function changed from before" "$m"; else no "A1 company gate function changed from before" "$m (unchanged)"; fi
    chk "A2 company gate author list = personas_author_check" "$l" "opus-5.*fable-5.*hr-factory|fable-5.*opus-5.*hr-factory|hr-factory.*opus-5|opus-5.*hr-factory"
    chk "A3 construction gate md5 = company gate md5"          "$(gate_md5_cb)" "^$m$"
    chk "A4 migration file present"                          "$(ls "$D"/db/migrations/ | grep -ci 'u30')" "^[2-9]"
    chk "A5 rollback SQL present in evidence"                "$(grep -rl 'ROLLBACK\|rollback' "$D"/.planning/quick/20260903-media-studio-founding/EVIDENCE-B08-step0-2026-09-15.md 2>/dev/null | wc -l)" "^1$"
    chk "A6 approval registered (his sentence, verbatim)"    "$(grep -c 'activation-gate-aligned-with-u30-2026-09-15' "$D"/scripts/governance/ceo-approvals.json)" "^[1-9]"
    chk "A7 seats bound to newest passed version (mismatch)" "$(bound_mismatch)" "^0$"
    chk "A8 bound authors"                                   "$(bound_authors)" "opus-5 x 16"
    chk "A9 B08 step (0) marked built on the board"           "$(grep -ci 'step (0)[^.]*built\|built[^.]*step (0)' "$D"/HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md)" "^[1-9]"
  else
    echo "gate md5 company=$m  construction=$(gate_md5_cb)  list=$l"
    echo "bound: $(bound_authors)  mismatch-with-newest-passed=$(bound_mismatch)"
  fi
fi

if [[ $part == baseline || $part == B ]]; then
  echo "== PART B — W9"
  asg=$(q $CO "select count(*) from information_schema.tables where table_name='agent_assignments'")
  rows=$(q $CO "select count(*) from agent_assignments" 2>/dev/null | grep -E '^[0-9]+$' || echo 0)
  grants=$(q $CO "select count(*) from library_grants g join agents a on a.id::text=g.grantee_id::text join library_items i on i.id=g.item_id where g.grantee_kind='employee' and a.slug in ('design-image-prompt-engineer','marketing-short-video-editing-coach') and i.name ilike '%media%'")
  prof=$(q $CO "select string_agg(slug||'='||coalesce(mcp_profile,'NULL'),', ') from agents where slug in ('design-image-prompt-engineer','marketing-short-video-editing-coach')")
  if [[ $part == B ]]; then
    chk "B1 agent_assignments table exists (company)"         "$asg" "^1$"
    chk "B2 assignment rows for the two seats"                "$rows" "^2$"
    chk "B3 employee grants of the media drawer (2 seats)"    "$grants" "^2$"
    chk "B4 per-employee mcp_profile set for both (not inherit/NULL)" "$(echo "$prof" | grep -c "=inherit\|=NULL")" "^0$"
    chk "B5 home profiles still carry 0 media_* tools"        "$(grep -c 'media_' "$D"/packages/gateway/profiles/design.mcp.json "$D"/packages/gateway/profiles/marketing.mcp.json 2>/dev/null | awk -F: '{s+=$2} END{print s+0}')" "^0$"
    chk "B6 queue tests incl. two new (accept assigned / refuse stranger)" "$(cd "$D" 2>/dev/null; npx vitest run tests/b43 tests/r31 tests/b39 2>&1 | grep -E '^ *Tests ' | grep -o '[0-9]* passed' | head -1)" "^(10[2-9]|1[1-9][0-9]) passed"
    chk "B7 A19 adaptation registered in AGENT_ORCHESTRATION" "$(grep -c 'agent_assignments' "$D"/HOLDING-OS-MASTER-PLAN/AGENT_ORCHESTRATION_SPEC.md)" "^[1-9]"
    chk "B8 F033 closed on the board"                         "$(grep -ci 'F033 closed' "$D"/HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md)" "^[1-9]"
    chk "B9 approval registered (his 'onay', verbatim)"       "$(grep -c 'w9-assigned-seats-plan-approved-2026-09-15' "$D"/scripts/governance/ceo-approvals.json)" "^[1-9]"
    chk "B10 road proof: a construction task row names the Editor" "$(q $CB "select count(*) from tasks t join agents a on a.id=t.agent_id where a.slug='marketing-short-video-editing-coach'" 2>&1 | tail -1)" "^[1-9]"
  else
    echo "agent_assignments table=$asg rows=$rows  employee media grants=$grants  profiles: $prof"
  fi
fi

if [[ $part == baseline || $part == battery || $part == A || $part == B ]]; then
  echo "== BATTERY"
  chk "sync --verify"          "$(DXB_PERSONA_AUTHOR=fable-5 bash "$D"/scripts/sync-personas-to-db.sh --verify 2>&1 | tail -1)" "VERIFY: PASS"
  chk "persona ruler"          "$(bash "$D"/scripts/persona-ruler.sh 2>&1 | grep -o 'RULER: [0-9/]* PASS')" "16/16 PASS"
  chk "bound = newest passed, holding-wide (rows behind)" "$(q $CO "select count(*) from agents a join personas pb on pb.id=a.persona_id where pb.version <> (select max(version) from personas p2 where p2.employee_id=a.id and p2.quality_gate='passed')")" "^0$"   # added 2026-09-15 after B08 step 0: no metre in the house compared BOUND to NEWEST for 49 days
  chk "road + delivery tests"  "$(cd "$D" 2>/dev/null; npx vitest run tests/b43/road-consistency.test.ts tests/r31/persona-delivery.test.ts 2>&1 | grep -E '^ *Tests ' | grep -o '[0-9]* passed')" "^20 passed"
  chk "typecheck"              "$(cd "$D" 2>/dev/null; pnpm typecheck 2>&1 | tail -1 | grep -c -i 'error' )" "^0$"
  chk "verify:ledger"          "$(node "$D"/scripts/governance/ledger-truth.mjs 2>&1 | tail -1 | grep -o 'ledger truth OK')" "OK"
  chk "i18n purity"            "$(bash "$D"/scripts/i18n-purity-check.sh 2>&1 | tail -1)" "PASS"
  chk "gitleaks (branch since 38381faa)" "$(gitleaks git --log-opts='38381faa..HEAD' "$D" --no-banner 2>&1 | tail -1 | grep -o 'no leaks found')" "no leaks"
  chk "tree clean"             "$(git -C "$D" status --short | wc -l)" "^0$"
  chk "migrations touched only in Part A/B commits" "$(git -C "$D" diff --stat 38381faa..HEAD -- db/migrations | tail -1 | grep -o '[0-9]* file' | head -1)" "^([0-9]* file)?$"
fi

echo; [[ $fail == 0 ]] && echo "CHECK $part: ALL PASS" || { echo "CHECK $part: FAIL"; exit 1; }
