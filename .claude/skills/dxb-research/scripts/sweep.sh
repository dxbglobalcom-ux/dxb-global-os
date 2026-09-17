#!/usr/bin/env bash
# Fan a single research query out across every reachable channel, in parallel, in the
# background, and report coverage honestly — including the channels that failed.
#
# Why parallel: a serial sweep makes a session impatient, and an impatient session stops at
# the first plausible answer. That is the defect this whole door was built for (2026-09-16).
# Why failures are printed: a channel that errored is a hole in the research. Today's
# session dropped two dead queries without telling the CEO.
#
# Why this script exports OPENCLI_WINDOW=background instead of passing --window background:
# these adapters drive the CEO's own Chrome (Browser Bridge, Profile 5), and without a
# background instruction a sweep throws twenty tabs across the screen he is working on. He
# caught it the first time this script ran: "genelde arka planda her şey olması lazım".
# The flag is NOT universal — opencli registers --window only inside `if (cmd.browser)`
# (commanderAdapter.js), so every adapter whose help says `Browser: no` exits 1 with
# `error: unknown option '--window'`. Measured 2026-09-16 on 1.8.7: hackernews, stackoverflow,
# bluesky and substack all reject it, and three of them were lost out of a single sweep. The
# environment variable is opencli's own adapter-independent door — the project README: "Set to
# foreground or background to override Browser Bridge window placement. Browser-backed
# commands ALSO accept --window". One door instead of twenty flags, and nothing to reject.
# What it is NOT: a fix for a single non-browser command. A command with no browser never reads
# the variable at all — OPENCLI_WINDOW=bogus opencli hackernews search still exits 0 — so for
# ONE such command the fix is to drop the flag. The export earns its place here because this
# script calls both kinds and the browser-backed ones DO read it (OPENCLI_WINDOW=bogus opencli
# reddit search exits 2: "OPENCLI_WINDOW must be one of: foreground, background").
#
#   sweep.sh "<query>" <outdir> [--tier core|wide|max] [--timeout SECONDS]
#
# Raw output lands in <outdir>/<channel>.raw — one file per channel, untouched, so the
# hunters that read it are reading the source and not a summary of a summary.

set -uo pipefail

# The back door for every opencli call below, browser-backed or not. See the header.
export OPENCLI_WINDOW=background

# THE ONE EDGE THIS EXPORT HAS THAT A PER-CALL FLAG DOES NOT. Precedence is
#   --window  >  OPENCLI_WINDOW  >  the command's own default
# so a blanket export also OVERRIDES a deliberate foreground default. 69 commands declare
# one; 66 are `login`, which exist to be SEEN by the human. Measured 2026-09-16:
# `OPENCLI_WINDOW=bogus opencli mercury check-login` exits 2 with "OPENCLI_WINDOW must be one
# of: foreground, background" — proof the variable reaches them. So nothing in this file may
# call a login verb, and the guard below refuses to run if one ever appears.

QUERY="${1:-}"; OUT="${2:-}"; shift 2 2>/dev/null || true
# DEFAULT = max. His order, 2026-09-17: "20-30 farkli kanalda ayni anda arastirilacak…
# ben ayni anda 100 tane siteden arastirma yapiyormusum gibi arastirma yapip sonuc
# getirecek". `wide` opens 23; `max` opens all 37 channels and costs seconds, not minutes, because
# every channel is fired in parallel. Narrow it by hand only when a question truly has
# one home (--tier core), and say so in the answer.
TIER=max; TMO=180; PAGES=14; WITH_BROWSER=1; NO_READ=0
while [ $# -gt 0 ]; do
  case "$1" in
    --tier) TIER="$2"; shift 2 ;;
    --timeout) TMO="$2"; shift 2 ;;
    --pages) PAGES="$2"; shift 2 ;;
    # WHICH PAGES WOULD THIS SWEEP OPEN? Selecting and reading are two jobs, and until
    # 2026-09-17 nobody could see the first one without paying for the second. The choice is
    # where reading breadth is decided, so it has to be inspectable on its own.
    --no-read) NO_READ=1; shift ;;
    --browser) WITH_BROWSER=1; shift ;;
    --no-browser) WITH_BROWSER=0; shift ;;  # for a run that must not touch his screen at all
    *) shift ;;
  esac
done

if [ -z "$QUERY" ] || [ -z "$OUT" ]; then
  echo "kullanim: sweep.sh \"<sorgu>\" <cikti-klasoru> [--tier core|wide|max] [--timeout SN] [--pages N] [--browser]" >&2
  exit 2
fi
mkdir -p "$OUT"

# The sentences a site prints INSTEAD of content. ONE owner, scripts/rlib.py — the reading
# chain judges by the same list, which it did not until 2026-09-17.

