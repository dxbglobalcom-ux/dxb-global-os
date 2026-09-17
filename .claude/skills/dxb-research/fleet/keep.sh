#!/usr/bin/env bash
# THE ANSWER IS KEPT. HIS RULING, 2026-09-17.
#
# The paperwork he banned stays banned — no run folder, no ledger, no gate output, no
# claims files. What is kept is the ANSWER and nothing else: the hunters' reports, the
# question, and the one-screen summary. Measured on the 12:45 run: the reports are
# 60 KB where the run folders he deleted were 22 MB — the answer costs three parts in
# a thousand of the garbage.
#
# Why it is automatic and not "on his word": he measured the cost of the other way
# himself — "ben unutursam sorulsun ... unutmuşum". A record that waits to be asked for
# is a record that is lost.
#
#   keep.sh <question-file> <out-dir> [summary-file]
set -uo pipefail

QF="${1:?question file}"; OUT="${2:?out dir}"; SUM="${3:-}"
ROOT="${DXB_RESEARCH_ANSWERS:-/home/dxb/DxB Global OS/.planning/research/answers}"

[ -d "$OUT" ] || { echo "keep: out dizini yok: $OUT" >&2; exit 1; }
reports=$(ls "$OUT"/HUNTER-*.md 2>/dev/null | wc -l)
[ "$reports" -gt 0 ] || { echo "keep: rapor yok, saklanacak cevap da yok" >&2; exit 1; }

# LC_ALL=C on purpose: without it a Turkish 'ı' or 'ö' survives the class and lands in a
# directory name. Measured 2026-09-17: the first folder came out ".astra-6-yı-mı-yoksa.".
slug=$(head -1 "$QF" 2>/dev/null | tr '[:upper:]' '[:lower:]' \
        | LC_ALL=C sed 's/[^a-z0-9]\+/-/g; s/^-*//; s/-*$//' | cut -c1-60 | sed 's/-*$//')
DEST="$ROOT/$(date +%Y%m%d-%H%M)-${slug:-arastirma}"
mkdir -p "$DEST" || exit 1

cp "$QF" "$DEST/question.txt" 2>/dev/null
cp "$OUT"/HUNTER-*.md "$DEST/" 2>/dev/null
[ -n "$SUM" ] && [ -f "$SUM" ] && cp "$SUM" "$DEST/SUMMARY.txt"

# The raw machine files (jsonl, 3.4 MB on the same run) are NOT kept — they are the
# noise, not the answer.
echo "cevap saklandi: $DEST  ($(du -sh "$DEST" | cut -f1), $reports rapor)"
