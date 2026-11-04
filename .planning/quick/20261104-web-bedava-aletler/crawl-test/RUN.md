# Free crawler test: how to run it again

Measured 2026-11-04 on `https://www.outletcity.com/de/`. Tools live under `/home/dxb/.cache/dxb-crawl-test/`,
the scripts in this folder. Limits used: 500 URLs or 10 minutes, under 2 requests/s, one crawl at a time,
User-Agent `Mozilla/5.0 (compatible; SiteAudit/1.0)`.

Set these once:

```bash
J="/home/dxb/DxB Global OS/.planning/quick/20261104-web-bedava-aletler/crawl-test"
C=/home/dxb/.cache/dxb-crawl-test
```

## First: is the site still refusing product pages?

Run this before any crawl. On 2026-11-04 15:40 UTC 14 of these 20 URLs answered 406 (all 20 answered 200 at about 15:11).

```bash
python3 -I "$J/truth.py" "$J/sample20.txt" "$C/truth/recheck.jsonl" 2
jq -r .status "$C/truth/recheck.jsonl" | sort | uniq -c
```

## LibreCrawl (first choice)

Needs the one-line patch in `$C/librecrawl/patch/crawler.py`: `_head_check_new_links` returns at once. Without it the
tool sends HEAD requests to every image and external link, ignoring `crawlDelay` (measured 19 requests/s). The
compose file mounts the patched file. A fresh clone needs the same line again.

```bash
docker compose -f "$C/librecrawl/compose.yml" -p dxbcrawl up -d --build
setsid nohup "$J/librecrawl-run.sh" https://www.outletcity.com/de/ "$C/librecrawl/runN" > "$C/librecrawl/runN.log" 2>&1 < /dev/null &
# output: runN/urls.json, urls.csv, links.csv, issues.csv; progress in runN/progress.txt, ends with DONE
python3 -I "$J/librecrawl-norm.py" "$C/librecrawl/runN/urls.json" "$C/librecrawl/runN/norm.jsonl"
```

Exact URL list, no link following: `LIST=/path/urls.txt "$J/librecrawl-run.sh" <first-url> <out-dir>`.
JS on: pass a settings file holding `{"enableJavaScript":true}` as the third argument. Proven on the local trap only;
browser sub-requests are not paced, so it was not run on the real site.

## SiteOne Crawler (fallback)

No patch. Needs `dxbcrawl_default` network (created by either compose file) or edit `--network` in the script.

```bash
setsid nohup "$J/siteone-run.sh" https://www.outletcity.com/de/ "$C/siteone/runN" --disable-all-assets > "$C/siteone/runN.log" 2>&1 < /dev/null &
python3 -I "$J/siteone-norm.py" "$C/siteone/runN/report.json" "$C/siteone/runN/norm.jsonl"
```

`--url-list` seeds the queue and then follows links: it is not a list mode. `--rows-limit=100000` was added after the
measured run, whose `seo` table stopped at the default 200 rows.

## SEOnaut

Local source changes: `CrawlLimit = 500` and `consumerThreads = 1`. The limit is a compile-time constant.

```bash
docker compose -f "$C/seonaut/compose.yml" -p dxbcrawl up -d --build
setsid nohup "$J/seonaut-run.sh" https://www.outletcity.com/de/ "$C/seonaut/runN" > "$C/seonaut/runN.log" 2>&1 < /dev/null &
python3 -I "$J/seonaut-norm.py" "$C/seonaut/runN" "$C/seonaut/runN/norm.jsonl"
```

## Screaming Frog Free

Stops with `User has not accepted EULA. EULA version: 16`. Accepting it is a contract step, so it was not done.

## Checks

```bash
python3 -I "$J/truth.py" urls.txt truth.jsonl 1      # curl ground truth
python3 -I "$J/compare.py" tool.jsonl truth.jsonl    # status, title, canonical, hreflang
python3 -I "$J/compare-extra.py" tool.jsonl truth.jsonl   # description, robots
```

`render-check.py` compares rendered DOM with raw HTML, paced at 2 requests/s; it runs inside the `dxbcrawl-librecrawl:local` image.
`sitemap-trap.py` is the local test site for the sitemap failure and JS tests.

## Clean up

```bash
docker compose -f "$C/seonaut/compose.yml" -p dxbcrawl down -v
docker compose -f "$C/librecrawl/compose.yml" -p dxbcrawl down -v
docker image rm dxbcrawl-seonaut:local dxbcrawl-librecrawl:local
```
