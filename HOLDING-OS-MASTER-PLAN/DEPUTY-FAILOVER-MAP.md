# DEPUTY-FAILOVER-MAP — Holding-Wide Single-Owner Failover Contract

**Status:** LIVE (D7-D deliverable, E5.7e) · **Author:** Fable 5, in person · **Date:** 2026-07-12
**Source of obligation:** external audit finding F3 (no persona had a deputy/failover definition) → [[00-CEO-DIRECTIVE-MUST-ROSTER]] holding 6 → [[WORKFORCE-MUST-EXPANSION-PLAN]] §6.
**Authority rule:** this map is the AUTHORITATIVE failover source for every role listed. The 19 D7-wave personas additionally carry their deputy in-body (§2/dossier); for the remaining 179 pre-expansion bodies, in-body §2 amendments are the recorded honest follow-up (plan §11) — until those land, THIS FILE governs.

## 1. Takeover protocol (applies to every row)

1. **Trigger fires** (see per-row trigger; generic triggers: agent hard-down > SLA window, hook_violations halt unresolved > 1 cycle, model/brain outage without fallback, CEO manual order).
2. **Temporary authority grant:** deputy operates ONLY within the "temporary authority" column — never the full seat. Everything outside that column QUEUES for the owner's return or escalates to the manager. **Hard gates never transfer:** money-out, contracts, identity steps stay CEO-gated regardless of who operates.
3. **Memory/context access:** deputy reads the owner's recorded artifacts (ledgers, registries, runbooks — per row); deputy never writes to the owner's append-only records under the owner's name; deputy actions are logged under the deputy's own identity with a `acting-for:<slug>` marker.
4. **Resume protocol:** owner returns → deputy hands back with a written delta note (what happened, what was decided, what queued); the delta note enters the owner's record; open deputy actions transfer explicitly, never silently.

## 2. SPOF officer set (audit F3 initial set)

| Role (owner) | Deputy | Takeover trigger | Temporary authority | Memory/context access | Resume protocol |
|---|---|---|---|---|---|
| `privacy-dpo` (legal) | `legal-compliance-checker` | owner down > 24h OR privacy-incident clock running | privacy-incident response per DPO runbooks; DSAR clock-keeping; breach-notification prep (send = CEO-gated) | DPO runbooks, incident register, DSAR log (read) | delta note + open-incident handover |
| `backup-dr-officer` (platform) | `sre` | owner down during any restore-drill window or DR event | execute documented restore runbooks; declare restore-verification results | DR runbooks, drill evidence archive (read) | delta note + drill-evidence transfer |
| `iam-secrets-officer` (security) | `security-engineer` | owner down > 12h OR active credential-compromise event | freeze/rotate per pre-approved runbooks (freeze always; NEW grants queue); emergency revocation | IAM runbooks, grant register (read) | delta note + rotation log review |
| `payroll-manager` (finance) | `finance-bookkeeper-controller` | owner down across a payroll deadline | prepare payroll run to gate-ready state (execution = CEO money-out gate, untransferable) | payroll calendar, prior run records (read) | delta note + run reconciliation |
| `ai-observability-finops-analyst` (data-ai) | `finance-fpa-analyst` | owner down > 48h OR budget alert ≥ 70% band firing | read dashboards, verify Cost Monitor feeds, raise band alerts | cost dashboards, alert config (read) | delta note + alert-state handover |
| `board-decision-secretary` (ceo) | `executive-operations-manager` | owner down across a decision-record cycle | record decisions verbatim to the register (no interpretation authority) | decision register (append, acting-for marker) | delta note + register review |

## 3. Department heads (every head → named senior/strongest seat in dept)

