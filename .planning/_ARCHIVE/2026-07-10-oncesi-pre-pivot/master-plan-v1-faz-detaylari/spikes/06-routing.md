---
spike: 06-routing
phase: 06-memory-router-knowledge-stores
plan: 06-02
date: 2026-07-08
verdict: PASS
score: 20/20
gate: ">=16/20"
---

# Spike Report — 06-02 Routing-Quality Gate (master PHASE-06 step 2)

**Question this spike answers:** can the cheap read-path classifier route known-fact questions to the correct store across the full LOW-confidence composition (pgvector + graphify + obsidian + open-notebook) — BEFORE any router code is built?

## Setup (production design, exactly)

| Element | Value | Evidence |
|---|---|---|
| Routing row | `task_class=memory.classify` → L4 `glm-5.2`, mode=api, effort=low, priority=10 | DB live: `SELECT count(*) ... WHERE task_class='memory.classify' AND model='glm-5.2' AND enabled=true` → `1` |
| Model source | `routing_rules` lookup at runtime — **no model literal in the runner** | `grep glm tests/phase6/routing-spike.mjs` → 0 code matches (comment-only) |
| Call path | `llmCall` via department `os` (`DXB_LITELLM_KEY_OS`), maxTokens=400 (glm-5.2 reasoning-token pitfall, 06-01 card) | runner source |
| Parse contract | strict JSON `{"store","kind"}`; parse failure = MISS, never a crash (T-06-06) | `strictParse()` in runner |
| Fixture | 20 questions, hand-labeled, 5 per store | `FIXTURE_OK {"pgvector":5,"graphify":5,"obsidian":5,"notebook":5}` |
| Prompt version | `sha256:2eeccfde17360711e46a0c6c96ba181b1c6bc852fb69e9500159eb5a8cda7290` (content of the `CLASSIFY_SYSTEM_PROMPT` template literal in routing-spike.mjs) | computed 2026-07-08 |

The prompt block is written ONCE in `tests/phase6/routing-spike.mjs` and is lifted VERBATIM into `packages/memory-router/src/classify-read.ts` at 06-05. The fixture is reused verbatim by the 06-08 known-fact battery (T-06-04: any later fixture edit must diff against this commit).

## Per-question results

| Q | kind | question (short) | want | got | |
|---|---|---|---|---|---|
| 1 | fact | LiteLLM proxy port | pgvector | pgvector | OK |
| 2 | fact | monthly budget ceiling | pgvector | pgvector | OK |
| 3 | fact | pg-boss connection mode | pgvector | pgvector | OK |
| 4 | fact | embedding dimension pin | pgvector | pgvector | OK |
| 5 | fact | department count / active | pgvector | pgvector | OK |
| 6 | relation | pg-boss consumer package | graphify | graphify | OK |
| 7 | relation | intent→tasks kernel pipeline | graphify | graphify | OK |
| 8 | relation | approval gate position | graphify | graphify | OK |
| 9 | relation | cost enforcement mechanism | graphify | graphify | OK |
| 10 | relation | memory_embeddings FK link | graphify | graphify | OK |
| 11 | artifact | product persona v2 doc | obsidian | obsidian | OK |
| 12 | artifact | master architecture notes | obsidian | obsidian | OK |
| 13 | artifact | Phase 5 verification report | obsidian | obsidian | OK |
| 14 | artifact | STACK.md research doc | obsidian | obsidian | OK |
| 15 | artifact | integration tracker note | obsidian | obsidian | OK |
| 16 | procedure | Supabase VPS self-host steps | notebook | notebook | OK |
| 17 | procedure | mint department virtual key | notebook | notebook | OK |
| 18 | procedure | NotebookLM replacement conclusion | notebook | notebook | OK |
| 19 | procedure | credential rotation procedure | notebook | notebook | OK |
| 20 | procedure | hnsw tuning research | notebook | notebook | OK |

**SCORE=20/20** (gate ≥16/20) — exit 0.

## Misroute analysis

Zero misroutes. Store-pair confusion matrix is fully diagonal — no pgvector↔graphify (fact vs relation) and no obsidian↔notebook (artifact vs procedure) confusion, the two pairs flagged as likely failure modes at planning. No PARSE_FAIL, no CALL_FAIL: strict-JSON contract held on all 20 responses.

## Runs (Evidence-Before-Done, T-06-05)

| Run | When | Result | Log |
|---|---|---|---|
| 1 | 2026-07-08 ~23:05 (session crashed after run, before closure) | SCORE=20/20 | `tests/phase6/spike-run.log` (tee'd) |
| 2 — recovery re-run | 2026-07-08 23:14, fresh session | SCORE=20/20, exit 0 | scratchpad `spike-rerun.log`; per-question output byte-identical to run 1 |

Two independent full runs, identical results — score is reproduced, not claimed.

## VERDICT — PASS, composition CONFIRMED

All four routed stores stay in scope. MEM-03 proceeds unchanged: no §5 simplification (defer graphify / defer open-notebook) needed, no ROADMAP deviation flag. Phase continues to 06-03 as planned. Read by Fable 5 personally; verdict recorded per governance (checkpoint, autonomous:false).
