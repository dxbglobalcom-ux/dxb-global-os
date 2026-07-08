---
phase: 05-kernel-orchestrator-core-loop
plan: 04
status: complete
commits: [01870af, d488562]
---

# 05-04 SUMMARY — Persona v2 first batch (product) + registry flip

## What shipped

1. **5 Fable-authored v2 personas** at `personas/product/` (commit `01870af`) —
   product-manager (head), product-trend-researcher, product-feedback-synthesizer,
   product-sprint-prioritizer, product-behavioral-nudge-engine. Each file:
   frontmatter `name/slug/department/role/persona_version: v2.0-fable/model_tier_default`
   + mission, binding envelope contract (TaskEnvelope-objective-only input,
   output_contract-only output, confidence 0–1 self-report, <0.6 low-confidence
   declaration, ORCH-04 queue-only coordination, budget rules, outward=draft-only),
   department-specific craft (listing structure, evidence tiers, synthesis counting
   standards, RICE-with-labeled-inputs, nudge ethics line), and escalation posture.
2. **`db/seed/apply-persona-v2.ts`** (commit `d488562`) — reset-survivable registry
   flip: scans `personas/*/` for `persona_version: v2.0-fable`, UPDATEs matching
   `agents` row (slug+department) guarded by `IS DISTINCT FROM`; never INSERTs
   (missing-in-registry reported, exit 2 — T-05-09). Seed order documented in
   `db/README.md`: import-personas → apply-persona-v2 → import-routing-rules.

## Fable authorship note

⛔ FABLE-ONLY honored: all 5 persona texts authored inline by Fable in this session —
no subagent, no delegated executor (CEO directive 2026-07-08: inline, subagent yok).

## Evidence (✓ VERIFIED — executed)

**Task 1 gate:**
```
$ test "$(ls personas/product/*.md | wc -l)" -eq 5 && grep -l "persona_version: v2.0-fable" personas/product/*.md | wc -l | grep -qx 5 && git diff --quiet -- agency-agents/
TASK1 VERIFY PASS
```
`confidence` present in all 5 bodies (grep -c: 7/3/3/8/3); frontmatter keys
name/slug/department/role/persona_version present in all 5; agency-agents/ diff-clean.

**Task 2 gate — first run, idempotent re-run, registry proof:**
```
v2 applied: 5 updated / 5 files; missing-in-registry: []
v2 applied: 0 updated / 5 files; missing-in-registry: []      # second run
product-behavioral-nudge-engine|worker|v2.0-fable|personas/product/product-behavioral-nudge-engine.md
product-feedback-synthesizer|worker|v2.0-fable|personas/product/product-feedback-synthesizer.md
product-manager|head|v2.0-fable|personas/product/product-manager.md
product-sprint-prioritizer|worker|v2.0-fable|personas/product/product-sprint-prioritizer.md
product-trend-researcher|worker|v2.0-fable|personas/product/product-trend-researcher.md
148   # v1.0-legacy rows untouched (153 − 5)
5     # product rows v2.0-fable
```

**Reset-survivability — full live round-trip executed:**
```
$ ./node_modules/.bin/supabase db reset        → "Finished supabase db reset on branch master."
$ node --experimental-strip-types db/seed/import-personas.ts
classified personas: 153 across 11 departments / inserted: 153 agents, 11 departments
$ node --experimental-strip-types db/seed/apply-persona-v2.ts
v2 applied: 5 updated / 5 files; missing-in-registry: []
$ node --experimental-strip-types db/seed/import-routing-rules.ts
routing rules: inserted 19 / total 19
post-reset: 5× product v2.0-fable | 153 agents | 148 legacy | 19 routing_rules
```

**Post-reset regression suite:** see test run appended below (LiteLLM prisma schema
recreated via container restart after reset — known reset side-effect from 05-02).

## Deviations (recorded, CEO-visible)

- **ADAPT-5 — role sync added to apply-persona-v2.ts.** Plan Task 2 specified
  UPDATE of `persona_path` + `persona_version` only; the script also syncs `role`
  from v2 frontmatter (product-manager: worker → head). Reason: legacy frontmatter
  carried no role field so all 153 rows were born `worker`; the escalation ladder
  (rung 3 head review, PHASE-05 §escalation) requires a head row per department.
  Disk-truth = registry-truth principle extended to role. LOCKED schema untouched
  (role CHECK constraint already allows head/specialist/worker).
- **psql evidence via `docker exec supabase_db_... psql`** — host has no psql
  binary; identical queries, same DB, evidence equivalent.

## Test suite (post-reset)

```
$ pnpm test
Test Files  13 passed (13)
     Tests  50 passed | 8 skipped (58)
```
Zero regression after the reset round-trip (LiteLLM litellm-schema tables: 65,
recreated by container restart — same recovery as 05-02).

## Key links honored

- Every `agents.persona_path` for product points at an existing file (script
  asserts existsSync pre-UPDATE; post-reset query confirms paths).
- `persona_version='v2.0-fable'` rows are exactly what 05-09's `slice-10of10.sh`
  precondition will check; seed order dependency documented in db/README.md.
