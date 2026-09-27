---
title: Independent third-party implementations and open-source alternatives
classification: COMMUNITY OBSERVATION — adoption-scale claims (star counts) are UNVERIFIED unless noted
compiled: 2026-09-23
---

# Third-party implementations (not TypeSafe's own repos)

| Project | Author | URL | What it is |
|---|---|---|---|
| Kev | Jared Palmer | https://github.com/jaredpalmer/kev | Qwen3.5-based 0.8B/4B/9B model family, TypeSafe-API-compatible, trainable/runnable locally. Forked at github.com/mobailabs/kev and github.com/xujiantop-crypto/kev. |
| SemIf (formerly "OpenJev") | — | openjev.com (renamed, reason not disclosed per pasqualepillitteri.it) | Runs on RTX 3090 / Apple MLX / WebGPU; reads typed option probabilities directly, no JSON-decode loop needed. |
| Open-Jev | Zefan Cai | https://zefan-cai.github.io/open-jev/ | LoRA reproduction with published benchmarks — see `../../experts/implementations/zefan-cai-open-jev-reproduction.md` for full detail. |
| von | wfzyx | https://github.com/wfzyx/von | "Sub-15ms, non-autoregressive, local drop-in alternative to TypeSafe Jev" (HN 2026-09-21, 5 pts). |
| mini-jev | r-ms | https://github.com/r-ms/mini-jev | Jev-like typed-decision behavior implemented on top of a local LLM (HN 2026-09-18, 3 pts). |
| open-alternative-jev | ikermoel | https://github.com/ikermoel/open-alternative-jev | Local-GPU alternative (HN 2026-09-18, 1 pt). |
| jev-experiments | rahimnathwani / dabit3 | https://github.com/dabit3/jev-experiments | Latency-focused demos, described as "built by Devin" (an AI coding agent) (HN 2026-09-18). |
| typesafe-jev-calibrate-for-code-review | Selmar | https://github.com/Selmar/typesafe-jev-calibrate-for-code-review | Using JEV as a calibrated code-review confidence signal (HN 2026-09-22). |

## Adoption-scale claim — now CONFIRMED via direct GitHub API query
One source (pasqualepillitteri.it, Italian blog, 2026-09) claimed Kev + SemIf combined crossed **4,000+ GitHub stars within days** of TypeSafe's launch. **Update (2026-09-23): independently confirmed via a direct `gh api search/repositories` query** (see `ecosystem-overview.md`) — `TheoLeeCJ/SemIf-OpenJev` alone shows **4,046 stars**, making it the single highest-starred repository found anywhere in this research corpus, exceeding even TypeSafe's own official `skills` repo (1,986★). The broader ecosystem query also found at least 9 independently-created competing "awesome-jev" curated lists (123–1,449 stars each) within the same window — see `ecosystem-overview.md` for the full table.

## Relevance note for DXB
The existence of multiple credible local/self-hostable alternatives within JEV's first two weeks is itself evidence against hard vendor lock-in being unavoidable — if DXB adopts the *typed-decision-primitive pattern* (Choice/Score/Noul) architecturally, it is not necessarily bound to TypeSafe's hosted API specifically. This is an opportunity flag, not an architectural recommendation (per görev1.md §14 rule: evidence → opportunity, not evidence → conclusion).
