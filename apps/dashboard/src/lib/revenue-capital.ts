// W2.3b — the capital ceiling, made visible where the CEO looks
// (REVENUE_ENGINE_SPEC §7 surfaces + §7quater G4).
//
// W2.3 made the zero-capital-first filter real: `control_opportunity_score`
// and `control_opportunity_advance` refuse a candidate whose
// `capital_required_eur` exceeds the active objective's ceiling, and write
// `revenue.opportunity.capital_filtered` to the audit log. Measured
// 2026-07-26: that refusal existed ONLY in `audit_log` — the pipeline board
// showed the row exactly like any other, so a candidate stopped by MONEY was
// indistinguishable from one stopped by merit. The CEO is the only person who
// can raise the ceiling, and he could not see that anything was waiting on him.
//
// The comparison lives here as one pure function so the board and its tests
// read the same rule. The LIMIT itself is never recomputed in TypeScript —
// `fn_revenue_capital_limit()` stays the single source (U32); this module only
// compares a row against the number the database gave.

/** States where a candidate is still moving — the only ones a ceiling blocks. */
const LIVE_STATES = new Set(["discovered", "scored", "shortlisted", "piloting", "scaling"]);

/**
 * Is this candidate stopped by the capital ceiling rather than by its merit?
 *
 * `>` and not `>=`: a candidate that needs exactly the ceiling is affordable,
 * which is the same boundary `control_opportunity_score` enforces.
 */
export function isCapitalBlocked(
  capitalRequiredEur: number | null | undefined,
  limitEur: number,
  state: string,
): boolean {
  if (!LIVE_STATES.has(state)) return false;
  return Number(capitalRequiredEur ?? 0) > limitEur;
}

/** €1,250.00 — the board's money format, one place. */
export function fmtEur(n: number | null | undefined): string {
  return `€${Number(n ?? 0).toFixed(2)}`;
}

/** Fill {placeholders} in a dictionary line. Missing keys stay literal so a
 *  broken translation is visible rather than silently blank. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole,
  );
}
