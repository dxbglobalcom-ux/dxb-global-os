#!/usr/bin/env bash
# The lead's run of the piece's tests and of the earlier pieces' suites on what stands in the working tree.
# $1 = the name of the log under evidence/ ; $2 = "own" to run the piece's own files only
cd "/home/dxb/DxB Global OS" || exit 1
E=".planning/quick/20261117-temel/stage-0/piece-6c/evidence"
others="foundation/tests/bench/no-old-address.test.ts foundation/tests/snapshot/without-the-bench.test.ts foundation/tests/snapshot/on-a-fresh-instance.test.ts foundation/tests/snapshot/a-file-left-out.test.ts foundation/tests/upgrade/without-the-bench.test.ts foundation/tests/upgrade/chain-at.test.ts foundation/tests/upgrade/chain-at-bent.test.ts foundation/tests/upgrade/clean.test.ts foundation/tests/upgrade/upgraded.test.ts foundation/tests/chain foundation/tests/passes foundation/tests/roles"
[ "${2:-}" = own ] && others="foundation/tests/bench/no-old-address.test.ts"
{ echo "== at $(git rev-parse --short HEAD), tree: $(git status --short -- foundation db | tr '\n' ';')"
  echo "== typecheck"; pnpm -s foundation:typecheck 2>&1 | head -30; echo "typecheck exit=${PIPESTATUS[0]}"
  for t in foundation/tests/outside/*.test.ts $others; do
    echo "== $t"; s=$(date +%s); pnpm -s foundation:test "$t" 2>&1 | grep -E "✓|✗|×|FAIL|Test Files|Tests |Duration|AssertionError|Error:" | head -150; echo "exit=${PIPESTATUS[0]} seconds=$(( $(date +%s) - s ))"
  done
  echo "== what stands"; pnpm -s foundation:instance status | tail -1
} > "$E/$1" 2>&1
grep -E "^== |exit=|Test Files|Tests |INSTANCE" "$E/$1"
