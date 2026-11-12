# Method note — "Claude Opus 5.5: How To Make Motion Graphics" (Rourke Heath)

Source: https://www.youtube.com/watch?v=cDb-wPq0Iyk · channel Rourke Heath · uploaded 2026-11-06 · 17:58 (1078 s) ·
~244k views, 4.9k likes, 136 comments at read time (2026-11-12).

How it was read: full timed transcript (YouTube subs via `watch.sh`, 440 lines, `transcripts/1-cDb-wPq0Iyk.txt`);
all 134 scene-cut frames (`frames/MG01-cDb-wPq0Iyk-cuts/sheet01-12.jpg`); five screen-demo stretches re-downloaded in
**4K** (3:38-4:40, 5:50-6:10, 7:05-8:30, 10:58-12:30, 14:40-15:35) and read at 1 frame/s with crops; every example ad
at 2 frames/s from the 720p copy; the tip overlays located one by one. Description and 136 comments read (yt-dlp).
Everything in "quotes" below was read from a zoomed frame unless marked (speech).

The creator's skill file is email-gated (see §2.4). A file-for-file public copy of what is almost certainly that skill
exists on GitHub and was copied into `src/saas-animation-copy-kosif/` (25 files) — provenance and licence caveats in §2.4.

---

## 1. The workflow, in the order he does it

The video's own frame: **3 levels** (0:31) × the same **4 steps** every time (1:37): give Claude the ingredients →
approve a storyboard → Claude builds it → add sound, music, voiceover. Level 1 = Claude alone (2D/"3D" in the browser);
Level 2 = + AI tools (ElevenLabs voice, Suno music) and the brand's existing illustrations; Level 3 = + Blender.

The app used is the **Claude desktop app, Code mode** (the `</>` tab; sidebar "Pinned" projects: AirPods Ad, Spotify Ad,
Candy Crush Ad, GenHQ Ad, Rourke YT Thumbnails, Genjutsu Video, Zombie Seedance — seen 14:48). Model selector visible
in the composer: **"Opus 5.5 · Medium · Auto"** (3:47, 4:04, 15:30) — Opus 5.5, effort Medium, permission mode Auto.
A ghost icon top-right (4:12) = an incognito/temporary chat window. Creator in a reply: "Claude code builds all of this
natively inside of Claude. No other tools required. Accessible on the 20 dollar a month plan but if you plan on going
further the 4 videos, upgrade".

### Level 1 — Spotify (2:02-8:43)

