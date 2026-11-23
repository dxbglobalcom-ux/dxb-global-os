# Harry Sanders (StudioHawk) — Playbook

What he teaches, by subject. Studied 2026-11-23 from 30 YouTube transcripts of the StudioHawk channel, 30
Instagram reels, 929 Instagram captions (2018-10 → 2026-11-23) and the agency's sites.

**How to read the source tags.** `YT:<id> mm:ss` = file `transcripts/hsyt-<id>.txt` in the job folder
(`.planning/research/watch-links/2026-11-23-seo-geo/`), minute as printed in the transcript. `IG:<code>` =
Instagram post code (reel transcript `transcripts/harry-<code>.txt` where one exists, otherwise the caption in
`lists/harry-ig-captions.md`). **[HS]** = his claim, not re-measured. **[ADDED]** = completed by the analyst,
with the source named. **[TEST]** = the analyst's check of the claim.

Who he is, in his own words [HS]: taught himself SEO at 13, homeless at 17, founded StudioHawk in 2015 with a
tradie paying $250 a month; now 120+ specialists in Melbourne, Sydney, London and Atlanta, 45-50 industry awards,
"1,000+ campaigns", SEO only (IG:De-l8DSTmMo, IG:DXyNk5VzEp_). Six of the 30 videos (digital PR explainer,
enterprise, E-E-A-T, anchor text, category pages, manual actions) are presented by his colleague Lawrence
Hitches, not by him.

---

## 1. The one-sentence model

> "Think of AI search like 80% SEO with 20% new stuff on top." (YT:CzYizMeypIs 03:01)

- The 80 %: pages a crawler can read, a structure that makes sense, content that answers the question properly,
  earned links from relevant sites. The 20 %: what everyone else says about you — mentions in industry
  publications, podcasts, YouTube, reviews — "consistent enough, in enough places, that AI can work out what you
  stand for" (IG:DdAT4QcTFWY, citing John Mueller's slide "Good SEO is good GEO").
- Evidence he gives [HS]: in his 100-store study every brand in the top 10 for AI revenue was also in the top
  bracket for Google organic; every brand with zero AI revenue had below-average organic (YT:z7vmho9x1Kk 05:05).
- His three levers, repeated in almost every video: **topical authority · digital authority (off-site) ·
  information gain** (YT:KO1PudJpXJU 08:04; IG:DcnlBbQjrKH). Short form "BLT": AI names two or three businesses —
  the ones others vouch for, with answers clean enough to lift, that own one topic; the basics hold it together
  (IG:Dea1uEbzYa-).
- "The new consideration era": the buyer's research, comparison and validation are now done by the model, which
  reads everything with the brand's name on it — Reddit, reviews, YouTube, press — not only the site
  (YT:GwxIKjwPfEE 09:04; YT:_GahI1eGYM4). "Your website is your marketing, but the internet is the truth, and
  AI reads that truth" (YT:_GahI1eGYM4 02:00).
- Order matters more than the list: "first what stops Google reading the page, then what stops customers choosing
  you, then the rest" (IG:De51QXHTfL3). "Content isn't move one" (IG:DeQR5mkjnH1).

**[TEST]** Sound and consistent with Google's public position (Search Central: no special optimisation for AI
Overviews / AI Mode beyond SEO fundamentals). The 80/20 split is rhetoric, not a measurement. His e-commerce
evidence is correlational and from his own clients (Australian, self-selected).

---

## 2. What Google really rewards — the four primary sources he reads

He frames the sources precisely, and the framing is worth keeping: "The patents are what Google could do. Their
rater rulebook is what they tell human raters to look for. The leak shows what the system measures."
(YT:9V_mDZNAKak 01:01). The trial is what Google said under oath.

### 2.1 Antitrust trial (US v. Google) — "ABC" (YT:HVh9Z-D__M4)

| Pillar | Google's slide wording ("Life of a Click", three pillars) | What he does with it |
|---|---|---|
| **A — Anchors** | "what the web says about the document" | Links and mentions. Start with claimable profiles, citations, industry directories (03:01-05:02). |
| **B — Body** | "what the document says about itself" | Headings, title, content, internal links, a named qualified author (05:02-07:03). |
| **C — Clicks** → really **user interactions** | "what users say about the document"; footnote: clicks, attention on results, swipes in carousels, entering a new query (07:03) | Be the result worth clicking and staying on: title that matches intent, answer above the fold, objections killed, something to *do* (08:04-10:06). |

- Quotes he reads from exhibits: "We do not understand documents. We fake it… We hardly look at documents. We
  look at people. If a document gets a positive reaction, we figure it is good." NavBoost "pairs queries and
  documents through memorizing user click data", 13 months of it (08:04).
- His own audit data [HS], 1,000 "AI SEO audits" in 12 months, AU/UK/US: 89 % weak meta tags, 89 % weak
  backlinks, 84 % content gaps vs competitors, 81 % missing E-E-A-T (no author, no credentials), 78 % weak
  internal linking, 76 % broken heading hierarchy (06:03).
