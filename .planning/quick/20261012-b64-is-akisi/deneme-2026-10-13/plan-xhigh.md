# Work plan — Kadıköy Gülüş Diş Kliniği website

Engineering department · written 13 October 2026 · work starts Wednesday 14 October (day 1) · delivery Tuesday 3 November 2026 (day 21) · contract signed, USD 1,500

## 1. The job

A new website for a three-dentist family clinic in Kadıköy, Turkish first and English second, hosted on Vercel, on the clinic's own domain guluskadikoy.com. It exists to turn visitors into appointment requests and to be found for local dental searches without losing what the old site ranks for today. The receptionist keeps it up to date herself. It respects Turkish health-advertising rules and KVKK.

The fee sets the size of the job: one design direction with one revision round, one review round per text, recurring services paid by the clinic directly. Anything outside this plan goes to the account owner as a change request before anyone works on it. The client is reached only through the account owner; inside the team, questions for the client come to me and leave as one list a day.

## 2. Scope as we understand it

**In scope**

- **Pages, each in Turkish and English:** Home, Treatments overview, 8 treatment pages, Our Team (one page), About the Clinic, Contact. The brief's own rules also require a KVKK information notice, a cookie policy, a request-received page and a 404. That is 13 content pages and 4 supporting pages per language — 34 pages.
- **Addresses:** Turkish at the root (`/`), English under `/en/`, ASCII slugs (`/tedaviler/kanal-tedavisi` ↔ `/en/treatments/root-canal-treatment`). The language switch opens the same page in the other language.
- **Appointment request form:** name, phone, preferred day, treatment (the 8 plus "not sure"), note, and a consent checkbox. It sends a request; it does not book, show availability or promise a time, and its confirmation says the clinic will call back. Phone accepts Turkish and international formats (English-speaking visitors may have foreign numbers).
- **WhatsApp and call buttons on every page:** a fixed bar on mobile, in the header on desktop; the WhatsApp message is prefilled in the page's language.
- **Google Map on Contact,** with a "get directions" link.
- **Google reviews on Home,** in the form the clinic decides (D-3).
- **A CMS the receptionist uses alone:** every text, every photo, a notice banner (holiday closures and the like) and the short editable notes (working hours, transport, phone numbers), in both languages, with preview and publish.
- **Compliance:** KVKK information notice linked from the form, a separate explicit-consent checkbox, a cookie notice with non-essential cookies blocked until consent, no before/after images, no prices or price promises, no promised outcomes.
- **Basic SEO:** keyword map, titles and descriptions, heading structure, hreflang, sitemap, robots, canonical tags, `Dentist` structured data, 301 redirects for every old URL that has traffic or links, Search Console.
- **Hosting on Vercel.** The domain stays registered to the clinic; we change only the web records.

**Out of scope:** online booking or calendar, price list, blog, patient portal, other languages, logo or brand design, photography, advertising, managing the Google Business Profile beyond checking name, address and phone, moving the clinic's e-mail, maintenance after the post-launch watch.

**Our reading, confirmed by the client in the first request:** "notes" means the notice banner and the short notes above. The 8 treatments — our proposal: İmplant, Kanal Tedavisi, Ortodonti, Diş Beyazlatma, Zirkonyum Kaplama, Çocuk Diş Hekimliği, Diş Eti Tedavisi, Diş Taşı Temizliği.

## 3. Stack and accounts

- Next.js (App Router) on Vercel. Pages are static and regenerate when the receptionist publishes.
- A hosted headless CMS: default Sanity, fallback Storyblok. The CMS developer confirms against the current terms that the free tier covers this clinic permanently (two editors, image crop, two languages). Decided by the end of day 2.
- A transactional e-mail service (default Resend) sending from a no-reply address on guluskadikoy.com. Its SPF entry is merged into the clinic's existing SPF record, never added as a second one.
- Analytics: none at launch, or a cookieless tool only — so the only things waiting on consent are the map and, if they set cookies, the reviews.
- Accounts are opened in the clinic's name with our people as members, so handover means removing ourselves: Vercel, CMS, e-mail service, Google Cloud if used, Search Console. The build runs in our Vercel team; the project moves to the clinic's team before go-live. The code repository moves to the clinic at handover — the account owner confirms the contract says so.
- Vercel plan: the free Hobby plan is for non-commercial use, and a clinic's site is commercial, so it needs Pro — a monthly cost the contract does not mention (D-4). The CMS developer re-reads Vercel's current terms on day 1. We do not launch a commercial site on Hobby.

