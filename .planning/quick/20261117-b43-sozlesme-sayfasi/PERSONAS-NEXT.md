# The personas piece — drafted, held as a patch, not applied (2026-11-17)

`personas.patch` (13 files of `personas/media-studio/`, drafted by a Fable 5.2 writing seat at high from the lead's brief) brings the studio personas to the contract page (B43 R1-R42 and his voice note of 2026-11-17). It is NOT in the tree: with it applied three metres that still require the deleted doctrine go red, and the tree must stay green for the other sessions' batteries. `git apply .planning/quick/20261117-b43-sozlesme-sayfasi/personas.patch` restores it (checked: applies clean on the commit after 23f8326e).

## What is still owed before it can be committed
1. The lead reads every changed line and signs (dxb-persona: one responsible author). Not done.
2. The metres that hold the old doctrine, corrected by the builder in their own `records(ruler): …` commit:
   - `tests/personas/persona-ruler.concepts.json`: `four-sampling-steps`, `1080p-ceiling` (gone on his words of 2026-11-16 and 2026-11-17); stale: `engines-own-voice-only`, `local-engine-first-no-flux`, `no-face-drawn-outside-the-engine`; ruler rule 6 (TTS / narration allowed only inside a prohibition) is the cancelled voice ruling.
   - `tests/b43/road-consistency.test.ts`: requires "Flux is not used / plays no part" and "local-engine take" in ten seats, "engine's own voice is the only voice" and "never a TTS / replacement voice" in sound-music, the old enlargement anchor in creative-director (16/16 on HEAD, 5/16 with the patch).
   - Rule 11, the shared law paragraph: `personas/design/design-image-prompt-engineer.md` and `personas/marketing/marketing-short-video-editing-coach.md` carry the old paragraph (md5 578bf86a against the new canon a7d3dfdc); whether they carry the other classes is not read yet.
3. What the page does not settle — left untouched in the patch, to be judged by the lead, and asked of him where his word is needed:
   - "No face is drawn outside the engine (2026-09-13)" / "never a Flux face" (four seats) beside R20, which puts a cast face through the image model in the UGC recipe;
   - the order of the line: the page (R3, R25) puts his eye on the native draft before grade, grain, audio and assembly; the personas show him the graded, cut native draft;
   - storyboard's silent animatic, "no scratch voice (2026-09-04)";
   - character-identity: "the voice never taken from that take (2026-09-04)" against R23's clone of a consenting cast voice;
   - "only when he asks" against R36's "asked at that job"; vfx-post "decides alone whether a shot is enlarged";
   - the body stamps `<!-- v3 · fable-5 · 2026-09-14 -->` and row 31's wording (no model name in a persona, R24).
4. Then: `bash scripts/persona-ruler.sh`, `tests/personas/persona-ruler.test.ts`, `tests/b43/road-consistency.test.ts`, `tests/r31/persona-delivery.test.ts`, the battery; one Sol pass.
5. The sync to the company database (`scripts/sync-personas-to-db.sh`) writes to the company engine: not done from the construction; on his word.

The writing seat's full report is in the lead's transcript of 2026-11-17 (session d0166f73).

## The lead's reading (session 402574d9, 2026-11-17 10:20) — every changed word of the patch read against the page

The 141 changes agree with the page (R4-R6, R19-R23, R28, R35-R36). The lead's own corrections, to be laid on top of the patch before it is applied (none is in the tree yet):

1. Row 31 in the 13 files: "drafted by a Fable 5.2 writing seat" → "drafted by a writing seat" (ruler rule 8 measures the delivered body only, so this is tidiness, not a failure). The body stamps `<!-- v3 · fable-5 · … -->` stay: core §5 keeps `fable-5` as a technical identifier.
2. "No face is drawn outside the engine (2026-09-13)" / "never a Flux face" — 17 places in character-identity, creative-director, film-director, storyboard-previz. Decided by the lead, not asked: the sentence is the session's own condition in the ledger entry of 2026-09-13 (his words that day retire the four presenters only); it rests on the 2026-09-04 sentence he re-scoped on 2026-11-17 as a measured fact about H3 and left to the engineer, and R20 (his registered word of 2026-11-07) already sends a cast face through the image model. It becomes: the four FLUX-drawn presenters stay out of use; whether a face is drawn outside the shooting engine follows how exactly that engine keeps it (R6). Told to him in the report.
3. character-identity:102 "the voice never taken from that take (2026-09-04)" — the same: a session's condition under the cancelled voice ruling; his note of 2026-11-17 leaves the method free and scopes the September finding to H3 UGC. The clause goes; the voice is the Sound / Music seat's (R22, R23).
4. storyboard-previz:54, 80, 104: the animatic stays silent, timed against the line sheet's reading seconds; "no scratch voice (CEO 2026-09-04)" loses the attribution to the cancelled ruling.
5. vfx-post:19 and :87: "only when he asks" / "upscaling only when he asks, 2026-09-04" → asked at that job (R36).
6. sound-music: "one voice source per line" was the writer's own change from "per shot" — checked against the metres before it is kept; the clone's mechanics (reference audio) are the UGC recipe's (R25 step 5) and are scoped so; the "blocked pre-task" consent line is read in its section before it is kept.
7. Asked of him (10:14), unanswered: whether his eye sees the finished native draft (grade, grain, sound, cut — the personas' line) or the raw take before grade (the page's R3 and R25 step 7). Recommendation: the finished draft; then R3 and R25's step order are corrected on the page.

The metres, read: `road-consistency.test.ts` condition 4 and the anchors of sound-music, vfx-post and creative-director hold the old doctrine, and its CONTRA list rings on TTS / cloned voice; the concept contract's five stale concepts; ruler rule 6 (`VOICE_RESIDUE`); rule 11's law canon follows the majority, so the two outside personas need the new paragraph. Rule 8 reads the body only.

Not started: the outside personas' scan, the metres' rewrite with its mutation proof, applying anything to the tree. The 5-hour window stood at 90 % at 10:16; the rest runs after the reset (about 13:00).

## Done (2026-11-17 afternoon)

His two answers: the finished native draft, and all 15 files. The personas are in the tree (`c985ef85`, Sol's fixes after it), the metres in their own commit (`2ea8312b`); `personas.patch` is superseded. Item 2 above (the face rule) and item 3 (the casting take's voice) were told to him before the work; Sol's pass and what was done with each finding: `SOL.md`. Still owed: the sync to the company database, on his word.
