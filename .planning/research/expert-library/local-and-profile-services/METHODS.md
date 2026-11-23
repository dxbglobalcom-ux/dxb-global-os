# Six services no row owned — the method of each, from the platforms' own documentation

Researched 2026-11-23 by an Opus 5.5 helper for the lead of the expert-library job, through the research door;
the lead re-read four of its key claims in the fetched pages (bulk verification's conditions, the one appeal,
the evidence upload inside the appeal form, the doorway examples) and they hold. The numbers in brackets are
the rows of `../../watch-links/2026-11-23-seo-geo/library/service-coverage.md` — the rival agency's deliverables
that no board row owned and for which the eight expert studies hold no method. **Nothing here has been tried
by us.** A practitioner's claim is marked as one. The "Re-checked at source" table cites the helper's fetched
copies (`b1` … `b13`), which were temporary and are not kept; the URLs are in "Sources".

Not read, and said so by the helper: Facebook's help pages on category and action button; Bing Places' own
documentation; where the Gemini-based Siri and Alexa+ take their web answers from (no source says). The
research door's second-side check (ChatGPT, web search) was not run.

## 1. (26) Multi-branch / multi-location Business Profiles

**What the client receives.** Every eligible branch has one verified profile (none extra), all held in a business group. Each profile has a store code, the same brand name and core category everywhere, and correct hours and attributes. Each profile links to its own branch page. There is bulk verification where the client qualifies, API-driven change monitoring, and a monthly per-branch report.

**Method**
1. **Inventory and eligibility.** Get the full branch list from the client: legal name, address, phone, hours, staff on site, signage yes/no. Rules:
   - A branch is eligible only if it has in-person contact during stated hours and permanent signage. Virtual offices, P.O. boxes, and co-working desks without signage, staff and customers are ineligible.
   - One profile per location, never two, in one account or across several.
   - A service-area business gets one profile per office that has its own separate service area and staff.
   - Source: Guidelines, answer/3038177; Policies overview, answer/13762416.
2. **Business group.** Create a business group in Business Profile Manager. The client's domain-email account is owner; the agency is manager. Google says groups replace shared passwords, and that one group per brand is advised because "it's not possible to import a single spreadsheet across multiple business groups" (answer/6085326).
3. **Bulk spreadsheet.** Business Profile Manager → Add profile → Import profiles → download the template (answer/3370250). Field rules:
   - "Business code" (the store code) is required: unique, at most 64 characters, no special characters.
   - Name at most 100 characters.
   - Primary category should be the same across the brand.
   - Up to 9 additional categories; description at most 750 characters, with no URLs or promotions.
   - Up to 10 labels per location.
   - Latitude/longitude with 6 or more decimals, used only on first creation.
   - Trap: "If you include columns with headings but no info under them… existing info for those columns will be deleted."
4. **Chain rules.** Every location in a country uses the same name, with two exceptions: sub-brands, and locations whose real-world signage differs. Same category for the same service. The store code must not appear in the name ("The UPS Store - 2872" is listed as not acceptable). Source: 3038177.
5. **Bulk verification** (answer/4490296). All of these must hold:
   - 10 or more profiles of the same business; duplicate or suspended profiles don't count.
   - Every location the client runs is included. Google wants evidence of chain size and may ask for proof if the count differs.
   - Not a service-area business.
   - "Agencies with more than one business in one account can't bulk verify."
   - Submit via Verifications → Chain → Start.
   - Google may require video verification by an authorized representative at the location. Google can de-verify inactive accounts and revoke bulk status.
6. **Otherwise, verify each location** (answer/7107242). Google chooses the method: phone/SMS, email, live video call (in business hours, at the premises), recorded video, or postcard (code usually within 14 days, expires after 30). Do not edit name, address or category while a postcard is in transit.
   - Recorded video (answer/14271705): a live, unedited recording of at least 30 seconds made in the app, showing the street or area, the signage, and proof of management (till, back room, or for a service-area business the branded van or tools).
