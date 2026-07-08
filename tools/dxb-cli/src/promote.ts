// Memory promotion — write-policy rule 3 (LOCKED): CLI-ONLY surface, same trust
// level as approve.ts. Deliberately absent from dxb-mcp: no worker profile can
// ever launder quarantined content into trusted context (T-06-11).
// The judgment model comes from the routing_rules 'memory.promote' row (no
// model literal here); the call rides the Agent SDK subscription path exactly
// like kernel classify.ts. Promotion NEVER deletes — it writes superseded_by
// chains and flips trust; history stays.
import { z } from "zod";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { getDb, type DB } from "@dxb/shared";
import { SDK_MODEL_IDS } from "@dxb/kernel";
import type { Kysely } from "kysely";

const Uuid = z.string().uuid();

export class PromoteError extends Error {}

const Verdict = z.object({
  supersede: z.boolean(),
  reason: z.string(),
});
type Verdict = z.infer<typeof Verdict>;

interface IndexRow {
  id: string;
  kind: string;
  store: string;
  ref: string;
  provenance: unknown;
  trust_tier: string;
  superseded_by: string | null;
}

export interface PromoteResult {
  action: "promoted" | "declined";
  promoted: string;
  superseded: string | null;
  model: string;
  reason: string;
}

export interface PromoteDeps {
  /** Test seam; production default = memory.promote routing row via the SDK. */
  judge?: (ctx: {
    candidateBody: string;
    targetBody: string | null;
  }) => Promise<Verdict>;
}

/** The judge reads real content, not metadata: pgvector rows carry their body
 *  in memory_embeddings; other stores are described by ref (their adapters can
 *  extend this in 06-06). */
async function bodyOf(db: Kysely<DB>, row: IndexRow): Promise<string> {
  if (row.store === "pgvector") {
    const hit = await db
      .selectFrom("memory_embeddings")
      .select("body")
      .where("index_id", "=", row.id)
      .executeTakeFirst();
    if (hit) return hit.body;
  }
  return `(store=${row.store}, ref=${row.ref})`;
}

async function sdkJudge(
  rule: { model: string; effort: string },
  ctx: { candidateBody: string; targetBody: string | null },
): Promise<Verdict> {
  const prompt = [
    "You are the memory promotion judge of DXB Global OS. A quarantined memory is",
    "nominated for promotion to trusted. Decide whether it should supersede the",
    "existing trusted memory (or stand on its own when there is none).",
    "Return strict JSON only: {\"supersede\": true|false, \"reason\": \"...\"}",
    "",
    `CANDIDATE (quarantined): """${ctx.candidateBody}"""`,
    ctx.targetBody
      ? `EXISTING TRUSTED (contradiction target): """${ctx.targetBody}"""`
      : "EXISTING TRUSTED: none (no contradiction target recorded)",
  ].join("\n");
  const q = query({
    prompt,
    options: {
      model: SDK_MODEL_IDS[rule.model] ?? rule.model,
      effort: rule.effort as "low" | "medium" | "high" | "max",
      tools: [],
      // Same NOT-1 as classify.ts: structured output arrives via an internal
      // tool call; a single turn cannot retry an inline-first answer.
      maxTurns: 4,
      outputFormat: { type: "json_schema", schema: z.toJSONSchema(Verdict) },
    },
  });
  for await (const msg of q) {
    if (msg.type === "result") {
      if (msg.subtype === "success") {
        if (msg.structured_output !== undefined) return Verdict.parse(msg.structured_output);
        const text = msg.result.trim();
        const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        return Verdict.parse(JSON.parse((fenced ? fenced[1] : text).trim()));
      }
      throw new PromoteError(`promote: agent-sdk result error (${msg.subtype})`);
    }
  }
  throw new PromoteError("promote: agent-sdk stream ended without a result message");
}

export async function promote(indexId: string, deps: PromoteDeps = {}): Promise<PromoteResult> {
  Uuid.parse(indexId);
  const db = getDb();

  const row = (await db
    .selectFrom("memory_index")
    .select(["id", "kind", "store", "ref", "provenance", "trust_tier", "superseded_by"])
    .where("id", "=", indexId)
    .executeTakeFirst()) as IndexRow | undefined;
  if (!row) throw new PromoteError(`memory_index row ${indexId} not found`);
  if (row.trust_tier !== "quarantined") {
    throw new PromoteError(`row ${indexId} is '${row.trust_tier}' — only quarantined rows can be promoted`);
  }

  const provenance =
    row.provenance && typeof row.provenance === "object"
      ? (row.provenance as Record<string, unknown>)
      : {};
  const meta = (provenance.meta ?? {}) as Record<string, unknown>;
  const contradictsId = typeof meta.contradicts === "string" ? meta.contradicts : null;

  const target = contradictsId
    ? ((await db
        .selectFrom("memory_index")
        .select(["id", "kind", "store", "ref", "provenance", "trust_tier", "superseded_by"])
        .where("id", "=", contradictsId)
        .executeTakeFirst()) as IndexRow | undefined) ?? null
    : null;

  const rule = await db
    .selectFrom("routing_rules")
    .select(["model", "mode", "effort"])
    .where("task_class", "=", "memory.promote")
    .where("enabled", "=", true)
    .orderBy("priority", "desc")
    .limit(1)
    .executeTakeFirst();
  if (!rule) throw new PromoteError("routing_rules has no enabled memory.promote row — seed it first");
  if (!deps.judge && rule.mode !== "subscription") {
    throw new PromoteError(
      `promote: 'memory.promote' routing row resolved mode '${rule.mode}' — ` +
        "promotion runs on subscription-mode models only (no raw provider keys)",
    );
  }

  const ctx = {
    candidateBody: await bodyOf(db, row),
    targetBody: target ? await bodyOf(db, target) : null,
  };
  const verdict = deps.judge ? await deps.judge(ctx) : await sdkJudge(rule, ctx);

  if (!verdict.supersede) {
    await db
      .insertInto("audit_log")
      .values({
        actor: "ceo:cli",
        actor_type: "ceo",
        action: "memory_promotion_declined",
        task_id: null,
        payload: JSON.stringify({ index_id: row.id, model: rule.model, reason: verdict.reason }),
      })
      .execute();
    return {
      action: "declined",
      promoted: row.id,
      superseded: null,
      model: rule.model,
      reason: verdict.reason,
    };
  }

  await db.transaction().execute(async (trx) => {
    if (target) {
      await trx
        .updateTable("memory_index")
        .set({ superseded_by: row.id })
        .where("id", "=", target.id)
        .execute();
    }
    const resolvedProvenance = contradictsId
      ? { ...provenance, meta: { contradicts_resolved: contradictsId } }
      : provenance;
    await trx
      .updateTable("memory_index")
      .set({ trust_tier: "trusted", provenance: JSON.stringify(resolvedProvenance) })
      .where("id", "=", row.id)
      .execute();
    await trx
      .insertInto("audit_log")
      .values({
        actor: "ceo:cli",
        actor_type: "ceo",
        action: "memory_promoted",
        task_id: null,
        payload: JSON.stringify({
          promoted: row.id,
          superseded: target?.id ?? null,
          model: rule.model,
          reason: verdict.reason,
        }),
      })
      .execute();
  });

  return {
    action: "promoted",
    promoted: row.id,
    superseded: target?.id ?? null,
    model: rule.model,
    reason: verdict.reason,
  };
}
