#!/bin/bash
# THE CHECKER'S RULER for W10 — BRAIN TRUTH (handoff §7: F032 F035 F024) — dictated by the checker
# session (Fable 5.1) BEFORE the work, copied and committed by the builder alone as records(ruler)
# (the audit law c7570071). Builder and checker run the same script; the evidence header carries its md5.
#
#   bash CHECK-W10-2026-09-15.sh baseline   # what is true before the work (prints, no verdict) — includes the fresh-bootstrap probe
#   bash CHECK-W10-2026-09-15.sh w10        # the order: PASS on every line = W10 complete per the ruler
#   bash CHECK-W10-2026-09-15.sh guard      # what W10 must NOT have broken
#   the shared battery stays CHECK-W9-B08-2026-09-15.sh battery — every commit passes it too.
#
# THE ORDER, measured as outcomes (implementation is the builder's choice):
#  F032  a fresh bootstrap (empty database → scripts/bootstrap-db.sh → db/seed/import-routing-rules.ts)
#        reproduces the 2026-09-05 ruling: media.creative fable-5.1 ENABLED, fable-5 DISABLED; the new
#        migration is idempotent (applies twice) and its file name contains "w10".
#  F035  the brain the CEO reads for the 14 media-studio seats is the brain that runs them: agents.brain =
#        the enabled media.creative row's model — on the company, on the construction engine, on a fresh
#        bootstrap (the two assigned seats route by their own departments — worker-shim.ts reads no
#        assignment — so their fable-5 label is true today; printed, not judged).
#  F024  the "Persona" the CEO reads equals the bound persona's version, by ONE of two roads:
#        (i) the column is retired from the CEO pages (employees, directors) and any version shown comes
#            from the bound persona; or (ii) agents.persona_version = 'v'||personas.version of the bound
#            persona for every non-archived agent, kept in step by the bind path (a trigger on agents or the
#            door that binds) — and every gate that still reads the tag (kernel steps/agent.ts, ops/workflows
#            page, tests/e125 (6)) still accepts every active bound employee.
#  Records: EVIDENCE-W10 with this ruler's md5 in the header; board B43 "F032 closed" "F035 closed"
#        "F024 closed"; MODEL_ROUTING_SPEC no longer says "corrected in W10"; STATE names W10.
#  ⚠ UNVERIFIED by any terminal: RULE #0 eye pass on /org/employees and /org/directors — his screen.
# CORRECTION 2026-09-15 (the builder caught it; the checker's own baseline had printed it): a boolean concatenated
# in SQL renders as true/false, never t/f — lines 2, 7, 9 and G1 now expect the value the query produces.
set -u
D="/home/dxb/DxB Global OS"
CO="supabase_db_DxB_Global_OS"   # company engine — SELECT ONLY in this file
CB="supabase_db_DxB_Build"       # construction engine (port 54422)
SCR="w10_fresh"                  # scratch database INSIDE the construction container, dropped at the end
LOG="/tmp/claude-1000/CHECK-W10-fresh-bootstrap.log"
q(){ docker exec -i "$1" psql -U postgres -d postgres -At -F'|' -c "$2" 2>&1; }
qs(){ docker exec -i "$CB" psql -U postgres -d "$SCR" -At -F'|' -c "$1" 2>&1; }
fail=0
ok(){ printf "PASS  %-62s %s\n" "$1" "$2"; }
no(){ printf "FAIL  %-62s %s\n" "$1" "$2"; fail=1; }
chk(){ if [[ "$2" =~ $3 ]]; then ok "$1" "$2"; else no "$1" "$2 (expected: $3)"; fi; }
info(){ printf "INFO  %-62s %s\n" "$1" "$2"; }
part="${1:-baseline}"

