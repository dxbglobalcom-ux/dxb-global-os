#!/usr/bin/env bash
# The lead's run of the piece's tests and of the earlier pieces' suites on the code in the working tree.
# $1 = the name of the log under evidence/
cd "/home/dxb/DxB Global OS" || exit 1
E=".planning/quick/20261117-temel/stage-0/piece-6/evidence"
{ echo "== at $(git rev-parse --short HEAD), tree: $(git status --short -- foundation db | tr '\n' ';')"
  echo "== typecheck"; pnpm -s foundation:typecheck; echo "typecheck exit=$?"
  for t in foundation/tests/snapshot/without-the-bench.test.ts foundation/tests/snapshot/on-a-fresh-instance.test.ts foundation/tests/snapshot/a-file-left-out.test.ts foundation/tests/chain foundation/tests/passes foundation/tests/roles; do
    echo "== $t"; s=$(date +%s); pnpm -s foundation:test "$t" 2>&1 | grep -E "✓|✗|×|FAIL|Test Files|Tests |Duration|AssertionError|Error:" | head -150; echo "exit=${PIPESTATUS[0]} seconds=$(( $(date +%s) - s ))"
  done
  echo "== what stands"; pnpm -s foundation:instance status | tail -1
} > "$E/$1" 2>&1
grep -E "^== |exit=|Test Files|Tests |INSTANCE" "$E/$1"
