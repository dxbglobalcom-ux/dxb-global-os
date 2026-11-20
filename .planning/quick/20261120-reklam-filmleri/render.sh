#!/usr/bin/env bash
# Render storyboards as single 15-second H3 Ref2VA takes with sound, one after another.
# Usage: render.sh <seed> <board> [<board> ...]      (board = folder name, e.g. 01-tokyo-kiraz)
# Each take: 640x1152, 8 steps, the storyboard frames as references, the prompt from istem/<board>.txt.
# The finished film is copied to ~/Desktop/Motion Graphics/AYAKKABI-14-FILM/<board>-s<seed>.mp4.
set -u
JOB="$(cd "$(dirname "$0")" && pwd)"
IN=/home/dxb/tools/ComfyUI/input
OUT=/home/dxb/tools/ComfyUI/output
DESK="/home/dxb/Desktop/Motion Graphics/AYAKKABI-14-FILM"
seed=$1; shift
mkdir -p "$JOB/log" "$DESK"
for b in "$@"; do
  log="$JOB/log/$b-s$seed.log"
  refs=()
  while IFS=$'\t' read -r src name; do
    cp -f "$src" "$IN/$name"; refs+=(--ref "$name")
  done < "$JOB/istem/$b.refs"
  echo "== $b seed $seed start $(date +%H:%M:%S)" | tee "$log"
  systemd-run --user --scope --quiet -p MemoryMax=26G -p MemorySwapMax=8G -- \
    python3 /home/dxb/tools/h3/run.py --prompt "$(cat "$JOB/istem/$b.txt")" "${refs[@]}" \
      --width 640 --height 1152 --seconds 15 --steps 8 --seed "$seed" \
      --prefix "orvo/$b-s$seed" >> "$log" 2>&1
  rc=$?
  file=$(grep -o 'cikti: .*' "$log" | tail -1 | sed 's/^cikti: //')
  if [ $rc -eq 0 ] && [ -n "$file" ] && [ -f "$OUT/$file" ]; then
    cp -f "$OUT/$file" "$DESK/$b-s$seed.mp4"
    echo "OK $b -> $DESK/$b-s$seed.mp4 $(date +%H:%M:%S)" | tee -a "$log"
  else
    echo "FAIL $b rc=$rc $(date +%H:%M:%S)" | tee -a "$log"
  fi
  grep -E 'duvar saati|VRAM tepe|sonuc' "$log" | tail -3
done
