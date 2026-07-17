# Study Card: Z-Image

> FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü item 25 "z-image-generation").

- **Tool:** Z-Image — Alibaba Tongyi Lab open-source 6B text-to-image family (Turbo distilled + Base raw checkpoint)
- **Slug:** z-image
- **Category:** Media/content (image generation — FREE local lane)
- **Status:** STUDY
- **Target Phase:** 10 (Creative visual production — the D1 free-first counterpart to paid Nano Banana Pro / Gemini image APIs)
- **Owner (dept/tier):** Creative dept / Social media
- **Trigger Type:** service (local inference on the RTX 4090 machine; ComfyUI-class runner)
- **Source:** https://github.com/Tongyi-MAI/Z-Image — Apache-2.0, released Nov 2025 (Turbo), Base 2026-01-28; top-ranked open-source image model on major benchmarks at release
- **Pinned Version:** Z-Image-Turbo (speed lane, 8 sampling steps) + Z-Image-Base (quality lane) — checkpoint hashes pinned at INSTALL
- **Purpose:** Photorealistic stills in <1s/8 steps on a consumer GPU (16GB VRAM — the A1-approved RTX 4090 machine qualifies): social content, ad creatives, character plates for [[banana-pro-director]] workflows — at €0 marginal cost (D1 core play: free local generation until profit funds paid APIs).
- **Official Docs URL:** https://github.com/Tongyi-MAI/Z-Image (README + ComfyUI wiki guides)

## Key API / Usage Notes

- S3-DiT architecture (single-stream: text + visual semantic + VAE tokens in one sequence); 6B params performing at 20B+-closed-model level per benchmarks.
- Runner: ComfyUI or diffusers pipeline on the 4090; expose to agents as a queue-fed local tool (generation requests via task, outputs filed to asset store) — not a synchronous MCP call (render time + GPU locking).
- Turbo for iteration volume; Base for hero assets.

## Known Pitfalls

1. GPU machine ≠ VPS: generation runs on the CEO's RTX 4090 box, which is not 24/7 — jobs must queue tolerantly (pg-boss idiom) and degrade honestly when the box is offline.
2. VRAM 16GB floor for comfortable Turbo runs — batch sizes measured, not guessed.
3. Prompt content inherits R1.5 halal content boundaries (no indecent output) — enforced at persona/task level.
4. Chinese-English bilingual prompting is strong, Turkish prompting unverified — test TR prompt quality at INSTALL; fall back to EN prompts from TR briefs.

- **Install Command:** (deferred to ADOPT) ComfyUI + Z-Image-Turbo checkpoint download (hash-verified) on the 4090 machine; first verification = fixed-seed benchmark plate.
- **Legitimacy Verdict:** OK — Apache-2.0 open weights, free local inference (D1 ideal), no data egress.

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — R4.1 pass)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
