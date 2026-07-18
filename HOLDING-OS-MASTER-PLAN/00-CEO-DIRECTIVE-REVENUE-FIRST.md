# CEO DIRECTIVE — REVENUE-FIRST FOUNDING PURPOSE + FREE-FIRST GROWTH
**Issued:** 2026-07-16 (Talep document) + 2026-07-17 (decision round, chat)
**Source artifacts:** `MUSTS from Fable 5 - English.md` (repo root — the Talep) · CEO decision messages 2026-07-17 · external audit `Dış Denetim Raporu/` (Codex, 2026-07-16, F-01..F-15 verified by Fable 2026-07-17)
**Status:** BINDING. Execution started 2026-07-17 ("bugün konuşulan her şeye başlıyoruz").

---

## 1. Founding purpose (constitutional)

The Holding's reason to exist is to **conduct real economic activity and generate sustainable, halal net profit** — continuously discover revenue opportunities, convert them to projects, operate them through digital employees, sell, measure, scale winners, stop losers, 24/7. The dashboard is the control surface, not the purpose. This becomes principle **P0** in HOLDING_OS_PRODUCT_SPEC and a normative section of MASTER_PLAN.

Governing formula (Talep §2, verbatim ruling):
> **The objective is fixed. The Islamic boundaries are fixed. The solution, portfolio, and execution are the Holding's responsibility.**

## 2. Immutable Islamic boundaries (must become machine-checkable)

- No haram products/services: alcohol, tobacco, pork, incompatible finance, fraud, indecent/sexualized content. Crypto and stock-market trading excluded from opportunity scanning (CEO exclusion, Talep §4).
- Revenue targets can NEVER weaken these boundaries; agents may not debate, reinterpret, optimize around, or bypass them.
- **Measured gap (2026-07-16):** these boundaries were encoded NOWHERE in corpus/code/personas (grep islam|haram|halal|helal|alkol = 0 hits). Remediation owned by roadmap row R1.5: hook policy rules + persona standard section + opportunity `halal_verdict` gate.

## 3. CEO decisions of 2026-07-17 (binding rulings)

| # | Ruling |
|---|--------|
| D1 | **Free-first growth:** build with zero/minimal-cost capabilities first; paid upgrades (e.g. OpenAI Realtime **mini**) only after the Holding earns profit — "the Holding must produce profit so it can develop itself" |
| D2 | **First binding objective: €50 net profit** once the system is fully tested and working (not €10k initially; targets scale up afterwards) |
| D3 | **Voice v1 scope:** NOT a meeting room — an orchestrator-mediated call line to ask a director a question when needed. Full Moderated-Mode boardroom architecture is spec'd at "add-later" level and deferred until revenue funds it |
| D4 | **Hamza may PROPOSE objectives; the CEO always decides.** Proposals must never come from laziness — the research architecture must be very strong (advanced tools: Scrapling/Camoufox/deerflow class, not mainstream defaults) |
| D5 | **Islamic tone, holding-wide:** every director/persona speaks with devout tone (İnşaAllah, MaşaAllah, Bismillah) — "a fully devout holding, tied to its religion, like us." Enters EMPLOYEE_PERSONA_STANDARD together with Discipline DNA |
| D6 | **fable-method adaptation approved** ("do it most excellently") — adapted content, never embedded external text (agency-agents precedent) |
| D7 | **Claude ecosystem sweep:** all excellent skills/plugins/tools from the Claude library get intake into the Holding Library (study-before-install discipline) |
| D8 | Desktop research backlog (`repo vb şeyler.odt`, 25 items) enters the Library research pass |
| D9 | Kelam (WisprFlow-clone) architecture prepared (`docs/kelam/ARCHITECTURE.md`); build slot after current wave (OD-1) |

## 3-bis. CEO decisions of 2026-07-18 (workforce-activation rulings — the two OPEN MUSTS questions answered)

