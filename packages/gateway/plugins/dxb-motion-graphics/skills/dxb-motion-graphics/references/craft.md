# Craft — techniques and why each works

None of these is a rule of the house. Each is a tool: here is what it does and when it serves. The film's look is
the job's own.

## Movement

- **Something moving all the time** keeps a frame alive; a slow camera drift is enough. A deliberate dead-still
  hold is strong exactly because it is rare — use it on the frame that must be remembered.
- **Easing carries weight.** Linear movement reads as mechanical. Ease-out for things arriving (fast, then
  settling), ease-in for things leaving, ease-in-out for moves that start and end on screen. Sharper curves
  (quint, expo) feel premium and decisive; gentle ones feel soft. One or two curves per film, used consistently.
- **Overshoot and bounce** say "playful". On a brand that is not playful they read as cheap. Decide once.
- **Stagger.** Elements that arrive together arrive a few frames apart, in the order the eye should read them.
- **Anticipation and follow-through**: a small move against the direction before a big move; parts that settle
  after the body has stopped.
- **Speed contrast.** A fast move lands harder after a slow one. A film at one speed has no accents.
- **Motion blur** on fast moves is what makes them read as camera work rather than as a slideshow; without it a
  whip transition shows its seam. `page/lib/motion-blur.js` draws it (below).

## The two helpers in `page/lib/`

`mg init` puts them there; each file says at its top how it is called.

- **`outline.js` — one shape becoming another.** It serves where two shapes are meant to flow into each other and
  each is one closed outline — a logo's contour into a device, a dot into a card: the join is then a real
  transformation and not a fade. It gives a path's outline as points, and the outline between two of them. What
  decides the shapes in between is which point meets which: a feature sent to a stretch that has nothing like it
  — a tail onto a straight edge — is dragged along and comes out as a lump half way (the first film, 1.4–1.6 s).
  Send the feature to its like with `meet` — the tail's two roots and its tip onto a corner — and look at the join
  step by step before keeping it. It does not serve where the shapes differ in kind — one outline into several, a
  shape with a hole into one without; that join is designed another way: a wipe along an edge, a turn, a cut.
- **`motion-blur.js` — a fast move as a shutter sees it.** It serves on the frames where a thing crosses a good
  part of the frame from one frame to the next — a whip, a card flying in, a fast push — and adds nothing to a slow
  drift. The moving thing is drawn several times across the time the shutter stands open and the drawings are
  averaged. What stood still comes out as it was drawn while the average is kept in half floats (`float16`): within
  1 level of 255 at up to 16 samples, within 2 at 64. HyperFrames' Chrome gives half floats (Chrome 152, measured
  on its real canvas by the host test, 2026-11-13). A browser that gives only 8 bits rounds at every sample — the
  same picture comes back up to 2 levels off at 16 samples, 5 at 64 — and the blur is still drawn; `expose` returns
  which it had (`{ colorType }`: `float16` or `unorm8`). Half a frame of shutter is a film camera's. Samples enough
  that neighbours overlap, or the blur reads as a row of ghosts (sixteen for a card that travels 60 px while the
  shutter is open). Each sample costs a full-frame layer: ask for it while the thing travels, not for the whole film.

## Composition

- **A subject held near the centre** lets effects happen around it without the eye hunting — strong for fast
  films on small screens. Off-centre composition is right when there is space the eye is meant to travel into,
  when words share the frame, or when the format (a wide hero) asks for it.
- **Depth**: layers at different distances, moving at different rates, make a flat screen feel like a place.
  Shallow focus (a soft background) reads as a real lens and separates the subject; it is wrong for flat graphic
  work where everything is the subject.
- **Scale for the screen it runs on.** A detail that reads on a monitor vanishes on a phone. Check at the size
  it will be seen.
- **Safe areas** differ per platform and format; keep words and the logo clear of the interface that will sit
  over them.

## Type

- **Words arriving one after another**, each sliding into place, reads as composed and gives the eye a rhythm;
  it suits headlines. Letters fading in one by one is slow to read. Long lines are better revealed as a whole.
- **One family, two weights** is usually enough. The typeface is the brand's, or chosen for the brand.
- **Hold long enough to be read**, then a little longer. Count the words.
- **Numbers** can count, roll or scale; a large numeral with a small caption is read faster than a sentence.
- Sentence case with a full stop reads as a statement; capitals shout. Match the brand's voice.

## Light and material (3D)

- **One dominant light** gives a form shape — a bright side, a dark side, an edge. Light from everywhere flattens
  it. A second light has one job: a rim to separate the subject from the background, or a soft fill to open the
  shadow.
- **Large, soft sources** make gloss look expensive: the reflection of a big softbox in a curved surface is what
  the eye reads as "product photography".
- **A dark world** makes a light product glow; a light world suits matte, friendly products. An HDRI gives
  believable reflections when the product must sit in a real place.
- **A long lens** (70–100 mm) keeps a product's proportions true and compresses the background; a wide lens
  close to the subject is a deliberate, dramatic choice.
- **Materials decide realism** more than geometry does: roughness variation, a slight bevel on every edge, real
  texture sets rather than flat colours.

## Animating an existing illustration (puppet)

When the brand already owns illustrations — characters, objects, scenes — the film moves those, it does not
redraw them. The drawing stays the brand's; only its parts move.

1. **Cut it into parts** that move separately (head, arm, hand, the object held), each a transparent image with
   a little overlap under the joint so no gap opens when it turns. Background removal for a flat illustration:
   by colour key, or HyperFrames' `remove-background`; clean the edge at full size.
2. **Give each part a pivot** at its joint and a parent (hand → forearm → upper arm → body). Rotating around the
   right pivot with easing is most of what reads as life: a nod, a wave, a lean.
3. **Warp where a rigid turn looks stiff** — a bending arm, a cape, a smile. Lay a coarse triangle mesh over the
   part, pin a few points, move the pins over time, and draw each triangle with the image mapped onto it (canvas
   2D with an affine transform per triangle, or a WebGL textured mesh). A handful of pins is enough; too many
   and the drawing melts.
4. **Stepped timing** (holding each pose for two or three frames) suits flat, thick-outline illustration and
   reads as hand-made; smooth timing suits soft, gradient styles. Match the illustration.
5. Small secondary movement — a blink, hair or cloth settling a few frames late — is what makes a cut-out feel
   drawn for the film.

All of it is a pure function of time like the rest of the page: pin positions and joint angles come from the
beat times.

## Colour

- The brand's own colours, exact. A background glow that takes its hue from the subject ties a frame together.
- One accent. Colour that changes per beat can carry the rhythm when the shapes stay simple.

## Pacing

- The first second decides whether the rest is watched: open on the strongest image or movement, not on a
  build-up.
- Give the call to action its own time. End on the brand, still enough to be read.
- Cut the film in the head against the sound it will carry: a beat every one to two seconds is a common pulse
  for a fast spot; let one moment breathe.

## Before calling it good

Watch it at full speed, small, without sound; then with sound; then frame by frame through every join. Ask what
a viewer who saw it once would say it was for.