7. **API access** (developers…/content/prereqs, updated 2026-08-28):
   - The client must have a profile verified and active for 60+ days, a website, and a Cloud project. Apply via the GBP API contact form; quota 0 QPM means not approved, 300 QPM means approved.
   - The client applies; a third party "shouldn't request access on their client's behalf". One project per business.
   - Location fields include `storeCode` ("unique within a given account") and read-only metadata: `placeId`, `mapsUri`, `newReviewUri`, `duplicateLocation`, `hasVoiceOfMerchant`, `hasPendingEdits` (businessinformation v1 reference, updated 2026-10-30).
   - The Notifications API pushes these types through Cloud Pub/Sub: `GOOGLE_UPDATE`, `NEW_REVIEW`, `UPDATED_REVIEW`, `NEW_CUSTOMER_MEDIA`, `DUPLICATE_LOCATION`, `VOICE_OF_MERCHANT_UPDATED`. The Q&A API was "discontinued on November 3, 2025" (NotificationSetting reference, updated 2026-11-06).
   - Performance API `fetchMultiDailyMetricsTimeSeries` gives daily metrics per location (the reference example shows WEBSITE_CLICKS and CALL_CLICKS).
8. **Per-location landing pages.** Link each profile's website field to its branch page (method in item 4).
9. **Other maps platforms.**
   - Apple: Apple's guide now calls the product "Apple Business". The organisation must first be verified with Apple and a brand added. Bulk import uses a .tsv/.csv/.xlsx template carrying Brand ID per row; Apple reviews the file and returns a per-row Status report (support.apple.com/guide/business/add-multiple-locations…).
   - Bing Places: not read from Bing's own documentation.

**Must stop at a human:** client account ownership and adding us as manager; every verification step (video or live call at the premises, postcard code, phone code); the API application, which is in the client's name; Apple organisation verification.

**Rules and traps**
- Duplicate profiles, virtual or co-working addresses, keyword or location words in the name, and store code in the name all lead to suspension (3038177).
- Websites or phones that redirect are not allowed (3038177). Sterling Sky adds that a redirecting URL or a YouTube URL in the website field triggers suspensions (practitioner claim).
- An owner account that gets restricted suspends every profile it owns (13762416). So the agency must be a manager, never owner.
- Mass edits look like a hijack. Sterling Sky advises one change per day in spam-prone categories (practitioner).
- Blank columns in a spreadsheet erase existing data (3370250).

**Measurable:** from the Performance API, daily per-location metrics. From Notifications: count of Google-overwritten edits, duplicates and Voice-of-Merchant losses. Verified share of locations; verification status per location; rank grids per branch (tooling not researched).

**What an AI office can do that a human agency can't afford:**
- Subscribe to Pub/Sub for every location and revert or flag every `GOOGLE_UPDATE` within minutes, across hundreds of branches.
- Run a nightly diff of every field against the client's master data.
- Raise a duplicate alert the same day.
- Prepare per-branch video-verification shot lists.
- Run the spreadsheet against all of Google's field rules before upload.

**Not established:** Bing Places bulk rules (not read at source); the full Performance metric list (only two names seen); whether location groups have a size limit.

## 2. (27) Recovery of a suspended profile

**What the client receives:** a diagnosis of which policy, user or account caused the suspension; the fixes made; one evidence-backed appeal; status tracking; and a prevention checklist.

**Terms.** Google's own pages say "suspended or disabled" and "account restricted". They do not say soft/hard; that is practitioner language. Sterling Sky (updated 2026-09-23):
- **Soft suspension:** the listing is still live on Maps but unverified ("Claim this business" shows).
- **Hard suspension:** the listing is removed from Search and Maps.
- Separately, Sterling Sky (2024-11-26) calls "disabled" a broken link between the GBP and Maps databases, often still public. This differs from Google's usage, where "disable" also covers "business doesn't exist" (13762416). Sources disagree; do not build on one meaning.

**Method**
1. **Read the decision.** In the appeals tool (support.google.com/business/?p=manage_appeals): decision date, reason, link to the violated policy, whether it can be appealed, status (answer/4569145). Since July 2025 rejected appeals also show reasons (SER, 2025-07-16).
2. **Find the cause.**
   - Profile level: the 3038177 checklist — name stuffing, ineligible address, duplicates, category misuse, redirecting URL.
   - Account level: is an **owner** account restricted? Every profile it owns is suspended. Restrictions from other Google products, e.g. Ads, can also suspend profiles (13762416). Check each user at myaccount.google.com/restrictions. That account appeal comes first, or remove the restricted owner; Sterling Sky says removing the owner is faster (practitioner).
