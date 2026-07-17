# Study Card: OpenMontage + OpenCut

> STUB → FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü item 22 "openmantage" [sic]; tracker row was STUDY/Phase-10 stub since 07-06). PRIMARY winner of the [[video-editing-toolchain]] verdict.

- **Tool:** OpenMontage — open-source agentic video production system ("turn your AI coding assistant into a full video production studio"); OpenCut — its open-source timeline editor (opencut.app)
- **Slug:** openmontage-opencut
- **Category:** Media/content (video production + editing)
- **Status:** STUDY
- **Target Phase:** 10 (Creative/Social video production wave — first candidate to INSTALL when that wave opens)
- **Owner (dept/tier):** Creative/Social video production
- **Trigger Type:** skill (skill/pipeline bundle driven from Claude Code) + service (OpenCut editor)
- **Source:** https://github.com/calesthio/OpenMontage — 23.6k★/2.6k forks, hit #1 GitHub Trending; OpenCut 67k★, rewrite merged to main 2026-07-14 (opencut.app / new.opencut.app preview); active issues into 2026-07-15
- **Pinned Version:** repo release/commit at INSTALL (fast-moving — rewrite just merged; let it settle a couple of weeks)
- **Purpose:** The holding's editing/production lane: 12 production pipelines, 52 tools, 400+ agent skills covering brief→storyboard→assembly→cut→export, driven by Claude Code — free OSS end-to-end (D1 ideal). Pairs upstream with [[cinema-world-builder]]/[[banana-pro-director]] direction and [[z-image]]/[[seedance-2]] generation; [[heygen-hyperframes]] covers the templated/deterministic niche beside it.
- **Official Docs URL:** https://github.com/calesthio/OpenMontage (README + docs)

## Key API / Usage Notes

- Install ONLY the pipelines the first real use-case needs — 400+ skills into context is a token-discipline violation; curate a DXB subset (2-3-active-plugin ecosystem guidance).
- Works with Claude Code/Cursor/Copilot as the driving assistant; our driver = runtime agents via library grants at ADOPT.
- ffmpeg-class rendering underneath: render location decision (VPS vs RTX 4090 box) measured at INSTALL — same rule as [[heygen-hyperframes]].

## Known Pitfalls

1. Post-rewrite churn (main rewritten 2026-07-14): APIs unstable — pin hard, upgrade deliberately.
2. Two orgs exist (calesthio/OpenMontage + Open-Montage mirror) — canonical is calesthio; ignore mirrors/SourceForge repacks (supply-chain hygiene).
3. 500-skill surface = large SkillSpector scan burden — scan the curated subset only, before activation.
4. X230 cannot carry editor UI + render; production runs belong to VPS/4090.

- **Install Command:** (deferred to Phase-10 wave) clone calesthio/OpenMontage → curate pipeline subset → SkillSpector scan → wire ffmpeg render host → benchmark cut on a real short.
- **Legitimacy Verdict:** OK — open-source, huge active community, free (D1 compliant); supply-chain note on mirrors recorded.

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — R4.1 pass)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
