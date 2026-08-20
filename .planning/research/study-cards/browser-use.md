# Study Card: browser-use

> **APPROVED BY THE CEO 2026-08-19** <!-- CEO-OK: open-source-arsenal-2026-08-19 --> — his words on the whole arsenal: *"teki seçimler harika ve karar isteyenleri de onaylıorm. ajanlarımız hangisi uygunsa ilgili iş için onu kullanır hepsine ok!"*
> **He approved the ARSENAL, not a start.** This card carries what was MEASURED on the day he approved it; the full study, the static scan and the install happen at the start of the phase that uses it (INTEG-01 — no blind installs).

- **Tool:** browser-use
- **Slug:** browser-use
- **Status:** STUDY
- **Target Phase:** 10
- **Owner (dept/tier):** Research/Ops — the agents' hands on a live site
- **Trigger Type:** skill
- **Source:** https://github.com/browser-use/browser-use
- **Measured live 2026-08-19 (GitHub API, not recalled):** **109,775 stars · 12,067 forks · MIT · Python · last push 2026-08-19**
- **Licence:** **MIT** — taken from the repository's own metadata on the day
- **Pinned Version:** TBD — pinned at INSTALL, from a release tag, never from a moving branch
- **Purpose:** Lets an employee OPERATE a website the way a person does — fill a form, place an order, work a supplier panel — instead of only reading it. It is the difference between an employee who can look and one who can act.

## Why it is on the arsenal — the DXB seat

REVENUE #10 (tender/marketplace watching + form automation). It is also the missing half of every commerce persona: 10 written commerce employees, and until now no way for any of them to touch a supplier's screen.

## Known Pitfalls (recorded at approval, not deferred)

1. Non-deterministic by nature — an LLM decides what to click. Playwright MCP (already ADOPT, 24 tools pinned) stays the deterministic sibling for anything that must repeat exactly.
2. Any outward action it can take is an approval-gate question, not a technical one.

## Lifecycle Checklist
- [x] STUDY — opened 2026-08-19 with a live measurement; full study at the phase
- [ ] INSTALL — card completed + static scan + pinned version + live proof
- [ ] ADOPT
- [ ] EMBED