3. **Fix everything before appealing.** The appeal "can only be submitted once" (4569145, 13597551). Practitioners (Sterling Sky; Ben Fisher via Sterling Sky) also add real photos and video of signage, interior and branded vehicles to the listing first.
4. **Evidence.** Google lists business registration, business licence, tax certificates, and utility bills (electricity, phone, water or cable, internet). Name and address must match the profile exactly (4569145, 13597551).
   - In July 2025 Google briefly removed utility bills from the list and then restored them (SER, 2025-07-10). Lead with registration, licence and tax documents.
5. **Submit.** Since **8 July 2026** evidence is attached inside the appeal form with one multi-file button. The old 60-minute post-submit evidence window (Sterling Sky, 2024-01-05) is gone (SER, 2026-07-08; Digital Applied, 2026-07-11).
   - Bulk: managers of more than 10 profiles get a bulk-reinstatement question. Attach a spreadsheet of Business Profile IDs plus evidence; status updates only for the selected profile (4569145).
6. **Wait; do not re-appeal or edit.** Google says decisions can take "up to 5 business days" (13597551). Practitioner observations: Sterling Sky saw 3–5 weeks in H2 2022 and 5–6 weeks in early 2025; Blumenthal (Near Media, SEJ 2025-03-21) reported waits growing from about 5 days to about 5 weeks, with advice not to edit meanwhile.
7. **If denied:** a one-time "additional review" through support.google.com/business/contact/local_appeals with new evidence (4569145). The EEA has an out-of-court dispute-settlement route under the DSA (13597551). In UK/EEA, rejected edits and media are also appealable in the tool; elsewhere they go through "Contact us" (13597551 table).
8. **Never create a replacement profile.** Google: "Do not create a new Business Profile for the same business." Sterling Sky: a replacement loses reviews, history and ranking. When support says "create a new page", it means start the flow and then claim the existing listing.
9. **After reinstatement:** Sterling Sky observed rankings returning to prior positions when reinstated quickly, except when the CID changed (practitioner; one 2021 incident).

**Must stop at a human:** the client signs in to the appeals tool with the owning account; supplies registration, licence and tax documents; does any re-verification video at the premises; and makes the decision to remove owners.

**Traps:** a second appeal for the same issue; edits made during review; creating a duplicate; the agency holding owner role; Maps edits from the same account that manages profiles (Sterling Sky: flagged Maps edits restrict the account and suspend everything it owns; practitioner).

**Measurable:** suspended state per location (API Voice-of-Merchant state and notifications); calls, clicks and direction requests before and after (Performance API); days to decision.

**What an AI office can do:** watch `VOICE_OF_MERCHANT_UPDATED` across every client location and open a case within minutes; pre-build a compliance-audit table per suspension against 3038177; match documents to the profile name and address character by character before submission; run the bulk path for chains.

**Not established:**
- No deadline for filing an appeal after suspension was found in Google's docs (searched; none stated).
- Reinstatement success rates (several "studies" exist from vendors — gbpsherpa, maps-agent, gbpfixers — not read, not independent).
- The Google community guide "Required evidence…" did not render (JavaScript page).

## 3. (34) Featured snippets and voice answers

**Consistent with our AEO/GEO verdict** (`final.md`: no separate discipline; FAQ and schema showed no effect; Google calls this SEO). Nothing found contradicts it, and the documentation below supports it.

**What is still real (Nov 2026)**
- **Featured snippets cannot be marked up.** Google: "How can I mark my page as a featured snippet? You can't." Controls are opt-out only: `nosnippet`, `data-nosnippet`, `max-snippet` (Search Central, updated 2025-12-10).
- **They are shrinking.**
  - Ahrefs: on 5.53% of SERPs in June 2025, down from 15.41% in January 2025 (2025-07-22).
  - Sistrix: UK share roughly halved after AI Overviews; US 3.5% and falling (2025-03-26).
  - GSQI: Search Console does not break out featured-snippet or AI Overview data.
- **AI Overviews / AI Mode:** "no additional requirements… nor other special optimizations"; no special schema. They are reported inside the Performance report's "Web" search type (ai-features doc, updated 2025-12-10).
- **Speakable:** still **BETA**. It works only "for users in the U.S. that have Google Home devices set to English", for news content, through Google Assistant (updated 2026-09-08). Google Assistant itself is leaving:
  - Removal on Android/Wear OS started **4 Sept 2026** (SEL, 2026-08-05).
  - Speakers and displays switch to Gemini for Home on **2 Aug 2027** (The Verge, 9to5Google, 2026-11-20).
  - Speakable therefore targets a shrinking surface; do not sell it.
