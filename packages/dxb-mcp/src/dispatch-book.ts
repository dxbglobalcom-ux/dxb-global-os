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
//
// THE CLOCK, AS HE DECIDED IT ON 2026-09-13 (time-line-retired-budget-per-job-zero-idle,
// budget-per-job-zero-idle-plan-approved): plan ②'s line (engine + 12 min) was the exam and is
// not a production constraint. What the book carries from here: a MINUTES BUDGET PER SEAT on
// the sheet (`budget_minutes`, written into the task's `due_at` along the dependency chain),
// and a TIMES TABLE the book measures per seat — budget · idle before claim · actual · the
// judge's milliseconds · the engine's seconds · the non-engine/engine ratio (1.2 on
// DXB-V-EYW-005). A seat over its budget is asked WHY by the verdict seat; a film is never
// failed by the clock. Measured on 005 before the decision: of 12 min 20 s outside the
// engine, ≈ 10:55 was the seats thinking and ≈ 1:25 was waiting.
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

/** a seat's minutes budget — a real number of minutes, at most a day (a sheet is a job, not a project) */
export const BUDGET_MINUTES = z.number().positive().max(24 * 60);

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
  /** minutes this seat is given, claim → done; the engineer's covers the engine's own time.
   *  Written into the task's due_at along the chain; measured by queue_sheet_times; never a
   *  reason to fail a film (CEO 2026-09-13). Omitted = the seat runs unbudgeted, recorded so. */
  budget_minutes: BUDGET_MINUTES.optional(),
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
  /** the sheet's minutes for this seat, or null when the author wrote none (sheets before 2026-09-13 carry no field) */
  budget_minutes?: number | null;
  /** the task's due_at as written (ISO), or null when unbudgeted */
  due_at?: string | null;
}

export interface SheetRecord {
  code: string;
  author_task_id: string;
  project_id: string | null;
  tasks: SheetTaskRecord[];
  /** indices of the seats that work at the same time, level by level */
  levels: number[][];
  /** the longest budgeted chain on the sheet — the job's own budget as the CEO reads it (0 when nothing is budgeted) */
  budget_minutes_total?: number;
  budgeted?: "all" | "some" | "none";
}

// ---------------------------------------------------------------------------------------
// THE CLOCK — pure, so the shape is proven without an engine (tests/b43/dispatch-book.test.ts)
// ---------------------------------------------------------------------------------------

export interface SheetDeadlines {
  /** minutes after the sheet's birth by which seat i is due; null = the seat carries no budget */
  due_offset_minutes: Array<number | null>;
  /** the longest chain of budgets through the graph — unbudgeted seats add nothing */
  budget_minutes_total: number;
  budgeted: "all" | "some" | "none";
}

/**
 * A seat's deadline is its own budget on top of the latest deadline among the seats it waits
 * for: on the seven-seat sheet [engineer 12] → [five reviewers 3] → [verdict 4] the verdict is
 * due 19 minutes after the sheet is born. A seat without a budget gets no deadline of its own
 * and adds nothing to the chain below it — the sheet is still accepted, and the record says
 * which seats were unbudgeted.
 */
export function sheetDeadlines(
  seats: ReadonlyArray<{ deps: number[]; budget_minutes?: number | null | undefined }>,
): SheetDeadlines {
  const reach: number[] = [];
  const due: Array<number | null> = [];
  let budgeted = 0;
  seats.forEach((s, i) => {
    const upstream = s.deps.length === 0 ? 0 : Math.max(...s.deps.map((d) => reach[d]));
    const own = s.budget_minutes ?? 0;
    reach[i] = upstream + own;
    if (s.budget_minutes == null) {
      due[i] = null;
    } else {
      due[i] = reach[i];
      budgeted += 1;
    }
  });
  return {
    due_offset_minutes: due,
    budget_minutes_total: reach.length === 0 ? 0 : Math.max(...reach),
    budgeted: budgeted === 0 ? "none" : budgeted === seats.length ? "all" : "some",
  };
}

/** one row of task_events as the times table reads it */
export interface BookEvent {
  task_id: string;
  event: string;
  from_status: string | null;
  to_status: string | null;
  created_at: Date;
  payload: Record<string, unknown>;
}

/** one row of media_jobs as the times table reads it */
export interface BookJob {
  task_id: string | null;
  kind: string;
  status: string;
  created_at: Date;
  started_at: Date | null;
  ended_at: Date | null;
  wall_seconds: number | null;
}

