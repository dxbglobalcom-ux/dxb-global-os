// W2.2 — THE DISCOVERY ENGINE (REVENUE_ENGINE_SPEC §3 "SCAN MARKET", §5, §6, §25).
//
// The gap this closes, measured 2026-07-26: `opportunities` held zero rows,
// `revenue.scan` was an intake screen over an empty table, and the research
// tools the holding installed for exactly this job had never been called —
// `tool_calls` carried 240 dxb-mcp rows, 2 git, 1 context7 and ZERO scrapling.
//
// The spec did not need a new design. §5 already routes research through the
// department task queue ("until R2 lands scan jobs enqueue research tasks …
// upgrades automatically when R2 activates, same task seam"), and R2 activated
// on 2026-07-18. So discovery is two halves on that existing seam:
//
//   COMMISSION — the daily scan opens ONE staffed research task in Strategy.
//                Staffed matters: an agent-less task runs tool-LESS by
//                default-deny, and a market scan with no tools is the defect,
//                not the fix. The employee's compiled profile carries scrapling.
//   HARVEST    — a finished run's candidate list becomes `opportunities` rows
//                through the audited control door, each carrying the run and
//                the pages it cited. A candidate citing nothing is refused and
//                the refusal is written down, because "found nothing" and
//                "made something up" must never look the same afterwards.
//
// What this module deliberately does NOT do: score, judge halal, or decide.
// Registration lands an opportunity at `discovered` with `halal_verdict`
// pending — the intake screen (revenue.scan) flags terms for human eyes and the
// verdict itself belongs to the CEO or the risk-audit head (§13, separation of
// duties). Discovery finds; it never rules.
import type { Kysely } from "kysely";
import { sql } from "kysely";

/** The seat that owns market research (WORKFORCE W-R1: Opportunity Scout duty). */
export const SCOUT_DEPARTMENT = "strategy";
const SCOUT_PREFERRED_SLUGS = ["market-intelligence-lead", "global-expansion-lead"];

/** The CEO reads the live feed all day, and a feed row is one line. The brief
 *  below is an instruction of ~1700 characters — it is what the worker executes,
 *  never what the row says. So the task carries a short headline in both
 *  languages, written at creation rather than derived later (CEO catch
 *  2026-07-26: a full brief was rendering as the row's label). */
const SCOUT_LABEL_EN = "Market scan for live revenue opportunities";
const SCOUT_LABEL_TR = "Piyasa taraması: canlı gelir fırsatları";

/** Statuses that mean "this run has not finished yet". */
const OPEN_TASK_STATES = ["inbox", "queued", "claimed", "running", "review", "awaiting_approval"];

/** Opportunity states that still need a decision from someone. */
const UNDECIDED_STATES = ["discovered", "scored", "shortlisted"];

export interface CommissionResult {
  commissioned: boolean;
  taskId?: string;
  /** why not, when not — never a silent no-op */
  reason?: "disabled" | "not_autonomous" | "run_open" | "pipeline_full" | "no_scout" | "no_project";
}

/** WHO asked for this run. CEO order 2026-07-26: the factory is being BUILT, not
 *  operated — "sadece ben görev vermedikçe çalışmasın, ben görev verince
 *  çalışsın". So the daily job may not open a research run on its own; only an
 *  explicit CEO instruction does, and it still obeys every other bound. */
export type CommissionTrigger = "ceo" | "schedule";

export interface Candidate {
  title: string;
  /** The CEO's language. His revenue screen is Turkish; DB text is an i18n
   *  surface here exactly like agents.title_tr (measured on the first real
   *  data: five English titles on the Turkish Fırsatlar page). */
  title_tr?: string | null;
  engine_slug: string;
  region?: string | null;
  channel?: string | null;
  capital_required_eur?: number | null;
  evidence_urls?: string[];
  rationale?: string | null;
}

export interface HarvestResult {
  /** finished runs read this pass */
  runs: number;
  registered: number;
  refused: number;
}

async function settingNumber(db: Kysely<any>, key: string, fallback: number): Promise<number> {
  const r = await sql<{ v: number | null }>`
    SELECT fn_setting_numeric(${key}, ${fallback}) AS v
  `.execute(db);
  return Number(r.rows[0]?.v ?? fallback);
}

async function settingBool(db: Kysely<any>, key: string, fallback: boolean): Promise<boolean> {
  const r = await sql<{ v: boolean | null }>`
    SELECT COALESCE((resolve_setting(${key}))::text = 'true', ${fallback}::boolean) AS v
  `.execute(db);
  return Boolean(r.rows[0]?.v ?? fallback);
}

