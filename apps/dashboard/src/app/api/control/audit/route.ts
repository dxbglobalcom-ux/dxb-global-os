import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Audit-family mutation seam (E8.4 — AUDIT_AND_LOGGING_SPEC §8). ONE op:
// mark_reviewed, the single writable audit field (file_changes.review_status).
// Same idiom as the models/settings/org seams — the handler validates session
// + body shape only; the business rules (actor wall, status check, canonical
// detail_ref audit row, reviewed_flagged → alert.raised broadcast,
// idempotency) live in control_audit_mark_reviewed.

const Body = z.object({
  op: z.literal("mark_reviewed"),
  fileChangeId: z.number().int().positive(),
  status: z.enum(["reviewed_ok", "reviewed_flagged"]),
  note: z.string().max(500).optional(),
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

  const { data, error } = await supabase.rpc("control_audit_mark_reviewed", {
    p_payload: {
      file_change_id: body.fileChangeId,
      status: body.status,
      note: body.note ?? null,
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
