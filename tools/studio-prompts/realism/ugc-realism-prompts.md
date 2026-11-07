# UGC realism prompts — the 15 modules in phone language

The UGC (phone-shot, creator-style) version of every prompt in `realism-prompts.md`, rewritten by the studio
(2026-11-07) from @heyypriyank's sheet (reel DeT2uHIuZUb; credit and the verbatim originals in that file). The physics
vocabulary for skin, light, hair, fabric and reflections stays; the cinema camera becomes a phone: front camera or the
main camera, arm's-length selfie, auto exposure, slight sensor noise, mixed home light, imperfect framing. The recipe
these forms serve is `.planning/board-rows/B43.md`, § "Hyper-realistic UGC — the factory recipe (2026-11-07)".

## How to use the forms

Every module has three forms, written for the studio's engines:

- **Still (Codex image tool, with a reference):** the default image step. The Codex tool has no negative field, so
  every ban is written as an instruction ("do not …"). Paste the **reference opener** first, then the modules the shot
  needs. The same text goes to Seedream 5 Pro, the paid alternative. Whether Seedream has a negative field is not
  measured.
- **Klein (FLUX.2-klein-4B, local, with a reference):** 2–3 short, concrete sentences. Long lists of bans do not help
  a small model; a few physical facts do.
- **Video (H3 Ref2VA / T2VA):** only on the motion modules (05, 06, 07, 08, 12, 13, 15). H3 at its default
  `--cfg 1.0` ignores `--negative` (`~/tools/h3/run.py`), so the bans are written into the prompt here too. The
  references carry identity only (`<Picture N>`); the prompt carries the whole scene. End every H3 prompt with the
  **H3 UGC look line**.

For a still-only module (01–04, 09–11, 14) in a text-only H3 take with no still, paste its Still form's physical
sentences into the scene paragraph unchanged.

**Reference opener** (paste before any Still form):

```text
Use the attached reference photo only for its framing, room, light and phone angle; do not copy the person's face, the content or any text in it. The person is the one in the attached cast photo, with exactly that face, hair and build. This is a real photo taken on a smartphone by a creator at home, not a studio photo and not an advertisement.
```

**H3 UGC look line** (the last paragraph of every H3 prompt):

```text
Photoreal live-action smartphone video, vertical 9:16, filmed by the person themselves on a modern phone: auto exposure and auto white balance, slight sensor noise in the shadows, the phone's own mild sharpening, small handheld micro-movement, imperfect framing. Real skin with visible pores and fine texture, real fabric, real room. It must read as a real person filming their own day, never as a studio advertisement: no studio lights, no smooth gimbal or dolly movement, no cinematic shallow focus, no beauty filter, no airbrushed skin, no text, no captions, no watermark. The face, hands and product stay exactly the same from the first frame to the last; no warping, no flicker.
```

## 01 — Natural skin and visible pores (UGC)

Changes from the original: the 85 mm cinema close-up becomes an arm's-length front-camera close-up; the phone sees most
of the face sharp, with the gentle wide-angle perspective of a lens held 40–60 cm away.

**Still (Codex, with a reference):**

```text
Arm's-length front-camera selfie close-up of [SUBJECT], the phone held a little below eye level. Authentic skin texture: visible pores on the nose and cheeks, fine vellus hair along the jaw catching the light, subtle fine lines, a tiny natural blemish or two, and real variation in skin tone, slightly pinker around the nose and redder at the cheeks. Soft daylight from a window to one side shows the texture without harshness; natural shine on the forehead, nose and cheekbones. The mild wide-angle perspective of a phone front camera at close range; most of the face in focus, the room behind only slightly soft. Do not smooth, retouch or beauty-filter the skin, do not even out the tone, and do not add studio lighting or a blurred portrait-mode background.
```

**Klein (short):**

```text
Front-camera phone selfie at arm's length of [SUBJECT] by a window, real skin with visible pores, fine facial hair and natural shine on the nose and forehead. Unretouched, slight phone sensor noise, ordinary home background only slightly soft.
```

## 02 — Remove the plastic / waxy look (UGC)

Changes from the original: the target is "taken on a phone" instead of "photographed"; the phone's own traces (slight
noise, mild sharpening, auto exposure) are what make it read as real.

**Still (Codex, edit of an existing image):**

