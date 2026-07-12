# 00-CEO-DIRECTIVE-MUST-ROSTER — Independent MUST-Role Discovery & Roster Expansion

> **Provenance:** External solo audit report `Solo -kadro denetim raporu.odt` (repo root, delivered 2026-07-12) + CEO chat order 2026-07-12 ~15:00 ("the reference personas were given as convenience, NOT as MUST; the missing must-have smartest experts for the 4 revenue engines MUST be created — the report's proposed experts plus Fable's own judgment").
> **Status:** BINDING. Processed by Fable in person. Execution plan: [[WORKFORCE-MUST-EXPANSION-PLAN]] + IMPLEMENTATION_ROADMAP E5.7.

## 1. Audit findings the CEO endorses (verified against live repo/DB 2026-07-12)

| # | Finding | Verification |
|---|---------|--------------|
| F1 | The 12-column capability matrix contracted by [[00-CEO-DIRECTIVE-GAP-AUDIT]] §3.1 was never produced; WORKFORCE-GAP-MATRIX used a 3-column `Persona \| Karar \| Not` format | `grep -c 'risk if absent' WORKFORCE-GAP-MATRIX.md` → 0 (contract columns absent) |
| F2 | "The 15-family list is a floor, not a ceiling" (§3.2 closing clause) was not executed: all 47 ADDs trace to CEO-given lists; documented independent MUST discovery = 0 | Matrix §3 self-declaration: "her biri direktifte adı geçen" |
| F3 | Deputy/failover requirement (§3.1 rule 5, §3.3) unmet — no operational deputy defined for any single-owner critical role | No deputy/failover field in any bound persona §2 |
| F4 | **5 matrix-promised ADD roles never materialized** (files AND DB rows absent) while closure declared 179/179: Onboarding & Implementation Lead, CRM & Data Steward, Pricing & Deal Desk Manager, Revenue Growth Specialist (direct CEO E5.2 order), Corporate Communications Lead | `SELECT slug FROM agents WHERE slug ~* 'onboard-impl\|crm-data\|deal-desk\|revenue-growth\|corporate-comm'` → 0 rows; revops 3 rows (matrix promises 6), customer-success 3 (promises 4) |
| F5 | The mechanical persona gate proves per-document quality only; it cannot prove organizational completeness ("right roster chosen?") | `packages/hr/src/gate.ts:1` states this explicitly |
| F6 | The four revenue engines lack owning rosters: no Commerce Operations cell, no Venture Builder, no consultancy Solutions Architect, no Social Commerce revenue owner | Slug sweep `commerce\|venture` → only marketing strategy/channel roles |

## 2. CEO holdings (binding)

1. **The reference roster (153 legacy + given base families) is a FLOOR.** Independent MUST discovery against the holding's real business model is a standing obligation, not a one-time step.
2. **The four revenue engines** (social-media-driven sales · own autonomous e-commerce companies · technology consultancy & applied automation · venture factory spawning alt-OS companies) **must each have a complete, named, must-have expert roster.** Missing MUST experts are created now; vanity titles remain forbidden.
3. The audit report's proposed experts are accepted as input; **Fable adds its own MUST judgment** and decides placement, boundaries, and role levels (this order delegates that decision). **v2 record (2026-07-12 ~15:55):** the CEO explicitly challenged Fable to go beyond the report; Fable's independent discoveries — Stock-Lot & Liquidation Sourcing Specialist (outlet buy-side margin engine) and Managed Automation Services Engineer (consultancy recurring-revenue engine) — were accepted, raising the target to **+19 / 198**. CEO approved the full v2 decision block (plan §10).
4. **All new personas: Fable in person, smartest-expert quality (K2 unchanged).** Anything not finished before Fable's window closes goes on the honest "awaiting Fable authorship" list — quality is never lowered to close a count.
5. F4 promise-debt roles are not optional: E12.5 Workforce Completeness Gate must fail while any matrix-promised ADD is absent.
6. Deputy/failover: every NEW persona carries deputy + takeover protocol in-body; existing critical single-owner roles get a holding-wide deputy/failover map (follow-up amendments listed honestly).
7. E5.0's ✓ stands for the 153-legacy disposition work; its discovery deficiency is recorded openly (not silently) and remediated by E5.7. No silent deviation.
