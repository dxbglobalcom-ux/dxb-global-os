# WORK PLAN: Urla family olive farm, one landing page

**Owner:** me. **Job folder:** the working directory that holds `brief.md`. All paths below are relative to it. This plan is saved as `plan.md` next to the brief and goes out with every dispatch, except the two judging parts, which get excerpts (see §4). The team reads the plan in English. Everything a visitor sees is Turkish.

---

## 1. Scope

**The job.** One Turkish landing page for a fictional family farm in Urla (İzmir). The family has grown olives there for three generations. The farm makes early-harvest natürel sızma zeytinyağı and opens its grove to visitors on autumn harvest days.

The page has two jobs:
- make a visitor know and like the farm;
- make them want one of two things: **order the oil** or **join a harvest day**.

Everything about the farm is invented by us. Nothing about the real world is invented: real places, olive varieties, history and olive-oil science are all sourced. §11 lists what I checked at source.

**Proportion.** The brief asks for a landing page, not a shop or a booking system. It does not require a checkout, inventory, confirmed reservations, a range of products or a calendar file. It does not even require forms. So the page is built in three layers:
- **Core** (§2.2): the smallest page that persuades.
- **Additions** (§2.3): a short, closed list, each of which must earn its place.
- **Excluded** (§2.4): everything else.

The page carries two short request forms, one per goal. The brief allows forms ("form varsa…"), and a page whose two goals end at a dead button fails its purpose. Both forms are handled in the browser, and both say honestly what happened (§2.5).

**The brief's rules, as I will enforce them.**
1. **One page.** One HTML document. Navigation by in-page anchors only. Confirmations appear inside the page. No second page, route, thank-you page, blog or account.
2. **No photos or image files.** Everything visible is drawn by the team's own code (§2.7). Google Fonts is the only external resource.
3. **No backend.** Nothing leaves the browser, and the page stores nothing.
4. **Turkish.** Every word a visitor can see or hear.
5. **Out of scope means absent.** No legal, KVKK, regulatory or contract text, and no control that implies one: no consent box, cookie notice, privacy or terms link, sales contract or return-policy wording.
6. **No questions to the client.** Each agent decides, writes the decision down and moves on.
7. **Delivery.** `delivery/index.html`, working on desktop and phone.

**The bar.** "Uluslararası yarışmalarda birinciliğe aday" means a page that could *win*, not one that merely gets noticed. In practice that means:
- a credible winner of Awwwards **Site of the Day**, which is the jury's top site for that day;
- not an Honorable Mention, which only needs a jury score of 6.5 or more;
- strong enough to hold up when each month's eight highest-scoring sites are reviewed again for Site of the Month.

The Awwwards jury has at least 18 members, and the three scores furthest from the average are dropped. It weights Design 40%, Usability 30%, Creativity 20% and Content 10%.

Our own internal scores cannot prove that level, so the bar is enforced three ways:
- **G4, a comparative gate that cannot be waived** (step 9): the page is judged side by side against verified recent winners and must stand with them or above them;
- **G3, persuasion evidence** from a simulated visitor panel;
- **G5, the developer criteria.**

**Season context.**
- 24 October 2026 is a Saturday. Erkence, Urla's native olive, ripens before November, so the farm's first early-harvest oil is already pressed and on sale.
- Harvest days are the ten weekend days from 31 Ekim to 29 Kasım 2026:
  - Saturdays: 31 Oct and 7, 14, 21, 28 Nov;
  - Sundays: 1, 8, 15, 22, 29 Nov.
- The page must stay true before, during and after the season (§2.5).

**Audience (assumed).**
- Food-literate city buyers in İzmir and İstanbul, buying for themselves or as New Year gifts.
- İzmir-area families, couples and friends looking for an autumn day out.
- Most of them arrive on a phone.

---

## 2. The delivered page

### 2.1 Form of the file
- **One file**, `delivery/index.html`:
  - UTF-8, LF line endings, document language `tr`;
  - CSS inline;
  - classic inline scripts only, because module scripts hit CORS errors under file://;
  - no fetch, no workers, and no third-party library, even inlined;
  - all art inline;
  - the farm data embedded once as a JSON script block;
  - the data-driven HTML pre-rendered, so prices, dates and text read without JS.
- **External requests: Google Fonts only.**
  - `display=swap`, with preconnect.
  - At most 2 families and 5 weight/style combinations; a variable axis range counts as one.
  - At most 150 KB of font files actually downloaded.
  - Metric-matched fallback faces.
- **Colour.** `color-scheme: light`, one art-directed scheme, and still usable in forced-colors mode.
- **Behaviour everywhere.** The page behaves the same opened from file:// and from any static server, with zero console errors or warnings.
- **Budgets.** Source stays readable and sectioned.

  | Budget | Limit |
  |---|---|
  | File | ≤ 400 KB (target ≤ 250 KB) |
  | JS | ≤ 40 KB of source, not counting the data block |
  | DOM | ≤ 2,000 elements including inline SVG (dense art goes to canvas) |
  | Art | ≤ 180 KB of source |

- **Head.** Turkish title and description, viewport, theme-color, an inline SVG favicon and the fonts link. Nothing more: no Open Graph, no JSON-LD.
- **No storage.** No cookies, localStorage, sessionStorage or IndexedDB.

### 2.2 Core content
The section ids are fixed. P2 may reorder or merge sections but may not drop any item.

| # | Section · id | Must contain | Must do |
|---|---|---|---|
| 0 | Header | SVG wordmark; anchors Hikâye (`#hikaye`) · Zeytinyağı (`#erken-hasat`) · Hasat Günleri (`#hasat-gunleri`) · SSS (`#sss`); a "Sipariş ver" button pointing to `#siparis`; skip link "İçeriğe geç" | Sticky; shows the current section; skip link is the first focusable element; any phone menu works by keyboard |
| 1 | Giriş · `giris` | An H1 and a one-sentence sub that between them name Urla, three generations and early harvest; primary CTA to `#siparis`; secondary CTA to `#hasat-gunleri`; hero art; season badge | First-screen rule (C2); a complete still picture before any script runs; AA contrast over the art |
| 2 | Hikâye · `hikaye` | Three generations: one person each, with years, one concrete deed and one human detail; one family quote; a drawn visual | n/a |
| 3 | Bahçe · `bahce` | Urla, Erkence, the imbat wind, soil, altitude, distance to the sea, number of trees; Urla's olive-oil heritage in the verified wording: "MÖ 6. yüzyıldan kalma Klazomenai işliği, bilinen en eski zeytinyağı işliklerinden biri" | n/a |
| 4 | Erken hasat · `erken-hasat` | What early harvest is; how it tastes and why, calibrated to Erkence's documented profile (fruity, soft finish); why it costs more | The signature interactive (§3), with a text equivalent |
| 5 | Zeytinyağı · `yag` | "Dalından şişeye" in 5–6 steps, with real times and temperature from data; tasting notes and intensity (meyvemsi / acı / yakıcı); how to taste; 4–6 food pairings; storage; an analysis card (asit, peroksit, polifenol) labelled "2026 hasadı", giving the farm's own figures with no lab named | Steps shown in sequence |
| 6 | Sipariş · `siparis` | 2–3 formats of the one oil, as cards with a drawn packshot, volume, price (integer TL), price per litre, a two-line description and a quantity stepper; the note "kargo dahil" (prices include delivery within Türkiye); then the request form (ad soyad, telefon, teslimat adresi, optional not); a one-line honesty note beside the submit button | Live total; validation; honest confirmation (§2.5); a noscript line |
| 7 | Hasat günleri · `hasat-gunleri` | What the day is; hour-by-hour programme; what is included; adult and child prices, free under a set age; capacity; the dates with places left; what to wear and bring; rain policy; getting there, with a schematic SVG map and travel times from İzmir centre and Adnan Menderes airport; three visitor quotes; then the request form (date, adults, children, ad soyad, telefon, optional not); a one-line honesty note beside the submit button | Dates checked against today in Istanbul; live price; validation; honest confirmation; season-over state |
| 8 | SSS · `sss` | Seven answers: acılık, saklama, teslimat süresi, hediye, yağmur, ulaşım, çocuklar | Built with `details/summary`, so it works without JS |
| 9 | Footer | Wordmark; one line; anchors; "Urla, İzmir" with the village name; "Kurgusal bir çiftliğin tanıtım sayfasıdır."; © 2026 | Nothing legal; no contact details |

- **Copy keys** follow `sectionid.role`, for example `giris.h1`, `siparis.error.phone`, `hasat-gunleri.badge.before`, `meta.title`, `nav.skip`.
- **Form anchors** are `siparis-formu` and `hasat-formu`.

### 2.3 Additions
Each addition must earn its place. The list is closed. If something has to be cut, cuts start at item 7 and work upwards.

