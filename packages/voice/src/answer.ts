// Voice v1 answer half (VOICE_INTERACTION_SPEC §3.1 stages 3-6): routing
// (Hamza classify law), persona answer through the ONE brain path (V2), TTS
// with the registered voice identity (V1), audio handoff file, final
// voice_calls row. Runs INSIDE the resident scheduler (voice.drain) — the
// dashboard can never host this half: PHASE-08 LOCKED forbids LLM surfaces
// in the projection client, which is exactly why the call line splits here.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { sql, type Kysely } from "kysely";
import { query } from "@anthropic-ai/claude-agent-sdk";
import type { DB } from "@dxb/shared";
import { SDK_MODEL_IDS, loadPolicy, route } from "@dxb/kernel";
import { recallMemory } from "@dxb/memory-router";
import { ttsSpeak, ttsForLang, speachesConfig, type SpeachesConfig } from "./speaches.js";
import { assertTransition, type CallState, type TimelineEntry } from "./machine.js";
import { logCall } from "./log.js";

export const HAMZA_SLUG = "agents-orchestrator";

export interface AnswerQuestion {
  question: string;
  lang: "tr" | "en";
  agent: { slug: string; department: string; role_level: string | null; persona_path: string | null };
  personaHead: string;
  memoryLines: string[];
  /** U15 D12 (one-conversation law): recent board turns (chat + mirrored
   *  voice), oldest first — the CEO must be able to continue in voice what
   *  he started in chat and vice versa. */
  history?: Array<{ role: string; content: string }>;
}

export interface VoiceAnswerDeps {
  db: Kysely<DB>;
  tts?: typeof ttsSpeak;
  /** answer producer — overridable in tests; default = SDK on the
   *  orchestration route (one brain, V2; persona rides the system prompt, V7) */
  answer?: (q: AnswerQuestion) => Promise<string>;
  speaches?: SpeachesConfig;
  repoRoot?: string;
  /** where the answer WAV lands for the dashboard playback route;
   *  null/undefined = keep it in memory only (tests, inline proofs) */
  audioDir?: string | null;
}

export interface VoiceAnswerResult {
  callId: string;
  state: CallState;
  targetSlug: string | null;
  answerText: string | null;
  answerAudio: Buffer | null;
  audioPath: string | null;
  degraded: boolean;
  timings: { answer_ms: number | null; tts_ms: number | null };
  failure: string | null;
  /** set when the row was not answerable (already claimed / missing) */
  skipped: "not_found" | "not_claimable" | null;
}

type TranscriptLine = { role: string; text: string; at: string; intent_id?: string | null; lang?: string };

async function personaHead(repoRoot: string, personaPath: string | null): Promise<string> {
  if (!personaPath) return "";
  try {
    const text = await readFile(join(repoRoot, personaPath), "utf8");
    return text.split("\n").slice(0, 60).join("\n");
  } catch {
    return ""; // persona file missing = degraded context, never a crash
  }
}

