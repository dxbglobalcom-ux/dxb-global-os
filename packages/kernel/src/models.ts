// B51 step 3 · P1 — the catalogue is the one place every model id lives.
// CEO 2026-10-09: the holding's brains are never fixed — "hey opus 6 çıkmış ey hamza" → they move at once.
// Until now the API names lived in a code map (SDK_MODEL_IDS) and the lane was guessed from it; a new model
// needed a code change and a restart. Every call site now asks the catalogue (model_catalog) instead.
//
// No cache, on purpose — the same rule as loadPolicy: one indexed row per call, and a succession written by
// the audited door reaches the very next call without a restart.
import { sql, type Kysely } from "kysely";
import type { DB } from "@dxb/shared";

export type ModelLane = "agent-sdk" | "codex-cli" | "litellm" | "local";

export interface ResolvedModel {
  /** The catalogue id (an alias resolves to the row that carries it). */
  id: string;
  /** The name the lane is called with — the Claude API id, the codex -m slug, the LiteLLM name. */
  apiModelId: string;
  lane: ModelLane;
  /** subscription: agent-sdk and codex-cli run on the CEO's subscriptions; api: LiteLLM or local. */
  mode: "subscription" | "api";
  displayName: string;
  provider: string;
  status: string;
}

/** A model the company must not call — unknown, retired, disabled, banned or without a lane. Loud. */
export class ModelRefusedError extends Error {
  readonly model: string;
  constructor(model: string, why: string) {
    super(`model '${model}' refused: ${why}`);
    this.name = "ModelRefusedError";
    this.model = model;
  }
}

/** The lanes that run on the subscriptions; everything else needs a key (B51: none exists). */
export function modeOfLane(lane: ModelLane): "subscription" | "api" {
  return lane === "agent-sdk" || lane === "codex-cli" ? "subscription" : "api";
}

/**
 * Resolves a model name — a catalogue id or a retired spelling kept in `aliases` — to what a call needs.
 * Fail-closed: an unknown name, a retired / disabled / banned row, or one with no lane or API name throws
 * ModelRefusedError. 'testing' and 'degraded' resolve (a trial and a slow model are still callable).
 */
export async function resolveModel(db: Kysely<DB>, name: string): Promise<ResolvedModel> {
  const res = await sql<{
    id: string;
    api_model_id: string | null;
    lane: ModelLane | null;
    display_name: string | null;
    provider: string;
    status: string;
    banned: boolean;
  }>`
    SELECT id, api_model_id, lane, display_name, provider, status, banned
      FROM model_catalog
     WHERE id = ${name} OR ${name} = ANY (aliases)
     ORDER BY (id = ${name}) DESC
     LIMIT 1
  `.execute(db);
  const row = res.rows[0];
  if (!row) throw new ModelRefusedError(name, "not in the model catalogue");
  if (row.banned) throw new ModelRefusedError(name, `${row.id} is banned`);
  if (row.status === "retired" || row.status === "disabled") {
    throw new ModelRefusedError(name, `${row.id} is ${row.status}`);
  }
  if (!row.lane) throw new ModelRefusedError(name, `${row.id} has no lane`);
  if (!row.api_model_id && row.lane !== "local") {
    throw new ModelRefusedError(name, `${row.id} has no API name for lane ${row.lane}`);
  }
  return {
    id: row.id,
    apiModelId: row.api_model_id ?? row.id,
    lane: row.lane,
    mode: modeOfLane(row.lane),
    displayName: row.display_name ?? row.id,
    provider: row.provider,
    status: row.status,
  };
}

/**
 * The Claude API id for a call through the Agent SDK (`query()`). The SDK reaches only the agent-sdk lane:
 * a Codex or LiteLLM model routed onto an SDK call is refused here, by name, instead of failing inside
 * the SDK with a vendor error.
 */
export async function sdkModelId(db: Kysely<DB>, name: string): Promise<string> {
  const m = await resolveModel(db, name);
  if (m.lane !== "agent-sdk") {
    throw new ModelRefusedError(name, `${m.id} runs on the ${m.lane} lane, not through the Agent SDK`);
  }
  return m.apiModelId;
}

/**
 * B51 P5b (C2-12) — what an Agent SDK call is given for its model: the Claude API id, and the SDK's
 * `fallbackModel` read from the catalogue's fallback chain (`model_catalog.fallback_of` = the model this
 * one falls to — the same direction fn_model_fallback walks). The first hop that is live — active, not
 * banned, not mechanical-only (the call site does not know whether its seat may take one), on the
 * agent-sdk lane with an API name — is the fallback; a retired or Codex hop is passed over, at most four
 * hops (fn_model_fallback's depth). None → no fallbackModel, and the SDK runs the model alone as before.
 *
 * The fallback never sits below the primary's tier floor (second eye, 2026-10-10): the SDK falls over
 * silently, mid-run, and the run is still recorded under the primary, so an L1 strategy or final-approval
 * run on Opus must not quietly finish on Sonnet (L2) — U21 §4d keeps Sonnet out of critical work. A hop
 * without a floor is no candidate.
 * A succession that rewrites the chain reaches the very next call: read uncached, like resolveModel.
 */
export async function sdkModel(
  db: Kysely<DB>,
  name: string,
): Promise<{ model: string; fallbackModel?: string }> {
  const m = await resolveModel(db, name);
  if (m.lane !== "agent-sdk") {
    throw new ModelRefusedError(name, `${m.id} runs on the ${m.lane} lane, not through the Agent SDK`);
  }
  const res = await sql<{ api_model_id: string }>`
    WITH RECURSIVE chain(id, depth) AS (
      SELECT fallback_of, 1 FROM model_catalog WHERE id = ${m.id} AND fallback_of IS NOT NULL
      UNION ALL
      SELECT c.fallback_of, chain.depth + 1
        FROM chain JOIN model_catalog c ON c.id = chain.id
       WHERE c.fallback_of IS NOT NULL AND chain.depth < 4
    )
    SELECT f.api_model_id
      FROM chain JOIN model_catalog f ON f.id = chain.id
      JOIN model_catalog p ON p.id = ${m.id}
     WHERE f.status = 'active' AND NOT f.banned AND NOT f.mechanical_only
       AND f.lane = 'agent-sdk' AND f.api_model_id IS NOT NULL AND f.api_model_id <> ${m.apiModelId}
       AND f.tier_floor IS NOT NULL AND fn_tier_rank(f.tier_floor) <= fn_tier_rank(p.tier_floor)
     ORDER BY chain.depth
     LIMIT 1
  `.execute(db);
  const fallback = res.rows[0]?.api_model_id;
  return fallback ? { model: m.apiModelId, fallbackModel: fallback } : { model: m.apiModelId };
}
