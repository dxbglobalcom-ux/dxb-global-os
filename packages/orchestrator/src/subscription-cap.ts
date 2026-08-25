// B39 — THE BRAKE THE MAIN WORKING PATH NEVER HAD.
//
// The holding has two money brakes and neither one can see the path that does
// almost all of its work.
//
//   breaker.ts      60-minute EUR window  ─┐  both read cost_ledger.cost_eur
//   monthly-cap.ts  monthly EUR ceiling   ─┘  + the LiteLLM proxy's spend logs
//
// Anthropic models bypass that proxy entirely — the CEO's own order of
// 2026-07-19 (C2) — so worker-shim's subscription branch writes no EUR anywhere
// and touches no spend table. Measured in the company's database on 2026-08-25:
// agent_runs held 378 runs and 1,032,526 tokens; cost_ledger held ZERO rows.
// A million tokens of work, and the cost book had never seen a line of it.
//
// That is survivable while one line runs one task at a time. It stops being
// survivable the moment the line is multiplied, which is the question the CEO
// asked that day — so the brake is built BEFORE the answer, not after it.
//
// WHY THE LEVER IS "STOP CLAIMING" AND NOT "BLOCK A KEY". The velocity breaker
// stops runaway API spend by blocking the department's LiteLLM virtual key. The
// subscription path holds no key and asks the proxy nothing; the only thing that
// can stop it is the dispatcher refusing to take more work. So this brake acts
// where the work is claimed, and it releases itself as the hour rolls off — no
// human has to clear it.
//
// WHAT IT DOES NOT DO. It writes no EUR. The single-source cost rule
// (litellm.ts LOCKED header, 04-04) forbids a second writer of API-mode money
// because LiteLLM's own tables already hold it; this path is in no such table
// and this file adds no euro figure. It records TOKENS, which nothing else does,
// exactly as council.ts has recorded its own calls since Phase 4.
import { sql } from "kysely";
import { getDb } from "@dxb/shared";

/** The CEO's ceiling, in his settings screen. */
export const SUBSCRIPTION_CAP_KEY = "orchestrator.subscription_tokens_per_hour";

/** Used only when the setting is missing — the migration seeds the real one. */
export const SUBSCRIPTION_CAP_FALLBACK = 500_000;

export interface SubscriptionWindow {
  /** Tokens the subscription path spent in the last 60 minutes. */
  tokens: number;
  /** The ceiling in force, read from settings each time. */
  cap: number;
  /** false = the dispatcher must not claim more work this tick. */
  open: boolean;
}

/**
 * The 60-minute subscription window, measured on every call.
 *
 * Never throws: a brake that dies takes the whole dispatch line down with it,
 * and a line that stops silently is the anti-babysitting engine failing shut.
 * A failed measurement reports the window OPEN and says so loudly — the same
 * choice breaker.ts makes when the proxy's spend table is unreachable.
 */
export async function checkSubscriptionWindow(): Promise<SubscriptionWindow> {
  try {
    const res = await sql<{ tokens: string | null; cap: string | null }>`
      SELECT
        (SELECT COALESCE(SUM(prompt_tokens + completion_tokens), 0)
           FROM cost_ledger
          WHERE mode = 'subscription'
            AND created_at > now() - interval '60 minutes')      AS tokens,
        fn_setting_numeric(${SUBSCRIPTION_CAP_KEY}, ${SUBSCRIPTION_CAP_FALLBACK}) AS cap
    `.execute(getDb());
    const row = res.rows[0];
    const tokens = Number(row?.tokens ?? 0);
    const cap = Number(row?.cap ?? SUBSCRIPTION_CAP_FALLBACK);
    return { tokens, cap, open: tokens < cap };
  } catch (err) {
    console.error("[subscription-cap] window unreadable — the line stays open:", err);
    return { tokens: 0, cap: SUBSCRIPTION_CAP_FALLBACK, open: true };
  }
}

/**
 * One subscription run's consumption, written where a brake can read it.
 *
 * `source: 'worker'` distinguishes it from the proxy's own rows ('litellm'), a
 * hook's ('hook') and a human's ('manual'). cost_eur stays 0 — see the header.
 * Never throws: a task that finished must not fail because its receipt did.
 */
export async function recordSubscriptionSpend(args: {
  taskId: string;
  agentId: string | null;
  department: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
}): Promise<void> {
  try {
    await getDb()
      .insertInto("cost_ledger")
      .values({
        task_id: args.taskId,
        agent_id: args.agentId,
        department: args.department,
        model: args.model,
        mode: "subscription",
        prompt_tokens: args.tokensIn,
        completion_tokens: args.tokensOut,
        cost_eur: 0, // subscription: no marginal EUR, and no second money source
        source: "worker",
        meta: JSON.stringify({ brake: SUBSCRIPTION_CAP_KEY }),
      })
      .execute();
  } catch (err) {
    console.error("[subscription-cap] spend row failed (the task still stands):", err);
  }
}

/**
 * The CEO's own signal that his line has stopped, and why.
 *
 * Deduplicated while unresolved, like every other alert in this system: an hour
 * of refusals raises one alert, not two hundred.
 */
export async function alertSubscriptionCapReached(w: SubscriptionWindow): Promise<void> {
  try {
    await sql`
      INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                          suggested_action, dedup_key)
      VALUES ('attention', 'orchestrator',
              'The work line has stopped itself — the hourly model ceiling is full',
              'task dispatch',
              ${`the subscription path spent ${w.tokens} tokens in 60 minutes, ceiling ${w.cap}`},
              ${`Nothing is broken and nothing is lost: queued work waits and the line resumes by itself as the hour rolls off. Raise or lower the ceiling in settings (${SUBSCRIPTION_CAP_KEY}) if this is the wrong limit for the company's pace.`},
              'orchestrator:subscription-cap')
      ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
      DO NOTHING`.execute(getDb());
  } catch (err) {
    console.error("[subscription-cap] alert failed (the brake still held):", err);
  }
}
