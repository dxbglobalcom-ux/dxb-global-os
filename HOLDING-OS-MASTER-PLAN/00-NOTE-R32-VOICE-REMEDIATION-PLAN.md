# 00-NOTE — R3.2 Voice-Line Defect Ledger & Deferred Remediation Plan

> **Status update 2026-07-25 (ticket 20260725-u15-voice-remediation): machine blocks 1-7 EXECUTED — D1 wake TR-lock+hotwords (`wakeSttOpts`, regression in tests/r32), D2 {tr,en} script gate (`unsupportedScript` → `language_unsupported` → spoken clarify), D3 crash root measured+fixed (708-restart loop = prepareCues dying on stopped Speaches; boot now fail-soft) + stale-line takeover (60s corpse sweep before the busy check, red→green tests/r31), D4 progress cues (STT >15s `wait` cue + answer `prep` cue; cue cache versioned, block-4 clarify text live), D5 ladder low-confidence-bump (registered adaptation, red→green tests/phase5), D6 clarify-not-task (script gate + round-4 voice-intent dispatch guard), D7 measured closed (no task-id lookup in packages/voice; emitter was the retired classify hop). Daemon ENABLED + boot-proven ("up — wake phrase armed", single process). Registered adaptations: VOICE_INTERACTION_SPEC §24bis "U15 remediation" block. ⚠ OPEN: block 8 joint CEO ear test (D1/D3 human gate) — the ONLY remaining leg.**
>
> Original registration below, kept verbatim:
>
> **Status: OPEN DEBT — CEO-deferred, MUST be solved before project end.**
> Registered: 2026-07-17 ~22:10, in-session CEO ruling (verbatim intent): *"the voice matter and
> the small design work can wait now — but write this problem somewhere visible; at the end we
> must solve it; future sessions must see this plan as a note."*
> Ledger anchors: INDEX **U15** (this note) + **U16** (design deferral) · roadmap row **R3.2 = ◐** ·
> [[VOICE_INTERACTION_SPEC]] §24bis/§27.
> **Instruction to every future session:** when the CEO says "voice'u bitirelim" (or any session
> reaches the end-game rows E13.x), THIS note is the execution ticket source. Do not re-plan;
> execute the blocks below under systematic-debugging discipline (root cause before fix).

## Why this exists (what happened on 2026-07-17)

The session of 2026-07-17 evening shipped the R3.2 always-on wake daemon and marked the roadmap
row ✓ — while the live line was failing the CEO all day. The CEO spoke "Selamaleykum ya Hamza"
at 19:22 and received NO answer. This note restores the truth and freezes the measured evidence
so the debt cannot be forgotten or minimized.

## Measured defect ledger (all evidence = live DB queries + file reads, session 2026-07-17 ~21:30)

