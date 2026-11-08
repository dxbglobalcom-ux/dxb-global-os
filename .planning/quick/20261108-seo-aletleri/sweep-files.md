Most of what the earlier sources discuss is missing from TOOLS.md. About 70 tools, data sources and tool decisions don't appear in it. The biggest gaps are the free road that was measured on 4 Nov and then written into B84 (Moz, Tranco, Trends, Suggest, ChampSignal, SpyFu), the ten required web-office tools in the study he said yes to on 4 Nov, and his 8 Nov order to install Screaming Frog in both its free and paid versions. Two rows conflict outright with B84.md: Moz is dropped and SearXNG is dropped. Nothing was written and no tool was run.

**Short names for the sources**
- **F0, F7, F9, F10:** files 0, 7, 9 and 10 in `/home/dxb/Desktop/DxB Global Web-Studio/opus ile konuşulan stratejiler/` (F7 is file 7, "D neden güzel çıktı…").
- **B84:** `/home/dxb/DxB Global OS/.planning/board-rows/B84.md`
- **FL2:** `/home/dxb/DxB Global OS/.planning/quick/20261104-web-bedava-aletler/fleet2/final.md`
- **PLAT:** `/home/dxb/DxB Global OS/.planning/quick/20261103-web-studio-kesif/research/PLATFORMS.md`
- **REV:** `/home/dxb/DxB Global OS/.planning/research/REVENUE-OPPORTUNITIES.md`
- **LEDGER:** `/home/dxb/DxB Global OS/scripts/governance/ceo-approvals.json`

I checked absence with `grep -c -i -F <name>` on TOOLS.md and landscape.md: every name below returned 0 in TOOLS.md. "(landscape)" means the name is only in landscape.md.

## 1. Missing from TOOLS.md

**Free search data (measured 2026-11-04, then written into B84)**
- **His own Chrome for real Google rank:** a few queries, "3. sıra" for one query (F10:11). B84:84 makes it the rank road. TOOLS uses Chrome only to check OpenSERP.
- **Startpage, Brave, Bing as rank engines:** ranked 1st, 6th and outside the top 10 for the same query; "Google'ın yerini tutmaz" (F10:12).
- **Moz free:** "günde 3 rapor", domain authority 56, about 6,000 linking domains (F10:13). It is the links source on the free road (F10:24, B84:84). TOOLS drops it.
- **Majestic Million:** links and popularity (F10:13, F10:14).
- **Tranco:** popularity rank 38,802 (F10:14, B84:84, FL2:60).
- **Google Trends and Google Suggest:** relative demand and real queries, but no volumes (F10:15). They are the keyword method in B84:72 and B84:84.
- **SpyFu:** "Zayıf", its count disagrees with Moz (F10:16).
- **ChampSignal:** 10 keywords without an account, worked only in his Chrome; "yalnız ipucu" (F10:17, B84:84).
- **Serper:** 2,500 free queries; not tried because it needs an account, which is his door (F10:20, FL2:24, FL2:119).
- **DataForSEO's first $50 load as the minimum when money comes in:** F10:24 and B84:84. The money gate is in F9:129.

**Crawl and audit**
- **Screaming Frog's own MCP (v24, 19 May):** F9:1841.
- **Sitebulb, Lumar, Botify:** "Yalnız büyük müşteri" (F9:318).
- **Screaming Frog Log Analyser and GoAccess:** log analysis, used in migrations (F9:316).
- **Greenflare, SEO Macroscope, BeamUsUp, Xenu, Advertools, LinkChecker, Toadstone:** outside suggestions only (FL2:93, FL2:103–105). Xenu's last release is from 2010 (FL2:104).
- **Outside crawler test (seorado.de, 41 planted errors):** Frog Free 32.5, SEOnaut 24.5, LibreCrawl 17.5, SiteOne 16.5, squirrelscan 13 (FL2:93). This is in landscape, not in TOOLS.
- **Semrush free audit:** stops at 100 pages (FL2:108).
- **squirrelscan (landscape):** F9:1842.
- **claude-seo (35 skills, free backlink analysis via Moz, Bing and Common Crawl):** F9:1843, FL2:80.
- **OpenSpider, upgradeseo, SerpTrail, Limelit, geo-aeo-tracker, GetCito, GEORank (landscape):** FL2:36, FL2:52, FL2:102.