export interface SeatTimes {
  index: number;
  level: number;
  seat: string;
  task_id: string;
  label: string;
  status: "waiting" | "in_flight" | "done";
  budget_minutes: number | null;
  /** when the seat could have been claimed: the sheet's birth for level 0, the last upstream `done` otherwise */
  ready_at: string | null;
  claimed_at: string | null;
  done_at: string | null;
  /** ready → claimed: a lane looking the other way (the rest between looks, DXB_LANE_REST_SECONDS) */
  idle_before_claim_s: number | null;
  /** claimed → done (or → now while in flight): the seat's run, its answer, the QA judge, the engine */
  actual_s: number | null;
  /** the QA judge's own time, from the task's done event (B39, 2026-09-13); null on older books */
  judge_ms: number | null;
  /** the card's time on this seat's jobs (media_jobs.wall_seconds, done jobs) */
  engine_s: number;
  /** a job's wait for a hand: created → started, summed over this seat's jobs */
  job_pickup_s: number;
  jobs: number;
  failed_events: number;
  /** actual − engine: the seat thinking, answering and being judged */
  non_engine_s: number | null;
  /** actual − budget; positive = over. null when either side is unknown */
  over_budget_s: number | null;
  over_budget: boolean;
}

export interface SheetTimes {
  code: string;
  author_task_id: string;
  status: "in_flight" | "done";
  budgeted: "all" | "some" | "none";
  budget_minutes_total: number;
  /** the author's claim → the sheet's birth: the director's planning */
  planning_s: number | null;
  sheet_born_at: string;
  started_at: string;
  ended_at: string | null;
  total_s: number;
  engine_s: number;
  non_engine_s: number;
  /** the gauge he keeps: non-engine time over engine time (1.2 on DXB-V-EYW-005); null with no engine time */
  ratio_non_engine_to_engine: number | null;
  /** every second nobody was working on the sheet: lanes not looking + jobs waiting for a hand */
  idle_s: number;
  judge_ms_total: number;
  seats_over_budget: string[];
  seats: SeatTimes[];
  /** one English line per seat, in the shape the verdict seat quotes */
  lines: string[];
}

export interface SheetTimesInput {
  record: SheetRecord;
  /** the audit row's created_at — the instant the sheet was born */
  sheet_born_at: Date;
  /** task_events of the author's task and of every seat's task */
  events: readonly BookEvent[];
  /** media_jobs of every seat's task */
  jobs: readonly BookJob[];
  now: Date;
}

const secs = (a: Date, b: Date): number => Math.round(((b.getTime() - a.getTime()) / 1000) * 10) / 10;
const iso = (d: Date | null): string | null => (d ? d.toISOString() : null);

