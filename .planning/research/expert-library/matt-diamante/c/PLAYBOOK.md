# Matt Diamante (HeyTony) — playbook, analyst C: his 40 strongest carousels

**What was read, whole:** the four reader files `watch-links/2026-11-23-seo-geo/notes/matt-carousels/read-0…3.md`
— 40 posts, 313 slides, every slide (count checked against `lists/matt-carousels.tsv` and against the slide
files on disk: 40 / 313 / 313). Two slides were opened as images where the wording decided a finding
(`DaupsPsmd65` slide 6, `DbbhwTbGfx_` slide 2). Primary sources were fetched on 2026-11-23 where he gives half
or where a claim decides a skill; each is named where it is used.

**Which 40.** The list is the union of his most-commented and his most-liked carousels. It is two tails of
277 carousels, not a sample of them — every count below is read with that in mind.

**Tags.** **NEW** = in neither `../a/` nor `../b/`. **SHARPER** = the same method is in a or b, and these slides
add a missing step, number, checklist or example (what was missing is said). **CONTRADICTS** = he says
something else here, or the primary source says something else; which is right, and why. **[his]** = his
words or claims; **[added]** = completed by me from the named source; **[test]** = my judgement. Source tag:
`CODE s3` = post code, slide 3; `CODE cap` = its caption.

Of the 40 posts, about two thirds restate what a and b already hold from his reels, captions and videos;
the closing list (§11) names those in one line each. What the slides add is (1) the exact procedure the
captions only tease, (2) several platform features that a could only report and that are now checked at
the source, and (3) the carousel itself as a measured product (§10).

---

## 1. Local search when the machine does the shopping

### C1 — Google's AI phones local businesses for the customer (SHARPER)

