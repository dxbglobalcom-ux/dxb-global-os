# Work plan · Urla zeytin çiftliği · tek landing page

The team reads this plan in English. Every string a visitor sees is Turkish. The job folder is the working directory; all paths below are relative to it.

## 1. Scope

**What is being made.** One Turkish landing page for a fictional family olive farm in Urla, İzmir: three generations on the land, early-harvest sızma zeytinyağı, and autumn harvest days open to visitors. The page must make a visitor understand the farm and want one of two things: order the oil, or book a harvest day. It is one self-contained HTML file that opens in a browser on a computer and on a phone. No backend, no photographs, no image files; every visual is drawn in code. Google Fonts is the only permitted external resource. The bar is a page that could win an international design award.

**Out of scope, enforced in every part.**
- No second page, sub-page or outbound link. Navigation is anchors only.
- No legal, KVKK, contract, cookie or consent text. No analytics, no tracking.
- No raster image of any kind, including base64 data URIs. No external CSS or JS. No map embeds, no iframes.
- No questions to the client and no waiting for approval. Agents decide, record the decision in their HANDOFF, and move on.
- No real institutions or people: no real competition names, certifiers, award bodies, or named real persons. The business is fictional and its name must not collide with an existing Turkish food or oil brand.

**Decisions fixed by this plan**, so parts can run without talking to each other:

1. Delivery is one file, `delivery/index.html`, UTF-8, LF line endings, all CSS and JS inline, all SVG inline, classic script tags, no ES modules, no build step. It must work when opened from `file://`.
2. External requests are limited to fonts.googleapis.com and fonts.gstatic.com, loaded with preconnect and `display=swap`. At most two families and five weight or style files. Latin-ext glyphs for Ş ş Ğ ğ I ı İ i Ö ö Ü ü Ç ç are verified by rendered screenshot. A tuned fallback stack keeps the page well set when fonts fail.
3. The document carries `<html lang="tr">`. Turkish casing in CSS text-transform depends on it.
4. Section ids and their order are fixed in the content inventory below. Nav anchors use them. Copy is keyed by them.
5. Budgets: file size 350 KB target and 600 KB hard cap; JS at most 25 KB; hero SVG at most 120 KB; DOM at most 1,500 nodes. Animation uses transform and opacity only. No scroll hijacking. `prefers-reduced-motion` turns every non-essential motion off and leaves a complete static page.
6. Accessibility target is WCAG 2.2 AA: keyboard-complete, visible focus, 44 px touch targets, 16 px minimum body text on phones, form inputs at least 16 px so iOS does not zoom, `color-scheme: light`, viewport height via `100dvh` with a fallback, safe-area insets on any fixed bar.
7. Forms are answered in the browser: validation, a confirmation state with a reference number and a summary, a reset. localStorage is optional and wrapped in try/catch. Confirmation copy is honest about what happens next and promises nothing the page cannot do.
8. Date awareness: the harvest status badge and the list of harvest days derive from the visitor's clock. Past days drop out. The page is never empty or broken on any date, and after the season it shows an explicit "2027 için ön kayıt" state.
9. Harvest days are weekends from 31 Ekim to 29 Kasım 2026. Every date and weekday on the page is verified with `date -d`.
10. Turkish text follows TDK orthography and the conventions the bible fixes. JS formats numbers with `Intl.NumberFormat('tr-TR')` so computed totals match written prices.
11. Contact details are fictional, in valid formats, with an e-mail on the farm's own fictional domain.

**Content inventory.** What the delivered page contains and does, by section:

