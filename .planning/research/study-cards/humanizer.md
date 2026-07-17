# Study Card: humanizer

> STUB → FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü item 6; tracker row was STUDY/Phase-10 stub since 07-06).

- **Tool:** humanizer — Claude Code skill that strips AI-writing tells from text (33 documented patterns in latest version)
- **Slug:** humanizer
- **Category:** Claude Code ecosystem
- **Status:** STUDY
- **Target Phase:** 10 (mandatory in the DEPT-04 outbound pipeline before the approval gate — tracker note + CEO B5 2026-07-09 self-marketing criterion)
- **Owner (dept/tier):** Marketing/Sales outbound agents
- **Trigger Type:** skill (auto in outbound pipeline)
- **Source:** https://github.com/blader/humanizer — the canonical repo (plain-Markdown portable skill); ecosystem variants exist (humanizer_academic, humanize-writing 24-pattern/8-pass forks) — canonical wins for maintenance
- **Pinned Version:** repo commit pinned at INSTALL
- **Purpose:** Outbound e-mail/DM/content passes through humanizer before human-facing release: removes AI vocabulary, significance inflation, hedging, structural tells, rhythm artifacts; can mirror the sender's own style quirks instead of producing generic "clean" text. Directly serves the CEO's authenticity requirement for outreach (Talep-era ruling) without misrepresenting authorship to detectors — our use is tone quality, not deception: recipients deal with the DXB holding openly.
- **Official Docs URL:** https://github.com/blader/humanizer/blob/main/SKILL.md

## Key API / Usage Notes

- Plain Markdown skill → runs in any skill-capable harness (Claude Code now; runtime agents later via the library grant path).
- Pipeline slot: draft → humanizer pass → i18n/tone check → approval gate → outbox. Never AFTER the approval gate (approved text must be the final text).
- TR content: pattern list is EN-centric — TR outbound needs a measured test pass; expect partial coverage and record gaps at ADOPT.

## Known Pitfalls

1. Over-aggressive rewriting can distort factual/legal wording — finance/legal outbound must re-verify numbers and commitments post-pass.
2. SkillSpector scan + D6 adaptation before install (third-party skill hygiene; we ship our own adapted text).
3. Fork fragmentation: variants drift; pin the canonical blader repo, ignore forks unless a TR-focused fork emerges.

- **Install Command:** (deferred to Phase-10 outbound wave) fetch → SkillSpector scan → D6 adapt → `~/.claude/skills/dxb-humanizer/SKILL.md` → A/B test on a real draft pair.
- **Legitimacy Verdict:** OK — free Markdown skill, no code execution, no install-time secrets; use scoped to honest tone-quality (no deceptive authorship claims).

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — R4.1 pass)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
