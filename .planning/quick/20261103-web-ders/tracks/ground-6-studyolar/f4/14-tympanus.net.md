Real Folds, Real Fire: Building a React Library for Sheets That Bend and Burn | Codrops

[Codrops](https://tympanus.net/codrops/)

* [All Posts](https://tympanus.net/codrops/all-posts/)
* [Creative Hub](https://tympanus.net/codrops/hub/)
* [Webzibition](https://tympanus.net/codrops/webzibition/)

By [Noor Mtir](https://tympanus.net/codrops/author/noormtir/ "Posts by Noor Mtir") 
in
[Articles](https://tympanus.net/codrops/category/articles/) on
October 18, 2026

Real Folds, Real Fire: Building a React Library for Sheets That Bend and Burn
=============================================================================

How an open-source React library renders sheets of paper as real 3D geometry that folds, rolls and peels, and lets you set them on fire through a webcam with a pinch or a real lighter.

[case study](https://tympanus.net/codrops/tag/case-study/) [MediaPipe](https://tympanus.net/codrops/tag/mediapipe/) [React Three Fiber](https://tympanus.net/codrops/tag/react-three-fiber/) [simulation](https://tympanus.net/codrops/tag/simulation/) [Three.js](https://tympanus.net/codrops/tag/three-js/)

[![Printed sheets curling and peeling in a ring against a black background, rendered live in 3D](https://tympanus.net/codrops/wp-content/uploads/2026/10/real-folds-real-fire-cover.png?x95600)](https://paperlab.nawwara.studio/ "Real Folds, Real Fire: Building a React Library for Sheets That Bend and Burn Demo")

[Visit](https://paperlab.nawwara.studio/)

Part One: Folds
---------------

### It Started Because We Needed a Letter That Folds

This year I collaborated with [Chiro Studio](https://chirostudio.xyz/) to build [Lights Left On](https://lightslefton.com), a place to write letters and postcards the way people did in the nineties. You write by feather, in a script typeface I drew by hand in Glyphs, or by typewriter, then seal it and send it: to yourself, or to one person’s inbox.

The product rests on one feeling. A letter is *an object*. Something you hold, fold, press a seal into, and stick a stamp on. Get that wrong and it’s a text field with a serif font.

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/opener-hands.mp4)

chirostudio and I shipped the MVP in Three.js, with GSAP driving the scroll. Then we started pushing it further, and ran into the same wall in a dozen places. The letter folds. The stamps tear off a perforated sheet. The wax seal presses into a surface that has to give under it. Every one of those is paper doing something, and the paper part was mine: I was solving each one from scratch, badly, in isolation.

I did what everyone does. CSS first: `transform`, `perspective`, a gradient faking a shadow along the crease. That looks fine in a screenshot and falls apart the moment anything moves, because a CSS “fold” is two flat rectangles pretending to be one surface. Then the other standard trick: render the animation in Blender and play it as a video. That bends correctly, but now the content is baked in, and a letter whose words can’t change is not a letter.

What I actually needed didn’t exist: a sheet of paper, with *my* content on it, that bends the way paper bends. So Lights Left On went on hold, and on July 11th I opened an empty repo by myself. That repo is now [paperlab](https://paperlab.nawwara.studio), an open-source React library that renders paper as real geometry.

[](https://tympanus.net/codrops/wp-content/uploads/2026/10/receipt-unroll-optimized.mp4)[](https://tympanus.net/codrops/wp-content/uploads/2026/10/hero-peel-optimized.mp4)

Both clips are recordings of the library running. Every frame was rendered live from real geometry.

### The One Rule: A Sheet Doesn’t Stretch

Roll a sheet of paper and it does not get longer. Every fiber travels exactly the distance it traveled when the sheet was flat. It just travels a curved path instead of a straight one.

The naive way to curl a plane in a vertex shader is to push each vertex along a sine wave. It looks *almost* right, but the sheet silently stretches, the text painted on it smears wider through the curve, and your eye calls it fake before your brain can explain why.

So the rule I set on day one: every bend in this library preserves arc length. You measure how far along the sheet a vertex sits, then put it that same distance along a curve. For a curl onto a cylinder of radius `r`, a point `s` past the start of the curl has turned through `s / r`:

```
// s = distance along the sheet, r = cylinder radius
const theta = s / r
const y = r * Math.sin(theta)
const z = r - r * Math.cos(theta)
```

Because the angle comes *from* the distance traveled, the paper can’t gain or lose length however hard you curl it. Seven deformers ship. The four that bend the sheet (`roll`, `curl`, `bend`, `fold`) are built on that rule. The other three (`wave`, `drape`, `crumple`) put texture on the surface: ripples, hanging folds, a crushed facet pattern. They move points up and down, then pull the sheet in a little so it doesn’t read as stretched.

![Two sheets bent identically under one camera, each printed with a ruled grid. The left sheet's rows bunch and spread unevenly; the right sheet's rows stay evenly spaced.](https://tympanus.net/codrops/wp-content/uploads/2026/09/stretch-comparison.png?x95600)

Same bend, same camera. Left: sine displacement, the rows crowd and spread. Right: arc length preserved, even rows, and the sheet pulls in from the guides, because wrapping costs you frontal area.

### The Same Math in Two Languages

A single hero sheet deforms on the CPU, in JavaScript, because that path has to answer *where is this corner right now?* so you can grab it and pull. A gallery of forty sheets deforms on the GPU, in GLSL, in one instanced draw call. Same math, two languages, and two implementations that can drift apart.

So they are twins under test. A golden-vector gate runs 19 fixed deformer settings through both versions, bending the same 48×48 grid of points. If any point lands somewhere different, the build fails.

### Settings Named the Way You’d Say Them

On top of the deformers sit twelve **behaviors** (`peel`, `unroll`, `flip`, `letter-fold`, `hang`, `fall`, `settle`, `ribbon` and friends), each a stack of deformers with parameters named the way a person would describe the motion. `unroll` doesn’t ask for a cylinder radius. It asks for *tightness*.

```
<Paper preset="receipt-unroll" autoplay />
```

[](https://tympanus.net/codrops/wp-content/uploads/2026/10/letter-fold-optimized.mp4)[](https://tympanus.net/codrops/wp-content/uploads/2026/10/field-ring-optimized.mp4)

A letter fold on one sheet, and twelve peeling cards in one draw call.

### A Sheet Is Just Data

One [Zod](https://zod.dev) schema is the source of truth for everything: the public API, the paperlab editor’s controls, the `.paper` file format, the docs. It gave me a rule that killed a lot of bad ideas early: if a feature can’t be saved into a preset, it doesn’t ship.

Because the inspector is built from the schema, the editor can’t offer a control the library doesn’t have. And because a sheet is just data, it travels: sculpt one in the editor, share the link, and whoever opens it gets their own editable copy.

![The paperlab editor in paper mode: presets on the left, a thermal receipt on the canvas, the generated inspector on the right](https://tympanus.net/codrops/wp-content/uploads/2026/09/editor.jpg?x95600)

The editor. Its controls are built from the schema, so it can’t offer anything the library doesn’t have.

There are seven stocks (thermal picks up banding), and a stage mode where banners of paper hang the height of a hall. All of it exports as JSX, as a brief for your coding agent, or as a `.paper` file.

[](https://tympanus.net/codrops/wp-content/uploads/2026/10/stage-nave-optimized.mp4)

Stage mode: banners of paper that hang the height of a hall.

When I started this article, it ended on hand tracking as the next thing I’d build. That’s built now, and it took me somewhere I didn’t plan to go.

Part Two: Fire
--------------

### I Built Twelve Gestures and Deleted All of Them

The single sheet deforms on the CPU, so it always knows where its corners are. That is the hard half of putting a real hand on a virtual sheet, so hands were the obvious next step.

The first version of the Hands page did everything. Grab, score, paint, fold, crush, tear, rip, resize, peel, throw, dial, blow: twelve gestures. It worked, and it was a demo reel.

So I deleted them, all but your breath, and kept one thing to do to the paper: burn it. It’s the most physical thing that can happen to a sheet of paper, and there’s no going back from it. A page that does one thing properly is worth more than a page that shows off twelve.

### Light It, Then Blow on It

This is not WebXR, and there’s no headset. It’s *browser hand tracking*: [MediaPipe](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker) reads your webcam in the tab. The video stays on your machine (only the hand and face models are downloaded), and there is nothing to install. It feels like reaching into the screen.

There are three ways to start that fire: a pinch, a real lighter, or a button if you have no camera. All of them end up in the same place: a point on the paper where the fire starts. Your breath does the rest.

![Diagram in two lanes. Light it: a hand model reads a match (a pinch held still for 320 ms), camera pixels read a lighter (flickering in 4 of the last 8 frames), and a button covers no camera; all three meet where they touch the sheet and put heat on the paper with field.ignite(u, v, radius, amount). Blow on it: a face model scores the shape of blowing, and that breath sways the sheet, cools the fire and can blow a lit match out.](https://tympanus.net/codrops/wp-content/uploads/2026/09/diagram-hands.png?x95600)

**A pinch held still is a match.** The hand tracker gives me 21 points per hand. Every distance between them is measured in *palm lengths*, not pixels, so leaning toward the camera isn’t a gesture. A pinch that stays still for 320 milliseconds is a hand holding something small, and what it’s holding is a match. The stillness is the key: a pinch that moves is somebody doing something else.

**Your breath is wind.** I don’t use the microphone. The same MediaPipe package ships a face model that scores a shape called `mouthPucker`, which is the shape of blowing. It’s silent, it doesn’t ask for a second permission, and it drives the paper’s wind and cools the fire. One surprise: a resting mouth doesn’t read zero. Beards, lighting and face shapes all move it, and for some people every match went out the moment it lit. So a blow puts a match out only when it *rises* above what your face read at the moment the match lit.

**A real lighter is the one I’m proudest of**, because it isn’t a model at all. It’s arithmetic.

### Seeing a Real Flame Without a Model

A hand tracker knows where your hand is and nothing about what it’s holding. But a flame is the easiest thing in a room for a camera to be sure about. It’s the brightest thing in the frame. It’s warm in a very particular order: lots of red, some green, almost no blue. And unlike a lamp or a window, it never holds still.

Those three facts are the whole detector. Every other frame, the page shrinks the camera image to 320×240 and counts the pixels that pass this test:

```
function isFlame(r, g, b) {
  return r >= 200 && g >= 60 && g <= r * 0.94 && b <= g * 0.55 && r - b >= 110
}
```

The blue bound is tight on purpose. The thing most often mistaken for a flame is a face lit by a warm bulb, and skin keeps more blue than a flame’s fringe does. A webcam also clips the middle of a flame to white, so white pixels count too, but only inside that warm fringe. A lamp is white all the way out.

Brightness and warmth alone still call a desk lamp a flame. The flicker test fixes that. A real flame’s pixel count wanders by a few percent from frame to frame. A lamp’s doesn’t move at all. So the page keeps the last eight counts, and it only reports a flame once that count has visibly moved (a spread of 3% or more) and been seen in at least four of the eight frames. It costs about a quarter of a second before the paper catches, and it buys a page that doesn’t set itself on fire under your desk lamp.

![Diagram: two graphs of warm-pixel count over half a second. A desk lamp draws a flat line and is rejected. A lighter draws a jittering line and is accepted.](https://tympanus.net/codrops/wp-content/uploads/2026/09/diagram-flicker.png?x95600)

There’s a browser test that proves it, with a painted flickering flame and a painted steady lamp, and it fails if the lamp ever lights the paper. It caught me once. The flicker used to be checked only after the history filled up, so for the first third of a second *any* warm lamp counted as a flame. That didn’t matter while seeing a flame only aimed the fire. It became a bug the day seeing a flame could start one.

### The Fire, in Layers

Here is the burn with its layers pulled apart. Each one is a different system, and they only meet at the end.

[](https://tympanus.net/codrops/wp-content/uploads/2026/10/diagram-exploded-optimized.mp4)

One frame of a real burn, taken apart. Bottom to top: the damage grid, the sheet drawing it, the flames, the particles, the light.

**1. The damage grid (CPU).** Underneath everything is a 64×64 grid over the sheet with four numbers per cell: char, water, heat, and how much paper is still there. Heat spreads. Paper that gets hot enough turns to char, and char eats the paper away. The paper has a grain: heat spreads three times faster along the fiber than across it. So a hole never opens as a circle. It opens as a wide oval, about one and a half times wider than it is tall, and a fire lit in a corner runs along the bottom edge faster than it climbs. Nobody drew that oval; it comes out of the grain.

![The burn front drawn every two seconds, from the real simulation: lit in the center it grows as a widening oval, lit in the corner it runs along the bottom edge faster than it climbs](https://tympanus.net/codrops/wp-content/uploads/2026/09/diagram-fibre.png?x95600)

It runs on the CPU for a boring reason: most of the code that reads it runs there too. The cloth physics needs to know which paper is gone, so a piece the fire cuts loose actually falls. The particle emitters shed ash right where paper burned through. A GPU grid would have meant reading pixels back every frame, and phones are the devices that readback slows down the most. The sheet’s shader gets an 8-bit texture uploaded instead.

**2. The burned edge, in millimeters.** Look at a real burned edge and it’s layered, and each layer has a width you can measure. So the sheet draws it in those layers, measured from the cut: a pale **ash lip**, a thin beaded **ember line** (the only part of the paper that gives off light), a black **char** band, and a **scorch** that fades into clean paper with a steep leading edge.

![A labeled cross-section of a burned edge, measured from the cut: hole, ash lip 3.5 mm, ember line 1.25 mm, char 3.5 mm, scorch 9 mm, then clean paper](https://tympanus.net/codrops/wp-content/uploads/2026/09/diagram-edge.png?x95600)

**3. The flames (GPU).** The flames are a real fluid simulation: a small 2D grid on the GPU, the kind real-time fire has been built on since Jos Stam’s *Stable Fluids*. Each step carries everything along the flow, burns fuel, and adds forces (buoyancy, wind, turbulence). It puts back the little eddies that numerical smoothing eats (vorticity confinement). Then it solves for pressure so the air doesn’t compress, except where burning gas expands it.

![Diagram: one step of the solver as a loop: release gas at the rim, carry it along the flow, burn fuel only where air reached it, buoyancy wind and turbulence, give back the small eddies, solve pressure, then draw](https://tympanus.net/codrops/wp-content/uploads/2026/09/diagram-solver.png?x95600)

The flame plane stands upright and always turns to face the camera, so flames rise with the world, not with the paper, whichever way the sheet is tilted.

[](https://tympanus.net/codrops/wp-content/uploads/2026/10/diagram-flame-axes-optimized.mp4)

### A Flame Is Where Fuel Meets Air

My first solver made a fire that looked, in my own words at the time, bad. It took me a while to see why: it was hot smoke colored by temperature. Every cell of the grid was topped back up with oxygen, inside the flame as much as outside it. So fuel burned the instant it left the paper, wherever it was, and the flame was an airbrushed blob.

A real flame is the *surface* where fuel meets air. The fuel inside it can’t burn until air works its way in from the sides, so the fuel core gets eaten from the outside and closes to a point. That point is the tip.

So the rebuilt solver only burns fuel where air has actually reached it, it tracks soot separately, and it draws the flame’s *shape* from soot and its *color* from the heat of burning.

![Four sections of one flame on shared 3D axes: fuel, oxygen, soot and the heat of burning. The fuel core narrows to a point where the oxygen closes in, and that point is the tip of the flame.](https://tympanus.net/codrops/wp-content/uploads/2026/09/diagram-fuel-air.png?x95600)

An illustration of the principle, not a read-out of the solver.

That gives the flame four zones, base to tip, and each one is an option you can tune:

* **Root.** The blue base. Almost off by default, because blue over cream paper reads as lavender.
* **Core.** Pale, and the brightest part of the flame.
* **Body.** Yellow to orange, below paper white.
* **Tip.** Dimmer and redder, where the tongue tears apart.

![A real tongue of flame from the renderer, with its four zones labeled: root, core, body and tip](https://tympanus.net/codrops/wp-content/uploads/2026/09/diagram-zones.png?x95600)

The most useful thing I learned: cooling sets the height. Soot dies when it cools, so how fast the gas cools decides how tall the flame gets. Measured live: at cooling 1.15, flames reach about 150 mm. At 2.1, about 60.

And one art direction I hold the solver to: a fire around a burning hole is a *living, uneven ring*, never a crown. Tall tongues next to short licks, breaking apart and re-forming. So the code that places flames along the rim measures how even their heights are, and if a frame comes out too regular, it scatters the heights again, wider.

The last two layers sit on top of the flames.

**4. What a burn throws off.** Embers and smoke leave the burning front at a rate set by how long the front is, so a fire gets busier as its edge grows. Ash leaves only from the cells that burned through that frame. After the flames, a few beads keep glowing and send up a thread of smoke.

**5. The light.** The burn is a light source. It lights the sheet, glows through it, and the room dims around it, so the fire is the light in the scene. Brightness is set in one unit, *multiples of paper white*, and the bloom threshold (how bright a pixel has to be before it glows) is measured against the brightest paper any lighting preset produces, so the paper itself never blooms.

![The burn from contact to cold, as a strip of seven frames with timestamps: contact, scorch, catch, peak, dying, smolder, cold](https://tympanus.net/codrops/wp-content/uploads/2026/09/diagram-timeline.png?x95600)

### My Taste Is Only the Default

I tuned the fire by eye, in a page I built for it: the **FX Lab**. Every knob behind the burn is laid out around the sheet while it burns. The flame zones, the fluid, the bloom, the light, the ash lip, how fast it eats. You can scrub the burn to any moment and get the same frame every time, because the burn runs on a simulated clock.

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/fx-lab.mp4)

The FX Lab. Every setting behind the burn, laid out around a sheet while it burns.

The library’s defaults *are* that tune. But I didn’t want my taste to be the ceiling. So every design decision I made is a setting with my choice as its default, including how much of the sheet burns: a hole, cut in two, most of it, or all of it. The lab doesn’t guess how long a burn has to run to reach that amount. It actually runs the burn, checks how much burned, corrects, and runs it again, and it lands within a percent in four burns at most. Burn enough to cut the sheet in two and the loose piece falls, because the cloth simulation knows that paper is gone.

[](https://tympanus.net/codrops/wp-content/uploads/2026/10/burn-falls-optimized.mp4)

Burn the sheet in two and the loose piece falls, because the cloth simulation knows that paper is gone.

Wiring a fire into your own sheet looks like this:

```
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Paper, type PaperHandle } from 'paperlab'
import { DamageField, FxFireFluid, FxFireLight, FxPost } from 'paperlab/fx'

const field = new DamageField()

function Fire({ paper }: { paper: React.RefObject<PaperHandle | null> }) {
  const locate = (u: number, v: number) => paper.current?.surfacePoint(u, v) ?? null
  useFrame((_, dt) => field.step(dt))
  return (
    <>
      <FxFireFluid field={field} locate={locate} />
      <FxFireLight field={field} locate={locate} />
      <FxPost field={field} locate={locate} />
    </>
  )
}

export function BurningLetter() {
  const paper = useRef<PaperHandle>(null)
  return (
    <Paper ref={paper} preset="blank-sheet" damage={field}>
      <Fire paper={paper} />
    </Paper>
  )
}

// Hold a flame to the paper for a moment, anywhere on it:
// field.ignite(u, v, radius, amount)
```

The sheet doesn’t know what burned it. `damage` is just a grid of char, water, heat and missing paper, so a live fire, a baked texture and a recorded burn played back all work the same way. And `prefers-reduced-motion` stills the sheet itself: its cloth, its behaviors and its moving deformers. The fire doesn’t read it, so if you wire one in, you decide what a reduced-motion burn looks like.

What’s Next
-----------

paperlab has been all engine so far: geometry, physics, fire. Next it gets the same care on the outside. I’m working on the design and the brand: the editor’s UX and UI, the site, and an identity that looks like a tool made by someone who cares about real paper. It’s in beta for that reason.

After that, a community gallery. Sheets are already data that travels by link, so the missing piece is somewhere for them to land.

And Lights Left On is still waiting. The honest test of this library is whether it can carry the product that created the need for it: the letter, the stamps tearing off their sheet, the wax seal pressing into paper that gives. And one day, a letter you can burn.

[Try it](https://paperlab.nawwara.studio) · [With your hands](https://paperlab.nawwara.studio/hands/) · [The FX Lab](https://paperlab.nawwara.studio/fx-lab/) · [The editor](https://paperlab.nawwara.studio/editor/) · [npm](https://www.npmjs.com/package/paperlab) · [GitHub](https://github.com/NourMtir0722/Paperlab)

[case study](https://tympanus.net/codrops/tag/case-study/) [MediaPipe](https://tympanus.net/codrops/tag/mediapipe/) [React Three Fiber](https://tympanus.net/codrops/tag/react-three-fiber/) [simulation](https://tympanus.net/codrops/tag/simulation/) [Three.js](https://tympanus.net/codrops/tag/three-js/)

![](https://tympanus.net/codrops/wp-content/uploads/2026/10/naw-160x160.jpg?x95600)

### [Noor Mtir](https://tympanus.net/codrops/author/noormtir/)

Nawwara (Noor Mtir) is a product designer and software engineer, and the founder of Nawwara Studio LLC, which does design and development, branding to code.

* [Website](https://nawwara.studio)
* [X](https://x.com/noormtir)
* [Github](https://github.com/NourMtir0722)

### Creative Spotlights

Inside the journeys and portfolios of today's most inspiring [designers](/codrops/tag/designer-spotlight/) and [developers](/codrops/tag/developer-spotlight/).

![](https://tympanus.net/codrops/wp-content/uploads/2026/01/db-social-pf-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2025/12/IMG_0891-160x160.jpg?x95600)

![](https://secure.gravatar.com/avatar/807e846ec3996427e4a1a5491d6836385d91839ec15e3321d89d24f5ca854edc?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2026/03/huy-160x160.jpeg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2025/11/DSC_0112-awwwards-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/04/czYiOaMh_400x400-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/01/Mask-group-scaled-160x160.jpg?x95600)

![](https://secure.gravatar.com/avatar/9d360a8984abc54d8eedfca50873d7cca9d496a59378a0371d3f8ea103a3feb1?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2025/06/1723660337542-160x160.jpeg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2025/08/enrico-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2025/08/profile-160x160.jpg?x95600)

![](https://secure.gravatar.com/avatar/fc9b1a89c25b07be1046c61b6acaaca2a95b8afef8d1d2d22851dd7ba2553b83?s=160&d=retro&r=g)

### [Studio Stories](/codrops/tag/studio-spotlight/)

Discover how studios & agencies started, how they work, and what they've built.

![](https://secure.gravatar.com/avatar/49ae2ca61404d47ccf14b91bec1437e8cdc4e08577afa56a5ba3a452277a8f23?s=160&d=retro&r=g)

![](https://secure.gravatar.com/avatar/3c7e247b86783a78cc69bde393a2e6cc6c6623bf2b5229d4fc46a44268d2e6c5?s=160&d=retro&r=g)

![](https://secure.gravatar.com/avatar/23a6300fe4080c3fbc7d7e6deaa885b96c829a6358c86db198f200f5cb676090?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2026/10/goodsidestudio_logo-160x160.jpeg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2025/03/VAU6V7XG_400x400-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/11/XlbCxbNJ_400x400-160x160.jpg?x95600)

[Read their stories](/codrops/tag/studio-spotlight/)

### [Case Studies](/codrops/tag/case-study/)

Discover the ideas, design, and craft behind today’s most inspiring web experiences.

[View all Case Studies](/codrops/tag/case-study/)

### [Learn with Tutorials](/codrops/category/tutorials/)

Level up your front-end skills with practical, step-by-step tutorials.

[View all Tutorials](/codrops/category/tutorials/)

### [Creative Hub](/codrops/hub/)

A growing showcase of Codrops originals and hand-picked demos from the creative web.

 [Start exploring](/codrops/hub/)

### [Webzibition](/codrops/webzibition/)

💎✨ Discover fresh gems in our handpicked exhibition of over 2,000 standout websites that caught our eye.

[Get inspired](/codrops/webzibition/)

##### Explore the site

* [Home](/codrops/)
* [Creative Hub](/codrops/hub/)
* [Webzibition](/codrops/webzibition/)
* [Case Studies](/codrops/tag/case-study/)
* [Motion Highlights](/codrops/category/articles/ui-interactions-animations-roundups/)

* [All Posts](/codrops/all-posts/)
* [Tutorials](/codrops/category/tutorials/)
* [Studio Spotlights](/codrops/tag/studio-spotlight/)
* [Designer Spotlights](/codrops/tag/designer-spotlight/)
* [Developer Spotlights](/codrops/tag/developer-spotlight/)

* [About](/codrops/about/)
* [Get in touch](/codrops/contact/)
* [Advertise](/codrops/advertise/)
* [Privacy Policy](/codrops/privacy-policy/)
* [License](/codrops/licensing/)

##### Follow Codrops

* [LinkedIn](https://www.linkedin.com/company/codrops)
* [Instagram](https://instagram.com/codropsss)
* [Facebook](https://www.facebook.com/codrops)
* [X (Twitter)](http://www.x.com/codrops)
* [GitHub](https://github.com/codrops)

* **Content delivered by**
* © Codrops 2026

[Support us on
![Patreon logo](https://tympanus.net/codrops/wp-content/themes/codropstheme03/images/patreon_logo.svg?x95600)](https://www.patreon.com/bePatron?u=2516316)