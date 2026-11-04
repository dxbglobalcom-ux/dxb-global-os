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
  - **Primary candidate:** https://github.com/AgriciDaniel/claude-ads — Claude-first paid-media ops skill, 12 platforms (Google, Meta, YouTube, LinkedIn, TikTok, Microsoft, Apple, Amazon, Reddit, Pinterest, Snapchat, X); source-grounded audits of account exports, findings and gaps lists, versioned JSON reports, read-only. **Read 2026-11-04 (deep web study, v2.1.0): deterministic scoring is disabled (`account-health-scoring: disabled`), account changes are disabled (`account-mutation: disabled`, all 12 platforms), it does not connect to a live account, and it is not on this machine**
  - Alternatives: Ad-Superpowers plugin (115 skills/33 MCP tools, 7 platforms), Adspirer Ads Agent (official claude.com plugin, 91 tools)
- **Pinned Version:** at INSTALL (repo release/commit pin)
- **Purpose:** Ads audit → strategy → creative brief → campaign draft pipeline inside Claude Code, working from exports with no account writes; feeds the future ads function without opening spend authority to agents.
- **Official Docs URL:** https://github.com/AgriciDaniel/claude-ads

## Key API / Usage Notes

- claude-ads is an export auditor: audit free-running; live reading comes from the platforms' official MCPs; mutate/spend behind CEO approval + cost monitor.
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
