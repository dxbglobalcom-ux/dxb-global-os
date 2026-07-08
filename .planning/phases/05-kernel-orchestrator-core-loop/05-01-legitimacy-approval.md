# Plan 05-01 — Supply-Chain Approval Record (Phase-5 toolset)

- **Decision:** **approved** (single blocking checkpoint)
- **Reviewer:** CEO (human decision via interactive checkpoint; evidence gathered and presented by Fable 5 inline — governance v5, no subagent)
- **Date:** 2026-07-08
- **Scope:** `@anthropic-ai/claude-agent-sdk@0.3.201` npm install into `packages/kernel` + `packages/orchestrator` ONLY (not shared, not dxb-mcp, not dxb-cli).

## Live npm registry evidence (fetched 2026-07-08, presented inline at checkpoint)

| Package | Pinned | Live latest | Weekly downloads | Maintainers | Spelling check |
|---|---|---|---|---|---|
| @anthropic-ai/claude-agent-sdk | **0.3.201** (exact, no caret) | 0.3.204 (published 2026-07-08) | 6,759,557 (2026-06-29 → 2026-07-05) | 13, ALL @anthropic.com (official Anthropic org) | exact |

- **Pin decision at checkpoint:** CEO approved keeping master-plan pin **0.3.201** — the "bump to 0.3.204" option was offered and NOT taken. Divergence (newer live version) recorded in the study card; any future bump is a recorded adaptation with CEO visibility.
- Install mechanics: pnpm catalog entry (exact version), dependency `catalog:` in the two owner packages only.
- Build scripts: none expected; **allowBuilds deny-default stands** (esbuild precedent 02-03). Any NEW build-script request during install halts execution for a fresh CEO decision.

## Chain

Study card upgraded to FULL with install-day live verification BEFORE this approval (commit 17c8f3c). Install (Task 3) runs only after this record is committed. T-05-SC mitigation (study card + blocking checkpoint + exact pin + allowBuilds deny-default) executed as specified; T-05-01 (dependency sprawl) mitigated by two-owner-only scope with resolution-scope verification in Task 3.
