import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Org mutation seam (E6.3 — API_CONTRACTS `control_org_*`). Same shape as
// the settings seam: the handler validates session + body shape only; every
// business rule lives in the SECURITY DEFINER fn (actor wall, row locks,
// audit + Broadcast in one transaction). Idempotency-Key mandatory.
// Registered adaptation A2 (migration header): one route with an op union
// instead of /api/control/org/<op> subpaths — the E6.1 seam idiom.

const Ops = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("create_company"),
    slug: z.string().min(1).max(80),
    name: z.string().min(1).max(200),
    mission: z.string().max(2000).optional(),
  }),
  z.object({
    op: z.literal("create_department"),
    slug: z.string().min(1).max(80),
    displayName: z.string().min(1).max(200),
    companyId: z.string().uuid(),
    parentId: z.string().uuid().optional(),
  }),
  z.object({
    op: z.literal("assign_director"),
    departmentId: z.string().uuid(),
    employeeId: z.string().uuid(),
  }),
  z.object({
    op: z.literal("move_employee"),
    employeeId: z.string().uuid(),
    newDepartment: z.string().min(1).max(80),
    newManagerId: z.string().uuid().optional(),
  }),
  z.object({
    op: z.literal("suspend_employee"),
    employeeId: z.string().uuid(),
    reason: z.string().min(1).max(2000),
  }),
  z.object({
    op: z.literal("reactivate_employee"),
    employeeId: z.string().uuid(),
  }),
  z.object({
    op: z.literal("assign_model_group"),
    modelId: z.string().min(1).max(120),
    employeeIds: z.array(z.string().uuid()).min(1).max(500),
    rationale: z.string().max(2000).optional(),
  }),
  z.object({
    op: z.literal("archive_employee"),
    employeeId: z.string().uuid(),
  }),
]);

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

  let body: z.infer<typeof Ops>;
  try {
    body = Ops.parse(await request.json());
  } catch {
    return NextResponse.json(
      { ok: false, error: "VALIDATION_FAILED", detail: "invalid body" },
      { status: 400 },
    );
  }

  const call =
    body.op === "create_company"
      ? supabase.rpc("control_org_create_company", {
          p_slug: body.slug,
          p_name: body.name,
          p_mission: body.mission ?? null,
          p_idempotency_key: idempotencyKey,
        })
      : body.op === "create_department"
        ? supabase.rpc("control_org_create_department", {
            p_slug: body.slug,
            p_display_name: body.displayName,
            p_company_id: body.companyId,
            p_parent_id: body.parentId ?? null,
            p_idempotency_key: idempotencyKey,
          })
        : body.op === "assign_director"
          ? supabase.rpc("control_org_assign_director", {
              p_department_id: body.departmentId,
              p_employee_id: body.employeeId,
              p_idempotency_key: idempotencyKey,
            })
          : body.op === "move_employee"
            ? supabase.rpc("control_org_move_employee", {
                p_employee_id: body.employeeId,
                p_new_department: body.newDepartment,
                p_new_manager_id: body.newManagerId ?? null,
                p_idempotency_key: idempotencyKey,
              })
            : body.op === "suspend_employee"
              ? supabase.rpc("control_org_suspend_employee", {
                  p_employee_id: body.employeeId,
                  p_reason: body.reason,
                  p_idempotency_key: idempotencyKey,
                })
              : body.op === "reactivate_employee"
                ? supabase.rpc("control_org_reactivate_employee", {
                    p_employee_id: body.employeeId,
                    p_idempotency_key: idempotencyKey,
                  })
                : body.op === "assign_model_group"
                  ? supabase.rpc("control_org_assign_model_group", {
                      p_model_id: body.modelId,
                      p_employee_ids: body.employeeIds,
                      p_rationale: body.rationale ?? null,
                      p_idempotency_key: idempotencyKey,
                    })
                  : supabase.rpc("control_org_archive_employee", {
                      p_employee_id: body.employeeId,
                      p_idempotency_key: idempotencyKey,
                    });

  const { data, error } = await call;
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
