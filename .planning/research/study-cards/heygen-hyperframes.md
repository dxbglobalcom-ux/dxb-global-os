# Study Card: HeyGen HyperFrames

> FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü item 19).

- **Tool:** HyperFrames — open-source framework: HTML/CSS/media/seekable animations → deterministic MP4 ("Write HTML. Render video. Built for agents."). Plus the surrounding HeyGen SaaS (Avatar V, LiveAvatar) as a gated adjacency.
- **Slug:** heygen-hyperframes
- **Category:** Media/content (programmatic video)
- **Status:** STUDY
- **Target Phase:** 10 (Creative/Social video production wave — secondary lane per [[video-editing-toolchain]] verdict)
- **Owner (dept/tier):** Creative dept / Social media
- **Trigger Type:** lib (Node-side render framework) + skill (heygen-avatar / heygen-video / heygen-translate skills exist in editor marketplaces)
- **Source:** https://github.com/heygen-com/hyperframes — Apache-2.0, open-sourced May 2026; docs https://developers.heygen.com/hyperframes-heygen ; product page https://hyperframes.heygen.com
- **Pinned Version:** repo release at INSTALL
- **Purpose:** Deterministic, templated video for agents: branded shorts, data-driven product/report videos, demo clips — our dashboard design tokens can drive on-brand video templates directly from HTML/CSS. June 2026 added HyperFrames skills, cloud rendering, deeper agent workflow integrations.
- **Official Docs URL:** https://developers.heygen.com/hyperframes-heygen

## Key API / Usage Notes

- **Merged 2026-08-19:** it is **vendored inside [[openmontage-opencut]]** as that system's second render
  runtime, and it is half of what makes OpenMontage's zero-key render possible. Adopt it **through**
  OpenMontage, not beside it.

- **Re-measured 2026-08-19 (rival-intel source 37, GitHub API): `heygen-com/hyperframes` — 41,693 stars, Apache-2.0, last push 2026-08-19.** It has become the most-starred tool in this whole lane since the 07-17 pass.
- **It installs as an agent SKILL, not as a dependency: `npx skills add heygen-com/hyperframes`** — this is the shape our `/ai/skills` page already draws (`library_items` where `kind='skill'`, measured 2 rows).
- The composition is markup: the audio track is declared in the HTML itself (`data-start`, `data-duration`, `data-track-index`, `data-volume`) with a JS timeline driving it — an agent writes a film the way it writes a page.

- Core framework = free OSS local rendering; HeyGen's cloud rendering + Avatar V/LiveAvatar APIs = PAID SaaS → D1 gate (same class as [[seedance-2]]).
- Determinism is the differentiator vs generative video: same input → same MP4; perfect for repeatable branded formats (weekly report videos, product cards).
- TS/Node-native → fits our monorepo directly (unlike the Python research stack).

## Known Pitfalls

1. Render CPU cost on VPS — measure a benchmark render before scheduling recurring video jobs; offload heavy renders to the RTX 4090 machine when available.
2. Avatar features require HeyGen accounts/credits — avatar lane waits for post-profit funding + CEO approval; do not blend free framework and paid API in one task without a cost tag.
3. Young OSS (open-sourced ~2 months at study time) — pin version, expect API movement.

- **Install Command:** (deferred to ADOPT) `pnpm add` per repo README into a creative-tools package; local render smoke test = first verification.
- **Legitimacy Verdict:** OK — Apache-2.0 first-party open-source from HeyGen; free local core (D1 compliant), paid cloud/avatars gated.

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — R4.1 pass)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
