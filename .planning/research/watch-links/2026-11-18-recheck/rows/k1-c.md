# k1-c — second reading of k1-06, k1-07, k1-08 (tab "Kasım 1 incelemeleri", revenue videos)

Reader: Opus 5.5. Date 2026-11-18. No video was watched, downloaded or transcribed; the transcripts on disk were read whole.

The revenue list: `.planning/research/REVENUE-OPPORTUNITIES.md` §D, written 2026-11-01 from these same three videos. All three rows are already in it: H1 #17, H2 #18, H3 #19, H5 #21, H7 #23, the later list #26, the rulings section and "Geçmeyenler". So this reading looks for what the list and the board rows do **not** yet carry. Where an income road is already written, the line says where.

---

## k1-06 (JhyVSrQPVSg) — Chris Koerner, solo episode: six ways to earn with consumer AI agents (Muse, Grokbot, Instinct)

- **Opened:**
  - The whole transcript: `~/.cache/link-watch/v5-JhyVSrQPVSg.tr.vtt`, a Turkish caption track of 82,765 bytes, de-duplicated into `$J/rows/k1-c-src/v5-JhyVSrQPVSg.txt` and read from start to end.
  - Earlier readings: the earlier reader's report `.planning/research/watch-links/2026-11-01-gelir/readers/koerner-opus.md` (Video 1) and the referee's calls `MERGE.md`.
  - Revenue list §D, the board row files B83, B84, B05, B82 and B28, and the inventory `$J/inv/k1.tsv`.
  - Code: `.claude/skills/dxb-research/scripts/maps.py`.
  - Live pages: the GoHighLevel pricing page, fetched with `fetch.py`.
  - **Not on disk, so not seen:** frames and the video description. The 19 $ PDF and the Stripe link come from the description, as the earlier reader recorded it; this transcript names only "a free document with the prompts" and playmakersai.com.
- **His note:** "Holding'de ciddi yani farklı gelir kaynaklarına ihtiyacımız var."
- **What is in it** (minute from the transcript):
  1. **Quote gathering (01:46).** Muse found 82 Dallas–Fort Worth pool builders and filled their contact forms. It answered their mails from his inbox, logged each quote in a sheet, asked him only what it did not know, and chased every builder silent for 3 days. Result: 8 quotes in 24 h, 120k–240k $.
     - The business named: pool consultants charge 3–6 % of the job. Make it a site for pools, roofs or kitchens.
  2. **Garage/Marketplace agent (13:56).**
     - Selling: the agent researches the price of each item in its condition within 30 miles, lists it, negotiates and books pick-ups. The rule: −10 %/day if fewer than 3 enquiries a day.
     - Buying: a mini-loader; tyres booked at Discount Tire or Costco; spray foam quoted 12,000 $ the old way, 1,200 $ through Muse.
     - The business named: a consignment agent with no shop, taking 30–50 %.
  3. **"Agentic dropshipping" (18:57).** A site listing every fruit tree, priced 30–60 % above the cheapest nursery. The agent buys from the nursery in the customer's name and refunds when the item is out of stock. He says "I'm doing this this week"; there is no result.
  4. **The 11 $ lead site (24:32).**
     - The tool: an unnamed tool shows cities where demand is above supply. His 5–10 data points: only a few firms in the Map pack, few or poor reviews, many searches, cheap clicks.
     - The build: Grokbot bought the domain on his card, built the site, and added Google Analytics and Search Console.
     - The Monday report: an automatic rank report every Monday (Brownsville shower doors went from 14th to 10th between 28 Sep and 5 Oct).
     - The leads: laredocranerental.com brought leads of 3k / 23k / 9k $. He gave them to the one local crane firm with a website: "free now, tell me how they went".
     - Pricing path: give the first leads away, see who sells, go exclusive with one buyer per site (~800 $/mo), raise it to 1,200 $ after six months, and if refused find another payer.
  5. **The outreach machine (30:27).**
     - Prospect filter: Google Maps, one niche × one city, 4+★, 50+ reviews, no booking link on Google, owner never replies to reviews.
     - Further checks: an after-hours call to see whether it goes to voicemail; contact forms filled from a number he controls, and the reply time logged.
     - A demand signal: watch Facebook groups and Nextdoor for "anyone know a good plumber?" posts and record which businesses get tagged most.
     - Audit: a one-page audit scored 1–10 (booking flow, reviews, speed, Google Business Profile gaps). Example: 100 gutter firms in Omaha give 9 audits.
     - Personal video: a 3–7 min Loom read from a script Claude writes. Before recording, the agent finds every way to reach the owner (cell, LinkedIn, Facebook, Venmo, Strava).
     - Demo: a firm-specific AI receptionist / missed-call text-back / booking page with the firm's logo and prices.
     - The "what if" ROI sum: "4 leads/day at 39 $ → what if 6?". **"Every wrong assumption you make gives the owner a reason to reply and correct you."**
     - Rule: go wide and weird (shower-door repair, not plumbing). Mercury gives the agent a capped card. The agent can also send a gift basket to the 9 firms.
  6. **Sell the agent itself (38:31).** An inbox scan that finds class-action payouts (a friend got ~200 $); an app with a commission or a refund guarantee; a phone-call reminder for ADHD built on Grokbot.
     - Pick what to build by reverse-engineering a winner: Meta Ad Library (video or static, which countries), its backlinks, and the Wayback archive year by year — "what changed over time" (40:28).
  7. **Agents talking to agents (41:05).** Instinct sits between Claude (which writes a master prompt) and Replit (which builds); that is how wardwaivers.com was encrypted.
  8. **Housekeeping tips.** Keep the agents' skills in a private git repo that the agent updates every Friday (44:33), and ask the agent for a weekly AI-tools email (45:20).
  9. **Sponsor:** GoHighLevel, 20:41–21:39.
  10. **His own sales:** playmakersai.com (AI-consulting community), tkoyes.com, tko.com referral 1,000 $.
  11. **None of his examples earned him money.**