# The run this sweep belongs to, resolved ONCE, here at the start.
# WHICH RUN THIS SWEEP BELONGS TO — ASKED, NEVER GUESSED. These two lines used to read the
# machine-wide `runs/CURRENT` marker directly, which knows nothing about who owns the run.
# Measured 2026-09-17: the shared resolver answered `own-run` while this sweep wrote 1 evidence
# row, 12 queries and 12 tool rows into `peer-run` — another session's ledger.
SWEEP_RUN="${DXB_RESEARCH_RUN:-}"
if [ -z "$SWEEP_RUN" ]; then
  SWEEP_RUN="$(python3 -c "import sys;sys.path.insert(0,'$(dirname "${BASH_SOURCE[0]}")');import rlib;print(rlib.current_run_id() or '')" 2>/dev/null || true)"
fi

# --- the channel map ------------------------------------------------------------------
# Each entry: name|tier|command.
#
# EVERY CHANNEL ASKS FOR ITS MAXIMUM. Measured 2026-09-17, and the CEO caught it in one
# glance: `google.raw` came back 1 971 bytes with SEVEN results while reddit returned
# 149 KB. The engine was not weak — nobody had asked it for more: `opencli google search`
# defaults to 10 results, reddit and twitter to 15, youtube to 20. The floors are raised to
# the adapters' own maxima here (google 50, reddit 50, twitter 50, youtube 50, ddg two pages
# of 10, which is its per-page ceiling). A search engine returns HEADLINES either way — the
# bodies come from the reading chain below, which is why google's file is small by nature
# and reddit's is large: reddit hands back the post text itself.
#   {Q} → the full query, as the CEO would phrase it.
#   {G} → the first four words only. Code forges match tokens, not sentences: measured
#         2026-09-16, `gh search repos "Claude Design Open Design which is better"` returned
#         nothing while the same subject has a 96k-star repository.
#
# Several good communities (lobste.rs, dev.to, Product Hunt, V2EX) ship no keyword-search
# command — verified against `opencli list`, not assumed. Dropping them would leave a hole;
# they are reached through a site-scoped web search instead, which is what a person would do.
export SKILL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UQ=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote_plus(sys.argv[1]))' "$QUERY")
# What {Q}/{G}/{U} become inside a channel line: a variable READ, not the text itself.
Q_REF='$DXB_Q'; G_REF='$DXB_G'; U_REF='$DXB_U'; S_REF='$DXB_S'
# THE BROWSER CHANNELS TAKE TURNS — they do NOT get a session each.
# Two sweeps running at once (the same question in two languages) both drove the session
# named `google` and the second extract read the FIRST one's page: two files, byte for byte
# identical at 15 221 B, for two different queries. The first repair gave each sweep its own
# session name (`dxb<pid>`), and it cost the CEO a window on his screen: an unknown session
# has no tab to attach to, so the Browser Bridge OPENED one — a bare `about:blank` window
# titled "OpenCLI Browser", with Chrome's own "started debugging this browser" banner, in
# front of him while he was working. He saw it within the minute and asked what it was.
# So the names stay the ones the bridge already has bound (`google`, `quora`) — no new window
# is ever created — and the collision is prevented with a lock instead: whichever sweep holds
# `.browser.lock` drives the browser, the other waits its turn.
BSESS="google" 
GQ=$(echo "$QUERY" | awk '{for(i=1;i<=4&&i<=NF;i++) printf "%s%s", $i, (i<4&&i<NF?" ":"")}')
CHANNELS=$(cat <<'MAP'
exa|core|"$SKILL/scripts/mcpx.sh" exa "{Q}" 8
parallel|core|"$SKILL/scripts/mcpx.sh" parallel "{Q}" 8
tavily|core|"$SKILL/scripts/mcpx.sh" tavily "{Q}" 8
firecrawl|core|"$SKILL/scripts/mcpx.sh" firecrawl "{Q}" 8
youcom|core|"$SKILL/scripts/mcpx.sh" youcom "{Q}" 8
google|core|opencli google search "{Q}" --limit 50 -f yaml
# THE CLI DOOR TO GOOGLE IS CAPPED AT ONE PAGE. Measured 2026-09-17: `--limit 50` and
# `--limit 10` both return NINE results — the adapter reads page one and stops, so raising
# the flag changes nothing. The CEO saw the consequence in one glance ("koskoca bir arama
# kaynağı değil mi?"). Google itself is not capped: its own results page, opened through the
# browser bridge that carries his session, hands back 18 external links at num=30 — including
# two Reddit threads the CLI channel never returned. So Google is entered twice, by two
# different doors, and `hl=en` keeps the world's own language in the results.
# (A third, forum-scoped query lived here until 2026-09-17 and was removed on the CEO's
#  order: it returned 0 bytes on a Turkish phrasing, and a channel that fails half the
#  time is a hole the coverage table has to carry for nothing.)
google-deep|browser|flock -w 200 "$SKILL/.browser.lock" -c "opencli browser google open 'https://www.google.com/search?q={U}&num=30&hl=en' --window background >/dev/null 2>&1; opencli browser google extract --window background"
reddit|core|opencli reddit search "{Q}" --limit 50 -f yaml
hackernews|core|opencli hackernews search "{Q}" --limit 50 -f yaml
twitter|core|opencli twitter search "{Q}" --limit 50 -f yaml
github-repos|core|gh search repos "{G}" --limit 15 --json fullName,stargazersCount,description,updatedAt
github-issues|core|gh search issues "{G}" --limit 20 --json repository,title,createdAt,state,url
youtube|core|opencli youtube search "{Q}" --limit 50 -f yaml
duckduckgo|wide|opencli duckduckgo search "{Q}" --limit 10 -f yaml
duckduckgo2|wide|opencli duckduckgo search "{Q}" --limit 10 --offset 10 -f yaml
lobsters|wide|opencli duckduckgo search "site:lobste.rs {Q}" -f yaml
stackoverflow|wide|opencli stackoverflow search "{Q}" --limit 50 -f yaml
medium|wide|opencli medium search "{Q}" --limit 50 -f yaml
devto|wide|opencli duckduckgo search "site:dev.to {Q}" -f yaml
producthunt|wide|opencli duckduckgo search "site:producthunt.com {Q}" -f yaml
bluesky|wide|opencli bluesky search "{Q}" -f yaml
substack|wide|opencli substack search "{Q}" -f yaml
v2ex|wide|opencli duckduckgo search "site:v2ex.com {Q}" -f yaml
# quora: the CEO logged this machine in on 2026-09-17 with his own Google account, and the
# channel changed shape the same minute. It is no longer a DuckDuckGo site-query — it is
# Quora's OWN search page, read through the browser bridge that carries his session. Proof
# from that first read: the page came back as "Profilfoto für Dxb Company", 13 088 chars.
# Before the login every one of the doors then in the chain was walled (RULER-HISTORY: eleven that day). A login is worth more than a
# fallback chain here, and it is the only channel on this list that needed one.
quora-forums|browser|flock -w 200 "$SKILL/.browser.lock" -c "opencli browser quora open 'https://www.quora.com/search?q={U}' --window background >/dev/null 2>&1; opencli browser quora extract --window background"
# QUORA IS READ THROUGH THE SITE, NOT THROUGH ITS SEARCH BOX. Measured 2026-09-17 in the
# audit: the browser door returns Quora's own error page ("Something went wrong") on the
# search page AND on the home page, in English and Turkish, while the session is alive —
# so the site throttles the automated browser, and the login buys nothing here. The same
# minute, a site-scoped Google query returned 8 real question pages and the reading chain
# opened 3 of 3 (42-50 KB each, by the tenth door, jina-reader), carrying real answers.
# So this channel finds the ADDRESSES and the chain takes what is inside them.
quora|wide|opencli google search "site:quora.com {Q}" --limit 20 -f yaml
linkedin|max|opencli linkedin search "{Q}" -f yaml
zhihu|max|opencli zhihu search "{Q}" -f yaml
linux-do|max|opencli linux-do search "{Q}" -f yaml
weibo|max|opencli weibo search "{Q}" -f yaml
rednote|max|opencli rednote search "{Q}" -f yaml
bilibili|max|bili search "{Q}" --type video -n 8
juejin|max|opencli duckduckgo search "site:juejin.cn {Q}" -f yaml
arxiv|max|curl -sS -m 40 "https://export.arxiv.org/api/query?search_query=all:{U}&max_results=10"
crossref|max|curl -sS -m 40 "https://api.crossref.org/works?rows=10&query={U}"
europepmc|max|curl -sS -m 40 "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query={U}&format=json&pageSize=10"
openalex|max|curl -sS -m 40 "https://api.openalex.org/works?per-page=10&search={U}"
github-trending|max|opencli github-trending repos -f yaml
MAP
)