Context: the MUSTS-Talep audit (2026-07-16) left two CEO questions open; E12.5 mass
activation was blocked-class on them (E12.5-WORKFORCE-BASELINE §"BLOCKED-CLASS
DEPENDENCY"). The CEO answered both in-session 2026-07-18 morning ("karar A (Evet).
karar B (1.seçenek)").

| # | Ruling |
|---|--------|
| D10 | **Worker objective contract is MANDATORY.** Every executable task carries the economic frame: expected output (`tasks.objective`), success metric (`tasks.output_contract`), budget ceilings (`tasks.budget_max_tokens`, `tasks.budget_max_cost_eur`), and deadline (`tasks.due_at`). Measured baseline at ruling time: the first three were already NOT NULL since birth (65/65 live rows, 0 nulls — the audit-era "intents are text-only" gap had been closed structurally by the task envelope); `due_at` was the one missing field and is added by migration `20260718090000` (7-day default SLA; probation tasks use the `hr.probation_max_days` window). Approval-facing surfaces must render the frame (a task asking for CEO eyes shows what it costs and when it is due) |
| D11 | **Activation scope = TEXT-ONLY FIRST (option 1).** Workforce activation waves add ZERO new tool grants: runtime default-deny stands (no grant ⇒ no tools mounted on the SDK session, R2.2 law), so a newly-activated employee thinks and writes but touches nothing external. The existing measured grant surface stands AS-IS (R4.2 dept identity-mirror dxb-mcp grants + R4.3 three-dept external pins — both separately CEO-ordered installs); EXPANSION of external hands per department requires a separate CEO approval. `hr.grant_package` rows stay `pending_library` until a real kit is granted — the honest state, not a simulated one |

Activation-integrity corollary (F-09 discipline applied to HR): mass activation may
NOT ride simulated equipment or invented scores. Per-employee LiteLLM keys are REAL
(alias-only stored in DB — no key material outside the proxy), the probation task
actually RUNS through the production worker, and the evaluation score is DERIVED
(`succeeded_runs / total_runs` of the probation task, threshold
`hr.probation_pass_score`) — the E5.4b demo's labeled manual-score path remains legal
only for its sandbox probe.

## 4. External audit adoption

Codex audit findings F-01..F-15: 14 CONFIRMED + 1 PARTIAL (Fable measurements 2026-07-17). Core adoption: **roadmap % ≠ product capability %**. The execution core (resident worker F-01, worker tool surface F-02/F-04, workflow executor tools F-03, real outbox handlers F-06, fresh-bootstrap migration parity F-08) became the R2 "Execution Activation" roadmap block — prerequisite for any real revenue operation.

**Per-finding disposition ledger (registered 2026-07-17 ~22:35 — CEO question exposed that the previous sentence claimed "recorded" while F-07/F-09..F-15 had NO disposition anywhere; SPEC-GAP rule 5 fix, measured `grep F-xx` across corpus+STATE):**

| Finding | Disposition | Where |
|---|---|---|
| F-01 resident worker | ✓ executed | R2.1 |
| F-02 worker real tool surface | ✓ executed | R2.2 |
| F-03 workflow executor tools | ✓ executed | R2.3 |
| F-04 grant→profile→runtime chain | ✓ executed | R2.2 (live F-02+F-04 chains) |
| F-05 spec-vs-runner gap | ✓ ruled | R2.3 + U12 (runner cancelled, responsibilities re-homed) |
| F-06 real outbox handlers | ✓ staged | R2.4 (staging; real providers = Phase-11 LOCKED) |
| F-07 social/payment/commerce integrations deferred WITHOUT canonical open item | **REGISTERED now** | roadmap R6.1 (Phase-11-gated open item) |
| F-08 migration ledger parity | ✓ executed | R2.5 (ledger=files deterministic) |
| F-09 E13 acceptance could pass on mock/demo evidence | **REGISTERED now** | E13.1 gate hardened: production-capability proofs mandatory, mock/demo evidence CANNOT close the row |
| F-10 empty live tables ≠ error, but production work unproven | ✓ discipline + evidence | Evidence-Before-Done + live production chains recorded in R2.2 (first autonomous delivery), R2.4 (real staging send), R3.1 (spoken Q→A) |
| F-11 training/capability lifecycle unproven | ◐ partially executed | R4.1 ✓ (library knows tools, training 1→75) + R4.2 OPEN row = execution home (grants>0, review>0, need-matrix) |
| F-12 University standalone product layer absent | **REGISTERED now** | roadmap R6.2 (OD-slot product row, Kelam pattern) |
| F-13 JARVIS not bound to canonical closure | ✓ bound | R3.1 ✓ + R3.2 ◐ + U15 ("MUST be solved before project end", mandatory E13.x read) |
| F-14 roadmap/STATE status drift | ✓ discipline | measured re-bases recorded in STATE (12:55 + 22:25); tonight's R3.2 ✓→◐ truth-restore is the enforcement example; drift check = each wave's STATE sync |
| F-15 real business pilot not mandatory at closure | **REGISTERED now** | E13.1 gate addition: closure requires Outleteuro pilot readiness attested (MASTER_PLAN Phase-11 definition), simulation cannot substitute |

## 5. Precedence

This directive ranks with the other 00-CEO-DIRECTIVE files: above module specs, below nothing except later CEO rulings. Conflicts resolve per corpus rule (CEO directive > MASTER_PLAN > module spec).
