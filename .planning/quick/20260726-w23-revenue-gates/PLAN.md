# TICKET 20260726-w23 — THE TWO WRITTEN GATES ACTUALLY FIRE (G3 + G4)

> Execution ticket, not a plan (CEO ruling 2026-07-13). Spec pointers only; zero new design.
> Author of this session: Opus 5 (U30 joint authorship — the session's authorized author).

## Row being executed

`HOLDING-OS-MASTER-PLAN/00-NOTE-FACTORY-COMPLETION-ROADMAP-2026-07-26.md` → **W2.3**:
*"The two written gates actually fire — zero-capital filter (G4) and evidence gate (G3):
`capital_required_eur` is compared nowhere, `evidence_refs` is validated nowhere."*

Closing evidence demanded by the row: *"a proposal above the capital limit is refused;
a proposal with unbacked evidence is refused"*.

## Owning spec text (already binding — nothing new is decided here)

- `REVENUE_ENGINE_SPEC` **G3** (§2): objectives may be born `proposed`, only the CEO
  transitions `proposed→active`, and *"proposals must carry research evidence refs — a
  proposal without opportunity citations is gate-rejected (anti-laziness rule)"*.
- `REVENUE_ENGINE_SPEC` **G4** (§2): *"while `capital_limit=0`, scoring hard-filters
  `capital_required_eur=0` opportunities; capital raises are CEO-only."*
- §6 `revenue/propose.ts`: *"every proposal row stores `evidence_refs jsonb` (opportunity
  ids + research task ids) — G3 gate"* → the citation shape the gate validates.
- §10 state machine + §13 authorization unchanged; this ticket adds no bypass (G8).

## Measured baseline (2026-07-26 15:48, live laptop DB)

| Fact | Value | How measured |
|---|---|---|
| objectives | `€50 net` = draft cap 0 · `e2e door proof` = closed cap 0 · **no active row** | `select … from objectives` |
| opportunities | 5 × `discovered/pending`, max `capital_required_eur` = 0 | `select … group by state,halal_verdict` |
| `capital_required_eur` compared | nowhere — `control_opportunity_score/_advance` never read it | read of migration `20260717020100` §4.6/§4.8 |
| `evidence_refs` validated | nowhere — `control_objective_create` checks `proposed_by` only | same migration §4.1 |

## What ships

1. `fn_revenue_capital_limit()` — the governing limit in ONE place: the most recent
   `active` objective's `capital_limit_eur`, else **0** (the safe end, §7bis). Mirrors the
   selection `packages/revenue/src/discovery.ts` already uses for the scout brief, so the
   brief and the gate cannot disagree.
2. **G4 at `control_opportunity_score`** — an opportunity needing more capital than the
   governing limit is refused (`CAPITAL_LIMIT`), never silently scored. Refusal is audited.
   It is NOT auto-rejected: capital raises are CEO-only, and a row he could unlock by
   raising the limit must still be there when he does.
3. **G4 at `control_opportunity_advance`** — the same check on every forward transition,
   so a row scored under a higher limit cannot walk into `piloting` after the CEO lowers it.
4. **G3 at `control_objective_create`** — a `proposed` objective must cite at least one
   opportunity that exists; empty, malformed, or unknown-id citations are refused
   (`EVIDENCE_GATE`). `draft` is untouched (the CEO's own door creates `draft`).

## Evidence contract (Evidence-Before-Done)

- RED first: `tests/c9/revenue-gates.test.ts` fails against today's functions.
- GREEN: same file passes after migration `20260726012000_w23_revenue_gates.sql`.
- Full `pnpm vitest run` green (no neighbour broken), `tsc -b` clean.
- Live door proof through the real DB: an over-limit opportunity refused, the same
  opportunity scored after the limit rises, a proposal without citations refused, a
  proposal citing a live opportunity accepted.
- Audit trail: `revenue.opportunity.capital_filtered` rows readable in `audit_log`.
- Registered adaptation written into the SPEC + U-table (CEO-visible), roadmap row closed.

## Boundaries (not in this ticket)

- W2.4 allocation→project→task seam (the next row) — `portfolio_allocate` capital math
  belongs there, not here.
- No UI change: both gates are door-level. If the CEO wants the refusal visible on
  `/revenue/opportunities`, that is a surface ticket with its own RULE #0 pass.
