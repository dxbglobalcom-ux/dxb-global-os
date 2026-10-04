// The locked-tool watch (his list item 2, his yes of 2026-10-04 — PLAN-locked-tool.md step 5). Every 15
// minutes, deterministic, no model: it records the verdict of every finished review (locked or not any
// more), and for every locked pin it follows the lock's record to its review task and raises to the CEO
// only what must reach him —
//   - the review is done → its verdict is written to a `tool_drift_verdict` audit row (the seat's words go
//     there and nowhere else); a malicious verdict, or an answer that is not the contract's shape, raises
//     the lock alert to high;
//   - the review failed or was returned → high;
//   - the lock is older than 72 hours → high.
// Each reason acts ONCE per lock: a `tool_lock_escalated` audit row is the mark. The lock alert keeps its
// title; its level goes to high and its action line becomes the reason's fixed sentence (lock-review.ts) —
// if he resolved the alert while the tool stayed locked, it is opened again under the same key.
// The third condition he was shown ("a lock that blocks your approved work") is dropped: nothing measures
// it deterministically, and the 72-hour rule covers it.
//
// The tool check must run for any of this to happen: the machine sleeps at night (his word: normal until
// the holding moves to the cloud), and pg-boss does not replay a missed 04:00. pinCheckDue() is the rule
// the scheduler applies on every watch tick — the start and the wake in one.
import { sql, type Kysely } from "kysely";
import { type DB } from "@dxb/shared";
import {
  LOCK_REVIEWER_SLUG,
  escalationAction,
  lockAlertCause,
  lockAlertTitle,
  parseLockVerdict,
  type EscalationReason,
} from "./lock-review.js";

const ACTOR = "gateway:tool-lock-watch";
export const LOCK_ESCALATION_HOURS = 72;
export const PIN_CHECK_STALE_HOURS = 24;

/** The tool check is due when the newest check of any pin is older than 24 hours. No pins → nothing to
 *  check → not due. */
export function pinCheckDue(lastChecked: Date | null, now: Date = new Date()): boolean {
  if (lastChecked === null) return false;
  return now.getTime() - lastChecked.getTime() > PIN_CHECK_STALE_HOURS * 3600_000;
}

/** The newest `tool_pins.last_checked`, read for pinCheckDue. */
export async function newestPinCheck(db: Kysely<DB>): Promise<Date | null> {
  const r = await db
    .selectFrom("tool_pins")
    .select((eb) => eb.fn.max("last_checked").as("newest"))
    .executeTakeFirst();
  const v = r?.newest as Date | string | null | undefined;
  return v == null ? null : new Date(v);
}

export interface ToolLockWatchResult {
  locked: number;
  verdicts: Array<{ server: string; tool: string; verdict: string }>;
  escalated: Array<{ server: string; tool: string; reason: EscalationReason }>;
}

/** One lock as the watch reads it: the newest `tool_quarantined` record of a locked tool. Exported so a
 *  test can hand escalateLock a lock read before an unlock. */
export interface LockRow {
  server: string;
  tool: string;
  lock_audit_id: string;
  lock_at: Date;
  new_hash: string;
  signals: unknown;
}