| # | Section and id | Must contain | Must do |
|---|---|---|---|
| 0 | Header | SVG wordmark; anchors Hikâye, Zeytinyağı, Hasat Günleri, Ziyaret; button "Sipariş ver" | Sticky, condenses on scroll; current section highlighted; phone menu keyboard operable; skip link is the first focusable element |
| 1 | Giriş `#giris` | Farm name; one-sentence promise naming Urla, three generations and early harvest; two CTAs to `#siparis` and `#hasat`; the hero illustration; a date-aware harvest badge | Carries the signature visual idea; ambient motion with a static reduced-motion state; text contrast AA over the artwork |
| 2 | Hikâye `#hikaye` | Three generations in about 200 words; timeline of 3 or 4 dated milestones; one family quote | Reveals on scroll |
| 3 | Bahçe `#bahce` | Place facts: altitude, distance to the sea, wind; tree count; varieties led by Erkence; farming practice; 4 to 6 fact tiles with icons | Static |
| 4 | Zeytinyağı `#yag` | What early harvest means; "ağaçtan şişeye" in five steps; tasting notes; why bitter and pungent is a virtue; analysis card with asit, peroksit, polifenol; storage advice | Process strip illustrated and sequenced |
| 5 | Ürünler `#urunler` | Three products drawn in SVG; size, price, two-line descriptor; the shipping rule | "Sipariş ver" on a card increments that product in the order form and scrolls to it |
| 6 | Sipariş `#siparis` | Quantity steppers for three products; live total including shipping; fields ad soyad, telefon, e-posta, adres, not | Inline Turkish validation; confirmation with reference, summary and "Özeti kopyala"; "Yeni sipariş" reset; noscript notice |
| 7 | Hasat Günleri `#hasat` | What the day is; hour-by-hour programme; what is included; adult and child prices; 2026 dates with places left; practical info including the rain policy; three visitor quotes | Dates computed from data and the clock; CTA to `#rezervasyon` |
| 8 | Rezervasyon `#rezervasyon` | Date choice among upcoming days; adult and child counts; ad soyad, telefon, e-posta, not; live price | Validation; confirmation; local decrement of places; sold-out and off-season states |
| 9 | SSS `#sss` | Seven questions: acılık, saklama, kargo süresi, hediye paketi, yağmur, ulaşım, çocuklar | `details/summary` accordion that works without JS |
| 10 | Ziyaret `#ziyaret` | Fictional address line; visits by appointment; phone and e-mail; SVG schematic map with travel times from İzmir centre and the airport | Only `tel:` and `mailto:` links |
| 11 | Footer | Wordmark, one line, anchor repeat, "© 2026" and the name | Nothing legal |
| – | Head | Title, description, viewport, theme-color, inline SVG favicon, fonts link with preconnect | – |

**Definition of done.** The page is done when every statement below is verified, not asserted:

1. `delivery/` contains exactly one file, `index.html`.
2. It opens from `file://` in Chrome with zero console errors and zero missing-string markers.
3. A network log shows requests only to the two Google Fonts hosts.
4. At widths 320, 360, 390, 430, 768, 1024, 1280, 1440, 1920 and 2560 there is no horizontal scroll, no overlap, no clipped or orphaned text. Screenshots are on file.
5. With fonts blocked the page is still well set and the layout shifts little.
6. With reduced motion forced nothing moves and nothing is missing.
7. Both forms show Turkish errors on bad input and a correct confirmation with correct totals on good input, by keyboard alone.
8. Date logic behaves on a date before the season, inside it, and after it.
9. All text meets AA contrast. Heading order, landmarks, labels and SVG accessible names pass an automated audit and a manual read.
10. All copy matches the bible and passes the Turkish proof with no open finding above minor.
11. Budgets in decision 5 are met.
12. The jury critique after revision scores at least 8 of 10 on every criterion.

## 2. Parts

**Standing rules for every agent.** Read the brief and this plan in full before starting. Use only the inputs listed for your part. Never ask the client; decide, and record the decision and its reason in your HANDOFF. Write only inside your own output folder; never touch `delivery/`. Every Turkish string on the page comes from the bible; if a string is missing, insert the marker `[[EKSİK: key]]` and list it in your HANDOFF so QA can grep for it. Self-check with headless Chrome screenshots before handing off, and store them. Do not upload the page or its text to any external validator or service. End with `HANDOFF.md` in the template given in section 3.

### Part 00 · Research and references · medium

Purpose: give the bible and the design verified facts and references, so nothing on the page is invented where a fact exists.

