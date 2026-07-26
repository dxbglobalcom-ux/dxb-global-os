// W2.5 — THE HOLDING OPENS ITS OWN NEXT WORK (AGENT_ORCHESTRATION_SPEC §3/§4,
// factory roadmap row 2.5).
//
// Measured before this module existed (2026-07-26): every task-creating path
// in the repo started at a human — dispatch from a CEO intent, the MCP queue
// tool from inside a run a human began, discovery only on `trigger='ceo'`.
// A finished plan was therefore a document, not an instruction: the W2.4
// kickoff produced a pilot plan and the project went quiet.
//
// This is the missing half, and it is deliberately narrow:
//   · it reads only FINISHED plans, inside projects the CEO already approved;
//   · it opens execution work, never a project, objective, opportunity or
//     allocation — those are decisions, and decisions stay with the CEO;
//   · it writes through `control_work_generate`, so "exactly once", the audit
//     row and every refusal reason live in the database, not in this process.
//
// The parser is deliberately forgiving about the wrapper and strict about the
// shape (the `parseCandidates` precedent in @dxb/revenue): a model wraps its
// list in prose, and refusing a good plan over a stray sentence throws away
// real work. Prose with no STEPS block means the plan named no executable
// step — a legitimate answer, recorded as such by the door.
import type { Kysely } from "kysely";
import { sql } from "kysely";

/** One executable line of a plan. `tr` is the CEO's board language; the model
 *  that wrote the step is the only cheap, accurate translator (the contract in
 *  fn_plan_step_contract() demands it). */
export interface PlanStep {
  /** the headline — short, complete, and what the CEO's board renders as the row */
  title: string;
  owner: string;
  tr: string | null;
  /** the full instruction for the owning department; null on old-shape plans */
  do: string | null;
}

export interface GeneratedTask {
  task_id: string;
  step_index: number;
  department: string;
}

export interface PlanHarvest {
  planTaskId: string;
  projectId: string | null;
  generated: GeneratedTask[];
  skipped: { step_index: number; reason: string }[];
  /** why the door refused the whole plan, when it did — never a silent skip */
  error?: string;
}

export interface GenerateWorkResult {
  plansRead: number;
  tasksOpened: number;
  stepsSkipped: number;
  harvests: PlanHarvest[];
}

/** Statuses that mean "this task is still someone's open work". */
const OPEN_TASK_STATES = ["inbox", "queued", "claimed", "running", "review", "awaiting_approval"];

/**
 * Pull the executable steps out of a finished plan's deliverable.
 *
 * Contract shape (fn_plan_step_contract):
 *   STEPS
 *   1) <title ≤60> | owner: <department> | tr: <Turkish title> | do: <instruction>
 *   …
 *   FIRST_REVENUE: …
 *
 * The title/instruction split exists because the title becomes the row the CEO
 * reads: the first live harvest (2026-07-26) wrote 120-character labels cut
 * mid-word, and a cut at the data source is a defect, not a rendering detail.
 *
 * Tolerated in the wild: `-`/`*` bullets instead of numbers, `owner=`,
 * `department:`, missing `tr:` (the step still runs; its label falls back to
 * the English leg), missing `do:` (old-shape plans — the title carries both
 * jobs), and prose above or below the block.
 */
export function parsePlanSteps(text: string | null | undefined): PlanStep[] {
  if (!text) return [];
  // Sliced, not captured in one regex: a `$` alternative under /m ends the
  // block at the first line break, which silently reads only step 1 (measured
  // 2026-07-26 — the suite caught it before the seam ever ran).
  const head = text.match(/^[ \t]*STEPS[ \t]*:?[ \t]*\r?\n/im);
  if (!head || head.index === undefined) return [];
  const rest = text.slice(head.index + head[0].length);
  const stop = rest.search(/^[ \t]*(?:FIRST_REVENUE|GAPS|STOP_IF|END)\b/im);
  const body = stop === -1 ? rest : rest.slice(0, stop);

  const out: PlanStep[] = [];
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "") continue;
    // a numbered or bulleted item; anything else inside the block is prose
    const item = line.match(/^(?:\d+[).\]]|[-*•])\s*(.+)$/);
    if (!item) continue;

    const parts = item[1].split("|").map((p) => p.trim());
    const title = parts[0].trim();
    if (title === "") continue;

    let owner = "";
    let tr: string | null = null;
    let detail: string | null = null;
    for (const part of parts.slice(1)) {
      const m = part.match(/^(owner|department|dept|sahip)\s*[:=]\s*(.+)$/i);
      if (m) {
        owner = m[2].trim().toLowerCase().replace(/\s+/g, "-");
        continue;
      }
      const t = part.match(/^(tr|turkish|türkçe)\s*[:=]\s*(.+)$/i);
      if (t) {
        tr = t[2].trim();
        continue;
      }
      // the instruction leg; a model that keeps writing after `do:` puts pipes
      // inside its own sentence, so later unlabelled parts append to it
      const d = part.match(/^(do|detail|instruction|yap)\s*[:=]\s*(.+)$/i);
      if (d) {
        detail = d[2].trim();
        continue;
      }
      if (detail !== null) detail = `${detail} | ${part}`;
    }
    out.push({ title, owner, tr, do: detail });
  }
  return out;
}