async function defaultAnswer(db: Kysely<DB>, q: AnswerQuestion): Promise<string> {
  // One brain (V2): same subscription path and routing rows the kernel uses.
  // Voice is a LATENCY-CRITICAL lane (registered adaptation 2026-07-17): a
  // 2-4 sentence spoken answer routed through the L1 'orchestration' row cost
  // a measured 104s wall on the CEO's live call — the dedicated 'voice.answer'
  // row (fast tier, still subscription data in routing_rules) is the fix.
  // Fallback to 'orchestration' keeps pre-migration DBs answering.
  const rules = await loadPolicy(db);
  const ci = {
    intent_summary: `voice call answer as ${q.agent.slug}`,
    departments: [q.agent.department],
    approval_class: "none" as const,
    complexity: "single" as const,
  };
  let r;
  try {
    r = route({ ...ci, task_class: "voice.answer" }, rules);
  } catch {
    r = route({ ...ci, task_class: "orchestration" }, rules);
  }
  const sys = [
    q.agent.slug === HAMZA_SLUG
      ? "You are Hamza, the orchestrator of DXB Global — the CEO's direct counterpart for planning and running the whole company. When the CEO calls, HE IS TALKING TO YOU, Hamza — never claim to be someone else or say Hamza is unavailable."
      : `You are ${q.agent.slug}, ${q.agent.role_level ?? "member"} of the ${q.agent.department} department at DXB Global.`,
    q.personaHead ? `Your persona (authoritative identity, follow it):\n${q.personaHead}` : "",
    q.memoryLines.length ? `Relevant company memory:\n- ${q.memoryLines.join("\n- ")}` : "",
    `Answer the CEO's spoken question in ${q.lang === "tr" ? "Turkish" : "English"}.`,
    "This is a VOICE call: answer in 2-4 short spoken sentences, no markdown, no lists.",
    // Style ruling (CEO 2026-07-24, in-chat: "türkçesi çok kötü... tarzanca"):
    // spoken answers must read like a fluent human speaking, never like
    // compressed telegraph or translated jargon.
    q.lang === "tr"
      ? "Doğal, akıcı, sade konuşma Türkçesi kullan: tam cümleler kur, devrik/telegrafik kısaltma yapma, İngilizce iş jargonunu Türkçeye zorla çevirme (gerekiyorsa sade Türkçe karşılığını söyle). Bir insana sesli söylendiğinde kulağa doğal gelmeli."
      : "Speak in natural, fluent conversational English: complete sentences, no telegraphic compression, no internal jargon. It must sound natural when read aloud to a person.",
    `First line of your output MUST be exactly "TOPIC: <2-4 word topic of the question in ${q.lang === "tr" ? "Turkish" : "English"}>", then an empty line, then the spoken answer. The TOPIC line is never spoken.`,
    "If the question implies outward action (money, contracts, external messages), say it needs a dashboard approval — voice may request, never approve (V6).",
  ].filter(Boolean).join("\n\n");
  const historyText = (q.history ?? [])
    .map((m) => `${m.role === "ceo" ? "CEO" : "Hamza"}: ${m.content}`)
    .join("\n");
  const stream = query({
    prompt: `${sys}${historyText ? `\n\nConversation so far (chat and voice are ONE conversation):\n${historyText}` : ""}\n\nCEO asks: ${q.question}`,
    options: {
      model: SDK_MODEL_IDS[r.model] ?? r.model,
      // U21: effort comes from the routing row, never from a constant here.
      // The hardcoded "low" silently overrode the row and made the voice lane
      // the one place a CEO dashboard change could not reach. Same guard idiom
      // as chat-drain: an unknown row value falls back to "low" rather than
      // handing the SDK a value it cannot parse.
      effort: (["low", "medium", "high", "max"].includes(r.effort ?? "") ? r.effort : "low") as
        | "low"
        | "medium"
        | "high"
        | "max",
      tools: [],
      // Same lesson as classify NOT 1: with maxTurns 1 the SDK cannot recover
      // when the model spends its only turn before the final text — measured
      // error_max_turns on the fast-lane row (probe call 30ddba44, 2026-07-17).
      maxTurns: 4,
    },
  });
  for await (const msg of stream) {
    if (msg.type === "result") {
      if (msg.subtype !== "success") throw new Error(`voice answer failed (${msg.subtype})`);
      return String(msg.result ?? "").trim();
    }
  }
  throw new Error("voice answer: stream ended without result");
}

/** Stages 3-6 on a parked 'routing' row: route → answer → speak → ended.
 *  Claim guard: any status other than 'routing' is skipped, so a double-fired
 *  drain can never double-answer a call (single scheduler by design, 04-01). */
