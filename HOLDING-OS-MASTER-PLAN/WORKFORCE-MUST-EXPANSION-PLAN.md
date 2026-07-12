# WORKFORCE-MUST-EXPANSION-PLAN — Revenue-Engine Completeness (E5.7)

> Author: **Fable 5, in person** (K2). Date: 2026-07-12. Sources: [[00-CEO-DIRECTIVE-MUST-ROSTER]] (binding order) · [[00-CEO-DIRECTIVE-GAP-AUDIT]] §3 (matrix contract) · [[MASTER_PLAN]] §1-2/§6 · [[WORKFORCE-GAP-MATRIX]] (E5.0 baseline) · external audit `Solo -kadro denetim raporu.odt` · live DB verification 2026-07-12.
> Scope: closes audit findings F1-F6 for the four revenue engines; defines the MUST roster expansion (+17), wave order, deputy/failover contract, and gate extensions. Full-org 12-column re-audit of all 20 departments = listed follow-up (§11), not silently dropped.

---

## 0. Verified baseline (evidence-before-done)

| Fact | Evidence (run 2026-07-12) |
|------|---------------------------|
| Live roster: 180 non-archived rows = 179 roster + orchestrator; 20/20 depts bound | `SELECT count(*) FROM agents WHERE employment_status <> 'archived'` → 180; sync --verify match 180 · diff 0 · fail 0 · PASS (E5.6 record) |
| 5 matrix-promised ADD roles absent (files + DB) | slug sweep → 0 rows; `personas/` grep → 0 files; revops=3 (matrix §3-10 promises 6), customer-success=3 (§3-9 promises 4), corp-comms pod=0 (§3-12 promises 1) |
| Matrix §4 arithmetic ("153−15−6+47=179") no longer describes the live composition — closure held the 179 count while dropping 5 promised roles | dept-count reconciliation table (this file §9); exact set-diff = E5.7e verification step |
| No commerce/venture/consultancy-delivery ownership in roster | `slug ~* 'commerce\|venture'` → marketing strategy/channel roles only (cross-border, china-ecommerce-operator, livestream-coach) |

## 1. The four revenue engines (corpus-derived, binding frame)

| Engine | Corpus source | What it needs from the roster |
|--------|--------------|-------------------------------|
| R1 Social-media-driven demand & sales | 00-CEO-DIRECTIVE-SOCIAL-MEDIA-DEPT; social-media dept 12/12 | Content→publish→inbox ops COVERED; **monetization surface (shops/creator/affiliate) UNOWNED** |
| R2 Own autonomous e-commerce companies (Outleteuro pilot: buy+sell fully autonomous WooCommerce store, then alt-OS spawn) | MASTER_PLAN §2/§6 Faz 11 (CEO verbal correction 2026-07-10) | **Full commerce operating cell UNOWNED** — platform, catalog, merchandising, orders, CRO, returns, analytics |
| R3 Technology consultancy & applied automation for clients | PROJECT.md business model; engineering client-stack seats | Presales COVERED (sales-engineer); **solution architecture + client implementation UNOWNED**; deal pricing UNOWNED |
| R4 Venture factory (spawn alt-OS companies) | MASTER_PLAN §6 Faz 11; PROJECT.md long-term model | Analysis COVERED (corporate-development-analyst — explicitly excludes build/launch); **thesis→live-company build UNOWNED** |

## 2. Organization model (Fable decision, per delegated authority)

Three options weighed:

1. **Scatter commerce duties across marketing/engineering/finance** — REJECTED: nobody owns the store's total result (the audit's core structural criticism).
2. **A new department per capability** — REJECTED: early bureaucracy, vanity-title risk (directive §3.2 ban).
3. **Hybrid (CHOSEN):** one first-class **`commerce` department** in the holding (the store-operating cell — clones into each e-commerce alt-OS at spawn time, Outleteuro first); **`venture-studio` pod** (strategy) and **`consultancy-delivery` pod** (customer-success) as named-owner pods; social-commerce seat inside social-media. Shared experts (engineering, data-ai, legal, finance, security…) stay holding-level.

Target org: **20 operating departments + 7 pods, 198 roster personas** (179 + 19). Departments table +1 row (`commerce`).

