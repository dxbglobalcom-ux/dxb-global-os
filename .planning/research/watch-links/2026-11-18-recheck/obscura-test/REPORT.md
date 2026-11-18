I could not write REPORT.md: the harness refused it ("Subagents should return findings as text, not write report files"). The findings are below instead. Raw outputs are in `/tmp/claude-1000/-home-dxb-DxB-Global-OS/7d8f2f4c-6fca-4474-b904-473ec48eefce/scratchpad/obscura-test/raw/`.

**How it was run.** I drove `obscura [--stealth] mcp` over stdio with one browser session per site and mode (`mcpc.py`, `walk.py`). Each walk opened an inner page, followed three links deeper, then searched; when a wall left no link to follow, the next level was opened by direct URL and marked so. On a wall the walker waited and re-read the page for up to 15 s without a new request, so a challenge could clear itself. I did not sign in, solve a CAPTCHA, use a proxy or click consent banners. Six sites were run a third time with the improved walker, which brought them to 15 page loads over both modes, a little above the ~12 you set.

**The table** (s = mode with stealth / p = plain; deep = levels below the inner page that returned real content)

| Site | Inner page read? | Deep | Search | s/step | What refused it | camofox |
|---|---|---|---|---|---|---|
| G2 | no (blank "g2.com", 0 chars) | 0 | p yes (`/search?query=crm`: 22,265 results, Salesforce 27,593 reviews); s no | 10–19 | blank challenge page | refused yesterday |
| Crunchbase | no | 0 | no (home page read; typed search went nowhere) | 4–19 | "Attention Required! \| Cloudflare" | today: org page read after "verify your session" |
| Upwork | no | s 1 (direct URL), then wall | s once, then walled | 6–19 | "Just a moment" → "Attention Required" | OK yesterday |
| Indeed | no | 0 | no | 4–18 | "Just a moment", then sign-in redirect | today: search read; `/cmp/Google` "Additional Verification Required" |
| Zillow | **yes, both modes** | **3** | **yes** (Round Rock, 756 results) | 5–12 | none (one 500 from Zillow in the first run) | yesterday "Press & Hold" from the 2nd visit |
| Google search | no | 0 | no | 7–20 | "unusual traffic", then EU consent page | **today read results and page 2, same IP, same hour** |
| Reddit | s yes (it passed Reddit's JS challenge); p timeout | s 2 | no | 25–40 | "You've been blocked by network security" (search) | OK yesterday |
| LinkedIn (public) | s yes (company page; Microsoft 13.7k) | s 1, followed links hit the authwall | s yes (11,000+ jobs) | 5–20 | p "Just a moment"; authwall "Join LinkedIn" | sign-in dialog yesterday |
| Trustpilot | yes, first page (Shopify 5,326 reviews) | 0 | no | 5–21 | the page redirects itself to "Update browser"; everything after is refused | read + typed search + click yesterday |
| Glassdoor | no | 0 | s yes (OpenAI 4.1★, jobs) — robots.txt disallows that URL | 4–19 | "Just a moment", bot-detection login redirect | OK in the virtual display only |
| Two Cloudflare challenge test pages (scrapingcourse.com) | no, both modes, 15 s of waiting | — | — | 19 | "Just a moment..." | refused yesterday |
| IKEA (shop) | **yes, both** | **3** | **yes, typed** "desk" + Enter | 7–13 | none | not measured |
| Yellow Pages (directory) | no | 0 | no | 4–19 | "Attention Required! \| Cloudflare" | not measured |
| AP News | s only intermittently | s 1 (direct URL) | s once | 16–19 | "Just a moment" | not measured |
| docsify (SPA docs) | **no: empty shell**, 0 chars, the app never rendered | 0 | no | 4–27 | no wall, it just does not render | not measured |
| Google Maps | no | 0 | no | 4–28 | EU consent page / "Sorry..." | not measured |

**The three numbers that matter**
1. **5 of 12 walled sites** gave a real inner page with stealth (2 without). Only Zillow was walked the full three levels deep. Camofox read 9–10 of the same 12 yesterday. Obscura got past no Cloudflare "Just a moment" challenge, including the two test pages.
2. **30 of 30 pages read whole** in 9.0–10.9 s at concurrency 10 (15–17 s at 5), with no failures.
3. **About 750 MB** peak for the whole process tree at concurrency 10 (about 400 MB at 5; a single process 286–292 MB).

**Verdict**
1. It gets into sites behind lighter JavaScript checks, and walks them: Zillow and IKEA three levels deep in both modes, Reddit's challenge in stealth, and LinkedIn's public company and job pages, which camofox could not read.
2. It does not get past Cloudflare's challenge or block, G2, Trustpilot's detector after the first page, or Google, which camofox read from the same IP in the same hour. It does not render a client-side SPA. "It enters every site" is false.
3. It beats what we have on volume and weight: 30 pages in about 9 s, a binary with no display libraries so no window can reach his screen, and a loopback-only MCP/CDP server where typing and clicking work. Stealth clearly matters: without it Reddit, LinkedIn and AP News gave nothing.
4. Camofox stays the hand for searching and clicking inside Cloudflare-fronted sites (Crunchbase, Upwork, Indeed, Glassdoor, Trustpilot, Google). Scrapling and `fetch.py` stay the readers for single walled pages, and Playwright stays for our own pages.
5. Its measured place: bulk reading, a fast first try in the reading chain before camofox, and an agent browser for sites without Cloudflare. Not the hand for walls.

**Also found**
- **Background:** no window opened, and no obscura process was left behind after any run. `serve` listened on `127.0.0.1:9461` only; I stopped that process myself.
- **Robots:** with `--obey-robots`, Obscura refuses in 0.1–0.4 s with "Blocked by robots.txt". That would block every walked URL on Reddit, and the LinkedIn company/job pages, Trustpilot `/review/*` and Glassdoor search I walked.
- **`--storage-dir` trap:** it saves cookies only when written after `fetch`. Placed before `fetch` it is accepted silently and saves nothing.
- **⚠ My slip:** my first `serve` try used port 9333, which the hidden research Chrome holds (`dxb-research-chrome`, pid 18739). Obscura exited with "Address already in use" and my CDP script drove that Chrome instead. It opened one tab, loaded Wikipedia, typed "Puppeteer", pressed Enter and closed the tab. Nothing else was touched and nothing was signed in. The rerun on a port checked free first (9461) worked.

**Raw files** (all under `/tmp/claude-1000/-home-dxb-DxB-Global-OS/7d8f2f4c-6fca-4474-b904-473ec48eefce/scratchpad/obscura-test/`)
- **Walks:** `raw/walk/*.jsonl` and the page text of each step `raw/walk/*-<step>.txt`; first runs of the rerun sites in `raw/walk-pass1-v1/`. Commands: `pass.sh` runs `walk.py` per site; `one.py`; summary with `python3 -I summ.py <dir>`.
- **Robots:** `raw/robots/check.json` and `raw/robots/obey-robots-live.txt`.
- **camofox re-run:** `raw/camofox/`. Yesterday's record: `/tmp/claude-1000/-home-dxb-DxB-Global-OS/f792823f-f7da-4bd5-8b36-843067cd74c6/scratchpad/bt/table.jsonl`.
- **Volume:** `raw/volume/` (`/usr/bin/time -v obscura scrape … --concurrency 5|10`, plus `memsample.sh`).
- **Background:** `raw/background/` (ss output, CDP runs, screenshot) and `raw/pgrep-*.txt`.
- **Storage:** `raw/storage-ikea2/`.

No repository file was changed and nothing was installed.