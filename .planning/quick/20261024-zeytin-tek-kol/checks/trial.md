# r7 · Assembly and trial (owner) · 24 Ekim 2026, 21:40–21:43 job clock

**Delivered:** `delivery/index.html`
- Byte-identical to `work/r4-page/dist/index.html` (sha1 6c805430c826, 345,363 bytes). It is built from the PROOFED copy and from r2a's refreshed art (READY 21:33).
- `delivery/` contains only `index.html`.
- Pre-audit snapshot: `work/owner/trial/index.pre-audit.html`.
- All evidence is under `work/owner/trial/`.

| Test (plan-v1 §2.8) | Result | Evidence |
|---|---|---|
| A2 check-static | PASS, 0 errors. Review flags are all intended: "Rıza", the honest "ödeme" lines, Klazomenai "en eski", © | static.txt |
| A3 network | Only the two Google Fonts hosts; zero unexpected hosts in every run | flows/, matrix/ |
| A5 file:// and http:// | Order flow 70/70 over http, using the delivered file | /tmp run, logged here |
| B2–B5 forms + B6 dates (`order.json`, `harvest.json`, `dates.json`) | Chrome 104/104 · WebKit 104/104 · Firefox 100/104 (see note) | flows-*/ |
| B6 time zones | Istanbul, Honolulu and Tokyo at 06 Kasım 23.30 and 07 Kasım 00.30 Istanbul time. The first offered date is 7 Kasım before midnight and 8 Kasım after, identical in all three zones | tzprobe.json, tz.txt |
| C1 11-viewport matrix | 0 console messages, no overflow, no duplicate ids, about 1,426 elements | matrix.txt |
| D axe (3 engines) | 0 violations | flows.txt |
| D5 reduced motion | Full pages at 390 and 1440 are complete | rm/ |
| B10 JS off | All text readable; no console output | nojs/ |
| Fonts blocked | Layout holds; CLS 0 | nofonts/ |
| A7 storage | Empty after both flows, in every engine | flows.txt |
| E4 Lighthouse | Mobile: Performance 95, Accessibility 100, Best Practices 100, SEO 100 (LCP 2.3 s, CLS 0, TBT 0). Desktop: 100 on all four (LCP 0.5 s) | lh.txt |
| E1 size | 345 KB (under the 400 KB cap, over the 250 KB target); fonts about 98 KB | n/a |

**Firefox 100/104.** These four misses are harness limits that r4 already reported, not faults in the page:
- three are the phone number reformatting when its field loses focus; headless Firefox never gives the field real focus;
- one is the zero-request network check; Firefox logs its own `data:font` entry, which is not a network request.

The summary always normalises the number, and Chrome and WebKit pass the same steps.

**Read-through.** I read every section on the full-page captures at 1440 and 390 (d0–d4 and p0–p2):
- r5 notes 1–5 are in. The hero crown is now airy and grey-green, there is one wall, the badge separator is fixed, the padding is tightened, and `#hikaye` is a single composition.
- r6's copy edits are present.
- Numbers and dates match farm.json v1.1.0. The packshot labels show Lot 2, Lots 1–3 and Lot 3.
- No trivial fix was needed, so the delivered file is unchanged from the r4 build.

**Minor items left for r10** (cosmetic; I did not change them before the audit):
- At 390, the harvest form's phone hint wraps as "05XX XXX / XX XX". It needs a no-break span.
- The olive clock's Ekim line still says "erken hasadın imzası". This is its only remaining use, so it is acceptable.
