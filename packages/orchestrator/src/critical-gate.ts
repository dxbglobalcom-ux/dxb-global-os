// The critical gate — MODEL_ROUTING_SPEC §4e, CEO order 2026-07-26 (given
// twice, closed with "bunu unutma sakın").
//
//   Opus 5 WRITES the answer.  Challengers try to REFUTE it.  Opus 5 revises
//   and signs, with every objection and its disposition recorded.
//
// The challengers are deliberately NOT co-authors. The CEO rejected the first
// proposal ("sen kendi cevabını üretmeyeceksen kalite düşmez mi ya? opus 5 bu
// saydıklarından daha güçlü değil mi") — the strongest model in the roster
// produces the work and is never demoted to a comparator that picks between
// weaker drafts. That was the v1 CNCL-01 error, and CNCL-01 is dead: all three
// of its producers were dismissed by U21.
//
// TRANSPORT: the Codex CLI in ChatGPT-subscription mode, not the OpenAI API.
// Measured 2026-07-26: the CEO's API key authenticates (HTTP 200, 117 models)
// but every completion returns 429 insufficient_quota, because API billing is
// separate from the subscription. `~/.codex/auth.json` carries subscription
// tokens and no OPENAI_API_KEY, and `codex exec` answers on that lane. The CLI
// runs read-only, ephemeral and outside any git repo: a challenger reasons
// about text and must never touch this repository.

import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { z } from "zod";
import { getDb } from "@dxb/shared";
import { sql } from "kysely";

/**
 * The panel. ONE config surface — expanding it is CEO territory, exactly as the
 * producer list was under CNCL-01. Two challengers, because the CEO named two:
 * "solo 5.6 ve gpt 5.5 kullanılacak holdingin içinde … özellikle councilda".
 */
export const CRITICAL_GATE_CONFIG = {
  challengers: [
    { model: "gpt-5.6-sol", label: "Solo 5.6" },
    { model: "gpt-5.5", label: "GPT 5.5" },
  ],
  /** A challenger that has not answered in three minutes is not going to. */
  timeoutMs: 180_000,
} as const;

export const Objection = z.object({
  severity: z.enum(["high", "medium", "low"]),
  claim: z.string().min(1),
  why: z.string().min(1),
});
export type Objection = z.infer<typeof Objection>;

export const ChallengerVerdict = z.object({
  verdict: z.enum(["sound", "flawed"]),
  objections: z.array(Objection),
});
export type ChallengerVerdict = z.infer<typeof ChallengerVerdict>;

/** The JSON Schema handed to `codex exec --output-schema`. */
const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["sound", "flawed"] },
    objections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          severity: { type: "string", enum: ["high", "medium", "low"] },
          claim: { type: "string" },
          why: { type: "string" },
        },
        required: ["severity", "claim", "why"],
        additionalProperties: false,
      },
    },
  },
  required: ["verdict", "objections"],
  additionalProperties: false,
} as const;

export interface ChallengerRun {
  model: string;
  label: string;
  ok: boolean;
  verdict?: ChallengerVerdict;
  /** Present when ok=false. Never thrown: a dead challenger must not stop work. */
  error?: string;
  ms: number;
}

export interface CriticalGateInput {
  /** What was being decided, in one line. */
  subject: string;
  /** The answer Opus 5 produced and is asking to have broken. */
  answer: string;
  /** Anything the challenger needs to judge it: constraints, numbers, sources. */
  context?: string;
  taskId?: string | null;
  runId?: string | null;
}

export interface CriticalGateResult {
  /**
   * `clean`       — every challenger answered and none found a flaw
   * `objections`  — at least one objection to answer or fix
   * `unavailable` — no challenger could be reached; the gate did NOT run
   */
  status: "clean" | "objections" | "unavailable";
  objections: (Objection & { from: string })[];
  challengers: ChallengerRun[];
  decisionId: number | null;
  /** Ready-to-use revision feedback for the author. Empty when status != objections. */
  feedback: string;
}

/** Injection seam: tests drive the gate without spending a subscription turn. */
export type ChallengerRunner = (args: {
  model: string;
  prompt: string;
  timeoutMs: number;
}) => Promise<{ ok: boolean; raw?: string; error?: string }>;

function buildPrompt(input: CriticalGateInput): string {
  return [
    "You are an independent reviewer on a critical decision gate. Your ONLY job is",
    "to REFUTE the answer below. You are not asked to rewrite it, improve it, or",
    "produce your own version — another model owns authorship.",
    "",
    "Hunt for exactly these, in this order:",
    "  1. a number that is wrong, unsupported, or contradicted by the context",
    "  2. a constraint that was ignored (budget, hardware, licence, legal, halal)",
    "  3. a claim asserted without evidence that the context does not back",
    "  4. a risk that is real and not priced anywhere in the answer",
    "",
    "Rules: raise an objection ONLY if you can state exactly what is wrong and why.",
    "Do not object to style, tone, or wording. Do not invent facts to object with.",
    'If the answer genuinely survives, return verdict "sound" with an empty list —',
    "a reviewer who manufactures objections is worse than no reviewer.",
    "",
    `SUBJECT: ${input.subject}`,
    "",
    "CONTEXT:",
    input.context?.trim() ? input.context : "(none supplied)",
    "",
    "ANSWER UNDER REVIEW:",
    input.answer,
  ].join("\n");
}