want_tier() {  # core ⊂ wide ⊂ max ; `browser` is NEVER in any of them
  # `browser` IS ITS OWN TIER, AND IT IS ON — HIS RULING, 2026-09-17.
  # `opencli browser … open` drives a real window called "OpenCLI Browser" and brings it to
  # the front; `--window background` cannot hold it back, because that flag places tabs
  # inside his own Chrome, not the bridge's debugging window. It appeared while he was
  # working and he asked what it was — then he ruled on it himself: *"pencere açılımı sorun
  # değil yani iş aksamasın önemli olan bu."* So the two channels that need the bridge
  # (google-deep, quora-forums) run by DEFAULT; `--no-browser` is there for the rare run that
  # must not touch his screen. They cannot be made headless: measured the same day, the whole
  # reading chain against google.com/search returned a 921-byte cached snapshot and
  # nothing else — Google shuts its own results page to every headless reader we have.
  case "$1" in
    browser) [ "$WITH_BROWSER" = "1" ] ;;
    *) case "$TIER" in
         core) [ "$1" = core ] ;;
         wide) [ "$1" = core ] || [ "$1" = wide ] ;;
         max)  return 0 ;;
         *)    [ "$1" = core ] || [ "$1" = wide ] ;;
       esac ;;
  esac
}

