---
phase: 06-memory-router-knowledge-stores
plan: 08
status: complete
completed: 2026-07-09
duration: ~25min
tasks_completed: 3/3
commits:
  - "(this commit) feat(06-08): phase closed — compaction cron, battery 19/20 live, 06-VERIFICATION w/ FABLE verdict"
---

# 06-08 SUMMARY — compaction cron, known-fact battery, phase closure (master step 10)

**Executed inline by Fable 5 (governance v5 — checkpoint plan, autonomous:false; the ⛔ FABLE-ONLY closure verdict is written in-session).**

## What closed

- **`compaction.ts`** — rule 5's cron half: `compactExpired(db)` self-tombstones (`superseded_by = id`) every `expires_at < now()` row still live, ONE batch audit row (`memory_expired`, `{count, ids}`) in the same transaction, delete-free (DESIGN NOTE in code: schema has no status column, deletion forbidden — recall's `liveMemoryFilter` already excludes superseded rows, so retirement needs zero reader changes). Idempotent: marked rows never match again.
- **scheduler.ts** — two new pg-boss schedules beside the existing three routines (same boss instance, session-mode direct URL): `memory-compaction` daily 03:00, `claude-mem-sync` hourly. Error isolation = pg-boss per-job containment (a throwing handler fails that job, never the scheduler). outbox-executor now depends on @dxb/memory-router (no cycle).
- **`known-facts.test.ts`** — the battery (same 20 facts as the 06-02 spike, sha256-pinned) + the compaction tests.
- **06-VERIFICATION.md** — 4/4 ROADMAP criteria evidenced, one honest ⚠ (cron firing needs the 24/7 VPS), FABLE verdict: **Phase 6 PASSED**.
- **Tracker exits**: claude-mem/Obsidian-stack/Graphify/open-notebook → EMBED with citations; headroom note refreshed (MEM-04 landed at OS layer). ROADMAP Phase 6 + 8 plan checkboxes marked.

## Battery — per-question table (LIVE gate run, DXB_LIVE_SDK=1, real glm-5.2 classifier + real embeddings)

```
Q01 fact      -> pgvector HIT     Q11 artifact  -> obsidian HIT
Q02 fact      -> pgvector HIT     Q12 artifact  -> obsidian HIT
Q03 fact      -> pgvector HIT     Q13 artifact  -> obsidian HIT
Q04 fact      -> pgvector HIT     Q14 artifact  -> obsidian HIT
Q05 fact      -> pgvector HIT     Q15 artifact  -> obsidian HIT
Q06 relation  -> graphify HIT     Q16 procedure -> notebook HIT
Q07 relation  -> graphify HIT     Q17 procedure -> notebook HIT
Q08 relation  -> graphify HIT     Q18 procedure -> notebook HIT
Q09 relation  -> graphify MISS    Q19 procedure -> notebook HIT
Q10 relation  -> graphify HIT     Q20 procedure -> notebook HIT
BATTERY=19/20   (gate >=18/20 — PASS)
```

Q09 miss = live classifier misroute on the Cost-Monitor mechanism question (spike had it correct; within gate tolerance). Deterministic run (spike-recorded classifications as seam): `BATTERY=20/20`, `4 passed (4)`.

## Decisive evidence (executed)

- ✓ Fixture-drift guard (T-06-04): sha256 `ec5547ca…c37da` asserted in-test AND matches `git show 7ba3e46:tests/phase6/fixtures/known-facts.json | sha256sum`
- ✓ Battery verify line: `Test Files 1 passed` + `BATTERY=20/20` (det) / `BATTERY=19/20` (live, 69s)
- ✓ Compaction: `-t compaction` → `2 passed | 2 skipped` — marked + recall-excluded both trust modes + audited + row count unchanged + second run `{count: 0}` with no new audit row
- ✓ Schedules registered: `grep -n "memory-compaction\|claude-mem-sync" scheduler.ts` → QUEUES + CADENCES (`0 3 * * *`, `0 * * * *`) + `boss.schedule` lines
- ✓ `compactExpired` exported: `COMPACT_EXPORT_OK` on dist
- ✓ Full regression: **`23 passed (23)`, `106 passed | 14 skipped (120)`** (06-07: 22 files, 102|14)
- ✓ `updateGraphIncremental` FIRST RUNTIME (closes 06-06's ⚠): empty corpus → nonzero "Nothing to update"; corpus with one md note → `Re-extracting code files… [graphify watch] No code files found - nothing to rebuild` (nonzero). Probe note + probe-created `memory-store/relation/graphify-out/` removed; repo graph untouched (`git status graphify-out .planning/graphs` → clean)

## Deviations recorded (Fable, CEO-visible)

1. **Graph-ingest cron added then WITHDRAWN in-plan**: 06-06/STATE had armed a graph-ingest cadence; first live execution proved the bare CLI `update` subcommand is code-only — a nightly cron against the md relation corpus would fail every tick. Relation-note ingest stays at the phase-completion `/gsd-graphify build` cycle (existing repo rule). Card + adapter docs corrected with dated evidence; scheduler ships the plan's exact two schedules.
2. **Fixture hash pin source**: the spike report pinned the PROMPT hash, not a fixture hash; the battery's pin is derived from the spike-commit fixture content (`git show`, byte-identical today) — recorded in test header + 06-VERIFICATION.
3. **Compaction tests live inside known-facts.test.ts** (plan's own verify command dictates it: `-t compaction` over that file).
4. **`judgeContradiction` pacifier at battery commit** (house pattern since 06-05): retrieval quality is the measurand; rule-2 embed runs live in the gate run, the judge seam only prevents fixture cross-quarantine.
5. **Package-filter build scripts don't exist** (standing since 06-03): root `pnpm build` used.

## Phase 6 — CLOSED

06-VERIFICATION.md: 4/4 criteria ✓ VERIFIED, FABLE verdict PASSED. Commit chain `662ac19 → 7ba3e46 → 43d22a8 → 92cfec0 → 294e107 → f1047b7 → 9f3f441 → (this)`. Next: `/gsd-plan-phase 07` (gateway study pass first: docker/mcp-gateway, ContextForge, Lasso). Knowledge graph is >1 phase stale (built Jul 8 11:49, pre-execution) — `/gsd-graphify build` due per repo rule at CEO's go (LLM-backed, costed).
