Yestalgia: Bringing Decathlon’s ’90s Spirit to Life Through a Playful Digital Experience | Codrops

[Codrops](https://tympanus.net/codrops/)

* [All Posts](https://tympanus.net/codrops/all-posts/)
* [Creative Hub](https://tympanus.net/codrops/hub/)
* [Webzibition](https://tympanus.net/codrops/webzibition/)

By [Quentin Hocdé](https://tympanus.net/codrops/author/quentinhcd/ "Posts by Quentin Hocdé") and [Jonathan Da Costa](https://tympanus.net/codrops/author/jonathan/ "Posts by Jonathan Da Costa") 
in
[Articles](https://tympanus.net/codrops/category/articles/) on
September 12, 2026

Yestalgia: Bringing Decathlon’s ’90s Spirit to Life Through a Playful Digital Experience
========================================================================================

A closer look at how Yestalgia brings Decathlon’s ’90s-inspired vision to the web through art direction, interaction, animation, and creative development.

[case study](https://tympanus.net/codrops/tag/case-study/) [GSAP](https://tympanus.net/codrops/tag/gsap/) [rive](https://tympanus.net/codrops/tag/rive/) [wordpress](https://tympanus.net/codrops/tag/wordpress/)

[![](https://tympanus.net/codrops/wp-content/uploads/2026/09/yestalgia.jpg?x95600)](https://decathlonyestalgia.com/ "Yestalgia: Bringing Decathlon’s ’90s Spirit to Life Through a Playful Digital Experience Demo")

[Visit](https://decathlonyestalgia.com/)

For the launch of Yestalgia, Decathlon’s exclusive capsule collection, our mission was to design and develop a dedicated digital experience celebrating the brand’s reinterpretation of the 1990s.

Built around a curated selection of archival pieces reimagined through a contemporary lens, the collection embraces the optimistic spirit, bold colors, and playful aesthetics of the decade while remaining unmistakably modern.

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/Decathlon-Yestalgia-Promotion.mp4)

Design
------

The visual identity, created in collaboration with [Dalkhafine](https://www.instagram.com/dalkhafine), combines vibrant illustrations, expressive typography, and nostalgic references to immerse visitors in a world where outdoor heritage meets pop culture.

Our challenge was to translate this rich creative direction into an engaging, high-performance web experience that could support the product launch while preserving the personality and energy of the campaign.

### A Product-First Editorial Approach

The layout combines highly editorial sequences where imagery and products take center stage. Large-scale visuals, generous compositions and minimal interface elements allow each piece to be discovered almost instantly, creating a browsing experience that feels closer to flipping through a campaign than navigating a traditional product catalogue.

![](https://tympanus.net/codrops/wp-content/uploads/2026/09/image-17-1200x675.png?x95600)

### Bringing the Campaign into the Interface

To connect these product-focused moments with the wider campaign identity, we introduced purely graphic sections where typography, shapes and movement take over. These sequences act as visual interludes throughout the experience, shifting the rhythm and bringing the playful energy of Yestalgia directly into the interface.

Rather than treating the campaign assets as decoration, we used them as part of the site’s visual language, creating a constant dialogue between product, typography, illustration and interaction.

![](https://tympanus.net/codrops/wp-content/uploads/2026/09/image-18-1200x675.png?x95600)

### The Walkman

One of the experience’s most distinctive elements is the navigation itself.

Inspired by the collection’s 90s references, the menu becomes a cassette player, with each tape representing a different destination within the website. Selecting a cassette transforms a familiar navigation pattern into a playful interaction, turning something purely functional into a small piece of storytelling.

It became a way to make the nostalgic concept tangible without compromising the simplicity of the experience.

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/Menu.mp4)

### A 90’ Graphic Thread

Shapes and lines run throughout the website as a recurring graphic thread, connecting its different components and sections.

Subtle micro-interactions bring these elements to life: lines extend, shapes shift and graphic details react as users move through the experience. Rather than relying on large effects, motion is embedded into the visual system itself, creating continuity between typography, imagery, illustration and interface.

Together, these details give the website its rhythm and make the campaign feel alive beyond its static visual identity.

![](https://tympanus.net/codrops/wp-content/uploads/2026/09/image-19-1200x675.png?x95600)![](https://tympanus.net/codrops/wp-content/uploads/2026/09/image-20-1200x675.png?x95600)

### Animation

Building on the artist’s illustrations, we created a series of looping animations that bring the graphic universe to life. Used throughout the experience, these subtle sequences add rhythm, depth and a sense of continuous movement to the website.

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/anim-1.mp4)

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/anim-2.mp4)

Development
-----------

### The real challenge: a creative site the client can actually update

Yestalgia is a WordPress site on a fully custom theme, shipped in **7 languages**. The animations are the visible part, but the harder constraint was invisible: a heavily art-directed site still has to be genuinely easy to update.

So every section of the site is a **Blockstudio** block: a `json` schema and a `twig` template. The page is assembled from those blocks, which means the client can reorder, recompose and swap content without touching code and without breaking the art direction.

On the front-end, the whole site runs on **piecesjs**, a tiny framework built on native web components, offering a suite of tools and utilities tailored for creative websites, where each `Piece` is an autonomous element that lazy-imports only its own JS and CSS. On top of it we carry a library of utilities from project to project, and the one that matters most here is our `Scroll` Piece. It plugs **Lenis** into **GSAP ScrollTrigger** and centralises everything scroll-related behind data attributes, so interactivity is wired straight in the markup.

### The menu: a walkman you can load 📼

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/menu-1.mp4)

This was the biggest challenge of the project and the part I enjoyed most. A Walkman rises into frame, the cassettes slide out, and when you pick one you genuinely feel it snap back into the deck before the whole device drops away to reveal your chosen section.

Getting that loop to feel physical came out of a back-and-forth between development and motion design. I built a first working version straight from the design, knowing the intent was for the cassettes to come out of the Walkman and slide back in on click. Michal, the motion designer, then took that base and reworked it, pushing the easings, delays and durations much further than I had, which is what makes it live as a real object rather than a set of tweens. I ported those settings back into the code to fine-tune the interaction.

A small detail on close, the walkman dips and snaps back over two very short tweens. That bounce is like the “click” of a cassette seating in the slot. Around that: hovering a menu item swaps the background color and its matching sunset layer and mobile gets a haptic pulse.

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/tape.mp4)

One small detail you may have missed

### Big title reveals

These are the large scroll-triggered headlines, and their signature detail is a fake-3D extruded thickness. There is no 3D anywhere: each character (each word on mobile) is doubled with a duplicate that rides slightly behind it, faking an embossed depth on the type as the letters slide into place.

The animation is driven by two offsets. A stagger between each letter walks the reveal across the line, and a delay between a letter and its duplicate is what creates the depth. To keep the effect lively, the fade-in runs much faster than the translate.

On mobile we split by words instead of characters to improve performances. A reduced-motion is also set: every duration, stagger and delay drops to zero, so the headline still assembles itself, it just does it instantly.

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/titles.mp4)

### Rive for the vector animations

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/anim_2.mp4)[](https://tympanus.net/codrops/wp-content/uploads/2026/09/anim-1-1.mp4)

Every Rive loop is gated by an intersection observer: animations start when they enter the viewport and pause the moment they leave, so we never burn GPU on motion nobody can see.

The reduced-motion is also set up here. Rather than skipping the animation, we scrub it straight to its last frame, the composition still reads exactly as designed, it just doesn’t move.

### Motion declared in markup

Two small primitives cover most of the decorative motion on the site, and neither of them needs new JavaScript to be reused.

```
<c-timeline
    cid='TimelineUID'
    class='c-timeline'
    data-scroll-item
    data-timeline-from='{"x":"50%","y":"150%", "rotate":"-45deg"}'
    data-timeline-to='{"x":"-50%","y":"-150%", "rotate":"45deg"}'
    data-scroll-progress-call='progress,Timeline'>
    <!-- My element -->
</c-timeline>
```

The first is a generic scroll-driven timeline component whose entire definition lives in the HTML: a from state, a to state, an optional easing and duration, plus a variant for portrait screens. The markup can also declare, optionally, where in the viewport the animation should start playing and where it should stop, so the same component can be tuned per section without a line of new code. The component parses those values, builds a GSAP timeline, and the `Scroll Piece` drives its progress as the element crosses the viewport. Dozens of animations across the site are built this way, declared entirely in the markup.

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/intro-satellite-timeline.mp4)

The second is the satellite, the small decorative elements that rotate endlessly. Each one picks a random starting angle and direction so no two are in sync, and the rotation runs on **Tempus**, a single shared animation loop for the whole page, normalized against delta time so the speed is identical at 60 or 120fps. Satellites subscribe when they enter the viewport and unsubscribe when they leave, so one that’s off screen costs nothing at all.

### The infinite draggable carousel

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/Enregistrement_de_lecran_2026-07-24_a_11.44.04.mp4)

The fullscreen infinite carousel is built on GSAP’s seamless-loop technique: a master timeline choreographs each card’s position, scale and tilt. Every other card tilts the opposite way, which gives a fun rhythm. The carousel magnets onto the nearest slide, and the newly active card triggers its own title reveal with a synchronization between slides and titles managed by piecesjs.

### The footer lookbook

[](https://tympanus.net/codrops/wp-content/uploads/2026/09/Lookbook.mp4)

Another fun challenge on this project. Only one image is ever open at a time, and the section had to keep exactly the same total height throughout, so browsing the lookbook never makes the rest of the page jump under you.

The tricky part was timing. Each image has to start opening at the right moment relative to its title, while the surrounding content is already being pushed around by whichever image opened above or below it. Getting that to feel seamless came down to a lot of small adjustments.

### Tech stack

**For the back-end:** WordPress with a custom theme based on **Timber**, **Blockstudio** for a visual block editor, **Polylang** for the 7 languages.

**For the front-end**:

* **piecesjs** to drive the front-end with native web components ([the Codrops intro](https://tympanus.net/codrops/2024/10/21/getting-started-with-piecesjs-building-native-web-components-with-a-lightweight-framework/))
* **Tailwind v4** and PostCSS
* **GSAP** for motion (with ScrollTrigger, Draggable and SplitText)
* **Lenis** for smooth scroll
* **Rive** for the vector animations
* **Tempus** as the single shared animation loop
* **web-haptics** for mobile feedback
* Built with vite

[case study](https://tympanus.net/codrops/tag/case-study/) [GSAP](https://tympanus.net/codrops/tag/gsap/) [rive](https://tympanus.net/codrops/tag/rive/) [wordpress](https://tympanus.net/codrops/tag/wordpress/)

![](https://secure.gravatar.com/avatar/3677a8823f903e5282a1f8e4c37c08391e51fc7540a8193486a2d16942e238c7?s=160&d=retro&r=g)

### [Quentin Hocdé](https://tympanus.net/codrops/author/quentinhcd/)

Independent Creative & Interactive Developer -
Collaborating with Index Studio & ex lead front-end at Locomotive
» Inquiries: hello@quentinhocde.com

* [Website](https://quentinhocde.com/)
* [X](https://twitter.com/quentinhocde)
* [LinkedIn](https://www.linkedin.com/in/quentinhocde/)
* [Instagram](https://instagram.com/quentin_internet)
* [Github](https://github.com/quentinhocde)

![](https://tympanus.net/codrops/wp-content/uploads/2026/09/jonathan-160x160.jpeg?x95600)

### [Jonathan Da Costa](https://tympanus.net/codrops/author/jonathan/)

Founder & creative director at Index Studio

* [Website](https://index.studio)
* [X](https://x.com/jonathandc)
* [LinkedIn](https://www.linkedin.com/in/jonathandc/)
* [Behance](https://www.behance.net/jonathandc)

### Creative Spotlights

Inside the journeys and portfolios of today's most inspiring [designers](/codrops/tag/designer-spotlight/) and [developers](/codrops/tag/developer-spotlight/).

![](https://tympanus.net/codrops/wp-content/uploads/2026/03/huy-160x160.jpeg?x95600)

![](https://secure.gravatar.com/avatar/6f4def39f0c4360f11ad0aa4de30e35200ae1c5f1365f7c7249837ba3ad7f0f7?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2026/04/Adrien_Vanderpotte_3423-1-copie-2-160x160.jpg?x95600)

![](https://secure.gravatar.com/avatar/0840447446f9c4dacd7171391e4e1634475d723bc557b93d746cd56b95ab3b43?s=160&d=retro&r=g)

![](https://secure.gravatar.com/avatar/673ba8ea1ee1d87231a6f5869cc73e976167d7c00a1165eabd9ba81a02854abb?s=160&d=retro&r=g)

![](https://secure.gravatar.com/avatar/f1b0cc5150146515b715a7ee44b8d15b84ae1eb088fcc44d8a7130ae1c0a8d95?s=160&d=retro&r=g)

![](https://secure.gravatar.com/avatar/2e189e28555b71adbaad5137cd62e1e333be596f3a4f89ec14d2c60e736049ba?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2026/09/639b16cc931d28.74339106-160x160.png?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2025/09/celia-160x160.jpeg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/08/IMG_6500-1-scaled-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/03/maria-160x160.jpeg?x95600)

![](https://secure.gravatar.com/avatar/9d360a8984abc54d8eedfca50873d7cca9d496a59378a0371d3f8ea103a3feb1?s=160&d=retro&r=g)

### [Studio Stories](/codrops/tag/studio-spotlight/)

Discover how studios & agencies started, how they work, and what they've built.

![](https://tympanus.net/codrops/wp-content/uploads/2026/11/XlbCxbNJ_400x400-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2025/03/VAU6V7XG_400x400-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2025/08/offbrand-160x160.jpg?x95600)

![](https://secure.gravatar.com/avatar/3c7e247b86783a78cc69bde393a2e6cc6c6623bf2b5229d4fc46a44268d2e6c5?s=160&d=retro&r=g)

![](https://secure.gravatar.com/avatar/49ae2ca61404d47ccf14b91bec1437e8cdc4e08577afa56a5ba3a452277a8f23?s=160&d=retro&r=g)

![](https://secure.gravatar.com/avatar/14d845d8c2c0e1f2ab1107b82c4b9d8a71c4165cb5a44be9b33fa6f1126a03f1?s=160&d=retro&r=g)

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