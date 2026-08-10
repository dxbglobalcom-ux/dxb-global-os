---
name: dxb-rival-intel
description: Use when studying a competitor system, video, reel, repository or PDF the CEO supplies — the evidence standard, the source-quality floor, the temporal-analysis requirement, and the selective-rewrite policy that replaced the rejected first analysis.
---

# Reading a rival system

**Controlling document: `docs/ceo-directives/2026-07-reanalysis/00_READ_FIRST_MASTER_DIRECTIVE.md`
(CEO, 2026-07-29). It supersedes the previous competitor-analysis conclusions and any plan built
on them.** Read it in full before touching this work.

The CEO's judgement of the first attempt, in his words: the analysis was made from low-quality
downloads and sparse frames, it called working systems decorative without evidence, and it
criticised systems he knows personally and reports as live and earning. *"Sen karayı çekiyorsun,
bakıyorsun ona. İzlemek farklı."*

## Before the media is opened (ledger law 11, CEO 2026-08-10)

*"Projeyi tam anlamıyla anlamaları lazım … ne yapıyoruz amacımız ne bu Holding nedir öğrendikten
sonra videoyu o gözle işlemeli. Hikaye roman kısımları çok fazla yazılmamalı."*

1. Read `.claude/CLAUDE.md`, `.planning/STATE.md` and board row **B22** first. You are reading the
   source **for a holding that is meant to run itself with one human in it**, and for the gaps that
   holding has today — measure them before you watch, not after.
2. The report opens with **`WHY IT MATTERS TO THIS HOLDING`**: the measured DXB gaps this source is
   read against. A report that would fit any company has failed.
3. **Write short.** Tables and measurements, not narrative. Every paragraph carries a number, a
   quotation from the source, or a named project.

## Evidence labels — every substantive statement carries one

| Label | Meaning |
|---|---|
| **V** | Directly visible in the new high-quality video or in sequential visual evidence |
| **T** | Transcript-supported, with a timestamp |
| **C** | CEO-confirmed from first-hand viewing or use |
| **R** | Repository or backend verified — code, logs, database, tests, a reproducible run |
| **U** | Unverified. May be stated as a hypothesis; may never be written as fact |

**CEO-confirmed evidence is valid project evidence** and outranks a frame-by-frame reading of a
recording. It must never be relabelled as independent technical verification.

## Prohibited

- calling a feature fake, decorative, superficial or "just UI" without evidence
- inferring backend architecture from a screenshot
- using our own weakness to diminish someone else's achievement
- praising DXB defensively
- turning uncertainty into criticism
- repeating an earlier conclusion because it already exists in a file

Where evidence is incomplete, write **Unverified** and name exactly what would be needed to
verify it.

## Source quality — the floor

1. Download the highest genuine source quality available. Prefer 1080p; the minimum is 720p
   **where the source provides it**.
2. Never present an upscale as genuine HD.
3. Record for every source: address, file name, resolution, codec, frame rate, duration, whether
   it has audio, and how it was obtained.
4. If the source itself is below 720p, record that limit and do not overstate visual conclusions.

## Watch the video — do not photograph it

A sparse-frame review is not accepted. The temporal behaviour is the subject: how the assistant
moves and repositions itself when screens change, how it responds while speaking, how nodes and
connections animate, how light or data travels along a link, page transitions, live numbers
changing, audio quality and rhythm, and whether the product feels like a living operating system
rather than static cards.

State exactly how the temporal analysis was performed. **Never claim to have watched a video when
only frames were inspected.**

Transcripts and frames that are already correct may be reused — validate their timing against the
new file, correct meaning-changing errors, regenerate important frames from the new download.

## Selective rewrite, not a blind restart

Take a checkpoint first. Then classify every existing artefact as **KEEP** · **REUSE WITH
CORRECTION** · **REPLACE** · **ARCHIVE**, and correct files in place where they can be corrected.
Preserve valid source metadata, transcripts and accurate observations; rewrite unsupported
conclusions; add evidence labels; keep a change log per file.

Each revised file answers: what is visible over time · what the transcript states · what the CEO
confirms · what is technically verified · what remains unverified · what that system demonstrably
does better than DXB today · what capability, design principle or architecture DXB should adopt ·
and what should **not** be copied, with the reason.

## Mechanical discipline

Work is claimed in a ledger **before** it is done, one commit per source, so a crashed session
redoes exactly one source and never the finished ones. `pnpm test tests/c42` fails the battery if
a row claims a report that does not exist, if a report is missing a required section, or if a
reel report's record is a summary instead of a timestamped reading.

## Boundary

Reading is not building. The programme that turns findings into work lives on the open work board
(row **C42**), and each project lands in the spec that already owns its contract.
