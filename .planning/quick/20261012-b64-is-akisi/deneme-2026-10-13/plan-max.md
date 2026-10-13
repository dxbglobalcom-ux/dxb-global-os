# Work Plan — Kadıköy Gülüş Diş Kliniği website

| | |
|---|---|
| Job | New bilingual website, appointment request form, CMS the receptionist edits herself, compliant content, SEO-safe migration, Vercel hosting |
| Contract | USD 1,500, signed |
| Start | Wed 14 Oct 2026 = Day 1 (D1) |
| Delivery | Tue 3 Nov 2026 = Day 21 (D21) |
| Plan owner | Head of Engineering |
| Client channel | Only through the account owner (Sales). Nobody on the team contacts the clinic directly. |

Day numbers are calendar days. Our team works every day; the clinic answers on business days. 28 Oct afternoon (arife) and 29 Oct (Republic Day) are public holidays in Turkey, so no client step falls on them. Every piece has an author and a different checker; a piece moves on only after its checker passes it.

## 1. Scope as we understand it

### 1.1 What we build
1. **Website in Turkish and English.** Turkish is the default at the root, English under `/en/`. Per language: Home, Treatments overview, 8 treatment pages, Our Team, About the Clinic, Contact, and the three legal pages item 6 requires (KVKK Information Notice, Explicit Consent text, Cookie Policy): 16 pages per language, 32 in all, plus a 404 page.
2. **Appointment request form:** name, phone, preferred day, treatment, note, consent. Each request reaches the clinic on WhatsApp and by e-mail. It is a request only: no calendar, no booking, no payment. Preferred day: future dates only, closed days (from the CMS opening hours) cannot be picked. Treatment: the 8 treatments plus "Diğer / Emin değilim". Phone: Turkish and international numbers.
3. **WhatsApp and click-to-call on every page:** sticky bar on mobile; on desktop the call button also shows the number, because a desktop cannot dial. Google Maps on Contact.
4. **Google reviews on Home:** overall rating, number of reviews and the reviews Google returns, unedited, with attribution and a link to all reviews on Google.
5. **CMS for the receptionist:** she changes texts, notes and photos in both languages and publishes herself; the site shows the change within a minute. We read "notes" as short notices (an announcement bar with start and end dates, e.g. holiday closures, and opening-hours notes) plus any text block on any page.
6. **Compliance by design:** consent text on the form, cookie notice, no before/after photos, no price promises, and the rules in §3.
7. **Basic SEO and a safe migration:** keyword map, titles and metas, hreflang, sitemap, structured data, and a permanent redirect for every old URL that ranks or is linked.
8. **Hosting on Vercel.** The domain stays registered to the clinic; only the website records change.

### 1.2 Assumptions (the account owner confirms them against the contract on D1)
- **A1** The Treatments overview and the legal pages belong to the brief (navigation and item 6 need them); they are not extras.
- **A2** We write all copy in both languages. A dentist of the clinic confirms the medical accuracy of the Turkish copy. The clinic's own legal advisor approves the legal texts: we draft them, we do not give legal advice.
- **A3** One client feedback round on design (D6–D8) and one on the staging site (D13–D15). Anything later, or outside 1.1, is a change request.
- **A4** The form relays requests; we store no request content anywhere.
- **A5** Ownership. Accounts that need the clinic's identity or card (Vercel team, Google Cloud, Meta/WhatsApp, Resend, Search Console) are opened in the clinic's name with an e-mail address the clinic controls; we are invited as members; the clinic enters its own card. The Vercel project, the Sanity project and the code repository are built in our team and transferred to the clinic (Vercel on D17, the rest at handover). Running costs are the clinic's (§9.3).
- **A6** Old texts are not migrated; old URLs are redirected to the new pages.
- **A7** After delivery: 30 days of bug fixes and search monitoring. If the contract says otherwise, the contract wins.

### 1.3 Not in scope (logged as a change request if asked)
Online booking or calendar, prices or campaigns, blog, patient accounts, ad campaigns, cookie-based analytics, more languages, photography, logo design. The clinic's own KVKK duties (VERBİS registration, processor agreements, internal policies) stay the clinic's; we point them out in writing, we do not perform them.

## 2. Technical decisions (locked on D2)

