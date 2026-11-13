# The contract every piece of `dxb-motion-graphics` shares (lead, 2026-11-12)

Read `PLAN.md` in this folder (sections 2, 3 and 7 — §7 replaces what it contradicts) and the measured bench
(`blind/brief.md`, last bullets). The video's method: `.planning/research/watch-links/2026-11-12-motion/method.md`.
The unattributed public copy of the creator's skill under `…/2026-11-12-motion/src/` is of unknown licence:
**no line of it is copied or adapted**; write from this contract and from your own knowledge.

## Where things live

- Plugin: `packages/gateway/plugins/dxb-motion-graphics/` — `.claude-plugin/plugin.json`,
  `skills/dxb-motion-graphics/{SKILL.md, references/, templates/, sfx/}` (lead writes SKILL.md and references).
- Tool: `tools/motion-graphics/mg.mjs` (Node 22, ESM, no new npm dependency; it shells out to `npx hyperframes`,
  `ffmpeg`, `ffprobe`, `blender`) and `tools/motion-graphics/blender/` (Python for Blender 5.2).
- Templates: `packages/gateway/plugins/dxb-motion-graphics/skills/dxb-motion-graphics/templates/{page.html, board.html}`.
- Test: `tests/b43/motion-graphics.test.ts` (run like its neighbours — read `tests/b43/kisayol.test.ts` for the
  house style and how tests are launched; `DXB_ENGINE_LOCK_WAIT=200` if a test touches the construction engine —
  these should not).
- State outside the repo: `~/.local/state/dxb/motion-graphics/` (the HyperFrames version guard).

## A job folder (anywhere; `mg init <dir>` makes it)

```
assets/   real logos, screens, product photos, models (never generated stand-ins for a logo)
refs/     reference stills and films' frames
board/    board.json → board.html → board.png   (the storyboard)
page/     index.html (+ lib/ for pinned libraries, fonts/), the film
sound/    cues.json, the effect files used, voice files
out/      stills/, sheets/, renders, verify.json
job.json  { "title", "formats": [{"name":"16x9","w":1920,"h":1080}], "fps": 30, "lufs": null|number, "spec": true|false, "brand": "" }
```

## The page contract (`page/index.html`)

- One root: `<div id="stage" data-composition-id="film" data-width="1920" data-height="1080" data-duration="12" data-no-timeline>`.
- One script block at the top defines everything timed:
  `window.FILM = { W, H, FPS, TOTAL, BEATS: { name: seconds, … }, EVENTS: [ { name, t } , … ] }`.
  `EVENTS` are the moments a sound may sit on (a morph lands, a card flips, a word arrives).
- `window.ready` — a promise resolved when fonts, images and models are loaded.
- `window.renderAt(t)` — draws the whole picture for time `t` (seconds) and nothing else decides the picture: no
  timers, no `requestAnimationFrame` clock, no `Date.now()`, randomness seeded. Calling it twice with the same `t`
  gives the same pixels.
- HyperFrames hook, exactly as measured: `window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {}; window.__hf.buildReady.film = window.ready; window.addEventListener('hf-seek', e => renderAt(e.detail.time));`
- For a person opening the file: `?t=3.2` shows that still; `?play` plays it with an animation-frame loop that only
  calls `renderAt` (never used in a render).
