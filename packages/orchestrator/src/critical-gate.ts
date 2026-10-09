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
// about text and must never touch this repository. Since 2026-10-03 it runs from
// the company's own Codex home (companyCodexHome() below), never the
// construction's ~/.codex.

import { execFile } from "node:child_process";
import { existsSync, readFileSync, readlinkSync, realpathSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir, userInfo } from "node:os";
import { basename, dirname, join, resolve, sep } from "node:path";
import { z } from "zod";
import { getDb } from "@dxb/shared";
import { sql } from "kysely";

/**
 * The panel. Two challengers, because the CEO named two: "solo 5.6 ve gpt 5.5 kullanılacak holdingin
 * içinde … özellikle councilda" (2026-07-26). The seats stay; the models are the day's (CEO 2026-10-09:
 * "şuan solo 6.1 e çıktı gpt5.5 eskidi artık"). B51 P1: the seats live in ONE settings key,
 * `gate.challengers` — [{model: <catalogue id>, effort}, …] — which he sees and changes on /sys/settings and
 * a succession moves with every other brain; the catalogue gives each seat its codex name and its label.
 * A trigger refuses a bad value when it is written; this read refuses a seat whose model stopped being
 * callable since (fail-closed per seat — the seat is `unavailable`, the other still judges).
 */
export const GATE_SETTING_KEY = "gate.challengers";

/** A challenger that has not answered in three minutes is not going to. */
export const CRITICAL_GATE_TIMEOUT_MS = 180_000;

/** The efforts both subscription lanes accept (the trigger's list; codex's own 'ultra' stays out). */
const SEAT_EFFORTS = ["low", "medium", "high", "xhigh", "max"] as const;
export type SeatEffort = (typeof SEAT_EFFORTS)[number];

export interface GateSeat {
  /** 1-based seat number — the alert's dedup key names it. */
  seat: number;
  /** The catalogue id the setting names. */
  model: string;
  /** What the CEO sees: the catalogue's display name. */
  label: string;
  /** Present when the seat can judge. */
  apiModelId?: string;
  effort?: SeatEffort;
  /** Present when it cannot — why, in one line. */
  unavailable?: string;
}

export interface CatalogueEntry {
  id: string;
  api_model_id: string | null;
  display_name: string | null;
  status: string;
  banned: boolean;
  lane: string | null;
}

/**
 * Pure: the setting's value and the catalogue rows it names → the two seats. Never throws; every way a
 * seat can be wrong becomes that seat's `unavailable` reason.
 */
export function seatsFrom(value: unknown, catalogue: readonly CatalogueEntry[]): GateSeat[] {
  if (!Array.isArray(value) || value.length !== 2) {
    const why = `${GATE_SETTING_KEY} is not two seats`;
    return [1, 2].map((seat) => ({ seat, model: "?", label: `seat ${seat}`, unavailable: why }));
  }
  return value.map((raw, i): GateSeat => {
    const seat = i + 1;
    const entry = (raw ?? {}) as { model?: unknown; effort?: unknown };
    const model = typeof entry.model === "string" ? entry.model : "?";
    const row = catalogue.find((c) => c.id === model);
    const label = row?.display_name ?? model;
    const effort = SEAT_EFFORTS.find((e) => e === entry.effort);
    if (!effort) return { seat, model, label, unavailable: `seat ${seat}: effort '${String(entry.effort)}' is not one of ${SEAT_EFFORTS.join("|")}` };
    if (!row) return { seat, model, label, unavailable: `seat ${seat}: ${model} is not in the model catalogue` };
    if (row.banned || row.status !== "active") {
      return { seat, model, label, unavailable: `seat ${seat}: ${model} is ${row.banned ? "banned" : row.status}` };
    }
    if (row.lane !== "codex-cli" || !row.api_model_id) {
      return { seat, model, label, unavailable: `seat ${seat}: ${model} is not on the Codex lane` };
    }
    return { seat, model, label, apiModelId: row.api_model_id, effort };
  });
}

