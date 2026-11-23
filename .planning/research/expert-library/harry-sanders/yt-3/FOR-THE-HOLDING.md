# Harry Sanders, set 3 — what the holding does with it

Companion to `PLAYBOOK.md` (same folder; § numbers point there). Lines served: **B84** the web office first,
**B83** revenue lines, **B28** where the ad office touches it. Nothing here is built or tried; every figure of
his is his claim. Ideas the first study (`../FOR-THE-HOLDING.md`) or the skill study
(`../skills/FOR-THE-HOLDING.md`) already hold are not repeated.

The answer in one paragraph: these are the agency's older, simpler videos, so they teach little new method —
but they expose two things the library lacks. First, **nothing in the 73-skill register sets up a site for
more than one country or language**, and the holding is global; one of his videos names the job and stops.
Second, the founder runs **a second business beside client work — building search assets and selling them**,
which the library has never weighed as a revenue line. The rest are concrete checks that sharpen existing
skills: the launch switches that leave a finished site invisible, keeping analytics history from day one, a
pass for the checks a tool marks green wrongly, and Google's current rule for faceted navigation.

---

## 1. The ideas, ranked by value

### 1. `international-structure` — one country is not a global office
- **What.** §5: the same trade is searched differently per country (volume, difficulty, the questions
  themselves); a second country needs its own structure, `hreflang`, research and strategy. He stops at "quite
  an exercise"; Google's two pages complete it (ccTLD / subdomain / subdirectory, no forced redirects by IP or
  guessed language, reciprocal `hreflang` with `x-default`, one language per page, canonical + `hreflang` for
  same-language regional copies).
- **Where.** B84 — every client that sells in more than one country or language, and **the holding's own
  site first** (a global holding with one language is already a case of the problem).
- **Form.** A new register row (REGISTER-CHANGES), and a market-fit line in `readable-first` and
  `repo-seo-gate` (hreflang parses and is reciprocal; no IP redirect).
- **What we build.** The skill; a reciprocity checker over the crawl (every `hreflang` target returns 200, is
  indexable, points back, carries `x-default`); a per-market research step that starts from native-language
  questions, never a translated keyword list.
- **First test.** Decide the holding's own site structure for its first two languages; build the `hreflang`
  set in the repository; the checker passes on a fixture with three planted faults (one missing return link, a
  region code alone, an IP redirect on the home page).
- **Earns / improves.** A service most local agencies do badly and every exporter, chain and SaaS client needs;
  "international SEO" is a page on his own menu (first study §14). For us it is the base of "global from day
  one".
- **Needs the CEO.** Which languages and countries the holding's own site serves first (part of existing
  decision 3, country order); domain purchases (ccTLDs) are money out.
- **Risk.** Machine-translated pages shipped as "localised". Repair: one language per page, a native-language
  reader in the gate, and content researched per market (§5's kangaroo test).

### 2. `market-entry-read` — choose countries by measured competition, not by impression
- **What.** His and Lawrence's thesis (§5, §13): small markets have fewer high-level SEOs; few agencies run a
  scaled operation anywhere; advanced practice transplanted wins. That is a claim about markets which our data
  provider can measure.
- **Where.** B84 and B83 — the CEO's decision of which country × trade the office enters first (existing
  decision 3), and later every client's expansion question.
- **Form.** A measurement skill whose output is a one-page ranking of candidate countries for one trade.
- **What we build.** For one trade, 30 buyer questions written natively per candidate country (not
  translated); per country through DataForSEO: volume, difficulty, the make-up of the top 10 (directories,
  aggregators, local firms, our kind of competitor), how many ranking pages pass our `only-we-gate`
  basics (answer first, real evidence) on a sample; how many agencies rank for "SEO agency + capital city";
  the assistants' answers for five of the questions (`ai-recommendation-test`, sampled). Ranked by demand ×
  weakness of what ranks.
- **First test.** One trade, five countries (two large English markets, three non-English), one afternoon of
  API calls; hand the CEO the table beside decision 3.
- **Earns / improves.** The entry decision made on numbers; the same table becomes a client deliverable
  ("where to expand next") and a data story ("how weak is [trade] search in [country]").