## 4. Decisions the client makes by day 3 (Friday 16 October)

- **D-1 Treatments and titles:** the 8 treatments; each dentist's exact title and specialty.
- **D-2 How a request reaches WhatsApp.**
  - *Option A — default, no cost, ready on day one:* the server e-mails the request to the clinic; the success screen then opens WhatsApp on the patient's phone with the request prefilled to the clinic's number, and the patient taps send. E-mail delivery is guaranteed; WhatsApp delivery depends on the patient pressing send.
  - *Option B:* the server also sends each request to the clinic's WhatsApp through the WhatsApp Business Platform. That needs a Meta Business account verified in the clinic's name, a number not in use in the WhatsApp app, an approved message template, and per-message fees paid by the clinic. Verification can outlast our 21 days, so if B is chosen we launch with A and switch when Meta approves.
  - Unofficial WhatsApp gateways are not offered: they break WhatsApp's terms and can get the clinic's number banned.
- **D-3 Google reviews.**
  - *Compliance:* Turkish rules restrict advertising by health providers, and patient testimonials on the clinic's own site can be read as advertising. The clinic decides in writing: review texts; only the star rating and count with a link to Google; or nothing. The block is switchable in the CMS, so the decision can change without code.
  - *Technical:* live reviews need the Google Places API and a Google Cloud billing account in the clinic's name, and the API returns at most five reviews, chosen by Google. Without billing: rating, count and a link to the Google profile, which the receptionist updates.
- **D-4 Recurring costs and ownership:** Vercel Pro; the e-mail service (free tier expected); Google billing if D-3 needs it; Meta fees if D-2 is B.
- **D-5 Request handling:** the e-mail address(es) and the WhatsApp number that receive requests, who answers them, and the clinic's open days (closed days cannot be picked on the form).

## 5. The pieces — who does each

Days are calendar days: day 1 = Wed 14 Oct, day 21 = Tue 3 Nov. Every piece has an author and a checker who is not the author. "Head" is me.