1. **Signature interactive** in `#erken-hasat`. The default is the olive clock (§3). It is the page's award idea and the clearest answer to "why pay more for early harvest?". If cut, it becomes a static comparison.
2. **Ambient hero motion**: the imbat wind flipping the olive leaves. It makes a place drawn in code feel alive. If cut, the hero is still.
3. **Live totals** in both forms. They answer "how much?" at the moment of decision. If cut, prices appear in text only.
4. **Date-aware season badge** (before / during / after). It keeps the first screen true on any date. If cut, there is no badge, never a static line that can go out of date.
5. **Schematic travel map.** It answers "how far?" without a map embed. If cut, travel times appear as text.
6. **"Özeti kopyala".** It gives a browser-only form something the visitor can take away. If cut, the summary appears on screen only.
7. **Phone action bar.** Included only if P2 shows the sticky header's button is not enough on phones. If cut, the header button remains.

Only I cut, from item 7 upwards, and I record the reason. Core items (§2.2), behaviours (§2.5) and the brief's rules are never cut.

### 2.4 Excluded: nobody adds these
- Any storage or a persistent cart.
- Shipping thresholds, pickup, gift wrapping.
- Payment or card fields.
- Reference numbers; any change to the places left.
- Calendar export.
- Contact, question, newsletter or "notify me" forms; accounts.
- Phone numbers, e-mail addresses, social handles, street addresses.
- tel:, mailto: or outbound links.
- Maps or embeds.
- Open Graph or JSON-LD.
- Dark mode or a second language.
- Analytics, chat, or pop-ups on load.

### 2.5 Behaviour

**Order request (`#siparis`)**
- Each product has a stepper from 0 to a limit set in the data. At least one product is required. The total updates live, in TL.
- Errors appear on submit and when the visitor leaves a field. They disappear as soon as the input is valid, sit beside the field, and are written in Turkish. An error summary takes focus.
- The phone field accepts and normalises "0532 123 45 67", "+90 532 123 4567", "5321234567" and "0 (232) 123 45 67".
- Double submission is blocked.
- The confirmation appears in place, with focus on its heading. It shows:
  - the summary: products, quantities, total and address;
  - the honest statement (below);
  - "Özeti kopyala", which uses the clipboard, or selects the summary text for manual copying where the clipboard is unavailable;
  - "Düzenle", which goes back to the filled-in form;
  - a reset.

**Harvest-day request (`#hasat-gunleri`)**
- Only dates after today in Europe/Istanbul are offered. Today's and past dates drop out of both the list and the choice.
- Places left come from the data as fixed fiction. A sold-out date shows "Doldu" and cannot be chosen.
- The party needs at least one adult. Children are optional. The total cannot exceed the places left.
- The price updates live.
- Validation and confirmation work as in the order form.

**The honest outcome (both forms)**
- Beside each submit button, a plain line says that on this presentation page nothing typed is sent anywhere.
- The confirmation states plainly that:
  - this is the presentation page of a fictional farm;
  - nothing entered has left the screen;
  - no order, payment or reservation has been created.
- The page never shows a reference number, never changes the places left, and never promises a call, an e-mail, a delivery or a seat.
- Submit labels describe what actually happens: a request summary is prepared. They never say "gönder", "öde" or "rezervasyonu tamamla".
- The footer says "Kurgusal bir çiftliğin tanıtım sayfasıdır."
- These are plain sentences, not legal text. P3 writes them and P7b checks them.

**Dates**
- "Today" is the calendar date in Europe/Istanbul, whatever the visitor's time zone. Turkey has been on UTC+3 all year since 2016.
- The badge has three states:
  - *before*: earlier than the farm's harvest start date;
  - *during*: from the harvest start until the last harvest day;
  - *after*: once the last harvest day has passed.
- When no future harvest date remains, the harvest-day form is replaced by a text state saying the 2026 days are over and the 2027 dates come next autumn. That state has no form.
- `?bugun=YYYY-MM-DD` overrides today's date for QA. It has no visible effect otherwise.

**Robustness without JS.** All text, prices and dates are readable, the FAQ works, each form shows one line saying it needs JS, and the hero shows its still picture. No content waits on an animation to appear.

**Navigation and motion**
- In-page scrolling is smooth and allows for the header's height. The current section is indicated. Nothing depends on hover.
- CSS animation uses only transform and opacity. Canvas drawing stays within the frame budget.
- Animation loops pause off-screen and in background tabs. Scrolling is never taken over.
- With reduced motion, the page is still and nothing is missing.

### 2.6 Forbidden, in the page and in every part
- **Images and embeds.** No photos, raster images, video, iframes or embeds, icon fonts, emoji used as imagery, or CSS backgrounds pointing at a file or URL. No raster data URIs in the file. An SVG data URI generated by our own code, such as the favicon, is allowed.
- **External code.** No external request except Google Fonts. No third-party JS or CSS library, CDN, analytics, tracker or widget.
- **Sending and storing.** No network submission of any kind, and no storage of any kind.
- **Legal and payment.** No legal, KVKK, regulatory or contract text or control. No payment steps or card fields.
- **Contact details.** No phone number, e-mail, WhatsApp, social handle or street address. Invented ones can reach real people.
- **Faked receipt.** No reference numbers, "reserved" states, or anything else that pretends a submission was received.
- **Real third parties.** No real third party shown as connected to the farm: brands, couriers, shops, awards, competitions, certifiers or certification marks (including "organik sertifikalı"), laboratories, press, or named real people. Real places and history are fine when sourced.
- **Claims.** No health or medical claims. No world superlatives beyond the verified wording. None of the banned clichés (§4, P2).
- **Page and interface.**
  - No second page, route, thank-you page, blog or login.
  - No pop-ups on load.
  - No scroll-jacking.
  - No sound that plays on its own.
- **Uploading.** No part uploads the page or its text to any external validator or service.

### 2.7 Visual-source rule
- Every visual on the page is drawn by the team in code.
- In `work/`, agents write SVG, CSS and JS as text source files, `.svg` files included. The build inlines them, and the delivered page loads no file of its own.
- No part may use, download, trace, convert or sample any external image, illustration, icon set, map data or texture.
- Screenshots in `work/` are QA evidence. Benchmark screenshots of award-winning sites are judging evidence only. Neither ever enters the page or serves as material for its art.

### 2.8 Acceptance tests: the definition of done
Every checker uses these IDs. "Both engines" means Chrome, plus Firefox if P0 proves it can drive Firefox, plus WebKit if it can be installed.

