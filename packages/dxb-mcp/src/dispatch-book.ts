// B43 plan ② — THE DISPATCH BOOK (CEO 2026-09-05: "plan2 olan sevk defterini yeni oturumda").
//
// Measured before it existed (2026-09-05 00:5x, C27): the department's exam film had been
// made by a session's own subagents playing the seats, because the company's road had no
// door through which a director's plan becomes ONE TASK PER NAMED SEAT. `queue_create_task`
// births a task without a seat and without a project; the resident worker then staffs it
// with whoever is least loaded — so "the Creative Director's plan" could never travel seat
// to seat through the queue. What already existed underneath: `tasks.depends_on` and a
// dependency-aware `claim_next_task` (a task is claimable only when every task it waits
// for is done), and task lanes that grow to the queue within ten seconds (A17).
//
// This module is the PURE half of that door — the sheet's contract and the graph checks —
// so the shape can be proven without an engine. The writing half lives in
// groups/queue.ts (`queue_dispatch`), in one transaction: a sheet is born whole or not
// at all.
//
// THE CEO'S TIME CHALLENGE IS THE DESIGN RULE (01:3x, "sevk defteri o zaman 15 sn'lik bir
// reklamı 2 saatte ancak bitirir ya"): a sheet is a GRAPH, not a line. Seats that wait
// only for the same upstream task run AT ONCE in separate lanes; the levels computed
// here are what the record shows him — [engineer] → [five reviewers together] → [verdict].
import { z } from "zod";

export const SEAT_SLUG = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "an employee slug (lower-case letters, digits, dashes)");

/** A product or job code, `DXB-<TYPE>-<CLIENT>-<SEQ>` in the studio's own catalogue idiom. */
export const SHEET_CODE = z
  .string()
  .min(3)
  .max(60)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, "a product or job code (letters, digits, . _ -)");

/** Runaway cap, the same idea as decompose's batch cap: a sheet names the seats a JOB
 *  needs (a UGC ≈ 4–5, a full spot ≈ 8), never the whole department by reflex. */
export const MAX_SEATS = 12;

export const SheetSeat = z.object({
  seat: SEAT_SLUG,
  objective: z.string().min(20),
  output_contract: z.string().min(10),
  /** ONE line for the CEO's live feed (B10): English and Turkish, both required. */
  label: z.string().min(1).max(120),
  label_tr: z.string().min(1).max(120),
  /** forward-only indices of EARLIER seats on this sheet */
  deps: z.array(z.number().int().min(0)).default([]),
  priority: z.number().int().min(0).max(9).optional(),
  approval_class: z.enum(["none", "internal", "outward"]).default("none"),
  budget_max_tokens: z.number().int().positive().optional(),
});
export type SheetSeat = z.infer<typeof SheetSeat>;

export const CallSheet = z.object({
  /** the author's own task — its department, project, tier and priority are inherited */
  task_id: z.string().uuid(),
  code: SHEET_CODE,
  seats: z.array(SheetSeat).min(1).max(MAX_SEATS),
});
export type CallSheet = z.infer<typeof CallSheet>;

/** deps point only at earlier seats — cycles are impossible by construction (dispatch.ts idiom). */
export function assertForwardDeps(seats: ReadonlyArray<{ deps: number[] }>): void {
  seats.forEach((s, i) => {
    for (const d of s.deps) {
      if (!Number.isInteger(d) || d < 0 || d >= i) {
        throw new Error(`queue_dispatch: seat[${i}] deps must be indices of EARLIER seats on the sheet, got ${d}`);
      }
    }
    if (new Set(s.deps).size !== s.deps.length) {
      throw new Error(`queue_dispatch: seat[${i}] lists the same dependency twice`);
    }
  });
}

/** 0 for a seat that starts at once; otherwise one more than the deepest seat it waits for. */
export function sheetLevels(seats: ReadonlyArray<{ deps: number[] }>): number[] {
  const levels: number[] = [];
  seats.forEach((s, i) => {
    levels[i] = s.deps.length === 0 ? 0 : 1 + Math.max(...s.deps.map((d) => levels[d]));
  });
  return levels;
}

/** The sheet as the CEO reads it: which seats work at the same time. */
export function groupByLevel(levels: readonly number[]): number[][] {
  const groups: number[][] = [];
  levels.forEach((l, i) => {
    (groups[l] ??= []).push(i);
  });
  return groups;
}

export interface SheetUpstream {
  task_id: string;
  seat: string;
  label: string;
}

/**
 * The channel between seats is the SHEET, exactly as on a real set: a dependant's task
 * text names the upstream tasks it waits for, and the seat reads their results with
 * `queue_get` — the worker module itself stays without any task-to-task channel
 * (worker-shim.ts header, LOCKED). Written by code after the uuids exist, never by the
 * author (who cannot know them when the sheet is drafted).
 */
export function inputsParagraph(code: string, upstream: readonly SheetUpstream[]): string {
  return [
    "",
    `INPUTS FROM THE DISPATCH BOOK (sheet ${code}). This task waits for the tasks below and ` +
      "starts only when they are done. Before anything else, read each of them with queue_get " +
      "and take its result as your input — the file paths, findings and measurements are in " +
      "that result, not in this text:",
    ...upstream.map((u) => `- task ${u.task_id} — ${u.seat}: ${u.label}`),
  ].join("\n");
}

export interface SheetTaskRecord {
  index: number;
  seat: string;
  task_id: string;
  depends_on: string[];
  level: number;
  label: string;
}

export interface SheetRecord {
  code: string;
  author_task_id: string;
  project_id: string | null;
  tasks: SheetTaskRecord[];
  /** indices of the seats that work at the same time, level by level */
  levels: number[][];
}
