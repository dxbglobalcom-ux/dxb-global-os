#!/usr/bin/env bash
# THE PERSONA RULER at the shell — the same metre the vitest case runs, for a human or a session.
#
# This file is a RUNNER, not a second ruler: every rule, every threshold and every message comes
# from tests/personas/persona-ruler.ts, which node executes directly (type stripping, node ≥ 22.18).
# The CEO's ruling of 2026-09-15 is the reason it exists — an audit's metre is a runnable script,
# handed to the builder BEFORE the work, and builder and checker run the same script.
#
# Usage:
#   scripts/persona-ruler.sh                        # the whole contract (the 16 studio seats)
#   scripts/persona-ruler.sh personas/a/b.md …      # only the named files
#   scripts/persona-ruler.sh --verdicts …           # the table, plus one RULER-VERDICT line per file
# Exit: 0 when every measured file passes, 1 on any FAIL.
set -euo pipefail
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec node --no-warnings "$REPO_DIR/tests/personas/persona-ruler.ts" "$@"
