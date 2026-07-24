// Decision aging (ledger 9c addition, CEO order 2026-07-24): machine-authored
// decision records auto-withdraw from the CEO's view after this many days.
// The decision_log TABLE keeps every row (archive discipline unchanged —
// 20260723001000 gives the CEO a manual purge door); only the /gov/decisions
// query ages. CEO-authored rows never age out.
export const DECISION_MACHINE_AGING_DAYS = 14;

export function decisionAgingCutoffISO(now: Date): string {
  return new Date(
    now.getTime() - DECISION_MACHINE_AGING_DAYS * 86_400_000,
  ).toISOString();
}

// PostgREST .or() filter: CEO rows forever, machine rows only past the cutoff.
export function decisionAgingOrFilter(now: Date): string {
  return `decided_by.eq.ceo,created_at.gte.${decisionAgingCutoffISO(now)}`;
}
