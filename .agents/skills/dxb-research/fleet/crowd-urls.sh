#!/usr/bin/env bash
# THE CROWD'S THREADS, TAKEN OUT OF THE GROUNDS — one thread, one line.
#
# fleet.sh counts the people in the threads its own grounds found (scripts/crowd.sh); this is
# where those thread addresses are harvested from the grounds' raw files. A page read as MARKDOWN
# carries markdown's escapes, so the same Reddit thread arrived twice — once as
#   https://www.reddit.com/r/x/comments/abc123/update\_employee\_rules/
# and once clean — and crowd.sh was handed an address with backslashes in it (2026-09-24).
# So the escapes \_ \- \. \* \( \) \[ \] \# are undone, and what a sentence or a link leaves on
# the end — ) ] > * . , — is cut off, BEFORE the de-dup.
#
#   crowd-urls.sh GROUND_DIR [...]      sorted and de-duplicated on stdout; fleet.sh caps the count
set -u
for gd in "$@"; do
  grep -ohE 'https?://(www\.)?(reddit\.com/r/[^ "]+/comments/[^ "]+|news\.ycombinator\.com/item\?id=[0-9]+)' \
    "$gd"/*.raw 2>/dev/null
done | sed -E 's/\\([]_.*()#[-])/\1/g; s/[])>*.,]+$//' | sort -u
