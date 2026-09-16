#!/usr/bin/env bash
# CHECK-B45-2026-09-16.sh — the checker's ruler for board row B45 (dictated by the checker session dxb-global-os-c7,
# Fable 5.1, 2026-09-16; copied and committed ALONE by the builder as `records(ruler): …` BEFORE the first line of
# work — the audit law c7570071). Builder and checker run the SAME script.
#
# THE ROW. A resting lane cannot hear stop(): TaskLanes.runLane (packages/outbox-executor/src/task-lanes.ts:105) does
# `await this.deps.sleep(this.restMs)` and re-tests `stopping` only when it wakes, so every shutdown of the company's
# hands waits out one full rest per lane set — measured 6068–6082 ms across six runs with nothing to do, paid at every
# `systemctl --user restart dxb-scheduler.service` and at every test that boots the scheduler. MediaLanes wraps
# TaskLanes (media-lanes.ts:78), so the one sleep is the one place.
# HIS WORD (typed 14:24:54 local): "denetçiye danış ok verirse yap vermezse yapma" — the checker decided YES, bounded:
# a rest that wakes on stop(), nothing else. The row is B45 (highest row on the board at dictation: B44).
#
# WHAT THE RULER IS HARD ABOUT
#   1. ONE PLACE, TWO FILES AT MOST: task-lanes.ts (the rest) and, only if the wrapper needs it, media-lanes.ts. NOT
#      scheduler.ts, not the brake, not any surface he sees. Records and the two lane test files may change; nothing else.
#   2. PROOF WITHOUT A STOPWATCH: the acceptance is a DETERMINISTIC test with an injected sleep that never resolves on its
#      own — stop() must still resolve. No elapsed-time assertion, no added timeout literal anywhere in tests/. The two new
#      cases carry these exact titles:
#        task-lanes.test.ts : "stop() wakes a resting lane at once — no rest is waited out"
#        media-lanes.test.ts: "stop() wakes a resting media lane at once"
#   3. "A TASK MID-RUN IS NEVER CUT" STAYS: every existing case in both lane test files keeps its title and passes —
#      above all "stop() waits for the current drains and takes no new work".
#   4. THE DAEMON RUNS COMPILED CODE (lesson c of the handbook): dist/task-lanes.js is rebuilt after the source, and the
#      resident dxb-scheduler is restarted AFTER the dist, with in-flight work = 0 at that moment — measured, not assumed.
#   5. HIS EVIDENCE IS THE RESTART: `RESTART BEFORE:` and `RESTART AFTER:` seconds in the evidence, measured by mode
#      `restart` (printed, never judged — a number he reads, not a stopwatch verdict).
#
# MODES
#   baseline | b45   — records + the code's and tests' substance (RED today by design)
#   unit             — the two lane test files alone (fast, deterministic)
#   guard <range>    — allow-list · no timeout literal added · ruler not self-certified
#   restart          — in-flight = 0, then time the resident restart; dist newer than src; service active after
#   battery          — the door's battery, whole (delegates to CHECK-W15-2026-09-16.sh battery)
# Exit 0 = every line PASS in that mode; 1 otherwise.