**v2 (2026-07-12, CEO plan approval):** Fable's independent discovery (order holding 3 — "floor, not ceiling" executed) added 2 roles the audit missed: **Stock-Lot & Liquidation Sourcing Specialist** (commerce — Outleteuro is an OUTLET; the margin engine is the BUY side: B-stock/overstock/returns-pallet/brand-surplus hunting, lot-manifest analysis, purchase proposals under the money-out gate; the audit covered only store operation/sell side) and **Managed Automation Services Engineer** (customer-success consultancy-delivery pod — 24/7 monitoring, SLA, incident response and monthly health reports for delivered client automations; converts consultancy from per-project revenue to recurring MRR; completes the chain sales-engineer sells → solutions architect designs → implementation lead activates → **this role keeps it alive**).

## 3. Capability matrix — 12-column contract (revenue-engine scope)

Columns per [[00-CEO-DIRECTIVE-GAP-AUDIT]] §3.1: `capability | department | required role | existing persona(s) | real coverage | overlap | missing authority | missing workflow | missing skill/MCP | risk if absent | decision | target phase`. Compact rendering below: **Cov** = real coverage of existing persona bodies (read, not filename-matched); **Risk** = risk if absent.

### R2 — Own e-commerce (Outleteuro-class autonomous store)

| Capability | Dept | Required role | Existing | Cov | Missing (authority/workflow/skill-MCP) | Risk if absent | Decision |
|---|---|---|---|---|---|---|---|
| Store P&L + total commercial result | commerce | Head of Commerce | none (CMO=demand, cross-border=strategy) | 0 | P&L authority; store operating cadence; store MCP profile | Autonomous store has no accountable owner; Outleteuro pilot cannot be accepted | **ADD (director)** |
| Store platform engineering (WooCommerce/WordPress: checkout, HPOS, plugin lifecycle, webhooks, Action Scheduler, staging/release, scale) | commerce | WooCommerce & WordPress Commerce Architect | engineering-cms-developer | 30% — persona self-limits to code/platform engineering, "does not operate stores"; generic multi-CMS | Store-platform ownership; release/rollback workflow for live store; Woo-specific depth | Platform breaks under autonomous operation; no one owns checkout integrity | **ADD (senior)**; boundary record vs cms-developer (client CMS work) |
| Automation & integration mesh (store↔CRM↔accounting↔inventory↔shipping↔email↔social shops) | commerce | Commerce Automation & Integration Engineer | data-ai workflow-architect | 20% — generic workflow engine, not commerce-domain operator | Integration ownership; failure/retry runbooks for order-money flows | "Full automation" promise (CEO) undeliverable; silent order/money leaks | **ADD (senior)**; boundary vs workflow-architect (engine vs domain) |
| Catalog/PIM automation (product data truth, 73-brand feed) | commerce | Catalog & PIM Automation Specialist | none | 0 | Catalog write authority; feed workflows; PIM tooling | Outleteuro's own KPI (Catalog Automation Rate) unowned | **ADD** |
| Merchandising, buying, pricing, promotions | commerce | Merchandising, Pricing & Promotions Manager | supply-chain-strategist (vendor side only) | 10% | Assortment/pricing authority (buying = money-out → approval gate); promo calendar workflow | Margin decisions ownerless; marketing drives traffic to wrong assortment | **ADD**; boundary vs supply-chain (vendor contracts stay finance) |
| Outlet buy-side sourcing (B-stock, overstock, returns pallets, brand surplus, lot-manifest analysis) | commerce | Stock-Lot & Liquidation Sourcing Specialist | supply-chain-strategist (vendor mgmt, not deal-hunting); china-ecommerce-operator (CN platforms only) | 5% — **Fable independent discovery, absent from audit** | Sourcing-deal authority (proposals only — purchase = money-out gate); lot evaluation workflow; supplier-discovery skill | An outlet that cannot buy right dies — Outleteuro's margin engine is cheap correct buying, not selling | **ADD** |
| Inventory, order lifecycle, fulfillment SLA | commerce | Inventory, Order & Fulfillment Manager | none | 0 | Stock-truth authority; order-lifecycle workflow; overselling prevention; demand forecast | Oversell/undersell; refund storms; dead stock capital | **ADD** |
| CRO & checkout optimization | commerce | CRO & Checkout Optimization Specialist | growth-hacker (acquisition-side) | 15% | Experiment authority on PDP/cart/checkout; abandonment workflow | Traffic bought but not converted — paid budget burns | **ADD**; boundary vs growth-hacker (acquisition vs conversion) |
| Customer ops: returns, refunds, chargebacks, delivery issues | commerce | Commerce Customer Ops & Returns Specialist | support-responder (CS, generic); retail-customer-returns (retired→library) | 20% | Refund authority (money-out gate); returns/chargeback workflow | EU consumer-law exposure; chargeback losses; CS drowning | **ADD** (library recall of retail-customer-returns as raw material — CEO decision item) |
| Commerce analytics & revenue intelligence (margin truth, attribution, LTV/CAC) | commerce | Commerce Analytics & Revenue Intelligence Specialist | analytics-reporter (data-ai, holding BI) + tracking-specialist (paid-media) | 25% — neither owns margin/store feedback loop | Store-data read authority; pricing-feedback workflow | Autonomous store cannot self-optimize; pricing flies blind — **Fable judgment: promoted from audit's MUST-B to full seat** | **ADD** |
| Marketplace & product feed ops (Merchant Center, Meta Catalog, Amazon) | marketing | (assigned owner) | marketing-cross-border-ecommerce | 60% | Feed-health KPI | Suspended feeds = zero visibility | **ASSIGN** (§5) |
| Payment ops & reconciliation | finance | (assigned owner) | treasury-ar-manager + bookkeeper | 70% | Named single operational owner + commerce pipe | Unreconciled revenue; audit risk | **ASSIGN** (§5) |
| Commerce fraud & abuse | security | (assigned owner) | CISO §7 first-turn | 50% | Split trigger recorded | Chargeback fraud scales with GMV | **ASSIGN** (§5) |
| Consumer-commerce compliance (Impressum, withdrawal, VAT, consent) | legal | (assigned owner) | legal-de/tr counsel + DPO | 70% | Commerce compliance checklist ownership | Fines; store takedown | **ASSIGN** (§5) |
| Lifecycle CRM & retention automation | revops | (assigned owner) | email-intelligence-engineer + **CRM & Data Steward (ADD, promise-debt)** | 40% | Lifecycle outcome ownership | Repeat-purchase revenue unowned | **ADD steward + ASSIGN** |

