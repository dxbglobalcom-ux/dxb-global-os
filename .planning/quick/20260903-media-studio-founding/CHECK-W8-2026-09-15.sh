#!/bin/bash
# THE CHECKER'S RULER for W8 — the media lane's seams (handoff W8: F022 F023 F026 F047 F049) — dictated by the
# checker session (Fable 5.1, dxb-global-os-08) on 2026-09-15 14:2x from its own measurements, BEFORE the work and
# BEFORE the CEO's word, and committed by the BUILDER as its own `records(ruler): …` commit (the audit law: the
# checker measures, instructs and re-measures; it writes no repo line). Red on today's tree by design.
#
#   bash CHECK-W8-2026-09-15.sh baseline   # what is true before the work (prints, no verdict; runs NO test suite)
#   bash CHECK-W8-2026-09-15.sh w8         # the acceptance lines + guard + battery (runs tests/b43 four times)
#   bash CHECK-W8-2026-09-15.sh guard      # the guard lines alone (what W8 must NOT touch without his separate word)
#
# Baseline measured by the checker on 7f19c2d9 (2026-09-15, 14:2x):
#   packages/dxb-mcp/src/groups/media.ts:25  `export const MEDIA_WORK_ROOT = process.env.DXB_MEDIA_WORK_ROOT ?? "/home/dxb/tools/h3/jobs"`
#     — read at MODULE level; tests/b43/media-hands.test.ts:106 and media-lanes.test.ts:167 set the env in beforeAll,
#     AFTER import — so every run of tests/b43 writes probe frames into the PRODUCTION work root.
#   /home/dxb/tools/h3/jobs/probes: 105 directories, 79 MB; 17 of them created TODAY (12:50 → 14:18) — by the builder's
#     runs AND by the checker's own ruler runs (13:45 baseline, 13:50, 13:54–13:59, 14:03–14:04, 14:09). Both hands guilty.
#   /home/dxb/tools/h3/jobs total 121 MB.
#   dxb-scheduler.service TimeoutStopUSec = 1min 30s (no TimeoutStopSec= in the unit file); a shoot take ≈ 14 min / 15 s.
#   media_jobs (company): 36 done · 1 failed · 0 running; 37 rows, ids-md5 97780785b17e41f2b3eae43016115c14.
#   The failed row 16277dac: kind shoot, cancel_requested=t, error "python exited null: …" — F022 says it was a
#     CANCELLATION mislabelled; relabelling a history row needs HIS separate word (approval id below).
#   media-lane.ts: 0 hits for recover|reap|heartbeat; stopScoped at 475; the close-handler race at ~515-528.
#   The board carries none of F022/F023/F026/F047/F049 as closed today.
#
# HIS SEPARATE WORDS this ruler recognises (each an approval id in scripts/governance/ceo-approvals.json):
#   w8-media-lane-seams-approved-2026-09-15        — the word to build W8 (required)
#   w8-probe-dirs-deleted-2026-09-15               — his yes to deleting the 105 probe dirs (79 MB); without it, none may go
#   w8-row-16277dac-relabelled-2026-09-15          — his yes to relabelling the failed row as cancelled; without it, untouched
set -u
D="/home/dxb/DxB Global OS"
CO="supabase_db_DxB_Global_OS"   # company engine (SELECT only here)
BASE="7f19c2d9"                  # the tree W8 starts from
PROBES="/home/dxb/tools/h3/jobs/probes"
JOBS="/home/dxb/tools/h3/jobs"
q(){ docker exec -i "$1" psql -U postgres -d postgres -At -F'|' -c "$2" 2>&1; }
fail=0
ok(){ printf "PASS  %-66s %s\n" "$1" "$2"; }
no(){ printf "FAIL  %-66s %s\n" "$1" "$2"; fail=1; }
chk(){ if [[ "$2" =~ $3 ]]; then ok "$1" "$2"; else no "$1" "$2 (expected: $3)"; fi; }

part="${1:-baseline}"
MEDIA_TS="$D/packages/dxb-mcp/src/groups/media.ts"
LANE_TS="$D/packages/outbox-executor/src/media-lane.ts"
HANDS_TEST="$D/tests/b43/media-hands.test.ts"
LANES_TEST="$D/tests/b43/media-lanes.test.ts"
BOARD="$D/HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md"
APPROVALS="$D/scripts/governance/ceo-approvals.json"
UNIT="$(systemctl --user show dxb-scheduler.service -p FragmentPath --value)"
EVID="$D/.planning/quick/20260903-media-studio-founding/EVIDENCE-W8-2026-09-15.md"

