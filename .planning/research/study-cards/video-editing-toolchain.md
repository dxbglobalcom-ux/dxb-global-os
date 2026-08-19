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

**Primary: [[openmontage-opencut]]** — calesthio/OpenMontage (48.9k★ measured 2026-08-19, was 23.6k at the 07-17 pass; #1 GitHub trending; 13 pipelines, 121 registered tools, 1,096 skill files; AGPL-3.0; "turn your AI coding assistant into a video production studio") + OpenCut editor (67k★, rewrite merged 2026-07-14). Open-source, agent-native, free → D1-perfect; already a tracker row (stub filled this pass).
**Secondary (programmatic/deterministic): [[heygen-hyperframes]]** — HTML→deterministic MP4, Apache-2.0, built for agents; best for templated/branded shorts, data-driven videos, product demos.
**Rejected for v1:** SaaS AI editors (Descript/CapCut/VEED/Runway — paid, no agent-first API fit, D1 fail as defaults); Remotion-class React renderers (company-license cost >3 devs; HyperFrames covers the same niche free); MoneyPrinterTurbo stays a niche auto-shorts generator (existing stub row), not the editing lane.

## Generation lane — filled 2026-08-19 (rival-intel source 37, the CEO's link)

This card's chain shape sent GENERATION to `[[seedance-2]]` (paid, "when funded") and stills to
`[[z-image]]`. **The free generation half now has four measured candidates**, all self-hosted, all
reachable from one launcher:

- **[[wan2gp]]** — 8,763★, last push 2026-08-19, licence `NOASSERTION` (read it first). **Fronts Wan, LTX-2, HunyuanVideo, Flux and Qwen Image**, so the bench needs one install, not four.
- **[[ltx-video]]** — 10,868★, **Apache-2.0**; LTX-2 makes **picture and sound in one pass** (removes the separate voice-over step); distilled build claims **preview 3 s / HD 10 s, 8 steps**, LoRA at **1 GB VRAM**; in ComfyUI core.
- **[[open-sora]]** — 29,282★, **Apache-2.0**; `9:16` first-class, motion as a numeric prompt parameter.
- **[[hunyuanvideo]]** — 12,442★, licence `NOASSERTION`; the quality end, and the biggest VRAM risk.

**Pitfall 2 of this card is now answered by hardware:** the render machine exists — the live
workstation carries an **NVIDIA RTX 5060 Ti, 16,311 MiB** (measured 2026-08-19) and nothing uses it.
**Which engine actually fits 16 GB is UNVERIFIED until the bench runs** — that bench is **P37-2** in
`.planning/research/rival-intel/37-dcat9zpd0cn.md`, and the same report carries the money side:
Remotion's `$0.01/render + $100/mo` against three Apache-2.0 engines at zero, and the paid bench row
`CAPABILITY_ARSENAL_DOCTRINE.md:134` whose free-alternative column still reads `none`.

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