export async function answerVoiceCall(
  deps: VoiceAnswerDeps,
  job: { callId: string },
): Promise<VoiceAnswerResult> {
  const db = deps.db;
  const tts = deps.tts ?? ttsSpeak;
  const produceAnswer = deps.answer ?? ((q: AnswerQuestion) => defaultAnswer(db, q));
  const cfg = deps.speaches ?? speachesConfig();
  const repoRoot = deps.repoRoot ?? process.cwd();

  const result: VoiceAnswerResult = {
    callId: job.callId, state: "routing", targetSlug: null,
    answerText: null, answerAudio: null, audioPath: null, degraded: false,
    timings: { answer_ms: null, tts_ms: null }, failure: null, skipped: null,
  };

  const row = await db
    .selectFrom("voice_calls")
    .select(["id", "status", "target_agent_id", "transcript", "timeline", "stt_ms", "degraded"])
    .where("id", "=", job.callId)
    .executeTakeFirst();
  if (!row) {
    result.skipped = "not_found";
    return result;
  }
  if (row.status !== "routing") {
    result.skipped = "not_claimable";
    result.state = row.status as CallState;
    return result;
  }

  const transcript = (Array.isArray(row.transcript) ? row.transcript : []) as TranscriptLine[];
  const ceoLine = transcript.find((l) => l.role === "ceo");
  const timeline = (Array.isArray(row.timeline) ? row.timeline : []) as TimelineEntry[];
  let state: CallState = "routing";
  const step = (to: CallState, reason?: string) => {
    assertTransition(state, to);
    state = to;
    timeline.push({ state: to, at: new Date().toISOString(), ...(reason ? { reason } : {}) });
  };

  const fail = async (reason: string): Promise<VoiceAnswerResult> => {
    state = "failed";
    timeline.push({ state: "failed", at: new Date().toISOString(), reason });
    result.state = state;
    result.failure = reason;
    await logCall(db, {
      id: job.callId, status: "failed", transcript, timeline,
      stt_ms: row.stt_ms, answer_ms: result.timings.answer_ms,
      degraded: result.degraded,
      ...(result.targetSlug ? { target_agent_slug: result.targetSlug } : {}),
    });
    return result;
  };

  if (!ceoLine?.text) return fail("missing_transcript");
  const question = ceoLine.text;
  // lang rides the transcript line (intake wrote it); heuristic only for
  // legacy rows — answer language = utterance language (spec §27).
  const lang: "tr" | "en" = ceoLine.lang === "en" || ceoLine.lang === "tr"
    ? ceoLine.lang
    : /[çğıöşüÇĞİÖŞÜ]/.test(question) || !/^[\x00-\x7F]*$/.test(question) ? "tr" : "en";

  // 3. Routing — registered adaptation (CEO ruling 2026-07-24, in-chat:
  //    "Hamza neden kendisi cevap vermiyor da CEO ofis müdürü araya giriyor?"):
  //    the default line is HAMZA HIMSELF. The v1 "Ask-a-Director" classify hop
  //    (question → department → director answers) put a Chief of Staff between
  //    the CEO and his orchestrator — retired. A director answers ONLY when the
  //    CEO explicitly picks one in the ASK dropdown (id parked by intake).
  //    Bonus: dropping the classify call removes one LLM round from the
  //    latency-critical lane.
  let agent: { id: string; slug: string; department: string; role_level: string | null; persona_path: string | null } | undefined;
  if (row.target_agent_id) {
    agent = await db
      .selectFrom("agents")
      .select(["id", "slug", "department", "role_level", "persona_path"])
      .where("id", "=", row.target_agent_id)
      .where("employment_status", "<>", "archived")
      .executeTakeFirst();
  } else {
    agent = await db
      .selectFrom("agents")
      .select(["id", "slug", "department", "role_level", "persona_path"])
      .where("slug", "=", HAMZA_SLUG)
      .where("employment_status", "<>", "archived")
      .executeTakeFirst();
  }
  if (!agent) return fail("target_not_found");
  result.targetSlug = agent.slug;

  // 4. Claim + answer (V7 persona in prompt, V8 memory via the ONE read door)
  step("answering");
  await logCall(db, {
    id: job.callId, status: "answering", target_agent_slug: agent.slug,
    transcript, timeline, stt_ms: row.stt_ms,
  });
  const answerStart = Date.now();
  let answerText: string;
  try {
    const [head, recall, historyRows] = await Promise.all([
      personaHead(repoRoot, agent.persona_path),
      recallMemory(db, { query: question, limit: 5 }).catch(() => ({ rows: [], classifier_used: false })),
      // U15 D12 (one-conversation law): the voice answer sees the same board
      // history chat sees — a voice question continues the chat thread. W1.5
      // scopes that to the CURRENT thread, so a spoken question no longer
      // inherits the tail of whatever was discussed last week.
      db.selectFrom("chat_messages")
        .select(["role", "content"])
        .where(
          "session_id",
          "in",
          db.selectFrom("chat_sessions").select("id").orderBy("last_message_at", "desc").limit(1),
        )
        .orderBy("created_at", "desc")
        .limit(12)
        .execute()
        .catch(() => []),
    ]);
    const memoryLines = recall.rows.map((r) => r.body.slice(0, 200)).filter(Boolean);
    answerText = await produceAnswer({
      question, lang,
      agent: { slug: agent.slug, department: agent.department, role_level: agent.role_level, persona_path: agent.persona_path },
      personaHead: head, memoryLines,
      history: historyRows.reverse().map((m) => ({ role: m.role, content: m.content.slice(0, 500) })),
    });
  } catch (e) {
    return fail(`answer_error: ${(e as Error).message.slice(0, 200)}`);
  }
  result.timings.answer_ms = Date.now() - answerStart;
  // Topic contract (CEO 2026-07-19): the model's first line is
  // "TOPIC: <2-4 words>" — parsed off, NEVER spoken. Missing marker
  // (injected test answers, non-compliant model) → fall back to the first
  // words of the question so the history list always says what it was about.
  let topic: string | null = null;
  const topicMatch = /^TOPIC:\s*(.+)\s*\n+/.exec(answerText);
  if (topicMatch) {
    topic = topicMatch[1].trim().slice(0, 60);
    answerText = answerText.slice(topicMatch[0].length).trim();
  } else {
    topic = question.split(/\s+/).slice(0, 4).join(" ").slice(0, 60) || null;
  }
  result.answerText = answerText;
  const answerLine: TranscriptLine = { role: agent.slug, text: answerText, at: new Date().toISOString() };

  // 5. Speak (answer_ready Broadcast fires from the control fn on 'speaking'):
  //    registered identity or fallback voice, degraded=true — the answer is
  //    NEVER dropped for voice-supply reasons (§17).
  step("speaking");
  const identity = await db
    .selectFrom("voice_identities")
    .select(["engine", "profile_ref", "locale"])
    .where("agent_id", "=", agent.id)
    .where("status", "=", "active")
    .executeTakeFirst();
  result.degraded = !identity;
  // The voice must carry the ANSWER language (§27) — a registered identity in
  // another locale would read EN text through TR phonemes (unintelligible,
  // measured on the CEO's live call 2026-07-17). Identity wins only when its
  // locale matches; otherwise the language-default voice speaks.
  const langVoice = ttsForLang(cfg, lang);
  const spokenVoice = identity && identity.locale === lang
    ? { model: undefined as string | undefined, voice: identity.profile_ref }
    : { model: langVoice.model, voice: langVoice.voice };
  await logCall(db, {
    id: job.callId, status: "speaking", target_agent_slug: agent.slug, topic,
    transcript: [...transcript, answerLine], timeline,
    stt_ms: row.stt_ms, answer_ms: result.timings.answer_ms, degraded: result.degraded,
  });
  const ttsStart = Date.now();
  try {
    result.answerAudio = await tts(answerText, {
      voice: spokenVoice.voice,
      ...(spokenVoice.model ? { model: spokenVoice.model } : {}),
      config: cfg,
    });
  } catch (e) {
    return fail(`tts_error: ${(e as Error).message.slice(0, 200)}`);
  }
  result.timings.tts_ms = Date.now() - ttsStart;

  if (deps.audioDir) {
    try {
      await mkdir(deps.audioDir, { recursive: true });
      const audioPath = join(deps.audioDir, `${job.callId}.wav`);
      await writeFile(audioPath, result.answerAudio);
      result.audioPath = audioPath;
    } catch (e) {
      // Playback file is a convenience copy — the call itself still ends
      // honestly; the dashboard shows transcript + degraded playback state.
      console.error(`[voice] audio handoff write failed for ${job.callId}:`, e);
    }
  }

  // 6. Finalize (V10: observable, never scripted; cost_eur stays 0 — D1 proof)
  step("ended");
  result.state = state;
  await logCall(db, {
    id: job.callId, status: "ended", target_agent_slug: agent.slug, topic,
    transcript: [...transcript, answerLine], timeline,
    stt_ms: row.stt_ms, answer_ms: result.timings.answer_ms,
    tts_ms: result.timings.tts_ms, degraded: result.degraded, cost_eur: 0,
  });

  // 7. U15 D12 (one-conversation law): mirror the exchange onto the CEO Chat
  //    Board tagged source='voice' — chat, dictation and JARVIS are ONE
  //    Hamza. Only Hamza-answered calls mirror (the board's role column knows
  //    exactly 'ceo'|'hamza'); a director picked in the ASK dropdown stays on
  //    the call history alone. Mirror rows are terminal ('answered') so
  //    chat.drain never re-answers them. Best-effort: a mirror failure never
  //    fails the call.
  if (agent.slug === HAMZA_SLUG) {
    try {
      // W1.5: the mirror joins a real conversation. Without this a spoken turn
      // landed on the board with no thread — visible to nobody, scoped to
      // nothing, and a permanent orphan in the messages table. The same
      // resolver the written lane uses decides which thread it belongs to, so
      // speaking and typing genuinely continue each other.
      const sess = await sql<{ id: string }>`
        SELECT fn_chat_session_for_new_message(${question}, false) AS id
      `.execute(db);
      const sessionId = sess.rows[0]?.id ?? null;
      await db.insertInto("chat_messages").values([
        { role: "ceo" as const, content: question, mode: "normal" as const, status: "answered" as const, source: "voice" as const, session_id: sessionId },
        { role: "hamza" as const, content: answerText, mode: "normal" as const, status: "answered" as const, source: "voice" as const, session_id: sessionId },
      ]).execute();
    } catch (e) {
      console.error(`[voice] chat mirror failed for ${job.callId}:`, (e as Error).message.slice(0, 160));
    }
  }
  return result;
}
