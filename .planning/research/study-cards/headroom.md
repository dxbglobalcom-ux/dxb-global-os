# Study Card: headroom

> Retroactive backfill (Pitfall 5) completed 2026-07-08 (06-01 Task 1): activation state + MEM-04 scope boundary recorded.

- **Tool:** headroom (token-compression layer for LLM sessions)
- **Slug:** headroom
- **Category:** Claude Code ecosystem
- **Status:** EXCLUDED (disabled 2026-08-30 — see "Disabled" below)
- **Target Phase:** 6 (MEM-04 boundary defined here; OS-level mechanism lands 06-07)
- **Owner (dept/tier):** Token-compression before worker LLMs
- **Trigger Type:** hook / proxy
- **Source:** github.com/headroomlabs-ai/headroom (Rust workspace: crates/ + skills/), installed via plugin marketplace `headroom-marketplace`
- **Pinned Version:** marketplace-managed plugin at runtime (`~/.claude/plugins/marketplaces/headroom-marketplace`); no separate pin — plugin updates ride the marketplace channel
- **Purpose:** CEO token-discipline constraint's session-layer half: compresses interactive Claude Code harness sessions (prompt/context compression) so orchestrator-side token burn stays low without quality loss.
- **Official Docs URL:** headroom-marketplace README (plugin repo)

## Disabled 2026-08-30 (CEO's rule applied)

The CEO's rule of 2026-08-27, in his own correction of 2026-08-30: *"eklentiler açılsın, lakin
kancalar kapansın… claude mem ve context7 zaten kancalarıyla çalışıyor bunlara ok vermiştim.
diğerleri de kancasız açık olabilir."* Measured the same day with `claude plugin details`:
headroom carries **0 skills, 0 agents, 0 MCP servers and 2 hooks — nothing else**. Silencing its
hooks therefore leaves an empty plugin, and this CLI version (2.1.251) has no per-plugin hook
switch: `claude plugin` offers only enable/disable, and `disableAllHooks` would silence the
holding's own hooks as well. It was disabled outright and **no capability was lost**.

Symptom that surfaced it: the PreToolUse hook ran `headroom init hook ensure` before every Bash
call while the `headroom` binary was never installed — `/bin/sh: 1: headroom: not found` on every
command from 2026-08-27 (the blanket plugin-enable) until 2026-08-30.

## Activation state (verified 2026-07-08 — HISTORY, superseded by the section above)
- Enabled: `~/.claude/settings.json` → `"headroom@headroom-marketplace": true` (line ~186); marketplace source `repo: headroomlabs-ai/headroom`.
- Scope: THIS harness's sessions. It does not sit inside the DXB LiteLLM chain and no Phase-6 code depends on it.

## MEM-04 scope boundary (explicit, per plan)
**What headroom covers:** harness session compression — the human-facing Claude Code sessions (CEO terminal work).
**What headroom does NOT cover:** the OS-level context budget for kernel workers (task context assembly, band enforcement, summarize-and-offload). That mechanism is `packages/kernel` `context-budget.ts` built in 06-07 — headroom is not a dependency of it and cannot substitute for it (workers run via SDK/LiteLLM, not through the harness).

## Known Pitfalls
- Compression of prompts carrying schemas/contracts can break structured outputs — schema-bearing calls must stay exempt; quality-never-drops rule audits compressed vs uncompressed on golden tasks before any deeper wiring.
- Do not double-compress: if a future phase evaluates headroom inside the LiteLLM chain, session-layer + chain-layer compression stacking must be measured first (quality gate), not assumed.

- **Install Command:** already installed (plugin marketplace); no Phase-6 install action
- **Legitimacy Verdict:** OK — installed, enabled, in live use on this machine; wiring INTO the DXB LLM chain remains out of scope (would need its own study pass + quality gate)

## Lifecycle Checklist
- [x] STUDY (backfilled 2026-07-06; scope boundary completed 2026-07-08)
- [x] INSTALL (plugin enabled — settings.json evidence above)
- [x] ADOPT (2026-07-08 — adopted AS session-layer only; MEM-04 OS mechanism is separate, 06-07)
- [ ] EMBED (n/a for OS runtime — session-side tool; EMBED intentionally not targeted, boundary documented)
