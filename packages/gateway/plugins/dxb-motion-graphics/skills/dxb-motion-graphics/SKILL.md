---
name: dxb-motion-graphics
description: Use when a job needs a motion-graphics film made in code — an advertisement, an app or product showcase, kinetic typography, a logo transformation, a 2D or 3D spot for a site, a campaign or the holding's own channels. The method — real brand material, a storyboard approved before anything moves, every shot becoming the next, the picture locked before sound — and the command that renders and measures it.
---

# Motion graphics — a film made in code, from real material

The film is one page whose picture is a pure function of time. You write that page; HyperFrames renders it;
Blender renders what must look photographed; the studio's own hands supply any image the brand does not have.
What makes it good is decided before the first frame moves — in the material, the direction and the storyboard.

`mg` below is `node "/home/dxb/DxB Global OS/tools/motion-graphics/mg.mjs"` · craft notes: `references/`,
opened when the step needs them · effect sounds: `sfx/INDEX.md`.

**A look is never prescribed here.** This file carries the method; a job's look comes from its brief and its
approved direction. The techniques in `references/craft.md` are tools with their reasons, not rules.

## The path

**0. The brief.** Before anything: what the viewer must do when the film ends (the call to action) · who watches,
and where (a site hero, a feed, a billboard, a store listing) · the length · the frames it ships in (16:9, 9:16,
1:1) · the delivery's own figures — resolution, frame rate, loudness — taken from where it runs and from any
footage it must join · whether it is a client's commissioned film or an independent spec piece. A brief that
lacks one of these is completed with the one who ordered it, not guessed. `references/brief.md` is the form and
shows what a brief that leads to a strong film looks like.