Inputs: brief, plan.

Work:
- Facts with source URLs: the Erkence variety and growing conditions on the Urla and Karaburun peninsula; what early-harvest sızma means in practice, with typical ranges for harvest window, extraction temperature, free acidity and polyphenols; Turkish tasting vocabulary for green, bitter and pungent oils; how Turkish farms run "hasat günü" experiences, what they include and what they charge; retail price ranges in late 2026 for premium early-harvest oil in 250 ml, 500 ml and tin formats; travel times to Urla from İzmir centre and from Adnan Menderes airport.
- Design references: 8 to 12 award-winning food, drink or farm brand sites, each with two or three lines on what works and what a no-photo page can borrow structurally; 4 to 6 illustration-led landing pages that use no photography.
- Font shortlist: six display and six text families from Google Fonts with verified latin-ext coverage, each proven by a rendered screenshot of the string "Şığ İIı Öö Üü Çç sipariş SİPARİŞ".

Output: `work/00-research/research.md`, `work/00-research/fonts/*.png`, `work/00-research/HANDOFF.md`.

Owner's acceptance: every number has a source; every font screenshot shows all glyphs correct; the references are analysed, not proposed for imitation.

### Part 01 · Brand and content bible · xhigh

Purpose: invent the business and write every word on the page, final.

Inputs: brief, plan, part 00.

Work:
- Name: short, Turkish, ownable, good as a wordmark. Search the web to confirm no existing Turkish olive-oil or food brand uses it, and record the searches.
- The family and the land: three named generations with years; the place described with real geography and a fictional farm; numbers for trees, hectares, altitude, distance to the sea, varieties led by Erkence; farming practice without reference to any real certifier.
- The oil: harvest window, hours from tree to press, extraction temperature, acidity, polyphenols, tasting notes, why bitter and pungent is a virtue, storage advice. Analysis figures labelled as the 2026 harvest.
- Products: three SKUs with size, price in TL plausible for late 2026 per the research, descriptor; the shipping rule.
- Harvest days: the day's programme hour by hour; what is included; adult and child price with the child age limit; capacity per day; every weekend date from 31 Ekim to 29 Kasım 2026 with places left, each verified by `date -d`; what to wear and bring; the rain policy.
- Voice: warm, exact, unhurried, first person plural. Concrete detail beats adjectives. A banned-words list including eşsiz, benzersiz, kaliteli, premium, lezzet şöleni, hoş geldiniz. Sentences short enough to read aloud. Turkish that was written, not translated.
- Writing conventions under a heading "Yazım": TDK orthography; “ ” quotation marks; apostrophes on proper-noun suffixes; thousands with a dot and TL after the number with a non-breaking space, no decimals when whole; dates as "7 Kasım 2026 Cumartesi"; times in one chosen style; a non-breaking space before units; sentence case in headings.
- The full copy map keyed by section id and role as defined in section 3, including all form microcopy: labels, placeholders, helper text, every error message, confirmation texts for both forms, the three harvest badge states, the off-season and sold-out states, the noscript notice, the skip link and menu labels, the meta title and description, the wordmark text and the favicon letter.
- Seven FAQ entries and three visitor quotes using first names only.
- `data.json` in the schema of section 3, consistent with the copy to the digit.

Output: `work/01-bible/bible.md`, `work/01-bible/data.json`, `work/01-bible/HANDOFF.md`.

Owner's acceptance, Gate 1: every copy key is present; bible and data.json agree on every number; the owner re-runs `date -d` on every date; the name check is recorded; the hero and story read aloud contain no banned word and no translated-sounding sentence; prices sit inside the researched range.

### Part 02 · Art direction and design system · max

Purpose: decide how the page looks and moves so it reads as Urla without a single photograph. This is the part that separates a good page from a winning one.

Inputs: brief, plan, parts 00 and 01.

