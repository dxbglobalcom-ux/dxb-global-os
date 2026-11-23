# Nextgen Search Engine's services against the holding — coverage, 2026-11-23

A reading and comparing job, not a judgement. Every rival deliverable of `notes/s10-nextgen-services.md`
(flat checklist, 94 rows) is set against what the holding's rows and shelf already hold. The lead decides
what to do with it.

**What was read.**
- Rival: `.planning/research/watch-links/2026-11-23-seo-geo/notes/s10-nextgen-services.md` (whole).
- Holding: `.planning/board-rows/B84.md` (whole), `B28.md` (whole), `B83.md` (whole), `B43.md` (lines 1-175
  whole; lines 176-344 searched by keyword — production legs, nothing on SEO, ads or social services there),
  `.planning/quick/20261108-seo-aletleri/landscape.md` (whole), `.planning/research/answers/20261104-1251-aeo-geo-what-actually-works/final.md`
  (verdict, S1-S5; the source list only searched), the shelf (`~/.local/share/dxb/skills/`, `openseo/` and its
  12 SKILL.md descriptions). Followed from the rows because they point there: `.planning/research/REVENUE-OPPORTUNITIES.md`
  §D #21 (H5, lines 197-218), `.planning/quick/20261103-web-ders/tracks/4-reklam-olcum.md` (B28's paid-ads sprint
  "each line is filled from" it; searched), `.planning/research/web-cupboard/INDEX.md`.

**Not found on disk (said, not guessed).**
- `.planning/quick/20261103-web-ders/tracks/1-seo.md`, `2-aeo-geo.md`, `3-eticaret.md`, `5-altyapi.md`, `6-studyolar.md`,
  `7-aletler.md` — named by B84 and by `web-cupboard/INDEX.md` (migration process "§3.12", release gates, tool
  verdicts); the folder holds only `4-reklam-olcum.md` (listed 2026-11-23).