| # | Piece | Author | Checked by, before it moves on | Days | Waits on |
|---|---|---|---|---|---|
| P1 | Acceptance checklist: the brief as testable lines, each with its proof | QA | Head | 1–2 | brief |
| P2 | Old-site inventory and SEO baseline: every URL from a full crawl, the old sitemap, Search Console (pages, queries, clicks) and backlinks; current positions for the target queries | SEO | QA: the sources reconcile; no URL with clicks or links is missing | 1–4 | Search Console access (the crawl starts without it) |
| P3 | Keyword map and URL plan: one main query per page per language, the new URLs, the old → new map | SEO, copywriter | Head | 3–5 | P2, D-1 |
| P4 | Repository, CI, staging: scaffold, TR/EN routing, password-protected noindex previews, lint, typecheck and tests in CI | Frontend, CMS dev | QA | 1–3 | — |
| P5 | Content model: page types, fields, both languages, images, validations | CMS dev | Frontend, copywriter, head | 2–5 | P3 draft, P6 wireframes |
| P6 | Design: type, colour, components (header, contact bar, form and all its states, cookie notice, reviews, notice banner); Home, Treatments overview, Treatment template, Team, About, Contact at 360, 768 and 1280 px | Designer | Head (brief), QA (AA contrast, 44 px tap targets, every state drawn), SEO (one H1, heading order); then the client | 1–6, revision 7–8 | logo, D-1 |
| P7 | Turkish copy: every page, form and error texts, cookie notice, confirmation, 404, titles and descriptions | Copywriter | Head (brief, compliance list), SEO (keywords); then a clinic dentist (medical accuracy) | 1–7 | P3, D-1, dentist CVs |
| P8 | Legal texts: KVKK information notice (clinic as data controller, purpose, processors, transfer abroad to Vercel and the e-mail service, retention), explicit-consent text, cookie policy | Copywriter with head | QA against P1; then the clinic, and its lawyer if it has one | 3–7 | D-2, D-3 |
| P9 | English copy: adapted, not translated word for word; English keywords in titles | Copywriter | Head, SEO | 9–11 | P7 approved |
| P10 | Site build: layout, components, pages, language switch, images, speed | Frontend | QA page by page; the designer's visual check on days 12–13 | 4–12 | P5, P6 (structure from wireframes on day 4) |
| P11 | Contact features: form with browser and server validation, honeypot and rate limit; e-mail delivery; WhatsApp per D-2; call and WhatsApp buttons; map behind consent | Frontend | QA (§7) | 6–11 | D-2, D-5, P8 |
| P12 | Reviews block per D-3: cached, hides itself if the source fails, CMS switch | Frontend | QA | 8–11 | D-3, Business Profile |
| P13 | Cookie notice: necessary cookies only by default; the map loads after consent or an explicit click | Frontend | QA | 8–10 | P8 |
| P14 | SEO technical: titles, descriptions, canonical, hreflang pairs, sitemap, robots, `Dentist` JSON-LD (name, address, phone, hours, location), Open Graph; redirect rules from P3, including the old site's query-string URLs | Frontend | SEO, QA (redirect script) | 9–12 | P3 |
| P15 | Editor experience: Turkish labels and help, a receptionist role (edit and publish, no settings), TR and EN side by side and both required, upload with crop and automatic resizing, alt text required, a warning on price words (TL, ₺, fiyat, indirim, kampanya, ücretsiz, garanti), a "no before/after" note on photo fields, preview, live within one minute of publishing | CMS dev | QA; and the copywriter does the receptionist's ten tasks cold | 5–11 | P5 |
| P16 | Content load: approved TR and EN copy; the clinic's photos, selected and cropped by the designer | CMS dev, designer | Copywriter (text matches the approved version) | 10–12 | P7, P9, photos |
| P17 | Full QA pass; fixes by each author | QA | Head | 13–14 | P10–P16 |
| P18 | Final check against the brief | Head, QA | evidence goes to the account owner | 14 | P17 |
| P19 | Receptionist guide (two pages, Turkish, screenshots), a ten-minute Turkish screen recording, a live 45-minute session where she does the real tasks | CMS dev, copywriter | QA: every step works as written | 12–15 | P15 |
| P20 | Go-live runbook and cutover (§7) | Frontend, SEO | Head, QA | prepare 12–14, run 17 | DNS access |
| P21 | Post-launch watch: 404s, Search Console coverage, form deliveries; position check at +14 and +28 days | SEO, QA | Head | 17–21, then +14, +28 | go-live |
| P22 | Handover package (§8) | Head, CMS dev | QA: every item present and working | 19–21 | everything above |

## 6. Order and calendar

**Critical path:** client decisions (day 3) → keyword map → Turkish copy → dentist review (day 9) → English copy → content load (day 12) → QA (days 13–14) → client acceptance (day 15, noon) → go-live (day 17) → handover (day 21).

**The longest unknown is access to the domain's DNS.** If the registrar login is lost or held by a former agency, recovering it can take longer than the whole job. It is asked for on day 1 and must be in hand by day 12.