### R1 — Social-media-driven sales

| Capability | Dept | Required role | Existing | Cov | Missing | Risk if absent | Decision |
|---|---|---|---|---|---|---|---|
| Social commerce revenue (IG/TikTok Shop, creator/affiliate programs, shoppable content) | social-media | Social Commerce & Creator/Affiliate Lead | 12-seat dept = content/publish/inbox OPS; strategist=frame only | 15% | Shop/affiliate program authority; creator contract workflow (CEO gate); commerce-dept handoff | R1 engine produces reach but no owned transaction line | **ADD** |
| Demand→lead→sales handoff | social-media/sales | covered | inbox-manager (warm-lead harvest) + sales dept | 80% | — | — | KEEP |

### R3 — Consultancy & applied automation

| Capability | Dept | Required role | Existing | Cov | Missing | Risk if absent | Decision |
|---|---|---|---|---|---|---|---|
| Client current-state → target automation architecture | customer-success (consultancy-delivery pod) | Business Automation Solutions Architect | sales-engineer (presales truth only, self-limited) | 25% | Architecture authority post-sale; discovery→blueprint workflow | Consultancy sells promises no one designs; delivery quality collapses | **ADD (senior)** |
| Client onboarding & implementation | customer-success (pod) | Onboarding & Implementation Lead | none — **matrix-promised ADD, never materialized (F4)** | 0 | Activation workflow; client-env authority | Sold solutions never go live; churn | **ADD (promise-debt)** |
| Managed automation operations (post-delivery 24/7 monitoring, SLA, incident response, monthly health reports for client automations) | customer-success (pod) | Managed Automation Services Engineer | sre/infrastructure-maintainer (internal platform only, self-limited to holding infra); support-responder (generic tickets) | 10% — **Fable independent discovery, absent from audit** | Client-environment operational authority; SLA workflow; alert-to-fix runbooks | Consultancy stays per-project revenue; delivered automations rot; recurring MRR line never exists | **ADD** |
| Delivery management | project-management | covered | project-shepherd (+Evidence-Before-Done milestones) | 90% | — | — | KEEP |
| Deal pricing, discount governance | revops | Pricing & Deal Desk Manager | none — matrix-promised (F4) | 0 | Pricing authority adjacency to money gate; quote workflow | Margin leakage on every deal | **ADD (promise-debt)** |

### R4 — Venture factory