- **Needs the CEO.** The decision itself; API cost is small but is money out if over the existing budget.
- **Risk.** Keyword difficulty is a vendor score. Repair: report the SERP make-up beside it and read ten
  results per country by hand.

### 3. Owned search assets — build, hold, and possibly sell content sites (a revenue line; waits on the CEO)
- **What.** §13: the founder buys or starts affiliate sites, plans two years of content and links, and sells
  for "a couple hundred grand" [HS]. One broker, Empire Flippers, lists online businesses of every kind at an
  average asking price of about 2.3–3.4× annual net profit (1.1× for distressed ones; its 2026 State of the
  Industry report, September 2026) — listing averages, not content sites alone and not sale prices. For a holding whose web office makes content, measures, links and films with
  workers, an owned site is the one client that never churns, the cleanest case study, and an asset with a
  market price.
- **Where.** B83 (a new revenue line), served by B84's whole chain and the Media Studio.
- **Form.** An owned-media portfolio: sites in halal niches the holding knows, earning by affiliate commission
  on halal products, display or sponsorship (marked), the holding's own products, and lead generation for its
  own services — held for income; sold only if the price beats holding.
- **What we build.** Nothing until his word. Then: a niche-selection read (demand, competition, halal
  products with programmes, the review guidance's first-hand-evidence bar we can really meet); one site built
  through the office's chain as case study #2; the disclosure block and review blueprint (first-hand evidence,
  measurements, drawbacks, several sellers — Google's review guidance; "clear and conspicuous" disclosure —
  FTC 16 CFR 255).
- **First test.** Only on his word, and in this order: first the candidate niches, affiliate programmes and any
  ad network tested against the Islamic boundaries; then a read-only desk read of 30 recently listed content
  sites on two broker marketplaces — niche, traffic source, revenue model, age, multiple — to learn what the
  market pays for and what failed. (Reading public listings is not a purchase and not client-finding.)
- **Earns / improves.** Recurring income independent of clients; a priced asset; every lesson flows back into
  client work. His own videos measure the risk honestly: Google's review and helpful-content changes hit thin
  affiliate sites hard (§13, §12).
- **Needs the CEO.** Everything: it is **new work** (his word starts it), buying a site or products to review
  is **money out**, and the niche and every affiliate programme are tested against the **Islamic boundaries**
  before anything else (no alcohol, gambling, interest-based finance, haram content; affiliate programmes only
  for halal products; no fabricated testing).
- **Risk.** Google's treatment of affiliate content (reviews system, site reputation abuse); a single-traffic-
  source asset. Repair: only real testing with real photographs from the Media Studio, more than one traffic
  source (search, YouTube, newsletter), and value judged by owned audience, not traffic alone.

### 4. Launch switches — the gate that catches a finished site hidden from Google
- **What.** §2: the robots meta noindex, `Disallow: /`, WordPress's "discourage search engines" (a meta noindex
  since 5.3), an `X-Robots-Tag: noindex` header left from staging, HTTP and HTTPS both served, attachment pages
  on sites upgraded from before 6.4, content missing from the mobile render; then a `site:` look at the back
  pages of the results.
- **Where.** B84 — every launch, relaunch, renewal and hand-over; the first look at any site a client brings.
- **Form.** Lines added to `readable-first` (1) and `migration-guard` (53) — not a new skill.
- **What we build.** The checks as one script over a URL list: rendered head for robots meta, response headers
  for `X-Robots-Tag`, robots.txt rules per bot, HTTP→HTTPS and host 301s, WordPress option probes where the
  CMS is WordPress, a mobile-vs-desktop word count.
- **First test.** A fixture WordPress install with each switch planted once; then the holding's own site.
- **Earns / improves.** The cheapest catastrophe to prevent; the line "we check the five switches that make a
  new site invisible" in every build quote.
- **Needs the CEO.** Nothing.
- **Risk.** None material.

### 5. Analytics history kept from day one
- **What.** §3: GA4 standard properties keep event-level data for 2 or 14 months; explorations depend on it;
  Search Console keeps 16. A baseline that cannot be re-read at month 13 is lost proof.
