# REVENUE_ENGINE_SPEC — Objective Contract, Opportunity Discovery, Portfolio & Revenue Intelligence
> Spec #32 · Author: Fable 5 in person · Source ruling: [[00-CEO-DIRECTIVE-REVENUE-FIRST]] (Talep §§2-4, §7.1-7.3, §7.6, §7.8, §7.12 + CEO decisions D1-D4 2026-07-17)
> Parent: [[MASTER_PLAN]] · Siblings it extends: [[DATA_MODEL]], [[WORKFLOW_ENGINE_SPEC]], [[APPROVAL_ENGINE_SPEC]], [[HOLDING_LIBRARY_SPEC]], [[AGENT_ORCHESTRATION_SPEC]], [[COST_CONTROL_SPEC]]
> Depth standard: INDEX §14 (27 headings) + existing-asset mapping + per-step verify commands + Opus-handover clarity.

## 0. Existing-asset mapping (KALIR / YENİ / DEĞİŞİR)

| Asset | Fate |
|---|---|
| `revenue_ledger` + `fn_revenue_record` + `v_pnl_daily/engine/platform` (E6.5/E6.5b) | **KALIR** — stays the single realized-revenue truth |
| `revenue_ledger.engine` CHECK constraint (frozen enum) | **DEĞİŞİR** — CHECK dropped, FK to new `revenue_engines(slug)`; engines become data (Talep §7.2: engines are a floor, not a ceiling) |
| `intents` intake + kernel classify (E6.4) | **KALIR** — objectives do NOT replace intents; an objective is a standing contract, an intent is a one-shot command |
| `tasks`/`projects`/workflow/approval/outbox rails | **KALIR** — revenue execution rides existing rails; approval classes unchanged (money-out always gated, B7b) |
| pg-boss scheduler (9 live schedules) | **KALIR+GENİŞLER** — new `revenue.*` job family |
| `cost_ledger` (COST_CONTROL) | **KALIR** — net-profit math reads it |
| Strategy dept roster | **DEĞİŞİR** — +2 seats: Opportunity Scout, Portfolio Manager (workforce amendment W-R1, §25) |
| Dashboard `/revenue` page (E6.5) | **GENİŞLER** — objectives / opportunities / portfolio surfaces (§7) |

## 1. Purpose

Give the Holding the missing economic brain: a binding **Objective Contract** from the CEO, continuous **opportunity discovery** with disciplined research tooling, a scored **portfolio** that turns opportunities into projects on existing rails, engines-as-data lifecycle, and a daily **reality-feedback loop** measuring realized net profit against the objective — all inside the immutable Islamic boundaries. Measured founding gap this spec closes: MASTER_PLAN and PRODUCT_SPEC contained zero revenue/profit normative text (grep 2026-07-16 = 0 hits); revenue existed only as ledger + seats.

## 2. Requirements (binding G-rules)

- G1. **Objective is fixed.** The system never reduces/reinterprets a CEO objective; it reports gaps and rotates the portfolio. Only the CEO edits an active objective.
- G2. **Islamic boundaries are fixed** and machine-checked: no opportunity reaches `pilot` without `halal_verdict='halal'`; haram categories are auto-rejected at intake with recorded reason. Crypto/stock-trading excluded from scanning (CEO exclusion).
- G3. **Hamza proposes, CEO decides** (D4): objectives can be born `proposed` (by orchestrator) but only CEO transition `proposed→active`. Proposals must carry research evidence refs — a proposal without opportunity citations is gate-rejected (anti-laziness rule).
- G4. **Free-first / zero-capital-first** (D1): while `capital_limit=0`, scoring hard-filters `capital_required_eur=0` opportunities; capital raises are CEO-only.
- G5. **Never fabricated revenue:** realized numbers come ONLY from `revenue_ledger` (append-only, audited). No projected number may render where a realized number is expected (P3 schema-first stays).
- G6. First seeded objective = **€50 net profit** (D2), status `draft` until CEO activates post-E13 test closure.
- G7. Research proposals cite tooling runs (Library `research` items / study-cards); "genel geçer" tool defaults rejected — advanced intake per D4 (Scrapling/Camoufox/deerflow class, each through Library STUDY lifecycle).
- G8. Every outward step of any revenue project keeps existing approval classes; this spec adds ZERO new bypasses.
- G9. Engine set is data: creating/retiring an engine is a control-fn mutation + audit row, never a migration.

