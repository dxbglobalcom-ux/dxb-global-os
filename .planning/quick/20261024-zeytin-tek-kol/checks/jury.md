# r9 · Jury gate (G4) with visitor panel (G3): Yelkovan Zeytinliği

**Page judged:** `delivery/index.html` (345,363 bytes, file time 21:42), Chrome 155, 24 Oct 2026 at 21:43–21:52.
**Rule applied:** plan-v1 §7 jury gate and panel, §1 bar, §2.8 G. Per plan v2 §1, this ran once and the verdict stands as recorded. There is no loop.

## Verdict

| Gate | Result | Basis |
|---|---|---|
| **G4 comparative jury** | **FAIL** | Design **7.2** is below the benchmark median of 7.65, and Creativity **7.0** is below the median of 7.45. On neither criterion is the page in the top quarter: it ranks 17/17 on Design and 15/17 on Creativity, where the top quarter is rank ≤ 4. Usability (8.0, rank 1) and Content (8.4, rank 1) both pass. |
| **G3 visitor panel** | **PASS** (simulation) | All six personas answer Q1–4 correctly from the page alone. Four give a firm yes (P1, P2, P3, P5). Both "maybe" answers name their stopper. No persona is confused about what a submission does, and there is no S1/S2 stopper. |
| **G5 developer criteria** | **No contrary evidence; final call is r8's** | Six Chrome runs: 0 console errors or warnings; only Google Fonts hosts (7 requests); no horizontal overflow at 360, 384, 390, 430 or 1440; 0 requests on order submit; storage empty; CLS 0.0001. Firefox, WebKit, axe, Lighthouse and B6 were not run by me. |

**In plain terms:** the page is a very well-made, honest and useful brand page. It beats every benchmark on usability and content, and its Awwwards-weighted average (7.52) would place it 5th of 17. But the bar is "credible winner", and the gate tests each criterion separately. Here the page loses where juries look first: the hero crown, a body that reads as an editorial template, and a time concept that stays in small type. My reading of the likely Awwwards outcome is a probable Honorable Mention, with Site of the Day possible but not credible. **The 20-minute fixes below would raise Design and Creativity by about 0.2–0.3. That is not enough to flip the gate.** Closing the gap means redrawing the crown and adding art to the body, which is hours of work, not minutes.

## 1. Method and evidence

- **Identical evidence** (plan-v1 §7): the first screen plus three one-viewport scrolls at 1440×900 and 390×844.
  - Benchmarks: P1's captures, `work/01-research/benchmarks/<site>/{1440,390}-s0..s3.jpg` and `sheet.jpg`.
  - Ours: `work/r9-jury/shots/chrome-1440x900@1-d1440/{top,y_900,y_1800,y_2700}.png` and `chrome-390x844@3-mobile-m390/{top,y_844,y_1688,y_2532}.png`.
  - Extra captures of ours: section and interaction shots in `chrome-1440x900@1-try1440/`, `chrome-390x844@2-mobile-try390/` and `chrome-1440x900@1-sec1440/`; hero motion frames in `chrome-1440x900@1-frames1440/`; panel device sizes in `chrome-{360x640,430x932,384x512}@2-mobile-panel/`.
- **Live try of the main interaction.** Ours was tried with `work/r9-jury/try.json`, 40/40 steps OK at both sizes:
  - olive clock ArrowRight ×2, which moved it Ekim → Aralık;
  - an order of 2 × Erken Hasat and 1 × Üç Hafta, giving a summary of 3.550 TL, with `netcheck` showing 0 requests;
  - harvest-day date and party selection, giving 3.600 TL.

  **Gap:** the benchmarks' interactions were *not* tried live (time budget). Their Usability scores therefore come from the captures and are flagged as such.
- **Scores** use the Awwwards criteria and weights: Design 40%, Usability 30%, Creativity 20%, Content 10%. The script and full table are in `work/r9-jury/_scripts/score.py` and `scores.txt`.
  - **Calibration check:** each benchmark's weighted score falls within −0.11 to −0.01 of its official SOTD score.
