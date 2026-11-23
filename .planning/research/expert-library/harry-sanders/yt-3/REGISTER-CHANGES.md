# Changes proposed to `SKILLS.md` from Harry Sanders' further videos, set 3

For the lead to merge; the register exists once and this file does not edit it. Short name proposed for this
study: **HY3** = `harry-sanders/yt-3`. Section numbers (§) point to this folder's `PLAYBOOK.md`; ideas (idea N)
to this folder's `FOR-THE-HOLDING.md`. New rows carry a working name and **no number**.

Proposed effect: **3 new rows on the chain** (`international-structure` in Found, `market-entry-read` in
Measure, `site-upkeep` in Care), **1 candidate held until the CEO opens the line** (`site-asset-diligence`),
additions to 9 existing rows' cells and notes on 2 more (20, 24). One point for the disagreements table.

---

## 1. Rows that change — the addition to absorb

| # | Skill | Add to "Specified in" | Add to "What it does" |
|---|---|---|---|
| 1 | `readable-first` | · HY3 §2 adds the launch switches and the mobile-parity check; §6 the facet crawl rule | "; the launch switches read on every launch and hand-over — robots meta noindex in the rendered head, `X-Robots-Tag` header, `Disallow: /`, the CMS's own 'hide from search' setting (WordPress: a meta noindex since 5.3), one host and HTTPS by 301, attachment pages on sites upgraded from WordPress before 6.4; main content present in the mobile render; filter URLs that should not be indexed kept out of the crawl by robots.txt or fragments, not only by canonical" |
| 53 | `migration-guard` | · HY3 §2.1 | In step (6), launch day: "staging's `X-Robots-Tag` and the CMS's search-visibility setting removed and re-read from outside" |
| 15 | `money-page-audit-fix` | · HY3 §6 | "; on stores, facets with real demand become their own category pages, the rest are kept out of the crawl (Google's faceted-navigation page)" |
| 19 | `monthly-report` | · HY3 §3, §11 | "; for sites that publish, a Discover line from Search Console's Discover report; analytics kept: GA4 retention at 14 months from onboarding, Search Console exported monthly" |
| `proof-capture` | (section 6) | · HY3 §3 | "; on day one GA4 retention set to 14 months and the baseline fields exported to our own store (GA4 explorations keep 2 or 14 months, Search Console 16)" |
| `suggestion-triage` | (section 6) | · HY3 §4 | "; a false-pass sweep: every check a tool marked green re-read against the client's market sheet (country, languages, `hreflang`, currency, address and phone format, units, dates), each overturned tick naming the engine or user it matters to" |
| 20 | `review-flow` | · HY3 §9 (NBER w26601) | no change to the cell; the order note for the lead: where a local client has neither, reviews are worked before the About page's credentials. HY3 also records a claim **refused**: that review *wording* outranks stars (§1 C9) — no words are supplied |
| 21 | `trust-gap-links` | · HY3 §8 | "; each contact recorded with every site and outlet they control; nothing given for, before or after a link" |
| 24 | `press-list-and-pitch` | · HY3 §8 | no change to the cell; the media list carries the same "outlets this person controls" column |
| 23 | `data-story` | · HY3 §7 | "; recon includes the niche's pages ranked by linking sites, to see which formats earn links there" |
| 51 | `schema-graph` (and `repo-seo-gate` in 1) | · HY3 §11 | For publishing sites: "robots meta allows `max-image-preview:large`; a representative image at least 1200 px wide declared as primary image or `og:image`" |

`question-harvest` (10) — no change: HY3 §7's modifier families are held by HK's seven query families; the
lead may add "audience and occasion modifiers written natively per market" to the per-language step if it
wishes.

---

## 2. New rows