interface PlanRow {
  id: string;
  project_id: string | null;
  result_text: string | null;
}

/** What `control_work_generate` answers with — refusals carry their reason. */
interface DoorResponse {
  ok: boolean;
  error?: string;
  detail?: string;
  generated?: GeneratedTask[];
  skipped?: { step_index: number; reason: string }[];
  capped?: number;
}

/**
 * One pass over the finished plans nobody has harvested yet.
 *
 * The SQL side does the guarding (switch, plan state, project state, exactly
 * once, staffing, cap) — this function's only job is to find candidates and
 * hand the door their steps. Every outcome, including "nothing to do", is
 * returned to the caller rather than swallowed: the scheduler logs it and the
 * audit trail carries it.
 */
export async function generateWorkFromPlans(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- @dxb/revenue
  // idiom: this package stays connection-free and takes whatever db the caller
  // owns (scheduler, test transaction), so the schema generic is the caller's.
  db: Kysely<any>,
  opts: { maxPlansPerPass?: number } = {},
): Promise<GenerateWorkResult> {
  const limit = opts.maxPlansPerPass ?? 5;

  // A plan is a finished task whose contract asked for STEPS, that still
  // belongs to a live project, and that no pass has read yet. `generated_work`
  // is the ledger — a plan appears here once and never again.
  const plans = await sql<PlanRow>`
    SELECT t.id, t.project_id, t.result ->> 'text' AS result_text
      FROM tasks t
      JOIN projects p ON p.id = t.project_id
     WHERE t.status = 'done'
       AND p.status IN ('draft', 'active')
       AND t.output_contract ILIKE '%STEPS%'
       AND NOT EXISTS (SELECT 1 FROM generated_work g WHERE g.plan_task_id = t.id)
     ORDER BY t.updated_at
     LIMIT ${limit}
  `.execute(db);

  const result: GenerateWorkResult = {
    plansRead: 0,
    tasksOpened: 0,
    stepsSkipped: 0,
    harvests: [],
  };

  for (const plan of plans.rows) {
    result.plansRead += 1;
    const steps = parsePlanSteps(plan.result_text);
    const out = await sql<{ out: DoorResponse }>`
      SELECT control_work_generate(${plan.id}::uuid, ${JSON.stringify(steps)}::jsonb) AS out
    `.execute(db);
    const door = out.rows[0].out;
    const harvest: PlanHarvest = {
      planTaskId: plan.id,
      projectId: plan.project_id,
      generated: door.generated ?? [],
      skipped: door.skipped ?? [],
      ...(door.ok ? {} : { error: door.error ?? "UNKNOWN" }),
    };
    result.tasksOpened += harvest.generated.length;
    result.stepsSkipped += harvest.skipped.length;
    result.harvests.push(harvest);
  }

  return result;
}

/** How much self-opened work is live right now — the number the CEO's board
 *  answers with, and the one the scheduler logs after every pass. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
export async function openGeneratedWork(db: Kysely<any>): Promise<number> {
  const res = await sql<{ n: string }>`
    SELECT count(*)::text AS n
      FROM generated_work g
      JOIN tasks t ON t.id = g.task_id
     WHERE t.status = ANY(${OPEN_TASK_STATES}::text[])
  `.execute(db);
  return Number(res.rows[0]?.n ?? 0);
}