set -u
R="/home/dxb/DxB Global OS"
Q="$R/.planning/quick/20260903-media-studio-founding"
BOARD="$R/HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md"
STATE="$R/.planning/STATE.md"
LEDGER="$R/scripts/governance/ceo-approvals.json"
EVID="$Q/EVIDENCE-B45-2026-09-16.md"
TL="$R/packages/outbox-executor/src/task-lanes.ts"; ML="$R/packages/outbox-executor/src/media-lanes.ts"
TLT="$R/tests/b43/task-lanes.test.ts"; MLT="$R/tests/b43/media-lanes.test.ts"
DIST="$R/packages/outbox-executor/dist/task-lanes.js"
W15="$Q/CHECK-W15-2026-09-16.sh"
HIS_WORD='denetçiye danış ok verirse yap vermezse yapma'
NEW_TL='stop() wakes a resting lane at once — no rest is waited out'
NEW_ML='stop() wakes a resting media lane at once'
OLD_TL=("lane 2 takes the next task while lane 1 is inside a long run" "an idle lane rests one tick; a working lane looks again at once" "lowering the count retires a lane after its drain; raising it starts loops again" "a lane that throws rests and retries; its sibling keeps working" "stop() waits for the current drains and takes no new work" "is 3 s by default, takes the environment's number, rolls back to 10 s on request, never spins and never sleeps past a minute")
OLD_ML=("a processor job is claimed while the card lane is inside a long shoot" "two card jobs never overlap — the card is one" "a lane that just finished looks again at once; an idle lane rests one tick" "DXB_MEDIA_CPU_LANES=0 is the rollback shape: one lane, every kind, the historical id" "a GPU-kinds lane and a CPU-kinds lane run their jobs at once; the book shows the overlap" "a lane with kinds sees nothing when only other kinds are queued" "a REAL child process killed mid-run ends 'cancelled', never 'failed'" "a child killed with SIGKILL — the hardest death — still gives its job back" "start-up recovery gives back a job a dead process was holding")
SCRATCH="${TMPDIR:-/tmp}/check-b45-$$"; mkdir -p "$SCRATCH"

fails=0
line() { printf '%-4s  %-66s %s\n' "$1" "$2" "$3"; [ "$1" = PASS ] || fails=$((fails+1)); }
eq()   { if [ "$2" = "$3" ]; then line PASS "$1" "$2"; else line FAIL "$1" "$2 (expected: $3)"; fi; }
ge()   { if [ "${2:-0}" -ge "$3" ] 2>/dev/null; then line PASS "$1" "$2"; else line FAIL "$1" "${2:-0} (expected: ≥$3)"; fi; }
count_titles() { local f="$1"; shift; local n=0; for t in "$@"; do grep -q -F "$t" "$f" && n=$((n+1)); done; echo "$n"; }
q() { docker exec -i supabase_db_DxB_Global_OS psql -U postgres -d postgres -At -c "$1" 2>&1; }

