import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Model routing mutation seam (E7.2 — MODEL_ROUTING_SPEC §6/§4c). Same idiom
// as the settings/org seams: the handler validates session + body shape only;
// every business rule (ceo-only wall, banned/testing/mechanical guardrails,
// audit + decision_log + Broadcast, idempotency) lives in fn_update_routing.
//
// test_model (§4c step 2, smoke) is the one TS-side op: SQL cannot call an
// LLM. It rides the LiteLLM proxy when LITELLM_BASE_URL is set; until the
// proxy exists (Phase-7 VPS scope, registered adaptation A1 of migration
// 20260713050000) it answers LITELLM_UNREACHABLE honestly — no fake-ready
// state (§35). Raw provider keys never pass through here (R5).

const Ops = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("assign_role"),
    roleSlot: z.string().min(1).max(40),
    modelId: z.string().min(1).max(120),
    departmentId: z.string().uuid().optional(),
    rationale: z.string().max(2000).optional(),
  }),
  z.object({
    op: z.literal("set_catalog_status"),
    modelId: z.string().min(1).max(120),
    status: z.enum(["active", "testing", "degraded", "disabled", "retired"]),
  }),
  z.object({
    op: z.literal("add_model"),
    id: z.string().min(2).max(80),
    provider: z.string().min(1).max(80),
    displayName: z.string().min(1).max(200),
    contextWindow: z.number().int().positive().optional(),
    costInPerMtok: z.number().nonnegative().optional(),
    costOutPerMtok: z.number().nonnegative().optional(),
    speedScore: z.number().int().min(1).max(100).optional(),
  }),
  z.object({
    op: z.literal("set_fallback"),
    modelId: z.string().min(1).max(120),
    fallbackOf: z.string().min(1).max(120).nullable(),
  }),
  z.object({
    op: z.literal("test_model"),
    modelId: z.string().min(1).max(120),
  }),
]);

const ERROR_STATUS: Record<string, number> = {
  VALIDATION_FAILED: 400,
  PERMISSION_DENIED: 403,
  IDEMPOTENCY_MISMATCH: 422,
  MODEL_BANNED: 422,
  MODEL_NOT_ACTIVE: 422,
  MODEL_MECHANICAL_ONLY: 422,
  FALLBACK_CYCLE: 422,
  LITELLM_UNREACHABLE: 503,
};

async function smokeTest(modelId: string) {
  const base = process.env.LITELLM_BASE_URL;
  if (!base) {
    return {
      ok: false as const,
      error: "LITELLM_UNREACHABLE",
      detail: "LiteLLM proxy not configured on this host (Phase-7 VPS scope) — model stays in testing",
    };
  }
  const started = Date.now();
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LITELLM_SMOKE_KEY ?? ""}`,
      },
      body: JSON.stringify({
        model: modelId,
        max_tokens: 8,
        messages: [{ role: "user", content: "Reply with the single word: ok" }],
      }),
      signal: AbortSignal.timeout(20_000),
    });
    const latencyMs = Date.now() - started;
    if (!res.ok) {
      return {
        ok: false as const,
        error: "SMOKE_FAILED",
        detail: `proxy answered HTTP ${res.status}`,
        latencyMs,
      };
    }
    const data = (await res.json()) as { usage?: { total_tokens?: number } };
    return { ok: true as const, latencyMs, tokens: data.usage?.total_tokens ?? null };
  } catch {
    return {
      ok: false as const,
      error: "LITELLM_UNREACHABLE",
      detail: "proxy did not answer within 20s",
      latencyMs: Date.now() - started,
    };
  }
}

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

  if (body.op === "test_model") {
    const result = await smokeTest(body.modelId);
    const status = result.ok ? 200 : (ERROR_STATUS[result.error] ?? 502);
    return NextResponse.json(result, { status });
  }

  const payload =
    body.op === "assign_role"
      ? {
          role_slot: body.roleSlot,
          model_id: body.modelId,
          department_id: body.departmentId ?? null,
          rationale: body.rationale ?? null,
        }
      : body.op === "set_catalog_status"
        ? { model_id: body.modelId, status: body.status }
        : body.op === "add_model"
          ? {
              id: body.id,
              provider: body.provider,
              display_name: body.displayName,
              context_window: body.contextWindow ?? null,
              cost_in_per_mtok: body.costInPerMtok ?? null,
              cost_out_per_mtok: body.costOutPerMtok ?? null,
              speed_score: body.speedScore ?? null,
            }
          : { model_id: body.modelId, fallback_of: body.fallbackOf };

  const { data, error } = await supabase.rpc("fn_update_routing", {
    p_op: body.op,
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
