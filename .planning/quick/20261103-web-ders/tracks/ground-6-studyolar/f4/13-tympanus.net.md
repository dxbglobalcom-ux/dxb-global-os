Songs of Hyrule: From a Fan’s Idea to a Three.js Mini-Game in a Few Days | Codrops

[Codrops](https://tympanus.net/codrops/)

* [All Posts](https://tympanus.net/codrops/all-posts/)
* [Creative Hub](https://tympanus.net/codrops/hub/)
* [Webzibition](https://tympanus.net/codrops/webzibition/)

By [Thibaut Lefrançois](https://tympanus.net/codrops/author/thibautlefrancois/ "Posts by Thibaut Lefrançois") 
in
[Articles](https://tympanus.net/codrops/category/articles/) on
October 27, 2026

Songs of Hyrule: From a Fan’s Idea to a Three.js Mini-Game in a Few Days
========================================================================

A Three.js mini-game for playing the Ocarina of Time songs in the browser, with song recognition, a song book and self-steering fairies.

[audio](https://tympanus.net/codrops/tag/audio/) [case study](https://tympanus.net/codrops/tag/case-study/) [game](https://tympanus.net/codrops/tag/game/) [GSAP](https://tympanus.net/codrops/tag/gsap/) [Three.js](https://tympanus.net/codrops/tag/three-js/)

[![The Ocarina scene: a blue ocarina floating above a tree stump in the middle of Link's house, with glowing fairies around it, on a warm dark background with blue and pink glows.](https://tympanus.net/codrops/wp-content/uploads/2026/10/ocarina-cover.jpg?x95600)](https://ocarina.thibaut-lefrancois.com/ "Songs of Hyrule: From a Fan’s Idea to a Three.js Mini-Game in a Few Days Demo")

[Demo](https://ocarina.thibaut-lefrancois.com/)
[Code](https://github.com/thibautlfr/ocarina)

A few days after the trailer for the *Ocarina of Time* remake, I wanted to play the ocarina again, this time in the browser: on the keyboard or under a fingertip, with the instrument resting on the tree stump in the middle of Link’s house.

Ocarina is a small Three.js experience. Every key plays the same note as in the game, with the original sound. The songs of *Ocarina of Time* and *Majora’s Mask* are recognized as soon as you play them, and a song book keeps track of the ones you have learned. The experience is live at [ocarina.thibaut-lefrancois.com](https://ocarina.thibaut-lefrancois.com) and its code is public on [GitHub](https://github.com/thibautlfr/ocarina).

I am a freelance full-stack developer based in La Rochelle, France, specialized in Java and Vue.js. Day to day, I mostly design backend systems; outside client work, I experiment with WebGL.

[](https://tympanus.net/codrops/wp-content/uploads/2026/10/01-experience-20s-v2-optimized.mp4)

Press Start, a few notes, then Zelda’s Lullaby recognized and replayed. Best with sound.

A Trailer, a Conference and Three Days
--------------------------------------

I love video games, and I am a big fan of Zelda, for its level design that never stops impressing me and for its lore, which I absorbed from a very young age watching my father play.

The *Ocarina of Time* remake for Nintendo Switch 2 had been announced earlier in the year, for the series’ 40th anniversary. But it was the [September 8 trailer](https://www.youtube.com/watch?v=8v8eDMh1o3g) that set everything off: even though it is a remake, Nintendo added new features around the ocarina. You will be able to hum the notes into the console’s microphone, play them on a real instrument, or practice on a virtual ocarina in the Zelda Notes companion app.

Two days later, on September 10 and 11, the first [Three.js Conf](https://threejs.paris/) took place in Paris (Codrops covered it in [Inside the First Three.js Conference in Paris](https://tympanus.net/codrops/2026/09/10/inside-the-first-three-js-conference-in-paris/)). The idea for the project arrived right at that moment, and I wanted to use it to apply the speakers’ advice about creativity on the web. Vicente Lucendo presented his work, from [Messenger](https://messenger.abeto.co) to [Igloo Inc.](https://www.igloo.inc), and Bruno Simon, the creator of Three.js Journey, gave a talk on what makes a web experience work: “[Seven Golden Rules for Creating Web Experiences](https://ics.media/en/entry/260925/#seven-golden-rules-for-creating-web-experiences)“. His seven rules became my brief:

* Animate everything.
* Keep it running smoothly on every device.
* Have one distinctive feature.
* Iterate quickly.
* Keep people entertained.
* Treat sound as a core feature, not an afterthought.
* Plant seeds early and let them grow.

I built most of it in three days. About ten friends tested it, then I released it a week later and started talking about it. I wanted this small fan experience to become a real mini-game, one that slips into your pocket and brings back memories for fans who, like me, can’t wait for the remake on Switch 2.

Tools and Method
----------------

No framework: vanilla [Three.js](https://threejs.org/), with [TypeScript](https://www.typescriptlang.org/) and [Vite](https://vite.dev/). The experience relies almost entirely on 3D, and I had no complex UI needs that would have pushed me toward React with React Three Fiber, for example. The menus are plain native `<dialog>` elements.

Around Three.js, I kept the tools few: [GSAP](https://gsap.com/) for the ocarina’s reactions and the camera move at startup, [mitt](https://github.com/developit/mitt) to let the classes talk to each other, [lil-gui](https://lil-gui.georgealways.com/) and [stats-gl](https://github.com/RenaudRohlinger/stats-gl) to tune and monitor the scene. I also took the chance to try [Biome](https://biomejs.dev/), which replaces Prettier and ESLint with a single tool and is promising for its speed. The icons and menus went through [Figma](https://www.figma.com/), and the 3D models come from the internet.

One Experience, Many Events
---------------------------

The project starts from my [Three.js boilerplate](https://github.com/thibautlfr/threejs-boilerplate), which provides a scene with a few helpers, a typed asset loader, a debug panel, and above all the architecture I learned in [Three.js Journey](https://threejs-journey.com/): a root object, `Experience`, that creates and manages everything else. The whole thing is typed fairly strictly (TypeScript in strict mode, a singleton, readonly members, a `destroy()` method on every class), and each class fetches what it needs with `Experience.getInstance()` instead of having it passed in.

```
// src/experience/experience.ts (simplified)

export default class Experience {
	private static instance: Experience | null = null;
	static getInstance(canvas?: HTMLCanvasElement): Experience {
		if (Experience.instance) return Experience.instance;
		if (!canvas) throw new Error("Canvas is required to initialize Experience");
		// The constructor registers the instance first: the classes it creates
		// call getInstance() themselves
		return new Experience(canvas);
	}

	private constructor(canvas: HTMLCanvasElement) {
		Experience.instance = this;
		this.debug = new Debug();
		this.settings = new Settings();
		this.sizes = new Sizes();
		this.time = new Time();
		this.keyboard = new Keyboard();
		this.songDetector = new SongDetector();
		this.songProgress = new SongProgress();
		this.scene = new THREE.Scene();
		this.resources = new Resources(sources);
		this.sampler = new OcarinaSampler();
		this.camera = new Camera();
		this.renderer = new Renderer();
		this.world = new World();
		// … then the menus, the song book, the touch controls and the title screen
	}
}
```

The instance is registered before the constructor creates anything, so every class can call `getInstance()` during its own construction, and the initialization order follows the dependencies (the keyboard before the song detector that listens to it, for example). The rest of the code is organized by domain:

```
src/
├── main.ts
├── experience/
│   ├── experience.ts      # the root, the singleton
│   ├── camera.ts
│   ├── renderer.ts
│   ├── settings.ts
│   ├── sources.ts
│   ├── ocarina-buttons.ts
│   ├── audio/             # the sampler, the vibrato, the menu sounds
│   ├── input/             # the keyboard, which the touch controls also go through
│   ├── songs/             # the songs, their detection, progress, the replay
│   ├── ui/                # menus, song book, title screen, touch controls
│   │   └── pixel/         # the pixel art SVGs exported from Figma
│   ├── utils/             # debug, events, loading, sizes, storage, time…
│   └── world/             # the house, the ocarina, the fairies
└── styles/
```

To let these classes talk to each other, I use mitt, an event emitter that weighs less than 200 bytes gzipped. I don’t need a Zustand-style store, because the state stays in the classes (the settings in `Settings`, the learned songs in `SongProgress`); mitt only tells the others when something happens. Each module has its own typed emitter, and a small helper, `listen()`, returns the unsubscribe function that each class calls in its `destroy()`.

![Diagram of the event flow. The keys and the touch controls feed the Keyboard, which emits noteDown to two listeners: the OcarinaSampler, which plays the sound and emits noteOn to the Ocarina's animation, and the SongDetector, which emits songPlayed to SongPlayback and SongProgress; SongProgress then emits learn and change to the toast and the song book.](https://tympanus.net/codrops/wp-content/uploads/2026/10/02-event-flow-v3-1200x548.png?x95600)

The sampler and the song detector both listen to noteDown, so the sound never waits for the song recognition.

The boilerplate also brings the debug panel, available in production by adding `#debug` to the URL (the `h` key hides it). stats-gl lets me monitor performance and resource usage, and lil-gui exposes everything that is tuned by ear or by eye: the sound, the ocarina’s reaction, the fairies, the lights, the camera. On the performance side, the scene has no post-processing, and the pixel ratio is capped at 2.

![The Ocarina site with the lil-gui debug panel open on its Sound, Press and Fairies folders, and the stats-gl monitor in the corner.](https://tympanus.net/codrops/wp-content/uploads/2026/10/03-debug-panel-v2-1200x750.png?x95600)

Add `#debug` to the URL and the live site shows its tuning panel and its frame stats.

### Assets That Are Not Mine

The models come from fan creators, two of them under a CC BY 4.0 license. Link’s house and the sounds come from fan archives. Everything remains the property of Nintendo, nothing is redistributed in the public repository, and the project is non-commercial. The credits are in the site’s About menu and in the README.

In practice, the public repository only contains the code, and the binary files live in a private repository. At build time, GitHub Actions fetches them with a read-only deploy key, and a script (`scripts/assets.mjs`) checks each file’s SHA-256 hash before copying it. The site of course serves these files to the browser, but you won’t find them in the code or in its history. The models are compressed with Meshopt and WebP textures, without `gltf-transform optimize`, which would merge the nodes that the code looks up by name.

![Diagram of the deployment: a push to main on the public repository starts GitHub Actions, which checks out the code, loads a read-only deploy key, fetches the assets from the private repository and checks their SHA-256 hashes against a manifest, builds the site and deploys it to GitHub Pages.](https://tympanus.net/codrops/wp-content/uploads/2026/10/04-deploy-pipeline-v3-1200x501.png?x95600)

A hash mismatch or a missing file fails the build, so the site is never deployed without the real assets.

The Journey, Step by Step
-------------------------

Ocarina fits on a single screen, so I will follow a player from the title screen to the completed song book.

### Press Start

The experience opens on a title screen, with a loading gauge drawn like the game’s magic meter. Browsers only allow sound after a user gesture (iOS only on certain events), so the “Press Start” also unlocks the audio. At startup, the ocarina plays three notes, so you hear that the sound is on, and the camera turns slightly, a sign that you can rotate it.

Keys are read by their physical position (`KeyboardEvent.code`): Space for A, and the arrows or WASD (ZQSD on an AZERTY keyboard) for the C buttons. On mobile, on-screen buttons go through the same module as the keyboard: you can slide a finger from one to another, hold several at once, and each note vibrates where the browser allows it.

[](https://tympanus.net/codrops/wp-content/uploads/2026/10/05-touch-portrait-v2-optimized.mp4)

On a phone, a finger slides from one button to the next, then holds two at once. The touch controls go through the same module as the keyboard. Best with sound.

### The First Note

The ocarina floats above the stump, in the middle of Link’s house. To place it, I first tested with hard-coded values, then I added an empty node, `ocarina_anchor`, to the house model, which the code looks up by name. It is the only lit object in the scene: the house keeps its original lighting, baked into its vertex colors, and the ocarina’s reflections come from a single capture of the room.

As in the game, it has five notes (D, F, A, B and high D), one per button on the N64 controller. The fan archive where I found the sounds offered each note in short, medium, long and “loopable” versions: I took the loops, so that a note lasts as long as the key is held down.

The ocarina doesn’t listen to the keyboard but to the sampler, the part that makes the sound, so notes played live and notes from the replays animate it the same way. It floats on a simple sine wave, turns to always show its holes and its Triforce to the camera, and each button has its own pose: A pushes it down a little, the C buttons tilt it in their direction.

```
// src/experience/world/ocarina.ts (simplified)

// In the constructor: the ocarina follows what the sampler plays
this.disposables.add(
	listen(sampler.emitter, "noteOn", (button) => this.playPress(button)),
	listen(sampler.emitter, "noteOff", () => this.releasePress()),
);

// Gentle ease into the pose, then a few damped swings that settle and hold
private playPress(button: OcarinaButton) {
	this.stopPress();
	const { attack, duration, holdReturn, holdCycles, holdDecay } = this.pressParams;
	const pose = this.scaledPose(button, 1);

	this.pressTimeline = gsap
		.timeline()
		.to(this.press, { ...pose, duration: attack, ease: "sine.out" });

	let swing = holdReturn;
	for (let i = 0; i < holdCycles; i++) {
		// Each swing is smaller and slightly slower than the last
		const swingDuration = duration * (1 + i * SWING_SLOWDOWN);
		this.pressTimeline
			.to(this.press, { ...this.scaledPose(button, 1 - swing), duration: swingDuration, ease: "sine.inOut" })
			.to(this.press, { ...pose, duration: swingDuration, ease: "sine.inOut" });
		swing *= holdDecay;
	}
}
```

GSAP brings the ocarina into the pose, then chains a few swings, smaller and slower each time, as long as the note is held. On release, a `gsap.to()` with `back.out` brings it back to rest with a slight bounce.

[](https://tympanus.net/codrops/wp-content/uploads/2026/10/06-ocarina-closeup-v2-optimized.mp4)

The five buttons one after the other, then a held note that swings and a release that bounces back. Best with sound.

### The First Song

The 21 songs are written as small scores, in the controller’s notation: a button symbol followed by a number of beats. Zelda’s Lullaby is written `"<2 ^1 >3 <2 ^1 >3"`. The detector keeps a history of the last notes and checks, on every new note, whether it ends with a known song. The rhythm is only used for the replay.

```
// src/experience/songs/song-detector.ts (simplified)

const HISTORY_LENGTH = Math.max(...songs.map((song) => song.buttons.length));

const endsWith = (history: readonly OcarinaButton[], buttons: readonly OcarinaButton[]) =>
	history.length >= buttons.length &&
	buttons.every(
		(button, i) => history[history.length - buttons.length + i] === button,
	);

// In the constructor, on every noteDown from the keyboard
const onNoteDown = (button: OcarinaButton) => {
	if (!settings.values.songRecognition) return;

	this.history.push(button);
	if (this.history.length > HISTORY_LENGTH) this.history.shift();

	const song = songs.find((s) => endsWith(this.history, s.buttons));
	if (!song) return;

	this.history = [];
	// Let every other noteDown listener handle the song's last note first
	queueMicrotask(() => this.emitter.emit("songPlayed", song));
};
```

`queueMicrotask` lets the sound and the animation handle the last note before the song is announced. And since a song that ends with another one would never be recognized, a test checks that none of the 21 does.

Once the song is recognized, the last note rings out, the game’s jingle plays, then the ocarina replays the song in rhythm, with a light vibrato on the long notes, while the keyboard stays locked. The first time, a toast announces “You learned Zelda’s Lullaby!” and a badge blinks on the song book’s button.

The book is based on the Quest Status screen of *Ocarina of Time*‘s inventory: each song is a colored note, arranged as in the game, with a staff for the selected song and a switch to move to *Majora’s Mask*. Songs not yet learned stay grayed out, but you can listen to them while the staff lights up note by note: the book is also a score, and a song only counts as learned when you play it yourself. For those who don’t know the melodies, a “Learn a song” hint appears if no song has been recognized eight seconds after the first note.

[](https://tympanus.net/codrops/wp-content/uploads/2026/10/07-song-recognized-v2-optimized.mp4)

The last note, the jingle, the replay in rhythm, then the toast and the badge on the song book. Best with sound.

### The Fairies

To make the scene a little more alive, I added four fairies, in the colors of Navi, of the fairies from *Majora’s Mask* and of a Great Fairy. The Navi model I found had a sphere body of 31,000 vertices: I only kept the wings, with a Three.js sphere of 221 vertices in the middle. For the glow, I kept it simple: an additive sprite, and a small point light that tints the ocarina when a fairy flies close. The halo texture is computed pixel by pixel: in a canvas, WebKit dithered the gradient.

I wanted natural movement that avoids the stump without wandering too far. That is where I discovered Craig Reynolds’ [steering behaviors](https://www.red3d.com/cwr/steer/): on every frame, you add a steering force to the velocity, the difference between the desired velocity and the current one. Each fairy aims for a random point in the room, away from the stump, and slows down as it gets close: that is the *arrival* behavior. A push moves it away from the ocarina and the camera when it gets too close, and it never leaves the room.

The first version of this code worked, but it was Reynolds buried in anonymous math: you already had to know the formulas to recognize them. Since moving characters naturally is something we need very often, I turned it into a small open-source library, [steerkit](https://steerkit.thibaut-lefrancois.com). It gives each behavior a name and covers most of Reynolds’ catalog: `arrive`, `wander` or `keepAway`, pursuit and evasion, group behaviors (`separation`, `cohesion`, `alignment`), path following, obstacle avoidance… It works with any engine, `THREE.Vector3` included, and offers an optional Three.js adapter. Ocarina’s fairies are its first users. On every frame, each one adds up a few named forces, then `step` caps the force and the speed and moves it forward.

```
import { add, arrive, brake, keepAway, step, zero } from "steerkit";

fly(dt: number, camera: Vec3, celebration: Celebration) {
	const { active: celebrating } = celebration;
	const { force } = this;
	zero(force);
	if (this.hoverFor > 0) {
		add(force, brake(this, behavior), BRAKE.weight);
	} else {
		add(force, arrive(this, this.target, ARRIVE, behavior), ARRIVE.weight);
	}
	if (!celebrating) {
		add(force, keepAway(this, this.ocarina, AVOID_OCARINA, behavior), AVOID_OCARINA.weight);
	}
	add(force, keepAway(this, camera, AVOID_CAMERA, behavior), AVOID_CAMERA.weight);
	step(this, force, dt, STEP);

	if (!celebrating) this.position.clamp(FLIGHT_AREA.min, FLIGHT_AREA.max);
}
```

On top of that, small oscillations break the regularity of the path, a fairy sometimes hovers in place, its wings beat wider when it flies fast, and its glow twinkles. It also turns smoothly toward where it is flying, with `faceVelocity` from steerkit’s Three.js adapter.

The same adapter helped me tune all of this by eye. In the debug panel, the “forces” checkbox in the Fairies folder draws, for each fairy, its velocity, its desired velocity and its steering force, as in Reynolds’ diagrams, along with the flight area and the sphere that protects the ocarina. It is steerkit’s `SteeringHelper`, in a single draw call.

![The scene in debug mode: around the ocarina, each fairy carries arrows for its velocity in blue, its desired velocity in dashed green and its steering force in orange, with a wireframe sphere around the ocarina and the box of the flight area. A legend explains the colors.](https://tympanus.net/codrops/wp-content/uploads/2026/10/08-fairies-forces-v3-1200x750.png?x95600)

As in Reynolds’ diagrams, the steering force (orange) is the desired velocity (green) minus the velocity (blue).

[](https://tympanus.net/codrops/wp-content/uploads/2026/10/08-fairies-forces-v2-optimized.mp4)

Each fairy brakes, turns and keeps away from the sphere around the ocarina.

### The Completed Book

When the last of the 21 songs is learned, Ocarina waits for the replay to end. Then the fairies gather in a ring around the ocarina and rise in a spiral, glowing brighter, while it plays a short fanfare on its five notes: that is the `celebrating` case in the code above. Finally, an “All 21 songs learned!” banner offers to share the experience.

[](https://tympanus.net/codrops/wp-content/uploads/2026/10/09-celebration-v2-optimized.mp4)

After the 21st song, the fairies form a ring and spiral up while the ocarina plays its fanfare. Best with sound.

An Interface That Looks Like the Game
-------------------------------------

In Figma, I redrew the prototype’s entire interface to get more control, precision and creative freedom: pixel art buttons and icons, the Jersey 10 typeface, stone slabs and golden titles, all inspired by *Ocarina of Time*.

Each button has three states: default, hovered and pressed. In the code, a single SVG is enough: a cap resting on a base, with the glyph engraved in it and colors in CSS variables. The states come down to moving the cap down, a little on hover, more on press. Hover goes through an `.is-hovered` class added on `pointermove`, because `:hover` would also apply to a button that appears under a cursor that hasn’t moved.

![A sheet of the nine pixel art buttons (Settings, Song book, Close, the four C arrows, About and A), each shown at rest, hovered and pressed, with the A button's five color variables and the stone slab texture.](https://tympanus.net/codrops/wp-content/uploads/2026/10/10-pixel-buttons-v3-1200x809.png?x95600)

All nine buttons come from one SVG. Each variant is five CSS variables, and the four C buttons share one rotated arrow.

The animations are discreet, but present in as many places as possible. The golden cursor in the menus pulses around the selected row, like the one in the game’s inventory, and moves with the ocarina’s keys: the C buttons to move, A to confirm, with the original menu sounds. Stone slab toasts slide in at the top of the screen to announce a learned song, and each new song is revealed in the book with a `steps()` animation, in jerks like a sprite, with a few pixel sparkles. It is all CSS, and it all turns off when the system asks for reduced motion (`prefers-reduced-motion`).

![Side by side, Ocarina's Settings menu in the browser and the file select screen of Ocarina of Time 3D on Nintendo 3DS: both use stone slabs, golden corners around the selected row, and a label on the left with its value on the right.](https://tympanus.net/codrops/wp-content/uploads/2026/10/11-menu-comparison-v3-1200x702.png?x95600)

The settings menu borrows the game’s vocabulary: stone slabs, golden corners on the selected row, one setting per row.

What I Take Away from It
------------------------

### Delegating Part of My Passion

Because I love writing code, it was hard, for the first time, to hand part of that passion over to an AI agent. I gave it a part of the execution: the first prototype, a 3D ocarina that moves when you press a key, then the first version of the interface, which I later redrew in Figma, and all the small details I could polish afterwards. I kept what makes it my project: the idea, the architecture I bring from my boilerplate, the features I had in mind and the look of the game. That split let me iterate faster and get to a complete project in a few days.

Still, I remain convinced that it doesn’t suit every project. This one was simple: I was alone on it, the assets already existed, the interactions stay basic, my architecture was in place and I knew what I wanted to build, so there was mostly execution left. I use AI to go faster, never to replace my creative concept. The code has changed a lot since, and it depends less and less on that first prototype.

### The Concept Before the Code

I sincerely believe the concept is the key to this project. What works here is a fan letting other fans play the ocarina that easily, a few days after the remake’s trailer. The code still impresses people further away from Three.js or web development in general, but in my opinion, the idea and the motivation behind it matter much more than the logic that makes it all possible.

### Getting It Tested, and Watching

I loved having my friends and family test Ocarina, to understand whether the concept really worked beyond my imagination. They are the ones who clearly put me on the path to gamification: at first, almost every piece of feedback said “it should have some kind of completion”, and in the end, “I loved finishing the song books”.

I think you have to get your ideas tested by people close to you and by strangers. Both matter if you want useful opinions, because people close to you won’t always dare to say what doesn’t work. That is also why, in my view, you need to analyze behavior. In the MVP, I had set up PostHog, with anonymous analytics so I could skip the consent banner while following the rules of the CNIL, the French data protection authority. I lost some information, such as whether the same visitor came back, but it was already very telling. I wanted to know whether even people who don’t know *Ocarina of Time* went as far as their first note, then their first song, and I saw notes being played without a single song ever being learned. That is where the “Learn a song” hint comes from. The public version no longer uses PostHog: feedback now goes through the repository’s GitHub issues, with a template made for it, “An idea, or something that lost me”.

### What I Would Like to Improve

I would really like to get better at Blender, to depend less on models found on the internet and to explore my creativity further. Coming from a strong backend background, I may still have a more technical than creative profile, and I think Blender could help me develop that side, without having to learn how to hold a paintbrush.

To Wrap Up
----------

Ocarina was born from a trailer, a conference and three days of code. You can play it at [ocarina.thibaut-lefrancois.com](https://ocarina.thibaut-lefrancois.com), read the code on [GitHub](https://github.com/thibautlfr/ocarina), discover [steerkit](https://github.com/thibautlfr/steerkit), the library that grew out of its fairies, and leave me your feedback in the repository’s issues. The rest of my work is on my portfolio, [thibaut-lefrancois.com](https://thibaut-lefrancois.com), and you can follow me on [LinkedIn](https://www.linkedin.com/in/thibaut-lefrancois/), [GitHub](https://github.com/thibautlfr), [X](https://x.com/thibautlfr) and [Instagram](https://www.instagram.com/thibautlfr/).

*To my father, who introduced me to Hyrule.*

[audio](https://tympanus.net/codrops/tag/audio/) [case study](https://tympanus.net/codrops/tag/case-study/) [game](https://tympanus.net/codrops/tag/game/) [GSAP](https://tympanus.net/codrops/tag/gsap/) [Three.js](https://tympanus.net/codrops/tag/three-js/)

![](https://tympanus.net/codrops/wp-content/uploads/2026/09/my-notion-face-portrait2-1-160x160.png?x95600)

### [Thibaut Lefrançois](https://tympanus.net/codrops/author/thibautlefrancois/)

Hi, I'm Thibaut Lefrançois, a full-stack freelance developer based in France. I build everything from backend architecture to creative front-end experiences, and WebGL/Three.js is where I spend my free time. You can find more of my work at thibaut-lefrancois.com.

* [Website](https://thibaut-lefrancois.com)
* [X](https://x.com/thibautlfr)
* [LinkedIn](https://www.linkedin.com/in/thibaut-lefrancois/)
* [Instagram](https://www.instagram.com/thibautlfr/)
* [Github](https://github.com/thibautlfr)

### Creative Spotlights

Inside the journeys and portfolios of today's most inspiring [designers](/codrops/tag/designer-spotlight/) and [developers](/codrops/tag/developer-spotlight/).

![](https://tympanus.net/codrops/wp-content/uploads/2026/03/huy-160x160.jpeg?x95600)

![](https://secure.gravatar.com/avatar/99b569addccce6ea8f1590f7235496ce07cd80f8718b640946e13da4f75e782e?s=160&d=retro&r=g)

![](https://secure.gravatar.com/avatar/c05ec8c4a1421cac11613d4bd233dc469791b790a1119e83bed9492b226f3784?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2026/03/CorentinBernadou_Profile-160x160.jpg?x95600)

![](https://secure.gravatar.com/avatar/673ba8ea1ee1d87231a6f5869cc73e976167d7c00a1165eabd9ba81a02854abb?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2025/11/DSC_0112-awwwards-160x160.jpg?x95600)

![](https://secure.gravatar.com/avatar/9d360a8984abc54d8eedfca50873d7cca9d496a59378a0371d3f8ea103a3feb1?s=160&d=retro&r=g)

![](https://secure.gravatar.com/avatar/fc9b1a89c25b07be1046c61b6acaaca2a95b8afef8d1d2d22851dd7ba2553b83?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2026/01/db-social-pf-160x160.jpg?x95600)

![](https://secure.gravatar.com/avatar/2e189e28555b71adbaad5137cd62e1e333be596f3a4f89ec14d2c60e736049ba?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2025/06/1723660337542-160x160.jpeg?x95600)

![](https://secure.gravatar.com/avatar/5fcada51aa5e188ba78900105d1e58d88f977c45b87ae90fea631e84eaf0680f?s=160&d=retro&r=g)

### [Studio Stories](/codrops/tag/studio-spotlight/)

Discover how studios & agencies started, how they work, and what they've built.

![](https://tympanus.net/codrops/wp-content/uploads/2026/04/logo-black400x400-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/11/XlbCxbNJ_400x400-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2025/03/VAU6V7XG_400x400-160x160.jpg?x95600)

![](https://secure.gravatar.com/avatar/23a6300fe4080c3fbc7d7e6deaa885b96c829a6358c86db198f200f5cb676090?s=160&d=retro&r=g)

![](https://secure.gravatar.com/avatar/3c7e247b86783a78cc69bde393a2e6cc6c6623bf2b5229d4fc46a44268d2e6c5?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2026/09/gatzara-studio-logo-160x160.png?x95600)

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