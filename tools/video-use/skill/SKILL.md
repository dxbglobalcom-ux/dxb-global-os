---
name: video-use
description: >
  Not the default (the Media Studio's default lane is OpenMontage), but used whenever a job needs it.
  video-use edits FILMED footage by conversation into final.mp4: it reads the video as a word-timed
  transcript (speakers, laughter and applause marked) plus filmstrip and waveform images; cuts fillers
  ("ııı", "şey", "umm"), false starts, retakes and dead air on word boundaries; picks the best take;
  grades colour per segment; puts 30 ms fades at every cut and sets loudness to -14 LUFS; burns
  subtitles; adds animations (HyperFrames, Remotion, Manim, PIL), split screen, picture-in-picture,
  lower thirds, speed ramps and freeze frames; checks its own render at every cut; remembers the project.
  Needed for: cutting a talking head, interview, tutorial or raw takes; a cut that came out badly; the
  W104 animated YouTube path. It does not make Shorts, reframe to 9:16, or generate footage or voices.
---

# video-use — how the holding uses it

The tool itself is `~/.local/share/dxb/skills/video-use` (browser-use/video-use, MIT, pinned at `43cfc566`,
2026-10-08). **Read its `SKILL.md` and `helpers/` before the first step**: that file is the editor's craft and
its 12 hard rules. This page is only the holding's part: when it is used, what it can do, what is owed
before the first real job, and how it joins the rest of the studio. The record of the decision is
`.planning/board-rows/B43.md`, § "Leg of 2026-11-07" (the CEO's words, 2026-11-07).

## When — not the default, used whenever needed

OpenMontage is the Media Studio's default lane. video-use is not the default, but it is used whenever a job needs
what it does; nobody has to ask for it:
- cutting filmed speech: a talking head, an interview, a tutorial, raw takes;
- a studio cut that did not come out well: try it with video-use;
- the W104 animated YouTube path below.

## Everything it does

1. **It reads, it does not watch.** Every source gets a word-level transcript: the start and end of each
   word, which speaker said it, and marks such as (laughs) and (applause). All takes are packed into one
   short page (`takes_packed.md`). The picture is opened only at decision points, through `timeline_view`:
   a filmstrip, waveform and word-label image of any time range.
2. **It cuts on words.**
   - It removes fillers, false starts, repeated sentences and dead air.
   - Every cut snaps to a word boundary with a 30–200 ms pad, so it never cuts inside a word.
3. **It picks takes.** Across many takes it chooses the best one for each beat. It transcribes four
   sources at a time.
4. **Colour.**
   - It grades each segment as it is cut.
   - Presets: `subtle`, `neutral_punch` and `warm_cinematic`, an automatic grade from the clip's own
     statistics, or any ffmpeg filter chain.
   - It looks at a frame, changes one thing, and looks again.
5. **Sound.**
   - 30 ms fades at every segment edge, so there are no pops.
   - Two-pass loudness to -14 LUFS and -1 dBTP, the YouTube and Instagram level, measured rather than
     assumed.
6. **Subtitles.**
   - They are burned in on the output timeline, always as the last layer, so nothing hides them.
   - Chunking (1, 2, 3 words or a sentence), case and placement are chosen per video.
   - The default is two-word UPPERCASE chunks.
7. **Animation and effects.**
   - One sub-agent builds each animation slot, all in parallel.
   - The engine is chosen per slot:
     - HyperFrames: HTML and GSAP, interface motion, kinetic type;
     - Remotion: React compositions;
     - Manim: diagrams and equations, through a Manim skill it carries;
     - PIL with ffmpeg: counters, typewriter text, bar reveals.
   - Each slot is shifted to start at its own second.
   - Split screen, picture-in-picture, lower-third name cards, reaction cuts, speed ramps, freeze frames,
     crossfades and L/J cuts are built when the material calls for them.
8. **Process.**
   - It takes an inventory and pre-scans for slips.
   - It asks questions shaped by the material, then proposes the plan in 4–8 sentences and **waits for the
     yes**.
   - It cuts, renders a fast 720p preview, and then the final.
9. **Self-check.**
   - It opens the rendered file at every cut, ±1.5 s, looking for jumps, pops and hidden subtitles.
   - It also checks the first and last 2 seconds and the duration, and measures the loudness.
   - It fixes and renders again up to 3 times before anyone sees it.
10. **Memory.** It appends to `edit/project.md` each session, so next week continues where it stopped.
    Transcripts are cached and never repeated.
11. **Sources.** Local files, and online sources through `yt-dlp`.
12. **Where its output goes.** Everything goes into `<videos_dir>/edit/`: never into the tool's folder,
    and never into this repository.

**It does not:**
- make Shorts from a long video: OpenMontage `clip-factory`, or OpenShorts on B83's H4/H6 line;
- reframe 16:9 to 9:16;
- generate footage, images or voices: the studio's own hands do that, and voices come from Voice Studio
  and Voicebox (B12).

## Owed before the first real job

Each of these is code, written at high and verified by the lead.

1. **Transcription from the holding's ear, not ElevenLabs.** As shipped, `helpers/transcribe.py` calls
   ElevenLabs Scribe and stops without a key.
   - A converter turns faster-whisper's word JSON (`word_timestamps`, fillers kept) into Scribe's shape:
     `words[]` of `{type: word|spacing, text, start, end, speaker_id}`.
     `pack_transcripts.py`, `timeline_view.py` and `render.py` read nothing else.
   - The converter was proven 2026-11-07 on Speaches `faster-whisper-small`.
   - Once B12 is built, the ear is its whisper large-v3-turbo on the card.
   - **Never ask the CEO for an ElevenLabs key.** Scribe is the paid twin: money out, at his gate.
   - Until the converter exists, say the tool cannot transcribe yet.
2. **Turkish casing.** `helpers/render.py:507` uses `text.upper()`, which prints "IŞINI" for "İŞİNİ".
   Make it locale-aware for Turkish.
3. **`timeline_view` near the end of a file.** It must sample inside the clip's duration: a frame at the
   exact end exits with code 234.

**Not yet measured:** whether the ear keeps a real speaker's hesitations. Check this first on the first real
recording.

## The ear and the graphics card

Never request a large speech model from `dxb_speaches_local`. It runs on the processor with a 1.8 GB limit,
and a large-v3-turbo request crashed it four times on 2026-11-07. Until B12 moves the ear onto the card, use
`faster-whisper-small` there. Large models run on the card under B33's gatekeeper.

## The W104 path — a talking head into an animated YouTube video

W104's three skills (editor brain, designer, animator) add animation. video-use cuts and assembles. In
order:

1. **video-use cleans the talking head:** fillers, retakes, best take, grade and fades.
2. **Editor brain** reads the cleaned transcript on the *output* timeline. It plans 2–6 animations a minute
   as overlay slots with exact seconds: a statistic becomes a chart, a key sentence a text scene, a concept
   an interface scene.
3. **Designer** writes each slot's prompt from the brand's reference folder. The stills come from the
   studio's own image hand.
4. **Animator** builds each slot by the motion rules of its scene type. HyperFrames comes first (free,
   Apache-2.0); Remotion only where it is needed (free up to 3 employees).
5. **video-use's render assembles the film:**
   - each overlay is shifted to its slot;
   - subtitles go on last;
   - fades and -14 LUFS are applied;
   - every cut and every overlay is checked before the CEO sees it.

OpenMontage is not in this path. It stays the lane for generated films and for Shorts.
