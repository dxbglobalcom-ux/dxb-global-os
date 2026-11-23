# Harry Sanders' skill files — what the holding does with them

Companion to `SKILL-FILES.md` (same folder: the map of his 58 skills, what each adds to our register, the tests,
and how he packages them). Lines served: **B84** DXB Web Studio first, **B28** where reviews and feeds touch the ad
office, **B83** where a tool finds clients. Nothing here is built or tried. Every figure from his files is his claim.

The answer in one paragraph: his files turn our one-line skill candidates into followable procedures, and four of
them do something our register does not do at all. The most valuable is not an SEO trick but a **judgement gate** —
a skill that takes any list of suggestions (from a worker, a tool, another agency) and sorts it into approve, check
first, park and drop, with destructive changes held back until evidence is in the same row. For an office whose
workers produce suggestions without tiring, that gate is the difference between an office and a noise machine. The
second is **the measurement protocol for AI answers**, which makes our most-sold promise ("this is the page the
assistant quoted") repeatable. The third is **his habit of shipping every skill with a test input and its expected
output** — for us, a regression suite for workers.

---

## 1. The ten additions, ranked

Ranked by how much each raises the web office's quality or brings it clients. "First test" is always on the
holding's own site or on a fixture, because the office has no client yet.

### 1. `suggestion-triage` — the judgement gate between a list and a change
- **What.** From `packs/source-grounding`: every suggestion numbered and split, mapped to one area of the work, dropped
  if it is on a waste list or against a written stance, gated if destructive, then ranked APPROVE NOW / CHECK FIRST /
  APPROVE / PARK / DROP, with **one constraint for the next 90 days** found from the data, and a hard rule that any row
  asking for automatic publication is dropped whole (`SKILL.md:69`). It is the procedure version of the CEO's approval
  gate and of `weekly-constraint`.
- **Where.** Binds every station of B84; the office's own workers first; then the Show station.
- **Form.** A gate every worker's change list passes before the lead sees it; and a public tool, "paste the audit
  your agency or tool gave you".
- **What we build.** The skill with *our* stance file (not his: ours is written from our studies and our boundaries,
  each stance with its source), the evidence rule for destructive changes, the verdict table, the 90-day constraint
  line. A public page that accepts a pasted report or a CSV, returns the table, stores nothing.
- **First test.** Crawl the holding's site with the Frog and run OpenSEO's audit; feed both issue lists to the triage;
  record how many lines survive and whether the lead agrees with each verdict; the CEO sees one table.
- **Earns / improves.** Fewer wasted jobs; destructive mistakes stopped by rule; the most honest client-finding tool in
  the market (it tells the visitor what *not* to pay for).
- **Needs the CEO.** Publishing the public tool (decision 9 holds client-finding at "not now").
- **Risk.** A stance file that hardens into dogma. Repair: every stance carries its source and date, and is reviewed when
  a measurement contradicts it.

### 2. The AI-answer measurement protocol — #3 and #19 made repeatable
- **What.** From `ai-visibility-dashboard`, `ai-citation-monitor`, `ai-visibility-check`, `citation-share-auditor`:
  a prompt library in three layers with a scoring key; a frozen setup; three runs per prompt in fresh sessions; day-1 and
  day-8 baselines; four yes/no columns per answer; counts over completed answers; three piles per prompt; Bing citation
  share as a second instrument; gauges with named sources; the citation × traffic 2×2 per page.
- **Where.** B84: register #3 (the measuring engine) and #19 (the monthly report); the prospect page (#5).
- **Form.** A scheduled worker job per client and a stored series; a short public form of it (eight questions, one
  assistant, the 75 % / 30 % thresholds) for the Show station.
- **What we build.** The library format, the run log (assistant, surface, model, searched, answer, URLs), the coder,
  the diff, the warehouse that keeps every series beyond Search Console's 16 months and GA4's six months of Business
  Profile data.
- **First test.** Fifteen prompts for the holding in its main market; day-1 and day-8 rounds on one assistant (90
  answers), then one more assistant; report the noise band between the two baselines before anything is changed.
- **Earns / improves.** The monthly report's "Chosen" line becomes a measurement a client can audit; the sales line
  "this is the page the assistant quoted" becomes true and dated.
- **Needs the CEO.** Accounts: Bing Webmaster Tools, Search Console, Clarity for the holding's site (his click); any
  paid tracker (money out) — his own advice is to buy one only once there is something to track.
- **Risk.** Measuring the API surface and calling it the consumer surface. Repair: every round states its surface; the
  two are never added.

### 3. The crawl-to-plan engine — #1 with severities, tracing and our own release gate
- **What.** From `technical-seo-audit` (pack), `screaming-frog-analyser`, `clarity-ai-bot-auditor`, `claude-code-seo`:
  redirect tracing from a flat export, severity classes, prioritising by scale and inlinks and past traffic, orphans
  only by comparison, a verdict per AI agent, and a repository pass for sites we build in code.
- **Where.** B84 station "Measure" and every release of a site we build (decision 14's migration process included).
- **Form.** A worker skill; the "Can AI read this page?" and "Are AI bots blocked?" public tools are its faces.
- **What we build.** The engine on the Frog's exports (and its MCP server if the licence allows), joined to Search
  Console clicks; `repo-seo-gate` run on every build of a site in our repository.
- **First test.** Two runs: his `sample-crawl-screamingfrog.csv` compared with his `sample-audit-report.md` (does our
  engine find his planted defects — the five-hop chain to a 404 on the second-busiest URL, the About loop, the
  noindexed money page, the 503 booking page, the canonical chain, the two orphans?); then the holding's own site.
- **Earns / improves.** The first page of every proposal and the gate before every hand-over.
- **Needs the CEO.** The Frog's paid licence if the MCP server needs it (his file says it does; B84 holds it as "to be
  measured"); connecting Search Console.
- **Risk.** A long list read as importance. Repair: the triage of addition 1 runs on its output.

### 4. Skill fixtures — every skill ships with a planted-defect input and its expected output
- **What.** His core pack gives three skills a realistic sample input with planted problems and the finished output "you
  should hit" (`packs/core-seo-skills-pack/README.md:35`). For an office of AI workers this is a regression suite: a
  skill changed, a model changed, a worker changed — the fixture shows whether quality held.
- **Where.** Binds every station; every skill in the register before it is called authored.
- **Form.** A folder per skill: input, expected output, the defects it must find, the refusals it must make (a fabricated
  figure, a missing column, a boundary case), and a pass rule the verify door runs.
- **What we build.** Fixtures for #1, #3, #18, #23 first, in two languages each (one English, one with non-ASCII letters,
  to catch the class of defect his review script has).
- **First test.** His three samples used as our first three fixtures (they stay on this machine, not in the repository —
  our committed fixtures are written by us on the same pattern).
- **Earns / improves.** Quality that can be shown, not asserted; safe model upgrades.
- **Needs the CEO.** Nothing.
- **Risk.** Fixtures that test the easy cases. Repair: each fixture carries at least one trap (an empty JavaScript
  shell, a branded-only export, a review in another language).

### 5. The only-we gate, scored — #14 with three repeatable scales
- **What.** The afternoon test, the six ingredients graded with quoted lines, Google's 32 questions weighted and
  lettered, the rater's O / U / R letters with Low and Lowest triggers that cap the verdict, consensus share.
- **Where.** B84, every page we write for a client or the holding; B28 content.
- **Form.** A delivery gate with a written pass rule (the proposal in `SKILL-FILES.md` §2 #14).
- **What we build.** The scorer, the calibration set (three pages per market graded by hand once, re-graded on every
  change of model), the re-rate delta view.
- **First test.** Grade three existing pages of the holding's site; fix them; re-rate; see whether the grades move and
  whether Search Console impressions follow over 28 days.
- **Earns / improves.** The difference between an AI-written site and a site that ranks; a gate a client can be shown.
- **Needs the CEO.** Real evidence for the holding's own pages (its numbers, photos, a named reviewer).
- **Risk.** A score gamed by the writer it grades. Repair: the gate is run by a worker that did not write the page, and
  its quoted-line rule makes fabrication visible.

### 6. `tool-page` — a working calculator on every site, built to one page order
- **What.** From `calculator-page-builder`: five ideas per niche, then one page in a fixed order — the answer above
  the tool, the tool (result shown at once, never behind an e-mail), the result explained, each input explained, the
  method and every rate with its source and check date **in the HTML**, a worked example, a table of common answers,
  when the estimate does not apply, who built and checked it, the next step; before publishing, five real cases from
  the client's records run through it.
- **Where.** B84 Build; information-gain ingredient 6; the Show station (every public tool of ours is a tool page).
- **Form.** A build skill and a page blueprint (ties to the first study's idea 9).
- **What we build.** The skill, the blueprint, the client-data intake for rates.
- **First test.** The "Can AI read this page?" tool page on the holding's site, built to this order; then a cost
  estimator for the holding's own services once prices exist.
- **Earns / improves.** His claim — made in his videos (`../PLAYBOOK.md`, his unpublished client data), not in
  these skill files — is that tools draw 7.5× their share of AI visits; ours is that each one is a reason to
  return and a page a model cannot write.
- **Needs the CEO.** The holding's public prices for any cost estimator.
- **Risk.** A calculator built on invented rates. Repair: the rate table is a ledger row with source and date, or the
  page does not ship.

### 7. The review system — #20 completed, plus proof onto pages
- **What.** The eleven-ground check for a negative review with confidence and a no-accusation reply; the ask to every
  eligible customer; the inventory that includes brand mentions with no review; the sentiment read with the simulated
  AI description against positioning; reviews sorted onto service and place pages as verbatim proof.
- **Where.** B84 local presence pack (the rival inventory's largest gap: review system, review and reputation
  management); B28 uses the language mine.
- **Form.** Register #20 rewritten, candidate `review-proof-sort` added.
- **What we build.** The policy table per platform (Google first), the reply drafts, the queue, the Unicode-safe
  sorter with verbatim verification.
- **First test.** A synthetic fixture of 60 reviews in two languages with planted cases (a competitor's review, a
  non-customer, an honest one-star, an unrated review, a review naming a suburb); the holding has no reviews yet.
- **Earns / improves.** A fixed-price local product; proof on the page where the buyer decides.
- **Needs the CEO.** Nothing to build; a client's profile access is the client's.
- **Risk.** Scripted or selectively solicited reviews. Repair: written refusals in the skill (no words supplied, no
  selection by expected rating, nothing offered for a change).

### 8. The e-commerce stack — product, category, feed and agent-readiness
- **What.** `product-page-optimizer` (eight points plus the buyer's constraint questions), `category-page-optimizer`
  (decision-support category pages, facets), `merchant-center-optimizer` (disapprovals first, never-touch fields,
  titles for matching, identifiers, highlights, custom labels), `agentic-product-page-auditor` (six layers an agent
  reads, weighted 0-100, fixes at the template).
- **Where.** B84 (decision 8 sells e-commerce); B28 Shopping ads read the same feed.
- **Form.** #15's e-commerce vertical, plus candidates `feed-optimise` and `pdp-agent-readiness`.
- **What we build.** The four skills on one product-data model, so page, schema and feed are checked against each other.
- **First test.** A fixture store of 30 products with planted defects (a JavaScript-injected price, a feed price that
  disagrees with the page, a missing GTIN, a variant without item group, a promotional title); the holding has no store.
- **Earns / improves.** The highest-value client type in the market; "page, schema and feed agree" is a check few
  agencies run.
- **Needs the CEO.** Nothing until a client.
- **Risk.** Editing a client's feed IDs or prices. Repair: never-touch fields enforced in code.

### 9. The care diagnosis — links with donors, cannibalisation, decay, update fit
- **What.** `internal-linking` (donor pages with clicks, ≤5 targets, dated +14 / +28 checks), `cannibalization-detector`
  (true vs harmless overlap with thresholds, one fix per query), `content-decay-detector` (five diagnoses, five
  treatments, leave-alone list), `winner-or-loser` (absolute-click classification, four-question fit test).
- **Where.** B84 monthly care (#16, #19, #25 and candidates `cannibalisation-check`, `decay-triage`).
- **Form.** Monthly worker jobs on full API data, each ending in tasks.
- **What we build.** The four analyses on one Search Console pull per client per month.
- **First test.** The holding's site lacks history; a fixture export with a planted cannibal pair, a seasonal page and a
  displaced page; on the holding's site, the internal-link plan with its dated checks once three months of data exist.
- **Earns / improves.** The monthly package's substance; work a human agency does only after the drop.
- **Needs the CEO.** Nothing.
- **Risk.** Destructive fixes on thin evidence. Repair: every merge, redirect or canonical passes addition 1's evidence
  rule.

### 10. Entity, author and schema layers — #2 scored, plus the person layer and one graph
- **What.** `entity-seo-auditor` (six layers 0-10, consistency as a precondition, Wikidata before Wikipedia with an
  honest notability rule), `author-authority-builder` (the author page, Person schema with `sameAs`, bylines, three
  bios, never an invented credential), `schema-markup-auditor` / `-generator` (one `@graph`, PASS / WEAK / BROKEN, no
  promise of retired rich results, no self-serving stars).
- **Where.** B84 Found.
- **Form.** #2 rewritten; candidates `author-entity` and `schema-graph`.
- **What we build.** The scorecard, the graph builder fed from the client's fact sheet, the author page blueprint.
- **First test.** The holding's own entity scorecard and one corrected `@graph` for its homepage.
- **Earns / improves.** What every assistant reads first about a business; a fixed-price Foundation item.
- **Needs the CEO.** Whose name stands as the holding's person entity, if any (identity); a Wikidata item only once
  independent sources exist.
- **Risk.** Padding `sameAs` or inventing authority. Repair: the skill's refusals.

**Just outside the ten:** `migration-guard` (the costliest single event in a site's life, and site renewal is one of
B84's lines — specified below) and `decision-page` (honest comparison pages, the compare stage every map finds empty).

---

## 2. New skill candidates — what his files have that the register lacks

In the register's own form: name · what it does · where in the chain of `README.md` · board row. Then trigger,
inputs, steps, output, tightly enough to author. Fifteen candidates; two bind every station, thirteen sit on the chain.

### Binding every station

#### `suggestion-triage` · sorts any list of suggestions into approve now / check first / approve / park / drop, with one constraint for 90 days · binds every station · B84
- **Trigger.** Any worker, tool export, agency report or client list of SEO or site changes; before any change list
  reaches the lead; at day 90 of a plan to re-sort the parked list.
- **Inputs.** The list (kept in its own words); the business (what, to whom, where, site age); diagnosis data if any
  (Search Console two-quarter trend and year-on-year, pipeline trend, the latest AI-answer round); what was tried; what
  is off limits (platform, regulator).
- **Steps.** (1) Number every item; split compound items; merge exact duplicates; add missing checks (demand check,
  baseline) as rows marked "added by this review". (2) Map each to one area of the work (structure, offsite,
  uniqueness, relevance, credibility, measurement), why-line under 15 words; no area fits → drop. (3) Find the one
  constraint: no usable data → "not diagnosed yet", only factual errors that could cost a sale, crawler lockouts and the
  baseline approved; a click drop → demand, rankings, results-page layout and AI answers checked first; traffic fine and
  pipeline down → conversion, not search; new or unnamed → structure, then uniqueness, then offsite. (4) Hard rule: any
  item that applies or publishes changes without a named person approving each one is dropped whole. Then drop items on
  the office's waste list or against a written stance, citing it; conditional items dropped only when the condition is
  in evidence. (5) Destructive items (delete, merge, redirect, noindex, canonical change, robots edit, disavow, rewrite of
  a page that earns traffic) need observed evidence in the same row, else CHECK FIRST; removal needs page-by-page
  evidence of no links, no conversions, no citations and a reason it hurts. (6) Rank: APPROVE NOW · CHECK FIRST ·
  APPROVE (the constraint's fixes, cheapest complete fix first, about five) · PARK (with the area and "revisit at day 90")
  · DROP (with the stance); precedence drop > no-data park > check first > approve/park.
- **Output.** One table per verdict, an owner role and effort per approved row (never an invented impact), the
  constraint sentence with its evidence labelled observed / inferred / not checked, and "nothing here has been changed".

#### `skill-fixture` · gives every skill a planted-defect input and its expected output, re-run on every change · binds every station · B84 (and every office that authors skills)
- **Trigger.** A skill is authored, changed, or its model or worker changes.
- **Inputs.** The skill; one realistic input per market language with planted defects and at least one trap (missing
  column, empty JavaScript shell, branded-only data, a boundary case); the expected output with the defects it must find
  and the refusals it must make.
- **Steps.** Run; compare findings with the expected list (found / missed / invented); compare refusals; record the
  result with the skill's version and the model; fail the skill on any invented figure or missed refusal.
- **Output.** A pass / fail line per fixture, the diff, kept in the skill's history.

### Measure

#### `pdp-agent-readiness` · whether a shopping agent can read and buy from a product template · Measure · B84
- **Trigger.** An e-commerce audit; a template change; a client selling through Google or Bing Shopping.
- **Inputs.** The raw server HTML (fetched), the rendered DOM (browser worker), the accessibility tree, the platform.
- **Steps.** Score six layers Pass / Weak / Fail with the reason: semantic HTML · structured data (Product and Offer
  with price, currency, availability, SKU or GTIN, found in raw or rendered source) · accessibility metadata (labelled
  add-to-cart, variant selector, quantity) · transactable elements (price and availability as text, controls an agent can
  identify) · JavaScript dependency (critical details only after rendering) · visible-vs-parsed consistency. Weighted
  score: transactable 25 · structured data 20 · JS dependency 20 · consistency 15 · accessibility 10 · semantic 10 (Pass
  full, Weak half, Fail zero); an unseen layer gives "points of points checked", never a score out of 100. One fix per
  issue, **at the template** (the file named), ranked by what blocks a sale first, tagged agent / search /
  accessibility / all.
- **Output.** Score and one-line verdict, six layer lines, fixes worst first, three for this week, what was not
  checked (the feed layer pointed to `feed-optimise`).

#### `affiliate-attribution-read` · finds commission paid to sources that intercepted rather than earned the sale · Measure · B84, B28
- **Trigger.** An e-commerce client running an affiliate programme; a commission spend that looks high.
- **Inputs.** GA4 traffic acquisition by source / medium with key events and revenue; the affiliate network's payout
  report; key-event attribution paths if available.
- **Steps.** List converting referral sources; flag coupon, cashback and shopping-extension referrers and unknown
  converting sources as **review candidates, never verdicts**; look for the signature (a last touch by an extension on a
  path that began elsewhere); compare commission paid with what each source drove; for each flag, the check that lives in
  the network (click-to-order gap, an earlier touch, a signed agreement and rate, the network's own adware policy).
- **Output.** Flagged-source table, the one to check first, what GA4 cannot see, the verification list. Never "fraud";
  never a number not in the data.

### Found

#### `schema-graph` · one consolidated, truthful JSON-LD graph per page, graded and repaired · Found · B84
- **Trigger.** Any page built or audited; an entity or author change.
- **Inputs.** The raw source and rendered page; the client's fact sheet; the entity home and its `sameAs` list.
- **Steps.** Extract every JSON-LD block; grade each entity PASS / WEAK / BROKEN against its type's required and
  recommended properties and structural errors; find the types the visible content supports and the page lacks; build
  one `@graph`, entities cross-linked by `@id`, values only from the page or the fact sheet, placeholders bracketed;
  most specific correct type; state which types earn a Google feature today and which do not (checked against Google's
  gallery at run time).
- **Refusals.** Nothing marked up that is not visible; no review stars for a business's own reviews of itself; no rich
  result promised for a retired feature.
- **Output.** Scorecard, the graph, the placeholder list with where each value comes from, the validation step.

#### `author-entity` · turns a byline into a verifiable person the engines can connect · Found · B84
- **Trigger.** A page needs a named author or reviewer; the only-we gate fails on authorship; a new expert joins.
- **Inputs.** Name, role, real credentials (years, employers, qualifications, talks, press), live profiles, topics,
  current bio if any.
- **Steps.** Score presence out of six (page, credentials, schema, `sameAs`, byline links, cross-web consistency);
  build one author page (positioning line, specific verifiable credentials, first-hand work, topics with best pieces,
  profile links); Person schema with stable `@id`, `worksFor`, `knowsAbout`, honest `sameAs`; bylines linking to the
  page and article schema naming the same `@id`; per-profile edits so every surface tells one story; three bios
  (150-250, 40-60 words, one line).
- **Refusals.** No invented credential; "[VERIFY]" on any gap; no fabricated persona; a ghost-written page is signed
  only by someone who reviewed it; a pseudonymous expert presented honestly as a pseudonym.
- **Output.** Report with the score and what caps it, the page, the schema, byline fixes, consistency list, three bios.

#### `migration-guard` · plans and checks a domain, platform, URL, HTTPS, subdomain or merge move · Found / Build · B84 (decision 14)
- **Trigger.** Any relaunch, replatform, domain change or merge; a traffic drop after one.
- **Inputs.** Old and new site (crawls of both, staging with access), sitemaps, the Search Console page export, the
  link profile, the launch date, the trading calendar.
- **Steps.** (1) Dated baseline (fields in `SKILL-FILES.md`, `proof-capture`). (2) Inventory: every 200, every existing
  redirect and 404, pages with clicks but no internal links, pages with external links. (3) One-to-one map, each row
  confirmed or a guess; never everything to the home page. (4) Nowhere-to-land list sorted by what it costs to lose,
  each: rebuild · redirect to the closest real match (named) · let it 404/410 on purpose. (5) What changed on the page
  (titles, descriptions, headings, schema, canonicals pointing at old URLs); staging blocked before launch and unblocked
  at launch; hreflang as its own stream; script-only rendering a launch blocker. (6) Launch-day checklist (redirects
  tested at a paced rate, failures re-checked before believed, one hop, 301, robots line by line — never blocking the old
  site, sitemap submitted, tracking firing, change of address where the domain moved). (7) Dated check-ins at launch,
  +7, +14, +28 against the baseline, with the two readings that mean stop: crawl errors climbing, old URLs still served.
- **Output.** Baseline, summary, redirect map, nowhere-to-land list, page changes, checklist, four dates, what was not
  checked. Redirects are never removed at a later tidy-up.

### Build

#### `tool-page` · a working calculator or checker built to one page order from the client's own figures · Build · B84
- Specified in §1 addition 6. **Trigger:** a niche where a buyer computes something before buying; the only-we gate
  missing ingredient 6. **Inputs:** the niche, the client's rates and quoting figures with sources, the person who
  checks the maths. **Steps:** five ideas (each with the search it answers and why), pick, build in the ten-section
  order, run five real cases from the client's records, verify every rate has a source and date, the method is in the
  HTML, no e-mail before the result, BreadcrumbList only. **Output:** the page, the rate ledger rows, the five-case check.

#### `decision-page` · one honest comparison, alternatives, buyer-guide or how-to-choose page · Build · B84
- **Trigger.** The map's compare stage is empty; an assistant answers a "which should I pick" prompt with a rival's page.
- **Inputs.** The product in one line, the buyer's decision, two to four real alternatives (including doing nothing or
  doing it in-house), **where the client honestly wins and where it loses**, who the page is for.
- **Steps.** Choose the format (A vs B · alternatives · best X for Y · how to choose); four to seven criteria every
  option can be judged on (drop any that only flatter); the matrix with a verdict and one line of evidence per cell,
  rival facts checked on the rival's own current page with URL and date or marked "[VERIFY]"; a segmented verdict
  ("choose A if…, choose B if…") with at least one real situation pointing at a rival; answer-first layout (the verdict
  paragraph in the first 100 words, the table early, per-option sections, FAQ); format-fit check against the ranking pages;
  anti-pattern check. Lists inside it follow the item pattern (descriptive H2, liftable first line, evidence, action).
- **Refusals.** Never first without evidence; no invented testing ("we tested 47 tools"); no programmatic pairs; no
  review or rating markup for our own scores; no disparagement.
- **Output.** Plan with the credibility check, the matrix, the written page, schema notes, credibility flags.

#### `persona-fit-gate` · scores a page against the client's buyer personas and reverse-engineers a won lead · Build (gate) · B84, B83
- **Trigger.** A page ranks but does not convert; a page written for several audiences; a lead converts (mode C).
- **Inputs.** Two to four personas built once with the client (role, expertise level, goals, pains, objections,
  triggers, four to six arrival questions, preferred format); the page; for mode C an anonymised lead record.
- **Steps.** Per persona: relevance 0-100 = goals 30 + arrival questions 30 + objections 20 + level and format 20, the
  four sub-scores shown; each arrival question ANSWERED (quoted) or MISSING; tone fit; what is still missing; the one
  edit. Conflicts between personas resolved by layering (answer first, depth below). **Ship gate: every persona 70 or
  more and no persona with more than one missing arrival question.** Mode C: map the lead to a persona (or write the
  missing one — itself a finding), what the page got right (protected passages), what the lead asked that the page never
  answered (each a conversion and a search gap), numbered edits tagged conversion / visibility / both.
- **Refusals.** Scores labelled structured opinion; no unquoted verdict; personal data stripped before the worker sees it.
- **Output.** Per-persona cards, the summary table, the gate verdict and the shortest path to pass.

#### `review-proof-sort` · sorts a business's reviews onto its service and place pages as verbatim proof · Build · B84
- **Trigger.** A service page with no proof; a reviews inventory done; a new batch of reviews.
- **Inputs.** The reviews (export or pasted), the service pages with URLs, the places served with aliases, the market's
  testimonial rules.
- **Steps.** Per service, the words a customer would use (not the business's jargon; no words that also appear in
  general praise) — checked by a person; a first pass by keyword in the review's own language (Unicode-aware); a
  reading pass that moves wrong matches, assigns unsorted reviews by meaning and sends general praise to the homepage or
  About page; per page three to five quotes, **whole sentences copied exactly**, verified as substrings of their review;
  only rated 4-5 used, unrated held for a person; attribution first name and initial, platform, month and year, linked to
  the profile; place quotes to location pages; services with fewer than three reviews listed as thin.
- **Refusals.** No edited, joined or tidied review; no review markup for the business's own reviews; regulated
  professions limited to what the market's rules allow (his file names Australia's health-practitioner ban on clinical
  testimonials; every market needs its own row).
- **Output.** Proof blocks per page, the sorted review table, the thin list, the one page to update first.

#### `repo-seo-gate` · checks every page of a site we build in code before release · Build · B84 (decision 14, the seven-check release gate)
- **Trigger.** Every build of a site in our repositories; before hand-over.
- **Inputs.** The repository or build output, the live domain, the host's redirect rules.
- **Steps.** Per page the structural checks (title not duplicated and not brand-only, description, one H1, canonical to
  the clean live URL, Open Graph set, JSON-LD that parses, `lang`, charset and viewport, no mixed content), the AI checks
  (breadcrumb schema on nested pages, article schema on articles, organisation on the homepage, no placeholder values,
  heading order), linking (clean URLs, no broken in-repo links, at least one related and one hub link, no "click here"),
  content cues (alt text, no stuffing), infrastructure (robots pointing to the sitemap, sitemap matching indexable pages,
  redirects for known 404s), plus **content present in the server HTML** (the first study's readable-first). Weighted
  40 / 20 / 20 / 15 / 5 over the checks that apply.
- **Output.** A report in the repository, a score, mechanical fixes proposed as diffs for the lead to verify — never
  applied by the checker.

### Care

#### `cannibalisation-check` · finds queries where the client's own pages compete, and the one fix per query · Care · B84
- **Trigger.** Monthly; rankings that swap between URLs; before a new page targets an existing cluster.
- **Inputs.** Search Console query × page with clicks, impressions, position (API).
- **Steps.** Candidates: two or more pages each with 10+ impressions on a query, unless one page takes 90 %+. Classify:
  **true** (both in the top 20, trading positions, no page above about 70 % share) · **secondary drag** (one clear winner
  in the top 10, another nibbling at 15-50) · **harmless overlap** (different intents — keep both) · **near-duplicate**
  (should never both exist). One fix per true or near-duplicate query: consolidate with a 301 · canonical · differentiate
  (re-focus title, H1, opening) · stop internal links with that anchor to the wrong page; the keeper named with why.
  Weighted by combined impressions; branded queries and parameters handled apart; three-page splits resolved to one.
- **Output.** True list worst first (pages with position, clicks, impressions, why it is real, keeper, fix, what to
  check in 4-8 weeks — never a promised position), secondary drag, not-cannibalisation list, near-duplicates, three for
  this week. Every destructive fix goes through `suggestion-triage`'s evidence rule.

#### `decay-triage` · diagnoses why a page is losing traffic and prescribes one treatment · Care · B84 (opened by #19)
- **Trigger.** #19's two months of decline; a monthly pass over all pages.
- **Inputs.** Two comparable periods per page (recent three months and the same three a year earlier, or six), queries
  for the worst pages, known update and data-anomaly dates.
- **Steps.** Match pages; flag clicks down 25 %+ on pages with real prior traffic (default 20+ clicks, floor stated).
  Diagnose by pattern: **freshness** (slow slide, stable impressions) · **displacement** (step drop, stable impressions)
  · **intent shift** (position and impressions steady, clicks collapsing — a hypothesis checked on the live result) ·
  **demand** (impressions down across the query set at stable position — not fixable with content) · **seasonal**
  (checked first). One treatment: refresh · rewrite (keep the URL) · consolidate (merge and 301) · retarget · leave.
  Never deletion first. Rank by recoverable clicks, treatable causes first. Top three get a refresh brief (stale
  sections, what now-ranking pages cover, what only this client can add). A site-wide even decline is an event, sent to
  #25 and #1.
- **Output.** Decay report with the arithmetic, sick list, three briefs, leave-alone list, three for this week.

#### `feed-optimise` · keeps a store's product feed approved, matched and segmented · Build / Care · B84, B28
- **Trigger.** An e-commerce client with Merchant Center; disapprovals; a monthly pass.
- **Inputs.** Feed export, diagnostics, platform, top products by revenue.
- **Steps.** Disapprovals first, grouped by cause, each with what it blocks, the fix and where it lives (feed field,
  landing page, data source, account); **never-touch fields stated before any edit** (product ID; price, currency,
  availability and sale data fixed at the source, never overridden); titles rewritten for matching (product type and the
  attributes buyers search, front-loaded, the pattern per product type, no promotional text); identifiers (real GTIN,
  else brand + MPN, assigned MPN labelled as assigned, `identifier_exists` for true one-offs, never a made-up barcode);
  attributes (most specific category, product type, variant attributes tied by item group, colour as shown on the page,
  multipack vs bundle, adult flag, highlights, custom labels by margin and best-seller); feed vs page consistency; free
  listings; schema agreement. Cadence: daily diagnostics read, monthly title and highlight pass from converting search
  terms.
- **Output.** Health summary, never-touch confirmation, disapproval triage, title rewrites and patterns, identifier and
  attribute list, consistency checks, five actions by revenue.

---

## 3. What stops at the CEO

- Publishing any public tool for prospects, including `suggestion-triage`'s public page (decision 9).
- Accounts on the holding's site: Search Console, Bing Webmaster Tools, Clarity, GA4 links (his click); a Screaming
  Frog licence if its MCP server needs one, and any tracker (money out).
- Whose name is the holding's person entity, if any.
- Which clients the office serves at the edge of the clear refusals (alcohol, gambling, interest-based finance):
  hotels or restaurants with alcohol on the offer, finance firms that sell interest-based and halal products side
  by side, and whether such a client is served for its halal part only.
- Whether the office ever publishes its own skill files for practitioners, as he does.
