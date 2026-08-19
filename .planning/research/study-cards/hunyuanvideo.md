# Study Card: HunyuanVideo (Tencent) — large open video model

> FILLED 2026-08-19 (rival-intel source 37).

- **Tool:** `Tencent-Hunyuan/HunyuanVideo` — *"A Systematic Framework For Large Video Generation Model."*
- **Slug:** hunyuanvideo
- **Category:** Media/content (video GENERATION lane)
- **Status:** STUDY
- **Target Phase:** 10 (Creative/Social video production wave)
- **Owner (dept/tier):** Social Media dept — `social-creative-asset`
- **Trigger Type:** service (local model)
- **Source:** https://github.com/Tencent-Hunyuan/HunyuanVideo — measured 2026-08-19 via the GitHub API: **12,442 stars · 1,313 forks · Python · last push 2026-06-29 · licence `NOASSERTION`**
- **Pinned Version:** exact tag at INSTALL
- **Purpose:** The quality end of the free generation lane; the source claims near-1080p output.
- **Official Docs URL:** repository README + the project's demo page

## Key API / Usage Notes

- Reachable through **[[wan2gp]]**, which fronts it — meaning it can be benched in P37-2 without its own stack.
- Weight size and VRAM ceiling are the open question for a 16 GB card; **UNVERIFIED until the bench runs.**

## Known Pitfalls

1. **Licence is `NOASSERTION`** — Tencent ships a community licence with named restrictions. **Read it before any commercial render**; D1 gate applies.
2. Large-model class: the biggest VRAM risk of the four measured here.
3. Last push 2026-06-29 — confirm the maintained branch at INSTALL.

- **Install Command:** (deferred to INSTALL) via [[wan2gp]] first; direct install only if the bench picks it.
- **Legitimacy Verdict:** **PENDING** — free to self-host, but the licence text decides commercial use.

## Lifecycle Checklist
- [x] STUDY (2026-08-19 — rival-intel 37)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
