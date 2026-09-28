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
# The auditor is gpt-6-sol (CEO 2026-09-28, replacing the gpt-5.6-sol / gpt-5.5
# modes); the lead picks its effort per job from the job's score card.
#
# Usage:
#   scripts/governance/refuter.sh "<claim + where to measure it>"                  # high
#   scripts/governance/refuter.sh --effort xhigh "<claim + where to measure it>"   # medium|high|xhigh
#   scripts/governance/refuter.sh --proof                                          # prove it cannot write
#   scripts/governance/refuter.sh --install-profile                                # copy the tracked profile into ~/.codex
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
cd "$ROOT"

PROFILE="refuter"
EFFORT=""
if [ "${1:-}" = "--effort" ]; then
  case "${2:-}" in
    medium|high|xhigh) EFFORT="$2"; shift 2 ;;
    *) echo "REFUTER_FAIL: --effort takes medium, high or xhigh." >&2; exit 1 ;;
  esac
fi

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
    verdicts="$(printf '%s\n' \
      '{"jsonrpc":"2.0","id":0,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"proof","version":"0"}}}' \
      '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"sql_read","arguments":{"query":"insert into public.agents default values"}}}' \
      '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"sql_read","arguments":{"query":"with x as (delete from public.agents returning 1) select count(*) from x"}}}' \
      '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"sql_read","arguments":{"query":"select lo_create(0)"}}}' \
      | timeout 60 node "$TOOL" | node -e '
        let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => {
          for (const o of s.trim().split("\n").map((l) => JSON.parse(l)).filter((o) => o.id > 0).sort((a, b) => a.id - b.id)) {
            const r = o.result;
            console.log(r && r.isError && !/engine busy/.test(r.content[0].text) ? `DB_WRITE_REFUSED #${o.id}: ${r.content[0].text}` : `DB_WRITE_NOT_REFUSED #${o.id}: ${JSON.stringify(o)}`);
          }
        });')"
    printf '%s\n' "$verdicts" | sed 's/^/  /'
    [ "$(printf '%s\n' "$verdicts" | grep -c '^DB_WRITE_REFUSED')" -eq 3 ] || fail "a write through sql_read was not refused"
  else
    echo "  DB writes: not tried — the engine is absent"
  fi
  echo "  tool: $TOOL sha256=$(sha256sum "$TOOL" | cut -d' ' -f1)"
  exit 0
fi

if [ $# -eq 0 ]; then
  echo "REFUTER_FAIL: give the auditor a claim and where to measure it." >&2
  exit 1
fi

if [ -n "$EFFORT" ]; then
  exec codex -p "$PROFILE" "${REACH[@]}" -c "model_reasoning_effort=\"$EFFORT\"" exec "$@"
fi
exec codex -p "$PROFILE" "${REACH[@]}" exec "$@"