- **What we have:**
  - Browser-driving hands, all confirmed installed: `operator` (`/usr/local/bin/operator`, `~/.claude/skills/operator`), `@playwright/mcp@0.0.79` (npm -g), scrapling (`~/.claude/skills/scrapling`, `~/scrapling-env`), camofox (`~/tools/camofox-*`).
  - `.claude/skills/dxb-research/scripts/maps.py` reads Google Maps places with name, **rating, review count**, category, address, phone, website and place_id. That covers two of the four filter conditions today.
  - B83 H7 already holds "Aday bulma: gizli müşteri denetimi" (REVENUE §D #23, 2026-11-16).
  - B84 decision 9: client finding; an outreach campaign is approved by him once (niche, city, template, daily cap). B84 Y9 leg: Apify on the free plan first (YE10).
  - OpenSEO `local-seo` skill (`~/.local/share/dxb/skills/openseo/local-seo/SKILL.md`): Maps visibility and competitors around a coordinate.
  - B82 Gözlem Odası and B42: the weekly watch of tools and people.
  - Skills live in the repository: 19 project skills plus the global ones.
- **What it has that we do not:**
  - (a) Two more filter fields: **no booking link** and **owner reply rate to reviews**. maps.py does not return them (checked: `_place()` fields).
  - (b) The **community-tag demand signal**: the businesses tagged most in "who knows a good …" posts.
  - (c) The **deliberate-assumption demo hook**: the ROI sum is shown with stated assumptions so that the owner replies to correct them. It is not in H5 or H7.
  - (d) The **lead-site pricing ladder**: free leads, then exclusive with one buyer, then a raise at 6 months, then another payer. H1 holds the free week and the fixed rent, not this ladder.
  - (e) **Reverse-engineering a winner** through the Wayback archive year by year, beside the Meta Ad Library and backlinks. Wayback appears in our doors only as a liveness note (`urlcheck.py:10`, "Wayback 503"). B28's weekly loop already reads the ad libraries.
  - GoHighLevel's plans (read 2026-11-18): Agency Starter 97 $/mo (3 sub-accounts), Unlimited 297 $/mo, SaaS Pro 497 $/mo with "SaaS mode with unlimited reselling", and the AI Employee add-on at 50–97 $/mo per sub-account.
- **Board:**
  - **Outreach filter + audit + demo.** Row: B84 (decision 9, Y9 leg), with B83 H7 for the secret-shopper audit.
    - Stands there now: maps.py (rating, reviews), OpenSEO local-seo, Apify free plan, and H7's "gizli müşteri denetimi".
    - Relation: **method**. Add the two missing fields, read from each place's page by our hands; add the community-tag signal and the wrong-assumption ROI hook.
    - First trial: one niche × one city. maps.py pulls 100 places; booking-link and reply-rate fields are read from the place pages; 1–10 audits are scored and one demo mock-up is made. Nothing is sent. Measured: pass rate, cost per audit, his quality mark.
    - Stops at the CEO: the after-hours voicemail call and any reply-time test. REVENUE #23 leaves "measuring reply time under the holding's real name with a real question" to his ruling, and the fake form is under "Geçmeyenler". Also the outreach campaign (approved once).
  - **The 11 $ lead-site recipe and pricing ladder.** Row: B83 (H1, #17).
    - Stands there now: the keşif istasyonu (not built). The B84 SEO core can feed it: Google Ads API keyword planning, Bing GetKeywordStats, DataForSEO, OpenSEO, Search Console (mcp-gsc).
    - Relation: **method**. Koerner's 5–10 data points map one-to-one onto parts we hold or have planned: Map-pack count, rating and reviews from maps.py; volume and cost per click from the Ads API and Bing; the Monday rank report from Search Console and OpenSEO. No new tool is needed for the discovery station.
    - First trial: inside K3 (2 sites, 90 days) when B83 builds H1.
    - Stops at the CEO: the domains and number (money out, identity), P1's ~100 $ ("sonra").
  - **Reverse-engineer the winner (Ad Library + backlinks + Wayback year by year).** Row: B83 (choosing a line or product). The door is `dxb-rival-intel` / `dxb-research`.
    - Stands there now: B28's ad-library step; no Wayback step.
    - Relation: **method**.
    - First trial: one winning directory from k1-07 (e.g. entitysearch.us), its archive snapshots year by year, read for what changed.
    - Stops at the CEO: nothing.
  - **GoHighLevel.** Row: B83 (H7 customer desk).
    - Stands there now: our own desk (Chatwoot, the client's calendar or Cal.diy, Meta WhatsApp Business MCP, our CRM).
    - Relation: **second** (the paid twin of the self-built desk; also a price anchor for white-label resale).
    - First trial: when H7 is built, the same ten scripted requests run on our desk and on a GHL trial sub-account. Measured: seconds to first answer, a human taking a conversation over, and cost per client.
    - Stops at the CEO: the GHL account (identity) and the subscription (money out).
  - **Not taken, with the reason:**
    - Muse, Grokbot, Instinct: closed consumer agents on personal accounts (Muse US, 18+ per the earlier reader). Our own hands (B35/B30) do the same clicking. Relation none.
    - The weekly AI-tools email: identical job planned in B82/B42.
    - The weekly auto-written skills repo: a skill is a door, and a door needs his word (CLAUDE.md §2). Relation none.
    - Agents talking to agents: our Claude Code lead with subagents already does this.
    - Mercury: a bank (banking, forbidden subject); not explored. The capped-spend idea is our approval gate.
    - Agentic dropshipping: his ruling İ2, "dropshipping şimdilik hayır" (2026-11-02).
- **Income roads and where they are written:**
  - Quote-gathering agent: #26 Sonra ("no row until he names one", B83).
  - Consignment: #26 Sonra.
  - The 11 $ lead site: H1 #17.
  - The outreach machine: H5 #21, and H7 #23 as the AI-receptionist demo.
  - Agent as product (class-action finder, phone reminder): #26 Sonra.
  - The channel's 19 $ PDF and 5 $/mo membership: H3 #19.
  - Agentic dropshipping: ruled out by İ2.
  - **Not yet written:** the lead-site pricing ladder (d), the community-tag demand signal (b), the deliberate-assumption hook (c), the Wayback step (e).
- **The old verdict and reason:** partly holds.
  - "Dene" via H5 and H1 is right.
  - The two "şüpheli → soru" items are settled: dropshipping by İ2; the fake form and personal-phone hunt by "Geçmeyenler".
  - The old row names lines (H5, H1), not board rows. The owners are B84 and B83.
  - "The real income is course + 19 $ PDF + sponsor": the 19 $ PDF is not in the transcript; it is from the description, per the earlier reader.
- **Reader's first reading:** Yöntem.

---

## k1-07 (-u0JuVUdPQA) — Frey Chu on the Koerner podcast: niche directory sites built with Claude Code

- **Opened:**
  - The whole transcript: `~/.cache/link-watch/v6--u0JuVUdPQA.tr.vtt` (Turkish, 65,624 bytes), de-duplicated into `$J/rows/k1-c-src/v6--u0JuVUdPQA.txt` and read from start to end.
  - Earlier readings: `koerner-opus.md` Video 2, and `MERGE.md` #29, where the helper read the Ahrefs screen.
  - Board and records: REVENUE §D #18, B83, B84 (the SEO tools legs), B25, B05, the OpenSEO skills (`link-prospecting`, `local-seo`, `SOURCE.md`), `.planning/research/STACK.md`.
  - Live facts: `gh api repos/withastro/astro`, `gh api repos/resend/resend-node`, and the Viktor home page via `fetch.py`.
  - **Not seen:** the Ahrefs screen at 38:32–41:38 (no frames on disk; the helper's numbers in `MERGE.md` #29 were used); the video description (the 19 $ template link).
  - **Unidentified:** an idea tool named "Tido" in the translated transcript (45:57).
- **His note:** "Holding'de ciddi yani farklı gelir kaynaklarına ihtiyacımız var."
- **What is in it:**
  1. **First directory: thrift stores.** 30k monthly organic visitors at month 6, 90k at the peak; 1,200 $ of ads in the first month; 2,300–3,000 $/mo at the peak.
     - Monthly mix at the peak: 1,500–2,000 $ display ads + a **19 $ digital product**, a new-stock alert built on data he gathered himself by phoning ~100 stores.
     - ~150k $ over 4 years; 30 min of work every 4–6 months. The best offer to buy it: ~50k $ (≈3× annual revenue).
  2. **Validation** (07:21, 22:30, 44:12):
     - Google "keyword + directory". In the top 10, look for a site with traffic and low DR: "anything under DR 25–30 is beatable".
     - Check that the thing is hard to find on Google Maps. One site targets one keyword.
     - Ask whether the intent brings **repeat visits**: claw machines are one visit and out, so bad.
     - After a winner, build the **adjacent niche**. A long-tail retry when the head term is owned ("hotels" → "hotels with jacuzzi in room", 7k searches/mo).
  3. **Idea mining (45:00).** He scraped every site on Mediavine, Raptive and Ezoic: 27,000+ sites, 24 % of them directories. The biggest portfolio is 118 sites, all forums: "they find what works and build it again and again".
  4. **Revenue roads (10:23–12:45):**
     - leads, featured listings, pay per lead, display ads, digital products, subscription education;
     - a 19 $ PDF ("best elder-care facility for your parent");
     - **public-record data**: elder-care violations kept in a public database by law; surgeons' licences scraped for a rhinoplasty directory;
     - crowd-sourced data: discoverplasma.com, plasma pay;
     - a directory + CRM for 50 $/mo: verified emails of journalists or angels plus follow-up tracking;
     - a **job board that is not a job board**: SDR/BDR/AE entry jobs scraped with salary, plus the people who work at each hiring firm, a copy-paste "2 minutes of your time" message, and a CRM that tracks follow-ups (33:02).
  5. **Lessons:**
     - ~30 % of his directories fail.
     - portapottymatch had lorem ipsum on the home page and still got a 20k $ request (New Mexico State Fair). It died because he would not do the sales step: "SEO + site + sales is too much for most people".
     - A decision on investing in backlinks comes within 30, at most 60–90, days.
  6. **Links** (02:03, 23:50–31:32):
     - A competitor's backlinks are mined, and their owners are cold-emailed. ~7 % reply; most who reply accept.
     - Price by DR: 40–60 → 50 $, 60–70 → 75 $, 70+ → 100 $, with a cap. Non-profits sometimes list for free.
     - **The five-sentence email:** (1) "odd, specific question about your post <title>"; (2) a one-line personal note, written by a crawler that reads the first half of the post; (3) the offer; (4) who I am and why I built it; (5) the founder's angle ("a side project I'm growing… no work for you, I send the sentence").
     - Email set-up: a separate domain, warmed for 2 weeks.
  7. **Stack** (36:29–38:10): Claude Code, Astro, GitHub, Vercel, Supabase free tiers, Resend, Ahrefs MCP/API, DataForSEO, once Outscraper (50–150 $), Wispr Flow for dictation.
     - His prompt style: spoken, data-first ("crawl the data first").
  8. **Examples on screen (Ahrefs):** entitysearch.us, geoblackout.com, tradeschoolsnearme.co, tubstays.com.
     - Traffic per the helper's read of the screen (`MERGE.md` #29): entitysearch 42.9K at DR21, 3 months old; geoblackout 134K at DR9; tradeschools 29.1K.
     - tubstays (DR11, Kayak affiliate): the transcript only.
  9. Also in the video:
     - NSFW directories (named, not explored).
     - Sponsor: Viktor, 18:48–19:50.
     - The guest's course: Ship Your Directory.
     - The host's 19 $ 27-page directory plan (40:35).
- **What we have:**
  - Claude Code, GitHub and Supabase: identical, our own stack (`STACK.md`).
  - DataForSEO and Ahrefs: **identical, already named in B84** (DataForSEO core, first load ~50 $ his word; Ahrefs Free in the core, Ahrefs/Semrush paid "when a client pays").
  - OpenSEO skills at `~/.local/share/dxb/skills/openseo/`: `link-prospecting` ("find link prospects, discover contact paths, and draft outreach from SERPs and backlink signals"), `keyword-research`, `competitor-analysis`, `local-seo`.
  - B84 decision 15: the holding's own 25–30 sites link to clients for free.
  - B25: Kelam measured beside Handy and OpenWhispr.
  - Not found anywhere: Astro (not installed; only framework detection in `web-cupboard/teardown.cjs`), Resend, Outscraper.
  - The web office (B84) names no framework for content sites.
- **What it has that we do not:**
  - (a) A **written niche-scoring rubric** for H2: SERP low-DR-with-traffic, Maps hard to find, one keyword, repeat-visit intent, adjacent niche, long-tail retry. H2's trial says only "10 niş puanı".
  - (b) **Portfolio mining** of ad-network member lists as an idea source. Not in any record. Whether those lists are public is not verified.
  - (c) **Public-record directories**: violations and licences. H2's "özel veri" names prices, hours, Turkish-speaking staff and halal certificates, not public registers.
  - (d) The **referral-CRM job board** (directory + people at the hiring firm + message + CRM). Not in the list.
  - (e) The **five-sentence outreach email** as a prompt, with the crawler-written personal line. OpenSEO link-prospecting drafts outreach but carries no such template.
  - (f) **Sending-domain warm-up**: separate domain, 2 weeks. Not in B05 or the board.
  - (g) Astro as the static content-site framework.
- **Board:**
  - **Niche-scoring rubric + adjacent-niche + long-tail.** Row: B83 (H2, #18).
    - Stands there now: "masa başında 10 niş puanı", with no criteria written.
    - Relation: **method**.
    - Use: the rubric becomes the scoring sheet of K4's desk test. Inputs: OpenSEO keyword-research and competitor-analysis, DataForSEO, the domain-level link data from Moz and Common Crawl (B84's free road), maps.py.
    - First trial: 10 halal niches scored with the rubric (0 $, 1 day). One is checked against a known winner, entitysearch.us.
    - Stops at the CEO: nothing (DataForSEO's load is his if it is used).
  - **Public-record directories.** Row: B83 (H2).
    - Stands there now: H2's "özel veri".
    - Relation: **method**.
    - Use: add public registers (licences, inspection or violation records), refreshed weekly by the data agents.
    - First trial: pick one public register in one market and measure whether a weekly refresh is possible with scrapling.
    - Stops at the CEO: nothing. Personal data stays out (H2 already says non-personal only).
  - **Referral-CRM job board.** Row: B83 (H2).
    - Stands there now: nothing.
    - Relation: **method** (a directory variant).
    - Stops at the CEO: new work starts on his word. The contact data is personal data; under H2's own line only non-personal data is sold.
  - **Portfolio mining.** Row: B83 (H2 and H4 idea intake). Relation: **method**.
    - First trial: find whether the networks publish their member lists. This is research only.
    - Reading: Araştır.
  - **Five-sentence outreach email.** Row: B84 (decision 15, links service).
    - Stands there now: OpenSEO `link-prospecting`.
    - Relation: **method**. The template goes into that skill's outreach draft as the prompt; the "offer" sentence becomes the value exchange.
    - First trial: 20 prospects for one of the holding's own pages through link-prospecting, drafted with and without the template, read side by side. Nothing is sent.
    - Stops at the CEO: the outreach campaign (once, B84 decision 9) and a sending domain (money out). Paid links: see the conflict below.
  - **Sending-domain warm-up.** Row: B05 (outbound mail). Stands there now: nothing (B05 is frozen; K11 says it is solved before the second wave). Relation: **method**. Stops at the CEO: the domain (money out).
  - **Astro.** Row: B84, the template for H1/H2 content sites built by the office. Stands there now: nothing named.
    - Facts: `withastro/astro`, 64,030★, pushed 2026-11-18, GitHub licence field NOASSERTION, latest release tag `@astrojs/vue@7.1.6` on 2026-11-13.
    - Relation: **new**.
    - First trial: one directory page set built in Astro and in whatever the office uses. Measured: page speed (Lighthouse CI, already in B84's core) and build time.
    - Stops at the CEO: nothing.
  - **Resend.** Row: B05. Stands there now: Gmail send. Relation: **second**. Stops at the CEO: account (identity), plan (money out).
  - **Outscraper.** Row: B84 (Y9 leg). Stands there now: maps.py and Apify free plan. Relation: **second** (paid). Stops at the CEO: money out.
  - **Wispr Flow.** Row: B25. Stands there now: Kelam, Handy, OpenWhispr. Relation: **second** (paid twin). Stops at the CEO: money out.
  - **Viktor.**
    - Facts (getviktor.com, read 2026-11-18): an "AI employee" living in Slack, Teams and email, with its own cloud computer, "9,800+ tools", "No API needed", a "Monday report", and free to start.
    - It is a closed product doing what H9 sells. Rival signal only, relation none (nearest row B64/H9).
- **Income roads and where they are written:**
  - Directory + leads and featured listings: H2 #18.
  - Directory + own data + 19 $ guide: H2 #18 and H3 #19.
  - Display ads in a directory: his ruling **İ1, "dizin görüntülü reklamı hayır"**.
  - Affiliate: **İ3**, only a halal product he approves one by one.
  - Selling a directory as an asset: H2 #18.
  - Data subscription at 50 $/mo: H2 #18, non-personal data only.
  - NSFW directories: "Geçmeyenler".
  - Paid backlinks: "Geçmeyenler" (M#11).
  - **Not yet written:** (a), (b), (c), (d), (e), (f).
- **Conflict named for the lead:**
  - REVENUE §D "Geçmeyenler" lists "ücretli backlink (M#11)" as "tekrar önerilmez". `MERGE.md` line 43 shows M#11 was the referee's call: "no (risk to the whole portfolio); earned links only. **Not asked.**"
  - The rulings he gave on 2026-11-02 (K2, K9, K10, K11, İ1–İ7, İ4) do not include it.
  - The stated reason is Google's link-spam policy, an engineering risk, not one of the forbidden subjects. A paid placement marked `rel=sponsored` is within Google's rules.
  - I did not re-open it. The lead decides whether it goes to him.
- **The old verdict and reason:** holds.
  - Correct: Dene inside H2, with the pieces needing a question named.
  - Since settled: display ads (İ1), affiliate (İ3), NSFW and paid links ("Geçmeyenler").
  - The old reading missed the scoring rubric, public-record data, the job-board variant, portfolio mining and warm-up.
- **Reader's first reading:** Yöntem.

---

## k1-08 (xUZYy3hCRUM) — Kyle "Website Landlord" on the Koerner podcast: rank and rent

- **Opened:**
  - The whole transcript: `~/.cache/link-watch/v7-xUZYy3hCRUM.tr.vtt` (Turkish, 71,461 bytes), de-duplicated into `$J/rows/k1-c-src/v7-xUZYy3hCRUM.txt` and read from start to end.
  - Earlier readings: `koerner-opus.md` Video 3 and `MERGE.md` #19 and #29.
  - Board and records: REVENUE §D #17, B83, B84, B05, the inventory.
  - Searches: `gh search repos "call tracking"`; a grep of the board rows, STACK.md and the master plan for any telephony or call-tracking tool.
  - **Not seen:** the New Orleans site on screen at 39:23 (the helper read it as autoglassnola.com, `MERGE.md` #29); the thumbnail.
- **His note:** "Holding'de ciddi yani farklı gelir kaynaklarına ihtiyacımız var."
- **What is in it:**
  1. **The model.** An unbranded city × service site, ranked by local SEO. A **tracking number** forwards the calls to a partner firm for a fixed monthly rent.
     - Before a tenant exists, calls go to **voicemail** and the details are kept as proof ("Bob, I get three calls a day for exactly what you sell").
     - Overhead: ≤25 $/site/month (hosting, domain, number).
  2. **The sale** (04:51, 36:46–38:42):
     - The offer: "a week of free calls, no card, nothing to sign"; then a call to set the fixed monthly fee.
     - The script is casual and framed as **his problem**: "I'm not a junk-removal company, I don't know what to do with these calls — can I send them to you for a week?"
     - He builds the firm list from Google, Yelp and Yellow Pages into Excel and phones it. 1–3 tries per client.
     - Retention: a client who passes 6 months stays ~5 years.
     - **No contract**, by design: "if you cancel, the calls go to the guy across the street".
  3. **Pricing.**
     - Per-call and tiered pricing were tried and dropped; clients wanted a predictable bill and fought over call validity.
     - A 10 % commission works only with a contractor he fully trusts.
     - Deliberate **under-pricing for retention**: taking 600 $ where 1,000 $ is possible, so the client never questions it.
     - **Multi-city expansion of one client:** Dallas → Fort Worth → San Antonio sites, up to ~5,000 $/mo and ~800 calls.
  4. **The first sale (19:40).** A screen-recording video to a high-school friend (an injury lawyer) brought 6,000 $ wired in 20 min. Later 5,000 → 7,500 $/mo, now 1,500 $ + 300 $ per new client.
     - "Start with your network; a first yes from a friend is your case study."
  5. **Numbers.**
     - The host's intro (transcript 00:01:53): "about **104,000 $ a month**".
     - The guest: the company ~100k $/mo with partners, overhead under 5k $; his own share ~35k $/mo.
     - Growth: 10k $/mo at the end of year 1, 50–70k $ for a long time, ~100k $ in year 4–5.
     - ~20 % of cards decline monthly, so collections are daily work.
  6. **Tools.**
     - Sites: Weebly at first, then WordPress.
     - Calls: **CallRail** (or Twilio). It records each call, mails the recording and the caller's number to the client, and plays a **whisper message**: the client hears "call from Kyle's leads" on pick-up.
     - CRM: an Excel sheet and Google Sheets, no advanced CRM.
     - Research: Ahrefs for beginners; now **Mangools** with its Chrome extension.
  7. **The site.** "Ugly, simple, fast" and explicit to Google about what and where. ~50 calls/mo, ~600 $/mo for 5 years.
     - His highest-converting paid-ad page has no photo and no testimonial, only an email field (A/B tested, his claim).
  8. **SEO 80/20.** Content and backlinks in volume and quality; citations and headings the rest; same strategy since 2019; schema "is for big sites".
  9. **Niches.**
     - Epoxy floors (someone at 50k $/mo), spray foam (90k $/mo), crime-scene cleanup.
     - Koerner's own **pet and horse cremation** domain: bought for 3,400 $, unsold, leads every day. The helper's screen read in `MERGE.md` #29: animalaftercare.com, 28.6K clicks in 16 months.
  10. **Sponsor:** GoHighLevel "AI employee", 25:55–26:57.
  11. **Courses and community.** Kyle learned from a 6,500 $ course; his own is rentlocalsites.com (2,980 $ per the earlier reader); tkowners.com is the host's community.
- **What we have:**
  - B83 H1 names "call tracking and the monthly tenant report" but **no tool for it**. Searched: the board rows, STACK.md and the master plan hold no Twilio, Telnyx, CallRail or any telephony provider.
  - GitHub search for "call tracking" finds only small examples: Nexmo/node-call-tracker (37★), Beans0063/Twilio-Call-Tracking (36★, 2015), TwilioDevEd/call-tracking-django (22★). **No open-source call-tracking product.**
  - The B84 SEO core (DataForSEO, OpenSEO, Ads API, Bing, Search Console, Ahrefs Free; Ahrefs/Semrush paid when a client pays).
  - B05: collection (frozen).
  - The web office's style cupboard: house style "gösterişli, lüks, wow" by default; the plainer Precision card only on the client's or his own word (CEO 2026-11-02).
- **What it has that we do not:**
  - (a) A **call-tracking chain**: number → forward → record → transcript → whisper to the tenant → mail with recording → monthly "X calls, Y jobs" report. H1 holds the goal, not the chain.
  - (b) The **voicemail-before-tenant proof step**.
  - (c) The **sales script, framed as a problem**, plus **multi-city expansion** and **deliberate retention pricing**.
  - (d) **Daily dunning** for ~20 % declines.
  - (e) A **plain one-message lead-site template** (conversion over looks).
- **Board:**
  - **Call tracking.** Row: B83 (H1, #17).
    - Stands there now: nothing; the row names the job only.
    - Relation: **new**.
    - Use:
      - The open road: a programmable number from a carrier API (Twilio, named by Kyle; Vonage's call-tracker example exists), plus our own small forwarder (dial with recording, a whisper prompt to the tenant).
      - The transcript: from our own local ear (B12).
      - The month-end report: from our own report step.
      - The paid twin: CallRail, turnkey.
    - First trial, on the bench: one number in the construction copy forwarding to a test phone. Measured: the whisper plays, the recording is saved, the transcript is right, the monthly count matches, against a CallRail trial on the same calls.
    - Stops at the CEO: the carrier or CallRail account (identity), the number and usage (money out).
  - **Voicemail-first proof + sales script + multi-city + retention pricing.** Row: B83 (H1). Stands there now: H1's mechanism, "a free week then fixed rent". Relation: **method**; written into H1's sales flow.
    - First trial: inside K3. The script is read by Sol and by his eye before any first contact.
    - Stops at the CEO: the outreach campaign (once), and the contract. The earlier reader and Rapor 2 replace Kyle's "no contract" with a short standard contract at the gate.
  - **Plain lead-site template.** Row: B84 (the office builds H1's sites).
    - Stands there now: the house style.
    - Relation: **method**.
    - First trial: inside K3, the plain page against a house-style page on the same niche. Measured: calls and forms per visit.
    - Stops at the CEO: **the style is his word** (tarz dolabı ruling 2026-11-02: Precision opens only on the client's or his word).
  - **Daily dunning.** Row: B05. Stands there now: nothing. Relation: **method** (the finance agent's daily follow-up). Stops at the CEO: nothing beyond B05's own gate.
  - **Not taken, with the reason:**
    - Mangools: a simpler human UI on keyword data that B84's core already covers; agents gain nothing from it.
    - Weebly and WordPress: the office writes its own sites.
    - GoHighLevel: see k1-06 (B83 H7, second).
    - The rentlocalsites course: not bought.
- **Income roads and where they are written:**
  - Rank and rent at a fixed monthly rent: H1 #17.
  - Per-call fee or 10 % commission: H1 #17, the pricing option.
  - Paid community: H3 #19 (Kyle, 38:21).
  - Course selling: H3 #19 ("kanıtsız kurs satılmaz").
  - The site posing as the firm: "Geçmeyenler" (M#10). H1 carries the honest "bağımsız yönlendirme hizmeti" version.
  - **Not yet written:** (a), (b), (c), (d), (e). The multi-city upsell is a revenue lever inside H1.
- **The old verdict and reason:** partly holds.
  - Correct: Dene inside H1, with the gates named.
  - Wrong: **"'104K' transkriptte hiç geçmiyor"**. The on-disk transcript has it in the host's intro at 00:01:53: "ayda yaklaşık 104.000 dolar kazanan". It is the host's figure; the guest himself says company ~100k $ and his share ~35k $.
  - Missing from the old reading: the call-tracking gap (no tool named anywhere) and the sales script.
- **Reader's first reading:** Yöntem.

---

## Commands run

- Read `$J/BRIEF.md`.
- Listed `$J`, `$J/old`, `$J/src`, `$J/inv`, `$J/rows`.
- Grepped `$J/items.tsv` and `$J/inv/k1.tsv` for k1-06..08.
- Read `$J/old/k1-0{6,7,8}.json`, `$J/src/k1-0{6,7,8}.txt` and `$J/context.md`.
- `ls ~/.cache/link-watch/` for the three ids, then a Python VTT de-duplicator over the three `.tr.vtt` files into `$J/rows/k1-c-src/`. Each transcript was read whole with Read.
- `grep -n '104' ~/.cache/link-watch/v7-xUZYy3hCRUM.tr.vtt` → line 69, `00:01:53.920`.
- Read `2026-11-01-gelir/MERGE.md` and `readers/koerner-opus.md`.
- Grep, then Read of `REVENUE-OPPORTUNITIES.md` lines 122–296.
- Rapor 2 text grep (`rapor2.html`).
- Read `board-rows/B83.md`, B84 (lines 86–97, 148–172), `B05.md`, `B82.md`; greps in B64, B28, B25, STACK.md and the master plan.
- `ls ~/.local/share/dxb/skills/openseo`; heads of `link-prospecting`, `local-seo`, `SOURCE.md`.
- maps.py header and fields (`sed -n 1,40p`, `sed -n 105,150p`).
- `command -v` for astro, resend, twilio, callrail, mangools, outscraper, wispr, ahrefs → none found.
- `gh search repos "call tracking"`.
- `gh api repos/withastro/astro`, `repos/resend/resend-node`, `repos/withastro/astro/releases/latest`.
- `fetch.py --no-browser` on `https://www.getviktor.com/` and `https://www.gohighlevel.com/pricing`; text kept in `$J/rows/k1-c-src/web/`.

## Not read

- The frames and screens of all three videos: none on disk, and no video work was allowed. The earlier helper's screen numbers (`MERGE.md` #29) were used and are labelled as such.
- The three video descriptions.
- Muse and Instinct facts were not re-checked; they are taken from the earlier reader's press sources.
- Outscraper's and Wispr Flow's product pages were not opened.
- Minute marks in this file come from the on-disk Turkish VTT, and some differ from the earlier reader's minutes. Example: the ~20 % card declines are at 00:12:37 here and "22:51" in `koerner-opus.md`. The VTT is what I read.