## 3. Architecture (the operating cycle, Talep §7.6 mapped to owners)

```
RECEIVE OBJECTIVE (CEO / Hamza-proposed → CEO)          objectives
→ SCAN MARKET (revenue.scan jobs + research tools)      opportunities(raw)
→ DISCOVER/SCORE (12-dim score + halal gate)            opportunities(scored)
→ BUILD PORTFOLIO (Portfolio Manager + Hamza ranking)   portfolio_allocations
→ ESTABLISH PROJECTS (existing Project OS)              projects
→ ALLOCATE (existing org/task rails)                    tasks
→ CLOSE CAPABILITY GAPS (Library/HR lifecycle)          library_*/hr fns
→ PRODUCE → MARKET → SELL (departments, approval-gated) tasks/outbox
→ MEASURE (revenue_ledger − cost_ledger)                v_objective_progress
→ LEARN / SCALE / STOP (engine+opportunity lifecycle)   control fns
→ RESTART (daily pg-boss cycle)
```
Parts measured pre-existing: projects/tasks/approval/outbox/ledger. Parts NEW: objectives, opportunities, engines-as-data, portfolio, daily loop, scoring, halal gate.

## 4. Data model (new family `revenue_core`)

- `objectives` — the CEO contract (Talep §7.3 components).
- `revenue_engines` — engines as rows, lifecycle `candidate|pilot|scale|sunset`.
- `opportunities` — discovery pipeline with 12-dimension scoring (Talep §7.8) + `halal_verdict`.
- `portfolio_allocations` — objective ⇄ opportunity/engine commitment with expected contribution.
- Views: `v_objective_progress`, `v_opportunity_pipeline`, `v_snev` (risk-adjusted sustainable net economic value, §7.12 formula).

## 5. Component structure

| Component | Home |
|---|---|
| Objective/engine/opportunity control fns | DB SECURITY DEFINER (`control_revenue_*` family) |
| Daily revenue cycle jobs | `packages/kernel/src/revenue/` (NEW module, not a new package) |
| Scoring engine (deterministic part) | same module — pure fn, unit-testable |
| Research runners (tool-backed scans) | existing worker rails once R2 activation lands; until then scan jobs enqueue research `tasks` for departments |
| Dashboard surfaces | `apps/dashboard` `(command)/revenue/*` |

## 6. Backend structure

- `revenue/cycle.ts` — pg-boss handlers: `revenue.scan.daily`, `revenue.score.daily`, `revenue.brief.daily` (Hamza gap-brief), `revenue.rollup.daily` (progress snapshot event).
- `revenue/score.ts` — 12-dim weighted score; weights from `settings_registry` (`revenue.scoring.*`) so CEO tunes without deploy.
- `revenue/propose.ts` — builds `proposed` objectives/portfolio drafts from top-scored halal opportunities; every proposal row stores `evidence_refs jsonb` (opportunity ids + research task ids) — G3 gate.
- No raw provider keys, no new outward paths; research HTTP tooling arrives only via Library-granted MCP/tools (G7).

## 7. Frontend structure (§31 route additions — Intelligence group)

| Route | Content |
|---|---|
| `/revenue` (exists) | + Objective header card: target, realized net, gap, days left (drill to ledger rows — P2) |
| `/revenue/objectives` | contract list + detail (all §7.3 fields, status machine, proposal evidence) |
| `/revenue/opportunities` | pipeline board (state columns), 12-dim score breakdown, halal badge, source research drill |
| `/revenue/portfolio` | allocations vs objective, contribution vs realized, rotate/stop actions (CEO Control Mode) |

Empty states honest ("0 opportunities — first scan scheduled …"), no dummy metrics (§35).

## 7bis. THE OBJECTIVE DOOR — how a target enters the company (W2.1, built 2026-07-26)

