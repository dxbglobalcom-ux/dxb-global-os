// chat.drain — the CEO Chat Board answer half (complaint ledger C1/C7/C10,
// 2026-07-19). The CEO writes on the board; Hamza (the orchestrator,
// HAMZA persona) answers CONVERSATIONALLY — greeting stays a greeting,
// planning stays planning. Nothing dispatches from here: dispatch is an
// explicit CEO action handled by the dashboard intent API and linked via
// chat_messages.intent_id.
//
// Same constitutional shape as voice.drain: the dashboard cannot host this
// leg (PHASE-08 LOCKED — no LLM surface in the projection client), so
// pending CEO rows drain inside the resident scheduler on a self-chain.
// One answer per drain: the leg holds an LLM call for its whole duration.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { sql, type Kysely } from "kysely";
import type { DB } from "@dxb/shared";
import { loadPolicy, route, SDK_MODEL_IDS } from "@dxb/kernel";
import { recallMemory } from "@dxb/memory-router";
import { matchMute, matchUnmute } from "@dxb/voice";
import {
  buildBriefSnapshot,
  classifyLeg,
  legInstruction,
  LEG_TASK_CLASS,
  type BriefSnapshot,
  type ChatLeg,
} from "./chat-legs.js";

export const CHAT_HAMZA_SLUG = "agents-orchestrator";
/** Conversation window Hamza sees per answer (newest last). */
const HISTORY_LIMIT = 20;

export interface ChatAnswerInput {
  message: string;
  mode: "normal" | "plan";
  lang: "tr" | "en";
  history: Array<{ role: "ceo" | "hamza"; content: string }>;
  personaHead: string;
  memoryLines: string[];
  /** Which of Hamza's two legs answers this (CEO directive 2026-07-25). */
  leg: ChatLeg;
  /** Live company figures — present on the brief leg, null on strategy. */
  snapshot: BriefSnapshot | null;
}

export interface DrainChatDeps {
  db: Kysely<DB>;
  repoRoot?: string;
  /** answer producer — overridable in tests; default = SDK on this message's
   *  leg row (same one-brain law as the voice line, V2). */
  answer?: (q: ChatAnswerInput) => Promise<string>;
}

export interface DrainChatResult {
  answered: number;
  failed: number;
}

async function personaHead(repoRoot: string, personaPath: string | null): Promise<string> {
  if (!personaPath) return "";
  try {
    const text = await readFile(join(repoRoot, personaPath), "utf8");
    return text.split("\n").slice(0, 60).join("\n");
  } catch {
    return ""; // persona file missing = degraded context, never a crash
  }
}

async function defaultAnswer(db: Kysely<DB>, q: ChatAnswerInput): Promise<string> {
  // One brain (V2): the same subscription routing rows the kernel uses.
  const rules = await loadPolicy(db);
  const ci = {
    intent_summary: "CEO chat board answer as Hamza",
    departments: ["ceo"],
    approval_class: "none" as const,
    complexity: "single" as const,
  };
  // Two legs (CEO directive 2026-07-25), both L1 — U21 §4d puts anything the
  // CEO reads on Opus 5, so the legs differ in effort and context, never in
  // quality. Fallback chain keeps a pre-migration deployment answering: leg row
  // -> chat.answer -> voice.answer -> orchestration, every rung L1.
  let r;
  const chain = [LEG_TASK_CLASS[q.leg], "chat.answer", "voice.answer", "orchestration"];
  let routed: ReturnType<typeof route> | null = null;
  for (const task_class of chain) {
    try {
      routed = route({ ...ci, task_class }, rules);
      break;
    } catch {
      /* next rung */
    }
  }
  if (!routed) throw new Error("chat answer: no routing row for any chat class");
  r = routed;
  const planMode = q.mode === "plan";
  const sys = [
    `You are Hamza, the orchestrator of DXB Global — the CEO's direct counterpart for planning and running the whole company.`,
    q.personaHead ? `Your persona (authoritative identity, follow it):\n${q.personaHead}` : "",
    q.memoryLines.length ? `Relevant company memory:\n- ${q.memoryLines.join("\n- ")}` : "",
    `Answer the CEO in ${q.lang === "tr" ? "Turkish" : "English"}.`,
    "This is a CONVERSATION, not a task intake. A greeting gets a warm greeting back. A question gets a direct answer. An idea gets genuine engagement — agree, push back, refine.",
    planMode
      ? "PLAN MODE is ON: think through the CEO's topic WITH him — propose a concrete plan (goal, steps, who does what, rough cost), ask what to adjust. DO NOT start any work; the CEO dispatches explicitly when he is satisfied."
      : "If the CEO clearly wants work executed, summarize what you would dispatch in one sentence and remind him of the 'Görev olarak gönder' button — never dispatch from chat yourself.",
    "If the topic implies outward action (money, contracts, external messages), say it will pass through a dashboard approval gate.",
    legInstruction(q.leg, q.snapshot, q.lang),
    "Plain language, no markdown headers, no code jargon. Keep it under 8 sentences unless the CEO asked for depth.",
  ].filter(Boolean).join("\n\n");

  const historyText = q.history
    .map((m) => `${m.role === "ceo" ? "CEO" : "Hamza"}: ${m.content}`)
    .join("\n");

  const stream = query({
    prompt: `${sys}\n\nConversation so far:\n${historyText}\n\nCEO says: ${q.message}\n\nHamza replies:`,
    options: {
      model: SDK_MODEL_IDS[r.model] ?? r.model,
      effort: (["low", "medium", "high", "max"].includes(r.effort ?? "") ? r.effort : "low") as
        | "low"
        | "medium"
        | "high"
        | "max",
      tools: [],
      // maxTurns 1 starves the SDK of its final text turn (measured
      // error_max_turns on the voice fast lane, probe 30ddba44) — keep 4.
      maxTurns: 4,
    },
  });
  for await (const msg of stream) {
    if (msg.type === "result") {
      if (msg.subtype !== "success") throw new Error(`chat answer failed (${msg.subtype})`);
      return String(msg.result ?? "").trim();
    }
  }
  throw new Error("chat answer: stream ended without result");
}