| Area | Decision | Why / fallback |
|---|---|---|
| Framework | Next.js (App Router, TypeScript); pages statically generated and refreshed on CMS publish | fast on phones; no server to patch |
| Hosting | Vercel **Pro** | Hobby is for non-commercial use only and a clinic is commercial. Built in our Vercel team, project transferred to the clinic's team on D17 |
| CMS | Sanity (hosted), Studio at `/studio` (noindex) | no database or server for the clinic to run; image crop and resizing built in; live preview; free plan expected to suffice. Every label, help text and menu we define is Turkish. **Trigger:** if on D2 the CMS developer finds TR/EN side-by-side editing, read-only URLs or preview cannot be done, we switch to Payload CMS that day; no switch after D2 |
| URLs | TR at root (`/tedaviler/implant`, `/ekibimiz`, `/hakkimizda`, `/iletisim`), EN under `/en/` (`/en/treatments/dental-implants` …); final slugs from the keyword map on D3 | slugs are read-only in the CMS, so a title edit never breaks a URL. Canonical host = the one the old site uses today (www or bare domain); the other redirects to it |
| Form backend | Next.js route handler in the Frankfurt region; server-side validation; e-mail via Resend from a verified sending subdomain of guluskadikoy.com; WhatsApp via the WhatsApp Business Platform (Cloud API) with an approved utility template; both channels in parallel | the visitor sees success if at least one channel delivered; if both fail, an error with the call and WhatsApp buttons. Delivery status logged without personal data; a failed channel alerts our support inbox |
| WhatsApp sender | a number registered on the Cloud API in the clinic's Meta Business account: the clinic landline if it is not on WhatsApp (verified by voice call), otherwise a new SIM in the clinic's name | the clinic's own WhatsApp number stays on its phone untouched and only receives |
| Notification | always Turkish, site language marked, date written out ("Pazartesi, 2 Kasım 2026"), phone in tappable international format | the receptionist reads it at a glance and knows when to answer in English |
| Reviews | Google Places API, called server-side with the clinic's key; no third-party widget | no cookies, no extra script. FE confirms on D3 what caching the Google Maps Platform terms allow and sets the refresh to match. On/off switch in the CMS (R6) |
| Map | the Google Maps embed loads only after cookie consent or a click on "Haritayı göster"; before that, a designed placeholder with the address and an "Open in Google Maps" link | a plain link sets no cookies |
| Cookies | strictly necessary cookies plus the consent-gated map; banner with Accept and Reject of equal weight | no analytics in scope |
| Fonts | self-hosted, full Turkish glyphs (ç ğ ı İ ö ş ü) | no request to Google from the visitor's browser |
| Spam | honeypot field, minimum fill time, rate limit at the Vercel firewall | captcha only if spam appears |

## 3. Compliance rules sheet (I issue it on D1; it governs every word, photo and component)

**Health advertising** (Ministry of Health rules for health institutions and the dental profession's ethics rules; the clinic's advisor has the last word):
- No before/after photos. No photos of patients unless the clinic holds that person's written consent.
- No prices, discounts, campaigns, instalments or "free examination" offers.
- No superlatives or promises: "en iyi", "1 numara", "garantili", "%100", "ağrısız" or "kalıcı" as a promise, success rates.
- Dentist titles exactly as registered (Dt., Uzm. Dt., Dr. Dt.). "Uzman" only for a recognised dental specialty the dentist holds; no "implant uzmanı" style labels.
- The facility name exactly as on the clinic's licence (ruhsat); the clinic tells us what the footer must carry (e.g. the responsible dentist).
- Treatment pages explain, they do not promise; each closes with "Tedavi planınız muayene sonrasında hekiminiz tarafından belirlenir." and its English equivalent.
- Stock images never pose as the clinic, its team or its patients.

**KVKK:**
- Only the five fields plus consent. The note field asks visitors not to write detailed health information.
- The Information Notice is a link to read, not a box to tick. Explicit consent is a separate, unticked checkbox. Whether consent is required to send, and the final wording, are the legal advisor's decision.
- The texts name every recipient of the data and its country: Vercel, Resend, Meta (WhatsApp), Google (map, reviews), Sanity (content only, never form data). Data leaves Turkey and transfers abroad have their own KVKK rules, so the advisor must see this list.
- No third-party request before consent.
- Staging is password-protected and noindexed; test requests use invented data only.

