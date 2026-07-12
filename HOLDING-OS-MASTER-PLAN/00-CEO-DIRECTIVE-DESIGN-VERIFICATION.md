# CEO DIRECTIVE — MANDATORY DESIGN VERIFICATION (SEVEREST TIER)

> Issued: 2026-07-13 ~01:40 · Authority: CEO, verbatim order · Scope: every CEO-visible surface (dashboard, login, JARVIS UI, future sub-OS UIs) · Binding on: Fable, Opus, GPT 5.6, every runtime agent, every future session — until project end.
> Trigger: the CEO had to personally catch, in one night, seven visual defects (raw slugs, badge walls, mixed languages, buried detail panel, double scrollbars, dock crushing content, stale renders). **The CEO is not the QA layer.**

## The rule (write-once, obey-always)

**No work that touches a visual surface may be reported as done before a DESIGN VERIFICATION PASS is executed and evidenced.** "It compiles, tests pass" is NOT done. Visual consistency is a hard acceptance gate of the same rank as Evidence-Before-Done.

## Design Verification Pass — minimum battery

1. **Render every touched route in the real browser** (Playwright), BOTH locales (EN + TR), at ≥2 widths (narrow ~1280 and wide ≥1900).
2. **Walk the checklist** — `references/design-bank/CHECKLIST.md`: overlap, alignment, cut-off content, scroll sanity (no double bars, no unreachable rows), language purity, empty/zero states honest, status noise, spacing rhythm, token discipline (no invented colors/fonts).
3. **Compare against the reference bank** — `references/design-bank/`: baseline screenshots of CEO-accepted states + the written design brief (Burj Al Arab 7-star, modern, non-generic). Deviation from an approved baseline without a recorded reason = violation.
4. **Machine gates**: `scripts/i18n-purity-check.sh` PASS + tsc 0 + eslint 0 + contrast audit where applicable.
5. **Evidence in the report**: screenshots + decisive check outputs. Anything not machine-checkable stays `⚠ UNVERIFIED — CEO eye test`, but the eye test must be the FINAL polish, never the first QA.

## Reference bank protocol

- Location: `references/design-bank/` — baselines per route/locale, named `<route>-<locale>-<width>.png`, each with an `APPROVED` or `PENDING` marker in `INDEX.md`.
- A baseline becomes `APPROVED` only by explicit CEO acceptance; after approval, that screenshot IS the contract.
- Every design-touching wave updates the affected baselines and re-marks them `PENDING` until the CEO accepts.

## Enforcement

- This directive is quoted at the TOP of the project `CLAUDE.md` — first thing every session loads.
- A "done" claim on visual work without the pass = same violation class as an unevidenced done (governance: RET + recorded violation).
- Wasting CEO time on catchable visual defects is the exact anti-pattern this project exists to kill (anti-baby-sitting core value).
