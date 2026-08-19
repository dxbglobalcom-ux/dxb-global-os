# Study Card: LTX-Video / LTX-2 (Lightricks) — video AND audio in one pass

> FILLED 2026-08-19 (rival-intel source 37).

- **Tool:** `Lightricks/LTX-Video` — the LTX video model family; **LTX-2** generates picture and sound **in one coherent process**.
- **Slug:** ltx-video
- **Category:** Media/content (video GENERATION lane)
- **Status:** STUDY
- **Target Phase:** 10 (Creative/Social video production wave)
- **Owner (dept/tier):** Social Media dept — `social-creative-asset`
- **Trigger Type:** service (local model)
- **Source:** https://github.com/Lightricks/LTX-Video — measured 2026-08-19 via the GitHub API: **10,868 stars · 1,113 forks · Apache-2.0 · Python · last push 2026-01-05**
- **Pinned Version:** exact tag at INSTALL (README read at study time covers v0.9.7 distilled, v0.9.8, LTX-2)
- **Purpose:** **The one engine that removes a whole step from our pipeline** — no separate voice-over pass, because sound is generated with the picture.
- **Official Docs URL:** repository README

## Key API / Usage Notes

- Published claims, from the repository's own README (their reference hardware, **not ours**): native **4K up to 50 fps**, clips to **10 s** (v0.9.8: to 60 s), *"up to 50 % lower compute cost than competing models"*, multi-keyframe conditioning, 3D camera logic, LoRA fine-tuning.
- **The render clock that makes scheduling possible:** the 13B **distilled** build renders **HD in 10 seconds with a low-res preview after 3 seconds**, in **8 diffusion steps**; the **LoRA variant is stated to need 1 GB of VRAM**, and an fp8 build targets real-time.
- **Built into ComfyUI core** — an existing node graph can drive it.
- Also fronted by **[[wan2gp]]**.

## Known Pitfalls

1. Every timing above is the vendor's on their reference card; **whether it holds on our RTX 5060 Ti (16,311 MiB) is UNVERIFIED until the P37-2 bench runs.**
2. Audio-with-video means audio rights and Islamic-boundary review belong in the same task as the render (music/voice content is not neutral).
3. Last push 2026-01-05 — the oldest of the four; check for the maintained release line at INSTALL.

- **Install Command:** (deferred to INSTALL) via [[wan2gp]] or ComfyUI on the workstation GPU; first verification = one 9:16 clip with sound, seconds-per-render and peak VRAM recorded.
- **Legitimacy Verdict:** OK — **Apache-2.0**, free, self-hosted (D1 compliant). Weight licences confirmed at INSTALL.

## Lifecycle Checklist
- [x] STUDY (2026-08-19 — rival-intel 37)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
