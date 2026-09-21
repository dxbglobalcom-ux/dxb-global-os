#!/usr/bin/env bash
# THE B48 RULER — one metre for the builder and the checker, on the CEO's law of 2026-09-15
# (`ruler-table-holding-wide-2026-09-15`: a class with no ruler gets its ruler FIRST, and the
# builder is handed the runnable script before the work).
#
# WHAT THIS MEASURES AND WHAT IT REFUSES TO MEASURE. It judges the FILES A RUN LEFT ON DISK,
# never a printout. The engine's own printed table said "CEVAP HAZIR" over a zero-report run
# once (B46, 2026-09-17), which is why nothing here reads stdout.
#
# THE QUESTION IT ANSWERS, in the CEO's words: "facebook ve instaya giriş yapılıyor ama bilgi
# çekilecek alet ya bulunsun ya da kurulsun". The answer being tested is that the tool was
# already ours and we were writing the address wrong — so the rules below check that the
# addresses now resolve, that the page behind them is the POST and not a sign-up dialog, and
# that the door which opened it was the one carrying his session.
#
# THE BUDGET THIS RULER ASSUMES, said plainly rather than softened. Its acceptance runs are
# defined with `--pages 40`. At the DEFAULT budget of 14 the round-robin gives each of ~21
# crowd channels one slot, so Instagram contributes ONE post page, not three - measured
# 2026-09-21 on all three acceptance runs (head -14 urls.txt -> instagram.com/p/ = 1, 3 of 3).
# That one is equality, not a shortfall, and the threshold is NOT lowered to hide it: a rule
# whose number slides with the budget is two rules wearing one name.
#
# WHAT THIS RULER CANNOT DO, said rather than implied: it CANNOT authenticate a run against
# somebody who owns the filesystem. Two adversarial rounds forged a folder that passes all
# twelve rules, because every signal a run leaves - the raws, the timings, the fetch log -
# is a file the forger can write. What the rules do is make an ACCIDENT impossible: a
# channel that did not run, a page that was never opened, a door that did not carry his
# session, a comment that outlived its measurement. Fraud is not in scope for a metre; it
# is in scope for the audit law (a checker session measures the LIVE machine, not a folder
# handed to it).
#
# Usage:  scripts/b48-ruler.sh <run-dir>          # runs are made with --pages 40
# Exit :  0 only when 12/12 PASS.
#
# The architecture these rules encode was ruled by the chief-engineer session on 2026-09-21
# (Fable 5.1, advisor/checker) and built by the Opus 5 construction session the same hour.
set -uo pipefail

RUN="${1:-}"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILL="$REPO/.claude/skills/dxb-research"

if [ -z "$RUN" ] || [ ! -d "$RUN" ]; then
  echo "kullanim: scripts/b48-ruler.sh <run-dir>" >&2
  exit 2
fi

PASS=0; FAIL=0
declare -a ROWS=()

check() {  # check <name> <ok:0|1> <detail>
  local name="$1" ok="$2" detail="$3"
  if [ "$ok" = "0" ]; then
    PASS=$((PASS+1)); ROWS+=("$(printf '  PASS  %-26s %s' "$name" "$detail")")
  else
    FAIL=$((FAIL+1)); ROWS+=("$(printf '  FAIL  %-26s %s' "$name" "$detail")")
  fi
}

URLS="$RUN/pages/urls.txt"
FB="$RUN/facebook.raw"
IGRAW="$RUN/instagram.raw"

# ---- R1 the bridge's relative post links became addresses the queue can see ---------------
n_ig_urls=$(grep -c 'https://www\.instagram\.com/p/' "$URLS" 2>/dev/null || true)
[ -z "$n_ig_urls" ] && n_ig_urls=0
check "relative-links-resolved" "$([ "$n_ig_urls" -ge 3 ] && echo 0 || echo 1)" \
      "urls.txt icinde instagram.com/p/ adresi: $n_ig_urls (>=3)"

