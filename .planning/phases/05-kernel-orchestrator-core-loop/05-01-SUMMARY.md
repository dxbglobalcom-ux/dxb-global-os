---
phase: 05-kernel-orchestrator-core-loop
plan: 01
status: complete
completed: 2026-07-08
duration: ~10min
tasks_completed: 3/3
commits:
  - 17c8f3c docs(05-01) study card FULL
  - "(approval record commit) docs(05-01) CEO approval"
  - 9945c9b feat(05-01) pinned install + tracker flip
---

# 05-01 SUMMARY — Agent SDK study→approval→install gate

**Executed inline by Fable 5 (governance v5 — no subagent).**

## What closed

Master-plan PHASE-05 §4 step 1: `@anthropic-ai/claude-agent-sdk` studied-then-installed at its two owners with CEO supply-chain gate between study and install. Commit order proves discipline: card (17c8f3c) → approval record → install (9945c9b).

## Decisive evidence (executed)

- ✓ Study card FULL + install-day live verification: `grep '0.3.201' + 'verified.*2026'` → `TASK1 VERIFY PASS`. Live npm 2026-07-08: latest **0.3.204**, 13 maintainers all @anthropic.com, 6,759,557 weekly downloads. **Pin stays 0.3.201** (master-plan wins; CEO offered bump option, declined).
- ✓ CEO checkpoint: interactive blocking question → **"Approved"**; record `05-01-legitimacy-approval.md`; `grep -qi 'Decision.*approved'` → `TASK2 VERIFY PASS`.
- ✓ Install scope: `pnpm -r ls @anthropic-ai/claude-agent-sdk` → `@dxb/kernel … 0.3.201` + `@dxb/orchestrator … 0.3.201`, NO other packages (T-05-01 mitigated).
- ✓ No build-script prompts during `pnpm install` (allowBuilds deny-default held; T-05-SC mitigated); `Done in 22.9s`, lockfile supply-chain policy pass.
- ✓ `pnpm build` exit 0; `pnpm test` → `Tests 45 passed | 3 skipped (48)` (baseline held).
- ✓ Tracker validator: `tracker OK: 58 data rows … 54 study cards` exit 0; row 58 STUDY→INSTALL.

## Deviations

None. (Live-latest 0.3.204 divergence is recorded-by-design in card + approval record, pin unchanged.)
