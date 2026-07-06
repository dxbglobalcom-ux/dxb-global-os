# Study Card: @anthropic-ai/claude-agent-sdk

- **Tool:** Claude Agent SDK (TypeScript)
- **Slug:** claude-agent-sdk
- **Category:** Locked stack (runtime lib) — orchestration runtime
- **Status:** STUDY
- **Target Phase:** 3 (card owed before Phase 3 per success criterion 3 — foundational to all backend packages; primary consumer is Phase 5 kernel/orchestrator)
- **Owner (dept/tier):** Kernel / Orchestrator
- **Trigger Type:** lib
- **Source:** npm registry (`@anthropic-ai/claude-agent-sdk`); github.com/anthropics/claude-agent-sdk-typescript
- **Pinned Version:** 0.3.201 (npm-verified 2026-07-06; pre-1.0 — pin EXACT, review changelog on every bump)
- **Purpose:** Kernel/orchestrator run as Agent SDK programs: tool loop, subagents with isolated context, sessions, hooks, first-class MCP client. Headless mode for queue-worker and scheduled jobs. Anthropic's orchestrator-worker pattern maps 1:1 onto Kernel → Heads → Specialists.
- **Official Docs URL:** https://code.claude.com/docs/en/agent-sdk/overview

## Key API / Usage Notes (current API — 02-RESEARCH "State of the Art")
- Multi-turn: `query()` with `AsyncIterable<SDKUserMessage>`; session continuation via `options.resume`. The v2 session API (`unstable_v2_createSession` etc.) was REMOVED — any sample using it is stale.
- Task tracking: use the `TaskCreate`/`TaskUpdate`/`TaskGet`/`TaskList` tool family — `TodoWrite` is deprecated (since 0.2.13).
- MCP servers connect **non-blocking by default** (session starts while server status is "pending"). For kernel/queue-worker invocations that need an MCP server ready before the first tool call: set `alwaysLoad: true` on that server or `MCP_CONNECTION_NONBLOCKING=0` — otherwise the worker's first tool call can race the connection.
- Subscription-auth constraint: SDK on a 24/7 VPS bills per-token via API — locked decision keeps Hermes on GLM 5.2/OpenRouter; `claude -p` short schema-based jobs only on the laptop (counted as subscription, never free capacity).

## Known Pitfalls
- **02-RESEARCH Pitfall 4 (API drift):** pre-1.0, fast-moving. Phase 5 plans must re-check the live CHANGELOG at that phase's research step before writing kernel code; never copy remembered/older API shapes.

## Install Command (recorded — NOT run in Phase 2)
```bash
pnpm add @anthropic-ai/claude-agent-sdk@0.3.201 --filter @dxb/kernel --filter @dxb/orchestrator
```

- **Legitimacy Verdict:** OK — official Anthropic org package

## Lifecycle Checklist
- [x] STUDY
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
