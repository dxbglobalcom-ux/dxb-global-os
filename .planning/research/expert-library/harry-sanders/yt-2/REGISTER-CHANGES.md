# Harry Sanders, yt-2 — changes to `SKILLS.md`

Study short name proposed: **HY2** (`harry-sanders/yt-2`). Exactly what the register should change; the lead
merges and numbers. Playbook sections are in `PLAYBOOK.md` of this folder. No edit was made to `SKILLS.md`.

## 1. Additions to existing rows

| # | Skill | Addition to absorb (phrase for the "Specified in" column, then the substance) | Source |
|---|---|---|---|
| 1 | `readable-first` | **HY2 adds the security and snippet checks.** (a) Search Console Security issues and Manual actions reports read at every audit; a jump in indexed or discovered URLs, or URLs in a language or topic the site does not have, is classed as a possible hack before any other diagnosis. (b) Snippet-repeat scan: Google's snippets for a sample of pages are read and any sentence repeated across many of them (a notice, banner, cookie or menu text) is a finding; fix by taking the notice out of the first text of the main content. (c) When field Core Web Vitals fail, the cause is found by sorting the request waterfall by size (oversized images, third-party feeds, embeds) and by server response time — weight is reported through LCP and INP, never as a ranking factor of its own. (d) A `noindex` in robots.txt is reported as having no effect (unsupported since 1 Sept 2019); paginated pages each keep their own canonical. | §2.1, 2.2, 2.4, 2.5, 2.6 |
| 3 | `ai-recommendation-test` | **HY2 adds the session's market and the cited passage.** Each round records the country and language of the session; a round run from another market is void. Every citation URL is kept whole, including any `#:~:text=` fragment, and handed to the new `cited-passage-read`. Intake gate: a client with no non-brand query ranking in the top 30 is not sold AI-visibility work; the count is recorded at intake (his 2023 observation, to be re-checked on our own rounds). | §1.1-1.3 |
| 14 | `only-we-gate` | **HY2 adds the *How* line.** Google's Who / How / Why: a page a reader would ask "how was this created?" about carries a plain statement of how AI was used and who reviewed it, in the wording the CEO sets; a page with a fabricated or unreviewed byline fails (Google: no "deceptive authorship information"). | §4.1 |
| 18 / 60 | `striking-distance-weekly`, `decay-triage` | **HY2: the pages that carry the site are not refresh candidates** unless `page-change-guard`'s risk read clears them; candidates come from the middle performers first. | §4.3 |
| 19 | `monthly-report` | **HY2 adds the reading cadence, alerts and capacity.** (a) Rankings and clicks read on four horizons — month, quarter, half-year, year — and no change is proposed from a daily or weekly movement. (b) At hand-over, GA4 custom insights e-mail the office on a threshold or "Has anomaly" for sessions, key events and organic users (hourly for web data where available); Search Console e-mails routed to the office. (c) One question each month: can the business take more work? When full, the next month's work aims at higher-value services or areas, not more enquiries. GA4's predictive metrics are not reported below 1,000 returning users per condition. | §5.1, 5.2, 6.1 |
| 21 | `trust-gap-links` | **HY2 adds the page-level asset intersect:** for each linkable asset (tool, measured list, data page), the pages that link to rivals' assets for the same job, each through `link-vet`, one personal email per page owner. The incoming anchor profile is read first (Search Console Links report, top linking text); exact-match-heavy profiles are a risk finding; no outreach ever asks for an exact-match anchor (Google spam policies: optimized anchors in distributed articles and widgets). | §3.1, 3.3 |
| 24 | `press-list-and-pitch` | **HY2 rewrites the reactive lane for the relaunched HARO.** HARO shut December 2024, relaunched by Featured 22 Apr 2025; Featured screens pitches for AI authorship, 35 % of 2,500+ journalists opt out of fully AI-written pitches, human pitches are selected about three times as often, low-quality AI volume is filtered (company data, Sept 2026). So: the worker watches call-outs and filters exact fits; the named expert answers by voice within the window (his rule: ~10 minutes; one paragraph; a clear position); the transcript, lightly formatted, is the reply; one owned number from the evidence ledger; full name and title. The worker never writes the answer in the expert's name. | §3.4 |
| 26 | `roadmap-12-month` | **HY2: time bands quoted from Ahrefs' 2025 study, with its date** — 13.7 % of top-10 pages under a year old; average #1 page about five years old; 1.74 % of random new URLs in the top 10 within a year (6.11 % on a filtered English sample). The 2017 figures (22 %, 5.7 %) are never used. | §4.2 |
| 32 | `short-script` | **HY2 gives two formats their structure.** The on-air makeover of a business that asked for it: compliment and what the business is → one tool number → three fixes, each with its evidence on screen from our engines → "what is already good, what is missing" — an audit shown to a business, so it waits on the CEO's word with
client-finding. The one-task close: every film ends with one action doable today with a named free tool. | §6.2 |
| 53 | `migration-guard` | **HY2 adds the platform switches and the first-hour check.** The launch checklist names the switches that block indexing outside robots.txt (WordPress "Discourage search engines", Shopify store password, host or builder staging `noindex` / `X-Robots-Tag`, CDN bot blocks, canonicals still pointing at staging) and is run within the hour of launch, not at day 7; GA4 anomaly alerts are live before launch. | §2.3, 5.2 |
| 54 | `tool-page` | **HY2: the tool ships with its link list** — the page-level intersect of row 21 run on the day it is published. | §3.1 |
| — | `proof-capture` | **HY2 adds the owner's own measure:** at the start the owner names one operational measure (bookings a week, lead time, quote requests); the before and after are recorded in it beside the search measures; the case study carries the owner's words with permission. | §6.1 |
| — | `page-change-guard` | **HY2: the client's cited passages are protected** — an edit that removes or rewrites a passage in the `cited-passage-read` ledger states so in the risk read; moving a passage is a measured test with its date. | §1.1 |
| — | `platform-change-ledger` | **HY2: an expert's forecast is never a row** — his 2024 "Perspectives, not chat-Google" and his colleague's "SGE won't ship as it stands" both missed within months. Rows only for what the platform did. HY2 also supplies verified rows: free Shopping listings (21 Apr 2020), noindex-in-robots retired (1 Sept 2019), INP for FID (12 Mar 2024), Structured Data Testing Tool retired (2020-21), HARO shut and relaunched (December 2024 / 22 Apr 2025), SearchGPT prototype (25 Jul 2024) into ChatGPT search (31 Oct 2024). | §1.4, §7 |

