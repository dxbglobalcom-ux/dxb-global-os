#!/usr/bin/env bash
# B85 stage 0 piece 6c, measurement M6: does the platform change the catalogue or its tables' rows by itself when the
# UTC day turns? One fresh instance with the real chain, read before and after 00:00 UTC; each reading is compared
# with the one before it. The background command itself: its exit wakes the lead. The instance is taken down at the end.
R="/home/dxb/DxB Global OS"
E="$R/.planning/quick/20261117-temel/stage-0/piece-6c/evidence"
S="/tmp/claude-1000/-home-dxb-DxB-Global-OS/83d74e83-ef7c-4b4d-aee7-0ded9e3a2e0c/scratchpad/6c-midnight"
mkdir -p "$S"
O="$E/measure-m6-midnight.out"
{
  echo "== fresh, then the real chain"
  pnpm -s -C "$R" foundation:instance fresh 2>&1 | tail -1
  pnpm -s -C "$R" foundation:chain up 2>&1 | tail -1
  prev=""
  for at in now "2026-11-23 23:50:00" "2026-11-23 23:58:30" "2026-11-24 00:01:00" "2026-11-24 00:05:00" "2026-11-24 00:15:00"; do
    if [ "$at" != now ]; then
      target=$(date -u -d "$at UTC" +%s); now=$(date +%s)
      [ "$target" -gt "$now" ] && sleep $(( target - now ))
    fi
    tag=$(date -u +%H%M%S)
    echo "== reading at $(date -u +%FT%TZ)"
    node "$E/inventory2.cjs" "$S/inv-$tag.txt" | tail -1
    node "$E/rows.cjs" "$S/rows-$tag.txt" | tail -1
    if [ -n "$prev" ]; then
      echo "-- catalogue lines that differ from the reading at $prev: $(diff "$S/inv-$prev.txt" "$S/inv-$tag.txt" | grep -c '^[<>]')"
      diff "$S/inv-$prev.txt" "$S/inv-$tag.txt" | grep '^[<>]' | cut -c1-260 | head -400
      echo "-- tables whose rows differ from the reading at $prev: $(diff "$S/rows-$prev.txt" "$S/rows-$tag.txt" | grep -c '^[<>]')"
      diff "$S/rows-$prev.txt" "$S/rows-$tag.txt" | grep '^[<>]' | head -80
    fi
    prev="$tag"
  done
  echo "== down"
  pnpm -s -C "$R" foundation:instance down 2>&1 | tail -1
  pnpm -s -C "$R" foundation:instance status 2>&1 | tail -1
} > "$O" 2>&1
grep -E '^== |^-- |INSTANCE' "$O"
