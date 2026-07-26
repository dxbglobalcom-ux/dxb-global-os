// Monthly budget cap — the automatic writer that was missing (W1.6).
//
// MEASURED 2026-07-26 before writing this, and CORRECTED mid-build:
//
//   * ALERTING was COMPLETE. `20260713080000_e84b_alerts.sql` ships two
//     triggers: one on cost_ledger raising 70% / 90% / 100% rows (its 100% text
//     tells the CEO "Non-critical work hard-stops"), and `trg_alert_budget_stop`
//     on budget_state raising `budget-hard-stop` the moment the flag flips.
//   * ENFORCEMENT was MISSING. `budget_state.hard_stopped` had exactly ONE
//     writer in the whole system — `tools/dxb-cli/src/kill-switch.ts`, run by
//     hand. Nothing ever flipped it from spend.
//
// So the system told the CEO that work stops and then did not stop it. That is
// the same class of defect as an invented number: it changes what he believes
// about his own company.
//
// This module is therefore ONLY the missing writer. It raises no alert at all —
// flipping the flag makes the existing trigger speak, and a second voice for one
// fact is noise. Everything here is enforcement plus an audit row.
//
// COST_CONTROL_SPEC: alert at 70%, hard-stop non-critical work at 100%. The
// velocity breaker next door (COST-03) already handles the 60-minute runaway
// window; this is the slow, month-shaped one. Same 5-minute scheduler tick, same
// unified spend source (cost_ledger + LiteLLM spend logs), same critical-lane
// exemption so approvals, outbox, health and backup keep running.
//
// Release is deliberately NOT automatic. A month rolling over does not undo a
// stop the company earned: the CEO releases it with `dxb kill-switch --release`,
// and that stays a human decision.

import { sql, type Kysely } from "kysely";
import {
  getDb,
  keyUpdate,
  listDxbKeys,
  DXB_KEY_ALIAS_PREFIX,
  LITELLM_SCHEMA,
  LITELLM_SPEND_TABLE,
} from "@dxb/shared";
import type { DB } from "@dxb/shared";
import { CRITICAL_DEPARTMENTS } from "./breaker.js";

/** Warn the CEO here (COST_CONTROL_SPEC). */
export const WARN_RATIO = 0.7;
/** Stop non-critical work here. */
export const STOP_RATIO = 1.0;

export interface MonthlyCapResult {
  month_eur: number;
  cap_eur: number;
  ratio: number;
  already_stopped: boolean;
  newly_stopped: boolean;
  warned: boolean;
  blocked_aliases: string[];
  block_errors: string[];
}

function isCritical(keyAlias: string): boolean {
  return CRITICAL_DEPARTMENTS.some(
    (dept) => keyAlias === `${DXB_KEY_ALIAS_PREFIX}${dept.toLowerCase()}`,
  );
}

/**
 * Month-to-date spend against the cap. Runs on the 5-minute breaker tick.
 *
 * Never throws on the LiteLLM side: if the proxy's spend table is unreachable
 * the ledger figure alone still governs, because a monitoring outage must not
 * silently disable the brake.
 *
 * `db` is injectable so a test can run the whole check inside ONE rolled-back
 * transaction. This is not a convenience: a probe that reaches the live
 * `budget_state` stops the real company, and it already did once — see the
 * audit row `budget.hard_stop.reverted` (2026-07-26).
 */
export async function checkMonthlyCap(db: Kysely<DB> = getDb()): Promise<MonthlyCapResult> {

  const ledger = await db
    .selectFrom("cost_ledger")
    .select((eb) => eb.fn.coalesce(eb.fn.sum("cost_eur"), sql.lit(0)).as("total"))
    .where("created_at", ">=", sql<Date>`date_trunc('month', now())`)
    .executeTakeFirstOrThrow();

  let proxyEur = 0;
  try {
    const spend = await sql<{ total: number }>`
      SELECT COALESCE(SUM(spend), 0) AS total
      FROM ${sql.raw(`${LITELLM_SCHEMA}."${LITELLM_SPEND_TABLE}"`)}
      WHERE "startTime" >= date_trunc('month', (now() AT TIME ZONE 'utc'))
    `.execute(db);
    proxyEur = Number(spend.rows[0]?.total ?? 0);
  } catch {
    proxyEur = 0; // ledger-only is still a real brake
  }

  const monthEur = Number(ledger.total) + proxyEur;
  const state = await db.selectFrom("budget_state").selectAll().executeTakeFirstOrThrow();
  const capEur = Number(state.monthly_cap_eur);
  const ratio = capEur > 0 ? monthEur / capEur : 0;

  const result: MonthlyCapResult = {
    month_eur: monthEur,
    cap_eur: capEur,
    ratio,
    already_stopped: state.hard_stopped,
    newly_stopped: false,
    warned: false,
    blocked_aliases: [],
    block_errors: [],
  };

  // `warned` is a REPORT of where we are, not an action: the cost_ledger
  // trigger owns the 70/90/100 alerts and this module must not double them.
  result.warned = ratio >= WARN_RATIO;

  if (ratio < STOP_RATIO || state.hard_stopped) return result;

  // 100%: DB state first — the hard signal must survive even if the proxy is
  // down — then best-effort key blocking, then one audit row with the outcome.
  await db
    .updateTable("budget_state")
    .set({ hard_stopped: true, updated_at: sql`now()` })
    .execute();
  result.newly_stopped = true;

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
      actor: "system:monthly-cap",
      actor_type: "system",
      action: "budget.hard_stop",
      task_id: null,
      payload: JSON.stringify({
        month_eur: result.month_eur,
        cap_eur: result.cap_eur,
        blocked_aliases: result.blocked_aliases,
        block_errors: result.block_errors,
        critical_exceptions: CRITICAL_DEPARTMENTS,
      }),
    })
    .execute();

  return result;
}
