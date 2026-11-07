# Realism prompts — the source sheet, verbatim

**Source:** "AI Video Realism & Cinematic Prompt Sheet" by **@heyypriyank** (Instagram reel
https://www.instagram.com/reel/DeT2uHIuZUb/), the single PDF in his public Google Drive folder
`1Uxz5Y2z3VqDxg5I7IeLuiHi9pWKdAYnc` ("Ai Realism", `AI_Video_Realism_Cinematic_Prompt_Sheet.pdf`, 3 pages,
read 2026-11-07). Everything inside the code blocks below is his text, unchanged; the "When" notes are ours.

The sheet is written for a **cinema-camera** look. It serves any studio job that has to look camera-captured: ads,
product films, brand films, the stills and loops of a ScrollCraft site, and UGC. For the phone-shot creator look use the
UGC version beside this file: `ugc-realism-prompts.md`. The studio's UGC recipe is `.planning/board-rows/B43.md`,
§ "Hyper-realistic UGC — the factory recipe (2026-11-07)".

**How the modules combine:** start from one subject prompt (01, 03, 06, 10, 11 or 12), then add only the modules the
shot needs: skin (01, 02), hair (07), material (08), reflections (14), grain (04), lens (05), colour (09), one camera
move (12 or 13). Paste the negative list (section 4) into the generator's negative field. Where there is no negative
field, write its most important items into the prompt as instructions (his tip in section 2). In our studio that is
the Codex image tool, FLUX.2-klein, and MiniMax H3 at its default `--cfg 1.0` (`run.py` reads `--negative` only above
1.0).

## 1. The key principle

```text
Instead of relying only on words like “8K,” “ultra-realistic,” or “cinematic”, describe observable details: how skin reflects light, how fabric behaves, where the light comes from, how the camera moves, and what small imperfections exist. Add only the details that fit your shot.
```

## 2. What to write — and what to avoid

```text
Prefer: natural skin texture, visible pores, fine lines, subtle blemishes, realistic specular highlights, physically plausible shadows, fine film grain, natural motion blur, restrained sharpening, real-world lens behavior, consistent anatomy, believable reflections, and motivated lighting.

Avoid or limit: airbrushed / waxy skin, plastic-looking surfaces, excessive beauty retouching, oversharpening, oversaturated colors, fake HDR, perfectly uniform textures, glowing edges, warped hands, changing facial features, flickering details, impossible reflections, and excessive camera movement.

Tip: negative prompts are supported only by some generators. If yours has no negative-prompt field, fold the most important exclusions into the main prompt as instructions.
```

## 3. 15 copy-ready prompts

```text
Replace bracketed text with your subject, action, location, light source, or lens choice. Use the full prompt or combine the relevant parts for your generator and shot.
```

### 01 — Natural skin and visible pores

**When:** any close-up or medium close-up of a face: beauty, skincare and cosmetics ads, a presenter's hero frame,
portrait stills. Leave pores out of wide shots (workflow step 2).

```text
Close-up portrait of [SUBJECT], with authentic human skin texture: visible pores, fine vellus hair, subtle fine lines, tiny natural blemishes, and realistic variation in skin tone. Soft directional window light reveals the texture without making it harsh. Natural highlights on the forehead, nose, and cheeks; no beauty-filter finish. Photographed with a real cinema camera, 85mm portrait lens, shallow but believable depth of field, restrained color grading, lifelike detail.
```

### 02 — Remove the plastic / waxy look

**When:** a second pass on a generated still or frame whose skin or surfaces came out smooth and glossy. It keeps
identity and pose, so it is safe on an image the client has already seen.

```text
Make [SUBJECT] look naturally photographed rather than computer-generated. Preserve irregular skin texture, fine hairs, natural facial asymmetry, realistic roughness, and soft transitions between light and shadow. Avoid waxy skin, overly smooth surfaces, synthetic gloss, uniform pores, and excessive sharpening. Keep the original identity, proportions, pose, and scene.
```

### 03 — Realistic cinematic lighting

**When:** interiors and product scenes where the light has to come from something visible in the frame: brand films,
premium ads, the lit rooms of a ScrollCraft world.

```text
A believable cinematic shot of [SUBJECT] lit by a motivated practical source: [WINDOW / LAMP / SUNSET]. Soft falloff across the face, natural shadow density, subtle bounce light, realistic highlights, and no unexplained glow. Preserve detail in both highlights and shadows. Filmic contrast, restrained saturation, natural skin tones, physically plausible light direction.
```

### 04 — Fine film grain, not digital noise

**When:** the finish of a cinematic still or clip that looks too clean. In post the studio adds grain with FFmpeg
(B43 step 8); use this in the prompt only when the generator has to carry it.

```text
Apply very subtle, fine, organic film grain that is consistent across the image and appropriate to the exposure. Keep skin texture and fine details intact. Avoid chunky noise, color speckles, compression artifacts, excessive grain, and artificial texture overlays. A restrained cinematic finish, with clean midtones and natural highlight roll-off.
```

### 05 — Real camera and lens behavior

**When:** any shot meant to read as filmed on a professional camera: ads, product films, brand films, website hero
loops. Pick one focal length: 35 mm for rooms and context, 50 mm for people at mid distance, 85 mm for faces.

```text
Footage that feels captured on a real cinema camera with a [35mm / 50mm / 85mm] lens. Natural depth of field, realistic focus falloff, gentle lens character, subtle optical imperfections, and believable motion blur. Keep geometry stable and avoid extreme bokeh, fake lens flares, distorted perspective, or digitally sharpened edges.
```

### 06 — Natural movement and facial performance

**When:** any clip with a person on screen: presenters, testimonials, actors in an ad. It is the module that keeps the
face the same from the first frame to the last.

```text
A candid, lifelike moment of [SUBJECT] performing [ACTION]. Use subtle human micro-movements, natural blinking, realistic breathing, small shifts in posture, and physically plausible timing. Keep facial identity and anatomy consistent from frame to frame. No frozen expressions, rubbery motion, sudden warping, or exaggerated gestures.
```

### 07 — Realistic hair and fine details

**When:** hair in frame, and above all when it moves (wind, a head turn, hair-care ads). Eyebrows and lashes matter in
every face close-up.

```text
Render hair with individual strands, natural flyaways, varied strand thickness, and believable movement responding to gravity and airflow. Preserve natural eyebrows, eyelashes, and fine facial hair. Avoid painted-on hair, clumped strands, shimmering edges, flicker, and details that change shape between frames.
```

### 08 — Real fabric and material texture

**When:** fashion, apparel and accessory work, and any product whose surface is the sale (leather, metal, glass,
packaging). It is the module to use when one frame holds several materials side by side.

```text
Show [CLOTHING / MATERIAL] with physically believable weave, seams, folds, wrinkles, and light response. Fabric should move with the body and gravity; leather, metal, glass, and skin should each have distinct surface properties. Avoid uniform textures, rubber-like fabric, floating folds, and reflections that do not match the environment.
```

### 09 — Cinematic color grading without overprocessing

**When:** whenever the colour is set in the prompt rather than in post: premium ads, brand films, site imagery that
must sit with a brand palette. Final colour still belongs to the editor (workflow step 6).

```text
Use a restrained cinematic grade with natural skin tones, controlled highlights, rich but realistic shadows, and moderate saturation. Preserve color separation without teal-orange exaggeration. Keep whites neutral where appropriate and retain texture in dark areas. Avoid crushed blacks, neon colors, excessive contrast, fake HDR, and orange skin.
```

### 10 — Realistic outdoor daylight

**When:** exteriors in daylight: travel, real estate, outdoor products, street scenes, landscapes behind a product.

```text
A natural exterior shot at [TIME OF DAY] in [LOCATION]. Directional sunlight and sky fill behave consistently; shadows fall in the correct direction, surfaces reflect their surroundings, and skin tones remain believable. Include subtle environmental detail such as light haze or moving leaves only where appropriate. No artificial glow, impossible shadows, or oversaturated greens.
```

### 11 — Night scene that feels physically real

**When:** night exteriors and dim interiors: city scenes, restaurants and venues, car ads, evening product scenes.

```text
A cinematic night shot illuminated by visible practical sources such as [STREETLIGHTS / SIGNAGE / WINDOW LIGHT]. Realistic light falloff, mixed color temperatures, deep but detailed shadows, controlled highlights, and natural low-light texture. Avoid glowing outlines, uniformly bright darkness, excessive neon bloom, and noise reduction that smears skin and surfaces.
```

### 12 — Handheld documentary realism

**When:** behind-the-scenes, "how it's made", founder or workshop stories, and any shot that should feel observed
rather than staged.

```text
A grounded documentary-style shot of [SUBJECT] doing [ACTION]. Subtle operator movement, natural reframing, realistic focus behavior, and motion blur that matches the movement. Keep the camera stable enough to read the action; avoid robotic motion, random shaking, impossible tracking, and abrupt perspective changes.
```

### 13 — Slow cinematic camera movement

**When:** product reveals, hero shots, establishing shots, and the slow camera of a ScrollCraft hero loop. One move per
clip (workflow step 3).

```text
A slow, controlled [DOLLY IN / TRACKING SHOT / PAN] toward [SUBJECT]. Maintain consistent subject proportions, stable background geometry, realistic parallax, and natural motion blur. The move should feel operated by a skilled camera crew, with a gentle start and stop. No morphing, background wobble, sudden zooms, or floating-camera movement.
```

### 14 — Realistic reflections and shadows

**When:** glass, metal, liquids, glossy packaging, jewellery, cars, eyewear, mirrors and shop windows: anywhere a wrong
reflection gives the picture away.

```text
Make every reflection, shadow, and highlight consistent with the scene's light sources, surface materials, and camera angle. Glass should reflect and transmit light naturally; metal should have sharp environment-dependent highlights; skin should have soft, varied specular reflections. Avoid duplicated reflections, shadow direction changes, floating objects, and impossible shine.
```

### 15 — Final realism pass for an existing clip

**When:** a clip that is right in content but looks generated; a video-to-video or edit pass that must not change what
the client already approved in substance.

```text
Refine this existing clip while preserving the original subject, identity, composition, action, and timing. Improve believable skin pores and fine texture, realistic material response, stable details across frames, natural motion blur, subtle film grain, and balanced cinematic color. Reduce waxy smoothing, halos, oversharpening, flicker, warping, and artificial glow. Do not invent new details or alter the scene. Keep the result natural, coherent, and camera-captured in appearance.
```

## 4. Universal negative prompt

**When:** in the negative field of every generator that has one. For a still, the time terms (flickering details,
temporal inconsistency, rubbery motion, excessive motion blur) can be dropped.

```text
plastic skin, waxy skin, airbrushed face, excessive smoothing, fake pores, uniform texture, oversharpening, haloing, overprocessed HDR, oversaturated colors, unnatural skin tone, artificial glow, flickering details, temporal inconsistency, warped anatomy, changing facial identity, distorted hands, impossible reflections, inconsistent shadows, rubbery motion, excessive motion blur, chunky digital noise, compression artifacts
```

## 5. Best workflow for convincing results

**When:** as the order of work on every realism job. Step 5 is the studio's frame-by-frame check before his eye.

```text
1. Start with a clear subject, action, environment, and lighting direction.

2. Add skin and material details only where they should be visible; pores are most noticeable in close-ups, not every wide shot.

3. Specify one believable camera move rather than stacking many movements.

4. Keep grain, lens effects, bloom, and color grading subtle. Too much makes footage look processed rather than real.

5. Generate short clips and inspect them frame by frame for flicker, face drift, warped objects, and inconsistent shadows.

6. If editing an existing clip, request preservation of identity, composition, and action. Use a video editor for final exposure, color, grain, and sharpening adjustments.

Important: prompts improve direction, but they cannot guarantee photorealism. Results depend on the video model, reference quality, motion complexity, and settings. Fine grain or pores should never be added so strongly that they look like an overlay.
```
