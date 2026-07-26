// Intent intake — the kernel side of the dashboard's command-bar seam
// (DASH-02, master plan step 7). The dashboard only INSERTs a raw-text
// intents row; THIS worker (hosted by the pg-boss resident) claims received
// rows and runs the Phase-5 pipeline: classify → decompose → dispatch.
// The LLM lives here, never in the dashboard process.
//
// Claiming uses FOR UPDATE SKIP LOCKED (same discipline as the task queue) —
// concurrent workers never double-process an intent. Every terminal state is
// recorded on the row: dispatched (+task_ids) or failed_dispatch (+error).
import { sql } from "kysely";
import { getDb } from "@dxb/shared";
import { classify, type ClassifiedIntent } from "@dxb/kernel";
import { decompose, type DecomposedEnvelope } from "./decompose.js";
import { dispatch } from "./dispatch.js";

// R2.1 — std 11 project link for CEO intents (registered adaptation, roadmap
// row R2.1): command-bar work is by definition holding-OS work, so intent-born
// tasks ride the dogfood project row (slug 'dxb-global-os' — its purpose text
// names itself the OS's own project record). Without this link every
// intent-born task died at the std.project_alignment pre-gate (measured live
// 2026-07-17: 5 ladder rounds → blocked). Missing row (fresh DB) → null →
// the pre-gate rejects loudly, which is the honest signal.
const HOLDING_PROJECT_SLUG = "dxb-global-os";

async function holdingProjectId(): Promise<string | null> {
  const res = await sql<{ id: string }>`
    SELECT id FROM projects WHERE slug = ${HOLDING_PROJECT_SLUG} AND status = 'active'
  `.execute(getDb());
  return res.rows[0]?.id ?? null;
}

export type IntentIntakeDeps = {
  classifyFn?: (text: string) => Promise<ClassifiedIntent>;
  decomposeFn?: (ci: ClassifiedIntent) => Promise<DecomposedEnvelope[]>;
  dispatchFn?: (
    envelopes: DecomposedEnvelope[],
    opts?: { projectId?: string | null; labelTr?: string | null },
  ) => Promise<{ taskIds: string[] }>;
};

export type IntakeResult =
  | { processed: false }
  | { processed: true; intentId: string; status: "dispatched"; taskIds: string[] }
  | { processed: true; intentId: string; status: "failed_dispatch"; error: string };

// Claim exactly one received intent and run it to a terminal state.
export async function intakeIntentOnce(deps: IntentIntakeDeps = {}): Promise<IntakeResult> {
  const db = getDb();
  const classifyFn = deps.classifyFn ?? classify;
  const decomposeFn = deps.decomposeFn ?? decompose;
  const dispatchFn = deps.dispatchFn ?? dispatch;

  // Claim: received → classifying, single row, race-safe.
  // source <> 'voice' (registered adaptation 2026-07-24, CEO: "selam verdi,
  // su içti gibi basit şeyler dahi buraya yansıyor"): voice-call intents are
  // CONVERSATION LINEAGE (V5), not work orders — the voice lane answers them
  // itself. Before this guard every spoken greeting rode intent→classify→
  // decompose→dispatch and became a company task with worker-selection and
  // escalation decisions trailing it. Spoken Q&A "asking is free and never
  // starts work" (§7 help contract); voice-COMMANDED work is the deferred
  // JARVIS lane (U15), which will dispatch explicitly, not by side effect.
  const claimed = await sql<{ id: string; text: string }>`
    update intents set status = 'classifying', updated_at = now()
    where id = (
      select id from intents where status = 'received' and source <> 'voice'
      order by created_at
      for update skip locked
      limit 1
    )
    returning id, text
  `.execute(db);

  const intent = claimed.rows[0];
  if (!intent) return { processed: false };

  try {
    const ci = await classifyFn(intent.text);
    const envelopes = await decomposeFn(ci);
    // The CEO's own sentence is the Turkish label of the work it becomes: the
    // rail shows him what he asked for, in the words he asked it in. Trimmed to
    // one readable line — the full text stays on the intent row.
    const labelTr = intent.text.split("\n")[0].trim().slice(0, 160) || null;
    const { taskIds } = await dispatchFn(envelopes, {
      projectId: await holdingProjectId(),
      labelTr,
    });

    await sql`
      update intents
      set status = 'dispatched', task_ids = ${taskIds}::uuid[], updated_at = now()
      where id = ${intent.id}::uuid
    `.execute(db);

    return { processed: true, intentId: intent.id, status: "dispatched", taskIds };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await sql`
      update intents
      set status = 'failed_dispatch', error = ${message}, updated_at = now()
      where id = ${intent.id}::uuid
    `.execute(db);
    return { processed: true, intentId: intent.id, status: "failed_dispatch", error: message };
  }
}

// Drain every received intent (resident tick entrypoint).
export async function drainIntents(deps: IntentIntakeDeps = {}, max = 20): Promise<number> {
  let processed = 0;
  for (let i = 0; i < max; i++) {
    const result = await intakeIntentOnce(deps);
    if (!result.processed) break;
    processed += 1;
  }
  return processed;
}