- **Where assistants take answers from:**
  - Gemini (on phones now): Google's systems. The AI-features doc covers Search's AI features; that the Gemini app uses the same index is UNVERIFIED.
  - Siri: Apple and Google's joint statement (2026-01-12) says the next Apple Foundation Models are "based on Google's Gemini models", powering "a more personalized Siri". Which web index Siri's answers cite is **not established**.
  - Siri local answers: Apple says Business Connect place-card data appears across "Apple Maps, Messages, Wallet, Siri" (Apple Newsroom, 2023-01-09).
  - Alexa+: Amazon names service partners (Yelp, OpenTable, Thumbtack, Tripadvisor, Uber and others) and news partners (AP, Reuters, 200+ outlets) (aboutamazon.com, 2025-02-26). Amazon's Alexa help URL returned 404. Whether Alexa still uses Bing for the open web is not established; the SEL voice-SEO article is from 2020–22, too old to use.

**The honest service:**
1. Write answer-first sections for questions the client's pages already rank for (normal SEO).
2. Watch snippet ownership with a third-party SERP tracker (Semrush "SERP Features" filter, per GSQI).
3. For voice and local, the real lever is entity data: GBP (item 1), Apple Business place cards, Yelp, and other partner listings that Alexa+ uses.
4. Sell no "voice optimisation" as its own line.

**Human stops:** Apple Business organisation verification; Yelp or partner account claims.

**Measurable:** featured-snippet ownership and prevalence through a third-party tracker; GSC Web clicks and impressions per query. Voice answers are not measurable from any first-party console (none exists in the sources read).

**What an AI office can do:** daily SERP-feature tracking for thousands of client queries; flag a lost snippet the same day; keep entity data identical across Google, Apple and partners.

**Not established:** Siri's web-answer source after iOS 27; Alexa+'s open-web source; any controlled study showing voice-answer lift.

## 4. (23) Location pages with local schema

**What the client receives:** one useful page per real branch (and per real service-area office), with LocalBusiness markup per page, linked from the store locator and from that branch's profile.

**Legitimate vs doorway.** Google's doorway examples (spam policies, updated 2026-08-28) include "multiple domain names or pages targeted at specific regions or cities that funnel users to one page" and "substantially similar pages that are closer to search results than a clearly defined, browseable hierarchy". Scaled content abuse adds "using generative AI tools… to generate many pages without adding value". So:
- A page per real branch inside a browsable locator hierarchy, with that branch's own facts, is legitimate.
- City-swap pages for towns with no branch and nothing unique are doorways.
- For service-area businesses: GBP allows only one profile per office with a separate area and staff, up to 20 service areas, roughly 2 hours' drive (answer/9157481). Pages for areas served should carry real area-specific content (jobs done there, reviews from there). This is practitioner inference; Google does not define a safe threshold.

**Method**
1. One URL per verified branch under `/locations/<city>/<branch>`.
2. Branch-unique content: NAP, hours, map and directions, branch photos and video, staff with credentials, branch reviews, local services and inventory, parking and access, events (SEL guide by Miriam Ellis, updated 2025-11-27: "Never assume Google knows the locations of your business").
3. LocalBusiness JSON-LD per page (Search Central, updated 2026-09-08):
   - Required: `name`, `address`.
   - Recommended: `geo` (5 or more decimals), `url` ("the fully-qualified URL of the specific business location"), `telephone` with country code, `openingHoursSpecification`, `department` for departments.
   - Validate with the Rich Results Test and URL Inspection.
4. Link each GBP to its page. Evidence here is weak: one 40-location test from 2018 (Local Search Forum) saw fewer profile impressions but more appointments after pointing profiles at location pages.

**Human input:** real per-branch facts, photos and staff that only the branch can give.

**Traps:**
- Self-serving review stars: `aggregateRating` and `review` are "only recommended for sites that capture reviews about other local businesses".
- Near-duplicate pages; pages for places with no presence; AI-mass-generated text.

**Measurable:** per-page indexation and GSC clicks; branch-page conversions (calls, directions); share of pages carrying unique elements.

