import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { fetchModelNames, modelLabel } from "@/lib/model-names";

// Node detail read seam (E6.3 wave 3c — ORGANIZATION_ENGINE_SPEC §12).
// One row from v_org_node_detail (madde 5.3 field set), read column by column:
// the view still carries columns the dashboard no longer reads, so the list
// below — not "*" — decides what leaves this route. Read-only: no mutation
// ever passes through here.

const Query = z.object({
  id: z.string().uuid(),
});

const DETAIL_COLUMNS = [
  "employee_id", "slug", "title", "title_tr", "role_level", "employment_status",
  "department_slug", "department_name", "manager_id", "manager_slug",
  "manager_title", "manager_title_tr", "direct_reports", "brain", "model_status",
  "autonomy_level", "mcp_profile", "has_employee_record", "kpi_count",
  "cost_30d_eur", "active_tasks", "active_runs", "skills", "grants_count",
  "memory_count",
].join(", ");

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = Query.safeParse({
    id: url.searchParams.get("id") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ ok: false, error: "PERMISSION_DENIED" }, { status: 401 });
  }

  const { data: detail, error } = await supabase
    .from("v_org_node_detail")
    .select(DETAIL_COLUMNS)
    .eq("employee_id", parsed.data.id)
    .maybeSingle<Record<string, unknown>>();
  if (error) {
    return NextResponse.json({ ok: false, error: "READ_FAILED" }, { status: 500 });
  }
  if (!detail) {
    return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  }

  // U21 eye-test: the node drawer rendered `brain` raw, so the CEO read the
  // frozen technical id ("fable-5") instead of "Claude Opus 5". The id is kept
  // in the payload — internal consumers still key on it — and the CEO-visible
  // label rides alongside it.
  const modelNames = await fetchModelNames(supabase);
  const withLabel =
    detail && typeof detail.brain === "string"
      ? { ...detail, brain_label: modelLabel(modelNames, detail.brain) }
      : detail;

  return NextResponse.json({ ok: true, detail: withLabel });
}
