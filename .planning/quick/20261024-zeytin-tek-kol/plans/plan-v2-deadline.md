# PLAN v2: Urla olive farm landing page, delivery by 22:45

**Status.** This plan supersedes plan-v1.md for the remaining work. plan-v1.md stays in the folder as the reference for the product itself. All times use the job clock (`date` on this machine, CEST). The client's 22:45 deadline includes the independent audit and my one revision round.

## 1. What stays from v1, and what changes
**Unchanged: the page and its bar.** These plan-v1 sections still apply in full:
- §2.1–2.7: the file, core content and section ids, additions, exclusions, behaviour including the honest outcome, forbidden list, visual-source rule;
- §2.8: tests A–G as the definition of done;
- §3: the creative spine;
- §5: the art contract and the HANDOFF template;
- §7: viewport matrix, visitor panel and jury protocol;
- §10: standing orders.

**Changed: the process.**
- Four agents work in parallel instead of eleven parts in sequence.
- I check in two places only: a look at the hero midway, and a proofread of the copy.
- My own trial is the only check before the audit.
- The jury runs **once, in parallel with the audit**. Its verdict is recorded as it stands, with no loop. This overrides plan-v1's "not waivable, repeat until pass" for G4.
- The jury's findings feed my revision round together with the audit's.
- HANDOFFs shrink to five lines: what was made, checks and results, decisions, known gaps, and how to verify in two minutes.

**The P2 direction part is not re-run.** Its partial output is accepted as the direction seed. The decisions below come from my G1 review and are binding:
1. **Name.** Yelkovan / "Yelkovan Zeytinliği", in Ovacık, Urla. My two web searches found no existing brand, and the name is not in names-in-use.md. "Yelkovan" means both a clock's minute hand and a weathervane (TDK), so the brand carries both signatures: the clock (ledger times, the olive clock) and the wind (the leaves flipping in the hero). Never use the bird sense of the word.
2. **Wind.** The hero's motion is the autumn **poyraz**, written as "rüzgâr". Do not say "imbat" for October: TDK defines the imbat as a summer daytime sea wind. This amends plan-v1 §2.3 item 2 and §3.
3. **Type.** Fraunces is the display face, used with `font-variant-ligatures: no-common-ligatures` on Turkish text, because its fi ligature drops the dot (P1 proof). Add one text family from P1's fonts.md. Visible apostrophes are ’.
4. **Hero line candidates** from P2's type test: "Zeytinin saatini üç kuşaktır biliyoruz." with "Urla’da Erkence’yi yeşilden alacaya dönerken topluyor, aynı gün sıkıyoruz." The copy agent (r3) may improve them within budget.
5. **farm.json** is accepted and frozen as v1.1.0 after my lot fix in r1:
   - p500 takes lots 1, 2 and 4;
   - p2000 takes lots 3 and 4;
   - per lot: lot 1 is 75 L Üç Hafta and 335 L p500; lot 2 is 75 + 445; lot 3 is 75 Üç Hafta and 485 L tin; lot 4 is 15 L tin, 420 L p500 and 65 L other.

   Everything else in farm.json passed my recheck, including every weekday checked with `date -d`.
6. **P0 and P1 are accepted.** The P0 self-test shows 105 PASS, 0 FAIL, 8 GAP. My five P1 spot-checks all passed: calendar, TDK imbat, the Erkence medians, an Awwwards SOTD, and the Urlivia price.
7. **Reference material.** `work/02-direction/prototype/grove.js` (seeded olive-tree engine with botanically right leaves) and `_scripts/glyphs.mjs` (wordmark from Fraunces glyphs) are seeds for r2a. The prototype crown reads fan-like and too sparse. It needs a denser, rounded olive crown and gnarlier limbs.

## 2. Contracts between parallel agents
- **Token names** are fixed here; r4 sets their values.
  - Colours: `--c-paper --c-paper-2 --c-ink --c-ink-2 --c-leaf --c-leaf-under --c-trunk --c-olive-green --c-olive-alaca --c-olive-black --c-oil --c-sea --c-sky-dawn --c-sky-day --c-earth --c-accent`.
  - Fonts: `--f-display --f-text`.

  Art uses only `var()` with these names. r4 writes `work/r4-page/tokens.css` by 20:15.
- **Art** follows plan-v1 §5: prefixed ids, `art-` classes, viewBox and no fixed size, seeded generative pieces, still frame under reduced motion, and the stated budgets. `art.md` lists each asset with its id, file, how to place it, and its aria-name key.
- **Copy** is keyed by the plan-v1 §2.2 section ids, as `sectionid.role`. Data values appear only as `{{farm.json.path|format}}` placeholders. A missing string is written as `[[EKSİK: key]]`.

  | Copy element | Character budget |
  |---|---|
  | H1 | ≤ 45 |
  | hero sub | ≤ 110 |
  | kicker | ≤ 24 |
  | section headline | ≤ 50 |
  | body | ≤ 2 × 300 |
  | person block | ≤ 260 |
  | product line | ≤ 2 × 45 |
  | FAQ answer | ≤ 280 |
  | quote | ≤ 160 |
  | button | ≤ 22 |
  | error | ≤ 70 |

- **Ready markers.** Agents signal readiness by writing marker files:
  - `work/r2a-grove/hero.READY` (20:30) and `READY` (21:00);
  - `work/r2b-objects/READY` (21:00);
  - `work/r3-copy/READY` (20:45);
  - `PROOFED` (20:55), which I write after my proofread.

  r4 polls for these markers. Until a marker appears, r4 uses placeholders.
