#!/usr/bin/env bash
# In an important or complex dxb-team2 plan job two writers write the same plan independently — the lead
# (the session itself) and a second Opus 5.5 in a SEPARATE process, at max by default or high when the
# lead says so (CEO 2026-11-09; Fable wrote it until then) — and Sol audits both blind as "A" and "B"
# (CEO 2026-10-19). "They did not look at each other" is proven by tool and record, not by promise (Sol's
# A1-A3 and B3 on 5af736bf, fixed 2026-10-19):
#  - THE SECOND WRITER SEES THE BRIEF AND HEAD, NOTHING ELSE: it runs in walled-box.sh's box.
#  - THE LEAD CANNOT READ THE SECOND WRITER'S OUTPUT UNSEEN. The two share a Unix user, so no permission
#    can stop the lead; second-plan-watch.py holds an inotify watch on the output's inode from before the
#    writer starts, and `reveal` refuses when anything read it, or when the watcher is gone. Its end time,
#    exit code and hash go into SEALS.log the moment it ends, computed from the stream, not the file.
#  - A job started before 2026-11-09 names its second writer `fable` (fable.plan.md, "fable ended" in
#    SEALS.log); every step reads it under that name.
#  - SOL SEES THE BRIEF, "A" AND "B", NOTHING THAT NAMES THEM. `blind` writes those three into
#    <job>/blind/; the key, the originals and SEALS.log stay in <job>/sealed/, and `audit` runs
#    refuter.sh with sealed/, /tmp, ~/.claude, ~/.claude-mem, the Desktop and the runtime dir denied.
#  - every later step re-verifies the hashes it was sealed with; `sign` records the signed plan's time.
# Usage: second-plan.sh start <job> <brief-file> [high|max] | seal <job> <lead-plan-file> | reveal <job>
#                       | blind <job> [--reviewed] | audit <job> <sol-brief-file> [medium|high|xhigh]
#                       | sign <job> <final-plan-file> | status <job>      (<job> is an absolute folder path)
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CLAUDE="${DXB_CLAUDE_BIN:-/home/dxb/.local/bin/claude}"
WATCH="$REPO/scripts/governance/second-plan-watch.py"
REFUTER="${DXB_REFUTER_BIN:-$REPO/scripts/governance/refuter.sh}"
MODEL=claude-opus-5-5
# shellcheck source=walled-box.sh
. "$REPO/scripts/governance/walled-box.sh"
# the words that would tell Sol who wrote a plan: a model or an effort level, matched as whole words
TELLTALE='max|xhigh|opus|fable|sonnet|sol|gpt|claude'

die() { echo "second-plan: $*" >&2; exit 1; }
now() { date -Iseconds; }
sha() { sha256sum "$1" | cut -d' ' -f1; }

