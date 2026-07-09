# Study Card: MCP Gateway Patterns (docker/mcp-gateway · IBM ContextForge · Lasso mcp-gateway)

> MANDATORY study pass — master plan PHASE-07 step 1, executed 2026-07-09 AT PLANNING TIME (CEO directive: "planlama gateway study pass ile BAŞLAR"; STATE Phase-7 blocker). This is a PATTERN study, not a tool adoption: the deliverable is the v1-approach verdict below.

- **Tool:** three gateway candidates studied as pattern references for DXB per-department MCP scoping
- **Slug:** mcp-gateway-patterns
- **Category:** MCP infrastructure
- **Status:** STUDY (terminal for this card — `ref` trigger, no install; adoption decisions recorded per candidate below)
- **Target Phase:** 7 (MCP Gateway & 24/7 VPS Runtime)
- **Owner (dept/tier):** Gateway / least-privilege enforcement
- **Trigger Type:** ref
- **Source:** github.com/docker/mcp-gateway · github.com/IBM/mcp-context-forge · github.com/lasso-security/mcp-gateway (all surveyed live 2026-07-09)
- **Purpose:** answer the least-commoditized question in the stack: does any existing OSS gateway deliver per-DEPARTMENT `tools/list` filtering keyed to OUR registry, within the 8GB VPS envelope — or does v1 stay the registry-generated `.mcp.json` profile approach (ARCHITECTURE Pattern 4)?

## Candidate findings (verified 2026-07-09)

### 1. docker/mcp-gateway — Go, MIT, 1.5k★, 70 releases, active
- Runs WITHOUT Docker Desktop on plain daemon (`DOCKER_MCP_IN_CONTAINER=1` bypass documented) — Linux VPS viable.
- Tool filtering is **per-profile** with dot notation `<server>.<tool>` enable/disable; a client picks a profile at connect. No per-client identity filtering inside one instance — selecting a profile at session spawn is equivalent in mechanism to selecting a generated `.mcp.json`.
- Security: container isolation per server, secrets via Docker plumbing, OAuth flows; image **signature verification** claimed on Docker's blog, NOT confirmed in README. Interceptors (before/after tool-call middleware) exist per third-party writeups (dasroot.net Jan 2026), thinly documented upstream.
- **No tool-description change detection / rug-pull protection documented.** MCP-03 stays custom regardless.
- Transports: stdio + streaming HTTP (`--transport streaming`).

### 2. IBM ContextForge (mcp-context-forge) — Python 3.11+, Apache-2.0, 4.1k★, v1.0.5 (2026-07-07)
- Richest feature set: **virtual servers** compose arbitrary tool subsets (`associated_tools`) — conceptually validates our per-dept subset model.
- BUT scoping keys to **its own RBAC users/teams** (bootstrap admin, SSO federation), not an external registry — adopting it means a second identity system beside our departments/agents tables.
- Deployment weight: Python + Postgres + **Redis** (Redis is a hard NO in this stack) + replicas/nginx in reference deploys. On the shared 8GB VPS beside Supabase: not practical as-is (own docs offer no lightweight floor).
- No rug-pull / description-drift detection (prompt versioning only).

### 3. Lasso mcp-gateway — Python, MIT, 377★, v1.2.0 (2026-01-21)
- A **sanitization proxy**, not a scoping gateway: plugins for token masking (basic), PII (presidio), prompt-injection/harmful content (lasso SaaS plugin). Reads an `mcp.json`, proxies child servers.
- **No per-agent/per-department tool scoping. No rug-pull detection.**
- Value: guardrail-middleware pattern donor for the v2 proxy (request/response sanitize hook shape).

## VERDICT — v1 approach (⛔ FABLE decision zone, decided by Fable 5 inline 2026-07-09)

**v1 CONFIRMED — no change to the LOCKED decision.** Registry-generated per-department `.mcp.json` profiles (+ audit hook + custom `tool_pins` quarantine) stand, because the study shows all three products fail at least one hard constraint:

| Constraint | docker/mcp-gateway | ContextForge | Lasso |
|---|---|---|---|
| Scoping keyed to OUR registry (departments/agents) | ✗ (own profiles/catalog) | ✗ (own RBAC) | ✗ (none) |
| Tool-description hash pin + quarantine (MCP-03) | ✗ | ✗ | ✗ |
| Fits 8GB beside Supabase, no banned deps | ✓ (Go, light) | ✗ (needs Redis — banned) | ✓ (light) |
| `tools/list` filtered BEFORE discovery | ✓ (profile) | ✓ (virtual server) | ✗ |

The generated-profile approach achieves filter-before-discovery **statically and absolutely**: a denied server is never even loaded into the session, so there is no proxy process to crash, bypass, or budget for. MCP-03 (hash pinning) is custom in every scenario — `tool_pins` table + pin-check cron per master spec.

**Patterns adopted into DXB design (steal, don't install):**
- Profile dot-notation granularity (`<server>.<tool>`) → our generator emits per-tool allowlists where a server is partially allowed, not just server-level on/off.
- ContextForge virtual-server composition → validates dept-profile-as-composition; our composition source is the registry + `policy/denials.json`.
- Lasso guardrail middleware shape + docker interceptors → v2 proxy middleware contract (sanitize/audit hooks around tool calls).

**v2 (deferred, master: "proxy süreci v2"):** own TS proxy on `@modelcontextprotocol/sdk` Streamable HTTP (STACK.md recommendation — "expect to own this code"), optionally fronting docker/mcp-gateway for container isolation of third-party servers. Revisit trigger: first true multi-tenant/remote-agent need or first incident a static profile cannot contain.

## Known Pitfalls
- docker/mcp-gateway blog-vs-README feature drift (signature verify, interceptors) — re-verify against the pinned release if v2 adopts it; do not trust marketing surface (Pitfall: "no guessing").
- ContextForge pulls Redis into any deployment — banned dep; never "just try" it on the VPS.
- Static profiles are read at session spawn: a registry/policy change requires profile regeneration + session restart to take effect. The generator must therefore run in CI/cron and profiles must carry a `generated_at` + source-hash header so staleness is detectable (07-03 spec).
- Quarantined tools must be excluded at GENERATION time (profiles) AND flagged at runtime (audit) — a pin flip between regenerations is caught by the pin-check cron, not by the profile.

- **Install Command:** none (pattern study; no product installed)
- **Legitimacy Verdict:** all three are legitimate, active OSS (MIT/MIT/Apache-2.0); none adopted for v1

## Lifecycle Checklist
- [x] STUDY (2026-07-09 — this card; master PHASE-07 step 1 executed at planning)
- [ ] INSTALL — N/A (no adoption; v2 revisit would open a new card for the chosen proxy)
- [ ] ADOPT — N/A v1
- [ ] EMBED — N/A v1