```text
Make [SUBJECT] look like an unedited photo taken on a smartphone rather than a computer-generated image. Keep irregular skin texture, fine hairs, the natural asymmetry of the face, realistic roughness on lips and knuckles, and soft transitions between light and shadow. Add the slight sensor noise and mild sharpening of a phone camera in auto mode. Remove the waxy smoothness, synthetic gloss, uniform pores and over-sharpened edges. Keep the original identity, proportions, pose, framing, room and light exactly as they are; change nothing else.
```

**Klein (short):**

```text
The same person, pose and room, as an unedited smartphone photo: real uneven skin texture, fine hairs, natural facial asymmetry. Slight phone noise, no smoothing, nothing else changed.
```

## 03 — Realistic home lighting (UGC)

Changes from the original: "motivated practical source" stays, but the sources are what a creator's home has, usually
two of them at once at different colours, and the phone's auto white balance settles between them.

**Still (Codex, with a reference):**

```text
[SUBJECT] lit only by what is really in the room: [WINDOW DAYLIGHT / A CEILING LAMP / A BATHROOM MIRROR LIGHT / A LAPTOP SCREEN]. Mixed home light: cooler daylight on one side of the face and warmer lamp light on the other, as the phone's auto white balance settles between them. Soft falloff across the face, natural shadow under the chin and nose, a little light bounced back from a pale wall, and highlights that come from a visible source. The darkest corners still hold some detail and the window may blow out slightly, as a phone's auto exposure does. Do not add a ring light, softbox catchlights, rim light or any glow without a source.
```

**Klein (short):**

```text
[SUBJECT] at home lit only by [WINDOW DAYLIGHT / A LAMP], cool daylight on one side and warm lamp light on the other. Phone auto exposure, window slightly blown out, natural shadows, no studio light.
```

## 04 — Phone sensor noise, not a grain overlay (UGC)

Changes from the original: a phone has no film grain; it has fine luminance noise that grows in the shadows and in low
light, plus a little processing. The studio's grain is added in post (B43 step 8), so in the prompt this stays light.

**Still (Codex, with a reference):**

```text
The fine, even digital noise of a phone camera, visible mainly in the shadows and on plain walls, a little stronger where the room is dim. Keep skin texture and fine details intact under it. The phone's own mild processing: slightly sharpened edges, gentle highlight roll-off, clean midtones. Do not add a grain filter, colour speckles, blocky compression or an artificial texture over the image.
```

**Klein (short):**

```text
Fine phone-camera sensor noise in the shadows, slightly more in the dim corners, skin texture intact. No grain filter, no compression blocks.
```

## 05 — Real phone camera behaviour (UGC)

Changes from the original: the 35/50/85 mm choice becomes the phone's two cameras: the front camera for a selfie, the
main (rear) camera when someone else films or the phone is propped. Phone depth of field is deep; blurred backgrounds
come only from distance.

**Still (Codex, with a reference):**

```text
Taken on a modern smartphone with the [FRONT CAMERA AT ARM'S LENGTH / MAIN CAMERA FROM ABOUT ONE METRE]. Deep phone depth of field: the subject sharp, the background only slightly soft because of distance. The mild wide-angle perspective of a phone lens, a faint softness toward the corners, auto exposure and auto white balance, the phone's own mild sharpening. Framing slightly off-centre, the top of the head or an elbow cut by the edge as a real selfie does. Do not add cinematic bokeh, a portrait-mode cutout halo, lens flares or a distorted fisheye look.
```

**Klein (short):**

```text
Smartphone [FRONT-CAMERA SELFIE / MAIN-CAMERA SHOT], deep focus with the background only slightly soft, mild wide-angle perspective. Slightly off-centre framing, no bokeh, no portrait-mode blur.
```

**Video (H3):**

```text
The whole take is filmed on a phone's [FRONT CAMERA, HELD AT ARM'S LENGTH / MAIN CAMERA, PROPPED ON A SHELF ABOUT ONE METRE AWAY]. Deep phone focus, the background only slightly soft. Auto exposure adjusts a little when [SUBJECT] moves toward the window; the white balance shifts slightly and settles. Small natural motion blur on quick hand movements. The room's lines stay straight and stable; no bokeh, no lens flare, no zoom.
```

## 06 — Natural movement and talking to camera (UGC)

Changes from the original: the candid performance becomes a creator talking to their own phone: eye contact with the
lens, small glances at the screen, the arm holding the phone moving a little with the body.

**Still (Codex, with a reference):**