# ---- R2 one of those addresses was actually opened and has a body -------------------------
ig_page=""; ig_bytes=0
# THE FILE MUST BE THE POST, NOT A PAGE THAT MENTIONS ONE. The first version took the largest
# pages/*.md whose TEXT contained "instagram.com/p/", and an adversarial run proved it: a cat
# blog that linked to an Instagram post was picked and passed R2 and R3. The reading chain
# names each file after the host it came from, and the file carries the url it was read from.
while IFS= read -r f; do
  [ -f "$f" ] || continue
  case "$(basename "$f")" in *instagram.com*) : ;; *) continue ;; esac
  if grep -qE '"url"[[:space:]]*:[[:space:]]*"https://www\.instagram\.com/p/' "$f" 2>/dev/null; then
    b=$(wc -c < "$f")
    if [ "$b" -gt "$ig_bytes" ]; then ig_bytes="$b"; ig_page="$f"; fi
  fi
done < <(find "$RUN/pages" -maxdepth 1 -type f \( -name '*.md' -o -name '*.txt' \) 2>/dev/null)
check "instagram-page-read" "$([ -n "$ig_page" ] && [ "$ig_bytes" -ge 2000 ] && echo 0 || echo 1)" \
      "en buyuk instagram gonderi sayfasi: ${ig_bytes} bayt ${ig_page:+($(basename "$ig_page"))} (>=2000)"

# ---- R3 that body is the POST, not Instagram's sign-up dialog -----------------------------
if [ -n "$ig_page" ]; then
  tot=$(wc -l < "$ig_page"); [ "$tot" -lt 1 ] && tot=1
  walls=$(grep -ci 'log in\|sign up' "$ig_page" 2>/dev/null || true)
  [ -z "$walls" ] && walls=0
  pct=$(( walls * 100 / tot ))
  # The dialog's own wording is exact; a real post page never carries it.
  dlg=$(grep -ci 'sign up for instagram to stay in the loop\|never miss a post from' "$ig_page" 2>/dev/null || true)
  [ -z "$dlg" ] && dlg=1
  ok=1; { [ "$pct" -lt 10 ] && [ "$dlg" -eq 0 ]; } && ok=0
  check "instagram-not-a-wall" "$ok" "giris satiri %$pct (<10), kayit diyalogu $dlg (=0)"
else
  check "instagram-not-a-wall" 1 "olculecek sayfa yok (R2 dustu)"
fi

# ---- R4 the door that opened it carried his session ---------------------------------------
# R4 JUDGES THE DOOR OF THE FILE R2 ACTUALLY MEASURED, not the first Instagram row in the
# log. An adversarial check separated them: the page R2 scored was recorded as read by
# `curl`, an EARLIER row still said `browser-signed-in`, and both rules passed. Two rules
# that are supposed to be about one page must be about the SAME page.
log="$RUN/pages/FETCH-LOG.json"
door=""
ig_url=""
[ -n "$ig_page" ] && ig_url=$(grep -oE '"url"[[:space:]]*:[[:space:]]*"https://www\.instagram\.com/p/[^"]+"' "$ig_page" 2>/dev/null | head -1 | sed -E 's/.*"(https[^"]+)"/\1/')
if [ -f "$log" ] && [ -n "$ig_url" ]; then
  door=$(python3 - "$log" "$ig_url" <<'PY' 2>/dev/null
import json, sys
try:
    rows = json.load(open(sys.argv[1], encoding="utf-8"))
except Exception:
    sys.exit(0)
want = sys.argv[2].rstrip("/")
if isinstance(rows, dict):
    rows = rows.get("pages") or rows.get("rows") or list(rows.values())
for r in rows if isinstance(rows, list) else []:
    if isinstance(r, dict) and str(r.get("url", "")).rstrip("/") == want:
        print(r.get("door") or r.get("opened_by") or "")
        break
PY
)
fi
# ONLY A DOOR THAT CARRIES HIS SESSION COUNTS. The first version also accepted `scrapling` and
# `scrapling-stealth`, which is exactly the door that served Instagram's sign-up dialog as if
# it were the post - 24 162 bytes, ok=true, wall=false, and not one word of the post in it.
# A rule that accepts the failure it exists to catch is not a rule.
case "$door" in
  browser-signed-in) r4=0 ;;
  *) r4=1 ;;