## 2. One new row

Placed in section 1 (Measure), next to 3, in the register's form:

| # | Skill | What it does | Specified in | Row |
|---|---|---|---|---|
| (lead numbers) | `cited-passage-read` | Reads the exact passage each AI citation lifted (the `#:~:text=` fragment), keeps a ledger of passages per page, owner and prompt; protects the client's cited passages, turns a passage cited from an off-topic page into a page brief, and reads the shape of rivals' lifted passages for prompts we lose — never their words | HY2 §1.1 · fed by 3 · read by `page-change-guard`, 11, 13 | B84 |

**Specification.**
- **Trigger.** After every round of 3 (`ai-recommendation-test`); before any edit to a page that appears in the
  ledger; when 11 (`next-article`) chooses the next topic.
- **Inputs.** The round's citation log (engine, surface, market and language of the session, prompt, cited URL kept
  whole); the client's domain and named rivals; the client's page list.
- **Steps.** (1) For each citation, parse the URL fragment `#:~:text=`; percent-decode `textStart` (and `textEnd`,
  `prefix-`, `-suffix` where present). No fragment → record "page-level citation" and stop for that row.
  (2) Fetch the page once (server HTML, then rendered if the text is absent) and locate the passage; record its
  full paragraph, its heading, its word count, whether its first sentence answers the prompt, whether it stands
  alone, and its position (screenful number). Passage not found → "passage no longer on page" (an edit removed
  it — a finding for the client's own pages). (3) Classify the owner: client / rival / third party. (4) Client
  passages → the protected list read by `page-change-guard`; a client passage on a page whose topic differs from
  the prompt → a page brief for 11 with the passage as the seed and the prompt as the question. (5) Prompts where
  only rivals or third parties are lifted → a shape note per prompt (length, answer-first, self-contained, list or
  prose, numbers present) for the brief of 13; never copied wording. (6) Count per page and per engine across
  rounds; a passage cited in fewer than two of three runs is marked unstable.
- **Refusals.** No claim about why a passage was chosen; position is reported, not prescribed (two studies
  disagree); no rival text is reused; AI Overviews and AI Mode are kept apart.
- **Output.** The passage ledger (one row per passage: engine, surface, market, prompt, URL, passage, owner,
  shape fields, stable or not, date); the client's protected list; page briefs; shape notes per lost prompt.
- **Fixture (for `skill-fixture`).** Twenty citation URLs: twelve with fragments (two in non-Latin script, one with
  `prefix-`/`-suffix`, one whose passage has since been edited away), eight without.

## 3. Nothing to remove

No row is contradicted by this set in a way that changes its rule; the contradictions in `PLAYBOOK.md` §2.6, §3.2,
§4.2 correct the videos, not the register.
</content>
</invoke>
