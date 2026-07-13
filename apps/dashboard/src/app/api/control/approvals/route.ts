import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Approval Center decision seam (E9.3 — APPROVAL_ENGINE §8). Session + body
// shape live here; the rules (CEO-only wall, pending-only, single-level
// delegation, locked-rule rejection, idempotency, outbox release inside the
// same transaction) live in control_approvals_action. The legacy inbox path
// (decide_approvals, 0015) stays untouched beside this seam.

const Body = z.object({
  op: z.literal("decide"),
  approvalId: z.string().uuid(),
  action: z.enum([
    "approve",
    "reject",
    "approve_with_modifications",
    "delegate",
    "request_info",
    "reanalyze",
    "change_policy",
  ]),
  note: z.string().max(2000).optional(),
  modifications: z.record(z.string(), z.unknown()).optional(),
  employeeId: z.string().uuid().optional(),
  modelId: z.string().optional(),
  ruleId: z.string().uuid().optional(),
  set: z
    .object({
      gate: z.enum(["autonomous", "notify", "gated"]).optional(),
      enabled: z.boolean().optional(),
      priority: z.number().int().optional(),
    })
    .optional(),
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

  const { data, error } = await supabase.rpc("control_approvals_action", {
    p_payload: {
      op: body.op,
      approval_id: body.approvalId,
      action: body.action,
      note: body.note ?? null,
      modifications: body.modifications ?? null,
      employee_id: body.employeeId ?? null,
      model_id: body.modelId ?? null,
      rule_id: body.ruleId ?? null,
      set: body.set ?? null,
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
