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
# The CEO named two refuter modes: gpt-5.6-sol at high, and gpt-5.5 at xhigh.
#
# Usage:
#   scripts/governance/refuter.sh "<claim + where to measure it>"      # 5.6 high
#   scripts/governance/refuter.sh --55 "<claim + where to measure it>" # 5.5 xhigh
#   scripts/governance/refuter.sh --proof                              # prove it cannot write
#
# Hand it a CLAIM and WHERE TO MEASURE IT — never the author's conclusion — and
# tell it to refute. A finding is evidence, never a verdict (dxb-verify).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

PROFILE="refuter"
if [ "${1:-}" = "--55" ]; then PROFILE="refuter55"; shift; fi

HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
if [ ! -f "$HOME_DIR/$PROFILE.config.toml" ]; then
  echo "REFUTER_FAIL: $HOME_DIR/$PROFILE.config.toml is missing — the read-only profile is not installed in this Codex home." >&2
  exit 1
fi
if ! grep -q '^sandbox_mode *= *"read-only"' "$HOME_DIR/$PROFILE.config.toml"; then
  echo "REFUTER_FAIL: $HOME_DIR/$PROFILE.config.toml no longer pins sandbox_mode = \"read-only\"." >&2
  exit 1
fi

# --proof re-runs the evidence that the auditor cannot write. Cheap, no model call.
if [ "${1:-}" = "--proof" ]; then
  probe="$ROOT/.refuter-write-probe.$$"
  out="$(codex -p "$PROFILE" sandbox -- bash -c "echo x > '$probe'" 2>&1 || true)"
  if [ -e "$probe" ]; then
    rm -f "$probe"
    echo "REFUTER_FAIL: the auditor WROTE to the repository under profile '$PROFILE'." >&2
    exit 1
  fi
  echo "REFUTER_READONLY_OK profile=$PROFILE home=$HOME_DIR"
  echo "  write refused: $(printf '%s' "$out" | tail -1)"
  exit 0
fi

if [ $# -eq 0 ]; then
  echo "REFUTER_FAIL: give the auditor a claim and where to measure it." >&2
  exit 1
fi

exec codex -p "$PROFILE" exec "$@"