**[his]** `DcTErNqlXq8 s2–s8` (16,079 likes, the most liked of his news posts) and its repost `DdgUnf2maYQ`: a
customer searching "plumbers near me" sees **"Have AI get prices"** under a local result; Google opens a
"Plumber Service Request" ("AI calls, so you don't need to … check prices and availability, and send you the
responses"), asks a few questions, then *makes real phone calls*. The customer gets an e-mail ("Update for
your plumber request") listing each business's price, availability, and a section **"Businesses we couldn't
reach"**. His observation from the screenshot: the businesses the e-mail put first "are not even ranking at
the top of Google Maps or the organic results" (s6). His conclusion: "If your business doesn't answer the
phone, AI can't recommend you" (s7); "If AI can't reach you, your competitor gets the lead" (s8).

**What was missing in a.** a §1.2 holds one line: "answer the phone". The slides give the flow and the
e-mail's three outcomes (answered with price · answered without price · not reached).

**[added] The half he does not give, from Google's own pages (fetched 2026-11-23):**
- AI Mode help page (support.google.com/websearch/answer/17104441): the user taps **"Check for me"**; AI Mode
  "gathers information from across the web" and **calls only "when a business has limited information
  online"**; "only the details you shared and confirmed will be provided to businesses"; call results take
  "up to 30 minutes"; English, signed-in users over 18. Categories named: appointments (haircuts, auto
  repair), home services (electricians, tree cutting, exterior cleaning), pricing, inventory, dining
  reservations, pet grooming.
- Business Profile help page (support.google.com/business/answer/16190256, now served at answer/7690269): the calls are recorded; available
  in the US except Indiana, Louisiana, Minnesota, Montana and Nebraska; **a business that shares product data
  through Merchant Center is not called about inventory**; the customer receives "an email or SMS text that
  includes your business's product details or service quote". Opt-out: Business Profile → More → Business
  Profile settings → Advanced settings → "Google automated calls and text messages" (verified profile
  required), or say "Please stop calling my business" on the call, or reply STOP.
- **[test]** So the complete method has two halves, and he teaches only the second: (1) **publish prices,
  availability and inventory where the machine reads them** (site, profile, Merchant Center) — then Google
  need not call at all; (2) for everything not published, **answer the phone, with a price**. A business
  that answered "but did not provide a price estimate" (his s6 screenshot) is listed with less than its rival.
  His "not ranking at the top" observation is one e-mail, one search — an anecdote, not a finding. And the
  opt-out setting is a trap to check: a business that switched off "Google automated calls" removes itself.

### C2 — ChatGPT business profiles: the business agent and the measures (SHARPER)

**[his]** `Dfmi5P6FSrb s2–s11` and cap, `DfreVkvGcIK s3–s9`, `DfjwAyimfnp s2–s7` (10 to 12 November 2026). a §3.3
already holds the registration steps. The slides add: the choice "How do customers usually interact with
[business]? At a physical location / Through a website" (`Dfmi5P6FSrb s5`); the DNS TXT host begins
`openai-business-profile.` (s7); phone and e-mail are optional on the form (s8); "Verify your identity with a
government-issued ID … required" (s9) — "the step most people won't do"; products "Bring your products into
the conversation … in ChatGPT's responses when they match" and a "business side panel" (s10); the dashboard
shows **Mentions** and **Website clicks** (s11), and **Brand Insights** with the **top 5 discovery topics**
(`DfreVkvGcIK s7–s8`). The announcement screen (`DfjwAyimfnp s3`) names a **business agent** that answers
customers "with context you control", fed by uploaded documents (s5).

**[added]** I found no OpenAI page in a search on 2026-11-23; the third-party guides (BrightLocal,
LocalIQ, findskill.ai, Local Falcon) agree it is a beta from 10 November 2026, that the claim is reviewed and
followed by a **Persona** identity check, that local premises can for now only claim an existing **US**
listing, that each brand and location is managed separately, and — one source — that a "mention" is counted
only when ChatGPT cites the business's website. **[test]** Unconfirmed at OpenAI; it is to be opened in the
live product before a worker relies on it (a OPEN-QUESTIONS 6 stands for this one).

### C3 — Google's Business Profile message agent (already held)

`Df4WVBwGedL s2–s7` repeats a §1.1 item 9 (EIN or personal ID, business e-mail, "a lot of business owners
will … decide it's too much work. Don't be one of them"). One addition: the setup screen shows the
**Business Welcome Message limited to 120 characters** (s4). Nothing else new.

---

## 2. Measuring where the machines cite you

### C4 — Bing's AI Performance report as a "what do the cited pages share" loop (SHARPER)

**[his]** `DU6L8dJDRfB s2–s7` ("How to get mentioned by ChatGPT (without paying a dime)"): (1) open Bing
Webmaster Tools; (2) add the site by **"Import your sites from GSC"** — no verification needed, sitemaps
imported; (3) left menu **AI Performance** — "Citation sources: Microsoft Copilot and Partners", Total
Citations, Avg. Cited Pages, **Grounding Queries**; (4) ignore the top metrics, switch "List By" to **Pages**;
(5) open the most-cited page and ask what it does that AI likes: "Clear structure? Simple language? Direct
answers? Specific examples? Helpful formatting?"; (6) "Do more of that."

**What was missing in a.** a §3.3 has one line ("Bing Webmaster Tools shows queries and pages cited by AI").
The slides give the path and the loop.

**[added]** Bing's own blog announced AI Performance as a public preview in February 2026
(blogs.bing.com/webmaster, "Introducing AI Performance in Bing Webmaster Tools Public Preview"); later
additions reported in trade press and on Bing's search blog (June 2026): a **grounding-query ↔ page mapping**,
**Intents** (informational, commercial…) and a **Topics** view. It counts citations in Copilot, Bing's AI
summaries and "select partner integrations" — **ChatGPT is not named among them** — and it counts citations, **not clicks**. Grounding queries are Bing's reformulations, not
what the person typed. **[test]** His hook ("get mentioned by ChatGPT") overstates the report's reach; the loop
under it is sound and is the only first-party citation list a site owner gets free from a search engine
today. His step 5 is a guess at causes from one page; the sound version compares the **ten** most-cited
pages with ten never-cited pages of the same type before concluding anything.

### C5 — Search Console platform properties for social accounts (SHARPER)

**[his]** `DajhYGSjSx8`, `DbbhwTbGfx_`, `DawbV2ajdnz`, `DbiJjkKFfZy` (four posts, 4,680 comments). a §3.3 has the
steps. The slides add: the screen text "Add a platform account or channel to discover how visitors find your
content on Google Search" with Instagram, TikTok, X, YouTube (`DajhYGSjSx8 s5`); the **"Your content"** report
with **Top / Trending up / Trending down** and clicks per post (`DawbV2ajdnz s7` — his own reels at 61, 44, 17,
7, 7 clicks); the YouTube property's 28-day view "Your YouTube content had 17.8K clicks … on Google Search",
split Web 13.7K / Video 3.89K / Discover 233 / Image 22 (`DbiJjkKFfZy s5`); **Top queries sorted by
Impressions** as the content plan — "the keywords at the top have the biggest demand … start creating content
around those keywords" (s6–s7; his example list is a dry cleaner's); and a Google AI Overview citing an
Instagram post as its source ("the most famous realtor with a beard in Hamilton", `DajhYGSjSx8 s7`).

**[added]** Google's blog (developers.google.com/search/blog/2026/07/…social-video-platforms and
…/platform-properties-social-video-guide) and help page (support.google.com/webmasters/answer/17148418):
each account or channel is its own property; ownership by signing in to the platform account (Instagram must
be a professional account); the data is **Google's only** (Search, Discover, News), not the platform's own.
Trade reports date it 7 July 2026, global on 29 July 2026.

**[test] CONTRADICTS on two points.** "Did Google just kill the website? You can now rank on Google without
one" (`DawbV2ajdnz s1–s2`) is false as a lesson: the property *measures* how posts already rank; it ranks
nothing. And **the repost re-dates the news**: `DajhYGSjSx8 s2` (9 July) says "On July 7th, 2026 they
announced"; `DbbhwTbGfx_ s2` (30 July, slide opened as an image) says "On July 30th, 2026 they announced" — the
same feature, the date moved to the day of the repost. The holding never re-dates a fact.

### C6 — Search Console's AI-powered configuration (CONTRADICTS)

**[his]** `DWEZA96AQpi s2–s8` ("Google just added a hidden button that makes SEO 10x easier"): Performance →
Search results → the blue button "Customize your Performance report using AI" → "Ask it to show you keywords
that actually make money … high impressions, low clicks" → click a keyword → see the page → "add the keyword
naturally a few more times."

**[added]** Google's announcement (developers.google.com/search/blog/2025/12/ai-powered-configuration, 4 Dec
2025): it **turns a plain-language request into filters, comparisons and metric choices** (query, page,
country, device, appearance, date; clicks, impressions, CTR, position) — Search results only; it **cannot
sort tables or export**; trade reports mention a daily request cap at launch.