ROWS="select string_agg(model||'|'||enabled||'|'||priority, ' ; ' order by model) from routing_rules where task_class='media.creative'"
ENABLED_MODEL="select model_id from routing_rules where task_class='media.creative' and enabled"
SEAT_MISMATCH="select count(*) from agents a where a.department='media-studio' and a.employment_status<>'archived' and a.brain is distinct from ($ENABLED_MODEL)"
ASSIGNED="select string_agg(slug||'='||brain, ', ' order by slug) from agents where slug in ('design-image-prompt-engineer','marketing-short-video-editing-coach')"
PV_MISMATCH="select count(*) from agents a join personas p on p.id=a.persona_id where a.employment_status<>'archived' and a.persona_version is distinct from 'v'||p.version"
PV_NOT_V2="select count(*) from agents where employment_status<>'archived' and persona_version !~ '^v2'"
PV_DIST="select string_agg(persona_version||' x '||n, ', ' order by n desc) from (select persona_version, count(*) n from agents where employment_status<>'archived' group by 1) s"
EMP="$D/apps/dashboard/src/app/(command)/org/employees/page.tsx"
DIR="$D/apps/dashboard/src/app/(command)/org/directors/page.tsx"
WFP="$D/apps/dashboard/src/app/(command)/ops/workflows/page.tsx"
AGT="$D/packages/kernel/src/workflow/steps/agent.ts"
EVID="$D/.planning/quick/20260903-media-studio-founding/EVIDENCE-W10-2026-09-15.md"
BOARD="$D/HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md"
SPEC="$D/HOLDING-OS-MASTER-PLAN/MODEL_ROUTING_SPEC.md"
MIG=$(ls "$D"/db/migrations/ | grep -i 'w10' | tail -1)

fresh_up(){   # an EMPTY database through the canonical chain — the F032 proof. Nothing here touches the company.
  docker exec -i "$CB" psql -U postgres -d postgres -qAt -c "DROP DATABASE IF EXISTS $SCR WITH (FORCE)" >/dev/null 2>&1
  docker exec -i "$CB" psql -U postgres -d postgres -qAt -c "CREATE DATABASE $SCR" >/dev/null 2>&1
  local url="postgresql://postgres:postgres@127.0.0.1:54422/$SCR"
  DXB_DATABASE_URL="$url" DXB_PSQL="docker exec -i $CB psql -U postgres -d $SCR" \
    DXB_PSQL_ADMIN="docker exec -i $CB psql -U supabase_admin -d $SCR" \
    bash "$D/scripts/bootstrap-db.sh" > "$LOG" 2>&1; local rc=$?
  DXB_DATABASE_URL="$url" node --experimental-strip-types "$D/db/seed/import-routing-rules.ts" >> "$LOG" 2>&1
  echo "$rc $(grep -o 'applied [0-9]*, skipped [0-9]*, ledger total [0-9]*' "$LOG" | tail -1)"
}
fresh_down(){ docker exec -i "$CB" psql -U postgres -d postgres -qAt -c "DROP DATABASE IF EXISTS $SCR WITH (FORCE)" >/dev/null 2>&1; }
trap fresh_down EXIT

if [[ $part == baseline ]]; then
  echo "== BASELINE (no verdict)"
  echo "company      media.creative: $(q $CO "$ROWS")   seats brain<>enabled: $(q $CO "$SEAT_MISMATCH")   assigned: $(q $CO "$ASSIGNED")"
  echo "construction media.creative: $(q $CB "$ROWS")   seats brain<>enabled: $(q $CB "$SEAT_MISMATCH")"
  echo "persona_version (company, non-archived): $(q $CO "$PV_DIST")   mismatch vs 'v'||bound: $(q $CO "$PV_MISMATCH")"
  echo "pages reading persona_version: employees=$(grep -c persona_version "$EMP") directors=$(grep -c persona_version "$DIR") workflows-like-v2=$(grep -c "persona_version\", \"v2%" "$WFP") kernel-gate-v2=$(grep -c "startsWith(\"v2\")" "$AGT")"
  echo "w10 migration file: ${MIG:-none}"
  echo "fresh bootstrap → $(fresh_up)"
  echo "fresh        media.creative: $(qs "$ROWS")   seats: $(qs "select count(*) from agents where department='media-studio'")   brain<>enabled: $(qs "$SEAT_MISMATCH")   (rc<>0 → chain broke; see $LOG)"
fi

