import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Revenue control seam (E6.5 — CEO directive 2026-07-12). Money-IN is
// approval-free by standing CEO rule; the fn writes the append-only
// revenue_ledger + audit + Broadcast in one transaction. Handler checks
// only session + shape — the security boundary is the DB fn.

const ENGINES = [
  "social_selling",
  "ecommerce",
  "consultancy",
  "venture",
  "physical",
  "other",
] as const;

const Body = z.object({
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  engine: z.enum(ENGINES),
  amountEur: z.number().finite().refine((n) => n !== 0, "amount cannot be 0"),
  description: z.string().trim().min(3).max(500),
  client: z.string().trim().max(200).optional(),
  department: z.string().trim().max(100).optional(),
  evidenceRef: z.string().trim().max(500).optional(),
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

  const { data, error } = await supabase.rpc("fn_revenue_record", {
    p_occurred_on: body.occurredOn,
    p_engine: body.engine,
    p_amount_eur: body.amountEur,
    p_description: body.description,
    p_idempotency_key: idempotencyKey,
    p_client: body.client ?? null,
    p_department: body.department ?? null,
    p_source: "manual",
    p_evidence_ref: body.evidenceRef ?? null,
    p_meta: null,
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
