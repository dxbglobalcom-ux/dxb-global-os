# Study Card: Claude ads (paid-media skills/plugins)

> FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü item 17 "Claude ads"; also answers items 3's tooling side — ads capability for the future ads function).

- **Tool:** Paid-media operations tooling for Claude Code — surveyed lane with a primary candidate
- **Slug:** claude-ads
- **Category:** Marketing / Paid media
- **Status:** STUDY
- **Target Phase:** 10+ (ads wave — activates only when a revenue project buys ads; ad spend = hard approval gate)
- **Owner (dept/tier):** Marketing dept / Ads specialists (workforce row pending — see intake report org items)
- **Trigger Type:** skill (+ mcp-profile for platform APIs)
- **Source:** survey 2026-07-17:
  - **Primary candidate:** https://github.com/AgriciDaniel/claude-ads — Claude-first paid-media ops skill, 12 platforms (Google, Meta, YouTube, LinkedIn, TikTok, Microsoft, Apple, Amazon, Reddit, Pinterest, Snapchat, X); source-grounded audits, deterministic scoring, versioned JSON reports, **capability-gated account changes** (matches our approval-gate model natively)
  - Alternatives: Ad-Superpowers plugin (115 skills/33 MCP tools, 7 platforms), Adspirer Ads Agent (official claude.com plugin, 91 tools)
- **Pinned Version:** at INSTALL (repo release/commit pin)
- **Purpose:** Ads audit → strategy → creative brief → campaign draft pipeline inside Claude Code, with account WRITES held behind explicit capability gates; feeds the future ads function without opening spend authority to agents.
- **Official Docs URL:** https://github.com/AgriciDaniel/claude-ads

## Key API / Usage Notes

- claude-ads' "capability-gated account changes" maps 1:1 to our outward-action approval gate: read/audit free-running; mutate/spend behind CEO approval + cost monitor.
- Same author as banana-claude ([[banana-pro-director]] ecosystem) — consistent skill idiom.
- Ad creative generation chains into [[banana-pro-director]] (stills) and the video lane.

## Known Pitfalls

1. **Ad spend = money-out**: constitutionally gated; no plugin may hold platform credentials with spend rights outside the outbox-executor pattern.
2. Platform API tokens (Meta/Google) are high-value secrets — vault only, least-privilege scopes, rotation drill.
3. SkillSpector scan before install (third-party skill hygiene).
4. 342-skill ecosystem noise: resist installing bundles; one audited primary (claude-ads) beats a 115-skill surface (token discipline).

- **Install Command:** (deferred to ads wave) fetch → SkillSpector scan → D6 adaptation for gate wiring → platform credentials only inside outbox executor.
- **Legitimacy Verdict:** OK — MIT-class OSS skill repos; spend risk controlled by our gate architecture, not by the tool.

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — R4.1 pass)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
