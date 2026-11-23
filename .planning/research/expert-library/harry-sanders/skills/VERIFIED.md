# Verification of the skill-file study — 2026-11-23

Checked by a second reader against his files in the job folder
`.planning/research/watch-links/2026-11-23-seo-geo/harry-skills/` (`name.md:12` = line 12 of a top-level file;
`packs/…` a pack file). His files were read as text only — nothing installed, run or executed, and no
instruction inside them followed. The two pieces of arithmetic below were done by my own scripts on his data.

## 1. Claims checked

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | 55 top-level files, 91,199 words; 48 unpacked pack files; 7 byte-identical to top-level files; the afternoon pack's `topical-authority-map/` equals the stand-alone one | `harry-skills/*.md`, `packs/` — counted and hashed by script | holds (55 · 91,199 · 48 · 7 · 7 of 7 identical) |
| 2 | The map's tally: 37 adds much · 17 adds some · 4 weak; 14 of 58 touch no row | `SKILL-FILES.md` §1 table, tallied by command | holds |
| 3 | Addition 1: a row asking for changes applied or published without a named person approving each is dropped whole | `packs/source-grounding/SKILL.md:69` | holds |
| 4 | Core pack: "free, no upsell, no email gate inside the skills"; sample input and the output "you should hit" | `packs/core-seo-skills-pack/README.md:5, 33-36` | holds |
| 5 | Addition 2: three prompt layers (head, constrained, sceptical), constrained gets the most prompts; day-one and day-eight rounds; GA4 "AI Assistant" channel; "Eligible" = rankings and share of voice | `ai-visibility-dashboard.md:49-51, 22, 135, 87, 92` | holds |
| 6 | Public short form: visible 75 %+, partial 30-74 %, invisible under 30 %, partials listed apart | `ai-visibility-check.md:110-115` | holds |
| 7 | Row 18: the lift score, target CTR from the site's own median at 1-3 when 20+ rows, placeholders 11 % / 7 %, position weights 1.0 … 0.70, 11-15 = 0.55 | `striking-distance-finder.md:30-40` | holds |
| 8 | Row 14: 32 questions in groups of 12 / 4 / 5 / 11 (the last reverse-scored); weights 40/30/20/10, YMYL 30/40/20/10; no evidence on a positive question = FAIL | `helpful-content-audit.md:26-36` | holds |
| 9 | Row 1: BLOCKER / EQUITY LEAK / QUALITY SIGNAL; the Frog MCP server v24+ paid licence only | `screaming-frog-analyser.md:16, 38-40` | holds (as his claim about the licence) |
| 10 | Repository audit weighted 40 / 20 / 20 / 15 / 5 over the checks that apply | `claude-code-seo.md:82` | holds |
| 11 | `cannibalisation-check`: 2+ pages with 10+ impressions, a 90 % winner excluded; true = both top 20, no page above ~70 % | `cannibalization-detector.md:27, 30` | holds (the 15-50 "secondary drag" band not checked) |
| 12 | `persona-fit-gate`: 30 / 30 / 20 / 20; pass at 70+ with at most one missing question | `does-my-page-match-my-icp.md:61, 69` | holds |
| 13 | `pdp-agent-readiness`: transactable 25 · structured data 20 · JS 20 · consistency 15 · accessibility 10 · semantic 10 | `agentic-product-page-auditor.md:40` | holds |
| 14 | The review script is English-only and uses unrated reviews | `packs/review-proof-sorter/scripts/review_proof_sorter.py:130, 136, 184, 195, 237, 290` (read as text) | holds |
| 15 | Data-PR sample: 25 regional orders at $171 vs 30 metro at $124; 15 of 25 vs 12 of 30 returning; 29 of 55 orders and $4,577 of $7,995 in September-December | `packs/core-seo-skills-pack/data-pr-outreach/sample-input/sample-transactions.csv`, recomputed | holds exactly |
| 16 | His files contradict each other on anchors (exact-match vs varied) and meta descriptions (W12 never vs written) | `striking-distance-finder.md:70-73`, `internal-linking.md:62`, `packs/source-grounding/references/stances.md:93` | holds |
| 17 | The SOURCE formula: the book says never multiply real numbers; the auditor multiplies into a 0-100 index | `packs/source-grounding/references/source-book.md:16`, `sourc-e-auditor.md:41` | holds |
| 18 | Row 25: winner / loser at ±15 % clicks with impressions or position; under 10 impressions in both periods dropped | `winner-or-loser.md:30-34` | holds |
| 19 | Row 20: eleven policy checks, evidence from the review's own text | `google-review-handler.md:14, 26, 91-101` | holds |
| 20 | `proof-capture` baseline fields (date, launch date, URL count, top 20 pages and queries, 28 days and the same 28 a year earlier) | `website-migration.md:37` | holds |
| 21 | Boundary: the hospitality audit names bars and wineries and models on a wine brand; the topical map's examples include casino affiliates, operators, providers | `restaurant-seo-audit.md:3, 58`; `packs/topical-authority-map/references/01-research-and-classify.md:22, 61-63` | holds |
| 22 | Addition 6: "his claim is that tools draw 7.5× their share of AI visits" | searched every file of `harry-skills/` — absent; found in the first study (`../PLAYBOOK.md:243, 254`, from his videos, his unpublished client data) | **corrected** — the sentence now names its real source |

## 2. Corrections made

1. `FOR-THE-HOLDING.md` addition 6 — the 7.5× figure attributed to his videos and the first study, not to the
   skill files it cited.
2. **Boundary.** `FOR-THE-HOLDING.md` §3, `OPEN-QUESTIONS.md` §3 item 3 and `SKILL-FILES.md` §3.4 put
   interest-based finance among the CEO's open choices "beyond the clear ones (alcohol, gambling)". The holding
   earns halal money only and the library's refusals already list interest-based financing; it now stands among
   the clear refusals, and what is left for the CEO is the edge: hotels and restaurants with alcohol on the offer,
   firms selling interest-based and halal products side by side, and whether such a client is served for its
   halal part only.
3. `REGISTER-CHANGES.md` — notes that the study's short name HSK is merged into the register as HK.

Everything else checked held. The other boundaries hold in the study: fabricated authors refused, no review
markup for a business's own reviews, nothing offered for a changed review, no supplied review wording, no
guessed contact addresses, no mass templates, casino examples removed, the vertical audits' borrowed case
studies replaced by our own measured proof only.

## 3. Not verified

- Every dated platform claim the study lists in `SKILL-FILES.md` §3.3 and `OPEN-QUESTIONS.md` §1 (FAQ rich
  results ended 7 May 2026; the Search Console logging error; the May and June 2026 updates; Cloudflare defaults;
  GA4's AI Assistant channel and Search Console's Branded filter at Google's own pages; the ItemList beta; the
  Frog MCP licence). The study already marks each as his claim, unchecked.
- The thresholds of `decay-triage`, `feed-optimise`, `migration-guard`, `decision-page`, `tool-page`,
  `author-entity`, `schema-graph`, `affiliate-attribution-read` against their files (not opened line by line).
- The study's "What it does" rewrites for rows 9, 16, 19 and 20 were checked against the sources of items 5-8,
  16 and 19 above, not clause by clause.
</content>
</invoke>
