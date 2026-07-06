# Study Card: GSD (gsd-core suite) (RETROACTIVE)

> Retroactive backfill (Pitfall 5): installed before the tracking program existed — it is driving this very build.

- **Tool:** GSD — Get Stuff Done project-discipline suite (plan/execute/verify phase workflow, planning artifacts, state tracking)
- **Slug:** gsd
- **Category:** Claude Code ecosystem
- **Status:** STUDY
- **Target Phase:** 2 (drives whole build from Phase 1 on)
- **Owner (dept/tier):** Orchestrator / project discipline
- **Trigger Type:** skill (slash commands `/gsd-*`)
- **Source:** ~/.claude/gsd-core (installed suite)
- **Pinned Version:** installed suite at runtime; update via `/gsd-update`
- **Purpose:** The construction methodology itself: phased roadmap, PLAN/SUMMARY/STATE artifacts, wave execution, verification gates. DXB's .planning/ directory is its artifact.
- **Official Docs URL:** `/gsd-help` + ~/.claude/gsd-core/workflows/
- **Key API / Usage Notes:** config in .planning/config.json (model_overrides per governance v3: planner/debugger/executor = claude-fable-5); phase docs under .planning/phases/; graph refresh at phase completion (`/gsd-graphify build`).
- **Known Pitfalls:** subagent model inheritance fire (2026-07-05, $46) — `model=` always explicit; governance v3 prefers INLINE execution over executor subagents entirely.
- **Install Command:** already installed — update: `/gsd-update`
- **Legitimacy Verdict:** OK — in live, audited use across Phases 1–2

## Lifecycle Checklist
- [x] STUDY (backfilled 2026-07-06)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