- **Excluded for lack of evidence:**
  - Santioni (8.09): no usable headless capture;
  - Ruinart (7.32): only the entry gate was captured.

  Combined set: 16 benchmarks plus ours, 17 sites, so the top quarter is rank ≤ 4.
- **Partial captures, scored on what is visible:** Gary (cookie wall), La Revoltosa (loader and mis-click) and SŌM (country modal).

## 2. Scores

### 2.1 Benchmarks (one line each; evidence = `work/01-research/benchmarks/<folder>/sheet.jpg` + the 8 captures)

| Site · official | D | U | Cr | Co | Wtd | Justification |
|---|---|---|---|---|---|---|
| Sleep Well Creatives · 8.03 | 8.4 | 7.3 | 8.5 | 7.6 | 8.01 | Blue/cream chapters alternate, and the 08h00 dial *is* the canvas. Time is told through colour. The intro costs some usability. |
| Maxima Therapy · 7.73 | 8.0 | 7.2 | 7.8 | 7.6 | 7.68 | A bold flat landscape with cards rising over it, all in one hand. A cookie wall covers the phone view. |
| Champions For Good · 7.69 | 8.0 | 7.2 | 8.0 | 7.2 | 7.68 | Poster type and animated pictogram athletes, with a palette change per chapter. |
| Ponpon Mania · 7.64 | 8.0 | 6.8 | 8.3 | 7.2 | 7.62 | A strong illustrator's hand with record-sleeve cards. Novel, but content is thin and the phone view is static. |
| Aupale Vodka · 7.50 | 7.9 | 7.0 | 7.3 | 7.6 | 7.48 | A refined serif/italic headline on a topographic ground. Calm and land-based. Scroll barely advances on the phone. |
| Gary (partial) · 7.50 | 7.8 | 6.8 | 8.0 | 7.2 | 7.48 | A painterly forest game with a harvest mechanic. The cookie wall covers everything. |
| La Revoltosa (partial) · 7.45 | 7.6 | 7.0 | 7.5 | 7.8 | 7.42 | Script wordmark, one red and bubbles, in a first-person brand voice. Long loader on the phone. |
| /zeroz · 7.41 | 7.8 | 6.6 | 7.8 | 6.8 | 7.34 | Glowing 3D product, chaptered. Black screens while loading. |
| SŌM (partial) · 7.36 | 7.5 | 7.3 | 6.9 | 7.6 | 7.33 | Editorial commerce with a mono/sans mix. A modal over every shot. |
| Don Molinico · 7.35 | 7.6 | 6.9 | 7.1 | 7.6 | 7.29 | Poster-scale condensed type over photography: tradition plus place. A large consent box. |
| Bucks Sauce · 7.34 | 7.3 | 7.3 | 7.0 | 8.0 | 7.31 | The strongest voice in the set, with claim cards. Layout is conventional. |
| Crav Burgers · 7.25 | 7.3 | 7.2 | 7.3 | 7.0 | 7.24 | Loud type, a character burger, ordering in the hero. |
| sakazuki · 7.23 | 7.7 | 6.4 | 7.2 | 6.8 | 7.12 | Mood from warm blur and a split wordmark. Low-contrast navigation. |
| Ciao Energy · 7.22 | 7.6 | 6.6 | 7.4 | 6.6 | 7.16 | One 3D can explored in depth. Black first screen. |
| Planetoño · 7.22 | 7.4 | 6.6 | 7.6 | 6.8 | 7.14 | A fully illustrated fictional menu. Empty red screens while scrolling. |
| KOKUYO · 7.13 | 7.3 | 6.6 | 7.3 | 6.8 | 7.04 | A pop-up still life with highlighted type. Scroll does not advance. |
| **Median** | **7.65** | **6.95** | **7.45** | **7.20** | 7.33 | |

### 2.2 Ours: Yelkovan Zeytinliği (weighted 7.52)

