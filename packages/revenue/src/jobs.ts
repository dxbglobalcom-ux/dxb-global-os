// R1.3 — Revenue cycle job handlers (REVENUE_ENGINE_SPEC §3 daily loop).
// Same idiom as @dxb/hr jobs: run INSIDE the outbox-executor scheduler worker
// (no new resident service), pure SQL passes, db instance from the caller so
// this package stays connection-free. Pre-R2 semantics (spec §14-15): jobs
// are mechanical digests + the settings-driven intake screen — LLM-backed
// scan/score enrichment arrives with the resident worker (R2), not here.
import type { Kysely } from "kysely";
import { sql } from "kysely";
import { commissionScoutingRun, harvestScoutingRuns } from "./discovery.js";

// revenue.scan — intake pass (spec §16 leg b): opportunities still 'pending'
// on halal_verdict are screened against settings 'revenue.halal_screen';
// a term hit auto-flags 'review' (NEVER an automatic 'haram' — the verdict
// itself stays with the CEO / risk-audit director, §13). Substring match is
// deliberate here: the intake screen routes to HUMAN eyes, so a false
// positive costs one review; the fail-closed enforcement matcher with letter
// boundaries lives in the hook (const.halal_screen), not here.
export async function revenueScan(db: Kysely<any>): Promise<void> {
  await sql`
    WITH terms AS (
      SELECT lower(t.term) AS term
        FROM jsonb_array_elements_text(
               COALESCE(resolve_setting('revenue.halal_screen'), '[]'::jsonb)
             ) AS t(term)
    ), flagged AS (
      UPDATE opportunities o
         SET halal_verdict = 'review',
             halal_reason  = 'auto-flag: intake screen term "' || m.term || '" (revenue.scan)',
             updated_at    = now()
        FROM (
          SELECT DISTINCT ON (o2.id) o2.id, t.term
            FROM opportunities o2
            JOIN terms t ON position(t.term IN
                   lower(o2.title || ' ' || COALESCE(o2.region,'') || ' ' || COALESCE(o2.channel,''))) > 0
           WHERE o2.halal_verdict = 'pending' AND o2.state NOT IN ('rejected','retired')
        ) m
       WHERE o.id = m.id
       RETURNING o.id
    ), pending AS (
      SELECT count(*) AS n FROM opportunities
       WHERE halal_verdict = 'pending' AND state NOT IN ('rejected','retired')
    )
    INSERT INTO audit_log (actor, actor_type, action, payload)
    SELECT 'revenue.scan', 'system', 'revenue.job.scan',
           jsonb_build_object('flagged_for_review', (SELECT count(*) FROM flagged),
                              'still_pending', (SELECT n FROM pending))
  `.execute(db);

  // W2.2 — the scan stopped being a pass over rows that already existed.
  // Harvest FIRST (a finished run frees the single open-run slot), then
  // commission the next one if the pipeline needs it. Both halves are bounded
  // and both explain themselves in audit_log; neither throws into the job
  // runner, because a failed scan must not stop the measurement half of the
  // daily cycle (spec §17-19: independent jobs).
  let discovery: { registered: number; refused: number; commissioned: boolean; reason?: string } = {
    registered: 0,
    refused: 0,
    commissioned: false,
  };
  try {
    const harvested = await harvestScoutingRuns(db);
    const commissioned = await commissionScoutingRun(db);
    discovery = {
      registered: harvested.registered,
      refused: harvested.refused,
      commissioned: commissioned.commissioned,
      reason: commissioned.reason,
    };
  } catch (e) {
    await sql`
      INSERT INTO audit_log (actor, actor_type, action, payload)
      VALUES ('revenue.scan', 'system', 'revenue.discovery.failed',
              jsonb_build_object('error', ${(e as Error).message.slice(0, 300)}))
    `.execute(db);
  }

  await sql`
    SELECT notify_broadcast('revenue', 'scan.completed',
      jsonb_build_object(
        'registered', ${discovery.registered}::int,
        'commissioned', ${discovery.commissioned}::boolean,
        'summary_en', 'Daily intake scan completed',
        'summary_tr', 'Günlük fırsat taraması tamamlandı'))
  `.execute(db);
}