### `international-structure` — Found · B84
**What it does (register line):** One structure for a site that serves more than one country or language:
ccTLD, subdomain or subfolder chosen by Google's trade-offs; one language per page; reciprocal `hreflang` with
`x-default`; no redirect by IP or guessed language; each market's pages researched from its own questions,
never a translated keyword list; checked on every release. **Specified in:** HY3 §5 (Lawrence Hitches,
`noprSYGApa8`, completed from Google's two international pages).

- **Trigger.** A client (or the holding) sells in, or plans, a second country or language; a site already has
  language versions; a migration that adds or merges markets (with 53).
- **Inputs.** Markets (country × language) and their order; current URLs; the CMS; whether content differs by
  market (prices, stock, law) or only by language; domains owned; the crawl.
- **Steps.** (1) Classify each market need: language only, region only, or both. (2) Choose structure with
  the reason written: ccTLD where a market needs clear country targeting and separate operation; subfolder by
  default for one host and low upkeep; subdomain only for a technical reason; never URL parameters. (3) URL
  map: one URL per page per language-market; one language per page; same-language regional versions marked
  canonical to themselves and joined by `hreflang`. (4) `hreflang` set by one method (HTML, header or sitemap):
  ISO 639-1 language, optional ISO 3166-1 region, never region alone; every version lists itself and all
  others; `x-default` for the selector or fallback. (5) Switching: a visible language/country selector; no
  automatic redirect by IP or browser language; no IP-based content swaps. (6) Market content: for each
  market, the question bank from `question-harvest` run in that language and country; currency, units,
  address, phone and date in local form; a separate Business Profile and entity details per real location.
  (7) Measurement: Search Console filtered by country (and a property per ccTLD); Bing Webmaster Tools.
  (8) Check: crawl every `hreflang` target — 200, indexable, self-canonical, returns the link, `x-default`
  present; fail the release on any break.
- **Output.** The structure decision with reasons; the URL map; the `hreflang` set; the reciprocity report;
  per-market research briefs; what was not checked.
- **Refusals.** No machine translation published unread by a native reader; no doorway copies per country
  with only the name swapped; no IP redirects.

### `market-entry-read` — Measure · B84, B83
**What it does:** For one trade, ranks candidate countries by measured demand against the weakness of what now
ranks, so entry (the holding's, or a client's expansion) is chosen on numbers. **Specified in:** HY3 idea 2,
from the market thesis in `noprSYGApa8` 05:04 and `wqqjqcn7uI0` 09:13.

- **Trigger.** The CEO's country-order decision (existing decision 3); a client asks where to expand.
- **Inputs.** The trade; candidate countries and languages; 30 buyer questions per country written natively.
- **Steps.** (1) Per country through DataForSEO: volume and difficulty per question. (2) Top 10 per question
  classed by source type (directory, aggregator, marketplace, local firm, national brand, forum). (3) A sample
  of ten ranking pages per country read against the basics of `only-we-gate` (answer first, real evidence,
  named author) — counted, not scored. (4) Agencies ranking for "SEO agency + capital city" in the local
  language, counted. (5) Five questions through `ai-recommendation-test` (sampled, labelled as such).
  (6) Rank: demand × share of weak results; difficulty shown beside, never alone.
- **Output.** One page: countries ranked, each with demand, SERP make-up, weak-page share, agency count, AI
  sample, and the one fact that decided its place.
- **Refusals.** No vendor score reported alone; questions never machine-translated from English.

### `site-upkeep` — Care · B84
**What it does:** The monthly maintenance run behind the Care tier for every CMS site the office keeps:
backup first, one update at a time, unused plugins removed, plugins vetted, platform version current, every
template's field speed read, rollback ready. **Specified in:** HY3 §10 (Lawrence Hitches, `gMa_T2THIik`); the
price sits in OF's Care tier.

- **Trigger.** Monthly per site; a security release; a failed check in 1.
- **Inputs.** Admin access (the client's, granted to the office as manager); hosting panel; a staging copy;
  Search Console's Core Web Vitals report.
- **Steps.** (1) Full backup and restore point. (2) Inventory: core, theme, plugins with version, maker, last
  update, active or not; PHP version. (3) Remove deactivated and abandoned plugins (no update in a year, or
  closed in the directory) after checking what uses them. (4) Update on staging one item at a time; test the
  key templates after each; then live, the same order. (5) PHP to the current stable version the stack
  supports, on staging first. (6) Images over a size limit compressed and resized to display size. (7) Field
  speed per template group from Search Console; the hosting plan reviewed when traffic grew. (8) Log every
  change with its rollback.
- **Output.** The monthly log; issues needing the client (licences, paid plugins, hosting plan — money is
  theirs); a line for `monthly-report`.
- **Refusals.** No plugin from an unknown maker; no bulk update; no change without a backup.

### Held until the CEO opens the line — `site-asset-diligence` · B83
**What it would do:** Reads a content site (to buy, to build in its niche, or one of our own to value) before
money moves: traffic source and its history against Google's updates, revenue proof, the review guidance's
first-hand-evidence bar, affiliate programmes' halal fit, disclosures, link profile through `link-vet`, and
the broker multiple. **Specified in:** HY3 idea 3, §13. Not to be authored before the CEO's word on the
owned-asset line (new work, money out, Islamic boundaries); listed here so the register knows it exists.

---

## 3. For the disagreements table

| Point | The studies | Suggested reading |
|---|---|---|
| Old StudioHawk teaching | HY3 §1: the 2020-21 channel taught 2–3 % density, DA/DR above 90, a planned anchor mix, bounce-rate targets, CWV penalties; the 2026 Harry and Google's pages reject each | The later Harry and Google's pages. Any source or worker reproducing the old rules is refused by name (density, domain score, anchor mix already are) |
