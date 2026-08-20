# Study Card: Stagehand

> **APPROVED BY THE CEO 2026-08-19** <!-- CEO-OK: open-source-arsenal-2026-08-19 --> — his words on the whole arsenal: *"teki seçimler harika ve karar isteyenleri de onaylıorm. ajanlarımız hangisi uygunsa ilgili iş için onu kullanır hepsine ok!"*
> **He approved the ARSENAL, not a start.** This card carries what was MEASURED on the day he approved it; the full study, the static scan and the install happen at the start of the phase that uses it (INTEG-01 — no blind installs).

- **Tool:** Stagehand
- **Slug:** stagehand
- **Status:** STUDY
- **Target Phase:** 10
- **Owner (dept/tier):** Engineering
- **Trigger Type:** lib
- **Source:** https://github.com/browserbase/stagehand
- **Measured live 2026-08-19 (GitHub API, not recalled):** **23,995 stars · 1,652 forks · MIT · TypeScript · last push 2026-08-19**
- **Licence:** **MIT** — taken from the repository's own metadata on the day
- **Pinned Version:** TBD — pinned at INSTALL, from a release tag, never from a moving branch
- **Purpose:** An SDK for browser agents.

## Why it is on the arsenal — the DXB seat

**It is in our own language.** STACK.md's headline rule is one-language-OS-core (TypeScript everywhere we write code; Python only inside containers we do not modify). This is the browser-agent path that needs no Python bridge and no second runtime.

## Known Pitfalls (recorded at approval, not deferred)

1. Its hosted sibling (Browserbase) is a paid cloud — the library is what is approved, not the service.

## Lifecycle Checklist
- [x] STUDY — opened 2026-08-19 with a live measurement; full study at the phase
- [ ] INSTALL — card completed + static scan + pinned version + live proof
- [ ] ADOPT
- [ ] EMBED