```text
A candid mid-sentence moment of [SUBJECT] [ACTION], looking into the phone's lens: mouth slightly open between words, a relaxed half-expression, eyes alive, one eyebrow a little raised. Natural posture, shoulders uneven, the arm holding the phone visible at the edge of the frame. Do not freeze a posed smile, exaggerate the gesture or make the face symmetrical.
```

**Klein (short):**

```text
Candid mid-sentence selfie of [SUBJECT] [ACTION], looking into the phone lens with a relaxed half-expression. Natural uneven posture, phone arm at the edge of frame.
```

**Video (H3):**

```text
<Picture 1> is [SUBJECT]: this exact face, hair and build. THE SCENE: [SUBJECT] [ACTION] while talking into the phone's front camera, held at arm's length. Real human micro-movements: natural blinking, breathing visible in the shoulders, small shifts of weight, a short glance down at the screen and back to the lens, the head tilting with the words, the phone arm moving slightly with the body. Speech pace is relaxed, with a small pause before the main point. Same face and anatomy in every frame; no frozen expression, no rubbery mouth, no sudden warping, no exaggerated gestures.
```

## 07 — Realistic hair and fine details (UGC)

Changes from the original: the airflow is a room's (a window, a fan, a head turn); flyaways show most against a bright
window behind.

**Still (Codex, with a reference):**

```text
Hair rendered as individual strands with natural flyaways, a few loose hairs across the forehead or caught at the collar, varied strand thickness, slightly uneven at the parting, the way hair looks on an ordinary day. Where the window is behind, the flyaways catch the light. Natural eyebrows with a few stray hairs, real eyelashes, fine facial hair. Do not paint the hair as one smooth shape, clump it into wet-looking strands, or give the edges a glowing outline.
```

**Klein (short):**

```text
Everyday hair with individual strands and flyaways, a few loose hairs catching the window light. Natural eyebrows and lashes, no smooth helmet-like hair.
```

**Video (H3):**

```text
The hair moves only as a real room moves it: it swings a little and settles when [SUBJECT] turns the head, a few loose strands drift in the air from the open window, and [SUBJECT] tucks one strand behind the ear once. The strands, eyebrows and lashes keep the same shape in every frame; no shimmering edges, no flicker, no hair that changes length or colour.
```

## 08 — Real fabric and material texture (UGC)

Changes from the original: the clothes are worn, not styled (creases from sitting, a slightly stretched collar), and
the product is handled: fingerprints on gloss, a label that bends with the packaging.

**Still (Codex, with a reference):**

```text
[CLOTHING / MATERIAL] as it is in real life: visible weave or knit, seams, creases from wearing it, a slightly stretched collar, small wrinkles where the arm bends. The product in hand has its own surface: [GLASS / PLASTIC / CARDBOARD / METAL], with fingertips pressing it, a faint fingerprint on gloss, the label bending with the packaging's curve. Each material reflects the room differently. Keep the product's shape, colours and label exactly as in the product photo; do not invent text. Do not make fabric look rubbery, folds float, or every surface the same texture.
```

**Klein (short):**

```text
Worn everyday [CLOTHING] with real knit, seams and creases; the product held in the fingers with its real surface and label. No rubbery fabric, no invented text.
```

**Video (H3):**

```text
<Picture 2> is the product: exactly this shape, colour and label. The [CLOTHING] moves with the body: the sleeve slides and creases when the arm lifts, the fabric falls back by gravity. When [SUBJECT] turns the product in the hand, the light slides across its surface and the label stays readable and unchanged; the fingers press the packaging naturally. No rubbery fabric, no floating folds, no label that changes between frames.
```

## 09 — Natural phone colour without a filter (UGC)

Changes from the original: the cinematic grade becomes the phone's own colour: natural, slightly clean, no filter look.
The studio's colour correction (saturation a little up, yellows down) is done in post (B43 steps 4 and 8), so the
still should not arrive warm.

**Still (Codex, with a reference):**

```text
The colour of an unedited modern phone photo: natural skin tones, neutral whites on the walls and towels, moderate saturation, slightly cool rather than warm. Highlights from the window held without clipping the face; shadows dark but with detail. Do not apply a filter, a teal-orange grade, a warm vintage tone, faded blacks, neon colours, fake HDR or orange skin.
```

**Klein (short):**

```text
Unedited phone colour: natural skin, neutral whites, moderate saturation, slightly cool. No filter, no warm grade, no HDR look.
```

