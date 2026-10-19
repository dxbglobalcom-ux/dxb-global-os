#!/usr/bin/env bash
# In a dxb-team2 plan job two writers write the same plan independently — the lead (the session itself)
# and Fable at max effort in a SEPARATE process — and Sol audits both blind as "A" and "B" (CEO 2026-10-19).
# "They did not look at each other" is proven by tool and record, not by promise (Sol's A1-A3 and B3 on
# 5af736bf, fixed 2026-10-19):
#  - FABLE SEES THE BRIEF AND HEAD, NOTHING ELSE. It runs inside bwrap: /tmp (the lead's scratchpad),
#    /var/tmp, /dev/shm, the runtime dir and the whole home are empty tmpfs; inside the home only a
#    `git archive` of HEAD (no .git, so no git status and nothing uncommitted), a minimal ~/.claude.json
#    (account and onboarding only) and the credentials file are put back. No live tree, no transcripts,
#    no auto-memory, no global CLAUDE.md, no claude-mem, no Desktop; a fresh /proc and a cleared
#    environment. HEAD's own .claude/CLAUDE.md is a shared, committed input and stays. Measured
#    2026-10-19: from inside the box a shell finds the lead's scratchpad, the Desktop and the live tree
#    "No such file or directory". Reading tools only, hooks off, no MCP server — and the deny rules
#    stay as a second belt.
#  - THE LEAD CANNOT READ FABLE'S OUTPUT UNSEEN. The two share a Unix user, so no permission can stop
#    the lead; second-plan-watch.py holds an inotify watch on the output's inode from before Fable
#    starts, and `reveal` refuses when anything read it, or when the watcher is gone. Fable's end time,
#    exit code and hash go into SEALS.log the moment it ends, computed from the stream, not the file.
#  - SOL SEES THE BRIEF, "A" AND "B", NOTHING THAT NAMES THEM. `blind` writes those three into
#    <job>/blind/; the key, the originals and SEALS.log stay in <job>/sealed/, and `audit` runs
#    refuter.sh with sealed/, /tmp, ~/.claude, ~/.claude-mem, the Desktop and the runtime dir denied.
#  - every later step re-verifies the hashes it was sealed with; `sign` records the signed plan's time.
# Usage: second-plan.sh start <job> <brief-file> | seal <job> <lead-plan-file> | reveal <job>
#                       | blind <job> [--reviewed] | audit <job> <sol-brief-file> [medium|high|xhigh]
#                       | sign <job> <final-plan-file> | status <job>      (<job> is an absolute folder path)
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CLAUDE="${DXB_CLAUDE_BIN:-/home/dxb/.local/bin/claude}"
WATCH="$REPO/scripts/governance/second-plan-watch.py"
REFUTER="${DXB_REFUTER_BIN:-$REPO/scripts/governance/refuter.sh}"
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
    brief="${3:-}"
    [ -f "$brief" ] || die "no brief file: $brief"
    command -v bwrap >/dev/null || die "bwrap is missing; without it Fable is not walled off"
    mkdir -p "$job"
    mkdir "$SEALED" 2>/dev/null || die "already started: $SEALED exists"
    cp "$brief" "$SEALED/brief.md"
    log "brief sha256=$(sha "$SEALED/brief.md")"
    settings="{\"disableAllHooks\":true,\"permissions\":{\"deny\":[\"Read(//tmp/**)\",\"Read(/$job/**)\",\"Read(//home/dxb/.claude/**)\",\"Read(//home/dxb/.claude-mem/**)\"]}}"
    printf '%s' "$settings" >"$SEALED/fable.settings.json"
    # the box: HEAD without .git, and an account-only config
    box="$(mktemp -d "${XDG_CACHE_HOME:-$HOME/.cache}/dxb-second-plan.XXXXXX")"
    echo "$box" >"$SEALED/box.path"
    mkdir "$box/tree"
    git -C "$REPO" archive HEAD | tar -x -C "$box/tree"
    python3 -c '
