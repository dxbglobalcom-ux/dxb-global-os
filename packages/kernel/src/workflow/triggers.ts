// Trigger side — WORKFLOW_ENGINE §6: cron registrar (pg-boss schedule API,
// 'wf:<slug>') + the ONE event matcher (a single listener subscribed for all
// trigger.kind='event' workflows; per-event workflow spawning is the §26
// storm risk the singleton rule exists for). Both delegate run CREATION to
// control_workflow_action run_now — one write door, singleton/disabled skip
// semantics live in the fn, audit rows included.
import { randomUUID } from "node:crypto";
import { sql } from "kysely";
import { getDb, type EventEnvelope } from "@dxb/shared";

export interface CronRegistrar {
  /** pg-boss `schedule(name, cron, data)` shape — injected by the scheduler. */
  schedule(name: string, cron: string, data?: object): Promise<void>;
  unschedule(name: string): Promise<void>;
}

export interface CronWorkflow {
  id: string;
  slug: string;
  cron: string;
}

/** Register 'wf:<slug>' schedules for every enabled cron-triggered workflow;
 *  unschedule the ones that no longer qualify (edited/disabled). */
export async function registerCronTriggers(boss: CronRegistrar): Promise<CronWorkflow[]> {
  const rows = await sql<{ id: string; slug: string; cron: string }>`
    SELECT id, slug, trigger->>'cron' AS cron
      FROM workflows
     WHERE enabled AND trigger->>'kind' = 'cron' AND trigger->>'cron' IS NOT NULL
  `.execute(getDb());
  for (const wf of rows.rows) {
    await boss.schedule(`wf:${wf.slug}`, wf.cron, { workflow_id: wf.id, slug: wf.slug });
  }
  return rows.rows;
}

export async function triggerRunNow(
  slug: string,
  triggeredBy: string,
): Promise<{ ok: boolean; run_id?: string; skipped?: boolean; reason?: string }> {
  const res = await sql<{ control_workflow_action: unknown }>`
    SELECT control_workflow_action(
      ${JSON.stringify({ action: "run_now", slug, triggered_by: triggeredBy })}::jsonb,
      ${`wf-trigger-${slug}-${randomUUID()}`}
    ) AS control_workflow_action
  `.execute(getDb());
  return res.rows[0].control_workflow_action as never;
}

// §9 trigger contract: {"kind":"event","match":{"type":"approval.decided","entity_kind":"approval"}}
export function eventMatches(
  match: { type?: string; entity_kind?: string },
  env: Pick<EventEnvelope, "type" | "entity">,
): boolean {
  if (match.type && match.type !== env.type) return false;
  if (match.entity_kind && match.entity_kind !== env.entity.kind) return false;
  return Boolean(match.type || match.entity_kind); // empty match never fires
}

/** The single event→workflow dispatcher: feed it every ops:live/system
 *  envelope; it fires run_now on each enabled event-triggered workflow whose
 *  match hits (singleton skip inside the fn keeps storms out). */
export async function dispatchEventTriggers(
  env: Pick<EventEnvelope, "type" | "entity">,
): Promise<{ slug: string; fired: boolean; reason?: string }[]> {
  const rows = await sql<{ slug: string; match: unknown }>`
    SELECT slug, trigger->'match' AS match
      FROM workflows
     WHERE enabled AND trigger->>'kind' = 'event'
  `.execute(getDb());

  const results: { slug: string; fired: boolean; reason?: string }[] = [];
  for (const wf of rows.rows) {
    const match = (wf.match ?? {}) as { type?: string; entity_kind?: string };
    if (!eventMatches(match, env)) continue;
    const res = await triggerRunNow(wf.slug, `event:${env.type}`);
    results.push({
      slug: wf.slug,
      fired: Boolean(res.ok && !res.skipped),
      reason: res.skipped ? res.reason : undefined,
    });
  }
  return results;
}