**Measured defect:** `control_objective_create`, `_activate` and `_close` had existed since the revenue wave with **no caller anywhere in the product** — no screen, no API, and no `EXECUTE` grant to `authenticated`. Setting a target meant opening psql. The CEO's framing of the entire system is *"I state the number, the OS works out how"*, and the number had no way in.

- **Surface:** `/revenue/objectives` → `ObjectiveDoor`. Amount, name, "start now". Nothing else: metric, period and capital limit all have working defaults, and a default the CEO never has to think about is worth more than a field he has to fill.
- **Seam:** `POST /api/control/objectives` with `Idempotency-Key` **required** — a target is exactly the thing a double-submit must not create twice (org-seam lesson, 2026-07-24). The gate, audit row and decision row stay inside the SECURITY DEFINER functions; the handler checks session and shape only.
- **Two measured rules the door respects rather than fights:** `create` refuses `active` ("create accepts only draft|proposed") because activation is its own audited act, and `activate` refuses an objective with no period because a target with no deadline cannot be measured. The door performs both steps for the CEO and **defaults the period to the current calendar month**.
- **Capital limit defaults to 0** — the safe end of the G4 zero-capital filter. A new target arrives unable to spend anything until the CEO raises it, and the form says so in both languages.
- **`close` accepts `achieved|missed|closed`** (measured against the function, not assumed).

**Proven end to end, through the real UI:** the form submitted, the page honestly displayed `permission denied for function control_objective_create` (the missing grant — same class as `chat_sessions` shipping without RLS an hour earlier), the grant shipped as `20260726005000`, and the next run created objective *"e2e door proof"* = €75, `status=active`, `period=[2026-07-01,2026-08-01)`. The probe was then closed through the audited `close` door rather than deleted, because a real audited row is not test litter to be erased.

## 7ter. THE DISCOVERY ENGINE — how an opportunity is born (W2.2, built 2026-07-26)

**Measured defect:** `opportunities` held zero rows, `revenue.scan` was an intake screen over an empty table, and the research tools the holding installed for exactly this job had **never been called** — `tool_calls` carried 240 dxb-mcp rows, 2 git, 1 context7 and **zero scrapling**. The design was not missing: §5 already routes research through the department task queue and says the seam "upgrades automatically when R2 activates". R2 activated 2026-07-18 and nothing was ever connected to it.

- **Two halves on the existing worker rail.** `commissionScoutingRun` opens ONE **staffed** research task in Strategy (staffed matters: an agent-less task runs tool-LESS by default-deny, and a market scan without tools is the defect); `harvestScoutingRuns` turns a finished run's findings into `opportunities` through `control_opportunity_register`, each row carrying the run, the pages it cited and the tools it called. Both halves run inside `revenue.scan`; harvest first, so a finished run frees the single open-run slot.
- **Bounded by design:** one open run at a time, a pipeline floor (`revenue.discovery.pipeline_floor`), a candidate cap, and an off switch — a daily job can never become a queue of scouts talking to the same internet. `revenue_scout_runs` is the ledger that makes "harvested exactly once" true rather than hoped.
- **Refusals are recorded, never silent:** a candidate citing no URL is refused `no_evidence`; an invented engine is refused `unknown_engine`; the counts and reasons land in `revenue_scout_runs.outcome` and `audit_log`. "Found nothing" and "made something up" must never look the same afterwards.
- **Discovery finds; it never rules.** Rows land at `discovered` with `halal_verdict='pending'` — the verdict belongs to the CEO or the risk-audit head (§13, separation of duties).