if [[ $part == w10 ]]; then
  echo "== W10 — BRAIN TRUTH"
  # F032 — the fresh bootstrap
  bs=$(fresh_up)
  chk "1  fresh bootstrap ran the whole chain (rc applied skipped total)" "$bs" "^0 applied [0-9]+, skipped 0, ledger total [0-9]+$"
  chk "2  fresh: media.creative rows as ruled (fable-5 off, fable-5.1 on)" "$(qs "$ROWS")" "^fable-5\|false\|[0-9]+ ; fable-5\.1\|true\|[0-9]+$"
  chk "3  fresh: exactly one enabled media.creative row" "$(qs "select count(*) from routing_rules where task_class='media.creative' and enabled")" "^1$"
  fseats=$(qs "select count(*) from agents where department='media-studio'")
  if [[ "$fseats" =~ ^[1-9] ]]; then chk "4  fresh: media-studio seats ($fseats) whose brain <> the enabled model (F035)" "$(qs "$SEAT_MISMATCH")" "^0$"
  else no "4  fresh: media-studio seats born by the chain (0 = vacuous, lesson b)" "$fseats"; fi
  chk "5  w10 migration file present (name contains w10)" "${MIG:-none}" "^2026[0-9]+_.*w10.*\.sql$"
  if [[ -n "$MIG" ]]; then
    chk "6  w10 migration idempotent (second run on the fresh db, exit code)" "$(docker exec -i "$CB" psql -U postgres -d "$SCR" -v ON_ERROR_STOP=1 -q < "$D/db/migrations/$MIG" >/dev/null 2>&1; echo $?)" "^0$"
  else no "6  w10 migration idempotent" "no file"; fi
  # F035 — the two live engines
  chk "7  company: media.creative rows as ruled (SELECT only)" "$(q $CO "$ROWS")" "^fable-5\|false\|[0-9]+ ; fable-5\.1\|true\|[0-9]+$"
  chk "8  company: media-studio seats whose brain <> the enabled model" "$(q $CO "$SEAT_MISMATCH")" "^0$"
  chk "9  construction: media.creative rows as ruled" "$(q $CB "$ROWS")" "^fable-5\|false\|[0-9]+ ; fable-5\.1\|true\|[0-9]+$"
  chk "10 construction: media-studio seats whose brain <> the enabled model" "$(q $CB "$SEAT_MISMATCH")" "^0$"
  info "   the two assigned seats (route by their own department; not judged)" "$(q $CO "$ASSIGNED")"
  chk "11 migration ledgers: repo = company = construction (count)" "$(ls "$D"/db/migrations/*.sql | wc -l) $(q $CO 'select count(*) from supabase_migrations.schema_migrations') $(q $CB 'select count(*) from supabase_migrations.schema_migrations')" "^([0-9]+) \1 \1$"
  # F024 — one of two roads
  pages=$(( $(grep -c persona_version "$EMP") + $(grep -c persona_version "$DIR") ))
  pvm=$(q $CO "$PV_MISMATCH")
  if [[ $pages == 0 ]]; then
    ok "12 F024 road (i): CEO pages no longer read agents.persona_version" "employees+directors=0"
    chk "13 road (i): a version shown on those pages comes from the bound persona (personas join)" "$(grep -c "personas" "$EMP" "$DIR" | awk -F: '{s+=$2} END{print s}')" "^[0-9]+$"
  else
    info "12 F024 road (ii): CEO pages still read the column" "employees+directors=$pages"
    chk "13 road (ii): persona_version = 'v'||bound version, every non-archived agent (mismatch)" "$pvm" "^0$"
    chk "14 road (ii): the bind path keeps it in step (trigger/function on agents naming persona_version)" "$(q $CO "select count(*) from pg_trigger t join pg_proc p on p.oid=t.tgfoid where t.tgrelid='public.agents'::regclass and not t.tgisinternal and pg_get_functiondef(p.oid) ilike '%persona_version%'")" "^[1-9]"
  fi
  # gates that still read the tag must still accept every active bound employee
  if [[ $(grep -c "startsWith(\"v2\")" "$AGT") -gt 0 ]]; then chk "15 kernel eligibility gate still reads ^v2 → agents failing it" "$(q $CO "$PV_NOT_V2")" "^0$"; else ok "15 kernel eligibility gate no longer reads the tag" "0"; fi
  if [[ $(grep -c "persona_version\", \"v2%" "$WFP") -gt 0 ]]; then chk "16 ops/workflows page still filters v2% → agents it would hide" "$(q $CO "$PV_NOT_V2")" "^0$"; else ok "16 ops/workflows page no longer filters on the tag" "0"; fi
  chk "17 tests that pin the tag or the bind (e125 e9 e10 r23) — whole dirs" "$(cd "$D" 2>/dev/null; npx vitest run tests/e125 tests/e9 tests/e10 tests/r23 2>&1 | grep -E '^ *Tests ' | grep -oE '[0-9]+ (passed|failed)' | tr '\n' ' ')" "^[0-9]+ passed $"
  # records
  chk "18 EVIDENCE-W10 exists and carries THIS ruler's md5" "$(grep -c "$(md5sum "$0" | cut -d' ' -f1)" "$EVID" 2>/dev/null || echo 0)" "^[1-9]"
  chk "19 board B43: F032, F035, F024 closed" "$(grep -o 'F032 closed\|F035 closed\|F024 closed' "$BOARD" | sort -u | wc -l)" "^3$"
  chk "20 MODEL_ROUTING_SPEC no longer says 'corrected in W10'" "$(grep -c 'corrected in W10' "$SPEC")" "^0$"
  chk "21 STATE names W10" "$(grep -c 'W10' "$D/.planning/STATE.md")" "^[1-9]"
  echo "⚠ UNVERIFIED by this file: RULE #0 eye pass on /org/employees and /org/directors (brain + persona columns) — his screen, screenshot in the evidence."