**[test]** It cannot know which keywords "make money" — that judgement is not a filter. The reliable way is
the money regex he gives elsewhere (C7) — the AI button is a convenience for building the same filter by
sentence. And "add the keyword a few more times" is the lazy version a idea 6 already refused; the sound fix
for a high-impression, low-click query is a better title and description, or a section that answers it.

### C7 — The money regex, and the repost that breaks it (CONTRADICTS, internal)

The regex and the path are in a §6 (`DUmnsqxjV3Y`, 11 Feb). The repost `DaupsPsmd65 s6` (13 Jul; slide opened
as an image) prints it as `…|schedule|reserve|nearme|instock|available|sameday|best|…` — the three multi-word
terms written without spaces. In Search Console's RE2 syntax `\bnearme\b` never matches "near me", so a reader
who copies the repost's slide silently loses "near me", "in stock" and "same day" — three of the strongest
buying signals. The slide says "or check out the caption to grab it"; that caption has no code. **Use the
February version** (in a §6).

---

## 3. Page checklists — his own, finally visible

a OPEN-QUESTIONS 3 listed the content checklist ("CONTENT"), the one-time/recurring/per-page checklist
("TASKS") and the 30-day plan as gated and unseen. The carousels show their skeletons.

### C8 — The per-page content checklist with his numbers (SHARPER, two CONTRADICTS)

**[his]** `DWR2tEAD1iX s2–s9` ("a content checklist my team uses to rank websites") and `Dc3H35UFZHL s3–s7`:

| Item | His rule | Source | [test] |
|---|---|---|---|
| Title tag | max **60 characters**; keyword at the beginning; clear and appealing — "If no one clicks, you don't rank" | `DWR2tEAD1iX s2` | Google: no length limit, titles are truncated "to fit the device width" — 60 is a truncation heuristic, fine as a default |
| Meta description | **120–156 characters**; keyword near the start; a reason to click — "your free ad on Google" | s3 | Google: "There's no limit on how long a meta description can be"; it is often replaced by page text. Heuristic, not a rule. a had 50–160 (his extension) — **CONTRADICTS a mildly**; neither is Google's |
| Headings | one H1 with the keyword; several H2s; keyword in **2–3 H2s** | s4 | consistent with b §4.1 ("about four H2s") |
| Content | **minimum 1,000 words**; match top-ranking pages; be more helpful — "Depth wins" | s5 | **CONTRADICTS** b §4.2 and his own caption (`Dc3H35UFZHL cap`: "isn't just about writing 1,000 words"). Google: word count is not a factor. Sound version: coverage of what the winners cover, no floor |
| Internal links | link to **3–4 pages**, including **1 service/product page**; link to older posts | s6 | matches a §6 / b §5 |
| External links | **1–2 credible sites; avoid competitors** — "Shows Google you're legit" | s7 | new detail; the reason given is his theory. Sound reason: the reader can check the claim |
| Images | **3–4 images**; **WEBP** (JPEG for Squarespace); keyword in alt text | s8 | compress before upload (`Dc3H35UFZHL s6`); alt text describes the image, the keyword only "when it makes sense" — his own later wording |
| Converting links | keyword in URL, title, H1; **2+ service/product links**; a link to the **Google Business Profile** — "Traffic → leads → revenue" | s9 | the GBP link is new and cheap |
| AI giveaways | edit before publishing; check punctuation, misused words and repetitive phrases: **"Delve into", "In conclusion", "Today's digital landscape"** | `Dc3H35UFZHL s7` | **NEW** — see C9 |

