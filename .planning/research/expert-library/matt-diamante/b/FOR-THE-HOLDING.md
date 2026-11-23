# Matt Diamante (HeyTony) — FOR THE HOLDING, analyst B

The holding's question: the complete content-and-keyword operating method of an SEO agency that wins,
run by AI workers — from "what should this client write next" to the monthly report — and the
short-video method that fills the agency's own pipeline.

Source codes are those of `PLAYBOOK.md` in this folder. "Web office" = DXB Web Studio (B84).

## The answer in five sentences

1. His agency is not clever; it is **a small loop run without fail**: one easy keyword per page, two
   question-answering posts a week, internal links, four links a month, a cohort report, and a weekly
   "why doesn't this rank" — for $3,000 a month.
2. Every step of that loop except one is mechanical and suits AI workers better than his ten people.
3. The one step that is not mechanical is the one that makes the content rank and not be slop: **a real
   person's experience has to enter before the model writes** (his transcript-first method; Sheridan's
   "content manager interviews the expert").
4. So the product we build is not "AI writes blogs". It is **an interviewer**: a worker that pulls ten
   minutes of true, specific talk out of the client every week and turns it into two posts, a video script
   and three answers on the profiles the answer engines read.
5. The same interviewer, pointed at ourselves, is the short-video machine that fills the pipeline.

---

## Ideas, ranked by value

### 1. The interview-first content engine (They Ask, You Answer, run by workers)

- **What.** A weekly cycle per client: harvest the questions customers really ask → pick two by the
  easy-first rule → a worker **interviews the client's expert** (voice note or 10-minute call, 6–8 pointed
  questions per topic) → transcript → outline from the top three results cleaned against what the client
  actually does → draft → fact gate → publish with key takeaways, author, internal links. `[GPT]` `[MS 23-29]`
- **Where.** Web office, the "SEO and content" monthly package (B84, decision 8 and the closed-loop
  package note). Also the holding's own site as first case.
- **Form.** Three skills (question harvest, next-article choice, brief-and-draft), one gate (experience
  gate: no draft ships without at least N statements traceable to the transcript), one library per client
  (the question bank and the "what we do / do not do" fact sheet).
