# Plan — `dxb-motion-graphics`

## 1. What is built

One skill, in one place, for both audiences:

- `packages/gateway/plugins/dxb-motion-graphics/` — `.claude-plugin/plugin.json`, `skills/dxb-motion-graphics/`
  (`SKILL.md`, `references/`, `templates/`), linked into `~/.claude/skills/` for the building sessions.
- `tools/motion-graphics/mg.mjs` — the skill's one command (below) and `tools/motion-graphics/blender/` (the kit).
- `tests/b43/motion-graphics.test.ts`.
- The employees' grant (a register script, as `dxb-design` has) is written and tested on the construction engine
  only; it reaches the company at the Media Studio's rank, not now (the bench rule).

A skill is needed, and it is not a prompt collection: what separated the video's good films from a generic one was a
fixed path with a gate before any animation, a contract that makes the picture checkable frame by frame, and a
review loop. Those are procedure and tools. The wording of a job's brief stays the job's.

## 2. The path the skill prescribes (SKILL.md, short; craft detail in `references/`, opened on need)

0. **The brief** — what the film must make a viewer do (the call to action), who watches, the length, the frames it
   ships in (16:9, 9:16, 1:1 — the video only made 16:9), where it runs, and the house limits of the job's owner.
1. **The material gate** — one job folder (`assets/ refs/ board/ page/ sound/ out/`). The real logo as vector or
   high-resolution file, real screens, real product photos or a real 3D model. Missing → fetched from the brand's own
   press kit, or asked for; a logo is never redrawn from shapes and an app is never faked. For a physical product:
   reference photos from every side.
2. **Direction** — one sentence of idea; palette taken from the brand; one display typeface chosen and fetched (open
   licence, into the job folder — the machine has no display fonts); the light and the lens for 3D.
3. **The storyboard, approved before anything moves** — numbered shots with time ranges; for each the hold and,
   in its own line, how it becomes the next ("which shape turns into which"); "shape checks" beside the reference
   for a physical product; the last frame when the film must join filmed footage. Rendered as one board image. The
   one who approves is the job's owner: the CEO in a construction trial, the creative director's seat in a studio
   job. Notes are applied to the board, not to a half-built film.
4. **The build** — one page whose picture is a pure function of time: `window.renderAt(t)`, `window.TOTAL`,
   `window.ready`, `window.EVENTS` (named beats), every beat time in one block at the top; no timers, no
   animation-frame clock, seeded randomness. Engines by the shot: canvas / SVG / DOM for 2D; three.js (a pinned copy
   in the job folder, not a CDN) for browser 3D; **Blender, headless, for a physical product** — Cycles on OptiX, one
   large soft key light on a near-black world, a long lens, depth of field, motion blur, a real model when one exists;
   existing illustrations cut out and warped (puppet); a generated still or plate through the studio's own hands
   (the `media` group: FLUX, H3) when a shot needs imagery, never as the film itself.
5. **The review loop — the film is looked at before it is called done.** Stills at three or four points of every
   transition plus a contact sheet (`snapshot --at`), read by the builder; then the rendered film is read as motion
   by a second reader (the Gemini API at 10 fps, already in use in the holding for motion reading) against the
   board: does each shot become the next, does anything stand still, is anything off-centre, cropped, unreadable.
   The rules checked: every shot transforms (no cross dissolve) · the subject dead centre · something always moves ·
   text arrives word by word, sliding, no bounce, no letter fades, on screen long enough to be read · shallow depth
   of field · one light · the call to action · safe areas per frame format · no default font · the brand's own
   colours · a physical product compared with its reference photos part by part.
6. **Picture locked, then sound** — effects only where something moves or changes (whoosh for movement, pop or
   tick for a morph), placed from `window.EVENTS` so a cue is at 0 ms from its beat by construction; voice written to
   the shots at about 2.2 words a second with the last two seconds left to the end card, spoken by the studio's own
   voice tool when it stands (Voicebox, Voice Studio — their validation is board row B12's, not this job's);
   effect stem about −20 LUFS, the film −14 LUFS (the studio's standing figure). **Music is not added by the skill:**
   the holding's own work carries none, and client work follows his ruling when the first client comes.
   Effect sources, in order: the job owner's own licensed files; a free, open-licence starter set kept in the plugin
   (fetched and licence-checked in the build); synthesis; a paid library is a proposal with its price, his purchase.
7. **The render** — HyperFrames at its latest version behind his version guard (a new version first renders the
   5-second test; it fails → the last good version is used); never `--end`; review at 1080p, the final at 4K;
   25 or 30 frames a second (24 for stepped 2D); a transparent master when the film goes into a site or an edit;
   one render per frame format. No upload command is ever called.
8. **Verify and hand over** — duration, frame count, resolution, loudness and the absence of a software-GL frame
   measured; frame-difference spikes at a join into footage; the contact sheet of the final; then what only an eye
   or an ear can settle is listed apart as unverified: how it sounds, and the product against the real object. A
   film made of a brand the holding does not own ends with "Spec ad. Not affiliated with <brand>." and is never
   published or run as paid media.

## 3. The command — `mg` (ours, thin; it calls what exists and adds only what is missing)

`mg init <job>` (folders, the page template with the seek hook, the board template) · `mg board` (board image) ·
`mg stills <t…>` and `mg sheet` (HyperFrames `snapshot`) · `mg render [--4k] [--alpha] [--format 16:9|9:16|1:1]`
(HyperFrames `render` with the guard; refuses `--end`; fails when a frame reports software GL) · `mg events`
(dump `window.EVENTS`) · `mg sound <cues.json>` (writes the audio clips into the page from events, reports each
cue's offset and the stem's loudness) · `mg blender <scene.py>` (headless, safe device selection, refuses to start
when the card's free memory is below the scene's need) · `mg verify <film>`.

Tests first, red before the code: the template page renders the same frame twice (hash-equal still at a fixed `t`);
`mg render` refuses `--end`; `mg verify` goes red on a wrong duration, a silent film that declares sound, and a film
whose loudness is off; `mg sound` puts a cue at its event's time (measured with silence detection on a rendered
test). The tests that need HyperFrames or Blender skip loudly, never silently pass, when the tool is absent.