| Criterion | Score | Justification | Evidence |
|---|---|---|---|
| **Design** | **7.2** | **Strengths:**<br>• a coherent paper, ink and aubergine palette;<br>• Fraunces with correct Turkish;<br>• award-grade drawing in the packshots (the tin, the Üç Hafta crate with live lot labels) and in the olive-clock dial.<br>**Held down by:**<br>• **the hero crown**, whose clumps are serrated star polygons that read as oak or crumpled paper, not olive; the background trees are drawn in a softer, different hand;<br>• **the body**, which is an editorial template (kicker, H2, two columns, cards, accordion);<br>• about 600 px of empty right half beside the bahçe, erken-hasat and hasat heads at 1440, and about 200 px dead bands between sections;<br>• the eight time-of-day grounds, which differ by only a few % of luminance, so the page reads as one beige sheet until the black footer;<br>• at 390, a flat sky block with a visible seam above the hero art. | `d1440/top.png`, `y_1800.png`, `y_2700.png`; `try1440/hasat.png`, `siparis.png`, `clock-ekim.png`; `m390/top.png` |
| **Usability** | **8.0** | **Strengths:**<br>• no loader, gate or cookie wall;<br>• H1, sub and both CTAs on the first screen at 360, 390 and 1440;<br>• sticky nav showing the current section;<br>• the clock works by keyboard with a visible focus ring;<br>• live totals and clear summaries;<br>• the honest-outcome lines sit beside both submit buttons.<br>**Minuses:**<br>• both forms are long;<br>• the harvest-day form sits far below its CTA's section intro. | `try1440.log`, `try390.log` (40/40), `try1440/clock-aralik.png`, `siparis-ozet.png`, `hasat-form.png`, `panel/*/top.png` |
| **Creativity** | **7.0** | **Real, farm-specific ideas:**<br>• "Yelkovan" as both minute hand and weathervane;<br>• ledger times as the section kickers (07.45 → 18.23 gün batımı);<br>• an olive clock that ripens the fruit and changes kg per litre;<br>• lot-and-press-time labels on the bottles.<br>**But they stay in small type and a slider:**<br>• the day never visibly passes;<br>• the hero's poyraz is a subtle silvering, peaking at 2.6% of pixels changed per 250 ms;<br>• there is no scroll-driven moment and nothing a juror would screen-record.<br>Compare Sleep Well, where time *is* the canvas. | `frames1440/report.json` (diffs ≤ 0.026), `d1440/*`, `try1440/clock-*.png` |
| **Content** | **8.4** | **Best in the set, alongside Bucks and La Revoltosa:**<br>• three named generations, each with dated acts;<br>• concrete figures: 9,6 kg/L, %0,22, 412 mg/kg;<br>• the process with clock times;<br>• the honest "kaç yaşında olduğunu bilmiyoruz";<br>• full harvest-day logistics, rain policy, travel and FAQ.<br>The Turkish read clean to me; formal F checks belong to r8. | `work/r9-jury/page-text.txt`, `try1440/yag.png`, `map.png` |

**Gate arithmetic** (from `scores.txt`):

| Criterion | Ours | Benchmark median | Rank of 17 | Result |
|---|---|---|---|---|
| Design | 7.2 | 7.65 | 17 | below median |
| Usability | 8.0 | 6.95 | 1 | pass |
| Creativity | 7.0 | 7.45 | 15 | below median |
| Content | 8.4 | 7.20 | 1 | pass |

**Top-quarter test** (rank ≤ 4 on Design or Creativity): not met.

## 3. Visitor panel (G3): a simulation, not research

Each persona read `page-text.txt` in reading order, plus the captures at their own size. Persona 6's view (768 at 200% zoom) was emulated as a 384×512 viewport.

