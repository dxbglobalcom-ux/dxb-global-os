import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  LAYOUT_KEY,
  LAYOUT_SCOPE,
  LayoutSchema,
} from "@/components/widgets/types";

// E12.2 — widget layout control seam (CC-SPEC §6/§10: the dashboard-specific
// `layout` handler area). Shape is validated HERE against the spec §10
// schema (unknown widget types die at the door); persistence + audit +
// change_log + undo ride the EXISTING control_settings_set SECURITY DEFINER
// fn (SETTINGS spec owns it) — this route adds no new DB surface.

const Body = z.object({
  action: z.literal("save"),
  layout: LayoutSchema,
});

const ERROR_STATUS: Record<string, number> = {
  VALIDATION_FAILED: 400,
  PERMISSION_DENIED: 403,
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
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "VALIDATION_FAILED",
        detail: err instanceof z.ZodError ? err.issues[0]?.message : "invalid body",
      },
      { status: 400 },
    );
  }

  const { data, error } = await supabase.rpc("control_settings_set", {
    p_key: LAYOUT_KEY,
    p_scope: LAYOUT_SCOPE,
    p_value: body.layout,
    p_idempotency_key: idempotencyKey,
    p_expected_current: null,
    p_source: "api",
    p_rationale: "widget layout save (E12.2)",
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
