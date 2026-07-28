# VOICE_INTERACTION_SPEC — Hamza Call Line, Voice Identities, Boardroom (add-later)

> Dalga 6 · Spec #33 · Author: Fable 5 in person (K1) · Written 2026-07-17
> Source rulings: Talep `MUSTS from Fable 5 - English.md` §5 (binding voice layer) · CEO decisions D1 (free-first) + D3 (v1 = orchestrator-mediated call line, boardroom deferred) recorded in [[00-CEO-DIRECTIVE-REVENUE-FIRST]] · registered adaptation U4 (JARVIS deferral, [[00-INDEX]])
> Parent: [[MASTER_PLAN]] · Siblings: [[AGENT_ORCHESTRATION_SPEC]] (routing), [[MEMORY_ARCHITECTURE]] (§5.9 continuity), [[APPROVAL_ENGINE_SPEC]] (gates unchanged), [[COST_CONTROL_SPEC]] (paid-upgrade gate), [[EMPLOYEE_PERSONA_STANDARD]] (Hamza/director personas), [[FABLE_5_HOOK_SPEC]] (decision principles enforcement)

## 0. Existing-asset mapping (KALIR / YENİ / DEĞİŞİR)

**KALIR (measured 2026-07-17):**
- Speaches container `dxb_speaches_local` (`ghcr.io/speaches-ai/speaches:latest-cpu`) — measured `docker ps` → `Up`; OpenAI-compatible `/v1/audio/transcriptions` (faster-whisper) + `/v1/audio/speech` (Kokoro-82M, 54 voices; Piper fallback). Stays the STT backbone and the TTS fallback.
- voicebox install `~/voicebox/voicebox-main` (jamiepine/voicebox) — measured present; 7 TTS engines, voice cloning, Turkish via Chatterbox Multilingual, ships an MCP server (`voicebox.speak`). Becomes the voice-identity supply (cloned, stable voices at €0).
- Kernel intent path (`packages/kernel` classify) + orchestrator routing + memory router + approval engine + `decision_log`/`audit_log` — voice is a NEW INPUT CHANNEL into the SAME path (Talep §5.1: not a second brain).
- Realtime Broadcast channel discipline (STACK.md rule: Broadcast, not postgres_changes).

**YENİ:**
- `voice_core` migration family 0029x: `voice_identities`, `voice_calls` (+ RLS + control fns).
- Call-line service (thin): audio in → STT → intent → orchestrator → director answer → TTS → audio out.
- Dashboard `/voice` call surface (push-to-talk v1) — §31 route addition, built in R3.1.
- Events `voice.*` on Broadcast.

**DEĞİŞİR:**
- U4 (JARVIS deferral) is REFINED, not repealed: spec now exists (this file); v1 call line executes as roadmap R3.1; Moderated-Mode boardroom stays deferred (D3) at the "add-later" architecture level in §3.4. INDEX U4 note updated accordingly. **R3.2 (2026-07-17):** the always-on wake layer itself SHIPPED (§24bis) — U4's deferred remainder is the Moderated Boardroom alone.

## 1. Purpose

Give the CEO a working spoken channel into the Holding at €0 marginal cost: press-to-talk, ask a question, the orchestrator (Hamza) routes it to the right department director, and the answer comes back in that director's stable cloned voice. v1 is deliberately NOT a meeting room (CEO ruling D3: "toplantı değil — gerektiğinde soru sormak için orkestratör vasıtasıyla bir çağrı"). The full executive boardroom (Talep §5.3–5.5) is architected here at add-later level (§3.4) and executes only after revenue funds it (D1).

## 2. Requirements (binding V-rules)

- **V1 — Voice-identity law (Talep §5.2):** AI voice identities = current department directors + exactly one orchestrator voice (Hamza). Specialists/sub-agents never get executive voice identities. Enforced by registry: `voice_identities.agent_id` must reference an agent with `role_level='director'` or the Hamza orchestrator row; the control fn rejects everything else.
- **V2 — One brain (Talep §5.1):** Hamza is the spoken interface of the SAME kernel/orchestrator/memory/intent path. No voice-only decision logic, no parallel state.
- **V3 — Free-first (D1):** v1 runs entirely on self-hosted Speaches + local voicebox — €0 marginal cost. Any paid realtime layer (OpenAI `gpt-realtime` **mini** is the selected future path) activates ONLY after the first objective's realized net profit (REVENUE_ENGINE_SPEC objective O1, €50) AND explicit CEO approval — it is money-out, so it is approval-gated (B7b).
- **V4 — One speaker + CEO override (Talep §5.5):** only one AI voice speaks at a time; CEO interruption stops playback immediately. v1 satisfies this trivially (single-director call); the boardroom design (§3.4) inherits it as a floor-control state machine.
- **V5 — Single authoritative path (Talep §5.8):** a spoken CEO decision enters the SAME intent → orchestration → workflow → audit path as a typed one. The call line submits transcripts through the existing intents intake; no shadow channel.
- **V6 — No approvals by voice in v1:** there is no voice-print authentication; therefore outward-facing/destructive confirmations (money, contracts, identity) can NEVER be granted by voice. Approval stays in the dashboard. Voice may REQUEST; it may not APPROVE.
- **V7 — Fixed style & decision principles (Talep §5.6–5.7, §5.11):** Hamza's communication style and 5-step decision hierarchy (truth → safety → efficiency → profitability → cost discipline) live in the Hamza persona file + hook policy, in the DB persona record — never in model-specific config. Model routing may change the engine, never the persona.
- **V8 — Memory continuity (Talep §5.9):** Hamza and directors answer from existing [[MEMORY_ARCHITECTURE]] surfaces (doctrine, prior CEO decisions, objectives, department memory). No separate voice memory store.
- **V9 — Audio privacy:** in v1 no audio ever leaves CEO hardware + own VPS (Speaches self-hosted, voicebox local). External audio APIs are forbidden until the V3 paid path is approved.
- **V10 — Observable, not scripted (Talep §5.13):** every call writes `voice_calls` + `decision_log`; a demo that fakes any stage is a §35 violation.

