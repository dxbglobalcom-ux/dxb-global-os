# Harry Sanders — what the holding does with it

Companion to `PLAYBOOK.md` (same folder; section numbers below point there). Source tags as in the playbook.
Lines served: **B84** DXB Web Studio (web office), **B28/B43** agency seat and ads, **B83** revenue lines and
client-finding, Media Studio for film.

The answer in one paragraph: his teaching reduces to a short, checkable standard — *readable → one lane →
mapped topic → proof only this business has → pages that close → others vouching → measured by non-brand demand
and money* — and almost every step of it is already written by him as a Claude skill for a human operator. Our
office can run the same standard with AI workers end to end, add the one thing he cannot (measured data instead
of claims, in every country), and use his own client-getting engine — free concrete lists and free tools, never
gated — to find the first clients.

---

## 1. The ideas, ranked by value

### 1. The "only-we" gate — nothing ships that a model could have written
- **What.** His whole content doctrine is one test: "Could a competitor rebuild this page with an AI tool in an
  afternoon?" (§4), backed by the rater rulebook's originality/effort clauses (§2.3) and the leak's effort
  attribute (§2.2). For an office whose writers *are* models this is the central risk and the central gate.
- **Where.** B84, every page the office writes for a client or for the holding; B28 content for clients.
- **Form.** A delivery gate plus an intake skill. The gate refuses a page that carries no *evidence item* from a
  fixed list: an owned number, a real photo or video of the work, a primary-source figure (regulator, standard,
  study PDF) with its citation, a defended position, a working tool, a named reviewed-by author. The intake
  skill interviews the client (voice note or form) and mines their invoices/CRM/support inbox for the items.
- **What we build.** `evidence-intake` and `only-we-gate` skills (§3 below); an evidence ledger per client (one
  row per item: what, source file, where used) so no page reuses a hollow claim.
- **First test.** Run the gate on the holding's own site pages. Count how many pass today. Then rebuild one
  service page with three evidence items and compare Search Console impressions and a model's summary of the
  page before/after over 28 days.
- **Earns / improves.** The difference between "AI-written site" and a site that ranks; the sales line
  ("every page carries something only your business has — we show you the ledger").
- **Needs the CEO.** Nothing to start. For the holding's own pages: real evidence (see idea 7).
- **Risk.** A new client with no data and no photos. Repair: the primary-source route (ingredient 4) and a
  built tool (ingredient 6) need nothing from the client.

### 2. The office's method, in his order — seven stations, each with a gate
- **What.** "A good SEO gives you the order, not just the list" (IG:De51QXHTfL3). Stations: (1) **Readable** —
  server HTML has the words, bots not blocked, indexed, no chains; (2) **Lane** — the one-sentence authority
  statement, signed by the client; (3) **Map** — core pages, areas of relevance, internal links, research /
  compare / buy; (4) **Proof** — evidence ledger, entity description identical everywhere; (5) **Pages** —
  blueprints, answer first; (6) **Vouching** — claim, ask, earn; (7) **Scoreboard** — non-brand clicks, AI
  mentions, enquiries, money.
- **Where.** B84 as the service method; the same stations are the monthly care package's backbone.
- **Form.** A registered adaptation inside the B84 spec (not a new plan file): station, its skill, its gate, its
  evidence. Publishing order inside station 3-5 is his: supporting wave → compare layer → money pages last.
- **What we build.** The station table and the gates as checks a worker runs before hand-off; a job cannot enter
  station N+1 with station N red.
- **First test.** The holding's own site through stations 1-3 in one job; record time and findings.
- **Earns / improves.** A method a client can be shown on one page; fewer wasted jobs (no content before
  readability, no links before a lane).
- **Needs the CEO.** The holding's own lane sentence (OPEN-QUESTIONS, decision 1).
- **Risk.** Rigid order slows small jobs. Repair: stations 1 and 2 are always first; the rest may run in
  parallel on small sites.

