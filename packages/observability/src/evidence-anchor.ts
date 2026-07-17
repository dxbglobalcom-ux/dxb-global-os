// R2.3 (moved from the orchestrator worker-shim so BOTH spawn paths share
// it): anchor executor-declared verification evidence to the run's REAL
// tool_calls rows (FABLE_5_HOOK std 15 tool_call_proof). Resolution only —
// an item whose named tool has no recorded call stays unanchored and the
// post-gate rejects it; the binding never invents a reference (A10).
// Call RunScope.settle() first so the buffered rows are queryable.
import { sql } from "kysely";
import { getDb } from "@dxb/shared";

export async function resolveEvidenceToolCalls(
  result: unknown,
  runId: string,
): Promise<void> {
  if (!result || typeof result !== "object") return;
  const evidence = (result as { evidence?: unknown }).evidence;
  if (!Array.isArray(evidence) || evidence.length === 0) return;
  const db = getDb();
  for (const item of evidence) {
    if (!item || typeof item !== "object") continue;
    const e = item as { kind?: string; tool?: string; toolCallId?: string | null };
    if (e.kind !== "verification" || e.toolCallId || !e.tool) continue;
    const row = await sql<{ id: string }>`
      SELECT id FROM tool_calls
      WHERE run_id = ${runId}::uuid AND tool = ${e.tool}
      ORDER BY id DESC LIMIT 1
    `.execute(db);
    if (row.rows[0]) e.toolCallId = row.rows[0].id;
  }
}