| Time | Step | What is given / asked / happens |
|---|---|---|
| 2:35-2:48 | **Make one folder per ad** ("Spotify") and put the skill file in it | `saas-animation.skill` sits inside the folder (3:56, also on the desktop 7:38) |
| 2:57-3:06 | **Put the real assets in the folder** | Folder contents (3:57): `saas-animation.skill`, `spotify-logo.png`, `ios-home.png`, `home-feed.png`, (and `now-playing.png`, seen in Finder 7:09 and in Claude's read log 6:10). On-screen comparison 3:40: "Shape Layers" vs "Exact Logo"; 3:43 "High Resolution Image" |
| 3:42-3:52 | **Open the folder as the project** | Composer → "Project or folder" → "Open folder…" → picks `Desktop/Spotify` (3:51-3:53). Claude shows "Reading Spotify…" (3:54) |
| 4:04-4:11 | **Ask for a numbered storyboard, nothing else** | Prompt typed (verbatim in §2.1). Tip 2 overlay |
| 4:13-4:30 | **Claude returns a storyboard image** — 8 numbered shots with time ranges, title, description, and a green "Now:" transition line under each (verbatim §2.2), then: "Approve this, or tell me what to change, before I animate anything." | |
| 4:29-4:31 | **Give notes** | He types "We want specific tweaks and changes" and sends; Claude returns "Here's the updated storyboard." (5:58 frame shows that exact sentence as his bubble — a placeholder line, not real notes; shot 7 changed to a large centred logo) |
| 4:33-5:58 | **Before approving, direct the transitions** (Tip 3): every shot must transform into the next, no cross dissolves; "how can I turn this shape into this shape" (on-screen 5:53-5:54: "How Can I Turn This Shape Into This Shape?") | Demonstrated with a side-by-side "Cross Dissolve" vs "Seamless Transition" (5:11-5:27) |
| 6:03-6:04 | **Approve** | He types "Approved" (bubble seen 6:06-6:10) |
| 6:05-6:11 | **Claude builds** | Tool log, read at 4K (6:10): "Working… 9m 22s / Read SKILL.md / Read spotify-logo.png / Read home-feed.png / Read now-playing.png / Write spotify-3d.html / Run render.mjs frame 505 / 505". He says it took "about eight to 10 minutes" (6:04). So the renderer is an **HTML page driven frame-by-frame by a Node script (`render.mjs`)**, not Remotion/After Effects. 505 frames ≈ 20.2 s at 25 fps; the storyboard runs 0-20 s |
| 6:13-6:52 | Tips 4 and 5 shown over the result (dead centre; always motion) | |
| 6:52-7:08 | Sound A/B ("No Sound" / "With Sound" split screen) | |
| 7:09-7:30 | **Sound, way A: put SFX files in the ad's folder.** In Finder he selects all 43 WAVs in `downloads` ("43 of 43 selected", names `UIAlert_POPUP-…cular_Vector.wav` = Ocular Sounds "Vector" UI pack) and drags them into the `Spotify` folder | |
| 7:31-7:37 | Prompt (verbatim §2.1): "Go inside the folder, look at the sound effects I've uploaded in there and place them at the exact correct moments." | |
| 7:38 | Claude answers with "Placing your sound effects on the beats" and an inline player: the ad with a waveform under it and orange cue markers on the beats | |
| 7:46-8:08 | **Sound, way B: point the project at a whole licensed library.** Opens ocularsounds.com (Black Friday page 7:51), shows the local folder "Ocular Sounds - The Ultimate Sound FX Bundle" (8:01-8:03; category folders Airy Drones, All-Round Footsteps, Bass Drops, Camera Shutters, Cinematic Cars/Fire/Gym/Mechanics/Stone/Water, Cityscapes, Classic Horror, Dark Drones, Deep Impacts, Distorted Risers, Eerie Drones, Epic Hits Vol. 1/2, Epic Risers, Epic Whooshes, Fantasy Ambiences, Footsteps of Robots, Forest, Futuristic Ambiences/Weapons, … Sci-Fi Glitches, Seaside, Short Whooshes …). Selects that folder as the project (8:05) and types "Create the sound" → bubble "Create the sound design" (8:07). Same "Placing your sound effects on the beats" result |
| 8:08-8:26 | **Sound, way C (cheaper): Artlist.** artlist.io → Stock Catalog → Sound Effects → search "saas animation" (8:19). Results visible: UI Whoosh 0:02, Interface Click 0:01, Data Transition 0:03, Soft Pop 0:01, Screen Slide 0:02, Digital Swipe 0:02, Bubble Tap 0:01, Tech Morph 0:04. Downloads three (`Data Transition.wav` 640 KB, `Interface Click.wav` 186 KB, `UI Whoosh.wav` 412 KB, 8:21), drags them into the Spotify folder, bubble "Build out the sound design" (8:24) |
| 8:27-8:43 | Tip 6: visuals first, sound last | |

### Level 1, second example — Candy Crush (8:43-9:56)
Same workflow ("same level of effort"). Lessons he states: first version cropped the logo out of a screenshot "and it
looked awful" → he supplied a high-quality logo; he prompted "more interesting camera movement"; Tip 7 shallow depth of
field. Ends on a CTA (Tip 8). No prompt text shown on screen for this one.

### Level 2 — GenHQ (his own product) (9:56-12:27)
| Time | Step |
|---|---|
| 10:14-10:24 | Gives Claude "the brand assets and the sort of illustration style" — here **existing AI-made brand illustrations** (a 4-panel GenHQ illustration sheet: "Got a project?", "The right creatives find it.", "Applications roll in.", "Matched by skill.", seen 10:37). Claude cut the characters out and animated them with a "puppet tool" (pin-mesh warp) (10:37-10:46) |
| 10:51-11:02 | Tip 9 text animation: "No Bouncing", "No Letters Fading In", "Each Word Slides Up" demonstrated on "On the App Store now" / "Music for everyone." / "Free on the App Store." |
| 11:05-11:25 | Way A for voice (what not to do for a fixed-length spot): elevenlabs.io → Text to Speech, voice "Hope - upbeat and clear", model "Eleven v4", Stability/Similarity sliders, typed "Got AI skills? Brands are looking for you. Show your work. Get matched. Get hired." → overlay "The Client Asked For 0:15 / Your Voiceover 0:06" (11:21) — guessing the length |
| 11:26-11:29 | Way B: enable the **ElevenLabs connector** in Claude: "+" → Connectors → toggles Gmail / Google Drive / ElevenLabs; he switches ElevenLabs on (11:28) |
| 11:38 | Project "GenHQ street ad": earlier bubble "Create the animation for 15 seconds." Claude's inline result "Here's your animation." |
| 11:44-11:52 | Prompt (verbatim §2.1): "Okay Claude, here is our 15 second animation. I now want you to create a voiceover that fits inside this 15 second animation." |
| 11:54-12:02 | Claude: "Here's the voiceover, timed to your shots:" — a timed script block (verbatim §2.2), then "Generating speech with ElevenLabs…", then an inline `GenHQ 10s ad voiceover.mp3` (voice "Hope - upbeat and clear"), length shown "0:09" |
| 12:12-12:17 | Prompt: "Write me a Suno prompt that is the exact length of the video." Claude returns a one-paragraph Suno style prompt (verbatim §2.2) |
| 12:19-12:24 | He pastes it in suno.com/create (Songs tab, simple mode), generates (tracks in his library named Synthwave Groove, Late Night Drive, Launch Groove…) |
| 12:25-12:29 | Drags the downloaded track back into the chat; Claude adds it and shows the ad with two level sliders "Voiceover" and "Music" under the player (12:27-12:29) — "added it in for us and even adjusted the volume too" |

Inconsistency seen on screen: he asks for 15 s, Claude's script is titled "GenHQ 10s Ad – Voiceover", the lines end at
7.8 s, the mp3 is 0:09, the Suno prompt says "11 second". The finished GenHQ ad shown at 10:04-10:14 is ≈10 s. So the
real spot was ~10-11 s regardless of what the prompt said.

### Level 3 — AirPods Pro with Blender (13:47-16:47)
| Time | Step |
|---|---|
| 13:54-14:21 | "Without Blender" (browser 3D, flat lighting) vs "With Blender" comparison |
| 14:32-14:46 | Install Blender from blender.org (site shows "Blender 5.2.3 LTS"; downloads `blender-5.2.3-macos-arm64.dmg`, drags to Applications). He never opens it: "Claude will run it in the background" |
| 14:48 | Project "AirPods Ad". Claude: "Here's the storyboard." — a 12-tile board: two "Shape check" tiles + 10 numbered shots (verbatim §2.2) |
| 14:48-14:54 | His bubble: "Storyboard approved. Build it in Blender." → "Running in the background" with the command **`blender -b -P build.py`**, log lines `Saved: 'frames-shaded/0082.png'` … `0200.png`, live preview, "Frame 89 of 200" → "All 200 frames are rendered." (200 frames = 8 s at 25 fps) |
| 15:09-15:26 | Side-by-side "Without Blender" / "With Blender"; Tip 11 one light source |
| 15:26-15:37 | The prompt for the whole AirPods piece (verbatim §2.1) — the "white background clip" is his own filmed shot; he also gave "a single AI reference image that I had created of myself in this Apple style with the AirPod in" (15:44) |
| 15:52-16:19 | Diagram "The Animation" → "Reference Frame" / "Last Frame" → "Reference Frame": the animation must END on the exact reference still (his silhouette with the AirPod), then cut/blend into the real footage |
| 16:20-16:31 | Errors on the first pass, labelled: "The First Case" vs real "AirPods Case" (wrong case shape), "Stems Through The Case" (stems cutting through the case), "Wrong AirPod" (wrong pod in his ear). Fixed by telling Claude |
| 16:32-16:47 | Tip 12 check against real life: he holds the physical product |

Exports: not shown on screen. What is seen: Claude renders an MP4 itself (inline player) — `render.mjs` for the browser
levels, `blender -b -P build.py` → PNG frames for Blender. The final assembly of the intro (animation → his real camera
footage, 0:00-0:09) happens inside Claude per his speech ("Claude can put it all together", 16:11). No NLE export step,
resolution or codec setting is shown. Premiere Pro and After Effects are in his Dock, never opened on screen.

---

## 2. Every prompt / instruction text on screen, word for word

### 2.1 His prompts (all read from 4K frames unless noted)
1. 4:11 (Spotify, first message): `Create a numbered storyboard that breaks out the sequence of all of the things that are going to happen in the video.` (the sent bubble at 4:12 ends with a full stop)
2. 4:30 → bubble 5:58: `We want specific tweaks and changes` (a stand-in; the real notes were not shown)
3. 6:04: `Approved`
4. 7:37: `Go inside the folder, look at the sound effects I've uploaded in there and place them at the exact correct moments.`
5. 8:06 typed "Create the sound" → sent bubble 8:07: `Create the sound design` (project = the Ocular bundle folder)
6. 8:24 bubble: `Build out the sound design` (after adding the three Artlist files)
7. 11:38 bubble (GenHQ project, earlier turn): `Create the animation for 15 seconds.`
8. 11:52: `Okay Claude, here is our 15 second animation. I now want you to create a voiceover that fits inside this 15 second animation.`
9. 12:15: `Write me a Suno prompt that is the exact length of the video.`
10. 14:48 bubble (AirPods project): `Storyboard approved. Build it in Blender.`
11. 15:30-15:37 (AirPods, typed in a fresh chat, Opus 5.5 Medium Auto):
    `I need you to build a SaaS animation for the AirPods, build the storyboard, and do all of that. At the end, it should seamlessly transition into the white background clip. I want to keep a white background for the entire video, but it should seamlessly blend into the clip. I want the background of the SaaS animation to stay white. But actually the background can be black white animation, and then the end frame of the SaaS animation should be this still here.`
    (Dictated-sounding; "this still here" refers to an attached reference still, not visible in the frame.)
12. ElevenLabs web box (11:13-11:17): `Got AI skills? Brands are looking for you. Show your work. Get matched. Get hir…` (cut off by the cursor; the full line is the same script as below)

### 2.2 Claude's outputs that carry the method
**Spotify storyboard (4:17, 4K):** header `Spotify · 3D · shots in the current cut` — `Each numbered shot is a hold. The green line under each one is the transition that's in there now, which is what we're replacing with yours: how does 1 become 2, 2 become 3, and so on.`
| # | Time | Title | Description | "Now:" line (green) |
|---|---|---|---|---|
| 1 | 0.0–2.5s | Logo in the dark | The Spotify disc floats in from far away as a thick 3D coin over a glossy floor. Slow orbit to the right. | Now: "Music for everyone." rises in under it (no change of shot). |
| 2 | 1.7–4.6s | Music for everyone. | The line sits under the floating coin. The camera keeps orbiting. | Now: the line flies toward camera, the coin flips over and its back is the album art. |
| 3 | 5.2–6.6s | Now Playing card builds | The card body arrives from depth behind the art, then the title, progress bar and controls arrive as separate layers. | Now: none, it carries straight on. |
| 4 | 6.6–10s | Millions of songs. | The title flips through tracks and lands on "Millions of songs." The orbit shows the layers' depth. | Now: the camera tracks right off the card to the ring (a pan, no morph). |
| 5 | 10–13s | Made for you. | A ring of playlist covers turns toward us. "Made for you." above it. | Now: none, the ring keeps turning. |
| 6 | 13–15.5s | Release Radar | Release Radar stops at the front and its download tick fills green. | Now: the camera cranes up to the logo above the ring (a tilt, no morph). |
| 7 | 15.5–17s | Logo returns | The coin rises into view above the ring, front on. | Now: none. |
| 8 | 17–20s | Your sound. Your Spotify. | The two lines rise in under the logo, beat rings pulse out, spec line. | End. |
Footer: `Approve this, or tell me what to change, before I animate anything.`
Note: the board describes "the current cut" being replaced — i.e. this screen was recorded on an iteration of an
existing 3D cut, not on a cold start. The final Spotify ad (2:09-2:30) is a different, 2D-morph version (see §5).

**GenHQ voiceover (11:57-12:01, 4K):** `Here's the voiceover, timed to your shots:`
```
GenHQ 10s Ad – Voiceover
0.2s  Got AI skills?
1.5s  Brands are looking for you.
3.1s  Show your work.
4.5s  Get matched.
5.7s  Get hired.
7.3s  GenHQ.
7.8s  Where AI creatives get hired.
```
then `Generating speech with ElevenLabs…` → `GenHQ 10s ad voiceover.mp3` · "Hope - upbeat and clear".

**Suno prompt (12:25, 4K):** `Here's a Suno prompt for the ad:`
`11 second advert jingle, very short track, upbeat indie pop, 120 BPM, instrumental, handclaps, bouncy bass, plucky electric guitar, glockenspiel, punchy kick, bright and sunny, major key, joyful, immediate energy, short intro, abrupt clean ending`

**AirPods Blender storyboard (14:56-15:09, 4K):**
- Shape check: Apple photo — The target
- Shape check: our new case — Same outline, seam, lid and green light
- 1 · 0.0s · Macro along the seam, light streak races across — Fast slide along the gloss, shallow focus
- 2 · 0.5s · Case tumbling through black, rim-lit — 1.5 fast turns, slowing down, camera rolls with it
- 3 · 1.3s · Lid snaps open mid-spin — Pods shoot forward out of the case
- 4 · 1.9s · Hero moment: pods hang above the open case — Keeps turning, never stops
- 5 · 2.5s · Camera swings low and round, pods spiral upward — Case drops away out of the frame below
- 6 · 3.2s · Macro dive along the stem to the mesh — Shallow focus, light sweeps across
- 7 · 3.9s · Right pod whips past the lens — It wipes the frame: left pod alone
- 8 · 4.4s · Left pod barrel-rolls forward on black — Turning to its outer face, flying away
- 9 · 5.0s · White bursts open round his head — Head grows from the ear, pod flying into it
- 10 · 7.0s · Your exact end still — Blends into the white-background clip

**Blender run (14:48-14:54):** `blender -b -P build.py` · `Saved: 'frames-shaded/0193.png'` … `'frames-shaded/0200.png'` · "200 frames" · "All 200 frames are rendered."

### 2.3 The on-screen tip cards (the video's own summary, read from frames)
- Tip 1 (3:07-3:12): **Use Real, High Quality Assets** — "Real logo, real screenshots. Low quality in means low quality out."
- Tip 2 (4:02-4:06): **Storyboard First** — "Approve every frame before Claude animates. It saves your credits."
- Tip 3 (4:36-4:43): **Every Shot Transforms** — "No cross dissolves. One shape always turns into the next."
- Tip 4 (6:14-6:20): **Keep It Dead Centre** — "Keep the action in the middle, so eyes never hunt around the screen."
- Tip 5 (6:38-6:44): **Something's Always Moving** — "A slow camera move is enough. Still frames feel stale."
- Tip 6 (8:28-8:30): **Visuals First, Then Sound** — "Lock the animation first. Any change breaks your sound timing."
- Tip 7 (9:32-9:38): **Shallow Depth Of Field** — "Blur the background so it looks shot on a real camera."
- Tip 8 (9:49-9:52): **Know Your Call To Action** — "Decide what viewers should do when the ad ends."
- Tip 9 (10:54-10:55): **Text Slides In, Word By Word** — "No bouncing, no letters fading in. One word after another."
- Tip 10 (12:05-12:10): **Connect Your Voice To Claude** — "Claude knows the length, so the voiceover fits your shots."
- Tip 11 (15:24-15:30): **One Light Source** — "One light instead of lights everywhere is what looks cinematic."
- Tip 12 (16:33-16:36): **Check It Against Real Life** — "Claude can't see the real product. Compare every detail yourself."
- Lower-third 17:18-17:22: "Claude SaaS Animation Skill — Free, Link In The Description".

### 2.4 The skill file itself
- His link: https://rourkeideas.com/downloads/claude-opus-motion-graphics. Its public API
  (`/api/pub/landing/claude-opus-motion-graphics`) lists one asset: **`saas-animation v2.skill`** (id 9), unlocked only by
  submitting an email to his newsletter ("By downloading you'll join our newsletter…"). **Not downloaded** — that needs an
  email signup to an outside list, which a reader may not do. Commenters report the link failing and no email arriving.
- His pinned-style replies link two Google Drive items: `Claude Code Installation Guide.pdf` and a folder titled
  `instagram-editing` — **not** the SaaS skill (a commenter says the same). Not followed further.
- **A public copy:** GitHub `kosif199022-jpg/kosif-tool` (0 stars, licence NOASSERTION, pushed 2026-11-11) holds
  `.claude/skills/saas-animation/` — SKILL.md (name `saas-animation`), 7 references, 14 scripts, 3 templates. It matches
  the video exactly: the same `render.mjs` the Claude log ran (6:10), the same `blender -b -P` usage, the same 12 rules
  in the same words ("Every shot transforms into the next", "Keep what matters dead centre", "Light from one source",
  "Direction beats a clever prompt"), the same tools (ElevenLabs connector, Suno prompts with exact length, puppet
  animation, a "Shape check" step, "Your exact end still"). It is very probably Rourke's v2 skill re-hosted, but the
  repo does not say so → **provenance unverified, licence unknown; use it as reading, not as code we ship**.
  Full copy: `src/saas-animation-copy-kosif/` (SKILL.md 9.4 KB; references/style-rules.md, sound-and-music.md,
  blender.md, into-footage.md, pitfalls.md, engine-3d.md, engine-2d-puppet.md; scripts/render.mjs, mix.py,
  synth_sfx.py, gl3d.js, puppet.js, key.py, split.py, grid.py, contact_sheet.py, compose_into_clip.py,
  blender/{kit,tracks,mesh_from_sdf,example_scene}.py; templates/storyboard.html, template-2d.html, template-3d.html).
  What it adds beyond the video (read, not tested):
  - Page contract for every ad: canvas `#c`, `window.renderAt(t)`, `window.TOTAL`, `window.ready`, `window.EVENTS`,
    `?t=` for a still, `?scale=2` for 4K; all beat times in one block at the top.
  - Review loop: `node render.mjs stills page.html out/ 0.5 1.2 …` (+`--gpu` for WebGL) → `contact_sheet.py` → look at
    every transition at 3-4 points; render `node render.mjs video page.html "Brand ad - 4K.mp4" --fps 25 --scale 2 [--gpu]`;
    24 fps for posterised 2D; 1-2 4K renders at a time.
  - Sound synced from the page, not by hand: `render.mjs events` dumps `window.EVENTS`; `cues.json` entries
    `{"at"|"event", "file", "db", "align": peak|start|end, pitch, lp/hp, dur, pan}`; `mix.py … --lib <folder> --events
    events.json` reports each cue's offset (must be 0 ms); beds + whooshes −26…−33 dB + hits; SFX stem ≈ −20 LUFS, peaks
    under −2 dBFS; music 8-10 dB under SFX; whooshes only for movement, pops/ticks for morphs; no dings, typing, hums.
  - Voiceover: ~2.2 words/s (10 s ≈ 18-22 words, last 2 s for the end card); Suno: match BPM to the picture's pulse,
    2-3 options with Style line + Lyrics structure (Intro/Build/Drop/Outro).
  - Blender: headless `blender -b -P scene.py -- <out> <width> <samples> [flat] [times]`; one big soft area key light,
    near-black world, 70-90 mm lens; 1920 wide, 24 samples, motion blur, then upscale; "about 8 seconds a frame" on an
    M2 Pro (≈30 min for 8 s at 25 fps); transparent background; real GLB/OBJ model if one exists, else SDF meshes; shape
    check renders beside the reference before animating; "flat silhouette" mode for the black-and-white look.
  - Into footage: pull the exact target frame with ffmpeg, measure position/size/angle, end pose lands on it; blends
    "black falls away" or "pull back from black"; `compose_into_clip.py`; check frame-difference spikes at the join.
  - Above-board section: spec ads end with "Spec ad. Not affiliated with <brand>.", no imitation of real campaigns,
    no paid running of spec ads, licensed assets only, true claims only, consent and privacy.

---

## 3. Tools, libraries, sites, models, settings — checked

| Name (as real) | Where seen | What it is / checked | Licence / price |
|---|---|---|---|
| Claude desktop app, Code mode; model **Opus 5.5**, effort **Medium**, mode **Auto** | 3:47, 4:04, 15:30 (composer) | The build engine. Folder opened as project; reads files, writes HTML, runs Node/Blender | His reply: works on the $20/month plan, "upgrade" for more |
| `saas-animation.skill` / `saas-animation v2.skill` | 3:56, landing API | His skill (gated) — public copy see §2.4 | Free behind email |
| HTML page + **`render.mjs`** (Node, headless Chrome frame-by-frame → ffmpeg) | 6:10 log | The renderer for Levels 1-2. In the copy: self-contained, serves the folder, `--gpu` for WebGL, `--alpha` ProRes 4444 | Node 18+, Chrome/Chromium, ffmpeg (free) |
| three.js / WebGL (`gl3d.js`) | copy only | "3D" in the browser for the Spotify/Candy Crush look | MIT (three.js) |
| **Blender 5.2.3 LTS** | 14:32-14:46 | Run headless: `blender -b -P build.py` | Free, GPL |
| **ElevenLabs** — web Text to Speech (voice "Hope - upbeat and clear", model "Eleven v4") and the **ElevenLabs connector** in Claude | 11:12-11:29, 12:01 | Voiceover generated inside the chat | Paid credits |
| **Suno** (suno.com/create) | 12:19-12:24 | Music from Claude's prompt; done by hand on the site | Paid plan may be needed for commercial use (copy's note); the copy also says Suno announced a beta Claude connector late Oct 2026 — unverified |
| **Ocular Sounds** — "The Ultimate Sound FX Bundle"; the 43 files used for Spotify are the "Vector" pack (`…Ocular_Vector.wav`) | 7:14-8:03 | Licensed SFX library | He says they spent "around 500 pounds" on all of it (speech 7:59). Shop JSON read 2026-11-12: "Vector – Motion Graphics SFX" variants 44.95 / 69.95 / 39.95 (currency and variant names not read). Bundle price not read |
| **Artlist** (artlist.io) — Stock Catalog → Sound Effects, search "saas animation" | 8:11-8:20 | Cheaper subscription SFX | Subscription; price not verified. A commenter: "With the Artlist MCP … Claude can choose … sound effects directly on Artlist" — creator agreed; not checked |
| Puppet tool (pin-mesh warp, `puppet.js`) + cut-outs (`key.py`, `split.py`) | speech 10:37-10:46; copy | Animates existing flat illustrations | — |
| Fonts | GenHQ ad / text demos | The text style matches Poppins SemiBold (the copy names "Poppins SemiBold for headlines"); Spotify ad wordmark is Spotify's own | Poppins: OFL |
| Remotion / HyperFrames / After Effects / Lottie / GSAP | — | **Not used.** A commenter asked "Remotion or hyperframe plugin??"; his answer: Claude builds it natively. Pr and Ae icons sit in his Dock, never opened | — |
| AI image/video generation | 17:21 | "none of these actually use any AI image or video generation" — except the GenHQ illustrations (pre-existing AI images) and his own AI reference still for the AirPods end frame | — |
| GenHQ (genhq.io, join.genhq.io, skool.com/genhq) | 10:03-10:14, 12:27-13:32 | His own course + job marketplace; the Level 2 example *is* an ad for it, and a mid-roll | Sales funnel |