### C9 — The AI-giveaway pass and the "biggest client" rule (NEW)

**[his]** `Dc3H35UFZHL s7`: "Using AI to help write isn't the problem. Publishing without editing is." Three phrase
examples above. `DehxJkQmU6W s8`: "A good rule: Would you feel comfortable sending this page to your biggest
client? If not, don't publish it yet." s9: "don't use AI just to pump out hundreds of pages hoping something
ranks. Every page should have a purpose."

**[added]** Google's page "Google Search's guidance on using generative AI content on your website"
(developers.google.com/search/docs/fundamentals/using-gen-ai-content, fetched 2026-11-23; his `DehxJkQmU6W s2`
shows the same text): generating "many pages without adding value for users may violate" the scaled-content-
abuse policy; read the Quality Rater Guidelines **4.6.5** (scaled content abuse) and **4.6.6** (little effort,
originality or added value); "It is critical to manually factcheck and review all AI-generated content";
**titles, meta descriptions, structured data and image alt text need the same review**; for e-commerce,
Merchant Center requires **IPTC metadata on AI-generated images** and AI-generated product titles and
descriptions **labelled as AI-generated**. The spam-policy text: scaled content abuse is "when many pages are
generated for the primary purpose of manipulating search rankings and not helping users."

**[test]** A phrase list is a weak detector on its own (any list goes stale and a model is told to avoid it);
it is a cheap last pass, after the evidence gate that a and b already specify. The "biggest client" question
is a good human-readable form of that gate. The two Merchant Center labelling rules are **new obligations** for
any shop the web office builds with generated images or product text.

### C10 — SEO work in three buckets (SHARPER)

**[his]** `DdGkmPUFEBQ s4–s6`. **Once:** set up Search Console; submit the sitemap; check indexing; make the site
technically sound. **Every page:** research the keyword; optimise the title; internal links; optimise images;
useful content. **Over and over:** fix broken pages; build backlinks; find new opportunities; keep improving
existing pages. b §11 named the 43-task checklist by its three marks only; these are the bucket contents.
`DWpFjAOgaSe s3–s7` gives the same as five steps (be found → works: speed, mobile, HTTPS → optimise every page →
content that solves real problems → trust: links, mentions, authority) — already b §1.

### C11 — The 30-day plan of Rank Week (SHARPER)

`DVb2N1JErkn s9`: the plan is a spreadsheet grouped **Week 1–4**, columns *task · "Working on Date" ·
"Completed"* (tasks blurred on purpose). It is the shape of a's roadmap tick-list (a idea 9), at one month.

---

## 4. What the site is "about" — the topic map

### C12 — A topic-share map from the sitemap (NEW)

**[his]** `DWK1aI_jUNo s3–s5`: whatismywebsiteabout.com, "Topic Cluster Analyzer — See what search engines think
your website is about. Visualize your topical authority and content distribution." Input: the sitemap URL
(`/sitemap.xml` or `/sitemap_index.xml`). Output: a treemap, block size = share of pages (his example: Home
Renovation 31.5 % / 127 pages, Outdoor Living 16.1 % / 65, Plumbing 8.2 %, Electrical 6.5 %, Roofing 5.5 %).

**[added]** The site (fetched 2026-11-23) says "Launching soon"; it reads the sitemap, takes **page titles and
descriptions**, and "Claude AI identifies topical relationships and categorizes content"; up to 500 pages. It
names no maker. **[test]** It does not show "what search engines think"; it shows what a model infers from
titles. That is still useful, because it is cheap and visual: set against the business's own one-sentence lane
(skill 9, `lane-and-map`) it shows at a glance that a "plumber" site is one-third renovation blog. Better
inputs exist for us: the page body, and Search Console's queries per page — the topic share that **earns
impressions** beside the topic share that is **published**.

Related, in the news post `DUZqU8SjeN1 s5`: he defines topical authority as "websites that only post about
their industry (not news websites)" — see C18 for what that post got wrong.

