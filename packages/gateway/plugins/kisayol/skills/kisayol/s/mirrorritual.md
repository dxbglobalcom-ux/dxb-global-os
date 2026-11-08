---
name: mirrorritual
aliases: [aynaritueli, banyorituel]
title_tr: Ayna başında bakım ritüeli
title_en: Bathroom-mirror ritual
when_tr: Cilt bakımı, tıraş, saç bakımı; ürünün sabah ya da akşam ritüelinde gerçek kullanımı, ev kadrosuyla
when_en: Skincare, shaving or hair care; the product in a real morning or evening ritual, with the house cast
shelf: cosmetics
role: base
medium: image
inputs: [product-photo]
slots: {time: "morning daylight|evening warm lamp light", aspect: "4:5|9:16", market: "*"}
composes_with: [gradeclean, gradecool, gradefilm, windowlight]
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-01728
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. A real home bathroom in {market} in {time}, framed for {aspect}: a stone basin, a slightly fogged mirror with a clear patch wiped by a palm, a folded towel, two or three everyday bottles out of focus. The person is from our own cast, an adult man or an elderly woman, fully and modestly dressed, seen from behind the shoulder: one hand holds the product near the basin, the other applies it to the back of the opposite hand or the cheek. The face is not readable: the mirror shows only a soft, out-of-focus shape behind condensation. Real skin with pores, fine lines and veins on the hands, a few water drops on the wrist. Motivated light from a window or a lamp on the left, the mirror bouncing a soft fill. Full-frame camera, 35 mm lens at f/2.8, chest height, a little behind the shoulder, the product and the hands sharp. Calm, restrained grade, fine grain; no beauty retouching, no airbrushed skin, no warped fingers. Add no text, letters or logos anywhere.

## Notes

- A woman presenter other than an elderly woman only when the job records the client's request (cast: client-request then).
- codex-image: attach the product photo and say "use the attached product exactly".