| Head (owner) | Dept | Deputy | Temporary authority (uniform) |
|---|---|---|---|
| `chief-of-staff` | ceo | `executive-operations-manager` | Uniform head-deputy authority: keep the dept cadence running (standing reviews, intake triage, escalation routing); rule on IN-ENVELOPE operational conflicts; escalate everything envelope-touching, strategic, or cross-department to the orchestrator/CEO line. NO new envelopes, NO policy changes, NO hires/role changes, NO outward commitments — those queue. Memory access: dept decision logs + standing reports (read; deputy logs acting-for). Resume: delta note per §1.4. |
| `head-of-strategy` | strategy | `market-intelligence-lead` | (uniform, above) |
| `cfo` | finance | `treasury-ar-manager` | (uniform) |
| `general-counsel` | legal | `legal-de-counsel` | (uniform) |
| `enterprise-risk-manager` | risk-audit | `internal-auditor` | (uniform) |
| `ciso` | security | `iam-secrets-officer` | (uniform) |
| `chief-ai-officer` | data-ai | `model-evaluation-lead` | (uniform) |
| `platform-head` | platform | `backup-dr-officer` | (uniform) |
| `engineering-software-architect` | engineering | `engineering-backend-architect` | (uniform) |
| `quality-head` | quality | `testing-reality-checker` | (uniform) |
| `cmo` | marketing | `marketing-growth-hacker` | (uniform) |
| `paid-media-ppc-strategist` | paid-media | `paid-media-paid-social-strategist` | (uniform) |
| `head-of-sales` | sales | `sales-deal-strategist` | (uniform) |
| `revops-head` | revops | `sales-pipeline-analyst` | (uniform) |
| `head-of-customer-success` | customer-success | `business-automation-solutions-architect` | (uniform) |
| `project-management-studio-producer` | project-management | `project-management-project-shepherd` | (uniform) |
| `head-of-design` | design | `design-ux-architect` | (uniform) |
| `product-manager` | product | `product-sprint-prioritizer` | (uniform) |
| `social-media-orchestrator` | social-media | `social-content-strategist` | (uniform) |
| `head-of-commerce` | commerce | `marketing-cross-border-ecommerce` | (uniform; matches the in-body record — P&L-committing decisions queue or go to CEO) |
| `chro` | people-hr | `persona-workforce-architect` | (uniform) |

## 4. D7-wave seats (19) — in-body deputies, mirrored here for one-map completeness

| Owner | Deputy (in-body §dossier) |
|---|---|
| `revenue-growth-specialist` | `sales-pipeline-analyst` |
| `crm-data-steward` | `revenue-reporting-agent` |
| `pricing-deal-desk-manager` | `sales-proposal-strategist` |
| `onboarding-implementation-lead` | `project-management-project-shepherd` |
| `corporate-communications-lead` | `design-brand-guardian` |
| `head-of-commerce` | `marketing-cross-border-ecommerce` |
| `woocommerce-architect` | `engineering-cms-developer` |
| `commerce-integration-engineer` | `workflow-architect` |
| `catalog-pim-specialist` | `commerce-integration-engineer` |
| `merchandising-pricing-manager` | `head-of-commerce` |
| `stock-lot-sourcing-specialist` | `merchandising-pricing-manager` |
| `inventory-fulfillment-manager` | `supply-chain-strategist` |
| `cro-checkout-specialist` | `marketing-growth-hacker` |
| `commerce-returns-specialist` | `support-support-responder` |
| `commerce-analytics-specialist` | `analytics-reporter` |
| `venture-builder` | `corporate-development-analyst` |
| `business-automation-solutions-architect` | `sales-engineer` |
| `managed-automation-services-engineer` | `business-automation-solutions-architect` |
| `social-commerce-creator-lead` | `social-content-strategist` |

## 5. Gate integration & maintenance

- **E12.5 Workforce Completeness Gate** requires this file to exist and cover the SPOF set (roadmap row updated in E5.7a) — this file satisfies that clause; the gate's sweep should verify every §2/§3 deputy slug resolves to a live, non-archived agents row.
- **Maintenance rule:** any role addition/retirement touching a row here updates this map in the same commit (map drift = gate finding).
- **Honest follow-up (plan §11):** in-body §2 deputy amendments for the 179 pre-expansion bodies remain CEO-schedulable follow-up; this map governs until each lands.