**FOUR DEFECTS THE HOLDING'S OWN GATES CAUGHT, all mine, all fixed:**
1. **No project link.** The pre-task hook refused the task five times ("do not conflict with holding goals") and the ladder blocked it. The gate was right — a scan with no home in the portfolio is orphan work. Weakening it was never an option and `control_project_action` create is CEO-only, so the standing project `revenue-discovery` ships as data (migration `20260726009100`).
2. **The brief tripped the halal screen.** It enumerated the prohibited categories, and the screen — which matches TEXT and is right not to guess intent — fail-closed the task on its own instructions. Same trap as the CEO's "bahis" incident (2026-07-23). The boundary is now stated as the rule the agent already carries, never as a word list, and `tests/c9/discovery.test.ts` mechanically asserts the commissioned brief contains no screened term.
3. **JSON inside JSON.** Four consecutive live runs fetched real pages and then failed on shape, because the worker envelope and the deliverable contract each asked for JSON. Repaired by changing the format to `CANDIDATE … END` line blocks that cannot collide with an envelope — not by insisting harder.
4. **The knowledge-shelf rule was structurally unsatisfiable.** Six runs produced a contract-perfect deliverable and were failed for a missing `ref` on the file evidence — while `WorkerEvidence` in `worker-shim` had **no `ref` field at all**, so Zod stripped it before the gate could see it. That is the "knowledge_shelf gate vs worker deterministic loop" recorded as an open runtime item on 2026-07-24, root-caused here. With the field added, the very next run passed on its **first attempt** and its report was registered on the shelf. **A second, subtler catch in the same hour:** an intermediate version of the brief had lost the word "research", so `std.knowledge_shelf` (which matches the contract text) silently stopped firing — the run passed with no report filed. Dodging a rule by vocabulary is worse than failing it; the contract now declares itself research and a test holds that.

**LIVE PROOF (2026-07-26 08:2x):** task `ff956901` executed by the Strategy scout, ONE run, tool calls `scrapling.get ×2 · scrapling.bulk_get ×3 · queue_get ×2 · audit_append`, report on the shelf as `kind='research'`, then harvest registered **5 opportunities** — each `capital_required_eur=0`, `state='discovered'`, `halal_verdict='pending'`, each citing **3 distinct URLs it actually fetched**. Honest limit recorded: an earlier run's candidates all cited one volatile category page, which the QA gate flagged as thinly-met; the shipped run cites per-candidate sources.

## 8. APIs (control seam — all SECURITY DEFINER, audit-writing)

`control_objective_create(p_actor, …fields, p_status draft|proposed)` · `control_objective_activate(id)` **CEO-only** · `control_objective_close(id, outcome)` · `control_engine_create/update_lifecycle` · `control_opportunity_register/score/set_halal_verdict/advance/reject` · `control_portfolio_allocate/rotate/stop`. Reads via views. Agents may READ pipeline; mutations CEO or named-owner fns per §13.

**Registered adaptation (2026-07-24, ledger 10d/10e):** the engine seam gains `control_engine_set_owner(slug, department)` — **CEO-only** (fn_org_actor gate), validates engine + department, writes audit_log `engine.owner.assigned` + decision_log. Rationale: `owner_department` (§4) is the responsibility anchor of the portfolio view (C10: CEO inspects/replaces the responsible brain from Operations), but no door existed to set it — "who works on it" was unanswerable. Brain replacement itself rides the existing MODEL_ROUTING §4b-regime door `control_org_assign_model_group` (banned/testing models rejected at the catalog check). Migration `20260724004000_engine_owner_control.sql`.

## 9. Event structure (existing `revenue` Broadcast channel extends)

`objective.created|activated|progress|gap_alert|closed` · `opportunity.registered|scored|halal_blocked|advanced` · `engine.lifecycle_changed` · `portfolio.rotated`. Envelope contract unchanged (packages/shared events). `gap_alert` also feeds alerts center (E8.4b) at thresholds `settings: revenue.gap_alert_pct`.

## 10. State management

- Objective: `draft → proposed → active → achieved | missed | closed` (missed keeps history; only CEO closes/activates; `proposed` only Hamza path).
- Opportunity: `discovered → scored → shortlisted → piloting → scaling → retired | rejected(halal|score|ceo)`; `piloting+` REQUIRES `halal_verdict='halal'` (fn-enforced, G2).
- Engine: `candidate → pilot → scale → sunset`; ledger keeps rows of sunset engines (history truth).

## 11. Database tables (DDL summary — migration family 0028x)

