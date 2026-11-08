---
name: preroll15
aliases: [onbessaniye, reklamoncesi]
title_tr: 15 saniyelik pre-roll çekim listesi
title_en: 15-second pre-roll shot list
when_tr: Video öncesi 15 saniyelik reklam; açılış, ihtiyaç, kullanım, kapanış tek üretimde
when_en: The 15-second pre-roll ad; opener, need, use and close in one generation
shelf: platform-video
role: base
medium: video
inputs: [product-photo]
slots: {setting: "a bright home kitchen|a calm home workspace|a tidy bathroom with a frosted window", time: "morning|late afternoon", aspect: "16:9|9:16", market: "*"}
composes_with: [freezezoom, lightleak, matchcut, speedramp, whipcut]
conflicts: []
cast: house
forms: {h3: ok, h3-from-still: ok, codex-image: unavailable, seedance: unavailable}
status: candidate
samples: []
provenance: video-000131, video-000125, house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed, the same in every shot; do not redraw or restyle it. A 15-second ad as four shots in one generation, framed for {aspect}, in {setting} in {market}, in {time} light, with clean cuts between shots. Shot 1, 0 to 3 seconds: a tight, moving close-up of the product already in motion, so the first frame catches the eye. Shot 2, 3 to 7 seconds: a medium shot of the everyday moment the product answers, the adult man or elderly woman from our own cast seen from behind or at the shoulder, face not readable. Shot 3, 7 to 12 seconds: their hands use the product in one clear, honest gesture, a close shot at hand height. Shot 4, 12 to 15 seconds: the product alone on a clean surface in a calm hero view, held still, one plain evenly lit area of the frame left empty for the client's mark laid in post. The same window light from camera-left in every shot, soft and directional; real materials with marks of use; consistent props and geometry across cuts. Full-frame cinema camera: 50 mm for shots 1 to 3, 85 mm at f/5.6 for shot 4; camera at chest or product height; slow operated moves only. Restrained grade, fine grain; no morphing, no flicker, no label drift, no change of cast between shots. Add no text, letters or logos anywhere.

## Notes

- h3: product photo as `<Picture 1>`, a cast photo as `<Picture 2>` when the job has one; 8 steps.
- h3-from-still: shot 4's still as the reference frame; 8 steps.
- If a run cannot hold 15 seconds, split it at the shot 2/3 cut and join in the edit (UNVERIFIED length limit).
