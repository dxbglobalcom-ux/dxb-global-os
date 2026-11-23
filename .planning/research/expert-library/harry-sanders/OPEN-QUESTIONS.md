# Harry Sanders — open questions

Companion to `PLAYBOOK.md` and `FOR-THE-HOLDING.md` in this folder. Written 2026-11-23.

## 1. How the material was read (so the limits are known)

| Material | Read | By |
|---|---|---|
| 30 YouTube transcripts (`lists/harry-yt.tsv`) | All, whole | Analyst |
| 30 Instagram reel transcripts (`transcripts/harry-*.txt`; 30 on disk at the final listing) | All, whole | Analyst 25, helper 5 (four tool-stack reels and one short PR reel, returned as a digest) |
| 929 captions | Posts 2026-04-04 → 2026-11-23 (630 posts) whole by the analyst; 2018 → 2026-04-04 (298 posts) whole by a helper, returned as a digest | Analyst + helper |
| `library/backlink-sources.tsv`, `library/README.md` | README whole; table queried, not re-read row by row | Analyst |
| studiohawk.com.au / .com / .co.uk, hawkacademy.co | 56 URLs fetched by a helper, returned as a digest | Helper |

Two digests stand between the analyst and part of the material: the older captions and the websites. Facts
taken from them are in playbook §13 (second paragraph), §14 and §15. `library/service-coverage.md` was not
read.

## 2. What could not be established