| Day | Date | Engineering | From the client, through the account owner |
|---|---|---|---|
| 1 | Wed 14 Oct | kickoff 09:00; request list to the account owner by 11:00; P1, P2, P4 start; outlines and wireframes | receives the request list and the photo guide |
| 2 | Thu 15 | CMS chosen; content model draft | treatment list, recipients, clinic facts, logo |
| 3 | Fri 16 | URL plan draft; legal texts started | decisions D-1 to D-5 |
| 4–5 | Sat 17 – Sun 18 | design reviewed internally; build structure starts; first four treatment texts checked | — |
| 6 | Mon 19 | design to the client; content model frozen | accesses: DNS/registrar, old hosting panel, Search Console, Business Profile; dentist CVs |
| 7 | Tue 20 | all Turkish copy and legal texts to the clinic; photos sorted | photos; design feedback |
| 8 | Wed 21 | design revised; form, buttons and map in build | design approval |
| 9 | Thu 22 | English copy starts | dentist's copy review; legal texts approved |
| 10–12 | Fri 23 – Sun 25 | build complete; content loaded; designer's visual check; DNS zone exported; old site backed up | — |
| 13 | Mon 26 | full QA pass and fixes; DNS TTL lowered to 300 s | — |
| 14 | Tue 27 | final check against the brief; staging link and evidence to the account owner by 15:00 | staging review |
| 15 | Wed 28 | receptionist training 09:30 on staging | acceptance feedback by 12:00 (half-day holiday) |
| 16 | Thu 29 | Republic Day, no client contact; feedback fixed and re-checked | — |
| 17 | Fri 30 | go-live 10:00; live test request with the receptionist | one person free 10:00–12:00 |
| 18–20 | Sat 31 – Mon 2 Nov | watch, fixes, handover package | — |
| 21 | Tue 3 Nov | handover session and sign-off | sign-off |

**When a client input is late,** the account owner chases it after 24 hours; at 48 hours I tell the account owner which date moves. Go-live can slip to Monday 2 November 10:00 and no later; past that the delivery date is at risk, and I say so on the day the input becomes late, not on day 21.

**Rhythm:** a 15-minute stand-up at 09:00; every piece on the job board with its state and its checker; a blocker reaches me within the hour; client questions leave only through me to the account owner, as one list a day at 11:00.

## 7. How the work is checked

**Every piece.** The author checks it against its lines in P1; then a named checker who is not the author checks it; the evidence (link, screenshot, test output) is attached to the piece. A rejected piece comes back with written findings and is checked again. Nothing reaches the client before it passes inside; nothing goes live before the client accepts staging.

**Compliance list,** applied by every checker to every design, text and photo: no before/after or result images; no prices, discounts, campaigns or "free"; no promised outcome ("guaranteed", "painless", "permanent", "best", "number one"); titles exactly as each dentist holds them; no recognisable patient in any photo; reviews only as decided in D-3.

**The whole — QA matrix:**

- All 34 pages: render; one H1; unique title and description; the hreflang pair resolves; the language switch reaches the twin page; no text from the other language (form errors, date picker and cookie notice included).
- A crawl confirms that every page carries the call link and the WhatsApp link with the right number and a prefilled text in the page's language, and that no internal link is broken.
- Form: every validation; unticked consent blocks sending; a Turkish and an English request reach the clinic's e-mail within one minute with every field, readable on a phone; the WhatsApp path per D-2 works on iOS and Android; with the e-mail service down, the patient is shown the phone and WhatsApp and the failure alerts us; a scripted burst is stopped; nothing is kept longer than the notice says.
- Cookies: in a fresh browser, no non-essential cookie and no map before consent; the map after consent; a refusal is remembered.
- Reviews: shown per D-3 with Google's attribution; with the source down the block hides and the page is fine; the CMS switch hides it.
- CMS — the receptionist's ten tasks: edit a treatment paragraph in both languages, replace a dentist photo, add and remove a notice, change working hours, edit a home text, add a clinic photo, preview, publish, undo a change, change the phone number. Each is live within one minute; an oversized photo is resized; a price word raises the warning.
- Redirects: a script requests every old URL from P2; each answers one 301 to its mapped page, which answers 200; no chains; no 404 for any URL with clicks or links.
- Devices: iOS Safari, Android Chrome, desktop Chrome, Safari, Firefox and Edge, at 360, 768 and 1280 px.
- Bars: Lighthouse mobile on Home, a treatment page and Contact — performance ≥ 90, accessibility ≥ 95, SEO 100; keyboard, focus, labels, contrast and alt text checked by hand to WCAG 2.1 AA.
- Structured data valid in Google's Rich Results Test; sitemap and robots reachable; staging noindex and password-protected, production neither.

