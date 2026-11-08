The evaluation is below. Our own measurements still hold. No free or open tool replaces DataForSEO for keyword difficulty, rival keywords, rival traffic or page-level backlinks. LibreCrawl is the only alternative we have measured to be as accurate as a direct fetch, and only on the fields we checked. Every open-source alternative named here is ⚠ UNVERIFIED against its paid counterpart until the blind trial runs.

Repo figures (stars, last commit, latest release, licence) come from `gh api` on 2026-11-08. Prices come from the official pages fetched the same day. "file 10" is `DxB Web Studio/opus ile konuşulan stratejiler/10 - Ücretsiz aletler ölçümü 2026-11-04.md`, which I read through the session-memory summary, not directly. "fleet2" is `/home/dxb/DxB Global OS/.planning/quick/20261104-web-bedava-aletler/fleet2/final.md`.

## 1. By capability layer

| Layer | Paid / primary | Best free / open alternative | How good versus the paid one | Risk |
|---|---|---|---|---|
| **Crawl / technical audit** | **Screaming Frog**, v25.1, £199 or €245 a year ([pricing](https://www.screamingfrog.co.uk/seo-spider/pricing/)). The free version stops at 500 URLs; the product page's prose says it also has no saved crawls, JavaScript rendering, custom extraction or API integrations ([page](https://www.screamingfrog.co.uk/seo-spider/)). We have not run it: it stops at the licence screen (RUN.md). | **LibreCrawl** first, **SiteOne** second. Performance beside them: **CrUX API** (free, 150 queries a minute, origin and URL level, 28-day data, [docs](https://developer.chrome.com/docs/crux/api)), **Lighthouse** v13.6.0 and **Unlighthouse**, which runs Lighthouse across a whole site. | **Measured (file 10):** LibreCrawl crawled 500 URLs in 10 minutes and matched a direct fetch on 19 of 19 pages for status, title, canonical, hreflang, description and robots. SiteOne crawled 500 URLs in 6 minutes and matched 20 of 20, but has no canonical, hreflang or structured-data checks and left robots empty on all 20. **Against Screaming Frog: ⚠ UNVERIFIED** (blind trial pending). One outside test found 32.5 of 41 planted errors with Screaming Frog Free and 17.5 with LibreCrawl (fleet2 line 93, single source). | LibreCrawl has one maintainer (its README). It needs our one-line rate patch, re-applied on every fresh clone. Our unthrottled run was followed by hours of 406 answers on outletcity's product pages. Its JavaScript mode has not been tried on a real site. Google says it will drop real-user (CrUX) data from the PageSpeed Insights API ([docs](https://developers.google.com/speed/docs/insights/v5/get-started)), so use the CrUX API for that. |
| **SERP rank tracking** | **DataForSEO SERP API**, from $0.0006 per results page ([pricing](https://dataforseo.com/pricing)), through OpenSEO's tracker. | **Google Search Console API** for client sites (real average position, 1,200 queries a minute per site, [limits](https://developers.google.com/webmaster-tools/limits)). **OpenSERP** for rivals (it drives a browser). **SerpBear** as a tracker screen. A few checks by hand in his Chrome. | Search Console is true data but shows no rivals. OpenSERP: ⚠ UNVERIFIED. Its own README warns that engines "can return CAPTCHAs, rate limits or unrelated results" ([repo](https://github.com/karust/openserp)). | Google has served automated queries false results since September 2026, 5–11 % a day after October (Nozzle, fleet2 line 26). Paid providers are hit as well: DataForSEO had a problem with Google redirect links and says it fixed it in November (fleet2 line 28). SerpBear has no DataForSEO connector (request [open since 2025-07-16](https://github.com/towfiqi/serpbear/issues?q=dataforseo)). |
| **Search volume** | **DataForSEO Keywords Data**, taken from the Google Ads API, $0.075 per request of up to 1,000 keywords (chatgpt-read-2-eval.md). | **Google Ads API keyword planning** (Basic access) and **Bing `GetKeywordStats`** (Bing data only). | Same source as DataForSEO, so the numbers should be equal. ⚠ UNVERIFIED whether an Ads account that spends nothing gets exact numbers or only ranges. | Needs a Cloud brand check, a paid-tier billing account and an Ads account: identity and payment steps, prepared up to his click. Limited to 1 request per second per Ads account. |
| **Keyword difficulty** | **DataForSEO Labs**, $0.012 per task plus $0.00012 per item ([pricing](https://dataforseo.com/pricing)). | None strong. Moz's free API gives 50 rows a month according to third-party sites only; moz.com refused my fetch, so ⚠ UNVERIFIED at the source. A difficulty formula of our own is unproven (ChatGPT says so itself). | No usable free equivalent. | A gap (see section 3). |
| **Backlinks** | **DataForSEO Backlinks**, $0.024 per task plus $0.000036 per row. The page fetched 2026-11-08 shows no monthly minimum ([page](https://dataforseo.com/pricing/backlinks/backlinks)). | **Common Crawl Aug–Oct 2026 domain graph** with `cc-webgraph` (Apache-2.0, 118★, last commit 2026-11-03): about 135M domains and 1.82B links in about 7 GiB. **Ahrefs Free**, verified sites only, 1,000 backlinks visible ([page](https://ahrefs.com/webmaster-tools)). Search Console's links export for our own sites. | Domain level only: no source page, anchor or nofollow. Overlap with DataForSEO: ⚠ UNVERIFIED (blind lane planned). Paid data is incomplete too: of 63 real linking pages, Ahrefs found 52 and DataForSEO 42 (fleet2 line 85, single test). | Common Crawl is a sample, the graph includes noise, and nothing in it is useful for rivals' pages. |
| **Rival traffic** | **DataForSEO Labs** traffic estimates. | None. Ahrefs Free shows verified sites only; Similarweb is manual lookups only. | Even paid estimates are weak: Similarweb overstated sessions by about 94 % across 1,787 e-commerce sites, and Ahrefs' own median error was 49.5 % across 1,635 sites (fleet2 lines 64–67). | A gap. Report ranges, never exact figures. |
| **AI visibility (AEO/GEO)** | **DataForSEO AI Optimization**: LLM Mentions costs $0.1 per task plus $0.001 per row ([pricing](https://dataforseo.com/pricing/ai-optimization/llm-mentions)). This is OpenSEO's only AI-visibility source. | **Elmo** (MIT, 576★, 35 contributors, last commit 2026-11-07). It self-hosts with Docker and can use DataForSEO, Oxylabs (about $0.15 per prompt a month), Cloro and others ([providers](https://www.elmohq.com/docs/user-guide/providers)). First-party, free, own sites only: Search Console's generative AI report (beta, AI Overviews and AI Mode, secondary sources) and Bing Webmaster's AI Performance report (preview, Copilot citations, export to file only, no API yet, secondary sources). | ⚠ UNVERIFIED. Elmo's own docs say a model's API answer is not the consumer app's answer. | Every tool is young. Copying answers from the consumer apps is fragile. None of the providers is free over time (Elmo docs). |
| **Panel / client reporting** | **OpenSEO** (MIT, 26,833★, v0.1.26 on 2026-11-07, two main authors) on DataForSEO. | Our own Agent SDK calling DataForSEO directly. **CrawlSEO** (MIT, 682★, v0.3.6 on 2026-11-02): Search Console, a crawler (2,000 pages by default), Core Web Vitals and a read-only MCP; DataForSEO is optional ([repo](https://github.com/crawlseo/crawlseo)). **SerpBear** for rank-only screens with email reports. | ⚠ UNVERIFIED (already in the blind box). | OpenSEO is still 0.1.x and two people carry it. Telemetry is on by default. Its built-in agent (SAM) is a second agent runtime and stays off (openseo-research.md). |

## 2. Verdict per tool

- **Screaming Frog (paid):** core. His decision. It is the reference the free crawlers are judged against in the blind trial.
- **LibreCrawl:** core free crawler. Measured accurate. MIT, 1,100★, v2.50 on 2026-11-07. One maintainer, and our patch is needed.
- **SiteOne Crawler:** strong alternative, as a fast second opinion only. It misses canonical, hreflang, structured data and robots. MIT, 997★, last commit 2026-09-27.
- **CrawlObserver:** blind-trial candidate, last in line. AGPL, 18★, quiet since 2026-09-17. It runs its own ClickHouse, which is not in `.planning/research/STACK.md`.
- **CrawlSEO:** blind-trial candidate as a light Search Console monitoring panel for clients, against OpenSEO. Active, MCP, DataForSEO optional.
- **OpenSERP:** blind-trial candidate for rival ranks only, and it passes only on its false-result rate against his Chrome. MIT, 1,560★, v0.8.17.
- **SearXNG:** drop for SEO. It merges results from many engines, so its positions are not Google's rank (my reading of what a metasearch engine is, not measured). It is alive (AGPL, 39,337★, commit today).
- **SerpBear:** blind-trial candidate as the fallback rank tracker if OpenSEO's tracker fails. MIT, 2,172★, v3.1.2. It has no DataForSEO connector.
- **OpenSEO:** core panel candidate. His decision, and the blind box decides the rest.
- **DataForSEO:** core data source. His decision, and it is the only full source for difficulty, rival keywords, backlinks and traffic.
- **Google Ads API (Keyword Planner):** core for search volume. Same data as DataForSEO, and the keyword ideas are free.
- **Bing Webmaster API:** strong alternative. Bing volume through `GetKeywordStats`. The AI Performance report is free Copilot-citation data, but has no API yet.
- **Google Search Console API:** core. It is the only true rank and click data, for client sites.
- **Common Crawl domain graph:** strong alternative for referring domains and a free authority rank, domain level only.
- **Moz free:** drop. 50 rows a month is too small, and that figure is unverified at the source.
- **Ahrefs Free (formerly Webmaster Tools):** core for clients' verified sites: 5,000 crawl credits per project a month, 1,000 backlinks and 1,000 keywords visible. Useless for rivals.
- **CrUX API:** core. Free real-user Core Web Vitals.
- **PageSpeed Insights API, Lighthouse:** core for lab performance. Lighthouse v13.6.0, Apache-2.0, 31,029★.
- **Unlighthouse (new):** strong alternative. Lighthouse across a whole site. MIT, 4,938★, v0.19.1, not tested by us.
- **squirrelscan (new):** blind-trial candidate as the agent's audit-and-fix loop. Its 300+ rules include whether AI crawlers get the same content and whether llms.txt is present. MIT, v0.0.173 on 2026-11-08. Its JavaScript rendering runs in their cloud.
- **Elmo (new):** blind-trial candidate for AI visibility against OpenSEO with DataForSEO. It can use DataForSEO as its provider, so no second vendor is needed.
- **Limelit Open (new):** drop for now. Pre-release, 5 of 11 providers unbuilt. Apache-2.0, 435★.
- **GEOInflow (new):** blind-trial candidate for one thing: reading server logs to see which AI crawlers visit and what AI search referrals bring. MIT, 816★, created 2026-10-26.
- **geo-aeo-tracker, GetCito, GEORank:** drop. geo-aeo-tracker has one author, is tied to Bright Data and keeps results in the browser. GEORank has had no commit since 2026-08-12. I read only the first part of GetCito's README and did not evaluate it further.
- **SEOnaut:** drop. It came third in our measurement: no API, no JavaScript rendering, no structured data, and it silently dropped 5 of 77 pages (file 10). fleet2's outside sources recommended it as the main crawler; our measurement overrides that.
- **Serposcope:** drop. The repo is archived and its last commit was 2022-01-15.
- **SEO Panel:** drop. Its main repo was last pushed 2023-09-18.
- **OpenSpider:** drop for now. 31★, beta on macOS and Windows.
- **upgradeseo:** drop as a product. It is a fork of OpenSEO with 4★, whose only pushes were on 2026-08-18. Its free-source adapters (Bing Webmaster, OpenPageRank, Common Crawl) are worth reading if we ever build our own free road.
- **SerpTrail:** drop. It needs a SerpApi key and has 50★.

## 3. Gaps: layers with no strong alternative

- **Keyword difficulty:** no free source. Only DataForSEO Labs.
- **Rival keywords and rival traffic:** no free source, and even paid estimates are off by about 50 % or more.
- **Page-level backlinks for rivals:** Common Crawl is domain level and a sample. DataForSEO is behind Ahrefs on the one test we have.
- **Rival ranks at scale without paid data:** every self-run scraper inherits Google's false results. Ranks need DataForSEO plus a hand-checked sample.
- **AI visibility across all engines:** every open tool needs a paid provider. Free first-party data (Search Console, Bing) covers only our own sites and is still in beta or preview.

## 4. Recommended stack for the web office

1. **Data:** DataForSEO for SERP, Labs, Backlinks and AI Optimization. Google Ads API and Bing `GetKeywordStats` for volume. Search Console API, Ahrefs Free and the CrUX API for each client's own site.
2. **Crawl and audit:** Screaming Frog (paid) and LibreCrawl (patched) side by side, with the blind trial setting the default. SiteOne as a quick second opinion. Lighthouse and Unlighthouse for performance.
3. **Panel and reports:** OpenSEO on DataForSEO, self-hosted with the image pinned, telemetry off and SAM off. Our own Agent SDK with DataForSEO direct is the rival in the blind box.
4. **Links, free road:** the Common Crawl domain graph for referring-domain lists and authority, checked against DataForSEO.
5. **AI visibility:** OpenSEO with DataForSEO's LLM data, Elmo with DataForSEO as the challenger, and the Search Console and Bing AI reports for clients' own sites.
6. **Blind box additions:** OpenSERP and SerpBear, passing only on false-result rate against his Chrome; CrawlSEO; squirrelscan; GEOInflow. Everything else listed under "drop" stays out.

One record fix: session-memory observation #45233 says SEOnaut was blocked by a licence screen. RUN.md shows it was Screaming Frog Free, so I followed RUN.md.

I wrote nothing in the repo and installed nothing.