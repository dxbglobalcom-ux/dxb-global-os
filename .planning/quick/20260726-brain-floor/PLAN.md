# TICKET 20260726-brain-floor — the employee brain becomes a real floor

> Execution ticket. Zero new design: the contract lives in `MODEL_ROUTING_SPEC` §4b (step-0, never implemented) and the new §4f written as part of this ticket as a registered adaptation. Roadmap row: `00-NOTE-FACTORY-COMPLETION-ROADMAP-2026-07-26` W1 §1.2.

**CEO decision (2026-07-26, chat):** offered A (make the column honest — "task-based") vs B (make the column actually work as a floor); CEO chose **B**.

## Measured starting state (this session)

| Fact | Evidence |
|---|---|
| `fn_select_model` never reads `agents.brain` | `select prosrc like '%brain%'` → `does NOT read brain` |
| No TypeScript router reads `agents.brain` | `grep -rn "\.brain\b" packages/ --include=*.ts` (non-test, non-dist) → 0 hits |
| The executor resolves by tier alone | `packages/orchestrator/src/worker-shim.ts:153` `rules.find(r => r.model_tier === task.model_tier)` |
| Every tier is single-model after U21 | L1 `fable-5` ×25, L2/L3/L4 `sonnet-5` |
| `quality_score` cannot rank the roster | NULL on both `fable-5` and `claude-sonnet-5`; only `deepseek-v4-pro` has 100 |
| Tasks carry the agent | `tasks.agent_id uuid` |
| The executor already loads the agent row | worker-shim reads `slug, department` for the tool profile |

## The rule this ticket implements

**The brain is a floor, never a ceiling.** An agent's assigned model sets the MINIMUM quality its work runs at; the task class sets the requirement. The better of the two wins, so:

- director (brain = Opus 5) picks up an L3 gathering task → runs **Opus 5** (floor raises it)
- specialist (brain = Sonnet) picks up an L1 outbound-content task → runs **Opus 5** (the class wins; a floor can never lower)
- specialist (brain = Sonnet) picks up an L3 task → runs Sonnet (unchanged)

Rank is by tier, not by a score column: `L1 < L2 < L3 < L4`, lower is better. `model_catalog.tier_floor` states the best tier a model may serve; it is the single place the ordering lives.

Guardrails are absolute on both lanes and cannot be bypassed by a floor: `banned` models are never selected, `mechanical_only` models never serve a verdict-capable role, and the budget hard-stop still cuts everything non-critical.

## Files

- Create: `db/migrations/20260726002000_brain_floor.sql` — `model_catalog.tier_floor`, `fn_tier_rank(text)`, `fn_select_model` gains `p_agent_id` (§4b step-0 + floor)
- Modify: `packages/orchestrator/src/worker-shim.ts` — effective tier resolution
- Modify: `HOLDING-OS-MASTER-PLAN/MODEL_ROUTING_SPEC.md` — new §4f
- Modify: `HOLDING-OS-MASTER-PLAN/00-INDEX.md` — U21 addendum
- Modify: `apps/dashboard/src/app/(command)/org/employees/page.tsx` + dictionaries — the column says what it means
- Test: `tests/c9/brain-floor.test.ts`

## Evidence contract (nothing is "done" without these)

1. A director-brained agent's L3 task resolves to the L1 model — proven from a real `runWorkerOnce` execution record, not from reading code.
2. A Sonnet-brained agent's L1 task still resolves to the L1 model.
3. A `banned` model can never be reached through the floor.
4. `fn_select_model` honours a `ceo_override` brain and still refuses banned/mechanical_only.
5. Full vitest green, `tsc -b` clean, i18n purity PASS, RULE #0 battery on `/org/employees` EN+TR × 1280/1920.