## 10 — Realistic outdoor daylight (UGC)

Changes from the original: the exterior is where a creator films: a street, a balcony, a park bench, a parked car; the
phone exposes for the face and the sky may go bright.

**Still (Codex, with a reference):**

```text
A phone shot outdoors at [TIME OF DAY] in [LOCATION]: [SUBJECT] filming at arm's length, the sun from one side and the open sky filling the shadows. Shadows fall consistently in the sun's direction, skin squints a little in the brightness, surfaces reflect their surroundings, and the phone exposes for the face so the sky behind is a little too bright. Only the environmental detail that is really there: a few leaves, passers-by out of focus, light haze. Do not add artificial glow, impossible shadows or oversaturated greens and blues.
```

**Klein (short):**

```text
Smartphone selfie outdoors at [TIME OF DAY] in [LOCATION], side sun, consistent shadows, slightly bright sky behind. Natural colours, no glow.
```

## 11 — Night and low light that feel real (UGC)

Changes from the original: at night a phone either brightens the room into noisy flatness or keeps it dark; the
practicals are a lamp, a screen, a fridge, a car's dashboard, a street lamp through a window.

**Still (Codex, with a reference):**

```text
A phone photo at night lit by what is really there: [A BEDSIDE LAMP / THE PHONE OR LAPTOP SCREEN / A STREETLIGHT THROUGH THE WINDOW / A CAR'S INTERIOR LIGHT]. Mixed colour temperatures, light falling off quickly into dark corners, the face lit from the lamp's side. The phone's night processing: visible fine noise in the dark areas, slightly soft detail, a small halo around the brightest lamp. Do not brighten the darkness evenly, add neon bloom or glowing outlines, or smear the skin with noise reduction.
```

**Klein (short):**

```text
Phone photo at night at home lit only by [A LAMP / A SCREEN], quick falloff into dark corners, fine noise in the shadows. No even brightness, no neon glow.
```

## 12 — Handheld creator realism (UGC)

Changes from the original: the documentary operator becomes the creator themselves (or a friend) holding the phone:
the move comes from walking, the arm and the breath, with the phone's stabilisation taking off the worst of it.

**Still (Codex, with a reference):**

```text
A handheld phone shot of [SUBJECT] [ACTION], caught in the middle of it: the framing slightly tilted and off-centre, a hand or the phone arm partly in frame, a little motion blur on the moving hand only. Do not frame it like a composed photograph or a tripod shot.
```

**Klein (short):**

```text
Handheld phone shot of [SUBJECT] [ACTION], slightly tilted off-centre framing, a little motion blur on the moving hand.
```

**Video (H3):**

```text
<Picture 1> is [SUBJECT]: this exact face, hair and build. THE SCENE: [SUBJECT] [ACTION], filmed by [THEMSELVES AT ARM'S LENGTH / A FRIEND HOLDING THE PHONE]. The phone moves the way a hand does: small sways with the steps and the breath, natural reframing when [SUBJECT] moves, smoothed a little by the phone's stabilisation. Focus finds the face again after a quick movement. Motion blur only on fast hand movements. Stable enough to read the action; no robotic motion, no random shaking, no smooth gimbal glide, no impossible tracking.
```

## 13 — One simple phone movement (UGC)

Changes from the original: a phone has no dolly or crew; its moves are the arm bringing the phone closer, a slow turn
from the face to the product, or the phone lowered toward a table. One move per clip.

**Still (Codex, with a reference):**

```text
A phone shot of [SUBJECT] at the start of a simple move: [THE PHONE BROUGHT CLOSER TO THE FACE / THE CAMERA TURNING FROM THE FACE TO THE PRODUCT / THE PHONE LOWERED TOWARD THE TABLE]. Framing slightly imperfect, as a moving hand frames. Do not frame it as a crane, drone or gimbal shot.
```

**Klein (short):**

```text
Phone shot of [SUBJECT] as the hand starts to [BRING THE PHONE CLOSER / TURN TO THE PRODUCT], slightly imperfect framing.
```

**Video (H3):**

```text
One simple hand-held phone move over the take: [THE ARM BRINGS THE PHONE SLOWLY CLOSER TO THE FACE / THE PHONE TURNS FROM THE FACE DOWN TO THE PRODUCT IN THE HAND / THE PHONE LOWERS TOWARD THE PRODUCT ON THE TABLE]. It starts and stops the way a hand does, with a small overshoot and settle. [SUBJECT]'s proportions, the room's lines and the parallax between near and far objects stay consistent. No morphing, no background wobble, no sudden zoom, no floating camera glide.
```

