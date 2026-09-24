#!/usr/bin/env bash
# THE RESEARCH-ENGINE RULER at the shell — the same metre the vitest case runs.
#
# This file is a RUNNER, not a second ruler: every rule, every threshold and every message comes
# from tests/b46/research-ruler.ts, which node executes directly (type stripping, node >= 22.18).
# The CEO's ruling of 2026-09-15 is why it exists — an audit's metre is a runnable script, handed
# to the builder BEFORE the work, and builder and checker run the same script.
# (For one day, 2026-09-24, two rules were carried here after the .ts table by a pass that could
#  not touch tests/. They are ordinary rules of that table now, each with its own bite case in
#  tests/b46/research-ruler.test.ts, and nothing is measured in this file.)
#
# Usage:
#   scripts/research-ruler.sh              # the table
#   scripts/research-ruler.sh --verdicts   # the table, plus one RULER-VERDICT line per rule
# Exit: 0 when every rule passes, 1 on any failure.
set -euo pipefail
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec node --no-warnings "$REPO_DIR/tests/b46/research-ruler.ts" "$@"
