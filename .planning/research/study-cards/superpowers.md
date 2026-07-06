# Study Card: superpowers (RETROACTIVE)

> Retroactive backfill (Pitfall 5): installed and in active use before the tracking program existed.

- **Tool:** superpowers (Claude Code skill suite: brainstorming, TDD, systematic-debugging, verification-before-completion, plan discipline)
- **Slug:** superpowers
- **Category:** Claude Code ecosystem
- **Status:** STUDY
- **Target Phase:** 2 (wiring)
- **Owner (dept/tier):** All engineering-grade agents
- **Trigger Type:** skill (auto)
- **Source:** github.com/obra/superpowers (marketplace plugin)
- **Pinned Version:** installed plugin version at session runtime (plugin-managed; record exact on EMBED)
- **Purpose:** Process-discipline skill layer — forces skill-check-before-action, brainstorming before creative work, TDD, verification-before-completion. DXB adopts it as the engineering agents' default working discipline.
- **Official Docs URL:** repo README + SKILL.md files under ~/.claude
- **Key API / Usage Notes:** skills auto-trigger via using-superpowers bootstrap; per-skill SKILL.md checklists; user instructions (CLAUDE.md) take precedence over skills.
- **Known Pitfalls:** skill invocation adds context tokens per session — token-discipline rule applies (fire only when relevant); already-active status must not exempt it from EMBED tracking (this card exists precisely for that).
- **Install Command:** already installed (marketplace plugin) — re-install: `claude plugin install superpowers`
- **Legitimacy Verdict:** OK — widely used community suite, already vetted in live use

## Lifecycle Checklist
- [x] STUDY (backfilled 2026-07-06)
- [ ] INSTALL (formal registry/tracker acknowledgment pending EMBED path)
- [ ] ADOPT
- [ ] EMBED