approved(){ grep -c "\"$1\"" "$APPROVALS"; }
probe_count(){ ls -1 "$PROBES" 2>/dev/null | wc -l; }
jobs_count(){ ls -1 "$JOBS" 2>/dev/null | wc -l; }
b43_run(){ (cd "$D" 2>/dev/null; npx vitest run tests/b43 2>&1 | grep -E '^ *Tests ' | grep -oE '[0-9]+ (passed|failed)' | tr '\n' ' '); }
stop_timeout(){ systemctl --user show dxb-scheduler.service -p TimeoutStopUSec --value; }
daemon_after(){ echo $(( $(date -d "$(systemctl --user show dxb-scheduler.service -p ExecMainStartTimestamp --value)" +%s) - $(stat -c %Y "$1") )); }
jobbook(){ q $CO "select count(*)||' rows, done '||count(*) filter (where status='done')||', failed '||count(*) filter (where status='failed')||', cancelled '||count(*) filter (where status='cancelled')||', running '||count(*) filter (where status='running')||', ids-md5 '||md5(string_agg(id::text, ',' order by id)) from media_jobs"; }
row16277(){ q $CO "select status||'|'||cancel_requested from media_jobs where id::text like '16277dac%'"; }

if [[ $part == baseline ]]; then
  echo "== W8 BASELINE (no test suite is run here — a run would write into the production root today)"
  echo "media.ts module-level env read:   $(grep -cE '^export const MEDIA_WORK_ROOT = process\.env' "$MEDIA_TS")"
  echo "media-lane.ts recover|reap|heartbeat: $(grep -ci 'recover\|reap\|heartbeat' "$LANE_TS")   killedFor: $(grep -c 'killedFor' "$LANE_TS")"
  echo "tests with a real child kill:     lanes $(grep -ci 'SIGKILL\|SIGTERM\|\.kill(' "$LANES_TEST") · hands $(grep -ci 'SIGKILL\|SIGTERM\|\.kill(' "$HANDS_TEST")"
  echo "probes dirs: $(probe_count) ($(du -sh "$PROBES" 2>/dev/null | cut -f1))   jobs top-level entries: $(jobs_count) ($(du -sh "$JOBS" 2>/dev/null | cut -f1))"
  echo "TimeoutStopUSec: $(stop_timeout)   unit TimeoutStopSec line: $(grep -c '^TimeoutStopSec=' "$UNIT")"
  echo "job book (company): $(jobbook)"
  echo "row 16277dac status|cancel_requested: $(row16277)"
  echo "board closed: F022 $(grep -c 'F022 closed' "$BOARD") F023 $(grep -c 'F023 closed' "$BOARD") F026 $(grep -c 'F026 closed' "$BOARD") F047 $(grep -c 'F047 closed' "$BOARD") F049 $(grep -c 'F049 closed' "$BOARD")"
  echo "approvals: build $(approved w8-media-lane-seams-approved-2026-09-15) · probe-delete $(approved w8-probe-dirs-deleted-2026-09-15) · relabel $(approved w8-row-16277dac-relabelled-2026-09-15)"
fi

if [[ $part == w8 ]]; then
  echo "== W8 — the media lane's seams"
  chk "w1 media.ts no longer reads DXB_MEDIA_WORK_ROOT at module level" "$(grep -cE '^export const MEDIA_WORK_ROOT = process\.env' "$MEDIA_TS")" "^0$"
  chk "w2 media-lane.ts has recovery for jobs left running (recover|reap|heartbeat)" "$(grep -ci 'recover\|reap\|heartbeat' "$LANE_TS")" "^[1-9]"
  chk "w3 media-lane.ts cancel path names the kill before stopScoped (killedFor)" "$(grep -c 'killedFor' "$LANE_TS")" "^[2-9]"
  chk "w4 a test kills a REAL child process (lanes or hands)"        "$(( $(grep -ci 'SIGKILL\|SIGTERM\|\.kill(' "$LANES_TEST") + $(grep -ci 'SIGKILL\|SIGTERM\|\.kill(' "$HANDS_TEST") ))" "^[1-9]"
  chk "w5 a test covers start-up recovery of a job left running"     "$(grep -ci 'recover\|reap\|orphan\|left running' "$LANES_TEST" "$HANDS_TEST" | awk -F: '{s+=$2} END{print s+0}')" "^[1-9]"
  p0=$(probe_count); j0=$(jobs_count)
  r1=$(b43_run); p1=$(probe_count); j1=$(jobs_count)
  chk "w6 THE DECISIVE ONE: probes dir count unchanged after vitest run tests/b43" "$p0→$p1" "^$p0→$p0$"
  chk "w7 jobs top-level entries unchanged after the run (no staged inputs left)" "$j0→$j1" "^$j0→$j0$"
  chk "w8 tests/b43 run 1"                                            "$r1" "^[0-9]+ passed $"
  r2=$(b43_run); r3=$(b43_run)
  chk "w9 tests/b43 run 2 (deterministic)"                            "$r2" "^${r1}$"
  chk "w10 tests/b43 run 3 (deterministic)"                           "$r3" "^${r1}$"
  chk "w11 unit file carries TimeoutStopSec= (≥ 15 min)"              "$(grep -o '^TimeoutStopSec=.*' "$UNIT")" "^TimeoutStopSec=((1[5-9]|[2-9][0-9])min|([9][0-9][0-9]|[1-9][0-9]{3,})s?|[1-9]h)$"
  chk "w12 the running daemon carries that timeout (not 1min 30s)"    "$(stop_timeout)" "^((1[5-9]|[2-9][0-9])min|[1-9]h)"
  chk "w13 daemon restarted after the unit file changed (s ≥ 0)"      "$(daemon_after "$UNIT")" "^[0-9]+$"
  chk "w14 daemon restarted after the outbox-executor build (s ≥ 0)"  "$(daemon_after "$D/packages/outbox-executor/dist/media-lane.js")" "^[0-9]+$"
  chk "w15 F022 F023 F026 F047 F049 all closed on the board"          "$(grep -oE 'F0(22|23|26|47|49) closed' "$BOARD" | sort -u | wc -l)" "^5$"
  chk "w16 approval registered (w8-media-lane-seams-approved-2026-09-15)" "$(approved w8-media-lane-seams-approved-2026-09-15)" "^[1-9]"
  chk "w17 evidence file present with ROLLBACK and ⚠ UNVERIFIED"      "$(grep -c 'ROLLBACK\|UNVERIFIED' "$EVID" 2>/dev/null)" "^[2-9]"
