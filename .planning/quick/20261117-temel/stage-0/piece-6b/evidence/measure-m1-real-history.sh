#!/usr/bin/env bash
# B85 stage 0 piece 6b, M1: the real chain, built at the revision before its last change (8faf72e6) and then
# upgraded by the delivery command at HEAD. What does the chain answer, and what does the check say?
set -u
R="/home/dxb/DxB Global OS"
S="/tmp/claude-1000/-home-dxb-DxB-Global-OS/7245408f-e553-4b10-8676-a27366e641aa/scratchpad/prev"
echo "== HEAD $(git -C "$R" rev-parse --short HEAD); previous chain revision 8faf72e6"
git -C "$R" archive 8faf72e6 db | tar -x -C "$S"
echo "== files at 8faf72e6"; (ls "$S/db/schema"; sha256sum "$S/db/schema/"*.sql "$R/db/schema/"*.sql | sed "s#$S#PREV#; s#$R#HEAD#")
echo "== the edit between them"; git -C "$R" diff 8faf72e6 HEAD -- db/
t0=$(date +%s)
echo "== instance fresh"; pnpm -s -C "$R" foundation:instance fresh 2>&1 | tail -1; echo "seconds=$(( $(date +%s) - t0 ))"
echo "== chain up --root PREV/db"; pnpm -s -C "$R" foundation:chain up --root "$S/db" 2>/dev/null; echo "exit=$?"
echo "== snapshot --check real (at the previous revision)"; pnpm -s -C "$R" foundation:chain snapshot --check "$R/foundation/tests/snapshot/expected/real.snapshot.txt"; echo "exit=$?"
echo "== chain up (HEAD) — the upgrade"; pnpm -s -C "$R" foundation:chain up 2>&1; echo "exit=$?"
echo "== snapshot --check real (after the upgrade attempt)"; pnpm -s -C "$R" foundation:chain snapshot --check "$R/foundation/tests/snapshot/expected/real.snapshot.txt"; echo "exit=$?"
echo "== instance down"; pnpm -s -C "$R" foundation:instance down 2>&1 | tail -1
echo "M1_DONE seconds=$(( $(date +%s) - t0 ))"