/** One watch pass. `servers` narrows it (a test watches only its own fixture server). */
export async function watchToolLocks(
  db: Kysely<DB>,
  opts: { servers?: string[]; now?: Date } = {},
): Promise<ToolLockWatchResult> {
  const now = opts.now ?? new Date();
  const servers = opts.servers ?? null;
  const out: ToolLockWatchResult = { locked: 0, verdicts: [], escalated: [] };

  // 1. Every finished review gets its verdict recorded — whether or not its tool is still locked (Sol F4:
  //    a review still running at the unlock finishes later, and its answer belongs in the record too).
  const done = await sql<{ lock_audit_id: string; task_id: string; server: string; tool: string; result: unknown }>`
    SELECT r.payload->>'lock_audit_id' AS lock_audit_id, t.id AS task_id,
           r.payload->>'server' AS server, r.payload->>'tool' AS tool, t.result
      FROM audit_log r JOIN tasks t ON t.id = (r.payload->>'task_id')::uuid
     WHERE r.action = 'tool_review_opened' AND t.status = 'done'
       AND (${servers}::text[] IS NULL OR r.payload->>'server' = ANY(${servers}::text[]))
       AND NOT EXISTS (SELECT 1 FROM audit_log v
                        WHERE v.action = 'tool_drift_verdict'
                          AND v.payload->>'lock_audit_id' = r.payload->>'lock_audit_id')
     ORDER BY r.id
  `.execute(db);
  for (const review of done.rows) {
    const recorded = await recordVerdict(db, review);
    if (recorded) out.verdicts.push({ server: review.server, tool: review.tool, verdict: recorded });
  }

  // 2. Every locked pin with the newest lock record of that tool: what must reach the CEO.
  const locks = await sql<LockRow>`
    SELECT p.server, p.tool, a.id::text AS lock_audit_id, a.created_at AS lock_at,
           a.payload->>'new_hash' AS new_hash, a.payload->'signals' AS signals
      FROM tool_pins p
      JOIN LATERAL (
        SELECT id, created_at, payload FROM audit_log
         WHERE action = 'tool_quarantined'
           AND payload->>'server' = p.server AND payload->>'tool' = p.tool
         ORDER BY id DESC LIMIT 1
      ) a ON true
     WHERE p.quarantined
       AND (${servers}::text[] IS NULL OR p.server = ANY(${servers}::text[]))
     ORDER BY p.server, p.tool
  `.execute(db);
  out.locked = locks.rows.length;

  for (const lock of locks.rows) {
    const lockId = Number(lock.lock_audit_id);
    const review = await sql<{ status: string; verdict: string | null }>`
      SELECT t.status,
             (SELECT v.payload->>'verdict' FROM audit_log v
               WHERE v.action = 'tool_drift_verdict' AND (v.payload->>'lock_audit_id')::bigint = ${lockId}
               ORDER BY v.id LIMIT 1) AS verdict
        FROM audit_log r JOIN tasks t ON t.id = (r.payload->>'task_id')::uuid
       WHERE r.action = 'tool_review_opened' AND (r.payload->>'lock_audit_id')::bigint = ${lockId}
       ORDER BY r.id DESC LIMIT 1
    `.execute(db);
    const task = review.rows[0];
    if (task?.verdict === "malicious") await escalateLock(db, lock, "malicious", out);
    else if (task?.verdict === "unreadable") await escalateLock(db, lock, "review-failed", out);
    else if (task?.status === "failed" || task?.status === "returned") await escalateLock(db, lock, "review-failed", out);

    if (now.getTime() - new Date(lock.lock_at).getTime() > LOCK_ESCALATION_HOURS * 3600_000) {
      await escalateLock(db, lock, "lock-72h", out);
    }
  }
  return out;
}

/** Record one finished review's verdict, once (Sol F5): the check and the insert share a transaction
 *  under an advisory lock on the lock id, so two watches at once write one row. Returns the verdict
 *  written, or null when another pass already wrote it. */
async function recordVerdict(
  db: Kysely<DB>,
  review: { lock_audit_id: string; task_id: string; server: string; tool: string; result: unknown },
): Promise<string | null> {
  const lockId = Number(review.lock_audit_id);
  return db.transaction().execute(async (trx) => {
    await sql`SELECT pg_advisory_xact_lock(hashtext(${`tool-drift-verdict:${lockId}`}))`.execute(trx);
    const already = await sql<{ id: string }>`
      SELECT id FROM audit_log
       WHERE action = 'tool_drift_verdict' AND (payload->>'lock_audit_id')::bigint = ${lockId}
       LIMIT 1
    `.execute(trx);
    if (already.rows.length > 0) return null;
    const parsed = parseLockVerdict((review.result as { text?: unknown } | null)?.text);
    await trx
      .insertInto("audit_log")
      .values({
        actor: ACTOR,
        actor_type: "system",
        action: "tool_drift_verdict",
        task_id: review.task_id,
        payload: JSON.stringify({
          lock_audit_id: lockId,
          task_id: review.task_id,
          server: review.server,
          tool: review.tool,
          verdict: parsed.verdict,
          reasons: parsed.reasons,
        }),
      })
      .execute();
    return parsed.verdict;
  });
}

/** Raise one lock to the CEO for one reason, once. In one transaction: the pin row locked (FOR UPDATE —
 *  the unlock takes the same row lock), and nothing done unless the pin is STILL quarantined and this is
 *  still the newest lock of the tool (Sol F3: a lock read before an unlock must not reopen an alert for an
 *  unlocked tool); then the escalation mark checked under an advisory lock on (lock, reason), and the mark
 *  and the alert written together. A reopened alert names the fixer and the review again (Sol F11);
 *  alerts.task_id stays empty (trg_alert_supersede_on_task_done). */
