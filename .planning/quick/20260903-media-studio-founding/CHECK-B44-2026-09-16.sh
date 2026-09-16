#!/usr/bin/env bash
# CHECK-B44-2026-09-16.sh — the checker's ruler for board row B44 (dictated by the checker session dxb-global-os-c7,
# Fable 5.1, 2026-09-16; copied and committed ALONE by the builder as `records(ruler): …` BEFORE the first line of
# work — the audit law c7570071). Builder and checker run the SAME script. His word for the row, typed 12:48:15:
# "tamam düzelt o zaman lakin para zaten benim iznim olmadan asla harcanamaz" — fix it, and money is never spent
# without his permission: the spending brake this row's test guards (COST-03) keeps its teeth.
#
# THE ROW: tests that pass alone and time out inside the whole suite. Members named so far: tests/phase4/velocity.test.ts
# (rotation seen by builder AND checker) · tests/r31/voice-line.test.ts (one builder run, never reproduced by the checker).
# The row's own acceptance column: three consecutive whole-suite runs in which NO file times out, with the reason for the
# old flakiness NAMED — or the wall-clock thresholds and 30 s limits replaced by something that does not measure elapsed
# time under load. The row closes on the CLASS, not on one file.
#
# MEASURED BEFORE THIS RULER WAS WRITTEN (checker, 2026-09-16 12:5x):
#   * vitest.config.ts:96 `fileParallelism: false`, no workspace file → the suite runs its files ONE AT A TIME. The board's
#     recorded cause ("the suite runs its files in parallel") is FALSE — a guess written down. It goes (LAW A: replaced).
#   * velocity.test.ts: 6 cases, 25 expect() calls; the KERN case (line 183) boots a REAL pg-boss scheduler via
#     startScheduler(), which bootstraps eight self-chained queues at delay 0 and does real work on its first tick against
#     whatever ~120 earlier files left in the construction database. Alone: ~6 s. Late in the suite: > 30 s.
#     Its own comment records that on 2026-07-26 the SAME symptom was answered by raising the timeout 5 s → 30 s
#     ("a stopwatch verdict, not a behaviour verdict"). That move is not available a second time.
#   * voice-line.test.ts: real Speaches TTS/STT roundtrips (one case at 120 s); the e2e case carries no explicit timeout.
#
# WHAT THE RULER IS HARD ABOUT:
#   1. A MEASURED CAUSE, not a second guess: the row and the evidence carry the token `MEASURED CAUSE:` followed by the
#      measurement (command → number) for EACH member that was reproduced; a member never reproduced is written as such.
#   2. NO WIDENED STOPWATCH: no added or raised timeout literal in tests/ or vitest.config.ts — unless the evidence carries
#      a `TIMEOUT CHANGED:` section with the measured reason. Raising 30 s to 120 s and calling it fixed FAILS this ruler.
#   3. THE GUARD KEEPS ITS TEETH: velocity.test.ts keeps its 6 cases by title and ≥ 25 expect() calls; the evidence carries a
#      `NEGATIVE PROOF:` section showing the COST-03 test RED when the brake is broken (uncommitted mutation, run, reverted).
#   4. BLAST RADIUS: packages/ apps/ db/ .claude/ untouched; scripts/ untouched except the ledger; the five constant reds'
#      files (tests/b23, tests/b36, tests/c42) untouched — they are other rows' work and are not absorbed here.
#   5. THREE CONSECUTIVE WHOLE-SUITE RUNS, printed, `Test timed out` = 0 in each, every red ⊆ the five constant reds.
#      The checker re-runs at least one of them with its own hands (mode `run`).
#
# MODES
#   baseline | b44   — records + the test's substance (RED today by design: false cause standing, no evidence)
#   guard <range>    — allow-list · no widened stopwatch · constant reds untouched · ruler not self-certified
#   run              — ONE whole-suite run: summary, timeouts, reds; PASS iff timeouts = 0 and reds ⊆ constant five
#   alone            — the two members alone, with durations (the cause measurement's floor)
#   battery          — the door's battery, whole (delegates to CHECK-W15-2026-09-16.sh battery)
# Exit 0 = every line PASS in that mode; 1 otherwise.