cmd="${1:-}"; job="${2:-}"
[ -n "$cmd" ] && [ -n "$job" ] || die "usage: second-plan.sh start|seal|reveal|blind|audit|sign|status <job> [file]"
[[ "$job" == /* ]] || die "the job folder must be an absolute path: $job"
SEALED="$job/sealed"
VIEW="$job/blind"
LOG="$SEALED/SEALS.log"
log() { echo "$(now) $*" >>"$LOG"; }
# the second writer's name in file names and log lines: `fable` in a job Fable started, `second` since
WRITER=second
if grep -q ' fable started$' "$LOG" 2>/dev/null; then WRITER=fable; fi
# the hash a file was sealed with: the last "<what> … sha256=<h>" line of SEALS.log
sealed_sha() { grep -E " $1 .*sha256=" "$LOG" | tail -n 1 | sed -E 's/.*sha256=([0-9a-f]{64}).*/\1/'; }
verify() { # verify <file> <what>
  local want; want="$(sealed_sha "$2")"
  [ -n "$want" ] || die "SEALS.log holds no hash for $2"
  [ "$(sha "$1")" = "$want" ] || { log "TAMPERED $2"; die "$1 no longer matches the hash it was sealed with ($2)"; }
}
watcher_alive() {
  local pid; pid="$(cat "$SEALED/watch.pid" 2>/dev/null)" || return 1
  grep -qa second-plan-watch "/proc/$pid/cmdline" 2>/dev/null
}

case "$cmd" in
  start)
    brief="${3:-}"; effort="${4:-max}"
    [ -f "$brief" ] || die "no brief file: $brief"
    case "$effort" in high|max) ;; *) die "the second writer's effort is high or max, not: $effort" ;; esac
    mkdir -p "$job"
    mkdir "$SEALED" 2>/dev/null || die "already started: $SEALED exists"
    cp "$brief" "$SEALED/brief.md"
    log "brief sha256=$(sha "$SEALED/brief.md")"
    settings="{\"disableAllHooks\":true,\"permissions\":{\"deny\":[\"Read(//tmp/**)\",\"Read(/$job/**)\",\"Read(//home/dxb/.claude/**)\",\"Read(//home/dxb/.claude-mem/**)\"]}}"
    printf '%s' "$settings" >"$SEALED/$WRITER.settings.json"
    box="$(box_make second-plan)" || die "the box could not be made"
    echo "$box" >"$SEALED/box.path"
    log "box HEAD=$(git -C "$REPO" rev-parse HEAD)"
    # the output waits in a private tmpfs folder no indexer or editor scans — measured 2026-10-19, the
    # first real run's fable.raw inside the repository was opened once by some program the instant it
    # was created, which voided the job — and the watch stands on its inode before the writer writes a byte
    raw="$(mktemp -d "${XDG_RUNTIME_DIR:-/run/user/$(id -u)}/dxb-second-plan.XXXXXX")/$WRITER.raw"
    echo "$raw" >"$SEALED/raw.path"
    : >"$raw"
    setsid nohup python3 "$WATCH" "$SEALED/WATCH.log" "$raw" </dev/null >/dev/null 2>"$SEALED/watch.err" &
    echo $! >"$SEALED/watch.pid"
    for _ in $(seq 100); do grep -q WATCHING "$SEALED/WATCH.log" 2>/dev/null && break; sleep 0.05; done
    grep -q WATCHING "$SEALED/WATCH.log" 2>/dev/null || die "the watcher did not start: $(cat "$SEALED/watch.err")"
    # detached through this script's own _run, never through a `bash -c` whose command line names "mcp":
    # measured 2026-10-19, the freeze guard (scripts/ops/freeze-guard.sh) killed that detached wrapper and
    # the writer with it at once — a parentless process whose arguments match "mcp" is a widow to it. _run's
    # arguments do not, and it stays alive as the writer's parent and session leader.
    log "$WRITER started model=$MODEL effort=$effort"
    setsid nohup bash "${BASH_SOURCE[0]}" _run "$job" "$effort" </dev/null >/dev/null 2>&1 &
    echo "SECOND_PLAN_STARTED $(now)"
    ;;
  _run)
    box="$(cat "$SEALED/box.path")"
    set +e
    # the hash comes from the stream itself, so taking it never opens the watched file for reading
    h="$( { box_run "$box" "$MODEL" "$3" "$(cat "$SEALED/$WRITER.settings.json")" <"$SEALED/brief.md" 2>"$SEALED/$WRITER.err"
          echo $? >"$SEALED/$WRITER.exit.tmp"; } | tee "$(cat "$SEALED/raw.path")" | sha256sum | cut -d' ' -f1 )"
    set -e
    rc="$(cat "$SEALED/$WRITER.exit.tmp")"
    log "$WRITER ended exit=$rc sha256=$h"
    rm -rf "$box"
    mv "$SEALED/$WRITER.exit.tmp" "$SEALED/$WRITER.exit"
    ;;
  seal)
    plan="${3:-}"
    [ -d "$SEALED" ] || die "not started: $SEALED is missing"
    [ -f "$plan" ] || die "no lead plan file: $plan"
    [ ! -e "$SEALED/opus.plan.md" ] || die "the lead's plan is already sealed"
    [ ! -e "$SEALED/$WRITER.plan.md" ] || die "the second writer's plan is already revealed; the lead's seal must come first"
    cp "$plan" "$SEALED/opus.plan.md"
    log "opus sealed sha256=$(sha "$SEALED/opus.plan.md")"
    ;;
  reveal)
    [ -f "$SEALED/opus.plan.md" ] || die "the lead's plan is not sealed yet; seal it before revealing the second writer's"
    [ ! -e "$SEALED/$WRITER.plan.md" ] || die "the second writer's plan is already revealed"
    [ -f "$SEALED/$WRITER.exit" ] || die "the second writer has not ended yet"
    [ "$(cat "$SEALED/$WRITER.exit")" = 0 ] || die "the second writer ended with exit $(cat "$SEALED/$WRITER.exit")"
    verify "$SEALED/opus.plan.md" "opus sealed"
    watcher_alive || { log "UNWATCHED: the watcher was gone before reveal"; die "the watcher is gone; nothing proves the second writer's output stayed unread — start the job again"; }
    kill "$(cat "$SEALED/watch.pid")"
    for _ in $(seq 100); do grep -q STOPPED "$SEALED/WATCH.log" && break; sleep 0.05; done
    reads="$(grep -vE ' (WATCHING|STOPPED)' "$SEALED/WATCH.log" || true)"
    if [ -n "$reads" ]; then
      log "READ BEFORE REVEAL: $(printf '%s\n' "$reads" | grep -c .) event(s), first: $(printf '%s\n' "$reads" | head -n 1)"
      die "the second writer's output was read before reveal — this job's independence is void; start it again:
$reads"
    fi
    log "watch clean until reveal"
    raw="$(cat "$SEALED/raw.path")"
    verify "$raw" "$WRITER ended"
    cp "$raw" "$SEALED/$WRITER.plan.md"
    rm -rf "$(dirname "$raw")"
    log "$WRITER revealed sha256=$(sha "$SEALED/$WRITER.plan.md")"
    echo "$SEALED/$WRITER.plan.md"
    ;;
  blind)
    [ -f "$SEALED/opus.plan.md" ] && [ -f "$SEALED/$WRITER.plan.md" ] || die "both plans must be sealed and revealed first"
    [ ! -e "$SEALED/key.md" ] || die "already blinded: $SEALED/key.md exists"
    verify "$SEALED/opus.plan.md" "opus sealed"
    verify "$SEALED/$WRITER.plan.md" "$WRITER revealed"
    # a plan about the holding may name models as its subject; the lead reads every hit, and --reviewed
    # records that none of them says who wrote the plan
    hits="$(grep -o -n -i -w -E "$TELLTALE" "$SEALED/opus.plan.md" "$SEALED/$WRITER.plan.md" || true)"
    if [ -n "$hits" ] && [ "${3:-}" != "--reviewed" ]; then
      die "a plan names a model or an effort level; read each hit; when none tells who wrote the plan, rerun with --reviewed:
$hits"
    fi
    [ -z "$hits" ] || log "blind hits reviewed by the lead: $(printf '%s\n' "$hits" | wc -l)"
    if (( RANDOM % 2 )); then a=opus; b=$WRITER; else a=$WRITER; b=opus; fi
    mkdir -p "$VIEW"
    cp "$SEALED/brief.md" "$VIEW/brief.md"
    cp "$SEALED/$a.plan.md" "$VIEW/A.md"
    cp "$SEALED/$b.plan.md" "$VIEW/B.md"
    # the key stays in sealed/, which the audit cannot read
    printf 'A = %s\nB = %s\n' "$a" "$b" >"$SEALED/key.md"
    log "blind A=$a B=$b"
    echo "$VIEW"
    ;;
  audit)
    solbrief="${3:-}"; effort="${4:-high}"
    [ -f "$solbrief" ] || die "no brief for Sol: $solbrief"
    [ -f "$SEALED/key.md" ] || die "not blinded yet"
    [ ! -e "$job/sol-plan.raw" ] || die "already audited: $job/sol-plan.raw exists"
    deny=("$SEALED" /tmp /var/tmp "/run/user/$(id -u)" "$HOME/.claude" "$HOME/.claude-mem" "$HOME/Desktop")
    args=(--effort "$effort")
    for d in "${deny[@]}"; do args+=(--deny-read "$d"); done
    log "sol started effort=$effort"
    set +e
    "$REFUTER" "${args[@]}" -C "$REPO" -- "$(cat "$solbrief")" >"$job/sol-plan.raw" 2>"$job/sol-plan.err"
    rc=$?
    set -e
    echo "EXIT=$rc" >>"$job/sol-plan.raw"
    log "sol ended exit=$rc"
    exit "$rc"
    ;;
  sign)
    plan="${3:-}"
    [ -f "$plan" ] || die "no final plan file: $plan"
    grep -q ' sol ended exit=0' "$LOG" || die "Sol's audit has not ended well; the plan is not signed without it"
    cp "$plan" "$job/plan.signed.md"
    log "signed sha256=$(sha "$job/plan.signed.md")"
    ;;
  status)
    [ -d "$SEALED" ] || die "not started: $SEALED is missing"
    ls -l "$SEALED"
    if [ -f "$SEALED/$WRITER.exit" ]; then echo "$WRITER: ended, exit $(cat "$SEALED/$WRITER.exit")"
    else echo "$WRITER: still running"; fi
    if watcher_alive; then echo "watcher: alive"; else echo "watcher: not running"; fi
    echo "--- SEALS.log"
    cat "$LOG"
    ;;
  *) die "unknown subcommand: $cmd" ;;
esac
