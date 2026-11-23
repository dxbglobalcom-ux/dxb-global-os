#!/usr/bin/env bash
# batch.sh <job-dir> <prefix> <codes-file> — transcribe a profile's reels one after another with the
# watch-links watch.sh; the video is deleted after its words are on disk (frames are fetched again on need).
# Stops after 8 failures in a row (a refusal by the site), so it never hammers.
set -u
J="$1"; P="$2"; LIST="$3"; K="/home/dxb/DxB Global OS/.claude/skills/dxb-watch-links"; M=/home/dxb/.cache/link-watch
ok=0; bad=0; row=0
while read -r code; do
  [ -z "$code" ] && continue
  tx="$J/transcripts/$P-$code.txt"
  if [ -s "$tx" ]; then ok=$((ok+1)); continue; fi
  bash "$K/watch.sh" "$J" "$P" "https://www.instagram.com/reel/$code/" >/dev/null 2>&1
  rm -f "$M/$P-$code.mp4" "$M/$P-$code.lock"
  if [ -s "$tx" ]; then ok=$((ok+1)); row=0; else bad=$((bad+1)); row=$((row+1)); fi
  [ "$row" -ge 8 ] && { echo "STOPPED: 8 failures in a row at $code (ok=$ok bad=$bad)"; exit 2; }
  sleep $((1 + RANDOM % 3))
done < "$LIST"
echo "BATCH $P done ok=$ok bad=$bad"