| # | Open point | Why it matters | How to close it |
|---|---|---|---|
| 1 | **None of his numbers is published with a method.** The 1.2 M AI-session format study (7.5× for tools), the 1,000-site page-speed study, the 1,000-audit failure rates, the 100-store e-commerce study, every client result. The sample is described as "1,000+ businesses" in two videos and "600+" in a third. | The 7.5× figure drives idea 4 and the "one tool per site" line. | Look for a written study on studiohawk.com.au/blog or Hawk Academy with sample and definitions; otherwise treat as leads and measure on our own sites. |
| 2 | **The SOURCE framework's six letters**, the "ACE" and "Trust" frameworks, the "10-step roadmap", and the six page blueprints in full. Named in captions, delivered only by DM. | SOURCE is his strategy diagnostic — the closest thing to his office method. | The Hawk Academy skill pages "SOURCE Grounding" and "SOURC-E Auditor" are public `.md` files; read them directly. |
| 3 | **The 59 skill files themselves.** Only names, inputs and delivery were read. One plugin states an MIT licence; the rest state no licence, only "free to share". | They are the nearest existing implementation of our skill candidates — worth reading as a rival's method, then writing our own. | Download the `.md` files (public, no sign-up) and compare each with the matching candidate in FOR-THE-HOLDING §3. |
| 4 | **Three platform claims after the analyst's knowledge date**: ChatGPT business profiles (openai.com/business/businesses-in-chatgpt, "US only but we got it in AU and UK"), Bing Webmaster "Citation Share", Search Console AI Overviews/AI Mode impressions "by page and country", Google "Universal Cart", Cloudflare's three bot groups. | Free measuring instruments for the four-gauge report; a possible free listing. | Open each product's own documentation and record what exists today. |
| 5 | **Model watermarking** (he says Anthropic watermarks Claude's text and EU rules force all models to). Not verified. | Nothing in the method depends on it; it matters only if a client asks. | The vendors' own documentation. |
| 6 | **Government supplier portals outside AU.** Whether a sam.gov registration really yields a public, indexable profile that links to the firm's site; the same for the UK service; which US "six more state portals". Our table could not measure SAM.gov (client-rendered). | Idea 3's strongest claimed sources. | Fetch one real public profile per portal with a rendering browser and record the link type; read each portal's terms on who may register. |
| 7 | **His luggage brand's real name and numbers** (captions render it Caddy / Carry / "July"); the "+138 % organic, 4× ChatGPT referral revenue" result. | It is his only self-owned PR case. | The brand's site and the cited articles (Yahoo Finance, escape.com.au). |
| 8 | **How the comment → DM step is automated** and what share of commenters reach the Academy, the form, a contract. No conversion figure anywhere in the material. | Sizing the reel machine (idea 6). | Not observable from outside. Our own test will give our numbers. |
| 9 | **Agency economics**: revenue ("eight-figure", "$20m agency"), clients (250+ / 500+ / "1,000+ campaigns" / "2,000+"), awards (42 / 45 / 50+ / 60+), headcount (100+ / 120 / 150+) disagree across his own pages. | Only as a reality check on the claims. | Not needed. |
| 10 | **Currency of the pricing article.** AUD assumed for the .com.au site. | Reference prices for our own. | Read the article's own wording; compare the .com and .co.uk sites. |

## 3. What his material adds to `library/backlink-sources.tsv`

The table already cites him in 21 rows and holds buy.NSW, SAM.gov, the UK supplier register, Wikidata, ATDW,
the health directory, AHPRA, council directories, Apple, Bing Places, SourceBottle, Qwoted, Featured and a
ChatGPT row. What is not in it, found in this study:

1. **Whole source families with no row**: chambers of commerce; industry and trade associations (member
   lists); brands' where-to-buy / stockist pages; sponsor pages of clubs; Google Knowledge Panel claim;
   national core directories he names (True Local and the "12 core AU directories"); ProductReview; Trustindex.
   One row only each for find-a-dealer pages, lawyer directories and licence registers.
2. **His sheets are larger and newer than what the table drew from.** Global 124 rows, AU 58, US 63, UK 45,
   **Canada 65** (a country the table lacks), niche lists for agencies, health, hospitality, lawyers, SaaS,
   tradies; all version 2.0, re-checked 25 September 2026, public Google Sheets with no sign-up. The table was
   built from his captions, which name perhaps a tenth of this.
3. **Three columns the table lacks**: *eligibility* (the registration number or licence a source needs: ABN,
   UEI, Companies House, practitioner number); *last checked* per row (he found 13 dead or newly paid entries
   in one re-check; one US source began charging $70 a year); and *"why it matters for AI search"* — his
   sheets' own column, which separates link value from entity/record value.
4. **A tiering rule**: government register → council / local procurement → non-negotiable map and profile
   listings → core national directories → industry directories → reviews. The table's categories can carry
   this as an order of work.
5. **A selection rule**: relevance and real visitors of the *page*, never the domain score; "five good mentions
   a quarter beat a hundred cheap links". The table's `dr_claimed` column should never drive the order.
6. **A second, different library**: the digital-PR calendars (AU 64, US 62, UK 59 dated moments with pitch-by
   date and data angle) — not link sources, but the timetable for earning them.
7. **A caution the table should carry**: supplier portals are for firms that supply or intend to supply
   government; ATDW is paid in Victoria; pay-to-play awards and paid top-10 lists are skips.

Next step if wanted: import the five country sheets and six niche lists as rows, then run the table's own
measurement on them — that produces the "measured list" of idea 3.

## 4. Worth a deeper study, and why

| Source | Why |
|---|---|
| The skill files on hawkacademy.co/claude-seo-skills (59), especially Screaming Frog Analyser, Technical Audit, Content Brief, Data PR, Information Gain Finder (plugin), Quality Rater, Topical Authority Map, AI Visibility Check, Winner or Loser, Internal Linking, Website Migration, Striking Distance, Content Decay | His method in executable form; shows the prompts, scoring scales and inputs his 120 people actually use. The fastest way to check our 15 candidates for gaps. |
| The primary sources themselves: Search Quality Rater Guidelines (current edition), the remedies and liability opinions in US v. Google with the "Life of a Click" and "Q4 Search All Hands" exhibits, Mike King's and Rand Fishkin's leak analyses, patent US 11,354,342 | Our gates should quote the sources, not him. One reading produces a "what Google rewards" reference for every worker. |
| His book (title not in the material; "one idea from my book" captions give three metaphors) | May hold the full SOURCE framework and the agency's delivery model. |
| The 37 browser tools at hawkacademy.co/seo-tools | Direct rivals of idea 4's tools; see what exists before building. |
| The 60+ case studies on studiohawk.com.au | What was actually done per client, with numbers; a pattern library for B84 and a check on the video claims. |
| The remaining StudioHawk YouTube videos not in the 30 (migrations, international SEO, technical series) | Migrations are his highest-priced project line ($3,000-10,000) and the Web Studio's renewal jobs are migrations. |
| The email-gated white papers and toolkits | Not read — reading them requires a sign-up, which the brief forbids. If wanted, the CEO decides. |

## 5. Decisions for the CEO

1. **The holding's own lane sentence.** His first rule is one lane; his own agency refuses ads and social. The
   web office as scoped sells sites, e-commerce, SEO, AI search, care packages, PR and links, beside an ad
   office and a media studio. His own menu shows a wide catalogue can sit under one lane ("search") if the
   lane is clear. Recommendation: one public sentence for the web office — sites that get found and chosen —
   with ads and film presented as the holding's other houses, not as lines of the same shop.
2. **Who speaks.** His data and his own career say a named person outperforms a faceless brand; the holding
   has one human. Options: films with no presenter (teardowns, tier lists, measured reveals); the CEO as the
   named voice on a few; a disclosed synthetic presenter. An undisclosed one is excluded. Recommendation:
   start with no-presenter formats; decide on a named voice after the first asset proves demand.
3. **Which countries first** for the measured listing library and the Foundation product. He holds AU, US,
   UK, Canada. Recommendation: the holding's own country of incorporation first (it is our own case), then two
   markets he does not cover.
4. **Public prices.** He teaches that hidden prices lose AI recommendations, and hides his. Recommendation:
   publish ours as fixed units. The figures are the CEO's.
5. **Whose name and address sign pitches and listings** (journalist emails, supplier registers, review
   profiles). Identity steps stop at the CEO by rule; this decides the form of ideas 3 and 5.
6. **Government supplier registers for the holding itself.** Only if the holding really offers to supply a
   public buyer. A yes or no.
7. **Subscriptions he uses that we have not decided**: a comment-to-DM tool, a journalist database (Muck
   Rack; free route is byline search plus hunter.io), an AI-mention tracker (Peec; he says not before you are
   mentioned). Recommendation: none now; the free route is tested first.
