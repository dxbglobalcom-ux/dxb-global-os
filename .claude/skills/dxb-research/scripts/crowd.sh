#!/usr/bin/env bash
# CROWD — turn a list of thread addresses into the PEOPLE inside them, at full power.
#
# Why this exists. Measured 2026-09-17: `opencli reddit read <url>` on its defaults
# (--limit 25 --depth 2 --replies 5) returned 35 records and 20 distinct people from a
# 73-comment thread — it had quietly left two thirds of the crowd unread, and nothing in
# the run said so. The same weapon, with its own manual applied
# (--limit 100 --depth 10 --replies 50 --expand-more), returned 71 records and 60 people
# in 2.9 seconds. The tool was never the limit; the operator was.
#
#   crowd.sh <urls-file> <outdir> [--workers N] [--timeout S]
#
# Prints one line per thread (read / distinct people / official count when known) and
# writes <outdir>/CROWD.txt — every comment as `author | score | text`, which is what a
# hunter counts. A thread that would not open is named, never dropped.

set -uo pipefail
export OPENCLI_WINDOW=background      # never throw a tab across his screen

URLS="${1:-}"; OUT="${2:-}"; shift 2 2>/dev/null || true
W=6; TMO=180
while [ $# -gt 0 ]; do
  case "$1" in
    --workers) W="$2"; shift 2 ;;
    --timeout) TMO="$2"; shift 2 ;;
    *) shift ;;
  esac
done
[ -z "$URLS" ] || [ -z "$OUT" ] && { echo "kullanim: crowd.sh <adres-dosyasi> <cikti> [--workers N]" >&2; exit 2; }
[ -f "$URLS" ] || { echo "adres dosyasi yok: $URLS" >&2; exit 2; }
mkdir -p "$OUT/threads"

read_one() {
  local u="$1" out="$2" tmo="$3"
  local n; n=$(printf '%s' "$u" | md5sum | cut -c1-10)
  # FULL POWER, always. The flags are the manual's own, and `--expand-more` follows the
  # "[+N more replies]" stubs the default read silently drops.
  timeout "$tmo" opencli reddit read "$u" \
      --limit 100 --depth 10 --replies 50 --expand-more true --expand-rounds 5 \
      -f yaml > "$out/threads/$n.yaml" 2> "$out/threads/$n.err"
  local rc=$?
  # A door that shuts is not an answer: walk to the next reader before giving up.
  if [ $rc -ne 0 ] || [ ! -s "$out/threads/$n.yaml" ]; then
    timeout "$tmo" python3 "$(dirname "${BASH_SOURCE[0]}")/fetch.py" "$u" \
        --out "$out/threads/$n.md" >/dev/null 2>&1
  fi
  printf '%s\t%s\n' "$n" "$u" >> "$out/threads/INDEX.tsv"
}
export -f read_one

: > "$OUT/threads/INDEX.tsv"
i=0
while read -r u; do
  [ -z "$u" ] && continue
  read_one "$u" "$OUT" "$TMO" &
  i=$((i+1))
  [ $((i % W)) -eq 0 ] && wait
done < "$URLS"
wait

python3 - "$OUT" <<'PYEOF'
import sys, pathlib, yaml, collections
out = pathlib.Path(sys.argv[1]); td = out / "threads"
idx = {}
for line in (td / "INDEX.tsv").read_text().splitlines():
    if "\t" in line:
        n, u = line.split("\t", 1); idx[n] = u
rows, people, unread = [], set(), []
with (out / "CROWD.txt").open("w", encoding="utf-8") as fh:
    for n, u in idx.items():
        y = td / f"{n}.yaml"
        if not y.exists() or y.stat().st_size == 0:
            md = td / f"{n}.md"
            unread.append((u, "yaml yok" if not md.exists() else "yalnizca sayfa metni"))
            continue
        try:
            d = yaml.safe_load(y.read_text(errors="replace")) or []
        except Exception as e:
            unread.append((u, f"cozulemedi: {e}")); continue
        authors = set(); n_c = 0
        fh.write(f"\n===== {u}\n")
        for c in d if isinstance(d, list) else []:
            if not isinstance(c, dict):
                continue
            a = c.get("author") or "?"
            txt = (c.get("text") or "").replace("\n", " ").strip()
            if c.get("type") != "POST":
                n_c += 1; authors.add(a)
            fh.write(f"{a} | {c.get('score')} | {txt}\n")
        # ONE HUMAN IS ONE HUMAN. This set used to hold (thread, author) PAIRS, so the same
        # person writing in two threads was counted twice and the CEO was shown the larger
        # number. Identity is per PLATFORM, not per thread: the host plus the author name.
        host = u.split("/")[2].lower() if len(u.split("/")) > 2 else u
        people |= {(host, a) for a in authors}
        rows.append((u, n_c, len(authors)))
print(f"{'okunan':>7} {'ayri insan':>11}  adres")
for u, c, a in sorted(rows, key=lambda r: -r[1]):
    print(f"{c:>7} {a:>11}  {u[:80]}")
print(f"\nTOPLAM: {sum(r[1] for r in rows)} yorum · {len(people)} ayri insan · {len(rows)} baslik")
# THE MACHINE'S OWN COUNT, in a line a script can read back. The fleet's summary used to take
# the denominator out of a hunter's prose; it takes it from here now.
print("CROWD-COUNT\t%d\t%d\t%d" % (sum(r[1] for r in rows), len(people), len(rows)))
if unread:
    print("\nACILMAYAN BASLIKLAR — bunlar rapordaki delik listesine girer:")
    for u, why in unread:
        print(f"   {u[:90]}  ({why})")
print(f"\nhepsi tek dosyada: {out}/CROWD.txt")
PYEOF
