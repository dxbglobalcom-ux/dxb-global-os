# Study Card: voicebox (RETROACTIVE)

> Retroactive backfill (Pitfall 5): installed on the company laptop before the tracking program existed.

- **Tool:** voicebox (local voice capture/playback client — push-to-talk / hotkey)
- **Slug:** voicebox
- **Category:** Media/content
- **Status:** STUDY
- **Target Phase:** 9 (JARVIS Voice Layer)
- **Owner (dept/tier):** JARVIS voice layer
- **Trigger Type:** service (local client)
- **Source:** installed locally on X230
- **Pinned Version:** installed at runtime; pin at Phase 9
- **Purpose:** Laptop-side JARVIS input/output client: captures spoken commands (push-to-talk / openWakeWord), plays briefings. Decision and state stay in kernel/VPS — voicebox is capture+playback ONLY (MASTER-PLAN PHASE-09 LOCKED: thin client, zero extra capability).
- **Official Docs URL:** local install docs (record at Phase 9 study step)
- **Key API / Usage Notes:** pairs with Speaches on VPS (`/v1/audio/transcriptions` + `/v1/audio/speech`); Whisperflow paid product is NOT used — clone = voicebox + whisper on VPS (locked).
- **Known Pitfalls:** voice alone can never execute gated actions (VOICE gate rule); misheard-command risk → approvals always confirmed on-screen.
- **Install Command:** already installed (laptop) — Phase 9 wires it to Speaches endpoints
- **Legitimacy Verdict:** OK — local tool, in use

## Lifecycle Checklist
- [x] STUDY (backfilled 2026-07-06)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
