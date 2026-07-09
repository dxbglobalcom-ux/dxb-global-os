// Compaction — write-policy rule 5's cron half (master PHASE-06 §3; the data
// half — expires_at stamped at commit — landed in 06-04). Aging out is
// DELETE-FREE and audited (T-06-24):
//
// DESIGN NOTE: the LOCKED memory_index schema has no status column and
// deletion is forbidden (REVOKE + house rule "silme YOK"). The retired marker
// is therefore a SELF-TOMBSTONE — superseded_by = id. Recall's shared filter
// (liveMemoryFilter) already excludes any row with superseded_by set, so a
// self-superseded row disappears from both trust modes with zero reader
// changes, while its provenance/audit history stays queryable forever.
import { sql, type Kysely } from "kysely";
import { type DB } from "@dxb/shared";

const ACTOR = "memory-router:compaction";

export interface CompactExpiredResult {
  count: number;
  ids: string[];
}

/** Mark every expired, still-live row as retired (self-tombstone) and append
 *  ONE audit row for the batch — same transaction. Idempotent: already-marked
 *  rows have superseded_by set and never match again. Returns the batch. */
export async function compactExpired(db: Kysely<DB>): Promise<CompactExpiredResult> {
  return db.transaction().execute(async (trx) => {
    const marked = await trx
      .updateTable("memory_index")
      .set({ superseded_by: sql<string>`id` })
      .where("expires_at", "<", sql<Date>`now()`)
      .where("superseded_by", "is", null)
      .returning("id")
      .execute();
    const ids = marked.map((r) => r.id);
    if (ids.length > 0) {
      await trx
        .insertInto("audit_log")
        .values({
          actor: ACTOR,
          actor_type: "agent",
          action: "memory_expired",
          task_id: null,
          payload: JSON.stringify({ count: ids.length, ids }),
        })
        .execute();
    }
    return { count: ids.length, ids };
  });
}