/** The brief. Written here, in full, because a research task whose objective is
 *  vague comes back with a vague list — and the boundaries (halal, zero-capital,
 *  cite-or-it-did-not-happen) belong IN the ask, not in a filter afterwards.
 *
 *  ONE RULE ABOUT HOW THE BOUNDARY IS WRITTEN, learned live on 2026-07-26: the
 *  first version enumerated the prohibited categories by name, and the hook's
 *  halal screen fail-closed the task on its own brief — the same trap that
 *  produced the CEO's "bahis" incident on 2026-07-23. The screen matches TEXT,
 *  it cannot read intent, and it is right not to try. So the boundary is stated
 *  as a rule the agent already carries (persona §12, MASTER_PLAN §11) and never
 *  as a word list. That is also better design: a copy of the term list in a
 *  prompt is a second source of truth that drifts from the policy. */
function scoutBrief(opts: {
  maxCandidates: number;
  engines: string[];
  capitalLimitEur: number;
  objectiveTitle: string | null;
  objectiveAmountEur: number | null;
}): { objective: string; contract: string } {
  const target =
    opts.objectiveTitle && opts.objectiveAmountEur != null
      ? `The standing objective is "${opts.objectiveTitle}" — €${opts.objectiveAmountEur} net profit. Prefer candidates that could contribute to it inside one month.`
      : "There is no active objective yet, so favour candidates that could start earning fastest with what the holding already has.";

  const objective = [
    "Market scan: find real, currently-live revenue opportunities this holding could start on.",
    "",
    target,
    "",
    "HARD BOUNDARIES — a candidate that breaks any of these is not a candidate:",
    `· Capital required must be €0 up to €${opts.capitalLimitEur}. No inventory purchase, no ad budget, no deposits.`,
    "· The holding's Islamic boundaries are absolute and constitutional (MASTER_PLAN §11, your own",
    "  persona §12). You already know them; apply them without being told what they are, and drop any",
    "  candidate that touches a prohibited category — including the two market activities the CEO",
    "  excluded by name. If you are unsure whether something qualifies, it does not.",
    "· It must be something a small remote team of specialists can deliver from Europe, in English or Turkish.",
    "",
    "HOW TO WORK — this is the part that decides whether the run was worth anything:",
    "1. USE YOUR FETCH TOOLS on real pages. A claim you did not read somewhere is not a finding.",
    "2. For each candidate, record the exact URLs you read. No URL, no candidate.",
    "3. Prefer a demand signal you can point at (a marketplace listing, a job post, a pricing page,",
    "   a public report) over an opinion about a market.",
    `4. Return at most ${opts.maxCandidates} candidates. A longer list is thinner research, not more of it.`,
    "5. If the sources you can reach do not support a single honest candidate, return an empty list and say so.",
    "   An empty list is a legitimate result here; an invented one is a governance violation (§35 zero fabrication).",
    "",
    `Valid engine slugs (use exactly one per candidate): ${opts.engines.join(", ")}.`,
  ].join("\n");

  // FORMAT, decided by measurement (2026-07-26): the first version asked for a
  // json object inside the worker's own json envelope, and four consecutive live
  // runs — after nine real page fetches each — answered with the candidate
  // object as the WHOLE reply. The model was not disobeying; two nested "answer
  // in JSON" instructions are genuinely ambiguous. Fighting that with firmer
  // wording is the wrong repair. A line block cannot collide with an envelope,
  // so the ambiguity is gone by construction rather than by insistence.
  const contract = [
    "Write the deliverable as PLAIN TEXT — no json, no code fences. One block per",
    "candidate, in exactly this shape, and nothing else between blocks:",
    "",
    "CANDIDATE",
    "title: <what it is, one line a busy reader understands — English>",
    "title_tr: <the same line in Turkish; the CEO reads this one>",
    "engine: <one of the valid engine slugs>",
    "region: <where>",
    "channel: <how it reaches a buyer>",
    "capital_eur: <number; 0 unless you can name the cost>",
    "evidence: <url> | <url>       (pages you actually fetched — no url, no candidate)",
    "why: <the demand signal you read, in one sentence>",
    "END",
    "",
    "Repeat the block for each candidate. If the sources support none, write exactly",
    "NO CANDIDATES and one sentence saying which pages you reached and what was missing —",
    "that is a legitimate deliverable and it will be recorded as an honest empty result.",
    "",
    // The knowledge-shelf rule (HOLDING_LIBRARY A9, "no research without report,
    // no report without registration") fires on this class of task and demands a
    // file-kind evidence entry. It is right to: a scan nobody can look up later
    // is a scan that did not happen. The scout has no filesystem, so the report
    // IS this deliverable, and REPORT_REF is the address it is filed under —
    // the gate puts it on the shelf itself. The ref is stamped in at commission.
    // The word "research" is load-bearing: `std.knowledge_shelf` matches this
    // contract text, and a version of this brief that avoided the word slipped
    // past the gate entirely (measured 2026-07-26 — the run closed with no
    // report on the shelf). Dodging a rule by vocabulary is worse than failing
    // it, so the contract now says plainly what this is.
    "This is a RESEARCH deliverable and it is filed on the holding's knowledge shelf.",
    "EVIDENCE — your envelope's evidence array must carry BOTH of these:",
    '  {"kind":"verification","tool":"<an MCP tool you actually called>","note":"<what you checked>"}',
    '  {"kind":"file","ref":"REPORT_REF","note":"this deliverable is the research report"}',
  ].join("\n");

  return { objective, contract };
}