echo "sorgu   : $QUERY"
echo "katman  : $TIER   (zaman asimi ${TMO}s/kanal)"
echo "klasor  : $OUT"
echo

# --- the guard, BEFORE anything is fired ------------------------------------------------
# A GUARD THAT LOOKS AFTER THE SHOT IS A WITNESS, NOT A GUARD. It used to stand below the
# fan-out loop: every channel had already been launched in the background by the time it
# looked, so a forbidden command would have run and then been reported. It also knew only
# the word `login`, while the door's own boundary (SKILL.md section 8) forbids every write
# verb — those are the CEO's signature and they stop at him.
if printf '%s' "$CHANNELS" | grep -qE '(^|[|[:space:]])opencli [a-z0-9-]+ (login|post|comment|like|follow|share|join|message|reply|upvote|vote|dm)($|[[:space:]])'; then
  echo "!! DUR: bir kanal satiri yasak bir fiil cagiriyor (giris ya da yazma)." >&2
  echo "   Okumak serbest; yazmak CEO'nun imzasidir ve onda durur (SKILL.md 8)." >&2
  printf '%s' "$CHANNELS" | grep -nE '(^|[|[:space:]])opencli [a-z0-9-]+ (login|post|comment|like|follow|share|join|message|reply|upvote|vote|dm)($|[[:space:]])' >&2
  exit 3
fi

# --- fan out --------------------------------------------------------------------------
n=0
while IFS='|' read -r name tier cmd; do
  [ -z "${name:-}" ] && continue
  # THE MAP'S OWN COMMENTS ARE NOT CHANNELS. Measured 2026-09-17: a `max` sweep reported
  # "50 channels" where 36 existed (RULER-HISTORY) — the 14 explanatory `#` lines in the map were run as
  # channels with an empty command, each producing an empty .raw and a "BOS" row. The
  # coverage table was counting the file's own prose as failed doors.
  case "$name" in \#*) continue ;; esac
  want_tier "$tier" || continue
  n=$((n+1))
  # THE QUESTION IS NEVER PASTED INTO A COMMAND STRING. Measured 2026-09-17: a query
  # carrying `"; touch FILE; echo "` executed, and a query containing `$HOME` expanded —
  # the machine's own path travelled to an outside search box, against this door's own
  # confidentiality rule. The placeholders now become SHELL VARIABLE READS inside the
  # quotes the template already has, so bash passes the text as ONE argument and never
  # re-parses it. Q/G/U are exported to each child below.
  run="${cmd//\{S\}/$S_REF}"
  run="${run//\{Q\}/$Q_REF}"
  run="${run//\{G\}/$G_REF}"
  run="${run//\{U\}/$U_REF}"
  # the same command with any --window flag stripped from the TEMPLATE, for the retry below
  cmd_nw="${cmd// --window background/}"
  run_nw="${cmd_nw//\{S\}/$S_REF}"
  run_nw="${run_nw//\{Q\}/$Q_REF}"
  run_nw="${run_nw//\{G\}/$G_REF}"
  run_nw="${run_nw//\{U\}/$U_REF}"
  (
    DXB_Q="$QUERY" DXB_G="$GQ" DXB_U="$UQ" DXB_S="$BSESS" timeout "$TMO" bash -c "$run" \
        > "$OUT/$name.raw" 2> "$OUT/$name.err"
    rc=$?
    # Safety net for a hand-edited channel line that still carries the flag: an adapter that
    # reads an API directly never opens a browser and rejects --window, so the flag is
    # withdrawn on the evidence of the refusal rather than on a guess about the adapter.
    # It is stripped from the TEMPLATE, never from the interpolated command — a query that
    # itself contains the words "--window background" would otherwise eat the substitution
    # and the retry would re-send the flag. Measured 2026-09-16: that is exactly how
    # stackoverflow, bluesky and substack were lost from one sweep.
    if [ $rc -ne 0 ] && grep -q "unknown option '--window'" "$OUT/$name.err" 2>/dev/null; then
      DXB_Q="$QUERY" DXB_G="$GQ" DXB_U="$UQ" DXB_S="$BSESS" timeout "$TMO" bash -c "$run_nw" \
          > "$OUT/$name.raw" 2> "$OUT/$name.err"
      rc=$?
    fi
    echo "$rc" > "$OUT/$name.code"
  ) &
done <<< "$CHANNELS"


echo "$n kanal aynı anda açıldı — bekleniyor..."
wait
echo