Work:
- A one-sentence concept and one signature idea a jury will remember, executed flawlessly, with everything else restrained. Seeds the agent may take or beat: the hero light follows the visitor's local hour with a small control to preview dawn, noon and dusk; a drop of oil travels a drawn path through the sections and fills the bottle by the products section; an interactive tasting wheel that lights the matching words in the text. The idea must have a reduced-motion fallback that loses nothing essential.
- Illustration style: flat shapes, limited palette, fine grain from a small tiled pattern rather than a full-screen filter, consistent line weight, stylised rather than literal. Three test motifs drawn as SVG: a tree, the hills with the sea, the bottle.
- Tokens in `tokens.css`: colour roles with computed contrast ratios; two type families at most, chosen from the verified shortlist, with a fluid clamp scale and line-length rules; spacing, radii, shadows; motion durations and easings; the motion rules.
- Layout: annotated section-by-section sketches for 390 and 1440 widths as HTML or SVG; header behaviour on both; whether a fixed phone CTA bar exists; form design including error and confirmation states; empty states.
- The asset contract: a table of every illustration and icon the build needs, with id, placement, viewBox, aspect ratio, colour tokens used, motion hooks, reduced-motion behaviour and size budget.
- A hero proof: `hero-proof.html` built with the real copy and the real fonts, screenshotted at 390×844 and 1440×900.
- A style tile: `style-tile.html` rendering the tokens, type specimens with the Turkish glyph string and real headlines, buttons, inputs, a card.

Output: `work/02-design/spec.md`, `tokens.css`, `style-tile.html`, `hero-proof.html`, `motifs/*.svg`, `shots/*.png`, `HANDOFF.md`.

Owner's acceptance, Gate 2: the hero proof makes the owner stop, and it does not resemble a generic olive-oil site; every text colour pair passes AA; fonts render the Turkish string; the asset contract covers every section in the inventory; the signature idea has its fallback; nothing is raster. If the gate fails, the owner re-dispatches this part once with written notes.

### Part 03 · Illustration and motion library · xhigh

Purpose: draw every visual as SVG and CSS to the asset contract, animated where the contract says so.

Inputs: brief, plan, parts 01 and 02.

Work: the layered hero landscape; five process illustrations for "ağaçtan şişeye"; three product renderings; an icon set of about twelve; the schematic map; dividers and ornaments; the wordmark and the favicon SVG. Each asset is a standalone `.svg` with a viewBox, no width or height, no external references, and every internal id prefixed with the asset name so inlined assets never collide. Motion snippets live in `motion.css` and `motion.js` and respect reduced motion. A `demo.html` shows every asset at two sizes with a reduced-motion toggle. Assets are hand-cleaned or optimised, within the contract budgets.

Output: `work/03-art/assets/*.svg`, `motion.css`, `motion.js`, `demo.html`, `assets.md`, `shots/*.png`, `HANDOFF.md`.

Owner's acceptance: demo screenshots at 390 and 1440 and one under forced reduced motion; each asset matches its contract dimensions; id uniqueness checked with grep across all files; total size within budget; one style across every asset by the owner's eye.

### Part 04 · Page build · xhigh

Purpose: build the full page as one file, exactly to bible, spec and assets.

Inputs: brief, plan, parts 01, 02, 03.

Work: semantic HTML with the fixed ids and landmarks; CSS from the tokens; vanilla JS for the header, reveals, both forms, date awareness, the product-to-form link and the signature idea; SVG assets inlined at point of use; fonts link with preconnect; head metadata and inline favicon; noscript notice; the iOS and accessibility rules in decision 6. Reveal animations must be off until JS adds a class, so the page is complete without JS and in screenshots. Data from `data.json` is inlined as one object. The agent self-checks with the viewport matrix, a console capture, a `file://` run, a fonts-blocked run, a reduced-motion run, and a harness copy that exercises both forms, all described in section 4.

Output: `work/04-build/index.html`, `work/04-build/shots/*.png`, `work/04-build/HANDOFF.md` with a budget table and known gaps.

Owner's acceptance, Gate 3: the owner runs the quick protocol of section 4; no blocker; copy markers absent; proceeds to the reviews.

### Part 05a · Turkish copy and typography proof · high

Inputs: parts 01 and 04.

