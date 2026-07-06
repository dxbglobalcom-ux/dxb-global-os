# Study Card: gstack (RETROACTIVE)

> Retroactive backfill (Pitfall 5): installed before the tracking program existed.

- **Tool:** gstack (QA/shipping skill suite: review, spec, ship, qa, design-review, investigate)
- **Slug:** gstack
- **Category:** Claude Code ecosystem
- **Status:** STUDY
- **Target Phase:** 2+
- **Owner (dept/tier):** QA gates (review/spec/ship/qa)
- **Trigger Type:** skill
- **Source:** installed skill suite (gstack marketplace)
- **Pinned Version:** installed at runtime; update via `/gstack-upgrade`
- **Purpose:** Quality-gate tooling for the build process: pre-landing review, spec formalization, ship workflow, browser-based QA. DXB uses it inside execution phases as the review/ship discipline.
- **Official Docs URL:** skill list via `/gsd-help` companion; per-skill docs in suite
- **Key API / Usage Notes:** `/review`, `/spec`, `/ship`, `/qa`, `/investigate`; browse daemon for headless QA.
- **Known Pitfalls:** overlapping scope with GSD verification — use gstack for code-level review/ship mechanics, GSD for phase-level gates; avoid double-review token burn.
- **Install Command:** already installed — update: `/gstack-upgrade`
- **Legitimacy Verdict:** OK — in live use

## Lifecycle Checklist
- [x] STUDY (backfilled 2026-07-06)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
