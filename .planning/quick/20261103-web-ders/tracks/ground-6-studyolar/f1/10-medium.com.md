The Story of Technology Built at Active Theory | by Active Theory | Active Theory Case Studies | MediumMediumThe Story of Technology Built at Active Theory | by Active Theory | Active Theory Case Studies | Medium

[Sitemap](/sitemap/sitemap.xml)

[Open in app](https://play.google.com/store/apps/details?id=com.medium.reader&referrer=utm_source%3DmobileNavBar&source=---top_nav_layout_nav-------------------------------------------)

Sign up

[Sign in](/m/signin?operation=login&redirect=https%3A%2F%2Fmedium.com%2Factive-theory%2Fthe-story-of-technology-built-at-active-theory-5d17ae0e3fb4&source=post_page---top_nav_layout_nav-----------------------global_nav--------------------)

[Medium Logo](/?source=---top_nav_layout_nav-------------------------------------------)

Get app

[Write](/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2Fnew-story&source=---top_nav_layout_nav-----------------------new_post_topnav--------------------)

[Search](/search?source=---top_nav_layout_nav-------------------------------------------)

Sign up

[Sign in](/m/signin?operation=login&redirect=https%3A%2F%2Fmedium.com%2Factive-theory%2Fthe-story-of-technology-built-at-active-theory-5d17ae0e3fb4&source=post_page---top_nav_layout_nav-----------------------global_nav--------------------)

![Unknown user](https://miro.medium.com/v2/resize:fill:64:64/1*dmbNkD5D-u45r44go_cf0g.png)

[Active Theory Case Studies
--------------------------](/active-theory?source=post_page---publication_nav-83fc16521c92-5d17ae0e3fb4-----------------------------------------)

·

[![Active Theory Case Studies](https://miro.medium.com/v2/resize:fill:76:76/1*K81lMp76swno9t7fgohKEA.png)](/active-theory?source=post_page---post_publication_sidebar-83fc16521c92-5d17ae0e3fb4-----------------------------------------)

Deep-dives into our projects and technology

[Virtual Reality](/tag/virtual-reality?source=post_page---header_tags--5d17ae0e3fb4-----------------------------------------)

[Magic Leap](/tag/magic-leap?source=post_page---header_tags--5d17ae0e3fb4-----------------------------------------)

[JavaScript](/tag/javascript?source=post_page---header_tags--5d17ae0e3fb4-----------------------------------------)

[Webgl](/tag/webgl?source=post_page---header_tags--5d17ae0e3fb4-----------------------------------------)

[Opengl](/tag/opengl?source=post_page---header_tags--5d17ae0e3fb4-----------------------------------------)

**The Story of Technology Built at Active Theory**
==================================================

[![Active Theory](https://miro.medium.com/v2/resize:fill:64:64/1*25uXLAvsAinJ1VuYuVDXcw.png)](/@activetheory?source=post_page---byline--5d17ae0e3fb4-----------------------------------------)

[Active Theory](/@activetheory?source=post_page---byline--5d17ae0e3fb4-----------------------------------------)

12 min read

·

Feb 8, 2019

--

5

--

[Listen](/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2Fplans%3Fdimension%3Dpost_audio_button%26postId%3D5d17ae0e3fb4&operation=register&redirect=https%3A%2F%2Fmedium.com%2Factive-theory%2Fthe-story-of-technology-built-at-active-theory-5d17ae0e3fb4&source=---header_actions--5d17ae0e3fb4---------------------post_audio_button--------------------)

Share

At Active Theory, we’ve talked internally about an approach to learning new skills that we call “top down.” In practice, this means that our first priority is always to accomplish the client-facing task. We use existing tools to make things and over time, we contextually begin to understand how those tools work. We identify the strengths and weaknesses of tools, and when appropriate, take our learnings and build new tools streamlined for our workflow. All the technology presented here is the product of this “top down” approach.

* **Aura** — A project encompassing our most recent accomplishments in running WebGL in native environments on iOS, Android, Desktop, Desktop VR (Vive/Oculus), Mobile VR (Daydream/Oculus Go), and Magic Leap.
* **Hydra 3D Engine** — a 3D engine built in-house that is optimized for maximum graphics throughput with reduced CPU usage.
* **Hydra GUI** — an interface that empowers designers to create entire 3D scenes without writing a single line of code, while also allowing developers to manipulate nodes directly in JavaScript.

**Why WebGL in Native Environments (Project Aura)?**

For years, we’ve embraced the concept of using “the web outside the browser.” At first, this meant using web technology inside of native apps so that the techniques we’d developed for building smooth interfaces in the browser would be fully portable across every platform.

As we began to use WebGL more and more, our definition of “the web outside the browser” became more expansive. We became interested in running not only smooth UIs in native apps, but also fully immersive 3D applications built using WebGL. Our first prototype of this concept was called [Mira](/@activetheory/mira-exploring-the-potential-of-the-future-web-e1f7f326d58e) and took a simple particle experience to web, native mobile apps, Apple TV, and a Kinect installation.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:1400/1*OenzPaNDJkQGP6wwdbBnVA.gif)

Mira running on iOS and tvOS

In the years since, more and more reasons for running WebGL in native contexts emerged. VR platforms became increasingly relevant. Arguments for the approach came from unexpected places as well. For example, creating large WebGL powered installations brought new browser-based performance concerns to our attention. So we learned how to run WebGL outside of the browser on a platform we had never anticipated: Desktop.

Lots of trial and error over the last few years has resulted in the Aura project, which currently allows us to run WebGL code in native environments on eight platforms. The following is a case-study in how and why that technology developed.

**First Steps: Running WebGL in Native Apps on Android and iOS**

When Google announced Daydream in 2016, we became interested in the idea of building native VR experiences using WebGL. At that time, using WebGL for VR was interesting to us for two reasons. First, we had been using WebGL to build 3D enabled websites for a few years and hoped to seamlessly port that expertise to other platforms. Second, while a tool like Unity would be the go-to for pretty much everyone else, we were more interested in VR storytelling than building games. We had used WebGL successfully to that end on a number of projects.

Under the hood, WebGL is a very close binding to OpenGL. This means that the path forward for building VR experiences using WebGL was to build a native application that emulated a browser and exposed a canvas to draw 3D graphics. This concept wasn’t original. [Ejecta](https://impactjs.com/ejecta) and other projects such as [Cocoon](https://cocoon.io/), had been doing this for years prior.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:1400/1*3ejpBMH9LO5bjbhiVFv68Q.png)

An OpenGL call bound to a JavaScript callback in C++

Though third-party solutions to this problem existed, we decided that it was in our interest to develop our own solution. A philosophy we’ve carried throughout the years is that whenever possible, we should take our own technology as low-level (close to the OS/hardware) as possible. Developing our own libraries allows us to enable support for new technology, such as Google’s Daydream, more quickly than if we rely on third parties.

If you want to build an environment where you draw in OpenGL using JavaScript, you’ll need a JavaScript engine that will execute your code and you’ll need to be able to interface with that engine in a native environment. As it turns out, Android doesn’t provide a JavaScript SDK directly so we had the problem of needing to bundle our own, which is a problem where answers couldn’t easily be found on Google or StackOverflow. Building [V8](https://v8.dev/) directly with no prior knowledge was too big of a lift. Fortunately, we came across a project called [J2V8](https://github.com/eclipsesource/J2V8).

J2V8 provides a high-level Java API that exposes native functions to JavaScript. J2V8 supported a prototype that, technically, got us to our goal: drawing cubes with three.js inside a native Android app on an OpenGL context. However, the drawing slowed unexpectedly when adding more than just a few draw commands. It turns out that on Android, when C++ code (in this case, the V8 engine itself) needs to pass data to Java code, it passes through a layer called the JNI (Java Native Interface) bridge. This process incurs overhead that made J2V8 infeasible for production applications.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:1400/1*neVl9vBSHZO9yqcXrHrfWg.png)

Binding an OpenGL call with J2V8 in Java

Fast forward to 2017 when Google highlighted Tango at their developer conference. We decided to take what we learned from the earlier failure and try again. This time, we enlisted outside help in compiling V8 directly and setting up a native environment where we could build our features directly in C++. Instead of binding in Java, we did it in C++, making the application fast enough to render 3D draw calls with low overhead.

Immediately after, Apple announced ARKit. We set out to solve the problem we had solved on Android on iOS. When it came to the JavaScript engine, Apple provided an API called JavaScriptCore which is a high-level interface to connect JavaScript and Swift. While this was relatively straightforward, combining ARKit with OpenGL turned out to be the hefty lift this time. The problem was that Apple’s ARKit documentation only centered around using their 3D engine or their iOS-only Metal API, with no reference to OpenGL. After some trial and error, everything clicked into place, and [we were able to build mobile AR apps with three.js and WebGL.](/@activetheory/world-brush-augmented-reality-painting-7910766b2bba)

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:1400/1*sHBJ3ofY1u5vx-26uQ3huQ.png)

Binding an OpenGL call in Swift

**Another Reason to Take WebGL out of the Browser: Performance**

In 2018, as we built a live experience for Google I/O for the third year [in](/@activetheory/paper-planes-6b0008c56c17) [a](/@activetheory/bubbles-i-o-2017-e52171516b93) [row](/@activetheory/world-draw-63ad9e4c1ebd), it became clear that we had pushed some of the technology we rely on, namely three.js and [Electron](https://electronjs.org/), to their limits. Both are awesome tools for many use-cases; we used three.js on every 3D project before mid-2018 and we still use Electron as the native application wrapper for physical installations that aren’t solely 3D.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:1400/1*b_syOmzbfuG5pCiuP5JogA.jpeg)

A Google I/O live event installation using Electron

For projects that demand high-performance graphics rendering, though, we needed new solutions. We built tools to replace Electron (Aura) and three.js (Hydra 3D Engine, more on that later) in our workflow in order to squeeze every bit of performance out of the devices they would run on.

Electron is an awesome platform that lets you turn any web code into an executable. These executables are great for installations and served us well in many of our early projects. However, as our installations grew larger, we became more and more aware that Electron comes with the entire overhead of a browser.

From a 3D performance perspective, two pieces of browser overhead are most significant: the extra security checks that slow down WebGL to OpenGL bindings, and the need to composite the WebGL canvas with the rest of the HTML content that could exist on any website. This browser overhead is completely worth the cost if an application will be primarily viewed with the click of a link. After all, the browser is far and away the most widely accessible method for distributing content.

But, if we have total control over the environment, as is the case in an installation, why not remove that overhead? Why not run WebGL outside of the browser?

**Starting Fresh**

After Google I/O 2018, we took what we had learned in previous years about building native environments, and set out to start again from a clean slate. This time, instead of just iOS and Android, we would target iOS, Android, desktop, desktop VR (Vive/Oculus), mobile VR (Daydream/Oculus Go), and Magic Leap.

Get Active Theory’s stories in your inbox
-----------------------------------------

Join Medium for free to get updates from this writer.

Subscribe

Subscribe

Remember me for faster sign in

An important development that occurred between versions of our “Aura” platform was the emergence of the [WebXR](https://immersive-web.github.io/webxr-samples/) spec that defined a unified way we could render immersive experiences across our target platforms and web browsers. It made things much simpler from our first iteration where Android and iOS had differing implementations that caused a number of small headaches.

While iOS was a relatively straightforward refactor, we did optimize the platform significantly by moving the OpenGL bindings out of Swift and directly into C, [as explained in this twitter thread](https://twitter.com/michaeltheory/status/1076700173726695424).

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:1400/1*r-9f8xglEoqgEdmn4sApUQ.png)

OpenGL bindings in C for iOS

On Android, working directly with V8 in C++ was too cumbersome. While the bindings are very fast, there are still many things you’d want to interface with using a higher level language like Java, or as we switched to at this point, Kotlin. In revisiting J2V8 we found the project had moved to a Docker based build system which would allow us to make changes to the C++ codebase and hook in the OpenGL bindings at that level. This gave us the best performance and flexibility.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:1400/1*UjIM4-GWC7N-wDV-Ndc_Hg.png)

We were able to use the nice and neat J2V8 API in Kotlin for functions that are called less frequently, such as uploading a texture as Kotlin provides an abstract layer for dealing with texture data. The rest of the OpenGL bindings were done in C++.

[Things](#656e) really start to get interesting on desktop where Node.js provides the base for the platform. Node is primarily thought of as a server side technology but as in our case, [Node Native Add-ons](https://nodejs.org/api/addons.html) allow developers to write C++ code that can natively access all APIs on the host machine. We utilized this to make the application launch a windowed OpenGL context with [GLFW](https://www.glfw.org/)on both Mac and Windows, in addition to other features such as OpenVR for Vive/Oculus integration and [OpenAL](https://www.openal.org/) for audio. This desktop environment achieves the goal of removing the overhead of the browser engine and enabling a rendering pathway that is approximately 3x faster than Electron for WebGL applications.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:1400/1*I7h__nrRA_ZgEBqNv58NWw.png)

The entry point of the Node native addon.

In the summer of 2018 as Magic Leap neared release we came across a fantastic open source project called [Exokit](https://github.com/webmixedreality/exokit)which used the same concept of Node.js as a base for XR applications. We got involved and made a few contributions which allowed us to get our engine working and used Exokit to create an [initial series of experiments](https://xr.activetheory.net) that ran on Magic Leap. As with other aspects of this effort, the experience of working with Exokit provided the context to build a Magic Leap environment streamlined for our engine and pipeline. This is similar to desktop in that we compile an arm64 build of Node with a compiler provided by the [Lumin SDK](https://www.magicleap.com/creator) and [bind Magic Leap’s native features to WebXR](https://twitter.com/michaeltheory/status/1084741466226753536) in C++ with a Node Native Addon.

Magic Leap experience built on Aura, recorded with a Vive running Aura on desktop VR.

In a perfect world, none of the native code described in this article would be necessary. We are firm believers in the web and the power of being able to load an experience in seconds with the click of a link. However, we are at a time where innovation in immersive technology is moving rapidly. “Project Aura” affords us the ability to take the web outside the browser and use JavaScript to build compelling experiences in new mediums that browsers haven’t yet reached.

**Hydra 3D Engine** [**Motivation**](#b32f)

After Google IO 2018, we decided that projects that demand high-performance graphics rendering required us to build our own 3D engine.

After years of working with three.js and building our 3D workflow on top of it, the only parts of three that we continued to use were its math and rendering pipelines. Since three.js comes loaded with features for developers of all experience levels, is contains a significant amount of code that we did not use at all. For example, we have long used custom shaders instead of three’s material and lighting systems.

**Hydra 3D Engine Development**

We researched a handful of open source 3D engines as well as three itself in order to construct an engine that best fit our workflow. Unsurprisingly, the end result takes the most influence from three.js, specifically the paradigm of constructing a Mesh from a Geometry and a Material. A key difference is that in our case the Material is replaced by a less abstract Shader which streamlined how we were already working.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:1400/1*IMrVLifXYM8CwODRicqTEA.png)

It’s that simple.

The big difference comes in the rendering pipeline. We wrote a renderer that could be streamlined because we could define the exact scenarios we would be rendering instead of having to account for the additional cases that three does. If available on that device, the renderer will use a WebGL2 context and take advantage of the new features it provides in order to further reduce CPU usage. If WebGL2 isn’t available, it will render to WebGL1 with no impact to development.

Building the engine also allowed us to optimize for reduced CPU usage. (high CPU usage is actually the most likely culprit of a common negative symptom of WebGL experiences, the annoying sound of fans spinning up to full speed.) First, in our engine, we moved as much code off the main thread and into a WebWorker thread as possible. Tasks like loading a geometry and computing its dimensions, generating a large particle system, and computing physics collisions are entirely parallelized.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:1400/1*hK3ieBWvrm7Bx8rTmFgmTw.png)

Creating buffers required for a particle system with code that is written in a single file but executes on a separate thread via a WebWorker.

The other huge performance win was reducing the number of matrix calculations on any given frame. In any 3D engine, when an object moves, a minimum of 256 multiplications take place in order to determine where to draw that object on the screen. This number can grow exponentially if you have many objects or objects nested within a hierarchy. Most 3D engines either re-run this calculation even if nothing has changed between frames, or leave it up to the developer to manage optimization, causing project complexity to increase. We found a middle ground where the engine itself keeps track of whether an object’s matrix needs to be updated, thereby only doing the calculation if something has truly changed.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:1400/1*7iYugEFL0k2y-Q3ihXq-Og.png)

This code shows how an object is marked dirty if it’s properties change. determineDirty() will return true if any object higher up in the display list is dirty.

The engine slotted easily into our existing development framework as just another module. This allowed us to reduce the amount of code to be shipped and afforded us the ability to add more features that could be included on a per-project basis in a way that was extremely quick to develop and integrate without needing to touch the core of the engine.

This now afforded us the overhead to build some really cool modules that will let us elevate our 3D rendering. PBR, Global Illumination from spherical harmonics, a new lighting system, water simulation, and text rendering are new features you’ll see in upcoming projects.

Various AR experiments using PBR, Global Illumination, and lighting.

**Hydra** [**GUI**](#5f6d)

On a separate development track, we worked on what might be the most impactful change to our workflow ever. While we, and many other developers, have been using GUI editors like [dat.gui](http://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage)for a while, they are limited to the developer writing all of the code and just exposing parameters to a UI that are connected in a very manual way.

The need arose for us to take this concept all the way and flip the paradigm around. In our industry, so many projects are designed by a design team and then handed off to a development team to be built. We wanted to leverage our amazing team of artists to allow them to help our development resources not only with capacity, but also to allow the designers to have a hand in making the projects themselves and empower them to directly control the visual quality.

Our new GUI system is a robust solution that can be thought of like Photoshop smart objects. Each project is comprised of a branching tree of scenes, each with its own graph hierarchy and a node within that graph could be another scene entirely. Artists can create new nodes directly and manipulate them by setting a geometry, shader, and positioning them within the scenes allowing the ability to create entire 3D scenes without a single line of code. Developers can then access each node in JavaScript, adding advanced functionality, animation, or shaders, and passing the work back to an artist to modify the newly exposed parameters in the GUI. The data is versioned and synchronized with Firebase, allowing multiple team members to work on the project in real time without conflicts.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:1400/1*ErE_izka-ENiF3OarNLmLg.png)

GUI editing a shader

Wrapping it up..
----------------

Everyone at Active Theory is passionate about merging art and technology to create innovative new experiences. The pursuit of our goals often means forging new paths in places where answers aren’t easily found purely as a means to creative expression. We’re excited about new opportunities in 2019 and beyond to discover what our broader team will accomplish with these new capabilities.

[Virtual Reality](/tag/virtual-reality?source=post_page---footer_tags--5d17ae0e3fb4-----------------------------------------)

[Magic Leap](/tag/magic-leap?source=post_page---footer_tags--5d17ae0e3fb4-----------------------------------------)

[JavaScript](/tag/javascript?source=post_page---footer_tags--5d17ae0e3fb4-----------------------------------------)

[Webgl](/tag/webgl?source=post_page---footer_tags--5d17ae0e3fb4-----------------------------------------)

[Opengl](/tag/opengl?source=post_page---footer_tags--5d17ae0e3fb4-----------------------------------------)

--

--

5

--

[![Active Theory](https://miro.medium.com/v2/resize:fill:96:96/1*25uXLAvsAinJ1VuYuVDXcw.png)](/@activetheory?source=post_page---post_author_info--5d17ae0e3fb4-----------------------------------------)

[![Active Theory](https://miro.medium.com/v2/resize:fill:128:128/1*25uXLAvsAinJ1VuYuVDXcw.png)](/@activetheory?source=post_page---post_author_info--5d17ae0e3fb4-----------------------------------------)

[Written by Active Theory
------------------------](/@activetheory?source=post_page---post_author_info--5d17ae0e3fb4-----------------------------------------)

[5K followers](/@activetheory/followers?source=post_page---post_author_info--5d17ae0e3fb4-----------------------------------------)

·[43 following](/@activetheory/following?source=post_page---post_author_info--5d17ae0e3fb4-----------------------------------------)

Creative Digital Production

[![Active Theory Case Studies](https://miro.medium.com/v2/resize:fill:96:96/1*K81lMp76swno9t7fgohKEA.png)](/active-theory?source=post_page---post_publication_info--5d17ae0e3fb4-----------------------------------------)

[![Active Theory Case Studies](https://miro.medium.com/v2/resize:fill:128:128/1*K81lMp76swno9t7fgohKEA.png)](/active-theory?source=post_page---post_publication_info--5d17ae0e3fb4-----------------------------------------)

[Published in Active Theory Case Studies
---------------------------------------](/active-theory?source=post_page---post_publication_info--5d17ae0e3fb4-----------------------------------------)

[954 followers](/active-theory/followers?source=post_page---post_publication_info--5d17ae0e3fb4-----------------------------------------)

·[Last published Nov 30, 2021](/active-theory/introducing-dreamwave-microverses-1d3e0364eff?source=post_page---post_publication_info--5d17ae0e3fb4-----------------------------------------)

Deep-dives into our projects and technology

[Help](https://help.medium.com/hc/en-us?source=post_page-----5d17ae0e3fb4-----------------------------------------)

[Status](https://status.medium.com/?source=post_page-----5d17ae0e3fb4-----------------------------------------)

[About](/about?autoplay=1&source=post_page-----5d17ae0e3fb4-----------------------------------------)

[Careers](/jobs-at-medium/work-at-medium-959d1a85284e?source=post_page-----5d17ae0e3fb4-----------------------------------------)

[Press](mailto:pressinquiries@medium.com)

[Blog](https://blog.medium.com/?source=post_page-----5d17ae0e3fb4-----------------------------------------)

[Store](/store)

[Privacy](https://policy.medium.com/medium-privacy-policy-f03bf92035c9?source=post_page-----5d17ae0e3fb4-----------------------------------------)

[Rules](https://policy.medium.com/medium-rules-30e5502c4eb4?source=post_page-----5d17ae0e3fb4-----------------------------------------)

[Terms](https://policy.medium.com/medium-terms-of-service-9db0094a1e0f?source=post_page-----5d17ae0e3fb4-----------------------------------------)

[Text to speech](https://speechify.com/medium?source=post_page-----5d17ae0e3fb4-----------------------------------------)