---

## 5. Backlinks

### C13 — Four link-page types and their search strings (SHARPER, completed)

**[his]** `DcN7G7uFVHE s4–s6`: do not search "websites that accept guest posts"; use "specific Google searches
designed to uncover sites actively looking for contributors"; the same way finds **Resource Pages, Link
Roundups, Useful Links Pages**; "replace the topic with your niche". The strings are gated (BACKLINKS).
`DWJ5WlYlXTr s3, s8` gives two strings in full (already a §1.4): `"[service] [city]" inurl:business-directory`
and `"[competitor business name]" -site:theirwebsite.com`.

**What was missing in a.** a §4.2 has guest posts (`intitle:"write for us"`) only.

**[added] The strings, mine, from the common operator set (quotes, `-` and `site:` are the dependable ones;
`inurl:` and `intitle:` work today but Google gives no guarantee of their behaviour — test each string once
before a worker relies on it):**

| Type | Strings to try (replace TOPIC, CITY) | What to check before asking |
|---|---|---|
| Guest contribution | `TOPIC intitle:"write for us"` · `TOPIC "guest post guidelines"` · `TOPIC inurl:contribute` | the site has real readers and ranks for its own topic; no fee; no keyword anchors |
| Resource page | `TOPIC inurl:resources` · `TOPIC intitle:"useful resources"` · `CITY TOPIC intitle:resources` | the page is maintained (dated, live links) |
| Link roundup | `TOPIC "weekly roundup"` · `TOPIC intitle:"link roundup"` · `TOPIC "best of the week"` | it still publishes; the editor names sources |
| Useful-links page | `TOPIC intitle:"useful links"` · `CITY intitle:"useful links"` (councils, associations, schools) | local relevance; the link is on the page, not a directory behind a fee |

**[test]** Google's link-spam policy names "links with optimized anchor text in articles, guest posts, or press
releases distributed on other sites" — so a guest contribution is clean only when it is editorial, relevant
and carries a plain anchor. Every row goes through skill 22 (`link-vet`).

### C14 — His link-finder tools show their own noise (CONTRADICTS the tool, not the method)

**[his]** `Da_6d1jDbIG s2–s5` and cap: linkseeker.io — type what you sell → "Websites actively seeking guest
contributors" → a PDF of "write for us" pages. **[added]** The site (fetched 2026-11-23) asks niche, first name,
e-mail and consent to HeyTony e-mail; results by e-mail as a PDF; "does not guarantee placement". a had it as
"not opened".

**[test]** His own screenshot is the test: for "**manicures**" the PDF's first two opportunities are a travel
article about a Tucson hotel (52perfectdays.com) and a dermatology journal (actasdermo.org) — neither is a
guest-post page in that niche; and the slides mix two searches ("manicures" 43 pages, "pedicures" 38). The
same in `DWND7WtjRqN s4` (LinkGap): "226 Opportunities Found" for an agency are agency directories
(Agency Spotter, DesignRush, Digital Agency Network) — listings, several of which are pay-to-rank. A count of
"opportunities" is not a measure; the holding's version shows each row with the check of C13 and the
follow/nofollow of the measured library (`library/backlink-sources.tsv`).

`Dcs0pjKmhFT s4–s7` is LinkGap again ("Backlink Gap Analyzer", "Analyzing 500+ backlinks per site") — a §4.2.

### C15 — Answering link-request e-mails (CONTRADICTS)

**[his]** `DdoC_-JGQF3 s2–s9` (23 Sep 2026): never ignore the e-mails asking you to link to someone; "every annoying
backlink request is actually a backlink opportunity for YOUR website"; "2 minutes per email"; "50 to 70
backlinks this way"; the reply is in a gated video. **[test]** a §4.3 has the reply from his 2025 video ("I'll
need a link from a third-party site in return") and his own reversal in November 2026 ("a link scheme wearing
a fake mustache. Delete it"). This carousel shows he was still selling the tactic eight weeks before the
reversal. Google's spam policy names "excessive link exchanges"; a three-way swap is an exchange. The later
view is right. The sound use of the same e-mails: when the requester's page is genuinely relevant, the reply
offers what the requester's readers need from us (a quote, data, a correction) — never a link in return for a
link.

### Gated with nothing on the slides

`DWPaZKlgb5P` (1,300 comments, 3 slides), `DWXIHj4AfO9` (536, "50+ backlinks for free"), `DUqPtYGDbqe` (1,721,
2 slides, "my prompt that Google loves") teach nothing on the slides; everything is behind the word. They are
evidence for §10, not methods.