## 3. Architecture

### 3.1 v1 call flow (Ask-a-Director line, D3)

```
CEO push-to-talk (dashboard /voice or laptop client)
  → audio → Speaches STT  /v1/audio/transcriptions        [€0, local]
  → transcript → kernel classify (existing intents path)   [V5]
  → orchestrator: resolve target director (explicit pick or Hamza routing)
  → director agent answers from persona + department memory [V2, V8]
  → answer text → TTS:
       primary: voicebox cloned voice of that director/Hamza [V1]
       fallback: Speaches Kokoro voice (marked non-cloned)
  → audio playback + transcript rendered in /voice
  → voice_calls row + decision_log entry                    [V10]
```

> **Registered adaptation 2026-07-24 (CEO ruling, in-chat):** the default
> answerer is **Hamza himself** — the classify→department-director hop is
> retired for unpicked calls ("Hamza neden kendisi cevap vermiyor da CEO ofis
> müdürü araya giriyor?"). A director answers only on an explicit ASK-dropdown
> pick. Same ruling: push-to-talk became click-to-talk toggle; `voice.answer`
> routing row lifted L4-haiku/low → L2-sonnet/medium (KERN-02 parity in
> `routing-seed.json`) after measured broken-Turkish answers on the haiku row.
> The call surface itself lives inside `/chat` since the same-day merge
> (CC-SPEC §7 sync note).

Two spoken shapes, one pipeline: (a) "Hamza, ask the HR Director: …" — Hamza routes and the director's voice answers; (b) "Hamza, …" — Hamza answers himself as orchestrator. Both are ONE call session with ONE active AI voice.

### 3.2 Voice supply

Each director voice = one voicebox cloned profile (reference audio → stable voice). Hamza's voice = the flagship clone, chosen once by the CEO from generated candidates, then frozen (Talep §5.10 stability). Turkish output via Chatterbox Multilingual engine; English supported by the same profile. Registry (`voice_identities`) maps agent → engine + profile ref, so voices survive model changes (V7).

### 3.3 Paid future path (V3 gate)

Selected upgrade: OpenAI `gpt-realtime` **mini** (CEO D1 ruling "16-da mini paketi"; measured pricing 2026-07-16: mini ≈ $0.06–0.10/min vs full ≈ $0.18–0.24/min). Activation contract: O1 realized net ≥ €50 (from `v_objective_progress`) → upgrade proposal card → CEO approval (money-out gate) → LiteLLM virtual key with hard budget. Talep §5.10's evaluation duty is hereby DISCHARGED: the realtime layer was genuinely evaluated (bidirectional audio, barge-in, latency, cost measured); the exact technical-economic reason it is not integrated NOW is D1 — no paid capability before profit; this spec is the strongest free architecture preserving the same control semantics.

### 3.4 Add-later: Moderated Boardroom (DEFERRED — D3)

Design sketch only; NO execution row exists until the CEO orders one after revenue funds it.

- **Media bus:** self-hosted SFU (LiveKit-class) OR OpenAI realtime sessions per participant; CEO mic is the only human input.
- **Floor control state machine:** `floor_owner ∈ {ceo, hamza, director_i}`; transitions only via CEO utterance ("Hamza, let the HR Director speak") parsed by Hamza; CEO barge-in preempts instantly (hard stop of active TTS stream ≤250ms target). Exactly one owner at all times (V4).
- **Roster control:** invite/dismiss = Hamza tool calls that attach/detach director sessions; invited director receives meeting context filtered by their organizational authority (Talep §5.5 last clause — permission-scoped context injection, not full transcript dump).
- **Context bus:** shared meeting transcript + per-director scoped views; on speaker switch the new speaker inherits live context without CEO repetition.
- **Acceptance (deferred set):** the Talep §5.13 items marked "boardroom" in §21 below.

## 4. Data model (new family `voice_core`)

Two tables, additive only (no breaking change to the existing schema — DATA_MODEL rule):
`voice_identities` (registry, V1 law) and `voice_calls` (session log, V10). DDL in §11.

## 5. Component structure

- `packages/voice` (NEW, thin): call-session state machine, Speaches client, voicebox invoker, no business logic (business stays in orchestrator).
- `packages/voice` R3.2 additions (§24bis): `jarvis-daemon.ts` (always-on wake daemon), `wake.ts` (fuzzy TR wake/dismiss matchers), `lang.ts` (utterance-language detection, §27 adaptation); supervised by `scripts/systemd/` user units + `install.sh`.
- Dashboard `apps/dashboard` route `/voice`: push-to-talk, director picker, live transcript, playback (R3.1).
- Speaches container (existing, unchanged). voicebox local install (existing; invoked via its MCP `voicebox.speak` or CLI).

## 6. Backend structure

- API route (dashboard server) `POST /api/voice/call` — streams audio blob → STT → intent submit; returns call id.
- pg-boss job `voice.tts` (optional async for long answers); short answers render synchronously.
- No resident daemon in v1 — the call is request-scoped; the resident worker question belongs to R2.1, not here.

**Implementation note (R3.1, 2026-07-17 — recorded, not a deviation):** the answer leg (routing/persona/TTS) is an LLM surface and therefore CANNOT run inside the dashboard process — PHASE-08 LOCKED ("dashboard is a pure projection client, no LLM calls / provider SDKs", enforced by eslint) outranks this section's "render synchronously" sketch per the corpus hierarchy. Shipped shape: `@dxb/voice` splits into an SDK-free intake half (dashboard imports only the `./intake` subpath: auth → Speaches STT → intent → `voice_calls` parked at `status='routing'`) and an answer half hosted by the EXISTING resident scheduler on a 5s `voice.drain` self-chain (E9.1 A1 idiom — "a Postgres fn cannot reach pg-boss, so drains self-chain"; no new resident daemon, R5 intact). This is the §6 pg-boss job path made primary; the answer WAV hands off via `var/voice/<call_id>.wav` (synthetic audio only — question audio is never persisted, V9/§16) and the page follows `voice.*` Broadcast events with a 5s poll fallback.

## 7. Frontend structure (§31 route addition — Command group)

`/voice` page: single-call surface. States: idle → recording → thinking → speaking → done/failed, each visibly distinct; transcript pane (CEO line + answer line, speaker-labeled with agent identity chip); director picker (default: Hamza routes). RULE #0 applies: EN+TR, ≥2 widths, design-bank baseline before done.

## 8. APIs (control seam — SECURITY DEFINER, audit-writing)

- `control_voice_identity_upsert(agent_id, engine, profile_ref, locale, actor)` — enforces V1 law (director/orchestrator only), writes audit.
- `control_voice_identity_retire(agent_id, actor)`.
- `control_voice_call_log(call jsonb)` — the ONLY write path into `voice_calls`.
Direct table writes are revoked from app roles (P4 single-write-seam).

## 9. Event structure (Broadcast channel `voice`)

`voice.call.started` · `voice.call.answer_ready` · `voice.call.ended` · `voice.call.failed` — payload: call id, director agent id, duration ms, degraded flag. Broadcast (not postgres_changes) per STACK rule.

## 10. State management

Call state machine (server-side, one active call per CEO session — concurrent second call is rejected with a spoken/visible "line busy" state):
`idle → listening → transcribing → routing → answering → speaking → ended | failed`
Every transition timestamped into `voice_calls.timeline` (jsonb) for latency audit.

## 11. Database tables (DDL summary — migration family 0029x)

```sql
-- 0029a voice_core
CREATE TABLE voice_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL UNIQUE REFERENCES agents(id),
  engine text NOT NULL,                      -- 'voicebox:chatterbox-ml' | 'speaches:kokoro' | future 'openai:realtime-mini'
  profile_ref text NOT NULL,                 -- clone profile path/id (NEVER raw audio in DB)
  locale text NOT NULL DEFAULT 'tr',
  status text NOT NULL DEFAULT 'active',     -- active | retired
  created_at timestamptz NOT NULL DEFAULT now()
);
-- V1 law enforced in control fn: agent must be role_level='director' OR the orchestrator (Hamza).

CREATE TABLE voice_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  status text NOT NULL DEFAULT 'listening',  -- state machine §10
  target_agent_id uuid REFERENCES agents(id),-- answering director/Hamza
  transcript jsonb NOT NULL DEFAULT '[]',    -- [{role, text, at}]
  timeline jsonb NOT NULL DEFAULT '[]',      -- state transitions + ms
  stt_ms int, answer_ms int, tts_ms int,
  degraded boolean NOT NULL DEFAULT false,   -- fallback voice used
  cost_eur numeric NOT NULL DEFAULT 0        -- stays 0 in v1 (V3 proof)
);
```

## 12. Relations

`voice_identities.agent_id → agents.id` (1:1) · `voice_calls.target_agent_id → agents.id` · intents created from calls carry the normal intents-intake lineage (V5) — no special FK, the transcript stores the intent id.

## 13. Authorization

Call initiation: CEO session only (existing dashboard auth). RLS: `voice_identities` read-all/write-via-fn; `voice_calls` CEO-read, write-via-fn. Directors cannot start calls to the CEO in v1 (outbound-to-human = future, would be an outward-facing action).

## 14–15. Logging & Audit

Every call → `voice_calls` (full transcript + timing) + `decision_log` entry for the routed intent + `audit_log` via control fns. Voice identity changes are audited mutations.

## 16. Security

- No audio egress in v1 (V9); Speaches and voicebox endpoints bind local/VPS-private only.
- Voice ≠ authentication: approval gates unchanged (V6); a spoken "approve it" produces an approval REQUEST card, never an approval.
- No new secrets in v1 (no external API). V3 path will use a LiteLLM virtual key (never a raw provider key — stack hard rule).
- Clone profiles are files on disk under the project data dir, referenced by path (`profile_ref`) — DB stores no biometric audio.

## 17–19. Error handling · Retry · Fallback

- STT failure/empty transcript → one retry → visible "couldn't hear" state (never a guessed transcript — RULE #0-A applies to machines too).
- voicebox down/slow (>10s) → Kokoro fallback voice, `degraded=true`, alert row; answer is NEVER dropped for voice-supply reasons.
- Speaches container down → `/voice` shows text-only degraded mode + machine alert; call flow refuses audio recording (honest failure, no fake).
- Orchestrator/answer failure → spoken + visible failure state, `voice.call.failed` event.

## 20. Test plan

- Unit: state machine transitions (legal/illegal), V1-law rejection (specialist agent → fn error).
- Integration: WAV → Speaches STT roundtrip (TR + EN sample), voicebox speak roundtrip, fallback switch when voicebox absent.
- E2E (R3.1 acceptance): spoken Turkish question → routed director → spoken answer; timings recorded in `voice_calls`. Latency TARGETS (hypotheses until measured, per Evidence-Before-Done): STT ≤2s for a 5s utterance (faster-whisper small int8 ≈4× realtime on CPU — STACK.md:29), total turn ≤10s v1.

## 21. Acceptance criteria (Talep §5.13 mapped — nothing silently dropped)

| Talep §5.13 item | v1 (R3.1) | Boardroom (deferred, §3.4) |
|---|---|---|
| CEO questions a director by voice | ✓ (via Hamza routing — D3 shape) | direct-mode refinement |
| Moderated meeting, invite/dismiss directors | — | ✓ deferred |
| Floor transfer by natural speech | — | ✓ deferred |
| One AI voice at a time | ✓ (single call) | state machine |
| CEO interrupt stops speech | ✓ (stop button + push-to-talk cuts playback) | barge-in ≤250ms |
| Correct persona/authority/memory per speaker | ✓ | ✓ |
| Persona stable across model change | ✓ (V7 — DB/persona, not model config) | ✓ |
| Spoken decision = same authoritative path | ✓ (V5) | ✓ |
| OpenAI realtime genuinely evaluated | ✓ DONE 2026-07-16 (§3.3 — mini selected, gated on profit) | reuse |
| Observable, not scripted | ✓ (`voice_calls` + decision_log) | ✓ |

v1 done-line = every "✓ v1" row demonstrated on the real runtime.

## 22. Migration plan

0029a `voice_core` tables + RLS + grants revoke · 0029b control fns (`control_voice_identity_*`, `control_voice_call_log`) + seed Hamza identity row (after clone approved by CEO). Additive-only; no existing table changes.

## 23. Rollback plan

Drop-family rollback: 0029x tables/fns are leaf objects (nothing else references them); `DROP TABLE voice_calls, voice_identities; DROP FUNCTION control_voice_*;` restores prior state. Dashboard route behind the standard route registry — removable without shell impact.

## 24. Implementation order (roadmap R3.1) — each step with verify

1. 0029a+b migrations → `\dt voice_*` → 2 tables; illegal identity insert via fn → ERROR (V1 proof).
2. Speaches STT smoke → `curl -F file=@sample_tr.wav :8000/v1/audio/transcriptions` → Turkish text.
3. voicebox Hamza candidate voices → CEO picks one (⚠ human-eye/ear gate) → identity row seeded.
4. `packages/voice` call service + `/api/voice/call` → integration test green.
5. `/voice` page → RULE #0 design pass (EN+TR, 2 widths, baselines).
6. E2E spoken TR question → spoken answer; `voice_calls` row shows timings, `cost_eur=0` (D1 proof).

## 24bis. JARVIS always-on wake layer (roadmap R3.2 — registered 2026-07-17)

**CEO command (verbatim contract):** "Selamaleykum ya Hamza" spoken aloud → the line opens (no password, no dashboard, no line-picking); Hamza acknowledges by voice; every following utterance is a question on the SAME intake seam (V5 one-path, busy law §10 intact) answered aloud on the speakers; "kapanabilirsin / gidebilirsin (ya) Hamza …" closes the session.

**Shipped shape (free-first D1, €0 marginal):**
- `jarvis-daemon.ts` — resident wake daemon on the CEO terminal: `arecord` 16k mono capture (the proven Kelam M1 lane on this machine) → RMS voice-activity gate (silence costs nothing) → short-segment STT pass → fuzzy wake/dismiss match → active-session questions through `intakeVoiceCall` → answer WAV playback (`aplay`/`paplay` fallback) watched off `voice_calls`. Fixed spoken cues (ack/bye/busy/lost/err) pre-synthesized once per boot so the acknowledgement never waits on live TTS. <!-- HISTORY -->
- `wake.ts` — token-CLASS fuzzy matching, never exact strings (STT mangles greetings): wake = salam-class token ∧ hamza-class token in one utterance; hamza edit-distance bound ≤1 (at ≤2 the common word "hava" false-wakes — measured in the R3.2 unit battery). Dismiss = the CEO's listed verbs, stem-fuzzy.
- Supervision: `scripts/systemd/dxb-jarvis.service` + `dxb-scheduler.service` user units + `install.sh`; ExecStart sources `.env`/`.env.local`/`.env.daemon` in-shell because systemd `EnvironmentFile` cannot read quoted dotenv syntax. `pnpm jarvis` repo entry.
- Trust model: runs on the CEO's own terminal, reads the CEO's own microphone, talks to localhost services only — physical presence IS the authentication (same trust class as the laptop session itself). V6 unchanged: voice may still never approve.

**R3.2 scope also closes two measured line defects:**
1. **Voice fast lane (routing data):** spoken-call classify/answer rode the L1 `orchestration` row — measured 104s answer leg (live call f05cf286). New `routing_rules` rows `voice.classify` + `voice.answer` (L4, subscription mode) via migration `20260717090000` + `routing-seed.json` parity (KERN-02: routing stays pure data; both callers fall back to `orchestration` on a pre-migration DB). Answer leg re-measured 39.2s same-day on a thermally degraded X230 (honest floor below). SDK lesson NOT-1 applied to the answer query: `maxTurns: 4` — `maxTurns: 1` produced `error_max_turns` on the fast tier (probe call 30ddba44).
2. **Utterance-language law:** §27 registered adaptation (UI locale never forced into STT; TTS voice follows the ANSWER language).

**Honest hardware floor (measured X230, 2026-07-17):** wake reaction ≈ speech chunk + STT ≈ 3-6s; question→spoken-answer ≈ 30-60s nominal. Under the machine's measured thermal-critical state (cores 96-100°C against an 87°C threshold) raw small-model STT degraded 17.8s → 50-80s; a SECOND resident whisper model amplifies the thrash, so the wake pass defaults to the SAME model intake uses (one working set; a GPU/VPS host may point `DXB_WAKE_STT_MODEL` at a lighter model). The <1s wake upgrade lane remains openWakeWord custom-model training on the VPS/GPU path.

**Verify:** `tests/r32` 36/36 (wake/dismiss/lang/WAV-header/ambient-gate contracts; count re-measured 2026-07-17 22:18 — the earlier "31" here and "35" in the roadmap row were stale mid-growth claims, recorded as a D8 lesson; +3 U15 cases 2026-07-25 → 39) · `systemctl --user is-active dxb-jarvis.service dxb-scheduler.service` → active · production probe `scripts/dev/voice-latency-probe.mjs` → `ended` row with per-leg timings · ⚠ spoken wake→answer at the CEO's ear = human gate (real mic + speakers), machine-unverifiable.

**Registered adaptations — U15 remediation (2026-07-25, authority: [[00-NOTE-R32-VOICE-REMEDIATION-PLAN]] blocks 1-7, executed):**
1. **Wake TR-lock (D1):** the wake/rough STT pass sends `language=tr` + `vad_filter` + hotwords ("Hamza Selamaleykum") — the wake contract phrase IS Turkish; §27 governs question language and is untouched (intake stays auto-detect). `wakeSttOpts()` in `jarvis-daemon.ts`; regression in `tests/r32`.
2. **{tr,en} script whitelist (D2):** `lang.ts unsupportedScript()` — a transcript dominated by non-Latin letters (measured live: Korean, call b3858c42) fails intake as `language_unsupported`; the daemon answers with the spoken clarify cue; it can never become an intent or task.
3. **Stale-line takeover (D3, §10 amendment):** `listening`/`transcribing` rows older than 60s are corpses from a crashed intake — intake fails them honestly (`stale_takeover` timeline reason) BEFORE the busy check, so the CEO's first press is never rejected by a dead process. Live calls and the §10 busy law itself are untouched.
4. **Boot fail-soft (D3 crash root):** the 2026-07-18 crash-loop (708 systemd restarts) was `prepareCues` dying on a stopped Speaches container; cue synthesis now waits/retries every 30s instead of exiting — Speaches down is a WAIT state, not a crash.
5. **Progress + clarify cues (D4/D6):** cue set is versioned (`CUE_VERSION` in the filename — a text change can never play a stale WAV); new `wait` cue speaks when STT exceeds ~15s (`DXB_JARVIS_STT_CUE_MS`), new `prep` cue once while the answer drain runs past ~20s; the clarify text is the U15 block-4 sentence ("Anlayamadım Muhittin Bey, tekrar buyurur musunuz?").
6. **Ladder low-confidence bump (D5, ORCH-03 amendment):** rung 1 for a fail whose recorded reason is `low-confidence` escalates the tier (`low-confidence-bump`) instead of retrying the same tier — the same worker at the same tier reproduces the same confidence (measured 2026-07-17: 0.42 ×5 → blocked). Plain execution failures keep the LOCKED retry-same-tier rung; fail-count arithmetic (T-05-13/14) untouched. `escalate.ts` + `tests/phase5/ladder.test.ts`.
7. **Phantom lookup (D7):** measured closed — no code path in `packages/voice` reads tasks by id (the d1bd0c59 emitter was the retired classify-to-director hop).
⚠ **Block 8 (joint CEO ear test) remains the OPEN human gate** — only the CEO's ear closes D1/D3 end-to-end.

**Registered adaptations — U15 ROUND 2 (2026-07-25, ticket 20260725-u15-voice-round2; authority: CEO live block-8 verdict in chat ~13:26 — new defect classes D9-D13, measured root causes in the ticket):**
1. **Hard-off + mute state (D9):** new single-row table `voice_daemon_state` (`listening`|`muted`) with audited door `control_voice_daemon_set_state` (migration 20260725005000). MUTED = the daemon ignores the microphone entirely (zero STT cost) until reopened; state is set by (a) spoken hard-off ("kendini kapat / tamamen kapan / mikrofonu kapat" — `matchHardOff`, works in BOTH modes), (b) the CEO typing a mute command in chat, (c) the panel toggle on /chat. Reopen = chat "aç"-class command or the panel toggle only (speech cannot unmute a muted mic by definition). Dismissal semantics contract: dismiss → sleeping (wake phrase re-opens); hard-off → muted (only chat/panel re-opens). DISMISS_STEMS grew the CEO's actual words (kapat/sus/yeter/kes; short stems exact-match only — fuzzy would swallow "su"/"ses"). Seed state after this migration = **muted** (standing CEO order).
2. **Dismiss second net (D9):** if the rough pass misses a dismissal but intake's full transcript matches it, the daemon ends the parked call honestly (`dismiss_via_intake`/`hard_off_via_intake` timeline reason), closes/mutes, and speaks the bye/off cue — the LLM must never answer a goodbye while the session silently stays open (the measured "tamam kapanıyorum ama devam ediyor" defect).
3. **Half-duplex law (D10):** the daemon's own speaker output can never re-enter the pipeline — every playback goes through one `speak()` seam; segments captured during playback or within the echo tail (`DXB_JARVIS_ECHO_TAIL_MS`, default 1500ms) are dropped pre-STT (`shouldDropSegment`), and the segment queue ALWAYS coalesces (a room-chatter backlog can never replay as questions).
4. **Runaway-active fixes (D11):** idle timeout runs on the wall clock (10s timer), `lastActivity` moves ONLY on real interactions (wake/dismiss/re-greet/successful intake/answer) — ambient segments no longer keep the session alive; active mode gained its own STT spacing (`DXB_ACTIVE_STT_GAP_MS`, default 3000ms).
5. **One-conversation law (D12):** chat, dictation and JARVIS are ONE Hamza. `chat_messages.source` ('chat'|'voice'); Hamza-answered voice calls mirror both turns onto the board (terminal rows — chat.drain never re-answers them); the voice answer prompt carries the recent board history; chat.drain executes mute/unmute commands deterministically (`matchMute`/`matchUnmute`, no LLM call) and confirms in Turkish. Director-picked calls do NOT mirror (the board's role model is ceo|hamza).
6. **Session threads (D13):** one wake session = one conversation — `voice_calls.session_id` (uuid, minted at WAKE, carried by every intake in the session; the ONE write door learned the field); /chat Recent list groups calls by session (thread row: first topic + exchange count + summed duration; purge removes the whole thread). Threading costs zero extra tokens: transcripts and topics already exist for answering.
7. **Panel surface:** /chat voice section summary row shows the live mic state pill + toggle (`/api/voice/daemon` → the audited door); board turns that arrived by voice carry a mic marker.
**Verify:** tests/r32 58/58 (matchers incl. D9/D10 cases) · tests/u15r2 5/5 (door audit, deterministic chat mute/unmute, mirror+session on a live-DB rolled-back transaction) · daemon boot log "STATE: MUTED (chat/panel reopens)" · ⚠ CEO ear/eye re-test remains the human gate (block 8bis).

## 24ter. HAMZA'S TWO LEGS — one conversation, two behaviours (CEO directive 2026-07-25, built 2026-07-26)

CEO, verbatim: *"2 ayak var: 1- para kazanma planları projeleri konusu konuşulması 2- gündelik rapor özetler şirket nasıl ilerliyor sohbeti. ikisi de Hamza jarvis ama farklı beyinler olmalı sanırım."*

**Both legs are L1.** §4d (MODEL_ROUTING_SPEC) is explicit — anything the CEO reads is produced by Opus 5 — so the CEO's instinct that they need "different brains" resolves as different BEHAVIOUR on the same brain, not a quality split. Splitting them onto different models would have put the daily report, which the CEO reads every morning, below the ceiling.

| Leg | Class | Effort | What it is handed | What it does |
|---|---|---|---|---|
| **Strategy** — money, plans, projects, decisions | `chat.strategy` | `max` | persona + memory + conversation | Thinks WITH the CEO. Takes a position, names the trade-off, says what it would do and why. A decision he can act on beats a balanced survey he cannot. |
| **Brief** — how is the company doing | `chat.brief` | `medium` | the above **plus a live snapshot** | Reports MEASURED numbers only. |

**Routing is one-directional (CEO safety rule):** anything smelling of money or planning goes UP, never down. `classifyLeg()` therefore defaults to **strategy** and routes to brief only on an explicit report/status marker, in both languages, because the CEO switches mid-sentence. Misrouting a status question to strategy costs tokens; misrouting a money decision to the report leg costs a decision.

**The brief leg may not remember figures — it must be given them.** `buildBriefSnapshot()` reads `v_exec_overview`, the revenue ledger, the opportunity count and open alerts live, renders them in the CEO's language, and the prompt states that these are the only numbers permitted. A query that fails drops its line rather than inviting an estimate: a brief with one missing figure is honest, a brief with an invented one is a RULE #0-A violation by Hamza himself.

**Standing framing rule, carried in the prompt:** empty tables are NOT a defect. The CEO deliberately has not started the money leg — the factory is being built first — and he has corrected this framing twice in chat. Presenting zero revenue or zero running work as a failure is the error; the emptiness is not.

**Fallback chain** (a deployment that has not shipped the new rows must keep answering): leg row → `chat.answer` → `voice.answer` → `orchestration`. Every rung is L1 after U21, so a fallback can never quietly downgrade the CEO's conversation.

**Live enforcement:** `packages/orchestrator/src/chat-legs.ts` + `chat-drain.ts`; rows from `db/migrations/20260726003000_chat_legs.sql`; proof `tests/c9/chat-legs.test.ts` (13 cases).

## 24quater. CONVERSATIONS ON THE BOARD (W1.5, built 2026-07-26)

The CEO named this himself: chat had **no "new chat" concept**. Measured: `chat_messages` had no session column, the board was one flat 200-row list, and Hamza's context window was the newest 20 messages *whatever they were about* — so a question about video production carried the tail of a conversation about the budget.

The voice lane had already solved it (U15 D13, `voice_calls.session_id`). This gives the written lane the same shape, deliberately, because chat and voice are ONE conversation (U15 D12).

- **`chat_sessions`** — id, title, created_at, last_message_at. `chat_messages.session_id` joins it, indexed on `(session_id, created_at)`.
- **Titles are the CEO's own opening line**, first line, trimmed to 60 characters. Not model-generated: a title is navigation, and paying for a model call to name a thread he is about to read anyway is spend with no decision behind it. The system authors **no** title at all — an untitled thread falls back to a localised label, because DB text is an i18n surface and an English literal would render on the Turkish board.
- **`fn_chat_session_for_new_message(message, new, idle_hours)`** decides the thread server-side: `new=true` always opens one; otherwise the most recent thread continues **unless it has been quiet for more than 12 hours**, because a message the next morning is a new conversation in every sense that matters to the person having it. A client that forgets to send a session can never orphan a message.
- **The context window is scoped to the thread** — in chat AND in voice. This is the half that actually protects answer quality; the navigation strip is only how the CEO steers it.
- **The voice mirror joins a real conversation.** Before this, every mirrored spoken turn landed on the board with no thread: visible in no conversation, scoped to nothing, a permanent orphan. It now resolves through the same function the written lane uses, so speaking and typing genuinely continue each other.
- **History is not discarded:** the existing board was adopted into one legacy thread, timestamped from the rows themselves so it sorts where the conversation actually happened.

**Two defects the RULE #0 pass caught in the same turn, both fixed before commit:** `chat_sessions` shipped without RLS or grants, so the dashboard could not see a single row and the board rendered empty (a new table is invisible by default here — it must be given the seat `chat_messages` already has); and the adopted legacy thread carried the literal English title "Earlier conversation", which rendered on the Turkish board.

**Live enforcement:** migrations `20260726004000` / `004100` / `004200`; `packages/orchestrator/src/chat-drain.ts`, `packages/voice/src/answer.ts`, `apps/dashboard/src/components/chat/chat-threads.tsx`; proof `tests/c9/chat-sessions.test.ts` (6 cases, including the cross-thread leak test).

### 24quater-bis. THE REPAIR (CEO-reported live failure, 2026-07-26 05:40 — U27)

W1.5 shipped with the board unable to accept a single message. The CEO found it, not a gate: *"yeni chat 'yeni konuşma' basıyorum çalışmıyor"*, then *"yeni konuşma segmesi yalancı"*. Measured evidence: three `chat_sessions` rows created 03:50 titled "selam"/"selam"/"selmal" with **zero messages between them**, and a live POST answering `500 permission denied for table chat_messages`. Four faults, each fixed at its own level:

1. **The write was closed.** The 2026-07-19 board migration granted INSERT **per column** (`role, content, mode`); W1.5 added `session_id` to the payload and never widened it. RLS was innocent — the table grant was the wall, and it is invisible in a table-level reading of the grants (`information_schema.role_table_grants` shows no INSERT row for a column-only grant at all).
2. **The write was two statements** — mint the thread, then insert the message — so a failed second half left the first half standing. That is the origin of the three empty "selam" threads: each attempt lost his words and kept a ghost. Fixed as SHAPE, not as grant: **`fn_chat_post_message`** (migration `20260726006000`) performs both writes in ONE statement, is the ONLY door (direct table INSERT revoked from `authenticated`, dead policy dropped), and therefore also makes the next column added to this table incapable of breaking the CEO's chat.
3. **The board never re-mounted.** `ChatBoard` holds its messages in client state and switching conversation is a soft navigation, so React kept the same instance — "new conversation" opened with the previous thread still on screen. The board is now keyed by conversation. The Broadcast handler is likewise scoped: a turn belonging to another thread (including a mirrored spoken one) is not displayed here.
4. **The failure was silent.** `if (res.ok)` had no else — a 500 produced no message, no error, nothing. A failure the user cannot see is worse than the failure itself; the send now prints its reason and keeps his text in the box.

**And the reason the repair was not enough on its own:** the resident scheduler had been running since 2026-07-25 17:16 while W1.5 shipped at 03:56 on the 26th, so the process was still executing the **pre-session drain from memory** — Hamza's answers were being written with no conversation. Restarting `dxb-scheduler` (and `dxb-jarvis`, equally stale) is what made the lane whole; the invariant now lives in the schema (`session_id NOT NULL`, migration `20260726008000`) because a test cannot stop a stale process from writing. **Standing rule this adds: shipping runtime code is not shipping — the resident units must be restarted in the same turn, and the restart is part of the evidence.**

**The list became a list** (same CEO turn: *"eski konuşmalar nerede... design'ı da düzeltin"*). The chip wall above the board is gone; conversations have their own column with their own scroll, each row carrying the thread's name, its size and when it last moved, and the board keeps the remaining height so the composer is on screen instead of below the fold. An untitled thread now borrows the CEO's own opening line through `v_chat_threads` (migration `20260726007000`) rather than reading "Untitled" — his hundred-message history is named *"selam hamza nasılsın"*, which is what it actually was.

### 24quater-ter. The call line SHARES the column, never seizes it (CEO-reported, 2026-07-26 ~12:00 — U31)

The CEO opened the Ses Hattı section and voice and chat interleaved: the conversation grid was crushed to 42px, the thread list disappeared under the voice bar, and the board's composer spilled across the panel. Root cause, measured in the DOM: the chat page owns exactly the shell height (§24quater-bis), and the open call line inserted ~900px of `shrink-0` content into that fixed column — the only flexible row (the conversation grid) absorbed all the negative space. The 45vh first fix looked green at 1366/1920 and was refuted by the 1280×800 windowed leg (the CEO's real window class).

**The law:** on a fixed-height page, a disclosure section may only open as a BOUNDED region that scrolls inside itself. The bound is the REMAINDER of the viewport after the fixed parts (`clamp(12rem, 100vh − 38rem, 34rem)` on the content, never a bare viewport fraction), and the conversation grid carries a min-height floor so any future sibling growth pushes the page tall instead of crushing the grid. Mechanical gate: `tests/e2e/authed.spec.ts` "chat voice line opens as its own region" — three viewports including 1280×800, asserting the thread column's height, zero rect overlap between the voice bar/panel and the thread list/composer, and zero horizontal or vertical spill. A design battery for a fixed-height surface MUST include the open state of every disclosure on it — the closed state proves nothing about the open one.

## 24quinquies. HAMZA OPENS THE CONVERSATION — the proactive morning briefing (W2.6, built 2026-07-27)

**Measured before writing a line (2026-07-27):** `CEO_OPERATING_MANUAL.md:21` promises a morning briefing *"07:00 itibarıyla hazır"*, and it was true only in the passive sense — `/intelligence` renders `v_morning_briefing`, a live view, so the page is "ready" at every hour of the day. `packages/outbox-executor/src/scheduler.ts` carried 14 scheduled jobs and **none of them wrote to `chat_messages`**: every row on the CEO's board since 2026-07-19 answered something he had typed first. Hamza had never opened a conversation in this company's life. That is the gap this section closes: the OS's own words to its CEO, unprompted.

**Shape: a thread Hamza opens, not a bulletin.** The briefing is delivered as a real conversation — a `chat_sessions` row with Hamza's message inside it — so the CEO can answer it where he reads it. Because `fn_chat_session_for_new_message` continues the most recent thread within 12 hours (§24quater), his reply lands in the briefing's own thread and the brief leg's context window (§24ter) contains the figures he is asking about. A notification would have been cheaper and would have ended the conversation before it started.

**Content comes from ONE view, and no model writes it.** Phase 9 LOCKED this: *"brifing tek SQL görünümden; ajan brifing yazmaz"* (`09-02-PLAN.md:14`). `v_ceo_briefing` composes the single row of facts — overnight work from the same 19:00-Europe/Berlin window `v_morning_briefing` uses, what the machine opened by itself (`generated_work`), what waits on the CEO (approvals, open alerts and how many of them are critical), 24h and month-to-date cost against the cap, and the revenue line with its capital ceiling. **What broke is named, not counted** — the failed line carries the task's headline AND its owning department in the CEO's language, because two tasks can share a headline (a reworded retry beside the attempt it replaced) and the same name under "finished" and "failed" reads like a contradiction until you can see whose desk each one was on. `renderBriefing()` formats that row into sentences in both languages and **may not introduce a number**; a fact the view could not measure drops its line rather than inviting an estimate (RULE #0-A applied to Hamza himself, §24ter precedent). Three consequences follow, all deliberate: the briefing costs zero tokens, it cannot hallucinate, and **a dead subscription lane cannot silence the CEO's morning** — the one message he is promised every day does not depend on a model being reachable at 07:00. <!-- HISTORY -->

**Both language legs are stored, because a system-authored message is an i18n surface.** `chat_messages.content_tr` and `chat_sessions.title_tr` join the house pattern (`label`/`label_tr`, `name_tr`, `title_tr`); the board renders the leg its locale asks for and the English board never borrows the Turkish one. This is the direct application of the U26 finding: the system authors **no** single-language text on the CEO's board — before this the rule was satisfied by authoring nothing at all, and now that the OS has something to say it says it twice. The CEO's own words and Hamza's conversational answers keep one leg: they are the language they were spoken in, not translations.

**The CEO owns the switch and the ceiling** (U34 idiom): `briefing.proactive.enabled` (default true) and `briefing.proactive.max_per_day` (default 1). A daemon that speaks to him every morning must have its off button in his hand, and the cap bounds the writer no matter how often the job is fired — a restart storm, a misconfigured cron or a manual trigger cannot produce a second briefing. Both refusals are written to `audit_log` (`chat.briefing.refused` with its reason), so **"switched off" and "broken" never look the same afterwards**.

**Exactly-once is structural, not hopeful:** `ceo_briefings` carries `UNIQUE (briefing_date, slot)` and the door catches the unique violation as `ALREADY_DELIVERED`. The date is the CEO's own day (Europe/Berlin), not the server's UTC one.

**Framing law, carried in the renderer:** zero revenue, zero opportunities and zero running work are the EXPECTED state while the factory is being built (factory roadmap §0.1, CEO corrected this framing twice). The briefing states them as facts and never as failures, and the one interpretive line it is allowed — *"the money leg has not been opened yet; this is your decision, not a fault"* — appears only while there is no active objective and no lifetime revenue, so it disappears by itself the day he opens it.

**The briefing faces INWARD.** No email, no share, no external call, no spend. It writes three rows in this database and nothing else.

**Timing:** `0 7 * * *` with `tz: 'Europe/Berlin'` — pg-boss schedules were UTC-only until now, and 07:00 in the operating manual means 07:00 where the CEO is standing.

**Boundary (recorded, not silently dropped):** the SPOKEN briefing — JARVIS greeting him aloud at 07:00 — is NOT part of this row. The voice stack is under repair in wave W4 (STT quality, mixed language, pronunciation) and the wake daemon rests muted by the CEO's own command (U15 D12). When W4 closes, the spoken leg reads this same view and mirrors into this same thread; nothing here has to change for it.

**Live enforcement:** migration `20260727001000_w26_proactive_briefing.sql` (view, door, ledger, settings, both language columns) · `packages/orchestrator/src/morning-briefing.ts` · `packages/outbox-executor/src/scheduler.ts` (`ceo.briefing.morning`) · proof `tests/c9/proactive-briefing.test.ts`.

## 25. Dependencies

Speaches container (measured Up) · voicebox install (measured present) · agents/directors live rows (220 agents in DB) · intents intake (exists) · NOT dependent on R1.2 revenue tables (parallel-safe) · R1.5 hook codification supplies the Islamic-boundary + decision-principles enforcement Hamza answers under.

## 26. Risks

| Risk | Response |
|---|---|
| CPU STT/TTS latency breaks conversational feel | Targets in §20 measured honestly; if >10s, shrink model (whisper small→base) before considering paid path |
| Turkish clone quality poor on some director profiles | Kokoro fallback + mark `degraded`; CEO ear-test gates each identity |
| X230 8GB RAM (voicebox + browser + containers) | Single-browser rule (memory: x230-freeze); heavy TTS can run on VPS Speaches instead |
| Scope creep back into boardroom before revenue | D3 is binding: §3.4 has NO roadmap row; opening one requires a CEO order recorded in INDEX |

## 27. Edge cases

Mixed TR/EN utterance (whisper handles; answer language = utterance language) · silence/noise-only recording (empty-transcript path, no hallucinated text) · director with no voice identity yet (Kokoro fallback + auto-task to clone) · second concurrent call (rejected, line-busy) · very long dictation >2min (chunked STT; answer summarizes, full text in transcript) · CEO closes page mid-answer (call marked ended, transcript preserved).

**Registered adaptation (2026-07-17) — utterance-language law implementation:** the UI locale is NOT a language source. Forcing the dashboard locale into STT made Whisper transcribe Turkish speech as fluent English (measured live, call f05cf286). Law as shipped: STT runs auto-detect; `lang.ts detectLang` decides from the transcript itself (TR chars → TR; else short-stopword vote; the caller's locale is a last-resort tie-break for signal-free one-word utterances only). The TTS voice must carry the ANSWER language: a registered voice identity speaks only when its `locale` matches the answer language (a TR clone reading EN text through TR phonemes was unintelligible on the CEO's live call), otherwise the language-default voice speaks and `degraded=true` stays honest; an EN default voice (`piper-en_US-lessac-medium`) joined the TR default in `speaches.ts`.

## 28. Done definition (this spec)

Spec in INDEX Dalga 6 ✓ · V-rules V1–V10 each traceable to a Talep §5 clause or CEO D-ruling · §5.13 acceptance table covers ALL Talep items with explicit v1/deferred split · boardroom captured at add-later level with zero execution rows (D3) · implementation contract = §24 with verify commands · U4 INDEX note updated to point here.