| Capability | Dept | Required role | Existing | Cov | Missing | Risk if absent | Decision |
|---|---|---|---|---|---|---|---|
| Thesis → live operating company (spawn playbook: org clone, roster assignment, workspace isolation, approval-gate wiring) | strategy (venture-studio pod) | Venture Builder / New Company Launch Lead | corporate-development-analyst — persona explicitly excludes build/launch | 20% | Launch authority (formation/money/contracts stay CEO-gated); alt-OS bootstrap workflow | Venture factory is a documented goal with no builder — R4 engine dead | **ADD (senior)** |
| Opportunity analysis, portfolio ops | strategy | covered | corporate-development-analyst | 85% | — | — | KEEP |
| Market entry DE/TR/EU | strategy | covered | global-expansion-lead | 80% | — | — | KEEP |
| Company formation legal/financial | legal/finance | covered | GC + legal-de/tr + CFO; CEO gates per constitution | 80% | no new title (audit concurs: separate "company formation" role = vanity) | — | KEEP |

### Cross-engine (promise-debt + governance)

| Capability | Dept | Required role | Existing | Cov | Risk if absent | Decision |
|---|---|---|---|---|---|---|
| Real sales outcome ownership (pipeline/conversion/revenue KPIs) | revops | Revenue Growth Specialist | none — **direct CEO E5.2 order, dropped (F4)** | 0 | CEO order unexecuted; growth unowned | **ADD (promise-debt)** |
| CRM data integrity (E12.4 gate dependency) | revops | CRM & Data Steward | none (F4) | 0 | CRM gate built on dirty data | **ADD (promise-debt)** |
| Corporate communications & reputation | marketing (corp-comms pod) | Corporate Communications Lead | none (F4); brand-guardian=identity only | 10% | Crisis with no comms owner | **ADD (promise-debt)** |
| Deputy/failover for critical single-owner roles | all | deputy map | none (F3) | 0 | Single point of failure org-wide | **MAP + in-body §2 for new personas** (§6) |

## 4. MUST-A roster — 19 new personas (Fable in person, §3.3 contract each; v2: +2 Fable-discovery seats)

