import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// W2.1 — the objective door (REVENUE_ENGINE_SPEC §7).
//
// MEASURED before writing this: `control_objective_create`, `_activate` and
// `_close` have existed since the revenue wave and had **no caller anywhere in
// the product** — no screen, no API. Setting a target meant opening psql. The
// CEO's own framing of the whole system is "I state the number, the OS figures
// out how"; the number had no way in.
//
// Same shape as the other control doors: the gate, the audit row and the
// decision row live in the SECURITY DEFINER function; this handler only checks
// that there is a session and that the body is the right shape.
//
// Idempotency-Key is REQUIRED on write ops here — the org seam lesson from
// 2026-07-24, where a missing key made a double-submit indistinguishable from a
// second intent. A target is exactly the thing you must not create twice.

const Create = z.object({
  op: z.literal("create"),
  title: z.string().trim().min(1).max(200),
  amountEur: z.number().positive().max(1_000_000_000),
  metric: z.enum(["net_profit", "revenue", "gross_margin"]).default("net_profit"),
  periodStart: z.string().date().optional(),
  periodEnd: z.string().date().optional(),
  // Zero means "no capital may be committed" — the spec's G4 zero-capital
  // filter reads this, so it defaults to the safe end rather than to unlimited.
  capitalLimitEur: z.number().min(0).max(1_000_000_000).default(0),
  activate: z.boolean().default(false),
});

const Activate = z.object({
  op: z.literal("activate"),
  id: z.string().uuid(),
  periodStart: z.string().date().optional(),
  periodEnd: z.string().date().optional(),
});

const Close = z.object({
  op: z.literal("close"),
  id: z.string().uuid(),
  // MEASURED against the function, not guessed: it accepts achieved|missed|closed.
  outcome: z.enum(["achieved", "missed", "closed"]),
});

const Body = z.discriminatedUnion("op", [Create, Activate, Close]);

/** The calendar month we are in — a target with no deadline cannot be measured. */
function monthBounds(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  const idempotencyKey = request.headers.get("Idempotency-Key");
  if (!idempotencyKey) {
    return NextResponse.json({ ok: false, error: "idempotency_key_required" }, { status: 400 });
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await request.json());
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  if (body.op === "create") {
    // MEASURED: the function refuses `active` on create — "create accepts only
    // draft|proposed" — because activation is its own audited step, and it then
    // refuses to activate without a period. Both are correct: a target that runs
    // is a different act from a target that is written down, and a target with
    // no deadline cannot be measured. So the door does the two steps for the
    // CEO instead of making him do them, and defaults the period to THIS MONTH.
    const { data, error } = await supabase.rpc("control_objective_create", {
      p_title: body.title,
      p_amount_eur: body.amountEur,
      p_metric: body.metric,
      p_status: "draft",
      p_proposed_by: "ceo",
      p_period_start: body.periodStart ?? null,
      p_period_end: body.periodEnd ?? null,
      p_capital_limit_eur: body.capitalLimitEur,
      p_idempotency_key: idempotencyKey,
    });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    const created = data as { ok?: boolean; id?: string } | null;
    if (!body.activate || created?.ok === false || !created?.id) {
      return NextResponse.json(data);
    }

    const { start, end } = monthBounds();
    const { data: act, error: actErr } = await supabase.rpc("control_objective_activate", {
      p_id: created.id,
      p_period_start: body.periodStart ?? start,
      p_period_end: body.periodEnd ?? end,
      // A distinct key: this is a second recorded act, and reusing the create
      // key would make the two indistinguishable in the audit trail.
      p_idempotency_key: `${idempotencyKey}:activate`,
    });
    if (actErr) {
      // The target exists as a draft; say so instead of pretending it is live.
      return NextResponse.json(
        { ok: false, id: created.id, status: "draft", error: actErr.message },
        { status: 500 },
      );
    }
    return NextResponse.json(act);
  }

  if (body.op === "activate") {
    const { data, error } = await supabase.rpc("control_objective_activate", {
      p_id: body.id,
      p_period_start: body.periodStart ?? null,
      p_period_end: body.periodEnd ?? null,
      p_idempotency_key: idempotencyKey,
    });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase.rpc("control_objective_close", {
    p_id: body.id,
    p_outcome: body.outcome,
    p_idempotency_key: idempotencyKey,
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