- **Cut order under time pressure.** If behind schedule, drop in this order: the travel map, the generations visual, then the process icons (text fallbacks per plan-v1 §2.3). Never drop the hero, packshots, olive-clock olives, the forms, or the honest outcome.

## 3. Standing orders (short)
- Read brief.md, this plan, and the plan-v1 sections named in your DISPATCH row.
- Write only in your own folder. Never touch `delivery/` or another agent's folder.
- No questions. Decide, and note the decision in your HANDOFF.
- Respect plan-v1 §2.4, §2.6 and §2.7 without exception.
- Use the work/00-tools harness, and look at your screenshots.
- Finish by your end time with what is best at that moment, and say what is missing.

## DISPATCH
- **r1** · Close G1: lot fix, freeze farm.json v1.1.0, dispatch r2a–r4 (me) · high · rulings are already in this plan; only the data fix and dispatch remain · work/02-direction/farm.json, work/01-research/ · `work/02-direction/farm.json` + `work/owner/G1-direction.md` · ends by 19:58
- **r2a** · Grove and landscape art: hero (desktop and phone, inline still first frame, poyraz leaf-flip), section grounds, generations visual, grain tile · xhigh · the hero replaces photography and is what a jury sees first; long, design-level, performance-bound · brief.md, plan.md, plan-v1 §2–3 and §5, farm.json, work/02-direction/prototype/grove.js and _scratch/, work/01-research/facts.md, work/00-tools/ · `work/r2a-grove/art.md` (hero.READY by 20:30) · ends by 21:00
- **r2b** · Objects art: three packshots with live labels, olive at four months, six process icons, tasting glass, harvest tools, travel map, wordmark and favicon · xhigh · product imagery must read as fine illustration; split from r2a only to fit the clock, consistency held by shared tokens and my 20:30 look · brief.md, plan.md, plan-v1 §2–3 and §5, farm.json, work/02-direction/_scripts/glyphs.mjs and _research/fonts/, work/01-research/facts.md, work/00-tools/ · `work/r2b-objects/art.md` · ends by 21:00
- **r3** · Copy deck: every visible string, keyed by section and role with budgets, honest-outcome lines, errors, states, meta · high · the final Turkish text every visitor reads · brief.md, plan.md, plan-v1 §2 and §3, farm.json, work/01-research/facts.md (safe phrasing, do-not-claim list) · `work/r3-copy/copy.md` · ends by 20:45
- **r4** · Page build: tokens, layout, all sections, forms and date logic, olive clock, motion, inlining of art and copy, self-QA on tests A–F in Chrome, Firefox and WebKit · xhigh · long unattended build that also owns the design decisions P2 left open · brief.md, plan.md, plan-v1 §2 and §3, farm.json, work/01-research/ (fonts.md, benchmarks.md and shots, facts.md), work/00-tools/, work/02-direction/_scratch/, then r2a, r2b and r3 outputs when their markers appear, and work/owner/notes.md · `work/r4-page/dist/index.html` (tokens.css by 20:15; checkpoint shots by 20:30) · ends by 21:35
- **r5** · Midpoint look at the hero and art checkpoints; notes for r4, r2a and r2b (me) · high · the one early design check, catching drift while it is still cheap · r4 and r2a checkpoint shots, r2b work in progress · `work/owner/notes.md` · ends by 20:35
- **r6** · Proofread copy.md against TDK, the Yazım rules, facts.md and farm.json; fix it in place and write PROOFED (me) · high · Turkish errors are the costliest flaw, and this is the cheapest moment to catch them · work/r3-copy/ · `work/r3-copy/PROOFED` · ends by 20:55
- **r7** · Assembly and trial (me): check-static; 11-viewport matrix; both forms in three engines; B6 dates and time zones; reduced motion; JS off; fonts blocked; axe; Lighthouse mobile; read the whole page at 390 and 1440; trivial fixes; deliver · high · the only check before the audit; it must be complete · work/r4-page/, work/00-tools/ · `delivery/index.html` (+ `work/owner/trial.md`) · ends by 21:55
- **r8** · Independent audit (external, not dispatched by me) · n/a · reads and tries the delivered page · delivery/index.html · auditor's report · ends by 22:10
- **r9** · Jury gate, run once in parallel with the audit: comparative scoring against the P1 benchmarks plus the visitor panel; verdict recorded as it stands; top fixes that can be made in 20 minutes · xhigh · judgement against verified winners; no loop, by the client's decision · brief.md, plan.md, plan-v1 §1 bar, §2.8 G and §7 gate and panel, work/01-research/benchmarks.md and shots, delivery/index.html, work/00-tools/ · `work/r9-jury/jury.md` · ends by 22:15
- **r10** · Revision round (me): triage audit and jury findings; fix S1/S2 first, then the highest-impact jury items that fit, protecting what both praised; if one self-contained item is too large, one fresh agent at high effort fixes it by 22:35; re-run the r7 protocol on the fixed file; redeliver · high · the last change, with no check after it · auditor's report, work/r9-jury/jury.md, delivery/index.html, work/r4-page/, work/00-tools/ · `delivery/index.html` (+ `work/owner/revision.md`) · ends by 22:40 (5 min buffer to 22:45)