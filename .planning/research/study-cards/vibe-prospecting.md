# Study Card: Vibe Prospecting

> FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü item 8).

- **Tool:** Vibe Prospecting (Explorium) — B2B prospect-data connector/plugin for Claude (lead lists, enrichment, outreach research)
- **Slug:** vibe-prospecting
- **Category:** Sales / GTM
- **Status:** STUDY
- **Target Phase:** 10 (Sales dept outbound wave — feeds the DEPT-04 outbound pipeline before its approval gate)
- **Owner (dept/tier):** Sales / Revenue Growth Specialist
- **Trigger Type:** mcp-profile (remote MCP endpoint; also listed in Anthropic Connectors Directory + claude.com/plugins)
- **Source:** https://github.com/explorium-ai/vibeprospecting-plugin · https://www.vibeprospecting.ai
- **Pinned Version:** remote SaaS endpoint (no local pin) — record endpoint + plugin version at INSTALL
- **Purpose:** Natural-language B2B prospecting inside Claude Code: 150M+ company profiles, 800M+ contacts, 18 buying-signal categories behind one OAuth login; 8 workflow classes (list building, CRM enrichment, email lookup, ABM lists, lead scoring, CSV cleaning, account research, multi-step GTM).
- **Official Docs URL:** https://www.vibeprospecting.ai/product/claude

## Key API / Usage Notes

- Claude Code hookup: `claude mcp add --transport http` with their remote endpoint; OAuth account required.
- Output = prospect data feeding drafts; ALL outreach stays draft-only behind the outward-action approval gate (email/DM never auto-sends).

## Known Pitfalls

1. Remote SaaS MCP: data egress surface — send it queries, never internal documents; least-privilege profile scoped to Sales only.
2. Pricing/quota not verified this pass (free tier unmeasured) — **D1 free-first check is the first INSTALL step**; if meaningful usage is paid, it waits for post-profit budget + CEO approval.
3. Contact data is personal data — outreach use must respect GDPR-side obligations (EU VPS, EU prospects); legal review row before ADOPT.
4. Vendor lock: keep prospect exports in our DB (CRM tables), not only in their platform.

- **Install Command:** (deferred to ADOPT) `claude mcp add vibeprospecting --transport http <endpoint>` + OAuth; scope to sales MCP profile.
- **Legitimacy Verdict:** OK with gates — legitimate vendor (Explorium), official Anthropic connector listing; paid-tier risk gated by D1, privacy gated by legal row.

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — R4.1 pass)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