set -u
R="/home/dxb/DxB Global OS"
Q="$R/.planning/quick/20260903-media-studio-founding"
BOARD="$R/HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md"
STATE="$R/.planning/STATE.md"
EVID="$Q/EVIDENCE-B44-2026-09-16.md"
VEL="$R/tests/phase4/velocity.test.ts"
VOICE="$R/tests/r31/voice-line.test.ts"
W15="$Q/CHECK-W15-2026-09-16.sh"
CONSTANT_REDS="tests/b23/graph-is-not-stale.test.ts tests/b36/live-drills.host.test.ts tests/b36/seed-is-fiction.test.ts tests/b36/wall-question.test.ts tests/c42/rival-intel-ledger.test.ts"
SCRATCH="${TMPDIR:-/tmp}/check-b44-$$"; mkdir -p "$SCRATCH"

fails=0
line() { printf '%-4s  %-66s %s\n' "$1" "$2" "$3"; [ "$1" = PASS ] || fails=$((fails+1)); }
eq()   { if [ "$2" = "$3" ]; then line PASS "$1" "$2"; else line FAIL "$1" "$2 (expected: $3)"; fi; }
ge()   { if [ "${2:-0}" -ge "$3" ] 2>/dev/null; then line PASS "$1" "$2"; else line FAIL "$1" "${2:-0} (expected: ≥$3)"; fi; }
b44row() { grep '^| B44 |' "$BOARD"; }

mode="${1:-baseline}"; shift || true
case "$mode" in
baseline|b44)
  echo "== B44 RECORDS AND THE GUARD'S SUBSTANCE ($mode)"
  eq  "false cause 'runs its files in parallel' left on board or STATE" "$(grep -c 'runs its files in parallel' "$BOARD" "$STATE" | awk -F: '{s+=$2} END{print s}')" "0"
  eq  "board B44 carries 'MEASURED CAUSE:'" "$(b44row | grep -o 'MEASURED CAUSE:' | wc -l | awk '{print ($1>0)?1:0}')" "1"
  eq  "board B44 says 'Nobody has looked at why' (gap column) — must be gone" "$(b44row | grep -c 'Nobody has looked at why')" "0"
  # the guard's substance
  titles=0; for t in "under-cap hour does NOT trip the breaker" "injected retry storm (100 rows, ~5 EUR/hour) trips within one check; keys blocked; audited" "second check while tripped is a no-op (no duplicate audit)" "reset without --confirm is refused" "dxb breaker reset --confirm clears state, unblocks keys, audits actor ceo:cli" "registers tick 15s / reaper 60s / breaker 5min"; do grep -q -F "$t" "$VEL" && titles=$((titles+1)); done
  eq  "velocity.test.ts keeps its 6 case titles" "$titles" "6"
  ge  "velocity.test.ts expect() calls (was 25)" "$(grep -c 'expect(' "$VEL")" "25"
  eq  "velocity.test.ts still boots the real scheduler (startScheduler) or evidence says why not" "$([ "$(grep -c 'startScheduler()' "$VEL")" -ge 1 ] && echo yes || { [ -f "$EVID" ] && grep -q 'SCHEDULER BOOT REPLACED:' "$EVID" && echo yes || echo no; })" "yes"
  eq  "velocity 30_000 literal unchanged, or evidence carries TIMEOUT CHANGED:" "$([ "$(grep -c '30_000' "$VEL")" = 1 ] && echo yes || { [ -f "$EVID" ] && grep -q 'TIMEOUT CHANGED:' "$EVID" && echo yes || echo no; })" "yes"
  # evidence
  if [ -f "$EVID" ]; then
    eq "evidence header carries THIS ruler's md5" "$(grep -c "$(md5sum "$0" | cut -c1-32)" "$EVID")" "1"
    ge "evidence 'MEASURED CAUSE:' sections" "$(grep -c 'MEASURED CAUSE:' "$EVID")" "1"
    eq "evidence names both members (velocity, voice-line)" "$(grep -c 'velocity.test.ts' "$EVID" | awk '{print ($1>0)}')$(grep -c 'voice-line.test.ts' "$EVID" | awk '{print ($1>0)}')" "11"
    eq "evidence 'NEGATIVE PROOF:' shows velocity RED with the brake broken" "$(awk '/NEGATIVE PROOF:/{f=1} f' "$EVID" | grep -c -E 'FAIL|failed|✗|×' | awk '{print ($1>0)}')" "1"
    for n in 1 2 3; do
      l=$(grep -E "RUN $n:" "$EVID" | head -1)
      ok=$(printf '%s' "$l" | grep -c -E 'Test Files.*\([0-9]+\).*timed out: 0|timed out: 0.*Test Files')
      eq "evidence RUN $n: whole-suite summary + 'timed out: 0'" "$ok" "1"
    done
  else line FAIL "evidence file EVIDENCE-B44-2026-09-16.md" "missing"; fi
  # the other rows' reds stay theirs
  named=0; for f in $CONSTANT_REDS; do grep -q -F "$f" "$STATE" && named=$((named+1)); done
  eq  "STATE still names the five constant reds with their rows" "$named" "5"
  eq  "STATE branch count = git" "$(grep -o '\*\*[0-9]\+ commits\*\*' "$STATE" | head -1 | tr -dc 0-9)" "$(git -C "$R" rev-list --count master..HEAD)"
  ;;
