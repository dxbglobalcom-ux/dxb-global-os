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
  //
  // The proxy's spend table is ASKED FOR before it is read (B36 Block 2,
  // 2026-08-23). Until then this query ran unguarded, so a database without the
  // proxy's schema did not merely lose the proxy figure — it threw, and the
  // whole velocity check stopped running. That is the opposite of what the trip
  // below is built for ("the hard signal survives even if the proxy is down"):
  // the brake died first and silently, and the same would happen on any install
  // where the proxy keeps its spend in its own database. Measured on the
  // construction site's own engine, which has no litellm schema: five
  // velocity-breaker cases failed with `relation "litellm.LiteLLM_SpendLogs"
  // does not exist`. `to_regclass` returns NULL instead of raising.
  const proxyTable = `${LITELLM_SCHEMA}."${LITELLM_SPEND_TABLE}"`;
  const present = await sql<{ there: boolean }>`
    SELECT to_regclass(${proxyTable}) IS NOT NULL AS there
  `.execute(db);
  let proxyEur = 0;
  if (present.rows[0]?.there) {
    const spend = await sql<{ total: number }>`
      SELECT COALESCE(SUM(spend), 0) AS total
      FROM ${sql.raw(proxyTable)}
      WHERE "startTime" > (now() AT TIME ZONE 'utc') - interval '60 minutes'
    `.execute(db);
    proxyEur = Number(spend.rows[0]?.total ?? 0);
  }

  const windowEur = Number(ledger.total) + proxyEur;

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
