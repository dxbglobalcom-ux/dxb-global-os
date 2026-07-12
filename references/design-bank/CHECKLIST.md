# Design Verification Checklist (RULE #0 battery)

Walk EVERY item for EVERY touched route, both locales, ≥2 widths. Tick with evidence, not intention.

## Geometry & layout
- [ ] Nothing overlaps: floating layers (Agent Dock, toasts, modals) never trap content — everything scrolls fully clear
- [ ] No cut-off text/rows at container edges; truncation is deliberate (`truncate` + full value available in a detail surface)
- [ ] Alignment: labels/values on a consistent grid; indentation levels even; icons optically centered
- [ ] Scroll sanity: no double scrollbars side by side; inner scroll areas use the thin `nav-scroll` chrome; no horizontal page scroll
- [ ] Responsive: narrow (~1280) and wide (≥1900) both composed — side panels reflow, nothing stacks brokenly

## Language & content
- [ ] Language purity: EN locale shows zero Turkish, TR locale zero English (platform proper nouns exempt) — `scripts/i18n-purity-check.sh` PASS
- [ ] Human-readable names everywhere a person reads (titles, display names); internal slugs only in explicitly technical rows (Agent ID)
- [ ] Zero/empty states honest AND explained (why empty, when it fills) — never fake data, never bare "0" walls

## Status & tone
- [ ] Status badges only where state is exceptional; default states stay quiet (muted text/dot)
- [ ] Colors/typography from DESIGN_SYSTEM tokens only — no invented values
- [ ] Modern, non-generic: would this screen pass the "reference-grade luxury dashboard" bar (Phase-8 brief)? If it looks like a stock admin template, it fails

## Data truth
- [ ] Every displayed number traces to a live query (spot-check one against the DB)
- [ ] Stale-render trap checked: hard refresh after deploy before judging

## Closure
- [ ] Baselines in `references/design-bank/` updated for touched routes, marked PENDING in INDEX.md
- [ ] Report separates ✓ VERIFIED (with command → output) from ⚠ UNVERIFIED (CEO eye test)
