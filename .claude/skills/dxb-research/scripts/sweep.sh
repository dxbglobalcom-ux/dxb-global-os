#!/usr/bin/env bash
# Fan a single research query out across every reachable channel, in parallel, in the
# background, and report coverage honestly — including the channels that failed.
#
# Why parallel: a serial sweep makes a session impatient, and an impatient session stops at
# the first plausible answer. That is the defect this whole door was built for (2026-09-16).
# Why failures are printed: a channel that errored is a hole in the research. Today's
# session dropped two dead queries without telling the CEO.
#
# Why every opencli call carries --window background: these adapters drive the CEO's own
# Chrome (Browser Bridge, Profile 5). Without the flag a sweep throws twenty tabs across the
# screen he is working on. He caught it the first time this script ran: "genelde arka planda
# her şey olması lazım". The screen is his; research takes the back door.
#
#   sweep.sh "<query>" <outdir> [--tier core|wide|max] [--timeout SECONDS]
#
# Raw output lands in <outdir>/<channel>.raw — one file per channel, untouched, so the
# hunters that read it are reading the source and not a summary of a summary.

set -uo pipefail

QUERY="${1:-}"; OUT="${2:-}"; shift 2 2>/dev/null || true
TIER=wide; TMO=180; PAGES=14
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
google|core|opencli google search "{Q}" --window background -f yaml
reddit|core|opencli reddit search "{Q}" --window background -f yaml
hackernews|core|opencli hackernews search "{Q}" -f yaml
twitter|core|opencli twitter search "{Q}" --window background -f yaml
github-repos|core|gh search repos "{G}" --limit 15 --json fullName,stargazersCount,description,updatedAt
github-issues|core|gh search issues "{G}" --limit 20 --json repository,title,createdAt,state,url
youtube|core|opencli youtube search "{Q}" --window background -f yaml
duckduckgo|wide|opencli duckduckgo search "{Q}" --window background -f yaml
lobsters|wide|opencli duckduckgo search "site:lobste.rs {Q}" --window background -f yaml
stackoverflow|wide|opencli stackoverflow search "{Q}" --window background -f yaml
medium|wide|opencli medium search "{Q}" --window background -f yaml
devto|wide|opencli duckduckgo search "site:dev.to {Q}" --window background -f yaml
producthunt|wide|opencli duckduckgo search "site:producthunt.com {Q}" --window background -f yaml
bluesky|wide|opencli bluesky search "{Q}" --window background -f yaml
substack|wide|opencli substack search "{Q}" --window background -f yaml
v2ex|wide|opencli duckduckgo search "site:v2ex.com {Q}" --window background -f yaml
quora-forums|wide|opencli duckduckgo search "site:quora.com OR site:news.ycombinator.com {Q}" --window background -f yaml
linkedin|max|opencli linkedin search "{Q}" --window background -f yaml
zhihu|max|opencli zhihu search "{Q}" --window background -f yaml
linux-do|max|opencli linux-do search "{Q}" --window background -f yaml
weibo|max|opencli weibo search "{Q}" --window background -f yaml
rednote|max|opencli rednote search "{Q}" --window background -f yaml
bilibili|max|bili search "{Q}" --type video -n 8
juejin|max|opencli duckduckgo search "site:juejin.cn {Q}" --window background -f yaml
arxiv|max|curl -sS -m 40 "https://export.arxiv.org/api/query?search_query=all:{U}&max_results=10"
crossref|max|curl -sS -m 40 "https://api.crossref.org/works?rows=10&query={U}"
europepmc|max|curl -sS -m 40 "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query={U}&format=json&pageSize=10"
github-trending|max|opencli github-trending repos --window background -f yaml
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
  (
    timeout "$TMO" bash -c "$run" > "$OUT/$name.raw" 2> "$OUT/$name.err"
    rc=$?
    # Some adapters read an API directly and never open a browser, so they reject
    # --window. Which ones is not reliably readable from `opencli list` (google is marked
    # [public] and accepts it, hackernews is marked [public] and does not), so the flag is
    # withdrawn on the evidence of the refusal rather than on a guess about the adapter.
    if [ $rc -ne 0 ] && grep -q "unknown option '--window'" "$OUT/$name.err" 2>/dev/null; then
      timeout "$TMO" bash -c "${run/ --window background/}" > "$OUT/$name.raw" 2> "$OUT/$name.err"
      rc=$?
    fi
    echo "$rc" > "$OUT/$name.code"
  ) &
done <<< "$CHANNELS"

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
per = {}
for raw in sorted(out.glob("*.raw")):
    seen, keep = set(), []
    for u in URL.findall(raw.read_text(encoding="utf-8", errors="replace")):
        u = u.rstrip(".,);")
        if NOISE.search(u) or u in seen:
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
