#!/usr/bin/env bash
# B85 stage 0 piece 6, Q2/Q6c/Q9: one build on the bench as it stands (made fresh just before), read at each step.
# Usage: measure-run.sh <tag>   (step 0, before the chain, is taken by the caller right after the make)
set -u
R="/home/dxb/DxB Global OS"
E="$R/.planning/quick/20261117-temel/stage-0/piece-6/evidence"
S=/tmp/claude-1000/-home-dxb-DxB-Global-OS/8e9a56bf-6609-4e01-a8ec-ee3eba2f5cd9/scratchpad/h-measure
T="$1"
step() { # <n> <name> [--root dir]
  local n="$1" name="$2"; shift 2
  echo "== step $n $name: chain up $*"
  pnpm -s -C "$R" foundation:chain up "$@" 2>&1 | tail -1
  node "$E/inventory.cjs" "$E/inv-$T-$n-$name.txt" | tail -1
  node "$E/snapshot.cjs" "$E/snap-$T-$n-$name.txt"
}
[ "${2:-}" = from3 ] || step 1 real-chain
[ "${2:-}" = from3 ] || step 2 fixture-in-os --root "$S/rootA"
step 3 fixture-outside --root "$S/rootB"
