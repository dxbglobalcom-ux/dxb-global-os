# E10.1 — Fable Hook engine: packages/hook (policy loader + pre/post gates + violation record)

**Execution ticket only — zero new design decisions.** Plan lives ONCE in `HOLDING-OS-MASTER-PLAN/` (CEO ruling 2026-07-13). Deviations become registered adaptations in FABLE_5_HOOK_SPEC, never invented here.

## Spec pointers (read THESE sections, nothing broader)

| Source | Section | Binding content |
|--------|---------|-----------------|
| `FABLE_5_HOOK_SPEC.md` | whole file (161 lines) | §2 17-standard mapping (normative), §3 architecture, §4 DDL (hook_policies/hook_violations), §5 components (İhlal akışı UI `/gov/violations` SIFIRDAN), §6 gate order + mechanical-audit principle, §7 escalation chain, §8-10 library API + policy cache 60s TTL + settings-Broadcast invalidation, §13 fn_hook_set_policy CEO-only + block→warn = high-risk change, §14-15 human-readable detail TR/EN, §16 security complement not gate, §17 FAIL-CLOSED + invalid_policy reject, §20 test plan (34-case base + evidence-less done → REVISE → ESCALATE + fail-closed), §21 acceptance (17 distinct standard_no seed; unverified done cannot pass), §22-23 flag `hook.enabled` gradual adoption, §24 verification commands, §26-27 (conflict → most restrictive + medium alert; CEO out-of-standard = warn+audit never block) |
| `AGENT_ORCHESTRATION_SPEC.md` | §3 lifecycle, §6 spawn depth/retry, §19 revision rounds | hook call points FIXED (dispatch step 2/6 — binding itself = E10.2); `policy` reject → NO retry, escalation |
| `IMPLEMENTATION_ROADMAP.md` | E10.1 row (line 135) | acceptance: hook test — policy violation → RED + decision_log row |
| `AUDIT_AND_LOGGING_SPEC.md` | §10 binding list + E8.2 boundary | hook reject/escalation decision points arrive NOW via logDecision (single mechanism rule) |
| `DESIGN_SYSTEM.md` | Registered directive | RULE #0 pass mandatory (UI touched: /gov/violations) |

## Base already live (verified 2026-07-14)

- `agents.hook_version` column live (20260711002000); HR factory stamps v1 on creation. Employee-card status UI + spawn binding = **E10.2, not here**.
- `logDecision` `@dxb/observability` (E8.2) — 8 required keys, fail-visible.
- Alerts single-producer idiom: INSERT INTO alerts → trg_alerts_broadcast (E8.4b); level enum informational|attention|high|critical|emergency.
- settings_registry/settings_values + `resolve_setting(key)` (0021x/E6.1); control seam idiom `control_*_action(p_payload, p_idempotency_key)` + CEO wall + idempotency twin (E9.1-E9.5).
- `notify_broadcast(channel,type,payload)` (api_support) — settings channel invalidation pattern (E9.5 emsal).
- persona quality gate: `persona_versions.quality_gate='passed'` per employee (hr e54b).
- tasks: objective/output_contract/budget_max_tokens/budget_max_cost_eur/milestone_id (E9.4) — NO project_id column.
- GovTabs `components/gov/gov-tabs.tsx`; gov routes: audit, decisions, permissions, policies, risks, security.
- tests root-run vitest; CEO-context helper idiom tests/e9/library.test.ts (set_config request.jwt.claims).

## Interpretations (to be REGISTERED in FABLE_5_HOOK_SPEC as adaptations at close)

1. **A1 seam shape**: `fn_hook_set_policy(p_payload, p_idempotency_key)` keeps the spec §13 name but adopts the sibling single-door payload idiom (actions: `set_policy` — severity/enabled/rule patch, version bump; audit row; `hook_policy.changed` on settings channel → cache drop §10). block→warn transition stamped `risk='high'` in the audit detail (§13).
2. **A2 bilingual titles**: `hook_policies.title_en/title_tr` columns — §14 "insan-okur TR/EN" + UI bilingual purity directive (DB text = i18n surface). Spec §4 DDL had no human-readable field.
3. **A3 seed severities**: per-standard defaults documented in seed comments — all `block` except std5 token budget `warn` (hard-stop authority = COST_CONTROL, §2 row 5 wording) and std10 context integrity `warn` (monitor-and-reload semantic). CEO out-of-standard orders (§27) are runtime behavior (actor='ceo' → warn path), not seed severity.
4. **A4 violations→alerts mapping** (§9 "severity eşlemesiyle" unspecified): AFTER INSERT trigger on hook_violations → alerts row; action_taken escalated→`high` (§7), rejected→`attention`, revised/warned→`informational`; dedup_key `hook:<policy_id>:<run|task>` active-unique.
5. **A5 logDecision dependency**: package depends on `@dxb/observability` in addition to `@dxb/shared` — AUDIT R6 single-mechanism rule outranks §25's "yalnız packages/shared" (workspace-internal, zero new external deps; §25's intent preserved).
6. **A6 fail-closed surface**: DB/policy-load failure → `preTask` returns `REJECT(reason='hook_unavailable')` + best-effort critical alert + console error; spawn stop is the caller's contract (§17; queue holds work).
7. **A7 project link source (std11)**: live schema has no `tasks.project_id` — the mechanical check reads `ctx.task.milestone_id → project_milestones.project_id` (E9.4 adaptation chain) or explicit `ctx.project`; absent both → violation `missing_project_link`.
8. **A8 §24 command**: `pnpm --filter hook test` delegates to root vitest `tests/e10/` (repo test-layout rule; all suites live under tests/).