| # | Defect | Evidence |
|---|--------|----------|
| D1 | Wake greeting dead: "Selamaleykum ya Hamza" (19:22) → STT produced EN garbage "May the do you, Muslim Hamza." → no wake, no spoken ack; became intent 72dd7d58 + garbage `ceo` task bf6402f0 (failed) | `intents` 19:22:56; `tasks` 19:23:38 |
| D2 | STT language chaos: one utterance transcribed as KOREAN (뭐요? 무슨 말이야?, 19:07, call b3858c42); TR speech transcribed as fluent EN (14:04–14:08, call f05cf286) | `intents` bcf530c1, 60ffbbd6, 043dccf7 |
| D3 | 8 of 14 calls FAILED: `line_busy` rejections (14:04:22 — the CEO's FIRST attempt; 19:05 ×2) + `empty_transcript` (10fd4cff: listening→transcribing in 9ms, 551ms STT, nothing captured). No spoken error cue on any failure path. **Two eras:** 14:04–16:53 = R3.1 dashboard push-to-talk leg (daemon units born 17:08); 19:05+ = daemon leg. Both broken, separately | `voice_calls.timeline`; `scripts/systemd/` mtimes; journalctl empty pre-17:00 |
| D4 | STT latency on "successful" calls: 80,716 / 150,901 / 226,053 / 444,689 ms — up to 7.4 minutes of silent waiting; no progress cue | `voice_calls.stt_ms` |
| D5 | Escalation ladder = deterministic failure loop: worker answers confidence 0.42 → `retry-same-tier` (L1) ×5 → "BLOCKED after 5 failures — escalation ladder exhausted". 10 tasks failed in one day across ceo/strategy/engineering/platform/project-management; only finance reliably answers | `task_events` 15396–15598 (task 9b663995); `tasks` failed rows |
| D6 | Garbled/meta utterances become TASKS (garbage-in-task-out) instead of a spoken "tekrar eder misiniz?" clarify loop | task bf6402f0 objective |
| D7 | Phantom queue lookup: task d1bd0c59 referenced at 21:20 (obs 7889) exists nowhere — `tasks` 0 rows, no intent carries it | psql lookups |
| D8 | Governance rot (fixed 2026-07-17 same night): wave was uncommitted while R3.2 sat ✓; test-count claims disagreed (spec "31/31", roadmap "35/35", file has 36 `it()` blocks) | git status; corpus diffs; tests/r32 |

Hardware context (measured, honest): X230 cores at 96–100°C vs 87°C threshold; STT degradation
17.8s → 50–80s+ under thermal stress. The incoming 32GB/12-core PC lifts the STT floor from
minutes to seconds and opens the <1s openWakeWord wake lane (§24bis upgrade lane) — but D1, D2,
D3, D5, D6, D7 are software defects that no hardware fixes. Answer brain is cloud Claude
(subscription); voicebox is TTS-only and NOT implicated.

## Deferred remediation blocks (execute in this order when reopened)

1. **Wake TR-lock (D1):** wake-segment STT call passes `language=tr` (the wake contract phrase IS
   Turkish; §27 governs question language, not wake detection — register as §24bis adaptation).
   Add the measured mangling to `tests/r32` as regression.
2. **Question STT language whitelist {tr,en} (D2):** read the Speaches/faster-whisper API surface
   first (measure, never guess); constrain or reject+re-ask when detected language ∉ {tr,en}.
3. **Capture failures (D3):** root-cause both eras from logs (`journalctl --user -u dxb-jarvis`,
   scheduler log, `voice_calls.timeline`); fix line_busy collision (CEO's first press must never
   be rejected — stale-line sweep + takeover rule) and the empty-capture leg; EVERY failure path
   speaks a pre-synthesized cue. Duplicate-press guard per §10 busy law.
4. **Garble gate (D6):** unintelligible transcript → spoken "Anlayamadım Muhittin Bey, tekrar
   buyurur musunuz?" — task creation ONLY on intelligible intent.
5. **Latency cues (D4):** spoken progress cue when STT exceeds ~15s; re-measure with probe.
6. **Ladder fix (D5):** low-confidence rounds must ESCALATE tier (that is the ladder's purpose);
   CEO-source questions ride the director-grade answer path (persona + memory — the R3.1 answer
   half already proves it) instead of bare L1 workers. KERN-02: routing changes = data rows +
   `routing-seed.json` parity + registered adaptation.
7. **Phantom lookup (D7):** trace the d1bd0c59 emitter; null-lookup path must fail loud.
8. **Joint CEO test (human gate):** 5-minute spoken protocol at the real mic — selam → spoken ack ·
   question → spoken answer (legs timed) · "kapanabilirsin" → spoken bye. Only the CEO's ear
   closes D1/D3; machine gates never claim it.

## Companion deferral — U16 (design)

Small design work postponed by the same ruling: the CEO observed symmetry defects he disliked
(surface list to be captured at the joint walkthrough). Open item for the next design slot;
RULE #0 discipline unchanged for any surface that changes meanwhile.
