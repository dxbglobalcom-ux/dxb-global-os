// dxb intent "<text>" — KERN-01's first real surface (master-plan step 8).
// The CEO states intent once, as plain text; kernel + orchestrator take it to
// queued, dependency-ordered tasks. No tool, model, or department is ever
// named by the human. Dashboard command bar and JARVIS (Phases 8-9) reuse
// this exact seam.
//
// The raw string is DATA on every hop (T-05-16): argv → classify() prompt →
// Kysely parameters. It is never interpolated into a shell command or SQL
// string, and this module imports no child_process. Length is capped — an
// intent is a sentence, not a document.
import { getDb } from "@dxb/shared";
import { classify, loadPolicy, route } from "@dxb/kernel";
import { decompose, dispatch } from "@dxb/orchestrator";

export const MAX_INTENT_CHARS = 2000;

export class IntentError extends Error {}

export interface QueuedIntent {
  task_class: string;
  departments: string[];
  complexity: string;
  tasks: { id: string; department: string; model_tier: string; depends_on: string[] }[];
}

export async function intent(text: string): Promise<QueuedIntent> {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new IntentError("intent text is required");
  }
  if (trimmed.length > MAX_INTENT_CHARS) {
    throw new IntentError(
      `intent text is ${trimmed.length} chars — cap is ${MAX_INTENT_CHARS}; ` +
        "state the intent as a sentence, attach documents as task inputs later",
    );
  }

  const ci = await classify(trimmed);
  // Fail fast BEFORE decompose/dispatch: an unroutable classification exits 1
  // with nothing queued (route throws NoRouteError — fail-closed, KERN-02).
  route(ci, await loadPolicy(getDb()));

  const envelopes = await decompose(ci); // single → 1 envelope, no LLM; multi → drafted chain
  const { taskIds } = await dispatch(envelopes); // one transaction — partial queue impossible
  return {
    task_class: ci.task_class,
    departments: ci.departments,
    complexity: ci.complexity,
    tasks: envelopes.map((e, i) => ({
      id: taskIds[i],
      department: e.department,
      model_tier: e.model_tier,
      depends_on: e.deps.map((d) => taskIds[d]),
    })),
  };
}