guard)
  range="${1:-}"; [ -n "$range" ] || { echo "usage: guard <hash|range>"; exit 2; }
  case "$range" in *..*) ;; *) range="${range}^..${range}";; esac
  echo "== B44 GUARD ($range)"
  ALLOW='^(tests/|vitest\.config\.ts$|\.planning/|HOLDING-OS-MASTER-PLAN/|docs/|scripts/governance/ceo-approvals\.json$)'
  git -C "$R" diff --name-only "$range" > "$SCRATCH/files"
  out=$(grep -v -E "$ALLOW" "$SCRATCH/files" | grep -v '^$')
  eq  "files outside the B44 allow-list (tests, vitest.config, records)" "$(printf '%s' "$out" | grep -c .)" "0"; [ -z "$out" ] || printf '%s\n' "$out" | sed 's/^/      /'
  eq  "packages/ apps/ db/ .claude/ touched" "$(grep -c -E '^(packages|apps|db|\.claude)/' "$SCRATCH/files")" "0"
  eq  "the five constant reds' files touched (other rows' work)" "$(grep -c -E '^tests/(b23|b36|c42)/' "$SCRATCH/files")" "0"
  added=$(git -C "$R" diff "$range" -- tests vitest.config.ts | grep -E '^\+' | grep -v '^\+\+' | grep -c -E 'testTimeout|hookTimeout|\b[0-9]{1,3}_?000\)|\b[0-9]{2,3}_000\b')
  if [ "$added" = 0 ]; then line PASS "added/raised timeout literals in tests or vitest.config" "0"
  elif [ -f "$EVID" ] && grep -q 'TIMEOUT CHANGED:' "$EVID"; then line PASS "timeout literals changed ($added) — evidence carries TIMEOUT CHANGED: with the measured reason" "$added"
  else line FAIL "timeout literals added/raised with no TIMEOUT CHANGED: section" "$added"; git -C "$R" diff "$range" -- tests vitest.config.ts | grep -E '^\+' | grep -E 'testTimeout|hookTimeout|_000' | head -5 | sed 's/^/      /'; fi
  add=$(git -C "$R" log --format=%h -1 --diff-filter=A -- "$Q/CHECK-B44-2026-09-16.sh")
  if [ -z "$add" ]; then line PASS "ruler changed inside the range" "n/a — ruler not yet in git"
  else eq "ruler changed inside the range (adding commit $add excepted)" "$(git -C "$R" log --format=%h "$range" -- "$Q/CHECK-B44-2026-09-16.sh" | grep -v -c "^$add")" "0"; fi
  ;;