/**
 * Default transport: `codex exec` in subscription mode.
 *
 * Flags chosen deliberately:
 *   --skip-git-repo-check  the sandbox cwd is not a repo
 *   --ephemeral            no session file is left behind per challenge
 *   -s read-only           a reviewer reasons about text, it never writes
 *   --output-schema        strict JSON instead of prose parsing
 *   -o                     final message to a file; stdout carries CLI chatter
 *   stdin closed           without it the CLI blocks on "Reading additional
 *                          input from stdin..." forever (measured 2026-07-26)
 */
export const codexRunner: ChallengerRunner = async ({ model, prompt, timeoutMs }) => {
  const dir = await mkdtemp(join(tmpdir(), "dxb-gate-"));
  const schemaPath = join(dir, "schema.json");
  const outPath = join(dir, "out.json");
  try {
    await writeFile(schemaPath, JSON.stringify(OUTPUT_SCHEMA), "utf8");
    await new Promise<void>((resolve, reject) => {
      const child = execFile(
        "codex",
        [
          "exec",
          "--skip-git-repo-check",
          "--ephemeral",
          "-s",
          "read-only",
          "-m",
          model,
          "--output-schema",
          schemaPath,
          "-o",
          outPath,
          "-C",
          dir,
          prompt,
        ],
        { timeout: timeoutMs, maxBuffer: 8 * 1024 * 1024 },
        (err) => (err ? reject(err) : resolve()),
      );
      child.stdin?.end();
    });
    return { ok: true, raw: await readFile(outPath, "utf8") };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
};

/**
 * Runs the panel. Challengers go in parallel and NEVER throw: a dead lane is
 * recorded as `unavailable`, because a review gate that can halt the company
 * when a subscription hiccups is a worse failure than a missed review. The
 * caller decides what an unavailable gate means for its own risk class.
 */
export async function runCriticalGate(
  input: CriticalGateInput,
  opts: { runner?: ChallengerRunner; log?: boolean } = {},
): Promise<CriticalGateResult> {
  const runner = opts.runner ?? codexRunner;
  const prompt = buildPrompt(input);

  const challengers: ChallengerRun[] = await Promise.all(
    CRITICAL_GATE_CONFIG.challengers.map(async ({ model, label }) => {
      const started = Date.now();
      const res = await runner({ model, prompt, timeoutMs: CRITICAL_GATE_CONFIG.timeoutMs });
      const ms = Date.now() - started;
      if (!res.ok) return { model, label, ok: false, error: res.error ?? "unknown error", ms };
      const parsed = ChallengerVerdict.safeParse(safeJson(res.raw));
      if (!parsed.success) {
        return { model, label, ok: false, error: `unparsable verdict: ${parsed.error.message}`, ms };
      }
      return { model, label, ok: true, verdict: parsed.data, ms };
    }),
  );

  const answered = challengers.filter((c) => c.ok);
  const objections = answered.flatMap((c) =>
    (c.verdict?.objections ?? []).map((o) => ({ ...o, from: c.label })),
  );
  const status: CriticalGateResult["status"] =
    answered.length === 0 ? "unavailable" : objections.length > 0 ? "objections" : "clean";

  const feedback =
    status === "objections"
      ? [
          "The critical gate raised objections. Fix what is genuinely wrong; where an",
          "objection is mistaken, answer it explicitly in the deliverable instead of",
          "ignoring it.",
          "",
          ...objections.map(
            (o, i) => `${i + 1}. [${o.severity}, ${o.from}] ${o.claim}\n   why: ${o.why}`,
          ),
        ].join("\n")
      : "";

  let decisionId: number | null = null;
  if (opts.log !== false) {
    const rationale = [
      `critical gate on: ${input.subject}`,
      `challengers: ${challengers
        .map((c) => `${c.label}=${c.ok ? (c.verdict?.verdict ?? "?") : `unavailable(${c.error})`}`)
        .join(", ")}`,
      `objections: ${objections.length}`,
    ].join("; ");
    // decision_log.id is bigint, which node-postgres hands back as a string —
    // returning it raw would make `decisionId` lie about its own type.
    const row = await sql<{ id: string }>`
      INSERT INTO decision_log (run_id, decided_by, decision, rationale, alternatives, risk, outcome)
      VALUES (${input.runId ?? null}::uuid, 'orchestrator', 'critical_gate',
              ${rationale}, ${JSON.stringify(objections)}::jsonb, 'high', ${status})
      RETURNING id
    `.execute(getDb());
    decisionId = row.rows[0]?.id != null ? Number(row.rows[0].id) : null;
  }

  return { status, objections, challengers, decisionId, feedback };
}

function safeJson(raw: string | undefined): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    // The CLI writes only the final message to -o, but a model that ignores the
    // schema can still wrap it in prose. Take the outermost JSON object rather
    // than failing a whole review over punctuation.
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}
