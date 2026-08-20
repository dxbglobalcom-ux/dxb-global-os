# Study Card: changedetection.io

> **APPROVED BY THE CEO 2026-08-19** <!-- CEO-OK: open-source-arsenal-2026-08-19 --> — his words on the whole arsenal: *"teki seçimler harika ve karar isteyenleri de onaylıorm. ajanlarımız hangisi uygunsa ilgili iş için onu kullanır hepsine ok!"*
> **He approved the ARSENAL, not a start.** This card carries what was MEASURED on the day he approved it; the full study, the static scan and the install happen at the start of the phase that uses it (INTEG-01 — no blind installs).

- **Tool:** changedetection.io
- **Slug:** changedetection-io
- **Status:** STUDY
- **Target Phase:** 10
- **Owner (dept/tier):** Commerce + Research
- **Trigger Type:** service
- **Source:** https://github.com/dgtlmoon/changedetection.io
- **Measured live 2026-08-19 (GitHub API, not recalled):** **33,252 stars · 1,969 forks · Apache-2.0 · Python · last push 2026-08-16**
- **Licence:** **Apache-2.0** — taken from the repository's own metadata on the day
- **Pinned Version:** TBD — pinned at INSTALL, from a release tag, never from a moving branch
- **Purpose:** Watches a page and fires when it changes — price, stock, a competitor's campaign, a tender listing.

## Why it is on the arsenal — the DXB seat

**This is the engine REVENUE #1 was written around and never had.** Measured this session: no monitoring path of any kind exists anywhere in the repository. It is the single closest tool on the arsenal to money.

## Known Pitfalls (recorded at approval, not deferred)

1. A service, not a library — it needs a place to run and a schedule. The holding already owns both (pg-boss, 15 live schedules; hermes-agent as the 24/7 resident).
2. Watch-list volume is the cost driver, not the software: measure pages-per-hour before promising a customer a refresh rate.

## Lifecycle Checklist
- [x] STUDY — opened 2026-08-19 with a live measurement; full study at the phase
- [ ] INSTALL — card completed + static scan + pinned version + live proof
- [ ] ADOPT
- [ ] EMBED
