Prometheus Fuels: a scroll-driven 3D road trip you hold to drive[Skip to content](#main)

[Award Site Teardowns](/)Site of the DayDailySite of the MonthMonthlySite of the YearYearly[Site of the DayDaily](/)[Site of the MonthMonthly](/month)[Site of the YearYearly](/year)

[中文](/zh/en/r/2021-05-04-prometheus-fuels)LightDark

[Site of the Year](/year)/2021.05.04

Prometheus Fuels
================

Prometheus Fuels is an American startup that turns carbon dioxide from the air into gasoline, diesel and jet fuel, and this is the website it launched in 2021, which tells the company's process as a 3D road trip. As the visitor scrolls, a black Mustang drives across a red desert. The camera follows it through a field of fuel forges, into a giant fan and down among the molecules that become fuel, and finally stops at a gas station. The whole world is drawn like an old travel poster, and at three points along the road the site asks the visitor to hold the space bar and do the step themselves.

Active Theory in Los Angeles designed and built the site. It won Site of the Year 2021 on both Awwwards and the FWA, took the daily and monthly awards on both platforms as well, and Awwwards added its Developer Award.

Date
:   2021.05.04

Award
:   Awwwards SOTD, Awwwards DEV, Awwwards SOTM, Awwwards SOTY 2021, The FWA FOTD, The FWA FOTM, The FWA FOTY 2021

Score
:   Awwwards 8.40 / 10, FWA 88 points

Design
:   Cinematic

Build
:   Scroll

[Visit site](https://prometheus-fuels.web.app/)

![Black Mustang on red desert sand under a giant red planet with the title FUEL FROM THE AIR](/reports/2021-05-04-prometheus-fuels/01-hero.webp?v=fe37bcb6)

The first screen of the home page. A black Mustang stands on red desert sand with its back to the camera and a white trail of dust behind it, a huge red planet hangs in the sky at the top right, cream capitals read CHAPTER 1 FUEL FROM THE AIR, and the ZERO NET CARBON FUELS summary and a MISSION button sit at the bottom right

Contents

1. [01Concept](#ch-1)
2. [02Design](#ch-2)
3. [03Motion](#ch-3)
4. [04Engineering](#ch-4)
5. [05Scores and Team](#ch-5)
6. [06Archive](#ch-archive)

01Concept
---------

Rob McGinnis, the founder of Prometheus Fuels, studied theatre as an undergraduate, later earned a PhD in environmental engineering at Yale, and had already founded a desalination company. In a 2019 post on the startup forum Hacker News, McGinnis wrote that the company's key technology was a carbon nanotube membrane McGinnis had spent six years developing at a previous startup. McGinnis had seen that the membrane could be used to make fuel, but was not sure a startup could raise money for such an ambitious goal until Y Combinator publicly asked for startups working on carbon removal. Prometheus was picked by Y Combinator in 2019 and received a US$12.5 million investment from BMW in 2020. The company promised to use wind and solar power to turn carbon dioxide from the air into gasoline, diesel and jet fuel. Existing cars, trucks and planes could use that fuel without modification, and its price would compete with fossil fuel.

The website has to make ordinary visitors believe two things that are hard to believe: fuel can come out of the air, and once it is in the tank it works exactly like fuel pumped out of the ground. Instead of a page of technical explanation, the site puts the whole process on a drive. Every piece of copy is three or four short lines in capitals paired with one camera shot, so the visitor always reads one picture and one sentence at a time.

The site's home page joins three chapters into one long road that takes 85 screens of scrolling on a computer. Chapter 1, FUEL FROM THE AIR, takes 28 screens and explains where the fuel comes from. The Mustang first races through the desert, and then the picture cuts to a solar field lined with white fuel forges. The camera dives into the fan on a forge's intake and finds the molecules being energized into fuel, and finally a tanker marked PROMETHEUS delivers the fuel to a gas station. Chapter 2, THE ROAD TO NEW POWER, takes 23 screens and shows what the fuel is for. The Mustang takes to the highway, the visitor rides in the cab of a big truck and watches a jet take off, and the road then passes a distillery, an outdoor gear store and a campsite. Chapter 3, THE NEED FOR SPEED, takes 34 screens and explains how the company plans to build its forges faster and in larger numbers, and this chapter was added after the awards.

The pacing comes from how many screens each section takes. The two longest sections in Chapter 1 are the opening car section (10 screens) and the molecules (9 screens), and they are exactly where the visitor is asked to hold the space bar, so the site slows down there to leave time for the visitor to act. Most of the ten sections in Chapter 2 are only 2 screens long, so the shots change one after another like a fast montage that shows how many places the fuel can go. Chapter 2 ends at a campsite at night as a rocket lifts off in the distance, and the copy says a new source of clean power may be our nearest destination, but the journey is just beginning.

All three space bar moments are in Chapter 1, and each one lands on the line of the story the visitor most needs to believe. The first is in the car section, where the copy says that to go where we want to go next we need a new kind of fuel, and holding the space bar makes the car accelerate. The second is among the molecules, where holding the space bar energizes them and makes them come together. The third is at the gas station, where the copy says the moment you fill your tank you drive into a whole new era, and holding the space bar fills the tank one bar at a time. The site hands the three key steps of its argument to the visitor, while Chapters 2 and 3 move forward on scrolling alone.

Besides the home page, the site's menu leads to five more pages. MISSION is the company's manifesto, which opens on a collage photograph and continues with several screens of long text. TECHNOLOGY introduces the technology over a looping background video and offers a full technology film. NEWS is a list of news posts, PARTNERS is a wall of partner logos, and CONNECT is a full orange-red sign-up form headed JOIN THE ENERGY REVOLUTION, which is where the site finally takes the visitor to leave an email address. The privacy policy page stays on the loading screen at this address and never opens.

This report tests a copy of the site that is still running today. The original domain, prometheusfuels.com, now redirects to the company's new website, but the award-winning version still lives at prometheus-fuels.web.app, the default address of the Firebase hosting service, and the server dates its last update to May 2023. In the screen recording Awwwards saved in May 2021, the shots and copy of Chapter 1 match what runs now, and Chapter 2 already exists in the April 2021 archive of the site. Chapter 3 and the PARTNERS page were added later, and the news list comes from a content store that is still being updated, which is why it shows posts from 2025.

02Design
--------

The whole world of this site is drawn like an old travel poster. Every surface takes its colour from a few flat tones, the shading has only two or three steps, and each boundary is a fringe of fine grain like the edge of a screen print. The skies are collages of painted and photographic pieces with a huge red planet and a moon hanging in them. The fuel forges, the fan and the tanker are white low-poly blocks printed with the red logo. Only the Mustang has real metal and glass reflections, but it carries the same layer of grain, so it still looks printed on the same poster. This way of drawing turns an abstract chemical process into an illustration that a reader understands at a glance, and it keeps the car the most prominent thing in every frame.

![Rows of white low-poly fuel forges with red logos in a solar field](/reports/2021-05-04-prometheus-fuels/02-forge-field.webp?v=7d979dfe)

Rows of white fuel forges in a solar field, long boxes printed with the red logo and twisted white columns made of facets between them, with fields of solar panels and mountains in the distance and AND TURN IT INTO FUELS MADE FROM AIR AND ELECTRICITY at the bottom left

The site's interface works with four main colours. Cream (#FDF0E1) is used for chapter titles, most of the copy and a thin border around the whole window, and because that border appears on every page, the whole site looks like a framed poster. The images in this report are cropped inside that border, so it does not appear in them. Orange-red (#E74833) is the colour of the company logo, the space bar prompts and the current page in the menu. Near-black (#161616) is the background of the loading screen, the menu and the subpages. Teal (#66B4AD) is kept for the gauges and for a line that needs emphasis, such as THE ERA OF NET ZERO EMISSIONS at the gas station. The scenes have colours of their own, a terracotta desert under a greyish sky blue by day, which turns into a deep blue night sky and an orange campfire at the end of Chapter 2.

![Night scene with a campfire, the Mustang and a rocket lifting off under a red planet](/reports/2021-05-04-prometheus-fuels/03-campfire.webp?v=3d373063)

The night scene at the end of Chapter 2. A red planet and a moon hang in the deep blue sky, a white rocket lifts off in the distance, a few people sit around an orange campfire in the foreground, the black Mustang is parked on the left, and the copy on the left reads A NEW SOURCE OF CLEAN POWER MAY BE OUR NEAREST DESTINATION. BUT THE JOURNEY IS JUST BEGINNING

The site's interface also uses only two typefaces. Chapter titles, the menu and the big headings of the subpages are set in Mars Condensed, a tall, narrow capital typeface designed by Alaric Garnier and published by the type foundry Production Type. Set in it, a title such as FUEL FROM THE AIR fills half the screen in two or three lines. The story copy is set in Futura LT Bold, all in capitals with three or four words to a line, and the chapter titles are set about seven times larger. The copy always sits on the left or the right side of the frame, away from the car and the centre, so the text never blocks the shot the visitor is watching.

From the gas station on, a set of readouts like a car's instruments appears at the bottom right of the frame. It is made of two vertical bars divided into a dozen or so segments, each with a number beside it. The left bar is the fuel, labelled with a fuel name such as GAS, DIESEL or JET FUEL and with ZERO NET CARBON. The right bar is carbon dioxide, labelled POLLUTED PAST at the top and NET ZERO FUTURE at the bottom. Each section of Chapter 2 that shows the gauges uses a different name, from diesel and jet fuel through to spirits and goods, and the truck section adds an origin, the Port of Los Angeles, and a destination, Chicago. With these thin lines and small labels the site turns its argument into data, and the visitor reads, as if from a dashboard, that with this fuel the emissions drop to zero.

![View from a truck cab with teal diesel and CO2 bar gauges and a Los Angeles to Chicago route](/reports/2021-05-04-prometheus-fuels/04-truck-cab.webp?v=9feb993b)

The view from a truck cab. Ahead is a white truck marked with the red logo and a road leading towards a red planet, the mirror and the steering wheel frame the picture, the two teal bar gauges labelled DIESEL and CO2 sit at the bottom right under ORIGIN: PORT OF LOS ANGELES and DESTINATION: CHICAGO, and YOU PASS BIG RIGS begins at the bottom left

When the visitor clicks the three lines at the top right, a near-black menu fills the screen. On the left, the six page names are set very large in Mars Condensed, with the current page in orange-red and the rest in cream, and the item under the cursor turns grey. On the right, three rounded cards stacked from top to bottom lead to the three chapters, and each card shows a picture from its chapter. The three cards are normally tinted a single orange-yellow, teal or olive green, and when the cursor rests on one, the card reveals its original full-colour picture and its border disappears. The body of MISSION, NEWS and PARTNERS keeps the menu's near-black background and grain, while CONNECT turns the whole page orange-red.

![Black menu with giant page names and three chapter cards, one hovered into full colour](/reports/2021-05-04-prometheus-fuels/05-menu.webp?v=933c419b)

The open menu. On the near-black background the left side shows HOME in orange-red and MISSION, TECHNOLOGY, NEWS, PARTNERS and CONNECT in cream. Of the three rounded cards on the right, the second, THE ROAD TO NEW POWER, shows its original full-colour picture because the cursor rests on it, while the first and third are still single-tone orange-yellow and olive green, and Privacy Policy and four social icons sit at the bottom right

On a phone the three chapters still take 85 screens, but each screen is the height of the phone. The site re-frames the shots for a portrait screen. In the opening the Mustang sits closer to the camera and only its rear shows, the FUEL FROM THE AIR title grows to almost the full width of the screen, and the summary and the MISSION button move to the bottom. On the phone the space bar prompt becomes TAP AND HOLD TO, which means holding a finger on the screen.

03Motion
--------

When the visitor opens the site, a small red logo inside a thin ring appears on the near-black background. Once loading finishes, the dark layer on top tears away along a diagonal starting at the top right, the torn edge is rough, a few enlarged logo shapes flash inside it, and the Mustang appears behind. The tear takes about a second, starting fast and ending slowly, and the last dark flecks linger at the bottom left before they disappear.

Once the visitor is on the home page, everything in the picture follows the scroll position along a timeline built in advance for the camera paths and the movements of the car and the machines. The timeline moves forward exactly as far as the visitor scrolls, so the picture stops when the wheel stops and plays backwards when the visitor scrolls back. On a computer the page does not jump straight to the wheel's position but closes a small part of the remaining distance each frame, so it takes a little over half a second to settle and scrolling has a slight smooth trail. Each line of copy appears only over a short stretch of scrolling, dissolving in out of a field of noise, drifting slowly upwards as the visitor scrolls and dissolving back into noise, in the opposite direction, when it leaves. The opening chapter title fades out once the visitor is two or three tenths of the way through the first section, leaving the picture to the car.

When one scene gives way to the next, the site does not cross-fade. The next scene rises from the bottom of the frame behind a straight slanted edge, the edge climbs a little with every bit of scrolling, and after about one screen of scrolling it has covered the previous scene completely. Both pictures darken slightly near the boundary, which makes the slanted edge clearer. The chapters are joined by the same cut, so the three chapters run together as one road without a pause.

![Slanted edge revealing the forge field scene beneath an overhead shot of the Mustang](/reports/2021-05-04-prometheus-fuels/06-section-cut.webp?v=4e124223)

The moment two scenes meet. Most of the frame still shows the previous overhead shot, a black Mustang trailing two white lines across red sand, and along a straight edge rising from bottom left to top right the lower part of the frame reveals the white fuel forges of the next scene

Holding the space bar is the site's main interaction. When the visitor holds it in the car section, the speed climbs to its maximum over about two and a half seconds, rising fast at first and then more and more slowly, and after release it drifts back down over a second and a half. The camera itself does not drive forward, because the site speeds up the clocks of the whole world instead, so the ground texture, the dust, the clouds and the wheels all run three to four times faster. At the same time a slight red and blue split appears at the edges of the frame, the picture brightens while its corners darken, and the engine sound swells over three seconds. The prompt at the bottom of the screen fades out as soon as the visitor starts holding.

The space bar only reaches this interaction after the visitor has clicked the page once, though. Before that, the browser pages down by a screen as usual and the visitor simply leaves the section. On a phone the visitor holds a finger on the screen instead, and the speed changes exactly as it does on a computer.

The molecule and gas station sections use the same hold. Among the molecules, the white, grey and red balls that fill the screen gather into glowing clusters surrounded by sparks while the visitor holds, and they scatter again on release. Even if the visitor never presses anything, the molecules gather by themselves about halfway through the section, so holding only makes it happen sooner.

![Molecules fused into glowing clusters with electric arcs while the space bar is held](/reports/2021-05-04-prometheus-fuels/07-molecules.webp?v=aaaf2b67)

The molecule section while the space bar is held. On the dark background several clusters of white balls glow with halos and thin yellow arcs of electricity, loose red balls stay outside the clusters, and the copy BY RENEWABLE POWER TO FORM HYDROCARBONS and an OUR TECHNOLOGY button sit on the left

At the gas station, holding the space bar makes the number on the pump climb from 0.0 gallons to 16.0 gallons. Meanwhile the fuel bar at the bottom right fills one segment at a time, and the carbon dioxide bar falls from 314 pounds all the way to 0. On release both numbers go back where they were and the tank is empty again, so the visitor can live through that moment again with every hold.

![Gas station pump reading 16.0 with the fuel gauge full and the CO2 gauge at zero](/reports/2021-05-04-prometheus-fuels/08-fill-tank.webp?v=18d44d97)

The gas station after holding the space bar. The black Mustang stands by the red pump, which reads 16.0, the fuel bar at the bottom right is full at 16.0 and the carbon dioxide bar is empty at 0, and the copy on the left reads THE MOMENT YOU FILL YOUR TANK, YOU DRIVE INTO A WHOLE NEW ERA with THE ERA OF NET ZERO EMISSIONS in teal

The big headings of the subpages use the same dissolve as the copy. When the visitor clicks MISSION in the menu, the new page takes over from the menu, and the orange-red letters of MISSION start as broken fragments and become whole within about a second.

As the visitor scrolls continuously from the top of the home page to the bottom, the frame rate holds steady at 60 frames per second with no section that stutters. The grain in the picture, however, deliberately changes only 12 times a second, far slower than the picture itself, so it flickers in steps like hand printing while the scenes and the camera stay smooth.

04Engineering
-------------

Active Theory built the site on its own engine, Hydra. The whole site is a single WebGL2 canvas that fills the window, with the browser's built-in antialiasing turned off and an FXAA post-processing pass smoothing the edges instead. On computers with a high GPU tier the engine renders at a pixel ratio of 1.5, so even on a 1x screen the canvas is drawn at 2880×1417 and scaled down into the window, which gives cleaner edges. All the text on screen, including chapter titles, copy, gauges and menu, is drawn in the canvas from MSDF glyph atlases of Mars Condensed and Futura LT (a PNG plus a JSON file each), which is what lets the letters dissolve in and out through the noise. For every line of text drawn in the canvas the engine also places an invisible copy in the page, and every button drawn in the canvas has a matching invisible link, so screen readers and search engines read this layer.

The whole story is driven by a page config laid out section by section, and each section states which scene it uses, how many screens it takes, where each line of copy appears within the section, where the space bar hold is active and which kind of gauge it shows. The copy itself is read from a JSON content store on Google Cloud Storage instead of being written into the code, so editors can change the words without touching the timing. The page's total height is simply the sum of the sections' screens times the window height, 85 × 945 = 80,325 pixels in a 1920×945 window, and the native scrollbar only supplies the scroll position. Each section's progress starts when its top edge enters at the bottom of the screen and completes when the section ends, and that progress directly scrubs the section's pre-baked timeline, which holds the camera and object animation, while the Chapter 3 sections play animation exported from Theatre.js. Every scene is first drawn into its own render target, and a full-screen shader then combines the current section and the next one, cuts the two images apart along a slanted line and darkens both slightly, which is how the slanted edge described earlier is made. On weaker GPUs the engine updates only one of the two sections per frame during a transition, alternating between them.

![Diagram of Chapter 1's five sections by screen count with copy ranges and three hold ranges](/reports/2021-05-04-prometheus-fuels/09-section-map.webp?v=853035a5)

Diagram. The five scenes of Chapter 1 laid out by the screen counts in the site's config: Car 10 screens, Forge field 3, Fan 2, Molecules 9 and Gas station 4. The slanted block at the end of each section is the cut, which completes over one screen of scrolling. The black bars below show the scroll range in which each line of copy is on screen, and the red blocks are the three ranges in which the space bar can be held

The poster-like drawing comes from a custom shader that most of the buildings and machines use. The three colour channels of each texture are used as masks. The red channel stores pre-baked lighting, the green and blue channels each mark out an area, and the shader fills them with colours picked from three colours set on the material, so an artist can recolour a whole gas station by changing three hex values. The shading does not blend smoothly either, because the shader adds screen-space noise to the lighting value and then thresholds it, which turns each boundary into a fringe of grain, and the noise's clock updates only 12 times a second, so the grain flickers in steps. The molecules follow the same idea, thresholding the key light, the fill light and the rim light separately to get three steps of shading. The Mustang uses a real PBR material with the same 12-times-a-second noise on top, so it does not look out of place in the illustrated world around it.

![The site's gas station texture next to its red, green and blue channels used as masks](/reports/2021-05-04-prometheus-fuels/10-texture-channels.webp?v=fb771b04)

One of the site's own gas station textures and the same texture split into its three channels. The red channel is greyscale lighting, the green channel is a white mask for the canopy, the signs and the faces of the pumps, and the blue channel masks the thin pillars and struts, and the shader uses these three channels to colour the gas station from three colours

Every effect of the space bar hold hangs off a single speed value from 0 to 1. When the key goes down, the value rises to 1 over 2.5 seconds on an ease-out curve, and on release it falls back to 0 over 1.5 seconds. The cloud, road and water shaders multiply their clocks by (1 + 3 × speed), and the dust, the Mustang and its wheels by (1 + 2 × speed), which is how the world speeds up. The shader that composites the final frame reads the same value to zoom the picture in by 1%, add a red and blue split at the edges and brighten the whole frame by 15%.

The same speed value also drives the readouts on screen directly. During the interaction the gauges show the value itself, the fuel bar equals the speed and the carbon dioxide bar equals one minus the speed, and the number on the pump is simply the speed times 16. The molecule section takes whichever is larger of the speed and the scroll progress, which is why the molecules gather by themselves halfway through. On a computer the site listens to the space bar, on a phone it listens to the finger going down and up, and the engine sound is the only audio on the whole site, in two files.

This approach asks the visitor to download a lot, because once the home page is open, eight background workers download everything the three chapters use, about 93.5 MB on a computer. The largest part is 171 compressed KTX textures at about 37.7 MB. The rest is about 28.4 MB of JPEG images, about 10.1 MB of JSON model data, about 9.4 MB of PNG images and about 7.1 MB of video, and even the TECHNOLOGY page's background video is downloaded on the home page. The compressed textures are picked by the formats the GPU supports, DXT on computers and ASTC or PVRTC on phones, and the gas station texture shows the difference, with its ASTC version only a quarter of the size of its DXT version. The engine also sets the pixel ratio by GPU tier, caps the weakest devices at 30 frames per second and flies fewer birds across their skies, and on phones and in Safari it turns off the page's smooth follow and uses native scrolling. The loading screen appears in about 1.1 seconds and the first scene with the Mustang is complete after about 4.5 seconds. Nothing jumps while the page loads, but the page freezes a few times during start-up, the longest time for about 0.3 to 0.4 seconds.

Screen reader users can read every line of copy, because the engine copies the text drawn in the canvas into the page. Keyboard users, however, can only Tab back and forth between the logo at the top left and the menu button at the top right, and neither the MISSION button on the home page nor the space bar prompts are in the focus order. The arrow keys, Page Down and End still move the whole story along as usual. The site does not read the system's reduced motion setting, so with it switched on, the dissolving copy, the slanted cuts and the sped-up world all run as normal.

05Scores and Team
-----------------

| Award | Source | Date | Score |
| --- | --- | --- | --- |
| FWA of the Day | The FWA | 2021-04-17 | 88 POINTS, DAYS 2 |
| FWA of the Month | The FWA | April 2021 | Monthly award, no separate score |
| FWA of the Year | The FWA | 2021 | Yearly award, no separate score |
| Site of the Day | Awwwards | 2021-05-04 | 8.4. Design 8.5 / Usability 7.77 / Creativity 8.94 / Content 8.79 |
| Developer Award | Awwwards | 2021-05-04 | 7.61 |
| Site of the Month | Awwwards | May 2021 | Monthly award, no separate score |
| Site of the Year | Awwwards | 2021 | Yearly award, no separate score |

Prometheus Fuels is the 2021 Site of the Year on both Awwwards and the FWA. The FWA gave it FWA of the Day first, on 17 April 2021, with 88 points, and filed it under commercial and corporate, educational and promotional. Awwwards made it Site of the Day on 4 May, and the two platforms then gave it their monthly awards for April and May respectively.

On Awwwards the site scores 8.94 for Creativity, the highest of the four categories, and the poster-like drawing and the three space bar holds are the likely reason. Usability is the lowest at 7.77, and the keyboard reaching only two buttons and the space bar needing a click on the page before it belongs to the interaction may both have pulled it down. The five developer jurors gave 7.61, with Animations highest at 9.00 and Markup lowest at 6.80. The low Markup score fits a site that draws all its content as images and leaves only an invisible layer of text in the page.

| Credit | Role | Record |
| --- | --- | --- |
| Active Theory | Creative development studio in Los Angeles, opened in 2012, whose team designs and builds its projects in house with its own tools, and which made this site as Prometheus Fuels' company website | Awwwards works 84, SOTY 3, SOTM 10, SOTD 59, HM 78. FWA 149 |

Active Theory's record is counted up to the time of writing. It has won 59 Sites of the Day and 3 Sites of the Year on Awwwards and 149 awards in total on the FWA, where it is also a Hall of Fame member. On its own website the studio describes itself as a team that makes everything in house and works with its own set of web tools. The FWA credits also list the client, Prometheus Fuels, itself.

06Archive
---------

Award date
:   2021-05-04

Awards
:   Awwwards SOTD 2021-05-04, Awwwards DEV 2021-05-04, Awwwards SOTM 2021-05, Awwwards SOTY 2021, The FWA FOTD 2021-04-17, The FWA FOTM 2021-04, The FWA FOTY 2021

Site
:   <https://prometheus-fuels.web.app/>

Credits
:   Active Theory

Design
:   cinematic

Build
:   scroll

Awwwards
:   8.4 / 10. Design 8.5 / Usability 7.77 / Creativity 8.94 / Content 8.79. Developer Award 7.61. <https://www.awwwards.com/sites/prometheus-fuels>

The FWA
:   88 POINTS, DAYS 2. <https://thefwa.com/cases/prometheus-fuels>

Stack
:   Active Theory's own Hydra engine (WebGL2), custom shaders and compositing, MSDF text, Theatre.js (Chapter 3), JSON content store on Google Cloud Storage, Firebase Hosting

Total assets
:   About 93.5 MB (all three chapters preloaded), of which compressed KTX textures about 37.7 MB and JPEG images about 28.4 MB

Speed
:   FCP 1.11 to 1.15 s (loading screen), first scene fully shown at about 4.5 s, CLS 0.0006. 60 fps on continuous scroll

[← NewerPersepolis Reimagined2022.06.01](/r/2022-06-01-persepolis-reimagined)[Older →Medal of Honor: Above and Beyond2020.12.03](/r/2020-12-03-medal-of-honor-above-and-beyond)

![]()![]()