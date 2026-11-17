<!-- B85 preparation dossier · part: Hamza, voice and memory · read by an Opus 5.5 helper at medium, 2026-11-17 · facts, no verdict.
     Checked by the lead at the source the same evening, nine claims. Held: tools: [] in both of Hamza's lanes (answer.ts:148, chat-drain.ts:158); neither lane calls commitMemory; nothing at runtime reads personas.body_md beyond the HR template and compiler; recall is called without a kind (answer-memory.ts:33); the reference stores' reader selects by store, not by the question; the Speaches defaults (faster-whisper-small, piper); a segment captured while speaking is dropped (jarvis-daemon.ts:466); no dxb-scheduler or dxb-jarvis unit loaded; the Speaches container is the CPU image with no device request. Differs slightly: the word 'redact' also appears in dxb-mcp/src/groups/approval.ts, not only audit.ts. Not settled by the lead: whether a jarvis or scheduler process runs (the lead's pgrep matched its own command). The rest is the helper's reading, unchecked. -->

# Preparation dossier: Hamza, voice and memory (`packages/voice`, `packages/memory-router`, `packages/dxb-mcp`, persona delivery)

## 1. THE LOAD

- **B12:** a spoken sentence must be heard and answered in 1.3 s at most, aiming for 1.0 s, with Turkish transcribed correctly. Hearing (STT) and speaking (TTS) move to the graphics card. Hearing switches to whisper large-v3-turbo. The three voice models stay loaded on the card permanently. The same speed applies when masters talk among themselves. Voice Studio and Voicebox are both installed and each covers for the other. ElevenLabs is the paid fallback. Mixed Turkish/English in one sentence must work.
- **B03:** the CEO's ear test at the real microphone, each leg timed: selam → spoken ack, question → spoken answer, "kapanabilirsin" → spoken bye.
- **B01 / VOICE_INTERACTION_SPEC §3.4 (lines 90-99):** several voices in one room, floor control with exactly one speaker, the CEO's interruption stops speech within 250 ms, and each master sees only the context it is allowed to see.
- **B25:** Kelam stages 3-6 live in a separate repository. It is first measured beside Handy and OpenWhispr.
- **B33:** ear, mouth and worker model live permanently on the card, with one gatekeeper that owns it.
- **B34:** a local worker model for classification and summaries, plus local embeddings (W4.5).
- **B64 / spec §24sexies (lines 356-369):**
  - His goal becomes a brief that goes through the job-type menu to the master, and the result comes back into the same conversation.
  - Hamza gets three hands: send work, read status, change a brain or effort level.
  - Levels are medium normally and xhigh for plan talk, with a spoken notice when he switches.
  - "Connect me to this job's master" works in chat and voice, answered in the master's own voice.
  - Commands are accepted only from the CEO's own channels.
- **MEMORY_ARCHITECTURE A1-A3 (lines 105-140):** a nightly "dream" proposes memory changes; Hermes's memory lives inside the holding; Hamza's day runs as one append-only session whose summary keeps every decision.
- **B08:** a brain switch by telling Hamza.
- **B42:** Hamza tells him one line when a tool we use is surpassed.
- **B22:** the synthesis is unwritten, and no design starts until he has read it.
- **B21:** no open board row exists (grep returned nothing).
- **B82:** I found no direct load on this part. UNVERIFIED.
- **Board line 271 ("Hamza in V2"):** one Hamza across chat, voice, meeting room and screen. He has hands; talking to him is ordering. He also handles daily-life acts (open the newspaper, play something).
- **Board line 274 ("V2 memory"):**
  - Memory is kept as readable files and draws a live company map.
  - It answers across both meaning and connections.
  - It is fed as the work happens.
  - It is accepted by a list of about 20 business questions.
  - Graphify leaves the company's memory.
  - Embeddings come from embeddinggemma via local Ollama: written asynchronously, with full-text fallback, no cloud fallback.
- **Spec V-rules (VOICE_INTERACTION_SPEC.md:30-39):**
  - V4: one speaker, and the CEO can interrupt.
  - V5: a spoken goal takes the same path as a typed one.
  - V6: no approvals by voice.
  - V7: the persona lives in the database persona record.
  - V8: no separate voice memory.
  - V9: audio stays on local hardware.
- **C26** (Hamza knows which page the CEO is on), **C57** (one speaker across every lane that can speak), **C37** (language check on system-produced text).
- **CLAUDE.md first law:** the screen follows what is being talked about, and the machine says when it last knew.

## 2. WHAT STANDS TODAY

**voice (15 files):**
- `speaches.ts`: HTTP client for STT and TTS on Speaches at :8969. Defaults are faster-whisper-small and piper, lines 22-30.
- `intake.ts`: clears dead calls, checks the line is free, runs STT, writes an `intents` row, parks the call in `routing`.
- `answer.ts`: loads persona, memory and history, makes one SDK `query()` call, runs TTS, writes the WAV, mirrors the exchange to chat.
- `drain.ts`: sweeps stale calls and answers the oldest one.
- `call.ts`: runs intake and answer inline (tests and CLI).
- `jarvis-daemon.ts`: microphone capture via arecord with voice detection, wake word, spoken cues, playback.
- `wake.ts` / `lang.ts`: fuzzy Turkish phrase matching and language detection.
- `machine.ts`: the call state machine.
- `log.ts`: the only write path, through `control_voice_call_log`.
- `persona.ts`, `prompt-core.ts`, `answer-memory.ts`, `paths.ts`, `index.ts`.

**memory-router:**
- `write-policy.ts`: `commitMemory`.
- `classify-read.ts`: `classifyQuery` and `recallMemory`.
- `compaction.ts`: expiry self-tombstone, run from `scheduler.ts:481`.
- Adapters: pgvector, obsidian, graphify, notebook, claude-mem.

**dxb-mcp:** 28 tools in 9 groups (`index.ts:20-31`). `dashboard_feed` and `crm_get` are stubs. The other files are `dispatch-book.ts` (a pure check of the task graph), `transitions.ts` and `redact.ts`. The only users are worker seats: 27 of the 28 gateway profiles mount it (`worker-shim.ts:451`). Hamza's chat and voice lanes do not use it.

**Entry points:**
- `pnpm jarvis` (`scripts/systemd/dxb-jarvis.service:16`).
- The scheduler queues `voice.drain` (every 5 s) and `chat.drain` (every 3 s) (`scheduler.ts:182,186,712-729`).
- The dxb-mcp stdio server.

**(a) From microphone to spoken answer:**
1. A segment closes after about 800 ms of silence (`jarvis:82`).
2. A rough STT pass runs on every segment (`jarvis:525`).
3. Intake runs the full STT (`intake.ts:138`), plus a retry if empty (`:139`) and a pinned-Turkish pass if the script is not Latin (`:158`).
4. Intake writes the `intents` row (`:182`) and parks the call (`:203-213`).
5. The daemon checks the row every 2 s (`jarvis:618`). The drain answers one call per 5 s run (`drain.ts:53-60`).
6. The answer stage reads the persona file, runs recall and reads history in parallel (`answer.ts:268-286`), then reads routing and model rows (`:95,129`).
7. The model's whole answer is awaited; there is no streaming (`:156-162`).
8. TTS synthesises the whole answer in one request (`:338`) and the WAV is written (`:352`).
9. The daemon sees `ended` at its next check, reads the WAV and plays it (`jarvis:625-630`, `180-189`).

**(b) How a turn's context is assembled:** `standingPrompt` (`prompt-core.ts:242-263`) builds, in order: identity, holding line, persona, memory, language, CEO language law, honesty, approval gate, no-refusal, first-shot. `answerLayers` (`:275-285`) puts the standing part in the system prompt and moves memory into the turn. Three callers: voice `answer.ts:114`, chat `chat-drain.ts:123`, task `worker-shim.ts:321-342`. Code comments say the system prompt is cached. UNVERIFIED — I did not measure the cache.

**(c) Writing and recalling memory:**
- Writing: `commitMemory` → rule 1 (web, email and video origins start quarantined) → embedding plus a contradiction judge via LiteLLM (`write-policy.ts:84-127,252-273`) → one transaction (`:276-353`). The store is decided by the fixed `KIND_STORE` table (`:61-66`).
- Recalling: `recallMemory` → if no kind is given, an LLM `classifyQuery` call (`classify-read.ts:70-96`) → the store's reader (`:259-264`).

## 3. DEFECTS THE BOARD ALREADY NAMES

- **B12:** voice runs on the CPU with the smallest models. The row cites the container, not a file. Measured today: image `speaches:0.8.3-cpu`, `DeviceRequests null` (docker inspect).
- **B03:** cites no file. Only the ear test is open.
- **B65:** `chat-drain.ts:160` never checks `is_error`. `answer.ts:158-160` has the same shape (my reading).
- **Board line 271:** `answer.ts:122` `tools: []`. The line now sits at `answer.ts:148`, and `chat-drain.ts:158` is the same. B41.md:23 cites stale line numbers.
- **Board line 274:** recall and summarize need `DXB_LITELLM_KEY_OS`, which the company does not have, so neither runs; 0 relation rows. UNVERIFIED by me — it needs the environment file and the database.
- **C57:** the playing guard (`jarvis-daemon.ts:394-401,466`) does not cover the dashboard panel.
- **B51.md:16:** `chat-drain.ts:116` drops `xhigh` to `low`. The code has since fixed it (`prompt-core.ts:30-41`).
- **V5 (spec:34):** `intent-intake.ts:78` skips spoken items.
- **§24sexies.4:** only the voice ASK choice lets a non-Hamza agent answer (`answer.ts:232-246`).

## 4. FACTS A DESIGNER MUST KNOW

1. **Nothing is answering right now.** No dxb-scheduler or dxb-jarvis unit is loaded at either systemd level, and no such process exists (`systemctl list-units`, `pgrep`).
2. **Hamza has no hands.** Both lanes run with `tools: []` (`answer.ts:148`, `chat-drain.ts:158`), yet his persona §9-§10 describes queue, database-function and memory hands (`agents-orchestrator.md:113-127`).
3. **The voice path has fixed waits:**
   - at least two STT passes per question, up to four;
   - a 0-5 s wait for the drain plus a 0-2 s wait for the daemon's next check;
   - no streaming of the answer or the speech.
4. **Recall sits on the voice path.** Every recall makes an LLM classify call plus an embedding call, because `answer-memory.ts:31` never passes `kind`. When recall fails, Hamza is told to say his notes are unreachable (`prompt-core.ts:74-76`).
5. **Three of the four stores ignore the question.** Obsidian, graphify and notebook just return the newest N rows (`classify-read.ts:218-254`); only facts are searched by meaning.
6. **Hamza never writes memory.** Neither `voice/` nor `chat-drain` calls `commitMemory`. The writers are MCP `memory_commit`, `context-budget.ts:159` and `video-learn/ingest.ts:192`.
7. **Memory writes are not redacted,** although MEMORY_ARCHITECTURE.md:13,74 says they are. `redact.ts` is used only by `audit.ts:32` and matches key names, not content (`redact.ts:3`).
8. **Note files are written inside the database transaction** (`write-policy.ts:308`). A rollback cannot undo a written file.
9. **The persona is read from its file on every turn** (`persona.ts:88`, about 18.8 KB for Hamza). Nothing at runtime reads `personas.body_md`; `pre-task.ts:63` only checks that a row exists. This contradicts V7. `compilePersonaPrompt` has no runtime caller.
10. **Voice history ignores the call's own session.** It takes 12 messages, cut to 500 characters, from whichever chat session was most recently active (`answer.ts:275-291`). Chat takes 20 from its own session (`chat-drain.ts:38`). The task lane gets no memory (`worker-shim.ts:327`).
11. **Prompts are string literals in code:** `prompt-core.ts:57-232`, `answer.ts:78-86`, `classify-read.ts:34-41`, `write-policy.ts:95-97`, `worker-shim.ts:314-319`. The spoken cues are Turkish only, with "Muhittin Bey" hard-coded (`jarvis:208-219`). Only tr and en are accepted (`intake.ts:178`).
12. **The voice line cannot be interrupted** (half-duplex): a segment captured while speaking is dropped (`jarvis:466`), against V4. `speak()` has no lock, and a timer can fire it at `jarvis:561`.
13. **The voice prompt carries no clock or date** (`answer.ts:131-135`).
14. **The worker MCP profiles grant tools the prompt forbids.** 27 profiles grant `queue_claim`, `queue_transition` and `registry_create_department`; the task lane only forbids claiming and transitions in prompt text (`worker-shim.ts:314-319`). Whether something else strips them: UNVERIFIED. The server is launched by a relative path (`profiles/*.mcp.json`).
15. **Unused code and stale-build risk.** `syncClaudeMem` and `updateGraphIncremental` have no production callers. Tests load `@dxb/voice` from `dist`, not the source (no alias in `vitest.config.ts`); a green run on an old build is recorded at `agent-context.test.ts:51-56`. `fable-5` appears only in comments in these packages; nothing CEO-visible.

## 5. THE TESTS

Test files: about 12 for voice, 11 for memory-router, 15 for dxb-mcp (some overlap). They are in r31, r32, u15r2, b21, b36, b51, b43, phase3, phase4, phase6, phase7 and governance; c9/chat-legs covers chat-drain. I ran none of them. Five samples:
- **`r31/persona-delivery:28-38`:** the expected sections come from a regex over the raw persona file, independent of the loader, so it can go red. It tests the loader only, not the lanes that use it.
- **`b21/agent-context:46-67`:** compares `standingPrompt(voice)` with `standingPrompt(chat)`, which is the same function called twice. Its other checks only look for phrases that `prompt-core` itself contains. It cannot catch a lane that stops using `prompt-core`, except through the slug scan.
- **`r31/voice-line:130-165`:** uses the real database and real Speaches with a stubbed answer, so it can go red when a stage fails. No latency limit is asserted anywhere: the only `toBeLessThan` in r31, r32 and u15r2 is the VAD arithmetic in `jarvis-wake`.
- **`phase6/recall:87-118`:** hand-built vectors and an injected classifier, independent of the code, so it can go red. Live LiteLLM is only reached with `DXB_LIVE_SDK=1`.
- **`phase6/contradiction:77-171`:** injected embedding and judge; it checks the resulting database state, so it can go red.

NOT COVERED: the dashboard intake route (out of scope); the bodies of the dxb-mcp queue and media groups; the company database (memory row counts, `voice_identities`, persona rows); the real environment (STT model, LiteLLM key); whether the prompt cache actually hits; how many processes `query()` starts; B82's link to this part; the full B64 row file.
