import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Hook policy control seam (E10.1 — FABLE_5_HOOK_SPEC §13). Session + body
// shape live here; the rules (CEO-ONLY wall — the system actor is rejected
// too, idempotency twin, high-risk stamp on weakening a block policy, the
// settings-channel cache-drop broadcast §10) live in fn_hook_set_policy.

const Body = z.object({
  op: z.literal("set_policy"),
  policyId: z.string().min(1).max(120),
  severity: z.enum(["block", "warn"]).optional(),
  enabled: z.boolean().optional(),
  rule: z.record(z.string(), z.unknown()).optional(),
  titleEn: z.string().max(200).optional(),
  titleTr: z.string().max(200).optional(),
});

const ERROR_STATUS: Record<string, number> = {
  VALIDATION_FAILED: 400,
  PERMISSION_DENIED: 403,
  NOT_FOUND: 404,
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

  const payload: Record<string, unknown> = {
    action: "set_policy",
    policy_id: body.policyId,
    severity: body.severity ?? null,
    enabled: body.enabled ?? null,
    rule: body.rule ?? null,
    title_en: body.titleEn ?? null,
    title_tr: body.titleTr ?? null,
  };

  const { data, error } = await supabase.rpc("fn_hook_set_policy", {
    p_payload: payload,
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
