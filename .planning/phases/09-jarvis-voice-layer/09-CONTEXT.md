# Phase 09: JARVIS Voice Layer - Context

**Gathered:** 2026-07-10
**Status:** Ready for planning
**Source:** Master-Plan Ingest Express Path (.planning/master-plan/PHASE-09.md — CEO-approved MASTER-PLAN wins on conflict) + CEO in-session approval 2026-07-10 07:22 ("planı da onaylıyorum 9. fazın; plandan sonra uygulamayı yap başla")

<domain>
## Phase Boundary

The CEO can HEAR the company and SPEAK to it. Voice is a THIN second client of the exact same kernel the dashboard uses — zero extra capability, zero independent state. Delivers: (1) morning voice briefing (overnight work + approval queue + costs, Speaches TTS, Turkish), (2) spoken command → STT → kernel intent path with result identical to typing in the command bar, (3) hard guarantee that voice alone can NEVER execute an outward action (approval inbox double-confirm stays the only gate).

Out of scope: phone-push delivery of briefings (later phase), new kernel capabilities, any voice-specific write path to the DB.
</domain>

<decisions>
## Implementation Decisions (LOCKED — from MASTER-PLAN PHASE-09 + CEO Directive B2)

### Architecture
- Voice = thin second kernel client via the SAME seam the dashboard uses (Phase 5/8 intent intake). jarvis app has NO own DB access beyond that seam.
- Speaches single container serves both `/v1/audio/transcriptions` (faster-whisper small int8) and `/v1/audio/speech` (Kokoro-82M primary, Piper fallback). CPU-only. STACK.md Speaches notes are binding pre-install reading.
- Laptop client = capture+playback ONLY (push-to-talk primary; openWakeWord optional layer); all decisions happen in kernel/VPS path.

### CEO Directive B2 (2026-07-09 — verbatim, binding)
> "JARVIS, dashboard'a EŞİT tam komut kanalıdır — CEO'nun her sesli direktifi kernel intent yoluna iner ve ilgili departmana dağıtılır; asistan istenen işe itiraz etmez, risk ve faydayı bildirir, son karar CEO'nundur; outward aksiyonlar mevcut GATE-01 draft+onay akışından geçer."

### Wake word (CEO B2)
- Runtime-configurable config value — hard-coding FORBIDDEN. Default: **"Selamünaleyküm ya Hamza"**. Config change + restart = new wake word active, old one dead (tested).
- openWakeWord engine; custom TR phrase model is a training deliverable with an explicit fallback chain (pretrained model as interim, recorded visibly — quality never silently dropped).

### Safety
- STT'den gelen onay kelimeleri ("onayla", "approve") SADECE inbox item referansı üretir; karar HÂLÂ dashboard çift-teyit. Negatif test zorunlu: sesli "ödemeyi onayla" → approvals hâlâ pending.

### Briefing
- Content from ONE SQL view (`v_morning_briefing`): overnight task_events summary + pending approvals + 24h cost. Agent "brifing yazmaz" — LLM only rewords view rows into spoken Turkish (model/effort from routing_rules row, not hard-coded).
- 07:00 local (Europe/Berlin) cron in the resident scheduler; audio artifact generated server-side, played by the jarvis client.

### Claude's Discretion
- Audio capture/playback CLI choice on Linux (arecord/sox/paplay class), briefing artifact storage layout, exact test seed shapes, openWakeWord sidecar process wiring.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Spec + governance
- `.planning/master-plan/PHASE-09.md` — binding phase spec (goal gate, LOCKED table, step list, risk/fallback)
- `.planning/REQUIREMENTS.md` — VOICE-01, VOICE-02 (B2 verbatim clause embedded in VOICE-02)
- `.planning/research/STACK.md` — Speaches image + RAM budget + version pins (MANDATORY before install)

### Existing seams to consume (do NOT re-model)
- `packages/kernel` + `packages/orchestrator/src/intent-intake.ts` — intent → classify → dispatch chain (Phase 5/8)
- `apps/dashboard/src/app/api/intent/route.ts` — the dashboard's intent write path (parity reference)
- `packages/outbox-executor/src/scheduler.ts` — resident scheduler (cron surface for briefing job)
- `vps/compose.yaml` — speaches service joins the `voice` profile (declared in Phase 7)
- `tests/phase8/command-bar-intent.test.ts` — E2E intent test pattern to mirror for parity test
</canonical_refs>

<specifics>
## Specific Ideas

- Briefing tone: concise Turkish executive summary — "gece 3 görev bitti, 6 onay bekliyor, dün 2.40 EUR harcandı" class, not prose flood.
- Parity proof: SAME intent text typed vs spoken → equivalent task chains (department, tier, approval class equal; ids differ).
</specifics>

<deferred>
## Deferred Ideas

- Phone/remote briefing delivery (mail/Telegram) — Phase 10/11 outward channels.
- Barge-in / conversational multi-turn voice — not in v1.
- VPS deploy of the voice profile requires a CEO-named SSH authorization (auto-mode classifier blocks prod SSH); structured as an explicitly-gated final step, not silently dropped.
</deferred>

## Recorded adaptations (visible, per master-plan-fidelity rule)

1. **Migration number:** master plan says `0012_briefing_view.sql`; migrations 0012-0017 are taken (Phase 6-8 actuals). Phase 9 uses **0018_briefing_view.sql**. Same class as Phase 8's recorded renumbering.
2. **Speaches install target:** master plan step 1 says VPS deploy; prod SSH is classifier-gated in this autonomous window → build/verify LOCALLY first (laptop docker, same image+pins), VPS deploy is the gated final step with exact commands prepared.

---

*Phase: 09-jarvis-voice-layer*
*Context gathered: 2026-07-10 via Master-Plan Ingest Express Path (Fable inline, governance v5)*
