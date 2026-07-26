// W2.3b — the capital refusal is visible where the CEO looks
// (REVENUE_ENGINE_SPEC §7 + §7quater, CEO order 2026-07-26 16:45).
//
// The rule the board renders must be the rule the door enforces. These cases
// pin the comparison itself; the door's own behaviour is pinned by
// tests/c9/revenue-gates.test.ts, and the two must never drift apart.
import { describe, expect, it } from "vitest";
import { fill, fmtEur, isCapitalBlocked } from "../../apps/dashboard/src/lib/revenue-capital.js";

describe("W2.3b — which candidate is stopped by money rather than by merit", () => {
  it("marks a candidate that needs more capital than the active ceiling", () => {
    expect(isCapitalBlocked(900, 0, "discovered")).toBe(true);
    expect(isCapitalBlocked(900, 1000, "discovered")).toBe(false);
  });

  it("treats 'exactly the ceiling' as affordable — the door's own boundary", () => {
    // control_opportunity_score refuses on `>`, never on `>=`; a board that
    // marked this row would accuse the gate of something it did not do.
    expect(isCapitalBlocked(1000, 1000, "scored")).toBe(false);
  });

  it("never marks a candidate that already left the pipeline", () => {
    for (const state of ["rejected", "retired"]) {
      expect(isCapitalBlocked(5000, 0, state)).toBe(false);
    }
  });

  it("reads a missing capital figure as zero capital, not as a block", () => {
    expect(isCapitalBlocked(null, 0, "discovered")).toBe(false);
    expect(isCapitalBlocked(undefined, 0, "shortlisted")).toBe(false);
  });

  it("formats money the way the board does", () => {
    expect(fmtEur(900)).toBe("€900.00");
    expect(fmtEur(null)).toBe("€0.00");
  });

  it("fills a translated line, and leaves an unknown placeholder visible", () => {
    expect(fill("Needs {needed}, ceiling is {limit}", { needed: "€900.00", limit: "€0.00" })).toBe(
      "Needs €900.00, ceiling is €0.00",
    );
    // a broken translation must be SEEN, never silently rendered as a gap
    expect(fill("Aktif tavan: {limit} {oops}", { limit: "€0.00" })).toBe("Aktif tavan: €0.00 {oops}");
  });
});