**A. Brief rules and honesty**
- **A1.** One document. Every hyperlink is an in-page anchor.
- **A2.** check-static (P0's static scanner) finds no forbidden element, URL, link scheme, raster data URI, `[[EKSİK` marker or unresolved `{{` placeholder. Every word it flags has been reviewed.
- **A3.** The network log shows only fonts.googleapis.com and fonts.gstatic.com. Any form submission causes zero requests.
- **A4.** All visible and announced text is Turkish: title, meta, aria, errors and confirmations.
- **A5.** The page behaves the same under file:// and under http://.
- **A6.** Honest outcome:
  - the line beside each submit button is present;
  - the confirmation says nothing left the screen and no order, payment or reservation was created;
  - there are no reference numbers;
  - the places left are unchanged after a request;
  - no submit label claims sending, paying or reserving;
  - the footer line is present.
- **A7.** Nothing is stored. After both forms are submitted, cookies, localStorage, sessionStorage and IndexedDB are all empty.

**B. Function**
- **B1.** Anchors land below the sticky header. The current section is shown. The skip link is the first focusable element. Any phone menu works by keyboard.
- **B2.** Order form:
  - steppers respect their limits;
  - at least one product is required;
  - the live total is correct for each product alone, for mixed quantities, at the maximum and at zero.
- **B3.** Validation:
  - every error code can be triggered and shows beside its field in Turkish;
  - the error summary takes focus, and errors clear once fixed;
  - the phone variants in §2.5 pass and junk input fails;
  - double submission is blocked.
- **B4.** Confirmation:
  - the summary is correct;
  - "Özeti kopyala" copies exactly the summary text, or selects it where there is no clipboard;
  - "Düzenle" returns to the filled-in form;
  - the reset clears it.
- **B5.** Harvest-day form:
  - only dates after today (Istanbul) are offered;
  - "Doldu" dates cannot be chosen;
  - the party cannot exceed the places left, and needs at least one adult;
  - the price is correct.
- **B6.** Dates and badge with `?bugun=` set to:
  - 2026-09-15 (before the season);
  - 2026-10-24;
  - 2026-11-07;
  - 2026-11-28 (one date left);
  - 2026-11-29 (season over);
  - 2027-01-10 (after the season).

  With the clock stubbed at 2026-11-06 23:30 and 2026-11-07 00:30 Istanbul time, the states are identical whether the browser's time zone is Europe/Istanbul, Pacific/Honolulu or Asia/Tokyo.
- **B7.** The signature interactive works by mouse, touch and keyboard. Its text equivalent updates and is announced politely to screen readers.
- **B8.** The FAQ works with JS off.
- **B9.** Zero console errors or warnings throughout, in both engines.
- **B10.** With JS off, all text, prices and dates are readable, the noscript lines show, and the hero shows its still picture.

**C. Responsive**
- **C1.** No horizontal overflow, clipping or overlap at the eleven viewports in §7. Captures at 390 px with device scale 3 and at 1440 px with device scale 2 are crisp.
- **C2.** At 390×844 the first screen shows the H1, the sub and both CTAs. At 360×640 it shows at least the H1 and the primary CTA.
- **C3.** Touch and input:
  - touch targets are at least 44×44 px; this is our own rule, since WCAG 2.2 AA sets 24×24 (SC 2.5.8) and 44×44 is the AAA level (SC 2.5.5);
  - body text is at least 16 px on phones;
  - inputs are at least 16 px, because iOS Safari zooms into smaller ones;
  - every input has the correct type, autocomplete and inputmode;
  - safe-area insets are respected;
  - `100dvh` is used with a fallback.
- **C4.** No sticky element covers a focused element or a submit button. This is stricter than WCAG 2.2 AA SC 2.4.11, which only forbids hiding the focused element completely.
- **C5.** The longest Turkish word in every heading fits at 320 px.

**D. Accessibility (WCAG 2.2 AA)**
- **D1.** Contrast passes for all text and controls in every state, including text over art.
- **D2.** Both journeys can be completed with the keyboard alone, with visible focus in a sensible order.
- **D3.** Structure:
  - landmarks, a single H1, headings in order;
  - every field labelled, and grouped choices in fieldset/legend;
  - `aria-invalid` and `aria-describedby` on errors;
  - live regions for totals, the price and confirmations.
- **D4.** Decorative art is hidden from assistive technology. Meaningful art has a Turkish name.
- **D5.** Reduced motion is honoured, and nothing is lost at 200% zoom.
- **D6.** axe-core reports zero serious or critical violations, if it can be installed. If not, D1–D5 are audited manually and the audit is recorded.

**E. Performance**
- **E1.** All §2.1 budgets are met.
- **E2.** Load:
  - mobile emulation (4× CPU slowdown, fast-4G throttling): LCP ≤ 2.5 s, CLS ≤ 0.05 including the font swap, TBT ≤ 200 ms;
  - desktop: LCP ≤ 1.5 s.
- **E3.** Animation:
  - the hero costs at most 8 ms per frame at 4× CPU on a 390 px screen;
  - no frame takes longer than 50 ms during scrolling;
  - the CPU idles when nothing animated is on screen.
- **E4.** If Lighthouse can be run: Performance ≥ 90 on mobile and ≥ 95 on desktop, Accessibility 100, Best Practices ≥ 95, SEO ≥ 95.

**F. Language and content**
- **F1.** Zero TDK errors, and consistent terms throughout (zeytinyağı, natürel sızma, erken hasat, hasat günü).
- **F2.** Typography follows the agreed Turkish conventions ("Yazım", §4 P2):
  - "%0,2", "1.400", "15,2", "09.30'da";
  - "7 Kasım 2026 Cumartesi", with month and day names capitalised only in specific dates ("kasımda" otherwise);
  - "1.250 TL" with a non-breaking space;
  - uppercase İ/I correct in both engines (MDN notes that browser support varies);
  - no damage from fi/fl ligatures;
  - no heading whose last line is a single word.
- **F3.** Every real-world claim matches facts.md's safe phrasing, and no forbidden claim appears. Taste claims stay within Erkence's documented profile.
- **F4.** Every number, price, date, weekday, year and place count matches farm.json, and the arithmetic holds.

**G. Design, persuasion and the bar**
- **G1.** The page is faithful to the chosen direction, the art reads as one hand, and nothing feels like a template. Storytelling never hides the farm, the oil or the two actions.
- **G2.** Five-second test at 390 and at 1440: a first-time viewer can say what this is, where it is, and the two things they can do.
- **G3.** The visitor panel passes (§7).
- **G4.** The comparative jury gate passes (§7). It cannot be waived.
- **G5.** The developer criteria pass (semantics, motion, accessibility, performance, responsiveness, markup), as evidenced by tests A–E.

---

## 3. Creative spine: the default, which P2 develops or beats

**Concept: "Bir hasat günü", one late-October day at the farm, from dawn to the bottle.**
- Section kickers carry clock times, set like entries in the family's harvest ledger. The times come from the harvest-day programme in farm.json and from Urla's real sunrise and sunset (P1).
- The light of the section backgrounds moves from dawn to dusk. Each background is checked for contrast.
- **Guard rails:**
  - the device decorates plain section titles;
  - navigation and headings say plainly what each section is;
  - the device never delays the CTAs or the facts.

**One signature idea: the olive clock** (in `#erken-hasat`).
- One control moves through the harvest months, October to January.
- The drawn olive ripens from green to violet to black.
- The figures move with it: kilograms of olives per litre, polyphenols, bitterness and pungency, and what you taste.
- In one gesture it explains why early harvest costs more and tastes as it does, calibrated to Erkence's documented fruity, soft profile.

Everything else is restrained craft:
- **The hero grove.** Seeded and generative. The leaves are botanically right: opposite, lanceolate to elliptic, grey-green above and silvery below. They flip to silver in gusts of the imbat, and stay still under reduced motion.
- **The label system** on the drawn packshots: lot, harvest date and pressing hour, taken from the data.

**Alternative seeds for route B.** These come from the competing plan; P2 may take them or beat them:
- the hero light follows the hour in Urla, with a small control to preview dawn, noon and dusk;
- a drop of oil travels a drawn path through the sections and fills the bottle at the order section;
- an interactive tasting wheel that lights up the matching words in the text.

**Product idea: "Üç Hafta".** Three small bottles from the first three pressing weeks of 2026.
- Research supplies only the real seasonal window (Erkence ripens before November).
- P2 decides the fictional farm's pressing calendar, including whether it had three weeks of pressing by 24 October.
- If it goes ahead, it counts as one of the 2–3 products.

**Restraint.**
- One display serif and one quiet sans.
- A short palette.
- Motion only where it explains or delights.

---

## 4. Parts

Each part goes to a fresh agent, together with the standing orders (§10), and ends with a `HANDOFF.md` written to the template in §5. Two parts are deliberately kept naive about the plan's intentions:
- P7d receives only the brief, the panel protocol in §7 and its listed inputs.
- P9 receives only the brief, the bar from §1, tests G1–G5 and the gate protocol in §7.

### P0: Test and screenshot harness
- **Effort:** medium. Ordinary tooling code with a self-test; every later part relies on it.
- **Inputs:** brief.md, plan.md.
- **Output:** `work/00-tools/`, containing README.md, shoot.mjs, serve.mjs, check-static.mjs, ff-shot.sh, scenarios/, selftest.log and HANDOFF.md.
- **Work:**
  - **Environment.** Confirm with `--version` runs what I measured on 24 October:
    - Node headers report 22.23.3, and npm is 10.9.9;
    - Python 3.14 and git are present;
    - Chrome's wrapper is at `/opt/google/chrome/google-chrome`;
    - Firefox runs as a snap behind `/usr/bin/firefox`;
    - Noto fonts are installed;
    - no Playwright, WebKit, Lighthouse or html-validate is installed.

    Also test whether the npm registry is reachable.
  - **shoot.mjs.** A Chrome DevTools Protocol driver with no dependencies. It uses Node's built-in WebSocket, which is stable since Node 22.4. It runs `google-chrome --headless=new --no-sandbox`, falling back to the wrapper path.
    - It takes the file or URL under test as an argument. Nothing hard-codes `delivery/`.
    - It can emulate: viewport, device scale and mobile; touch; reduced motion; CPU throttling; a time-zone override; a stubbed clock injected before page scripts run; network throttling (using the non-deprecated CDP command where one exists); URL blocking, for runs with fonts blocked.
    - It waits for `document.fonts.ready` and for the network to go idle.
    - It captures:
      - viewport screenshots at chosen scroll offsets or anchors;
      - full-page screenshots at the true viewport after scrolling through the page (never by enlarging the window, which stretches 100vh blocks);
      - frame sequences.
    - It runs JSON scenarios (click, type, press, select, wait, eval, shot).
    - It logs console messages, exceptions and every network request.
    - It reports horizontal overflow, LCP, CLS, long tasks, duplicate ids, element count and storage contents.
    - It injects axe-core if npm can install it. axe-core stays under `work/00-tools`.
  - **serve.mjs.** A static server, so every scenario runs under both file:// and http://.
  - **check-static.mjs.** Scans an HTML file for:
    - everything in §2.6: elements, URLs, link schemes, raster data URIs;
    - `[[EKSİK` markers and unresolved `{{` placeholders;
    - a list of words to flag for review: KVKK, çerez, gizlilik, sözleşme, aydınlatma, kişisel veri and similar.

    It also reports file, JS and data sizes, the lang attribute and the line endings.
  - **ff-shot.sh.** Firefox headless screenshots, using `-screenshot` with `--window-size=w,h`.
    - The snap has a private /tmp, so all output goes under the job folder.
    - Record whether Firefox captures the viewport or the full page.
    - If Firefox cannot be driven, say so. Firefox checks then become a recorded gap, never a silent skip.
  - **Optional tools,** local only, if npm is reachable: Playwright WebKit as a third engine, Lighthouse, html-validate.
  - **Fallback.** Document the plain fallback: Chrome's `--screenshot` with `--window-size` and `#anchor` URLs, and `--dump-dom` for the rendered DOM.
- **Check:** selftest.log proves every capability on a sample page that has an animation, a form, a reveal block, a 100vh block and a Google Font. I re-run the self-test when the part comes back.

### P1: Facts, market, fonts and benchmarks
- **Effort:** medium. Standard research.
- **Inputs:** brief.md, plan.md.
- **Output:** `work/01-research/`, containing facts.md, market.md, calendar-2026.md, fonts.md with fonts/, benchmarks.md with benchmarks/, names-in-use.md and HANDOFF.md.
- **Work:**
  - **facts.md.** Each fact is recorded as: statement, source URL, access date, confidence, and a safe Turkish phrasing. Research establishes only real-world facts and plausible ranges. The fictional farm's calendar is P2's decision.
    - **Already verified by me** (link to these, don't redo them): Klazomenai, Erkence, the TDK conventions, UTC+3, and the 28–29 October holiday (§11).
    - **To research:**
      - Urla's geography, climate, the imbat, soils, terraces and olive villages;
      - the other varieties grown around Urla and when they are harvested, because the November harvest days must pick something real;
      - early-harvest science:
        - yield by month, in kg of olives per litre;
        - polyphenol ranges and acidity;
        - same-day pressing;
        - malaxation temperature, and what "soğuk sıkım" actually means;
        - two-phase extraction and filtering;
        - storage and shelf life;
      - how early harvest shifts Erkence's taste, so bitterness and pungency are not overclaimed against its documented fruity, soft profile;
      - harvest practice: tırmık (hand rakes), nets, crates;
      - Turkish tasting vocabulary;
      - travel times from İzmir centre and from Adnan Menderes airport;
      - sunrise and sunset in Urla on each harvest date;
      - a do-not-claim list.
    - **Lead** (not yet verified): [İYTE Hurma/Erkence/Gemlik study](https://openaccess.iyte.edu.tr/bitstream/11147/3602/1/10011520.pdf).
  - **market.md.** 2026 Turkish prices for boutique early-harvest oil in each format, with at least 5 dated benchmarks per format. Prices and programmes of agritourism harvest days.
  - **calendar-2026.md.** Every weekend from 24 October to 6 December 2026, with weekdays computed by `date -d`; the ten harvest dates; 28 Ekim (a half-day holiday from 13.00) and 29 Ekim (a Thursday, and a holiday).
  - **fonts.md.** Six display and six text families from Google Fonts with latin-ext support. Each is proven by a rendered screenshot, with lang="tr", of "Şığ İIı Öö Üü Çç Ââ Îî · sipariş SİPARİŞ · fiyat fidan HİKÂYE" at the weights proposed.
  - **benchmarks.md.**
    - 8–12 sites that won Awwwards Site of the Day or higher, or the CSSDA/FWA equivalent, in food, drink, farm or craft, most recent first.
    - Plus 4–6 illustration-led sites that use no photography.
    - For each: URL, award and date (verified on the award's own site), and 2–3 lines on why it wins.
    - Screenshots at 1440×900 and 390×844 (first screen plus three scroll positions), kept as judging evidence.
    - The sites are analysed, never proposed for imitation.
  - **names-in-use.md.** At least 20 Turkish olive-oil and food brands and farms whose names we must avoid.
- **Check:**
  - every fact is sourced and graded;
  - weekdays are computed, not typed;
  - award levels are verified at source.

  When the part comes back I spot-check five items.

### P2: Creative direction, brand and farm bible
- **Effort:** max. Every later part inherits this concept, design system and data, so it decides whether the page can win.
- **Inputs:** brief.md, plan.md, work/00-tools/, work/01-research/.
- **Output:** `work/02-direction/`, containing:
  - direction.md, farm.json, tokens.css, style-tile.html;
  - motifs/ (tree, hills with sea, bottle);
  - logo.svg and a favicon;
  - wireframe.html, prototype/route-a.html and prototype/route-b.html;
  - shots/ and HANDOFF.md.
- **Work:**
  1. **Concept.** Route A is the §3 spine. Route B is the strongest alternative, from the §3 seeds or better. Prototype each as the hero plus the order cards, using the real fonts and the hero copy written here, at 1440×900 and 390×844. Choose one, and justify the choice in at most 300 words against G3, G4 and benchmarks.md.
  2. **Name and identity.**
     - The name: at most two Turkish words, easy to say, works on a label.
     - It must not appear in names-in-use.md, and a recorded web search must come back clean.
     - Nothing that echoes "Erkenci", because of the 2018–19 Star TV series *Erkenci Kuş*.
     - Deliver an SVG wordmark and mark, and a label system for bottle and tin.
  3. **farm.json, the single source of every invented fact and number.** It covers:
     - the brand and its village-level location;
     - the family: names, birth years, roles, deeds;
     - the grove: hectares, trees, varieties, oldest tree, altitude, distance to the sea;
     - the mill;
     - the 2026 season: harvest start, first pressing, weekly lots, volume;
     - the oil profile and analysis figures, and the month table for the olive clock;
     - products: id, name, format, volume, price in integer TL, per-request limit;
     - harvest days: programme with times, prices, the child rule, capacity, meeting point, what's included, what to bring, and the ten dates with places left, one of them "Doldu".

     It must be coherent:
     - the farm's invented calendar sits inside the research ranges, and explains what visitors pick in November and what they take home;
     - the family's ages are plausible;
     - trees × yield ≈ litres ≈ bottles;
     - prices fall within market.md's ranges;
     - every weekday comes from `date -d`.
  4. **Yazım: the Turkish writing conventions** (TDK rules checked in §11, plus our own choices):
     - "%0,2"; "1.400"; "15,2"; "09.30'da";
     - "7 Kasım 2026 Cumartesi", with month and day names capitalised only in specific dates ("kasımda" otherwise);
     - "1.250 TL" with a non-breaking space, and no decimals when the amount is whole;
     - apostrophes before suffixes on proper nouns;
     - a non-breaking space between a number and its unit;
     - one quotation-mark style;
     - sentence case in headings.
  5. **Design system.**
     - Tokens, with a contrast table.
     - At most two font families, taken from fonts.md.
     - A fluid type scale, spacing, grid, corner radii and motion tokens.
     - Every component in every state: button, stepper, date chip (as a radio button), input, error, summary, confirmation, accordion, badge, and the optional action bar.
     - Class names that the build uses exactly as written.
     - style-tile.html shows all of this with real headlines and the glyph string.
  6. **Spine lines.** The hero H1, the sub and the section headlines, as final candidates within budget. P3 inherits them.
  7. **wireframe.html** at 390 and 1440. It shows the fixed ids, heading levels and a character budget for every block, and records the decision on addition 7 with its justification.
  8. **Motion and interaction specs.**
     - The motion spec.
     - The interaction spec: state machines for both forms, every error code, what the honest confirmation contains, the date, badge and season rules, and the override.
  9. **Art briefs and the art contract.**
     - One art brief per asset, and the art contract (§5).
     - Botanical rules: olive leaves are opposite, lanceolate to elliptic, leathery, grey-green above and silvery below.
     - Illustration style: consistent line weight; grain from a small tile, not a full-screen filter.
  10. **Voice.**
      - The family speaks in the first person plural.
      - Concrete detail over adjectives.
      - Sentences that read well aloud; Turkish that was written, not translated.
      - Banned words: sıvı altın, eşsiz, benzersiz, kaliteli, premium, lezzet şöleni, hoş geldiniz, doğanın mucizesi, şifa deposu.
      - Six sample lines.
- **Check:** G1.

### G1: Owner gate on the direction (me)
- **Effort:** high. A check of internal work at the point where it matters most.
- **What I check:**
  - the hero proof makes me stop, and it doesn't look like a generic olive-oil site;
  - the concept is ownable and keeps the farm, the oil and both actions clear;
  - C2 holds, and text over the art is legible;
  - the glyph test and the contrast table pass;
  - farm.json is complete; I re-run `date -d` on every date and recompute the ages, volumes and prices myself;
  - the name check is recorded;
  - the contracts are complete;
  - nothing excluded or forbidden is planned;
  - every addition is justified.
- **If it fails:** P2 is dispatched once more, at max effort, with my notes.
- **If it passes:** farm.json is frozen. From then on only I change it, with a version bump, and I notify every part that uses it.
- **Output:** `work/owner/G1-direction.md`.

### P3: Copy deck
- **Effort:** high. The final Turkish text every visitor reads.
- **Inputs:** brief.md, plan.md, work/01-research/, work/02-direction/.
- **Output:** `work/03-copy/`, containing copy.md, strings.json and HANDOFF.md.
- **Work:**
  - **copy.md.** Every visible string, in wireframe order, keyed by `sectionid.role`, within budget.
    - P2's spine lines stay unless improved within the same budget, and any change is logged.
    - Real-world facts appear only in facts.md's safe phrasing.
    - Data values are never typed. They are written as `{{…}}` placeholders, so text and data cannot drift apart.
  - **strings.json.** All interface text:
    - labels;
    - one message per error code;
    - both confirmations, including the honest lines (§2.5);
    - the line beside each submit button;
    - the badge states and the season-over state;
    - the noscript line;
    - meta text;
    - names for meaningful art.
  - **Missing keys.** Any missing key becomes `[[EKSİK: key]]` and is listed in the HANDOFF.
  - **HANDOFF.md** also records:
    - the self-check against TDK rules and the Yazım conventions;
    - the longest word in each heading, for the 320 px check;
    - character counts against the budgets;
    - any new numbers that are purely narrative, proposed for me to merge into farm.json.
- **Check:** when the part comes back I confirm it covers every block in the wireframe and every error code. P7b later checks the text on the built page.

### P4: Illustration and motion library
- **Effort:** xhigh. One agent draws every visual, so the page has a single hand. Long, design-level work bound by a performance budget.
- **Inputs:** brief.md, plan.md, work/00-tools/, work/01-research/facts.md, work/02-direction/.
- **Output:** `work/04-art/`, containing assets/*.svg, gen/*.js, motion.css, showcase.html, assets.md, shots/ and HANDOFF.md.
- **Work:**
  - **The hero grove.**
    - Seeded and generative.
    - Separate desktop and phone compositions.
    - A still first frame that goes inline in the HTML.
    - The imbat leaf-flip, held still under reduced motion.
  - **Section and story visuals:**
    - section backgrounds;
    - the generations visual;
    - the olive at each harvest month, for the clock;
    - a botanical olive branch;
    - 5–6 process illustrations;
    - a tasting glass;
    - the harvest tools.
  - **Packshots** for each product, with labels as live SVG text from farm.json.
  - **Supporting pieces:**
    - the schematic travel map, drawn by hand rather than traced;
    - the grain tile;
    - refinements to the wordmark, and the favicon.
  - **showcase.html** shows every asset at two sizes, with a reduced-motion toggle.
- **Check:**
  - showcase screenshots at 390 and 1440, plus one under reduced motion;
  - frame sequences of the animations;
  - a search for duplicate ids across all assets;
  - budgets measured at 4× CPU;
  - one consistent hand across everything, judged by my eye when the part comes back.

### P5: Form and date logic
- **Effort:** high. Code that must be correct, unit-tested on its own.
- **Inputs:** brief.md, plan.md, work/01-research/calendar-2026.md, work/02-direction/farm.json, work/02-direction/direction.md.
- **Output:** `work/05-logic/`, containing logic.js, logic.test.mjs, API.md, test-output.txt and HANDOFF.md.
- **Work:**
  - **Shape.** One self-contained script exposing a single namespace, with a `module.exports` guard so Node can load it. No DOM and no storage.
  - **What it does:**
    - totals in integer TL;
    - validation that returns the spec's error codes;
    - phone normalisation;
    - party rules;
    - date states, the badge and the season state, all from "today" in Europe/Istanbul, plus the override.
  - **Formatting.** Formatters that follow the Yazım conventions: TL, dates with weekday, "09.30", "%0,2", and thousands separators. The build reuses them, so the page has exactly one formatting implementation.
  - **Helpers:**
    - a case helper that handles Turkish İ/ı;
    - the plain-text summary used by "Özeti kopyala".
- **Check:**
  - `node --test` passes at least 30 cases, covering every phone variant, the totals, the party limits and every override date in B6;
  - the tests run under TZ=Europe/Istanbul, Pacific/Honolulu and Asia/Tokyo, and one test asserts that the time zone actually took effect;
  - I re-run the tests when the part comes back.

### P6: Build and integration
- **Effort:** xhigh. A long unattended build that turns four parts into one file.
- **Inputs:** brief.md, plan.md, work/00-tools/, work/01-research/, work/02-direction/, work/03-copy/, work/04-art/, work/05-logic/.
- **Output:** `work/06-build/`, containing src/, build.mjs, dist/index.html, shots/, build-log.md and HANDOFF.md (including a budget table).
- **Work:**
  - **Inputs.** Copy the parts into `src/parts/`. Never edit the originals, and log every patch.
  - **build.mjs** runs these steps in order:
    1. run the logic tests;
    2. fill the `{{…}}` placeholders using P5's formatters;
    3. pre-render the data-driven HTML;
    4. inline the CSS, JS and SVG, and embed farm.json once;
    5. write `dist/index.html`;
    6. run check-static, failing on missing-string markers, unresolved placeholders or anything forbidden.
  - **Approach.**
    - Build mobile-first, against the wireframe and the chosen prototype.
    - Use progressive enhancement: reveal effects switch on only when JS is running and motion is allowed.
    - The forms behave exactly as §2.5 describes.
  - **Milestone M1.** First build the hero and `#siparis` at 390 and 1440, and compare them with the prototype. Correct any drift before going on.
  - **Self-QA.**
    - Run tests A–F in the harness, against `dist/index.html`, in both engines.
    - Look at every screenshot.
- **Check:** quick protocol (§7), run by me when the part comes back.

### P7a: Functional, responsive, accessibility and performance QA
- **Effort:** high. The final check of internal work.
- **Inputs:** brief.md, plan.md, work/00-tools/, work/02-direction/, work/06-build/dist/index.html.
- **Output:** `work/07-qa/functional.md`, plus shots/.
- **Work:**
  - Run tests A–E in full, in both engines.
  - Then try to break the page:
    - empty and invalid input; emoji; 1,000-character text; phone numbers pasted with spaces;
    - rapid double clicks; the back and forward buttons; resizing and rotating mid-flow;
    - JS off; fonts blocked; 200% zoom;
    - keyboard only;
    - the clock stubbed and the time zone overridden.
  - Validate the HTML locally, if a validator can be installed.
  - Write findings in the unified format (§5). Fix nothing.

### P7b: Turkish language and consistency QA
- **Effort:** high. The final check of every word and number a visitor reads.
- **Inputs:** brief.md, plan.md, work/00-tools/, work/01-research/facts.md, work/02-direction/, work/03-copy/, work/06-build/dist/index.html.
- **Output:** `work/07-qa/language.md`.
- **Work:**
  - First, put the page into every state: errors, both confirmations, the season-over state, and each badge state via the override.
  - Then extract the text from each state, including aria text, the title and meta.
  - Proofread it against TDK rules and the Yazım conventions.
  - Check F2 on screenshots in both engines.
  - Check F3 against facts.md, and F4 against farm.json, recomputing the arithmetic.
  - Check the honesty wording (A6), and the banned words.
  - Write every finding as an exact replacement, "X → Y", with its location.

### P7c: Design critique
- **Effort:** xhigh. Judging against an award-level bar, and prescribing the fixes, is design work.
- **Inputs:** brief.md, plan.md, work/00-tools/, work/01-research/benchmarks.md and benchmarks/, work/02-direction/, work/06-build/.
- **Output:** `work/07-qa/design.md`.
- **Work:**
  - Take fresh screenshots at every viewport, and frame sequences of every animation.
  - Run the five-second test.
  - Score the Awwwards criteria and the developer criteria, with evidence for each score.
  - Compare the page side by side with the benchmarks, at the same viewports.
  - List at most 25 improvements:
    - each located by section id and viewport;
    - each prescribed at the level of the CSS, SVG or JS change;
    - each marked "required for the bar" or "nice to have".
  - Add a **remove list**: what to cut, or what to calm down.
  - Change the direction only where the build fails the bar because of the direction itself.

### P7d: Visitor panel
- **Effort:** high. Structured persuasion evidence; a check, not design.
- **Inputs:** brief.md, the §7 panel protocol, work/00-tools/, work/06-build/dist/index.html.
- **Output:** `work/07-qa/panel.md`.
- **Work:** run the protocol in §7. Report each persona's answers, the aggregate, and every reason a persona would not act (a "stopper").

### G2: Owner triage (me)
- **Effort:** xhigh. Deciding what to change, and what to protect, across five reports is a judgement call.
- **Inputs:** the five §6 step-6 reports (`work/07-qa/` functional, language, design and panel, plus P6's HANDOFF).
- **Output:** `work/owner/G2-fixlist.md`.
- **The list:**
  - **Priority order:** brief rules, then honesty, then broken function, then accessibility, then language and data, then persuasion stoppers, then design polish.
  - Duplicates are removed.
  - Each item has an ID, a severity, a location, a prescribed fix and the test that proves it.
  - Declined items are listed with the reason.
  - A **do-not-change list** protects what works, drawn from P7c's strengths, P7d's positive findings and my own judgement.
  - No new features. The additions list in §2.3 is closed.

### P8: Polish pass
- **Effort:** xhigh. A long pass over the whole page that must not break anything.
- **Inputs:** brief.md, plan.md, work/00-tools/, work/06-build/, work/owner/G2-fixlist.md, work/07-qa/, and all part folders as read-only.
- **Output:** `work/08-polish/` (a copy of the build), with dist/index.html, shots/, and a HANDOFF containing a table of closed findings with evidence and a diff summary.
- **Work:**
  - Apply the list in order, leaving everything on the do-not-change list untouched.
  - After each S1 or S2 fix, re-run its tests.
  - At the end, run tests A–F in full.
- **Check:** I verify each closure against its evidence, not against the table.

### P9: Final jury gate
- **Effort:** xhigh. Judging the page against verified winners; this gate cannot be waived.
- **Inputs:** brief.md; the bar from §1, tests G1–G5 and the gate protocol in §7; work/00-tools/; work/01-research/benchmarks.md and benchmarks/; work/08-polish/dist/index.html. Deliberately **not** the critique or the panel reports.
- **Output:** `work/09-gate/jury-gate.md`, plus shots/.
- **Work:** run the gate protocol in §7.
- **On failure:** the findings go to a targeted P8 pass (fresh agent, xhigh), covering only the failing items and respecting the do-not-change list. Then a fresh P9 runs again. This repeats until the gate passes. I cannot waive it.

### Owner: assembly and trial (me)
- **Effort:** high. The final check of the whole before it leaves the team.
- **Inputs:** work/08-polish/ (after the gate has passed), and all reports.
- **Output:** `delivery/index.html`, plus `work/10-assembly/` containing acceptance.md, shots/ and index.pre-audit.html.
- **Work:**
  1. Copy the polished build to `work/10-assembly/` and rebuild.
  2. Run the full protocol (A–G) against `work/10-assembly/dist/index.html`.
  3. Read the whole page as a visitor would, top to bottom, on the 390 capture and again on the 1440 capture, and note anything that breaks the spell.
  4. Make only trivial fixes. Log each one, rebuild, and re-run the affected tests.
  5. Copy `dist/index.html` to `delivery/index.html`.
  6. Run A1–A5 against `delivery/index.html` itself, and confirm it is byte-identical to the build.
  7. Keep the pre-audit snapshot.

### Audit
External. The independent auditor reads and tries `delivery/index.html`. I do not dispatch it.

### R1: Owner audit triage (me)
- **Effort:** high.
- **Output:** `work/owner/audit-triage.md`.
- **Work:**
  - Reproduce every finding on `delivery/index.html`.
  - Decide what to fix:
    - every S1 and S2 finding is fixed;
    - S3 and S4 findings are fixed unless the risk outweighs the value, in which case the reason is recorded;
    - excluded items stay excluded unless the brief requires them.
  - Write an ordered fix brief with a do-not-change list.
  - I may apply trivial fixes myself, logged.

### R2: Audit fix
- **Effort:** high. I dispatch it at xhigh instead if the triage brief contains design-level changes.
- **Output:** `work/11-audit-fix/` (a copy of the assembly), with dist/index.html, shots/, and a HANDOFF containing a closed-findings table with evidence and a diff summary.
- **Work:** apply the fix brief, then re-run the self-checks.

### R3: Owner final trial and re-delivery (me)
- **Effort:** high.
- **Output:** `delivery/index.html` (final), plus `work/12-final/trial.md`.
- **Work:**
  1. Run the full protocol again on `work/11-audit-fix/dist/index.html`: all of it, not only the areas touched.
  2. Diff against the pre-audit snapshot, so that only intended changes ship.
  3. If any change touched the design, a fresh P9 runs on the changed page before re-delivery.
  4. Copy the file to `delivery/index.html`, and run A1–A5 on the delivered file itself.

---

## 5. Seams, contracts and formats

| Seam | Contract | Owner | Verified by |
|---|---|---|---|
| research → everyone | facts.md safe phrasing; do-not-claim list | P1 writes it, I enforce it | P7b (F3) |
| direction → copy | wireframe ids, keys and budgets; voice; Yazım conventions; error codes; spine lines | P2 | P3 self-check; P7b |
| direction → art | art briefs, art contract, tokens.css, style tile, motifs, prototype | P2 | P4 self-check; P6 intake; P7c |
| direction → logic | farm.json schema; interaction spec | P2 | P5 tests; P6 intake |
| farm.json after G1 | frozen and versioned; only I change it (including P3's merged numbers) | me | P7b (F4) |
| logic → build | API.md; build.mjs re-runs the tests | P5 | P6 |
| copy → build | `sectionid.role` keys; `{{data}}` placeholders; strings.json; `[[EKSİK]]` markers | P3 | P6; P7b on the built text |
| art → build | assets that follow the contract; assets.md placement notes; patches logged | P4 | P6; P7c |
| build → reviews | dist/index.html plus HANDOFF | P6 | P7a–d |
| reviews → polish | G2-fixlist.md with the do-not-change list | me | P8; me (closures against evidence) |
| polish → gate → delivery | gate report; acceptance.md | P9; me | me |
| audit → revision | audit-triage.md | me | R3 |

**Art contract.** P2 writes it out in full. These points are fixed:
- Colours come only from tokens.css.
- Every id inside an asset carries the asset's prefix. Assets used more than once generate a separate id for each copy. Ids must be unique in the whole document, and all inline SVGs share one document.
- No global selectors; every class starts with `art-`.
- Every asset has a viewBox and no fixed size, and its crop at each breakpoint is documented.
- Each generative piece is one function, seeded so it draws the same thing every time. It handles high-density screens and resizing, and returns a cleanup function.
- Motion:
  - CSS animation uses transform and opacity only;
  - loops pause off-screen and in hidden tabs;
  - reduced motion shows the final still frame.
- Decorative art is `aria-hidden`. Meaningful art has `role="img"` and a Turkish name from strings.json.
- Budgets: the hero at most 8 ms per frame at 4× CPU on a 390 px screen; all art at most 180 KB of source; DOM contribution counted against the 2,000-element limit; grain from a small tile.

**Unified findings format** (P7a–d, P9, the audit triage):
`ID | severity | test ID | section id + viewport | what | evidence path | proposed fix`

**Severities:**
- **S1** blocker: breaks use, honesty or the brief.
- **S2** major: hurts the bar.
- **S3** minor.
- **S4** nit.

**HANDOFF.md template** (every part):
1. What I produced, with paths.
2. Checks I ran, their results and evidence paths.
3. Decisions I made, and why.
4. Deviations from the plan or the contracts, and why.
5. Known gaps.
6. How the owner can verify it in five minutes.
7. Time spent.

**Owner's operating rules.**
- I keep `work/owner/LOG.md`, recording what was dispatched with which inputs, what came back, and the intake result.
- No part is dispatched until all of its inputs have passed my intake check.
- A part that fails intake gets one re-dispatch, to a fresh agent with my notes.
- If it fails again, I either fix it myself or re-dispatch it at a higher effort.
- Only §2.3 additions may be cut: from item 7 upwards, by me, with the reason recorded. Core items, behaviours and brief rules are never cut.

---

## 6. Order, gates and estimates

| Step | Part | Runs | Depends on | Gate or intake after | Estimate |
|---|---|---|---|---|---|
| 1 | P0 tools ∥ P1 research | parallel | none | intake: self-test re-run; 5 facts spot-checked | 1 h |
| 2 | P2 direction | alone | 1 | G1 | 3 h |
| 3 | G1 owner gate | owner | 2 | farm.json frozen | 0.5 h |
| 4 | P3 copy ∥ P4 art ∥ P5 logic | parallel | 3 | intake of all three; P3's numbers merged into farm.json | 3.5 h + 0.5 h |
| 5 | P6 build | alone | 4 | quick protocol | 3.5 h |
| 6 | P7a ∥ P7b ∥ P7c ∥ P7d | parallel | 5 | none | 1.5 h |
| 7 | G2 owner triage | owner | 6 | none | 0.75 h |
| 8 | P8 polish | alone | 7 | closures verified against evidence | 2.25 h |
| 9 | P9 final jury gate | alone | 8 | pass, or loop back to P8 and then P9 (≈ 2.5 h per loop) | 1.25 h |
| 10 | Owner assembly and trial | owner | 9 | delivery | 1.25 h |
| 11 | Independent audit | external | 10 | none | n/a |
| 12 | R1 owner audit triage | owner | 11 | none | 0.5 h |
| 13 | R2 audit fix | alone | 12 | none | 1.5 h |
| 14 | R3 owner final trial and re-delivery | owner | 13 | re-delivery (with a fresh P9 if the design changed) | 1 h |

- **Time to first delivery:** about 19 hours of wall time, plus about 2.5 hours for each gate loop.
- **Revision round:** about 3 hours, plus about 1.25 hours if P9 has to run again.

---

## 7. Checks

**Viewport matrix.**
- 320×568, 360×800, 390×844, 430×932, 844×390 (phone landscape), 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080, 2560×1440.
- Extra captures at 390×844 with device scale 3 and at 1440×900 with device scale 2.
- Full-page captures are taken at the true viewport after scrolling through the page.

**Every protocol names the file it tests.** The harness takes the path as an argument. No protocol hard-codes `delivery/`.

**Quick protocol** (intake after P6; about 15 minutes):
1. check-static.
2. First-screen and full-page captures at 390 and 1440.
3. Console log.
4. Both form flows as scenarios.
5. Storage check.

**Full protocol** (P7a, the end of P8, my assembly, R3):
- All of tests A–G, using the harness.
- Firefox and WebKit runs where P0 proved them.
- My top-to-bottom read on the 390 and 1440 captures.

**Visitor panel** (P7d, and again in P9). Six simulated readers. This is a model simulation used to find gaps; it stands in for user research and is not proof. Each persona reads only the page: the rendered text in reading order, plus screenshots at their own device size.

The personas:
1. A 46-year-old cook in İstanbul who buys premium oil online, on a phone at 390 px.
2. A 34-year-old office worker in İzmir looking for New Year gifts, on a desktop at 1440 px.
3. İzmir parents with children aged 6 and 10, planning a weekend, on a phone at 390 px.
4. A price-sensitive 61-year-old from Manisa who is sceptical of "boutique" claims, on a phone at 360 px.
5. A food-curious couple in their late twenties who know Urla's wine route, on a phone at 430 px.
6. A 72-year-old buyer using 200% zoom, on a tablet at 768 px.

Each persona answers seven questions:
1. In your own words, what is this and where is it?
2. What makes this oil different?
3. What does the main product cost, and is it worth it?
4. What happens on a harvest day, what would it cost your party, and which date would you pick?
5. Would you order, or join a harvest day, now? Yes, maybe or no, and why?
6. What is the one thing that would stop you?
7. Is anything confusing, untrustworthy or hard to read?

**Pass (G3):**
- Every persona answers questions 1–4 correctly from the page alone.
- At least four of the six say a firm yes to at least one action, with reasons taken from the page.
- Every "no" or "maybe" names a stopper, which goes into triage.
- No persona is confused about what a submission actually did.
- At P9, no S1 or S2 stopper remains.

**Jury gate** (P9; this is G4):
1. The judge scores each benchmark first, then ours, from identical evidence: the first screen plus three scroll positions at 1440×900 and 390×844, plus a live try of each site's main interaction.
2. Scores use the Awwwards criteria and weights, on a 1–10 scale, with a one-line justification and an evidence path for every score.
3. **Pass** requires all of the following:
   - ours is at or above the benchmark median on all four criteria;
   - ours ranks in the top quarter of the combined set on Design or on Creativity;
   - the panel (G3) passes;
   - the developer criteria (G5) pass, with tests A–E clean.
4. Anything else fails, and the gate loop in §4 P9 runs. Nobody may waive the gate.

---

## 8. Delivery
- **`delivery/index.html`** is a single, self-contained, readable UTF-8 file. It opens by double-click or from any static host, on desktop and phone browsers. It is the only file in `delivery/`, and only I write there.
- **`work/`** holds every part's outputs, logs, screenshots, reviews, gate reports and my trial records, so that any element of the page can be traced to a decision. None of it is delivered: no readme, no assets folder, no second page.

---

## 9. Risks

| Risk | Mitigation | Owner |
|---|---|---|
| The page grows into a small shop or booking application | Closed core and additions lists (§2.2–2.4); cut rule; G2 rejects new features; P7c's remove list | me |
| Browser-only forms seem to send, book or promise something | Honest-outcome rules (§2.5); tests A6 and A7; P7b checks the wording; the panel checks for confusion | P3, P6, P7b, P7d |
| Storytelling hides the farm, the oil or the two actions | Guard rails on the spine; five-second test; visitor panel; remove list | P2, P7c, P7d |
| Code-drawn art looks generic or like clip-art | One art owner at xhigh; style tile and motifs at G1; side-by-side critique; jury gate | P2, P4, P7c, P9 |
| Scored "good" internally but not at first-place level | A comparative gate against verified winners, run by a fresh judge, that cannot be waived | P1, P9, me |
| Persuasion never actually tested | Visitor panel in step 6 and again in P9; stoppers triaged | P7d, P9, G2 |
| The Turkish reads as translated, or contains errors | Voice rules and banned list; Yazım conventions; proofreading on the *built* text in every state; my full read-through | P2, P3, P7b, me |
| Turkish rendering bugs (İ/ı, fi ligature, ğ/ş missing in a weight) | Font shortlist proven by screenshot; lang="tr"; Turkish-aware case helper; F2 in both engines, since browser support varies | P1, P2, P5, P7b |
| Failures on phones | Mobile-first build; 11-viewport matrix; tests C3–C5; `100dvh` with a fallback; safe-area insets | P6, P7a |
| Safari cannot be tested here | Chrome and Firefox where P0 proves them, plus WebKit if installable; conservative CSS with `@supports` fallbacks | P0, P6, P7a |
| Firefox snap quirks (private /tmp, unclear capture mode) | P0 measures both; output kept under the job folder; any gap recorded, never silent | P0 |
| Animation costs smoothness or comfort | Budgets measured at 4× CPU; transform and opacity only; pause off-screen; still frame under reduced motion | P4, P6, P7a |
| Content invisible in screenshots or without JS | Reveal effects switch on only with JS; still hero inline; true-viewport full-page captures after a scroll-through | P0, P6 |
| Inline SVGs break each other | Art contract id rules; duplicate-id checks in P4 and in the harness | P2, P4, P0 |
| Numbers drift between sections | farm.json frozen as the single source; placeholders; one formatter; F4 recomputation | P2, P3, P5, P7b |
| Dates and time zones go wrong | "Today" in Istanbul; override; stubbed clock and time-zone tests in both P5 and P7a | P5, P7a |
| November harvest days conflict with Erkence ripening before November | Research on Urla's other varieties and terraces; P2 coherence rule; G1 recomputation | P1, P2, me |
| Overclaiming bitterness, history or health | Taste calibrated to Erkence's documented profile; verified Klazomenai wording; health claims banned | P1, P3, P7b |
| Collisions with the real world | names-in-use.md and a recorded web check; no contact details; no third parties | P1, P2, P3 |
| Google Fonts blocked or slow | Metric-matched fallbacks; fonts-blocked test; font byte budget | P2, P6 |
| Parts drift apart at the seams | Fixed ids, keys and schema; patch logs; do-not-change lists; review on the built page | me |
| A long build loses its thread | build-log.md; milestone M1 | P6 |
| Gate loops cost time | Targeted passes only; do-not-change list; estimated at about 2.5 h per loop | me |
| Only one revision round after the audit | Every finding reproduced first; a fresh agent fixes, I verify with the full protocol; diff; P9 re-run if the design changed | me |

---

## 10. Standing orders (top of every dispatch)
1. Read the brief and your plan text in full before you start. Use only your listed inputs, and treat them as read-only. Write only inside your own output folder. Never touch `delivery/`.
2. Ask no one anything. Decide, and record each decision, with its reason, in your HANDOFF.
3. §2.4 (excluded), §2.6 (forbidden) and §2.7 (visual sources) are absolute. If an input breaks them, do not carry the breach forward; flag it.
4. Everything a visitor sees or hears is Turkish. Internal documents are in English.
5. Sources of truth:
   - real-world claims come only from facts.md;
   - invented numbers come only from farm.json;
   - visible strings come only from the copy deck.

   A missing string becomes `[[EKSİK: key]]` and goes in your HANDOFF.
6. Use the tools in `work/00-tools`:
   - look at your screenshots, don't just produce them;
   - measure everything that has a budget;
   - every check names the file it tests.
7. Never upload the page or its text to any external validator or service. Anything downloaded (axe-core, for example) stays in `work/00-tools`. Nothing downloaded enters the page.
8. Finish with `HANDOFF.md` (§5). Stop when your done-criteria are met, or state exactly which one is not.

---

## 11. Claims checked at source (24 October 2026)

**Awwwards**
- Criteria and weights (Design 40, Usability 30, Creativity 20, Content 10); at least 18 jurors; three outlying scores dropped; Honorable Mention at 6.5 or above; Site of the Month reviews the eight highest-scoring sites again: [awwwards.com/about-evaluation](https://www.awwwards.com/about-evaluation/).

**WCAG 2.2**
- SC 2.5.8 Target Size (Minimum) is AA at 24×24; SC 2.4.11 Focus Not Obscured (Minimum) is AA: [W3C, What's new in 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/).
- SC 2.5.5 Target Size (Enhanced) is AAA at 44×44: [W3C Understanding 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html).

**TDK**
- "%25", "4.567", "15,2", "17.30'da": [Sayıların yazılışı](https://tdk.gov.tr/icerik/yazim-kurallari/sayilarin-yazilisi/).
- "09.15'te": [Nokta](https://tdk.gov.tr/icerik/yazim-kurallari/nokta/).
- Month and day names capitalised only in specific dates: [Büyük harfler](https://tdk.gov.tr/icerik/yazim-kurallari/buyuk-harflerin-kullanildigi-yerler/).

**MDN**
- `text-transform` applies Turkish case pairs according to `lang`, and support varies by browser: [MDN text-transform](https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform).
- Module scripts under file:// cause CORS errors: [MDN Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).
- Ids must be unique in the whole document: [MDN id](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/id).

**iOS input zoom**
- iOS Safari zooms into inputs smaller than 16 px. Secondary sources: [CSS-Tricks](https://css-tricks.com/?p=339455), [Telerik KB](https://docs.telerik.com/devtools/aspnet-ajax/knowledge-base/common-disable-autozoom-input-safari-iphone).

**Node**
- Global WebSocket: no flag needed since v22.0, stable since v22.4: [Node globals](https://nodejs.org/docs/latest-v22.x/api/globals.html).
- `node:test` is stable since v20, run with `node --test`: [Node test](https://nodejs.org/docs/latest-v22.x/api/test.html).

**Chrome DevTools Protocol**
- Emulation has setCPUThrottlingRate, setEmulatedMedia, setDeviceMetricsOverride, setTouchEmulationEnabled and setTimezoneOverride: [Emulation.pdl](https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/pdl/domains/Emulation.pdl).
- Page has captureScreenshot (with captureBeyondViewport) and startScreencast: [Page.pdl](https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/pdl/domains/Page.pdl).
- Network: setBlockedURLs is experimental, and its `urls` parameter is deprecated in favour of `urlPatterns`; emulateNetworkConditions is deprecated: [Network.pdl](https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/pdl/domains/Network.pdl).

**Headless browsers**
- Chrome headless flags `--dump-dom`, `--screenshot` with `--window-size`, `--timeout` and `--virtual-time-budget`: [Chrome headless CLI](https://developer.chrome.com/docs/automation-and-testing/headless-cli).
- Firefox `-screenshot` with `--window-size`: [Mozilla Hacks](https://hacks.mozilla.org/2017/12/using-headless-mode-in-firefox/).
- The Firefox snap has a private /tmp: [Snapcraft forum](https://forum.snapcraft.io/t/firefox-snap-can-not-download-to-tmp/31403).

**Google Fonts**
- CSS2 API supports `display=` and `wght@a..b` axis ranges: [Google Fonts CSS2](https://developers.google.com/fonts/docs/css2).

**Content facts**
- **Klazomenai workshop, 6th century BC.** The two sources word it differently, so the page uses the safer wording:
  - Urla municipality document, citing Wikipedia: "tanımlanabilen en eski": [Urla Belediyesi](https://www.urla.bel.tr/Upload/file/files/Nalan%20QR.pdf);
  - Yeni Asır, 13 July 2026: "dünyanın bilinen en eski … tesislerinden biri": [Yeni Asır](https://www.yeniasir.com.tr/yasam/2026/07/13/turk-zeytinyaginin-hikayesi-dunyaya-anlatildi).
- **Erkence:** grown especially in Seferihisar, Karaburun and Urla; named for early ripening; ready before November; small fruit with a high oil content; the oil is fruity with a soft finish: [Doğa Derneği](https://dogadernegi.org/en/wp-json/wp/v2/posts/25521).
- **Olive leaves:** opposite, lanceolate to elliptic, silvery underneath: [Oregon State](https://landscapeplants.oregonstate.edu/plants/olea-europaea), [NC State](https://plants.ces.ncsu.edu/plants/olea-europaea).
- **Erkenci Kuş:** Star TV, 2018–19: [Wikipedia](https://en.wikipedia.org/wiki/Erkenci_Ku%C5%9F).
- **"Natürel sızma"** as a category name (background only; the page cites no regulation): [TGK tebliğ via Lexpera](https://www.lexpera.com.tr/mevzuat/tebligler/turk-gida-kodeksi-zeytinyagi-ve-pirina-yagi-tebligi-2017-26).

**Time and calendar**
- Turkey on UTC+3 all year since 2016: [Wikipedia](https://en.wikipedia.org/wiki/Daylight_saving_time_in_Turkey).
- 29 Ekim 2026 is a Thursday; 28 Ekim is a half-day holiday from 13.00: [Yeni Ankara](https://www.yeniankara.com.tr/guncel/29-ekim-2026-hangi-gune-denk-geliyor-hangi-kurumlar-kapali-olacak-134726), [Enuygun](https://www.enuygun.com/resmi-tatil-gunleri/).
- Weekdays computed by me from 1 January 2026 being a Thursday: 24 October is a Saturday, 31 October a Saturday, 29 November a Sunday. P1 and G1 recheck these with `date -d`.

**This machine, measured on 24 October**
- Node headers 22.23.3; npm 10.9.9; `/usr/bin/python3.14`; git.
- Chrome's wrapper script at `/opt/google/chrome/google-chrome`.
- `/usr/bin/firefox` is the snap wrapper, and the firefox snap is installed.
- Noto fonts present.
- No Playwright cache, and no global Lighthouse, html-validate or Playwright install.
- `brief.md` is the only file in the job folder.

**Signing time**
- [timeapi.io](https://timeapi.io/api/time/current/zone?timeZone=Europe%2FIstanbul), Europe/Istanbul.

---

## DISPATCH

- **1a** · P0 Test & screenshot harness · medium · ordinary tooling code with a self-test; every later part relies on it · brief.md, plan.md · `work/00-tools/README.md`
- **1b** · P1 Facts, market, fonts & benchmarks · medium · standard research: sourced facts, prices, the 2026 calendar, a proven Turkish font shortlist, verified award winners to judge against · brief.md, plan.md · `work/01-research/facts.md`
- **2** · P2 Creative direction, brand & farm bible · max · every later part inherits this concept, system and data, so it decides whether the page can win · brief.md, plan.md, work/00-tools/, work/01-research/ · `work/02-direction/direction.md`
- **3** · G1 Owner gate on direction (me) · high · a check of internal work where it matters most; freezes farm.json · work/01-research/, work/02-direction/ · `work/owner/G1-direction.md`
- **4a** · P3 Copy deck · high · the final Turkish text every visitor reads, including the honest-outcome lines · brief.md, plan.md, work/01-research/, work/02-direction/ · `work/03-copy/copy.md`
- **4b** · P4 Illustration & motion library · xhigh · one owner draws every visual, giving the page a single hand; long, design-level, performance-bound · brief.md, plan.md, work/00-tools/, work/01-research/facts.md, work/02-direction/ · `work/04-art/showcase.html`
- **4c** · P5 Form & date logic · high · code that must be correct, unit-tested on its own, including time-zone cases · brief.md, plan.md, work/01-research/calendar-2026.md, work/02-direction/farm.json, work/02-direction/direction.md · `work/05-logic/logic.js`
- **5** · P6 Build & integration · xhigh · a long unattended build that turns four parts into one file · brief.md, plan.md, work/00-tools/, work/01-research/, work/02-direction/, work/03-copy/, work/04-art/, work/05-logic/ · `work/06-build/dist/index.html`
- **6a** · P7a Functional, responsive, accessibility & performance QA · high · the final check of internal work · brief.md, plan.md, work/00-tools/, work/02-direction/, work/06-build/dist/index.html · `work/07-qa/functional.md`
- **6b** · P7b Turkish language & consistency QA · high · the final check of every word and number, in every state of the built page · brief.md, plan.md, work/00-tools/, work/01-research/facts.md, work/02-direction/, work/03-copy/, work/06-build/dist/index.html · `work/07-qa/language.md`
- **6c** · P7c Design critique · xhigh · judging against an award-level bar and prescribing the fixes is design work · brief.md, plan.md, work/00-tools/, work/01-research/benchmarks.md and benchmarks/, work/02-direction/, work/06-build/ · `work/07-qa/design.md`
- **6d** · P7d Visitor panel · high · structured persuasion evidence from simulated readers; a check, kept naive about the plan · brief.md, the §7 panel protocol, work/00-tools/, work/06-build/dist/index.html · `work/07-qa/panel.md`
- **7** · G2 Owner triage with fix list and do-not-change list (me) · xhigh · deciding what to change and what to protect across five reports is a judgement call · the five §6 step-6 reports (work/07-qa/ plus work/06-build/HANDOFF.md) · `work/owner/G2-fixlist.md`
- **8** · P8 Polish pass · xhigh · a long pass over the whole page that must not break anything; repeated, targeted, if the gate fails · brief.md, plan.md, work/00-tools/, work/06-build/, work/owner/G2-fixlist.md, work/07-qa/, part folders read-only · `work/08-polish/dist/index.html`
- **9** · P9 Final jury gate (fresh, cannot be waived; loops with P8 until it passes) · xhigh · comparative judging against verified winners, plus the persuasion and developer criteria · brief.md, the bar from §1, tests G1–G5, the §7 gate protocol, work/00-tools/, work/01-research/benchmarks.md and benchmarks/, work/08-polish/dist/index.html · `work/09-gate/jury-gate.md`
- **10** · Owner assembly & trial (me) · high · the final check of the whole before delivery: rebuild, full A–G, read-through at 390 and 1440, byte-identical copy · work/08-polish/ (gate passed), all reports · `delivery/index.html`
- **11** · Independent audit (not dispatched by me) · n/a · reads and tries the delivered page · delivery/index.html · auditor's report
- **12** · R1 Owner audit triage (me) · high · reproduce every finding, then decide and brief the fixes with a do-not-change list · auditor's report, delivery/index.html, work/10-assembly/ · `work/owner/audit-triage.md`
- **13** · R2 Audit fix · high (dispatched at xhigh if the brief contains design-level changes) · code that must be good, applied to a defined list by a fresh agent, so that I verify rather than grade my own fixes · work/10-assembly/, work/owner/audit-triage.md, work/00-tools/, with work/02-direction/ and work/03-copy/ for reference · `work/11-audit-fix/dist/index.html`
- **14** · R3 Owner final trial & re-delivery (me) · high · full protocol again (not a spot check), diff against the pre-audit snapshot, fresh P9 if the design changed, then the one revision round closes · work/11-audit-fix/, work/10-assembly/index.pre-audit.html · `delivery/index.html`

Signed: owner, 2026-10-24 18:56 (Europe/Istanbul, UTC+3)