fi

if [[ $part == w8 || $part == guard ]]; then
  echo "== GUARD — what W8 must NOT touch without his separate word"
  if [[ $(approved w8-row-16277dac-relabelled-2026-09-15) -ge 1 ]]; then
    chk "g1 row 16277dac relabelled on his word (cancelled|true)"         "$(row16277)" "^cancelled\|true$"
    chk "g2 job book: 37 rows, same ids, failed 0 / cancelled 1"        "$(jobbook)" "^37 rows, done 36, failed 0, cancelled 1, running 0, ids-md5 97780785b17e41f2b3eae43016115c14$"
  else
    chk "g1 row 16277dac untouched (no word from him): failed|true"       "$(row16277)" "^failed\|true$"
    chk "g2 job book untouched: 37 rows, done 36, failed 1, same ids"  "$(jobbook)" "^37 rows, done 36, failed 1, cancelled 0, running 0, ids-md5 97780785b17e41f2b3eae43016115c14$"
  fi
  if [[ $(approved w8-probe-dirs-deleted-2026-09-15) -ge 1 ]]; then
    chk "g3 probe dirs deleted on his word (listed folder-by-folder with sizes in the evidence)" "$(grep -c 'probes/' "$EVID" 2>/dev/null)" "^[1-9]"
  else
    chk "g3 the 105 probe dirs still there (no word from him to delete)" "$(probe_count)" "^(10[5-9]|1[1-9][0-9])$"
  fi
  chk "g4 packages/voice untouched since $BASE"                        "$(git -C "$D" diff --stat $BASE..HEAD -- packages/voice | wc -l)" "^0$"
  chk "g5 voice_identities fingerprint unchanged"                      "$(q $CO "select count(*)||' identities, md5='||coalesce(md5(string_agg(id::text||engine||coalesce(profile_ref,'')||status, ',' order by id)),'') from voice_identities")" "^1 identities, md5=2ae50c4cdcc6127c9a055a6cc620473b$"
  chk "g6 media-studio profile still the 5 media_* tool names"        "$(grep -o '"media_[a-z]*"' "$D/packages/gateway/profiles/media-studio.mcp.json" | sort -u | wc -l)" "^5$"
  chk "g7 no media_jobs row left 'running' (company)"                  "$(q $CO "select count(*) from media_jobs where status='running'")" "^0$"
  echo "== BATTERY (shared, from the W9/B08 ruler)"
  batout="$(bash "$D/.planning/quick/20260903-media-studio-founding/CHECK-W9-B08-2026-09-15.sh" battery 2>&1 | grep -E '^(PASS|FAIL)')"
  echo "$batout" | sed 's/^/      /'
  chk "battery (W9/B08 ruler) FAIL lines"                              "$(echo "$batout" | grep -c '^FAIL')" "^0$"
fi

echo; [[ $fail == 0 ]] && echo "CHECK W8 $part: ALL PASS" || { echo "CHECK W8 $part: FAIL"; exit 1; }