```sql
objectives(id uuid pk, title text, amount_eur numeric>0, metric text check in
  ('net_profit','revenue'), default 'net_profit', period daterange,
  revenue_floor_eur numeric, min_gross_margin_pct numeric, cash_floor_eur numeric,
  capital_limit_eur numeric default 0, risk_limit_eur numeric, max_loss_eur numeric,
  status text (state machine §10), proposed_by text, evidence_refs jsonb,
  boundaries_ack boolean not null default true, created_at, updated_at)

revenue_engines(slug text pk, title text, title_tr text, thesis text,
  lifecycle text check candidate|pilot|scale|sunset, owner_department text
  references departments, unit_economics jsonb, created_from text, audit cols)

opportunities(id uuid pk, title, engine_slug fk→revenue_engines, region text,
  channel text, capital_required_eur numeric default 0, state text (§10),
  halal_verdict text check pending|halal|haram|review default 'pending',
  halal_reason text, score numeric, score_dims jsonb  -- 12 keys: market,trend,
   demand,competition,price_gap,logistics,platform_fees,tax_constraints,ad_cost,
   est_margin,time_to_revenue_days,scalability
  , research_refs jsonb, created_by, audit cols)

portfolio_allocations(id uuid pk, objective_id fk, opportunity_id fk,
  expected_net_eur numeric, committed_at, stopped_at, stop_reason text,
  realized_link text)  -- drill seam to ledger filter
```
`revenue_ledger`: `ALTER … DROP CONSTRAINT revenue_ledger_engine_check; ADD CONSTRAINT fk_engine FOREIGN KEY (engine) REFERENCES revenue_engines(slug);` — seed engines first with the 6 live enum values (social_selling, content_monetization, ecommerce, consultancy, venture, physical) so the FK swap is data-lossless.

Views: `v_objective_progress` (per active objective: target, realized_net = Σledger − Σcost in period, gap, run-rate, days_left) · `v_opportunity_pipeline` · `v_snev` (trailing-90d net × recurring_share − concentration/chargeback penalty; formula constants in settings).

## 12. Relations

objectives 1─n portfolio_allocations n─1 opportunities n─1 revenue_engines; opportunities n─1 departments (via engine owner); allocations → projects (existing `projects.meta.allocation_id` pointer, no schema change on projects); ledger rows relate by engine + optional `meta.allocation_id`.

## 13. Authorization

RLS: authenticated read on views; base tables deny direct writes (control-seam P4). Fn guards: `activate/close/allocate/rotate/stop/set capital` = CEO actor only; `register/score` = system jobs + strategy dept agents; `set_halal_verdict` = CEO or risk-audit dept head ONLY (never the proposing agent — separation of duties). Grants mirrored in PERMISSION_MODEL §append.

## 14-15. Logging & Audit

Every control fn writes `audit_log` (+`detail_ref` to row) — pattern identical to library/org fns. Score runs write `decision_log` (§10 "important decision" class: portfolio ranking rationale, 8 fields). Scan jobs log run stats to `agent_runs` when executed by workers (post-R2) or job digests pre-R2.

## 16. Security

Islamic gate = data + fn + hook triple: (a) `halal_verdict` column gate (fn-enforced), (b) intake keyword/category screen auto-flags `review` (list in settings `revenue.halal_screen[]`, seeded: alcohol, tobacco, pork, gambling, riba/interest-finance, adult, crypto-trading, stock-trading), (c) FABLE_5_HOOK_SPEC amendment (row R1.5) adds pre-task policy: revenue tasks referencing flagged categories fail closed. Money-out unchanged (B7b). No new outward surface in this spec.

## 17-19. Error handling · Retry · Fallback

Scan/score jobs: idempotent by `(job, occurred_on)` digest; failure → pg-boss retry (3, backoff) → alert `revenue.cycle_failed`. Proposal build failure never blocks measurement rollup (independent jobs). Fallback: if scoring settings missing → last-known weights + warning event (never silent defaults drift: logged decision). If `cost_ledger` empty for period → progress view returns `net_unverified=true` flag; UI labels it (honest-state, never fake profit).

## 20. Test plan

Unit: state machines (every §10 transition legal/illegal), score determinism, halal screen, proposal-evidence gate (G3), zero-capital filter (G4). Integration: FK swap migration on seeded ledger copy (row counts identical pre/post), control fns audit rows, RLS denies, progress math against fixture ledger+cost rows, gap_alert threshold event. UI: 4 routes × loading/empty/error/data + EN/TR purity + RULE #0 pass.