Work: extract the rendered text with `--dump-dom`; compare every string to the bible; check TDK orthography, quotation marks, apostrophes, non-breaking spaces before units and TL, İ and ı under uppercase styling, widows and orphans in headlines at 390 and 1440, long-word overflow at 320, consistency of every number and date with `data.json`, and the tone against the voice rules. Write each finding with the exact replacement text.

Output: `work/05-review/copy-proof.md`.

### Part 05b · Technical QA · high

Inputs: plan, parts 02 and 04.

Work: the full viewport matrix with screenshots; console capture; a network log listing unique hosts; `file://` open; fonts blocked; reduced motion; keyboard-only path through the whole page and both forms; an automated accessibility audit with axe through Playwright if it can be installed with the system Chrome, otherwise a manual audit against the AA list; both forms exercised through a harness copy of the page with an injected test script that fills, submits, asserts, and writes a report into the DOM for `--dump-dom`; date logic tested with a stubbed Date before, inside and after the season; size and DOM counts against budget; HTML validity with a local validator if present; Lighthouse against a local `python3 -m http.server` if installable; a sanity check of animation CPU cost on the hero.

Output: `work/05-review/tech-qa.md`, `work/05-review/shots/*.png`, `work/05-review/harness/`.

### Part 05c · Jury critique · xhigh

Inputs: brief, plan, parts 02 and 04.

Work: judge the page as an international jury would, with the rubric in section 4, each criterion scored 1 to 10 with evidence and a screenshot. List the ten changes that would raise the score most, each concrete and located by section id and viewport. List what to remove. Compare against the references in part 00 without proposing imitation.

Output: `work/05-review/jury.md`.

Reason for xhigh: a checklist cannot tell good from great. This part has to think like a designer, not tick boxes.

### Part 06 · Owner triage and revision brief · owner · xhigh

Merge the three review files, de-duplicate, decide each item, and write `work/06-revision-brief.md`: an ordered list where blockers and majors are mandatory, minors as far as they fit, nits optional, plus a "do not change" list protecting what works.

### Part 07 · Revision build · xhigh

Inputs: parts 04, 05a, 05b, 05c, 06, with 01, 02 and 03 for reference.

Work: apply the brief in order, re-run every self-check from part 04, and produce a table that closes each finding by id with evidence.

Output: `work/07-revised/index.html`, `work/07-revised/shots/*.png`, `work/07-revised/HANDOFF.md` with the closed-findings table and a diff summary.

Reason for xhigh: the brief will include design-level changes from the jury, not just fixes.

### Part 08 · Owner assembly and trial · owner · high

Run the full trial protocol of section 4 against the revised file. Make only trivial fixes directly and note each in the trial log. Copy the file to `delivery/index.html`. Write `work/08-owner-trial/trial.md` with every definition-of-done item marked verified and its evidence path.

### Audit · external

The independent auditor reads and tries `delivery/index.html`. Not dispatched by the owner.

### Part 10 · Owner audit triage · owner · high

Reproduce every audit finding, decide the fix, write `work/09-audit-fix/brief.md`. Trivial items the owner fixes directly and notes.

### Part 11 · Audit fix · high

Inputs: parts 07 or 08 output, 10, with 01 and 02 for reference. Apply the brief, re-run the self-checks, close each finding with evidence.

Output: `work/09-audit-fix/index.html`, `shots/*.png`, `HANDOFF.md`.

### Part 12 · Owner final trial and re-delivery · owner · high

Run the full protocol again, not only the touched areas. Replace `delivery/index.html`. Write `work/10-final/trial.md`.

## 3. Seams, contracts and order

**Seam A · research to bible and design.** Facts with sources; optional in use, mandatory as a check on prices and figures. Owner reads both and flags any page fact not traceable to research or to a recorded decision.

