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
# getirecek". `wide` opened 22; `max` opens 33 and costs seconds, not minutes, because
# every channel is fired in parallel. Narrow it by hand only when a question truly has
# one home (--tier core), and say so in the answer.
TIER=max; TMO=180; PAGES=14
while [ $# -gt 0 ]; do
  case "$1" in
    --tier) TIER="$2"; shift 2 ;;
    --timeout) TMO="$2"; shift 2 ;;
    --pages) PAGES="$2"; shift 2 ;;
    *) shift ;;
  esac
done

if [ -z "$QUERY" ] || [ -z "$OUT" ]; then
  echo "kullanim: sweep.sh \"<sorgu>\" <cikti-klasoru> [--tier core|wide|max] [--timeout SN] [--pages N]" >&2
  exit 2
fi
mkdir -p "$OUT"

# The run this sweep belongs to, resolved ONCE, here at the start.
SWEEP_RUN="${DXB_RESEARCH_RUN:-}"
[ -z "$SWEEP_RUN" ] && SWEEP_RUN="$(cat "$(dirname "${BASH_SOURCE[0]}")/../runs/CURRENT" 2>/dev/null || true)"

# --- the channel map ------------------------------------------------------------------
# Each entry: name|tier|command.
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
GQ=$(echo "$QUERY" | awk '{for(i=1;i<=4&&i<=NF;i++) printf "%s%s", $i, (i<4&&i<NF?" ":"")}')
CHANNELS=$(cat <<'MAP'
exa|core|"$SKILL/scripts/mcpx.sh" exa "{Q}" 8
parallel|core|"$SKILL/scripts/mcpx.sh" parallel "{Q}" 8
tavily|core|"$SKILL/scripts/mcpx.sh" tavily "{Q}" 8
firecrawl|core|"$SKILL/scripts/mcpx.sh" firecrawl "{Q}" 8
youcom|core|"$SKILL/scripts/mcpx.sh" youcom "{Q}" 8
google|core|opencli google search "{Q}" -f yaml
reddit|core|opencli reddit search "{Q}" -f yaml
hackernews|core|opencli hackernews search "{Q}" -f yaml
twitter|core|opencli twitter search "{Q}" -f yaml
github-repos|core|gh search repos "{G}" --limit 15 --json fullName,stargazersCount,description,updatedAt
github-issues|core|gh search issues "{G}" --limit 20 --json repository,title,createdAt,state,url
youtube|core|opencli youtube search "{Q}" -f yaml
duckduckgo|wide|opencli duckduckgo search "{Q}" -f yaml
lobsters|wide|opencli duckduckgo search "site:lobste.rs {Q}" -f yaml
stackoverflow|wide|opencli stackoverflow search "{Q}" -f yaml
medium|wide|opencli medium search "{Q}" -f yaml
devto|wide|opencli duckduckgo search "site:dev.to {Q}" -f yaml
producthunt|wide|opencli duckduckgo search "site:producthunt.com {Q}" -f yaml
bluesky|wide|opencli bluesky search "{Q}" -f yaml
substack|wide|opencli substack search "{Q}" -f yaml
v2ex|wide|opencli duckduckgo search "site:v2ex.com {Q}" -f yaml
# quora: the CEO logged this machine in on 2026-09-17 with his own Google account, and the
# channel changed shape the same minute. It is no longer a DuckDuckGo site-query — it is
# Quora's OWN search page, read through the browser bridge that carries his session. Proof
# from that first read: the page came back as "Profilfoto für Dxb Company", 13 088 chars.
# Before the login every one of the eleven doors was walled. A login is worth more than a
# fallback chain here, and it is the only channel on this list that needed one.
quora-forums|wide|opencli browser quora open "https://de.quora.com/search?q={U}" --window background >/dev/null 2>&1; opencli browser quora extract --window background
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
github-trending|max|opencli github-trending repos -f yaml
MAP
)