# --- ONE JUDGE, ONE OWNER ---------------------------------------------------------------
# WHAT A CHANNEL RETURNED IS JUDGED BY rlib, NOT BY THIS FILE. Until 2026-09-17 this script
# kept its own copy of the word list and decided with a `grep`, and the two judges then
# disagreed in BOTH directions on the same day: a 135-byte quota notice was stamped `ok`
# (three search engines were reported as five) while a Quora page carrying 420 paragraphs of
# real answers under one banner line was thrown away, four runs in a row. The rule that was
# already right — count the words before calling a banner a wall — lived in rlib and had
# never been carried down. So it is not carried down now either: this script ASKS.
# It is fail-closed: a judge that cannot run is not a reason to call every page sound.
if ! python3 "$SKILL/scripts/rlib.py" --judge-dir "$OUT" > "$OUT/.judge" 2> "$OUT/.judge.err"; then
  echo "!! DUR: hakem (rlib --judge-dir) calistirilamadi — hicbir kanal degerlendirilemez." >&2
  head -c 300 "$OUT/.judge.err" >&2; echo >&2
  exit 4
fi

# --- coverage table, failures included -------------------------------------------------
printf "%-16s %8s %10s  %s\n" "KANAL" "SONUC" "BOYUT" "DURUM"
ok=0; fail=0; empty=0; FAILED_CHANNELS=""
while IFS='|' read -r name tier cmd; do
  [ -z "${name:-}" ] && continue
  # THE MAP'S OWN COMMENTS ARE NOT CHANNELS. Measured 2026-09-17: a `max` sweep reported
  # "50 channels" where 36 existed (RULER-HISTORY) — the 14 explanatory `#` lines in the map were run as
  # channels with an empty command, each producing an empty .raw and a "BOS" row. The
  # coverage table was counting the file's own prose as failed doors.
  case "$name" in \#*) continue ;; esac
  want_tier "$tier" || continue
  code=$(cat "$OUT/$name.code" 2>/dev/null || echo "?")
  size=$(wc -c < "$OUT/$name.raw" 2>/dev/null || echo 0)
  # A rough hit count across the shapes these channels return: yaml list items, json
  # objects, or Exa's "Title:" blocks. grep -c exits 1 on zero matches, so it is wrapped
  # rather than ||'d — an unwrapped `|| echo 0` prints the count AND the fallback.
  hits=$(awk '/^- |^[[:space:]]*\{|^Title:/{n++} END{print n+0}' "$OUT/$name.raw" 2>/dev/null)
  [ -z "$hits" ] && hits=0
  # A PAGE THAT SAYS "SOMETHING WENT WRONG" IS NOT AN ANSWER — AND A BANNER IS NOT A PAGE.
  # The verdict comes from the engine's single judge (rlib.looks_like_wall), computed above
  # for every raw file at once. This script no longer decides it: the old test was a `grep`
  # against a second copy of the word list, and it was size-gated at 60 000 bytes, so the
  # same page would have been accepted unread had it been one byte larger.
  broke=""
  if [ "$(awk -F'\t' -v n="$name" '$1==n{print $2}' "$OUT/.judge" 2>/dev/null)" = "BROKEN" ]; then
    broke=1
  fi
  if [ "$code" != "0" ]; then
    status="FAIL (kod $code) — $(head -c 90 "$OUT/$name.err" 2>/dev/null | tr '\n' ' ')"
    fail=$((fail+1)); FAILED_CHANNELS="$FAILED_CHANNELS $name"
  elif [ -n "$broke" ]; then
    status="FAIL — sayfa kendi hata metnini dondurdu (icerik yok)"
    fail=$((fail+1)); FAILED_CHANNELS="$FAILED_CHANNELS $name"
  elif [ "$size" -lt 40 ]; then
    status="BOS — kanal cevap verdi, sonuc yok"; empty=$((empty+1))
    FAILED_CHANNELS="$FAILED_CHANNELS $name"
  else
    status="ok"; ok=$((ok+1))
  fi
  printf "%-16s %8s %10s  %s\n" "$name" "$hits" "$size" "$status"
done <<< "$CHANNELS"

echo
echo "kapsama: $ok calisti · $empty bos dondu · $fail HATA  (toplam $n kanal)"
[ "$fail" -gt 0 ] && echo "!! HATA veren kanallar arastirmanin deligidir — rapora yazilir, sessizce atlanmaz."