**Seam B · bible to design and build.** Three contracts:
- Section ids and order are fixed in section 1 and are the HTML ids.
- The copy map keys every string as `sectionid.role`, for example `giris.h1`, `giris.lead`, `giris.cta_siparis`, `hikaye.timeline[2].title`, `siparis.error.telefon`, `hasat.badge.before`, `rezervasyon.state.soldout`, `meta.title`, `nav.skip`. The build never invents a string.
- `data.json` carries `brand` with name and tagline; `products[]` with id, name, size, price, unit, desc; `shipping` with freeFrom, fee, note; `harvestDays[]` with date in ISO form, start, end, capacity, left; `harvestPrice` with adult, child, childUntilAge; `contact` with phone, email, address. Prices are integers in TL.

**Seam C · design to art and build.** `tokens.css` names variables as `--color-*`, `--font-*`, `--step-*`, `--space-*`, `--radius-*`, `--dur-*`, `--ease-*`. The asset contract table is the only source of asset ids, sizes and hooks. Component class names in the spec are used verbatim by the build.

**Seam D · art to build.** One standalone SVG per asset, prefixed ids, no width or height attributes, colours through tokens or `currentColor`, motion hooks as the contract names them. `assets.md` states how each is placed.

**Seam E · build to reviews.** One file plus a HANDOFF that says how it was self-checked, what is known to be weak, and where the harness lives. Reviewers do not fix; they write findings.

**Seam F · reviews to revision.** Unified findings format: `id | severity | section id and viewport | what | evidence path | proposed fix`. Severities: blocker breaks use or the brief; major hurts the bar; minor; nit. The owner's brief resolves conflicts between reviewers.

**Seam G · revision to owner.** Closed-findings table by id with evidence, and a diff summary. The owner verifies closures against the evidence, not the table.

**HANDOFF template**, used by every part: what I produced with paths; decisions I made and why; deviations from plan or bible and why; known gaps; how the owner can verify in five minutes; time spent.

**Order and gates.**

| Step | Part | Runs | Depends on | Gate after | Estimate |
|---|---|---|---|---|---|
| 00 | Research | alone | – | owner skim | 45 min |
| 01 | Bible | alone | 00 | Gate 1, content locked | 90 min |
| 02 | Design | alone | 01 | Gate 2, direction locked | 2.5 h |
| 03 | Art | alone | 02 | owner check | 3 h |
| 04 | Build | alone | 03 | Gate 3, candidate | 3 h |
| 05a, 05b, 05c | Reviews | in parallel | 04 | – | 1 h |
| 06 | Owner triage | owner | 05 | – | 30 min |
| 07 | Revision | alone | 06 | Gate 4, final candidate | 2 h |
| 08 | Owner assembly and trial | owner | 07 | delivery | 1 h |
| – | Audit | external | 08 | – | – |
| 10 | Owner audit triage | owner | audit | – | 30 min |
| 11 | Audit fix | alone | 10 | – | 1.5 h |
| 12 | Owner final trial | owner | 11 | re-delivery | 1 h |

Art and build run in sequence, not in parallel. On a page with no photographs the join between illustration and layout is the biggest quality risk, and the build integrating finished assets removes it.

## 4. Checks

**Viewport matrix** for every screenshot run: 320×568, 360×800, 390×844, 430×932, 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080, 2560×1440, plus full-page captures at 390 and 1440 using a window height of 12000, and device scale factor 2 or 3 at 390 and 1440.

**Quick protocol**, used by the owner at Gate 3: fold and full-page screenshots at 390 and 1440, console capture, grep for missing-string markers, open the two forms in the harness report.

**Full protocol**, used by the owner at steps 08 and 12 and by QA at 05b:

```
URL=file://$PWD/delivery/index.html
OUT=work/08-owner-trial
C="google-chrome --headless=new --no-sandbox --hide-scrollbars --virtual-time-budget=10000"

$C --window-size=390,844  --force-device-scale-factor=3 --screenshot=$OUT/shots/390-fold.png  $URL
$C --window-size=390,12000 --screenshot=$OUT/shots/390-full.png $URL
$C --window-size=1440,900 --force-device-scale-factor=2 --screenshot=$OUT/shots/1440-fold.png $URL
$C --window-size=1440,12000 --screenshot=$OUT/shots/1440-full.png $URL
$C --window-size=390,12000 --force-prefers-reduced-motion --screenshot=$OUT/shots/390-reduced.png $URL
$C --window-size=1440,12000 \
   --host-resolver-rules="MAP fonts.googleapis.com ~NOTFOUND, MAP fonts.gstatic.com ~NOTFOUND" \
   --screenshot=$OUT/shots/1440-nofonts.png $URL

google-chrome --headless=new --no-sandbox --virtual-time-budget=10000 \
   --enable-logging=stderr --v=1 --log-net-log=$OUT/netlog.json --dump-dom $URL \
   2>$OUT/console.log >$OUT/dom.html
grep -i "console" $OUT/console.log
grep -c "EKSİK" $OUT/dom.html
grep -o 'https\?://[a-zA-Z0-9.-]*' $OUT/netlog.json | sort -u
```

The remaining widths in the matrix are run the same way. Then the forms harness is run on a copy of the delivered file with its injected test script, once for each stubbed date, and its DOM report is read. Then the owner reads the whole page once on the 390 full-page capture and once on the 1440 capture as a visitor would, from top to bottom, and writes down anything that breaks the spell.

**Per-part checks** are the acceptance lines in section 2. The owner trusts screenshots and logs, not claims. Every gate failure gets one re-dispatch with written notes before the plan is revisited.

**Jury rubric**, used in part 05c and again by the owner at step 08: Design, is the typography and composition of award quality; Creativity, is there one original idea executed flawlessly; Usability, can both conversions be completed easily on a phone by touch and by keyboard; Content, does the Turkish copy make a stranger want this oil and this day; Craft, is the code clean, light, accessible and robust without fonts, without JS, under reduced motion. Each 1 to 10. The owner does not deliver below 8 on any criterion without recording why.

## 5. Delivery

- `delivery/index.html`, a single self-contained UTF-8 file, the only file in `delivery/`. Opens from `file://` and from any static host, on desktop and phone browsers.
- `work/` holds every part's outputs, screenshots, logs, review files, and the owner's trial logs, so the auditor can trace any element of the page to a decision.
- Nothing else is delivered: no readme, no assets folder, no second page.

## 6. Risks

| Risk | Effect | Mitigation | Owner |
|---|---|---|---|
| Fictional name collides with a real brand | Implies a real business; embarrassment | Web check recorded in the bible; Gate 1 verifies | 01, owner |
| Fonts lack Turkish glyphs, or İ and ı break under uppercase styling | Visibly wrong Turkish | Verified shortlist in 00; glyph string in the style tile; `lang="tr"`; proof in 05a | 00, 02, 05a |
| No-photo page looks like clip art | Fails the bar outright | Style defined and proven at Gate 2; one library part at xhigh; jury critique; revision budget | 02, 03, 05c |
| Signature idea costs performance or comfort | Jank on phones, motion sickness | Transform and opacity only; reduced-motion fallback designed in; CPU sanity check in 05b | 02, 04, 05b |
| Reveal animations hide content in screenshots and without JS | Blank sections in audit and in no-JS reading | Content visible by default; JS opts in; QA runs with full-height windows and without JS | 04, 05b |
| Google Fonts blocked or slow | Page falls apart on fallback fonts | Tuned fallback stack; fonts-blocked screenshot is a required check | 02, 04 |
| `file://` restrictions | Page breaks when opened from disk | No fetch, no modules, no workers; `file://` is the primary test URL | 04, 05b |
| Dates wrong or page goes stale | Wrong weekdays, empty harvest list after the season | `date -d` verification; date-aware logic with explicit off-season state; three stubbed dates in QA | 01, 04, 05b |
| Turkish copy longer than designed for | Overflow at 320 and 360, broken headlines | Hero proof uses real copy; 320 width in every matrix; proof checks widows | 02, 04, 05a |
| Fresh agents misread upstream work | Drift between copy, design and build | Fixed ids, copy keys and data schema; HANDOFFs with deviations; owner gates | owner |
| Scope creep into legal text, cookie banners, extra pages or outbound links | Breaches the brief | Explicit out-of-scope list; QA greps for links and forbidden words | 04, 05b |
| Confirmation copy over-promises | Reads as deceptive | Honest confirmation wording fixed in the bible | 01 |
| Fictional contact details hit a real number | Nuisance to a stranger | Valid-format but patterned number; fictional domain | 01 |
| Only Chrome is available for testing | Safari and Firefox regressions unseen | Conservative CSS with `@supports` fallbacks; no CSS scroll-driven animation without JS fallback; `dvh` fallback; 16 px inputs | 04 |
| One revision round after audit | Something stays broken | Owner reproduces each finding first; full protocol re-run, not a spot check | owner |

