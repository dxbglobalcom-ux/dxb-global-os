# github.com/typesafe-ai — Official GitHub Organization

- **Source type:** OFFICIAL (Tier 1)
- **Fetched:** 2026-09-23 via `gh api orgs/typesafe-ai/repos`

## Repositories (as of fetch date)

| Repo | Description | Stars | Last push |
|---|---|---|---|
| `typesafe-ai/typesafe-sdk-python` | The official Python library for the TypeSafe API | 210 | 2026-09-21 |
| `typesafe-ai/typesafe-sdk-js` | The official TypeScript/JavaScript library for the TypeSafe API | 229 | 2026-09-15 |
| `typesafe-ai/system-one-adapter-python` | Drop-in TypeSafeClient replacement backed by LLM APIs | 278 | 2026-09-22 |
| `typesafe-ai/skills` | Agent skills for building with TypeSafe's System One API | 1,986 | 2026-09-12 |
| `typesafe-ai/Overwatch` | (no description) | 5 | 2026-09-03 |
| `typesafe-ai/typesafe-ai.github.io` | (no description — likely org landing page) | 2 | 2026-06-04 |
| `typesafe-ai/daggerverse` | Collection of useful Dagger modules (CI/CD tooling, not Jev-specific) | 16 | 2026-09-09 |
| `typesafe-ai/pulumi-clickhouse` | Pulumi provider for ClickHouse Cloud (infra tooling, not Jev-specific) | 3 | 2026-07-08 |
| `typesafe-ai/vllm` | Fork of vLLM — high-throughput LLM inference/serving engine | 3 | 2025-05-23 |
| `typesafe-ai/LLaDA` | Fork of official PyTorch implementation for "Large Language Diffusion Models" | 11 | 2025-06-17 |

## Notes / inference boundary

- **`system-one-adapter-python`** is significant: it is the official wrapper TypeSafe itself uses to make LLMs (GPT, Claude, etc.) answer in the same typed Choice/Score/Noul shape as Jev, for benchmark comparisons (see `official/evals.md` and `official/blog/`). This is the source code behind the "LLM baseline" side of TypeSafe's own published comparisons — worth auditing directly if DXB wants to verify the fairness of TypeSafe's benchmark methodology. **Not yet cloned/read in this pass — open item.**
- **`skills`** (1,986 stars, pushed 2026-09-12) is the official Claude Code / Codex agent-skill package for calling TypeSafe's API from coding agents — directly relevant to DXB's own agent-skill architecture (`.claude/skills/`). **Not yet cloned/read in this pass — open item, high DXB relevance.**
- **`vllm`** and **`LLaDA`** forks (both pre-dating the public Jev launch by over a year, last pushed 2025) are **circumstantial, not confirmed** signals about possible research lineage — vLLM is inference-serving infrastructure, LLaDA is a **diffusion-based (non-autoregressive) language model** implementation. Given Jev's own "parallel sampler" / non-autoregressive framing, a forked LLaDA repo is suggestive of an architectural research direction, but TypeSafe has not confirmed this connection anywhere in official material fetched so far. **Flag as UNVERIFIED inference, not a claim** — do not present this as confirmed architecture in any downstream summary.
- No `system-one-adapter-python` benchmark harness, no training code, no model weights, no architecture paper are published in this org — consistent with the "architecture kept secret" observation made independently by Fireship and RepoChad (see `experts/videos/`).
