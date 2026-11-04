#!/usr/bin/env bash
# Drives SEOnaut with curl only: sign up, add a project, start a crawl, wait, export.
# usage: seonaut-run.sh <url> <out-dir>
set -u
URL=$1; OUT=$2; B=http://127.0.0.1:19000; JAR=$OUT/jar
UA='Mozilla/5.0 (compatible; SiteAudit/1.0)'
mkdir -p "$OUT"
curl -s -o /dev/null -c "$JAR" -b "$JAR" -d 'email=crawl@example.com&password=crawl-test-local' $B/signup
curl -s -o /dev/null -c "$JAR" -b "$JAR" -d 'email=crawl@example.com&password=crawl-test-local' $B/signin
curl -s -o /dev/null -c "$JAR" -b "$JAR" --data-urlencode "url=$URL" --data-urlencode "custom_user_agent=true" \
  --data-urlencode "custom_user_agent_text=$UA" -d 'include_noindex=true' $B/project/add
PID=$(curl -s -b "$JAR" $B/ | grep -o 'pid=[0-9]*' | tail -1 | cut -d= -f2)
echo "pid=$PID"; [ -n "$PID" ] || exit 1
T0=$(date +%s); curl -s -o /dev/null -b "$JAR" "$B/crawl/start?pid=$PID"
docker stats --format '{{.Name}} {{.MemUsage}}' dxbcrawl-seonaut-app dxbcrawl-seonaut-db > "$OUT/mem.txt" 2>/dev/null &
SP=$!
while :; do
  N=$(docker exec dxbcrawl-seonaut-db mysql -useonaut -pseonaut seonaut -N -e "SELECT COUNT(*) FROM pagereports" 2>/dev/null)
  E=$(( $(date +%s)-T0 )); echo "$E $N" >> "$OUT/progress.txt"
  END=$(docker exec dxbcrawl-seonaut-db mysql -useonaut -pseonaut seonaut -N -e "SELECT IFNULL(\`end\`,\"\") FROM crawls ORDER BY id DESC LIMIT 1" 2>/dev/null)
  [ -n "$END" ] && [ "$END" != "NULL" ] && break
  if [ "$E" -ge 600 ]; then curl -s -o /dev/null -b "$JAR" "$B/crawl/stop?pid=$PID"; echo "stopped at 600s" >> "$OUT/progress.txt"; sleep 15; break; fi
  sleep 10
done
kill $SP 2>/dev/null
echo "elapsed $(( $(date +%s)-T0 ))" >> "$OUT/progress.txt"
curl -s -b "$JAR" -o "$OUT/export.csv" "$B/export/csv?pid=$PID"
curl -s -b "$JAR" -o "$OUT/sitemap.xml" "$B/export/sitemap?pid=$PID"
for t in images scripts styles iframes audios videos internal external; do curl -s -b "$JAR" -o "$OUT/res-$t.csv" "$B/export/resources?pid=$PID&t=$t"; done
docker exec dxbcrawl-seonaut-db mysql --default-character-set=utf8mb4 -useonaut -pseonaut seonaut --batch -e "SELECT * FROM pagereports" > "$OUT/pagereports.tsv" 2>/dev/null
for t in hreflangs images links external_links issues crawls; do docker exec dxbcrawl-seonaut-db mysql --default-character-set=utf8mb4 -useonaut -pseonaut seonaut --batch -e "SELECT * FROM $t" > "$OUT/$t.tsv" 2>/dev/null; done
echo DONE >> "$OUT/progress.txt"