/** The live seats: the setting (scope chain, then its registered default) and the catalogue, one read each. */
export async function loadGateSeats(): Promise<GateSeat[]> {
  const db = getDb();
  const setting = await sql<{ v: unknown }>`SELECT resolve_setting(${GATE_SETTING_KEY}) AS v`.execute(db);
  const value = setting.rows[0]?.v ?? null;
  const ids = Array.isArray(value)
    ? value.map((e) => (e as { model?: unknown })?.model).filter((m): m is string => typeof m === "string")
    : [];
  const catalogue = ids.length
    ? (
        await sql<CatalogueEntry>`
          SELECT id, api_model_id, display_name, status, banned, lane
            FROM model_catalog WHERE id = ANY (${ids}::text[])
        `.execute(db)
      ).rows
    : [];
  return seatsFrom(value, catalogue);
}

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
  effort: SeatEffort;
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
 * The company's own Codex home (CEO 2026-10-03, option (b): "B önerisini de yapalım … kodeksle
 * ilgili") — the company's own login and nothing of the construction's `~/.codex`. Measured that
 * day: from `~/.codex` the gate's challengers loaded the construction's global Codex notes
 * (`AGENTS.md`) and started its MCP servers; `--ignore-user-config`, `--ignore-rules` and
 * `-c project_doc_max_bytes=0` left the notes in; a clean `CODEX_HOME` holding only a login dropped
 * both. `DXB_COMPANY_CODEX_HOME` moves it — never onto the construction's home: a path that is
 * `~/.codex`, lies inside it, or reaches it through a link is refused (Sol, 2026-10-03: the override
 * was taken unchecked), and the runner then records the challenger unavailable instead of launching.
 */
export function companyCodexHome(env: NodeJS.ProcessEnv = process.env): string {
  // The construction is the passwd entry's home, never $HOME (Sol's single pass on phase 3, A4).
  const user = userInfo().homedir;
  const home = env.DXB_COMPANY_CODEX_HOME ?? join(user, ".local", "share", "dxb", "company-codex");
  const theirs = realPath(join(user, ".codex"));
  const ours = realPath(resolve(home));
  if (ours === theirs || ours.startsWith(`${theirs}${sep}`)) {
    throw new Error(`the company Codex home ${home} is the construction's Codex home (${theirs}) or lies inside it — no challenger runs from there`);
  }
  return home;
}

/** The path with every link resolved — through parts that do not exist yet and through a dangling link. */
function realPath(p: string, depth = 0): string {
  try {
    return realpathSync(p);
  } catch {
    // not there (yet), or a link whose target is not there
  }
  if (depth > 40) return p;
  try {
    return realPath(resolve(dirname(p), readlinkSync(p)), depth + 1);
  } catch {
    // not a link
  }
  const parent = dirname(p);
  return parent === p ? p : join(realPath(parent, depth + 1), basename(p));
}

/** The MCP servers a Codex home's config.toml declares: the distinct `[mcp_servers.<name>]` tables,
 *  or `?` when the file holds them in a form this count does not read. */