- `personas/paid-media/`, `personas/social-media/`, `personas/marketing/` — named by B28 ("the seven paid-media
  seats (`personas/paid-media/`)", "13 social-media personas"); no `personas/` folder at the repository root, none
  tracked by git.
- B84's "file 9" and "file 12" (`~/Desktop/DxB Global Web-Studio/`) were not opened; where a row line rests on them
  the row's own sentence is cited.

**Status words.** BUILT = exists and runs, file cited. PLANNED = a row's text names that deliverable, not built.
PARTLY = part of it is named or built — the part is said. MISSING = in no row, no tool, no skill read.
Strict reading: a general "SEO" or "care package" does not cover a named sub-deliverable.

**What actually exists on disk and touches this ground** (the only BUILT parts below):
- LibreCrawl crawler — Docker image `dxbcrawl-librecrawl:local` present (`docker images`, 2026-11-23); measured on
  a real site, `.planning/quick/20261104-web-bedava-aletler/crawl-test/RUN.md`. No container runs.
- `.planning/research/web-cupboard/teardown.cjs` (reference teardown) and `.claude/skills/dxb-research/scripts/maps.py`
  (Maps places with rating and review count).
- OpenSEO's 12 skills as text on the shelf (`~/.local/share/dxb/skills/openseo/`) — they call the OpenSEO MCP,
  which is not installed (B84: "there is no OpenSEO image"). Counted as PLANNED/PARTLY, not BUILT.
- Production hands: `/home/dxb/tools/OpenMontage` (installed; B43: its transcriber not installed, clip-factory never
  run), `~/.local/share/dxb/skills/video-use`, the `kisayol`, `dxb-motion-graphics` and `scrollcraft` skills.

Row-file short names: B84 = `.planning/board-rows/B84.md`, B28 = `.planning/board-rows/B28.md`,
B83 = `.planning/board-rows/B83.md`, B43 = `.planning/board-rows/B43.md`, §D #21 = `.planning/research/REVENUE-OPPORTUNITIES.md` §D #21,
TRK4 = `.planning/quick/20261103-web-ders/tracks/4-reklam-olcum.md`, SHELF = `~/.local/share/dxb/skills/openseo/<skill>/SKILL.md`,
LAND = `.planning/quick/20261108-seo-aletleri/landscape.md`.

---

## 1. Coverage table — 94 rows

| # | Service | Rival deliverable | Where it stands in the holding | Status | Evidence (file + phrase matched) |
|---|---|---|---|---|---|
| 1 | Funnel | Free audit form (name, WhatsApp, email, website, service dropdown), WhatsApp reply in 24 h | B83 leg 2026-11-17 "the intake funnel"; B83 H7 customer desk | PLANNED | B83: "three fields, on the web or in a Telegram chat … Pointed at clients it is this desk's and the Web Studio's intake"; "every inbound request answered within 60 seconds" |
| 2 | Funnel | Free 40-point audit across SEO, Local SEO, AEO, GEO with a plain-language priority list | B84 Y9 "The prospect filter, the 1-10 audit and the demo"; SHELF `seo-audit`, `ai-visibility-audit` | PARTLY — the 1-10 prospect audit (booking, reviews, speed, GBP) is planned; the AEO/GEO part exists only as shelf skill text; no single four-area free audit | B84: "a one-page audit scored 1-10 (booking flow, reviews, speed, Google Business Profile gaps)"; SHELF ai-visibility-audit: "deliver a short report on the few changes" |
| 3 | Funnel | Free per-service audits (SEO, Local, Website, Google Ads, Meta Ads, Social, Technical, AI visibility) | §D #21 technical SEO audit and AI-visibility audit; B28 claude-ads; B84 1-10 audit; B84 is-agentic | PARTLY — technical, AI-visibility, ad-account, local and agent-readiness audits are named (the first two as paid offers); no social-media audit anywhere | §D #21: "Teknik SEO denetimi: kapı açıcı"; "Yapay zekâ görünürlük denetimi … 1.500–5.000 $"; B28: "The agency seat's door-opener: a prospect's or a client's ad account audited"; B84: "The same scan is half of the prospect audit" |
| 4 | Funnel | Free crawler-based SEO audit tool on the agency site, "20+ technical issues in minutes" (claimed; the rival's own page not found) | — | MISSING — no self-serve audit tool on a holding site is written; is-agentic is a third party's scanner | B84 names only `npx is-agentic <domain>` (is-agentic.com's servers) |
| 5 | Funnel | WhatsApp click-to-chat on every page | B83 H7: WhatsApp Cloud channel and a web widget in the Chatwoot trial | PLANNED | B83: "the WhatsApp Cloud channel and a web widget connected to a test number" |
| 6 | Funnel | ~275 blog guides (topic, industry, neighbourhood, city, buyer-education) as the agency's content funnel | B84 decision 15 (holding's 25-30 sites' newsletters); B84 Y11 own site | PARTLY — the holding's own sites write newsletters and the own site is "our own SEO/AEO case"; no content programme selling the web office itself | B84: "The holding's own sites (25-30): each writes about clients of its sector in its newsletter"; "built on the bench as our own SEO/AEO case" |
| 7 | Funnel | Programmatic city landing pages for SEO and web dev (~35) | B83 H1 local lead sites, H2 niche directories; B84 Astro leg | PARTLY — niche × city lead sites and directories are planned as revenue lines; no city pages advertising the office | B84 Astro: "the template for the H1 lead sites and H2 directories the office builds"; B83: "H1 local lead sites (#17) … H2 niche directories (#18)" |
| 8 | Funnel | Free YouTube SEO education videos | (nearest: B83 H4 channels; B84 "A sales film of the office") | MISSING — no education videos on SEO are written; H4 channels and one sales film exist as plans | B84: "A sales film of the office (row w093-02 …) The film is the studio's" |
| 9 | Funnel | Published prices ₹5k / ₹10k / ₹15k | B84 open-twins leg; §D #21 market ranges; B83 price policy | PARTLY — a price list and standard terms are to go to him once; market ranges are written; nothing published | B84: "Stops at him: the price list and the standard terms, once"; B83: "Its home is the price policy of REVENUE_ENGINE_SPEC §7sexies" |
| 10 | Funnel | Monthly plain-language report; month-to-month; client owns all accounts | B84 monthly SEO package; B28 paid-ads sprint (TRK4); B84 image licences | PARTLY — the monthly live report and accounts/licences in the client's name are planned; month-to-month (no-contract) billing is not written (B83 replaces "no contract" with a short standard contract) | B84: "one live report page for the client, each issue with its fix and status"; B28: "accounts in the client's name"; B84: "bought in the client's name"; B83: "Kyle's 'no contract' replaced by a short standard contract" |
| 11 | SEO | SEO audit (crawl, rankings, top-3 competitors) | B84 SEO tools core + blind trial; SHELF `seo-audit`, `competitor-analysis`; B84 "Market position" | PARTLY — BUILT: the LibreCrawl crawler (image present, measured); PLANNED: audit procedure, rank and competitor parts | RUN.md (crawl-test); `docker images` → `dxbcrawl-librecrawl:local`; B84: "the rival's links, popularity and Google rank set beside the client's" |
| 12 | SEO | Keyword research by intent, keyword-to-page map | B84 "Keywords"; decision 6 "query, page and language map"; SHELF `keyword-research`, `keyword-clustering` | PLANNED | SHELF keyword-clustering: "Cluster keywords by intent and map them to existing or proposed pages"; B84: "these become the page and content plan" |
| 13 | SEO | On-page optimisation page by page | B84 "page-by-page SEO audit"; "Found on Google" checks; SEO-only job type | PLANNED | B84: "this method takes every page in turn"; "Each page: its own title, description and canonical"; "on-page log (before/after)" |
| 14 | SEO | Content writing (service pages, blog) | B84 decision 8 "SEO and content" package; decision 6 copywriter; marketingskills leg | PLANNED | B84: "SEO and content"; "copywriter (every branded job)"; "copywriting, copy-editing, cro, offers, ai-seo and schema enter the shared cupboard" |
| 15 | SEO | Link building (directories, citations, PR, industry links) | B84 decision 15 and "Digital PR, step by step"; five-sentence outreach email; SHELF `link-prospecting` | PLANNED (local citations: see row 22) | B84: "real entries in sector guides and brand lists; finding articles that name the client without a link"; SHELF link-prospecting: "Find link prospects … draft outreach" |
| 16 | SEO | 90-day written action plan + quarterly review | B84 "An SEO-only job type" | PARTLY — the job's written artefact chain is planned; no 90-day horizon or quarterly review | B84: "objective → audit report → keyword map → technical fix log … → monthly report" |
| 17 | SEO | Monthly KPI report (GSC, branded split, GBP, GA4 conversions, AI visibility) | B84 monthly loop; google-analytics-mcp; Umami; core mcp-gsc | PARTLY — GSC, GA4 conversions and an AI-visitor line are planned; branded vs non-branded split and GBP metrics are not named | B84: "`run_conversions_report` … the monthly report of the care and SEO packages"; "writes an 'AI-assistant visitors' line as a lower bound" |
| 18 | SEO | Hindi/Hinglish SEO | B84 decision 8 "multi-language"; query, page and language map; hreflang | PARTLY — multi-language SEO is named; no Hindi/Hinglish or South-Asian market work | B84: "multi-language"; "hreflang on a multi-language site" |
| 19 | SEO | One-Time SEO package ₹5,000 (audit + fixes + on-page + GSC/sitemap setup) | §D #21 technical SEO audit as door-opener; B84 w014 fixed-price speed fix | PARTLY — a technical audit offer and a fixed-price WordPress speed fix are named; no one-time audit-and-fix package | §D #21: "Teknik SEO denetimi: kapı açıcı; ortalama 700–1.000 $"; B84: "a free speed measurement, a fixed-price fix" |
| 20 | Local SEO | GBP optimisation (category, services, products, description, photos, Q&A) | B84 core "Google Business Profile for local businesses"; leg 2026-11-18 Google's agent; B84 maps.py categories fix; SHELF `local-seo` | PARTLY — services with prices and descriptions, per-service pages, booking link, category comparison planned; photos, products, Q&A, posting routine not named | B84: "each service listed on its own with a price (or 'starts at'), a description per service"; "compare the prospect's categories with the top three of the map pack" |
| 21 | Local SEO | Review system (short link, QR, reply templates) | — (B84's prospect filter only reads reviews) | MISSING | B84: "the owner never replies to reviews" (a prospect-selection signal, not a service) |
| 22 | Local SEO | Citations / NAP (Justdial, IndiaMART, Sulekha, Bing Places, Apple Maps) | B84 coverage-matrix leg | MISSING — the row records it has no owner; a graded note is to be written | B84: "Five branches have no owner today … NAP consistency" |
| 23 | Local SEO | Location pages per area/branch with local schema | (nearest: B84 Google-agent leg, one page per service) | MISSING — per-service pages are planned, per-location/branch pages are not | B84: "one page per service matching the profile" |
| 24 | Local SEO | Weekly GBP posts | — | MISSING | no row, tool or skill names GBP posting |
| 25 | Local SEO | Map-grid rank tracking | B84 YE13 OpenSEO refresh; SHELF `local-seo` | PLANNED — the grid exists in upstream OpenSEO; the shelf copy is behind and is to be refreshed at install | B84: "upstream adds 'Drawing the grid': the local rank grid drawn as numbered circles … which nothing of ours draws"; SHELF local-seo: "map Maps visibility around a location" |
| 26 | Local SEO | Multi-branch profiles | — | MISSING | none found |
| 27 | Local SEO | GBP suspension recovery | — | MISSING | none found |
| 28 | Local SEO | SEO + GBP + content package ₹10,000 | B84 decision 8 packages; Google-agent readiness item | PARTLY — "SEO and content" monthly package and a GBP readiness item in the local care package are named; no bundle or price | B84: "a 'ready for Google's agent' item in the local client's care package" |
| 29 | AEO | AI visibility check (ChatGPT, Perplexity, Google) | SHELF `ai-visibility-audit`; B84 blind trial (5); §D #21 | PLANNED | B84: "(5) AI visibility — Elmo against OpenSEO + DataForSEO"; §D #21: "Yapay zekâ görünürlük denetimi ve aylık ölçüm" |
| 30 | AEO | Question research mapped to pages | SHELF `ai-prompt-research`; B84 monthly loop diagnosis | PLANNED | SHELF: "Find the questions people ask about a market, how ChatGPT answers them"; B84: "the questions people ask AI engines" |
| 31 | AEO | Answer-first rewrites (40-60-word direct answer) | B84 coverage-matrix leg | MISSING — rejected on our evidence | B84: "The branches our evidence rejects (FAQ sections and schema, 'first 40-60 words', Reddit/Quora mentions) stay rejected" |
| 32 | AEO | FAQPage / Service / LocalBusiness / Person schema | B84 json-ld-schema-generator + schema gate | PARTLY — drafting of Organization, person, service and other page-type markup is planned and validated; FAQ-for-AI rejected; LocalBusiness not named | B84: "an agent skill that drafts a page's JSON-LD … home/Organization, article, product or service, person"; "What is judged is valid markup and entity identity, not AI citations" |
| 33 | AEO | Entity consistency across the web | B84 json-ld site profile; coverage matrix (NAP) | PARTLY — entity identity inside the markup (`@id`, verified `sameAs`) planned; consistency of listings across the web has no owner | B84: "Organization `@id`, canonical host, up to 7 verified `sameAs`"; "NAP consistency" without owner |
| 34 | AEO | Featured snippet + voice optimisation (Siri, Alexa) | B84 coverage-matrix leg | MISSING — recorded as without owner; a graded note is to be written | B84: "voice search, long-tail keywords, featured-snippet / answer-first targeting" have no owner |
| 35 | AEO | Monthly fixed-prompt re-test report | B84 monthly SEO package | PLANNED | B84: "AI-citation checks repeated at least 8 runs, since one run is noise" |
| 36 | GEO | AI share-of-voice tracking vs competitors | B84 blind trial (5); paid twins Peec, Profound; SHELF `ai-visibility-audit` | PLANNED | B84: "Peec and Profound for AI visibility"; LAND: "AI visibility: OpenSEO with DataForSEO's LLM data, Elmo … as the challenger" |
| 37 | GEO | Citable fact-rich content, topical clusters | B84 "Digital PR, step by step"; SHELF `keyword-clustering` | PLANNED | B84: "find something worth a story in real data; publish it on the client's site with charts and images" |
| 38 | GEO | Brand mentions & PR (directories, best-of lists, Reddit, Quora) | B84 decision 15; coverage matrix | PARTLY — PR, sector guides, brand lists and unlinked mentions planned; Reddit/Quora rejected | B84: "real entries in sector guides and brand lists"; "Reddit/Quora mentions … stay rejected" |
| 39 | GEO | Organization / Person / Service schema linked to profiles | B84 json-ld-schema-generator | PLANNED | B84: "a site profile written once (Organization `@id` … up to 7 verified `sameAs`)" |
| 40 | GEO | Review strategy for AI local picks | — | MISSING | none found |
| 41 | GEO | AI crawler access (OAI-SearchBot, PerplexityBot, Googlebot) | B84 "Found on Google"; is-agentic | PLANNED | B84: "the AI crawlers let in"; is-agentic scores "bots allowed, content without JavaScript" |
| 42 | GEO | Gap analysis of sources AI cites instead of the client | SHELF `ai-prompt-research`, `ai-visibility-audit` | PLANNED (shelf text; its MCP not installed) | SHELF ai-prompt-research: "which sites get cited in the answers"; ai-visibility-audit: "a third-party page to get onto" |
| 43 | AEO+GEO worldwide | Buyer-stage prompt audit across ChatGPT, Gemini, Perplexity, AI Mode | SHELF `ai-prompt-research`; B84 trial (5) | PARTLY — prompt audit planned; the buyer-stage taxonomy (discovery, comparison, decision; best/compare/how-to/price/trust) is not written | SHELF ai-prompt-research (above) |
| 44 | AEO+GEO worldwide | Entity alignment incl. LinkedIn, Crunchbase | B84 json-ld `sameAs` | PARTLY — `sameAs` links in markup planned; aligning the listings themselves is not | B84: "up to 7 verified `sameAs`" |
| 45 | AEO+GEO worldwide | Third-party citations/PR in category sources | B84 decision 15 | PLANNED | B84: "Digital PR, step by step … write a personal note to each editor" |
| 46 | AEO+GEO worldwide | AI referral traffic tracking (chatgpt.com, perplexity.ai, gemini) | B84 Umami leg; GA4 custom AI channel | PLANNED | B84: "an `llm` channel (chatgpt.com, claude.ai, copilot, gemini, meta.ai, perplexity.ai)"; "GA4's custom AI channel" |
| 47 | AEO+GEO worldwide | B2B/exporter playbook (spec pages, marketplace alignment, Product schema) | B84 json-ld (product page type); NET-A-PORTER leg | PARTLY — Product markup and e-commerce crawl rules planned; no B2B/exporter or marketplace-listing playbook | B84: "product or service"; "only the client's demand facets … are allowed" |
| 48 | AEO+GEO worldwide | Founder / personal-brand entity playbook | B84 json-ld (person page type) | PARTLY — Person markup only | B84: "person" among the six page types |
| 49 | AEO+GEO worldwide | Remote delivery in 10+ countries, quoted in INR | B84 mission; B43 content principles | PARTLY — global scope is the mission; no remote-delivery procedure (time-zone calls, currency, access in the client's name) written for the office | B84: "for clients of every size, from local businesses to the world's largest brands"; B43: "the studio writes for clients worldwide in any language" |
| 50 | AEO+GEO worldwide | Complete AEO + GEO package ₹15,000 | §D #21 | PLANNED — as an AI-visibility audit plus monthly measurement (see §5: our research advises against a separate AEO/GEO fee) | §D #21: "1.500–5.000 $ bir kerelik, aylık 3.000 $'dan. Satılmaz: llms.txt, sıra garantisi, sayfa adedi" |
| 51 | Technical SEO | Crawl audit with prioritised fix list | B84 SEO tools; "Found on Google" method; SEO-only job type | PARTLY — BUILT: LibreCrawl (measured); PLANNED: fix list and one-pass fixing | RUN.md; B84: "one read-only checker per group … one writer fixes everything in one pass"; "technical fix log (before/after)" |
| 52 | Technical SEO | Core Web Vitals (LCP, INP, CLS) optimisation | B84 "Found on Google"; CrUX, Lighthouse CI, Unlighthouse; w014 speed fix | PLANNED (B84: Lighthouse and Unlighthouse "are not on this machine") | B84: "LCP under 2.5 s, CLS under 0.1"; "INP; field data (CrUX, the 75th percentile)" |
| 53 | Technical SEO | Indexing, sitemaps, robots, canonicals, hreflang | B84 "Found on Google" + "what the twelve checks still lack" | PLANNED | B84: "sitemap, one-hop redirects, no orphan page"; "robots.txt and `noindex` only on admin and login pages"; "hreflang on a multi-language site" |
| 54 | Technical SEO | Schema (LocalBusiness, Service, FAQ, Product, Article, Breadcrumb) | B84 json-ld-schema-generator; schema gate | PARTLY — Organization, article, product/service, person, event/video drafting and validation planned; LocalBusiness and Breadcrumb not named; FAQ rejected as an AI tactic | B84: "six page types (home/Organization, article, product or service, person, event or video, about)"; "the core's 'schema gate (file 9's ten)' is validation only" |
| 55 | Technical SEO | Site architecture / internal linking | B84 "Found on Google"; claude-seo | PARTLY — orphan pages and crawlable links checked; no internal-linking or URL-structure work named | B84: "links as `<a href>`"; "no orphan page" |
| 56 | Technical SEO | SEO-safe migrations (301 mapping, monitoring) | B84 decision 14 "migration process"; job step 8 | PLANNED (its cited text, `1-seo.md` §3.12, is not on disk) | B84: "Launch, with the migration process (decision 14) when an old site exists"; INDEX.md: "Migration process \| `1-seo.md` § 3.12" |
| 57 | Technical SEO | JS rendering fixes for Google and AI crawlers | B84 decision 12; raw-HTML test; "Found on Google" | PLANNED | B84: "the page is a real document first — words, links and structured business data in the raw HTML"; "a root that is not empty without JavaScript" |
| 58 | Technical SEO | Fix it yourself or a brief for the client's developer | B84 "Found on Google" method | PARTLY — fixing by our own writer planned; a brief handed to the client's own developer is not written | B84: "one writer fixes everything in one pass" |
| 59 | Website dev | Business/service sites (5-10 pages) | B84 decision 8; "A job, end to end" | PLANNED | B84: "What it sells: corporate sites and landing pages" |
| 60 | Website dev | E-commerce with UPI/card, order management | B84 decision 8; WordPress kit (WooCommerce MCP); Shopify AI Toolkit; acceptance gate | PLANNED (payment methods generic; UPI not named) | B84: "e-commerce"; "cart and payment: totals, refresh, a bad coupon"; "payments in test mode" |
| 61 | Website dev | WordPress sites | B84 decision 8; rank step 4 WordPress kit; WP hand-over leg | PLANNED | B84: "site renewal (WordPress included)"; "the client edits every text, colour, button and image in the block editor" |
| 62 | Website dev | Ad landing pages (3-7 days) | B84 decision 8; plain lead-site template; B28 paid-ads sprint | PLANNED | B84: "landing pages"; B28: "funnel strategy, tracking, landing page, Google Ads, Meta Ads" |
| 63 | Website dev | Portals / listing / directory sites | B83 H2; B84 Astro leg | PLANNED | B83: "H2 niche directories (#18) … the directory"; B84: "H2 directories the office builds" |
| 64 | Website dev | Redesigns keeping rankings | B84 decision 8 "site renewal"; migration process | PLANNED | B84: "site renewal"; "the migration process (decision 14)" |
| 65 | Website dev | GA4 + Search Console at launch; WhatsApp/call/forms lead capture | B84 "Found on Google" launch lines; acceptance gate | PARTLY — GSC verification and analytics at launch planned, forms tested; WhatsApp and click-to-call buttons on client sites not named (call tracking exists only for H1) | B84: "Search Console verification and URL Inspection first"; "analytics firing after deploy — these two go into launch step 8"; "forms and mail" |
| 66 | Website dev | Starter ₹5k / Business ₹10k / Advanced ₹15k packages | §D #21; B84 price list | PARTLY — market ranges written and a price list to go to him; no tiered site packages | §D #21: "kurumsal ve landing site (özel tek sayfa 3–5 bin $; Framer/Webflow hareketli 12–40 bin $)" |
| 67 | Website maintenance | Updates, backups, security, uptime, speed, form/checkout tests, GSC checks, content allowance, monthly report | B84 decision 8 "care and hosting"; §D #21 monthly care; seo-drift | PARTLY — care package with restore test, field speed, consent and accessibility scan, drift after deploy planned; uptime and security monitoring and a content-update allowance not named | §D #21: "aylık bakım (89–359 $ …; değer geri yükleme denemesi, saha hızı, rıza ve erişilebilirlik taramasında)"; B84: "`seo-drift` runs after every client deploy" |
| 68 | Google Ads | Search, Call, Local/Maps, PMax, Display, YouTube, Remarketing campaigns | B28 paid-ads setup sprint, filled from TRK4 | PARTLY — Google Ads setup, retargeting, Search, PMax and Shopping planned; Call, Local/Maps, Display and YouTube campaign types not named | B28: "Google Ads, Meta Ads, retargeting"; TRK4: "Search: …", "Performance Max: …", "Shopping: …" |
| 69 | Google Ads | Keyword + negative keyword research | B84 Google Ads API keyword planning; TRK4 | PARTLY — the Keyword Planner hand is planned (for SEO volume); negatives named only as a PMax control | B84: "Google Ads API keyword planning, Basic access"; TRK4: "kampanya düzeyinde negatif listeler" |
| 70 | Google Ads | Ad copy with extensions | B28 ad factory; marketingskills ads → B28 | PARTLY — ad variants written; extensions (sitelinks, callouts, call) not named | B28: "twenty variants written and made in the studio" |
| 71 | Google Ads | Call/form/WhatsApp conversion tracking before spend | B28 paid-ads sprint; TRK4 §3 | PLANNED | B28: "the event contract with `event_id`, consent, a ±10 % reconciliation before any spend"; TRK4: "telefon ve WhatsApp ölçülüyor" |
| 72 | Google Ads | Weekly search-term review, bids, A/B tests | B28 sprint (TRK4); ad factory | PLANNED | TRK4: "Aranan terimler haftalık okunur"; B28: "the money moved from the ad that does not sell to the one that does" |
| 73 | Google Ads | Monthly cost-per-lead report | B28 sprint "reporting dashboard"; google-ads-mcp | PLANNED | B28: "a reporting dashboard"; B84: "one month's campaign report through the MCP" |
| 74 | Google Ads | Account audit / takeover without losing history | B28 claude-ads | PARTLY — audit planned; takeover not named | B28: "audits an ad account on twelve platforms … from evidence the client hands over" |
| 75 | Meta Ads | Pixel + Conversions API | B28 sprint (TRK4) | PLANNED | TRK4: "Meta CAPI \| `eventID`=`event_id`, aynı olay adı, 48 saat" |
| 76 | Meta Ads | Lead form ads with qualifying questions | — (H7 qualifies leads after they arrive) | MISSING | none found |
| 77 | Meta Ads | Click-to-WhatsApp ads | — | MISSING | none found (the WhatsApp channel of H7 is planned; the ad type is not) |
| 78 | Meta Ads | Catalogue / dynamic retargeting | B28 sprint "retargeting" | PARTLY — retargeting named; catalogue/dynamic product ads not | B28: "retargeting" |
| 79 | Meta Ads | Interest / lookalike / custom audiences | — | MISSING | none found |
| 80 | Meta Ads | Image, carousel, Reels creatives; multi-variant tests | B28 ad factory, one-variable-per-version; B43 studio | PARTLY — BUILT: production hands on disk (OpenMontage, kisayol, dxb-motion-graphics); his eye rejected all 12 first kisayol samples (B43); the creative-testing service PLANNED | B28: "each version changes one thing only"; B43: "his eye rejected all of the first 12 samples" |
| 81 | Meta Ads | Local awareness (radius) | — | MISSING | none found |
| 82 | Meta Ads | Monthly CPL / cost-per-sale report | B28 Meta Ads MCP; ad factory | PLANNED | B28: "weekly reporting, creative fatigue, signal diagnosis"; "cost per customer against the same weeks without it" |
| 83 | SMM | Monthly content calendar approved by the client | B28 "The social-media team as a service" | PLANNED (weekly cadence) | B28: "the week's videos, carousels and captions in the brand's voice → the client's approval → scheduling" |
| 84 | SMM | Post / carousel design | B28 social team; Pomelli; B43 studio | PLANNED | B28: "videos, carousels and captions" |
| 85 | SMM | Reels/Shorts scripts, editing, captions | B28 weekly loop; OpenShorts vs clip-factory; video-use | PARTLY — BUILT: OpenMontage installed and video-use on the shelf (B43: OpenMontage's transcriber not installed, clip-factory never run; video-use's transcription converter owed); the service PLANNED | B28: "Produce the week's vertical videos on our own card"; B43: "video-use — owed at its first use" |
| 86 | SMM | Copy + hashtags (English/Hinglish) | B28 voice.md leg; B43 content principles | PARTLY — written voice per brand and hooks planned; hashtags not named | B28: "`voice-builder` turns an interview and three to five writing samples into … `voice.md`" |
| 87 | SMM | Profile optimisation (bio, highlights, links, buttons) | — | MISSING | none found (B28's Instagram note is about the platform's own AI label) |
| 88 | SMM | Instagram, Facebook, LinkedIn (company + founder), YouTube Shorts | B28 weekly loop; voice.md (LinkedIn-centred) | PARTLY — platforms appear as research sources and posting targets; founder LinkedIn profiles not named | B28: "the ad libraries (Meta, TikTok, Google, LinkedIn)"; "LinkedIn-centred" |
| 89 | SMM | Monthly report (reach, engagement, followers, enquiries) | B28 social team; weekly loop Monday report | PLANNED | B28: "a one-page report every morning, a post traced to the paying customer"; "a short numbers page to the client every Monday" |
| 90 | SMM | Shoot planning / editing client footage | video-use (shelf); B43 | PARTLY — editing filmed footage exists as video-use on the shelf (converter owed); on-site shoot planning not named | B43: "video-use … cutting filmed speech" |
| 91 | WhatsApp | Connect WhatsApp (Business API) with website, SEO, ads | B83 H7 leg 2026-11-17 | PLANNED | B83: "WhatsApp Business Tools MCP … The desk's running channel is the Cloud API itself" |
| 92 | ORM | Review / reputation guidance (delivered inside Local SEO/GEO) | — (GoHighLevel's "reputation" is named only as a paid twin's feature) | MISSING | B83: "all-in-one CRM, SMS, funnels, calendars, reputation and an AI Employee" (a product description) |
| 93 | Training | Edukatz courses ₹999-₹2,999, daily task + same-day trainer review, practice website | B83 H3 "the eCourse, later"; digital-product sales page; H9 training | PARTLY — an eCourse and its sales page are planned for later; no SEO/ads course with daily reviewed tasks | B83: "the workshop and the store · the product design · … the eCourse, later"; "It is the template for store #19 and the eCourse" |
| 94 | Instagram | Highlights "AI backlinks", "Store", "BRANDING", "Course" (contents not read) | B83 H3 store and eCourse; B28 brand profile; B84 paid links | PARTLY — store and course planned (H3); brand profile is planned as intake for ads, not a branding service; paid links pass only marked `rel=sponsored` | B84: "a paid link passes when it is marked `rel=sponsored`"; B28: "A brand profile from the client's site" |

---

## 2. Counts by status, per service

| Service | Rows | BUILT | PLANNED | PARTLY | MISSING |
|---|---|---|---|---|---|
| Funnel | 10 | 0 | 2 | 6 | 2 |
| SEO | 9 | 0 | 4 | 5 | 0 |
| Local SEO | 9 | 0 | 1 | 2 | 6 |
| AEO | 7 | 0 | 3 | 2 | 2 |
| GEO | 7 | 0 | 5 | 1 | 1 |
| AEO+GEO worldwide | 8 | 0 | 3 | 5 | 0 |
| Technical SEO | 8 | 0 | 4 | 4 | 0 |
| Website dev | 8 | 0 | 6 | 2 | 0 |
| Website maintenance | 1 | 0 | 0 | 1 | 0 |
| Google Ads | 7 | 0 | 3 | 4 | 0 |
| Meta Ads | 8 | 0 | 2 | 2 | 4 |
| SMM | 8 | 0 | 3 | 4 | 1 |
| WhatsApp | 1 | 0 | 1 | 0 | 0 |
| ORM | 1 | 0 | 0 | 0 | 1 |
| Training | 1 | 0 | 0 | 1 | 0 |
| Instagram | 1 | 0 | 0 | 1 | 0 |
| **Total** | **94** | **0** | **37** | **40** | **17** |

No rival deliverable is BUILT end to end in the holding. The BUILT parts inside PARTLY rows are the LibreCrawl
crawler (rows 11, 51) and the production hands (rows 80, 85, 90).

---

## 3. The gap — MISSING and PARTLY only, by service

**Funnel**
- MISSING: free self-serve SEO audit tool on a holding site (4); SEO education videos (8).
- PARTLY: one free four-area audit (2 — only the 1-10 prospect audit and shelf text); a social-media audit (3); a
  content library selling the office itself (6); city landing pages for the office (7); a published price list (9);
  month-to-month terms (10).

**SEO**
- PARTLY: audit — crawler built, the rest planned (11); 90-day plan and quarterly review (16); branded split and GBP
  metrics in the monthly report (17); local-language (Hindi/Hinglish) SEO (18); a one-time audit-and-fix package (19).

**Local SEO**
- MISSING: review system with link, QR, reply templates (21); citations/NAP (22 — the row says "no owner");
  location/branch pages (23); weekly GBP posts (24); multi-branch profiles (26); GBP suspension recovery (27).
- PARTLY: GBP photos, products, Q&A and posting routine (20); a priced SEO + GBP + content bundle (28).

**AEO**
- MISSING: answer-first 40-60-word rewrites (31 — rejected on our evidence); featured-snippet and voice optimisation (34).
- PARTLY: FAQPage/LocalBusiness markup (32); cross-web entity consistency (33).

**GEO**
- MISSING: review strategy for AI local picks (40).
- PARTLY: Reddit/Quora mentions (38 — rejected on our evidence).

**AEO+GEO worldwide**
- PARTLY: buyer-stage prompt taxonomy (43); LinkedIn/Crunchbase listing alignment (44); B2B/exporter and
  marketplace playbook (47); founder/personal-brand playbook beyond Person markup (48); a remote-delivery procedure (49).

**Technical SEO**
- PARTLY: prioritised fix list (51 — crawler built); LocalBusiness and Breadcrumb markup (54); internal-linking and
  URL-structure work (55); a brief for the client's own developer (58).

**Website dev**
- PARTLY: WhatsApp and click-to-call buttons on client sites (65); tiered site packages (66).

**Website maintenance**
- PARTLY: uptime monitoring, security monitoring, a content-update allowance (67).

**Google Ads**
- PARTLY: Call, Local/Maps, Display, YouTube campaign types (68); negative-keyword research for ads (69); ad
  extensions (70); account takeover without losing history (74).

**Meta Ads**
- MISSING: lead form ads with qualifying questions (76); click-to-WhatsApp ads (77); interest/lookalike/custom
  audiences (79); local radius awareness (81).
- PARTLY: catalogue/dynamic product ads (78); the creative-testing service (80 — tools built, service planned, first
  recipe samples rejected by his eye).

**SMM**
- MISSING: profile optimisation (87).
- PARTLY: Reels pipeline running end to end (85); hashtags (86); founder LinkedIn profiles (88); shoot planning (90).

**ORM**
- MISSING: review and reputation management (92).

**Training**
- PARTLY: a practical SEO/ads course with daily reviewed tasks (93 — only "the eCourse, later").

**Instagram**
- PARTLY: a branding service (94 — brand profile exists only as ad intake).

Read across the gap: the largest hole is **local reputation work** (rows 21, 22, 24, 26, 27, 40, 92 — reviews, NAP,
GBP posting, multi-branch, suspension) and **Meta Ads campaign mechanics** (76, 77, 79, 81 — lead forms,
click-to-WhatsApp, audiences, radius).

---

## 4. "And more" — written in the holding's rows, not offered by the rival

Only what the rows already say; nothing added.

**Web office (B84)**
- Award-level sites: three masters build the home page apart on three directions, the best chosen and grafted
  (decision 4); a creative director's rounds on the live page (decision 5); the style cupboard and Outlet City card.
- Reference teardown of a site's code, motion and commercial side: REA + `teardown.cjs` + Gemini at 10 fps
  (decision 3; "The machine's tools").
- 3D/motion signature moments, a campaign microsite, a commissioned browser game, a 3D product launch film
  (§D #21; B83 "Added 2026-11-11"); a clip rendered in the visitor's browser (`@remotion/web-renderer`, leg 2026-11-18).
- Acceptance gate: four first-time visitors and twelve flows by Playwright, with safety handles and oracle controls
  (legs 2026-11-17 and 2026-11-18).
- An attack pass before release and a stack-specific security check of client apps (vibe-security-skill).
- Accessibility audit (axe/Pa11y; §D #21 "Elle erişilebilirlik denetimi").
- Agent readiness (is-agentic, Markdown negotiation, MCP surface) and a client's ChatGPT plugin as a later sale line
  (B83 leg 2026-11-18).
- `seo-drift` per-page baseline compared after every client deploy.
- A monthly newsletter on the client's own site, and the holding's 25-30 sites linking to clients free (decision 15);
  press samples.
- "Ready for Google's agent" on a Business Profile (leg 2026-11-18).
- A client project room (OpenProject) and open twins installed and run for the client — Cal.diy, Chatwoot, WeKnora
  (legs 2026-11-17, 2026-11-18); a document-answer widget on the client's site (WeKnora).
- Shopify validation (Shopify AI Toolkit); the luxury-store pattern and facet allow-list (NET-A-PORTER leg); a
  WordPress hand-over the client edits without code.
- Server-side measurement set-up (sGTM, §D #21 "Ölçüm denetimi, kurulum, aylık bakım").
- Images and hero films licensed in the client's name (image-sources table).
- Every figure delivered carries measured/estimated, source and date ("Every SEO figure delivered carries").
- A copy pass for machine-writing tells (stop-slop, humanizer).
- The office's own showcase work sent to a real awards jury (§D #21 "Holdingin kendi gösteri işi").

**Agency and studio (B28, B43)**
- Hyper-realistic UGC and ad films made on the holding's own card with its own cast (B43 R25); long-form films and
  documentaries (B43 R1); films made in code (`dxb-motion-graphics`).
- The weekly format-research loop: organic outliers and long-running ads, decoded scene by scene, produced, the winner
  picked every Monday (B28).
- Ad-account audit across twelve platforms (claude-ads, B28).
- A pre-publish ad score (TRIBE v2 trial; virality-style score, B28).
- Long video into captioned vertical clips (OpenShorts vs clip-factory, B28).
- Localisation and dubbing (H8, B83 table).

**Revenue lines (B83)**
- Customer desk H7: every inbound answered within 60 seconds, qualified, booked, reminded, won back, month-end report;
  voice receptionist later; pay-on-result fee form.
- Local lead sites rented to one buyer (H1) with call tracking; niche directories (H2).
- The Monday market page per sector; the secret-shopper audit as door-opener.
- Digital-team setup for clients (H9) and the on-premises box.
- Client finding: prospect lists built and checked (Scrapling vs Apify), the 1-10 audit and a firm-specific demo
  (B84 Y9).

---

## 5. Rival offers our own research (final.md, 2026-11-04) says rest on weak evidence

Quoted from `.planning/research/answers/20261104-1251-aeo-geo-what-actually-works/final.md` (Turkish, line numbers),
with an English gloss.

| Rival offer (row) | final.md sentence | Gloss |
|---|---|---|
| A separate AEO, GEO and "Complete AEO + GEO" package and fee (rows 29-50, esp. 50) | l.14: "Yeni bir kısaltma için ayrı bir AEO/GEO programına veya ek aylık ücrete girme; Google bu işi hâlâ SEO sayıyor ve ayrı ayrı ücret teklifi teknik değil fiyatlandırma kararıdır" | Do not enter a separate AEO/GEO programme or extra monthly fee; Google still counts this as SEO; a separate fee is a pricing decision, not a technical one. |
| FAQ sections, FAQPage schema for AI (rows 32, 54; Advanced website package) | l.16: "Aynı site içinde FAQ blokları ve schema hiçbir motorda etki göstermedi, Ahrefs'in schema ölçümü de artış bulmadı" (counter-line: Seer case +12 % ChatGPT-User requests); S2 table l.55: "FAQ ve schema atıf getirir … Bir çalışma hiçbir motorda etki bulmuyor ve Google yapılandırılmış veriyi gereklilik saymıyor" | FAQ blocks and schema showed no effect on any engine; Ahrefs found no lift. |
| Answer-first 40-60-word openings (row 31) | l.41: "Cevabı sayfanın başında vermek gözlemsel olarak atıfla birlikte gidiyor … ↔ bir arXiv çalışması ise aranan içeriğin başta olması gerekmediğini … bildiriyor"; l.42: "Bu açılış bulgusu korelasyondur ve araştırmayı yapan firma GEO hizmeti satıyor" | Correlational only, from a firm that sells GEO; a study finds engines locate the content wherever it sits. |
| Lists and tables "for AI" (row 31; Advanced website "facts, tables") | S2 l.57: "Uzunluk, başlık, liste ve tablo atıf getirir \| Büyük ölçümler etki bulmuyor" (2 of 4 lines show an effect) | Large measurements find no effect of length, headings, lists, tables. |
| Reddit and Quora mentions (row 38) | l.23: "Taktiklerin ömrü kısadır: ChatGPT'nin Reddit atıfları Mart–Eylül 2026 arasında %88 düştü"; S3: "Reddit AI Overviews cevaplarının %16'sında, AI Mode'un %7'sinde, ChatGPT'nin %1'inde görülüyor" | Short-lived tactic; ChatGPT's Reddit citations fell 88 %; Reddit appears in 1 % of ChatGPT answers. |
| ~35 programmatic city pages, ~30 "SEO expert in X" pages (rows 6, 7) | S2 l.56: "Google parçalama gerekmediğini söylüyor, ölçekli içerik spam politikasına işaret ediyor ve her varyasyona sayfa açmaya karşı uyarıyor"; l.22: "Google'ın ölçekli içerik istismarı için spam politikası var" | Google warns against a page per variation; scaled-content spam policy applies. |
| "Manual AI-visibility checks" in the tools stack; one monthly run of a fixed prompt set (rows 29, 35) | S4: "Kişisel hesapla elle kontrol yanıltır, çünkü kişiselleştirme, konum ve hesap geçmişi gürültü ekliyor"; "Pratik alt sınır olarak 20–50 sabit sorgu ve 3–4 ayrı oturum öneriliyor, 3 koşu en az sayıdır" | Hand checks from a personal account mislead; the floor is 20-50 fixed queries over 3-4 sessions. |
| AI referral traffic as the measure (row 46) — a caveat, not a rejection | S4: "Ziyaret ölçümü GA4 yönlendirmesiyle başlar, ama alt sınırdır" | GA4 referral counts are a lower bound. |
| Timelines "weeks for schema pickup, 3-6 months for recommendations" (GEO) and "no guarantee" | "Hükmü ne değiştirir": "Canlı trafikte kontrollü bir deneyin belirli bir taktiğin atıfı artırdığını göstermesi hükmü değiştirir; bakıldı, bulunan bir deney simülasyondu" | No controlled live-traffic experiment shows any single tactic raising citations. |

Not addressed by final.md (searched): voice-assistant optimisation (Siri, Alexa) in row 34.
Supported by final.md, for balance: AI-crawler access (row 41 — S1: "Bot erişimi somut bir teknik kontroldür"),
third-party mentions (rows 38, 45 — S1: "Üçüncü taraf bahsi yapay zekâ görünürlüğüyle organik trafikten daha güçlü
birlikte gidiyor"), real statistics and named sources in content (row 37 — S1: "Gerçek istatistik, adı verilen kaynak,
atıf ve özgün içerik desteklenir, ama Princeton çalışmasının %40'ı ortalama değil üst sınırdır"), and the GBP for local
answers (rows 20, 28 — S3: "Yerel işletmede kendi site atıfların %42'sini, Google Business Profile yaklaşık %29'unu aldı").
