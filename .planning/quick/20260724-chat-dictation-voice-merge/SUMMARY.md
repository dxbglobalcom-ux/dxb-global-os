---
slug: chat-dictation-voice-merge
date: 2026-07-24
status: complete
---

# SUMMARY — WisprFlow dictation in Chat with Hamza + Voice Line merge

Ledger 1a-1e CLOSED (row updated with full evidence). Delivered:

1. **Dictation lane**: mic toggle in ChatBoard input row → `POST /api/chat/dictate` (new route; CEO auth, 10MB cap, zod lang whitelist {tr,en}) → Speaches STT → text appended to the EDITABLE draft. Explicit TR|EN picker defaults to UI locale (lang.ts adaptation honored — never a silent inherit). Honest states: Listening ·Ns / Converting ·Ns / per-cause error line (mic_denied, empty_transcript, stt_unavailable…). Send stays the only dispatch — the D6 garble-into-task defect cannot exist on this lane.
2. **Voice Line merge**: /chat hosts the call line as a collapsed `<details>` section under the board (registered progressive-disclosure preference); `/voice` = redirect; nav row removed; CC-SPEC §7 table synced (spec-gap fixed: `/chat` was never in the table).
3. **One-command activation**: `scripts/voice-on.sh` — container start, health poll, TTS→STT warm-up, one decisive line. Ran green.
4. **Dict**: command.chat +7 keys, help.chat +3 sections (dictation, voice line, provenance) EN+TR; purity PASS (2270=2270).

Evidence: red→green E2E (scratchpad dictate-e2e.mjs; fake-file mic broken in this Chromium — measured headless AND headed — mic stream synthesized in-page from the real WAV; MediaRecorder→route→STT all real): dictated text landed = "Merhaba Hamza, yarın sabah pazarlaman raporunu hazırla." RULE #0 battery 4/4 on merged /chat. Speaches exit 137 root-caused = manual stop in 07-18 RAM crunch. Latency measured: small 17s / base 5s warm on X230 (dictation model knob `DXB_DICTATION_STT_MODEL`, default stays quality-first small).

Boundary: U15 D1-D7 daemon defects stay OPEN (separate ticket); joint CEO mic test (U15 block 8) still the only closer for the human-ear legs.

## Addendum — same-day round 2 (CEO feedback 2026-07-24 afternoon)

1. **Accuracy levers (WisprFlow parity)**: sttTranscribe gained prompt/hotwords/vadFilter; dictate route passes vad_filter=true + per-lang domain prompt + hotwords "Hamza, DXB" (env knobs DXB_DICTATION_PROMPT_TR/EN, DXB_DICTATION_HOTWORDS). Measured: "rapuru→raporu" fixed by prompt, "Anza→Hamza" fixed by hotwords, 3s silence → "" (hallucination dead); full UI E2E now transcribes the proof sentence 100% exact. Escape cancels a recording without uploading (E2E: 0 requests, empty draft).
2. **Queued rows removable**: migration 20260724001000_task_purge_queued.sql widens the task purge door to queued/inbox (live states still untouchable); grid PURGEABLE set + hint labels updated. E2E: dummy queued row ticked, purged via UI, audit row 37525.
3. **Stuck worker wave cleared**: Hamza dispatched 3 construction-code tasks to runtime workers (K1 violation) + 1 research task in a deterministic std.knowledge_shelf loop (toolless worker vs file-artifact gate — 3 fails, ladder burning). All 4 failed with events + audit, then purged through the door (their objectives also carried "…" chars — standing order 8). Root causes recorded; the gate/capability mismatch is a known open item for the runtime lane.
4. **Standing order 11** (superpowers always) registered in ledger + project CLAUDE.md.
5. Battery: chat/tasks/alerts 6/6 scrollOK + zero ellipsis; purity PASS (2271=2271).

## Addendum — round 3 (CEO voice-line verdict 2026-07-24 evening: "kalite çok kötü, tarzanca, Hamza neden cevap vermiyor")

Root causes measured, all fixed:
1. **Wrong answerer**: v1 Ask-a-Director law routed unpicked calls classify→department director (Chief of Staff answered "Hamza yok"). Registered adaptation (VOICE_INTERACTION_SPEC §3.1 note): default answerer = HAMZA HIMSELF (agents-orchestrator); director only on explicit dropdown pick; classify hop retired (one less LLM round).
2. **Broken Turkish**: voice.answer routing row was L4 claude-haiku/low vs chat's L2 sonnet/medium — lifted to sonnet-5/medium (DB + routing-seed.json KERN-02 parity) + natural-speech style directive in the answer prompt (TR: tam cümle, telegrafik yasak).
3. **Hold-to-talk retired**: click-to-talk toggle (same idiom as dictation), Square icon while recording, <400ms short-press guard (measured: tiny presses shipped truncated webm → Speaches 500 "Failed to decode audio" → "Unanswered call" rows).
4. Labels: hamzaOption "Hamza — size bizzat cevap verir", idleHint/help texts de-hold-ified; purity PASS.
Live proof (E2E synth-mic call 2d98e045): answering role = agents-orchestrator, topic "Şirket durumu", fluent Turkish answer ("Evet, Muhittin Bey, benim, Hamza…"), timings stt 41.8s / answer 28.8s / tts 4.9s (X230; VPS lifts STT). tests/r31 10/10 pass. Final /chat battery 4/4.

## Addendum — round 4 (CEO surface-cleanliness verdict 2026-07-24 evening 2: "selam verdi su içti bile yansıyor")

Root: voice-call intents (V5 lineage) were being claimed by intent-intake and dispatched as COMPANY WORK — every greeting spawned task→worker-selection→escalation decisions; r31 live-DB tests added probe intents on top. Fixes:
1. intent-intake claim query now excludes source='voice' (registered adaptation in the code comment; spoken Q&A "asking never starts work" per §7 help contract; voice-COMMANDED work = deferred JARVIS lane U15).
2. Decisions "Important" scope = decided_by='ceo' ONLY (risk criterion removed — machine hooks write themselves high-risk and leaked through). Intelligence Feed recent-decisions panel + 24h counter now CEO-only too.
3. Live Operations joined the C4 list standard: per-row checkbox on settled task rows → audited task purge (E2E: probe row selected, removed via UI, audit 37557); rows mid-flight not selectable.
4. Residue: 13 voice intents + 12 conversation tasks purged via doors; 5 zombie agent_runs "running" since 2026-07-19 exam night closed as failed (audit runs.close_stale).
Battery live/intelligence/decisions 6/6; decisions important view = 6/6 rows decided_by ceo; feed free of hook_reject/escalation. VS Code kill '61696' answered as X230 swap/OOM (known pattern, hardware boundary).
