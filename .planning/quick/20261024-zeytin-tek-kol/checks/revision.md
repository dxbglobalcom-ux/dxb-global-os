# r10 · Revision round (owner) · 24 Ekim 2026, 21:55–22:03 job clock

**Redelivered:** `delivery/index.html`
- sha1 2e9e5a39bbd8, 348,751 bytes.
- Byte-identical to `work/r10-revision/dist/index.html`.
- Built from `work/r10-revision/` (a copy of the r4 sources) and the copy deck. `delivery/` contains only `index.html`.
- **Pre-revision file:** `work/owner/trial/index.pre-audit.html` (sha1 6c805430c826).

## Triage

| Source | Finding | Decision | What changed |
|---|---|---|---|
| r8 audit, Major | Product illustrations swamp price and quantity: cards about 1,130 px on desktop; the first image alone about 702 px on phones | **Fixed** | Illustration area fixed at 200–250 px, and the body is tighter. Desktop cards now about 545 px, with name, price and stepper together. On phones the packshot sits beside the name, price and stepper (two-column card, about 370 px). Packshot art unchanged. |
| r8 audit, Major | "Düzenle" sends focus off-screen (to the submit button) | **Fixed** | "Düzenle" and reset both focus the form's first editable control (first quantity; the checked date in the harvest form) and scroll it to the centre. Entered values are kept. |
| r8 audit, Minor | An error-summary link can swallow a click after a blur re-renders the summary | **Fixed** | Summary links are now updated in place, keyed by field, with one delegated click handler. A blur no longer replaces the link being clicked. |
| r9 jury F1 | The time-of-day grounds are invisible | **Applied** (as the jury tested it; dusk at 18%) | Morning reads as cool sky and golden/dusk as warm. axe shows 0 violations in three engines. |
| r9 jury F2 | Make the yelkovan visibly run through the day | **Applied** (as the jury tested it) | The wordmark's minute hand turns 638 "minutes" (07.45 → 18.23) over the page scroll. The first frame is unchanged, and the effect is off under reduced motion. |
| r7 note | Phone hint wraps as "05XX XXX / XX XX" | **Fixed** | No-break spaces in the 4 copy strings, in r3-copy/copy.md. |
| r9 jury F3 | Phone hero seam | **Declined** | Medium risk with no check after this round. |
| r9 jury | Redraw the crown; add art to the body | **Declined** | The jury itself sized this at hours, not minutes. It is the known reason the G4 verdict stays FAIL, recorded as it stands. |

**Protected** (jury §4, audit "what works"): packshots, the olive-clock dial, first-screen information design, honest-outcome lines, copy, kickers, palette and type. None was touched.

## Proof

**Regression scenario `work/r10-revision/tests-r10/audit.json`** (both forms):
- error link → error link;
- "Düzenle" focus is in view;
- values are kept.

| Build | Result |
|---|---|
| Revised, Chrome / Firefox / WebKit | 25/25 in each |
| Pre-revision, Chrome | 21/25; the 4 failures are exactly the audit's findings |

**r7 protocol re-run on the revised file** (`work/r10-revision/trial/`):
- **check-static:** PASS.
- **Forms:** Chrome 104/104 and WebKit 104/104. Firefox 100/104, the same 4 harness-only misses as before (focus-driven phone reformat ×3, plus Firefox's own `data:font` entry).
- **Dates and time zones:** B6 dates pass; first offered date correct in Istanbul, Honolulu and Tokyo.
- **Matrix:** 11 viewports with 0 console messages, no overflow, no duplicate ids.
- **Other runs:** reduced motion, JS off and fonts blocked are clean.
- **axe:** 0 violations.
- **Storage:** empty after both flows.
- **Network:** only Google Fonts hosts.
- **Lighthouse:**

  | Preset | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
  |---|---|---|---|---|---|---|---|
  | Mobile | 95 | 100 | 100 | 100 | 2.3 s | 0 | 0 |
  | Desktop | 100 | 100 | 100 | 100 | 0.5 s | 0 | 0 |

- **Read-through:** full pages at 1440 and 390 (`overview1440.png`, `overview390.png`).
- **Delivered file:** static PASS; the audit scenario 25/25 over http.

## Standing verdicts
- **r8:** no blocker; all three findings are now fixed.
- **r9 G4:** FAIL (Design 7.2, Creativity 7.0 against medians 7.65 and 7.45), recorded as it stands under the client's one-run rule. F1 and F2 address part of the gap. The rest (crown and body art) is the documented remaining distance to "credible winner".
- **G3 panel:** PASS.
