# Study Card: @anthropic-ai/claude-agent-sdk

- **Tool:** Claude Agent SDK (TypeScript)
- **Slug:** claude-agent-sdk
- **Category:** Locked stack (runtime lib) — orchestration runtime
- **Status:** FULL
- **Target Phase:** 5 (install owner phase — kernel/orchestrator; card first owed Phase 3 per success criterion 3)
- **Owner (dept/tier):** Kernel / Orchestrator
- **Trigger Type:** lib
- **Source:** npm registry (`@anthropic-ai/claude-agent-sdk`); github.com/anthropics/claude-agent-sdk-typescript
- **Pinned Version:** 0.3.201 (pre-1.0 — pin EXACT, review changelog on every bump)
- **Purpose:** Kernel/orchestrator run as Agent SDK programs: tool loop, subagents with isolated context, sessions, hooks, first-class MCP client. Headless mode for queue-worker and scheduled jobs. Anthropic's orchestrator-worker pattern maps 1:1 onto Kernel → Heads → Specialists.
- **Official Docs URL:** https://code.claude.com/docs/en/agent-sdk/overview

## Install-Day Live Verification (2026-07-08)

Registry-verified 2026-07-08 (install day, Phase 5 plan 05-01) — fetched live from registry.npmjs.org + api.npmjs.org:

- **Live latest:** `0.3.204` (dist-tags latest = next = 0.3.204; registry modified 2026-07-08T00:27:12Z)
- **Pin decision:** master-plan PHASE-05 §4 step 1 pin **0.3.201 STAYS** — newer 0.3.204 exists on npm; bumping is a recorded adaptation requiring CEO visibility, not a silent upgrade. Divergence recorded here per plan 05-01 Task 1.
- **Publisher legitimacy:** 13 maintainers, ALL `@anthropic.com` addresses (zak-anthropic, dylanc-anthropic, benjmann, wolffiex, felixrieseberg-anthropic, …) — official Anthropic org package.
- **Weekly downloads:** 6,759,557 (2026-06-29 → 2026-07-05) — top-tier ecosystem adoption, typosquat risk nil at this exact spelling.
- **Exact spelling:** `@anthropic-ai/claude-agent-sdk` (scope `@anthropic-ai`, no variants).
- **engines:** node `>=18.0.0` per package.json; STACK.md rule stricter — Node ≥ 20, use 22 LTS (repo runs Node 22).

## Key API / Usage Notes (current API — 02-RESEARCH "State of the Art")

- **Usage mode for DXB kernel/orchestrator:** headless `query()` programs — kernel `classify()` and orchestrator `decompose()`/`qa()` are single-shot schema-forced calls, not interactive sessions. Multi-turn: `query()` with `AsyncIterable<SDKUserMessage>`; session continuation via `options.resume`. The v2 session API (`unstable_v2_createSession` etc.) was REMOVED — any sample using it is stale.
- Task tracking: use the `TaskCreate`/`TaskUpdate`/`TaskGet`/`TaskList` tool family — `TodoWrite` is deprecated (since 0.2.13).
- MCP servers connect **non-blocking by default** (session starts while server status is "pending"). For kernel/queue-worker invocations that need an MCP server ready before the first tool call: set `alwaysLoad: true` on that server or `MCP_CONNECTION_NONBLOCKING=0` — otherwise the worker's first tool call can race the connection.
- **Subscription-mode execution:** SDK on a 24/7 VPS bills per-token via API — locked decision keeps Hermes on GLM 5.2/OpenRouter; `claude -p` short schema-based jobs only on the laptop (counted as subscription, never free capacity). **No raw provider keys anywhere:** api-mode models go through LiteLLM proxy virtual keys only (hard rule); subscription-mode models use the local Claude Code auth, never an `ANTHROPIC_API_KEY` in agent config.

## Known Pitfalls

- **Pre-1.0 API churn (02-RESEARCH Pitfall 4):** fast-moving — 0.3.201 → 0.3.204 in days (observed live at install). Never copy remembered/older API shapes; re-check CHANGELOG on every bump. Pin is exact (no caret) in pnpm catalog.
- **Node floor:** package.json says node >=18 but STACK.md Version Compatibility row requires Node ≥ 20 (use 22 LTS) — repo standard wins.
- Dependency scope: kernel + orchestrator ONLY (not shared/dxb-mcp/dxb-cli) — sprawl is a tracked threat (T-05-01).

## Install Command (Phase 5, plan 05-01 Task 3 — after CEO checkpoint)

```bash
# catalog entry in pnpm-workspace.yaml: "@anthropic-ai/claude-agent-sdk": 0.3.201
pnpm add @anthropic-ai/claude-agent-sdk@catalog: --filter @dxb/kernel --filter @dxb/orchestrator
```

- **Legitimacy Verdict:** OK — official Anthropic org package (live evidence above, fetched 2026-07-08)

## Lifecycle Checklist
- [x] STUDY
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