esac
check "which-door" "$r4" "R2'nin olctugu sayfayi acan kapi: ${door:-<yok>} (yalniz browser-signed-in)"

# ---- R5 facebook is a BODY channel and the body is there -----------------------------------
fb_bytes=$( [ -f "$FB" ] && wc -c < "$FB" || echo 0 )
[ -z "$fb_bytes" ] && fb_bytes=0
check "facebook-body" "$([ "$fb_bytes" -ge 10000 ] && echo 0 || echo 1)" \
      "facebook.raw: $fb_bytes bayt (>=10000)"

# ---- R6 the "See more" fold was opened before the read -------------------------------------
fb_fold=$( [ -f "$FB" ] && grep -c 'See more' "$FB" || true )
# a missing file is a failure, not a zero
[ -z "$fb_fold" ] && fb_fold=1
check "facebook-see-more-clicked" "$([ "$fb_fold" -eq 0 ] && echo 0 || echo 1)" \
      "facebook.raw icinde kalan 'See more': $fb_fold (=0)"

# ---- R7 more than one voice on that page ----------------------------------------------------
# R7 kirmizi/yesil ayraci degil, 'tek ses degil' tabanidir (esik >=2, olculen 3-2-2-2-2);
# ayrac R1-R4.
fb_voices=0
if [ -f "$FB" ]; then
  # HOW A FACEBOOK POST NAMES ITS AUTHOR, measured 2026-09-21 on a real run: not as
  # facebook.com/<name> and not as profile.php, but as /groups/<gid>/user/<uid> - a group
  # search page addresses people through the group they posted in. Both forms are counted.
  fb_voices=$( { grep -oE '/groups/[0-9]+/user/[0-9]+' "$FB" || true; \
                 grep -oE 'facebook\.com/[A-Za-z0-9._-]{3,}' "$FB" \
                   | sed -E 's#.*facebook\.com/##' \
                   | grep -viE '^(search|groups|commerce|stories|marketplace|watch|reel|photo|events|help|policies|privacy|login|profile|profile\.php|l\.php|sharer\.php|permalink\.php|photo\.php)$' \
                   || true; } | sort -u | wc -l)
fi
# R7 IS NOT THE RED/GREEN DISCRIMINATOR - it is the floor that says "more than one voice, not
# one". The discriminator is R1-R4. Measured 2026-09-21: at a threshold of 2 the pre-change run
# also passes this rule, and that is correct - what the change fixed is addresses and doors,
# not how many people Facebook shows.
# THE THRESHOLD IS 2, AND HOW IT GOT THERE IS PART OF THE RULE. It was first set at 3 on a
# count that was leaking: `l.php` (Facebook's link redirector) and `profile.php` were being
# counted as people. With the leak closed the measured distribution over five runs of the
# same command is 3 · 2 · 2 · 2 · 2. The rule's claim is "more than one voice, not one", and
# the measured reality says that with 2. This is NOT a threshold lowered to let the work
# through - it is a threshold that was set on bad data and re-set on measured data. The
# number itself stays printed on every run so the drift stays visible.
check "facebook-voices" "$([ "$fb_voices" -ge 2 ] && echo 0 || echo 1)" \
      "ayri yazar/sayfa: $fb_voices (>=2; olculen dagilim 3-2-2-2-2, 2026-09-21)"

# ---- R8 neither browser channel held the shared lock too long --------------------------------
tim="$RUN/.timing"
# A CHANNEL THAT NEVER RAN IS NOT A FAST CHANNEL. Measured against a forged run: a .timing
# saying `facebook 0` scored PASS, because 0 is less than 60. Zero seconds is not a browser
# opening a page; it is the row of a channel that did not happen.
worst=0; worst_ch=""; too_fast=""
for ch in facebook instagram; do
  s=$(awk -F'\t' -v c="$ch" '$1==c{print $2}' "$tim" 2>/dev/null | head -1)
  [ -z "$s" ] && s=999
  [ "$s" -lt 1 ] && too_fast="$too_fast $ch"
  if [ "$s" -gt "$worst" ]; then worst="$s"; worst_ch="$ch"; fi
