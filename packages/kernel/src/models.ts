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