want_tier() {  # core ⊂ wide ⊂ max
  case "$TIER" in
    core) [ "$1" = core ] ;;
    wide) [ "$1" = core ] || [ "$1" = wide ] ;;
    max)  return 0 ;;
    *)    [ "$1" = core ] || [ "$1" = wide ] ;;
  esac
}

echo "sorgu   : $QUERY"
echo "katman  : $TIER   (zaman asimi ${TMO}s/kanal)"
echo "klasor  : $OUT"
echo

# --- fan out --------------------------------------------------------------------------
n=0
while IFS='|' read -r name tier cmd; do
  [ -z "${name:-}" ] && continue
  want_tier "$tier" || continue
  n=$((n+1))
  run="${cmd//\{Q\}/$QUERY}"
  run="${run//\{G\}/$GQ}"
  run="${run//\{U\}/$UQ}"
  # the same command with any --window flag stripped from the TEMPLATE, for the retry below
  cmd_nw="${cmd// --window background/}"
  run_nw="${cmd_nw//\{Q\}/$QUERY}"
  run_nw="${run_nw//\{G\}/$GQ}"
  run_nw="${run_nw//\{U\}/$UQ}"
  (
    timeout "$TMO" bash -c "$run" > "$OUT/$name.raw" 2> "$OUT/$name.err"
    rc=$?
    # Safety net for a hand-edited channel line that still carries the flag: an adapter that
    # reads an API directly never opens a browser and rejects --window, so the flag is
    # withdrawn on the evidence of the refusal rather than on a guess about the adapter.
    # It is stripped from the TEMPLATE, never from the interpolated command — a query that
    # itself contains the words "--window background" would otherwise eat the substitution
    # and the retry would re-send the flag. Measured 2026-09-16: that is exactly how
    # stackoverflow, bluesky and substack were lost from one sweep.
    if [ $rc -ne 0 ] && grep -q "unknown option '--window'" "$OUT/$name.err" 2>/dev/null; then
      timeout "$TMO" bash -c "$run_nw" > "$OUT/$name.raw" 2> "$OUT/$name.err"
      rc=$?
    fi
    echo "$rc" > "$OUT/$name.code"
  ) &
done <<< "$CHANNELS"

if printf '%s' "$CHANNELS" | grep -qE '(^|[|[:space:]])opencli [a-z0-9-]+ login($|[[:space:]])'; then
  echo "!! DUR: bir kanal satiri bir 'login' komutu cagiriyor. OPENCLI_WINDOW=background onu" >&2
  echo "   arka plana zorlar ve CEO o pencereyi goremez. Kanal satirini duzelt." >&2
  exit 3
fi

echo "$n kanal aynı anda açıldı — bekleniyor..."
wait
echo