**Rank tracking and SERP**
- **SerpApi:** 250 free searches a month (FL2:119; only mentioned in landscape).
- **SE Ranking API:** from €45, pay as you go (FL2:545).
- **CloakBrowser Rank Tracker and a local map-grid tracker:** single source each (FL2:38, FL2:40).
- **Local Falcon:** geo-grid local rank; the twin is our own scan via DataForSEO (F9:319).
- **AccuRanker:** named as SerpBear's paid twin (F9:315).
- **Serposcope (archived):** TOOLS already drops it.

**Keywords and rival traffic**
- **Ubersuggest and Wordtracker:** 3 searches a day; 10–12 searches (FL2:55).
- **DispatchSEO:** FL2:53.
- **SEOquake:** shows Semrush traffic; no accuracy data (FL2:68).
- **Similarweb (landscape):** about 94 % over on 1,787 shops (FL2:65).
- **SparkToro study:** no traffic estimate is product-grade (FL2:64).

**Backlinks**
- **CrawlGraph, RankParse:** CrawlGraph is $99 for life (FL2:79).
- **DomDetailer:** FL2:87.
- **Ahrefs and Semrush MCPs, "if the client pays":** Ahrefs Lite $129, Semrush Pro $139.95 (F9:1837–1838; PLAT:78).

**Measurement and owned-site data**
- **mcp-gsc:** community Search Console MCP, 2.1k stars (F9:306, F9:1839, PLAT:60).
- **Bing Webmaster with IndexNow:** F9:307, F9:320, F9:536, PLAT:60. Only `GetKeywordStats` and the AI report are in TOOLS.
- **Yandex and Naver webmaster panels:** to be added to the stack (F9:333, F9:343).
- **GA4 and Google's GA MCP:** in the ten required tools (F9:73, F9:1906, F9:1953). TOOLS mentions GA4 only inside OpenSEO.
- **Microsoft Clarity and clarity-mcp:** F9:1080–1081, F9:1907, F9:1953.
- **Plausible, Umami, Matomo, PostHog:** F7:100, F9:1095–1098. The rule: GA4 is required on clients with ads, with Plausible or Umami beside it (F9:1100).
- **Looker Studio:** reports (F9:1087).
- **CausalImpact, SearchPilot, SplitSignal:** before-and-after tests (F9:317, F9:356).
- **Google Business Profile:** local sites (F7:112, PLAT:78, F9:358).
- **Rich Results Test and schema.org:** release gate (F9:321). The schema gate is still to be written (F9:1950).

**Performance and the release gate**
- **Lighthouse CI:** commit budget (F9:310, F9:1901; PLAT:60, PLAT:73).
- **web-vitals:** field data (F9:311, F9:1367).
- **sitespeed.io:** F9:1369.
- **DebugBear, SpeedCurve, Calibre:** paid twins (F9:309, F9:1901).
- **PageSpeed web page:** worked when the API returned 429 without a key (F9:827, F9:401).
- **Playwright raw-versus-rendered DOM check:** F9:312.
- **Chrome DevTools MCP:** F9:1900.
- **axe-core and Pa11y:** F9:1902.
- **lychee and linkinator:** broken links (F9:1904).
- **Ten required web-office tools:** F9:1941–1954. The list includes Lighthouse CI with Unlighthouse, lychee with a schema gate, and Search Console with GA4 and Clarity.

**AI visibility (AEO/GEO)**
- **Peec, Profound, Otterly:** prices at F9:539–541 and F9:1845; listed as paid fallbacks.
- **Ahrefs Brand Radar:** $199–699 a month, a fallback (F9:542).
- **Semrush AI Visibility Toolkit:** $219 for 125 prompts (F9:2192).
- **Wellows:** F9:2193.
- **PromptWatch:** F9:2202.
- **GEOInflow (landscape):** F9:543.
- **Is Agentic and isitagentready:** delivery checks (F9:544–545).
- **NLWeb, WebMCP, UCP/ACP:** F9:546–548.
- **llms.txt:** "Satılmaz" and "bütçe ayırma" (F9:92, F9:2096; REV:196).

**Teardown and other tool decisions**
- **REA plus `teardown.cjs` at both widths:** reads the reference site's SEO, AEO and GEO. Approved under the 4 Nov ledger entry (B84:49; `/home/dxb/DxB Global OS/.planning/research/web-cupboard/INDEX.md:22-27`).
- **ffmpeg and the Gemini API at 10 frames a second:** motion reading (B84:77–78).
- **operator for doors the background browser can't open:** B84:49.
- **Stack detection (wappalyzergo, WhatWeb, httpx):** F9:1893.
- **claude-ads:** rated "Kur", to be tested and installed at B84's rank (F9:2047).
- **The c02 12-point release checklist:** "Kur" (F9:2042).
- **Apify:** an optional pay-as-you-go fallback. His 24 Sep words: "yok aboneliğe gerek yok… apify'da aynı şekilde opsiyonel sanırım" (LEDGER:1353).

