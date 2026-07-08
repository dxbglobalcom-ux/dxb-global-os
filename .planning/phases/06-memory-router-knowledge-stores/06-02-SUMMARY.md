---
phase: 06-memory-router-knowledge-stores
plan: 02
status: complete
completed: 2026-07-08
duration: ~30min + crash-recovery verification
tasks_completed: 3/3
commits:
  - "(this commit) feat(06-02): routing-quality spike PASS 20/20 — composition CONFIRMED"
---

# 06-02 SUMMARY — Routing-quality spike (LOW-confidence composition gate)

**Executed inline by Fable 5 (governance v5 — no subagent).** Session crashed after the gate run, before closure; recovery session re-verified every artifact live and re-ran the gate before writing this.

## SCORE

**20/20** (gate ≥16/20) — `SCORE=20/20`, exit 0. Two independent full runs (original tee'd log + recovery re-run 2026-07-08 23:14), byte-identical per-question output.

## What closed

Master PHASE-06 step 2: the composition rated LOW confidence at roadmap time (Blocker entry) is now a **measured fact**. The production classifier design — kind heuristics + cheap model from `routing_rules` row `memory.classify` (glm-5.2, api, low; NO model literal in code, NO Fable/Opus on the read path, LOCKED) — routes all 20 hand-labeled known-fact questions to the correct store.

## Misroute table

| Store pair | Misroutes |
|---|---|
| pgvector ↔ graphify (fact vs relation) | 0 |
| obsidian ↔ notebook (artifact vs procedure) | 0 |
| any other pair | 0 |
| PARSE_FAIL / CALL_FAIL | 0 |

## VERDICT

**PASS — composition CONFIRMED.** All four stores (pgvector, graphify, obsidian, open-notebook) stay in scope; MEM-03 unchanged; no §5 fallback, no ROADMAP flag. 06-03..06-08 unlocked as planned. Full report: `.planning/master-plan/spikes/06-routing.md` (prompt hash `2eeccfde…`, per-question table). Fable read the report personally and records this verdict (checkpoint, autonomous:false).

## Decisive evidence (executed)

- ✓ Routing row live: SQL count = `1` (enabled memory.classify → glm-5.2)
- ✓ Fixture valid: `FIXTURE_OK {"pgvector":5,"graphify":5,"obsidian":5,"notebook":5}` (20 entries, ≥4 per store)
- ✓ No hardcoded model: `grep glm routing-spike.mjs` → comment-only, 0 code matches
- ✓ Gate: recovery re-run `SCORE=20/20`, exit 0 (live, 2026-07-08 23:14)

## Deviations

1. **[CRASH-RECOVERY]** VS Code/session died between the gate run and closure. Nothing lost: all Task 1–2 artifacts were on disk; recovery re-verified DB row + fixture + re-ran the gate live (identical 20/20) before authoring report/SUMMARY. No content deviation from plan.
2. **[ENV NOTE — affects local runs]** Root `.env` does not carry `DXB_DATABASE_URL`; runner needs it passed explicitly (`DXB_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres node --env-file=.env tests/phase6/routing-spike.mjs`). Local-dev URL is public-knowledge default (db/README.md), not a secret.

## Downstream contracts armed

- `CLASSIFY_SYSTEM_PROMPT` (hash `2eeccfde…`) lifts VERBATIM into `classify-read.ts` at **06-05**
- `known-facts.json` reused verbatim by **06-08** battery (edits must diff against this commit — T-06-04)
- Spike PASS = **06-06** wires the full four-store adapter scope
