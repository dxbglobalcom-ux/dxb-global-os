import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Workflow control seam (E9.1 — WORKFLOW_ENGINE §8, API_CONTRACTS row
// `workflows`). Same idiom as the alerts seam: session + body shape here;
// the rules (CEO wall for CRUD, B7b approval-gate guard, versioning,
// snapshot freeze, singleton skip, audit rows, idempotency) live in
// control_workflow_action.

const Step = z.object({
  kind: z.enum(["agent", "approval", "review", "retry", "fallback"]),
  config: z.record(z.string(), z.unknown()).default({}),
});

const Body = z.object({
  action: z.enum([
    "create",
    "update",
    "copy",
    "enable",
    "disable",
    "run_now",
    "cancel_run",
    "resume_run",
  ]),
  slug: z.string().min(1).max(64).optional(),
  workflowId: z.string().uuid().optional(),
  runId: z.string().uuid().optional(),
  name: z.string().min(1).max(200).optional(),
  trigger: z
    .object({ kind: z.enum(["cron", "event", "manual"]) })
    .passthrough()
    .optional(),
  steps: z.array(Step).min(1).optional(),
  ownerEmployeeId: z.string().uuid().optional(),
  budgetEur: z.number().nonnegative().optional(),
  tokenLimit: z.number().int().positive().optional(),
  timeoutS: z.number().int().positive().optional(),
  risk: z.enum(["low", "medium", "high", "critical"]).optional(),
  loggingLevel: z.enum(["minimal", "normal", "verbose"]).optional(),
  outputStandard: z.string().max(500).optional(),
});

const ERROR_STATUS: Record<string, number> = {
  VALIDATION_FAILED: 400,
  PERMISSION_DENIED: 403,
  IDEMPOTENCY_MISMATCH: 422,
};

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ ok: false, error: "PERMISSION_DENIED" }, { status: 401 });
  }

  const idempotencyKey = request.headers.get("idempotency-key");
  if (!idempotencyKey || idempotencyKey.length > 128) {
    return NextResponse.json(
      { ok: false, error: "VALIDATION_FAILED", detail: "Idempotency-Key header required" },
      { status: 400 },
    );
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await request.json());
  } catch {
    return NextResponse.json(
      { ok: false, error: "VALIDATION_FAILED", detail: "invalid body" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase.rpc("control_workflow_action", {
    p_payload: {
      action: body.action,
      slug: body.slug ?? null,
      workflow_id: body.workflowId ?? null,
      run_id: body.runId ?? null,
      name: body.name ?? null,
      trigger: body.trigger ?? null,
      steps: body.steps ?? null,
      owner_employee_id: body.ownerEmployeeId ?? null,
      budget_eur: body.budgetEur ?? null,
      token_limit: body.tokenLimit ?? null,
      timeout_s: body.timeoutS ?? null,
      risk: body.risk ?? null,
      logging_level: body.loggingLevel ?? null,
      output_standard: body.outputStandard ?? null,
    },
    p_idempotency_key: idempotencyKey,
  });
  if (error) {
    return NextResponse.json(
      { ok: false, error: "VALIDATION_FAILED", detail: error.message },
      { status: 400 },
    );
  }
  const result = data as { ok: boolean; error?: string };
  const status = result.ok ? 200 : (ERROR_STATUS[result.error ?? ""] ?? 400);
  return NextResponse.json(result, { status });
}
