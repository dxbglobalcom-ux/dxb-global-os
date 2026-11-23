#!/usr/bin/env bash
# B85 stage 0 piece 6b, SPEC §7: the real chain's own upgrade, from the committed revision of real/from.txt —
# run by the lead until the bench command (piece 13) runs it. Each step's answer and exit code are printed.
set -u
# From piece 6b's audit (B8): from.txt is read from HEAD, not from the working tree, and the first step that fails ends the run.
stop() { echo "STOPPED at: $1"; pnpm -s -C "$R" foundation:instance down 2>&1 | tail -1; exit 1; }
R="/home/dxb/DxB Global OS"
S="/tmp/claude-1000/-home-dxb-DxB-Global-OS/7245408f-e553-4b10-8676-a27366e641aa/scratchpad/real-from-$(date +%s)"
FROM="$(git -C "$R" show HEAD:foundation/tests/upgrade/real/from.txt)"
git -C "$R" merge-base --is-ancestor "$FROM" HEAD || { echo "STOPPED at: from is no ancestor of HEAD"; exit 1; }
echo "== HEAD $(git -C "$R" rev-parse HEAD); from $FROM"
node --input-type=module -e '
  const { chainAt } = await import(process.argv[1]);
  const [repository, revision, into] = process.argv.slice(2);
  console.log("chainAt", JSON.stringify(chainAt(repository, revision, into)));
' "$R/foundation/chain/src/index.ts" "$R" "$FROM" "$S" 2>&1; rc=$?; echo "exit=$rc"; [ "$rc" = 0 ] || stop "the step above"
echo "== the chain at from against the chain now"; for d in schema functions reference; do diff -r "$S/$d" "$R/db/$d" && echo "$d: the same files"; done
echo "== instance fresh"; pnpm -s -C "$R" foundation:instance fresh 2>&1 | tail -1
echo "== chain up --root <from>"; pnpm -s -C "$R" foundation:chain up --root "$S" 2>/dev/null; rc=$?; echo "exit=$rc"; [ "$rc" = 0 ] || stop "the step above"
[ -f "$R/foundation/tests/upgrade/real/rows.sql" ] && echo "rows.sql stands: NOT GIVEN by this script" || echo "== no real/rows.sql: no table of the real chain holds a row yet"
echo "== rows, kept aside"; pnpm -s -C "$R" foundation:chain rows > "$S.before.rows.txt"; echo "exit=$?"; cat "$S.before.rows.txt"
echo "== chain up — the delivery command"; pnpm -s -C "$R" foundation:chain up 2>/dev/null; rc=$?; echo "exit=$rc"; [ "$rc" = 0 ] || stop "the step above"
echo "== snapshot --check real"; pnpm -s -C "$R" foundation:chain snapshot --check "$R/foundation/tests/snapshot/expected/real.snapshot.txt"; rc=$?; echo "exit=$rc"; [ "$rc" = 0 ] || stop "the step above"
echo "== rows --kept"; pnpm -s -C "$R" foundation:chain rows --kept "$S.before.rows.txt"; rc=$?; echo "exit=$rc"; [ "$rc" = 0 ] || stop "the step above"
echo "== instance down"; pnpm -s -C "$R" foundation:instance down 2>&1 | tail -1