# --- coverage table, failures included -------------------------------------------------
printf "%-16s %8s %10s  %s\n" "KANAL" "SONUC" "BOYUT" "DURUM"
ok=0; fail=0; empty=0; FAILED_CHANNELS=""
while IFS='|' read -r name tier cmd; do
  [ -z "${name:-}" ] && continue
  want_tier "$tier" || continue
  code=$(cat "$OUT/$name.code" 2>/dev/null || echo "?")
  size=$(wc -c < "$OUT/$name.raw" 2>/dev/null || echo 0)
  # A rough hit count across the shapes these channels return: yaml list items, json
  # objects, or Exa's "Title:" blocks. grep -c exits 1 on zero matches, so it is wrapped
  # rather than ||'d — an unwrapped `|| echo 0` prints the count AND the fallback.
  hits=$(awk '/^- |^[[:space:]]*\{|^Title:/{n++} END{print n+0}' "$OUT/$name.raw" 2>/dev/null)
  [ -z "$hits" ] && hits=0
  if [ "$code" != "0" ]; then
    status="FAIL (kod $code) — $(head -c 90 "$OUT/$name.err" 2>/dev/null | tr '\n' ' ')"
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
    for sub in $subs; do
      grep -q "^$sub|" <<< "$CHANNELS" || continue
      subcmd=$(grep "^$sub|" <<< "$CHANNELS" | head -1 | cut -d'|' -f3)
      [ -z "$subcmd" ] && continue
      [ -s "$OUT/$sub.raw" ] && { echo "   $dead -> $sub (zaten bu turda calisti, kapak o)"; break; }
      run="${subcmd//\{Q\}/$QUERY}"; run="${run//\{G\}/$GQ}"; run="${run//\{U\}/$UQ}"
      timeout "$TMO" bash -c "$run" > "$OUT/$dead-via-$sub.raw" 2>/dev/null
      sz=$(wc -c < "$OUT/$dead-via-$sub.raw" 2>/dev/null || echo 0)
      echo 0 > "$OUT/$dead-via-$sub.code"
      if [ "$sz" -gt 40 ]; then echo "   $dead -> $sub  ok ($sz bayt)"; break
      else echo "   $dead -> $sub  o da bos"; fi
    done

    # LAST RESORT: go to the site ITSELF and read its own search page with the eleven-door
    # chain. The CEO's question, 2026-09-16: "Quora failed — why did the other tools not
    # open Quora?" They never got the chance: a site-scoped channel is a SEARCH-ENGINE query
    # ("site:quora.com …"), so when the engine refuses there is no address for the readers to
    # open. There is one, though — the site's own search page — and nothing was walking to it.
    site=$(grep "^$dead|" <<< "$CHANNELS" | head -1 | sed -n 's/.*site:\([a-z0-9.-]*\).*/\1/p')
    if [ -n "$site" ] && [ ! -s "$OUT/$dead-via-$sub.raw" ]; then
      echo "   $dead -> son care: $site adresine dogrudan gidiliyor (11 kapili zincir)"
      timeout "$TMO" python3 "$SKILL/scripts/fetch.py" \
        "https://${site}/search?q=${UQ}" --out "$OUT/$dead-direct.md" >/dev/null 2>&1
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
# burned all ELEVEN doors of the reading chain before being reported to the CEO as a page
# that could not be read. A host with no dot-plus-tld is not a page; it never enters the queue.
HOST_OK = re.compile(r"^[A-Za-z0-9._~-]+\.[A-Za-z]{2,}$")


def _host(u):
    parts = u.split("/")
    return parts[2].split("@")[-1].split(":")[0] if len(parts) > 2 else ""


per = {}
for raw in sorted(out.glob("*.raw")):
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
            if u in seen or dom.get(d, 0) >= 2:
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

# --- stage 2b: the READING CHAIN ---------------------------------------------------------
# His order, 2026-09-16: "sayfaya girdi agent reach ile bilgiyi cekicek, cekemiorsa scrapling
# aletiyle cekicek… reddit'i aciyor bakiyor kapatiyor, boyle olmaz."
# So a page is never abandoned after one tool. fetch.py walks nine doors in order and a page
# counts as unread only when EVERY door has failed — and then the log names each one and what
# it answered. Measured on a Cloudflare-walled page: scrapling WALL -> stealth fail ->
# no platform adapter -> tavily-extract OK in 407 ms.
echo
echo "sayfa okuma: $total adres, 11 kapili zincir (video altyazisi -> pdf metni -> scrapling ->"
echo "             stealth -> opencli -> tavily -> firecrawl -> exa -> playwright -> jina -> curl)"
python3 "$SKILL/scripts/fetch.py" --batch "$OUT/pages/urls.txt" --outdir "$OUT/pages" \
        --timeout 45 --workers 6 || true

read_ok=$(find "$OUT/pages" -name '*.md' -size +1k 2>/dev/null | wc -l)
python3 - "$OUT/pages/FETCH-LOG.json" <<'PYEOF' || true
import json, sys, pathlib
p = pathlib.Path(sys.argv[1])
if p.exists():
    log = json.loads(p.read_text())
    unread = [r for r in log if not r.get("read")]
    doors = {}
    for r in log:
        if r.get("door"):
            doors[r["door"]] = doors.get(r["door"], 0) + 1
    print("okunan sayfa: %d · okunamayan: %d" % (len(log) - len(unread), len(unread)))
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

exit 0
