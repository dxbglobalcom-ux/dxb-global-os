#!/usr/bin/env bash
# watch.sh <job-dir> <id> <url> [video]  — step 1: a video's words onto disk, cheapest way first.
#   YouTube: its own subtitles (tr/en); none -> audio -> local Speaches. Add "video" to also fetch
#   the picture (for frames). Instagram / X / other: the 720p video -> local Speaches.
#   Writes <job-dir>/transcripts/<id>-<slug>.txt only when it has timed lines; a failure leaves
#   <id>-<slug>.txt.failed with the reason. Idempotent; safe to call from several readers at once.
set -u
J="$1"; id="$2"; url="$3"; want="${4:-}"
H="$(dirname "$(readlink -f "$0")")"; M=/home/dxb/.cache/link-watch; T="$J/transcripts"
mkdir -p "$M" "$T"
case "$url" in
  *youtu.be/*|*youtube.com/*) yt=1; slug="$(printf '%s' "$url" | sed -E 's#.*[?&]v=([A-Za-z0-9_-]{6,}).*#\1#; s#.*youtu\.be/([A-Za-z0-9_-]{6,}).*#\1#; s#.*/shorts/([A-Za-z0-9_-]{6,}).*#\1#')";;
  *) yt=0; slug="$(printf '%s' "$url" | sed -E 's#\?.*$##; s#/+$##; s#.*/##')";;
esac
base="$M/$id-$slug"; tx="$T/$id-$slug.txt"
exec 9>"$base.lock"; flock 9          # one run per item at a time
fail() { echo "$1" > "$tx.failed"; }
getvideo() {
  [ -s "$base.mp4" ] || timeout 600 yt-dlp --no-warnings -q -S "res:720,vcodec:h264,acodec" -f "bv*+ba/b" \
    --merge-output-format mp4 -o "$base.%(ext)s" "$url" < /dev/null 2>"$base.err"
  [ -s "$base.mp4" ]
}
transcribe() {  # $1 = media file
  ffmpeg -v error -y -i "$1" -vn -ac 1 -ar 16000 "$base.wav" < /dev/null || { echo "NO_AUDIO (the video has no sound)" > "$tx"; return; }
  # 10-minute pieces, one at a time on the whole machine: the 1.8 GB Speaches container dies on a long
  # file (a 102-minute lecture, 2026-10-08) and under parallel load
  rm -f "$base".p*.wav; ffmpeg -v error -y -i "$base.wav" -f segment -segment_time 600 -c copy "$base.p%03d.wav" < /dev/null
  : > "$tx.part"; k=0
  for p in "$base".p*.wav; do
    for try in 1 2 3; do   # the container restarts itself after a crash: wait for it, then the same piece again
      for w in $(seq 60); do curl -s -m 3 http://localhost:8969/health >/dev/null && break; sleep 5; done
      out="$(flock "$M/.speaches.lock" curl -s -m 1800 -H "Expect:" -X POST http://localhost:8969/v1/audio/transcriptions \
        -F "file=@$p" -F "model=Systran/faster-whisper-small" -F "response_format=verbose_json" < /dev/null \
      | python3 -I "$H/seg2txt.py" $((k * 600)))"
      case "$out" in *TRANSCRIBE_FAILED*) sleep 20 ;; *) break ;; esac
    done
    printf '%s\n' "$out" >> "$tx.part"
    k=$((k + 1))
  done
  rm -f "$base.wav" "$base".p*.wav
  if grep -q "^\[" "$tx.part" && ! grep -q TRANSCRIBE_FAILED "$tx.part"; then mv "$tx.part" "$tx"; rm -f "$tx.failed"
  elif grep -q "^\[" "$tx.part"; then mv "$tx.part" "$tx"; grep TRANSCRIBE_FAILED "$tx" > "$tx.failed"   # partial: say which pieces
  else fail "TRANSCRIBE_FAILED $(head -c 200 "$tx.part")"; rm -f "$tx.part"; fi
}
if [ ! -s "$tx" ]; then
  if [ "$yt" = 1 ]; then
    timeout 120 yt-dlp --no-warnings -q --skip-download --write-subs --write-auto-subs \
      --sub-langs "tr.*,en.*,tr,en" --convert-subs srt -o "$base.%(ext)s" "$url" < /dev/null 2>/dev/null
    srt="$(ls "$base".*.srt 2>/dev/null | grep -E '\.(tr|en)[^/]*\.srt$' | head -1)"
    if [ -n "$srt" ]; then python3 -I "$H/srt2txt.py" "$srt" "$tx"
    else
      timeout 600 yt-dlp --no-warnings -q -f "ba/b" -o "$base.audio.%(ext)s" "$url" < /dev/null 2>"$base.err"
      a="$(ls "$base".audio.* 2>/dev/null | head -1)"
      if [ -n "$a" ]; then transcribe "$a"; else fail "DOWNLOAD_FAILED $(head -c 200 "$base.err")"; fi
    fi
  else
    if getvideo; then transcribe "$base.mp4"; else fail "DOWNLOAD_FAILED $(head -c 200 "$base.err" 2>/dev/null)"; fi
  fi
fi
[ "$want" = video ] && [ "$yt" = 1 ] && { getvideo || echo "VIDEO_FAILED $(head -c 200 "$base.err")"; }
[ -s "$tx" ] && echo "TRANSCRIPT $tx" || cat "$tx.failed" 2>/dev/null
[ -s "$base.mp4" ] && echo "VIDEO $base.mp4 ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$base.mp4" < /dev/null)s)"
true