run)
  echo "== B44 RUN — one whole-suite run ($(date +%H:%M:%S))"
  # Two suites on the one construction database interfere by design (vitest.config.ts:94-96 says so about files;
  # it is truer still about sessions). A run that overlaps another session's run measures the overlap, not the code.
  others=$(pgrep -f 'vitest' | grep -v "^$$\$" | wc -l)
  eq  "other vitest processes on this machine before the run" "$others" "0"
  [ "$others" = 0 ] || { echo "      refusing to run: another suite is in flight — wait for it, then run again"; echo; echo "CHECK B44 [$mode]: FAIL ($fails)"; exit 1; }
  start=$(date +%s); pnpm -C "$R" test > "$SCRATCH/vitest.log" 2>&1; rc=$?; dur=$(( $(date +%s) - start ))
  summary=$(grep -E '^ *Test Files' "$SCRATCH/vitest.log" | tail -1 | sed 's/^ *//')
  timeouts=$(grep -c 'Test timed out' "$SCRATCH/vitest.log")
  failing=$(grep -E '^ *(FAIL|❯) +tests/' "$SCRATCH/vitest.log" | grep -o 'tests/[^ :]*\.test\.tsx\?' | sort -u)
  extra=""; for f in $failing; do case " $CONSTANT_REDS " in *" $f "*) ;; *) extra="$extra $f";; esac; done
  echo "      $summary · ${dur}s · exit $rc"
  eq  "'Test timed out' occurrences in the whole suite" "$timeouts" "0"
  eq  "reds outside the five constant reds" "$(printf '%s' "$extra" | wc -w)" "0"; [ -z "$extra" ] || echo "      extra:$extra"
  for f in $failing; do echo "      red $f"; done
  grep -E 'Test timed out' -B2 "$SCRATCH/vitest.log" | grep -o 'tests/[^ :]*' | sort -u | sed 's/^/      timed out in: /'
  echo "      RUN LINE FOR THE EVIDENCE: RUN n: $summary · timed out: $timeouts · $(date +%Y-%m-%d\ %H:%M)"
  ;;
alone)
  echo "== B44 ALONE — the two members by themselves"
  for f in tests/phase4/velocity.test.ts tests/r31/voice-line.test.ts; do
    s=$(date +%s); pnpm -C "$R" exec vitest run "$f" > "$SCRATCH/alone.log" 2>&1; rc=$?; d=$(( $(date +%s) - s ))
    eq "$f alone" "$(grep -E '^ *Test Files' "$SCRATCH/alone.log" | tail -1 | sed 's/^ *//') · ${d}s" "$(grep -E '^ *Test Files' "$SCRATCH/alone.log" | tail -1 | sed 's/^ *//') · ${d}s"
    [ $rc = 0 ] || { line FAIL "$f alone exit code" "$rc"; grep -E 'FAIL|timed out' "$SCRATCH/alone.log" | head -3 | sed 's/^/      /'; }
  done
  ;;
battery)
  exec bash "$W15" battery
  ;;
*) echo "usage: $0 {baseline|b44|guard <hash|range>|run|alone|battery}"; exit 2;;
esac
rm -rf "$SCRATCH"
echo; if [ "$fails" -eq 0 ]; then echo "CHECK B44 [$mode]: PASS"; exit 0; else echo "CHECK B44 [$mode]: FAIL ($fails)"; exit 1; fi
