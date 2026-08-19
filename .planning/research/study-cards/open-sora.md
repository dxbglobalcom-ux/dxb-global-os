# Study Card: Open-Sora — open video generation model

> FILLED 2026-08-19 (rival-intel source 37).

- **Tool:** `hpcaitech/Open-Sora` — an open text/image→video model and training stack. Its own line: *"Democratizing Efficient Video Production for All."*
- **Slug:** open-sora
- **Category:** Media/content (video GENERATION lane)
- **Status:** STUDY
- **Target Phase:** 10 (Creative/Social video production wave)
- **Owner (dept/tier):** Social Media dept — `social-creative-asset`
- **Trigger Type:** service (local model)
- **Source:** https://github.com/hpcaitech/Open-Sora — measured 2026-08-19 via the GitHub API: **29,282 stars · 3,007 forks · Apache-2.0 · Python · last push 2026-04-09**
- **Pinned Version:** 2.0 line; exact tag at INSTALL
- **Purpose:** The free half of the generation lane that `video-editing-toolchain.md` left pointing at paid tools.
- **Official Docs URL:** repository README

## Key API / Usage Notes

- Runs from the command line: **256 px on a single GPU**, 768 px across eight — resolution is a dial, not a plan.
- **`9:16` is a first-class aspect ratio** (with `16:9`, `1:1`, `2.39:1`) — that is the shape this holding publishes in.
- **Motion is a prompt parameter** (`motion score`, default 4) — direction becomes a number an agent can set, not a taste.

## Known Pitfalls

1. The repo's prompt-refiner wants an **OpenAI key** — forbidden: `.planning/research/STACK.md` bans raw provider keys, and nothing about the holding leaves this box. Use it without the refiner, or refine through our own LiteLLM path.
2. Its README funnels to a paid hosted product (**Video Ocean**) — the free model is the top of somebody's funnel; do not drift onto the paid rail.
3. Last push 2026-04-09 — slower-moving than the others measured the same day; check for a maintained fork before ADOPT.

- **Install Command:** (deferred to INSTALL) per repo README on the workstation GPU; first verification = one 9:16 clip with seconds-per-render and peak VRAM recorded.
- **Legitimacy Verdict:** OK — **Apache-2.0**, free, self-hosted (D1 compliant). Model weights' own terms to be confirmed at INSTALL.

## Lifecycle Checklist
- [x] STUDY (2026-08-19 — rival-intel 37)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
