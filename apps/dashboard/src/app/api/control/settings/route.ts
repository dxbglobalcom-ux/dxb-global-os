import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Settings control seam (E6.1 — API_CONTRACTS `control_{alan}_{eylem}`).
// The handler only checks that a session exists and validates shape; the
// security boundary is the DB fn (auth.uid() → actor, API_CONTRACTS §13).
// Idempotency-Key header is mandatory: the fn caches the response and a
// retry returns it verbatim — no second change_log row.

const SetPayload = z.object({
  key: z.string().min(1).max(120),
  scope: z.string().min(1).max(120).default("global"),
  value: z.unknown(),
  expectedCurrent: z.unknown().optional(),
  rationale: z.string().max(2000).optional(),
});

const UndoPayload = z.object({
  changeId: z.number().int().positive(),
});

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("set"), payload: SetPayload }),
  z.object({ action: z.literal("undo"), payload: UndoPayload }),
]);

// API_CONTRACTS error dictionary → HTTP status.
const ERROR_STATUS: Record<string, number> = {
  VALIDATION_FAILED: 400,
  PERMISSION_DENIED: 403,
  APPROVAL_REQUIRED: 202,
  CONFLICT_STALE: 409,
  IDEMPOTENCY_MISMATCH: 422,
};

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json(
      { ok: false, error: "PERMISSION_DENIED" },
      { status: 401 },
    );
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

  const { data, error } =
    body.action === "set"
      ? await supabase.rpc("control_settings_set", {
          p_key: body.payload.key,
          p_scope: body.payload.scope,
          p_value: body.payload.value ?? null,
          p_idempotency_key: idempotencyKey,
          p_expected_current: body.payload.expectedCurrent ?? null,
          p_source: "api",
          p_rationale: body.payload.rationale ?? null,
        })
      : await supabase.rpc("control_settings_undo", {
          p_change_id: body.payload.changeId,
          p_idempotency_key: idempotencyKey,
        });

  if (error) {
    return NextResponse.json(
      { ok: false, error: "INTERNAL", detail: error.message },
      { status: 500 },
    );
  }

  const result = data as { ok: boolean; error?: string };
  const status = result.ok ? 200 : (ERROR_STATUS[result.error ?? ""] ?? 500);
  return NextResponse.json(result, { status });
}
