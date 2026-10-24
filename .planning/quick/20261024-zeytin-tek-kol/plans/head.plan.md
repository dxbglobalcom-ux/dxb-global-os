# WORK PLAN: Urla family olive farm, one landing page

**Owner:** me. **Plan date:** 24 October 2026. **Job folder:** the folder that holds `brief.md`. All paths are relative to it. The signed plan is saved as `plan.md` next to the brief, and every dispatch gets both files.

---

## 1. Scope

**The job.** One Turkish landing page for a fictional farm in Urla (İzmir). The same family has grown olives there for three generations. It makes early-harvest extra-virgin olive oil and opens its grove to visitors on autumn harvest days.

The page has two jobs:
- make the visitor know and like the farm;
- turn that liking into one of two actions: **order the oil** or **book a harvest day**.

Everything about the farm is ours to invent: name, family, story, products, prices, dates and numbers. Nothing about the real world is invented. Real places, olive varieties, local history and olive-oil science are all sourced.

**The brief's rules, and how I will enforce them.**
1. **One page.** One HTML document. Navigation is by in-page anchors only. Order and booking confirmations appear inside the page. There is no thank-you page, sub-page, route, blog or account.
2. **No photos.** Nothing visible comes from an image, a video or any other visual file. Every picture is inline SVG, CSS or canvas, drawn by the page's own code. Google Fonts is the only external resource.
3. **No backend.** No form sends anything over the network. The browser handles every submission: validation, confirmation and local storage.
4. **Turkish.** Every word a visitor can see or hear is Turkish. That includes the page title, aria labels, error messages and the calendar file.
5. **Out of scope means absent.** The page has no legal, KVKK, regulatory or contract text, and no control that implies one. So there is no consent checkbox, cookie notice, privacy or terms link, sales contract or return-policy wording.
6. **Nobody asks the client anything.** Each agent decides, writes the decision down and moves on.
7. **Delivery** is `delivery/index.html`, and it works on desktop and on phone.

**The bar, made testable.** "Ferrari level, a candidate for first place in international competitions" means a page that an Awwwards, CSSDA or FWA jury would shortlist:
- a concept only this farm could own, carried by art direction made entirely in code;
- flawless at every width from 320 px to 2560 px;
- every state designed: empty, error, success, sold out, season over;
- engineering a developer jury respects: semantic, accessible, fast, with clean readable source;
- Turkish of native-writer quality, and facts a connoisseur cannot fault.

§2.5 turns this bar into tests.

**Season context.** On 24 October 2026 the harvest is under way. The first early-harvest oil is pressed and on sale, and harvest days run on the coming weekends. The page is written for the 2026 season. It must still behave sensibly if someone opens it after the season ends (§2.3).

**Audience (assumed).**
- Food-literate city buyers in İzmir and İstanbul, buying for themselves or as gifts. New Year is close.
- İzmir-area families, couples and friends looking for an autumn day out.
- Most of them arrive on a phone.

---

## 2. The delivered page

### 2.1 Form
- **One self-contained file**, `delivery/index.html`:
  - UTF-8, document language `tr`;
  - CSS inline;
  - JS in classic inline scripts: no modules, no external scripts, and no third-party library, even inlined;
  - all art inline;
  - the farm data embedded once, as a JSON script block.
- **External requests: Google Fonts only.**
  - At most 2 families, variable fonts where possible, `display=swap`, preconnect.
  - Metric-matched fallback faces, so the page still looks designed if the fonts are blocked.