The same sheet becomes warnings inside the CMS (P8) and part of the receptionist's training (P14).

## 4. The team

| Who | Owns | Busy |
|---|---|---|
| Head of Engineering (me) | scope lock, technical decisions, rules sheet, the daily question list to the account owner, merge approval, final brief check sign-off, launch lead | D1–D21 |
| Frontend developer (FE) | site build, languages, all UI, technical SEO, redirects, reviews, map and cookie consent, speed, accessibility | D2–D21 |
| CMS developer (CMS) | content model, Studio, preview and publish, CMS warnings, form backend with e-mail and WhatsApp, account setup, content import, editor guide, training | D1–D21 |
| QA engineer (QA) | test plan, checks on every piece, two full passes, final brief check, launch smoke test | D2–D21 |
| Designer, borrowed from Design studio | design system, templates and states, visual review of the build | D2–D8 full, D11–D17 part |
| Copywriter TR/EN, borrowed from Content | all copy, legal drafts, WhatsApp template text, proofreading on staging | D2–D15 |
| SEO specialist, borrowed from Marketing | old-site audit, keyword map, titles and metas, redirect map, EN parity check, launch, 30-day watch | D1–D4, D9–D12, D20–D21, then light |

I book the three borrowed people with their department heads on D1, with these days in the request.

## 5. The pieces, their order and dependencies

| # | Piece | Author | Checker | Needs | Due |
|---|---|---|---|---|---|
| P1 | Scope lock; request list A to the account owner | me | account owner, against the contract | — | D1 |
| P2 | Old-site audit: crawl every URL, full archive copy of the old site, Search Console export (if none exists, we verify the domain on D2 so data starts collecting), rankings and backlinks, DNS and e-mail record inventory | SEO (CMS does archive and DNS) | QA: every URL found by crawl, Search Console and backlink data is in the inventory | old site online | D3 |
| P3 | Keyword map and site structure: pages, TR/EN slugs, navigation, title, meta, H1 and one primary keyword per page | SEO | me + FE (routing) + copywriter | P2 | D3 |
| P4 | Content model: the fields of each page type; copy is written straight into this structure | CMS | designer + copywriter | page list | D2 |
| P5 | Design: system and templates for every page type and state (form states, sticky contact bar, announcement bar, reviews, team card without photo, cookie banner, map placeholder), mobile first | designer | me + FE (buildable) + QA (contrast, tap targets, focus) + rules sheet; then the client | P3, P4 | internal D5; client D6 → D8 |
| P6 | Turkish copy: pilot page (İmplant) D3; batch 1 (Home, About, Contact, Team, treatments 1–4) D7; batch 2 (treatments 5–8, Treatments overview, form texts) D9 | copywriter | SEO → QA (rules sheet) → clinic dentist | P3, P4, list A | D3 / D7 / D9 |
| P7 | Legal texts, written from the data-flow sheet; TR to the advisor, EN after approval | copywriter | me (matches the real data flows) → clinic legal advisor | data-flow sheet (P9, D5); controller details | TR out D9, back D13; EN D14 |
| P8 | CMS: schemas; TR/EN side by side; Turkish labels and help; read-only slugs; alt text required in both languages; announcement bar with dates; opening hours; reviews switch; warnings on currency signs, "TL", "fiyat", "indirim", "garanti", "en iyi", "%100" …; publishing blocked while a required EN field is empty; preview; publish → site updated | CMS | FE (code review) + QA | P4 | D9 |
| P9 | Form backend: Resend domain; Meta account, number and template; notification format; failure handling; rate limit; the data-flow sheet | CMS | FE (code review) + QA (end to end) | Meta and DNS access | data-flow sheet D5; e-mail D6; WhatsApp D11 |
| P10 | Frontend: routing and languages; templates; language switcher landing on the same page in the other language; contact bar; form UI; reviews; map with consent; cookie banner; metadata, hreflang, sitemap, robots, structured data (Dentist); 404 | FE | CMS (code review) + QA on every preview + designer (visual review) | P3; P5 for visuals (unstyled skeleton from D3); P8 | D11 |
| P11 | Redirect map and implementation | SEO maps, FE builds | QA redirect test | P2, P3 | map D10; on staging D11 |
| P12 | English copy, adapted from the approved Turkish | copywriter | SEO (EN keywords, same meaning as TR) + QA (rules sheet) | the TR batch approved | batch 1 D10; batch 2 D14 |
| P13 | Content import: approved copy and photos into the CMS (script from the structured copy docs), crops, alt texts | CMS | copywriter proofreads on staging; QA checks TR/EN parity | P6, P8, P12, photos | TR D13; EN D14 |
| P14 | Editor guide (Turkish PDF), five screen videos of at most 3 minutes, training session | CMS | QA follows the guide cold; every step must work | P8, P13 | guide D13; training D14 |
| P15 | Integration test and final brief check | QA | me | all | pass 1 D12; pass 2 D18 |
| P16 | Launch | me + FE + SEO | QA smoke test | P15 green; client OK | D20 |
| P17 | Handover and acceptance | me + CMS | account owner obtains the client's written acceptance | P16 | D21 |