## 4. The proof — two films he looks at

Made by a fresh writer that holds only the skill and a brief, so the film proves the skill and not the lead:

- **Film 1 — an app showcase, browser engines, 12–15 s, 16:9 and 9:16, with effects, no voice:** a spec piece for a
  well-known app whose brand publishes a press kit and whose screens are real screenshots. Not a music product.
- **Film 2 — a physical product in Blender, 8–10 s,** only after film 1 has his eye, on a product with a real
  open-licence 3D model and reference photos.

Each goes to him with its storyboard first (the gate is part of what is proven). His eye decides; nothing is called
accepted before it.

## 5. Records

The Media Studio's row file (B43) gains a leg note and the Web Studio's (B84) a pointer; the board row's line only
if there is room under the ceiling; his order in the approvals ledger; STATE. No new board row, no new spec.

## 6. Risks

- HyperFrames changes fast (0.9.20 → 0.9.38 in five days): the guard and the stepper-compatible page contract keep a
  way back — the same page renders under a plain stepper.
- The model cannot hear: sound is measured (offsets, loudness), never judged; his ear is the test.
- A physical product drawn wrong (the video's own first pass: wrong case, parts through each other): shape checks
  before animation, and the real-object comparison is a human's.
- The graphics card is shared with the studio's resident tools: a Blender render checks free memory first.
- Brand rights in spec films: the closing line, no publishing, no paid run.
- Library licences: three.js is MIT; GSAP's terms are read before it is used at all (the page contract does not
  need it).

---

## 7. Corrections after the blind audit (Sol, 2026-11-12, `sol-plan.raw`) — these replace what they contradict above

1. **Who can produce (A).** A plugin grant gives an employee `Skill` and `Read` only (`runtime-profile.ts:137-156`);
   it does not let a seat run `mg`. So the delivery is in two steps, said plainly: **now** — the skill, the command
   and the proof films, usable by the building sessions (which is where every trial of the construction runs);
   **after film 1 has his eye** — the employees' road: a seat with the media tools submits a motion job through the
   studio's existing job book (`media_submit`, a new kind beside still/shoot/assemble that runs `mg` on a job
   folder), a seat without them hands the approved storyboard to the session, as `kisayol` §5 already does. That
   road is built and tested end to end on the construction engine with a compiled employee profile; it reaches the
   company at the studio's rank. Wiring a method into the lane before he has accepted its film would be building
   on a draft (Law D).
2. **Spec work and client work are different things (A).** The closing line "Spec ad. Not affiliated with <brand>."
   and "never published, never run as paid media" apply to an independent spec piece only — the two proof films are
   spec. A client's commissioned film of its own brand carries neither.
3. **Techniques, not a look (A).** The storyboard gate, the transformation of each shot into the next, real
   material and the review loop are the method and stay. One light, shallow depth of field, a centred subject,
   constant motion and word-by-word type are the video's techniques: the skill carries each with its reason and
   when it serves, in `references/`, and none is a rule or a check. A job's look comes from its brief and its
   approved direction (his ruling `playbook-examples-show-the-bar-2026-11-08`); the review checks the film against
   its own approved board and direction.
4. **What is called, by name (B).** Direction and craft: the `dxb-design` plugin (Emil Kowalski's motion skills
   are already inside it) and the shelf; advertising recipes and house rules for a generated still or clip:
   `kisayol`; a film that must live in a scrolling page: ScrollCraft; HDRIs and materials: Poly Haven and ambientCG
   (B84's sources); generated imagery: the `media` group; rendering, stills, contact sheets, sound placement,
   transparent masters, loudness: HyperFrames; 3D: Blender. What the new kit alone adds: the job path with its gate,
   the page contract and its template, the storyboard board, the cue alignment and its measurement, the Blender
   scene helpers, the version guard, the final verification.
5. **Delivery figures come from the job (B).** Resolution, frame rate and loudness are taken from where the film
   runs and from the footage it must join. The skill names starting values with their context (review at 1080p;
   25 or 30 frames a second for screen work; −14 LUFS is the studio's figure for its UGC finish) and never imposes
   them.
6. **A cue is aligned by its sound, not by its file (B).** Each cue says which point of the sound — start, peak or
   end — sits on which event; `mg sound` finds that point in the file, and the offset is measured on the decoded
   audio of the final render, within one frame.
7. **His eye before a client (B).** A client delivery goes through the holding's existing delivery gate — every
   delivery waits for his eye from the first paid job (`his-eye-on-every-delivery-until-he-lifts-it-2026-11-08`).
   The skill points to it and writes no approval of its own.

Signed by the lead after the audit, 2026-11-12. Film 1's subject: a spec piece for WhatsApp (Meta's public brand
resources and real store screenshots; not a music product).