## 2. His decisions that TOOLS.md omits or contradicts

- **Screaming Frog, both versions (2026-11-08, B84:80):** "installed… the free version… and the paid licence; the licence screen is accepted at install", with a three-arm blind trial: LibreCrawl, free Frog and paid Frog. TOOLS:11 lists only "Screaming Frog (paid)" and a two-way blind box. The sources don't quote his words for this.
- **Paid twin as fallback (29 Oct):** "her kullanacağımız hani open source'ların eğer çalışmazsa, iyi şey sonuç vermezse paralı versiyonları hep kullanılıyor alternatif olarak" (F0:111). TOOLS:15 and TOOLS:17 say "none" for keyword difficulty and rival traffic, but Ahrefs, Semrush and Similarweb exist as paid twins (F9:313, FL2:64).
- **Free road (B84:84, written 2026-11-04):** "links from Moz and Common Crawl… popularity from Tranco and CrUX; words from Trends, Suggest and ChampSignal as hints." TOOLS:23 drops Moz and leaves out the rest.
- **SearXNG:** B84:81 (2026-11-08) keeps it as OpenSERP's fallback, but TOOLS:21 drops it. The two records were written the same day and contradict each other.
- **Keyword service (B84:72):** queries from Suggest and Trends; "Real volumes come from the client's Search Console or paid data." TOOLS:14 doesn't mention it.
- **The 4 Nov study (LEDGER:3062):** "Dokuzuna da… evet dediniz; önerilenler kayda geçti" (F9:115). That includes the ten required tools and "aletlerin kurulumu B84'ün sırasında". Most of the ten are missing from TOOLS.
- **Money gates:** "Loading money is his" for DataForSEO, and "Buying the licence is his" for Frog (B84:80–81, F9:129). TOOLS names only the Ads account and billing as his click.
- **Ledger gap:** LEDGER has no entry for the 8 Nov tool words. `grep -i "dataforseo|screaming|openseo|frog"` found only the Apify lines. B84:80–84 carries no CEO-OK tags, so these decisions rest on the row text alone.

## 3. Tools in TOOLS.md that the sources judge differently

- **Moz free:** TOOLS drops it as "too small" and landscape calls the 50 rows a month "unverified at the source". FL2:517 quotes moz.com itself for 50 rows a month, and F10:13 measured a separate free route of 3 reports a day.
- **LibreCrawl:**
  - **Accuracy:** "19/19" (F10:32) only means fields matched curl. The outside error test ranks it below free Frog and SEOnaut (FL2:93).
  - **Rate patch:** TOOLS leaves out the required rate patch and the 406 answers after the unthrottled run (F10:32, F10:41; B84:79).
- **Free Screaming Frog and JavaScript:** F9:308 says the free version includes JS rendering ("JS dahil"). FL2:91 and landscape say it has no JS rendering. This is unresolved.
- **OpenSEO:**
  - **Crawling:** weak on redirect chains and JS, and its alt-text errors weren't confirmed by Frog (FL2:108).
  - **Coverage:** Lighthouse is off by default, and it has no hreflang, Core Web Vitals or IndexNow checks; "teknik denetimin yerini tutmaz" (F9:329).
  - **ai-visibility-audit skill:** describes Google-Extended wrongly, and its single weekly run is about ±30 points (F9:552–553).
- **AI-visibility row:** F9:21 and F9:2092–2096 say a single run is ±72 points (±12 over eight runs) and that no separate AEO/GEO program is backed by evidence. TOOLS carries neither caveat.
- **DataForSEO backlinks:** found 42 of 63 real linking pages against Ahrefs' 52 (FL2:85); a Habr comparison puts Semrush and DataForSEO ahead on live links. TOOLS:16 has no note.
- **SEOnaut:** dropping it agrees with our measurement (F10:34). FL2:114 had recommended it as the main crawler.

**UNVERIFIED:** B84:83 says OpenSEO "is installed at B84's setup", while B84:132 says "OpenSEO installed". I didn't check whether it is running. I read PDFs 5 and 7 through their .md copies only, and I left out the ChatGPT chats file because it wasn't on the source list.