import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Alert lifecycle seam (E8.4b — OBSERVABILITY_SPEC §8, API_CONTRACTS row
// `alerts`). Ops: ack / resolve / assign / mute. Same idiom as the audit
// seam — session + body shape here; the rules (actor wall, resolved guard,
// audit row with canonical detail_ref, idempotency, broadcast via the
// alerts-table trigger) live in control_alerts_action.

const Body = z.object({
  op: z.enum(["ack", "resolve", "assign", "mute"]),
  alertId: z.string().uuid(),
  note: z.string().max(500).optional(),
  mitigation: z.string().max(500).optional(),
  employeeId: z.string().uuid().optional(),
  minutes: z.number().int().min(1).max(10080).optional(),
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

  const { data, error } = await supabase.rpc("control_alerts_action", {
    p_payload: {
      op: body.op,
      alert_id: body.alertId,
      note: body.note ?? null,
      mitigation: body.mitigation ?? null,
      employee_id: body.employeeId ?? null,
      minutes: body.minutes ?? null,
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