import json, sys
d = json.load(open(sys.argv[1]))
json.dump({k: d[k] for k in ("oauthAccount", "userID", "hasCompletedOnboarding", "machineID", "installMethod") if k in d},
          open(sys.argv[2], "w"))' "$HOME/.claude.json" "$box/claude.json" 2>/dev/null || echo '{}' >"$box/claude.json"
    log "box HEAD=$(git -C "$REPO" rev-parse HEAD)"
    # the output waits in a private tmpfs folder no indexer or editor scans — measured 2026-10-19, the
    # first real run's fable.raw inside the repository was opened once by some program the instant it
    # was created, which voided the job — and the watch stands on its inode before Fable writes a byte
    raw="$(mktemp -d "${XDG_RUNTIME_DIR:-/run/user/$(id -u)}/dxb-second-plan.XXXXXX")/fable.raw"
    echo "$raw" >"$SEALED/raw.path"
    : >"$raw"
    setsid nohup python3 "$WATCH" "$SEALED/WATCH.log" "$raw" </dev/null >/dev/null 2>"$SEALED/watch.err" &
    echo $! >"$SEALED/watch.pid"
    for _ in $(seq 100); do grep -q WATCHING "$SEALED/WATCH.log" 2>/dev/null && break; sleep 0.05; done
    grep -q WATCHING "$SEALED/WATCH.log" 2>/dev/null || die "the watcher did not start: $(cat "$SEALED/watch.err")"
    # detached through this script's own _run, never through a `bash -c` whose command line names "mcp":
    # measured 2026-10-19, the freeze guard (scripts/ops/freeze-guard.sh) killed that detached wrapper and
    # Fable with it at once — a parentless process whose arguments match "mcp" is a widow to it. _run's
    # arguments do not, and it stays alive as Fable's parent and session leader.
    log "fable started"
    setsid nohup bash "${BASH_SOURCE[0]}" _run "$job" </dev/null >/dev/null 2>&1 &
    echo "SECOND_PLAN_STARTED $(now)"
    ;;
  _run)
    box="$(cat "$SEALED/box.path")"
    bin="$(readlink -f "$CLAUDE")"
    uid="$(id -u)"
    wall=(--dev-bind / / --tmpfs /tmp --tmpfs /var/tmp --tmpfs /dev/shm --tmpfs "/run/user/$uid" --tmpfs "$HOME"
      --ro-bind "$bin" "$bin"
      --dir "$HOME/.claude" --bind "$HOME/.claude/.credentials.json" "$HOME/.claude/.credentials.json"
      --bind "$box/claude.json" "$HOME/.claude.json"
      --ro-bind "$box/tree" "$HOME/work" --chdir "$HOME/work"
      --unshare-pid --proc /proc --die-with-parent
      --clearenv --setenv HOME "$HOME" --setenv USER "$(id -un)" --setenv PATH /usr/local/bin:/usr/bin:/bin
      --setenv LANG "${LANG:-C.UTF-8}")
    # tests only: a stub's own folder, so it can be held and released
    [ -z "${DXB_SECOND_PLAN_TEST_BIND:-}" ] || wall+=(--bind "$DXB_SECOND_PLAN_TEST_BIND" "$DXB_SECOND_PLAN_TEST_BIND"
      --setenv STUB_EXIT "${STUB_EXIT:-0}")
    set +e
    # the hash comes from the stream itself, so taking it never opens the watched file for reading
    h="$( { bwrap "${wall[@]}" -- "$bin" -p --model fable --effort max --no-session-persistence --tools "Read,Grep,Glob" \
            --strict-mcp-config --mcp-config '{"mcpServers":{}}' --settings "$(cat "$SEALED/fable.settings.json")" \
            <"$SEALED/brief.md" 2>"$SEALED/fable.err"
          echo $? >"$SEALED/fable.exit.tmp"; } | tee "$(cat "$SEALED/raw.path")" | sha256sum | cut -d' ' -f1 )"
    set -e
    rc="$(cat "$SEALED/fable.exit.tmp")"
    log "fable ended exit=$rc sha256=$h"
    rm -rf "$box"
    mv "$SEALED/fable.exit.tmp" "$SEALED/fable.exit"
    ;;
  seal)
    plan="${3:-}"
    [ -d "$SEALED" ] || die "not started: $SEALED is missing"
    [ -f "$plan" ] || die "no lead plan file: $plan"
    [ ! -e "$SEALED/opus.plan.md" ] || die "the lead's plan is already sealed"
    [ ! -e "$SEALED/fable.plan.md" ] || die "Fable's plan is already revealed; the lead's seal must come first"
    cp "$plan" "$SEALED/opus.plan.md"
    log "opus sealed sha256=$(sha "$SEALED/opus.plan.md")"
    ;;
  reveal)
    [ -f "$SEALED/opus.plan.md" ] || die "the lead's plan is not sealed yet; seal it before revealing Fable's"
    [ ! -e "$SEALED/fable.plan.md" ] || die "Fable's plan is already revealed"
    [ -f "$SEALED/fable.exit" ] || die "Fable has not ended yet"
    [ "$(cat "$SEALED/fable.exit")" = 0 ] || die "Fable ended with exit $(cat "$SEALED/fable.exit")"
    verify "$SEALED/opus.plan.md" "opus sealed"
    watcher_alive || { log "UNWATCHED: the watcher was gone before reveal"; die "the watcher is gone; nothing proves Fable's output stayed unread — start the job again"; }
    kill "$(cat "$SEALED/watch.pid")"
    for _ in $(seq 100); do grep -q STOPPED "$SEALED/WATCH.log" && break; sleep 0.05; done
    reads="$(grep -vE ' (WATCHING|STOPPED)' "$SEALED/WATCH.log" || true)"
    if [ -n "$reads" ]; then
      log "READ BEFORE REVEAL: $(printf '%s\n' "$reads" | grep -c .) event(s), first: $(printf '%s\n' "$reads" | head -n 1)"
      die "Fable's output was read before reveal — this job's independence is void; start it again:
