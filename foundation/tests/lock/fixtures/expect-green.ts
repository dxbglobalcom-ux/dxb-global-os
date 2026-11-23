import { expect } from "vitest";
import { offencesOf, tail, verdictOf, type Answer } from "./fixture-repo.ts";

/** Green: not one offence line, the last line LOCK_GREEN for the fixture's piece — and for this candidate, when one is given — exit 0. */
export function expectGreen(answer: Answer, candidate?: string): void {
  expect(offencesOf(answer), tail(answer)).toEqual([]);
  const verdict = verdictOf(answer);
  expect(verdict).toMatchObject({ word: "LOCK_GREEN", fields: { piece: "piece-a" } });
  if (candidate !== undefined) expect(verdict.fields.candidate).toBe(candidate);
  expect(answer.code).toBe(0);
}
