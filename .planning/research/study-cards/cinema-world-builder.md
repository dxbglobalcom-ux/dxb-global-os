# Study Card: cinema-world-builder

> FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü item 12). Sibling: [[banana-pro-director]] (same creator pipeline, item 11).

- **Tool:** cinema-world-builder.md — Claude skill for cinematic video prompting: five cinema modes, each with its own camera, lens stack, and grade ("shoot this scene in a parking lot at night with anamorphic flares")
- **Slug:** cinema-world-builder
- **Category:** Media/content (video direction)
- **Status:** STUDY
- **Target Phase:** 10 (Creative/Social video production wave)
- **Owner (dept/tier):** Creative dept / Social media
- **Trigger Type:** skill
- **Source:** creator "Joey" (moderncreator.app — built from a real two-week music video production, given away free); maintained ecosystem equivalent: https://github.com/smixs/visual-skills (Seedance 2.0, Kling 3.0 multi-shot + native dialogue, Veo prompting)
- **Pinned Version:** none yet — exact file acquired at INSTALL
- **Purpose:** Video-stage director for the image→video pipeline: takes [[banana-pro-director]] character/scene plates and directs single or multi-shot sequences with real camera language, color grading, and per-scene seconds tracking (credit spend control). Target generators: [[seedance-2]] class models.
- **Official Docs URL:** https://moderncreator.app/2026-05-11-joey-the-two-claude-skills-that-run-our-entire-ai-video-pipeline

## Key API / Usage Notes

- Markdown skill; D6 adaptation rule applies (DXB-authored rewrite, no embedded external text).
- Workflow: character sheet → scene build → reference image upload → shot direction; the credit-tracking habit maps directly onto our cost_ledger tagging.

## Known Pitfalls

1. Downstream generator is paid (Seedance/Kling/Veo APIs) → D1 gate; no free local video generator of comparable quality yet — video generation waits for post-profit budget unless a free tier proves usable.
2. SkillSpector scan before install (third-party skill hygiene).
3. Multi-shot direction consumes generation seconds fast — per-run second budget must be declared in the task contract before any paid call.

- **Install Command:** (deferred to ADOPT) fetch → scan → D6 rewrite → `~/.claude/skills/dxb-video-director/SKILL.md`.
- **Legitimacy Verdict:** OK — free skill content; paid generation strictly D1-gated.

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — R4.1 pass)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