### 3. "Foundation presence" — the country × trade listing library as a product and as the lead magnet
- **What.** His account was made by one idea: a concrete list of free, legitimate, high-trust places to list a
  business. The three biggest posts of 929 are all this (4,777 · 4,029 · 1,536 comments; the next list-type
  posts 950, 699, 545, 523). He then re-ran it per country (AU → US → UK → Global), per trade (trades, clinic,
  lawyer, tourism, SaaS) and as "2.0, re-checked link by link". We already hold a better object than his sheet:
  `library/backlink-sources.tsv` records the **measured** link type, his does not.
- **Where.** B84 (first deliverable of every client engagement and of the monthly package), B83 (lead magnet).
- **Form.** (a) A data library keyed country × trade with columns the table already has plus `eligibility`
  (which registration number is needed) and `last_checked`. (b) A fixed-price product: we fill the listing kit
  once and submit to every eligible source, stopping at each human gate. (c) A free public page per country —
  "the measured list" — as the holding's own lead magnet.
- **What we build.** A re-measuring job (monthly) that keeps the table honest; country packs in the order the
  holding sells (see OPEN-QUESTIONS, decision 3); the `presence-run` skill.
- **First test.** Run the kit for the holding's own company in its country of incorporation; log status per
  site; after 30 days check which profiles are indexed and what a model says about the holding.
- **Earns / improves.** A product that is cheap to deliver, visible within days, and the natural first invoice
  ("presence in 40 places, measured") before a retainer. The free lists bring the people who need it done.
- **Needs the CEO.** Identity steps on registries (company number, phone/email codes); any listing fee is
  money out; confirmation that the holding really offers to supply a government before it registers on a
  supplier portal.
- **Risk.** Registering on procurement portals only for a link misuses them (§5.4 test). Rule: only where the
  client truly supplies or wants to; true data only; never invent a category.

### 4. Free tools, ungated — the holding's client-finding engine
- **What.** Two of his findings meet: tools and calculators earn 7.5× their share of AI visits [HS], and his own
  lead flow is free tools with "I don't even want your email". His tools are Claude skills, usable only by
  people who run Claude. Ours can be plain web tools anyone can use, on our domain, which is also the
  information gain of our own site.
- **Where.** B83/B84 client-finding; the holding's site.
- **Form.** Four small public tools, each ends in a plain verdict and one named fix, with "we can do this for
  you" beneath: (1) **Can AI read this page?** — fetch without JavaScript, show the words a crawler gets, share
  of text lost; (2) **Are AI bots blocked?** — robots.txt and response per bot; (3) **What does the web say you
  are?** — the `-site:` reputation searches and the name/address variants found; (4) **Is your speed really a
  problem?** — field data only, pass/fail, benchmarked against the top results for a term.
- **What we build.** The four tools on existing stack (no new runtime); each tool's output is also what a
  worker attaches to a first-contact message, so outreach always carries a measured fact about the prospect.
- **First test.** Build tool 1 (smallest). Run it over 200 business sites in one city and one trade; the share
  that fail is itself the first data story (idea 5) and the outreach list.
- **Earns / improves.** Inbound from search and AI; a reason to contact a business that is true and specific.
- **Needs the CEO.** Nothing to build. Outreach volume and channel are his call under the approval gate rules.
- **Risk.** Tools invite scraping load. Repair: rate limit; no stored data.