- **What we build.** (a) A question bank per client fed by: the client's inbox/WhatsApp/sales-call
  exports, Search Console question regex, People-also-ask, Suggest, competitor gap. (b) The interviewer:
  generates the questions the model would otherwise invent answers to ("what is in the cheaper package,
  what did you try that failed, what do you tell a customer who says it's too expensive") and collects the
  answers as voice. This is his step "ask me questions that you need to know" `[GPT 19]` turned into the
  client's only weekly duty. (c) The Big 5 planner: for every service the client sells, the five articles
  (cost, problems, versus, reviews, best) are created as backlog rows before anything else.
- **First test.** The holding's own site: the CEO answers by voice eight questions for "how much does a
  website cost" and "DXB Web Studio vs a freelancer vs a template builder". Two posts, published,
  tracked 60 days in the cohort report. Measured: time the human spent (target under 15 minutes for two
  posts), share of sentences traceable to the transcript, impressions by day 30.
- **Earns / improves.** This is the retainer. His price point for it is $3,000 a month with ~4 links
  included; the worker's marginal cost per post is tokens plus DataForSEO cents. It is also the only
  honest answer to "AI content gets penalised".
- **Needs the CEO.** His ten minutes of voice for our own site; price of the package (already his).
- **Risk.** A client who will not talk. Mitigation written into the offer: no interview that week → that
  week's posts are "refresh" work (idea 2), not new claims. Never let the model invent experience — that
  is deception as well as slop.

### 2. The striking-distance and refresh job (early wins that keep the client)

- **What.** Every week, from Search Console: pages at average position 11–20; for each, the query cluster
  it already ranks for; missing phrases added to headings; three-kings check; competitor gap; request
  indexing; track the cluster. Plus the "170 variations" check: high-impression queries whose words are
  not on the page. `[P2]` `[GSC]`
- **Where.** Web office; first month of every engagement, then weekly.
- **Form.** One skill, one scheduled job per client, results written into the cohort report.
- **What we build.** Search Console API pull → candidate table (page, position, impressions, cluster,
  missing terms) → edit proposal per page (diff of title, H1, H2s, new section) → after approval rule,
  publish → URL Inspection API request → re-measure at 4–6 weeks → if still stuck, hand to idea 3.
- **First test.** The holding's site or any site of ours with three months of Search Console data: ten
  pages, measure position and clicks at 6 weeks against ten untouched pages of similar position.
- **Earns / improves.** His retention lesson is explicit: "focused on getting clients early wins so
  that they would stay around longer" `[STORY 6]`. This is where early wins come from; new posts take
  months.
- **Needs the CEO.** Nothing.
- **Risk.** Promising his "10×". The click curve he quotes is generous (PLAYBOOK 6.1). Report measured
  lift only.

### 3. "Why doesn't this rank?" as a standing diagnostic and a sales tool

- **What.** His ten-point weekly session `[WDR]`, as a skill that takes one URL and one keyword and returns
  a verdict in his client-ready sentence form, with evidence per point.
- **Where.** (a) Web office delivery — weekly on each client's most stuck page. (b) **Client-finding
  (B84's leg, B83)**: the same run on a prospect's page is the audit we send. It is specific ("your page
  says 'coverage', people search 'insurance'; the winner uses the phrase in four H2s; your video is hidden
  behind a consent click; your post is unreachable from the blog index") — which is what makes his live
  audits persuasive.
- **Form.** Skill + a one-page report template. Should be merged into the page-by-page audit already
  placed in B84 (w036) rather than become a second audit: his ten points are the "against the winner"
  half that audit lacks.
- **What we build.** SERP top 10 (SERP API) → referring domains per result → Frog/On-Page parse of our
  page and the top three (title, H-tree, body word count, phrase presence, internal inlinks and anchors,
  schema, video embed visibility, pagination depth) → verdict.
- **First test.** Run on five pages of the holding's own site and five local businesses picked by the
  prospect filter already in B84 (the 1–10 audit and demo note). Judge: would a business owner understand
  and act on each line?
- **Earns / improves.** Converts prospects; gives every client a visible weekly action.
- **Needs the CEO.** Nothing to build; sending audits to prospects is routine outward communication.
- **Risk.** His keyword-count and word-count comparisons presented as causes. Our report says "coverage
  gap", shows the counts as evidence, and never says "use it 19 times".

### 4. The live cohort report (the monthly report, made alive)

- **What.** His Looker report's structure — activity ledger, year-over-year, one page per product word,
  **one cohort per month of work**, question-mining tab — built as the holding's own live page per client.
  `[LS]`
- **Where.** Web office; it is the client-facing surface of the retainer, and for the CEO the per-client
  view inside the OS ("motion is state": a cohort row turning green is the company having done work).
- **Form.** A data library (Search Console API or BigQuery export, stored daily) + a report page + a rule.
- **What we build.** (a) Activity ledger written **by the workers as they work** — every post, page edit,
  link, with its URL; the report's first page is generated, never typed. (b) Cohorts: each ledger item
  joins to its Search Console rows forever. (c) The rule from `[LS 14]` as an automatic trigger: any
  cohort item down for two consecutive months opens a refresh task. (d) Only clicks and impressions as
  managed numbers; position and CTR shown, not judged.
- **First test.** The holding's site: backfill 16 months, enter the last three months of changes as
  ledger items, see whether the cohort view tells a true story.
- **Earns / improves.** Proof of work — the thing the burned business owner in `[COST 0]` never had for
  two years. Also closes the loop that makes ideas 1–3 self-correcting. B84 already holds "the monthly
  SEO package as a closed loop with a live report" (d11); this supplies its exact page list and the
  cohort mechanic.
- **Needs the CEO.** A Looker Studio copy is free and immediate if he wants to see the pattern before we
  build ours; otherwise nothing.
- **Risk.** Building a dashboard nobody acts on. The trigger (c) is the point, not the charts.

### 5. The answer-engine source audit (AEO/GEO as a procedure, and as the front-door offer)

- **What.** For each money query of a client: ask the assistants, record who is recommended and **which
  pages were cited**, count references per business, rank the sources, and output a worklist: "get listed
  on these three; your category is wrong here; no reviews there; nobody mentions you on X". `[LLM]`
- **Where.** Web office (the AEO/GEO part of the SEO service). As a **free or cheap one-off**, it is the
  best door-opener we have: every owner is being told "SEO is dead, ChatGPT replaced Google" `[END 0]`
  and his clients send him reels asking "are we doing LLMO?" `[JUN 1]`.
- **Form.** Skill + sellable one-off product ("Who does ChatGPT recommend instead of you — and why") +
  monthly line in the retainer report (mentions gained/lost).
- **What we build.** Query set per client (10–30: "best X in Y", "X vs Z", "how much does X cost in Y")
  → answers and citations via DataForSEO AI Optimization (LLM Mentions / LLM responses) and SERP API
  AI-overview items, with a manual spot check → source table (domain, times cited, authority, can we get
  listed: free / paid / editorial) → the worklist → re-run monthly.
- **First test.** Three local businesses in different trades in one city + the holding itself for "AI
  web design agency" queries. Check the output against a manual run in the apps (the API is a model call,
  not the consumer app — the two can differ).
- **Earns / improves.** A product nobody local sells with evidence attached; each finding is also a
  citation/link task, so it feeds classic SEO.
- **Needs the CEO.** DataForSEO balance (already his decision, ~$50 first load); LLM Mentions is billed
  per request and row — a price check before volume.
- **Risk.** Overclaiming. Matt's "rank on Google and you rank on ChatGPT" fails outside simple local
  queries (Ahrefs: ~12% overlap). We sell the **reading of sources**, not a ranking promise. And no
  llms.txt deliverable — measured useless.

### 6. The short-video machine for our own pipeline

- **What.** His method as a production line: topic from the question bank → hook candidates → six-line
  script → read-aloud test → film → caption with detail and keywords → comment-word → DM with the lead
  magnet → metrics read at 24 hours → the lesson written back. One to three a day. `[IG]` `[SFV]`
- **Where.** The agency seat (B28 holds the short-video system; this is the scripting and review method
  for its talking-head/educational format), the holding's own channels first, then clients' channels as a
  service.
- **Form.** Two skills (script, post-mortem), one gate (hook gate), one library (hook bank with measured
  results), one automation (comment → DM).
- **What we build.** (a) Script skill bound to his rules (PLAYBOOK 10.2–10.3) with a **spoken-rhythm
  check**: the script is synthesised to speech and timed; a line that cannot be said in one breath is
  rewritten. This replaces his "read it 30 times". (b) Hook gate: viewer-first, ≤ 8 words, promise
  present, no payoff leak, no jargon ("SEO" → "show up higher on Google"). (c) Post-mortem at 24 h and
  7 d: watch time, percent viewed, sends per reach, likes per reach, follows from the video; each video's
  hook and its numbers go into the hook bank — his "hundreds of swings" compressed into a table the next
  script reads. (d) Formats that do not need a person on camera every time: screen-recording with voice,
  green-screen over a live audit, text-led carousels cut from the same script.
- **First test.** Thirty videos in thirty days on one account, one niche (e.g. "why your site doesn't
  show up on Google", each one a real finding from idea 3 on a real local page, owner's name removed).
  Measured: median watch percent, sends per reach, DMs requested, audits asked for.
- **Earns / improves.** His numbers: zero paid acquisition, 320K followers, inquiries from month 12; the
  account became the agency's pipeline when a 60%-of-revenue client left. For us it is the client-finding
  leg that costs tokens and GPU, not ad money.
- **Needs the CEO.** **The face and voice decision** (OPEN-QUESTIONS 1): his own, a named human
  presenter, or an openly AI presenter. Instagram/TikTok accounts are identity steps. ManyChat is a paid
  tool above its free tier.
- **Risk.** (1) Six months of nothing is the normal curve — his was. Decide the horizon before starting.
  (2) Synthetic presenters must be labelled per platform rules; an unlabelled invented "expert" is
  deception. (3) Views without a stated offer bring no leads `[SFV 2]`.

### 7. One free tool that does one thing: "your page vs the three that beat you"

- **What.** His pageaudit tool `[PA]` is a lead magnet with a real job. Ours: paste a URL and a keyword →
  the page beside the top three (title, H-tree, coverage gaps, where the phrase is missing, links the
  winners have) and the verdict sentence of idea 3.
- **Where.** Web office site; the CTA of every short video ("comment AUDIT").
- **Form.** Free tool → captures the URL and email → queues the full diagnostic as a paid or sales
  conversation.
- **What we build.** Thin front on the idea-3 skill with a hard budget per run.
- **First test.** Internal: 20 URLs; cost per run; does the output need no explanation?
- **Earns / improves.** Leads with their problem already described. Analyst A owns his funnel; from this
  half of the channel the evidence is that he points almost every video at a free tool or checklist.
- **Needs the CEO.** DataForSEO spend ceiling per free run.
- **Risk.** Cost abuse; cap by email and domain.

### 8. Ads as keyword research, then retire the keywords SEO has won

- **What.** One month of small Google Ads on candidate keywords to learn which **convert**, then SEO on
  those; later, drop from the ads every keyword that ranks organically. `[ADS 4, 7]`
- **Where.** The join between the ads seat (B28/B43) and the web office — a combined package.
- **Form.** A rule and a monthly job: Search Console top-3 keywords ∩ ad keywords → pause list.
- **First test.** Any client running both; measure cost saved on paused terms and whether organic holds
  the conversions.
- **Earns / improves.** A reason to buy both services from us; visible saving in the report.
- **Needs the CEO.** Ad spend is money out — his gate.
- **Risk.** Pausing brand or high-intent terms where the ad also defends the result page; test before
  pausing.

### 9. The Big 5 applied to ourselves

- **What.** The web office's own site publishes what agencies hide: what a site costs and why, the
  problems with AI-built sites, us vs freelancer vs template builder vs agency, honest "best web design
  agencies in [city]" lists **without ourselves on them**, and reviews of the tools we tried (the blind
  trial of Frog/DataForSEO/OpenSEO is ready-made review content). `[MS 15, 31]` `[GPT 13-15]`
- **Where.** B84, the holding's own site as first case.
- **Form.** Content backlog; later, a self-service price estimator (Sheridan's self-service tool).
- **First test.** The cost article + the estimator; track assisted inquiries.
- **Earns / improves.** Trust before the first call; ranks for rivals' "[name] reviews" searches
  honestly.
- **Needs the CEO.** Publishing our prices and naming competitors is his call.
- **Risk.** A "best of" list that is not fair is deception; criteria must be stated and true.

### 10. Standing jobs that cost almost nothing

- **Internal-link job** after every publish: find pages mentioning the topic, add the link with the target
  keyword, raise every post to 3–5 inlinks, flag anchors that point one phrase at two targets `[IL]`
  `[WDR 11]`. Frog gives inlinks and depth; no plugin needed.
- **Release checks to add to the web office's "found on Google" list (w066)** if absent: robots/noindex
  after every redesign `[7R 1]`; AI crawlers not blocked at Cloudflare/WAF `[JUN 2]`; blog pagination does
  not bury posts `[WDR 21]`; embedded video visible without a consent click `[WDR 9]`; one H1; country set
  in every tool query.
- **Local pack basics as a fixed-price setup:** the profile checklist of `[90 2]` — 2–3 hours of work he
  says agencies charge $300 a month for.
- **Ledger rule:** no client above a set share of revenue (his 5%) — a line for the revenue rows when
  there are clients to count.

---

## What he does to earn, seen from these 31 videos (analyst A has the full machine)

- **Offer:** one retainer, $3,000 a month, stated deliverables (2 posts a week, 4 links, page updates,
  monthly report); he doubled the price and added deliverables rather than discounting.
- **Acquisition:** daily short video → free tool / checklist / template by comment-to-DM or description
  link → discovery call. YouTube tutorials carry the same magnets. No paid acquisition mentioned.
- **Teaching everything free** is the filter: "most people don't have a budget to hire me … the people
  who have a budget see the value and fill out the contact form" `[EASY 2]`.
- **Borrowed authority:** interviewing an author he admires, then clipping it `[MS 53]`.
- **Live audits of viewers' sites** (`[WDR]`, `[PA]` use real submitted pages) — content, proof and sales
  call in one.

All five are runnable by us; the live-audit format is the one to copy first because it needs no
reputation, only a finding.

---

## The larger picture — a first-place web office built on this

**One loop per client, visible end to end.** A client row in the OS shows a question bank filling from
their inbox and Search Console; two backlog items chosen for the week with the reason (difficulty, intent,
which Big 5 slot); a ten-minute interview waiting on the client's phone; drafts passing the experience
gate; posts published with their internal links; the cohort for this month appearing in the live report;
last month's cohort turning green or opening a refresh task; a stuck page under "why doesn't this rank"
with its verdict; and the answer-engine table showing which directory supplied ChatGPT's answer this
month and whether we got the client into it. Nothing in that picture is a human SEO's judgement call that
the workers cannot follow from the playbook — except the client's own knowledge, which the interviewer
collects.

**What makes it first-place rather than a cheaper HeyTony.**

1. *Cadence without fatigue.* His constraint is people: one writer does 3–4 posts a day and the weekly
   diagnostic covers one client page. Ours covers every page of every client every week.
2. *Evidence on every line.* His report shows activity and clicks. Ours can attach to each action the
   measurement that justified it (the SERP as it was, the gap found) and the measurement after — the
   answer to the industry's distrust `[COST 0]`.
3. *Truth as a gate.* His protection against slop is a human reading the draft. Ours is structural: a
   sentence that states experience must trace to the transcript or the client fact sheet, or it does not
   ship. That is also the holding's no-deception boundary made mechanical.
4. *One interview, five outputs.* The same ten minutes becomes two posts, one short video script, the
   profile Q&A/posts, the "80% question" sales answer, and a line in the client's own assistant-facing
   content. Sheridan's "say, show, sell, be human" from one recording.
5. *AEO as reading, not incantation.* While the market sells llms.txt, we show the client the page
   ChatGPT actually quoted.

**The sales machine it implies.** Short videos made from real diagnostics → free "you vs the three that
beat you" tool → the answer-engine audit as the paid first step → the retainer with the live report. Each
stage is the previous stage's output with more depth, so nothing is produced only for marketing.

**The order to build.** Cohort report on our own site (it measures everything else) → striking-distance
job → diagnostic skill → interviewer and brief-and-draft → answer-engine audit → video scripting loop.
The first three need no decision from the CEO and no new money.

---

## Skill candidates

Written to be authored from. Where B84 already owns a neighbouring part, the skill extends it — it is
named so nothing is written twice.

### S1 `web-question-harvest`
- **Triggers:** new client onboarding; weekly, before topic choice.
- **Inputs:** client domain; Search Console property; exports of client messages/sales notes if given;
  seed services list; country and language.
- **Steps:** (1) Search Console queries, last 3 months, regex for question words → questions with
  impressions and current page. (2) For each service: Suggest expansions with "vs", "for", "cost",
  "problems", "best", "review" + People-also-ask (SERP API) two levels deep. (3) Competitor gap: rival's
  ranked keywords minus ours, difficulty at or under the calibrated easy threshold. (4) Client's own
  messages: extract literal questions, keep their wording. (5) Classify each into Big 5 slot or
  "how-to/other"; attach intent, volume (may be zero), difficulty, source. (6) De-duplicate by meaning;
  keep the customer's phrasing as the title candidate.
- **Output:** the client's question bank (rows: question, slot, service, source, volume, difficulty,
  intent, existing page or none).

### S2 `web-next-article`
- **Triggers:** weekly planning; "what should this client write next".
- **Inputs:** question bank; site inventory (Frog crawl); cohort report; link targets per keyword.
- **Steps:** (1) Fill empty Big 5 slots per service first (cost → versus → problems → best → reviews).
  (2) Then easy-first: lowest difficulty with buying or local intent; zero-volume allowed when intent is
  specific. (3) Reject if an existing page already targets it (cannibalisation) → route to refresh.
  (4) For each pick run the road map: top three's referring domains, directories present, real body word
  counts → "rankable without links: yes/no; links needed: N". (5) Choose two; state the reason in one
  line each.
- **Output:** two briefs-to-be with keyword, cluster of 5–10 variations, slot, reason, link need.

### S3 `web-interview-and-draft`
- **Triggers:** a chosen topic from S2.
- **Inputs:** keyword and cluster; top three URLs; client fact sheet ("what we do / do not do", prices,
  package names, cases); the expert's contact channel.
- **Steps:** (1) Parse top three: H-trees, body text, real word counts. (2) Draft outline: union of their
  headings minus irrelevant, plus H2s from the cluster none of them cover. (3) **Strike every heading the
  fact sheet contradicts** (services not offered, pricing models not used). (4) Generate 6–8 interview
  questions, one per section, that only the client can answer (numbers, a case, a failure, an opinion).
  (5) Collect the answers as voice; transcribe. (6) Write the draft from outline + transcript; key
  takeaways block first; answer in the first 150 words; keyword in title, H1, an H2, opening; plain
  words. (7) **Experience gate:** list each claim of experience, price, result or opinion with its
  transcript or fact-sheet line; unmatched claims are cut or sent back as a question. (8) Fact check
  external statements with sources linked. (9) Author block; internal links out to 3–5 pages.
- **Output:** publish-ready post + the claim-trace table + three clip-worthy lines for S8.

### S4 `web-striking-distance`
- **Triggers:** weekly per client; month one of any engagement.
- **Inputs:** Search Console API; crawl.
- **Steps:** as PLAYBOOK 6.1 and 2.4: pages at 11–20 → cluster per page → phrases with impressions absent
  from the page → three-kings check → top-three gap → edit proposal → publish → request indexing → log to
  ledger → re-measure at 4–6 weeks → unresolved go to S5.
- **Output:** edit set per page; ledger entries; a before/after row in the report.

### S5 `web-why-not-ranking` (extends the page-by-page audit, w036)
- **Triggers:** a page stuck after S4; a prospect's URL; weekly per client.
- **Inputs:** URL, keyword, country.
- **Steps:** the ten checks of PLAYBOOK 6.2 in order, each returning evidence; stop early if the keyword
  itself is wrong.
- **Output:** verdict in one sentence, then the ordered fix list; prospect version in plain words with
  no tool names.

### S6 `web-internal-links`
- **Triggers:** after every publish; monthly sweep.
- **Inputs:** new URL and its keyword; crawl with inlinks, anchors, depth.
- **Steps:** find pages mentioning the topic → add link with the target's keyword as anchor → raise to
  3–5 inlinks → flag one-anchor-two-targets conflicts → flag depth over three and buried pagination.
- **Output:** link edits; orphan and conflict list.

### S7 `web-answer-engine-audit`
- **Triggers:** onboarding; monthly; as the one-off product.
- **Inputs:** business, city/market, 10–30 money queries, competitors.
- **Steps:** per query collect assistant answers and cited sources (API + spot check) and the SERP's map
  pack and AI overview → table of recommended businesses with reference counts → source ranking → for
  each top source: are we listed, category correct, reviews, last activity → profile/category
  consistency across Google, Bing, directories → check crawler access (robots, Cloudflare) → worklist.
- **Output:** "who is recommended, from where, and the N listings and mentions to get", with month-over-
  month change.

### S8 `agency-short-script`
- **Triggers:** daily content slot; any finding or answer worth 30 seconds.
- **Inputs:** one point; the audience; the offer and comment-word; hook bank.
- **Steps:** (1) Write five hooks under the rules (viewer-first, ≤ 8 words, promise, no leak, no
  jargon); pick by the hook bank's nearest winners and by speech test. (2) Second-line stack and the
  visual action for each line. (3) Six lines, one sentence each; strip every word that adds nothing; no
  repeated word. (4) Payoff late; name/answer last; promise paid. (5) Synthesise and time: 15–30 s
  target; rewrite lines that stumble. (6) Caption: full detail + natural keywords + disclosure. (7) CTA:
  comment-word (Instagram) / on-screen pointer without "link in bio" (TikTok).
- **Output:** script with shot per line, caption, CTA, on-screen text.

### S9 `agency-short-postmortem`
- **Triggers:** 24 hours and 7 days after each post.
- **Inputs:** platform insights.
- **Steps:** record length, average watch time, percent viewed, sends/likes per reach, follows, comments
  by keyword, DMs sent; compare with account medians; tag the hook type; one-line lesson.
- **Output:** a row in the hook bank; weekly: what to make more of, what to stop.

### S10 `web-monthly-report` (the page list for the live report, d11)
- **Triggers:** continuous; month close for the PDF.
- **Inputs:** ledger; Search Console store.
- **Steps:** build the seven pages of PLAYBOOK 7 from data; cohorts from the ledger; apply the two-month
  decline rule to open refresh tasks; write the month's three-sentence summary from the numbers.
- **Output:** live page + PDF of the activity page.