export async function escalateLock(
  db: Kysely<DB>,
  lock: LockRow,
  reason: EscalationReason,
  out: ToolLockWatchResult,
): Promise<void> {
  const lockId = Number(lock.lock_audit_id);
  const raised = await db.transaction().execute(async (trx) => {
    const pin = await trx
      .selectFrom("tool_pins")
      .select("quarantined")
      .where("server", "=", lock.server)
      .where("tool", "=", lock.tool)
      .forUpdate()
      .executeTakeFirst();
    if (!pin?.quarantined) return false;
    const newest = await sql<{ id: string }>`
      SELECT id FROM audit_log
       WHERE action = 'tool_quarantined' AND payload->>'server' = ${lock.server} AND payload->>'tool' = ${lock.tool}
       ORDER BY id DESC LIMIT 1
    `.execute(trx);
    if (Number(newest.rows[0]?.id) !== lockId) return false;
    await sql`SELECT pg_advisory_xact_lock(hashtext(${`tool-lock-escalation:${lockId}:${reason}`}))`.execute(trx);
    const marked = await sql<{ id: string }>`
      SELECT id FROM audit_log
       WHERE action = 'tool_lock_escalated'
         AND (payload->>'lock_audit_id')::bigint = ${lockId} AND payload->>'reason' = ${reason}
       LIMIT 1
    `.execute(trx);
    if (marked.rows.length > 0) return false;
    // The fixer and the review, for an alert opened afresh: the review task's seat, else the active
    // security engineer.
    const link = await sql<{ task_id: string; agent_id: string | null }>`
      SELECT t.id AS task_id, t.agent_id
        FROM audit_log r JOIN tasks t ON t.id = (r.payload->>'task_id')::uuid
       WHERE r.action = 'tool_review_opened' AND (r.payload->>'lock_audit_id')::bigint = ${lockId}
       ORDER BY r.id DESC LIMIT 1
    `.execute(trx);
    const reviewer =
      link.rows[0]?.agent_id ??
      (
        await trx
          .selectFrom("agents")
          .select("id")
          .where("slug", "=", LOCK_REVIEWER_SLUG)
          .where("employment_status", "=", "active")
          .executeTakeFirst()
      )?.id ??
      null;
    await trx
      .insertInto("audit_log")
      .values({
        actor: ACTOR,
        actor_type: "system",
        action: "tool_lock_escalated",
        task_id: null,
        payload: JSON.stringify({ lock_audit_id: lockId, reason, server: lock.server, tool: lock.tool }),
      })
      .execute();
    const name = `${lock.server}/${lock.tool}`;
    const signals = Array.isArray(lock.signals) && lock.signals.length ? (lock.signals as string[]).join(", ") : "none";
    const action = escalationAction(reason, lockId);
    const sourceRef = JSON.stringify({
      table: "audit_log",
      audit_id: lockId,
      server: lock.server,
      tool: lock.tool,
      review_task_id: link.rows[0]?.task_id ?? null,
      escalation: reason,
    });
    await trx
      .insertInto("alerts")
      .values({
        level: "high",
        source: "gateway",
        title: lockAlertTitle(name),
        affected_area: "tool pins",
        probable_cause: lockAlertCause(signals),
        suggested_action: action,
        responsible_employee: reviewer,
        dedup_key: `pin:quarantined:${lock.server}:${lock.tool}:${String(lock.new_hash).slice(0, 12)}`,
        source_ref: sourceRef,
        escalated_at: sql<Date>`now()`,
        escalated_from: "informational",
      })
      .onConflict((oc) =>
        oc
          .column("dedup_key")
          .where("resolved_at", "is", null)
          .where("dedup_key", "is not", null)
          .doUpdateSet({
            level: "high",
            escalated_from: sql<string>`CASE WHEN alerts.level = 'high' THEN alerts.escalated_from ELSE alerts.level END`,
            escalated_at: sql<Date>`now()`,
            acknowledged_at: null,
            muted_until: null,
            suggested_action: action,
          }),
      )
      .execute();
    return true;
  });
  if (raised) out.escalated.push({ server: lock.server, tool: lock.tool, reason });
}