| # | Persona | Dept / pod | Level | Manager | Deputy (in-body §2) | Wave |
|---|---------|-----------|-------|---------|--------------------|------|
| 1 | Revenue Growth Specialist | revops | specialist | RevOps Head | sales-pipeline-analyst | D7-A |
| 2 | CRM & Data Steward | revops | specialist | RevOps Head | revenue-reporting-agent | D7-A |
| 3 | Pricing & Deal Desk Manager | revops | specialist | RevOps Head | sales-proposal-strategist | D7-A |
| 4 | Onboarding & Implementation Lead | customer-success (consultancy-delivery pod) | specialist | Head of CS | project-shepherd | D7-A |
| 5 | Corporate Communications Lead | marketing (corp-comms pod) | specialist | CMO | design-brand-guardian | D7-A |
| 6 | Head of Commerce | commerce | **director** | CEO (dept head) | marketing-cross-border-ecommerce | D7-B |
| 7 | WooCommerce & WordPress Commerce Architect | commerce | senior_specialist | Head of Commerce | engineering-cms-developer | D7-B |
| 8 | Commerce Automation & Integration Engineer | commerce | senior_specialist | Head of Commerce | data-ai workflow-architect | D7-B |
| 9 | Catalog & PIM Automation Specialist | commerce | specialist | Head of Commerce | Commerce Automation Engineer (#8) | D7-B |
| 10 | Merchandising, Pricing & Promotions Manager | commerce | specialist | Head of Commerce | Head of Commerce (#6) | D7-B |
| 11 | **Stock-Lot & Liquidation Sourcing Specialist** (Fable discovery) | commerce | specialist | Head of Commerce | Merchandising Manager (#10) | D7-B |
| 12 | Inventory, Order & Fulfillment Manager | commerce | specialist | Head of Commerce | finance supply-chain-strategist | D7-B |
| 13 | CRO & Checkout Optimization Specialist | commerce | specialist | Head of Commerce | marketing-growth-hacker | D7-B |
| 14 | Commerce Customer Ops & Returns Specialist | commerce | specialist | Head of Commerce | cs support-responder | D7-B |
| 15 | Commerce Analytics & Revenue Intelligence Specialist | commerce | specialist | Head of Commerce | data-ai analytics-reporter | D7-B |
| 16 | Venture Builder (New Company Launch Lead) | strategy (venture-studio pod) | senior_specialist | Head of Strategy | corporate-development-analyst | D7-C |
| 17 | Business Automation Solutions Architect | customer-success (consultancy-delivery pod) | senior_specialist | Head of CS | sales-engineer | D7-C |
| 18 | **Managed Automation Services Engineer** (Fable discovery) | customer-success (consultancy-delivery pod) | specialist | Head of CS | Business Automation Solutions Architect (#17) | D7-C |
| 19 | Social Commerce & Creator/Affiliate Lead | social-media | specialist | Social Media Orchestrator | social-media content-strategist | D7-C |

Constitutional constants in every persona: money-out/contract/external-comm CEO gates; sales-DNA in commercial seats; Evidence-Before-Done; LiteLLM virtual keys; least-privilege MCP; English authorship. Boundary records written BOTH ways (new persona §7 + existing persona noted in wave record).

## 5. MUST-B — explicit owner assignments (no new headcount; §-amendments in D7-D)

| Capability | Named owner (single) | Amendment | Split trigger |
|---|---|---|---|
| Marketplace & feed ops | marketing-cross-border-ecommerce | feed-health KPI + Merchant Center/Meta Catalog ownership in §3/§6 | marketplace GMV > store GMV or suspension event |
| Payment ops & reconciliation | finance treasury-ar-manager | commerce reconciliation workflow line (§3); pipes built by #8 | multi-store reconciliation load |
| Commerce fraud & abuse | security CISO | already first-turn per matrix; commerce fraud line recorded | chargeback rate threshold breach |
| Consumer-commerce compliance | legal-de counsel | commerce compliance checklist ownership (§3) | second live store |
| Marketplace account health | marketing-cross-border-ecommerce | health monitoring + suspension playbook | first suspension/penalty |
| Lifecycle CRM & retention | CRM & Data Steward (#2) + email-intelligence-engineer | outcome owner = #2 (in-body from birth) | — |
| Messaging commerce (WhatsApp/Telegram sales channel — TR market DNA; Fable discovery, seat rejected as vanity) | social-media inbox-manager + engineering email-intelligence-engineer | messaging-channel sales workflow line (§3) both | messaging-attributed revenue share threshold or second market launch |
| Venture portfolio ops | corporate-development-analyst | none — already covered | — |
| Company formation | GC + counsels + CFO | none — separate title would be vanity | — |

## 6. Deputy/failover contract (F3 remediation)

1. **New personas (17):** §2 carries `Deputy:` line + takeover protocol (trigger, temporary authority grant, resume handback) — in-body from birth.
2. **`DEPUTY-FAILOVER-MAP.md`** (D7-D deliverable): holding-wide map for critical single-owner roles — columns `role | deputy | takeover trigger | temporary authority | memory/context access | resume protocol`. Initial SPOF set (audit F3 + heads): Privacy/DPO→legal-compliance-checker · Backup & DR Officer→platform sre · IAM & Secrets Officer→security-engineer · Payroll Manager→bookkeeper-controller · AI Observability & FinOps→fpa-analyst · Board/Decision Secretary→executive-operations-manager · every dept head→named senior in dept.
3. Existing-persona §2 amendments (179 bodies): **honest follow-up list** (§11) — map is authoritative until amendments land.

## 7. Wave plan (all persona authorship: Fable in person — K2)

| Wave | Content | Preconditions | Evidence contract (per established E5.5 battery) |
|------|---------|---------------|--------------------------------------------------|
| **D7-A** | Promise-debt 5 (#1-5) + agents rows migration | CEO approval of §10 | mechanical gate 5/5 PASS (explicit file list) · fn_persona_submit+gate passed ×5 (English 5-question verdicts) · bind persona_id+hook v1 · revops 6/6, CS 4/4, marketing 33/33 · migration idempotent 2× · sync --verify diff 0 fail 0 · gitleaks clean |
| **D7-B** | `commerce` department migration (+dept row, +10 agents rows, head=director, manager chain) + 10 personas (#6-15) + retail-customer-returns library recall as raw material | D7-A committed | dept row + director_id set · gate 10/10 · gate passed ×10 · commerce 10/10 bound · orphan 0 · idempotent 2× · sync PASS · gitleaks |
| **D7-C** | Venture/consultancy/social-commerce 4 (#16-19) + pod records | D7-B committed | gate 4/4 · passed ×4 · strategy 7/7, CS 6/6, social-media 13/13 · sync **match 199 = 198 roster + orchestrator mirror** · gitleaks |
| **D7-D** | DEPUTY-FAILOVER-MAP.md + MUST-B §-amendments (8 existing personas incl. messaging-commerce pair) + §9 reconciliation set-diff table + roadmap/matrix/STATE closure records | D7-C committed | map file exists with SPOF set covered · amended personas re-gated · matrix-promised-ADD-absent sweep → **0** · roadmap E5.7 rows ✓ with evidence |

Time honesty: Fable window closes 2026-07-12 night. Order is insurance-priority (promise-debt first — already-approved roster, E12.5 fails without it; deepest new expertise second). Any wave not finished → "awaiting Fable authorship" list per K2; **no other model may write these personas.** Infrastructure steps E5.4b/E6.0 are K1 (Fable/GPT 5.6 solo) and survive the window — they slide behind persona work (recorded, not silent).

## 8. Roadmap & gate integration (edits shipped with this plan)

1. **E5.7 block** added to IMPLEMENTATION_ROADMAP (a=this plan+CEO approval, b/c/d/e=waves) — F-only, evidence-command per row.
2. **E5.0 row**: recorded correction note (✓ stands for legacy disposition; discovery deficiency remediated by E5.7). No silent rewriting of history.
3. **E12.5 Workforce Completeness Gate** extended: matrix-promised ADD absent = 0 · capability coverage reported against THIS matrix (§3) not persona count · DEPUTY-FAILOVER-MAP exists and covers SPOF set.
4. **WORKFORCE-GAP-MATRIX** §7 addendum: arithmetic correction + pointer here.

## 9. Roster arithmetic reconciliation (F4 transparency)

Matrix §4 formula `153 − 15 − 6 + 47 = 179` vs live: 180 non-archived rows (incl. orchestrator) reached **without** 5 promised ADDs ⇒ net +5 substitution drift somewhere in wave migrations. Verified dept counts (2026-07-12): ceo 6 · strategy 6 · finance 10 · legal 7 · risk-audit 4 · security 8 · data-ai 11 · platform 6 · engineering 23 · quality 9 · marketing 32 · paid-media 7 · sales 7 · revops 3 · customer-success 3 · project-management 5 · design 10 · product 5 · social-media 12 = 180. **D7-E verification step:** SQL set-diff of live slugs vs matrix §2/§3 promise list → exact substitution table recorded in D7-D closure (no number is trusted until it closes).

Post-expansion targets: roster **198** (+19) · sync match **199** · departments table **22 rows** (20 operating + ceo + legal-de pod) · pods **7** (china-growth, corporate-comms, partnerships, global-expansion, docs, venture-studio, consultancy-delivery).

## 10. CEO decision block (approval required before D7-A — E5.0/E5.3b precedent: org changes are CEO-gated)

1. **+19 MUST roster (§4 — incl. 2 Fable-discovery seats), target org 198 personas / 20 departments + 7 pods, new `commerce` department** — approve?
2. **retail-customer-returns recall from library** as raw material for #14 (archive→rewrite→activate path; matrix retire decision said "recall possible with CEO approval") — approve?
3. **Wave order D7-A→D (insurance-priority) + honest-tail rule** (unfinished → "awaiting Fable authorship"; E5.4b/E6.0 slide behind persona work) — approve?

> **✅ CEO APPROVAL GIVEN — 2026-07-12 ~15:55 (plan approval, session record):** all three items approved via the v2 execution plan (`~/.claude/plans/serialized-petting-creek.md`) after the CEO's independent-discovery challenge was answered (v2 additions #11, #18). D7-A may proceed.

## 11. Honest follow-up list (recorded, CEO-schedulable — not silently dropped)

1. Full-org 12-column capability re-audit of all 20 departments (analysis work — post-Fable executable by GPT 5.6 solo under K1; verdicts at strongest available model).
2. Deputy/failover §2 amendments for the existing 179 persona bodies (K2: Fable-class authorship — goes on awaiting-list if window closes).
3. §9 substitution set-diff table (D7-D; if unreached, first post-Fable task).
4. E12.5 automated sweep implementation (SQL in gate script) for matrix-promised-ADD-absent = 0.
5. Pre-directive Turkish persona translation pass (standing optional follow-up per language directive).