**Final check against the brief (P18).** The head and QA go through the 8 requirements line by line; each line carries its evidence; a line without evidence is open, and the job is not delivered with an open line. The second half of requirement 7 — ranking pages not lost — cannot be proven on day 21. On day 21 we prove that every valued old URL redirects correctly, Search Console is verified, the sitemap is submitted and no new 404s have appeared. Positions and clicks for the baseline queries are compared with P2 at +14 and +28 days and fixed if anything drops. The account owner tells the client this on day 1.

**Go-live runbook (P20).**

1. Day 12: export the full DNS zone (A, CNAME, MX, TXT, SPF, DKIM — everything) into the job file and establish where the clinic's e-mail lives.
2. Day 13: lower the TTL of the records we will change to 300 seconds.
3. Day 17, 10:00: change only the web records (root and www) to the values Vercel shows. Nameservers unchanged, MX untouched, SPF merged.
4. Verify on production: HTTPS; the canonical host (www or not, as the old site used); both languages; the redirect script; a request from the receptionist's phone reaching e-mail and WhatsApp; the clinic's own e-mail still sending and receiving.
5. Search Console: submit the sitemap; inspect Home and the top old URLs.
6. Rollback: restore the saved web records; the old site stays untouched on its host. If the form or the clinic's e-mail fails and is not fixed within 30 minutes, we roll back.

We do not cancel the old hosting. We back up the old site (files and database) on day 12 and hand the backup over; the clinic cancels the hosting after +30 days at the earliest, and only if its e-mail does not live there.

## 8. What is delivered and how it is handed over (day 21)

1. The live site on guluskadikoy.com in Turkish and English.
2. Accounts owned by the clinic: the Vercel project, the CMS, the e-mail service, Google Cloud if used, Search Console with the clinic as owner. Our members are removed at handover, except the SEO specialist's Search Console access until the +28-day check, if the clinic agrees.
3. The receptionist's own login, the Turkish guide and the recording.
4. A Turkish handover document: where everything is, how to make the common changes, the compliance list for future edits (from handover on, the clinic is responsible for what it publishes), and whom to contact if the form stops.
5. The code repository, with instructions to run and deploy it.
6. The SEO pack: baseline, keyword map, redirect map, Search Console status.
7. The old site's backup.
8. The approved legal texts.
9. The brief traceability sheet with its evidence, for sign-off.

**Handover** is a 30-minute call arranged by the account owner, with the clinic manager and the receptionist. No password travels by e-mail or chat: the clinic accepts invitations and sets its own passwords, ownership moves while they are on the call, and they log in once in front of us.

## 9. What we need from the client, and when

Sent as one list through the account owner on day 1 by 11:00, in Turkish, ready to forward, with this photo guide: original files (not sent through WhatsApp, which compresses them), landscape, daylight, each dentist against the same background, the team together, the outside, reception and a treatment room, no recognisable patient, no before/after.

| Needed | Why | By |
|---|---|---|
| The 8 treatments; dentists' names, titles, specialties | pages, copy, URLs | day 2, Thu 15 Oct |
| Request e-mail(s), WhatsApp number, who answers, open days, address, hours, phones | form, buttons, map, structured data | day 2 |
| Logo (vector) and brand colours, if any | design | day 2 |
| Receptionist's name and e-mail | her CMS login | day 2 |
| Decisions D-1 to D-5 | §4 | day 3, Fri 16 Oct |
| DNS/registrar login, or a person who can change records; old hosting panel | redirects, backup, go-live | day 6, Mon 19 Oct (asked on day 1) |
| Search Console access, or permission to verify the domain | baseline, redirects | day 6 |
| Google Business Profile manager access, or the profile link | reviews, map, address check | day 6 |
| Dentists' short CVs (school, year, specialty, memberships) | Our Team | day 6 |
| Photos | Home, Team, About | day 7, Tue 20 Oct |
| Design feedback, then approval | build | day 7, then day 8 |
| A dentist's review of the Turkish copy; approval of the legal texts (by their lawyer, if any) | medical accuracy, KVKK | day 9, Thu 22 Oct |
| Staging feedback and acceptance | go-live | day 15, Wed 28 Oct, 12:00 |
| The receptionist for 45 minutes | training | day 15, 09:30 |
| One person at the clinic | live test at go-live | day 17, Fri 30 Oct, 10:00–12:00 |
| Sign-off | delivery | day 21, Tue 3 Nov |