---

## 6. Free tools from the big platforms, shown working

### C16 — Pomelli: URL → "Business DNA" → ads, product shoot, brand book (SHARPER)

**[his]** `Da54tyIlfki s2–s9` (12,385 comments, 12,454 likes — the strongest post in both tails) and repost
`DboSraDGWW4`: Pomelli by Google Labs → free account → enter the website → "We'll analyze your business and
generate your Business DNA" → editable social ads (three shown, each with a headline and one line) → menu
**Photoshoot**: the product placed in four studio scenes from one product image → menu **Brand Book**: logo
variants, minimum size, typography, colour palette with Hex/RGB/CMYK/HSL → menu also **Campaigns**, **Websites**.

**What was missing in a.** a §8.4 lists it as an example of machine-made repurposing, with its comment count.
The slides give the pipeline: one URL in, a brand system and an ad set out.

**[added]** Google's Pomelli pages (blog.google, support.google.com/labs/answer/16945066): launched in the US,
Canada, Australia and New Zealand (Oct 2025); Photoshoot added 19 Feb 2026 (Business DNA + Google's image
model on the user's own product photos); trade reports put it in 170+ countries by March 2026 and Europe in
April; English interface; free in beta. **[test]** "Google just killed ChatGPT and Canva" is untrue. The
pattern is what matters for us: **the business's own site is enough raw material to show it a branded
preview** — which is the "Show" station of the library's chain ("his ads made, before he is asked").

### C17-a — NotebookLM: one video → infographic, slide deck (already held)

`DTbo3RwDdNY` (29,037 likes, his most liked post in the set) and repost `DUOtSVlEs3S` = a §3.2 / §8.4. The slides
add only the Studio tile list (Audio Overview, Video Overview, Mind Map, Reports, Flashcards, Quiz, Infographic,
Slide Deck, Data Table). "It doesn't make shit up" is untrue as stated; it is grounded in the one source and
still summarises.

### C17-b — Canva Magic Layers: a flat image rebuilt as editable layers (NEW)

**[his]** `DWyvowZDwZQ s2–s5`: Canva → upload any image, "even a flat infographic" → click it → Edit → Magic
Studio → **Magic Layers** → "Canva scans the entire image. Then it rebuilds it layer by layer" → "update stats or
text without recreating the graphic."

**[added]** The same capability exists as an open model the Media Studio can run on its own GPU:
**Qwen-Image-Layered** (Alibaba Qwen, December 2025; arXiv 2512.15603; github.com/QwenLM/Qwen-Image-Layered;
Hugging Face `Qwen/Qwen-Image-Layered`) decomposes one image into a chosen number of RGBA layers and its demo
exports **PSD, PPTX and ZIP**; reported limits: still images only, shadows can leave artefacts. Licence to be
read in the repository before commercial use (not read today). **[test]** For us this is a production tool, not
a lesson: a client's old infographic, flyer or ad becomes editable without the source file — update the
numbers, translate the text, re-cut for another platform.

---

## 7. News, and how he gets it wrong

### C18 — The February 2026 "algorithm change" was a Discover-only update (CONTRADICTS)

**[his]** `DUZqU8SjeN1 s2–s11` (5,933 likes): "On February 5th, 2026 they announced a new core update"; Google
prioritises "in-depth, original content … from websites that have strong topical authority"; "KILLING
clickbait"; "people will see more content from local websites … local businesses are about to see a boost in
traffic" (shown with a Google Maps pizza pack); "these changes are coming to Google's discover feed"; and
"if you've been following my SEO advice for the last 3 years … you're already doing the right things."

**[added]** Google Search Central blog, "Google's February 2026 Discover Core Update"
(developers.google.com/search/blog/2026/02/discover-core-update), confirmed by Search Engine Land and SE
Roundtable: the first core update that targets **only Discover**; ran 5–27 February 2026; aims: more **locally
relevant content from websites based in the user's country**, less sensational content and clickbait, more
in-depth, original, timely content from sites with topic expertise.

**[test]** Three errors: it was not a Search algorithm change; "local" meant **publishers in the reader's
country**, not local businesses or the Maps pack; and nothing in it gives a plumber "a boost in traffic". The
news-then-reassurance shape ("you're already doing the right things") is the reason the error does not hurt
him. The holding's news worker reads the primary announcement first and states the scope (which surface,
which countries, which sites).

### C19 — "Google just updated its AI content rules" (SHARPER, completed in C9)