- A page that uses WebGL writes the unmasked renderer string to `document.documentElement.dataset.gl`.
- Format variants: the page reads `?format=9x16` (or the root's data-width/height) and lays out from `FILM.W/H`;
  `mg render --format` renders each format in `job.json`.
- Sound: `mg sound` writes `<audio>` clips between the markers `<!-- mg:sound:begin -->` / `<!-- mg:sound:end -->`
  using HyperFrames' attributes (`data-start`, `data-duration`, `data-volume`, fades). Nothing else edits that block.

## `sound/cues.json`

`[{ "event": "<EVENTS name>" | "at": seconds, "file": "sound/whoosh.wav", "align": "start"|"peak"|"end", "db": -24, "fadeIn": 0, "fadeOut": 0.05 }]`
— `align` says which point of the SOUND sits on the event; `mg sound` finds that point in the file (start = first
sample above −50 dBFS, peak = maximum of the short-time envelope, end = last sample above −50 dBFS) and sets the
clip's start so that point lands on the event. A `file` may name the skill's starter set instead, as
`"sfx:pop/pop-mid-01.wav"`: `mg sound` copies it to `sound/pop-mid-01.wav` (never over another sound of that
name) and the cue is planned from the copy. The file may also be `{ "trim": dB, "cues": [ … ] }`: `trim` is
added to every cue's `db`, and the sum may boost by at most +12 dB.

## `mg` commands (all but `init` and `hf` take `--job <dir>`, default the current directory; all print one decisive line and exit non-zero on failure)

`mg --help` lists them; `mg <command> --help` prints that command's usage, what it does and one line for each of
its flags, outside any job folder. A tool a command starts is asked to end after two hours
(SIGTERM; `DXB_MG_TOOL_TIMEOUT=<seconds>` states another limit, and a value no timer can be set to — `Infinity`,
`0`, a word — is refused), is ended five seconds later when it has not ended (SIGKILL, sent by the watch each
tool is started through, `lib/watch.mjs`), and the command fails saying so. The tool's own children are not
ended by it (Sol's finding A3, 2026-11-12).

| Command | Does |
|---|---|
| `mg init <dir> [--title … --w 1920 --h 1080 --format name=WxH … --fps 30 --dur 12 --lufs n --spec --brand …]` | folders, `job.json`, `page/index.html` and `board/board.json` + `board.html` from the templates, the page's helpers (`outline.js`, `motion-blur.js`) into `page/lib/`; `--w/--h` are the first format (named by its ratio), each `--format` one more; two format names one film's file name could mean (`a` beside `a-2x`) are refused here and whenever a job is opened |
| `mg board [--format name|all]` | `board/board.json` → `board/board.png`, or `board/board-<format>.png` for a format after the job's first (numbered shots: time range, title, the hold, and on its own line how it becomes the next; optional "shape check" tiles with a reference image beside ours; optional end still); each shot carries the film's frame at its middle, taken as `mg stills` takes one, once the page is the job's own — a page still the starter, a page that cannot be drawn yet, or a `board.html` laid out before 2026-11-12 gives a board without frames and the command says which |
| `mg stills <t…> [--format name]` | exact-time PNGs of one format into `out/stills/<format>/` (HyperFrames `snapshot --at`) |
| `mg sheet [--around-events] [--n 4] [--window s] [--format name|all]` | a contact sheet of the film, or 3–4 stills around every transition/event — from `--window` seconds before it to as long after, 0.25 when not given — into `out/sheets/<format>/`, for every format in one call with `--format all` |
| `mg events` | prints `FILM.EVENTS` and `FILM.BEATS` as JSON |
| `mg sound` | reads `sound/cues.json`, copies into `sound/` each starter-set file a cue names (`sfx:…`), writes the audio block into the page, prints each cue's planned offset and its level, the set's `trim` in it |
| `mg render [--format name|all] [--scale 2 | --4k] [--alpha] [--fps n]` | HyperFrames render at the guarded version, into `out/`; refuses any `--end`/partial flag; fails unless a page that asks for WebGL proves a graphics card drew it — a software renderer, no renderer line or an unknown renderer all fail (audit finding 4, 2026-11-12); never calls publish/cloud/share commands |
| `mg verify [file]` | judges the file at the path given, or every master of the job's formats in `out/`; one heard sound answers for one cue; a transparent master must carry an alpha channel that varies (audit findings 2 and 5, 2026-11-12); ffprobe duration/frames/size against `FILM` and `job.json`; loudness (ebur128) against `job.json.lufs` when set, reported otherwise — off the target by more than 1 LU, the dB the whole set would have to move by is printed and recorded (`move`); for every cue the measured position of its aligned point in the DECODED audio of the render, within one frame; a film that declares cues but is silent fails; writes `out/verify.json`; lists apart what only an eye or ear can settle |
| `mg motion-read [film] [--format name] [--model name]` | uploads the format's master in `out/` (or the film of the job given by its path; a master given by its path is read as its own format) to the Gemini API — only a file whose real path, links followed, lies inside the job folder and in which ffprobe finds a picture; any other is refused and nothing is sent (Sol's finding A2, 2026-11-12) — and asks for a reading at 10 fps against `board/board.json`, the question naming that format's own frame; writes `out/motion-read-<film>.txt`, and keeps the upload's address beside it (`….txt.upload.json`) so an unchanged film is sent once; the key comes from `GEMINI_API_KEY` / `GOOGLE_API_KEY` in the environment or the daemon env file (`DXB_MG_KEY_FILE` names another), goes into the request header alone and is never printed or written: whatever the API says back (a reading, an upload's address, a block reason, a refusal) and whatever is thrown while it is asked has the key taken out before it is written, printed, thrown on or sent again, and an upload answered with an address that is not `files/<id>` under the API is refused and never asked about (Sol's finding A1, 2026-11-12); each request is waited for up to 10 minutes; a 503 is asked again (5 times, 20 s apart); a 429 that names the day's quota says so and names `--model` with the other models; the model is `gemini-3.8-flash` when none is named |
| `mg hf [status|update [--guard index.html]]` | the version guard: `status` prints the good version (state file) and npm's latest; `update` renders the 5-second guard page (the skill's own, or the one `--guard` names) with the latest, runs `verify` on it, and only then makes it the good version; a failure leaves the previous good version in use |
| `mg blender <scene.py> [--need-mb n] [-- args]` | `blender -b --factory-startup --python <scene.py> -- …` after checking the graphics card's free memory (`nvidia-smi`) against `--need-mb` (default 4000); prints the frames written |