$reads"
    fi
    log "watch clean until reveal"
    raw="$(cat "$SEALED/raw.path")"
    verify "$raw" "fable ended"
    cp "$raw" "$SEALED/fable.plan.md"
    rm -rf "$(dirname "$raw")"
    log "fable revealed sha256=$(sha "$SEALED/fable.plan.md")"
    echo "$SEALED/fable.plan.md"
    ;;
  blind)
    [ -f "$SEALED/opus.plan.md" ] && [ -f "$SEALED/fable.plan.md" ] || die "both plans must be sealed and revealed first"
    [ ! -e "$SEALED/key.md" ] || die "already blinded: $SEALED/key.md exists"
    verify "$SEALED/opus.plan.md" "opus sealed"
    verify "$SEALED/fable.plan.md" "fable revealed"
    # a plan about the holding may name models as its subject; the lead reads every hit, and --reviewed
    # records that none of them says who wrote the plan
    hits="$(grep -o -n -i -w -E "$TELLTALE" "$SEALED/opus.plan.md" "$SEALED/fable.plan.md" || true)"
    if [ -n "$hits" ] && [ "${3:-}" != "--reviewed" ]; then
      die "a plan names a model or an effort level; read each hit; when none tells who wrote the plan, rerun with --reviewed:
$hits"
    fi
    [ -z "$hits" ] || log "blind hits reviewed by the lead: $(printf '%s\n' "$hits" | wc -l)"
    if (( RANDOM % 2 )); then a=opus; b=fable; else a=fable; b=opus; fi
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
    if [ -f "$SEALED/fable.exit" ]; then echo "fable: ended, exit $(cat "$SEALED/fable.exit")"
    else echo "fable: still running"; fi
    if watcher_alive; then echo "watcher: alive"; else echo "watcher: not running"; fi
    echo "--- SEALS.log"
    cat "$LOG"
    ;;
  *) die "unknown subcommand: $cmd" ;;
esac
