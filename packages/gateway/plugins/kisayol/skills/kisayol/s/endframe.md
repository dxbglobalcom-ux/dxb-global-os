---
name: endframe
aliases: [kapaniskaresi, sonkare]
title_tr: Marka alanlı kapanış karesi
title_en: End frame with space for the mark
when_tr: Her video reklamın son 2-3 saniyesi; ürün durur, gerçek marka için temiz alan kalır
when_en: The last 2-3 seconds of any video ad; the product settles and clean space stays for the real mark
shelf: platform-video
role: base
medium: video
inputs: [product-photo]
slots: {mark_area: "the upper third|the lower third|the left third|the right third", background: "a seamless warm grey paper sweep|a soft grey-to-white gradient|a deep charcoal sweep with a soft pool of light", aspect: "16:9|9:16|1:1|4:5"}
composes_with: []
conflicts: []
cast: none
forms: {h3: ok, h3-from-still: ok, codex-image: unavailable, seedance: unavailable}
status: candidate
samples: []
provenance: video-001049, house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed, the same in every frame; do not redraw or restyle it. A three-second closing shot framed for {aspect} on {background}. 0 to 1 second: a slow, decelerating push-in finishes on a calm hero view of the product, its label toward the lens. 1 to 3 seconds: everything holds perfectly still, a true locked frame. {mark_area} of the frame is kept plain, evenly lit and free of any object, edge, shadow or reflection, so the client's real mark and line can be laid there in post. Lighting: a large softbox high on the side away from the empty area, a white bounce opposite, a thin rim from behind; the empty area falls off smoothly with no hot spot or gradient band. A soft contact shadow and faint reflection ground the product. Medium-format camera, 100 mm lens at f/8, camera at product height, level horizon. Restrained grade, accurate colour, fine grain; no morphing, no flicker, no drift in the still part. No people. Add no text, letters or logos anywhere.

## Notes

- h3: product photo as `<Picture 1>`; three seconds; 8 steps. The held part must not drift; check frame 1 against the last.
- h3-from-still: a showcase still with the same empty area as start frame; 8 steps.
