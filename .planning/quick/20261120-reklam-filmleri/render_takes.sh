#!/usr/bin/env bash
# Render a film's natural takes (cekim2/<board>/shots.tsv, built by build_takes.py) on H3 — 640x1152,
# 8 steps, each take from its storyboard frame — then cut them with the storyboard's transitions (cut.py).
# Usage: render_takes.sh <seed> <board> [<board> ...]
#   SHOTS="2 5" render_takes.sh ...   re-renders only those takes, then re-cuts.
# Film: ~/Desktop/Motion Graphics/AYAKKABI-14-FILM/<board>.mp4
set -u
JOB="$(cd "$(dirname "$0")" && pwd)"
IN=/home/dxb/tools/ComfyUI/input
OUT=/home/dxb/tools/ComfyUI/output
DESK="/home/dxb/Desktop/Motion Graphics/AYAKKABI-14-FILM"
seed=$1; shift
# Every take is rendered a little longer and its first HEAD seconds are dropped in the cut: H3 starts
# from the still storyboard picture, so its opening frames are a pose; the film starts inside the motion.
HEAD=0.35
mkdir -p "$JOB/log" "$DESK"
for b in "$@"; do
  dir="$JOB/cekim2/$b"; log="$JOB/log/$b-cekim2.log"
  echo "== $b seed $seed start $(date +%H:%M:%S)" | tee -a "$log"
  while IFS=$'\t' read -r n sec src name pf tin; do
    if [ -n "${SHOTS:-}" ] && ! [[ " $SHOTS " == *" $n "* ]]; then continue; fi
    if [[ "$src" == *.mp4 ]]; then cp -f "$src" "$dir/shot$n.mp4"; echo "  take $n reused" | tee -a "$log"; continue; fi
    cp -f "$src" "$IN/$name"
    # An empty final packshot is bound to end on its own frame (film 01: H3 let a hand reach in).
    last=()
    if grep -q "PACKSHOT" "$pf" && grep -q "The set is empty and still" "$pf"; then last=(--last-frame "$name"); fi
    systemd-run --user --scope --quiet -p MemoryMax=26G -p MemorySwapMax=8G -- \
      python3 /home/dxb/tools/h3/run.py --prompt "$(cat "$pf")" --first-frame "$name" "${last[@]}" \
        --width 640 --height 1152 --seconds "$(python3 -c "print($sec+$HEAD+0.15)")" --steps 8 --seed "$seed" \
        --prefix "orvo/$b-t$n-s$seed" > "$dir/shot$n.log" 2>&1
    rc=$?
    file=$(grep -o 'cikti: .*' "$dir/shot$n.log" | tail -1 | sed 's/^cikti: //')
    if [ $rc -eq 0 ] && [ -n "$file" ] && [ -f "$OUT/orvo/$file" ]; then
      cp -f "$OUT/orvo/$file" "$dir/shot$n.mp4"
      echo "  take $n OK $(grep -o 'duvar saati: [0-9.]* s' "$dir/shot$n.log") $(grep -o 'RAM tepe: [0-9.]* GiB' "$dir/shot$n.log") $(date +%H:%M:%S)" | tee -a "$log"
    else
      echo "  take $n FAIL rc=$rc $(date +%H:%M:%S)" | tee -a "$log"
    fi
    rm -f "$IN/$name"
  done < "$dir/shots.tsv"
  if r=$(python3 -I "$JOB/cut.py" "$dir" "$DESK/$b.mp4" 2>&1); then
    echo "FILM $b -> $DESK/$b.mp4 · $r · $(date +%H:%M:%S)" | tee -a "$log"
  else
    echo "FILM $b incomplete — $r" | tee -a "$log"
  fi
done
