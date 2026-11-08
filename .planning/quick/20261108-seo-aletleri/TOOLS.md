# B84 — the web office's SEO tools, one evaluation (2026-11-08)

His word, 2026-11-08: Screaming Frog and DataForSEO are in the web office and the office uses them;
strong alternative roads are built beside them, OpenSEO first; OpenSEO is installed in the web office.
Sources: `landscape.md` (every tool checked at its source today), `openseo-install.md` (OpenSEO's code,
commit 46b815be), `chatgpt-all-chats.md` (every SEO-tool chat in his ChatGPT, read in full), and our
measurement of 2026-11-04 (`../20261104-web-bedava-aletler/crawl-test/RUN.md`).

| Work | Primary | Strong alternative | Note |
|---|---|---|---|
| Crawl, technical audit | Screaming Frog (paid) | LibreCrawl (measured 19/19 accurate), SiteOne as a second opinion | Frog vs LibreCrawl: the blind box |
| Performance | CrUX API, Lighthouse | Unlighthouse (whole site) | free |
| Rank tracking | DataForSEO through OpenSEO | Search Console (client's own site, real); OpenSERP for rivals, checked against his Chrome; Apify Google Search Scraper ($1.80 / 1,000 result pages) as the cheap paid fallback; SerpBear as a fallback screen | Google serves automated queries false results in part since Sep 2026 |
| Search volume | Google Ads API | Bing `GetKeywordStats`; DataForSEO (same Google source) | Ads account and billing: his click |
| Keyword difficulty | DataForSEO Labs | none; ChatGPT's own formula is unproven by its own word | gap |
| Backlinks | DataForSEO | Common Crawl domain graph (cc-webgraph, pyccwebgraph: domains linking to several rivals); Ahrefs Free for our own sites | domain level only |
| Rival traffic | DataForSEO estimate | none; paid estimates are off by ~50 % too | written as a range |
| AI visibility | OpenSEO + DataForSEO | Elmo (MIT, can use DataForSEO); Search Console and Bing AI reports for own sites | all young |
| Panel, client reports | OpenSEO | CrawlSEO (light panel), our own Agent SDK path | |

Dropped: SearXNG for rank (metasearch, not Google's order; ChatGPT kept it as a fallback), CrawlObserver
last in line (18 stars, its own ClickHouse), Serposcope (archived), SEO Panel (dead since 2023), SEOnaut
(third in our measurement), Moz free (too small), Redis in ChatGPT's architecture (STACK.md).

OpenSEO, measured from its code: Docker, five services, ~2 GiB RAM, port 3001, its own SQLite store
(outside our Supabase); DataForSEO hard-wired — without it only the site audit, Search Console, GA4 and
reports work; Google Ads, Bing and Frog are not built in, so our agents feed them in through its MCP
(85 tools, API key, no fork); self-hosted it shows no spend and scheduled checks spend by themselves, so
the DataForSEO balance needs a cap of ours; SAM stays off with no OpenRouter key; telemetry is off in the
standalone image. Pinned image: `ghcr.io/every-app/open-seo-standalone:0.1.26@sha256:b9073630eb107f46b8008e237445092788276cf854517505515ae8cdab73b79c`.
