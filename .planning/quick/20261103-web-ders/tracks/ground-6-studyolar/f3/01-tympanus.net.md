From Illusions to Optimization: The Creative WebGL Worlds of Adrián Gubrica | Codrops

[Codrops](https://tympanus.net/codrops/)

* [All Posts](https://tympanus.net/codrops/all-posts/)
* [Creative Hub](https://tympanus.net/codrops/hub/)
* [Webzibition](https://tympanus.net/codrops/webzibition/)

By [Adrián Gubrica](https://tympanus.net/codrops/author/adriangubrica/ "Posts by Adrián Gubrica") 
in
[Articles](https://tympanus.net/codrops/category/articles/) on
December 5, 2025

From Illusions to Optimization: The Creative WebGL Worlds of Adrián Gubrica
===========================================================================

A look at Adrián Gubrica’s journey from design roots to high-performance WebGL, and the creative, technical worlds he’s built along the way.

[Developer Spotlight](https://tympanus.net/codrops/tag/developer-spotlight/)

![](https://tympanus.net/codrops/wp-content/uploads/2025/11/codrops__thumbnail.webp?x95600)

Hey everyone, what an honour to be in this lovely community! I’m Adrián, Creative Developer at [OFF+BRAND.](https://www.itsoffbrand.com/) studio, specialising in building highly performant interactive WebGL experiences.

As a curious person, I was always fascinated by the technical aspect of design, so during my years at university, studying digital design, I started learning [Three.js](https://threejs.org/) and web development in general to expand my capabilities beyond prototyping. After 6 years of working towards my MA degree and slowly getting more and more into graphics programming, I was lucky to become a full-time creative developer working on amazing projects with even more amazing people.

Currently, I’m also an occasional university lecturer teaching visual communications and generative methods to design students in the Czech Republic.

Projects I’m Proud of
---------------------

### **[The Interactive Dictionary of Free Speech](http://freespeech.gubrica.com/)**

[](https://tympanus.net/codrops/wp-content/uploads/2025/11/codrops__interactive-dictionary-of-free-speech.mp4)

As mentioned at the beginning, during my studies I spent a lot of time exploring Three.js and computer graphics. I also had an interest in socially/politically oriented topics (more below), so to wrap up this period of my life, I decided to make an immersive website as my master thesis, which was aimed towards the freedom of speech.

The result was preceded by more than half a year of studying the topic, learning, experimenting and designing. I wrote a detailed breakdown of the project on [Awwwards Blog](https://www.awwwards.com/dictionary-of-free-speech-case-study.html).

For this project I received my first ever SOTD on Awwwards and also got a SOTM on CSS Design Awards, which I’m still very proud of.

### Lando Norris

As my first collaboration with OFF+BRAND studio and its incredible team, I was fortunate to be trusted with the WebGL part of this project, which, at the time of writing this article, has been very well received by both the web community and the target audience.

The most challenging part of the work was obviously the optimisation, which required multiple iterations for most of the 3D elements to achieve the fastest possible results without compromising the quality too much. This involved managing multiple layers and render targets when masking the helmet on the hero — which currently has four different versions plus an easter-egg version — and also setting up transitions between 24 different track visualisations with 490 individual points.

Another challenging aspect was finding the best possible solution to sync each WebGL scene with its corresponding DOM element on mobile. It was important to minimise the delay between them, which became tricky as we had multiple scenes rendering simultaneously, causing longer frame times. With patient debugging and the kind help of Federico Valla, we sorted out the priorities in the render loop to make everything work as smoothly as possible.

### [Webflow – The 2026 State of the Website](https://webflow.com/resources/report/2026-state-of-the-website)

[](https://tympanus.net/codrops/wp-content/uploads/2025/11/codrops__webflow-1.mp4)

Working on the interactive WebGL parts of the report, I was exploring ways to craft a refractive effect over various moving 3D objects made by my colleague Celia Lopez in OFF+BRAND.

At the beginning, I was trying to replicate the same scene setup Celia used to make reference images for the client in Cinema 4D. Unfortunately, I quickly realised I won’t be able to recreate the same fidelity of the glass layer and depth of field that the raytracer in C4D allowed to reach.

In situations like these, I always try to work out ways I can fake certain material properties by using textures or some mathematical formula. In this particular case, I was able to completely replace the 3D glass layer with a `fract` function and a little noise to make it more random, and added a custom texture simulating the glass reflections and shadows. I also replaced the blurry objects in the background for texture ones, getting rid of my initial depth-of-field pipeline.

Not only did this solution come very close to the reference image, filling the expectations of the resulting look, it also gave me full control over the layout of the glass, all while saving a lot of performance.

### **[Aether1](https://www.aether1.ai/)**

[](https://tympanus.net/codrops/wp-content/uploads/2025/11/codrops__aether.mp4)

Another collaboration with OFF+BRAND., where I closely worked with my colleague Celia Lopez to get her fantastic 3D concept into an interactive WebGL environment.

Detailed breakdown of the project can be found at the [Codrops article](https://tympanus.net/codrops/2025/08/06/building-aether-1-sound-without-boundaries/) from earlier this year.

### **[CleverFarm](https://virtual.cleverfarm.ag/#/)**

[](https://tympanus.net/codrops/wp-content/uploads/2025/11/codrops__clever-farm.mp4)

This time in the role of a UI/UX designer and 3D artist, I have designed this generative 3D environment of a farm with the corresponding UI. I was focusing on ways to showcase all the smart features the CleverFarm is offering to agricultural workers worldwide.

The site was developed by Michal Ščuglík and won 1st place as the best marketing website of 2024 in the Czech republic.

### **[Statusovic](https://statusovic.sk/)**

![](https://tympanus.net/codrops/wp-content/uploads/2025/11/10kb_add-thumb.gif?x95600)

One of the things about websites I love the most is how simply you can share an interactive message to the world. During the pandemic, we had an ongoing political crisis in Slovakia caused by the then-prime minister, who has been (quite vulgarly) attacking everyone not sharing his views on social media.

In my student project, I decided to show my disagreement with this new culture of communication by making a parody of the Google T-Rex game. In this version the objective is to jump over as many of his posts as possible.

For a couple of days, the game went viral in Slovakia and was even mentioned in several media.

### **[Mariupol Digital Memorial](http://mariupol.gubrica.com/)**

[](https://tympanus.net/codrops/wp-content/uploads/2025/11/codrops__mariupol-1.mp4)

A project I did during my university studies, reacting to the Russian invasion into Ukraine and the dreadful events that happened in Mariupol. At that time, I felt like there was no way of honouring the civilians, fallen while trapped in the besieged city. This led me to create at a least a digital memorial for them.

I was lucky that the project was successfully awarded on two student design competitions, which prize I could donate to Ukrainian aid at that time.

**My Little Philosophy**
------------------------

During my studies, I’ve been fortunate to try out various roles in the creative industry. As a graphic designer, I helped my father run his small printing company, did publishing work at the local newspaper for 2 years, had internships at Slovakia’s two biggest advertising agencies at the time and later started freelancing as a UI/UX designer on a diverse set of projects.

This path has influenced me immensely and as a creative developer today, I still try to keep as much of a designer mindset as possible. Developing highly performant WebGL experiences requires a lot of technical knowledge, which I really love, but at the same time it’s very tempting to get trapped by all its limitations (and, eventually, become the grumpy dev). I make an effort every day to remind myself to look beyond these limitations and use my past experience to be more empathetic towards the design team’s craft, needs and problems, helping them bring their ambitious ideas come alive in the best possible way.

It is also the reason I try to spend most of my learning on various skills besides web development, such as VFX, animation, game design or fine arts. I find some knowledge from these fields highly beneficial when overcoming diverse challenges, especially in WebGL, where you have limited computational resources as well as very little user attention to work with. Thanks to VFX, for example, I learnt how to shift user’s attention towards the important things or how to create very believable illusions, while animation, on the other hand, taught me important elemental principles and observational skills, which has proven very valuable when crafting all sorts of cool interactions.

I believe you can learn something from every creative industry there is.

My Toolbox
----------

Lately, I’ve been exploring [ogl.js](https://github.com/oframe/ogl) on almost all commercial projects I’ve been working on. While this may sound a bit counterintuitive, it offers much smaller bundle sizes compared to Three.js, great performance when working with multiple render targets and also another learning opportunity to get deeper into specifics of WebGL. With a little custom code and extra work, I solved almost all the missing pieces from Three.js and was able to use it on more complex projects, while maintaining awesome performance.

For asset work, I rely on Blender in combination with Photoshop to manage my textures and gltf-transform CLI to have truly precise control over optimization of the GLB exports.

The Future
----------

In the future, I would like to find better ways to quickly prototype and test interactive concepts, which I feel can often be time-consuming. For that very reason, I’m now getting more into Geometry Nodes and Houdini. I had also lately discovered [cables.gl](http://cables.gl), a conveniently node-based WebGL editor, I would love to delve into more and probably use as a friendly way to teach shaders to my students. Oh and not to forget about AI! Under its emerging pressure, I would enjoy exploring more meaningful and helpful ways to integrate it into my daily work, and I’m curious, and yet afraid, to see how it’s going to shape all the creative fields.

And the last thing, as everything keeps on accelerating, I have a growing urge to find time again to grab the pencil and draw something again. I used to enjoy drawing and painting a great deal during high school and I really miss it! Lately, I’ve moved some of my notes and tasks back from Notion into a paper notebook and damn, it feels good!

![](https://tympanus.net/codrops/wp-content/uploads/2025/11/codrops__art-462x600.webp?x95600)

Some of my drawings and paintings I made while at high school.

Final Thoughts
--------------

In the age of AI chatbots and agents, it’s very tempting to just get the things done and not think about them or try to understand them. I’m not saying this is never my case, I just find it even more motivating for me to look into books, long articles or videos and try to really understand the core of what I use in my daily work. As Stephen Hawking said: *“If you know how something works, you can control it.”*Until today, every step I did towards understanding helped me to be less dependent on available tools and be more in control of my creativity.

Speaking of learning, I would like to sincerely thank Codrops for all the years it has provided me with amazing articles and tutorials from the best creative developers out there. It’s been (and still is) my main online source of information and inspiration regarding the topic of creative development and I wouldn’t be where I am today without that.

PS: I really miss the newsletter 🙁

[Developer Spotlight](https://tympanus.net/codrops/tag/developer-spotlight/)

![](https://tympanus.net/codrops/wp-content/uploads/2025/11/DSC_0112-awwwards-160x160.jpg?x95600)

### [Adrián Gubrica](https://tympanus.net/codrops/author/adriangubrica/)

Creative Developer at OFF+BRAND.

* [Website](https://www.gubrica.com/)
* [X](https://x.com/AdrianGubrica)
* [LinkedIn](https://www.linkedin.com/in/adrian-gubrica/)
* [Instagram](https://www.instagram.com/adrian.gubrica/)

### Creative Spotlights

Inside the journeys and portfolios of today's most inspiring [designers](/codrops/tag/designer-spotlight/) and [developers](/codrops/tag/developer-spotlight/).

![](https://tympanus.net/codrops/wp-content/uploads/2026/04/czYiOaMh_400x400-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/01/db-social-pf-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/04/8B497010-BF25-4A66-BA41-6967B0E19938-160x160.jpeg?x95600)

![](https://secure.gravatar.com/avatar/673ba8ea1ee1d87231a6f5869cc73e976167d7c00a1165eabd9ba81a02854abb?s=160&d=retro&r=g)

![](https://secure.gravatar.com/avatar/488434ccd50ba844884eaf12c8ddaee6c2de2b591c614335035524255a5485f7?s=160&d=retro&r=g)

![](https://secure.gravatar.com/avatar/0840447446f9c4dacd7171391e4e1634475d723bc557b93d746cd56b95ab3b43?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2025/08/profile-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2025/06/1723660337542-160x160.jpeg?x95600)

![](https://secure.gravatar.com/avatar/f20df6ee31ee4136a63ba09430e79accd1f1c0c6d82fb0505a67e93064974b01?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2025/08/enrico-160x160.jpg?x95600)

![](https://secure.gravatar.com/avatar/fc9b1a89c25b07be1046c61b6acaaca2a95b8afef8d1d2d22851dd7ba2553b83?s=160&d=retro&r=g)

![](https://secure.gravatar.com/avatar/9d360a8984abc54d8eedfca50873d7cca9d496a59378a0371d3f8ea103a3feb1?s=160&d=retro&r=g)

### [Studio Stories](/codrops/tag/studio-spotlight/)

Discover how studios & agencies started, how they work, and what they've built.

![](https://tympanus.net/codrops/wp-content/uploads/2026/04/logo-black400x400-160x160.jpg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2026/07/studio_freight_logo-160x160.jpeg?x95600)

![](https://tympanus.net/codrops/wp-content/uploads/2025/08/offbrand-160x160.jpg?x95600)

![](https://secure.gravatar.com/avatar/14d845d8c2c0e1f2ab1107b82c4b9d8a71c4165cb5a44be9b33fa6f1126a03f1?s=160&d=retro&r=g)

![](https://tympanus.net/codrops/wp-content/uploads/2025/03/VAU6V7XG_400x400-160x160.jpg?x95600)

![](https://secure.gravatar.com/avatar/23a6300fe4080c3fbc7d7e6deaa885b96c829a6358c86db198f200f5cb676090?s=160&d=retro&r=g)

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