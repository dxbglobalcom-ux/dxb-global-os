#!/usr/bin/env bash
# Picture first, sound later: render each storyboard shot from its own frame (H3 first-frame,
# 640x1152, 8 steps), trim each to its storyboard length, and cut them into one silent film.
# Usage: render_shots.sh <seed> <board> [<board> ...]
#   SHOTS="2 5" render_shots.sh ...   re-renders only those shots of a board, then re-cuts.
# Shots:  cekim/<board>/shotN-s<seed>.mp4 (engine output, with H3's own sound, kept)
# Film:   ~/Desktop/Motion Graphics/AYAKKABI-14-FILM/<board>.mp4 (silent picture cut)
set -u
JOB="$(cd "$(dirname "$0")" && pwd)"
IN=/home/dxb/tools/ComfyUI/input
OUT=/home/dxb/tools/ComfyUI/output
DESK="/home/dxb/Desktop/Motion Graphics/AYAKKABI-14-FILM"
seed=$1; shift
mkdir -p "$JOB/log" "$DESK"
for b in "$@"; do
  dir="$JOB/${CEKIM:-cekim}/$b"; log="$JOB/log/$b-${CEKIM:-cekim}.log"
  echo "== $b seed $seed start $(date +%H:%M:%S)" | tee -a "$log"
  while IFS=$'\t' read -r n sec src name pf; do
    if [ -n "${SHOTS:-}" ] && ! [[ " $SHOTS " == *" $n "* ]]; then continue; fi
    # A row whose source is a finished clip (a take already verified) is reused, not rendered again.
    if [[ "$src" == *.mp4 ]]; then cp -f "$src" "$dir/shot$n.mp4"; echo "  shot $n reused $src" | tee -a "$log"; continue; fi
    cp -f "$src" "$IN/$name"
    # A packshot with nobody in it (measured on film 01: H3 let a hand reach in twice) is bound to
    # end on its own storyboard frame, so the shot must close on the clean composition.
    last=()
    if grep -q "PACKSHOT" "$pf" && grep -q "The set is empty and still" "$pf"; then last=(--last-frame "$name"); fi
    systemd-run --user --scope --quiet -p MemoryMax=26G -p MemorySwapMax=8G -- \
      python3 /home/dxb/tools/h3/run.py --prompt "$(cat "$pf")" --first-frame "$name" "${last[@]}" \
        --width 640 --height 1152 --seconds "$sec" --steps 8 --seed "$seed" \
        --prefix "orvo/$b-k$n-s$seed" > "$dir/shot$n.log" 2>&1
    rc=$?
    file=$(grep -o 'cikti: .*' "$dir/shot$n.log" | tail -1 | sed 's/^cikti: //')
    if [ $rc -eq 0 ] && [ -n "$file" ] && [ -f "$OUT/orvo/$file" ]; then
      cp -f "$OUT/orvo/$file" "$dir/shot$n.mp4"
      echo "  shot $n OK $(grep -o 'duvar saati: [0-9.]* s' "$dir/shot$n.log") $(date +%H:%M:%S)" | tee -a "$log"
    else
      echo "  shot $n FAIL rc=$rc $(date +%H:%M:%S)" | tee -a "$log"
    fi
    rm -f "$IN/$name"
  done < "$dir/shots.tsv"
  # cut: each shot trimmed to its storyboard length, picture only
  args=(); filt=""; i=0; ok=1
  while IFS=$'\t' read -r n sec src name pf; do
    [ -f "$dir/shot$n.mp4" ] || { ok=0; break; }
    args+=(-i "$dir/shot$n.mp4")
    filt+="[$i:v]trim=0:$sec,setpts=PTS-STARTPTS,fps=24,format=yuv420p[v$i];"
    filt+="[$i:a]atrim=0:$sec,asetpts=PTS-STARTPTS,aresample=48000,afade=t=in:d=0.04,afade=t=out:st=$(python3 -c "print(max(0,$sec-0.04))"):d=0.04[a$i];"; i=$((i+1))
  done < "$dir/shots.tsv"
  if [ $ok -eq 1 ]; then
    if [ -f "$dir/keep_audio" ]; then
      for j in $(seq 0 $((i-1))); do filt+="[v$j][a$j]"; done
      filt+="concat=n=$i:v=1:a=1[out][aout]"; amap=(-map "[aout]" -c:a aac -b:a 192k)
    else
      filt=$(echo "$filt" | sed -E 's/\[[0-9]+:a\][^;]*;//g')
      for j in $(seq 0 $((i-1))); do filt+="[v$j]"; done
      filt+="concat=n=$i:v=1:a=0[out]"; amap=()
    fi
    ffmpeg -y -loglevel error "${args[@]}" -filter_complex "$filt" -map "[out]" "${amap[@]}" \
      -c:v libx264 -crf 14 -preset slow -movflags +faststart "$DESK/$b.mp4" \
      && echo "FILM $b -> $DESK/$b.mp4 $(date +%H:%M:%S)" | tee -a "$log" \
      || echo "CUT FAIL $b" | tee -a "$log"
  else
    echo "FILM $b incomplete — a shot is missing" | tee -a "$log"
  fi
done
