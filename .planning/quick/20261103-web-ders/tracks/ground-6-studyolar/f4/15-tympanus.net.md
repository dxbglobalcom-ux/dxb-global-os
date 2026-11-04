Chasing the Moment: Making a Short Film for the Browser with Three.js and GLSL | Codrops

[Codrops](https://tympanus.net/codrops/)

* [All Posts](https://tympanus.net/codrops/all-posts/)
* [Creative Hub](https://tympanus.net/codrops/hub/)
* [Webzibition](https://tympanus.net/codrops/webzibition/)

By [Canberk Polat](https://tympanus.net/codrops/author/canberkpolat/ "Posts by Canberk Polat") 
in
[Articles](https://tympanus.net/codrops/category/articles/) on
October 12, 2026

Chasing the Moment: Making a Short Film for the Browser with Three.js and GLSL
==============================================================================

How a faceless runner, an endless city and a shattering screen came together in Chasing the Moment, a webfilm built with Three.js and GLSL.

[blender](https://tympanus.net/codrops/tag/blender/) [case study](https://tympanus.net/codrops/tag/case-study/) [glsl](https://tympanus.net/codrops/tag/glsl/) [Three.js](https://tympanus.net/codrops/tag/three-js/) [WebGL](https://tympanus.net/codrops/tag/webgl/)

[![](https://tympanus.net/codrops/wp-content/uploads/2026/10/chasing_frame_featured.jpg?x95600)](https://chasing-the-moment.byholm.co/ "Chasing the Moment: Making a Short Film for the Browser with Three.js and GLSL Demo")

[Visit](https://chasing-the-moment.byholm.co/)

Chasing the Moment is a webfilm, a short film that plays in the browser. It’s about the weight of building something on your own, and Three.js and GLSL became its set, its camera and its lights.

This site came out of a need. I wanted to express myself, and through that, people like me. People who are making something and running toward the moment they’ll be seen, without knowing when it comes.

Don’t get me wrong, I don’t see myself as an artist. I’m just trying to explain how this came out.

In this article I’ll go through both sides: the creative direction, and the techniques behind it.

The film has five stages. In the first, we see a man running through a city. The run never ends. As you scroll, the camera changes angle, and a post-processing transition carries you into the next scene.

[](https://tympanus.net/codrops/wp-content/uploads/2026/10/chasing.mp4)

He’s still running. The run is his effort, his struggle. But behind him there’s a clock he can never get away from, and more clocks drift past from the side. This scene is about the pressure of time.

The next scene has something else: a crowd of heads, all turning toward him. The outside world, people, family, friends watching him, keeping him under surveillance. Their pressure on him.

Then he’s floating in the air, off balance. That’s the feeling of being lost.

![Two panels of the night city with the faceless runner, mid-transition between scenes](https://tympanus.net/codrops/wp-content/uploads/2026/10/chasing-the-moment-transition-1200x900.jpg?x95600)

In the last scene he runs toward a diamond held between two spinning rings. Another infinite run; he never reaches it. But the camera lifts and moves toward the diamond, and just as it gets close, the webfilm ends.

Then the webfilm turns into an invitation.

The main character has no face because he could be anyone building something. He could be a woman. He’s also me, the faceless man running.

I wanted to tell all of this like a short film. Three.js and GLSL were my instruments: my set, my stage, my camera, my lights. When the technical side met a narrative, this is what came out.

The music is Chopin’s Prelude in E minor, Op. 28 No. 4. To my untrained ear, it’s about straining toward something that stays out of reach.

!["Yes I know the struggle" typography over the running figure in the invitation](https://tympanus.net/codrops/wp-content/uploads/2026/10/chasing-the-moment-struggle-1200x900.jpg?x95600)
!["Create yours" text wrapping around a figure in the invitation](https://tympanus.net/codrops/wp-content/uploads/2026/10/chasing-the-moment-create-yours-1200x900.jpg?x95600)
![The "Book a call" card at the end of the invitation](https://tympanus.net/codrops/wp-content/uploads/2026/10/chasing-the-moment-book-a-call-1200x900.jpg?x95600)

Technical Stack
---------------

* **Three.js** — every 3D scene: the five-part film and each section of the invitation
* **Custom GLSL shaders** — procedural building windows, scene transitions, glyph rendering; loaded through vite-plugin-glsl
* **GSAP + ScrollTrigger** — drives the second half; the film runs its own virtual scroll
* **Lenis** — smooth scroll, second half only
* **Blender + Mixamo** — models and character animation, played back with `AnimationMixer`
* **Canvas 2D** — everything printed at runtime: the ticket, glyph atlases, poster typography
* **Web Audio API** — every sound except the music is synthesized in the browser
* **Vite, Vercel, Cloudflare** — build, hosting, edge caching

The Loader
----------

![](https://tympanus.net/codrops/wp-content/uploads/2026/10/image-32-1200x681.jpg?x95600)

I intended the loader to be the first thing that tells you where you are. You came here to watch something like a short film on the web, a webfilm.

Let’s dive into how I made it.

### The ticket itself

The ticket is real geometry, modelled in Blender, with some thickness, punched perforation, torn short edges and a matte paper material. It comes to about 10,600 triangles and 296 KB.

It’s also the only model on the site that isn’t Draco compressed. Draco rounds the numbers when it shrinks a file, and the print depends on the tear line sitting at exactly `u = 0.76`, the seam between the body and the stub. If that number gets rounded, the print shifts a few pixels at the seam.

Both meshes share one UV space, so a single canvas prints across both.

### Printing it

The print is drawn with Canvas 2D at runtime instead of being baked into the model. The date and time come from the visitor’s own clock, so the ticket belongs to the moment you watched the film.

```
const canvas = document.createElement('canvas');
drawTicket(canvas, info);

const print = new THREE.CanvasTexture(canvas);
print.colorSpace = THREE.SRGBColorSpace;
print.flipY = false;
```

So the geometry comes from Blender, and the ink comes from the web.

There’s one small catch: glTF UVs start at the top left, while Three.js flips textures vertically by default, so if you leave `flipY` on, the print comes out upside down.

### Curling the paper

As the loading advances, the ticket drifts closer and the paper starts to curl.

Real paper doesn’t really swell; it folds. There’s a fold line, and everything past it wraps around a cylinder. Since the paper doesn’t stretch, the distance along the flat sheet becomes the arc length around the cylinder, which is what lets a corner roll back over itself.

```
float d = dot(xz, uWrapDir) - uFoldLine;

if (d > 0.0) {
  float r = uFoldRadius;
  float angle = d / r;

  float along = r * sin(angle);
  float depth = r * (1.0 - cos(angle));

  vec2 shift = uWrapDir * (along - d);
  transformed.x += shift.x;
  transformed.z += shift.y;
  transformed.y -= depth;
}
```

`d` is how far past the fold line a vertex sits. Everything before the line stays flat, and past it, dividing that distance by the cylinder radius gives an angle, so `sin` and `cos` can place the vertex on the curl.

### The stub

Browsers won’t start audio without a user gesture, so a choice screen was unavoidable. I just didn’t want it to feel like a separate interface; I wanted it to stay inside the film’s world.

In a cinema the usher tears your ticket and hands you back the stub. Here the stub carries the two options: WITH SOUND, WITHOUT SOUND.

They’re printed onto the stub texture rather than drawn as DOM buttons. A raycast finds which half was touched, and since the text and the hit area come from the same coordinates, the highlight can’t drift off the words.

```
const hit = raycaster.intersectObject(stub, true)[0];
if (!hit || !hit.uv) return -1;

const y = (hit.uv.y - STUB_RECT.v0) / (STUB_RECT.v1 - STUB_RECT.v0);
if (y < 0 || y > 1) return -1;   // back face

return y < 0.5 ? 0 : 1;
```

Rather than glowing or changing colour, the selected half inverts its ink, which keeps it inside the black and white language of the site.

There are real buttons behind this too, visually hidden but focusable, so the door isn’t locked for anyone using a keyboard or a screen reader. Enter picks the silent option, since starting audio for someone who never asked for it didn’t feel like the right default.

### The runner on the ticket

There’s a small window printed on the ticket, and a figure runs inside it.

Rather than a video or a sprite sheet, it’s a second scene, rendered into a texture every frame and sampled by the ticket’s material.

```
const photoRT = new THREE.WebGLRenderTarget(320, 480);

// each frame, while the ticket is on screen
mixer.update(dt);
renderer.setRenderTarget(photoRT);
renderer.render(photoScene, photoCamera);
renderer.setRenderTarget(null);
```

The character is a Mixamo run cycle played back with `AnimationMixer`. One track is removed before playing, because Mixamo bakes root motion into the hips and the figure would otherwise run straight out of frame.

```
clip.tracks = clip.tracks.filter(t => !/Hips\.position$/.test(t.name));
```

The Infinite City
-----------------

![](https://tympanus.net/codrops/wp-content/uploads/2026/10/chs-img-2-1200x680.jpg?x95600)

The buildings started in Blender, but they turned out simple enough that they don’t need to be models. There are seven silhouettes, each one a list of boxes merged into a single geometry in code, so the whole skyline ships as code.

They’re drawn with `InstancedMesh`, so around 200 buildings cost a handful of draw calls. A random quarter turn on placement gives seven types times four rotations, which makes 28 readable variants without adding a single triangle.

### The corridor never ends

Since the run never ends, the city can’t end either, but that doesn’t have to mean endless geometry. Instead, the buildings scroll along Z and wrap back around:

```
float halfTile = uTileLength * 0.5;
float shiftedZ = mod(
  instanceCenter.z + uTime * uScrollSpeed + halfTile,
  uTileLength
) - halfTile;

vec3 finalWorld = vec3(instanceCenter.x, instanceCenter.y, shiftedZ) + vertexOffset;
```

Only the instance centre moves. Each vertex keeps its offset from that centre, so the box stays rigid while the centre slides and wraps. If every vertex were shifted instead, the wrap would catch some corners and not others, tearing the building in half.

That way, a building that leaves the far end simply reappears at the near end.

### Windows generated in the shader

The facade comes from the surface’s own local coordinates, computed in the fragment shader.

It checks which axis a surface faces, takes the two coordinates that lie on it, and builds a grid:

```
vec2 surfaceUv = (an.x > an.z)
  ? vec2(vLocalScaled.z, vLocalScaled.y)
  : vec2(vLocalScaled.x, vLocalScaled.y);

vec2 cellUv = surfaceUv / cellSize;
vec2 cell = floor(cellUv);   // which window
vec2 f = fract(cellUv);      // where inside it
```

This is also why the buildings are axis-aligned boxes: it’s the condition that makes this approach work, and in return, the facades can work from local coordinates alone.

For this to hold, the normal has to be rotated by the instance matrix. If it stays in object space, a building that got a quarter turn still reports that it faces X while the surface now faces Z. The shader then picks the wrong axis, that coordinate stays constant, and the windows collapse into horizontal stripes.

Which windows are lit comes from a hash of the cell index and the instance seed, with ground floors excluded. Each building also gets its own sparsity, so some towers are mostly dark and others mostly awake.

### When the pattern stops resolving

Far away, or on a steeply angled wall, a window can end up smaller than a pixel, and drawing it anyway produces noise. `fwidth` measures how fast the cell coordinate changes per pixel, which covers distance and angle in one number, and past a threshold the grid fades into a flat average.

```
float unresolvable = smoothstep(LOD_START, LOD_END, max(d.x, d.y));
col = mix(col, mix(baseCol, uWindowColor, 0.22), unresolvable * 0.92);
```

Distant city lights do the same thing in real life: you don’t see individual windows, just a combined glow.

The Shatter
-----------

![](https://tympanus.net/codrops/wp-content/uploads/2026/10/image-1-1200x680.png?x95600)

The film ends and the page has to become something else. The screen breaks like glass, the pieces spin away, and the invitation is behind them.

Nothing on the real page actually breaks. The current frame is captured into a texture, that texture goes onto a flat mesh cut into pieces, and then the pieces fly.

### Cracks that read as cracks

The pieces are built from a shared grid of points. The points get jittered first, then the pieces are built from them, so four neighbouring pieces read the same corner. That keeps them locked together, so the cut lines read as real cracks rather than scattered paper.

```
for (let r = 0; r <= rows; r++) {
  for (let c = 0; c <= cols; c++) {
    const edge = r === 0 || r === rows || c === 0 || c === cols;
    const jx = edge ? 0 : (Math.random() - 0.5) * 2 * jitter * cellW;
    const jy = edge ? 0 : (Math.random() - 0.5) * 2 * jitter * cellH;
    pts[r][c] = [-W / 2 + c * cellW + jx, -H / 2 + r * cellH + jy];
  }
}
```

Points on the outer edge get no jitter, because moving those would open a gap along the edge of the screen.

### Each piece carries its own data

Every piece gets its own centre and four random values: delay, spin, push and a seed. They’re written per vertex, the same value across all six vertices of a piece.

```
aCenter[v * 3 + 0] = cx;
aCenter[v * 3 + 1] = cy;
aRandom[v * 4 + 0] = delay;
aRandom[v * 4 + 1] = spin;
aRandom[v * 4 + 2] = push;
aRandom[v * 4 + 3] = seed;
```

The centre is what lets a piece rotate around itself rather than around the screen. In the vertex shader the position is moved into that local space, rotated, and moved back out.

The UV is the piece’s original position on screen, so the image stays glued to the piece as it leaves.

```
uv[v * 2 + 0] = p[0] / W + 0.5;
uv[v * 2 + 1] = p[1] / H + 0.5;
```

The delay is distance from the centre plus a little randomness. Pieces near the middle break first and the crack spreads outward, but not in a clean ring.

One choice mattered more than I expected: the camera is perspective rather than orthographic. With perspective, pieces travelling toward the camera grow as they pass, while in ortho they just slide away and the whole thing feels flat.

Performance
-----------

The budget is 16 ms a frame, and most of the work is making sure nothing expensive happens at the wrong moment.

Shaders are compiled during the loading window rather than on first use. A shader compile is cheap in total, but it can be quite painful when it lands in the middle of a transition.

Lights are turned off by setting their intensity to zero rather than by hiding them. Three.js bakes the light count into the shader source, so a light appearing or disappearing recompiles every material in the scene. Keeping the count fixed costs a few unused calculations per fragment and saves a frame-long freeze.

On phones the diamond drops its transmission entirely and compensates with a darker body colour and a stronger environment map. Transmission makes Three.js render the whole scene a second time, every frame.

Accessibility
-------------

With `prefers-reduced-motion` enabled, the film is skipped completely. Conditional animation runs through `gsap.matchMedia`.

The canvases are `aria-hidden`, and there’s a written version of the film for screen readers. The choice buttons on the ticket stub are real focusable buttons, as described above.

Closing
-------

Thanks for reading. If you’re making something right now, I hope it goes well.

[blender](https://tympanus.net/codrops/tag/blender/) [case study](https://tympanus.net/codrops/tag/case-study/) [glsl](https://tympanus.net/codrops/tag/glsl/) [Three.js](https://tympanus.net/codrops/tag/three-js/) [WebGL](https://tympanus.net/codrops/tag/webgl/)

![](https://tympanus.net/codrops/wp-content/uploads/2026/09/pp-160x160.png?x95600)

### [Canberk Polat](https://tympanus.net/codrops/author/canberkpolat/)

Designer and developer running HOLM, a one-person studio. I build websites around real-time 3D and scroll-driven storytelling. Based in Turkey.

* [Website](https://byholm.co/)
* [X](https://x.com/byHOLMstudio)
* [LinkedIn](https://www.linkedin.com/in/canberk-polat-679bab403/)

### Creative Spotlights

Inside the journeys and portfolios of today's most inspiring [designers](/codrops/tag/designer-spotlight/) and [developers](/codrops/tag/developer-spotlight/).

![](https://secure.gravatar.com/avatar/673ba8ea1ee1d87231a6f5869cc73e976167d7c00a1165eabd9ba81a02854abb?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2026/03/huy-160x160.jpeg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/04/Adrien_Vanderpotte_3423-1-copie-2-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/03/photo-square-400x400-1-160x160.jpg?x95600)

![](https://secure.gravatar.com/avatar/c05ec8c4a1421cac11613d4bd233dc469791b790a1119e83bed9492b226f3784?s=160&d=retro&r=g)

![](https://secure.gravatar.com/avatar/807e846ec3996427e4a1a5491d6836385d91839ec15e3321d89d24f5ca854edc?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2025/08/profile-160x160.jpg?x95600)

![](https://secure.gravatar.com/avatar/45170889b0ad65b440aa85822368f0a822061fc9ebf373f4f7c1f430e097addf?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2025/06/1723660337542-160x160.jpeg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2025/06/1Y4A1982-%D1%81opy-5-160x160.jpg?x95600)

![](https://secure.gravatar.com/avatar/5fcada51aa5e188ba78900105d1e58d88f977c45b87ae90fea631e84eaf0680f?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2026/01/Mask-group-scaled-160x160.jpg?x95600)

### [Studio Stories](/codrops/tag/studio-spotlight/)

Discover how studios & agencies started, how they work, and what they've built.

![](https://secure.gravatar.com/avatar/14d845d8c2c0e1f2ab1107b82c4b9d8a71c4165cb5a44be9b33fa6f1126a03f1?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2026/05/lemma-logo-160x160.png?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/11/XlbCxbNJ_400x400-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/09/gatzara-studio-logo-160x160.png?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/10/goodsidestudio_logo-160x160.jpeg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/07/makemepulse_logo-160x160.jpeg?x95600)

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

Close


Previous

![]()

![]()

Next