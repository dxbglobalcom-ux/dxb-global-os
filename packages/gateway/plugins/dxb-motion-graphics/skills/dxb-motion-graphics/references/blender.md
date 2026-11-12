# Blender — when the product must look photographed

Browser 3D is right for interface worlds, cards, icons and stylised shapes. A physical product — glass, metal,
glossy plastic, fabric — rendered in a browser looks flat and toy-like. Blender, run headless with a path tracer,
gives real reflections, soft shadows and lens behaviour. It is slower; use it for the shots that need it.

`mg blender <job>/scene.py -- <args>` runs it after checking the graphics card has room. The kit
(`tools/motion-graphics/blender/kit.py`, each helper in its `README.md`) sets up the renderer on the graphics
card, lights, camera with depth of field, model import, materials from texture sets, eased keyframes in seconds,
frame rendering, shape checks and a flat two-tone mode. It offers helpers only: the scene is the job's.

## The order of work

1. **The object.** A real model when one exists (the maker's CAD or a licensed/open model): import it, do not
   rebuild it. If it must be modelled, model it from reference photographs on every side, and bevel every edge —
   perfectly sharp edges are the first thing that says "computer".
2. **Shape check before any animation.** Render the object beside its reference photo from the same angle
   (`shape_check`). Compare part by part: proportions, seams, radii, the position of every button, light, port
   and logo, left versus right. Put the tile on the storyboard. The model has never seen the real object; this
   is where a wrong case, a part passing through another, or a mirrored piece is caught — and afterwards a
   person compares with the real thing.
3. **Light for the material.** Start with one large soft key and a near-black world; add a rim only if the
   subject merges with the background. Look at where the highlight falls on each curved surface — move the light
   until the highlight draws the form.
4. **Lens.** 70–100 mm for a product; focus on the part that matters; a wide aperture for close shots. Check
   that depth of field is not hiding the very detail the shot is about.
5. **Movement.** The object or the camera is always turning or travelling a little; fast moves get motion blur.
   Keys are set in seconds from the board's times, eased.
6. **Render small first.** A handful of frames at low samples across the whole film, as a contact sheet, against
   the board; then the full frames. Transparent film when the product is composited over the page's own
   background, type and effects — which is usual: Blender renders the object, the page does the graphics, and
   the two share the board's times.
7. **Into the page.** The frames are played by the page as an image sequence by time (`renderAt(t)` picks the
   frame), so type, colour and sound stay in one place and every format can be composed around the same render.

## Joining filmed footage

Take the exact frame of the footage the film must end on (ffmpeg, by time). Measure the subject's position, size
and angle in it. The last pose of the animation lands on those numbers; the board shows that still as its end
tile. At the join, look at the frames either side one by one — a jump in brightness, colour or position is
visible even when each frame looks right alone.

## What goes wrong

- A scene built from default shapes with a default font on an empty dark frame. It is a diagram, not a film.
- Light everywhere: no shadow side, no form.
- Sharp, unbevelled edges; flat untextured colour; a perfectly clean surface.
- A product detail invented because no reference was at hand. Stop and get the reference.
- Calling a device-listing function that crashes this machine's Blender — the kit selects the graphics card
  safely; do not bypass it.
- Rendering the full film before a low-sample pass has been looked at.
