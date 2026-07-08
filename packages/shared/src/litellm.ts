// The ONE LiteLLM proxy surface. All DXB code that talks to the proxy —
// agent chat calls, admin key operations, breaker levers — goes through here.
//
// LOCKED (single-source cost rule, 04-04 Task 2): this module records NOTHING
// to cost_ledger. The Cost Monitor reads LiteLLM's own spend tables for
// API-mode cost; a second write path would double-count.
//
// Spend/key table names below are NOT guesses: recorded from the live
// `\dt litellm.*` at install time (study-cards/litellm.md, 04-01) per
// master-plan R1 ("schema drift — verify on install day, read from config").
import { sql } from "kysely";
import { getDb } from "./db.js";

// -- config constants (fed by the 04-01 study card; consumers import these,
//    never hard-code litellm table literals in logic) ------------------------
export const LITELLM_SCHEMA = "litellm" as const;
export const LITELLM_SPEND_TABLE = "LiteLLM_SpendLogs" as const;
export const LITELLM_KEYS_TABLE = "LiteLLM_VerificationToken" as const;

/** Alias prefix for DXB-owned virtual keys (one per department). */
export const DXB_KEY_ALIAS_PREFIX = "dxb-" as const;

export function litellmBaseUrl(): string {
  return process.env.LITELLM_BASE_URL ?? "http://127.0.0.1:4000";
}

function masterKey(): string {
  const key = process.env.LITELLM_MASTER_KEY;
  if (!key) {
    throw new Error(
      "LITELLM_MASTER_KEY is not set in the process env (admin key operations " +
        "need it; the vaulted vps/litellm/.env is never read by tools — A8).",
    );
  }
  return key;
}

export class LiteLLMError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(message);
    this.name = "LiteLLMError";
  }
}

async function proxyFetch(path: string, init: RequestInit, auth: string): Promise<unknown> {
  const res = await fetch(`${litellmBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${auth}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await res.text();
  if (!res.ok) {
    throw new LiteLLMError(`LiteLLM ${path} -> ${res.status}`, res.status, body.slice(0, 500));
  }
  return body ? JSON.parse(body) : null;
}

// -- chat (agent-facing) ------------------------------------------------------

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmCallArgs {
  department: string;
  model: string;
  messages: LlmMessage[];
  maxTokens?: number;
}

export interface LlmCallResult {
  content: string;
  model: string;
  usage: { prompt_tokens: number; completion_tokens: number };
}

/** Env var carrying the department's virtual key, e.g. DXB_LITELLM_KEY_ENGINEERING. */
export function departmentKeyEnvVar(department: string): string {
  return `DXB_LITELLM_KEY_${department.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
}

function departmentKey(department: string): string {
  const envVar = departmentKeyEnvVar(department);
  const key = process.env[envVar];
  if (!key) {
    throw new Error(
      `${envVar} is not set — every API model call needs the department's ` +
        "LiteLLM virtual key (COST-02); raw provider keys never reach agents.",
    );
  }
  return key;
}

/** One chat completion through the proxy with the department's virtual key. */
export async function llmCall(args: LlmCallArgs): Promise<LlmCallResult> {
  const data = (await proxyFetch(
    "/chat/completions",
    {
      method: "POST",
      body: JSON.stringify({
        model: args.model,
        messages: args.messages,
        ...(args.maxTokens !== undefined ? { max_tokens: args.maxTokens } : {}),
      }),
    },
    departmentKey(args.department),
  )) as {
    model?: string;
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  return {
    content: data.choices?.[0]?.message?.content ?? "",
    model: data.model ?? args.model,
    usage: {
      prompt_tokens: data.usage?.prompt_tokens ?? 0,
      completion_tokens: data.usage?.completion_tokens ?? 0,
    },
  };
}

// -- admin (master-key) operations -------------------------------------------

export interface KeyGenerateArgs {
  key_alias?: string;
  max_budget?: number;
  budget_duration?: string;
  duration?: string;
  metadata?: Record<string, unknown>;
}

export async function keyGenerate(args: KeyGenerateArgs): Promise<{ key: string }> {
  return (await proxyFetch(
    "/key/generate",
    { method: "POST", body: JSON.stringify(args) },
    masterKey(),
  )) as { key: string };
}

/** Patch a key (breaker lever: `{ key, blocked: true }`). `key` may be the hashed token. */
export async function keyUpdate(patch: { key: string } & Record<string, unknown>): Promise<void> {
  await proxyFetch("/key/update", { method: "POST", body: JSON.stringify(patch) }, masterKey());
}

export async function keyInfo(key: string): Promise<Record<string, unknown>> {
  const data = (await proxyFetch(
    `/key/info?key=${encodeURIComponent(key)}`,
    { method: "GET" },
    masterKey(),
  )) as { info: Record<string, unknown> };
  return data.info;
}

export async function keyDelete(keys: string[]): Promise<void> {
  await proxyFetch("/key/delete", { method: "POST", body: JSON.stringify({ keys }) }, masterKey());
}

/** DXB-owned virtual keys straight from the proxy's key table (hashed tokens). */
export async function listDxbKeys(): Promise<
  Array<{ token: string; key_alias: string; blocked: boolean | null }>
> {
  const db = getDb();
  const { rows } = await sql<{ token: string; key_alias: string; blocked: boolean | null }>`
    SELECT token, key_alias, blocked
    FROM ${sql.raw(`${LITELLM_SCHEMA}."${LITELLM_KEYS_TABLE}"`)}
    WHERE key_alias LIKE ${DXB_KEY_ALIAS_PREFIX + "%"}
  `.execute(db);
  return rows;
}
