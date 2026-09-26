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
# Every opencli below goes through bin/opencli first (2026-09-24): each thread gets its own window
# in the hidden research Chrome, so parallel reads can never drive, and overwrite, one shared tab.
export PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/bin:$PATH"

URLS="${1:-}"; OUT="${2:-}"; shift 2 2>/dev/null || true
W=6; TMO=180
DATES=""   # url<TAB>YYYY-MM-DD, built by whoever opened the ground (it is the one that knows)
while [ $# -gt 0 ]; do
  case "$1" in
    --workers) W="$2"; shift 2 ;;
    --timeout) TMO="$2"; shift 2 ;;
    --dates) DATES="$2"; shift 2 ;;
    *) shift ;;
  esac
done
[ -z "$URLS" ] || [ -z "$OUT" ] && { echo "kullanim: crowd.sh <adres-dosyasi> <cikti> [--workers N]" >&2; exit 2; }
[ -f "$URLS" ] || { echo "adres dosyasi yok: $URLS" >&2; exit 2; }
mkdir -p "$OUT/threads"

# ── THE THREAD CARRIES ITS DATE ──────────────────────────────────────────────────────────
# A comment rarely has an obtainable date; a thread does, so the thread's date travels with
# every quote. Measured 2026-09-20 at the source: NO reader on this machine hands back a comment's date — `opencli reddit read` and
# `opencli hackernews read` both declare `type, author, score, text` and nothing else, no flag
# adds one, and Reddit's own JSON answers 403 here. The THREAD's date is another matter and it
# IS reachable: `opencli reddit search` returns `created_utc` beside every url, and Hacker News
# hands `created_at` over for free. So the thread's date travels with every quote, and a thread
# whose date could not be established says so in the word the report must print: TARIHSIZ.
DATEMAP="$OUT/threads/DATES.tsv"
: > "$DATEMAP"
[ -n "$DATES" ] && [ -f "$DATES" ] && cp "$DATES" "$DATEMAP"
# Hacker News fills its own gap — one free call per thread, no key, no browser.
while read -r u; do
  case "$u" in *news.ycombinator.com/item*) ;; *) continue ;; esac
  grep -qF "$u" "$DATEMAP" 2>/dev/null && continue
  id="${u##*id=}"; id="${id%%[!0-9]*}"
  [ -z "$id" ] && continue
  d=$(timeout 20 curl -s "https://hn.algolia.com/api/v1/items/$id" 2>/dev/null \
      | python3 -c "import sys,json;print((json.load(sys.stdin).get('created_at') or '')[:10])" 2>/dev/null)
  [ -n "$d" ] && printf '%s\t%s\n' "$u" "$d" >> "$DATEMAP"
done < "$URLS"

read_one() {
  local u="$1" out="$2" tmo="$3"
  local n; n=$(printf '%s' "$u" | md5sum | cut -c1-10)
  # EACH PLATFORM IS READ BY ITS OWN READER. Measured 2026-09-20: every Hacker News thread
  # harvested by the fleet was handed to the REDDIT reader, which refused it by argument —
  # "Post URL must be an https reddit.com URL" — and the page-text fallback it fell back to is
  # not counted by the parser below. So HN contributed ZERO people to every crowd count this
  # engine has ever printed, silently, while its threads sat in the address list.
  local rc=0
  case "$u" in
    *news.ycombinator.com/item*)
      local hid="${u##*id=}"; hid="${hid%%[!0-9]*}"
      timeout "$tmo" opencli hackernews read "$hid" -f yaml \
          > "$out/threads/$n.yaml" 2> "$out/threads/$n.err"
      rc=$?
      ;;
    *)
      # FULL POWER, always. The flags are the manual's own, and `--expand-more` follows the
      # "[+N more replies]" stubs the default read silently drops.
      timeout "$tmo" opencli reddit read "$u" \
          --limit 100 --depth 10 --replies 50 --expand-more true --expand-rounds 5 \
          -f yaml > "$out/threads/$n.yaml" 2> "$out/threads/$n.err"
      rc=$?
      # FULL POWER MAY NOT COST THE WHOLE THREAD. Measured 2026-09-20 on a 519-comment thread:
      # the expansion pass came back with "unplaceable comments" and the command exited 1 with
      # an EMPTY file — 519 comments lost because the extra replies could not be placed. A
      # degraded read is an answer; a lost thread is a hole. So the same read is taken once more
      # without the expansion before the page-text fallback is even considered.
      if [ $rc -ne 0 ] || [ ! -s "$out/threads/$n.yaml" ]; then
        timeout "$tmo" opencli reddit read "$u" --limit 100 --depth 10 --replies 50 \
            -f yaml > "$out/threads/$n.yaml" 2>> "$out/threads/$n.err"
        rc=$?
      fi
      ;;
  esac
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
# HIS RULING, 2026-09-20: the THREAD's date is what a quote is checked against.
dates = {}
dp = td / "DATES.tsv"
if dp.exists():
    for line in dp.read_text(errors="replace").splitlines():
        if "\t" in line:
            u_, d_ = line.split("\t", 1)
            dates[u_.strip()] = d_.strip()[:10]
undated = []
# CROWD.txt IS WRITTEN WHOLE OR NOT AT ALL (B56 K2): opened "w" in place, a re-run that failed half-way
# wiped the earlier run's comments; now it is written beside, as CROWD.txt.tmp, and renamed over it.
tmp = out / "CROWD.txt.tmp"
with tmp.open("w", encoding="utf-8") as fh:
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
        when = dates.get(u) or "TARIHSIZ"
        if when == "TARIHSIZ":
            undated.append(u)
        fh.write(f"\n===== {u}   [BASLIK TARIHI: {when}]\n")
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
        rows.append((u, n_c, len(authors), when))
tmp.replace(out / "CROWD.txt")
print(f"{'okunan':>7} {'ayri insan':>11} {'baslik tarihi':>14}  adres")
for u, c, a, when in sorted(rows, key=lambda r: -r[1]):
    print(f"{c:>7} {a:>11} {when:>14}  {u[:72]}")
print(f"\nTOPLAM: {sum(r[1] for r in rows)} yorum · {len(people)} ayri insan · {len(rows)} baslik")
# A DATE THAT COULD NOT BE ESTABLISHED IS PRINTED, NEVER PASSED OVER. The door refuses an
# undated quote — a quote is checked against the date of its thread; it can only do that if the count
# is in front of it.
print(f"TARIHSIZ: {len(undated)}/{len(rows)} baslik" + (" — " + ", ".join(u[:60] for u in undated[:3]) if undated else ""))
# THE MACHINE'S OWN COUNT, in a line a script can read back. The fleet's summary used to take
# the denominator out of a hunter's prose; it takes it from here now.
print("CROWD-COUNT\t%d\t%d\t%d" % (sum(r[1] for r in rows), len(people), len(rows)))
if unread:
    print("\nACILMAYAN BASLIKLAR — bunlar rapordaki delik listesine girer:")
    for u, why in unread:
        print(f"   {u[:90]}  ({why})")
print(f"\nhepsi tek dosyada: {out}/CROWD.txt")
PYEOF
