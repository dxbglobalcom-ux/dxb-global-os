#!/usr/bin/env bash
# Runs SiteOne Crawler in a throwaway container. usage: siteone-run.sh <url|-> <out-dir> [extra crawler args]
# "-" as url means the caller passes --url-list in the extra args.
set -u
URL=$1; OUT=$2; shift 2
C=/home/dxb/.cache/dxb-crawl-test
mkdir -p "$OUT"; T0=$(date +%s)
ARGS=(--workers=1 --max-reqs-per-sec=1.5 --max-visited-urls=500 --rows-limit=100000 --timeout=15
  "--user-agent=Mozilla/5.0 (compatible; SiteAudit/1.0)!" --no-cache --no-color --hide-progress-bar
  --output-json-file=/out/report.json --output-html-report=/out/report.html --output-text-file=/out/report.txt
  "--extra-columns=Title(200>),Description(300>),Keywords(50>),DOM")
[ "$URL" != "-" ] && ARGS+=("--url=$URL")
NAME=dxbcrawl-siteone-$$
timeout -k 10 610 docker run --rm --name "$NAME" --user 1000:1000 --network dxbcrawl_default \
  -e HOME=/tmp -v /etc/ssl/certs:/etc/ssl/certs:ro -v "$C/siteone/bin/siteone-crawler:/s1:ro" -v "$OUT:/out" -w /tmp \
  ubuntu:24.04 /s1/siteone-crawler "${ARGS[@]}" "$@" > "$OUT/stdout.txt" 2>&1 &
RUN=$!
while kill -0 $RUN 2>/dev/null; do docker stats --no-stream --format '{{.MemUsage}}' "$NAME" 2>/dev/null | cut -d/ -f1 >> "$OUT/mem.txt"; sleep 10; done
wait $RUN; echo "rc=$? elapsed=$(( $(date +%s)-T0 ))" >> "$OUT/progress.txt"; echo DONE >> "$OUT/progress.txt"