- **Where.** B84 onboarding; `proof-capture`; `monthly-report`.
- **Form.** An onboarding line: GA4 retention set to 14 months on day one, the export of the baseline fields
  into our own store the same day, Search Console exported monthly.
- **What we build.** The onboarding checklist line and the export job.
- **First test.** The holding's own GA4 (when it exists) at 14 months; the first export run.
- **Earns / improves.** Every case study and every 90-day guarantee reading rests on it.
- **Needs the CEO.** The holding's GA4 and Search Console accounts are his click (already listed in the skill
  study).
- **Risk.** None.

### 6. The false-pass sweep — what tools mark green that is wrong for this market
- **What.** §4: tools raise false alarms (text-to-HTML ratio, meta keywords) **and** false passes
  (`lang="en-US"` on an Australian shop). `suggestion-triage` sorts the first; nothing catches the second.
- **Where.** B84, every audit and every tool export, in every market the holding serves.
- **Form.** One step added to `suggestion-triage` (REGISTER-CHANGES).
- **What we build.** A market sheet per client (country, languages, currency, address and phone format, units,
  date format) and a pass that re-reads the tool's green ticks against it.
- **First test.** Run the holding's site through two free audit tools; count the green ticks the sheet
  overturns.
- **Earns / improves.** Correctness where a global office is judged first — the client sees his own country's
  details right.
- **Needs the CEO.** Nothing.
- **Risk.** Over-reading `lang`: Google ignores it for language detection; the fix matters for accessibility
  and possibly Bing, not Google rankings. The sweep says which engine each fix serves.

### 7. Faceted navigation by Google's current rule
- **What.** §6: block filter URLs that should not be indexed with robots.txt (or put filters in fragments);
  canonical is weaker; a facet with real demand becomes its own category page.
- **Where.** B84 e-commerce clients (decision 8); the feed and product-page skills read the same catalogue.
- **Form.** A rule in `money-page-audit-fix` (15) for category pages and in `readable-first` (1) for crawl
  waste.
- **What we build.** The facet inventory from the crawl (parameters, counts, which get search clicks) and the
  proposed robots.txt lines, through `page-change-guard` before any change.
- **First test.** A fixture store with colour × size × price facets.
- **Earns / improves.** Crawl budget on large stores; fewer thin URLs; the demand facets turned into pages.
- **Needs the CEO.** Nothing.
- **Risk.** Blocking a facet that earns clicks. Repair: Search Console clicks per parameter read first.

### 8. A Discover line for clients who publish
- **What.** §11: Discover needs no markup — indexed content within its policies, images ≥1200 px wide at 16:9
  with `max-image-preview:large`, honest titles; it has its own Search Console report (the report is named
  in the Matt Diamante study `d`; the eligibility rules are new to the library).
- **Where.** B84 content care; the holding's own articles; B28 when a client's content is news-like.
- **Form.** A line in `monthly-report` (19) and a check in `repo-seo-gate` (the robots meta allows large image
  previews; a 1200 px primary image is declared).
- **What we build.** The two checks; the Media Studio's default article image at 1600×900.
- **First test.** The holding's articles published with the image rule; watch the Discover report fill.
- **Earns / improves.** A traffic source most small sites leave unused; costs nothing once the rule exists.
- **Needs the CEO.** Nothing.
- **Risk.** Chasing Discover with sensational titles. The policy forbids it; so does our boundary.

### 9. A coverage check of the register against a public curriculum
- **What.** Lawrence's learning roadmap, learningseo.io (made by Aleyda Solis, by the handle and newsletter on
  the page), lists SEO by area: fundamentals, process, SEO per CMS, specialisations, **other search engines**
  (Bing, Yandex, Naver, Amazon, YouTube), news, AI search (`YT:rigwQ9JnqN4 00:02–01:03`). Laid beside our 73
  skills it shows holes at once: international (idea 1), YouTube search, marketplaces, engines a global
  holding meets in Korea, Russia-speaking markets or China.