---

## 4. What makes it excellent vs mediocre

| Claim | Time | His claim / shown |
|---|---|---|
| Real, high-resolution logo and real app screenshots; otherwise Claude fakes the app and redraws the logo from shape layers ("pretty close but never actually the exact logo") | 3:07-3:40 | Claim + shown ("Shape Layers" vs "Exact Logo" 3:40; Candy Crush logo cropped from a screenshot "looked awful", 9:12-9:22) |
| Storyboard first, numbered, approve before any animation — saves credits; this is where you direct | 3:54-4:33 | Shown (Claude's storyboard + "before I animate anything") |
| Every shot transforms into the next; say "no cross dissolves"; ask "how can I turn this shape into this shape" and describe it | 4:33-5:55 | Shown (Cross Dissolve vs Seamless Transition 5:11-5:27) |
| Dead centre — eyes stay locked, effects happen around | 6:13-6:35 | Claim (the ads do keep the subject centred — shown) |
| Always some motion, at least a camera move | 6:37-6:50 | Claim + shown |
| Sound makes a "massive difference" | 6:52-7:10 | Shown as A/B; **the difference itself cannot be judged from frames** |
| Best SFX = a pro library (Ocular); Artlist is cheaper | 7:42-8:25 | Claim |
| Visuals first, sound last | 8:28-8:42 | Claim (logical: re-timing breaks cues) |
| Prompt for "more interesting camera movement" | 9:24-9:28 | Claim |
| Shallow depth of field → "shot on an actual camera" | 9:34-9:48 | Claim + shown (Candy Crush background blur) |
| Know your call to action | 9:49 | Shown on screen (Tip 8); ads end on "On the App Store now" / "Free on the App Store." / "Where AI creatives get hired." + URL search box |
| Text: no bouncing, no letter fades, each word slides up one after another — "premium, currently trending" | 10:49-11:05 | Shown (demo 10:58-11:07) |
| Voice via connector: Claude knows the length, writes words to fit the shots | 11:22-12:03 | Shown (timed script) — but length mismatch (asked 15 s, got ~9-10 s) |
| Music: ask Claude for a Suno prompt of the exact length | 12:05-12:24 | Shown |
| Blender lighting: a single light source vs "lighting everywhere" | 15:13-15:24 | Shown (side by side) |
| End on an exact reference frame to transition into real footage | 15:31-16:17 | Shown |
| Compare with the real physical product; first pass had the wrong case, stems through the case, wrong AirPod | 16:20-16:47 | Shown (labelled errors) |
| "If you give it a short generic prompt, you're going to get a generic output" — give artistic direction, ideas, transitions | 16:51-17:18 | Claim |
| "made in 30 minutes for $2" (the intro piece) | 1:14 | **His claim, not shown** |
| Spotify build "about eight to 10 minutes" | 6:04 | Shown (log "9m 22s") |
| "two weeks of testing" behind the skill | 2:50 | Claim |

---

## 5. The finished examples, shot by shot (from 2 fps frames)

**A. AirPods Pro intro (Blender + real footage), 0:00-0:09.6 (~9.5 s, 16:9).** Black world, one soft key light,
white glossy product. 0:00 extreme macro of the closed case sliding past the lens (shallow focus); 0:00.5 case tumbles,
small text left "Designed by Apple." (two lines, white, small); 0:01 lid open, pods inside, green status light;
0:01.5-2.0 case drops out, two pods hang centred with "2× more Active Noise Cancellation" left; 0:02.5-3.0 pods turn and
spiral, "30 hours of listening with the case" fades in as a big numeral + small caption; 0:03.5-4.0 macro along the
stem mesh, then the pod body fills the frame; 0:04.5-5.0 cut to a **flat silhouette** look (pure white pod on black,
mesh as a black slot) with "IP54 Sweat and water resistant" right; 0:05.5 the black becomes the silhouette of his
head — a white burst opens around the head (pull back from black), the white pod flies into the ear; 0:06-8.5 profile
silhouette (cap, beard, long hair) on white, hand placing the pod; 0:08.5 the exact end still (silhouette + white
AirPod); 0:09 hard match into his real camera footage, same profile, AirPod in. Typography: Apple-like neutral sans,
small, left/right of centre, words fade in. Pacing: fast first second, then continuous slower moves, never a hold.
Sound not readable from frames. The Blender storyboard in §2.2 is this piece's plan.

**B. Spotify (Level 1, Claude-only), 2:09-2:30 (~21 s).** Background: near-black with a soft green radial glow that
shifts hue per beat (green → yellow-green → blue → pink). 2:09 full-frame Spotify green flash; 2:09.5 Spotify logo
centred; 2:10-2:12 the logo builds itself / morphs: the three bars rotate and close into a ring (2:11), the ring becomes
a filled circle (2:11.5), the circle squares up into a rounded square (2:12) → a square (2:12.5) → the square becomes
album art and the **Now Playing card** builds under it, "Midnight Drive" (2:13-2:13.5); the track flips: "Slow Tide"
(blue glow, 2:14), "Paper Kites" (pink glow, 2:14.5), lands on **"Millions of songs."** (2:15); camera pulls back
through the card into a tilted **3D wall of playlist covers** (Daily Mix 1, Release Radar, Discover Weekly, Chill Mix,
Your Top Songs, Time Capsule, On Repeat…) that slides past in perspective (2:15.5-2:20); the wall recedes and a **phone
(iPhone, dynamic island)** spins in small and centred on a pulsing green ring (2:20.5-2:22), screens change Home feed →
Now Playing "SHOCK VALUE" (2:22.5-2:24) → iOS home screen (2:24.5); push in on the Dock's Spotify icon (2:26) → the
icon becomes the app icon centred (2:26.5-2:27) → end card "[icon] Spotify" wordmark with a small "On the App Store now"
and a tiny spec line under it (2:27.5-2:29). Techniques: shape morph chain (logo → ring → circle → rounded square →
card), card-flip track changes, Z-space pull-back through a grid, push-in on an icon as the final transition, colour
glow driven by the album art. All dead centre. Sound: A/B at 6:52-7:08 shows a SFX layer (UI pops/whooshes from the
Ocular Vector pack); not audible here.
Second variant shown at 5:05-5:27 ("Neon Rain" card) to demonstrate a cheap cross-dissolve vs the seamless morph.

**C. Candy Crush (Level 1), 8:53.5-9:06 (~13 s, + 3 s end card).** Pink/purple candy world with lollipops and candy
canes, everything soft out of focus (shallow DoF). 8:53.5 camera skims low across the empty purple tile board;
8:54-8:55 candies (blue spheres, green cubes, orange jellybeans, red, purple flowers, yellow drops) drop into the grid;
8:56 a match: one candy glows white and a light streak fires across a row; 8:57 a striped candy appears, the board
starts rotating in 3D with the candy-land background visible; 8:58-8:58.5 a fast whip past the board's edge with a
light streak; 8:59-9:00 a colour bomb (chocolate sphere) fires white lightning beams to all candies of one colour;
9:00.5 pull back — the board is a framed panel; 9:01-9:03 it shrinks into an iPhone running the game (UI with moves
counter, boosters); 9:03.5 the phone becomes the **app icon** (red-and-orange candy, "King" badge); 9:04-9:06 icon
centred, "Free on the App Store." under it; 9:13-9:16 final card: "Candy Crush SAGA" logo above the icon, "Free on the
App Store.", tiny "Spec ad. Not affiliated with King." Techniques: low camera skims, particle/light-streak match
effects, 3D board rotation, depth of field, board → phone → icon reduction, centred end card.

**D. GenHQ (Level 2, his own product), 10:04-10:14 (~10 s).** Flat, thick-outline cartoon city street in one-point
perspective with a big billboard at the vanishing point; posterised (stepped) motion. 10:04 billboard teal: character
holding a play-button tablet, headline "Got AI skills?"; 10:05 the camera whip-zooms into the billboard (strong motion
blur) and the next billboard arrives: yellow "Brands are looking for you." — girl with a telescope (10:05.5-10:06.5);
10:07 whip → orange "Show your work." — hand stuffing image/video/music files into a yellow folder, cloud-upload icon
(10:07.5); 10:08 whip → blue "Get matched." — hand with a red horseshoe magnet pulling profile cards (10:08.5);
10:09 street changes colour, "Get hired." — two hands pinning a rosette on a photo card, confetti, green ticks
(10:09.5-10:10); 10:10.5 cut to black, "GenHQ" wordmark with a cyan-blue gradient glow on "HQ"; 10:11.5-10:13 "Where AI
creatives get hired." types up word by word ("get hired." in brand gradient); 10:13.5 a white search box types "www…"
(URL CTA). Headlines: rounded geometric sans (Poppins-like), sentence case, ending in full stops, words rising one by
one. Characters are the existing illustrations, cut out and puppet-warped. Sound: voiceover (ElevenLabs "Hope") +
Suno indie-pop track; not audible here.

**E. AirPods "Without Blender" (browser 3D), 13:54-14:12.** Same product in three.js: flat even lighting, matte plastic
look, slightly wrong case proportions; lines "AirPods Pro." and "Sound that moves with you." — he calls it "flat,
fake". **"With Blender"** cut 14:12-14:21: glossy rim-lit case, macro on the green light and seam, "Designed by Apple.",
"2× more Active Noise Cancellation", "29 hours of listening with the…" (another render says 30 — the copy changed
between renders), mesh macro, "IP54 Sweat and water resistant", "Adaptive Audio." on a small pod.

---

## 6. Sound, and the limits

What he does: Level 1 — he supplies SFX files (a licensed pack in the folder, or a whole library folder as the
project, or a few Artlist downloads) and Claude places them "on the beats" and mixes (inline waveform with cue marks,
7:38). Level 2 — voiceover through the ElevenLabs connector (Claude writes timed lines, generates the mp3 in chat);
music made by hand in Suno from Claude's prompt, then dropped back in; Claude sets voice/music levels (sliders 12:27).
Order: picture locked first, sound last.

Limits he states or shows:
- Without good input assets Claude invents a fake-looking app and an approximate logo (3:17-3:36).
- Claude cannot see the real product: wrong case shape, parts passing through each other, wrong left/right — you must
  check against the real thing (16:20-16:47).
- Browser-only 3D looks flat for physical products; Blender is needed for cinematic light (13:54-14:21), and it is
  slower ("Running in the background", 200 frames).
- Voice length must be designed: the web TTS guess gave 0:06 for a 0:15 brief (11:21).
- Suno music is generated outside Claude (manual step).
- Generic one-line prompts give generic output (16:51).
- The copy of the skill adds: Claude "can't hear a mix"; stills are not playback; paid tools use the user's credits.
Not addressed in the video: aspect ratios (all examples are 16:9; no 9:16 version), export settings, colour pipeline,
brand licensing — his Spotify, Candy Crush and AirPods pieces are spec ads of brands he does not own ("yes, obviously,
this is a spec ad", 9:54).

---

## 7. What I could not read or verify

- The skill he distributes (`saas-animation v2.skill`) — email-gated; not downloaded. The GitHub copy is unattributed
  (licence NOASSERTION) and only *probably* his.
- The real storyboard notes he gave for Spotify (4:30): only the placeholder "We want specific tweaks and changes" is on
  screen.
- The reference still and the "white background clip" attached to the AirPods prompt (15:30): not shown as files.
- The Candy Crush prompt (camera movement, depth of field) — spoken only (9:24-9:42), no text on screen.
- The full ElevenLabs web line at 11:17 is cut off after "Get hir".
- Small grey text under end cards (2:28-2:29 Spotify, 9:13 Candy Crush) read only as "spec line" / "Spec ad. Not
  affiliated with King." — the Spotify one is too small at 720p to read word for word.
- "29" vs "30 hours" in the AirPods renders (14:17 vs 0:03) — two different renders; which is final is unknown.
- Everything audible: the quality of the SFX, the voice and the music, and the "massive difference" of 6:52-7:08 cannot
  be judged from frames; the transcript does not cover non-speech audio.
- Prices: Ocular "Ultimate Sound FX Bundle" (he says ~£500, not checked), Artlist plans, Suno commercial terms,
  ElevenLabs plan used — not verified. The "Suno connector" in the copy's text is unverified.
- "$2, 30 minutes" for the intro (1:14) — his claim, no evidence on screen.
- Export settings (resolution, fps, codec) for the final ads: not shown. 505 frames / 25 fps = ~20 s is my inference.
- Note for the lead: `.claude/skills/dxb-motion-graphics/` (and `.agents/skills/dxb-motion-graphics/`) existed at the
  start of this run (git status, untracked, SKILL.md 8.5 KB) and were gone by ~12:58 — removed by someone else, not by
  this reader. The 2026-11-11 study of the same video is at
  `.planning/research/watch-links/2026-11-11-motion-graphics/` (ANALIZ.md, a masterclass HTML, a demo).
