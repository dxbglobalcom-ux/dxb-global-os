#!/usr/bin/env bash
# THE CROWD'S THREADS, FROM THE RUN'S LEDGER FIRST — one thread, one line.
#
# fleet.sh counts the people in the threads of its run (scripts/crowd.sh); this is where those thread
# addresses are harvested. FROM THE LEDGER (B56 K2): measured on the K1 run, this file handed crowd.sh
# 0 threads while the ledger held 177 Reddit addresses — it grepped the grounds' raw files only, and
# the grounds had turned those threads into rows. So the threads come from `evidence.py list <run>
# --platform reddit|hackernews` first: the rows with a body (liveness `alive`), each cut back to its
# thread (a comment's address ends at /comments/<id>), de-duplicated in the ledger's order, at most
# --cap of them (fleet.sh's --crowd-cap, 40).
#
# THE GROUNDS' RAW FILES STAY THE FALLBACK, when the ledger yields no thread. A page read as MARKDOWN
# carries markdown's escapes, so the same Reddit thread arrived twice — once as
#   https://www.reddit.com/r/x/comments/abc123/update\_employee\_rules/
# and once clean — and crowd.sh was handed an address with backslashes in it (2026-09-24).
# So the escapes \_ \- \. \* \( \) \[ \] \# are undone, and what a sentence or a link leaves on
# the end — ) ] > * . , — is cut off, BEFORE the de-dup.
#
#   crowd-urls.sh <run> [--cap N] GROUND_DIR [...]    the threads on stdout; one line on stderr,
#                                                     `crowd-urls: <n> baslik (defterden|zeminden)`
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EVI="$HERE/../scripts/evidence.py"
RUN="${1:?kullanim: crowd-urls.sh <kosu> [--cap N] ZEMIN...}"; shift
CAP=40; GROUNDS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --cap) CAP="${2:?--cap bir sayi ister}"; shift 2 ;;
    *) GROUNDS+=("$1"); shift ;;
  esac
done

from_ledger() {
  local p
  for p in reddit hackernews; do python3 "$EVI" list "$RUN" --platform "$p" 2>/dev/null; done \
    | awk -F'\t' '$4 == "alive" { print $2 }' \
    | sed -E 's|(/comments/[A-Za-z0-9_]+)([/?#].*)?$|\1|' \
    | grep -E '^https?://([a-z0-9-]+\.)*(reddit\.com/(r/[^/]+/)?comments/[A-Za-z0-9_]+|news\.ycombinator\.com/item\?id=[0-9]+)$' \
    | awk '!seen[$0]++'
}

from_ground() {
  local gd
  for gd in ${GROUNDS[@]+"${GROUNDS[@]}"}; do
    grep -ohE 'https?://(www\.)?(reddit\.com/r/[^ "]+/comments/[^ "]+|news\.ycombinator\.com/item\?id=[0-9]+)' \
      "$gd"/*.raw 2>/dev/null
  done | sed -E 's/\\([]_.*()#[-])/\1/g; s/[])>*.,]+$//' | sort -u
}

threads="$(from_ledger)"; src=defterden
[ -n "$threads" ] || { threads="$(from_ground)"; src=zeminden; }
threads="$(printf '%s\n' "$threads" | grep . | head -n "$CAP")"
n=$(printf '%s\n' "$threads" | grep -c .)
[ "$n" -gt 0 ] && printf '%s\n' "$threads"
[ "$n" -gt 0 ] || src="defterde ve zeminde yok"
echo "crowd-urls: $n baslik ($src)" >&2
