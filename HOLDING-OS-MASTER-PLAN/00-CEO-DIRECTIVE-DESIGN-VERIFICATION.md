# CEO DIRECTIVE — MANDATORY DESIGN VERIFICATION (SEVEREST TIER)

> Issued: 2026-07-13 ~01:40 · Authority: CEO, verbatim order · Scope: every CEO-visible surface (dashboard, login, JARVIS UI, future sub-OS UIs) · Binding on: Opus 5, GPT 5.6, every runtime agent, every future session — until project end.
> Trigger: the CEO had to personally catch, in one night, seven visual defects (raw slugs, badge walls, mixed languages, buried detail panel, double scrollbars, dock crushing content, stale renders). **The CEO is not the QA layer.**

## The rule (write-once, obey-always)

**No work that touches a visual surface may be reported as done before a DESIGN VERIFICATION PASS is executed and evidenced.** "It compiles, tests pass" is NOT done. Visual consistency is a hard acceptance gate of the same rank as Evidence-Before-Done.

## Design Verification Pass — minimum battery

1. **Render every touched route in the real browser** (Playwright), BOTH locales (EN + TR), at ≥2 widths (narrow ~1280 and wide ≥1900).
2. **Walk the checklist** — `references/design-bank/CHECKLIST.md`: overlap, alignment, cut-off content, scroll sanity (no double bars, no unreachable rows), language purity, empty/zero states honest, status noise, spacing rhythm, token discipline (no invented colors/fonts).
3. **Compare against the reference bank** — `references/design-bank/`: baseline screenshots of CEO-accepted states + the written design brief (Burj Al Arab 7-star, modern, non-generic). Deviation from an approved baseline without a recorded reason = violation.
4. **Machine gates**: `scripts/i18n-purity-check.sh` PASS + tsc 0 + eslint 0 + contrast audit where applicable + **`pnpm verify:ledger` PASS** (U41 — the corpus may not disagree with the system: every `STATE` number re-measured against the live company database, every declaration of open work bound to a board row).
5. **Evidence in the report**: screenshots + decisive check outputs. Anything not machine-checkable stays `⚠ UNVERIFIED — CEO eye test`, but the eye test must be the FINAL polish, never the first QA.

## Reference bank protocol

- Location: `references/design-bank/` — baselines per route/locale, named `<route>-<locale>-<width>.png`, each with an `APPROVED` or `PENDING` marker in `INDEX.md`.
- A baseline becomes `APPROVED` only by explicit CEO acceptance; after approval, that screenshot IS the contract.
- Every design-touching wave updates the affected baselines and re-marks them `PENDING` until the CEO accepts.

## Enforcement

- This directive is quoted at the TOP of the project `CLAUDE.md` — first thing every session loads.
- A "done" claim on visual work without the pass = same violation class as an unevidenced done (governance: RET + recorded violation).
- Wasting CEO time on catchable visual defects is the exact anti-pattern this project exists to kill (anti-baby-sitting core value).

## Amendment A1 — PER-SURFACE PASS + IMMEDIATE TREATMENT (CEO refinement, 2026-07-17 ~02:30)

Trigger: during the R1.4 revenue-dashboard wave the CEO personally caught a horizontal-overflow defect on `/revenue/objectives` (long evidence token, missing `min-w-0`) while the author's own pass was still in progress. Defect reached the CEO's eye → **recorded violation (RET), 2026-07-17, R1.4 wave** — the pass existed but ran too late.

Binding refinements (same tier as the base rule):

1. **Per-surface, not per-wave:** the Design Verification Pass runs after EVERY operation that changes a CEO-visible surface — each page/component lands with its own pass in the SAME working turn, before the next surface is started. Batching N pages first and passing later is a violation even if the batch pass eventually runs.
2. **Immediate treatment:** any defect found — by the pass or by the CEO — is treated IMMEDIATELY in the same turn ("bozukluklar tedavi anında"). No defect backlog, no "noted for later" on visual work.
3. **Overflow measurement is part of the battery:** `document.documentElement.scrollWidth === clientWidth` measured per touched route per width; a horizontal scrollbar on a CEO surface is an automatic FAIL.
4. **Minimalism gates the pass (CEO design ruling 2026-07-17):** visible "…" truncation on a CEO surface = FAIL (kill overflow at the SOURCE — shorten/structure the data, never clip); fields that carry no decision information (values that can only ever be one thing, e.g. "Proposed by: ceo" on a CEO-created objective) = FAIL — render conditionally only when the value is informative (e.g. a Hamza proposal); explanation notes are one short sentence, never repeated across pages.

Recorded violations under this directive:
| Date | Surface | Defect | Treatment |
|---|---|---|---|
| 2026-07-17 | /revenue/objectives (R1.4) | horizontal overflow + visible truncation + info-free fields, caught by CEO eye | same-turn: grid `min-w-0`, seed title → language-neutral "€50 net", info-free fields removed, notes shortened; commit 9d6cc51 |
