import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Project OS control seam (E9.4 — PROJECT_OS §6/§8, API_CONTRACTS 8b). Session
// + body shape live here; the rules (CEO-only wall §13, idempotency twin,
// links credential gate §16, archive guard §27, cycle/seq failure modes §17)
// live in control_project_action.

const LinkList = z.array(z.string().max(500)).max(50);
const Links = z
  .object({
    repos: LinkList.optional(),
    docs: LinkList.optional(),
    deploys: LinkList.optional(),
    versions: LinkList.optional(),
    deliverables: LinkList.optional(),
    budget_eur: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  })
  .strict();

const Body = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("create"),
    slug: z.string().regex(/^[a-z0-9-]{3,60}$/),
    name: z.string().min(1).max(200),
    purpose: z.string().min(1).max(2000),
    strategyLink: z.string().max(500).optional(),
    ownerEmployeeId: z.string().uuid().optional(),
    companyId: z.string().uuid().optional(),
    links: Links.optional(),
  }),
  z.object({
    op: z.literal("update"),
    projectId: z.string().uuid(),
    name: z.string().min(1).max(200).optional(),
    purpose: z.string().min(1).max(2000).optional(),
    strategyLink: z.string().max(500).optional(),
    ownerEmployeeId: z.string().uuid().optional(),
    links: Links.optional(),
  }),
  z.object({
    op: z.literal("set_status"),
    projectId: z.string().uuid(),
    status: z.enum(["draft", "active", "paused", "done", "archived"]),
  }),
  z.object({
    op: z.literal("add_milestone"),
    projectId: z.string().uuid(),
    seq: z.number().int().min(1),
    title: z.string().min(1).max(200),
    kind: z.enum(["phase", "milestone"]).optional(),
    dueAt: z.string().datetime().optional(),
    planRef: z.string().max(500).optional(),
  }),
  z.object({
    op: z.literal("set_dependency"),
    taskId: z.string().uuid(),
    dependsOn: z.string().uuid(),
  }),
  z.object({
    op: z.literal("add_member"),
    projectId: z.string().uuid(),
    employeeId: z.string().uuid(),
    role: z.enum(["owner", "director", "member"]).optional(),
  }),
  z.object({
    op: z.literal("log_risk"),
    projectId: z.string().uuid(),
    title: z.string().min(1).max(300),
    severity: z.enum(["low", "medium", "high", "critical"]),
    note: z.string().max(2000).optional(),
  }),
  z.object({
    op: z.literal("update_risk"),
    riskId: z.string().uuid(),
    status: z.enum(["open", "mitigated", "accepted", "closed"]),
    note: z.string().max(2000).optional(),
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

  // update_risk is the fn's log_risk{risk_id,...} form (§14 risk updates).
  const payload: Record<string, unknown> = { action: body.op };
  switch (body.op) {
    case "create":
      Object.assign(payload, {
        slug: body.slug,
        name: body.name,
        purpose: body.purpose,
        strategy_link: body.strategyLink ?? null,
        owner_employee_id: body.ownerEmployeeId ?? null,
        company_id: body.companyId ?? null,
        links: body.links ?? null,
      });
      break;
    case "update":
      Object.assign(payload, {
        project_id: body.projectId,
        name: body.name ?? null,
        purpose: body.purpose ?? null,
        strategy_link: body.strategyLink ?? null,
        owner_employee_id: body.ownerEmployeeId ?? null,
        links: body.links ?? null,
      });
      break;
    case "set_status":
      Object.assign(payload, { project_id: body.projectId, status: body.status });
      break;
    case "add_milestone":
      Object.assign(payload, {
        project_id: body.projectId,
        seq: body.seq,
        title: body.title,
        kind: body.kind ?? null,
        due_at: body.dueAt ?? null,
        plan_ref: body.planRef ?? null,
      });
      break;
    case "set_dependency":
      Object.assign(payload, { task_id: body.taskId, depends_on: body.dependsOn });
      break;
    case "add_member":
      Object.assign(payload, {
        project_id: body.projectId,
        employee_id: body.employeeId,
        role: body.role ?? null,
      });
      break;
    case "log_risk":
      Object.assign(payload, {
        project_id: body.projectId,
        title: body.title,
        severity: body.severity,
        note: body.note ?? null,
      });
      break;
    case "update_risk":
      Object.assign(payload, {
        action: "log_risk",
        risk_id: body.riskId,
        status: body.status,
        note: body.note ?? null,
      });
      break;
  }

  const { data, error } = await supabase.rpc("control_project_action", {
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