// revenue.score — scoring backlog digest: how many opportunities sit
// unscored, and how old is the oldest (aging = the anti-laziness signal, D4).
export async function revenueScore(db: Kysely<any>): Promise<void> {
  await sql`
    WITH backlog AS (
      SELECT count(*) AS unscored,
             COALESCE(max(CURRENT_DATE - created_at::date), 0) AS oldest_days
        FROM opportunities
       WHERE state = 'discovered'
    )
    INSERT INTO audit_log (actor, actor_type, action, payload)
    SELECT 'revenue.score', 'system', 'revenue.job.score',
           jsonb_build_object('unscored_backlog', unscored, 'oldest_days', oldest_days)
      FROM backlog
  `.execute(db);
}

// revenue.brief — the CEO's daily revenue brief: objective progress + SNEV +
// pipeline counts in one Broadcast payload (dashboard/alert surfaces render it).
export async function revenueBrief(db: Kysely<any>): Promise<void> {
  await sql`
    WITH prog AS (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
               'title', title, 'status', status, 'target_eur', target_eur,
               'realized_net_eur', realized_net_eur, 'gap_eur', gap_eur,
               'days_left', days_left)), '[]'::jsonb) AS objectives
        FROM v_objective_progress
       WHERE status IN ('active','draft','proposed')
    ), pipe AS (
      SELECT COALESCE(jsonb_object_agg(state, n), '{}'::jsonb) AS pipeline
        FROM (SELECT state, count(*) AS n FROM opportunities GROUP BY state) s
    ), snev AS (
      SELECT to_jsonb(v.*) AS snev FROM v_snev v
    ), ins AS (
      INSERT INTO audit_log (actor, actor_type, action, payload)
      SELECT 'revenue.brief', 'system', 'revenue.job.brief',
             jsonb_build_object('objectives', prog.objectives,
                                'pipeline', pipe.pipeline, 'snev', snev.snev)
        FROM prog, pipe, snev
      RETURNING payload
    )
    SELECT notify_broadcast('revenue', 'brief.ready',
      jsonb_build_object('brief', (SELECT payload FROM ins),
        'summary_en', 'Daily revenue brief ready',
        'summary_tr', 'Günlük gelir brifingi hazır'))
  `.execute(db);
}

// revenue.rollup — measurement snapshot + gap alert (spec §20): an ACTIVE
// objective pacing behind by more than settings 'revenue.gap_alert_threshold_pct'
// raises a deduped medium alert. Pace math: expected = target × elapsed/period;
// behind_pct = (expected − realized) / target × 100. Draft/proposed rows are
// snapshot-only (no pace without a period).
export async function revenueRollup(db: Kysely<any>): Promise<void> {
  await sql`
    WITH snap AS (
      INSERT INTO audit_log (actor, actor_type, action, payload)
      SELECT 'revenue.rollup', 'system', 'revenue.job.rollup',
             jsonb_build_object('objectives', COALESCE(jsonb_agg(jsonb_build_object(
               'id', id, 'status', status, 'target_eur', target_eur,
               'realized_net_eur', realized_net_eur, 'gap_eur', gap_eur,
               'run_rate_eur_per_day', run_rate_eur_per_day,
               'net_unverified', net_unverified)), '[]'::jsonb))
        FROM v_objective_progress
      RETURNING id
    )
    SELECT count(*) FROM snap
  `.execute(db);

  await sql`
    WITH threshold AS (
      SELECT fn_setting_numeric('revenue.gap_alert_threshold_pct', 25) AS pct
    ), behind AS (
      SELECT p.id, p.title, p.target_eur, p.realized_net_eur,
             round(((o.amount_eur * LEAST(
                       GREATEST(CURRENT_DATE - lower(o.period) + 1, 0)::numeric
                       / GREATEST(upper(o.period) - lower(o.period) + 1, 1), 1))
                    - p.realized_net_eur) / o.amount_eur * 100, 1) AS behind_pct
        FROM v_objective_progress p
        JOIN objectives o ON o.id = p.id
       WHERE p.status = 'active' AND o.period IS NOT NULL
    )
    INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                        suggested_action, dedup_key, source_ref)
    SELECT 'medium', 'revenue',
           'Objective pacing behind: ' || b.title,
           'revenue objectives',
           'Realized net €' || b.realized_net_eur || ' vs target €' || b.target_eur ||
             ' — ' || b.behind_pct || '% behind pace (threshold ' || t.pct || '%)',
           'Review portfolio allocations; scale winners or rotate (control_portfolio_*)',
           'revenue:gap:' || b.id,
           jsonb_build_object('objective_id', b.id)
      FROM behind b, threshold t
     WHERE b.behind_pct > t.pct
    ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
    DO NOTHING
  `.execute(db);
}
