# Study Card: Wan2GP / WanGP — video generation for the GPU-poor

> FILLED 2026-08-19 (rival-intel source 37 — the CEO's link `instagram.com/reels/DcAT9zPD0Cn`; only the SOURCES from that reel were taken, on his order).

- **Tool:** WanGP (`deepbeepmeep/Wan2GP`) — a single-file launcher (`wgp.py`) + Docker/CUDA runner that runs the open video models **locally on one consumer GPU**. Its own description: *"A fast AI Video Generator for the GPU Poor. Supports Wan 2.1/2.2, LTX-2, Qwen Image, Hunyuan Video, LTX Video and Flux."*
- **Slug:** wan2gp
- **Category:** Media/content (video GENERATION lane)
- **Status:** STUDY
- **Target Phase:** 10 (Creative/Social video production wave)
- **Owner (dept/tier):** Social Media dept — `social-creative-asset` ("Social Creative Asset Producer", measured `dormant`, `skills=[]`, `autonomy_level=0`)
- **Trigger Type:** service (local model runner)
- **Source:** https://github.com/deepbeepmeep/Wan2GP — measured 2026-08-19 via the GitHub API: **8,763 stars · 1,371 forks · Python · last push 2026-08-19** (same day — actively maintained)
- **Pinned Version:** repo release at INSTALL (README log read at study time: **WanGP v11.52**)
- **Purpose:** **One launcher instead of four installs.** It fronts Wan, LTX-2, HunyuanVideo and Flux, so the bench in **P37-2** can compare engines without four separate stacks.
- **Official Docs URL:** repository README

## Key API / Usage Notes

- Mechanism that matters for long video: **sliding windows** — overlapped frames carry the previous window's audio forward, and *"Video Length not Limited by Audio"*. Long clips do not need a bigger card, they need continuation.
- Ships **one-click install/update scripts** and a Docker+CUDA path, so the install can be delegated to an agent (the source's own method).
- Target hardware is exactly ours: the live machine carries an **NVIDIA RTX 5060 Ti, 16,311 MiB** (measured 2026-08-19) and no part of the holding uses it.

## Known Pitfalls

1. **Licence is `NOASSERTION` on the GitHub API** — the repository does not declare a standard SPDX licence. **Read the licence file and the underlying model weights' licences BEFORE any commercial render.** D1 gate: no commercial use until this is settled in writing.
2. Model weights are separate downloads with their own terms (Wan, Hunyuan, LTX-2, Flux each differ) — the launcher's licence does not cover them.
3. Disk and VRAM: each engine pulls multi-GB weights; measure peak VRAM in the P37-2 bench before promising a render clock.

- **Install Command:** (deferred to INSTALL) repo's own one-click script on the workstation; first verification = one 9:16 clip rendered locally with seconds-per-render and peak VRAM recorded into `cost_ledger`.
- **Legitimacy Verdict:** **PENDING** — free and self-hosted (D1-compatible), but the undeclared licence must be read first.

## Lifecycle Checklist
- [x] STUDY (2026-08-19 — rival-intel 37)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