## 10. Risks and what we do about each

| Risk | What we do |
|---|---|
| The clinic's e-mail runs on the shared host and breaks at the DNS change | Zone exported first; only web records change; nameservers and MX untouched; e-mail tested in and out during go-live; rollback rule; old hosting kept |
| DNS or registrar login lost, or held by a former agency | Asked on day 1; if not in hand by day 6, the account owner starts recovery with the registrar that day and I report the delivery risk |
| Vercel Hobby is not for commercial sites; Pro costs monthly | Raised on day 1 (D-4); the clinic pays directly; no launch on Hobby |
| Automatic WhatsApp needs Meta verification, fees and time | Option A by default; B only as a later switch (D-2) |
| Showing reviews may count as testimonial advertising | Written decision by the clinic (D-3); the block is switchable in the CMS |
| The Places API needs billing and gives at most five reviews | Rating-and-link fallback (D-3) |
| Rankings drop after the move | Three-source URL inventory; every valued URL mapped and tested; ranking pages keep their topic and main heading; watch at +14 and +28 days |
| Health data in the form, and its transfer abroad, under KVKK | Only the listed fields; the note's hint asks only for what the clinic needs to call back; separate explicit consent; the notice names the processors and the transfer; submissions not stored after delivery; the clinic, as data controller, approves the texts — we are not its lawyers and say so |
| Copy we write is medically wrong or over-promises | Compliance list at every check; a clinic dentist reviews every treatment page |
| Photos late, few or poor | The design works with fewer photos; the photo guide goes out on day 1; we launch with what has arrived and the receptionist adds the rest — the CMS exists for exactly this |
| Client feedback late, especially around the 28–29 October holiday | Client deadlines placed before the holiday; 24/48-hour chase; go-live no later than 2 November |
| The receptionist later publishes a price or a before/after photo | CMS warnings; the compliance list in the guide and the handover document; responsibility moves to the clinic at handover |
| She updates Turkish and forgets English | Both languages side by side and both required; the first rule in her guide |
| Form spam | Honeypot, rate limit, server validation; a challenge widget only if spam appears |
| Staging gets indexed | Password and noindex on every non-production deploy; checked in QA |
| Free-tier limits of the CMS or e-mail service change | Confirmed against current terms on days 1–2; a named fallback for each |
| Scope grows ("can we add prices, a blog…") | Change request through the account owner before any work |

## 11. Tomorrow, day 1

- **Head:** 09:00 kickoff on this plan (30 minutes). By 11:00 the request list, decisions D-1 to D-5, the photo guide and the note on requirement 7 go to the account owner, in Turkish, ready to forward. Book the designer (days 1–8 and 10–13), the copywriter (days 1–15) and the SEO specialist (days 1–21 part-time, plus +14 and +28) with their departments.
- **Frontend developer:** repository, Next.js scaffold, Turkish/English routing, CI, password-protected preview deploys.
- **CMS developer:** current Sanity, Storyblok and Vercel terms and limits; recommendation by the end of day 2; content model draft.
- **QA engineer:** acceptance checklist v1 by the end of day 2; skeletons of the redirect-check and link-crawl scripts.
- **Designer:** the old site, the clinic's logo, three reference sites; Home and Treatment wireframes by day 3.
- **Copywriter:** page outlines; the treatment page template (what it is, who it is for, the steps, duration ranges, aftercare, common questions); questions for the dentists, added to the day-1 list.
- **SEO specialist:** crawl the old site, pull its sitemap, check public positions for "Kadıköy diş kliniği", "implant Kadıköy" and the treatment queries; Search Console as soon as access arrives.