**What an AI office can do:** generate and maintain 500+ branch pages from the master data plus branch-supplied media, refreshing hours, holiday hours and reviews daily. This is valuable only if a uniqueness check blocks thin pages before publishing.

**Not established:** any Google-stated minimum of unique content.

## 5. (87) Social profile optimisation

**What the client receives:** per platform, a name and handle, bio, category, links, buttons and contact fields written for in-platform and web search, consistent with the GBP name, address and phone.

**What each platform documents**
- **Instagram:** search matches "usernames, bios, captions, hashtags and places". Advice: fitting handle and profile name, "relevant keywords and locations in your bio", keywords in captions not comments (Mosseri, about.instagram.com, 2021-08-25). Meta's transparency page (updated 2026-06-23) still names "similarity between the words used in your search and those in the account's username or profile name". Since **10 July 2025**, public posts from professional accounts (users 18+) can appear in search engines by default; toggle at Settings → Privacy (Bestmediainfo report and Instagram's in-app notice quoted by Edward Sturm, 2025-07-01). The notice is second-hand; the Instagram help page itself was not read.
- **TikTok:** search results are influenced by "how well the content matches your search inquiry, hashtags, and the sound used" (support.tiktok.com). A website link needs "at least 1,000 followers, or… a Verified Business Account". The business account chooses a category (tiktok.com/business).
- **YouTube:** up to 14 channel profile links. The description shows in the channel header. Handle and name can each be changed twice per 14 days, and a name change removes the verification badge. URLs in Shorts descriptions and comments are not clickable (help 13748639, 2657964).
- **LinkedIn:** LinkedIn's own 2022 blog advises keywords at the start of the tagline, a keyword-optimised About section, and a complete page. The page URL can change once per 30 days (help a564298, "updated 3 weeks ago").
- **Facebook:** Meta's Facebook search transparency page (updated 2026-04-01) was read but gives no profile-field rules. The help pages on category and action button were **not read**.

**Human stops:** account access and admin roles; TikTok business verification; any identity or verification badge.

**Traps:** frequent name or handle changes (YouTube badge loss, LinkedIn 30-day limit); a profile link that redirects is a GBP risk if used as the profile's website.

**Measurable:** in-app search position for brand and category queries (manual or tool); profile visits and link clicks from each platform's insights; Google indexation of the Instagram profile and posts.

**What an AI office can do:** per-branch social profiles kept identical to GBP data; daily drift checks across five platforms for every client.

**Not established:** Facebook field rules from Meta's help centre; whether LinkedIn's "first 156 characters" claim still holds (only third-party mentions found); Instagram bio-keyword weight after the 2021 post.

## 6. (8) Free education videos as a funnel (brief)

- **The rival:** three general explainers embedded on its SEO page ("What is SEO?" and others; notes s10 lines 43–44).
- **The strongest observed format:** **live audits**. Sterling Sky/LocalU run free webinars in which business owners submit their real profile or site and it is audited on air ("Want your case reviewed live? Show up and fill out the review form", localu.org, January 2026 suspension webinar). Their pages run the same "Join us for a live audit" call to action, and the paid offer — e.g. $800 per location reinstatement, paid only on success — sits on the same site. The education video demonstrates the paid service on the viewer's own problem.
- For us that means: case-of-the-week audit videos plus a submission form that feeds our free-audit funnel. Note that the live-audit format puts real businesses' details on screen, which needs their consent.
- **Not established:** conversion data for agency education channels. The one case read is a recruitment agency (growththroughcontent.com), not SEO.

---

### Re-checked at source (grep of fetched text)
| Item | Claim | Check |
|---|---|---|
| 1 | "Agencies with more than one business in one account can't bulk verify"; not for service-area businesses | b1/03 lines 60, 64 |
| 1 | API needs a profile verified 60+ days; 300 QPM means approved | b2/05 lines 164, 180 |
| 2 | "Appeals can only be submitted once"; additional review after denial | b1/01 lines 70, 96, 118–121 |
| 2 | 60-minute window replaced by in-form upload (8 Jul 2026) | b4/01 lines 85–89 |
| 3 | Speakable BETA, US Google Home English only | b7/04 lines 393, 449 |
| 3 | Featured snippet: "You can't" mark it | b7/03 line 453 |
| 4 | Doorway "pages targeted at specific regions or cities" | b7/01 lines 449, 451 |
| 4 | `url` = specific location; `aggregateRating` only for review sites | b7/02 lines 1064, 1080 |
| 5 | Instagram "keywords and locations in your bio"; TikTok link at 1,000 followers | b11/01 line 66; b12/02 line 7 |
| 6 | LocalU live audits of suspended listings | b3/07 lines 38, 45 |

