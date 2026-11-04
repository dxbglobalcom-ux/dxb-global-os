Vivid: Turning a Visual Experiment Into an Interactive Webflow Experience | Codrops

[Codrops](https://tympanus.net/codrops/)

* [All Posts](https://tympanus.net/codrops/all-posts/)
* [Creative Hub](https://tympanus.net/codrops/hub/)
* [Webzibition](https://tympanus.net/codrops/webzibition/)

By [Serhii Polyvanyi](https://tympanus.net/codrops/author/panpolevan/ "Posts by Serhii Polyvanyi") 
in
[Articles](https://tympanus.net/codrops/category/articles/) on
September 15, 2026

Vivid: Turning a Visual Experiment Into an Interactive Webflow Experience
=========================================================================

Learn how Vivid combines Webflow, custom code, motion, and pixel-based effects to create an interactive visual experience.

[case study](https://tympanus.net/codrops/tag/case-study/) [template](https://tympanus.net/codrops/tag/template/) [Webflow](https://tympanus.net/codrops/tag/webflow/)

[![](https://tympanus.net/codrops/wp-content/uploads/2026/09/article-_-01-cover--scaled.png?x95600)](https://viivid.webflow.io/ "Vivid: Turning a Visual Experiment Into an Interactive Webflow Experience Demo")

[Visit](https://viivid.webflow.io/)

It started with a shot. There was no client brief, no digital strategy deck, no 40 pages explaining why every pixel exists.

It was a visual we made for fun and posted on [Dribbble](https://dribbble.com/blacklead-studio).

People responded to it, and a few asked whether they could get it in [Webflow](https://webflow.com/). That gave us a reason to take the idea further.

Rather than rebuilding the shot as a static website, we wanted to see what would happen if it could move and respond, to make it feel less like a composition and more like something you could actually push against.

That became **Vivid**. Along the way, our developer also decided a conventional scroll wasn’t the right way to move through it.

**You can make this Webflow template yours: [Get Vivid](https://blacklead.gumroad.com/l/vivid)** →

First things first: there is no scroll
--------------------------------------

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/vivid-web-video-record-full-article-1.mp4)

This is easy to miss at first. It looks as though you’re scrolling through a website.

You’re not. There is no page scroll moving you from one section to the next. Instead the page behaves like a sequence of states: a wheel movement, swipe, or scroll gesture is intercepted and translated into one of two intentions — **go forward** or **go backward** — and a state machine takes it from there.

Each section knows how to move forward and backward. While a transition is playing, navigation is locked, so an enthusiastic wheel gesture can’t send the user through several sections at once. There’s also a small queue for the next intention: if you swipe again mid-transition, that input isn’t lost, it waits its turn.

```
window.addEventListener('wheel', e => {
  if (e.deltaY > 0) gatedDown();
  else if (e.deltaY < 0) gatedUp();
}, { passive: true });

function gatedDown() {
  const fresh = !inputActive;
  noteInput(1);
  if (fresh) intentDown();
}

function intentDown() {
  // intent waits in the queue
  if (stageLock) { pendingIntent = 1; return; }
  const step = PageScroll.steps[stage];
  step.forward();
  applyStage(stage + 1);
  // block navigation during the animation
  lockStage();
  animation
}
```

This is all a section needs to declare:

```
PageScroll.register(2, {
  forward()  { /* show process */ },
  backward() { /* reverse process */ }
});
```

It’s more work than a conventional scroll. In return, it gives us control over how one visual state becomes another — and that control is central to how Vivid works.

Let Webflow handle the skeleton
-------------------------------

The page structure lives in [Webflow](https://webflow.com/): typography, layout, styles, states, and everything else you’d expect it to handle. In that sense, [Webflow](https://webflow.com/) is the static skeleton of the project.

Vivid needed more than a skeleton, though.

Webflow Interactions are built around timelines, triggers, and page interaction — useful when something needs to happen as a user scrolls to a section, hovers an element, or clicks a button. Vivid doesn’t have a conventional scroll to trigger off of; its navigation runs on states, queued intentions, and transitions that turn one section into another. That’s where custom code comes in.

Some of what we wanted simply isn’t possible through Webflow Interactions alone. Our pixel transitions work directly with a canvas, pixel data, masks, and compositing. The text shuffle walks through text nodes with a `TreeWalker`, wraps individual characters in spans, and preserves the original HTML without breaking words. The navigation icons are drawn by measuring the length of each SVG path and animating `stroke-dashoffset` with GSAP.

![](https://tympanus.net/codrops/wp-content/uploads/2026/09/%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA-%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0-2026-09-03-%D0%BE-15.13.37-596x900.png?x95600)

**Webflow handles the page. Code handles the weird stuff.** And there’s quite a bit of weird stuff in Vivid.

Making the cursor leave a trace
-------------------------------

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/01_vivid_hero-section-1.mp4)

One of the smaller interactions in Vivid is also one of our favourites: when you move the cursor, the blocks don’t just follow it — they retain a trace of where it’s been.

The cursor position is stored in a circular buffer of 30 points. Each point carries its position, velocity, and timestamp, and those values are passed into a shader as arrays. Each block reads all 30 points and calculates how much it should move based on:

* distance from the cursor;
* how old that cursor position is;
* how fast the cursor was moving;
* and a little bit of randomness.

That last part matters. Without it, the motion looks overly obedient. The random offset introduces a bit of chaos into the trail, so it feels dragged through space rather than tracing a mathematical path — the result **fades out behind the gesture instead of tracking the cursor.**

```
// stable random derived from the block's own coordinates
float r = rnd(gcenter + u_seed);

for (int i = 0; i < TRAIL_SIZE; i++) {
  // how old this cursor position is (offset per block by r)
  float age = (u_now - u_trailTime[i]) + (r * u_trailStagger - u_trailStagger * 0.5);
  if (age < 0.0 || age > u_maxAge) continue;

  // distance from that cursor position
  float dist = length((gcenter - u_trailPos[i]) * vec2(u_res.x / u_res.y, 1.0));
  if (dist >= u_radius) continue;

  vec2  vel        = u_trailVel[i];
  float distFactor = smoothstep(u_radius, 0.0, dist);
  float timeFactor = pow(1.0 - age / u_maxAge, 3.0);
  vec2  scatter    = vec2(r - 0.5, r2 - 0.5) * u_scatter * length(vel);

  // displacement follows the direction of movement, not the cursor
  disp += (vel * u_velScale + scatter) * distFactor * timeFactor;
}
```

It’s a small difference, but it’s part of why the interaction doesn’t feel mechanical.

Pixels are doing a lot of work here
-----------------------------------

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/02_vivid_benefits-2-section-1-1.mp4)

The slider uses another pixel-based transition, though the implementation differs. Instead of rendering a shader every frame, we prepare two versions of each image beforehand — **sharp** and **pixelated** — and a diagonal strip moves between them, using dithering and masks to reveal the new image. The angle changes between slides, and the edge of the strip isn’t perfectly straight: each block gets a slightly different offset, so the transition breaks apart as it moves.

There’s another detail underneath that. The transition isn’t calculated across the entire canvas — before the image loads, the code determines where the actual content ends and the background begins, so the sweep follows the real content area instead of crossing the whole canvas indiscriminately.

```
function sweepAxis(angleDeg, idx) {
  const rad = angleDeg * Math.PI / 180;
  const dx = Math.cos(rad), dy = Math.sin(rad);

  // the axis is measured across the image content, not the canvas
  const box = contentBox[idx];
  // …project the four corners of box onto the axis → min, len

  return { rad, dx, dy, min, len: max - min };
}

for (const c of cells) {
  // where this block sits along the transition axis, 0…1
  const u = ((c.cx * axis.dx + c.cy * axis.dy) - axis.min) / axis.len;

  // c.r is a stable random per block — it breaks up the edge of the strip
  const a = alphaFn(u + (c.r - 0.5) * 2 * jitter);
  if (a <= 0) continue;

  maskCtx.fillStyle = `rgba(0,0,0,${a})`;
  maskCtx.fillRect(c.x, c.y, cellSize, cellSize);
}
```

It’s the kind of detail that’s easy to overlook once the result is working as intended.

Then we brought in Magnific
---------------------------

[Magnific](https://www.magnific.com/) handles another part of the experience: bringing the static imagery to life. The images positioned between the text and backgrounds are animated and loop continuously, giving the page a sense of movement even when nobody is interacting with it. The logo gets extra treatment too — a small Z-axis rotation layered on top of its existing video animation.

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/03_vivid_validated-by-3section-1.mp4)

Magnific isn’t running the whole experience, though. The project is really **Webflow + Magnific + custom code**, each handling a different part of the work: Webflow provides the structure and editing environment, Magnific brings the visual assets to life, and custom code handles the interactions that need more control. It’s less about picking one tool than letting several work together.

Transparent video is, naturally, complicated
--------------------------------------------

There’s one interesting problem hiding inside all those seemingly straightforward videos: transparency. Chrome and Safari don’t handle transparent video the same way, so we can’t serve every browser a single video source.

For Vivid, we use:

* **WebM with VP9** for Chrome
* **MOV with HEVC alpha** for Safari

The videos are embedded in Webflow as regular `<video>` elements. Rather than placing a source directly in `src`, we store the available sources in data attributes, and when the page loads, custom code checks the browser and picks the appropriate version.

![](https://tympanus.net/codrops/wp-content/uploads/2026/09/%D0%97%D0%BD%D1%96%D0%BC%D0%BE%D0%BA-%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0-2026-09-02-%D0%BE-14.42.40-1200x410.png?x95600)

```
function pickSource(video) {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isSafari && video.canPlayType('video/quicktime')) return video.dataset.mov;
  if (video.canPlayType('video/webm; codecs="vp9"'))     return video.dataset.webm;
  return video.dataset.mov;
}

Webflow.push(() => {
  document.querySelectorAll('.keyed-video').forEach(initVideo);
});
```

One video source isn’t enough — the browser gets a choice between the available formats.

The ending isn’t really an ending
---------------------------------

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/05_vivid_footer-05section-1.mp4)

The final transition has another detail: the last video morphs into the logo. At the same time, `resetToStart()` kicks in — it stops active animations, resets the text, clears the section states, and returns everything to its original state. The website doesn’t really end; it loops.

There’s a small safety mechanism here too: the final transition requires two navigation intents before it sends you back to the beginning, so one accidental wheel movement can’t restart the whole experience.

```
const VV_HERO_FROM = 2;

// the canvas morphs into a still frame of the hero, zoomed ×2
layer.setImage(heroStill, VV_HERO_FROM);

PageScroll.register(6, {
  requiredIntents: 2,             // one stray gesture shouldn't restart the site

  forward() {
    // the real DOM section starts at the exact same scale as the texture
    gsap.set(vvHero, { scale: VV_HERO_FROM });

    morphOut();                   // video → still frame
    PageScroll.resetToStart(final);

    // …and from there it keeps moving, now as live markup
    gsap.to(vvHero, { scale: 1, duration: VV_HERO_DUR_S, ease: 'power2.inOut' });
  },

  backward() {
    return false;                 // nowhere left to go back to
  }
});
```

Making the Chaos Reusable
-------------------------

Making Vivid work once was one thing. Turning it into something other people could use was another. The goal was to turn all that custom code into a [Webflow](https://webflow.com/) template without making it dependent on a giant instruction manual.

We kept the Webflow structure as the editable layer. The code is divided into section-specific embeds, each labelled and commented, while the main navigation logic lives separately in the page settings. Each section registers itself with the navigation system, and when you move forward or backward, the navigation tells the relevant section what to do. That means the scroll logic doesn’t need to know how an animation works — only that a section exists and can move forward or backward.

We also tried to keep the things people are most likely to change close to the surface. Slider images, sounds, pixel settings, and navigation themes live in one config. Animation durations and easings sit at the top of each section’s code. CSS classes such as `is--off` and `is--active` control transition states, so some of the timing can be adjusted directly in Webflow. Small data attributes handle the more routine details: `data-shuffle` for animated text, `data-clip` for video, `data-webm` and `data-mov` for transparent video sources.

The template isn’t meant to become a fully declarative website builder — you can’t drag sections around and expect the experience to understand the change automatically. Section order is still defined manually through `register()`; if you add or rearrange sections, you update the relevant indices, navigation themes, and `NAV_LINKS` by hand.

It’s a deliberate trade-off. The alternative would mean adding another abstraction layer on top of an already substantial amount of code, and sometimes the more practical architecture is the one that keeps the system understandable.

![](https://tympanus.net/codrops/wp-content/uploads/2026/09/Cover-Sphere-x-Webflow-V2-1200x900.png?x95600)

Before You Break It
-------------------

Before you take Vivid apart and make it your own, a few things are worth knowing.

The template relies on four libraries: [GSAP](https://gsap.com/), [Three.js](https://threejs.org/), [Swiper](https://swiperjs.com/), and [SplitType](https://splittype.com/?srsltid=AfmBOopOhqT7oTmojW8HqxCYLIHgNBotmMpCHegebc4A6epgM2rtjsoj). GSAP can be enabled directly through Webflow’s settings; the rest load as part of the setup.

Transparent video needs a little more attention. Chrome gets WebM with VP9, Safari gets MOV with HEVC alpha, and the sources are stored separately in data attributes and selected based on the browser — a single transparent video format isn’t enough for both.

If you’re using canvas-based effects, your images and videos also need the right CORS headers, or the browser will display the asset but refuse to let you read its pixels.

The slider has a couple of requirements too: images should share an aspect ratio, and the number of Swiper slides needs to match the number of configured images.

Then there’s a small detail in the navbar: the border. It looks like a simple gradient border with rounded corners, but the implementation is less straightforward than that. `border-image` doesn’t play nicely with `border-radius`, and the classic two-background `background-clip` trick falls apart when the inside of the element needs to stay transparent. Instead, we use a pseudo-element that covers the block with a gradient and cuts out the centre with a mask.

```
.navbar-content::before, .button.is--transparent::before, .dropdown-tag::before {
    content: "";
    position: absolute;
    inset: 0;
    padding: 0.5px;
    background: linear-gradient(0deg, rgba(246, 246, 245, 0.3), rgba(246, 246, 245, 0.12));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    border-radius: inherit
}
```

That’s pretty much the spirit of Vivid. There are pixels, shaders, state machines, browser-specific video formats, and enough custom code to make a conventional website developer pause for a moment.

Underneath all of that, the idea stays simple: it started as a shot. We liked it, people liked it, so we built it. Now it’s a template.

Take it, change the images, rewrite the text, replace the videos, or experiment with the transitions. Make it your own — just keep in mind what you’re getting into.

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/MAIN-Carousel-1600x1200-1-1.mp4)

Made with ❤️ by [BL/S®](https://blacklead.studio/)

[case study](https://tympanus.net/codrops/tag/case-study/) [template](https://tympanus.net/codrops/tag/template/) [Webflow](https://tympanus.net/codrops/tag/webflow/)

![](https://tympanus.net/codrops/wp-content/uploads/2024/10/New-2024_1-160x160.png?x95600)

### [Serhii Polyvanyi](https://tympanus.net/codrops/author/panpolevan/)

Founder & Creative D at BL/S® // DICH® Enterprises 🏴‍☠️ // Award-winning Dude // Independent Art Director

* [X](https://x.com/panpolevan)
* [LinkedIn](https://www.linkedin.com/in/panpolevan/)
* [Instagram](https://www.instagram.com/panpolevan_ux_ui/)
* [Dribbble](https://dribbble.com/k2sper)

### Creative Spotlights

Inside the journeys and portfolios of today's most inspiring [designers](/codrops/tag/designer-spotlight/) and [developers](/codrops/tag/developer-spotlight/).

![](https://secure.gravatar.com/avatar/99b569addccce6ea8f1590f7235496ce07cd80f8718b640946e13da4f75e782e?s=160&d=retro&r=g)

![](https://secure.gravatar.com/avatar/c05ec8c4a1421cac11613d4bd233dc469791b790a1119e83bed9492b226f3784?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2026/04/Adrien_Vanderpotte_3423-1-copie-2-160x160.jpg?x95600)

![](https://secure.gravatar.com/avatar/488434ccd50ba844884eaf12c8ddaee6c2de2b591c614335035524255a5485f7?s=160&d=retro&r=g)

![](https://secure.gravatar.com/avatar/807e846ec3996427e4a1a5491d6836385d91839ec15e3321d89d24f5ca854edc?s=160&d=retro&r=g)

![](https://secure.gravatar.com/avatar/0840447446f9c4dacd7171391e4e1634475d723bc557b93d746cd56b95ab3b43?s=160&d=retro&r=g)

![](https://secure.gravatar.com/avatar/c607d4f442935b1a89e22abff3a811d725e1edb1848d50fbc3295a010b03c978?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2026/09/639b16cc931d28.74339106-160x160.png?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/03/huy-160x160.jpeg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2025/06/1723660337542-160x160.jpeg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2025/08/profile-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/08/IMG_6500-1-scaled-160x160.jpg?x95600)

### [Studio Stories](/codrops/tag/studio-spotlight/)

Discover how studios & agencies started, how they work, and what they've built.

![](https://tympanus.net/codrops/wp-content/uploads/2026/05/Logo-San-Rita-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2025/08/offbrand-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/11/XlbCxbNJ_400x400-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/09/gatzara-studio-logo-160x160.png?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/07/studio_freight_logo-160x160.jpeg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/05/lemma-logo-160x160.png?x95600)

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