- **Where.** The lead's register; B84.
- **Form.** A one-time review by the lead, repeated when the register changes; not a skill.
- **What we build.** A table: curriculum area → register row or "none".
- **First test.** One sitting.
- **Earns / improves.** Gaps found before a client finds them.
- **Needs the CEO.** Nothing.
- **Risk.** Building skills for areas no client needs. Only gaps on the holding's chosen markets are filled.

### 10. `site-upkeep` — the run behind the Care tier
- **What.** §10: test every template, one plugin update at a time after a backup, PHP current, unused plugins
  removed, plugins vetted (maker, reviews, last update), lightweight theme, images at display size; a central
  view across sites.
- **Where.** B84 Care (the Hormozi offer study already prices a Care tier with hosting, updates, backups,
  security); every WordPress or other CMS site we hand over.
- **Form.** A new register row; no row runs maintenance today.
- **What we build.** The skill and its monthly log; speed judged on field data (Search Console's Core Web
  Vitals), not a lab score.
- **First test.** A fixture WordPress site with an outdated plugin, an abandoned plugin and an oversized hero
  image.
- **Earns / improves.** Recurring revenue with low effort for workers; fewer broken client sites.
- **Needs the CEO.** The Care price (existing decision on prices).
- **Risk.** An update that breaks a client site. Repair: backup, staging, one change at a time, rollback ready.

### 11. "Reviews before credentials" — evidence for the local package's order and its sales line
- **What.** §9: NBER w26601 — on a large home-services platform, buyers chose on reviews and price; under 1 %
  of 5,200+ respondents put licensing in their top three reasons.
- **Where.** B84 local package; B83 sales line ("your licence is required; your reviews are what people
  choose by").
- **Form.** A sentence in `review-flow` (20) and an evidence row for the sales desk.
- **First test.** None needed; it orders work.
- **Needs the CEO.** Nothing.
- **Risk.** One country, one platform, 2020. Said as such.

### 12. Relationship ledger for links — the clean form of the gift tactic
- **What.** §8: an editor often runs several sites [HS]; thanks must never be tied to a link (Google's link-
  spam list names goods and products exchanged for links).
- **Where.** B84 link and PR work.
- **Form.** A field in `trust-gap-links` (21) and `press-list-and-pitch` (24): each contact with the sites and
  outlets they control; a refusal line: no gift or payment for, before or after a link; paid placements marked
  sponsored.
- **Needs the CEO.** Nothing.
- **Risk.** A gift read as a link payment. The refusal line removes it.

### 13. The link-magnet read
- **What.** §7: a niche's pages ranked by linking sites show which formats earn links there.
- **Where.** B84 — before `data-story` (23) or `tool-page` (54) picks what to make.
- **Form.** A step in `data-story`'s recon.
- **Needs the CEO.** Nothing.
- **Risk.** Old or bought links inflate a page. The top ten read by hand.

---

## 2. What these videos change in the reading of this expert (half a page)

The first study read Harry from 2026: measured, sceptical of scores, against hacks. This set is the same
channel three to six years earlier, and it shows the distance travelled: in 2020–21 it taught a 2–3 %
keyword density, domain scores above 90, a planned mix of exact-match anchors, bounce-rate thresholds and
Core Web Vitals as a penalty — each of which the 2026 Harry, or Google's current pages, reject (§1). Two
readings follow. First, **his present positions are corrections he made, not his starting point** — which
makes them more credible, not less, and confirms the first study's rule "the later one wins". Second, **any
old StudioHawk material, and any worker trained on the web's SEO advice of that period, carries these errors**;
our gates must refuse them by name (the register already does for density, domain scores and anchors).

The set also shifts what we think his business is. The first study saw an agency and a content funnel. Here
the founder also **builds and sells search assets** and studies business formally; his general manager runs
the teaching. His most transferable claim for us is not an SEO method but a market one: **the knowledge is
everywhere, the consistently run operation is rare** — three firms at a high level in Australia, he says. That
is exactly the thing workers make cheap, and it is why `market-entry-read` and the owned-asset line are worth
the CEO's attention. Last, Lawrence's international video shows the agency itself treats other countries as
"quite an exercise" — the one place where a holding that is global from day one can be better than him
without being bigger.
