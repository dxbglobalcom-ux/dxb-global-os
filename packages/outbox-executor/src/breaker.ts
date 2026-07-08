// Velocity breaker (COST-03, master-plan PHASE-04 §3): a 60-minute EUR window
// independent of the monthly 70% alarm — a runaway retry storm dies in minutes,
// not at month-end. Runs from the scheduler every 5 minutes.
//
// ⛔ FABLE-ONLY (master-plan §6): any threshold change in this file.
import { sql } from "kysely";
import {
  getDb,
  keyUpdate,
  listDxbKeys,
  DXB_KEY_ALIAS_PREFIX,
  LITELLM_SCHEMA,
  LITELLM_SPEND_TABLE,
} from "@dxb/shared";

// v1 constant per the plan's key_links: moves to the routing_rules table in
// Phase 5 (kernel L1 wiring) — do not grow this list here.
export const CRITICAL_DEPARTMENTS = ["kernel-L1"] as const;

function isCritical(keyAlias: string): boolean {
  return CRITICAL_DEPARTMENTS.some(
    (dept) => keyAlias === `${DXB_KEY_ALIAS_PREFIX}${dept.toLowerCase()}`,
  );
}

export interface VelocityCheckResult {
  window_eur: number;
  cap_eur: number;
  already_tripped: boolean;
  newly_tripped: boolean;
  blocked_aliases: string[];
  block_errors: string[];
}

/**
 * Unified 60-min spend = cost_ledger.cost_eur + LiteLLM spend logs.
 * LiteLLM records USD; treated as EUR-equivalent v1 (config.yaml note:
 * "adjust to USD rate on VPS install day").
 */
export async function checkVelocity(): Promise<VelocityCheckResult> {
  const db = getDb();

  const ledger = await db
    .selectFrom("cost_ledger")
    .select((eb) => eb.fn.coalesce(eb.fn.sum("cost_eur"), sql.lit(0)).as("total"))
    .where("created_at", ">", sql<Date>`now() - interval '60 minutes'`)
    .executeTakeFirstOrThrow();

  // "startTime" is timestamp(3) WITHOUT time zone written in UTC by the proxy;
  // the DB container runs UTC, so the naive comparison is sound locally and on
  // the VPS (both UTC).
  const spend = await sql<{ total: number }>`
    SELECT COALESCE(SUM(spend), 0) AS total
    FROM ${sql.raw(`${LITELLM_SCHEMA}."${LITELLM_SPEND_TABLE}"`)}
    WHERE "startTime" > (now() AT TIME ZONE 'utc') - interval '60 minutes'
  `.execute(db);

  const windowEur = Number(ledger.total) + Number(spend.rows[0]?.total ?? 0);

  const state = await db.selectFrom("budget_state").selectAll().executeTakeFirstOrThrow();
  const capEur = Number(state.velocity_cap_eur_per_hour);

  const result: VelocityCheckResult = {
    window_eur: windowEur,
    cap_eur: capEur,
    already_tripped: state.breaker_tripped,
    newly_tripped: false,
    blocked_aliases: [],
    block_errors: [],
  };

  if (windowEur <= capEur || state.breaker_tripped) return result;

  // Trip: DB state first (the hard signal survives even if the proxy is down),
  // then best-effort key blocking, then one audit row with the full outcome.
  await db
    .updateTable("budget_state")
    .set({ breaker_tripped: true, breaker_tripped_at: sql`now()`, updated_at: sql`now()` })
    .execute();
  result.newly_tripped = true;

  try {
    const keys = await listDxbKeys();
    for (const key of keys) {
      if (isCritical(key.key_alias)) continue;
      try {
        await keyUpdate({ key: key.token, blocked: true });
        result.blocked_aliases.push(key.key_alias);
      } catch (e) {
        result.block_errors.push(`${key.key_alias}: ${String(e).slice(0, 200)}`);
      }
    }
  } catch (e) {
    result.block_errors.push(`key listing failed: ${String(e).slice(0, 200)}`);
  }

  await db
    .insertInto("audit_log")
    .values({
      actor: "system:breaker",
      actor_type: "system",
      action: "breaker.tripped",
      task_id: null,
      payload: JSON.stringify({
        window_eur: result.window_eur,
        cap_eur: result.cap_eur,
        blocked_aliases: result.blocked_aliases,
        block_errors: result.block_errors,
        critical_exceptions: CRITICAL_DEPARTMENTS,
      }),
    })
    .execute();

  return result;
}