### Sources (URL · what it established · date shown)
- support.google.com/business/answer/4569145 · appeal flow, one appeal, bulk appeals over 10, additional review · no date
- …/answer/13597551 · up to 5 business days, UK/EEA vs rest-of-world table · no date
- …/answer/13762416 · owner restriction suspends all owned profiles; other-product restriction · no date
- …/answer/3038177 · eligibility, name, address, chain, service-area rules · no date
- …/answer/4490296 · bulk verification conditions · no date
- …/answer/3370250 · spreadsheet fields, store codes, blank-column deletion · no date
- …/answer/6085326 · business groups · no date
- …/answer/9157481 · 20 service areas, about 2 hours · no date
- …/answer/7107242 · verification methods, postcard timing · no date
- …/answer/14271705 · video verification rules · no date
- developers.google.com/my-business/content/prereqs and /content/locations · API eligibility · 2026-08-28
- …/reference/businessinformation/rest/v1/accounts.locations · storeCode and metadata · 2026-10-30
- …/reference/notifications/rest/v1/NotificationSetting · notification types; Q&A API ended 2025-11-03 · 2026-11-06
- developers.google.com/search/docs/essentials/spam-policies · doorway, scaled content · 2026-08-28
- …/structured-data/local-business · LocalBusiness properties · 2026-09-08
- …/appearance/featured-snippets · cannot mark up · 2025-12-10
- …/structured-data/speakable · beta, US English · 2026-09-08
- …/appearance/ai-features · no special optimisation, GSC Web type · 2025-12-10
- sterlingsky.ca/top-reasons-google-my-business-suspended-your-listing/ · soft/hard suspensions, causes, wait times · 2026-09-23
- sterlingsky.ca/new-gbp-reinstatement-appeal-process/ · 60-minute window (old) · 2024-01-05
- sterlingsky.ca/difference-between-disabled-and-suspended-gbp/ · disabled vs suspended · 2024-11-26
- seroundtable.com …41641 · in-form evidence upload · 2026-07-08
- seroundtable.com …39742 · utility bill removed, then restored · 2025-07-10
- seroundtable.com …39758 · rejection reasons shown · 2025-07-16
- searchenginejournal.com …542602 (Blumenthal) · appeal delays · 2025-03-21
- ahrefs.com/blog/how-serp-features-have-evolved-in-the-ai-era/ · featured snippets 15.41% → 5.53% · 2025-07-22
- sistrix.com …featured-snippets-dropping-in-uk · 2025-03-26
- searchengineland.com …484307 · Assistant off Android 4 Sep 2026 · 2026-08-05
- theverge.com …1038834 · Gemini for Home on 2 Aug 2027 · 2026-11-20
- blog.google joint statement Google/Apple · 2026-01-12
- aboutamazon.com Alexa+ tech · 2025-02-26
- apple.com/newsroom/2023/01 Business Connect · 2023-01-09
- support.apple.com/guide/business add-multiple-locations · no date
- searchengineland.com/guide/location-pages-seo · 2025-11-27
- localsearchforum.com thread 52721 · 2018 test
- about.instagram.com …break-down-how-instagram-search-works · 2021-08-25
- transparency.meta.com ig-search · 2026-06-23
- bestmediainfo.com and edwardsturm.com · Instagram indexing from 2025-07-10
- support.tiktok.com (recommendations; profile link)
- support.google.com/youtube 13748639, 2657964
- linkedin.com/help a564298; LinkedIn marketing blog 2022-09-07
- localu.org webinar pages, 2026

### Not established, collected
- Facebook help-centre field rules (category, action button).
- Bing Places' own documentation.
- Alexa+'s open-web answer source; Siri's web source after iOS 27.
- Any Google appeal filing deadline.
- Independent reinstatement success rates.
- The full Performance API metric list.
- Google's "required evidence" community guide (did not render).
- Conversion data for SEO education channels.
- The door's ChatGPT side-check and Claude-side WebSearch were not run (tools not available to me).
