# Execution ticket — ledger items 10d / 10e (portfolio responsibility + brain control)

**Spec pointers (no new design decisions here):**
- Complaint ledger completeness-audit rows: 10d ("portfolio: who works on it, which model responsible — page has zero model-responsibility view"), 10e ("change the portfolio brain (model) from Operations — control fn exists, surface does not").
- C10 decision (ledger table): "CEO may inspect/replace the responsible brain (model) of a revenue portfolio from Operations (Projects/Portfolio)."
- MODEL_ROUTING_SPEC §4b regime: brain change = CEO-only door + audit_log + decision_log; banned/testing models unassignable.
- REVENUE_ENGINE_SPEC §4: `revenue_engines.owner_department` is the responsibility column; §5 control seam family.

**Measured base (this session):** portfolio page = read-only allocations (0 rows live); engines 6, ALL `owner_department` empty; agents 198 active, `brain` filled (all glm-5.2); existing door `control_org_assign_model_group(p_model_id, p_employee_ids[])` = CEO-gated, catalog-validated (banned/active), decision_log+audit — exposed at `/api/control/org` op `assign_model_group`; NO door exists to set an engine's owner department (without it "who works on it" can never be answered).

**Scope:**
1. Migration `20260724004000_engine_owner_control.sql`: `control_engine_set_owner(p_slug, p_department, p_rationale)` — CEO-only (fn_org_actor pattern), validates engine + department, audited (`engine.owner.assigned` + decision_log). Registered adaptation note added to REVENUE_ENGINE_SPEC §5 (new fn in the engine seam family — needed to make 10d answerable; recorded, not silent).
2. `/api/control/engines` route (session + zod → rpc).
3. Portfolio page: "Responsibility" panel (10d) — per engine: locale title, lifecycle, owner department (set-owner select when empty), active employee count + brain distribution chips + expandable employee list (progressive disclosure); allocation cards inherit the engine responsibility line when allocations exist. "Change model" control (10e) per owned engine: active-catalog model select → existing org door applies to that department's active employees.
4. i18n EN+TR + help.portfolio section update.

**Discipline:** standing order 11 (TDD red→green for the fn; systematic-debugging on surprises; verification-before-completion). K1: all lines Fable inline.

**Evidence contract:** DB tests (fn happy path under impersonated CEO jwt, system/permission rejection, unknown dept/engine rejection, audit row) red→green; RULE #0 battery /revenue/portfolio EN+TR × 1366/1920 + zero ellipsis + scrollOK; live UI proof: set owner via the real door (then measured revert — eye-test mutation hygiene), change-model exercised on the smallest department with its CURRENT model (real door, value-identical, honest audit trail); i18n purity PASS; commit + STATE.md + ledger rows closed.
