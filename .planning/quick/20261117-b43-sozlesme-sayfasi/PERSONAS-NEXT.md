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
