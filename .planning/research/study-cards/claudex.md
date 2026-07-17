# Study Card: claudex

> STUB → FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü item 16; tracker row was STUDY/Phase-5 stub since 07-06, "model-switching pattern reference only").

- **Tool:** claudex — independent CLI managing isolated provider PROFILES for Claude Code (multi-model: Z.ai, MiniMax, OpenRouter free models, DeepSeek, Moonshot, Anthropic — all via Anthropic-compatible endpoints, no proxying)
- **Slug:** claudex
- **Category:** Claude Code ecosystem
- **Status:** STUDY
- **Target Phase:** ref only (model-routing pattern reference — tracker verdict CONFIRMED this pass)
- **Owner (dept/tier):** Model-routing pattern reference (kernel/LiteLLM design)
- **Trigger Type:** ref
- **Source:** https://github.com/sasdsamatt123/claudex (CEO-provided URL, verified 2026-07-17) — MIT, 191★/25 forks, active; install = git clone + npm link (npm publish pending)
- **Pinned Version:** n/a (ref; no install)
- **Purpose (as studied):** Shell-alias profiles (`claude-zai` etc.) load per-profile credentials from `~/.claudex/profiles/<name>/.env` (mode 0600) and launch Claude Code against that provider. Pattern value for us: per-department credential isolation idiom; free-model catalog awareness (OpenRouter 32 free models, MiniMax trial to Nov 2026) feeds the D1 free-first worker-model conversation.
- **Official Docs URL:** https://github.com/sasdsamatt123/claudex (README)

## Key API / Usage Notes

- **Verdict: ref-only stands.** Our constitution already solves this better for runtime: LiteLLM proxy + virtual keys per department (no raw provider keys in agent configs — hard rule). claudex's client-side profile switching would bypass the proxy's budget/observability layer → forbidden for company runtime.
- Its ToS discipline is clean and quotable: explicit warning against subscription-sharing/rate-limit bypass — matches our freellmapi/9router exclusion line.
- Free-provider catalog (Z.ai, MiniMax trial, OpenRouter free tier) = candidate LiteLLM upstream entries for cheap worker lanes — evaluate inside LiteLLM, never beside it.

## Known Pitfalls

1. Any adoption outside LiteLLM breaks budget hard-stop + cost_ledger accounting — the reason this stays ref.
2. Small young project (191★): don't build dependencies on it; mine the pattern.

- **Install Command:** none (ref).
- **Legitimacy Verdict:** OK — MIT, transparent credential handling, explicit ToS-compliance stance; excluded from runtime by our proxy law.

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — R4.1 pass; verdict = ref-only)
- [ ] INSTALL (n/a — ref)
- [ ] ADOPT
- [ ] EMBED
