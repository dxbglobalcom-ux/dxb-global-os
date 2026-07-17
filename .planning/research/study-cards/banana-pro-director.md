# Study Card: banana-pro-director

> FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü item 11). Sibling: [[cinema-world-builder]] (same creator pipeline, item 12).

- **Tool:** banana-pro-director.md — Claude skill for directing Nano Banana Pro (Gemini image model) image generation: prompts, character sheets, outfit references, scene plates in real camera/skin-detail language
- **Slug:** banana-pro-director
- **Category:** Media/content (image direction)
- **Status:** STUDY
- **Target Phase:** 10 (Creative/Social visual production wave)
- **Owner (dept/tier):** Creative dept / Social media
- **Trigger Type:** skill
- **Source:** creator "Joey" (moderncreator.app, 2026-05-11 write-up — skills given away free); ecosystem equivalents: https://github.com/AgriciDaniel/banana-claude (Creative-Director skill powered by Gemini) and https://github.com/smixs/visual-skills (Nano Banana / GPT Image / Seedance / Kling prompting bundle)
- **Pinned Version:** none yet — exact file acquired at INSTALL (Joey original if obtainable; else banana-claude / visual-skills as the maintained equivalents)
- **Purpose:** Character-consistent image pipeline: build character sheet → scene → place character → feed reference image back for single/multi-shot direction; tracks per-scene seconds to control generation credit spend. Feeds [[cinema-world-builder]] video stage and Instagram content engine (CEO post-reading note 1).
- **Official Docs URL:** https://moderncreator.app/2026-05-11-joey-the-two-claude-skills-that-run-our-entire-ai-video-pipeline

## Key API / Usage Notes

- Skill = plain Markdown; adapt per D6 fable-method ruling (adapted content, never embedded external text — agency-agents precedent) into a DXB-authored skill.
- Underlying generator (Nano Banana Pro / Gemini) is PAID API → D1: cost-monitor tagging + budget gate; local free alternative for stills = [[z-image]] on the RTX 4090.

## Known Pitfalls

1. Skill text ≠ capability: requires a wired image-gen tool (Gemini API key via LiteLLM/virtual key or local model) — install order: generator first, skill second.
2. Third-party skill files must pass [[skillspector]] scan before entering `~/.claude/skills` (26.1% of ecosystem skills carry vulnerabilities — NVIDIA study).
3. Halal boundary: image direction must inherit the R1.5 content rules (no indecent content) — persona-level, not skill-level, enforcement.

- **Install Command:** (deferred to ADOPT) fetch source skill → SkillSpector scan → rewrite per D6 → `~/.claude/skills/dxb-image-director/SKILL.md`.
- **Legitimacy Verdict:** OK — free skill content; generation cost gated by D1; adaptation required by D6.

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — R4.1 pass)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