`DehxJkQmU6W s2–s9`. The method (have the AI interview you; extract experience, expertise, opinions, examples,
stories; edit, fact-check, add what is missing; "sounds like you") is a §6 / b §4.4. New: the slide quotes
Google's page and the 4.6.5 / 4.6.6 sections (C9). "Just updated" was not checked against a dated change —
the page carries no date in the fetched text.

---

## 8. His offers, as the carousels sell them

**[his]** Three of the 40 sell his own product directly. `DVb2N1JErkn` dresses the Rank Week launch as news:
"BREAKING — Revealed: The fastest way to rank on Google in 2026" / "On March 9th, 2026 something massive is
coming … it will make or break your business" — the "something" is his $10 event. Proof slides: a cropped
testimonial ("my main blog post is now ranking #1 and even got cited by Google AI") and a thank-you from a new
business "with zero experience in marketing". `DZNcWtrFY-G`: "For 1 hour per week… We meet LIVE on Zoom", three
redacted e-mails ("Geek Mug" on page 1, position 5, "lost on pages 20+ before"), "Hundreds of people message me
saying they ranked #1". `Dd3fwvVFLKZ`: a free SEO course, "No credit card required" (b §11 names it). **[test]** The
offer ladder is a §8.2. What is sharper: the **testimonial slide** — a screenshot with the key phrase
highlighted in yellow and a red arrow, the sender's surname blacked out — is his whole proof format. And
**CONTRADICTS the holding's line**: a "BREAKING" label on one's own sales event is a disguised advertisement.

---

## 9. Prompt packs (already held)

`DdWBXiRmRHx` lists the 20-prompt document's uses (competitor content gaps; transcripts into posts; service
pages; FAQs "with your real experience"; titles, metas, schema, internal links; unlinked mentions and linkable
content; one post into a carousel, a reel script and a newsletter). `Dd6EeDJGTM5` is the weekly Claude
page-two agent ("around 500 additional clicks per month") — a §6 and a idea 6, and b §6.1. Nothing new on
the slides; the prompts are gated.

---

## 10. The carousel as a product — measured on these 40

### 10.1 What the first slide promises

| Cover label | Posts | Picture |
|---|---|---|
| red pill **BREAKING** | 19 | stock "hacker" (hooded figure, skulls, red rays), a Google / ChatGPT logo on a building, or his face |
| **SEO HACK** | 8 | stock tech image or his face |
| **WTF?** | 2 | dark laptop / keyboard |
| **EXPOSED** | 1 | laptop and coffee |
| plain headline, often "… Swipe For More" | 10 | stock image, his face, or a keyboard |

Headline grammar: [big name] just [verb] [big name] ("Google Just Destroyed Canva and ChatGPT"); "Stop X —
do this instead"; "This free tool shows you …"; "Force Google to show you …". All covers carry a still image,
never a play icon.

### 10.2 How the slides are built

2 to 11 slides, median 8. Black slides, white type, one idea per slide, rarely more than 30 words; **one word
or phrase in red** or under a red brush stroke; real screenshots with a **red arrow or circle** on the one
element to click. A **re-hook** in the middle — "Here's where it gets insane…", "it gets even crazier…", "BUT
HERE'S WHERE IT GETS REALLY INTERESTING", "And it gets even better" (11 posts). A proof slide near the end
(a chart, a result screen, a testimonial). Steps are numbered in the how-to posts; the news posts walk the
feature screen by screen.

### 10.3 What the last slide asks for — and what each ask earns (measured)

Classes, from the slides and captions: **A** = the method is complete on the slides, no comment word (news,
how-to); **B** = complete on the slides, plus a word for the link or the full version; **C** = the substance is
only in the DM (slides teach nothing); **D** = his own offer. Counts from the list (script and output in
OPEN-QUESTIONS §1):

| Class | Posts | Comments sum / median | Likes sum / median | Comments per like |
|---|---|---|---|---|
| A complete, no word | 16 | 2,389 / 92 | 106,226 / 3,626 | 0.02 |
| B complete + word | 14 | 23,706 / 450 | 25,788 / 595 | 0.92 |
| C substance only by DM | 7 | 6,084 / 621 | 1,589 / 248 | 3.83 |
| D his offer | 3 | 1,092 / 266 | 489 / 181 | 2.23 |

By subject:

| Subject | Posts | Comments sum / median | Likes sum / median | Comments per like |
|---|---|---|---|---|
| free tool from a big platform | 5 | 15,484 / 478 | 60,261 / 12,454 | 0.26 |
| Search Console social properties | 4 | 4,680 / 856 | 9,699 / 1,816 | 0.48 |
| backlinks | 8 | 5,354 / 578 | 4,570 / 278 | 1.17 |
| AI prompts | 3 | 3,483 / 1,483 | 791 / 266 | 4.40 |
| his offer | 3 | 1,092 / 266 | 489 / 181 | 2.23 |
| checklists | 4 | 1,122 / 298 | 746 / 167 | 1.50 |
| platform news (Google, ChatGPT) | 8 | 1,572 / 156 | 47,874 / 4,344 | 0.03 |
| Search Console / Bing how-to | 5 | 484 / 47 | 9,662 / 2,191 | 0.05 |

### C20 — Comments measure the gate; likes follow what is given (NEW)

**[test]** Read together: the comment count rises with **how much is withheld**, not with how much is given —
3.83 comments per like when the slides teach nothing, 0.02 when they teach everything. The clearest case is
`DUqPtYGDbqe`: two slides, no method, 1,721 comments. Likes go the other way: the 16 posts that ask for no
comment word (three of them ask only for a follow) hold 106,226 of the 134,092 likes in the set (79 %). The best post in both tails, `Da54tyIlfki`, is class
B: **the whole method on the slides, the word only for a link**. Subjects split the same way: AI prompts and
backlinks (gated assets) draw comments; platform news and free tools (complete on the slides) draw likes.

Caveats, stated plainly: the 40 were *chosen* as the two tails, so part of the A-versus-C split is built into
the sample; likes are not reach, saves or sends, which the list does not carry (the slide captures show a
repost counter that the list did not record — OPEN-QUESTIONS); and on Facebook, Meta has demoted "comment
baiting" since 2017 (about.fb.com, "Fighting Engagement Bait on Facebook") — whether Instagram treats "comment
WORD" the same is not established. The finding that holds anyway: **a comment count cannot be used to judge
whether a post's content was valued**, and a gated post that teaches nothing can collect thousands.

### C21 — Reposting a winner (NEW)

Five pairs in the set are the same carousel posted twice (measured from the list):

| First | Repost | Repost earned |
|---|---|---|
| `Da54tyIlfki` 17 Jul | `DboSraDGWW4` 4 Aug | 19 % of the comments, 21 % of the likes |
| `DajhYGSjSx8` 9 Jul | `DbbhwTbGfx_` 30 Jul | 19 %, 19 % (and re-dated, C5) |
| `DTbo3RwDdNY` 13 Jan | `DUOtSVlEs3S` 1 Feb | 51 %, 43 % |
| `DcTErNqlXq8` 21 Aug | `DdgUnf2maYQ` 20 Sep | 33 %, 30 % |
| `DUmnsqxjV3Y` 11 Feb | `DaupsPsmd65` 13 Jul | 174 %, 70 % (new cover; regex broken, C7) |

A repost of a winner still reaches the top tails: in four of five pairs at a fifth to a half of the original;
the fifth, with a new cover, drew 174 % of the original's comments and 70 % of its likes. It is cheap reach —
and in two of five pairs the repost introduced an error.

### 10.4 What he gives away, and where it leads

Slides give the steps; the word gives a link — to a third-party tool (Pomelli, Search Console), to his own
free tool behind an e-mail form with consent to HeyTony mail (linkseeker.io, LinkGap), to a gated document
(checklist, prompts, operator list), or to the $10 Rank Week. a §8.3 has the funnel; the carousels confirm it
and add nothing to it except the measured split above.

---

## 11. Already held complete in a or b — not rewritten

- Pomelli, NotebookLM steps as content-engine examples — a §8.4, §3.2
- Money regex and question regex in Search Console — a §6
- Search Console social properties, sort by impressions, 48 h wait — a §3.3
- ChatGPT business hub registration steps — a §3.3
- Business Profile message agent and its identity steps — a §1.1 item 9
- Directory operator `inurl:business-directory` and competitor `-site:` — a §1.4, §4.2
- linkgap.io / Backlink Gap Analyzer and linkseeker.io as his free tools — a §4.2, §8.3
- Weekly Claude page-two agent, ~500 clicks a month — a §6, a idea 6
- Interview-first AI writing — a §6, b §4.4
- Rank Week, the $10 rung, the ladder — a §8.2
- The five-step "foundation → page → content → trust" process — b §1
- Title ≤ 60 characters, alt text, one H1 — b §4.1
- 3–5 internal links per new post — b §5
- 20-prompt document, free course, 43-task checklist named as lead magnets — b §11
- "Destroyed / killed" hooks as untrue — a §8.5
- Comment-to-DM via an automation tool — a §8.3, b §10.5
