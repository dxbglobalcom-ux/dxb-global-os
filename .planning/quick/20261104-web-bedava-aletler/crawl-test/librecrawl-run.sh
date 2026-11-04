#!/usr/bin/env bash
# Drives LibreCrawl over its REST API. usage: librecrawl-run.sh <url> <out-dir> [settings-json-file]
set -u
URL=$1; OUT=$2; EXTRA=${3:-}; B=http://127.0.0.1:15000; JAR=$OUT/jar
mkdir -p "$OUT"
H='Content-Type: application/json'
curl -s -c "$JAR" -b "$JAR" -X POST -H "$H" -d '{}' $B/api/guest-login > "$OUT/login.json"
SET='{"maxUrls":500,"maxDepth":10,"crawlDelay":1.2,"concurrency":2,"respectRobotsTxt":true,"discoverSitemaps":false,"userAgent":"Mozilla/5.0 (compatible; SiteAudit/1.0)","jsUserAgent":"Mozilla/5.0 (compatible; SiteAudit/1.0)","enableJavaScript":false}'
[ -n "$EXTRA" ] && SET=$(jq -c -s '.[0]*.[1]' <(echo "$SET") "$EXTRA")
curl -s -c "$JAR" -b "$JAR" -X POST -H "$H" -d "$SET" $B/api/save_settings > "$OUT/settings.json"
T0=$(date +%s)
if [ -n "${LIST:-}" ]; then BODY=$(jq -R . "$LIST" | jq -c -s --arg u "$URL" '{url:$u,mode:"list",urls:.}'); else BODY=$(jq -c -n --arg u "$URL" '{url:$u}'); fi
curl -s -c "$JAR" -b "$JAR" -X POST -H "$H" -d "$BODY" $B/api/start_crawl > "$OUT/start.json"
LASTN=0; LASTE=0
while :; do
  curl -s -b "$JAR" "$B/api/crawl_status?stats_only=1" > "$OUT/status.json"
  E=$(( $(date +%s)-T0 ))
  M=$(docker stats --no-stream --format '{{.MemUsage}}' dxbcrawl-librecrawl | cut -d/ -f1)
  echo "$E $(jq -c '[.status,.stats.crawled,.stats.discovered]' "$OUT/status.json" 2>/dev/null) $M" >> "$OUT/progress.txt"
  N=$(jq -r '.stats.crawled // 0' "$OUT/status.json" 2>/dev/null)
  # Guard: the limit is 2 req/s; a faster counter means an unpaced path is running
  if [ "$E" -gt 0 ] && [ $(( (N-LASTN) )) -gt $(( (E-LASTE)*3 + 5 )) ]; then curl -s -b "$JAR" -X POST $B/api/stop_crawl >/dev/null; echo "GUARD stop: $N at ${E}s" >> "$OUT/progress.txt"; break; fi
  LASTN=$N; LASTE=$E
  S=$(jq -r .status "$OUT/status.json" 2>/dev/null)
  [ "$S" = "completed" ] || [ "$S" = "stopped" ] || [ "$S" = "idle" ] && [ "$E" -gt 8 ] && break
  if [ "$E" -ge 600 ]; then curl -s -b "$JAR" -X POST $B/api/stop_crawl >/dev/null; echo "stopped at 600s" >> "$OUT/progress.txt"; sleep 10; break; fi
  sleep 10
done
echo "elapsed $(( $(date +%s)-T0 ))" >> "$OUT/progress.txt"
F=url,status_code,title,meta_description,h1,canonical_url,hreflang,robots,redirects,json_ld,schema_org,images,internal_links,external_links,response_time,word_count,lang,error,error_type,content_type,size,depth
curl -s -b "$JAR" -o "$OUT/urls.json" "$B/api/export_stream?format=json&type=urls&fields=$F"
curl -s -b "$JAR" -o "$OUT/urls.csv" "$B/api/export_stream?format=csv&type=urls&fields=$F"
curl -s -b "$JAR" -o "$OUT/links.csv" "$B/api/export_stream?format=csv&type=links"
curl -s -b "$JAR" -o "$OUT/issues.csv" "$B/api/export_stream?format=csv&type=issues"
echo DONE >> "$OUT/progress.txt"