## 14 — Realistic reflections and shadows (UGC)

Changes from the original: the giveaways at home are the bathroom mirror, the phone's own reflection, glossy packaging,
glasses and a dark screen; each must agree with the room's window and lamps.

**Still (Codex, with a reference):**

```text
Every reflection, shadow and highlight agrees with the room's real light sources and the phone's position. A mirror shows the room behind and the person's back correctly, and, if it is in view, the phone held in the hand; glass jars and glossy packaging carry small window-shaped highlights and faint reflections of the room; metal caps have sharp highlights; skin has soft, uneven shine. Shadows on the shelf and wall fall away from the window. Do not duplicate reflections, change shadow direction, float objects above surfaces or add shine that has no source.
```

**Klein (short):**

```text
Reflections and shadows consistent with the window: a small window highlight on the glossy product, a faint room reflection, shadows falling away from the light. No floating objects.
```

## 15 — Final realism pass for an existing UGC clip (UGC)

Changes from the original: the target is "filmed on a phone": the subtle film grain and cinematic colour of the
original become phone noise and neutral phone colour; frame rate and grade stay in post (B43 steps 8 and 10).

**Still (Codex, a frame of the clip):**

```text
Refine this frame while keeping the subject, identity, framing, pose, room and light exactly as they are. Bring back believable skin pores and fine texture, real fabric and product surfaces, and the slight sensor noise and neutral colour of a phone camera. Remove waxy smoothing, halos, over-sharpened edges and any glow without a source. Do not invent new details, text or objects, and do not change the scene.
```

**Klein (short):**

```text
The same frame, unchanged in content, with real skin texture, phone sensor noise and neutral phone colour. No smoothing, no halos, nothing new added.
```

**Video (H3 or any video-to-video pass):**

```text
Refine this existing clip while keeping the subject, identity, framing, action, speech and timing exactly as they are. Make it look filmed on a phone: real skin pores and fine texture, real fabric and product surfaces, details that hold still from frame to frame, the phone's slight sensor noise, natural motion blur only on fast movement, neutral phone colour. Remove waxy smoothing, halos, over-sharpening, flicker, warping and artificial glow. Do not invent new details or alter the scene.
```

## UGC negative list

For a generator with a negative field (Seedream if it has one; H3 only above `--cfg 1.0`). Everywhere else, these are
the "do not …" sentences already written into the forms above.

```text
plastic skin, waxy skin, airbrushed face, beauty filter, skin smoothing, perfect even skin tone, studio lighting, ring light reflection in the eyes, softbox catchlights, rim light, cinematic shallow depth of field, bokeh balls, portrait-mode cutout halo, anamorphic lens flare, film grain overlay, teal-orange grade, warm vintage filter, oversaturated colors, overprocessed HDR, haloing, oversharpening, perfectly centred symmetrical framing, tripod-still composition, smooth gimbal glide, dolly move, drone shot, glossy advertisement look, staged spotless set, floating product, warped or changing label text, captions, text overlay, watermark, warped hands, extra fingers, changing facial identity, flickering details, temporal inconsistency, rubbery motion, lip movement out of sync with speech, impossible reflections, inconsistent shadows, chunky digital noise, compression artifacts
```

For a still, drop the time terms (smooth gimbal glide, dolly move, drone shot, flickering details, temporal
inconsistency, rubbery motion, lip movement out of sync with speech).

## Worked example — the moisturiser UGC (B43 step 1), ready to paste

The client sells a moisturiser. A real skincare clip from TikTok or Reels gives the look: a woman at her bathroom mirror
in morning window light, cream in hand, a towel hanging, the shelf a little messy, the phone held slightly low. From it
we take the light, the angle, the room and its flaws; never the person, the face or the content.

Written with a woman because the example is a skincare clip. The holding's own cast is men and older women; a younger
woman is used only when the client asks for one.

**Attachments for the still:** Image 1 = a frame of the real skincare clip (look only). Image 2 = our cast character.
Image 3 = the client's cream, photographed.

**Still (Codex image tool):**