# --- stage 1b: THE FALLBACK CASCADE ------------------------------------------------------
# A declared fallback chain that nothing executes is a comment, not a chain. Every channel
# that FAILED or came back EMPTY now has its declared fallback (config/registry.yaml) fired
# automatically, and the report says which stand-in covered for which hole.
FELL=$(printf '%s\n' "$FAILED_CHANNELS" | tr ' ' '\n' | grep -v '^$' || true)
if [ -n "$FELL" ]; then
  echo
  echo "yedek zinciri devrede — dusen kanallarin yedekleri ateşleniyor:"
  for dead in $FELL; do
    subs=$(python3 - "$SKILL/config/registry.yaml" "$dead" <<'PYEOF'
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(sys.argv[1]).parent.parent / "scripts"))
import rlib
reg = rlib.load_yaml(pathlib.Path(sys.argv[1])).get("channels") or {}
fb = (reg.get(sys.argv[2]) or {}).get("fallback") or []
print(" ".join(fb if isinstance(fb, list) else [str(fb)]))
PYEOF
)
    # `sub` must exist even when this channel has NO stand-in that the map carries. Measured
    # 2026-09-17 on a live ground sweep: with `set -u`, the LAST RESORT test below read an
    # unbound `$sub`, the script died at line 303 — and it died BEFORE stage 2, so that
    # ground read ZERO page bodies and nothing said why. One missing default cost a whole
    # language's reading.
    sub=""
    covered=""
    for sub in $subs; do
      grep -q "^$sub|" <<< "$CHANNELS" || continue
      subcmd=$(grep "^$sub|" <<< "$CHANNELS" | head -1 | cut -d'|' -f3)
      [ -z "$subcmd" ] && continue
      # A stand-in only COVERS the hole when it truly answered. Two lies lived here until
      # 2026-09-17: a substitute that had itself FAILED this round was announced as the
      # cover on nothing but a non-empty file, and the substitute's real exit code was
      # thrown away and replaced with a hardcoded 0 — which ingest.py then read as
      # "returned". Both are gone: the same 40-byte floor as the main table, and the code
      # that is written is the code the command actually returned.
      subcode=$(cat "$OUT/$sub.code" 2>/dev/null || echo "?")
      # `wc -c < missing 2>/dev/null` still prints the shell's own redirect error: the
      # redirections are applied left to right, so the failure happens before stderr is
      # silenced. Test the file first.
      subsize=0; [ -f "$OUT/$sub.raw" ] && subsize=$(wc -c < "$OUT/$sub.raw")
      # A CHANNEL THAT ALREADY RAN IS NOT A COVER. Measured 2026-09-17, in the audit he
      # ordered: 7 of 10 cascade lines said "zaten bu turda calisti, kapak o" — not one
      # NEW byte was fetched for the dead channel, and `quora-forums -> reddit` was
      # announced as a cover although reddit cannot carry Quora's text. It is reported as
      # what it is, and the cascade keeps walking to something that has not run.
      if [ "$subcode" = "0" ] && [ "$subsize" -ge 40 ]; then
        echo "   $dead -> $sub  (bu turda zaten calisti — YENI BAYT YOK, delik duruyor)"
        continue
      fi
      run="${subcmd//\{S\}/$S_REF}"; run="${run//\{Q\}/$Q_REF}"; run="${run//\{G\}/$G_REF}"; run="${run//\{U\}/$U_REF}"
      DXB_Q="$QUERY" DXB_G="$GQ" DXB_U="$UQ" DXB_S="$BSESS" timeout "$TMO" bash -c "$run" \
          > "$OUT/$dead-via-$sub.raw" 2> "$OUT/$dead-via-$sub.err"
      subrc=$?
      sz=$(wc -c < "$OUT/$dead-via-$sub.raw" 2>/dev/null || echo 0)
      echo "$subrc" > "$OUT/$dead-via-$sub.code"
      if [ "$subrc" -eq 0 ] && [ "$sz" -ge 40 ]; then echo "   $dead -> $sub  ok ($sz bayt)"; covered=1; break
      elif [ "$subrc" -ne 0 ]; then echo "   $dead -> $sub  o da HATA (kod $subrc)"
      else echo "   $dead -> $sub  o da bos"; fi
    done

    # LAST RESORT: go to the site ITSELF and read its own search page with the twelve-door
    # chain. The CEO's question, 2026-09-16: "Quora failed — why did the other tools not
    # open Quora?" They never got the chance: a site-scoped channel is a SEARCH-ENGINE query
    # ("site:quora.com …"), so when the engine refuses there is no address for the readers to
    # open. There is one, though — the site's own search page — and nothing was walking to it.
    # The site to walk to. It used to be read ONLY out of a `site:` query, so a channel
    # that reaches its site through a URL (the browser doors) had no last resort at all —
    # measured 2026-09-17: quora-forums fell and nothing ever walked to quora.com.
    dline=$(grep "^$dead|" <<< "$CHANNELS" | head -1)
    site=$(sed -n 's/.*site:\([a-z0-9.-]*\).*/\1/p' <<< "$dline")
    [ -z "$site" ] && site=$(sed -n "s#.*https\?://\([a-z0-9.-]*\).*#\1#p" <<< "$dline")
    # THE COVER IS THE ONE THAT ANSWERED, AND IT IS RECORDED WHERE IT ANSWERS. This used to be
    # inferred here from `$sub` — whatever the loop variable happened to be left at, not the
    # stand-in that worked — and from `-s` alone, so an 80-byte error text counted as a cover.
    # Measured 2026-09-17: three stand-ins failed with exit 7, the last one left 80 bytes of
    # diagnostics, and the walk to lobsters.rs was never attempted.
    if [ -n "$site" ] && [ -z "$covered" ]; then
      echo "   $dead -> son care: $site adresine dogrudan gidiliyor (12 kapili zincir)"
      NB=""; [ "$WITH_BROWSER" = "1" ] || NB="--no-browser"
      timeout "$TMO" python3 "$SKILL/scripts/fetch.py" \
        "https://${site}/search?q=${UQ}" --out "$OUT/$dead-direct.md" ${NB} >/dev/null 2>&1
      dsz=$(wc -c < "$OUT/$dead-direct.md" 2>/dev/null || echo 0)
      if [ "$dsz" -gt 400 ]; then echo "   $dead -> $site  ACILDI ($dsz bayt)"
      else echo "   $dead -> $site  o da acilmadi — delik raporda kalir"; fi
    fi
  done