## 21. Acceptance criteria

1. CEO creates+activates €50 objective from dashboard; `v_objective_progress` renders target/realized/gap from real ledger math.
2. Seeded scan job registers a fixture opportunity; scoring writes 12 dims; haram fixture auto-`review`+blocked from `piloting` (fn error text cites G2).
3. Hamza-path proposal without evidence_refs is rejected by fn (G3 proof).
4. New engine created via control fn (no migration); ledger row accepted with new engine slug; enum-era rows intact.
5. Full audit chain: each mutation above has audit_log row with detail_ref.
6. RULE #0 design pass on 4 routes, both locales, ≥2 widths.

## 22. Migration plan

`0028a_revenue_engines_seed.sql` (table + 6 seeds + FK swap) → `0028b_objectives_opportunities.sql` → `0028c_portfolio_views.sql` → `0028d_settings_seed.sql` (weights, halal_screen, gap thresholds) → `0028e_pgboss_schedules.sql` (4 jobs, staggered 05:00-06:00 UTC). Each idempotent (IF NOT EXISTS / RUN2=0 pattern proven in E-waves).

## 23. Rollback plan

Reverse order drops; FK swap rollback = restore CHECK from engines snapshot (`SELECT slug FROM revenue_engines` at rollback moment); ledger rows never touched. Views DROP-safe. Schedules `pgboss.schedule` delete by name.

## 24. Implementation order (roadmap R1 rows) — each step with verify command

1. **R1.2** migrations 0028a-c → `psql -c "\dt objectives opportunities revenue_engines portfolio_allocations"` + FK proof `\d revenue_ledger`.
2. **R1.2** control fns + tests → `pnpm --filter kernel test revenue` green; illegal transition test red-path proof.
3. **R1.3** cycle jobs + scoring + settings seed → `SELECT name FROM pgboss.schedule WHERE name LIKE 'revenue%';` → 4 rows; manual `SELECT control_opportunity_score(...)` returns dims.
4. **R1.4** dashboard 4 surfaces → Playwright route proofs + i18n purity + RULE #0 evidence set.
5. **R1.5** hook policy + halal screen wiring → hook test: flagged task rejected + decision_log row.
6. Objective seed (draft €50) → `SELECT status,amount_eur FROM objectives;` → `draft | 50`.

## 25. Dependencies

Hard: E-rails already live (measured). Soft-but-real: **R2 Execution Activation block** (audit F-01/02/03/04/06) — until workers hold real tools, scan jobs delegate research to task queue consumed in test mode only; spec is written so R1 lands without R2 but produces *decision-grade research via existing manual/agent text runs*, and upgrades automatically when R2 activates (same task seam). Workforce W-R1 (+2 strategy seats) before first real scan wave. Library STUDY cards for research tools (D4/D7/D8 lists) before any tool install.

## 26. Risks

Goodhart pressure (mitigated: ledger-only truth G5 + separation of duties §13) · scoring garbage-in (mitigated: evidence_refs mandatory, tool-backed scans) · engine sprawl (lifecycle + CEO-only scale) · pre-R2 research quality ceiling (flagged in views `research_grade` field) · settings-tuned weights drift (decision_log every change).

## 27. Edge cases

Objective period ends mid-pilot (allocations auto-carry flag, CEO prompt) · negative-margin revenue spike (progress shows net, floor breach alert) · engine sunset with open allocations (fn blocks until rotated) · opportunity halal→review flip after scale (immediate `halal_blocked` event + CEO alert + outward tasks frozen via hook) · two active objectives overlap periods (allowed; allocations disjoint per objective; progress views per-objective).

## 28. Done definition

All §21 acceptance rows evidenced (commands + outputs recorded in roadmap R1 row) · migrations idempotent ×2 proof · vitest+tsc+eslint+i18n gates green · RULE #0 pass archived · STATE/roadmap/INDEX updated · **Opus-handover clarity:** every R1 row cites this spec's § numbers; no design decision lives outside this file (PLAN.md=ticket rule). ⛔ Critical-decision protocol: any deviation lands as registered adaptation in INDEX U-table + this spec's §0 table, CEO-visible, before code.
