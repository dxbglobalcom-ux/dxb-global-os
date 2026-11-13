# Film 1, second round — the writer's report (2026-11-13)

One Fable 5.2 high writer, 10:25 → 11:58 (93 minutes; round one's writer took 56). A draft for his eye.
Job folder: `/home/dxb/Videos/dxb-motion/film-1-whatsapp-r2/`. Round one's folder untouched (94 files, hashes equal).

## What was made, against his four notes

| His note | What was done | The measure |
|---|---|---|
| 1. The whole phone in frame, both formats | The phone lands at 78 % of the frame's height in 16:9 and 66 % in 9:16 and stays inside through every camera move | `tools/check-whole-phone.py` over all 951 frames: round one FAIL in both formats (280 and 290 frames), round two PASS |
| 2. The bubbles' lift visible | Each bubble leaves the glass toward the viewer until it overhangs the phone's edge; the camera and the phone's turn slide the layers | `out/sheets/<format>/event-bubbles-lift.jpg`, `event-answer-lifts.jpg`; the lead looked at the 9:16 sheet: the lift is plain |
| 3. A little longer, so the texts can be read | Every text held to three words a second; the 25-word encryption notice alone needs 8.33 s | `tools/check-reading.mjs`: round one FAIL on six of seven texts, round two PASS. **The film is 31.7 s — twice round one, not "a little".** At four words a second about 26.5 s; the notice is the lever. |
| 4. The transformation left as it is | Shapes, timing, easing and code are round one's; only where the phone lands changed (it had to, for note 1) | `tools/check-transformation.py`: with round one's landing line put back, 12 stills per format are pixel-equal to round one |

Engine: canvas 2D for the transformation and the end card (round one's code); three.js 0.187.0 in the page for the
phone in space (2.2–25.8 s). Not Blender: the join into and out of the flat drawing must be the same pixels, and the
screen carries live transitions. The price: metal and glass are simple, not path-traced — it reads as clean 3D motion
graphics, not as photographed.

`mg verify`: OK on both films, 14/14 cues on their events, −32.0 LUFS (no target stated).

## What is weak, by the writer's own eye

- Twice round one's length; "Just between you." stands for almost eleven seconds while the notice is read.
- Where a piece lifts, the glass under it is a flat colour — the doodle pattern stops there.
- On the dark group screen the bubbles' shadows barely show; depth is carried by size, overhang and parallax.
- The notice's shadow sits detached below it; in 16:9 the hovering notice covers the chat's header for 8 s.
- The phone is smaller than in round one — the price of note 1.
- ⚠ UNVERIFIED — requires human-eye and human-ear confirmation: the sound, and whether the film reads as filmed.

## Where the skill or the command got in the way (not built — on his word)

1. `mg motion-read`: the default model and the next one gave no answer within the fixed 600 s for a 31.7 s film;
   `gemini-3.6-flash` answered in under a minute. The skill covers a spent quota, not a model that is too slow.
2. Nothing checks the page's contract (same second, same pixels). With the browser's own antialiasing two renders of
   one page differed in 409 of 951 frames; the writer drew at twice the size instead. The skill says nothing about
   WebGL antialiasing.
3. SKILL step 5 says "`mg render` at review size"; `mg render` has no such option.
4. No measure in the command for whole-subject-in-frame, reading time, never-still or a join holding; the writer
   wrote five checks in the job's `tools/`.
5. Engine guidance: nothing covers an object in space that must join a flat drawing exactly.
6. A copied job carries the old `board/board.html` and an empty `page/lib/`.
7. Event sheets: 15 per format, large; to look at every transition the writer tiled its own.
8. The cost gate blocks a hand's background runs and waits over four minutes.