/** m:ss for the CEO's line — 0:24 · 3:31 · 22:45 */
export function mmss(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "—";
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function firstAt(events: readonly BookEvent[], pick: (e: BookEvent) => boolean): Date | null {
  for (const e of events) if (pick(e)) return e.created_at;
  return null;
}
function lastEvent(events: readonly BookEvent[], pick: (e: BookEvent) => boolean): BookEvent | null {
  let found: BookEvent | null = null;
  for (const e of events) if (pick(e)) found = e;
  return found;
}
const isClaim = (e: BookEvent) => e.event === "claimed" || e.to_status === "claimed";
const isDone = (e: BookEvent) => e.to_status === "done";
const isFailed = (e: BookEvent) => e.to_status === "failed";

/**
 * The times table, from the book alone: no clock but the database's. Events arrive in any
 * order; each seat is read from its own task's events, its readiness from its upstream seats'
 * `done` events, its engine time from its own jobs. Nothing here fails anything — it measures.
 */
export function sheetTimes(input: SheetTimesInput): SheetTimes {
  const { record, sheet_born_at, now } = input;
  const events = [...input.events].sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
  const byTask = new Map<string, BookEvent[]>();
  for (const e of events) (byTask.get(e.task_id) ?? byTask.set(e.task_id, []).get(e.task_id)!).push(e);
  const jobsByTask = new Map<string, BookJob[]>();
  for (const j of input.jobs) if (j.task_id) (jobsByTask.get(j.task_id) ?? jobsByTask.set(j.task_id, []).get(j.task_id)!).push(j);

  // sheets born before 2026-09-13 carry no budget fields: recompute from the graph (all null → 0, "none")
  const indexOf = new Map(record.tasks.map((t) => [t.task_id, t.index]));
  const deadlines = sheetDeadlines(
    record.tasks.map((t) => ({ deps: t.depends_on.map((id) => indexOf.get(id) ?? 0), budget_minutes: t.budget_minutes ?? null })),
  );
  const doneAt = new Map<string, Date>();
  const seats: SeatTimes[] = [];
  for (const t of record.tasks) {
    const own = byTask.get(t.task_id) ?? [];
    const claimed = firstAt(own, isClaim);
    const done = lastEvent(own, isDone);
    const doneWhen = done?.created_at ?? null;
    if (doneWhen) doneAt.set(t.task_id, doneWhen);
    let ready: Date | null = sheet_born_at;
    for (const dep of t.depends_on) {
      const d = doneAt.get(dep) ?? null;
      if (!d) { ready = null; break; }
      if (ready && d.getTime() > ready.getTime()) ready = d;
    }
    const jobs = jobsByTask.get(t.task_id) ?? [];
    const engine = jobs.filter((j) => j.status === "done" && j.wall_seconds !== null).reduce((a, j) => a + Number(j.wall_seconds), 0);
    const pickup = jobs.filter((j) => j.started_at).reduce((a, j) => a + secs(j.created_at, j.started_at!), 0);
    const budget = t.budget_minutes ?? null;
    const status: SeatTimes["status"] = doneWhen ? "done" : claimed ? "in_flight" : "waiting";
    const actual = claimed ? secs(claimed, doneWhen ?? now) : null;
    const judgeRaw = done?.payload?.judge_ms;
    const judge = typeof judgeRaw === "number" ? judgeRaw : typeof judgeRaw === "string" && judgeRaw !== "" ? Number(judgeRaw) : null;
    const over = actual !== null && budget !== null ? Math.round((actual - budget * 60) * 10) / 10 : null;
    seats.push({
      index: t.index,
      level: t.level,
      seat: t.seat,
      task_id: t.task_id,
      label: t.label,
      status,
      budget_minutes: budget,
      ready_at: iso(ready),
      claimed_at: iso(claimed),
      done_at: iso(doneWhen),
      idle_before_claim_s: ready && claimed ? secs(ready, claimed) : null,
      actual_s: actual,
      judge_ms: judge !== null && Number.isFinite(judge) ? judge : null,
      engine_s: Math.round(engine * 10) / 10,
      job_pickup_s: Math.round(pickup * 10) / 10,
      jobs: jobs.length,
      failed_events: own.filter(isFailed).length,
      non_engine_s: actual === null ? null : Math.round((actual - engine) * 10) / 10,
      over_budget_s: over,
      over_budget: over !== null && over > 0,
    });
  }

  const authorEvents = byTask.get(record.author_task_id) ?? [];
  const authorClaimed = firstAt(authorEvents, isClaim);
  const started = authorClaimed ?? sheet_born_at;
  const allDone = seats.length > 0 && seats.every((s) => s.status === "done");
  const ended = allDone ? new Date(Math.max(...seats.map((s) => new Date(s.done_at!).getTime()))) : null;
  const total = secs(started, ended ?? now);
  const engine = Math.round(seats.reduce((a, s) => a + s.engine_s, 0) * 10) / 10;
  const nonEngine = Math.round((total - engine) * 10) / 10;
  const idle = Math.round(seats.reduce((a, s) => a + (s.idle_before_claim_s ?? 0) + s.job_pickup_s, 0) * 10) / 10;
  const judgeTotal = seats.reduce((a, s) => a + (s.judge_ms ?? 0), 0);
  const overSeats = seats.filter((s) => s.over_budget).map((s) => s.seat);
  const budgetTotal = record.budget_minutes_total ?? deadlines.budget_minutes_total;
  const budgeted = record.budgeted ?? deadlines.budgeted;

  const lines: string[] = [
    `SHEET ${record.code}: ${allDone ? "done" : "in flight"} · total ${mmss(total)} · engine ${mmss(engine)} · non-engine ${mmss(nonEngine)}` +
      (engine > 0 ? ` · ratio ${(nonEngine / engine).toFixed(2)}` : " · ratio —") +
      ` · idle ${mmss(idle)} · judge ${(judgeTotal / 1000).toFixed(1)} s · planning ${mmss(authorClaimed ? secs(authorClaimed, sheet_born_at) : null)}` +
      (budgeted === "none" ? " · unbudgeted sheet" : ` · budget ${budgetTotal} min on the longest chain (${budgeted})`),
    ...seats.map(
      (s) =>
        `L${s.level} ${s.seat}: ${s.status} · budget ${s.budget_minutes === null ? "—" : `${s.budget_minutes} min`}` +
        ` · idle ${s.idle_before_claim_s === null ? "—" : `${s.idle_before_claim_s.toFixed(1)} s`}` +
        ` · actual ${mmss(s.actual_s)}` +
        ` · judge ${s.judge_ms === null ? "—" : `${(s.judge_ms / 1000).toFixed(1)} s`}` +
        ` · engine ${mmss(s.engine_s)}${s.jobs > 0 ? ` (${s.jobs} job${s.jobs === 1 ? "" : "s"}, pick-up ${s.job_pickup_s.toFixed(1)} s)` : ""}` +
        (s.over_budget_s === null ? "" : s.over_budget ? ` — OVER BUDGET by ${mmss(s.over_budget_s)}: write why` : ` — within budget (${mmss(-s.over_budget_s)} to spare)`),
    ),
  ];

  return {
    code: record.code,
    author_task_id: record.author_task_id,
    status: allDone ? "done" : "in_flight",
    budgeted,
    budget_minutes_total: budgetTotal,
    planning_s: authorClaimed ? secs(authorClaimed, sheet_born_at) : null,
    sheet_born_at: sheet_born_at.toISOString(),
    started_at: started.toISOString(),
    ended_at: iso(ended),
    total_s: total,
    engine_s: engine,
    non_engine_s: nonEngine,
    ratio_non_engine_to_engine: engine > 0 ? Math.round((nonEngine / engine) * 100) / 100 : null,
    idle_s: idle,
    judge_ms_total: judgeTotal,
    seats_over_budget: overSeats,
    seats,
    lines,
  };
}
