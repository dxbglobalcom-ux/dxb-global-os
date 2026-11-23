import { afterEach, beforeEach, expect } from "vitest";
import { offencesOf, tail, verdictOf, workDirectories, type Answer } from "./fixture-repo.ts";

// What the cases of more than one test file expect of an answer that is not
// green, and of the place a run works in.

/** The kinds among the offences printed, each once, sorted. */
export const kindsOf = (answer: Answer): string[] => [...new Set(offencesOf(answer).map((offence) => offence.kind))].sort();

/** The offences of one kind whose detail names this case. */
export const naming = (answer: Answer, kind: string, caseName: string) =>
  offencesOf(answer).filter((offence) => offence.kind === kind && offence.detail.includes(caseName));

/** Red, exit 1, and the last line counts the offence lines printed above it. */
export function expectRed(answer: Answer): void {
  expect(verdictOf(answer), tail(answer)).toMatchObject({ word: "LOCK_RED", fields: { piece: "piece-a", offences: String(offencesOf(answer).length) } });
  expect(offencesOf(answer).length).toBeGreaterThan(0);
  expect(answer.code).toBe(1);
}

/**
 * Refused: the last line is `LOCK_REFUSED <why>`, exit 2 — and the reason
 * carries `itsWord`, so a refusal for another reason is not taken for this one.
 */
export function expectRefused(answer: Answer, itsWord: string): void {
  expect(answer.lines.at(-1), tail(answer)).toMatch(/^LOCK_REFUSED \S/);
  expect(answer.lines.at(-1)).toContain(itsWord);
  expect(answer.code).toBe(2);
}

/** "The work directory is gone after each run" — asked after every case of the test file that calls this. */
export function expectNoWorkDirectoryLeftByACase(): void {
  let standingBefore: string[];
  beforeEach(() => {
    standingBefore = workDirectories();
  });
  afterEach(() => {
    expect(workDirectories()).toEqual(standingBefore);
  });
}
