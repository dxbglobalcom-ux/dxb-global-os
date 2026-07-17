# Study Card: DeerFlow

> FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü item 23; D4 priority trio member).

- **Tool:** DeerFlow 2.0 — ByteDance open-source "super agent harness" for deep research (multi-agent, sandboxed, long-horizon)
- **Slug:** deerflow
- **Category:** Research
- **Status:** STUDY
- **Target Phase:** 10 (Revenue Engine deep-research capability, D4) — VPS placement decision at that wave
- **Owner (dept/tier):** Research dept / Strategy (opportunity-scan deep dives)
- **Trigger Type:** service (standalone; agents reach it as a department tool, never as OS orchestrator)
- **Source:** https://github.com/bytedance/deer-flow — MIT, 77.3k★, 10.5k forks, active (v2.0.0 released 2026-06-25, ground-up rewrite, no shared v1 code)
- **Pinned Version:** 2.0.0
- **Purpose:** Deep-research engine for opportunity scanning (REVENUE_ENGINE_SPEC G7): spawns parallel sub-agents with isolated context, sandbox execution (local/Docker), long-term memory, progressive skills, file workspace per thread, MCP support, IM channels (Telegram/Slack), scheduled tasks, TUI.
- **Official Docs URL:** https://github.com/bytedance/deer-flow (README + docs/)

## Key API / Usage Notes

- Requires Python 3.12+ and Node.js 22+; `make setup` wizard or `make docker-start`.
- Model-agnostic; wants long-context (100k+) tool-use models. **DXB rule: point it at the LiteLLM proxy with a department virtual key — never raw provider keys** (stack hard rule).
- Search provider optional (Tavily recommended; can run without) — free-first D1: start without paid search, add only post-profit.

## Known Pitfalls

1. **⛔ Boundary — orchestration:** DeerFlow is LangGraph-based. Our stack forbids LangChain-class frameworks as OS orchestration. DeerFlow enters ONLY as a department research TOOL (like open-notebook service), never as the company brain. Any wider role = CEO decision.
2. **RAM:** minimum 4 vCPU/8GB — our Hetzner VPS is 8GB total with Supabase+dashboard+scheduler resident. Placement needs a measured RAM budget pass (STACK.md Stack Patterns) — likely needs the VPS upgrade the revenue engine funds, or strict on-demand start/stop like the Speaches idiom.
3. **Security:** no built-in auth — must stay bound to localhost/trusted network; never exposed publicly (gateway default GATEWAY_WORKERS=1).
4. v2.0 is young (weeks old at study time); MVP gaps (e.g. no conversation-initiated schedules). Pin 2.0.0, re-evaluate at INSTALL.

- **Install Command:** (deferred to ADOPT wave) `git clone https://github.com/bytedance/deer-flow && cd deer-flow && make docker-start` with LiteLLM base-url + virtual key in config; RAM measured before and after.
- **Legitimacy Verdict:** OK — MIT, ByteDance-backed, huge community. Free-first compliant (self-hosted, works with our proxied models; paid search providers optional and gated by D1).

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — R4.1 pass)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