### 5. The data-story desk — digital PR run by AI workers
- **What.** RAIDS (§6) is a procedure with data in the middle — the part models are good at ("80 % less time
  from idea to pitch" [HS]) — and a human relationship at the end. His evidence says press, not on-site work,
  separates brands ChatGPT names from brands it does not [HS].
- **Where.** B84 monthly package ("PR, links" is already in the row's scope); B28 for clients' brands; the
  holding's own authority.
- **Form.** A service: one data story per quarter per client. Skills: `data-story` (find the finding),
  `press-list` (20-30 journalists who wrote on it in 90 days), `pitch` (subject + three bullets + methodology
  page). A calendar library of dated moments per country.
- **What we build.** The three skills; a methodology-page blueprint so every figure is checkable; a placements
  log (outlet, URL, link type measured, date).
- **First test.** Story from idea 4's scan ("X % of [trade] sites in [city] are blank to AI crawlers"),
  pitched to 20 trade and local journalists. Count replies and placements.
- **Earns / improves.** The highest-value links and mentions; a recurring line in the care package.
- **Needs the CEO.** Whose name signs the pitch and is quoted (identity); media-law comfort with naming
  companies in a "revealed" story — our default is to publish aggregates, not names.
- **Risk.** Journalists ignore unknown senders; one success in his account has no denominator. Start with
  reactive call-outs (SourceBottle, Qwoted, Featured free plans), which need no relationship.

### 6. The reel machine — his formats, our production, honest about who speaks
- **What.** His output: 163 posts in October 2026, 118 in 23 days of November; before March 2026 about one a
  month. The repeatable formats: tier list S-F · skip / do / master · beginner / pro / top 1 % · this-or-that ·
  "how [brand] gets found on Google" (a video plus a stat post) · page blueprints #1-6 · "one idea from my
  book" · "the exact combination we use" (tool + skill) · "SEO for [trade]" · grading commenters' claims ·
  reaction to a platform change. Each ends with one keyword ("Comment LISTINGS") that triggers a DM with a link.
  Winners are re-shot and re-posted for months (BRIEF: 11 posts, 3,079 comments; PACK: 10 posts).
- **Where.** B28/B43 (the agency seat produces), B83 (it finds clients), Media Studio and the motion-graphics
  door for film.
- **Form.** A content format library (the eleven formats as scripts with slots) fed from the playbook and from
  our own measurements; a keyword → asset table; one asset page per keyword on our site (so the DM step is
  optional and the asset is public).
- **What we build.** The `reel-script` skill; the asset pages; screen-recorded and motion formats that need no
  presenter (brand teardowns, tier lists, measured-list reveals).
- **First test.** Twelve reels in two weeks in three formats that need no face, each pointing to one free tool
  or list. Measure saves, comments, tool visits.
- **Earns / improves.** The top of the client funnel; the same films are the web office's proof of taste.
- **Needs the CEO.** Accounts and any DM-automation subscription (identity, money out). The presenter question:
  his own data says a named person beats a faceless brand; a synthetic presenter passed off as a person would be
  deception and he himself calls AI-avatar video "more slop". Decision 2 in OPEN-QUESTIONS.
- **Risk.** Volume without evidence is the slop he warns about. Rule: every reel states one measured fact of
  ours or one primary-source quote.

### 7. The holding as its own first case — case-study factory and review engine
- **What.** His B2B numbers come from proof on the site: case studies 10 → 50+, reviews hub, consistent
  third-party description (§10). His blueprint: every result with a number, a starting point and a time period.
- **Where.** B84 — the row says the holding's own site is the first case.
- **Form.** A case-study blueprint and a baseline ritual: before any job, a worker records the starting
  numbers (non-brand clicks, indexed pages, AI mentions for ten buyer questions, enquiries); the case study is
  generated from the baseline and the placements/changes log.
- **What we build.** `baseline` and `case-study` skills; a reviews hub page; the after-job review ask (script
  that requests the job and the place be named — never the wording, never an incentive).
- **First test.** Baseline the holding's site today; publish case study #1 at day 60 whatever the numbers are.
- **Earns / improves.** The proof a first paying client asks for.
- **Needs the CEO.** Nothing.
- **Risk.** Thin early numbers. An honest small result with a method beats none.

### 8. The monthly care package, defined — cadence plus four gauges
- **What.** His compounding cadence (§11) is a ready service definition; his board slide — eligible · chosen ·
  arriving · paying off — is a ready client report.
- **Where.** B84 monthly packages.
- **Form.** Product tiers by how many units of each cadence line a month: pages improved, new pages, earned
  mentions, data stories; one report page with the four gauges, each from a free first-party source
  (Search Console, Bing Webmaster, Clarity, the client's enquiry form with "how did you hear about us?").
- **What we build.** `four-gauges` report skill; the package table with unit counts.
- **First test.** Produce the report for the holding's site for one month.
- **Earns / improves.** Recurring revenue with a report a non-technical owner reads in a minute.
- **Needs the CEO.** Prices.
- **Risk.** Attribution of "paying off" is weak without the client's sales data; say so on the slide.

### 9. Page blueprints as the Web Studio's skeletons
- **What.** §7's table — service, pricing, homepage, location, case study, calculator, About, product,
  category, reviews hub — each with required blocks ("who it is not for", price range and what changes it,
  one real job).
- **Where.** B84 site builds and renewals.
- **Form.** A blueprint library a build job reads; a gate that a page of type X has X's required blocks; one
  working tool per site as a standard line item ("the calculator page").
- **What we build.** The ten blueprints as structured specs; `tool-page` skill that proposes the calculator
  from the client's own data.
- **First test.** Rebuild the holding's main service page to blueprint; put our own prices on it.
- **Earns / improves.** Conversion and AI-quotability of every site we ship; an upsell with a reason.
- **Needs the CEO.** Our own public prices (decision 4).
- **Risk.** Blueprint sameness. The design stays the Studio's; the blueprint fixes content blocks only.

### 10. Link vetting by page, never by score
- **What.** A link is judged by whether the *linking page* ranks and gets traffic, and by relevance (§2.2, §5.1).
- **Where.** B84 link work; any paid placement decision.
- **Form.** A gate: no placement, guest post or directory is pursued without a page-level check through
  DataForSEO; DA/DR never appear in our reports.
- **What we build.** `link-vet` skill; a banned-source list (link rings, paid top-10 lists, pay-to-play awards,
  expired-domain redirects, social-signal packs — and anything in a gambling or adult neighbourhood).
- **First test.** Vet the 25 "follow" rows of the existing table at page level.
- **Earns / improves.** Money not spent on worthless links; a report that survives scrutiny.
- **Needs the CEO.** Any paid placement is money out.
- **Risk.** None material.

### 11. Sell with a measured comparison, in plain words
- **What.** How he won Officeworks: one severe finding (client-side rendering would hide the site), explained
  as outcome, "as if to a five-year-old", no judging of their team (YT:HbIYPu3RqaQ 06:04). His enterprise note:
  "competitors is a great way to move the needle" (YT:vRzBI_12kfM 04:16). His audit statistics give the
  opening line (89 % weak titles… §2.1).
- **Where.** B83/B84 sales.
- **Form.** A one-page pitch generated per prospect: three measured facts (tool outputs from idea 4), the
  prospect beside the two sites that outrank it, the first three fixes in order with a price.
- **What we build.** `prospect-page` skill; the sales script (below, larger picture).
- **First test.** Ten prospect pages for one trade in one city; send; count replies.
- **Earns / improves.** First clients.
- **Needs the CEO.** Outreach go-ahead and sender identity.
- **Risk.** Cold outreach is weak by his own account ("face-to-face networking beats cold outreach"); the page
  must carry a real finding or it is spam.

### 12. Pattern library from the brand teardowns
- **What.** Ten named patterns with numbers: a page per colour (Figma), per occasion (Princess Polly), per job
  (CapCut), per cuisine × city (DoorDash), a verdict on every item (CarGurus), a builder tool (Micro Center),
  free templates (DocuSign).
- **Where.** B84 e-commerce and catalogue clients.
- **Form.** A library entry per pattern: when it applies, the data it needs, the thin-page guard ("publish only
  pages that have something worth reading").
- **First test.** Pick the pattern for the first e-commerce client; ship 20 pages, not 2,000.
- **Earns / improves.** Scalable page sets that are not scaled content abuse.
- **Needs the CEO.** Nothing.
- **Risk.** Programmatic volume on a low-authority site gets nothing indexed. Volume follows authority.

### What his own machine teaches about price and funnel (playbook §14)

| His practice | Reading | What we do |
|---|---|---|
| Most campaigns at $1,500-3,000 a month; lead form starts at "under $3k"; audits $2,000-5,000; migrations $3,000-10,000; digital PR from $4,000 a campaign | The market's reference prices for human-delivered work in AU/UK/US | Price Foundation under his audit band and Care under his growth band, as fixed units with the method shown; publish the prices — he hides his while teaching that hiding prices loses AI recommendations |
| One conversion offer: a free "Masterplan" in 24 business hours | The audit is the pitch | Ours is produced by workers in minutes from the idea-4 tools and the `prospect-page` skill; promise hours, not days |
| Lead form asks budget and "how did you hear about us (incl. ChatGPT)" | Qualification and attribution in one step | Same two fields on our form |
| 60+ case studies in one fixed format | Proof is manufactured by routine | Idea 7's baseline ritual from job one |
| Academy: free courses, 59 skills, 37 tools, sheets — "some eventually become clients" | Free expertise is the top of the funnel; the email gate is used only on white papers | Ungated lists and tools on our own domain |
| March 2026: 136 posts, 46 comments. June: 32 posts, 10,435 comments | Volume did nothing; one concrete free list behind one keyword did | Do not start the reel machine before the first asset exists. Asset first (idea 3's measured country list), then films |
| Winner re-issued by country, by trade, as "2.0 re-checked" | One asset, many editions | Our edition map: countries he does not cover, each with the measured column |
| Monthly phone call to every client | Retention is human contact | The four-gauge report plus a short spoken summary each month; the CEO is not the caller — the report must stand alone |

---

## 2. The larger picture — a first-place web office built on this

**What the client buys.** Not "SEO" and not a second "AI search" invoice (he rates that F, and saying so is a
sales advantage). Three things, in order: **Foundation** (fixed price, two weeks: readable site, lane sentence,
map, entity description made identical everywhere, presence in every eligible measured source, baseline) →
**Build** (pages to blueprint with the evidence ledger, one working tool) → **Care** (monthly: the cadence, one
data story a quarter, the four-gauge report).

**How the work runs.** Seven stations, one skill and one gate each. A worker cannot write before the site is
readable, cannot publish without an evidence item, cannot chase a link without a page-level check, cannot
report a score Google does not use. Humans — the client — are asked for exactly the things models cannot make:
ten minutes of talking, their numbers, their photos, their reviews. That intake is the product's real
bottleneck and deserves the best design in the office.

**What makes it first place rather than a copy of StudioHawk.**
1. *Measured, not claimed.* He gives lists and his own unpublished numbers; we publish the measurement — link
   type per source, text lost per page, bots blocked — with date and method, per country. Every measurement is
   also content, a tool and a pitch.
2. *Global from day one.* He covers AU, US, UK. The country × trade library in the languages and markets he
   does not serve is open ground.
3. *The whole chain in one house.* He sends clients elsewhere for design ("you still need a good designer") and
   for film; the holding has the Web Studio, the Media Studio and the agency seat. A data story becomes a page,
   a tool, a reel and a pitch in one job.
4. *No hours to sell.* His price is 120 specialists' time. Ours is fixed-price units with the method visible.

**How it finds clients — his engine, ours.** Daily short films in fixed formats → each points to one free,
ungated asset (a measured list, a tool) → the asset shows a plain verdict about *their* site → the next step is
a fixed-price Foundation. Alongside: a prospect page with three measured facts for businesses we approach.
Honest sequence of proof: the holding's own site is case study #1; the first clients get Foundation at a price
that buys the case study.

**The sales script, built from his lines.** (1) "Search your name minus your own site — that page is what a
Google rater and ChatGPT read about you." (2) "Here is what an AI crawler receives from your page" [tool
output]. (3) "Here are the two businesses AI names instead, and the three things they have that you do not."
(4) "We fix them in this order, for this price; in 60 days you see these four gauges." (5) "Who this is not
for: anyone wanting rankings guaranteed, or a thousand AI pages."

**What we do not copy.** The comment-to-get-it gate (it games reach and delays the asset; ours is public, with
the comment optional); claims of secret knowledge ("I read every patent"); the unverified numbers; registering
on government supplier portals without a real intent to supply; and his example niches that fall outside the
holding's boundaries. Reviews are only ever asked of real customers, never scripted or rewarded.

---

## 3. Skill candidates

Each is written so the skill could be authored from it. Tools named are the office's decided set (Screaming
Frog, DataForSEO, OpenSEO, Search Console) plus plain fetches.

| # | Skill | Triggers when | Inputs | Steps | Output |
|---|---|---|---|---|---|
| 1 | `readable-first` | Any new site job; after any relaunch; before content work | Domain; Screaming Frog crawl export; robots.txt | (a) Fetch 10 key pages without JavaScript, compare word count with rendered; flag >30 % loss. (b) Test robots.txt and HTTP response for search and agent bots; list blocks. (c) Indexing: sitemap present, key pages indexed. (d) Redirect chains >1 hop and broken pages, each weighted by clicks and links lost. (e) Heading hierarchy and one-job-per-section on the key pages. Order findings: blocks reading → blocks choosing → rest. | Pass/fail on four checks; ordered fix list with the page and the cost of each; nothing else. |
| 2 | `lane-and-map` | Station 2-3; before any content plan | Search Console query + page export (16 months); list of pages; top 3 competitors | (a) Cluster pages and queries by topic; show share of content per topic and the off-lane pages. (b) Draft three lane sentences "Our site exists to be the authority on ___"; client picks one. (c) Core list: every selling page + its buyer query (10-20). (d) Areas of relevance: People-Also-Ask, competitor gaps, client's inbox questions (≥20). (e) Assign each supporting page its core page and anchor. (f) Tag research/compare/buy; name the emptiest column. (g) Relationship test for each sub-topic (do the ranking sites change?). (h) Zombie list: 12 months, no clicks and no links → delete or merge. | The map as a table (page, type, stage, links to, anchor, status), publishing order in three waves, prune list. |
| 3 | `evidence-intake` | Start of any page or content job | Client interview (voice or form); exports from invoicing/CRM/support; photos | (a) Ask ten fixed questions (jobs done last year, most-asked question, most-returned product and why, what the industry gets wrong, what failed and what you changed…). (b) Mine exports for one publishable number per topic. (c) Search `topic filetype:pdf` for regulator/standard/study figures; keep source and page. (d) Write each item to the ledger with its source file. | Evidence ledger rows; gaps listed as asks to the client. |
| 4 | `only-we-gate` | Before any page is delivered | The page; the ledger; top 5 ranking pages for its query | (a) List the page's claims; mark each as found in the top 5 or not. (b) Require ≥1 ledger item on the page, cited. (c) "Afternoon test": name what a competitor could not reproduce; if nothing, fail. (d) Needs-met: write the query, read as that person, grade Fully/Highly/Moderately/Slightly/Fails; below Highly fails. (e) Named author or reviewer with a verifiable credential. (f) Paste-and-summarise check: does a model's 4-line buyer summary carry the main point? | Pass/fail with the failing clause and the one fix. |
| 5 | `page-worth-ranking` | Money pages; conversion complaints | URL; target query; Search Console row for the page | Check the three pillars: A — who links/mentions this page; B — title states the thing plainly, first 100 words keep the title's promise, heading order, internal links in; C — answer above the fold, objections handled, something to do (tool, price, booking), no reason to go back to results. | Three scores with evidence and the first fix. |
| 6 | `entity-consistency` | Station 4; before any listing or PR | Brand name; domain; known profiles | (a) Run `brand -site:domain` and `brand reviews -site:domain`; collect how others describe the business. (b) Compare homepage title, homepage copy, About, founder's public profile headline, third-party profiles; list every variant of name, address, phone and of the "what we do" sentence. (c) Ask three models "what is X known for, and where did you get it"; trace wrong statements to their source. | One canonical description and NAP; a correction list by source, in his order. |
| 7 | `presence-run` | Foundation product; monthly re-check | Listing kit (filled once); country; trade; registration numbers | (a) Select rows from the source library where region and trade fit and the eligibility is met. (b) Order by measured value. (c) Submit; stop at every human gate (code, captcha, payment, identity) and queue it. (d) Log site, status, profile URL. (e) After 30 days re-fetch each profile: live, indexed, link type. | Status log; measured presence report. |
| 8 | `data-story` | Quarterly PR; whenever a client hands over data | Spreadsheet/CRM/survey export, or a scrape we run; client's audience | (a) Recon: what the audience's world complains about (news, trends, forums). (b) Profile the data; propose five findings as one-line headlines with the number. (c) Rank by surprise, checkability, tie to the client's topic, and timing (calendar moment, trend rising). (d) Build the comparison table and a methodology note. | One finding, headline, table, methodology page draft, three quotable bullets. |
| 9 | `press-list-and-pitch` | After `data-story` | The finding; country; topic phrases | (a) Search 4-5 phrases in news; keep journalists who covered it in the last 90 days. (b) Sheet: outlet, journalist, public contact, article URL, note. 20-30 rows, no duplicates. (c) Pitch: subject "Revealed: …", three bullets, link to the methodology page, one human line referring to their article. (d) One follow-up at day 7, then stop. (e) Reactive lane: daily scan of call-out services; answer the exact question with one number and full name and title. | Media list, pitch emails ready for sending, placements log. |
| 10 | `link-vet` | Before pursuing or paying for any link | Candidate URL (the page, not the domain) | DataForSEO: does the page rank for any query, estimated traffic, topical relevance to the client's lane, outbound-link neighbourhood; mark sponsored status. | Take / skip with the two numbers; never a domain score. |
| 11 | `ai-visibility-check` | Baseline; monthly | Ten buyer questions per client (from the map's compare/buy stages); competitors | Ask each question in fresh, non-personalised sessions of the major assistants; record who is named, in what words, and the cited sources; pull Search Console AI impressions, Bing Webmaster citation data, Clarity bot visits, GA4 AI referrals. | Table: question × engine → named or not, who instead, sources to win. |
| 12 | `four-gauges` | Monthly report | Outputs of 1, 11; Search Console; enquiry log | Eligible (readable, indexed, not blocked) · Chosen (AI mentions, non-brand impressions) · Arriving (non-brand clicks, AI referrals) · Paying off (enquiries, "how did you hear", revenue if shared). Same order every month, change vs baseline. | One page. |
| 13 | `review-engine` | After every completed job; on every new review | Job record; review text | Ask message that invites the customer to say what was done and where (no wording supplied, no reward). Reply drafts that restate the job and place. For a suspected fake review: match against the platform's policy categories and draft the removal request. | Ask, reply, or removal request. |
| 14 | `winner-loser` | After a confirmed Google update finishes rolling out | Search Console page data, 28 days before and after | Rank pages by change; classify winners/losers by type and evidence level; no site changes proposed while the update is rolling. | Which page types moved and the hypothesis to test. |
| 15 | `reel-script` | Daily content | A playbook item or one of our measurements; a format name | Fill the format's slots (hook in the first three seconds, three to eight rated items or one teardown, one measured fact, one keyword and its asset page). | Script, on-screen text, caption, asset link. |
