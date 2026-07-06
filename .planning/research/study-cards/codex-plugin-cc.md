# Study Card: codex-plugin-cc (RETROACTIVE)

> Retroactive backfill (Pitfall 5): installed before the tracking program existed.

- **Tool:** codex-plugin-cc (Codex CLI bridge for Claude Code: codex-rescue subagent, /codex skills)
- **Slug:** codex-plugin-cc
- **Category:** Claude Code ecosystem
- **Status:** STUDY
- **Target Phase:** 5 — [ASSUMED: engineering worker tier]
- **Owner (dept/tier):** Engineering second brain (Codex 5.5)
- **Trigger Type:** skill / subagent
- **Source:** codex plugin (marketplace); requires local Codex CLI + OpenAI subscription
- **Pinned Version:** installed plugin at runtime
- **Purpose:** Second engineering brain per §10 brain map: Codex 5.5 handles standard feature coding / second-opinion diagnosis under subscription (mode=subscription tagging). Cross-AI plan review (gsd-plan-review-convergence) also rides this.
- **Official Docs URL:** `/codex:setup`; plugin skills (codex-cli-runtime, gpt-5-4-prompting)
- **Key API / Usage Notes:** `/codex` modes; codex-rescue subagent for stuck/second-pass work; subscription covers CLI use, NOT headless VPS (locked: Hermes brain is GLM 5.2, not Codex).
- **Known Pitfalls:** governance v3 — Codex output is ADVISORY raw material in normal mode (Fable authors all repo lines); Codex-written code enters only via budget-fallback or explicit CEO exception; subscription calls must be cost-tagged (Phase 4 hook).
- **Install Command:** already installed — health: `/codex:setup`
- **Legitimacy Verdict:** OK — in live use for cross-AI review since Phase 1

## Lifecycle Checklist
- [x] STUDY (backfilled 2026-07-06)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