## DISPATCH

| step | part | effort | reason | inputs | output path |
|---|---|---|---|---|---|
| 00 | Research and references | medium | Standard research with sources; feeds facts, prices and a verified font shortlist | brief, plan | `work/00-research/research.md`, `work/00-research/fonts/`, `work/00-research/HANDOFF.md` |
| 01 | Brand and content bible | xhigh | Strategy plus every final word the visitor reads; anchors all later parts | brief, plan, 00 | `work/01-bible/bible.md`, `work/01-bible/data.json`, `work/01-bible/HANDOFF.md` |
| 02 | Art direction and design system | max | The single most leveraged step on a no-photo page; must produce the winning idea and prove it in a hero | brief, plan, 00, 01 | `work/02-design/spec.md`, `tokens.css`, `style-tile.html`, `hero-proof.html`, `motifs/`, `shots/`, `HANDOFF.md` |
| 03 | Illustration and motion library | xhigh | Long creative build of every visual; quality here is the page's quality | brief, plan, 01, 02 | `work/03-art/assets/`, `motion.css`, `motion.js`, `demo.html`, `assets.md`, `shots/`, `HANDOFF.md` |
| 04 | Page build | xhigh | Long unattended build of code that must be excellent, accessible and light | brief, plan, 01, 02, 03 | `work/04-build/index.html`, `work/04-build/shots/`, `work/04-build/HANDOFF.md` |
| 05a | Turkish copy and typography proof | high | Final check of text a client reads, in Turkish, against the bible | 01, 04 | `work/05-review/copy-proof.md` |
| 05b | Technical QA | high | Final check of internal work across viewports, forms, dates, fonts, motion and budgets | plan, 02, 04 | `work/05-review/tech-qa.md`, `work/05-review/shots/`, `work/05-review/harness/` |
| 05c | Jury critique | xhigh | Design judgement against an award bar; a checklist cannot do it | brief, plan, 02, 04 | `work/05-review/jury.md` |
| 06 | Owner triage and revision brief | xhigh, owner | Deciding what Ferrari means from three reviews is judgement, not bookkeeping | 05a, 05b, 05c | `work/06-revision-brief.md` |
| 07 | Revision build | xhigh | Carries the page from good to jury level; includes design-level changes | 04, 05a, 05b, 05c, 06, with 01, 02, 03 for reference | `work/07-revised/index.html`, `work/07-revised/shots/`, `work/07-revised/HANDOFF.md` |
| 08 | Owner assembly and trial of the whole | high, owner | Final check of internal work; full protocol; placing the file | 07 | `delivery/index.html`, `work/08-owner-trial/trial.md`, `work/08-owner-trial/shots/` |
| – | Independent audit | external | Not dispatched by the owner | `delivery/index.html` | auditor's report |
| 10 | Owner audit triage | high, owner | Reproduce each finding and decide the fix | audit report, 08 | `work/09-audit-fix/brief.md` |
| 11 | Audit fix | high | Code that must be good, applied to a defined list | 08 output, 10, with 01 and 02 for reference | `work/09-audit-fix/index.html`, `work/09-audit-fix/shots/`, `work/09-audit-fix/HANDOFF.md` |
| 12 | Owner final trial and re-delivery | high, owner | Full protocol again, then the one revision round is closed | 11 | `delivery/index.html`, `work/10-final/trial.md` |