| # | Q1 What and where | Q2 Difference | Q3 Main price, worth it? | Q4 Harvest day: what, cost, date | Q5 Act now? | Q6 Stopper | Q7 Confusing or untrustworthy |
|---|---|---|---|---|---|---|---|
| 1 Cook, İstanbul, 390 | A family olive farm in Ovacık, Urla, selling early-harvest oil ✔ | Erkence picked green-to-alaca, pressed the same day, %0,22, 412 mg/kg ✔ | 950 TL for 500 ml (1.900 TL/L), shipping included; worth it for this freshness ✔ | Picking, lunch under the tree, the mill, a tasting, 250 ml of oil to take home; 2.400 TL alone; 1 Kasım ✔ | **Yes, order**: lot dates and analysis on the label | None real; would like a bigger tin | Nothing |
| 2 Gift buyer, İzmir, 1440 | ✔ | Three weeks of harvest in three bottles ✔ | Erken Hasat 950 TL; Üç Hafta 1.650 TL as the gift ✔ | ✔; 2.400 TL; 14 Kasım Cumartesi ✔ | **Yes, order** Üç Hafta: the FAQ confirms gift delivery and 1–3 days | No gift-message field (the note field covers it) | Nothing |
| 3 İzmir parents (6 and 10), 390 | ✔ | ✔ | ✔ | 2 adults 4.800 + 1.200 for the 10-year-old + free for the 6-year-old = **6.000 TL**; 8 Kasım Pazar (9 places) ✔ | **Yes, harvest day**: children's rakes, rain plan, 45 min from Konak | 09.30–15.45 is long for a 6-year-old | Nothing; "küçükler de yer tutar" is clear |
| 4 Sceptic, 61, Manisa, 360 | ✔ | ✔ (but "of course they say that") | 950 TL; the 2 L tin at 1.450 TL/L is the sensible buy, but still dear ✔ | ✔; 2.400 TL per adult is steep ✔ | **Maybe**: the kg-per-litre clock explains the price | **Price, and self-reported analysis and tasting scores** | "aile tadımımızdan" scores feel self-graded |
| 5 Wine-route couple, 430 | ✔ | ✔ | ✔ | ✔; 4.800 TL; 7 Kasım Cumartesi (3 places) ✔ | **Yes, harvest day**: the mill moment and the quotes | Transport not included; no tie-in to Urla's wine route | Nothing |
| 6 Buyer, 72, 200% zoom | ✔ | ✔ | ✔ | ✔; 2.400 TL; 15 Kasım Pazar ✔ | **Maybe** | Would rather phone than fill a long form | Nothing; "Doldu" and "kalan yer" are clear |

**Result:** all six answer Q1–4 correctly; four give a firm yes; both maybes name their stopper. Every persona understood, from the line beside each button and from the confirmation, that nothing is sent and nothing is reserved. No S1/S2.

## 4. Protect these (they carry the score)

- The packshots with live lot labels, and the olive-clock dial: the best drawing on the page.
- The first screen's information design: badge, ledger time and place, H1, sub and both CTAs, with no gate.
- The honest-outcome lines and confirmations, and the clean, fast, zero-request behaviour.
- The Turkish copy and its concrete numbers; the people and the ledger-time kickers.

## 5. Top fixes that fit in 20 minutes (ranked by gain per minute; each moves Design or Creativity)

> Re-run the r7 protocol after any of these: axe for contrast after F1, reduced motion after F2, and C2 at 360×640 and 390×844 after F3.

**F1 · Make the day visible. CSS only, about 6 min. Gains Creativity and Design.**

The eight grounds already run dawn → morning → noon → mill → afternoon → golden → dusk → night (`.art-ground--*`), but the mixes are 10–35% of near-paper colours, so nobody sees them.

Append this after the existing rules (stronger mixes, same tokens):

```css
.art-ground--dawn{background:linear-gradient(180deg,var(--c-sky-dawn) 0,var(--c-paper) 85%)}
.art-ground--morning{background:linear-gradient(180deg,var(--c-paper) 0,color-mix(in srgb,var(--c-sky-day) 75%,var(--c-paper)) 100%)}
.art-ground--noon{background:color-mix(in srgb,var(--c-sky-day) 80%,var(--c-paper))}
.art-ground--golden{background:linear-gradient(180deg,color-mix(in srgb,var(--c-paper-2) 70%,var(--c-paper)) 0,color-mix(in srgb,var(--c-earth) 28%,var(--c-sky-dawn)) 100%)}
.art-ground--dusk{background:linear-gradient(180deg,color-mix(in srgb,var(--c-earth) 28%,var(--c-sky-dawn)) 0,color-mix(in srgb,var(--c-accent) 18%,var(--c-paper-2)) 100%)}
```