done
check "lock-hold" "$([ "$worst" -le 60 ] && [ -z "$too_fast" ] && echo 0 || echo 1)" \
      "en uzun tutan: ${worst_ch:-<yok>} ${worst}s (<=60)${too_fast:+ · 0s kosan:$too_fast}"

# ---- R9 LAW A: the sentence his measurement overturned is gone --------------------------------
thin=$(grep -c 'THIN BY CONSTRUCTION' "$SKILL/scripts/sweep.sh" 2>/dev/null || true)
[ -z "$thin" ] && thin=1
check "static-no-thin-comment" "$([ "$thin" -eq 0 ] && echo 0 || echo 1)" \
      "sweep.sh icinde 'THIN BY CONSTRUCTION': $thin (=0, KANUN A)"

# ---- R10 the join lives in ONE place -----------------------------------------------------------
j_sweep=$(grep -c 'urljoin' "$SKILL/scripts/sweep.sh" 2>/dev/null || true)
[ -z "$j_sweep" ] && j_sweep=0
j_other=0
# EVERY FILE NAMED HERE MUST EXIST, or the rule quietly audits fewer files than it claims.
# Measured: scripts/merge.py was named and is not there, so the count came from two files
# while the message said three.
for f in "$SKILL/scripts/ingest.py" "$SKILL/hooks/ledger-capture.py"; do
  if [ ! -f "$f" ]; then j_other=$((j_other+1)); continue; fi
  c=$(grep -c 'urljoin' "$f" 2>/dev/null || true); [ -z "$c" ] && c=0
  j_other=$(( j_other + c ))
done
check "static-urljoin-present" "$([ "$j_sweep" -ge 1 ] && [ "$j_other" -eq 0 ] && echo 0 || echo 1)" \
      "sweep.sh: $j_sweep (>=1) · ingest/ledger-capture: $j_other (=0, eksik dosya da sayilir)"

# ---- R12 the two channel files really came from those two sites ----------------------------
# WHY THIS RULE EXISTS: an adversarial run built a forged folder - a cat blog, some lorem
# ipsum and a garden-tools page - and the other eleven rules passed it 11/11 with exit 0.
# Nothing measured that the bytes came from Facebook or Instagram at all. The bridge writes
# the address it read into the JSON it returns, so the file states its own origin.
fb_from=0; ig_from=0
[ -f "$FB" ] && fb_from=$(grep -cE '"url"[[:space:]]*:[[:space:]]*"https://www\.facebook\.com/search/posts/' "$FB" 2>/dev/null || true)
[ -f "$IGRAW" ] && ig_from=$(grep -cE '"url"[[:space:]]*:[[:space:]]*"https://www\.instagram\.com/explore/search/' "$IGRAW" 2>/dev/null || true)
[ -z "$fb_from" ] && fb_from=0
[ -z "$ig_from" ] && ig_from=0
check "channels-are-genuine" "$([ "$fb_from" -ge 1 ] && [ "$ig_from" -ge 1 ] && echo 0 || echo 1)" \
      "facebook.raw kaynagi $fb_from · instagram.raw kaynagi $ig_from (ikisi de >=1)"

# ---- R11 the engine's own ruler is still green --------------------------------------------------
if bash "$REPO/scripts/research-ruler.sh" >/dev/null 2>&1; then r11=0; else r11=1; fi
check "research-ruler-green" "$r11" "scripts/research-ruler.sh cikis kodu $r11 (=0)"

echo "B48 RULER — $(basename "$RUN")"
printf '%s\n' "${ROWS[@]}"
echo "$PASS/$((PASS+FAIL)) PASS, $FAIL failures"
[ "$FAIL" -eq 0 ]