**Critical path:** request list A answered (D3) → keyword map (D3) → Turkish copy and the dentist's review (D7/D9 → D9/D13) → content import (D13–D14) → client staging review (D13–D15) → fixes (D15–D17) → final check (D18) → cutover (D20) → handover (D21).
**Long-lead items started on D1:** the WhatsApp number and template (Meta review), and DNS access (needed for the e-mail domain on D5 and for cutover on D20).

### 5.1 Calendar

| Day | Date | Team | Clinic (through the account owner) |
|---|---|---|---|
| D1 | Wed 14 Oct | kickoff; borrowed staff booked; repo, Vercel and Sanity projects; old site crawled and archived; DNS inventory; rules sheet; test plan skeleton | 30-min kickoff call (account owner + me); request list A; photo guide |
| D2 | Thu 15 Oct | content model; CMS check, decision locked; design starts; pilot copy; FE skeleton with both languages | Meta account and DNS access due |
| D3 | Fri 16 Oct | keyword map, structure and slugs final; URL inventory complete; pilot page checked | rest of list A due; pilot page to the dentist |
| D4 | Sat 17 Oct | templates; unstyled pages on real routes; schemas; form API; WhatsApp template text; redirect map draft | — |
| D5 | Sun 18 Oct | design internal check; data-flow sheet; WhatsApp template submitted to Meta | — |
| D6 | Mon 19 Oct | e-mail channel working on a preview | design sent (Home + Treatment, mobile and desktop), feedback due D8; pilot feedback due |
| D7 | Tue 20 Oct | batch 1 checked by SEO and QA | photos due; batch 1 to the dentist (due D9) |
| D8 | Wed 21 Oct | design finalised; FE applies it | design feedback due |
| D9 | Thu 22 Oct | CMS complete; EN batch 1 starts | batch 2 to the dentist, legal drafts to the advisor (both due D13) |
| D10 | Fri 23 Oct | redirect map final; EN batch 1 done | — |
| D11 | Sat 24 Oct | frontend feature-complete; redirects and WhatsApp working on staging | — |
| D12 | Sun 25 Oct | QA full pass 1; fixes | — |
| D13 | Mon 26 Oct | batch 2 and legal corrections; import; staging opened to the client at day end | staging review, due D15 12:00 |
| D14 | Tue 27 Oct | EN batch 2 and legal EN; device, speed and accessibility tests | receptionist training, 60 min |
| D15 | Wed 28 Oct | feedback sorted into in-scope fixes and change requests; WhatsApp go/fallback decision | staging feedback due 12:00 (holiday from 13:00) |
| D16 | Thu 29 Oct | fixes (public holiday, no client contact) | — |
| D17 | Fri 30 Oct | fixes done; DNS TTL lowered to 300 s; project transferred to the clinic's Vercel team, production build ready | confirm cutover Mon 2 Nov 09:30 and a DNS person on hand |
| D18 | Sat 31 Oct | QA full pass 2; final brief check (§7); launch dry run | — |
| D19 | Sun 1 Nov | release freeze; go/no-go on the evidence | — |
| D20 | Mon 2 Nov | 09:30 cutover; production smoke test; sitemap to Search Console | receptionist confirms a real test request arrived |
| D21 | Tue 3 Nov | post-launch checks; handover | handover meeting (45 min); written acceptance |