HyperFrames is always called as `npx --yes hyperframes@<good version>` with `HYPERFRAMES_NO_TELEMETRY=1`, **from
inside the job folder, never from the repository root** (measured today: an `npx` call run from the repo root
rewrote the repo's `package.json`). First good version: 0.9.38.

## Blender kit (`tools/motion-graphics/blender/kit.py`, imported by a job's `scene.py`)

Helpers only — never a ready scene built of primitives: `setup_render(w, h, fps, samples, engine='CYCLES')` with the
graphics card selected through `preferences.get_devices_for_type('OPTIX')` (never `get_devices()` — it crashes this
build), motion blur and transparent film options; `world(color | hdri_path, strength)`; `key_light(...)`,
`camera(lens_mm, focus_object | distance, fstop)`; `import_model(path)` (glb/gltf/obj/fbx/usd) with size
normalisation; `material_*` helpers (glossy plastic, metal, glass, emissive) and a Poly Haven / ambientCG texture
set loader from a local folder; `keyframe(obj, prop, {time: value}, easing)`; `render_frames(out_dir, times|range)`;
`shape_check(out_png, reference_png)` — one still of our model beside the reference photo; `flat_silhouette()` mode.
Reference: `tools/motion-graphics/blender/README.md` (short).

## Rules for every writer

- Write the test first, see it red, then the code. A test that cannot go red is a defect. The host tests
  (`*.host.test.ts`: HyperFrames, Chrome, Blender, with ffmpeg and ffprobe) FAIL when a tool they need does not
  answer, never skip; the sandbox tests say `SKIPPED: <tool> missing` loudly when ffmpeg or ffprobe is absent
  and skip the groups that need it — on this machine every tool is present and the tests must really run.
- Before you say it's done, run the tests and show me the output. If something is missing or broken, tell me
  instead of working around it.
- Do not stop while you still owe work; ordinary obstacles (errors, timeouts, empty results) are diagnosed and
  worked through. A deliberate blocker (a file marked not to be touched, withheld access) is left alone and reported.
- Never write `cd <dir> && …` in a Bash command line (a hook blocks it): absolute quoted paths, `git -C`,
  `npm --prefix`; a script may `cd` inside itself. Scratch work goes under
  `/tmp/claude-1000/-home-dxb-DxB-Global-OS/4957fd57-7f50-42ac-abf2-2089df3f710e/scratchpad/`.
- Touch only the files named for your piece. Do not commit. Follow
  `/home/dxb/DxB Global OS/references/engineering-craft/codebase-design.md` and check your own lines once against
  its 12 smells before hand-over.
- Report: what you wrote (paths), the test command and its output, what you could not do and why.
