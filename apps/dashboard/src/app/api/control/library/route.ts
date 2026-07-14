import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Holding Library control seam (E9.5 — HOLDING_LIBRARY §5/§8, API_CONTRACTS
// 8b). Session + body shape live here; the rules (CEO-only wall §13,
// idempotency twin, change_log-inside-fn §5, grant broadcasts §9) live in
// control_library_action.

const KINDS = [
  "skill", "plugin", "tool", "mcp", "prompt_template", "persona", "policy",
  "governance_rule", "workflow", "sop", "framework", "code_component",
  "design_system", "research", "report", "project_doc", "training",
  "memory_source", "best_practice", "lesson_learned",
] as const;

const ItemFields = {
  version: z.string().max(60).optional(),
  ownerDept: z.string().max(120).optional(),
  ownerEmployeeId: z.string().uuid().optional(),
  usageNotes: z.string().max(2000).optional(),
  dependencies: z.array(z.string().max(200)).max(50).optional(),
  qualityScore: z.number().min(0).max(100).optional(),
  reviewStatus: z.string().max(40).optional(),
  sourceRef: z.string().max(500).optional(),
};

const Body = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("register_item"),
    kind: z.enum(KINDS),
    name: z.string().min(1).max(200),
    ...ItemFields,
  }),
  z.object({
    op: z.literal("update_item"),
    itemId: z.string().uuid(),
    ...ItemFields,
  }),
  z.object({
    op: z.literal("grant"),
    itemId: z.string().uuid(),
    granteeKind: z.enum(["department", "employee", "role_level"]),
    granteeId: z.string().min(1).max(120),
    expiresAt: z.string().datetime().optional(),
  }),
  z.object({
    op: z.literal("revoke_grant"),
    grantId: z.number().int().positive(),
  }),
]);

const ERROR_STATUS: Record<string, number> = {
  VALIDATION_FAILED: 400,
  PERMISSION_DENIED: 403,
  IDEMPOTENCY_MISMATCH: 422,
  CONFLICT_STALE: 409,
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

  const payload: Record<string, unknown> = { action: body.op };
  const itemFields = (b: {
    version?: string;
    ownerDept?: string;
    ownerEmployeeId?: string;
    usageNotes?: string;
    dependencies?: string[];
    qualityScore?: number;
    reviewStatus?: string;
    sourceRef?: string;
  }) => ({
    version: b.version ?? null,
    owner_dept: b.ownerDept ?? null,
    owner_employee_id: b.ownerEmployeeId ?? null,
    usage_notes: b.usageNotes ?? null,
    dependencies: b.dependencies ?? null,
    quality_score: b.qualityScore ?? null,
    review_status: b.reviewStatus ?? null,
    source_ref: b.sourceRef ?? null,
  });
  switch (body.op) {
    case "register_item":
      Object.assign(payload, { kind: body.kind, name: body.name }, itemFields(body));
      break;
    case "update_item":
      Object.assign(payload, { item_id: body.itemId }, itemFields(body));
      break;
    case "grant":
      Object.assign(payload, {
        item_id: body.itemId,
        grantee_kind: body.granteeKind,
        grantee_id: body.granteeId,
        expires_at: body.expiresAt ?? null,
      });
      break;
    case "revoke_grant":
      Object.assign(payload, { grant_id: body.grantId });
      break;
  }

  const { data, error } = await supabase.rpc("control_library_action", {
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