fi
echo "ham cikti: $OUT/*.raw"

# --- stage 2: read the pages, not the headlines ----------------------------------------
# A search result is a title and a snippet. A quote and a date have to come out of the page
# body, and the 2026-09-16 sweep quoted a vendor's comparison table it had never opened.
# Scrapling turns each page into markdown; one page per file, so a hunter reads the source.
[ "$PAGES" -eq 0 ] && { echo; echo "(sayfa okuma kapali: --pages 0)"; exit 0; }

mkdir -p "$OUT/pages"

# --- stage 2a: WHICH pages to read, round-robin across channels ---------------------------
python3 - "$OUT" "$PAGES" > "$OUT/pages/urls.txt" <<'PYEOF'
# The obvious version - cat every .raw and take the first N distinct urls - reads them in
# glob order, so the channels whose names sort first supply almost every page. Measured on
# this engine's own first run: one channel supplied 69 % of the independent clusters and the
# gate refused it. Reading breadth is built HERE; the gate can only catch its absence after.
import re, sys, pathlib
out, limit = pathlib.Path(sys.argv[1]), int(sys.argv[2])
URL = re.compile(r"https?://[^\s\"'<>)\]},]+")
# The search providers' own domains are INFRASTRUCTURE, not evidence: their docs and favicon
# urls ride in every result payload. Measured - tavily's docs and a you.com favicon became
# evidence rows on the first run.
NOISE = re.compile(r"\.(png|jpe?g|gif|svg|webp|mp4|css|js|ico|woff2?)($|\?)|"
                   r"(twimg|redditstatic|redditmedia|gstatic|googleusercontent|licdn|"
                   r"fbcdn|ytimg|w3\.org|schema\.org|doubleclick|"
                   r"tavily\.com|you\.com|exa\.ai|firecrawl\.dev|parallel\.ai|jina\.ai)", re.I)
# A url lifted out of a SNIPPET is often truncated - google.raw printed
# "dy-sync-bgtest2 open https://creator." and the rstrip below turned that into the host
# "creator", which has no dot and cannot exist. Measured 2026-09-16: 1 url of 237, and it
# burned every door of the reading chain before being reported to the CEO as a page
# that could not be read. A host with no dot-plus-tld is not a page; it never enters the queue.
HOST_OK = re.compile(r"^[A-Za-z0-9._~-]+\.[A-Za-z]{2,}$")


def _host(u):
    parts = u.split("/")
    return parts[2].split("@")[-1].split(":")[0] if len(parts) > 2 else ""


# WHERE PEOPLE TALK IS READ FIRST, AND THE ALPHABET DECIDES NOTHING. The round-robin below
# takes ONE address per channel per round, and it used to visit the channels in glob order.
# Measured 2026-09-17 on a live sweep of this engine: reddit.raw held 245 176 bytes and 445
# addresses, the budget of 14 ran out around `openalex`, and the engine that exists to read
# what people say opened NOT ONE Reddit page. The order is now the job's order.
CROWD = ["reddit", "hackernews", "twitter", "stackoverflow", "youtube", "lobsters",
         "quora", "quora-forums", "v2ex", "zhihu", "linux-do", "weibo", "rednote",
         "bilibili", "juejin", "devto", "bluesky", "substack", "medium"]


def _order(stem):
    return (CROWD.index(stem) if stem in CROWD else len(CROWD) + 1, stem)


per = {}
for raw in sorted(out.glob("*.raw"), key=lambda q: _order(q.stem)):
    seen, keep = set(), []
    for u in URL.findall(raw.read_text(encoding="utf-8", errors="replace")):
        u = u.rstrip(".,);")
        if NOISE.search(u) or u in seen or not HOST_OK.match(_host(u)):
            continue
        seen.add(u); keep.append(u)
    if keep:
        per[raw.stem] = keep