- **Tested on a copy** (`work/r9-jury/_test/index.html`, which has F1 with dusk at 24% plus F2; `delivery/` was not touched):
  - axe: 0 violations, with the same two "incomplete" rules as the original (color-contrast and label-content-name-mismatch);
  - 0 console errors;
  - captures: `_test/chrome-1440x900@1-fx/{bahce,hasat,sss}.png`. The FAQ now reads as a visible warm dusk, and the morning reads as cool sky.
- **Computed contrast** at the darkest point (dusk bottom), before grain:
  - at 24%: `--c-ink-2` 4.52 and `--c-accent` 4.68, too close to 4.5;
  - at **18%**, as given above: 5.00 and 5.17. `--c-ink` stays at ≥ 8.5 throughout.

**F2 · The wordmark's minute hand runs through the day as you scroll. About 8 min. Gains Creativity, the brand's own signature.**

The hand is `#r4-wm g[transform^="translate(15.5 20.5)"]` (rest pose `rotate(-38)`). The footer's `<use href="#r4-wm">` follows it automatically. The kickers span 07.45 → 18.23, which is 638 minutes, or 10.63 turns of a minute hand. That is about one turn per 1,200 px.

```js
(()=>{const h=document.querySelector('#r4-wm g[transform^="translate(15.5 20.5)"]');
if(!h||matchMedia('(prefers-reduced-motion: reduce)').matches)return;let q=0;
const f=()=>{q=0;const d=document.documentElement,p=Math.min(1,Math.max(0,scrollY/Math.max(1,d.scrollHeight-innerHeight)));
h.setAttribute('transform','translate(15.5 20.5) rotate('+(-38+p*638*6).toFixed(1)+')')};
addEventListener('scroll',()=>{if(!q)q=requestAnimationFrame(f)},{passive:true});f();})();
```

- The first frame is unchanged (p = 0).
- The cost is one attribute write per frame, and the script is a no-op under reduced motion.
- **Tested on the copy:**
  - at the top: `rotate(-38.0)`;
  - at `#bahce`: `rotate(579.3)`;
  - with `--reduced-motion` it stays at `rotate(-38)`;
  - 0 console errors, no overflow (`_test/fx.log`, `_test/rm.log`).

**F3 · Phone hero seam and art in the first screen. About 5 min, medium risk; only if time remains.**

At ≤ 1023 px, `.hero` is a flat `var(--c-sky-day)` block and `.hero-art` starts with its own grained sky. This leaves a hard seam about 410 CSS px down at 390 (`m390/top.png`), and the tree barely enters the first screen.

- Set the `.hero` background to the art's top-sky colour (sample it from the SVG's sky gradient).
- Pull `.hero-art` up, for example with `margin-top:-12vw`, so the crown rises behind the end of the copy (the copy is z-index 1).
- **Must keep C2:** H1, sub and both CTAs visible at 390×844; H1 and the primary CTA at 360×640.

**Not 20-minute items, recorded for the owner.** These are the real gap to the median.

1. **Redraw the hero crown** as rounded, silvery olive masses, in the same hand as the background trees and the generation trees. This is the single largest Design lever.
2. **Bring art into the body:**
   - the weathervane (the brand's other meaning) large beside "Üç kuşak, bir defter, bir yelkovan";
   - the harvest-tools illustration in the empty right half of the hasat-günü head;
   - the generations visual given more scale.
3. **A scroll-driven hero moment**, such as the poyraz gust visibly flipping the crown silver as you leave the first screen.

Small copy notes from the panel, optional and none of them stoppers:
- P5 would like one line tying the harvest day to an Urla day out. Only use it if facts.md supports a phrasing.
- At 1440, the Gülsüm quote attribution sits alone at the top of a screen (`d1440/y_1800.png`).
