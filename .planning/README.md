# .planning — MAP (which plan is current, which is dead)

> **THE single source of truth for all project work: [`HOLDING-OS-MASTER-PLAN/`](../HOLDING-OS-MASTER-PLAN/) at the repo root.**
> Written by Fable 5 in person from the CEO's BEKLENTİLER directive (2026-07-10).
> Contradiction order: CEO directive > `MASTER_PLAN.md` > module spec.

## CURRENT (work is planned and tracked HERE)

| File / dir | Role |
|---|---|
| `../HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-BEKLENTILER.md` | The CEO's A-to-Z directive (sanitized copy; original kept outside the repo) |
| `../HOLDING-OS-MASTER-PLAN/MASTER_PLAN.md` | Corpus spine — the 30 other specs are its children |
| `../HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md` | **THE execution plan being followed** — E-step tables (E1…E13), every ✓ carries evidence |
| `../HOLDING-OS-MASTER-PLAN/*_SPEC.md` (31 files) | Module contracts (org, routing, settings, HR, CRM…) |
| `STATE.md` | Live position: last activity, current step, quick-task ledger |
| `quick/` | GSD bookkeeping: one dir per work unit (PLAN.md = intent, SUMMARY.md = evidence). "Quick" = the tracking lane's NAME, not the quality level — E-step work recorded here follows the corpus specs in full |
| `governance/`, `research/`, `study-cards/`, `graphs/` | Standing references (directive mirrors, stack research, tool cards, knowledge graph) |

## HISTORY (execution records — not plans; do not delete)

| Dir | Role |
|---|---|
| `phases/` | Phase 1–9 execution records of the ORIGINAL build (PLAN/SUMMARY pairs per step). Phase-09 execution halted by the pivot; the record stays |
| `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md` | Original project definition trio (GSD scaffold). ROADMAP superseded for execution by IMPLEMENTATION_ROADMAP — banner on the file |

## DEAD (superseded — never plan from these)

| Dir | Role |
|---|---|
| `_ARCHIVE/2026-07-10-oncesi-pre-pivot/` | Pre-pivot master plan v1 + its PHASE-01..11 detail files. See `_ARCHIVE/README.md` |

## Reading order for a fresh session

1. `STATE.md` (where we are)
2. `../HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md` (what's next)
3. The relevant `*_SPEC.md` for the step at hand