```text
Use Image 1 only for its framing, room, light and phone angle: a bathroom in morning window light, a towel hanging, a slightly messy shelf, the phone held a little low. Do not copy the person in Image 1, her face, or any text or logo in it. The woman is the one in Image 2, with exactly that face, hair, skin and build. The cream in her hand is the product in Image 3, with exactly its jar shape, lid, colours and label; do not invent or change any text on it.

A real photo taken by her on her phone's front camera at arm's length, the phone slightly below her chin and tilted up a little, framing a touch off-centre with the top of her hair cut by the edge. She stands at the bathroom sink in the morning, just washed, hair pulled back loosely with a few strands escaping, wearing a soft worn cotton T-shirt with a slightly stretched collar. She holds the open jar up beside her cheek in her free hand, a little cream on two fingertips, mid-sentence, looking into the lens with a relaxed half-smile.

Morning daylight from a frosted window on her left, slightly cool, mixing with the warmer mirror light above; the window side of her face brighter, a soft shadow under her chin. Real skin: visible pores on her nose and cheeks, fine vellus hair along her jaw catching the window light, a little natural redness around the nose, a tiny blemish, slight shine on the forehead from the wash; no make-up. The jar's glossy lid shows a small window-shaped highlight; her fingertips press the jar naturally. Behind her: white tiles, a towel hanging a little crooked, a shelf with a toothbrush cup and two half-used bottles, the mirror edge in frame.

The phone's look: deep focus with the background only slightly soft, mild wide-angle perspective, auto exposure with the window a little blown out, fine sensor noise in the shadows, neutral slightly cool colour. Do not smooth, retouch or beauty-filter her skin, do not add studio or ring lights, a blurred portrait-mode background or a warm filter, do not make it look like an advertisement, and add no text, captions or watermark.
```

**Klein (FLUX.2-klein-4B, with Image 2 and Image 3 as references):**

```text
Front-camera phone selfie at arm's length of the woman from the reference at her bathroom sink in cool morning window light, holding the open cream jar from the product reference beside her cheek. Real unretouched skin with pores, fine facial hair and slight shine, hair loosely pulled back, worn cotton T-shirt, white tiles and a slightly messy shelf behind. Slight phone noise, deep focus, off-centre framing.
```

**Video (MiniMax H3 Ref2VA, 640×1152, 24 fps; about 10 seconds):** `<Picture 1>` = the still made above, `<Picture 2>`
= the photographed cream (Image 3). The line is the writer seat's (B43 step 2: no "not X, it's Y", no choppy triplets,
fillers allowed). "I use it" is said in the first person only when the use is real and recorded with the job (B43,
"Testimony").

```text
<Picture 1> is the woman and the place: this exact face, hair, skin and T-shirt, this bathroom with its frosted window, white tiles, crooked towel and messy shelf. <Picture 2> is the moisturiser: exactly this jar, lid, colours and label.

THE SCENE: early morning, just after washing her face, she films herself on her phone's front camera, holding the phone at arm's length a little below her chin. She looks into the lens and talks in a relaxed, slightly husky morning voice: "[THE WRITER SEAT'S LINE]". While she talks she lifts the open jar of <Picture 2> toward the lens for a second so the label is seen, lowers it, scoops a little cream with two fingertips of the same hand and smooths it onto her cheek in small circles, then glances down at the screen and back to the lens with a small smile. Natural blinking, breathing in her shoulders, the phone arm moving slightly with her body; the framing drifts a little and she corrects it once.

The light stays as in <Picture 1>: cool morning daylight from the frosted window on her left, the warmer mirror light above, the window side of her face brighter. The cream leaves a faint sheen on her cheek where she rubbed it in; the jar's lid keeps its small window highlight as it turns. Her skin keeps its pores, fine hairs and slight shine in every frame.

Photoreal live-action smartphone video, vertical 9:16, filmed by the person themselves on a modern phone: auto exposure and auto white balance, slight sensor noise in the shadows, the phone's own mild sharpening, small handheld micro-movement, imperfect framing. Real skin with visible pores and fine texture, real fabric, real room. It must read as a real person filming their own day, never as a studio advertisement: no studio lights, no smooth gimbal or dolly movement, no cinematic shallow focus, no beauty filter, no airbrushed skin, no text, no captions, no watermark. The face, hands and product stay exactly the same from the first frame to the last; no warping, no flicker.
```

After the take: B43 steps 5–12 (voice comparison, his eye on the native draft, grade, enlarge, interpolate, loudness,
final check).