## 6. How each piece is checked

**Rules for every piece.** The author never checks their own work. The checker writes "passed" or a list of defects in the tracker; defects go back to the author; the piece moves on only on "passed".
- **Code:** every change is a pull request with its own Vercel preview. The other developer reviews the code, QA tests the preview, I approve the merge. The main branch always deploys to staging.
- **Copy:** SEO (keywords, title, meta, internal links) → QA with the rules sheet → the clinic's dentist (Turkish, medical accuracy). English: SEO checks it against the approved Turkish for meaning and keywords, QA against the rules sheet.
- **Design:** me, FE and QA before the client sees it.

**What "passed" means:**

| Piece | Passed when |
|---|---|
| P2 audit | every URL from crawl, Search Console and backlink data is listed with status, traffic and links; the old site is archived in full |
| P3 structure | every page has TR and EN slug, title, meta, H1 and one primary keyword; no two pages compete for the same keyword |
| P5 design | every template and state exists for mobile and desktop; contrast meets WCAG AA; tap targets at least 44 px; nothing against the rules sheet |
| P6 / P12 copy | rules sheet clean in both languages; keywords read naturally; dentist sign-off on TR; EN says what TR says |
| P7 legal | every flow in the data-flow sheet appears in the texts; the advisor approves in writing |
| P8 CMS | QA completes the ten editor tasks below without help; every publish is live within 60 s; slugs cannot be edited; the test phrases trigger the warnings |
| P9 form | 20 test requests (TR and EN, valid and invalid, long note, Turkish characters, foreign number): every valid one arrives on WhatsApp and by e-mail within 60 s in the agreed format; invalid input refused with a clear message; with one channel off, the other still delivers and the alert fires; with both off, the visitor sees the error and the buttons; bot submissions blocked |
| P10 frontend | the designer passes the visual review; Lighthouse mobile Performance ≥ 90 and Accessibility, Best Practices, SEO ≥ 95 on Home, one Treatment page and Contact; no serious axe findings; usable by keyboard alone; Turkish capitals correct ("DİŞ", not "DIŞ", via the page's language attribute); no third-party request before consent (browser network panel); both buttons on every page in both languages |
| P11 redirects | a script requests every URL in the inventory: one permanent redirect, landing on the mapped page with status 200; no chains, loops or 404s |
| P13 content | no placeholder text anywhere; every TR page has its EN pair; every image has alt text in both languages; photos approved |

**The ten editor tasks** (QA in P8, the receptionist in training): change the opening hours; switch on a holiday notice with dates, in both languages; replace and crop a dentist's photo; edit a paragraph on a treatment page; add a team member; change the phone number shown on the site; switch the reviews block off and on; preview a change before publishing; undo a published mistake from the history; type a price and see the warning.

**Devices:** iPhone Safari (current and previous iOS), Android Chrome, Samsung Internet, desktop Chrome, Safari, Edge, Firefox. Call and WhatsApp links are tested on real phones.

## 7. Final check against the brief

QA runs it on staging on D18; rows marked ▲ run again on production on D20. I sign only when every row has its evidence attached (screenshots, script output, reports). A red row means no-go: it is fixed, or the account owner gets the client's written agreement to a dated exception.

| Brief item | Evidence | Who |
|---|---|---|
| 1 Pages TR/EN | crawl: all 32 pages answer 200; every language switch lands on its pair ▲ | QA |
| 2 Form | a real request arrives on WhatsApp and by e-mail; the receptionist confirms on production ▲ | QA + receptionist |
| 3 Buttons and map | both buttons on every page (crawl plus three real phones) ▲; the map on Contact loads after consent | QA |
| 4 Reviews | rating, count and reviews with attribution on Home; the switch works | QA |
| 5 Receptionist editing | she completed the ten tasks in training; a publish shows on production within 60 s ▲ | CMS + QA |
| 6 Compliance | full copy audit in both languages; consent and notice exactly as the advisor approved; no before/after or price anywhere; no third-party request before consent ▲ | QA + me |
| 7 SEO | redirect script 100 % green ▲; production indexable, staging not ▲; sitemap, hreflang, canonical, titles and metas; structured data valid in Google's Rich Results Test; sitemap submitted | SEO + QA |
| 8 Vercel and domain | HTTPS on guluskadikoy.com with www/bare redirect ▲; project in the clinic's Vercel team; registrar unchanged; the clinic's e-mail still arrives ▲ | me |

## 8. Launch and rollback
- **D17–D19:** TTL lowered to 300 s at least 48 h before cutover; production build in the clinic's Vercel project with the domain added and all keys set; redirect script green against the production build on its vercel.app address; old hosting left exactly as it is.
- **D20, 09:30:** change only the website records (bare-domain A and www CNAME) to Vercel; certificate issued; smoke test (pages, buttons, form on both channels, redirects, consent, one CMS publish); sitemap submitted; the website link on the Google Business Profile checked.
- **Rollback:** a blocking defect that cannot be fixed within one hour → records point back to the old host, effective within minutes thanks to the low TTL.
- **After:** daily 404 log and Search Console coverage for 30 days; any missed old URL gets its redirect within one working day.
- The clinic keeps the old hosting until we confirm its e-mail does not depend on it and 30 days have passed.

## 9. Delivery and handover

### 9.1 What is delivered
1. The live site on guluskadikoy.com, Turkish and English.
2. The CMS at guluskadikoy.com/studio with personal logins for the receptionist (editor) and the clinic owner (admin).
3. The form wired to WhatsApp and e-mail.
4. Legal pages and the cookie banner.
5. SEO pack: old-site inventory, keyword map, redirect map, pre-launch ranking baseline, Search Console set up.
6. Editor guide (Turkish PDF) and five short videos.
7. Account register: every account, its owner, who has access, renewal and cost. No passwords in any document.
8. Runbook: how the site is built and deployed, where keys live, how to change the form recipients, how to roll back, what to do if WhatsApp or e-mail stops.
9. Test report and the signed brief check.
10. The source code repository, transferred to the clinic (or a full copy, per contract).

### 9.2 Handover (D21, 45 min; the account owner chairs; clinic owner and receptionist present)
We walk through the brief check. The clinic owner signs in to every account in the register and turns on two-factor authentication. We transfer Sanity ownership and the repository (the Vercel project moved on D17). Our access drops to what the 30-day support needs and is removed when it ends. The account owner obtains written acceptance.

### 9.3 Running costs the clinic should expect
Checked on D1 at current prices and told to the clinic by the account owner before D3: Vercel Pro (about USD 20 a month per member); Sanity, Resend and Google Maps Platform on their free tiers at this site's volume (Google needs a billing account); WhatsApp, a small fee per request message; domain renewal as today. Nothing is paid from the holding's money; if any cost would fall on us, it goes to the CEO's approval gate first.

## 10. Risks and what we do about each

| # | Risk | Response |
|---|---|---|
| R1 | Clinic inputs late (list A, photos, reviews) | due dates in writing on D1; the account owner chases after 24 h; work continues on placeholders; each day lost on the critical path is reported the same day with its effect on delivery |
| R2 | Meta slow to approve, or refuses, the WhatsApp number or template | started D1, template submitted D5; if not live by D15 we launch with e-mail plus a "WhatsApp ile de gönder" button on the success screen (a prefilled message the visitor sends); the clinic is told; the API channel is switched on by a flag once approved, within the support period |
| R3 | Rankings lost in the migration | complete inventory, one-hop redirects for 100 % of URLs, same canonical host, ranking titles kept where they still fit, tested before and after launch, 30-day watch |
| R4 | The clinic's e-mail breaks at the DNS change | full record inventory D1–D3; only website records change; Resend's SPF entry merged into the existing record, never a second SPF record; old hosting kept |
| R5 | No DNS access | asked on D1; if the clinic cannot give it, the account owner books their IT person for D5 (e-mail records) and D20 (cutover) |
| R6 | Showing patient reviews may count as testimonial advertising under the health-advertising rules (⚠ unverified; question for the clinic's legal advisor) | asked in list A; the CMS switch exists; without a clear yes by D15 we launch with the block off and the clinic switches it on when cleared |
| R7 | Non-compliant claims now or later, including future edits by the receptionist | rules sheet, CMS warnings, dentist review, training, final copy audit |
| R8 | KVKK: health-related data and transfers abroad | minimum data, nothing stored, Frankfurt region, every recipient and country named, advisor approval before launch; the clinic's own KVKK duties flagged in writing |
| R9 | The receptionist finds the CMS hard, or does not write English | Turkish labels and guide, TR/EN side by side, publishing blocked while EN is missing; training on D14 leaves D15–D17 to fix what she stumbles on; if English is a problem, the clinic names who keeps EN current (raised on D14) |
| R10 | The clinic will not pay for Vercel Pro | raised on D1; the account owner offers alternatives (e.g. hosting under our team within a paid maintenance agreement); any cost to the holding passes the CEO approval gate first |
| R11 | Photos late or weak | photo guide on D1; layouts work without photos (team cards fall back to initials); no stock people presented as the team; Sales offers a photographer at the clinic's cost by D8 |
| R12 | The dentist's review is slow | the pilot page sets expectations early; two batches; 2 business days per batch; escalation through the account owner |
| R13 | Holiday, 28 Oct afternoon to 29 Oct | no client dependency on those days |
| R14 | Scope creep | change-request log; I estimate; the account owner decides with the client; nothing is built before that decision |
| R15 | Staging indexed, or production left on noindex | staging password-protected and noindexed; production robots checked in the smoke test |
| R16 | Spam through the form | honeypot, timing, rate limit; captcha only if needed |

## 11. What we need from the clinic, and when (all through the account owner)

| Due | Item | Used for |
|---|---|---|
| D1 | Confirmation of assumptions A1–A7 | scope |
| D2 | Meta Business account (or permission to open one in the clinic's name) and the number to use as WhatsApp sender | WhatsApp, the longest lead time |
| D2 | Domain/DNS access or the IT contact; where the clinic's e-mail is hosted | e-mail domain, cutover, R4 |
| D3 | The 8 treatments | structure, copy |
| D3 | Licensed facility name, address, phones, the WhatsApp number and e-mail address(es) that receive requests, opening hours | content, form |
| D3 | Per dentist: name, title as registered, specialty if any, university and years, languages spoken, consent to publish | Team page |
| D3 | Logo (vector) and any brand colours or fonts | design |
| D3 | Old hosting login (for the archive); Search Console and Google Business Profile access, if they exist | SEO |
| D3 | The e-mail address that will own the accounts; agreement to running costs; the clinic owner adds a card to Vercel, Google Cloud and Meta | accounts |
| D3 | Data controller details for the legal texts (title, address, contact, KEP if any); the legal advisor's contact; the advisor's view on showing reviews (R6) | legal |
| D3 | The dentist who reviews copy; the receptionist's name and her availability on D14 | reviews, training |
| D6 | Pilot page feedback | tone and medical depth |
| D7 | Photos: interior, entrance and exterior, team portraits, per our guide | design, content |
| D8 | Design feedback (one round) | design |
| D9 | Batch 1 medical review | copy |
| D13 | Batch 2 medical review; legal texts approved | copy, legal |
| D14 | Receptionist: 60-min training | CMS |
| D15 12:00 | Staging feedback (one round) | acceptance |
| D17 | Cutover window confirmed; DNS person available | launch |
| D20 | Receptionist confirms the test request | launch |
| D21 | Handover meeting and written acceptance | delivery |

## 12. Working rhythm and the first day
- Standup every day at 09:00, 15 minutes: what passed, what is in progress, what is blocked.
- One tracker: every piece with author, checker, status and evidence; the clinic-items list with due dates; the change-request log; decisions with the date and who made them.
- I send the account owner one batched message a day (status and questions); a blocker goes at once.

**Tomorrow, D1:**
- Everyone reads this plan before the 09:00 standup; questions go to me there.
- By 10:00 I send request list A and the photo guide to the account owner and ask for the kickoff call the same day. I issue the rules sheet (§3) and book the designer and the copywriter with their department heads.
- SEO starts the crawl and the Search Console and backlink pull.
- CMS archives the old site, inventories the DNS records, opens the repository and the Vercel and Sanity projects, and starts the Meta setup as soon as the account owner confirms the clinic's Meta account.
- FE sets up the Next.js project with both languages and the preview pipeline.
- QA writes the test plan skeleton from §6 and §7.
- The designer starts on D2 from the content model; the copywriter starts the pilot page on D2.