/** One resident drain pass: answer the OLDEST pending CEO message.
 *  Claim guard: status flips pending→answered/failed atomically at the end;
 *  a competing drain seeing non-pending skips (single scheduler by design). */
export async function drainChatMessages(deps: DrainChatDeps): Promise<DrainChatResult> {
  const db = deps.db;
  const repoRoot = deps.repoRoot ?? process.cwd();
  const produce = deps.answer ?? ((q: ChatAnswerInput) => defaultAnswer(db, q));
  const result: DrainChatResult = { answered: 0, failed: 0 };

  const row = await db
    .selectFrom("chat_messages")
    .select(["id", "content", "mode", "session_id"])
    .where("role", "=", "ceo")
    .where("status", "=", "pending")
    .orderBy("created_at", "asc")
    .limit(1)
    .executeTakeFirst();
  if (!row) return result;

  const lang: "tr" | "en" =
    /[çğıöşüÇĞİÖŞÜ]/.test(row.content) || !/^[\x00-\x7F]*$/.test(row.content) ? "tr" : "en";

  // U15 D12 (CEO live verdict 2026-07-25 "chatten kapan dedim, uymadı"):
  // daemon control commands execute DETERMINISTICALLY — no LLM, no
  // interpretation, immediate effect. "kapan" in chat MUTES the mic (the
  // daemon polls voice_daemon_state within 5s); "aç / jarvis uyan" reopens.
  const daemonCommand = matchMute(row.content) ? "muted" : matchUnmute(row.content) ? "listening" : null;
  if (daemonCommand) {
    try {
      await sql`SELECT control_voice_daemon_set_state(${daemonCommand}, ${"ceo"}, ${`chat command: "${row.content.slice(0, 80)}"`})`.execute(db);
      // The command stems are Turkish ("kapan", "sus", "mikrofonu aç") — the
      // ASCII-only ones defeat the char-based lang heuristic, so the
      // confirmation is always Turkish (the CEO's chat language).
      const confirmation = daemonCommand === "muted"
        ? "Anlaşıldı Muhittin Bey — mikrofonu kapattım. Siz sohbetten ya da panelden açana kadar sesli asistan tamamen sessiz kalacak."
        : "Mikrofon açıldı Muhittin Bey — \"Selamaleykum ya Hamza\" dediğinizde buradayım.";
      await db.insertInto("chat_messages")
        .values({ role: "hamza", content: confirmation, mode: row.mode, status: "answered", error: null, intent_id: null, session_id: row.session_id })
        .execute();
      await db.updateTable("chat_messages").set({ status: "answered" }).where("id", "=", row.id).execute();
      result.answered += 1;
    } catch (e) {
      await db.updateTable("chat_messages")
        .set({ status: "failed", error: (e as Error).message.slice(0, 300) })
        .where("id", "=", row.id)
        .execute();
      result.failed += 1;
    }
    return result;
  }

  try {
    const hamza = await db
      .selectFrom("agents")
      .select(["persona_path"])
      .where("slug", "=", CHAT_HAMZA_SLUG)
      .executeTakeFirst();
    // W1.5: the window is scoped to THIS conversation. Before sessions existed
    // it was the newest 20 rows on a single flat board, so a question about
    // video production carried the tail of a conversation about the budget.
    let historyQuery = db
      .selectFrom("chat_messages")
      .select(["role", "content"])
      .where("id", "<>", row.id)
      .orderBy("created_at", "desc")
      .limit(HISTORY_LIMIT);
    historyQuery = row.session_id
      ? historyQuery.where("session_id", "=", row.session_id)
      : historyQuery.where("session_id", "is", null);
    const historyRows = await historyQuery.execute();
    const [head, recall] = await Promise.all([
      personaHead(repoRoot, hamza?.persona_path ?? null),
      recallMemory(db, { query: row.content, limit: 5 }).catch(() => ({
        rows: [] as Array<{ body: string }>,
        classifier_used: false,
      })),
    ]);
    // Which leg — and, on the report leg, the live figures it is allowed to
    // quote. The snapshot is read AFTER the persona/memory fetch so it is as
    // fresh as possible when the model sees it.
    const leg = classifyLeg(row.content);
    const snapshot = leg === "brief" ? await buildBriefSnapshot(db, lang) : null;
    const answerText = await produce({
      message: row.content,
      mode: row.mode,
      lang,
      history: historyRows.reverse().map((m) => ({ role: m.role, content: m.content })),
      personaHead: head,
      memoryLines: recall.rows.map((r) => r.body.slice(0, 200)).filter(Boolean),
      leg,
      snapshot,
    });
    await db
      .insertInto("chat_messages")
      .values({ role: "hamza", content: answerText, mode: row.mode, status: "answered", error: null, intent_id: null, session_id: row.session_id })
      .execute();
    await db
      .updateTable("chat_messages")
      .set({ status: "answered" })
      .where("id", "=", row.id)
      .execute();
    result.answered += 1;
  } catch (e) {
    await db
      .updateTable("chat_messages")
      .set({ status: "failed", error: (e as Error).message.slice(0, 300) })
      .where("id", "=", row.id)
      .execute();
    result.failed += 1;
  }
  return result;
}