- Worked example of a "page worth ranking" (personal-loan page): (1) the answer — the rate — above the fold with
  one button; (2) objections answered before asked (no credit-score impact, no hidden fees, reviews, "half a
  million Australians"); (3) a repayment calculator on the page, explainer content below it (10:06).
- CTR manipulation (bought clicks, bots): "does nothing… will probably get you penalized" (09:05).

**[TEST]** The slide wording, the "we fake it" deck (a 2017 internal presentation), NavBoost's 13-month window
and the judge's "17 years of Bing data" comparison are all in the public trial record. The ruling is August 2024;
the remedies decision (September 2025) ordered certain index and interaction data shared with qualified rivals;
appeals continue — as he says. One correction: the under-oath "ABC" is Pandu Nayak's description of *topicality*
signals; quality and popularity signals sit beside it. His simplification is safe for practice.

### 2.2 The 2024 API leak — "five things everyone missed" (YT:9V_mDZNAKak)

| # | Finding | Action he prescribes |
|---|---|---|
| 1 | **Index tiers** (desk / shelves / basement; the indexer is called Alexandria). A link's value depends on the tier of the *linking page*; domain scores (DA, DR) "measure the wrong object" (03:01). | Before approving any link, check the page it comes from: does that page rank for anything, does it show traffic. "A link from a page nobody visits is a recommendation from a book in the basement." (04:01) |
| 2 | **Effort score** — the leak's page-quality data has an LLM-based estimate of the effort in a page; tools, images, video, unique information, depth score high (05:02). | "Could a competitor replicate this in five minutes with Claude?" If yes, add one thing that cannot be copied (06:02). |
| 3 | **AI authorship is not scored; behaviour is.** Detection is unreliable; Google falls back on what people do with the page (06:02-08:04). | Replace "will Google know AI wrote this?" with "will anyone finish it, interact, share it?" |
| 4 | **Who Google thinks you are** — an entity description assembled from every mention. Site, press and team LinkedIn saying different things → a vague or wrong AI summary (09:05). | Search `brand -site:yourdomain` and read it as Google would. Fix in this order: homepage title · homepage copy · About page · founder's LinkedIn headline · third-party profiles. Then the **3 Fs**: Freebies (free listings), Friendlies (suppliers, partners, chamber), Features (digital PR) — every one describing the business the same way (11:06). |
| 5 | **Query fan-out** — the AI splits a question into sub-questions and bundles the best page for each (12:07). | For the most important page, write every smaller question a buyer needs answered before acting; cover each; add expert first-hand input; add something interactive (14:08). |

Also from the leak, in the patents video (YT:djt17f1OWtE): a **site focus** measure — how close every page sits
to the core topic (client pruned and redirected 47 off-topic pages, traffic +34 % in 60 days [HS], 05:00); an
**original content score** "from 0 to 127" (05:00); a **site-wide authority** value that lifts every page of a
strong domain (08:00).

**[TEST]** The attributes exist in the leaked documentation as analysed by Mike King and Rand Fishkin
(`siteFocusScore`/`siteRadius`, `OriginalContentScore`, `siteAuthority`, `contentEffort`, index tier via
`sourceType`). Three cautions: (a) the leak shows *stored attributes*, not weights or whether each is live;
(b) `OriginalContentScore` is described there for short content — "0-127 originality of your article" overstates
it, and his later caption that *information gain* is "scored 1 to 127" (IG:Dck95bnoEJo) merges two different
things: the information-gain patent has no such scale; (c) Google confirmed the documents were authentic and
warned against out-of-context reading. The actions he derives are sound regardless.

### 2.3 Quality Rater Guidelines — the 182-page rulebook (YT:Q3ZBZGwpoG0)

| Secret | Where | Rule, in the document's words | Action |
|---|---|---|---|
| **Off-site reputation** | §3.3 | "Be skeptical of claims that websites make about themselves." Reputation research is required for every page-quality task. Raters run `[brand -site:brand.com]` and `[brand reviews -site:brand.com]` (worked example: IBM). Raters read review *content*, not only stars. Small businesses with little reputation information are not thereby low quality (02:02-03:03). | Run both searches on yourself. Earn one genuine mention a month for the one thing you want to be known for (04:04). |
| **Uniqueness** | §3.2 | Main-content quality = effort, originality, talent/skill, accuracy. "Consider whether the page is the original source." "Effort may go into designing page functionality or building systems that power a web page." Raters are told to read the article, watch the video, use the calculator, play the game, put a product in the cart (04:04-05:05). | Before publishing: "Is there a single thing in here that only we could have written?" (07:09) |
| **Relevance** | Part 3, Needs Met | Five-point scale: Fully Meets (reserved for a clear single-result intent) · Highly Meets · Moderately · Slightly · Fails to Meet (08:09). | Write the actual question typed before landing; read the page as that person; anything under Highly Meets is redone (09:09). |

**[TEST]** Accurate to the September 2025 edition (182 pages). The guidelines do not rank pages directly — raters'
scores evaluate ranking changes — which he states correctly at 01:02.

### 2.4 Patents — "three ranking laws" (YT:djt17f1OWtE)

1. **Google measures people first**: NavBoost-style click outcomes (a stay of ~30 s+ is a good click [HS]; the
   title and meta are "a promise" the first 100 words must keep) and **entity identity** — name, address, phone
   identical "word for word" everywhere (client with three name variants: local rankings improved "within weeks"
   after standardising [HS], 03:00). Tip: get traffic to a new page within 24 hours (social, email).
2. **Google measures content**: topical focus + originality/information gain. Test before publishing: "What does
   this page contain that doesn't exist anywhere else on the internet? If you cannot answer that in one sentence,
   don't publish." (08:00). B2B SaaS client: 80 me-too articles, nothing in 14 months; every new piece had to
   carry a survey result, internal data point or contrarian expert opinion → category rankings moved in 90 days
   [HS] (07:00).
3. **Google measures the site**: authority compounds across every page. JobAdder case [HS]: state-of-the-market
   reports from its own platform data, 58 media placements (news.com.au, HR Daily) plus 38 other links pointing
   *deep into product pages*; organic traffic +361 % in Australia; "ATS software" position 66 → 1; top-of-funnel
   conversions 7 → 174 (09:00).

Information gain's patent, quoted in YT:jF8auonTAEo 07:03: *Contextual estimation of link information gain* —
"additional information that is included in the given document beyond information contained in other documents
that were already presented to the user."

**[TEST]** The patent is real (US 11,354,342). "I read every Google patent" is a hook; a patent shows what Google
could do, as he himself says elsewhere. The 30-second figure is his, not Google's. The practice — NAP identity,
first-100-words, one-sentence novelty test, deep links to money pages — is sound.

### 2.5 AI content (YT:jF8auonTAEo)

- Google, February 2023: "Appropriate use of AI or automation is not against our guidelines." What is penalised
  is **scaled content abuse**: "many pages… generated for the primary purpose of manipulating search rankings and
  not helping users… no matter how it's created" (03:00-04:01).
- The "SEO heist" (Jake Ward, 2023): competitor's sitemap → ~1,800 AI articles in hours → 3.6 M visits, then
  collapse (he says −42 % in the video, "99.5 % wiped" in IG:DfGOjank3gM) (04:01-05:01).
- Semrush study of 42,000 posts [HS]: position-1 pages read 80.5 % likely human; from position 5 down the gap
  narrows — "laziness can't win the top spot" (06:02).
- Rule: use AI freely for structure and draft; add at least one of — something that took effort (a tool),
  something not text (video, original chart), something only you know (numbers, opinion) — and a real named
  author with a bio (08:04-11:05). "I've mass-scaled information gain — no." (11:05)
- Watermarking of model output (he says Anthropic's, and EU rules): irrelevant to ranking; de-watermarking and
  "humanizer" tools solve a problem Google does not have (YT:9V_mDZNAKak 07:03).

**[TEST]** Policy quotes are exact. The watermark claim was not verified by the analyst; nothing in the method
depends on it.

### 2.6 Page speed (YT:KO1PudJpXJU)

- Lighthouse is a lab simulation; ranking systems use **field data** (real Chrome users, 28 days). His site
  scores 46 (34 in IG:Dbj83tCTghw) "and does millions".
- His measurement on 1,000+ client sites [HS]: nearly half of red-score sites are fast for real users; 4 in 10
  green-score sites are slow; lab claims ~10 s where users get ~2 s; score vs rank correlation: zero; passing real
  Core Web Vitals ≈ +10 % clicks, almost all on smaller sites, nothing in the top 10 (04:01-05:03).
- Procedure: in PageSpeed Insights ignore the number, read "what real users are experiencing"; three passes =
  done. No field data → benchmark against the top 20 results for the target term (06:03-07:04). Search Console's
  Core Web Vitals report is the same field data.
- The rater rulebook contains the word "speed" three times, none about loading (08:04).

**[TEST]** Matches Google's documentation (Core Web Vitals from field data; no need to chase a perfect score).
His correlation numbers are his own and unpublished. His 2025 AI-Mode video (YT:T6E9g21CUHY 09:04) still said
"AI Mode will prioritize fast loading content" — the later position supersedes it.

---

## 3. Topical authority — the four-part map (YT:7KwayA-lQXY, YT:H2rCPbfN3jQ)

**Step 0 — pick the lane.** Finish the sentence "Our website exists to be an authority on ___." No sentence, no
strategy. "Google does not reward buffets. It rewards specialists." (02:02) Case [HS]: camping retailer, 250
posts, flat at 8,000 sessions for 18 months, content 40 % gear / 30 % travel / 20 % campsites / 10 % bushcraft →
forced to "family camping and hiking gear", rest pruned → 32,000 sessions in six months and ChatGPT
recommendations (03:02).

| Part | What it is | How to build it |
|---|---|---|
| 1. Core pages | Money pages: products, categories, services | List every page that sells; beside each, the one search a ready-to-buy customer types. 10-20 pages. Add none yet. (05:04) |
| 2. Areas of relevance | Supporting content that proves the specialism | Screenshot People Also Ask and related searches for the main product; open the top three competitors and note every supporting article they have that you lack. At least 20 to start. "Not a keyword list — a coverage decision." (06:04) |
| 3. Internal links | What links to what, with which anchor | Every supporting article links to the one core page it should push toward, with a descriptive anchor ("family tents"), never "click here". (07:04) |
| 4. Buyer's journey | Research / compare / buy tags | Three columns; tag every page; the emptiest column — "almost always compare" — is the next content. (08:04) |

**Publishing order** (10:05): (1) a wave of areas-of-relevance articles, each already linking to its core page;
(2) the compare layer; (3) only then optimise the core pages, which now sit under 60-70 supporting articles.
The camping brand: 30 AoR articles, then buyer guides, sales pages last — "a year's worth of authority signals in
about 90 days" [HS].

**The relationship test** (YT:H2rCPbfN3jQ 04:01): open two tabs — search the broad category in one, the specific
problem in the other. If the ranking sites change completely, Google treats them as separate topics and authority
in one does not carry to the other; each topic is earned separately (IG:Db9-OSEzyFz).

**Topic finding** (YT:H2rCPbfN3jQ 02:01; YT:uLD2d10-n58 01:00): ask "what problems does my brand solve", not
"what keyword". Sources: People Also Ask; Search Console queries of 10+ words; Reddit; AnswerThePublic; and best
of all customer emails, support tickets, sales calls and DMs. Fintech case [HS]: $50k of "best credit cards"
content, no movement; Reddit showed the pain was hidden international fees; content on that lifted the head term
(03:01). Regex he gives for Search Console (IG:Dfg1Erzjsw5): `^\s*(\S+\s+){9,}\S+\s*$` (10+ word queries) and
`^(what about|how about|show me)\b` (follow-ups).

**The bridge strategy** (YT:H2rCPbfN3jQ 06:03; YT:uLD2d10-n58 02:01): a regulated medical-lab client's content
could not be rewritten; clearer question headings, shorter sentences, simplified schema and reviewer tags alone
gave +33 % visibility YoY, +140 % top-3 keywords in two months [HS].

**Multi-service businesses**: "niche the umbrella, not each service" — every service gets its own cluster, the
heavy assets (calculator, white paper, expert content) go to the one that earns (IG:Dbugw6PjfDb, IG:DckBwPTGjpE).
Adding a service outside the niche makes Google less sure what you are known for (IG:Df6mhefG3Lq). Two sites =
"two half reputations" (IG:DfYYGCsDa6M).

**Pruning — zombie pages** (IG:Df_l0SJCRr6): Search Console → Performance → Pages → 12 months. No clicks and no
links → delete; similar to a better page → merge and redirect. Check Search Console before cutting anything
(IG:DensIqNjdZ9). **Cannibalisation**: two pages competing for one query → consolidate, canonical or
differentiate (IG:DcIPVOnjIxU). **Topic cluster, minimum form**: one main page, three question pages, all
interlinked (IG:Dfqw-jWTSIJ).

**[TEST]** Standard, sound hub-and-spoke practice with one sharp addition (the compare column and the publishing
order). "One link per article, always to a money page" is too rigid — supporting articles should also link to
each other; his own later posts say so. The 90-day claim is one client.

---

## 4. Information gain — six ingredients (YT:OmVahNHLQQQ)

The test: **"Could a competitor rebuild this page with an AI tool in an afternoon?"** (01:00). Reel form: "If
ChatGPT can write your page, ChatGPT does not need your page" (IG:DgEJwYCnMwo).

1. **A number only you have** — open invoicing, CRM or sales dashboard; pull one figure never published (jobs
   done last year, most-requested product, the question every customer asks). "Jimmy the plumber replaced 412 hot
   water systems last year" and knows which brand fails at year six (02:01-03:01).
2. **Proof of the real work** — the photo of the failed unit with the brand visible; raw video testimonials
   (they trigger a request automatically from the CRM after a 10/10 or five-star rating, tool: Vocal Video); a
   reviews page on the site, because that is where brand searchers and AI look (03:01-05:02).
3. **Not only text** — a short video or an original chart from own data inside the article; YouTube is among the
   most-cited sources in AI Overviews / AI Mode [HS]; they embed new videos in old posts (05:02).
4. **Go where other writers refuse to look** — `topic filetype:pdf` for government data, standards, industry
   reports; for health/finance (YMYL) the clinical guideline or regulator PDF with the figure and source beside
   it (06:03-07:04).
5. **Take a position and defend it** — "what is the industry too scared to say?" (08:05).
6. **Build something that doesn't scale** — a calculator, template or tool. His study [HS]: 1.2 M AI-referral
   sessions, 1,000+ (elsewhere "600+") businesses; by format, share of AI visits ÷ share of pages: tools,
   templates and calculators 7.5×, comparison pages fifth, statistics-roundup pages last
   (09:05; YT:Q3ZBZGwpoG0 06:07). Example: a bikini size finder built on the brand's own returns data.

Start with one page and one ingredient (10:05). Interview method (YT:S18roQFhxUQ 06:06; IG:DeqWhy1jZqe): have
Claude interview you (or record ten minutes of the expert talking, transcribe with Whisper), then weave the
answers into the draft — "your answers are the part AI hasn't seen before". Updating an old page counts only if
something actually new is added; changing the date does not (IG:Degetu6j7wz, IG:Dfy4IG0girH).
The "click-me" formula (IG:DbAufnXTCya): unique, specific, authentic — "I tested 11 shoes over 100 km" instead
of "top 10 things to consider".

**[TEST]** The strongest, most transferable part of his teaching and well grounded in §3.2 of the rater
guidelines. The 7.5× figure is his unpublished client data; treat as a lead, measure on our own sites. Note the
ratio is visits per page of that format — tools are rare, so a few good ones produce a high ratio.

---

## 5. Links and mentions

### 5.1 The golden rule
"A link is not good because a site is big; a link is good because a site is relevant and real people actually
visit it." (YT:qks6Bf-N_xg 02:01). Check the *page*: does it rank, does it get traffic (§2.2). DA is Moz's
score and DR is Ahrefs' — neither is Google's; packages that "raise your DR" sell a number (IG:Dei5NbaDvdI,
IG:De5DqUxze5j). "Five good mentions a quarter will beat a hundred cheap links" (IG:DdvPb9OibNJ). Mentions
without links still build the AI's description of you; nofollow press is still top tier "because AI isn't
following the link, it's reading what the page says about you" (IG:Db4QMeXFAVz).

### 5.2 Five levels of link building (YT:qks6Bf-N_xg)

| Level | Name | You need | What to do | Yield he states |
|---|---|---|---|---|
| 1 | **Claim** | a business that exists | Google Business Profile, Bing Places, Apple, Yelp, classic directories, industry associations, chamber; make all of them clean and consistent | Foundation — "how Google and AI first learn you exist" |
| 2 | **Ask** | a relationship | Suppliers' stockist/partner pages, sponsored clubs, association member lists, podcasts and events, and credit links for your original photos used elsewhere. Write down 10 organisations that know you; phone or email | "The only level that pays you twice" |
| 3 | **Steal** | content good enough | Scan competitors' backlinks for links they have and you don't, broken links, outdated resources; pre-check (traffic, ranks, niche relevance) *before* building the better version; 10 emails with one human line each | Expect 1 yes in 10 |
| 4 | **Authorship** | a topic only you could write | Guest posts found by `keyword "write for us"`, by following prolific authors, by competitor author-bio links; then become a regular contributor to the one publication buyers read. Paid placement: $100-500, premium $1,000+; Google expects it marked sponsored | Their own traffic 35.5k → 46k/month in the stretch they did this [HS] |
| 5 | **Attract** | something worth talking about | Digital PR (RAIDS, §6) | "One good story can earn more links in a week than the four levels below in a year" |

Extra moves: unlinked mentions — search the name in quotes minus the site; "about 1 in 4 will add the link"
(IG:DeqnooilkR-). Internal: link from pages that already get clicks to the page you want to rank
(IG:DedJ5nLjtCN). E-commerce: build niche links to *category* pages, not the homepage (YT:yQqFMnzQIqk 09:09);
ask every stocked brand for its where-to-buy page (IG:DfO0_YiDngV); authorised dealers ask for the
find-a-dealer listing (IG:DfCBBDGDTFQ).

### 5.3 His tier lists
Backlink sources (IG:DcNV5gODwQb): Fiverr links F · blog comments F · unlinked mentions C · nofollow B · free
.gov listing sheet A · niche relevance B · strong organic traffic on the linking site B · guest post A · big
media S "even if not niche relevant". Skips: expired-domain trick (IG:DfomYCRG0C6), paid top-10 lists
(IG:De061ayDRnl), pay-to-play awards (IG:DgEXYZigH6C), "20,000 social signals for $10" (IG:DfjRMBBpc4b), Reddit
seeding (Reddit's share of ChatGPT citations "fell about 86 % in August", Promptwatch, IG:De2vBB8Jpgh), PBNs
("I ran a network of fake blogs 15 years ago — not something I'd recommend", IG:Df_ADXzlDII).

### 5.4 Free authoritative listings — the content that made his account
Tiering (IG:DaOXfiwzpRL, IG:Da-PqHcTVGg): tier 1 state and federal government supplier registries · tier 2
council / local procurement portals and council business directories ("search your council's name plus business
directory", IG:DfG8WbGEaV3) · tier 3 the non-negotiables (Google, Bing, Apple, LinkedIn) and core national
directories · then industry directories for trades, health, hospitality, legal.

Named sources: buy.nsw.gov.au and the other Australian state supplier portals (IG:DZB0mqmDVSj) · sam.gov, ticking
small business, which lists the firm in the SBA's public small-business directory, "plus six more state portals"
(IG:DcKwm7DT6Ar, IG:DfMF8UhFiVi) · the UK government supplier registration service (IG:DdArpauF8n3) · Wikidata
(IG:DdIqoLQlRBt) · ATDW, one listing syndicated to the official tourism sites (IG:DfeRwIQj46L) · National Health
Services Directory, AHPRA record, association listing for clinics (IG:DfJhNv0lD5W) · lawyer directories and the
bar record (IG:De3HlZAj0B0) · licence registers for trades (IG:Dex9_Vojlgr) · software review and comparison
sites (IG:DfEXj6akcjD) · Apple Business for Siri/Maps (IG:DeihK7BoK4d) · Google Knowledge Panel claim
(IG:Df8o_-OgiRL) · ChatGPT business profiles via openai.com/business/businesses-in-chatgpt (IG:Df60RBGAUAw).
Sheets he gives: AU 55 → "2.0"; US; UK; "Global, 120+ free places"; "37 places to get your brand mentioned";
trade lists (trades, clinic, lawyer, tourism, saaslinks). The holding's own table of these is
`library/backlink-sources.tsv` in the job folder (162 rows, 48 measured).

**[TEST]** The idea is good and under-used; three repairs. (a) These are *registrations to supply government* —
they are legitimate only where the business really is, or genuinely wants to be, a supplier, and the details must
be true; registering solely to obtain a link misuses a procurement register. He says "if you supply to the
government or you want to" — keep that condition. (b) Whether the profile is public, indexable and links out
differs per portal and changes: he himself removed 13 entries in a re-check. Our table measured buy.NSW as a
followed link; SAM.gov could not be measured (client-rendered). (c) Each portal needs a local registration number
(ABN, UEI, Companies House), so the list is per country of incorporation.

---

## 6. Digital PR — the RAIDS protocol (YT:47tcY587bOQ; YT:rqoi2oSjwWI; YT:S18roQFhxUQ 07:07)

Worked on his own luggage brand (name garbled in captions: Caddy / Carry / July — unverified).

1. **Recon** — blank doc: brand, audience, the questions the *audience's world* asks (travel, not luggage).
   Search Google News, Google Trends, Reddit, TikTok, niche blogs for a recurring complaint. Found: hidden
   airline fees → headline idea "airlines with the most hidden fees" (01:00).
2. **Analyse** — build the data by hand if needed: top 10 airlines, same route (Sydney-Hong Kong), same date and
   time; base fare vs fare with baggage, seat, meal. One comparison table. "Journalists don't want ideas, they
   want facts." A few hours (02:00).
3. **Infiltrate** — 20-30 journalists who recently wrote on exactly this. Sheet columns: outlet · journalist ·
   email · article URL · notes. Search 4-5 topic phrases, open articles, take the byline, profile page, email
   (profile, contact page, or hunter.io). Paid alternative: Muck Rack (03:02-05:03).
4. **Deploy** — short pitch in the email body. Subject: "Revealed: the Australian airlines with the most hidden
   fees on baggage and seats". Three bullets a journalist can paste. One polite follow-up a week later, then
   park it (05:03-06:04).
5. **Score** — track placements and links. Result [HS]: Yahoo Finance, Australian Traveller, escape.com.au and
   others; "+138 % global organic traffic", "4× referral revenue from ChatGPT"; the articles became the source
   AI quoted for the fee question (07:05-08:05).

Variants and rules: reactive call-outs — SourceBottle, Qwoted, Featured all have free plans; "answer fast and
answer the exact question; one number only you have; full name and title"; do it for the named mention
(IG:DfMRrvYjVjo, IG:DfJs0ZYkTGk) · data publishing (interactive map, survey) · newsjacking · coining a term
(YT:rqoi2oSjwWI) · Google Trends shows when journalists will write — pitch a month before the spike
(IG:DeS2sPrAHjx) · a calendar of 60+ dated moments with pitch date, angle, outlets, example story
(IG:DZ_VD8Zz4r5) · "there are a quarter as many journalists as before COVID — hand them unique data"
(IG:DdsO0PVDITH) · the story is about the finding, not the business: "new data from X suggests…"
(IG:DgBymHRjffp 01:55) · Claude finds the story in a spreadsheet: two years of orders → "regional customers
spend 38 % more per order" → a headline, "80 % less time from idea to pitch" [HS] (YT:S18roQFhxUQ 08:07).
His digital-PR skill, as he walks it (IG:Df1Sr60J5so): load the skill → give it CRM or survey data → it reads
the business context or asks for it → it sorts strong data from weak and proposes angles ("it's important you
get this step right") → it proposes target publications, you confirm → personalised email template → a
one-page attachment → journalist contacts from article and author pages → send.
What stays human: the genuinely odd creative angle and the relationship with the journalist (09:08).
Evidence for PR over on-site work [HS]: brands ChatGPT recommends vs same-size brands it never names differ in
the news, not on their websites (IG:DfjfXMOnwm_).

**[TEST]** Mainstream digital-PR practice, honestly described, no deception in it. Missing from his account: the
methodology note and data page journalists need to cite (he implies it), media-law care with "revealed" claims
about named companies, and hit rate — one success story is shown, no denominator.

---

## 7. Pages that win — blueprints

| Page | What it must carry | Source |
|---|---|---|
| **Service page** | Not "four lines and a contact form". Proof; the questions buyers always ask; who it is *not* for; a price range, what changes it, and one real job; cost, timeline and process answered before the call. | IG:DgCKs4ZlOpW, IG:DeXrqmejnWh, IG:DfOqsVGjq7e, IG:Ddp6EmbG6S7 |
| **Pricing page** | Real prices, who each plan suits, what a customer really pays. "'Never put your prices on your website' is the worst advice." | IG:DeDFRonDfm-, IG:DfGaepum-lL |
| **Homepage** | What you do, where, since when, and proof anyone can check. | IG:Dd7yfa8CU8T |
| **Location page** | One page per location; not the suburb name swapped in a template — same page cloned 50 times "is no good… you're not adding anything new". | IG:DeAnWxYHSC-, IG:DgCU7FFAJsd |
| **Case study** | Every result with a number, a starting point and a time period; project type, brief, solution, short client testimonial; photos carry text (problem, solution, result). | IG:DeEJ8hUGg6l, YT:UyWZRvGKI4A 02:01, IG:DWxPMpjlyei |
| **Calculator page** | Gives the answer without asking for an email first. | IG:Dd-CkrSEXBx |
| **About page** | Real names and faces, licences, awards, memberships, start year — and links out to the proof. | IG:DfGbSAETFoD, YT:vugUqC8XoH0 07:04 |
| **Product page** | Specs, dimensions, materials, reviews, visible price, comparison info, structured data: "pages that close, not pages that explain". AI was given data by brand B and "vibes" by brand A. | YT:z7vmho9x1Kk 05:05, YT:_GahI1eGYM4 01:00 |
| **Category page** | ~200 words on who the products suit, sizing, buying tips, links to subcategories and occasions (Officeworks: +30 % visibility [HS]); split categories by how people search; keep them updated. | IG:DYL1Ie2TEWg, IG:DgBymHRjffp 00:11, YT:yQqFMnzQIqk |
| **"Boring" pages** | Returns, privacy, pricing, About — the AI reads the ones customers never do. | IG:DgBk7xYj_9L |
| **Reviews hub** | A page that gathers verified reviews; testimonial blocks on main pages. | YT:UyWZRvGKI4A 05:03 |

**Answer-first writing** (YT:uLD2d10-n58 02:01; YT:GwxIKjwPfEE 06:01): the question as the heading; the direct
answer in the first one or two sentences (first 100-200 words of an article); bullets for checklists, numbered
lists for steps; tables for comparisons with "best for" use cases. Law-firm case: glossary pages rose while long
articles fell once AI Overviews arrived. Check: paste the page into a model, ask "summarise this for a buyer who
wants ___"; if the three-to-four-line summary misses the point, rewrite (13:04). Titles and first 100 words
deserve the hour; meta descriptions do not (IG:DgE5zTvFQk-).

Brand teardowns he posts (traffic figures are third-party estimates [HS]): Figma — 283 colour pages that are
tools; DocuSign — free contract templates and a signature generator; DoorDash — ~314,000 cuisine × city pages;
Princess Polly — a page per occasion; CapCut — a page named after each job; CarGurus — a verdict on every car;
Micro Center — a PC-builder tool; Robinhood — a page per stock; Noom — a verdict on each diet trend the week it
rises; H&R Block — answers "where's my refund" even though the answer is on the IRS site
(IG:DfqiKe3ExDH … IG:Dfx5ICpTyXG).

**[TEST]** "Skip meta descriptions" is half right: not a ranking factor, often rewritten — but his own law 1
calls the snippet "a promise" that drives the click. Sound version: write them for the top money pages only.
His 2025 advice against accordions (YT:T6E9g21CUHY 01:01) is too absolute — content in the server HTML inside a
native `<details>` is readable; what fails is content injected only by JavaScript. The DoorDash/Robinhood pattern
is programmatic SEO, which he elsewhere warns about; his own rule reconciles it: "the data's the good part, the
thin pages are the risk — only publish the pages that have something worth reading" (IG:DeyaG5HTjfz).

---

## 8. Technical — "four checks matter, the rest is a line item"

- **Readable without JavaScript.** AI crawlers read HTML and do not wait for scripts; vibe-coded sites (Lovable,
  Claude) often ship empty shells. Ask for server-side rendering or static HTML; view source to check. In his
  study about 1 in 20 key pages lost most of their words with JavaScript off [HS] (IG:De0iyXHjuVV,
  IG:Dcst8IwD1oM, IG:Dd5zepAANmF).
- **Not blocked.** robots.txt and Cloudflare: allow search and agent bots; training bots are the owner's call
  (IG:De6OyC4jSLk, IG:DbhS0Tij3yS).
- **Indexed.** Sitemap, URL inspection, the "not indexed" report (YT:T6E9g21CUHY 10:04).
- **Structure.** Semantic HTML, one job per section, sane heading hierarchy, redirect chains removed (case: 147
  chains found by Claude in a 100,000-URL crawl, one killing a page that had 3,000 visits a month [HS],
  YT:S18roQFhxUQ 02:01); broken pages weighted by what they cost, not listed flat (IG:DfEw94wFgOg).
- Schema: Organization, WebPage, BreadcrumbList, FAQ, HowTo, Product, Review, Article, VideoObject; reviewedBy,
  author, datePublished (YT:T6E9g21CUHY 01:01); LocalBusiness for local (YT:vugUqC8XoH0 01:01). Keep it valid
  and plain — "a label for your content".
- Rated low: llms.txt ("F — a waste of money"), a separate "GEO retainer" ("F — the same work with 10-20 %
  difference"), WebMCP / agents.json "only when you can name the job", prompt trackers before you are mentioned
  at all, page-speed scores (IG:DgBymHRjffp, IG:DfdNGM_n3ZI, IG:DgEvab2lboS).
- Redesign and migration: relaunches lose 30-70 % of traffic when the wrong changes are approved; check the top
  ten pages the week after; tell Claude what to protect — URLs, pages that already rank, server-side rendering
  (IG:DfvxBsIpz-b, IG:DdSzhhECens). During a core update: change nothing (IG:Df6teSVDllC).
- WordPress vs Claude Code (YT:6_x-OsOMmFs): both rank; stay on a CMS if you sell real stock, have logins, or
  publish several times a week with a team; otherwise static HTML edited through Claude with Git history. Limits
  he states: "Claude makes generic looking stuff" — a good designer is still needed ($10-15k design + AI build vs
  $50k quoted before [HS]); prompting is bad at pixel nudges.

**[TEST]** Correct and current. The FAQ/HowTo rich results were largely retired by Google in 2023, so that part
of the schema list has entity/clarity value only.

---

## 9. Local (YT:vugUqC8XoH0; IG:DgCU7FFAJsd; IG:DgD1IoDjQaZ)

1. **Consistency.** Fill every field of the Google Business Profile; exact primary category; every service
   listed; name, address, phone identical on site footer, GBP, Apple, Bing, Facebook, directories — even "St" vs
   "Street". LocalBusiness schema in the head.
2. **Structure.** Every GBP service gets its own page, in the nav and footer; city in title and H1; map embedded
   on the contact page, every service page links to it; a directions link.
3. **Trust.** Ask for a review after *every* job; reviews that name the job and the suburb ("a mini case
   study"); reply to every one, restating the work and place; 4.6-4.9 beats a perfect 5.0; post a job photo
   weekly; local mentions ("one relevant local link beats 10 random ones"); About page with faces and licences;
   case studies with text; blog starting with "what does it cost" and "how long does it take"; named, qualified
   author linked to the About page.

Review-owner types: five-stars-no-words · perfect-score chasers · ghosts (no replies) · **the asker** (the one
to be). Fake reviews are removed through Google's 11 policy categories (IG:DZEE0eGzDp6). Claimed result [HS]:
"1,000+ businesses, average +41 % clicks in three months".

---

## 10. E-commerce and B2B

**E-commerce study** (YT:z7vmho9x1Kk) [HS]: 100 Australian stores, July 2024 → March 2026; 8.35 M organic
sessions, $22 M organic revenue, ~350k AI sessions; ChatGPT revenue $700k (~3 % of revenue), ChatGPT sessions 8 →
38,000 a month; 7 brands took 70 % of AI revenue, 19 took none; a furniture specialist earned $60 per ChatGPT
session vs $2.65 per organic session; Bing converted at 3.6 % vs Google 1.2 %, Copilot 2.3 %. Actions: own one
category; product pages that close; Bing Webmaster Tools; Microsoft Clarity (zoom fix → +15 % mobile add-to-cart);
find AI sessions hiding in direct / not-set in GA4. "$25k for a $5M store" ranking (IG:DgBymHRjffp): S —
crawlability check, Merchant Center, digital PR on the store's own data; A — category copy and links, reviews
and real questions on product pages; F — separate ChatGPT retainer, llms.txt, AI blog volume. One buying guide
beats twenty new category pages (IG:Df8bQegiYOh).

**B2B** (YT:UyWZRvGKI4A) on his own agency [HS]: case studies 10 → 50+, each a different problem → inbound
organic MQLs +248 %; consistent third-party proof (industry publications, awards, speaking, Wikipedia) → branded
impressions +181 %; reviews hub → session-to-contact +63 %, contact-to-customer +29 %; AI-sourced leads close in
~2 weeks vs 6. Weekly checklist with one named owner: 1 case study · 5 Google reviews · 1 YouTube video or
podcast · 3 LinkedIn posts · daily TikTok/Instagram · 1 useful tool or template (07:03). B2B signals: YouTube,
podcasts, awards, case studies, Clutch/G2/Capterra; ~75 % of LinkedIn content AI cited came from people, not
company pages (IG:DfOGUvwl_Bz).

---

## 11. Measurement

- Goals are not keywords: split clicks into branded and non-branded and grow the non-branded; brand search
  volume is "the scoreboard" (IG:DfNwYPwD35m, IG:DedXolFjUM2). Revenue over traffic (billion-dollar client:
  traffic flat, organic new business +32 %, YT:GwxIKjwPfEE 12:04).
- Free AI-visibility instruments: Search Console (AI impressions, branded filter, social and multimodal views),
  Bing Webmaster Tools' AI citation report, Microsoft Clarity's AI-bot dashboard, GA4 referrals, a monthly manual
  check in a logged-out / temporary chat with personalisation off (IG:DgEvab2lboS, IG:DcUtYd6G_g0,
  IG:DdJRxZBm1mG, IG:DexbqAMjFVb). Pay for a prompt tracker (Peec) only once you are being mentioned.
- "How did you hear about us?" on every form — "beats any digital attribution" (IG:DbfDHLYAMfW).
- Board slide: four gauges, same order every month — **eligible · chosen · arriving · paying off**
  (IG:DeloXcIDIFM).
- The compounding cadence (IG:DdGrir3jwYv): Content — daily refresh one piece, weekly one long-form from own
  data, monthly one old page rewritten as Q&A. Pages — daily improve one, weekly one new service/location page,
  monthly structure and internal-link review. Authority — daily one outreach, weekly one follow-up, monthly one
  earned link or mention. Performance — daily Search Console + GA4 scan, weekly rankings and AI prompts, monthly
  full audit. 90 days.
- Search Market Fit (credited to Eli Schwartz): before spending, check that people search for it and that the
  searchers are ready to buy (IG:DbfluilT0QA).

---

## 12. AI in the SEO workflow (YT:S18roQFhxUQ; YT:VFRGQNDziMM 09:03)

"First we went full robot, and that was no good. Then just humans — fine but inefficient. When we augmented
humans with AI we had by far the best outcomes." Claude = "the GPS": strong at crawl-data pattern finding,
keyword-to-draft speed, outreach personalisation, PR ideation and mining a spreadsheet for a headline; weak at
anything visual, at the odd creative angle, at relationships, and it must not invent the experience.
Tool stack by job (IG:DZJ9XmRjAib, IG:Df_wH0NE1Ug): analytics GA4 → SEO Gets (he is an investor) → plus sitting
with sales on which leads convert · keywords DataForSEO · backlinks Ahrefs · crawl Screaming Frog + a Claude
skill that filters and prioritises · briefs Claude skill fed with tone of voice, emails and own data, then a
human editor · schema schema.org + Claude · heatmaps Clarity · reviews Trustindex · AI visibility Peec ·
automation n8n over Zapier.

His skill names seen in the material (functions as he describes them): technical audit / crawl-to-plan (FROG,
SITECHECK, TECHNICAL) · content brief (BRIEF) · data PR + outreach (NEWS, DATAPR) · Information Gain Finder ·
cannibalisation finder · Winner or Loser (after an update) · Website Gap Finder / missing pages with a four-week
plan · AI Visibility Check (CAN YOU SEE ME / SHOW UP — asks ChatGPT, Gemini, Perplexity, Claude and reports who
they pick instead) · Clarity AI-bot audit · local audit (LOCALBIZ) · B2B page audit · Calculator Page Builder ·
click-me rewriter · bad-review reply · Search Console quick start · website score (topics, depth, structure,
trust → three fixes) · "rate my page like a Google quality rater" · "is my page worth ranking" · "what's my
website missing for AI search" · topical authority map from a Search Console export · page-speed-is-it-a-problem
· competitor outrank comparison · keyword-to-prompt sheet. Packs: Core (3-4), 8-skill audit, 12-skill set,
"50+".

---

## 13. Trade-by-trade one-liners (March-April 2026 series)

Tradies — one page per service with before/after photos, testimonials, service-area targeting · plumbers —
publish under the licensed plumber with bio · contractors — every project photo gets problem, solution, result
as text · restaurants — keyword in the H1, review stars, a page per location · psychologists — a page per
service with its own reviews and credentials · florists — testimonials on gallery pages, monthly seasonal
content · wedding planners — clear H1 before clever headline · fashion — categories, filters, size guides,
schema, reviews · supplements — press links through data stories · automotive — cost guides and comparisons for
non-brand searches · schools — a page per school stage with enrolment CTA · financial advisers — a page per
recurring client question with FAQ schema and adviser bio (IG:DWu5YiIFXiX … IG:DW5qkmxkYu7). Niche wins:
"the accountant who owns 'OnlyFans tax advice' makes more than the one fighting for 'accountant Melbourne'"
(IG:DX3ucDoDjtm) — the principle (own a narrow niche) is the point; that example niche is outside the holding's
boundaries.

More from the March 2026 series (captions before 2026-04-04, read by a helper; codes as given): law firms — a
page per practice area with sub-pages and case studies; in hard markets add digital PR, a stronger About page,
location pages with local case studies (DWNnbdYJ6ef, DVmretXicPt) · family law — separate pages for divorce,
property settlement, family violence (DWiHChNETqC) · mortgage and financial firms — named authorship and
thought leadership; awards and reviews alone are not enough (DWdVcCjJsNB, DWqmD_1AQEU) · restaurants — H1 as
text not an image, the menu as text, menu-section pages, the contact page as a landing page with booking,
hours, directions (DWnbnQykVIr, DWfUf4UEW20, DWC8mBUT_p0) · clinics — a page per treatment: what it is, who it
helps, how it works, outcomes (DV0Z1hOkua5) · chiropractors and other health trades — About page with people,
photos, accreditations (DWf6ulvpO74) · removalists and movers — memberships shown, About in the main nav,
suburb pages with location-specific reviews, meet-the-team page (DV73Gh_Ce85, DWScl7Kib0v) · pest control — a
URL per service, no JavaScript-only site (DWDkSLXz4Zi) · manufacturers — navigation, credibility pages, an
expert About page; "boring niches are the easiest to win" (DWVgb0VTUra) · SaaS — working template pages,
comparison tables, pricing and how-it-works pages (DWKg5beBFDm, DVo2jd2iZ6S) · e-commerce — about half of
store traffic lands on category pages [HS] (DVdPQuCEnEK); a hub page linking a parent brand to its lines
(DWlXBOGkbv1) · ad-funded blogs — turn the authority into a service business (DWauX1eJrwg).

---

## 14. His own commercial machine

**The offer** (studiohawk.com.au, read 2026-11-23). Positioning line: "No generalists here, just a damn good
SEO & AI Search agency"; "No account managers, only SEO Specialists"; "No long-term lock-in contracts". No list
prices on service pages — every cost question answers "bespoke proposal" — while his own content says hiding
prices is "the worst advice" (IG:DfGaepum-lL). Signals that do exist:

| Signal | Figure | Where |
|---|---|---|
| Budget options in the lead form | Under $3k · $3-4k · $4-6k · $6-8k · $8-10k · $10-15k · $15k+ per month | /request-seo-masterplan/ |
| His agency's pricing article (9 Dec 2025) | Entry $500-1,000/mo · Growth $1,500-3,000/mo · Authority $5,000+/mo · hourly $150-300 · audits $2,000-5,000 · migrations $3,000-10,000 · content audits $2,000-6,000 · digital PR from $4,000 per campaign; "the majority of client campaigns" at $1,500-3,000 | /blog/seo-pricing/ |
| ROI calculator defaults | $25,000 a year (e-commerce), $36,000 a year (lead generation) | /seo-roi-calculator/ |
| Digital PR promise | Points-based target; pro-rata refund at contract end if missed | /seo-services/digital-pr/ |
| Rankings | "No reputable SEO agency can guarantee a number-one ranking"; 3-6 months expected | home FAQ |

Currency is not stated on the pages read (AUD assumed for the .com.au site — analyst's inference).

**The conversion step.** One offer everywhere: a free "SEO & AI Search Masterplan" built by a senior strategist
within 24 business hours — technical audit, content/architecture review, competitor benchmark, AI visibility
check, PR plan, month-by-month roadmap. Form: goals → start timing → monthly budget → how did you hear about us
(includes "ChatGPT or AI tool") → website and notes → name, work email, phone. Proof shown beside it: review
counts (Google 4.8-4.9 from 100-270 reviews depending on the page, Clutch 4.8 from 6), 60+ case-study pages in
a fixed format (headline stats · The Need · The Plan · The Execution · The Results · The Conclusion · client
quote · call to action), awards, "average 300 % ROI", "2,000+ campaigns, never a single penalisation". Counts
differ from page to page (clients 250+ vs 500+; awards 42 / 50+ / 60+).

**The service menu is wider than "one thing".** AI SEO, technical, e-commerce, local, enterprise, small
business, digital PR, link building, international, migrations, consulting, SaaS, B2B, analytics and
reporting, YouTube, Reddit, app-store optimisation, content writing and UX; pages per platform (WordPress,
Shopify, Magento, HubSpot, headless…), 21 industry pages and city pages. "Only SEO" means no paid ads and no
social management — he says he turned away $7.5 M of such requests in a year [HS] (YT:UyWZRvGKI4A 04:03) — not
a narrow catalogue. The site practises his own map: a page per service, per industry, per platform, per city.

**The free layer — Hawk Academy** (hawkacademy.co). Free "forever" (formerly a $300 course that earned $150k
[HS]); 12 courses, 45 quizzes, certificate, a private Skool community; registration takes name and email.
Target: "teach 100,000 people" (8,400 counted in May 2026, IG:DX_BiUOTSiH). It hosts: 58-59 Claude skills
(single `.md` files with a one-line install into `~/.claude/skills/`, a zip pack, one plugin under MIT
licence), 37 browser tools with no login, free backlink sheets as copyable Google Sheets — Global 124 rows, AU
58, US 63, UK 45, Canada 65, plus niche lists (agencies, health, hospitality, lawyers, SaaS, tradies), columns:
link · free or not · listing type · why it matters for AI search · done — and digital-PR calendars (AU 64, US
62, UK 59 rows: moment, date, pitch-by, data angle). The white papers and the e-commerce and local toolkits on
the agency site are email-gated. Its stated purpose, in its own words: "The skills bring practitioners to the
library. Some eventually become workshop attendees or agency clients."

**The content engine** (measured from the 929 captions).

| Period | Posts | Comments (sum) | What changed |
|---|---|---|---|
| 2018 → Feb 2026 | ~160 in seven years | under 70 a month | Occasional founder and hiring posts |
| March 2026 | 136 | 46 | Volume starts: "SEO for [trade]" series, no call to action |
| June 2026 | 32 | 10,435 | First keyword call to action; the .gov.au supplier-portal reel: 4,029 comments |
| Aug 2026 | 92 | 8,896 | US version, boosted by another creator's video: 4,777 |
| Oct 2026 | 163 | 6,440 | Five a day; skill packs and series |
| Nov 1-23 2026 | 118 | 3,420 | Brand teardowns, book ideas, re-checked "2.0" lists |

- Volume alone did nothing (March: 136 posts, 46 comments). What moved the account was **a concrete free list
  behind one keyword**. Top keywords by comments: USLINKS 4,777 (1 post) · BRIEF 3,079 (11 posts, the tool-stack
  reel re-shot) · PACK 1,266 (10) · SKILLSET 1,023 (2) · LISTINGS 1,016 (3) · FROG 840 (4) · DPR 789 (9) ·
  LISTING 742 (2) · CLAUDEAUDIT 699 (2) · TECHNICAL 612 (5) · CLICK ME 552 · UKLINKS 545.
- Ranking of asset types by pull: free places to get listed > "my tool stack" > skill packs > single skills >
  explainer videos > opinion. Posts with no asset usually draw 0-5 comments, including the brand teardowns.
- Mechanics: one keyword per post; the DM carries a link to an ungated Hawk Academy page; winners are re-posted
  for months and re-issued by country, by trade and as "2.0"; a comment count is itself the next hook ("got over
  2,000 comments asking for the list"); YouTube long-form closes with "first link in the description, I don't
  even want your email" and a QR code; every video opens with the same credential sentence and ends by handing
  to the next video.
- The chain: reel → keyword → DM → free asset on the Academy → Academy account or YouTube → Masterplan form →
  retainer. He also has a book, an investment in the tool he recommends (SEO Gets, disclosed), a second brand
  used as a public case, and speaking/awards as proof.

**How he says the agency was built** [HS]: SEO only from 2015 on a mentor's advice · first clients in rooms,
not online ("networking events work because the big companies aren't there", IG:DYOk-zBjjY5) · first
enterprise client through a $300-a-month client whose wife was a CMO — "you're never selling to the person in
front of you" (IG:DX01rO6jPu6) · the specialist who does the work talks to the client, no account managers
(IG:DYwXVDip34m) · a monthly phone call to every client "massively increased retention" (IG:DXnvK5sjMiP) ·
juniors trained in-house instead of recruiters (IG:DY1LE9BTSf2) · awards used for clients and hiring · free
education "lets clients see the value".

---

## 15. Where he contradicts himself or has moved

| Earlier | Later | Which to follow |
|---|---|---|
| AI Mode "will prioritise fast-loading content"; address Core Web Vitals (2025, YT:T6E9g21CUHY) | Speed scores are near-useless; only real-user data matters (2026, YT:KO1PudJpXJU) | Later |
| Hacks: Wikidata as essential, directions-link trick, schema as lever (late 2025 captions) | "A year ago I obsessed over hacks"; "schema is not a magic trick"; "most technical SEO is BS" | Later; Wikidata stays as an entity record where the business is notable |
| Prompt trackers dismissed (Jan 2026) | Peec in his stack; "only once you are mentioned" (Nov 2026) | Later, with his condition |
| "Update and resubmit your sitemap" | "Sitemaps don't move the needle" | Keep a sitemap; expect nothing from it |
| "Add pages → get traffic" | "Publish fewer pages, each worth sending a customer to"; prune | Later |
| Comparison pages are where browsers become buyers (YT:7KwayA-lQXY) | Comparison pages came fifth for AI visits; "the thing every SEO bro tells you to build" (YT:Q3ZBZGwpoG0) | Both hold: compare content serves the buyer's journey; it is not the top AI-traffic format |
| Statistics pages last for AI visits | Digital PR on your own statistics is S tier | No conflict: the number earns coverage elsewhere; a roundup page of other people's statistics earns nothing |
| "Only one thing" | An 18-service menu | The lane is "search", not a single service |
| Headcount 150+ (Jan 2026) | 100+ and 120 (March 2026 onward) | Unexplained; treat all his counts as approximate |