- **Colour scheme.** One art-directed scheme; no automatic dark mode. Forced-colors mode must stay usable.
- **Works from anywhere.** It behaves the same opened by double-click (file://) or from any static server, with zero console errors or warnings.
- **Readable source.** Indented and sectioned, because a jury reads source. Size ≤ 400 KB; target ≤ 250 KB.
- **Head details.**
  - Inline SVG favicon, Turkish title and meta description, theme-color, Open Graph text tags.
  - JSON-LD for the farm, its products and the harvest-day events is a *should*, not a *must*.

### 2.2 Content: the sections that must exist
This is the default order. P2 may reorder or merge sections but may not drop any item.

1. **Header.**
   - SVG wordmark.
   - Anchor links: Hikâye · Yağımız · Hasat Günleri · SSS.
   - An order button showing the live item count.
   - An "İçeriğe geç" skip link.
   - A compact version on phones.
2. **Hero.**
   - The drawn olive grove.
   - An H1 plus a one-sentence sub-line. Between them they say: Urla, three generations, early-harvest extra-virgin olive oil.
   - Primary CTA: order. Secondary CTA: harvest day.
   - A season line built from data (illustration only: "2026 hasadı sürüyor · ilk sıkım 9 Ekim").
3. **Proof strip.** 3–5 numbers from data: founding year, number of trees, hours from branch to bottle, acidity, polyphenols.
4. **Three generations.** One person per generation, each with years, one concrete deed and one human detail, plus a drawn visual.
5. **Place and variety.**
   - Urla, the Erkence olive, the imbat breeze, soil and sea.
   - Urla's ancient olive-oil heritage (Klazomenai), in the hedged wording facts.md allows.
6. **Early harvest, explained interactively.** The default is the "olive clock" (§3), with a text equivalent. It answers three questions: why the oil is green, why it is bitter and peppery, and why it costs more.
7. **Branch to bottle.** 5–6 steps, with the real times and temperature from data.
8. **Taste and table.**
   - Tasting notes.
   - An intensity profile (meyvemsi / acı / yakıcı).
   - How to taste.
   - 4–6 food pairings with an Aegean/Urla accent.
   - Storage.
9. **Order.**
   - 3–5 products, each with a drawn packshot, volume, price, price per litre, a two-line description and a quantity stepper.
   - A running summary showing shipping and how far the order is from free shipping.
   - A gift option (wrap + note), collapsed by default.
   - A checkout form.
   - Confirmation shown in place.
10. **Harvest days.**
    - The day's programme as a timeline.
    - Prices: adult, child, and free under a set age.
    - What is included, what to bring, how to get there, what happens in bad weather.
    - Availability by date.
    - A booking form.
    - Confirmation shown in place, with a booking code and a "Takvime ekle" button.
11. **Voices.** Three short, specific, invented testimonials, each signed with a first name and a city.
12. **FAQ.**
    - 7–10 answers.
    - A small "Sorunuz mu var?" form (name, e-mail, message), handled in place. This form is the page's only contact channel.
13. **Close and footer.**
    - A dual CTA.
    - Location at village level only ("tam konum kayıttan sonra paylaşılır").
    - Season information, the mark, © 2026.
    - No legal links, no phone number, no social links.

**Phones:** a bottom action bar (Sipariş · Hasat günü) appears once the hero has scrolled out of view.

### 2.3 Behaviour: what the page must do

**Order**
- Visitors can add products, remove them and change quantities, within per-product limits.
- Subtotal, shipping and total are exact, because they are computed in integer kuruş.
- A free-shipping threshold applies.
- Choosing farm pickup removes shipping and hides the address fields.
- The cart survives a page reload.
- Errors appear when the visitor submits or leaves a field, and clear as soon as the input becomes valid.
- Messages are in Turkish, shown next to the field. An error summary receives focus.
- Common Turkish phone formats are accepted and normalised.
- Double submission is blocked.
- The confirmation shows a reference, the items, the total, and what happens next: payment and delivery are arranged by phone. There is no payment step and no card field.
- After confirmation the cart is cleared, and a link points to the harvest days.

**Booking**
- Dates and seats come from data.
- Each date has one state relative to today in Europe/Istanbul: past, today (closed for booking), sold out, last seats, or open.
- Visitors cannot book more seats than remain, and every booking needs at least one adult.
- The price is computed from the party.
- The confirmation carries a booking code.
- Booked seats are subtracted from availability and stored locally.
- "Takvime ekle" downloads a valid .ics file built in the browser. Times are written in UTC; Turkey is UTC+3 all year round.

**Season over**
- When every date is past, the booking block switches to "2026 hasat günleri tamamlandı — 2027 için haber verelim", with a one-field form.
- A `?bugun=YYYY-MM-DD` override exists for QA. It is invisible otherwise.

**Robustness**
- If browser storage is unavailable, the page falls back to keeping state in memory.
- Without JS, all text is readable. Each form shows one line saying it needs JS.
- The hero shows a complete still picture before any script runs.
- No content depends on an animation to become visible.

**Navigation**
- In-page scrolling is smooth and allows for the sticky header's height.
- The current section is indicated.
- On phones, the bottom bar hides while a form field has focus, and while the form it points to is on screen.
- Nothing depends on hover.

**Motion**
- Motion is purposeful and calm. The page never takes over scrolling.
- Animation loops pause when off-screen or when the tab is in the background.
- With prefers-reduced-motion, the page is still and all content is visible.

### 2.4 Forbidden, both in the page and in every part
- **Images and embeds.** No photo; no raster or vector image file; no video; no iframe or embed of any kind (maps, social posts, video). No icon font, no emoji used as imagery, no CSS background that points to a file or URL. A data URI is allowed only if our own code generates it.
- **External code and tracking.** No request to anything except Google Fonts. No third-party JS or CSS library, CDN, analytics, tracker or chat widget.
- **Network submission.** No form action pointing at a URL, and no fetch, XHR or beacon.
- **Legal and payment.** No legal, KVKK, regulatory or contract text or control. No payment step and no card field.
- **Contact details.** No phone number, WhatsApp link, social handle, or address more precise than the village. Invented contact details could reach real people.
- **Real third parties.** Nothing may suggest a real third party is connected to the farm: no brand, courier, shop, award or medal, competition, certifier or certification mark (including "organik sertifikalı"), press mention or named real person. Real places and history are fine when facts.md sources them.
- **Claims.** No health or medical claims. No world superlatives beyond the exact hedged wording in facts.md. None of the clichés direction.md bans, starting with "sıvı altın", "eşsiz lezzet", "doğanın mucizesi" and "şifa deposu".
- **More than one page.** No sub-page, route, separate thank-you page, blog or login. No pop-up on load and no newsletter modal.
- **Hijacking.** No scroll-jacking and no sound that plays by itself.

### 2.5 Acceptance tests: the definition of done
Every checker uses these IDs.

**A. Brief rules**
- **A1.** One document. Every link is either an in-page anchor or the .ics download.
- **A2.** The static scan (`check-static`, built in P0) finds no forbidden element, URL or link, and every word it flags has been reviewed. The network log shows only fonts.googleapis.com and fonts.gstatic.com.
- **A3.** Submitting any form causes zero network requests.
- **A4.** All visible and announced text is Turkish, including the title, meta tags, aria text, error messages and the .ics file.
- **A5.** The page behaves identically under file:// and http://.

**B. Function** (scripted in the harness, run in both Chrome and Firefox)
- **B1.** Anchors land correctly below the sticky header; the current-section indicator works; the bottom bar shows and hides by its rules.
- **B2.** Cart:
  - adding, removing, steppers and limits all work;
  - totals are correct on the test matrix: below the threshold, exactly at it, 1 kuruş above it, and with pickup;
  - the cart persists across a reload.
- **B3.** Checkout:
  - every error code can be triggered and is shown in Turkish next to its field, and the error summary takes focus;
  - the phone inputs "0532 123 45 67", "+90 532 123 4567", "5321234567" and "0 (232) 123 45 67" pass, and junk fails;
  - double submission is blocked;
  - the confirmation is complete and the cart is cleared.
- **B4.** Booking:
  - date states are correct with `?bugun=` set to 2026-10-24, to 2026-11-07, to the last date, and to the day after the last date;
  - the seat limit, the adult rule and the price all hold;
  - the confirmation appears and the seat deduction persists;
  - the .ics file opens at the correct local time.
- **B5.** The season-over state and its form work.
- **B6.** The early-harvest interactive works with mouse, touch and keyboard. Its text equivalent updates and is announced politely to screen readers.
- **B7.** The FAQ accordion and the question form work.
- **B8.** There are zero console errors or warnings during all of the above, in both browser engines.
- **B9.** With storage blocked, the page still works. With JS off, all text is readable.

**C. Responsive**
- **C1.** No horizontal overflow, clipping or overlapping at any of these viewports:
  - phones: 320×568, 360×800, 390×844, 430×932;
  - phone landscape: 844×390;
  - tablets: 768×1024, 1024×768;
  - desktops: 1280×800, 1440×900, 1920×1080, 2560×1440.
- **C2.** At 390×844 the first screen shows the H1, the sub-line and both CTAs. At 360×640 it shows at least the H1 and the primary CTA.
- **C3.** Touch targets are at least 44 px. Input text is at least 16 px. Every field has the right type, autocomplete and inputmode. Safe-area insets are respected.
- **C4.** A sticky element never covers a focused field or a submit button.

**D. Accessibility** (WCAG 2.2 AA)
- **D1.** Contrast meets AA for all text and controls in every state, including text over art.
- **D2.** Both journeys (order and booking) can be completed with the keyboard alone, with visible focus in a sensible order.
- **D3.** Structure and announcements are correct:
  - landmarks, a single H1, headings in order;
  - every field labelled, and grouped choices wrapped in fieldset/legend;
  - aria-invalid and aria-describedby on errors;
  - live regions for the cart, totals, seats and confirmations.
- **D4.** Decorative art is hidden from assistive technology. Meaningful art has a Turkish name.
- **D5.** Reduced motion is honoured, and nothing is lost at 200% zoom.
- **D6.** axe-core reports zero serious or critical violations.

**E. Performance**
- **E1.** File ≤ 400 KB, with no third-party JS.
- **E2.** Load speed:
  - mobile emulation (4× CPU slowdown, fast 4G): LCP ≤ 2.5 s, CLS ≤ 0.05 including the font swap, TBT ≤ 200 ms;
  - desktop: LCP ≤ 1.5 s.
- **E3.** Animation cost:
  - the hero animation takes at most 8 ms per frame at 4× CPU on a 390 px screen;
  - no frame takes longer than 50 ms during scrolling;
  - the CPU goes idle when nothing animated is on screen.
- **E4.** If Lighthouse can be run: Performance ≥ 90 on mobile and ≥ 95 on desktop, Accessibility 100, Best Practices ≥ 95, SEO ≥ 95.

**F. Language and content**
- **F1.** Zero spelling, grammar, suffix-apostrophe or punctuation errors by TDK rules. Terms are used consistently: zeytinyağı, natürel sızma, erken hasat, hasat günü.
- **F2.** Turkish typography renders correctly:
  - capital İ/I follows the document language;
  - the fi/fl ligatures do not damage words such as "fiyat";
  - numbers follow Turkish formats: "%0,2", "1.400", "09.30", "7 Kasım Cumartesi";
  - non-breaking spaces join numbers to their units;
  - no heading ends with a single word alone on its last line.
- **F3.** Every real-world claim matches the wording in facts.md, and none of the forbidden claims appears.
- **F4.** Every number, price, date, weekday, year and capacity matches farm.json, and the arithmetic holds: ages across the generations; trees × yield ≈ litres ≈ bottles; order totals.

**G. Design** (judged by P7c and by me)
- **G1.** Faithful to the chosen direction, with one consistent hand across all the art and no template feel.
- **G2.** Five-second test at 390 and 1440 px: a first-time viewer can say what this is, where it is, and the two things they can do.
- **G3.** Rubric scores (Design 40%, Usability 30%, Creativity 20%, Content 10%) of at least 8.5/10 on every axis, each with reasons. The developer criteria (semantics, motion, accessibility, performance, responsiveness, markup) all pass.

---

## 3. Creative spine: the default, which P2 develops or beats

**"Bir hasat günü": one late-October day at the farm, from first light to the filled bottle.**

The page reads as that one day. Section kickers are clock times written like entries in the family's harvest ledger. The times are real ones: the harvest-day programme in farm.json, and Urla's actual sunrise and sunset for the season, taken from the research. Reading the page rehearses the day a visitor can book, and that day produces the oil they can order.

- **Light follows the day.** Section backgrounds step from cool dawn, to midday limestone with the green-gold of new oil, to warm dusk. Each background is checked for contrast. Body text never sits on a colour that shifts as the page scrolls.
- **Signature 1: the grove.** A seeded, generative olive grove drawn in code, on the Urla slopes above a strip of sea.
  - The leaves are botanically right: narrow, in opposite pairs, grey-green on top and silver underneath.
  - In passing gusts of the imbat they flip to silver, which anyone who has stood in an olive grove will recognise.
  - The motion is slow and can be paused; under reduced motion the grove is still.
- **Signature 2: the olive clock.**
  - One control moves through the harvest months, October to January.
  - The drawn olive ripens from green to violet to black.
  - The numbers change with it: kilograms of olives per litre of oil, polyphenols, bitterness and pungency, and what you taste.
  - One gesture explains why early harvest costs more and tastes the way it does.
- **Signature 3: the label.** Bottles and tins drawn in code, with labels that carry live data: lot, harvest date, pressing hour, variety. The label system is both the product imagery and the brand's typographic centrepiece.
- **Product idea.** "Üç Hafta": a tasting box of three small bottles from the first three harvest weeks of 2026, so the buyer tastes the ripening the olive clock shows. It goes ahead only if the research confirms there were three pressing weeks by late October.
- **Restraint.** One display serif with character and one quiet sans. Generous space and a short palette. Motion only where it explains or delights: nothing bouncy, no stacked parallax.

P2 may replace this spine only by prototyping it next to their strongest alternative and showing that the alternative is better. G1 decides.

---

## 4. Parts

Every part goes to a fresh agent, together with the standing orders in §10. Once a part is done, its outputs are read-only for every part that follows.

### P0: Test and screenshot harness
- **Effort:** medium. Ordinary tooling code with a self-test; every later part relies on it.
- **Inputs:** brief.md, plan.md.
- **Output:** `work/00-tools/`, containing README.md, shoot.mjs, serve.mjs, check-static.mjs, ff-shot.sh, scenarios/ and selftest.log.
- **Work:**
  - **Environment.** Re-check and record what is installed. On 24 October I found Node 22.23 with npm, Python 3.14, Firefox, Chrome under /opt/google/chrome, git, and the Noto fonts.
  - **shoot.mjs** drives `google-chrome --headless=new --no-sandbox` through the Chrome DevTools Protocol. It needs no dependencies, because Node 22 has WebSocket built in; puppeteer-core is the fallback. It must be able to:
    - emulate viewport size, pixel ratio and touch;
    - emulate prefers-reduced-motion, CPU throttling and network throttling;
    - block URLs, to test the page with fonts blocked;
    - wait until fonts are ready and the network is idle;
    - take viewport screenshots at given scroll offsets or anchors;
    - take full-page screenshots after first scrolling through the page, so that reveal-on-scroll content has fired and 100vh blocks are not stretched;
    - capture frame sequences, for reviewing motion;
    - run scripted JSON scenarios (click, type, press, select, wait, evaluate, screenshot);
    - log console messages, exceptions and every network request;
    - report horizontal overflow, LCP, CLS, long tasks and duplicate ids;
    - inject axe-core, installed under work/00-tools only and never shipped.
  - **serve.mjs.** A small static server, so every scenario runs under both file:// and http://.
  - **check-static.mjs.** Scans an HTML file for everything in §2.4: forbidden elements, URLs and hosts, tel:/mailto:/wa.me links, emoji, and the word list (KVKK, çerez, gizlilik, sözleşme, aydınlatma metni, kişisel veri and others), which it flags for review. It also reports the file size and the lang attribute.
  - **ff-shot.sh.** Firefox headless screenshots at a given size.
  - **Fallback.** Document the brief's plain Chrome screenshot command, using `#anchor` URLs to get section shots.
- **Check:** selftest.log shows every feature working on a sample page that has an animation, a form, a reveal block and a Google Font. I re-run the self-test when the part comes back.

### P1: Fact base and market research
- **Effort:** medium. Standard research.
- **Inputs:** brief.md, plan.md.
- **Output:** `work/01-research/`, containing facts.md, market.md, calendar-2026.md, names-in-use.md, iller.json and benchmarks.md.
- **Work:**
  - **facts.md.** Every fact gets a statement, a source URL, the access date, a confidence level and a safe Turkish phrasing. It covers:
    - **Urla:** location; distances and drive times from İzmir; climate; the imbat; soils and terraces; the olive villages; Urla Bağ Yolu; the artichoke.
    - **The Klazomenai olive-oil workshop:** date, status and wording. Sources differ between "tanımlanabilen/bilinen en eski" and "en eskilerinden biri"; give the safest phrasing.
    - **The Erkence variety:** where it grows, when it ripens, fruit, oil content, taste profile at early harvest, the Karaburun "hurma" note, and the realistic early-harvest window in Urla.
    - **Early-harvest science:**
      - yield by month (kg of olives per litre);
      - polyphenol ranges, and the acidity norms for natürel sızma;
      - same-day pressing; malaxation at or below 27 °C, and what "soğuk sıkım" actually means;
      - two-phase extraction, filtering, storage and shelf life;
      - the Turkish tasting vocabulary;
      - why the oil catches the throat, described without health claims.
    - **Harvest practice:** hand rakes (tırmık), nets, crates versus sacks, and why the branches must not be beaten with poles.
    - **TDK conventions:** % before the number; times written with a dot; when month names are capitalised; suffix apostrophes; "zeytinyağı" as one word; "hikâye".
    - **A do-not-claim list.**
  - **market.md.**
    - 2026 Turkish prices for boutique early-harvest oil in each format (250 and 500 ml glass, 2 and 5 L tin), with at least 5 dated benchmarks per format.
    - Shipping norms.
    - Prices and programmes of agritourism harvest experiences.
  - **calendar-2026.md.** Every weekend from 24 October to 6 December 2026 with its weekday, the 28–29 October holiday, and sunrise and sunset in Urla on each of those dates.
  - **names-in-use.md.** At least 20 existing olive-oil brands and farms in Urla, the peninsula and Turkey, so we avoid their names.
  - **iller.json.** All 81 provinces, spelled correctly.
  - **benchmarks.md.** 10–15 award-winning food, farm, winery or olive-oil websites, with notes on what makes each one win. Notes only; no assets.
  - **Leads I have already found** (to verify, not to copy):
    - [Urla Belediyesi – Klazomenai](https://www.urla.bel.tr/Upload/file/files/Nalan%20QR.pdf)
    - [Yeni Asır, July 2026](https://www.yeniasir.com.tr/yasam/2026/07/13/turk-zeytinyaginin-hikayesi-dunyaya-anlatildi)
    - [Yeni Asır – Urla column (Pausanias)](https://www.yeniasir.com.tr/yazarlar/zeki-hozer/2025/09/21/urla)
    - [Doğa Derneği on Erkence](https://dogadernegi.org/en/wp-json/wp/v2/posts/25521)
    - [İYTE Hurma/Erkence/Gemlik study](https://openaccess.iyte.edu.tr/bitstream/11147/3602/1/10011520.pdf)
    - [İYTE Hurma report](https://gcris.iyte.edu.tr/bitstream/11147/3581/1/10006394.pdf)
- **Check:** every fact is sourced and graded, and weekdays are computed rather than typed by hand. When the part comes back I spot-check five facts: Klazomenai, the Erkence window, yield by month, one price and one sunrise.

### P2: Creative direction, brand and farm bible
- **Effort:** max. Every later part inherits this concept, system and data, so it decides whether the page can win.
- **Inputs:** brief.md, plan.md, work/00-tools/, work/01-research/.
- **Output:** `work/02-direction/`, containing direction.md, farm.json, tokens.css, logo.svg plus a favicon variant, wireframe.html, prototype/route-a.html, prototype/route-b.html and shots/.
- **Work:**
  1. **Concept.**
     - Route A is the §3 spine. Route B is the strongest alternative.
     - Prototype each as the hero plus the order cards, at 1440×900 and 390×844.
     - Choose one and justify the choice in at most 300 words, against the G3 rubric and benchmarks.md.
  2. **Name and identity.**
     - The name:
       - two words at most, Turkish, easy to say;
       - works on a label;
       - carries no strong existing association (not "Erkenci", because of the TV series);
       - does not appear in names-in-use.md, and a web search comes back clean.
     - An SVG wordmark and mark.
     - A label system for bottles and tins.
  3. **farm.json: the single source of every invented fact and number.**
     - **What it contains:**
       - the brand, and its location at village level;
       - the family: names, birth years, roles, one deed each;
       - the grove: hectares, number of trees, varieties, oldest tree;
       - the mill;
       - the 2026 season: harvest start, first pressing, weekly lots, total volume, bottles left;
       - the oil profile, and the month-by-month table for the olive clock;
       - products: id, name, format, volume, price in kuruş, per-order limit;
       - shipping: fee, free-shipping threshold, dispatch and delivery days, pickup;
       - harvest days: programme with times, prices, the child rule, capacity, meeting point, what is included, what to bring, and dates with seats already booked.
     - **Coherence rules:**
       - dates and weekdays are right for 2026;
       - harvest days fall inside the farm's own harvest window, as the page explains it;
       - at least 6 bookable dates after 24 October 2026, with one sold out and some down to their last seats;
       - the ages across generations are plausible;
       - trees × yield ≈ litres ≈ bottles;
       - prices fall within the ranges in market.md.
  4. **Design system.**
     - Palette tokens, with a contrast table.
     - At most 2 Google font families, with a screenshot of a glyph test covering İıĞğŞşÇçÖöÜüÂâÎî and "fiyat, fidan, HİKÂYE" in every weight used.
     - A fluid type scale, spacing, grid and corner radii.
     - Every component in every state: button, stepper, date chip (as a radio button), input, select, error, summary panel, accordion, toast, bottom bar.
  5. **wireframe.html.** The whole page in grey boxes, for desktop and mobile, with the real section order, heading levels and section keys, plus a character budget for every block of text.
  6. **Motion spec.** What moves, why, for how long, with which easing, and what happens under reduced motion.
  7. **Interaction spec.**
     - The order, booking, question and season-over flows as state machines: states, transitions, the full list of error codes, and what each success view contains.
     - The date-state rules, the storage scheme and the `?bugun=` override.
  8. **Art briefs and contract.**
     - One brief per asset, each assigned to P4a or P4b. Each brief gives the size, the crop at each breakpoint, palette, light direction, level of detail, animation and budget.
     - The art contract from §5.
     - Botanical accuracy rules.
  9. **Voice.**
     - Tone rules: first-person plural, the family speaking; numbers rather than adjectives.
     - The banned-words list.
     - Six sample lines.
- **Check:** G1.

### G1: Owner gate on the direction (me)
- **Effort:** high. A check of internal work at the point where it matters most.
- **What I check:**
  - the concept is ownable, not template-like, and serves both conversions;
  - C2 holds on the prototype, and text over art is legible;
  - the glyph and ligature test passes, and so does the contrast table;
  - farm.json is complete; I recompute the weekdays, ages, volumes and prices myself;
  - the name's collision check is documented;
  - the contracts are complete: tokens, an art brief for every drawn element in the wireframe, all error codes, all budgets;
  - nothing forbidden is planned.
- **If it fails:** P2 is re-dispatched once, at max effort, with my notes.
- **Output:** `work/owner/G1-direction.md`.
- **On a pass:** farm.json is frozen. After that only I change it, with a version bump, and I notify every part that uses it.

### P3: Copy deck
- **Effort:** high. The final Turkish text every visitor reads.
- **Inputs:** brief.md, plan.md, work/01-research/, work/02-direction/.
- **Output:** `work/03-copy/`, containing copy.md, strings.json and report.md.
- **Work:**
  - **copy.md.** Every visible string, in wireframe order, keyed by section and block, within its character budget.
    - Real-world facts appear only in facts.md's safe phrasing.
    - Data values are never typed in. They are written as build-time placeholders, for example `{{products.p500.price|try}}` or `{{season.firstPress|date}}`, so the text and the data cannot drift apart.
  - **strings.json.** All interface text:
    - button labels and their states; aria names;
    - summary and toast messages; one message for every error code;
    - success views, date-state labels, the season-over state and the no-JS line;
    - the page title and meta description;
    - the .ics summary and description;
    - names for meaningful art.
    Variables filled in at runtime are written `{name}`.
  - **report.md.**
    - The results of the TDK self-check.
    - The longest word in each heading, for the 320 px check.
    - Character counts against the budgets.
    - Decisions.
    - Any new numbers that are purely narrative, proposed for me to merge into farm.json.
- **Check:** when the part comes back I confirm it covers every block in the wireframe and every error code. P7b later proofreads the text on the built page.

### P4a: Landscape and generative art
- **Effort:** xhigh. This art replaces photography and is the first thing a jury sees. It is design-level work, long, and bound by a performance budget.
- **Inputs:** brief.md, plan.md, work/00-tools/, work/01-research/facts.md, work/02-direction/.
- **Output:** `work/04a-art-landscape/`, containing assets/, showcase.html, shots/ and art-notes.md.
- **Work:**
  - **The hero grove.**
    - Seeded and generative: layered Urla slopes, a strip of sea, the light of the hero's hour, the imbat flipping the leaves.
    - Separate compositions for desktop and phone.
    - A still first frame inline in the HTML, and a still frame for reduced motion.
  - **Section backgrounds** that follow the day.
  - **The generations visual**, if the briefs assign it here.
  - **Paper grain**, generated in code.
  - **Line drawings of branches**, if assigned here.
- **Check:**
  - showcase screenshots at 1440 and 390, plus frame sequences;
  - budgets measured at 4× CPU and recorded in art-notes.md;
  - the contract checklist ticked off.
  When the part comes back I look at the screenshots and repeat one budget measurement.

### P4b: Objects, packshots and icons
- **Effort:** xhigh. Product images and icons must read as fine illustration, not clip-art. Long, design-level work.
- **Inputs:** the same as P4a.
- **Output:** `work/04b-art-objects/`, containing assets/, showcase.html, shots/ and art-notes.md.
- **Work:**
  - **Packshots for every product.**
    - Glass bottles with the oil and light inside them.
    - Tins with printed labels.
    - Label text as live SVG text, filled from data.
  - **The olive** at each harvest month, for the olive clock.
  - **Smaller drawings:**
    - a botanical olive branch;
    - 5–6 icons for the pressing process;
    - a tasting glass;
    - the harvest tools (rake and crate) for the programme.
  - **Identity pieces:**
    - refinements to the logo, if the direction asks for them;
    - the favicon.
- **Check:** the same as P4a.

### P5: Order and booking logic
- **Effort:** high. Code that must be correct, unit-tested on its own.
- **Inputs:** brief.md, plan.md, work/01-research/iller.json, work/01-research/calendar-2026.md, work/02-direction/farm.json, work/02-direction/direction.md (the interaction spec).
- **Output:** `work/05-logic/`, containing logic.js, logic.test.mjs, API.md and test-output.txt.
- **Work:**
  - **Shape.** No DOM and no interface code. One self-contained script that exposes a single namespace, with a `module.exports` guard so Node can load it too.
  - **Cart.** Money in kuruş; shipping, the threshold and pickup; per-product limits.
  - **Booking.**
    - Availability states based on "today" in Europe/Istanbul, plus the override.
    - Seats, and adult/child pricing.
  - **Validation.**
    - Returns the error codes from the interaction spec.
    - Normalises Turkish phone numbers and checks e-mail addresses sensibly.
  - **References.** Order and booking codes that avoid easily confused characters.
  - **Storage.** Versioned keys, with a fallback when storage is unavailable.
  - **Formatting.**
    - tr-TR formatters for money, dates, weekdays, "09.30" times and "%0,2".
    - The build reuses these, so the page has exactly one formatting implementation.
    - Case-conversion helpers that handle Turkish İ/ı correctly.
  - **Calendar.** An .ics builder: CRLF line endings, UTC times, escaping, UID and DTSTAMP.
- **Check:**
  - `node --test` passes at least 40 cases, including:
    - the shipping threshold ±1 kuruş, and the maximum quantity;
    - a date that is exactly full;
    - `?bugun=` set to 2026-10-24, 2026-11-07, the last date, and 2027-01-10;
    - every phone variant from B3.
  - The output is saved to test-output.txt, and I re-run the tests when the part comes back.

### P6: Build and integration
- **Effort:** xhigh. A long unattended build, well over 30 minutes, that combines five parts into one file.
- **Inputs:** brief.md, plan.md, work/00-tools/, work/01-research/, work/02-direction/, work/03-copy/, work/04a-art-landscape/, work/04b-art-objects/, work/05-logic/.
- **Output:** `work/06-build/`, containing src/, build.mjs, dist/index.html, shots/, build-log.md and build-report.md.
- **Work:**
  - **Inputs.** Copy the parts into src/parts/. Never edit the originals, and log every patch in build-log.md.
  - **build.mjs** runs these steps in order:
    1. run the logic tests;
    2. render the template, filling `{{…}}` placeholders from farm.json with P5's formatters;
    3. pre-render the data-driven HTML (products, dates, numbers), so the content reads without JS;
    4. inline the CSS, JS and art, and embed farm.json once;
    5. write dist/index.html;
    6. run check-static on the result.
  - **Approach.** Build mobile-first, against the wireframe and the chosen prototype. Use progressive enhancement: reveal animations switch on only when JS is running and motion is allowed.
  - **Forms.**
    - Native inputs with the right type, autocomplete and inputmode.
    - Validation when the visitor submits or leaves a field.
    - An error summary and live regions.
    - A guard against double submission.
    - In-place confirmations, with focus moved to their heading.
  - **Milestone M1.** Build the hero and the order section first, at 390 and 1440, and compare them with the prototype. Correct any drift before going further.
  - **Self-QA.**
    - Run tests A–E in the harness: every viewport and every flow; Firefox at 390 and 1440; with fonts blocked; with reduced motion; performance under CPU throttling.
    - Look at every screenshot.
    - Record the results in build-report.md.
- **Check:** build-report.md shows A–E passing, or lists each open item with its test ID. When the part comes back, I run check-static and one full order flow before releasing the work to QA.

### P7a: Functional, responsive, accessibility and performance QA
- **Effort:** high. The final check of internal work.
- **Inputs:** brief.md, plan.md, work/00-tools/, work/02-direction/, work/06-build/dist/index.html.
- **Output:** `work/07-qa/functional.md`, plus shots/.
- **Work:**
  - Run tests A–E in full, in both browser engines.
  - Then try to break the page:
    - empty and invalid input; emoji; 1,000-character text; phone numbers pasted with spaces;
    - rapid double clicks; the back and forward buttons; resizing and rotating mid-flow;
    - storage blocked; JS off; fonts blocked; 200% zoom;
    - keyboard only, and an axe-core scan.
  - Write each finding with:
    - an ID and its test reference;
    - a severity, from S1 (blocker) to S4 (polish);
    - the steps to reproduce it;
    - the path to the evidence;
    - a suggested fix.
  - Fix nothing.

### P7b: Turkish language and consistency QA
- **Effort:** high. The final check of every word a visitor reads.
- **Inputs:** brief.md, plan.md, work/00-tools/, work/01-research/facts.md, work/02-direction/, work/03-copy/, work/06-build/dist/index.html.
- **Output:** `work/07-qa/language.md`.
- **Work:**
  - Extract all rendered text in every state: aria text, title and meta, error and success views, the season-over state, the .ics file.
  - Proofread it against TDK rules.
  - Check F2 rendering on screenshots.
  - Check F3 against facts.md, and F4 against farm.json, recomputing the arithmetic.
  - Check the tone and the banned words.
  - Write every finding as an exact replacement, "X → Y", with its location.

### P7c: Design and jury critique
- **Effort:** xhigh. Judging the page against an award-level bar, and prescribing the fixes, is design work.
- **Inputs:** brief.md, plan.md, work/00-tools/, work/01-research/benchmarks.md, work/02-direction/, work/06-build/.
- **Output:** `work/07-qa/design.md`.
- **Work:**
  - Take fresh screenshots at every viewport, and frame sequences of every animation.
  - Run the G2 five-second test, and score the G3 rubric with reasons.
  - Compare the build with the direction and the prototype.
  - Walk through both conversion paths.
  - List at most 25 improvements in priority order:
    - each prescribed at the level of the CSS, SVG or JS change;
    - each marked "required for the bar" or "nice to have".
  - Change the direction only where the build fails the bar because of the direction itself.

### G2: Owner triage (me)
- **Effort:** high. Turning three reports into one ordered fix list, with conflicts decided.
- **Inputs:** work/07-qa/, work/06-build/build-report.md.
- **Output:** `work/owner/G2-fixlist.md`.
- **Rules:**
  - Priority order: brief rules, then broken function, then accessibility, then language and data, then design polish.
  - Remove duplicates.
  - Each item gets an ID, a severity, a location, the prescribed fix and the test that proves it.
  - Items I decline are listed with the reason.
  - No new features.

### P8: Polish pass
- **Effort:** xhigh. A long pass across the whole page that must not break anything.
- **Inputs:** brief.md, plan.md, work/00-tools/, work/06-build/, work/owner/G2-fixlist.md, work/07-qa/, and all part folders as read-only.
- **Output:** `work/08-polish/`: a copy of the build, with src/, build.mjs, dist/index.html, shots/ and polish-report.md.
- **Work:**
  - Apply the fix list in order.
  - After each S1 or S2 fix, re-run the tests that cover it.
  - At the end, run A–F in full.
  - Report each item as fixed, or as not fixed with the reason.

### Owner: assembly and trial (me)
- **Effort:** high. The final check of the whole page before it leaves the team.
- **Inputs:** work/08-polish/, and all reports.
- **Output:** `delivery/index.html`, plus `work/09-assembly/` with acceptance.md, shots/ and index.pre-audit.html.
- **Work:**
  - Copy 08-polish to 09-assembly and rebuild.
  - Run tests A–G myself: both engines, every viewport, every flow, every date override, fonts blocked, reduced motion, file:// and http://.
  - Read the whole page once, top to bottom, as a visitor.
  - Fix small issues in the 09-assembly sources and log them.
  - Write the result to `delivery/index.html` and confirm the bytes match the build. Keep a snapshot taken before the audit.

### Owner: revision round after the audit (me)
- **Effort:** xhigh. The last change, with no check after it: triage, fixes, full regression.
- **Inputs:** the audit report, work/09-assembly/.
- **Output:** the final `delivery/index.html`, plus `work/10-revision/revision.md`.
- **Work:**
  - Triage every audit finding:
    - all S1 and S2 findings are fixed;
    - S3 and S4 findings are fixed unless the risk outweighs the value, in which case the reason is recorded.
  - Make the fixes in a copy in 10-revision. If a fix needs an asset redrawn, I send it within the round to a fresh agent, at the original part's effort.
  - Re-run A–G in full.
  - Diff against the pre-audit snapshot, so that only intended changes ship.
  - Deliver.

---

## 5. Seams and contracts

| Seam | Contract (artifact) | Owner | Verified by |
|---|---|---|---|
| research → every part | facts.md safe phrasing; the do-not-claim list | P1 writes it, I enforce it | P7b (F3) |
| direction → copy | wireframe.html keys and budgets; voice; the error-code list | P2 | P3 self-check; P7b |
| direction → art | art briefs, art contract, tokens.css, prototype | P2 | P4 self-check; P6 intake; P7c |
| direction → logic | farm.json schema; interaction spec | P2 | P5 tests; P6 intake |
| farm.json after G1 | frozen and versioned; only I change it | me | P7b (F4) |
| logic → build | API.md; build.mjs re-runs the tests | P5 | P6 |
| copy → build | copy.md keys, `{{data}}` placeholders, strings.json | P3 | P6; P7b on the built text |
| art → build | assets that follow the contract; patches logged | P4a, P4b | P6; P7c |
| build → QA | dist/index.html and build-report.md | P6 | P7a, P7b, P7c |
| QA → polish | G2-fixlist.md | me | P8; me |
| polish → delivery → audit → revision | dist, acceptance.md, audit report | me | me |

**Art contract.** P2 writes it out in full; these points are fixed:
- Colours come only from the custom properties in tokens.css.
- Every id inside an asset starts with the asset's prefix, and assets used more than once generate a separate id for each copy. Duplicate gradient ids are the classic way inline SVGs break each other.
- No global CSS selectors; every class starts with `art-`.
- Every asset has a viewBox and no fixed size, and its crop at each breakpoint is documented.
- Each generative asset is a single function under one shared namespace. It is seeded, so it draws the same picture every time. It handles high-density screens and resizing, and it returns a function that cleans it up.
- Animations pause when off-screen or in a hidden tab. Under reduced motion they show their final still frame.
- Decorative art is hidden from assistive technology (aria-hidden). Meaningful art gets role="img" and a Turkish name from strings.json.
- Budgets:
  - the hero must stay at or under 8 ms per frame at 4× CPU on a 390 px screen;
  - all art together must be at most 180 KB of source.

**Folder discipline.**
- Each part writes only inside its own folder, and its inputs are read-only.
- P6, P8 and my own steps work on copies, so every stage can be compared with the last and rolled back.
- I keep `work/owner/LOG.md`, recording what was dispatched with which inputs, what came back, and the result of my intake check.

---

## 6. Order

```
1   P0 tools (medium)  ∥  P1 research (medium)
2   P2 direction (max)                               ← needs P1, uses P0
3   G1 owner gate (high)                             → farm.json frozen
4   P3 copy (high) ∥ P4a landscape art (xhigh) ∥ P4b objects art (xhigh) ∥ P5 logic (high)
    owner intake of all four, including merging P3's narrative numbers into farm.json
5   P6 build (xhigh)
6   P7a functional (high) ∥ P7b language (high) ∥ P7c design (xhigh)
7   G2 owner triage (high)
8   P8 polish (xhigh)
9   owner assembly & trial (high)                    → delivery/index.html
10  independent audit
11  owner revision round (xhigh)                     → delivery/index.html (final)
```

- No part is dispatched until all of its inputs have passed my intake check.
- A part that fails intake is re-dispatched once, to a fresh agent at the same effort, with my notes.
- If it fails a second time, I fix it myself or drop it from scope, and record the decision.

---

## 7. How the parts and the whole are checked

**Each part** ends with evidence: screenshots the agent has actually looked at, test logs, measured budgets and ticked checklists. The part that uses the output, and I, check it when it comes back (the "Check" line in §4).

**The whole page is checked five times:**
1. P6 tests its own build against A–E.
2. Three independent checkers work in parallel with fresh eyes:
   - P7a: function, responsiveness, accessibility, performance;
   - P7b: words and data;
   - P7c: design against the jury bar.
   I merge their findings into one decided list (G2).
3. P8 re-runs A–F after its fixes.
4. I run A–G myself, read the whole page, and deliver it.
5. After the independent audit, my revision round ends with a full A–G regression and a diff against the pre-audit snapshot.

**In every run:** check-static, the network log, the console log and the overflow sweep run automatically. Breaking a brief rule counts as S1 at every stage.

---

## 8. What is delivered

- `delivery/index.html`:
  - one self-contained, readable HTML file;
  - it opens by double-click or from any static host, on desktop and on phone;
  - nothing else goes into `delivery/`.
- The working record stays in `work/` and is not part of the delivery: plan, research, direction, sources, build script, reports, screenshots and acceptance logs.

---

## 9. Risks

| Risk | Mitigation | Owner |
|---|---|---|
| Looks like a template, or falls short of award level | Concept-first direction at max effort; two prototyped routes; G1 tests distinctiveness; xhigh critique against rubric and benchmarks; polish pass | P2, P7c, me |
| Code-drawn art looks naive or like clip-art | Two dedicated xhigh art agents; botanical rules; the label as a design centrepiece; showcase review at intake; frame-sequence critique | P4a, P4b, me |
| The Turkish reads as translated, or has errors | High-effort copy with voice rules and a banned list; proofreading on the *built* text; my full read-through | P3, P7b, me |
| Turkish rendering bugs (İ/ı casing, the fi ligature, ğ/ş missing in one weight) | lang="tr"; glyph test at G1; case helpers that handle Turkish; F2 screenshot checks | P2, P5, P7b |
| Failures on phones (overflow, 100vh jumps, the keyboard covering fields, sticky bars) | Mobile-first build; svh/dvh units with fallbacks; overflow check across 11 viewports; rules C3 and C4 | P6, P7a |
| Safari cannot be tested on this machine | Chrome and Firefox (two engines) in every run; only widely supported features, or enhancements with a fallback (no Chrome-only scroll timelines without a JS path); -webkit- prefixes where needed | P6, P7a |
| Animation causes jank or drains batteries | Budgets measured at 4× CPU; pause off-screen and in hidden tabs; a still frame for reduced motion | P4a, P6, P7a |
| Content invisible in screenshots or without JS | Reveal animations switch on only with JS and motion allowed; still first frame for the hero; scroll through before full-page shots | P0, P6 |
| Inline SVGs break each other (duplicate ids, leaking CSS) | The art contract; a duplicate-id check in the harness | P2, P4a, P4b, P0 |
| Numbers drift (prices, weekdays, ages, volumes) | farm.json frozen as the single source; `{{placeholders}}`; one formatter; F4 recomputation | P2, P3, P6, P7b |
| Dates go stale after the season | "Today" computed in Istanbul time; date states; a season-over state; tests with `?bugun=` | P5, P6, P7a |
| The brief is broken out of habit (an image tag, a CDN, a KVKK checkbox, a cookie bar, legal links, card fields) | The forbidden list in every dispatch; check-static at build, QA, assembly and revision; any breach is S1 | every part, me |
| Collisions with the real world (a brand name, contact details reaching real people, fake awards or press) | names-in-use.md and a web check; no phone, social or street address; the question form as the only contact; no third parties | P1, P2, P3 |
| Google Fonts blocked or slow | Metric-matched fallback faces; a screenshot test with fonts blocked; the CLS budget includes the font swap | P2, P6 |
| Seams drift (the builder rewrites copy or patches art without saying so) | Work on copies with patch logs; language QA on the built text; critique against the direction | P6, P7b, P7c |
| Scope creep (extra pages, modals, features) | The one-page rule; G2 declines additions; feature freeze after the build | me |
| The long build loses its thread | build-log.md kept as it goes; milestone M1; state held in files, not in memory | P6 |
| Quirks in the harness waste later parts' time | P0 self-test plus my intake check; a documented plain-command fallback | P0, me |
| Overclaiming on history or health | Hedged wording from facts.md only; health claims banned | P1, P3, P7b |
| Prices or harvest dates look implausible to a local buyer | Dated market benchmarks; harvest window taken from the research; G1 recomputation | P1, P2, me |
| Only one revision round after the audit | Full A–G before delivery, so the audit finds little; a pre-audit snapshot; full regression and a diff after the revision | me |

---

## 10. Standing orders (top of every dispatch packet)

1. You are part X of plan.md. Read brief.md and plan.md first. Your inputs are listed for you and are read-only. Write only inside your own output folder.
2. Ask no one anything and wait for no approval. Decide, and record each decision under "Decisions" in your report, with a one-line reason.
3. §2.4 is absolute. If an input breaks it, do not carry the breach forward: work around it inside your folder and flag it.
4. Everything a visitor can see or hear is Turkish. Internal documents are in English.
5. Real-world claims come only from facts.md. Invented numbers come only from farm.json.
6. Use the tools in work/00-tools for every visual or functional claim, and look at your screenshots rather than just producing them. Measure everything that has a budget.
7. Anything downloaded (axe-core, for example) stays under work/00-tools. Nothing downloaded ever goes into the page.
8. End with a report in your folder covering:
   - what you did;
   - which checks you ran, with their results and evidence paths;
   - any departures from a contract;
   - known issues;
   - your decisions.
   Do not stop at "good enough". Stop when your done-criteria are met, or state exactly which criterion is not met.

---

## DISPATCH

- **1a** · P0 Test & screenshot harness · medium · ordinary tooling code with a self-test; every later part relies on it · brief.md, plan.md · `work/00-tools/README.md`
- **1b** · P1 Fact base & market research · medium · standard research: sourced facts, prices, the 2026 calendar, names to avoid, benchmark sites · brief.md, plan.md · `work/01-research/facts.md`
- **2** · P2 Creative direction, brand & farm bible · max · every later part inherits this concept, system and data, so it decides whether the page can win · brief.md, plan.md, work/00-tools/, work/01-research/ · `work/02-direction/direction.md`
- **3** · G1 Owner gate on the direction (me) · high · a check of internal work where it matters most; freezes farm.json · work/01-research/, work/02-direction/ · `work/owner/G1-direction.md`
- **4a** · P3 Copy deck · high · the final Turkish text every visitor reads · brief.md, plan.md, work/01-research/, work/02-direction/ · `work/03-copy/copy.md`
- **4b** · P4a Landscape & generative art · xhigh · replaces photography and is what a jury sees first; design-level, long, performance-bound · brief.md, plan.md, work/00-tools/, work/01-research/facts.md, work/02-direction/ · `work/04a-art-landscape/showcase.html`
- **4c** · P4b Objects, packshots & icons · xhigh · product images and icons as fine illustration; long, design-level · brief.md, plan.md, work/00-tools/, work/01-research/facts.md, work/02-direction/ · `work/04b-art-objects/showcase.html`
- **4d** · P5 Order & booking logic · high · code that must be correct, unit-tested on its own · brief.md, plan.md, work/01-research/iller.json, work/01-research/calendar-2026.md, work/02-direction/farm.json, work/02-direction/direction.md · `work/05-logic/logic.js`
- **5** · P6 Build & integration · xhigh · a long unattended build that combines five parts into one file · brief.md, plan.md, work/00-tools/, work/01-research/, work/02-direction/, work/03-copy/, work/04a-art-landscape/, work/04b-art-objects/, work/05-logic/ · `work/06-build/dist/index.html`
- **6a** · P7a Functional, responsive, accessibility & performance QA · high · the final check of internal work · brief.md, plan.md, work/00-tools/, work/02-direction/, work/06-build/dist/index.html · `work/07-qa/functional.md`
- **6b** · P7b Turkish language & consistency QA · high · the final check of every word and number on the built page · brief.md, plan.md, work/00-tools/, work/01-research/facts.md, work/02-direction/, work/03-copy/, work/06-build/dist/index.html · `work/07-qa/language.md`
- **6c** · P7c Design & jury critique · xhigh · judging against an award-level bar and prescribing the fixes is design work · brief.md, plan.md, work/00-tools/, work/01-research/benchmarks.md, work/02-direction/, work/06-build/ · `work/07-qa/design.md`
- **7** · G2 Owner triage (me) · high · merges three reports into one ordered fix list with conflicts decided · work/07-qa/, work/06-build/build-report.md · `work/owner/G2-fixlist.md`
- **8** · P8 Polish pass · xhigh · a long pass over the whole page that must not break anything · brief.md, plan.md, work/00-tools/, work/06-build/, work/owner/G2-fixlist.md, work/07-qa/, all part folders read-only · `work/08-polish/dist/index.html`
- **9** · Owner assembly & trial (me) · high · the final check of the whole before delivery: rebuild, full A–G, full read-through · work/08-polish/, all reports · `delivery/index.html`
- **10** · Independent audit (not dispatched by me) · n/a · reads the delivered page and tries it in a browser · delivery/index.html · audit report
- **11** · Owner revision round (me) · xhigh · the last change, with no check after it: triage, fixes, full A–G regression, diff against the snapshot · audit report, work/09-assembly/ · `delivery/index.html`