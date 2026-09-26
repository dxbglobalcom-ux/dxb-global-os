#!/usr/bin/env bash
# THE ANSWER IS KEPT. HIS RULING, 2026-09-17.
#
# The paperwork he banned stays banned — no run folder, no ledger, no gate output, no
# claims files. What is kept is the ANSWER and nothing else. Measured on the 12:45 run: the
# reports are 60 KB where the run folders he deleted were 22 MB — the answer costs three parts
# in a thousand of the garbage.
#
# WHAT THE ANSWER IS, NOW THAT THE PAGE IS WRITTEN FROM ROWS (B56, 2026-09-26): the page
# (final.md), the written answer (answer.md), the rows its sources are printed from
# (evidence.jsonl — a page kept without them can no longer be checked against its own sources),
# the one-screen summary (SUMMARY.txt), the hunters' reports and the question; the cached page
# bodies (bodies/) only while they stay under 5 MB, else one line in the kept folder says so.
#
# IT RUNS ONLY ON HIS WORD. His ruling, 2026-09-17: nothing is kept in general; after a
# test, BEFORE the commit or at a fitting moment, he is asked "bu testi kaydedelim mi?"
# and this script runs only if he says yes. He does not want a dump.
#
#   keep.sh <question-file> <out-dir> [summary-file]        (summary: <out-dir>/SUMMARY.txt by default)
set -uo pipefail

QF="${1:?question file}"; OUT="${2:?out dir}"; SUM="${3:-$OUT/SUMMARY.txt}"
ROOT="${DXB_RESEARCH_ANSWERS:-/home/dxb/DxB Global OS/.planning/research/answers}"

[ -d "$OUT" ] || { echo "keep: out dizini yok: $OUT" >&2; exit 1; }
reports=$(ls "$OUT"/HUNTER-*.md 2>/dev/null | wc -l)
# A run with a page or a written answer is kept even with no hunter report (the quick road has
# none); a run with none of the three has nothing to keep.
if [ "$reports" -eq 0 ] && [ ! -f "$OUT/final.md" ] && [ ! -f "$OUT/answer.md" ]; then
  echo "keep: cevap yok (final.md · answer.md · HUNTER-*.md) — saklanacak bir sey yok" >&2; exit 1
fi

# LC_ALL=C on purpose: without it a Turkish 'ı' or 'ö' survives the class and lands in a
# directory name. Measured 2026-09-17: the first folder came out ".astra-6-yı-mı-yoksa.".
slug=$(head -1 "$QF" 2>/dev/null | tr '[:upper:]' '[:lower:]' \
        | LC_ALL=C sed 's/[^a-z0-9]\+/-/g; s/^-*//; s/-*$//' | cut -c1-60 | sed 's/-*$//')
DEST="$ROOT/$(date +%Y%m%d-%H%M)-${slug:-arastirma}"
mkdir -p "$DEST" || exit 1

cp "$QF" "$DEST/question.txt" 2>/dev/null
cp "$OUT"/HUNTER-*.md "$DEST/" 2>/dev/null
kept=""
[ -f "$SUM" ] && cp "$SUM" "$DEST/SUMMARY.txt" && kept=" SUMMARY.txt"

# THE ANSWER'S OWN FILES, kept when the run has them: the page, the written answer, the rows its
# sources are printed from, and — from a run of the earlier contract — its numbered registry and
# the citation ruler's verdict. A file the run does not have is not an error.
for f in "$OUT/final.html" "$OUT/final.md" "$OUT/answer.md" "$OUT/evidence.jsonl" "$OUT/sources.json" "$OUT"/cite-check*.txt; do
  [ -f "$f" ] && cp "$f" "$DEST/" && kept="$kept ${f##*/}"
done

# THE BODIES, ONLY WHILE THEY ARE SMALL — the cached text behind every row that was read. Under
# 5 MB they travel with the answer; above it, one line in the kept folder says how big they were
# and where they stayed (the run folder is not kept: they go when it goes).
bodies_note=""
if [ -d "$OUT/bodies" ]; then
  bsz=$(du -sb "$OUT/bodies" | cut -f1)
  if [ "$bsz" -lt $(( 5 * 1024 * 1024 )) ]; then
    cp -r "$OUT/bodies" "$DEST/" && kept="$kept bodies/"
  else
    bodies_note="bodies/ saklanmadi: $(awk -v b="$bsz" 'BEGIN { printf "%.1f", b / 1048576 }') MB (5 MB ustu), kosu klasorunde kaldi: $OUT/bodies"
    echo "$bodies_note" > "$DEST/bodies-saklanmadi.txt"
  fi
fi

# The hunters' transcripts (<role>.jsonl, 3.4 MB on the 2026-09-17 run) and the raw ground are NOT
# kept — they are the noise, not the answer.
echo "cevap saklandi: $DEST  ($(du -sh "$DEST" | cut -f1), $reports rapor ·${kept:- sozlesme dosyasi yok})"
[ -z "$bodies_note" ] || echo "   $bodies_note"
