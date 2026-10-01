#!/usr/bin/env bash
# The only door to the audit twin (U36) — a Codex session that CANNOT write.
#
# WHY (CEO order 2026-08-16). `.claude/skills/dxb-verify` has always said the
# auditor is "read-only BY TOOL, never by promise". Measured that night, the
# tool said otherwise: both Codex homes ran at sandbox_mode = "danger-full-
# access" with approval_policy = "never", so the refuter could edit the very
# repository it was auditing. The base config was left alone — it serves the
# CEO's other projects — and the read-only setting lives in a profile instead.
# A profile only protects you if it is actually passed, so this script exists
# to be the one way the refuter is launched. Never call `codex` directly for an
# audit.
#
# The auditor is gpt-6.1-sol (CEO 2026-10-01, after the auditor exam; gpt-6-sol
# before it); its effort is routed from the job's score card.
#
# Usage:
#   scripts/governance/refuter.sh --card CARD.md "<claim + where to measure it>"          # effort from the card
#   scripts/governance/refuter.sh --card CARD.md --effort xhigh "<claim + where …>"       # raise it, never lower
#   scripts/governance/refuter.sh --proof                                                 # prove it cannot write
#   scripts/governance/refuter.sh --install-profile                                       # copy the tracked profile into ~/.codex
#
# THE SCORE CARD GATE (CEO 2026-10-01, "tmm makineyi de kur"). No audit starts
# without the job's score card: scripts/governance/audit-card.mjs reads it,
# checks the card's range is real and non-empty, sets the effort
# (light medium · normal high · critical xhigh), refuses an --effort beneath it,
# and puts the card in front of Sol so it can challenge the grading. There is no
# silent `high` default any more. Each launch is logged to
# ~/.local/state/dxb/audit-cards.log (the class budgets are measured from it).
#
# THE AUDITOR'S OWN HAND (dxb-team2 job 1, CEO 2026-09-28 "önerin tmm"). The
# profile starts one MCP server, `dxbdb`, whose one tool `sql_read` runs a
# read-only query on the CONSTRUCTION engine as `sol_reader` — so Sol gathers
# database evidence itself instead of receiving the author's output. Read
# scripts/governance/sol-db-mcp.mjs before trusting it. Never the company.
#
# Hand it a CLAIM and WHERE TO MEASURE IT — never the author's conclusion — and
# tell it to refute. A finding is evidence, never a verdict (dxb-verify).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CALLER_PWD="$PWD"
cd "$ROOT"