function mcpServersDeclared(configToml: string): string {
  let text: string;
  try {
    text = readFileSync(configToml, "utf8");
  } catch {
    return "0"; // no config, no server
  }
  const names = new Set<string>();
  for (const m of text.matchAll(/^\s*\[\s*mcp_servers\s*\.\s*(?:"([^"]+)"|([A-Za-z0-9_-]+))/gm)) names.add(m[1] ?? m[2]);
  const otherForm = /^\s*\[\s*mcp_servers\s*\]|^\s*mcp_servers\s*=/m.test(text);
  return otherForm ? "?" : String(names.size);
}

/**
 * One line per Codex call — what the challenger loaded and what it read — so the resident itself
 * proves the separation, as the SDK lanes' `isolationReceipt` does (Sol, 2026-10-03: the gate wrote
 * none). `home` is the Codex home handed to the call (`refused` when companyCodexHome() refused it),
 * `notes` the global notes in it (`AGENTS.md`, `AGENTS.override.md`), `mcp` the servers its
 * config.toml declares, `session` and `tokens` read from the CLI's own stderr header and footer.
 * A witness, never a participant: whatever it meets, the call's answer is untouched.
 */
function gateReceipt(log: (line: string) => void, model: string, stderr: string, ok: boolean): void {
  try {
    let home = "refused";
    let notes = "?";
    let mcp = "?";
    try {
      home = companyCodexHome();
      notes = String(["AGENTS.md", "AGENTS.override.md"].filter((n) => existsSync(join(home, n))).length);
      mcp = mcpServersDeclared(join(home, "config.toml"));
    } catch {
      // the refusal itself is the call's error
    }
    const session = /^session id:\s*(\S+)/m.exec(stderr)?.[1] ?? "?";
    const used = /^tokens used\s*\r?\n\s*([\d,]+)/m.exec(stderr)?.[1];
    const tokens = used ? String(Number(used.replace(/,/g, ""))) : "?"; // an unknown is never 0
    log(`[isolation] lane=gate model=${model} session=${session} home=${home} notes=${notes} mcp=${mcp} ok=${ok} tokens=${tokens}`);
  } catch {
    // the line is lost; the gate's answer is not
  }
}

/**
 * Default transport: `codex exec` in subscription mode, from the company's own Codex home.
 *
 * Flags chosen deliberately:
 *   --skip-git-repo-check  the sandbox cwd is not a repo
 *   --ephemeral            no session file is left behind per challenge
 *   -s read-only           a reviewer reasons about text, it never writes
 *   -c model_reasoning_effort=<the seat's effort>
 *                          always passed: the company home has no config.toml default (they fell
 *                          to `none`, measured 2026-10-03); since B51 P1 the level is the seat's,
 *                          from the gate.challengers setting, no longer a constant here
 *   --output-schema        strict JSON instead of prose parsing
 *   -o                     final message to a file; stdout carries CLI chatter
 *   stdin closed           without it the CLI blocks on "Reading additional
 *                          input from stdin..." forever (measured 2026-07-26)
 *
 * Every call, answered or not, writes its isolation line through `log` (gateReceipt above).
 */
export function codexRunnerWith(log: (line: string) => void): ChallengerRunner {
  return async ({ model, prompt, timeoutMs, effort }) => {
    const result = await runCodex(model, prompt, timeoutMs, effort);
    gateReceipt(log, model, result.stderr, result.ok);
    return result.ok ? { ok: true, raw: result.raw } : { ok: false, error: result.error };
  };
}

/** Default transport: the scheduler's stdout carries the isolation lines (`var/scheduler.log`). */
export const codexRunner: ChallengerRunner = codexRunnerWith((line) => console.log(line));

async function runCodex(
  model: string,
  prompt: string,
  timeoutMs: number,
  effort: SeatEffort,
): Promise<{ ok: boolean; raw?: string; error?: string; stderr: string }> {
  const dir = await mkdtemp(join(tmpdir(), "dxb-gate-"));
  const schemaPath = join(dir, "schema.json");
  const outPath = join(dir, "out.json");
  let stderr = "";
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
          "-c",
          `model_reasoning_effort="${effort}"`,
          "--output-schema",
          schemaPath,
          "-o",
          outPath,
          "-C",
          dir,
          prompt,
        ],
        { timeout: timeoutMs, maxBuffer: 8 * 1024 * 1024, env: { ...process.env, CODEX_HOME: companyCodexHome() } },
        (err, _stdout, errText) => {
          stderr = String(errText ?? "");
          if (err) reject(err);
          else resolve();
        },
      );
      child.stdin?.end();
    });
    return { ok: true, raw: await readFile(outPath, "utf8"), stderr };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), stderr };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * Runs the panel. Challengers go in parallel and NEVER throw: a dead lane is
 * recorded as `unavailable`, because a review gate that can halt the company
 * when a subscription hiccups is a worse failure than a missed review. The
 * caller decides what an unavailable gate means for its own risk class.
 */
export async function runCriticalGate(
  input: CriticalGateInput,
  opts: { runner?: ChallengerRunner; log?: boolean; seats?: GateSeat[] } = {},
): Promise<CriticalGateResult> {
  const runner = opts.runner ?? codexRunner;
  const prompt = buildPrompt(input);
  const seats = opts.seats ?? (await loadGateSeats());

  const challengers: ChallengerRun[] = await Promise.all(
    seats.map(async ({ model, label, apiModelId, effort, unavailable }) => {
      if (unavailable || !apiModelId || !effort) {
        return { model, label, ok: false, error: unavailable ?? "seat not callable", ms: 0 };
      }
      const started = Date.now();
      const res = await runner({ model: apiModelId, prompt, timeoutMs: CRITICAL_GATE_TIMEOUT_MS, effort });
      const ms = Date.now() - started;
      if (!res.ok) return { model, label, ok: false, error: res.error ?? "unknown error", ms };
      const parsed = ChallengerVerdict.safeParse(safeJson(res.raw));
      if (!parsed.success) {
        return { model, label, ok: false, error: `unparsable verdict: ${parsed.error.message}`, ms };
      }
      return { model, label, ok: true, verdict: parsed.data, ms };
    }),
  );

  // A seat that cannot judge is a setting or a catalogue row gone wrong, not a lane hiccup: it is raised
  // to the CEO's alerts once per seat until resolved. The work still runs (§4e: the panel never halts it).
  if (opts.log !== false) {
    for (const s of seats.filter((x) => x.unavailable)) {
      await sql`
        INSERT INTO alerts (level, source, title, affected_area, probable_cause, suggested_action, dedup_key, task_id)
        VALUES ('high', 'critical_gate', ${`Critical gate seat ${s.seat} cannot judge`}, 'critical_gate',
                ${s.unavailable ?? ""},
                ${`Name an active Codex-lane model for seat ${s.seat} in ${GATE_SETTING_KEY} (/sys/settings).`},
                ${`gate-seat:${s.seat}`}, ${input.taskId ?? null}::uuid)
        ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL DO NOTHING
      `.execute(getDb());
    }
  }

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