/**
 * Open one research run, or explain why not. Bounded by design: one open run at
 * a time and a pipeline floor, so a daily job can never turn into a queue of
 * scouts talking to the same internet.
 */
export async function commissionScoutingRun(
  db: Kysely<any>,
  opts: { trigger?: CommissionTrigger } = {},
): Promise<CommissionResult> {
  const trigger: CommissionTrigger = opts.trigger ?? "ceo";
  if (!(await settingBool(db, "revenue.discovery.enabled", true))) {
    return { commissioned: false, reason: "disabled" };
  }
  // The scheduled lane is OFF by default and stays off until the CEO turns it
  // on. He is building the factory; a machine that scans the market nightly
  // while nobody asked is spending his tokens on work he did not order.
  if (trigger === "schedule" && !(await settingBool(db, "revenue.discovery.auto", false))) {
    return { commissioned: false, reason: "not_autonomous" };
  }

  const open = await sql<{ n: string }>`
    SELECT count(*)::text AS n
      FROM revenue_scout_runs r
      JOIN tasks t ON t.id = r.task_id
     WHERE r.harvested_at IS NULL
       AND t.status = ANY(${OPEN_TASK_STATES}::text[])
  `.execute(db);
  if (Number(open.rows[0].n) > 0) return { commissioned: false, reason: "run_open" };

  const floor = await settingNumber(db, "revenue.discovery.pipeline_floor", 5);
  const undecided = await sql<{ n: string }>`
    SELECT count(*)::text AS n FROM opportunities WHERE state = ANY(${UNDECIDED_STATES}::text[])
  `.execute(db);
  if (Number(undecided.rows[0].n) >= floor) {
    return { commissioned: false, reason: "pipeline_full" };
  }

  // The scout seat, by preference; any active strategy specialist otherwise. The
  // task must be STAFFED or it runs tool-less (worker-shim default-deny).
  const scout = await sql<{ id: string }>`
    SELECT id FROM agents
     WHERE department = ${SCOUT_DEPARTMENT}
       AND employment_status = 'active'
     ORDER BY (slug = ANY(${SCOUT_PREFERRED_SLUGS}::text[])) DESC,
              (role_level = 'senior_specialist') DESC,
              slug
     LIMIT 1
  `.execute(db);
  if (!scout.rows[0]) return { commissioned: false, reason: "no_scout" };

  const [engines, maxCandidates, objective] = await Promise.all([
    sql<{ slug: string }>`
      SELECT slug FROM revenue_engines WHERE lifecycle <> 'sunset' ORDER BY slug
    `.execute(db),
    settingNumber(db, "revenue.discovery.max_candidates", 6),
    sql<{ id: string; title: string; amount_eur: string; capital_limit_eur: string }>`
      SELECT id, title, amount_eur, capital_limit_eur
        FROM objectives WHERE status = 'active'
        ORDER BY created_at DESC LIMIT 1
    `.execute(db),
  ]);

  const obj = objective.rows[0] ?? null;
  const brief = scoutBrief({
    maxCandidates,
    engines: engines.rows.map((e) => e.slug),
    // G4 zero-capital-first: the active objective's own limit governs; with no
    // objective the safe end (0) governs, never a guess.
    capitalLimitEur: obj ? Number(obj.capital_limit_eur ?? 0) : 0,
    objectiveTitle: obj?.title ?? null,
    objectiveAmountEur: obj ? Number(obj.amount_eur) : null,
  });

  // Every task must hang off a project — the pre-task hook enforces it ("do not
  // conflict with holding goals"), and it is right to: a market scan with no home
  // in the portfolio is orphan work. `revenue-discovery` is that standing home
  // (migration 20260726009100). Measured the hard way: the first live run was
  // rejected five times and blocked by the ladder before this line existed.
  const project = await sql<{ id: string }>`
    SELECT id FROM projects WHERE slug = 'revenue-discovery' LIMIT 1
  `.execute(db);
  if (!project.rows[0]) return { commissioned: false, reason: "no_project" };

  const task = await sql<{ id: string }>`
    INSERT INTO tasks (department, agent_id, project_id, objective, label, label_tr,
                       output_contract, model_tier,
                       approval_class, status, priority, budget_max_tokens)
    VALUES (${SCOUT_DEPARTMENT}, ${scout.rows[0].id}::uuid, ${project.rows[0].id}::uuid,
            ${brief.objective}::text, ${SCOUT_LABEL_EN}::text, ${SCOUT_LABEL_TR}::text,
            ${brief.contract}::text,
            'L3', 'none', 'queued', 5, 120000)
    RETURNING id
  `.execute(db);

  // The report's address, known only once the row exists. `dxb://scout-run/<id>`
  // resolves to this task's stored deliverable — an honest pointer, not a file
  // path the worker cannot write to.
  await sql`
    UPDATE tasks
       SET output_contract = replace(output_contract, 'REPORT_REF',
                                     ${`dxb://scout-run/${task.rows[0].id}`})
     WHERE id = ${task.rows[0].id}::uuid
  `.execute(db);

  await sql`
    INSERT INTO revenue_scout_runs (task_id, objective_id)
    VALUES (${task.rows[0].id}::uuid, ${obj?.id ?? null}::uuid)
  `.execute(db);

  await sql`
    INSERT INTO audit_log (actor, actor_type, action, payload)
    VALUES ('revenue.scan', 'system', 'revenue.discovery.commissioned',
            jsonb_build_object('task_id', ${task.rows[0].id}::uuid,
                               'objective_id', ${obj?.id ?? null}::uuid,
                               'pipeline_floor', ${floor}::numeric,
                               'trigger', ${trigger}::text))
  `.execute(db);

  return { commissioned: true, taskId: task.rows[0].id };
}

/**
 * Pull the candidate list out of a deliverable. Deliberately forgiving about the
 * wrapper and strict about the shape: models wrap JSON in prose, and refusing a
 * good list over a stray sentence would throw away a real run. Prose with no
 * list means the run found nothing — a legitimate answer, not an error.
 */
export function parseCandidates(text: string | null | undefined): Candidate[] {
  if (!text) return [];

  // The contracted shape first: CANDIDATE … END blocks (see scoutBrief).
  const lineBlocks = [...text.matchAll(/CANDIDATE\s*\n([\s\S]*?)(?:\nEND\b|$)/gi)];
  if (lineBlocks.length > 0) {
    const out: Candidate[] = [];
    for (const block of lineBlocks) {
      const field = (name: string): string | null => {
        const m = block[1].match(new RegExp(`^\\s*${name}\\s*:\\s*(.+)$`, "im"));
        return m ? m[1].trim() : null;
      };
      const title = field("title");
      const titleTr = field("title_tr");
      const engine = field("engine") ?? field("engine_slug");
      if (!title || !engine) continue;
      const capital = Number((field("capital_eur") ?? "0").replace(/[^\d.-]/g, ""));
      out.push({
        title,
        title_tr: titleTr,
        engine_slug: engine.split(/\s/)[0].replace(/[^\w-]/g, ""),
        region: field("region"),
        channel: field("channel"),
        capital_required_eur: Number.isFinite(capital) ? capital : 0,
        evidence_urls: (field("evidence") ?? "")
          .split(/[|,\s]+/)
          .map((u) => u.trim())
          .filter((u) => /^https?:\/\//i.test(u)),
        rationale: field("why") ?? field("rationale"),
      });
    }
    return out;
  }

  // JSON remains accepted: a run that answers in the old shape is still a run
  // whose findings are real, and throwing them away would be the wrong kind of
  // strictness.
  const blocks: string[] = [];
  for (const m of text.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)) blocks.push(m[1]);
  blocks.push(text);
  // Last resort: the outermost braces in the text.
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) blocks.push(text.slice(first, last + 1));

  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block.trim()) as { candidates?: unknown };
      if (Array.isArray(parsed?.candidates)) {
        return (parsed.candidates as Candidate[]).filter(
          (c) => c && typeof c.title === "string" && typeof c.engine_slug === "string",
        );
      }
    } catch {
      // not this block
    }
  }
  return [];
}

function deliverableText(result: unknown): string | null {
  if (result == null) return null;
  if (typeof result === "string") return result;
  const r = result as { text?: unknown; result?: unknown };
  if (typeof r.text === "string") return r.text;
  if (typeof r.result === "string") return r.result;
  return JSON.stringify(result);
}

/**
 * Read every finished run that has not been read yet, and turn what it cited
 * into opportunities. Registration goes through the audited control door, never
 * a direct insert, so every row carries an audit trail and an event.
 */
export async function harvestScoutingRuns(db: Kysely<any>): Promise<HarvestResult> {
  const out: HarvestResult = { runs: 0, registered: 0, refused: 0 };

  const runs = await sql<{ run_id: string; task_id: string; result: unknown }>`
    SELECT r.id AS run_id, t.id AS task_id, t.result
      FROM revenue_scout_runs r
      JOIN tasks t ON t.id = r.task_id
     WHERE r.harvested_at IS NULL
       AND t.status IN ('done', 'failed', 'returned')
     ORDER BY r.commissioned_at
     LIMIT 5
  `.execute(db);

  const engines = new Set(
    (await sql<{ slug: string }>`SELECT slug FROM revenue_engines`.execute(db)).rows.map(
      (e) => e.slug,
    ),
  );

  for (const run of runs.rows) {
    out.runs += 1;
    const candidates = parseCandidates(deliverableText(run.result));
    const refusals: Array<{ title: string; why: string }> = [];
    const registered: string[] = [];

    // The tool calls of this run are the proof the fetch happened at all; they
    // travel with the opportunity so a reader can check the work later.
    const toolCalls = await sql<{ tool: string; ok: boolean }>`
      SELECT tc.tool, tc.ok
        FROM tool_calls tc
        JOIN agent_runs ar ON ar.id = tc.run_id
       WHERE ar.task_id = ${run.task_id}::uuid
       ORDER BY tc.created_at
       LIMIT 40
    `.execute(db);

    for (const c of candidates) {
      const urls = (c.evidence_urls ?? []).filter(
        (u) => typeof u === "string" && /^https?:\/\//i.test(u),
      );
      if (urls.length === 0) {
        refusals.push({ title: c.title, why: "no_evidence" });
        continue;
      }
      if (!engines.has(c.engine_slug)) {
        refusals.push({ title: c.title, why: "unknown_engine" });
        continue;
      }

      const refs = {
        task_id: run.task_id,
        scout_run_id: run.run_id,
        evidence_urls: urls,
        rationale: c.rationale ?? null,
        tool_calls: toolCalls.rows.map((t) => t.tool),
      };
      const res = await sql<{ out: { ok: boolean; id?: string; error?: string } }>`
        SELECT control_opportunity_register(
                 ${c.title},
                 ${c.engine_slug},
                 ${c.region ?? null},
                 ${c.channel ?? null},
                 ${Number(c.capital_required_eur ?? 0)}::numeric,
                 ${JSON.stringify(refs)}::jsonb,
                 'revenue.discovery',
                 ${`discovery-${run.run_id}-${registered.length + refusals.length}`},
                 ${c.title_tr ?? null}
               ) AS out
      `.execute(db);
      if (res.rows[0]?.out?.ok) {
        registered.push(res.rows[0].out.id as string);
        out.registered += 1;
      } else {
        refusals.push({ title: c.title, why: res.rows[0]?.out?.error ?? "door_refused" });
      }
    }

    out.refused += refusals.length;
    await sql`
      UPDATE revenue_scout_runs
         SET harvested_at = now(),
             outcome = ${JSON.stringify({
               candidates: candidates.length,
               registered: registered.length,
               refusals,
               tool_calls: toolCalls.rows.length,
             })}::jsonb
       WHERE id = ${run.run_id}::uuid
    `.execute(db);

    await sql`
      INSERT INTO audit_log (actor, actor_type, action, payload)
      VALUES ('revenue.scan', 'system', 'revenue.discovery.harvested',
              jsonb_build_object('task_id', ${run.task_id}::uuid,
                                 'candidates', ${candidates.length}::int,
                                 'registered', ${registered.length}::int,
                                 'refused', ${refusals.length}::int,
                                 'tool_calls', ${toolCalls.rows.length}::int))
    `.execute(db);
  }

  return out;
}