PROFILE="refuter"
EFFORT=""
CARD=""
while :; do
  case "${1:-}" in
    --effort)
      case "${2:-}" in
        medium|high|xhigh) EFFORT="$2"; shift 2 ;;
        *) echo "REFUTER_FAIL: --effort takes medium, high or xhigh." >&2; exit 1 ;;
      esac ;;
    --card)
      [ -n "${2:-}" ] || { echo "REFUTER_FAIL: --card takes the path of the job's score card." >&2; exit 1; }
      case "$2" in /*) CARD="$2" ;; *) CARD="$CALLER_PWD/$2" ;; esac
      shift 2 ;;
    *) break ;;
  esac
done

# The gate runs before anything else for an audit, so a refused audit costs nothing.
ROUTE=""
case "${1:-}" in
  --proof|--install-profile) ;;
  *)
    if [ -z "$CARD" ]; then
      echo "REFUTER_FAIL: no score card — an audit starts only with --card <file> (dxb-team2 §3; CEO 2026-10-01)." >&2
      exit 1
    fi
    ROUTE="$(node "$ROOT/scripts/governance/audit-card.mjs" check "$CARD" ${EFFORT:+--effort "$EFFORT"})" || exit 1
    EFFORT="$(printf '%s' "$ROUTE" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).effort))')"

    # What may follow the card: an ALLOW-LIST of `codex exec` options and exactly one prompt (or
    # "-" for stdin). Anything else is refused, because a forwarded -c/--config, -s/--sandbox,
    # -m/--model, -p/--profile, --enable or --dangerously-* would override what the gate and the
    # profile just fixed — the effort, the sandbox, the model, the MCP inventory (Sol's audit of
    # this gate, 2026-10-01: A1 and its C).
    OPTS=()
    PROMPT_ARG=""
    HAVE_PROMPT=0
    set -- "$@"
    while [ $# -gt 0 ]; do
      case "$1" in
        --skip-git-repo-check|--ephemeral|--json) OPTS+=("$1"); shift ;;
        -C|--cd|--color|-o|--output-last-message|--output-schema|-i|--image)
          [ $# -ge 2 ] || { echo "REFUTER_FAIL: $1 takes a value." >&2; exit 1; }
          # Forwarded bound as --long=value, so Codex can never read the value as an option of
          # its own (Sol's re-check: `-o --config=…` reached Codex as a --config).
          case "$1" in -C) long=--cd ;; -o) long=--output-last-message ;; -i) long=--image ;; *) long="$1" ;; esac
          OPTS+=("$long=$2"); shift 2 ;;
        --cd=*|--color=*|--output-last-message=*|--output-schema=*|--image=*) OPTS+=("$1"); shift ;;
        -C?*|-o?*|-i?*)   # attached short forms: -C/tmp, -C=/tmp, -ofile, -o=file, -ix.png
          case "$1" in -C*) long=--cd ;; -o*) long=--output-last-message ;; -i*) long=--image ;; esac
          v="${1:2}"; v="${v#=}"
          OPTS+=("$long=$v"); shift ;;
        --) [ $# -ge 2 ] && [ "$HAVE_PROMPT" -eq 0 ] || { echo "REFUTER_FAIL: '--' must be followed by the one prompt." >&2; exit 1; }
            PROMPT_ARG="$2"; HAVE_PROMPT=1; shift 2
            [ $# -eq 0 ] || { echo "REFUTER_FAIL: nothing may follow the prompt after '--'." >&2; exit 1; } ;;
        -) [ "$HAVE_PROMPT" -eq 0 ] || { echo "REFUTER_FAIL: more than one prompt given (an -i takes one file; repeat -i for more)." >&2; exit 1; }
           PROMPT_ARG="-"; HAVE_PROMPT=1; shift ;;
        -*) echo "REFUTER_FAIL: '$1' is not passed to the auditor — only -C/--cd, --skip-git-repo-check, --ephemeral, --json, --color, -o/--output-last-message, --output-schema and -i/--image (one file per -i; repeat it for more) are; the effort, model, sandbox and servers are fixed by the card and the profile." >&2
            exit 1 ;;
        *) [ "$HAVE_PROMPT" -eq 0 ] || { echo "REFUTER_FAIL: more than one prompt given (an -i takes one file; repeat -i for more)." >&2; exit 1; }
           PROMPT_ARG="$1"; HAVE_PROMPT=1; shift ;;
      esac
    done
    [ "$HAVE_PROMPT" -eq 1 ] || { echo "REFUTER_FAIL: give the auditor a claim and where to measure it." >&2; exit 1; }
    ;;
esac

HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
INSTALLED="$HOME_DIR/$PROFILE.config.toml"
SOURCE="$ROOT/scripts/governance/codex-refuter.config.toml"
TOOL="$ROOT/scripts/governance/sol-db-mcp.mjs"

# The profile's one tracked copy is in the repository; the installed one must be
# byte-identical, so what an audit ran under is always readable in git.
if [ "${1:-}" = "--install-profile" ]; then
  mkdir -p "$HOME_DIR"
  install -m 600 "$SOURCE" "$INSTALLED"
  echo "REFUTER_PROFILE_INSTALLED $INSTALLED sha256=$(sha256sum "$INSTALLED" | cut -c1-16)"
  exit 0
fi
if [ ! -f "$INSTALLED" ]; then
  echo "REFUTER_FAIL: $INSTALLED is missing — the read-only profile is not installed in this Codex home (refuter.sh --install-profile)." >&2
  exit 1
fi
if ! cmp -s "$SOURCE" "$INSTALLED"; then
  echo "REFUTER_FAIL: $INSTALLED differs from $SOURCE — an audit never runs under an untracked profile (refuter.sh --install-profile)." >&2
  exit 1
fi
if ! grep -q '^sandbox_mode *= *"read-only"' "$INSTALLED"; then
  echo "REFUTER_FAIL: $INSTALLED no longer pins sandbox_mode = \"read-only\"." >&2
  exit 1
fi

# The engine lock variable belongs to the battery's own children; Sol's tool must
# never inherit it, or it would stop yielding the bench to a running battery.
unset DXB_ENGINE_LOCK_HELD

# THE INVENTORY (dxb-team2 job 1, R6). An MCP server runs OUTSIDE the command
# sandbox, so the refuter may start with exactly one enabled: dxbdb. Measured on
# every launch from Codex itself, not from this file's reading of the profile.
inventory() {
  codex -p "$PROFILE" "$@" mcp list --json 2>/dev/null | node -e '
    let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => {
      const on = JSON.parse(s).filter((x) => x.enabled).map((x) => x.name).sort();
      console.log(on.join(","));
    });'
}
ENABLED="$(inventory)" || ENABLED="<codex mcp list failed>"
if [ "$ENABLED" != "dxbdb" ]; then
  echo "REFUTER_FAIL: the refuter profile enables [$ENABLED]; only [dxbdb] may run outside the sandbox." >&2
  exit 1
fi

# THE REACH. The tool is registered only while the construction engine answers;
# otherwise the server is switched off and the audit runs without it.
PROBE_PORT="${DXB_SOL_PROBE_PORT:-54422}"   # override only to prove the "absent" path
REACH=(-c "mcp_servers.dxbdb.enabled=false")
if timeout 2 bash -c "exec 3<>/dev/tcp/127.0.0.1/$PROBE_PORT" 2>/dev/null; then
  REACH=()
  echo "SOL_DB_REACH=armed engine=127.0.0.1:$PROBE_PORT tool_sha256=$(sha256sum "$TOOL" | cut -c1-16)" >&2
else
  echo "SOL_DB_REACH=absent — nothing answers on 127.0.0.1:$PROBE_PORT; the audit runs without sql_read" >&2
fi

# --proof re-runs the evidence that the auditor cannot write. No model call.
if [ "${1:-}" = "--proof" ]; then
  fail() { echo "REFUTER_FAIL: $*" >&2; exit 1; }

  # 1. a file write from inside the sandbox — the refusal must be the sandbox's,
  #    and the sandbox must demonstrably run (a codex that failed to start would
  #    also leave no file behind; that was the old `|| true` hole).
  alive="$(codex -p "$PROFILE" sandbox -- bash -c 'echo SANDBOX_ALIVE' 2>&1)" \
    || fail "codex sandbox did not run: $alive"
  [ "$alive" = "SANDBOX_ALIVE" ] || fail "codex sandbox answered '$alive'"
  probe="$ROOT/.refuter-write-probe.$$"
  set +e
  out="$(codex -p "$PROFILE" sandbox -- bash -c "echo x > '$probe'" 2>&1)"
  rc=$?
  set -e
  if [ -e "$probe" ]; then
    rm -f "$probe"
    fail "the auditor WROTE to the repository under profile '$PROFILE'."
  fi
  [ "$rc" -ne 0 ] || fail "the write attempt exited 0 without a file — not a refusal"
  printf '%s' "$out" | grep -qE 'Read-only file system|Operation not permitted|Permission denied' \
    || fail "the write failed for another reason: $out"
  echo "REFUTER_READONLY_OK profile=$PROFILE home=$HOME_DIR"
  echo "  write refused (exit $rc): $(printf '%s' "$out" | tail -1)"

  # 2. the inventory, as Codex reports it
  echo "  mcp servers enabled: [$ENABLED] · disabled: [$(codex -p "$PROFILE" mcp list --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).filter(x=>!x.enabled).map(x=>x.name).sort().join(",")))')]"

  # 3. three writes through the very tool Codex starts, over its own stdio
  if [ ${#REACH[@]} -eq 0 ]; then
    # Each attempt must be refused for ITS OWN reason, and a read on the same
    # server must first reach an allowed construction identity — so a login
    # failure, a wrong engine or a busy bench can never pass as three refusals
    # (Sol's xhigh audit, 2026-09-28).
    verdicts="$(printf '%s\n' \
      '{"jsonrpc":"2.0","id":0,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"proof","version":"0"}}}' \
      '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"sql_read","arguments":{"query":"select 1 as reached"}}}' \
      '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"sql_read","arguments":{"query":"insert into public.agents default values"}}}' \
      '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"sql_read","arguments":{"query":"with x as (delete from public.agents returning 1) select count(*) from x"}}}' \
      '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"sql_read","arguments":{"query":"select lo_create(0)"}}}' \
      | timeout 60 node "$TOOL" | node -e '
        const allowed = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).allowed
          .map((i) => `${i.sysid}/${i.dboid}/${i.dbname}`);
        const want = { 2: /^REFUSED: only SELECT/, 3: /data-modifying statements in WITH/, 4: /permission denied for function lo_create/ };
        let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => {
          for (const o of s.trim().split("\n").map((l) => JSON.parse(l)).filter((o) => o.id > 0).sort((a, b) => a.id - b.id)) {
            const r = o.result, text = r ? r.content[0].text : JSON.stringify(o);
            if (o.id === 1) {
              let eng = "";
              try { eng = JSON.parse(text).identity.engine; } catch {}
              console.log(r && !r.isError && allowed.includes(eng) ? `DB_REACHED ${eng}` : `DB_NOT_REACHED: ${text}`);
            } else {
              console.log(r && r.isError && want[o.id].test(text) ? `DB_WRITE_REFUSED #${o.id - 1}: ${text}` : `DB_WRITE_NOT_REFUSED #${o.id - 1}: ${text}`);
            }
          }
        });' "$ROOT/tools/hooks/ledger-identity.json")"
    printf '%s\n' "$verdicts" | sed 's/^/  /'
    printf '%s\n' "$verdicts" | grep -q '^DB_REACHED ' || fail "sql_read did not reach an allowed construction engine"
    [ "$(printf '%s\n' "$verdicts" | grep -c '^DB_WRITE_REFUSED')" -eq 3 ] || fail "a write through sql_read was not refused for its own reason"
  else
    echo "  DB writes: not tried — the engine is absent"
  fi
  echo "  tool: $TOOL sha256=$(sha256sum "$TOOL" | cut -d' ' -f1)"
  exit 0
fi

# The card goes in front of the brief (the prompt argument, or stdin for "-").
BLOCK="$(printf '%s' "$ROUTE" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).brief))'; printf x)"
BLOCK="${BLOCK%x}"
if [ "$PROMPT_ARG" = "-" ]; then BRIEF="$(cat; printf x)"; BRIEF="${BRIEF%x}"; else BRIEF="$PROMPT_ARG"; fi
if [ -z "${BRIEF//[[:space:]]/}" ]; then
  echo "REFUTER_FAIL: the brief is empty — give the auditor a claim and where to measure it." >&2
  exit 1
fi
PROMPT="$BLOCK$BRIEF"

LOG_DIR="$HOME/.local/state/dxb"; mkdir -p "$LOG_DIR"
ROUTE_LOG="$(printf '%s' "$ROUTE" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=JSON.parse(s);delete r.brief;console.log(JSON.stringify(r))})')"
CARD_SHA="$(sha256sum "$CARD" | cut -c1-16)"
echo "AUDIT_CARD class=$(printf '%s' "$ROUTE" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=JSON.parse(s);console.log(`${r.class} total=${r.total} effort=${r.effort}`)})')" >&2

# OpenAI can answer "Selected model is at capacity" in the middle of an audit (measured 2026-10-01
# 17:44, one of eight Sol 6.1 runs that day; Codex does not retry it). The CEO: "sol 6.1 normal şekilde
# kullanılması lazım bir hata vermemesi lazım". So the audit is run again, whole and blind, after a
# wait — three times at most — before the door's fallback applies (dxb-team2 §2). Every launch,
# retries included, is one log row (§7's budgets are summed from it).
read -r -a WAITS <<< "${DXB_REFUTER_RETRY_WAITS:-60 180 300}"
WAITS=("${WAITS[@]:0:3}")
ERRF=""; OUTF=""
trap 'rm -f ${ERRF:+"$ERRF"} ${OUTF:+"$OUTF"}' EXIT
ERRF="$(mktemp)"; OUTF="$(mktemp)"
attempt=0
while :; do
  printf '%s\t%s\t%s\t%s\ttry=%s\n' "$(date -Iseconds)" "$CARD_SHA" "$CARD" "$ROUTE_LOG" "$((attempt + 1))" >> "$LOG_DIR/audit-cards.log"
  set +e
  codex -p "$PROFILE" "${REACH[@]}" -c "model_reasoning_effort=\"$EFFORT\"" exec "${OPTS[@]}" -- "$PROMPT" < /dev/null 2> "$ERRF" | tee "$OUTF"
  st=("${PIPESTATUS[@]}")
  set -e
  rc=${st[0]}
  cat "$ERRF" >&2
  if [ "${st[1]}" -ne 0 ]; then
    echo "REFUTER_FAIL: the audit's output could not be captured (tee exit ${st[1]}) — the verdict was not delivered." >&2
    exit 74
  fi
  # Capacity only when Codex failed, delivered no answer on stdout, AND its last diagnostic line on
  # stderr — read past the "tokens used" footer Codex always ends stderr with — is the capacity error.
  # The auditor's answer (stdout) is never read for it: a capacity sentence quoted there decides
  # nothing (Sol, final re-check). --json streams events on stdout, so a --json audit is never retried.
  last="$( (grep -v '^[[:space:]]*$' "$ERRF" || true) | sed -e '$!b' -e '/^[0-9][0-9,]*$/d' | sed -e '$!b' -e '/^tokens used$/d' | tail -n 1)"
  CAPACITY=0
  if [ "$rc" -ne 0 ] && ! grep -q '[^[:space:]]' "$OUTF" && [[ "$last" == "ERROR: Selected model is at capacity"* ]]; then CAPACITY=1; fi
  if [ "$CAPACITY" -eq 1 ] && [ "$attempt" -lt "${#WAITS[@]}" ]; then
    echo "AUDIT_RETRY: the model was at capacity — the whole audit runs again in ${WAITS[$attempt]} s (try $((attempt + 2)) of $(( ${#WAITS[@]} + 1 )))" >&2
    sleep "${WAITS[$attempt]}"
    attempt=$((attempt + 1))
    continue
  fi
  if [ "$CAPACITY" -eq 1 ]; then
    echo "REFUTER_FAIL: the model stayed at capacity after $(( ${#WAITS[@]} + 1 )) tries — apply the door's fallback auditor and record why (dxb-team2 §2)." >&2
    exit 75
  fi
  exit "$rc"
done
