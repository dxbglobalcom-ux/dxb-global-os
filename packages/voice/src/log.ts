// The ONE write path into voice_calls (VOICE_INTERACTION_SPEC §8, V10):
// everything goes through control_voice_call_log — upsert by id, Broadcast
// `voice` events fired inside the fn. Direct table writes are revoked (P4).
import { sql, type Kysely } from "kysely";
import type { DB } from "@dxb/shared";

export async function logCall(db: Kysely<DB>, call: Record<string, unknown>): Promise<void> {
  await sql`SELECT control_voice_call_log(${JSON.stringify(call)}::jsonb)`.execute(db);
}
