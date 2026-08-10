#!/usr/bin/env bash
# RIVAL INTEL FETCH (C42 stage 1) — turn one ledger row into watchable material.
#
#   scripts/rival-intel/fetch.sh 01
#
# Mechanical only: download, fingerprint, transcribe, slice into frames. It makes
# NO judgement — the reading and the report are the session author's work (K1).
# Idempotent: a step whose output already exists is skipped, so re-running after a
# crash costs only what was actually lost.
#
# Audio never leaves this machine: transcription goes to the holding's own Speaches
# container (V9, VOICE_INTERACTION_SPEC §16). Nothing is uploaded anywhere.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DIR="$ROOT/.planning/research/rival-intel"
LEDGER="$DIR/00-LEDGER.md"
MEDIA="$DIR/media"
FRAMES="$DIR/frames"
TRANSCRIPTS="$DIR/transcripts"
SPEACHES="${DXB_SPEACHES_URL:-http://localhost:8969}"
STT_MODEL="${DXB_STT_MODEL:-Systran/faster-whisper-small}"
FPS="${RIVAL_FRAME_FPS:-1}"   # one frame per second, plus scene cuts

NN="${1:-}"
[ -n "$NN" ] || { echo "usage: fetch.sh <row number, e.g. 01>" >&2; exit 1; }

row="$(grep -E "^\| $NN \|" "$LEDGER" || true)"
[ -n "$row" ] || { echo "FAIL no row '$NN' in $LEDGER" >&2; exit 1; }

url="$(printf '%s' "$row" | awk -F'|' '{print $3}' | grep -oE 'https?://[^ ]+' | head -1)"
kind="$(printf '%s' "$row" | awk -F'|' '{gsub(/ /,"",$4); print $4}')"
[ -n "$url" ] || { echo "FAIL row $NN carries no URL" >&2; exit 1; }

mkdir -p "$MEDIA" "$FRAMES" "$TRANSCRIPTS"

# ---- claim BEFORE any work -------------------------------------------------
# A crash then leaves a claimed row with its timestamp: the next session redoes
# exactly this one source and never touches the finished ones.
stamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
scripts_claim() {
  local status="$1"
  awk -v nn="$NN" -v st="$status" -v ts="$stamp" -F'|' 'BEGIN{OFS="|"}
    $0 ~ "^\\| " nn " \\|" { $5=" " st " "; $6=" " ts " " }
    { print }' "$LEDGER" > "$LEDGER.tmp" && mv "$LEDGER.tmp" "$LEDGER"
}
scripts_claim "claimed"
echo "row $NN claimed at $stamp ($kind)"

