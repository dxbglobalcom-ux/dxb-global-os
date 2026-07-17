# Study Card: Video-editing toolchain verdict (best tool + skill for Claude)

> FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü item 13: "find the best video-editing tool + skill for Claude and for our holding"). This is a RESEARCH-VERDICT card: it answers the question and routes to per-tool cards.

- **Tool:** (comparison verdict — candidates below)
- **Slug:** video-editing-toolchain
- **Category:** Media/content
- **Status:** STUDY
- **Target Phase:** 10 (Creative/Social video production wave)
- **Owner (dept/tier):** Creative dept / Social media
- **Trigger Type:** ref (verdict); winners install under their own cards
- **Source:** survey 2026-07-17 — agent-native OSS vs SaaS editors
- **Pinned Version:** n/a
- **Purpose:** Pick the holding's Claude-driven video EDITING lane (distinct from GENERATION, which is [[seedance-2]]/[[heygen-hyperframes]] territory).

## Verdict (2026-07-17)

**Primary: [[openmontage-opencut]]** — calesthio/OpenMontage (23.6k★, #1 GitHub trending; 12 pipelines, 52 tools, 400+ agent skills; "turn your AI coding assistant into a video production studio") + OpenCut editor (67k★, rewrite merged 2026-07-14). Open-source, agent-native, free → D1-perfect; already a tracker row (stub filled this pass).
**Secondary (programmatic/deterministic): [[heygen-hyperframes]]** — HTML→deterministic MP4, Apache-2.0, built for agents; best for templated/branded shorts, data-driven videos, product demos.
**Rejected for v1:** SaaS AI editors (Descript/CapCut/VEED/Runway — paid, no agent-first API fit, D1 fail as defaults); Remotion-class React renderers (company-license cost >3 devs; HyperFrames covers the same niche free); MoneyPrinterTurbo stays a niche auto-shorts generator (existing stub row), not the editing lane.

## Key API / Usage Notes

- Learning side ("OS watches video and learns") already LIVE via yt-dlp + video-use (07-07). This card is the PRODUCTION side.
- Chain shape at ADOPT: brief → [[cinema-world-builder]] direction → generation ([[seedance-2]] when funded / stills via [[z-image]]) → OpenMontage pipelines → HyperFrames for templated cuts.

## Known Pitfalls

1. OpenMontage's 500-skill surface is huge — install ONLY the pipelines the first revenue use-case needs (token discipline; 2-3-active-plugin ecosystem guidance).
2. ffmpeg + render CPU load: X230 cannot render; VPS render must be budgeted or offloaded to the RTX 4090 machine when available.
3. Skill-file hygiene: [[skillspector]] scan on every third-party skill batch.

- **Install Command:** n/a here — see [[openmontage-opencut]] and [[heygen-hyperframes]] cards.
- **Legitimacy Verdict:** verdict card; both winners are permissive-licensed OSS (MIT/Apache-2.0), free → D1 compliant.

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — verdict recorded)
- [ ] INSTALL (via winners' own cards)
- [ ] ADOPT
- [ ] EMBED
