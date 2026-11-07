# MERGE — video-use vs OpenMontage (+HyperFrames, +Remotion)

> Kept in the repository 2026-11-07. The bench files the readers cite (`{SCRATCH}/bench/…`, `/tmp/claude-1000/…`) lived in the session scratchpad, which is tmpfs on this machine: they are gone after a reboot. The numbers and paths in the reports remain as measured.

Referee: the lead session, at effort max (claude-ctx `effort: max`, ts 2026-11-07T17:33:26Z).
Inputs: `reader-opus.md` (Opus 5.5, high) and `reader-fable.md` (Fable 5.1, high), written blind.
Referee's own checks: `render.py:507` read; `verify/sub_frame.jpg` looked at; Excel-turbo `sheet8.xml`
grepped for EK16; Remotion `LICENSE.md` fetched from upstream main; `dxb_speaches_local` state and
`/v1/models` HTTP 200.

> **Correction 2026-11-07, after the merge:** the brief told both readers that the links sheet's W104 plan ("write 3 skills ourselves") was this same cutting job, and both repeated it. W104's own row says otherwise. Its three skills are 'editor brain' (2–6 animations a minute planned from the script), 'designer' (prompts from the brand reference folder) and 'animator' (motion rules per scene type): they add animation to a talking head. video-use does not replace them. Every other finding stands.

## Agreed by both readers (no split)

- **OpenMontage does not cut filler words.** It cuts silence only (`tools/video/silence_cutter.py`,
  ffmpeg `silencedetect`). Both ran it on their test clip: pauses were removed and fillers were kept.
  Filler cutting exists in OM only as advice in a skill file.
- **video-use does cut filler words and false starts on word boundaries.** Both ran it end to end.
  Opus: 10.23 s → 5.00 s, −13.9 LUFS. Fable: 19.87 s → 9.24 s, −14.2 LUFS, 14 cues.
- **video-use does not make Shorts from a long video.** It has no highlight picking and no 9:16 crop.
  The lead's earlier claim was wrong.
- **OpenMontage does make Shorts** (`pipeline_defs/clip-factory.yaml`). Its reframe is weak: its own
  skill says there is no first-class auto-reframe, and `face_tracker` is unavailable on this machine.
- **OpenMontage's three filmed-footage pipelines cannot run here today.** These are talking-head,
  clip-factory and podcast-repurpose. `transcriber` is unavailable (no `faster_whisper` in `OM/.venv`),
  and only 39 of 121 tools are available.
- **video-use runs without the paid ElevenLabs key.** Swapping in the local Speaches faster-whisper-small
  plus a 27–50-line converter is enough; its other helpers run unchanged.
- **Remotion is installed inside OpenMontage and actually used.** `remotion-composer` 4.0.484;
  documentary-montage requires it; word-by-word captions are Remotion-only; the 2026-08-19 "$0.00 film"
  was a Remotion render. The ECC copy is documentation only.
- **HyperFrames is a renderer**, not an editor of filmed footage.
- **The overlap is small:** silence cutting, subtitles, grade, loudness, and overlays through the same
  two renderers. On each of these, video-use's cutting is tighter and OM's system is wider.
- **Nothing is installed without his word.** Both list the same yes-points.

## Splits and the referee's call

1. **Install shape.**
   - Opus: graft video-use's helpers into OpenMontage as its filmed-speech edit stage.
   - Fable: install video-use as its own skill and keep OpenMontage as the factory.
   - **Call: Fable's shape.** Install video-use as its own skill, upstream left intact, with two small
     local patches: the STT converter and the Turkish uppercase fix (split 2).
   - Reason: grafting forks MIT code into an AGPL tree and loses upstream fixes. Also, OM cannot run its
     footage pipelines at all until faster-whisper is installed. Grafting is reconsidered only if the
     bake-off shows the Media Studio needs one board for both.
   - This is not double work, because the two do different jobs on the same renderers.
2. **Turkish subtitle defect.**
   - Only Opus found it: `render.py:507` `text.upper()` prints "BÜTÜN IŞINI" instead of "BÜTÜN İŞİNİ".
   - **Call: real.** The referee read the line and looked at the frame. A one-line locale-aware fix is
     required before any Turkish delivery.
3. **Are hesitation sounds kept by local Whisper?**
   - Opus: not tested, because Piper cannot utter "ııı".
   - Fable: faster-whisper-small kept "Iı" and "ı" when the TTS read them.
   - **Call: both are right within their scope.** A TTS reading "ııı" is not a real hesitation, so this
     stays unverified until a real recording. It is the first measurement of the bake-off.
4. **EK16.**
   - Fable could not locate it.
   - **Call: it exists.** Excel-turbo `xl/worksheets/sheet8.xml` (the "Ekim 15-21 linkleri" tab) carries
     EK16. Its Remotion rejection is contradicted by the install, as is the study card
     `video-editing-toolchain.md` ("Rejected for v1").
5. **Remotion licence.**
   - Fable said the $100/month floor starts "when renders are sold as automation".
   - **Call: not supported.** `LICENSE.md` (upstream main) makes the Free License cover a for-profit
     organisation with up to 3 employees, commercial use included. The Company License tiers apply only
     outside that group. Free today; the cost question arises only when the people working on it
     (outside help aggregated) reach 4.
   - One limit matters for B28's open question "does DXB also sell the machine": selling a modified copy
     of Remotion itself is disallowed. Remotion 5.0 changes the licence slightly (upstream PR 3750);
     not read.
6. **HyperFrames version.**
   - Opus: 0.9.20. Fable: 0.8.161 cached and 0.9.20 available.
   - **Call:** both versions sit in the npx cache, and OM calls `npx hyperframes` unpinned
     (`hyperframes_compose.py:62-70`). A pin belongs in the install step.
7. **timeline_view at end of file.**
   - Both hit exit 234 when sampling a frame at the exact end of the file.
   - **Call: a real small bug.** Stay inside the duration.

## Incident

Both readers requested `faster-whisper-large-v3-turbo` from `dxb_speaches_local`, which has a 1.8 GB
memory limit, and the container restarted 4 times between 17:23 and 17:26. At the referee's check it was
running and answered `/v1/models` with HTTP 200. Large STT models belong on the GPU through the B33
gatekeeper, never in the shared voice container.

## Verdict for the CEO

- **video-use and OpenMontage are not the same thing.** video-use cuts filmed speech (fillers, false
  starts, retakes). OpenMontage does neither; it generates footage, runs gated production, and makes
  Shorts.
- **The Shorts line belongs to OpenMontage** (clip-factory), tested against OpenShorts.
- **Remotion is ours already**, inside OpenMontage, free at today's size.
- **Which one produces the better talking-head cut** is decided by a bake-off on a real recording,
  judged blind by his eye and ear.

## Needs his yes

1. The bake-off itself, and the recording: 3–5 min talking head, plus 20–40 min long-form for Shorts.
2. Installing video-use (`/home/dxb/tools/video-use` + skill symlink) with the converter and the
   Turkish fix.
3. `faster-whisper` (+ `mediapipe` for reframe) into `OM/.venv`.
4. A GPU slot for STT.
5. ElevenLabs only if local STT loses the filler test (money out).