mode="${1:-baseline}"; shift || true
case "$mode" in
baseline|b45)
  echo "== B45 RECORDS AND SUBSTANCE ($mode)"
  eq  "board row B45 present" "$(grep -c '^| B45 |' "$BOARD")" "1"
  eq  "board B45 names the resting-lane / stop() wake" "$(grep '^| B45 |' "$BOARD" | grep -c -i 'wake\|interruptible')" "1"
  eq  "board B45 carries the LAW B status (NOT ACCEPTED BY HIS EYE)" "$(grep '^| B45 |' "$BOARD" | grep -c 'NOT ACCEPTED BY HIS EYE')" "1"
  ge  "ledger carries his delegation verbatim" "$(grep -c -F "$HIS_WORD" "$LEDGER")" "1"
  # the code
  ge  "task-lanes.ts still rests through deps.sleep (no busy loop)" "$(grep -c 'deps.sleep' "$TL")" "1"
  ge  "task-lanes.ts marks the change (B45)" "$(grep -c 'B45' "$TL")" "1"
  base=$(git -C "$R" log --format=%h -1 --diff-filter=A -- "$Q/CHECK-B45-2026-09-16.sh" 2>/dev/null); [ -n "$base" ] || base=HEAD
  eq  "scheduler.ts untouched since the ruler commit ($base)" "$(git -C "$R" log --oneline "$base..HEAD" -- packages/outbox-executor/src/scheduler.ts | wc -l)" "0"
  # the tests
  eq  "task-lanes.test.ts keeps its 6 old cases" "$(count_titles "$TLT" "${OLD_TL[@]}")" "6"
  eq  "media-lanes.test.ts keeps its 9 old cases" "$(count_titles "$MLT" "${OLD_ML[@]}")" "9"
  eq  "task-lanes.test.ts has the new case (exact title)" "$(grep -c -F "$NEW_TL" "$TLT")" "1"
  eq  "media-lanes.test.ts has the new case (exact title)" "$(grep -c -F "$NEW_ML" "$MLT")" "1"
  now_clock=$(cat "$TLT" "$MLT" | grep -c -E 'Date\.now|performance\.now|hrtime')
  was_clock=$( { git -C "$R" show "$base:tests/b43/task-lanes.test.ts"; git -C "$R" show "$base:tests/b43/media-lanes.test.ts"; } 2>/dev/null | grep -c -E 'Date\.now|performance\.now|hrtime')
  eq  "elapsed-time reads in the two test files not increased (Date.now/performance.now/hrtime)" "$now_clock" "$was_clock"
  # compiled code and the daemon
  if [ -f "$DIST" ]; then
    eq "dist/task-lanes.js newer than src (the daemon runs compiled code)" "$([ "$(stat -c %Y "$DIST")" -ge "$(stat -c %Y "$TL")" ] && echo yes || echo no)" "yes"
    svc=$(systemctl --user show dxb-scheduler.service -p ExecMainStartTimestamp --value 2>/dev/null); svc_e=$(date -d "$svc" +%s 2>/dev/null || echo 0)
    dist_e=$(stat -c %Y "$DIST"); if [ "$svc_e" -ge "$dist_e" ]; then started=yes; else started="no: $svc"; fi
    eq "dxb-scheduler started AFTER the dist was built" "$started" "yes"
  else line FAIL "dist/task-lanes.js" "missing"; fi
  # evidence
  if [ -f "$EVID" ]; then
    eq "evidence header carries THIS ruler's md5" "$(grep -c "$(md5sum "$0" | cut -c1-32)" "$EVID")" "1"
    eq "evidence RESTART BEFORE: / RESTART AFTER: / IN FLIGHT AT RESTART: 0 / DIST REBUILT:" "$(grep -c 'RESTART BEFORE:' "$EVID")$(grep -c 'RESTART AFTER:' "$EVID")$(grep -c 'IN FLIGHT AT RESTART: 0' "$EVID" | awk '{print ($1>0)}')$(grep -c 'DIST REBUILT:' "$EVID" | awk '{print ($1>0)}')" "1111"
    eq "evidence states NO STOPWATCH TEST:" "$(grep -c 'NO STOPWATCH TEST:' "$EVID")" "1"
  else line FAIL "evidence file EVIDENCE-B45-2026-09-16.md" "missing"; fi
  ge  "STATE names B45" "$(grep -c 'B45' "$STATE")" "1"
  eq  "STATE branch count = git" "$(grep -o '\*\*[0-9]\+ commits\*\*' "$STATE" | head -1 | tr -dc 0-9)" "$(git -C "$R" rev-list --count master..HEAD)"
  ;;
unit)
  echo "== B45 UNIT — the two lane test files alone"
  others=$(pgrep -f 'vitest' | wc -l); eq "other vitest processes before the run" "$others" "0"
  pnpm -C "$R" exec vitest run tests/b43/task-lanes.test.ts tests/b43/media-lanes.test.ts --reporter=verbose > "$SCRATCH/unit.log" 2>&1; rc=$?
  eq  "vitest exit code" "$rc" "0"
  echo "      $(grep -E '^ *Test Files' "$SCRATCH/unit.log" | tail -1 | sed 's/^ *//') · $(grep -E '^ *Tests ' "$SCRATCH/unit.log" | tail -1 | sed 's/^ *//')"
  eq  "new task-lanes case ran and passed" "$(grep -F "$NEW_TL" "$SCRATCH/unit.log" | grep -c '✓')" "1"
  eq  "new media-lanes case ran and passed" "$(grep -F "$NEW_ML" "$SCRATCH/unit.log" | grep -c '✓')" "1"
  eq  "'stop() waits for the current drains' still passes" "$(grep -F 'stop() waits for the current drains and takes no new work' "$SCRATCH/unit.log" | grep -c '✓')" "1"
  grep -E '✗|×|FAIL' "$SCRATCH/unit.log" | head -5 | sed 's/^/      /'
  ;;
