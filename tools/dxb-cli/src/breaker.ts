// dxb breaker reset — the audited human override for the velocity breaker
// (COST-03, T-4-13). Requires --confirm; every reset lands in audit_log as
// actor 'ceo:cli' so a silently-disabled breaker is impossible.
import { sql } from "kysely";
import { getDb, keyUpdate, listDxbKeys } from "@dxb/shared";
import { DecisionError } from "./approve.js";

export interface BreakerResetResult {
  was_tripped: boolean;
  unblocked_aliases: string[];
  unblock_errors: string[];
}

export async function resetBreaker(opts: { confirm: boolean }): Promise<BreakerResetResult> {
  if (!opts.confirm) {
    throw new DecisionError(
      "breaker reset is a budget-safety override — re-run with --confirm to proceed",
    );
  }
  const db = getDb();
  const state = await db.selectFrom("budget_state").selectAll().executeTakeFirstOrThrow();

  await db
    .updateTable("budget_state")
    .set({ breaker_tripped: false, breaker_tripped_at: null, updated_at: sql`now()` })
    .execute();

  const result: BreakerResetResult = {
    was_tripped: state.breaker_tripped,
    unblocked_aliases: [],
    unblock_errors: [],
  };

  try {
    const keys = await listDxbKeys();
    for (const key of keys) {
      if (key.blocked !== true) continue;
      try {
        await keyUpdate({ key: key.token, blocked: false });
        result.unblocked_aliases.push(key.key_alias);
      } catch (e) {
        result.unblock_errors.push(`${key.key_alias}: ${String(e).slice(0, 200)}`);
      }
    }
  } catch (e) {
    result.unblock_errors.push(`key listing failed: ${String(e).slice(0, 200)}`);
  }

  await db
    .insertInto("audit_log")
    .values({
      actor: "ceo:cli",
      actor_type: "ceo",
      action: "breaker.reset",
      task_id: null,
      payload: JSON.stringify(result),
    })
    .execute();

  return result;
}
