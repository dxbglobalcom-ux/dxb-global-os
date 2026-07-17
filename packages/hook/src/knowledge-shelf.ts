// R4.2 knowledge-shelf rule (HOLDING_LIBRARY adaptation A9): "no research
// without report, no report without registration". The post-gate identifies a
// research task by its output contract, demands a file-kind report artifact
// in the evidence package, and puts that report ON THE SHELF itself — a
// kind='research' library row written through control_library_action under
// the CEO standing-order context (A8 precedent: the gate executes the CEO's
// codified rule, actor=ceo audit + change_log rows).
//
// Idempotent by construction: source_ref pre-check + md5(ref) idempotency key
// — a REVISE round or a re-fired gate replays the cached response instead of
// duplicating rows. Name collisions (same basename, different ref) retry once
// with a deterministic version suffix so UNIQUE(kind,name,version) holds.
import { createHash } from "node:crypto";
import { sql } from "kysely";
import { getDb } from "@dxb/shared";
import type { HookCtx } from "./types.js";

const CEO_CLAIMS = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

interface ControlResp {
  ok: boolean;
  error?: string;
  detail?: string;
  item_id?: string;
}

function shelfName(ref: string): string {
  const base = ref.split("/").at(-1) ?? ref;
  return base.replace(/\.[a-z0-9]+$/i, "").toLowerCase();
}

async function callControl(payload: Record<string, unknown>, key: string): Promise<ControlResp> {
  return getDb()
    .transaction()
    .execute(async (trx) => {
      await sql`SELECT set_config('request.jwt.claims', ${CEO_CLAIMS}, true)`.execute(trx);
      const res = await sql<{ resp: ControlResp }>`
        SELECT control_library_action(${JSON.stringify(payload)}::jsonb, ${key}) AS resp
      `.execute(trx);
      return res.rows[0]!.resp;
    });
}

/** Ensure the report artifact at `ref` exists as a kind='research' library
 *  row. Returns null on success, or a human-readable failure detail. */
export async function ensureResearchOnShelf(ctx: HookCtx, ref: string): Promise<string | null> {
  const existing = await sql<{ id: string }>`
    SELECT id FROM library_items WHERE kind = 'research' AND source_ref = ${ref} LIMIT 1
  `.execute(getDb());
  if (existing.rows.length > 0) return null; // already on the shelf

  const refHash = createHash("md5").update(ref).digest("hex");
  const base: Record<string, unknown> = {
    action: "register_item",
    kind: "research",
    name: shelfName(ref),
    source_ref: ref,
    usage_notes: `Research report registered by the knowledge-shelf gate${
      ctx.task.id ? ` (task ${ctx.task.id})` : ""
    }.`,
    review_status: "needs_review",
    ...(ctx.employee.department ? { owner_dept: ctx.employee.department } : {}),
  };

  let resp = await callControl(base, `shelf-${refHash}`);
  if (!resp.ok && resp.error === "CONFLICT_STALE") {
    // Same kind/name, different source_ref — keep both, version-suffixed.
    resp = await callControl(
      { ...base, version: refHash.slice(0, 8) },
      `shelf-${refHash}-v`,
    );
  }
  if (resp.ok) return null;
  return `library registration failed: ${resp.error ?? "unknown"} ${resp.detail ?? ""}`.trim();
}