guard)
  range="${1:-}"; [ -n "$range" ] || { echo "usage: guard <hash|range>"; exit 2; }
  case "$range" in *..*) ;; *) range="${range}^..${range}";; esac
  echo "== B45 GUARD ($range)"
  ALLOW='^(packages/outbox-executor/src/(task-lanes|media-lanes)\.ts$|tests/b43/(task-lanes|media-lanes)\.test\.ts$|\.planning/|HOLDING-OS-MASTER-PLAN/|docs/|scripts/governance/ceo-approvals\.json$)'
  git -C "$R" diff --name-only "$range" > "$SCRATCH/files"
  out=$(grep -v -E "$ALLOW" "$SCRATCH/files" | grep -v '^$')
  eq  "files outside the B45 allow-list (two lane sources, two lane tests, records)" "$(printf '%s' "$out" | grep -c .)" "0"; [ -z "$out" ] || printf '%s\n' "$out" | sed 's/^/      /'
  eq  "scheduler.ts / breaker / db / apps / .claude / scripts (ledger excepted) touched" "$(grep -v '^scripts/governance/ceo-approvals\.json$' "$SCRATCH/files" | grep -c -E '^(packages/outbox-executor/src/scheduler\.ts|packages/outbox-executor/src/breaker|db/|apps/|\.claude/|scripts/)')" "0"
  eq  "timeout literals added in tests (no stopwatch, no escape here)" "$(git -C "$R" diff "$range" -- tests | grep -E '^\+' | grep -v '^\+\+' | grep -c -E 'testTimeout|hookTimeout|\b[0-9]{1,3}_?000\)|\b[0-9]{2,3}_000\b')" "0"
  add=$(git -C "$R" log --format=%h -1 --diff-filter=A -- "$Q/CHECK-B45-2026-09-16.sh")
  if [ -z "$add" ]; then line PASS "ruler changed inside the range" "n/a — ruler not yet in git"
  else eq "ruler changed inside the range (adding commit $add excepted)" "$(git -C "$R" log --format=%h "$range" -- "$Q/CHECK-B45-2026-09-16.sh" | grep -v -c "^$add")" "0"; fi
  ;;
restart)
  echo "== B45 RESTART — the resident scheduler, measured (in-flight must be 0; the seconds are printed, not judged)"
  inflight=$(q "select (select count(*) from media_jobs where status='running') + (select count(*) from tasks where status in ('in_progress','running'))")
  eq  "in-flight work on the company (media running + tasks running)" "$inflight" "0"
  [ "$inflight" = 0 ] || { echo "      refusing to restart with work in flight"; echo; echo "CHECK B45 [$mode]: FAIL ($fails)"; exit 1; }
  eq  "dist/task-lanes.js newer than src" "$([ "$(stat -c %Y "$DIST")" -ge "$(stat -c %Y "$TL")" ] && echo yes || echo no)" "yes"
  t0=$(date +%s%N); systemctl --user restart dxb-scheduler.service; rc=$?
  for i in $(seq 1 60); do [ "$(systemctl --user is-active dxb-scheduler.service)" = active ] && break; sleep 0.5; done
  t1=$(date +%s%N); secs=$(awk -v a="$t0" -v b="$t1" 'BEGIN{printf "%.2f", (b-a)/1e9}')
  eq  "systemctl restart exit code" "$rc" "0"
  eq  "dxb-scheduler active after restart" "$(systemctl --user is-active dxb-scheduler.service)" "active"
  echo "      RESTART LINE FOR THE EVIDENCE: RESTART <BEFORE|AFTER>: ${secs}s (systemctl restart → active) · IN FLIGHT AT RESTART: 0 · $(date +%Y-%m-%d\ %H:%M:%S) · ExecMainStart $(systemctl --user show dxb-scheduler.service -p ExecMainStartTimestamp --value)"
  echo "      (the stop half of that restart is what B45 shortens; journalctl --user -u dxb-scheduler.service --since '-2 min' shows the stop→start gap)"
  ;;
battery)
  exec bash "$W15" battery
  ;;
*) echo "usage: $0 {baseline|b45|unit|guard <hash|range>|restart|battery}"; exit 2;;
esac
rm -rf "$SCRATCH"
echo; if [ "$fails" -eq 0 ]; then echo "CHECK B45 [$mode]: PASS"; exit 0; else echo "CHECK B45 [$mode]: FAIL ($fails)"; exit 1; fi