**1. The material gate.** `mg init <job>` makes the job folder. Into `assets/`: the real logo (vector, or large
and clean), real screens of the real product, real product photographs from every side, a real 3D model when one
exists. Missing → the brand's own press kit, or ask. A logo is never redrawn from shapes; an app is never faked;
a product is never guessed. Weak material in is a weak film out — this gate is where most of the quality is won.
Imagery the brand does not have (a background plate, a texture, a scene) comes from the studio's own hands first —
the `media` tools (stills, clips), with `kisayol`'s recipes and house rules — then free sources (Poly Haven and
ambientCG for HDRIs and materials; the stock sources in the Web Studio's row), then a paid source as a priced
proposal. A typeface is chosen for the job and put in `page/fonts/` (an open-licence family, or the brand's own);
the machine's default fonts are never the look.

**2. The direction.** One sentence: the idea the film is built on. Then the palette (the brand's), the typeface,
the kind of movement, and for 3D the light and the lens. Study the references in `refs/` as frames, not as a
feeling. For direction and motion craft open what the holding already has — the `dxb-design` skills (motion
vocabulary, easing, review) — before writing your own.

**3. The storyboard — approved before anything moves.** Write `board/board.json`: numbered shots, each with its
time range, what holds on screen, and **on its own line how it becomes the next shot** — which shape turns into
which, what the camera does to get there; or a cut, when the film changes subject or time on purpose. What a
board never carries is a cross-fade standing in for a join nobody designed. For a physical product add shape-check tiles (our model beside the
reference photo); when the film must join filmed footage, the exact end still. `mg board` renders the board.
It goes to the job's owner — the CEO in a construction trial, the creative director's seat in a studio job — and
their notes change the board, never a half-built film. Nothing is animated before the board is approved.
`references/storyboard.md`: how to write shots and transitions that can be built.

**4. The build.** One page, `page/index.html`, by the contract in `templates/page.html`: every beat time in one
block at the top (`FILM.BEATS`, `FILM.EVENTS`), `window.ready`, and `window.renderAt(t)` drawing the whole picture
for time `t` — no timers, no animation-frame clock, seeded randomness, so the same `t` always gives the same
pixels. The page reaches the job's material as `assets/…`, `refs/…` and `sound/…` (links `mg init` makes inside
`page/`); a path that climbs out of `page/` is refused by the renderer. Engines by the shot: canvas, SVG or DOM for 2D; three.js (a pinned copy in `page/lib/`, not a CDN) for
browser 3D; Blender for a physical product — `references/blender.md` and the kit in
`tools/motion-graphics/blender/`. Existing illustrations are cut out and animated, not redrawn (`references/craft.md`, "Animating an existing
illustration"). The page lays out
from `FILM.W/H`, so each frame format is composed, not cropped. The frame's size has no other name in the page:
a name of its own at the top would keep the first format's size while another format is drawn.

**5. Look at it.** `mg sheet --around-events` gives three or four stills across every transition; read every one
against the board: does each shot really become the next, is the brand's material exact, is every word readable
for as long as it takes to read, does the frame work in each format. Fix and look again. Then `mg render` at
review size and have the film read **as motion** by a second reader that has not seen your reasoning (the
holding's motion reading: the Gemini API at 10 fps) against the board. A still is not playback; a film nobody
watched is not finished.

**6. Lock the picture, then sound.** Any change to the picture after this breaks the sound. Effects go where
something moves or changes, each cue naming which point of the sound — start, peak or end — sits on which event
(`sound/cues.json`); `mg sound` places them. Voice is written to the shots' length and spoken by the studio's own
voice tool. **This skill adds no music:** the holding's own work carries none, and a client's film follows the
ruling given for client work. `references/sound.md`.

**7. Render.** `mg render --format all` (add `--4k` or `--alpha` when the delivery asks). The command uses the
last HyperFrames version that passed its 5-second test (`mg hf update` tries a newer one), refuses a partial
render, and fails when a page that asks for WebGL does not prove a graphics card drew it — the page writes its
renderer to `<html data-gl>` (the template shows how); software, no line, or an unknown renderer all fail.

**8. Verify, and say what only an eye or an ear can settle.** `mg verify` measures duration, frames, size,
loudness and each cue's position in the rendered sound. Then report apart, as unverified: how it sounds, and for
a physical product each part against the real object — the model cannot see the real thing or hear the mix.
- **A spec piece** (a brand the holding does not own, made unasked) ends with "Spec ad. Not affiliated with
  <brand>." and is never published or run as paid media.
- **A client's commissioned film** carries no such line, and goes to the client only through the holding's
  delivery gate — every delivery waits for his eye.

## The job folder

`job.json` states the film. `mg init` writes it from its flags — `--format <name>=<w>x<h>` for each frame after
the first, `--lufs`, `--spec`, `--brand` — and it stays a file edited by hand:

```json
{ "title": "WhatsApp spec",
  "formats": [{ "name": "16x9", "w": 1920, "h": 1080 }, { "name": "9x16", "w": 1080, "h": 1920 }],
  "fps": 30, "lufs": -16, "spec": true, "brand": "WhatsApp" }
```

- `formats` — every frame the film ships in; the first is the one a command uses when none is named. A name is
  letters, digits, `-` and `_` only: it becomes part of every output's file name, before `-<n>x` for a larger
  master and `-<n>fps` for another rate — so two names one file name could mean, `a` beside `a-2x`, are refused.
- `fps` — the delivery's rate. `lufs` — the delivery's loudness target; `null` means `mg verify` measures the
  loudness and judges nothing — state a target once the brief gives one.
- `spec`, `brand` — what the job is, for whoever opens the folder next: an independent spec piece or a
  commissioned film, and whose brand. The command does not judge them; step 8 does.

`assets/SOURCES.md` — one line per file put into `assets/`, `refs/` and `page/fonts/`: where it came from (the
address), the day, and its licence or terms. A film whose material cannot be traced is not delivered. A source
that asks for an account, a signature or a tick under its terms (a brand's press-kit portal, a font foundry) is
not accepted by the builder: the step is brought to the one who decides, with the address and what the terms say.

## The command

| | |
|---|---|
| `mg init <dir> [--w --h --format name=WxH … --fps --dur --lufs --spec --brand]` | job folder, `job.json` with every format stated, the page and board templates |
| `mg board` | `board/board.json` → `board/board.png` |
| `mg stills <t…>` · `mg sheet [--around-events] [--n 4]` | exact-time stills · the film on one sheet, or one sheet per event, into `out/` |
| `mg events` | the film's beats and events |
| `mg sound` | `sound/cues.json` → the page's sound block (a cue's file lives under `sound/`) |
| `mg render [--format name\|all] [--scale n \| --4k] [--alpha] [--fps n]` | the film, into `out/` (`.mov` for `--alpha`); a larger master only by a whole multiple that reaches 1080p, 1440p or 4K |
| `mg verify [file]` | the measurements of every master of the job's formats in `out/`, or of the file at the path given; `out/verify.json` |
| `mg hf status\|update` | the HyperFrames version guard |
| `mg blender <scene.py> [-- args]` | Blender, headless, after a free-memory check on the graphics card |

Run it from the job folder or with `--job <dir>`; never run `npx hyperframes` from the repository root.
`mg --help` lists the commands; `mg <command> --help` says what that command does and what each of its flags does.
A tool the command starts is stopped after two hours and the command fails saying so; a render that needs longer
is given it with `DXB_MG_TOOL_TIMEOUT=<seconds>`.

## What goes wrong

- **A generic request gives a generic film.** The direction, the transitions and the material are the work.
- **Cross-fading between shots** because the transformation was not designed on the board.
- **A logo or a product drawn from memory.** Use the file; compare with the photograph.
- **Calling it done from stills.** Render it and have it watched.
- **Sound before the picture is locked.**
- **Software rendering** in a WebGL film (flat, slow): the render fails on it, and on a renderer it cannot name,
  by design — fix the cause.
