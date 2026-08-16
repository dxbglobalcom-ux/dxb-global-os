---
name: dxb-hamza-context
description: Use when changing what Hamza or any employee agent knows at runtime — the two-layer context contract, where the single definition lives, and the traps that have already cost this project a CEO complaint.
---

# What an agent is told, and when

The CEO's complaint, in his words: *"HAMZA DAHA KENDİNİ TANIMIYOR, DAHA ŞİRKETİ, MÜDÜRLERİ NE
NEREDE, BİLGİSİZ BİR CAHİL."* It was not a feeling. It was measured twice, and both causes were
the same disease the construction context has:

- **2026-07-27** — both answer lanes read the *first 60 lines of the persona file*. A persona
  opens with a 33-row dossier table, so the identity reaching Hamza was the table, §1 and one
  sentence of §2 — **2 of 13 sections**. His method, decision rules, escalation limits, reporting
  standard and constitutional sections never arrived.
- **2026-07-30** — the two lanes each wrote their own copy of the standing instructions, and the
  copies had already drifted: voice told him *"HE IS TALKING TO YOU, Hamza — never claim to be
  someone else"* and chat did not. Same person, two self-understandings, depending on which door
  the CEO used.

## The contract — two layers, nothing else

**ALWAYS (standing).** Assembled in exactly one place: `packages/voice/src/prompt-core.ts`.

| Block | Rule |
|---|---|
| identity | one line, from `identityLine()`. Hamza's carries the anti-impersonation clause on every lane |
| persona | the authored body, **whole**, from `loadPersonaBody()` — never a line-count head, never the dossier |
| memory | only what matched this turn |
| language of the answer | Turkish or English, as the CEO used |
| the CEO language law | `ceoLanguageLaw()` — he is the owner, not a developer |
| honesty | `honestyLine()` — no invented number, no recalled figure, no polite guess at a question he did not understand |
| the approval gate | `approvalGateLine()` — an outward act stops at the CEO, said out loud |

**PER TURN.** The conversation so far, and any figure the agent needs — **measured in this turn
and handed to him**. The morning briefing is the reference implementation: it is given a live
snapshot and forbidden to state any other number, so it costs nothing and cannot hallucinate.

Anything that is neither standing nor measured-this-turn is not context. It is noise, and it is
what makes an agent slow, expensive and vague.

## Rules that hold when you change any of this

1. **One definition.** If a sentence must reach both lanes, it goes in `prompt-core.ts` and both
   import it. A second copy is a defect even when the two copies are identical today — they will
   not be identical next month.
2. **A lane difference is a parameter, never a second copy.** Only the genuinely lane-specific
   parts stay local: the spoken-answer shape and the transcript header for voice; the
   conversation/plan-mode framing for chat.
3. **A degraded persona is empty, never a placeholder.** A missing or unwritten persona yields
   nothing — shipping a dossier table as an identity is the exact defect this replaced.
4. **A number an agent remembers is a number he can invent.** Hand it to him measured, or let him
   say he cannot measure it.
5. **Restart the residents.** The chat and voice lanes only load new code when
   `dxb-scheduler` and `dxb-jarvis` are restarted. The restart is part of the evidence.
6. **Pin it.** `tests/b21/agent-context.test.ts` and `tests/r31/persona-delivery.test.ts` fail if
   the slug is declared twice, if the lanes drift apart, if the language law stops reaching him,
   or if the persona is truncated on the way in.

## Boundaries — what this contract does NOT yet give him

Stated, not hidden. Each has a board row:

- **He does not know which page the CEO is standing on** (row C26) — the chat receives the message
  and nothing else.
- **He cannot act, only answer** (rows C60, B15, B08) — the chat lane runs with no tools.
- **The language law reaches these two lanes only.** Dashboard strings, alert text, task headlines
  and the briefing still need their own check (row C37).