fi

if [[ $part == guard ]]; then
  echo "== GUARD — what W10 must not have broken"
  chk "G1 company media.creative rows unchanged as ruled" "$(q $CO "$ROWS")" "^fable-5\|false\|40 ; fable-5\.1\|true\|50$"
  chk "G2 brain floor still L1 for the 14 seats (fn_effective_tier('L3') <> 'L1')" "$(q $CO "select count(*) from agents a where a.department='media-studio' and fn_effective_tier('L3', a.id) <> 'L1'")" "^0$"
  chk "G3 catalogue rows fable-5 / fable-5.1 active L1 (company, construction)" "$(q $CO "select count(*) from model_catalog where id in ('fable-5','fable-5.1') and status='active' and tier_floor='L1'") $(q $CB "select count(*) from model_catalog where id in ('fable-5','fable-5.1') and status='active' and tier_floor='L1'")" "^2 2$"
  chk "G4 resident scheduler younger than kernel dist (s; negative = old code running)" "$(( $(date -d "$(systemctl --user show dxb-scheduler.service -p ActiveEnterTimestamp --value)" +%s) - $(stat -c %Y "$D/packages/kernel/dist/workflow/steps/agent.js") ))" "^[0-9]+$"
  chk "G5 i18n parity: colPersona/colBrain keys equal in en and tr" "$(grep -c 'colPersona\|colBrain' "$D/apps/dashboard/messages/en.json") $(grep -c 'colPersona\|colBrain' "$D/apps/dashboard/messages/tr.json")" "^([0-9]+) \1$"
  chk "G6 bound = newest passed, holding-wide (rows behind)" "$(q $CO "select count(*) from agents a join personas pb on pb.id=a.persona_id where pb.version <> (select max(version) from personas p2 where p2.employee_id=a.id and p2.quality_gate='passed')")" "^0$"
  chk "G7 W8 pin: media_jobs 16277dac still failed|true" "$(q $CO "select status||'|'||(error is not null) from media_jobs where id::text like '16277dac%'")" "^failed\|t"
  fresh_down
  chk "G8 scratch database dropped (no w10_fresh left in the construction engine)" "$(q $CB "select count(*) from pg_database where datname='$SCR'")" "^0$"
fi

[[ $part == baseline ]] && exit 0
echo; [[ $fail == 0 ]] && echo "CHECK $part: ALL PASS" || { echo "CHECK $part: FAIL"; exit 1; }
