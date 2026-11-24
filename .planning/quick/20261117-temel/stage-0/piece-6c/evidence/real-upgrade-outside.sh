#!/usr/bin/env bash
# B85 stage 0 piece 6c, SPEC §7: the real chain's own proof with the outside text beside it — a fresh instance's
# inventory kept aside, the chain at real/from.txt built, upgraded by the delivery command, then the three checks:
# the snapshot equal, the rows kept, nothing changed outside. Run by the lead until the bench command (piece 13)
# runs it. Each step's answer and exit code are printed; the first step that fails ends the run.
set -u
stop() { echo "STOPPED at: $1"; pnpm -s -C "$R" foundation:instance down 2>&1 | tail -1; exit 1; }
R="/home/dxb/DxB Global OS"
S="/tmp/claude-1000/-home-dxb-DxB-Global-OS/83d74e83-ef7c-4b4d-aee7-0ded9e3a2e0c/scratchpad/real-outside-$(date +%s)"
FROM="$(git -C "$R" show HEAD:foundation/tests/upgrade/real/from.txt)"
git -C "$R" merge-base --is-ancestor "$FROM" HEAD || { echo "STOPPED at: from is no ancestor of HEAD"; exit 1; }
echo "== HEAD $(git -C "$R" rev-parse HEAD); from $FROM"
node --input-type=module -e '
  const { chainAt } = await import(process.argv[1]);
  const [repository, revision, into] = process.argv.slice(2);
  console.log("chainAt", JSON.stringify(chainAt(repository, revision, into)));
' "$R/foundation/chain/src/index.ts" "$R" "$FROM" "$S" 2>&1; rc=$?; echo "exit=$rc"; [ "$rc" = 0 ] || stop "the step above"
echo "== instance fresh"; pnpm -s -C "$R" foundation:instance fresh 2>&1 | tail -1
echo "== inventory of the fresh instance, kept aside"; pnpm -s -C "$R" foundation:chain inventory > "$S.fresh.inventory.txt"; rc=$?; echo "exit=$rc lines=$(wc -l < "$S.fresh.inventory.txt")"; [ "$rc" = 0 ] || stop "the step above"
# From piece 6c's audit (A3): nothing may be the chain's before the chain — a role or a schema that stood already is the platform's.
ins=$(grep -c -E '^(row|owner|acl) in ' "$S.fresh.inventory.txt"); echo "lines marked in before the chain: $ins"; [ "$ins" = 0 ] || stop "the fresh instance holds lines marked in"
echo "== chain up --root <from>"; pnpm -s -C "$R" foundation:chain up --root "$S" 2>/dev/null; rc=$?; echo "exit=$rc"; [ "$rc" = 0 ] || stop "the step above"
echo "== outside, after the chain at from"; pnpm -s -C "$R" foundation:chain outside --before "$S.fresh.inventory.txt" --check "$R/foundation/tests/outside/expected/real.outside.txt"; rc=$?; echo "exit=$rc"; [ "$rc" = 0 ] || stop "the step above"
[ -f "$R/foundation/tests/upgrade/real/rows.sql" ] && echo "rows.sql stands: NOT GIVEN by this script" || echo "== no real/rows.sql: no table of the real chain holds a row yet"
echo "== rows, kept aside"; pnpm -s -C "$R" foundation:chain rows > "$S.before.rows.txt"; echo "exit=$?"
echo "== chain up — the delivery command"; pnpm -s -C "$R" foundation:chain up 2>/dev/null; rc=$?; echo "exit=$rc"; [ "$rc" = 0 ] || stop "the step above"
echo "== snapshot --check real"; pnpm -s -C "$R" foundation:chain snapshot --check "$R/foundation/tests/snapshot/expected/real.snapshot.txt"; rc=$?; echo "exit=$rc"; [ "$rc" = 0 ] || stop "the step above"
echo "== rows --kept"; pnpm -s -C "$R" foundation:chain rows --kept "$S.before.rows.txt"; rc=$?; echo "exit=$rc"; [ "$rc" = 0 ] || stop "the step above"
echo "== outside --check real, after the upgrade"; pnpm -s -C "$R" foundation:chain outside --before "$S.fresh.inventory.txt" --check "$R/foundation/tests/outside/expected/real.outside.txt"; rc=$?; echo "exit=$rc"; [ "$rc" = 0 ] || stop "the step above"
echo "== the instrument seen red in the same run: a comment on a platform schema"
node "$R/.planning/quick/20261117-temel/stage-0/piece-6/evidence/run.cjs" /dev/stdin <<'SQL' 2>&1 | tail -2
-- @ !comment
comment on schema extensions is 'real-upgrade-outside: seen red';
SQL
pnpm -s -C "$R" foundation:chain outside --before "$S.fresh.inventory.txt" --check "$R/foundation/tests/outside/expected/real.outside.txt"; rc=$?; echo "exit=$rc (1 is the proof that it can go red)"; [ "$rc" = 1 ] || stop "the red control was not red"
echo "== instance down"; pnpm -s -C "$R" foundation:instance down 2>&1 | tail -1