## Deliverables

1. Migration `20260714030000_e10_hook_engine.sql` (ONE file, idempotent 2×): §4 DDL verbatim + A2 columns; append-only hook_violations (authenticated SELECT, no UPDATE/DELETE grants); seed 17 standards (ON CONFLICT DO NOTHING) with machine rules in `rule` jsonb; `fn_hook_set_policy` (CEO wall, idempotency twin, audit, settings broadcast); violations→alerts trigger (A4); settings seeds: `hook.enabled` (false — flag-off period alertable §23), `hook.escalation_chain`, `orchestration.max_spawn_depth` (3), `orchestration.max_revision_rounds` (2), `hook.context_summary_threshold`.
2. `packages/hook` (library, NOT a service — R5): `types.ts` (HookCtx/GateVerdict/PolicyRow), `policies.ts` (loadPolicies + 60s TTL cache + `invalidatePolicyCache()`; invalid JSON → gate reject `invalid_policy` §17; conflict → most restrictive + medium alert §27), `pre-task.ts` (order §6: permission → completeness → budget → project link → persona gate), `runtime.ts` (runtimeLimits — monitor only, runner is the single kill authority §6), `post-task.ts` (acceptance map, evidence, output schema, memory proof → PASS/REVISE/ESCALATE; revision limit from settings), `violations.ts` (recordViolation: hook_violations row + logDecision `hook_reject`/`hook_escalation` + escalation chain §7 walk employee→manager→orchestrator→CEO with decision_log per hop + approval item at CEO rung).
3. `/api/control/hook/route.ts` (Zod, Idempotency-Key, ERROR_STATUS map — alerts seam idiom).
4. `/gov/violations` page + GovTabs entry: violation stream (policy, run, employee, gate, action, human detail; honest zero state — binding lands E10.2) + 17-policy table (standard, gate, severity, enabled, version) with CEO severity/enable mutation through the seam ONLY.
5. Tests `tests/e10/hook.test.ts`: 17× RED + 17× PASS mechanism cases (§20 34-case base); evidence-less done → REVISE; revision exhaust → ESCALATE → manager decision_log row (roadmap acceptance: violation → RED + decision_log); fail-closed (broken DB ctx) → reject + no throw; seed proof `count(DISTINCT standard_no)=17`; fn CEO wall + idempotency replay/MISMATCH + block→warn high-risk audit; conflict → most-restrictive; invalid_policy reject; violations→alerts trigger row; anon zero grant.
6. Spec adaptations A1-A8 registered in FABLE_5_HOOK_SPEC; roadmap E10.1 ✓; STATE.md; purity allowlist if needed.

## Boundaries (future rows — NOT here)

- Spawn-path binding + `agents.hook_version` stamping + employee-card hook status → **E10.2**.
- HR sampling deep-quality review (madde 9) → HR runtime rows; pre-gate <100ms health-snapshot metric → P7 health row; Settings UI Live Impact Preview → SETTINGS/E12 row.

## Evidence contract (Evidence-Before-Done)

- Migration idempotent 2×; §24: `SELECT count(*) FROM hook_policies` ≥17; `count(DISTINCT standard_no)`=17; `pnpm --filter hook test` green; fail-closed grep green.
- vitest tests/e10 green + full regression green; tsc -b 0 root + dashboard.
- RULE #0: EN+TR × 1280+1920 /gov/violations, CHECKLIST walk, i18n-purity-check.sh PASS, baselines e101-violations-*.png (PENDING CEO eye); eye-test mutation hygiene sweep.
- Commit `feat(E10.1): ...` (Fable, K1).
