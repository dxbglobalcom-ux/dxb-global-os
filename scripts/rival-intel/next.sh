#!/usr/bin/env bash
# WHERE WAS I? — the one command a fresh session runs (CEO order 2026-07-28:
# "BİR SONRAKİ OPUS 5 TE DEVAM ETSİN KALDIĞIN YERDEN … CONTEXT ŞİŞERSE KAPANIRSA").
#
#   scripts/rival-intel/next.sh
#
# Reads the ledger, prints the stage, the row to work, and the exact command to
# continue with. It answers a question; it changes nothing.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DIR="$ROOT/.planning/research/rival-intel"
LEDGER="$DIR/00-LEDGER.md"
STALE_MIN="${RIVAL_STALE_MINUTES:-45}"

[ -f "$LEDGER" ] || { echo "FAIL ledger missing: $LEDGER" >&2; exit 1; }

rows="$(grep -E '^\| [0-9]{2} \|' "$LEDGER" || true)"
total="$(printf '%s\n' "$rows" | grep -c . || true)"
done_n="$(printf '%s\n' "$rows" | awk -F'|' '{gsub(/ /,"",$5); print $5}' | grep -c '^reported$' || true)"

echo "STAGE 1 of the C42 programme — rival intelligence"
echo "progress: $done_n / $total sources reported"
echo

# A claimed row older than STALE_MIN means the session working it died.
now="$(date -u +%s)"
stale=""
while IFS= read -r r; do
  [ -n "$r" ] || continue
  st="$(printf '%s' "$r" | awk -F'|' '{gsub(/ /,"",$5); print $5}')"
  [ "$st" = "claimed" ] || continue
  ts="$(printf '%s' "$r" | awk -F'|' '{gsub(/ /,"",$6); print $6}')"
  [ "$ts" != "—" ] && [ -n "$ts" ] || continue
  age=$(( (now - $(date -u -d "$ts" +%s 2>/dev/null || echo "$now")) / 60 ))
  if [ "$age" -ge "$STALE_MIN" ]; then
    stale="$(printf '%s' "$r" | awk -F'|' '{gsub(/ /,"",$2); print $2}')"
    echo "⚠ row $stale was claimed $age minutes ago and never closed — that session died."
    echo "  Redo THIS row from the start; the finished rows are untouched."
    echo
    break
  fi
done <<< "$rows"

target="$stale"
if [ -z "$target" ]; then
  target="$(printf '%s\n' "$rows" | awk -F'|' '{gsub(/ /,"",$5); gsub(/ /,"",$2); if ($5!="reported") {print $2; exit}}')"
fi

if [ -z "$target" ]; then
  echo "Every source is reported. Stage 1 closes with the synthesis:"
  echo "  $DIR/00-SYNTHESIS.md"
  echo "Then the CEO reads it and opens stage 2 — see 00-BOARD-OPEN-WORK.md section 3."
  exit 0
fi

row="$(grep -E "^\| $target \|" "$LEDGER")"
src="$(printf '%s' "$row" | awk -F'|' '{print $3}' | sed 's/^ *//;s/ *$//')"
st="$(printf '%s' "$row" | awk -F'|' '{gsub(/ /,"",$5); print $5}')"
rep="$(printf '%s' "$row" | awk -F'|' '{print $7}' | tr -d ' `')"
note="$(printf '%s' "$row" | awk -F'|' '{print $8}' | sed 's/^ *//;s/ *$//')"

echo "NEXT ROW: $target   (status: $st)"
echo "source:   $src"
echo "report:   $DIR/$rep"
[ -n "$note" ] && echo "CEO said: $note"
echo
case "$st" in
  pending|claimed) echo "continue with:  scripts/rival-intel/fetch.sh $target" ;;
  fetched)         echo "material is on disk. WATCH $DIR/media/$target-*.mp4 start to end WITH ITS"
                   echo "SOUND — every second in order, the transcript beside it — the way a person"
                   echo "watches (CEO, 2026-08-01: \"İNSAN GÖZÜYLE İZLENİR GİBİ İZLENSİN kötü karelere"
                   echo "bakıp değil\"). $DIR/frames/$target is a zoom aid for a detail already seen," ;&
  watched)         echo "never the reading itself. Then write the six-section report at $DIR/$rep, set"
                   echo "the row to 'reported', and commit. Section 2 must be a timestamped record of"
                   echo "what was watched — summarising is forbidden (CEO order C42)." ;;
esac
echo
echo "Read first, before anything: $LEDGER (its law section)."