picked, dom, seen = [], {}, set()
guard = 0
while len(picked) < limit and per and guard < limit * 4:
    for ch in list(per):
        if len(picked) >= limit:
            break
        q = per[ch]
        while q:
            u = q.pop(0)
            d = u.split("/")[2] if len(u.split("/")) > 2 else u
            # Two pages per host keeps a search engine from filling the budget with one site.
            # But a crowd channel's whole job is many threads on ONE host, and the same cap was
            # holding reddit.com to two even after it got its turn.
            cap = 6 if ch in CROWD else 2
            if u in seen or dom.get(d, 0) >= cap:
                continue
            seen.add(u); dom[d] = dom.get(d, 0) + 1
            picked.append(u)
            break
        if not q:
            per.pop(ch, None)
    guard += 1
print("\n".join(picked))
PYEOF

total=$(wc -l < "$OUT/pages/urls.txt")
if [ "$NO_READ" = "1" ]; then
  echo
  echo "(okuma kapali: --no-read) secilen $total adres: $OUT/pages/urls.txt"
  sed -n '1,40p' "$OUT/pages/urls.txt"
  exit 0
fi

# --- stage 2b: the READING CHAIN ---------------------------------------------------------
# His order, 2026-09-16: "sayfaya girdi agent reach ile bilgiyi cekicek, cekemiorsa scrapling
# aletiyle cekicek… reddit'i aciyor bakiyor kapatiyor, boyle olmaz."
# So a page is never abandoned after one tool. fetch.py walks nine doors in order and a page
# counts as unread only when EVERY door has failed — and then the log names each one and what
# it answered. Measured on a Cloudflare-walled page: scrapling WALL -> stealth fail ->
# no platform adapter -> tavily-extract OK in 407 ms.
echo
echo "sayfa okuma: $total adres, 12 kapili zincir (video altyazisi -> pdf metni -> scrapling ->"
echo "             stealth -> opencli -> tavily -> firecrawl -> exa -> playwright -> jina -> curl)"
NB=""; [ "$WITH_BROWSER" = "1" ] || NB="--no-browser"
python3 "$SKILL/scripts/fetch.py" --batch "$OUT/pages/urls.txt" --outdir "$OUT/pages" \
        --timeout 45 --workers 6 ${NB} || true

read_ok=$(find "$OUT/pages" -name '*.md' -size +1k 2>/dev/null | wc -l)
python3 - "$OUT/pages/FETCH-LOG.json" <<'PYEOF' || true
import json, re, sys, pathlib
p = pathlib.Path(sys.argv[1])
if p.exists():
    log = json.loads(p.read_text())
    unread = [r for r in log if not r.get("read")]
    doors = {}
    for r in log:
        if r.get("door"):
            doors[r["door"]] = doors.get(r["door"], 0) + 1
    # WHAT IS ON THE DISK, NOT WHAT THE LOG BELIEVES. The old line said "okunan 14/14 ·
    # okunamayan: 0" while four of those fourteen were an XML descriptor, a donation page and
    # two API endpoints — 623, 2 688 and 0 bytes of anything to read. A page counts as read
    # when it carries enough words to be read.
    REAL_WORDS = 200
    real = 0
    for f in sorted(p.parent.glob("*.md")):
        body = f.read_text(errors="replace")
        if len(re.findall(r"[A-Za-z\u00c0-\u024f]{3,}", body)) >= REAL_WORDS:
            real += 1
    print("okunan sayfa: %d (gercek icerikli: %d, >=%d kelime) · okunamayan: %d"
          % (len(log) - len(unread), real, REAL_WORDS, len(unread)))
    if doors:
        print("   hangi kapi acti: " + " · ".join(f"{k}={v}" for k, v in
              sorted(doors.items(), key=lambda kv: -kv[1])))
    for r in unread:
        tried = " -> ".join(a["door"] for a in r.get("attempts", []))
        print("   OKUNAMADI [%s] %s" % (r.get("liveness"), r["url"][:80]))
        print("      denenen butun kapilar: %s" % tried)
    if unread:
        print("   bunlar rapordaki 'bakilamadi' listesine girer — her kapi denendi, hicbiri acmadi")
PYEOF
echo "sayfa govdeleri: $OUT/pages/*.md"

# --- stage 3: the ledger writes itself -------------------------------------------------
# The gate reads the ledger, never the prose. Rows are written HERE, by this script, from
# what actually came back — not by the model, which is how citations get fabricated.
# Silent when no research run is open.
echo
# The run is pinned at LAUNCH. A wide sweep takes minutes, and ingest.py resolves
# runs/CURRENT when it FINISHES — so on 2026-09-16 a sweep begun under one run wrote
# 127 rows into a different run that had been opened meanwhile. Carry the id instead.
python3 "$SKILL/scripts/ingest.py" "$OUT" --query "$QUERY" --gap "opening the ground" ${SWEEP_RUN:+--run "$SWEEP_RUN"} || true

# The bound sessions are NOT closed here. Closing them means the next sweep finds nothing to
# attach to and the bridge opens a fresh window — which is exactly the window the CEO saw on
# 2026-09-17. They are background tabs inside the browser he already runs; they are reused.

exit 0