case "$kind" in
  reel|video)
    # The slug is the last path segment, taken BEFORE any '?tracking=…' tail —
    # the CEO's supplementary links carry share parameters ending in '=', which
    # the old end-of-string match could not read at all (measured 2026-08-02).
    #
    # A YouTube watch URL carries its identity in the QUERY, not in the path, so
    # the rule above would name every one of them "watch" and the second one
    # would collide with the first (measured 2026-08-10, when row 36 — the CEO's
    # own link, added that day — became the queue's first YouTube source). The
    # video id is taken from `v=` there, and every other host keeps the old rule.
    case "$url" in
      *youtube.com/watch*|*youtu.be/*)
        slug="$(printf '%s' "$url" | sed -E 's#.*[?&]v=([A-Za-z0-9_-]{6,}).*#\1#; s#.*youtu\.be/([A-Za-z0-9_-]{6,}).*#\1#')"
        ;;
      *)
        slug="$(printf '%s' "$url" | sed -E 's#\?.*$##; s#/+$##; s#.*/##')"
        ;;
    esac
    [ -n "$slug" ] || { echo "FAIL row $NN: cannot read a slug out of $url" >&2; exit 1; }
    base="$MEDIA/$NN-$slug"
    vid="$(ls "$MEDIA/$NN-"*.mp4 2>/dev/null | head -1 || true)"
    if [ -z "$vid" ]; then
      echo "downloading $url"
      # Highest resolution the source offers, audio ALWAYS kept and merged.
      # The CEO's condition of 2026-08-01: "720 HD KALİTESİ İLE İNDİRİLİP İZLENSİN".
      yt-dlp --no-warnings -q -S "res,vcodec:h264,acodec" \
        -f "bv*+ba/b" --merge-output-format mp4 -o "$base.%(ext)s" "$url"
      vid="$(ls "$MEDIA/$NN-"*.mp4 2>/dev/null | head -1)"
    else
      echo "already downloaded: $(basename "$vid")"
    fi

    sha="$(sha256sum "$vid" | awk '{print $1}')"
    dur="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$vid")"
    echo "sha256 $sha"
    echo "duration ${dur}s"

    # ---- the quality floor is a GATE, not a hope --------------------------
    # A vertical reel is 1080x1920: the short side is what "720p" means here.
    w="$(ffprobe -v error -select_streams v:0 -show_entries stream=width  -of csv=p=0 "$vid")"
    h="$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$vid")"
    short=$(( w < h ? w : h ))
    acodec="$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "$vid")"
    echo "resolution ${w}x${h} (short side $short) · audio ${acodec:-NONE}"
    [ "$short" -ge 720 ] || { echo "FAIL row $NN short side ${short}px < 720 — his quality floor" >&2; exit 1; }
    [ -n "$acodec" ] || { echo "FAIL row $NN has no audio track — it must be watched WITH sound" >&2; exit 1; }

    # ---- transcript (the holding's own STT, €0, nothing leaves the box) -----
    tx="$TRANSCRIPTS/$NN.json"
    if [ ! -s "$tx" ]; then
      wav="$MEDIA/$NN.wav"
      [ -s "$wav" ] || ffmpeg -v error -y -i "$vid" -ac 1 -ar 16000 "$wav"
      echo "transcribing through $SPEACHES ($STT_MODEL)"
      curl -sf -X POST "$SPEACHES/v1/audio/transcriptions" \
        -F "file=@$wav" -F "model=$STT_MODEL" \
        -F "response_format=verbose_json" -F "timestamp_granularities[]=segment" \
        -o "$tx" || { echo "FAIL Speaches did not answer — is the container up?" >&2; exit 1; }
    else
      echo "transcript already on disk"
    fi

    # ---- frames: an aid to the watching, never a substitute for it ---------
    # AMENDED 2026-08-01 by the CEO's live order (LAW A): the reading is the
    # VIDEO, watched start to end with its sound, "İNSAN GÖZÜYLE İZLENİR GİBİ
    # … kötü karelere bakıp değil". Frames stay only so a detail already seen
    # while watching can be zoomed into and quoted exactly.
    #
    # NEVER DOWNSCALE. Measured 2026-08-02: this line used to carry
    # `scale=720:-1`, which halved a 1080x1920 reel before anyone looked at it.
    # These sources are SCREEN RECORDINGS — terminal output, tool names, menu
    # labels — and at 720px wide that text is unreadable. The sixteen reports the
    # CEO binned were written off exactly such frames, which is the mechanical
    # cause of his verdict that they "UNDERESTIMATED MY OPPONENTS TOOOOOOO MUCH":
    # an eye that cannot read the screen guesses, and guessing reads as contempt.
    # -q:v 2 keeps the JPEG near-lossless so small type survives compression.
    fdir="$FRAMES/$NN"
    if [ ! -d "$fdir" ] || [ -z "$(ls -A "$fdir" 2>/dev/null)" ]; then
      mkdir -p "$fdir"
      ffmpeg -v error -y -i "$vid" -vf "fps=$FPS" -q:v 2 "$fdir/t%03d.jpg"
      ffmpeg -v error -y -i "$vid" -vf "select='gt(scene,0.25)'" -q:v 2 \
        -vsync vfr "$fdir/cut%03d.jpg" 2>/dev/null || true
    fi
    echo "frames: $(ls "$fdir" | wc -l) in $fdir"
    ;;

  pdf)
    f="$(ls "$MEDIA/$NN-"*.pdf 2>/dev/null | head -1 || true)"
    if [ -z "$f" ]; then
      f="$MEDIA/$NN-source.pdf"
      curl -sL -o "$f" "$url"
    fi
    echo "sha256 $(sha256sum "$f" | awk '{print $1}')"
    echo "pdf on disk: $f ($(pdfinfo "$f" 2>/dev/null | awk '/^Pages/{print $2}') pages)"
    ;;

  repo)
    name="$(printf '%s' "$url" | awk -F/ '{print tolower($NF)}' | sed 's/\.git$//')"
    d="$DIR/repos/$name"
    [ -d "$d" ] || git clone --depth 1 -q "$url" "$d"
    echo "repo on disk: $d ($(du -sh "$d" | awk '{print $1}'), HEAD $(git -C "$d" rev-parse --short HEAD))"
    ;;

  *) echo "FAIL unknown kind '$kind' on row $NN" >&2; exit 1 ;;
esac

scripts_claim "fetched"
echo
echo "row $NN is now 'fetched'. Next: WATCH it start to end with its sound, then write"
echo "$DIR/$(grep -E "^\| $NN \|" "$LEDGER" | awk -F'|' '{print $7}' | tr -d ' `')"
